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

## Testing

- Before implementing non-trivial behavior, identify expected outcomes, relevant
  failures, and existing coverage. Derive expectations from requirements and
  contracts, not the implementation.
- Use the smallest test boundary that proves the behavior. Use E2E when the
  complete path matters; cover representative interactions, boundaries, and
  failure or recovery cases rather than only the simplest happy path.
- Add or extend tests only for meaningful coverage gaps, including regressions.
  Prefer the owning suite; remove duplicates only when they protect the same
  guarantee at the same boundary.
- Reject tautologies and tests that only detect implementation changes.
  Behavior-preserving refactors should preserve behavioral expectations.
- Test time-dependent production logic with controlled clocks or prepared
  history without bypassing the behavior being proved. Account for other
  components' clocks; use real elapsed time only when the guarantee requires it.
  Wait on observable conditions, not arbitrary sleeps.
- Keep focused suites independently runnable, with discoverable commands,
  prerequisites, and rough runtimes.
- Run required checks and tests for changed behavior and its reachable effects.
  Keep expensive lifecycle, load, and live-provider checks separate, with clear
  reasons to run them.
- Preserve reproducible E2E evidence using existing tooling: revision, command,
  relevant inputs or seed, and outcome. Capture failure logs or traces, and
  screenshots when visual behavior matters.

## Adjacent cleanup

- Include small, behavior-preserving cleanup that directly simplifies the
  changed path without materially expanding review or validation.
- Flag worthwhile broader cleanup to the orchestrator with its location and
  a brief reason. Continue assigned work unless correctness is blocked; the
  orchestrator decides whether to include it, dispatch separately, or defer it.
<!-- END NEXTIDE-META:GOVERNANCE -->
