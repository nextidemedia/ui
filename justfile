_ps7 := if os() == "windows" { require("pwsh") } else { "" }
set positional-arguments
# Raw argv avoids PowerShell splitting --option=C:/path. With these flags, index 5 is the command; arguments start at 7.
set windows-shell := ["pwsh", "-NoLogo", "-NoProfile", "-CommandWithArgs", "$ErrorActionPreference = 'Stop'; $raw = [Environment]::GetCommandLineArgs(); $command = $raw[5]; $forwarded = @($raw | Select-Object -Skip 7); & ([scriptblock]::Create($command)) @forwarded; exit $LASTEXITCODE"]
_forward_args := if os() == "windows" { "@forwarded" } else { '"$@"' }

setup:
    npm ci
    python scripts/install_hooks.py

hooks-install:
    python scripts/install_hooks.py

pre-commit:
    python scripts/check_loc.py
    node node_modules/prettier/bin/prettier.cjs --check .
    node node_modules/vite-plus/bin/vp lint --deny-warnings
    npm run security:watchlist
    node node_modules/typescript/bin/tsc --noEmit -p packages/ui/tsconfig.json
    node node_modules/typescript/bin/tsc --noEmit -p apps/playground/tsconfig.app.json
    node node_modules/typescript/bin/tsc --noEmit -p apps/playground/tsconfig.node.json
    node node_modules/typescript/bin/tsc --noEmit -p tsconfig.e2e.json

lint:
    npm run lint
    uv run --no-project --python 3.15 python scripts/check_loc.py

fmt:
    npm run format

fmt-check:
    npm run format:check

typecheck:
    npm run typecheck

test *args:
    npm exec -- e2e run --target package {{_forward_args}}

test-integration *args:
    npm run build
    npm exec -- e2e run {{_forward_args}}

check: fmt-check lint typecheck test

quality: fmt-check lint

# Both local and CI qualification use these same native rule profiles.
lint-correctness:
    npm exec -- vp lint --config .oxlintrc.correctness.json --deny-warnings
    npm run security:watchlist

correctness: lint-correctness typecheck
    npm run qualify

qualify: quality correctness

qualify-deploy: correctness

# Advisory report; findings do not fail the command.
deadcode-setup: setup

deadcode:
    uv run --no-project --python 3.15 python scripts/deadcode.py
