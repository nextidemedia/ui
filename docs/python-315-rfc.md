# RFC: Python 3.15 for development checkers

Status: draft, pending qualification with the final Python 3.15 release.

## Proposal

Select Python 3.15 instead of 3.12 for the LOC checker in `just lint` and the
Quality workflow, and for the advisory launcher in `just deadcode`. The monthly
dead-code workflow inherits the selection through `just deadcode`.

This is a simple tooling upgrade. The package and playground run on TypeScript
and JavaScript; there is no Python product runtime and no product feature payoff
from adopting Python 3.15. Both Python scripts use only the standard library.
Keep their existing implementation and the frozen Node dependency lockfile.
No measured need justifies lazy imports, profiling, JIT, or free-threading work.

## Validation

Prerelease checks use Python 3.15.0rc2 explicitly, rather than treating the
proposed `--python 3.15` selector as final-release qualification:

```powershell
$candidate = 'C:/Code/.tools/python-3.15.0rc2/cpython-3.15.0rc2-windows-x86_64-none/python.exe'
uv run --no-project --python $candidate python scripts/check_loc.py
uv run --no-project --python $candidate python scripts/deadcode.py
node --test scripts/check-qualification.mjs
just --dry-run lint
just --dry-run deadcode
```

Windows checks on 2026-10-01 with uv 0.12.19 and Python 3.15.0rc2:

- Frozen pnpm install passed without dependency or lockfile changes.
- LOC check passed: 169 files, zero errors; existing size warnings remain.
- Dead-code launcher passed: Knip exited zero and wrote its advisory report.
  Existing unused-file/dependency and configuration findings remain advisory.
- Qualification selector and lint-boundary probes passed: 4/4 tests.
- Both just dry runs selected 3.15; changed Markdown/YAML passed Prettier.
- `uv python list 3.15 --all-versions` listed only 3.15.0rc2.

Full TypeScript, packed-consumer, build, and browser suites are deferred for this
draft because their code and dependency inputs do not change. Existing release
gates still apply before package publication.

## Remaining qualification

The [official rc2 release page](https://www.python.org/downloads/release/python-3150rc2/)
identifies rc2 as a preview and schedules final for 2026-10-01. Publication and
availability through uv must be verified rather than inferred from the date.
Once final is available, run the two checker commands with `--python 3.15`
on Windows and run the full Quality and Dead-code report workflows on Linux at
the candidate commit. Confirm uv selected a final 3.15 interpreter and preserve
the checker outcomes and advisory report. Keep this PR draft until that evidence
and the required review/checks are complete.
