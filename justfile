_ps7 := if os() == "windows" { require("pwsh") } else { "" }
set positional-arguments
# Raw argv avoids PowerShell splitting --option=C:/path. With these flags, index 5 is the command; arguments start at 7.
set windows-shell := ["pwsh", "-NoLogo", "-NoProfile", "-CommandWithArgs", "$ErrorActionPreference = 'Stop'; $raw = [Environment]::GetCommandLineArgs(); $command = $raw[5]; $forwarded = @($raw | Select-Object -Skip 7); & ([scriptblock]::Create($command)) @forwarded; exit $LASTEXITCODE"]
_forward_args := if os() == "windows" { "@forwarded" } else { '"$@"' }

setup:
    pnpm install --frozen-lockfile

lint:
    pnpm run lint
    uv run --no-project --python 3.12 python scripts/check_loc.py

fmt:
    pnpm run format

fmt-check:
    pnpm run format:check

typecheck:
    pnpm run typecheck

test *args="scripts/check-packed-consumer.mjs":
    node --test {{_forward_args}}

test-integration *args:
    pnpm run build
    pnpm exec playwright test {{_forward_args}}

check: fmt-check lint typecheck test
