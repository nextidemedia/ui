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

- Remove ordinary unit tests; do not add standalone unit tests with each change.
  Preserve genuine known-bug outcomes in the owning journey; relabeling a unit
  test as a regression does not justify keeping it. Delete implementation-shape
  checks and same-guarantee duplicates. Coverage totals are not justification.
- Plan user-visible acceptance outcomes before implementation, then implement
  against the owning E2E suite. Derive expectations from requirements, known-bug
  evidence, or external contracts, not the implementation. Agent-written browser
  tests are not independent merely because they use a browser.
- Retain integration checks only for a concrete, important, unique outcome at an
  actual process, storage, or external boundary that cannot reasonably be proved
  by the owning journey. Preserve safety, security, data-integrity guarantees
  and relevant static/build checks; explicitly replace obsolete test gates as
  part of conversion rather than silently bypassing required checks.
- All E2E uses native TesterArmy: `npx skills add tester-army/e2e`.
  Read the installed skill/references and the repo's verified record/replay
  runbook. Do not wrap an old Playwright or unit suite. Use tools-only targets
  for meaningful API/service boundaries without an artificial browser or model.
  Pin compatible `e2e` and `@e2e-dev/*` versions; only these packages are exempt
  from the seven-day release-age requirement.
- Initially record bounded, meaningful `agent.act` goals with `gpt-6-luna` at low
  reasoning and immediate native locator/engine `expect` checks. Use exact
  mechanical actions where the skill recommends them. Record explicitly in
  read-write mode; review and commit generated cache unchanged. Never edit
  cache JSON or manufacture passing evidence. No larger-model fallback.
- Routine replay is read-only and strict, with retries zero, model transport
  disabled, and live model/external-provider credentials unavailable; disposable
  local test authentication remains available. Missing recordings can still
  call a model under strict mode. Avoid live `agent.assert`, `agent.waitFor`, and
  `agent.extract` in the zero-call gate. Preserve recordings until an intentional
  behavior/goal/engine change or reproducible replay break requires re-recording.
  Run automated checks in the background and browsers headless.
- Test time-dependent production logic with controlled clocks or prepared
  history without bypassing the behavior being proved. Account for other
  components' clocks; use real elapsed time only when the guarantee requires it.
  Wait on observable conditions, not arbitrary sleeps.
- Keep focused suites independently runnable, with discoverable commands,
  prerequisites, and rough runtimes. Keep required model-quality and
  live-provider qualification separate from routine zero-call acceptance.
- Preserve revision, commands, inputs, outcomes, and useful failure evidence.
  For conversions, report logical cases before/after, absolute and percentage
  reduction, classifications, and retained regression guarantees. Separate
  handwritten LOC from vendored/generated cache; report comparable timings with
  caveats and recording/replay calls and tokens, including failures.

## Validation

- Run targeted local checks as needed; run larger validation remotely on the
  working branch. Required checks must pass before merge.
- If remote validation is blocked, proceed with a reasonable local fallback.
  Mention the reason, results and remaining gaps in the final response.
  Required CI/platform gates still apply.
- One owner verifies combined changes and consolidates results. Reuse passing
  evidence while relevant inputs and conditions are unchanged; request only
  missing or invalidated checks.
- Cover changed behavior and reachable effects. Broaden for shared foundations,
  dependencies, migrations or uncertain impact. Run expensive lifecycle, load
  and live-provider checks only when cheaper checks cannot prove affected
  guarantees or on existing schedules.
- Release evidence must be valid for the candidate and cover changes since the
  target's last successful deployment/publication, affected consumers, required
  behavior, packaging, configuration and migration safety. Deployment verifies
  artifact identity, prerequisites and health.
- Use documented, reproducible commands; record revision, commands and results
  in PR notes or logs. Avoid duplicate work; measure queue time, runtime and
  cost when relocating checks.

## Adjacent cleanup

- Include small, behavior-preserving cleanup that directly simplifies the
  changed path without materially expanding review or validation.
- Flag worthwhile broader cleanup to the orchestrator with its location and
  a brief reason. Continue assigned work unless correctness is blocked; the
  orchestrator decides whether to include it, dispatch separately, or defer it.
<!-- END NEXTIDE-META:GOVERNANCE -->
