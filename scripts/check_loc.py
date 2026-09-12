"""Check nonblank source lines; explicit exceptions live in .loc.json."""

import json
from pathlib import Path

SOURCE = {".py", ".rs", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".ps1", ".sh"}
SKIP = {
    ".git",
    ".venv",
    ".tmp",
    ".uv-cache",
    "node_modules",
    "target",
    "dist",
    "build",
    "vendor",
    "generated",
    "__pycache__",
    ".next",
}


def check(root: Path) -> int:
    config = json.loads((root / ".loc.json").read_text(encoding="utf-8"))
    exceptions = config["exceptions"]
    excluded = config["excluded"]
    for name, entry in exceptions.items():
        valid_limit = type(entry["max"]) is int and entry["max"] > 0
        if not entry["reason"].strip() or not valid_limit:
            raise ValueError(f"Invalid LOC exception: {name}")
    for name, reason in excluded.items():
        if not reason.strip():
            raise ValueError(f"Missing exclusion reason: {name}")
    errors = 0
    checked = 0
    seen = set()
    for folder, directories, filenames in root.walk():
        directories[:] = [name for name in directories if name not in SKIP]
        for filename in filenames:
            path = folder / filename
            relative = path.relative_to(root).as_posix()
            if path.suffix not in SOURCE or path.is_symlink() or relative in excluded:
                continue
            seen.add(relative)
            lines = path.read_text(encoding="utf-8").splitlines()
            count = sum(bool(line.strip()) for line in lines)
            test = (
                "tests" in path.relative_to(root).parts
                or "__tests__" in path.relative_to(root).parts
                or filename.startswith("test_")
                or ".test." in filename
                or ".spec." in filename
                or filename.endswith("_test.py")
            )
            limit = exceptions.get(relative, {}).get("max", 900 if test else 600)
            checked += 1
            if count > limit:
                message = f"{relative}: {count} nonblank lines exceeds {limit}"
                print(f"error: {json.dumps(message)}")
                errors += 1
            elif count > 400 and not test:
                message = f"{relative}: {count} nonblank lines (target 400)"
                print(f"warning: {json.dumps(message)}")
    for stale in exceptions.keys() - seen:
        print(f"error: {json.dumps(f'Remove unused LOC exception: {stale}')}")
        errors += 1
    print(f"checked: {checked}\nerrors: {errors}")
    return int(errors > 0)


if __name__ == "__main__":
    try:
        raise SystemExit(check(Path(__file__).resolve().parents[1]))
    except (OSError, ValueError, KeyError, TypeError) as error:
        print(f"error: {json.dumps(str(error))}")
        raise SystemExit(1) from None
