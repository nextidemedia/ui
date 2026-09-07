"""Check nonblank source lines; explicit exceptions live in .loc.json."""

import json
from pathlib import Path

SOURCE = {".py", ".rs", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".ps1", ".sh"}
SKIP = {
    ".git",
    ".venv",
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
        if not entry["reason"].strip() or type(entry["max"]) is not int or entry["max"] < 1:
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
            count = sum(
                bool(line.strip()) for line in path.read_text(encoding="utf-8").splitlines()
            )
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
                print(f"error: {json.dumps(f'{relative}: {count} nonblank lines exceeds {limit}')}")
                errors += 1
            elif count > 400 and not test:
                print(f"warning: {json.dumps(f'{relative}: {count} nonblank lines (target 400)')}")
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
