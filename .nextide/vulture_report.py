"""Vulture 2.16 report CLI preserving analysis errors alongside findings."""

import sys

from vulture.core import ExitCode, InputError, Vulture, make_config


def main() -> int:
    try:
        config = make_config()
    except InputError as error:
        print(error, file=sys.stderr)
        return ExitCode.InvalidCmdlineArguments
    vulture = Vulture(
        verbose=config["verbose"],
        ignore_names=config["ignore_names"],
        ignore_decorators=config["ignore_decorators"],
    )
    vulture.scavenge(config["paths"], exclude=config["exclude"])
    # Vulture.report overwrites InvalidInput with DeadCode if any findings exist.
    scan_status = vulture.exit_code
    report_status = vulture.report(
        min_confidence=config["min_confidence"],
        sort_by_size=config["sort_by_size"],
        make_whitelist=config["make_whitelist"],
    )
    return scan_status or report_status


if __name__ == "__main__":
    raise SystemExit(main())
