# Repository Guidance

This repo is the shared `@nextide/ui` package. The playground exists only as a local harness for exercising package exports.

- Put reusable UI, motion, tokens, and behavior in `packages/ui`.
- Keep `apps/playground` as a consumer of `@nextide/ui` public exports.
- Do not treat the playground as a first-class product surface or build bespoke playground-only components when the change belongs in the package.
- Playground code may own demo state, sample data, and layout wiring, but package components should remain the source of truth for shared behavior.
- Preserve the primitive/block separation: primitives belong under `packages/ui/src/components`, composed product patterns belong under `packages/ui/src/blocks`.
- Keep `docs/component-map.md` current when adding, renaming, or substantially changing shared components, blocks, or hooks.
- Follow `docs/responsive-support.md` for layout and responsive work; validate affected behavior at its four required CSS viewport widths.
- Treat `@nextide/ui` as the reusable shadcn-based component pack for Nextide apps: polish shared components here first, and keep app-specific data/copy/state in consuming apps.
- Keep React Doctor healthy from time to time with `npx react-doctor@latest`; treat warnings as cleanup candidates before they pile up.
- Do not assume backwards compatibility. If compatibility expectations are unclear, ask before locking the direction.
- Never write product decisions, implementation details, API routing, fallback mechanics, or other internal plumbing into user-facing or agent-facing text. UI copy, notices, docs, prompts, labels, and tool messages should describe the user goal, required action, or visible state, not how the system is internally wired.

Use `just setup` and `just check` for the shared development baseline; see README.md for focused tests and browser prerequisites. Keep source files within 600 lines, tests within 900 lines, functions within 100 lines, and complexity within 12; do not add legacy debt exceptions.

<!-- BEGIN NEXTIDE-META:GOVERNANCE -->
## Delivery Baseline

- Use short-lived branches from `main`; update them before merging.
- Use Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`,
  `test:`, `chore:`, `ci:`).
- Do not merge with failing or missing required checks.

## Application secrets

- Edit application secrets through Nextide's Infisical-backed secret service.
  Follow the [secrets policy](https://github.com/nextidemedia/meta/blob/main/docs/development-baseline.md#application-secrets)
  and the service's startup, release and recovery procedures.

## Runtime checks

- Add a validation, guard or limit only when both are true: you can name what
  goes wrong without it (what breaks, gets corrupted or is exposed), and you
  can describe a realistic way that situation arises in normal operation.
  "It could theoretically happen" is not a reason.
- Check untrusted input once, where it enters the system. Do not re-check
  values the type system, schema or an upstream caller already guarantees.
- Do not reject or drop data for missing an expected shape or value that
  nothing downstream depends on. For example: A 299.95-second segment in a
  five-minute pipeline is a perfectly usable segment.
- When changing a path, remove checks on it that protect nothing.

## Testing

- Define acceptance outcomes from requirements, known bugs or external contracts
  before implementation. Prove them in the owning E2E journey.
- Do not add ordinary unit tests. When changing a suite, consolidate meaningful
  regressions into the owning E2E journey and remove implementation-shape
  checks and duplicates.
- Keep integration tests only for important, unique boundary guarantees the
  journey cannot reasonably prove. Preserve safety, security, data integrity
  and static/build checks. Replace obsolete gates explicitly.
- Use native TesterArmy E2E; follow its installed skill, the
  [recording/replay runbook](https://github.com/nextidemedia/meta/blob/main/docs/e2e-recording-and-replay.md)
  and the repo's test commands. Use tools-only targets for API/service boundaries;
  do not wrap legacy suites.
- Routine replay must make no model or live-provider calls, including on cache
  misses. Run model/provider qualification separately.
- Use controlled clocks or prepared history without bypassing the behavior
  under test; account for interacting components' clocks. Use real elapsed time
  only when necessary. Wait on observable conditions, not arbitrary sleeps.
- Keep focused suites independently runnable; document commands, prerequisites
  and approximate runtimes.

## Validation

- Use native linters for supported rules and retain only necessary supplemental
  checks. Follow the [development baseline](https://github.com/nextidemedia/meta/blob/main/docs/development-baseline.md)
  for tool ownership, hook setup and qualification.
- Run targeted local checks for changed behavior and reachable effects.
  The tracked `just pre-commit` hook provides fast, check-only feedback using
  prepared tools; CI validates committed code and required checks gate merging.
  Run larger validation remotely; if blocked, use local checks and report the
  reason and remaining gaps. This does not waive required CI gates.
- Broaden checks for shared foundations, dependencies, migrations or uncertain
  impact. Run expensive lifecycle, load or provider checks only when needed
  to prove affected guarantees or on existing schedules.
- One owner verifies combined changes. Reuse passing evidence while its inputs
  and conditions remain valid. Record the revision, reproducible commands,
  results and useful failure evidence in PR notes or logs.
- Qualify the release candidate against all changes since the target's last
  successful release, including affected consumers, packaging, configuration and
  migrations. Verify the deployed artifact, prerequisites and health.

## Adjacent cleanup

- Include small, behavior-preserving cleanup that directly simplifies the
  changed path without materially expanding review or validation.
- Flag worthwhile broader cleanup to the orchestrator with its location and
  a brief reason. Continue assigned work unless correctness is blocked; the
  orchestrator decides whether to include it, dispatch separately, or defer it.
<!-- END NEXTIDE-META:GOVERNANCE -->
