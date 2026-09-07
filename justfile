set positional-arguments

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
    node --test "$@"

test-integration *args:
    pnpm run build
    pnpm exec playwright test "$@"

check: fmt-check lint typecheck test
