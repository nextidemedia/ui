"""Run repo-owned advisory checks; preserve reports and fail on tool errors."""

import argparse
import json
import re
import shutil
import subprocess
from pathlib import Path


def run(config: Path) -> int:
    root = config.resolve().parent
    commands = json.loads(config.read_text(encoding="utf-8"))["commands"]
    if not isinstance(commands, list) or not commands:
        raise ValueError("commands must be a nonempty list")
    names = set()
    for command in commands:
        name = command["name"]
        if not isinstance(name, str) or not re.fullmatch(r"[A-Za-z0-9_-]+", name):
            raise ValueError("name must use letters/digits/underscores/hyphens")
        if name in names:
            raise ValueError(f"duplicate command name: {name}")
        names.add(name)
        argv = command["argv"]
        if not isinstance(argv, list) or not argv:
            raise ValueError(f"{name}: argv must be a nonempty string list")
        if not all(isinstance(x, str) for x in argv):
            raise ValueError(f"{name}: argv must be a nonempty string list")
        codes = command.get("success_codes", [0])
        if not isinstance(codes, list) or not codes:
            raise ValueError(f"{name}: success_codes must be a nonempty integer list")
        if not all(type(x) is int for x in codes):
            raise ValueError(f"{name}: success_codes must be a nonempty integer list")
    reports = root / ".artifacts/deadcode"
    reports.mkdir(parents=True, exist_ok=True)
    failed = False
    print(f"checks[{len(commands)}]{{name,status,exit,report}}:")
    for command in commands:
        name = command["name"]
        report = reports / f"{name}.txt"
        argv = command["argv"].copy()
        # Resolve npm.cmd and similar Windows launchers without a shell on Unix.
        argv[0] = shutil.which(argv[0]) or argv[0]
        with report.open("w", encoding="utf-8") as output:
            try:
                result = subprocess.run(
                    argv,
                    cwd=root / command.get("cwd", "."),
                    stdout=output,
                    stderr=subprocess.STDOUT,
                    check=False,
                )
                code = result.returncode
                ok = code in command.get("success_codes", [0])
            except OSError as error:
                output.write(str(error) + "\n")
                code, ok = -1, False
        failed |= not ok
        status = "reported" if ok else "error"
        print(f"  {name},{status},{code},.artifacts/deadcode/{name}.txt")
    return int(failed)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", type=Path, default=Path(".deadcode.json"))
    args = parser.parse_args()
    try:
        return run(args.config)
    except (OSError, ValueError, KeyError, TypeError) as error:
        print(f"error: {json.dumps(str(error))}")
        print("help: Check .deadcode.json and run just deadcode again.")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
