#!/usr/bin/env python3
"""Upload immutable Actions artifacts, or download an already qualified release."""
import argparse
import glob
import gzip
import hashlib
import http.client
import io
import json
import os
from pathlib import Path
from pathlib import PurePosixPath
import re
import shutil
import sys
import tarfile
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import zlib

MAX_SIZE = 64 * 1024 * 1024
AUDIENCE = 'nextide-ci-artifacts'
BUCKETS = {'ci-release': 'ci-releases', 'linux-source-evidence': 'ci-evidence'}
MAX_ARCHIVE = 16 * MAX_SIZE
MAX_EXPANDED = 4 * MAX_ARCHIVE
MAX_MANIFEST = 16 * 1024
RETENTIONS = (1, 3, 7, 14, 90, 180)
NAME = r'[A-Za-z0-9][A-Za-z0-9_.-]{0,127}'
REFERENCE = re.compile(r'/ci-artifacts/(1|3|7|14|90|180)/([0-9]+)/([0-9]+)/([0-9]+)/(' + NAME + r')/manifest\.json')
NETWORK_ERRORS = (OSError, http.client.HTTPException)


def identity():
    url = os.environ['ACTIONS_ID_TOKEN_REQUEST_URL']
    url += ('&' if '?' in url else '?') + urllib.parse.urlencode({'audience': AUDIENCE})
    request = urllib.request.Request(url, headers={
        'Authorization': 'Bearer ' + os.environ['ACTIONS_ID_TOKEN_REQUEST_TOKEN']})
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)['value']


def request(path, method='GET', body=None, headers=None):
    endpoint = os.environ.get('CI_ARTIFACT_ENDPOINT', 'https://artifacts-ci.nextide.io').rstrip('/')
    token = identity()
    for attempt in range(5):
        try:
            return urllib.request.urlopen(urllib.request.Request(endpoint + path, method=method, data=body,
                headers={'Authorization': 'Bearer ' + token, **(headers or {})}), timeout=300)
        except urllib.error.HTTPError as error:
            code = error.code
            error.close()
            if code in (429, 503) and attempt < 4:
                time.sleep(2 ** attempt)
                continue
            if code == 412:
                raise RuntimeError('Artifact already exists; rerun the workflow for a new attempt') from None
            if code == 404 and method == 'GET':
                raise RuntimeError('No owned release artifact exists for this Source run and attempt; historical GitHub-only artifacts were not imported') from None
            if code in (500, 503, 507):
                raise RuntimeError('Artifact storage is full or unavailable; retained artifacts were not evicted') from None
            raise RuntimeError(f'Artifact storage refused the request (HTTP {code})') from None


def object_path(name, repository_id, run_id, attempt):
    if any(not re.fullmatch('[0-9]+', value) for value in (repository_id, run_id, attempt)):
        raise ValueError('Repository, run and attempt must be numeric')
    return f'/{BUCKETS[name]}/{repository_id}/{run_id}/{attempt}/{name}.tar.gz'


def upload(name, patterns):
    paths = sorted({Path(path).absolute() for pattern in patterns.splitlines()
                    for path in glob.glob(pattern.strip(), recursive=True) if pattern.strip()})
    if not paths:
        raise ValueError('No artifact files matched')
    # One directory retains its contents at the archive root, matching upload-artifact.
    root = paths[0] if len(paths) == 1 and paths[0].is_dir() else Path(os.path.commonpath([str(path.parent) for path in paths]))
    path = object_path(name, os.environ['GITHUB_REPOSITORY_ID'], os.environ['GITHUB_RUN_ID'], os.environ['GITHUB_RUN_ATTEMPT'])
    with tempfile.TemporaryDirectory(prefix='artifact-', dir=os.environ['RUNNER_TEMP']) as scratch:
        archive = Path(scratch) / 'artifact.tar.gz'
        with tarfile.open(archive, 'w:gz') as bundle:
            for item in paths:
                if item == root:
                    for child in sorted(item.iterdir()):
                        bundle.add(child, arcname=child.name)
                else:
                    bundle.add(item, arcname=item.relative_to(root).as_posix())
        # shortcut: 64MiB compressed pilot artifacts; upgrade when larger artifacts are required.
        if archive.stat().st_size > MAX_SIZE:
            raise ValueError('Artifact exceeds the 64 MiB compressed pilot limit; no upload was started')
        with request(path, 'PUT', archive.read_bytes(), {'If-None-Match': '*', 'Content-Type': 'application/gzip'}) as response:
            response.read()
    print(f'Uploaded {name}')
    if os.environ.get('GITHUB_STEP_SUMMARY') and os.environ.get('CI_ARTIFACT_DOWNLOAD_URL'):
        with open(os.environ['GITHUB_STEP_SUMMARY'], 'a', encoding='utf-8') as summary:
            summary.write(f'[{name}]({os.environ["CI_ARTIFACT_DOWNLOAD_URL"].rstrip("/")}{path})\n\n')


def download(run_id, attempt, directory):
    path = object_path('ci-release', '1392408582', run_id, attempt)
    target = Path(directory)
    target.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='release-', dir=os.environ['RUNNER_TEMP']) as scratch:
        archive = Path(scratch) / 'release.tar.gz'
        with request(path) as response, archive.open('wb') as stream:
            shutil.copyfileobj(response, stream)
        with tarfile.open(archive) as bundle:
            members = bundle.getmembers()
            if sorted(item.name for item in members) != ['manifest.json', 'release.tar'] or any(not item.isfile() for item in members):
                raise ValueError('Release artifact must contain only manifest.json and release.tar')
            bundle.extractall(target, members=members, filter='data')


def open_object(path, method='GET', body=None):
    endpoint = os.environ.get('CI_ARTIFACT_ENDPOINT', 'https://artifacts-ci.nextide.io').rstrip('/')
    return urllib.request.urlopen(urllib.request.Request(endpoint + path, method=method, data=body,
        headers={'Authorization': 'Bearer ' + identity(), **({'If-None-Match': '*',
            'Content-Type': 'application/octet-stream'} if method == 'PUT' else {})}), timeout=300)


def fetch(path, stream, limit):
    """Restart a partial GET, never append an uncertain response."""
    for attempt in range(5):
        try:
            stream.seek(0)
            stream.truncate()
            digest, size = hashlib.sha256(), 0
            with open_object(path) as response:
                expected = response.headers.get('Content-Length')
                while block := response.read(min(1024 * 1024, limit - size + 1)):
                    size += len(block)
                    if size > limit:
                        raise ValueError('Artifact object exceeds its declared size limit')
                    digest.update(block)
                    stream.write(block)
                if expected is not None and size != int(expected):
                    raise http.client.IncompleteRead(b'', int(expected) - size)
            return size, digest.hexdigest()
        except urllib.error.HTTPError as error:
            error.close()
            if error.code not in (401, 429, 500, 502, 503, 504) or attempt == 4:
                raise RuntimeError(f'Artifact read failed (HTTP {error.code})') from None
        except NETWORK_ERRORS:
            if attempt == 4:
                raise RuntimeError('Artifact read failed after bounded network retries') from None
        time.sleep(2 ** attempt)


def mutate(path, method, body=None):
    """Resolve uncertain immutable PUTs by comparing the existing bytes."""
    for attempt in range(5):
        uncertain = False
        try:
            with open_object(path, method, body) as response:
                response.read()
            return
        except urllib.error.HTTPError as error:
            error.close()
            if method == 'DELETE' and error.code == 404:
                return
            uncertain = method == 'PUT' and error.code == 412
            if not uncertain and error.code not in (401, 429, 500, 502, 503, 504):
                raise RuntimeError(f'Artifact {method} failed (HTTP {error.code})') from None
        except NETWORK_ERRORS:
            uncertain = method == 'PUT'
        if uncertain:
            with tempfile.TemporaryFile() as existing:
                try:
                    size, digest = fetch(path, existing, len(body))
                except RuntimeError as error:
                    if 'HTTP 404' not in str(error):
                        raise
                else:
                    if size == len(body) and digest == hashlib.sha256(body).hexdigest():
                        return
                    raise ValueError('Artifact already exists with different bytes')
        if attempt == 4:
            raise RuntimeError(f'Artifact {method} failed after bounded network retries')
        time.sleep(2 ** attempt)


def coordinates(reference):
    match = REFERENCE.fullmatch(reference)
    if not match:
        raise ValueError('Artifact ID must be an exact owned manifest path')
    return match.groups()


def references(value):
    result = [line.strip() for line in value.splitlines() if line.strip()]
    if not result or len(result) != len(set(result)):
        raise ValueError('Provide distinct exact artifact IDs')
    for reference in result:
        coordinates(reference)
    return result


def manifest(reference):
    coordinates(reference)
    stream = io.BytesIO()
    fetch(reference, stream, MAX_MANIFEST)
    value = json.loads(stream.getvalue())
    valid_digest = lambda digest: isinstance(digest, str) and re.fullmatch('[a-f0-9]{64}', digest)
    if not isinstance(value, dict) or type(value.get('version')) is not int or value['version'] != 1:
        raise ValueError('Unsupported artifact manifest')
    parts = value.get('parts')
    if (type(value.get('size')) is not int or not 0 < value['size'] <= MAX_ARCHIVE
            or not valid_digest(value.get('sha256')) or not isinstance(parts, list) or not 1 <= len(parts) <= 16):
        raise ValueError('Invalid artifact manifest')
    for part in parts:
        if (not isinstance(part, dict) or type(part.get('size')) is not int
                or not 0 < part['size'] <= MAX_SIZE or not valid_digest(part.get('sha256'))):
            raise ValueError('Invalid artifact part')
    if sum(part['size'] for part in parts) != value['size']:
        raise ValueError('Artifact manifest size does not match its parts')
    return value


def part_path(reference, value, index):
    return reference.removesuffix('manifest.json') + value['sha256'] + f'/{index}.tar.gz'


def pack(archive, patterns, include_hidden):
    includes, excludes, search_roots = [], set(), set()
    for line in patterns.splitlines():
        line = line.strip()
        if not line:
            continue
        excluded = line.startswith('!')
        pattern = line[1:] if excluded else line
        matched = [Path(item).absolute() for item in glob.glob(pattern, recursive=True, include_hidden=include_hidden)]
        if excluded:
            excludes.update(matched)
        else:
            includes.extend(matched)
            search_root = Path(pattern).absolute()
            while glob.has_magic(str(search_root)):
                search_root = search_root.parent
            search_roots.add(search_root)
    includes = sorted(set(includes))
    if not includes:
        return False
    # Missing optional inputs must not change the archive's directory layout.
    search_roots = [item for item in search_roots if not any(parent in search_roots for parent in item.parents)]
    root = Path(os.path.commonpath(search_roots))
    if len(search_roots) == 1 and root.is_file():
        root = root.parent
    added, total = set(), 0
    with archive.open('wb') as raw:
        # Deterministic gzip/tar metadata makes identical retries compare equal.
        with gzip.GzipFile(filename='', mode='wb', fileobj=raw, mtime=0) as compressed, tarfile.open(fileobj=compressed, mode='w|', dereference=True) as bundle:
            def add(item):
                nonlocal total
                if item in added or any(item == excluded or excluded in item.parents for excluded in excludes):
                    return
                if not include_hidden and any(part.startswith('.') for part in (root.name, *item.relative_to(root).parts)):
                    return
                if item.is_symlink() or not (item.is_file() or item.is_dir()):
                    raise ValueError('Artifact inputs must be regular files or directories')
                if item.is_dir():
                    for child in sorted(item.iterdir()):
                        add(child)
                    return
                added.add(item)
                total += item.stat().st_size
                if total > MAX_EXPANDED:
                    raise ValueError('Artifact exceeds the 4 GiB expanded file limit')
                info = bundle.gettarinfo(str(item), arcname=item.relative_to(root).as_posix())
                info.uid = info.gid = info.mtime = 0
                info.uname = info.gname = ''
                with item.open('rb') as content:
                    bundle.addfile(info, content)
                if raw.tell() > MAX_ARCHIVE:
                    raise ValueError('Artifact exceeds the 1 GiB compressed limit')
            for item in includes:
                add(item)
    if archive.stat().st_size > MAX_ARCHIVE:
        raise ValueError('Artifact exceeds the 1 GiB compressed limit')
    return bool(added)


def outputs(values):
    if output := os.environ.get('GITHUB_OUTPUT'):
        with open(output, 'a', encoding='utf-8') as stream:
            for name, value in values.items():
                stream.write(f'{name}={value}\n')


def upload_artifact(name, patterns, retention=7, include_hidden=False, missing='warn'):
    if not re.fullmatch(NAME, name) or retention not in RETENTIONS:
        raise ValueError('Invalid artifact name or retention period')
    repository, run, attempt = (os.environ[key] for key in ('GITHUB_REPOSITORY_ID', 'GITHUB_RUN_ID', 'GITHUB_RUN_ATTEMPT'))
    reference = f'/ci-artifacts/{retention}/{repository}/{run}/{attempt}/{name}/manifest.json'
    coordinates(reference)
    with tempfile.TemporaryDirectory(prefix='artifact-', dir=os.environ['RUNNER_TEMP']) as scratch:
        archive = Path(scratch) / 'artifact.tar.gz'
        if not pack(archive, patterns, include_hidden):
            if missing == 'error':
                raise ValueError('No artifact files matched')
            if missing == 'warn':
                print('::warning::No artifact files matched')
            return
        with archive.open('rb') as stream:
            digest = hashlib.file_digest(stream, 'sha256').hexdigest()
            stream.seek(0)
            parts = []
            while block := stream.read(MAX_SIZE):
                parts.append({'size': len(block), 'sha256': hashlib.sha256(block).hexdigest()})
        value = {'version': 1, 'size': archive.stat().st_size, 'sha256': digest, 'parts': parts}
        with archive.open('rb') as stream:
            for index in range(len(parts)):
                mutate(part_path(reference, value, index), 'PUT', stream.read(MAX_SIZE))
        mutate(reference, 'PUT', json.dumps(value, separators=(',', ':')).encode())
    outputs({'artifact-id': reference, 'artifact-digest': digest, 'run-id': run, 'run-attempt': attempt})
    human = os.environ.get('CI_ARTIFACT_DOWNLOAD_URL', 'https://artifacts.nextide.io').rstrip('/')
    link = part_path(reference, value, 0) if len(parts) == 1 else reference
    if summary := os.environ.get('GITHUB_STEP_SUMMARY'):
        with open(summary, 'a', encoding='utf-8') as stream:
            stream.write(f'[{name}{" manifest (multipart artifact)" if len(parts) > 1 else ""}]({human}{link})\n\n')
    print(f'Uploaded {name}')


class ArchiveMember(tarfile.TarInfo):
    def _proc_pax(self, tarfile):
        if self.size > 64 * 1024:
            raise ValueError('Artifact archive metadata exceeds 64 KiB')
        return super()._proc_pax(tarfile)

    def _proc_gnulong(self, tarfile):
        if self.size > 64 * 1024:
            raise ValueError('Artifact archive metadata exceeds 64 KiB')
        return super()._proc_gnulong(tarfile)


class ExpandedArchive:
    def __init__(self, stream):
        self.stream, self.size = stream, 0

    def read(self, size):
        block = self.stream.read(size)
        self.size += len(block)
        if self.size > MAX_EXPANDED + 64 * 1024 * 1024:
            raise ValueError('Artifact exceeds the expanded archive limit')
        return block


def extract(archive, target):
    total, count = 0, 0
    with gzip.open(archive, 'rb') as compressed, tarfile.open(fileobj=ExpandedArchive(compressed), mode='r|', tarinfo=ArchiveMember) as bundle:
        for member in bundle:
            count += 1
            path = PurePosixPath(member.name)
            if (count > 100000 or path.is_absolute() or '..' in path.parts or '\\' in member.name
                    or not path.parts or ':' in member.name or member.issparse()
                    or not (member.isfile() or member.isdir())):
                raise ValueError('Unsafe artifact archive member')
            destination = target.joinpath(*path.parts)
            if not destination.resolve().is_relative_to(target.resolve()):
                raise ValueError('Artifact archive escapes its destination')
            if member.isdir():
                destination.mkdir(parents=True, exist_ok=True)
                continue
            total += member.size
            if total > MAX_EXPANDED or destination.exists():
                raise ValueError('Artifact expanded size or duplicate path limit exceeded')
            destination.parent.mkdir(parents=True, exist_ok=True)
            with bundle.extractfile(member) as content, destination.open('xb') as stream:
                shutil.copyfileobj(content, stream, length=1024 * 1024)
            destination.chmod(member.mode & 0o777)


def checked_references(artifact_ids, expected_digest):
    result = references(artifact_ids)
    if expected_digest and (len(result) != 1 or not re.fullmatch('[a-f0-9]{64}', expected_digest)):
        raise ValueError('Expected artifact digest requires exactly one artifact ID and a SHA256')
    return result


def download_artifacts(artifact_ids, directory, expected_digest=''):
    target = Path(directory).absolute()
    with tempfile.TemporaryDirectory(prefix='artifact-', dir=os.environ['RUNNER_TEMP']) as scratch:
        scratch = Path(scratch)
        staging = scratch / 'files'
        staging.mkdir()
        for reference in checked_references(artifact_ids, expected_digest):
            value = manifest(reference)
            if expected_digest and value['sha256'] != expected_digest:
                raise ValueError('Artifact manifest does not match the expected producer digest')
            archive = scratch / 'archive.tar.gz'
            with archive.open('wb') as assembled:
                for index, part in enumerate(value['parts']):
                    with tempfile.TemporaryFile() as stream:
                        actual = fetch(part_path(reference, value, index), stream, part['size'])
                        if actual != (part['size'], part['sha256']):
                            raise ValueError('Artifact part digest or size mismatch')
                        stream.seek(0)
                        shutil.copyfileobj(stream, assembled, length=1024 * 1024)
            with archive.open('rb') as stream:
                if hashlib.file_digest(stream, 'sha256').hexdigest() != value['sha256']:
                    raise ValueError('Artifact archive digest mismatch')
            extract(archive, staging)
        # Check every destination before writing any artifact files there.
        for item in staging.rglob('*'):
            destination = target / item.relative_to(staging)
            if (not destination.resolve().is_relative_to(target.resolve())
                    or destination.is_symlink() or destination.exists() and (item.is_file() or not destination.is_dir())):
                raise ValueError('Artifact destination path already exists or is unsafe')
        target.mkdir(parents=True, exist_ok=True)
        shutil.copytree(staging, target, dirs_exist_ok=True)
    outputs({'download-path': str(target)})
    print('Downloaded owned artifacts')


def delete_artifacts(artifact_ids, expected_digest=''):
    for reference in checked_references(artifact_ids, expected_digest):
        value = manifest(reference)
        if expected_digest and value['sha256'] != expected_digest:
            raise ValueError('Artifact manifest does not match the expected producer digest')
        for index in range(len(value['parts'])):
            mutate(part_path(reference, value, index), 'DELETE')
    print('Deleted owned artifact payloads')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    producer = commands.add_parser('upload')
    producer.add_argument('name', choices=BUCKETS)
    producer.add_argument('paths', help='Newline-separated file patterns')
    consumer = commands.add_parser('download')
    consumer.add_argument('run_id')
    consumer.add_argument('attempt')
    consumer.add_argument('directory')
    producer = commands.add_parser('upload-artifact')
    producer.add_argument('name')
    producer.add_argument('paths')
    producer.add_argument('--retention-days', type=int, choices=RETENTIONS, default=7)
    producer.add_argument('--include-hidden-files', choices=('true', 'false'), default='false')
    producer.add_argument('--if-no-files-found', choices=('error', 'warn', 'ignore'), default='warn')
    consumer = commands.add_parser('download-artifacts')
    consumer.add_argument('artifact_ids')
    consumer.add_argument('directory')
    consumer.add_argument('--artifact-digest', default='')
    cleanup = commands.add_parser('delete-artifacts')
    cleanup.add_argument('artifact_ids')
    cleanup.add_argument('--artifact-digest', default='')
    args = parser.parse_args()
    if args.command == 'upload':
        upload(args.name, args.paths)
    elif args.command == 'download':
        download(args.run_id, args.attempt, args.directory)
    elif args.command == 'upload-artifact':
        upload_artifact(args.name, args.paths, args.retention_days, args.include_hidden_files == 'true', args.if_no_files_found)
    elif args.command == 'download-artifacts':
        download_artifacts(args.artifact_ids, args.directory, args.artifact_digest)
    else:
        delete_artifacts(args.artifact_ids, args.artifact_digest)


if __name__ == '__main__':
    try:
        main()
    except (KeyError, OSError, EOFError, RuntimeError, ValueError, tarfile.TarError, zlib.error) as error:
        print(f'Artifact transfer failed: {error}', file=sys.stderr)
        sys.exit(1)
