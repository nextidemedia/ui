_ps7 := if os() == "windows" { require("pwsh") } else { "" }
set positional-arguments
# Raw argv avoids PowerShell splitting --option=C:/path. With these flags, index 5 is the command; arguments start at 7.
set windows-shell := ["pwsh", "-NoLogo", "-NoProfile", "-CommandWithArgs", "$ErrorActionPreference = 'Stop'; $raw = [Environment]::GetCommandLineArgs(); $command = $raw[5]; $forwarded = @($raw | Select-Object -Skip 7); & ([scriptblock]::Create($command)) @forwarded; exit $LASTEXITCODE"]
_forward_args := if os() == "windows" { "@forwarded" } else { '"$@"' }

setup:
    npm ci

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

# Keep the native rule overrides in sync with CI for existing release tags.
lint-correctness:
    npm exec -- oxlint --deny-warnings -A complexity -A max-lines-per-function -A no-unused-vars -A no-unused-labels -A no-unused-private-class-members -A no-extra-boolean-cast -A no-useless-catch -A no-useless-escape -A no-useless-rename -A typescript/no-duplicate-type-constituents -A typescript/no-redundant-type-constituents -A typescript/no-extra-non-null-assertion -A typescript/no-this-alias -A typescript/no-unnecessary-parameter-property-assignment -A typescript/no-useless-default-assignment -A typescript/no-useless-empty-export -A typescript/prefer-as-const -A typescript/prefer-namespace-keyword -A typescript/triple-slash-reference -A unicorn/no-empty-file -A unicorn/no-single-promise-in-promise-methods -A unicorn/no-unnecessary-await -A unicorn/no-useless-fallback-in-spread -A unicorn/no-useless-length-check -A unicorn/no-useless-spread -A unicorn/prefer-set-size -A unicorn/prefer-string-starts-ends-with
    npm exec --workspaces -- eslint --rule no-unused-labels:off --rule no-unused-private-class-members:off --rule no-extra-boolean-cast:off --rule no-useless-catch:off --rule no-useless-escape:off --rule no-empty-static-block:off --rule no-var:off --rule prefer-const:off --rule prefer-rest-params:off --rule prefer-spread:off --rule @typescript-eslint/no-unused-vars:off --rule @typescript-eslint/no-array-constructor:off --rule @typescript-eslint/no-extra-non-null-assertion:off --rule @typescript-eslint/no-namespace:off --rule @typescript-eslint/no-require-imports:off --rule @typescript-eslint/no-this-alias:off --rule @typescript-eslint/no-unnecessary-type-constraint:off --rule @typescript-eslint/prefer-as-const:off --rule @typescript-eslint/prefer-namespace-keyword:off --rule @typescript-eslint/triple-slash-reference:off --rule react-refresh/only-export-components:off
    npm run security:watchlist

correctness: lint-correctness typecheck
    npm run qualify

qualify: quality correctness

qualify-deploy: correctness

# Advisory report; findings do not fail the command.
deadcode-setup: setup

deadcode:
    uv run --no-project --python 3.15 python scripts/deadcode.py
