## Repository rules

- Keep the playground a consumer of public package exports; put shared behavior in `packages/ui`.
- Update `docs/component-map.md` when adding, renaming or substantially changing shared components, blocks or hooks.

## Publishing

- Publishing runs only through `publish.yml` (manual, existing `v<version>` tag; see README).

<!-- BEGIN NEXTIDE-META:GOVERNANCE -->
## Delivery

- Branch from `main` and target it; do not build on unmerged branches.
- Never push directly to `main` unless the user explicitly asks.
- Update branches only to resolve conflicts; do not rebase or repeat reviews just because `main` moved.
- Use Conventional Commits.
- Do not merge with failing or missing required checks.
- Edit application secrets through Nextide's Infisical-backed secret service using the [secrets policy](https://github.com/nextidemedia/meta/blob/main/docs/development-baseline.md#application-secrets).
- Use the `grafana` MCP, datasource `loki`, for read-only production logs bounded by service and UTC window.
- Deploying to dev needs no approval.
- A merge the caller explicitly allowed counts as approval to deploy an internal production service.
- Obtain explicit caller approval before deploying a user-facing production service (Kraken, Daedalus once live).

## Runtime boundaries

- For requests from outside callers, including webhooks, check authentication, authorization, schema and limits; see the [data entry map](https://github.com/nextidemedia/meta/blob/main/docs/architecture/data-entry-map.md).
- For consumed external data (provider responses, media, model output), reject only what downstream code cannot use; leave missing values empty.
- Trust authenticated internal services for what their contracts guarantee, not content they relay; inside one process, trust the types.
- Tolerate unknown fields unless the contract requires strictness.
- Add a check or limit only when you can name what breaks without it and a realistic trigger; remove checks on a changed path that protect nothing.
- Do not remove authentication, authorization, idempotency, data-integrity constraints, output encoding or other security boundaries as redundant.

## Testing and validation

- Prove acceptance outcomes in the owning native TesterArmy E2E journey using the installed skill and [recording/replay runbook](https://github.com/nextidemedia/meta/blob/main/docs/e2e-recording-and-replay.md).
- Consolidate meaningful regressions into the owning journey when changing a suite; remove implementation-shape checks and duplicates.
- Do not add ordinary unit tests; keep integration tests only for unique, important boundary guarantees the journey cannot reasonably prove.
- Preserve safety, security, data-integrity and static/build checks; replace obsolete gates explicitly.
- Use tools-only E2E targets for API/service boundaries; do not wrap legacy suites.
- Keep routine replay free of model and live-provider calls, including cache misses; qualify models/providers separately.
- Run larger validation remotely, or on a machine with spare CPU and memory if CI cannot run it; do not run several heavy suites concurrently on one shared machine.
- Report the revision, commands, results, execution location and useful failure evidence.
- Qualify release candidates against all changes since the target's last successful release, including affected consumers, packaging, configuration and migrations; verify deployed artifacts, prerequisites and health.
- Include small cleanup that simplifies the path you change; flag broader cleanup to the orchestrator instead of doing it.
<!-- END NEXTIDE-META:GOVERNANCE -->
