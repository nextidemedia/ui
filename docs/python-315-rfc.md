# Python development tools

The LOC checker and advisory dead-code launcher use final Python 3.15.0 with
uv 0.13.0. The package and playground run on JavaScript and TypeScript; the
Python scripts use only the standard library. These checks do not change Node dependencies or the frozen npm lockfile.

## Validation

On Windows, print the selected runtime, then run the existing checks:

```powershell
uv run --offline --no-project --python 3.15 python -c "import sys; print(sys.version); print(sys.executable); assert sys.version_info.releaselevel == 'final'"
uv run --offline --no-project --python 3.15 python scripts/check_loc.py
uv run --offline --no-project --python 3.15 python scripts/deadcode.py
just --dry-run lint
just --dry-run deadcode
```

Final Python 3.15.0 and uv 0.13.0 were verified on 2026-10-10. The LOC check
passed with existing size warnings. Dead-code findings remain advisory; tool
errors still fail. Linux workflow outcomes and the exact candidate revision are
recorded in the pull request. Publication keeps its existing qualification gates.
