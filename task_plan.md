# Task Plan

## Goal

Add a Daedalus-focused playground page that consumes reusable `@nextide/ui` exports mined from `nextide-web`, with all reusable behavior living in `packages/ui` and playground code limited to demo state and sample data.

## Visual Thesis

Dense operational console, black-glass surfaces, Nextide turquoise as the single primary action/state accent, and restrained motion that feels like a production workbench rather than a marketing dashboard.

## Content Plan

- Add package components for filter carousel, trend chart, schedule controls, ledgers, platform clusters, and LiveGuard proof meters.
- Add package blocks for intro plates, dashboard filter bar, export workbench, and LiveGuard cockpit.
- Add a third Daedalus playground view that composes those public exports with sample data.
- Validate typecheck/lint/build and visually review in the browser before asking for human review.

## Interaction Thesis

- Horizontal filter chips should feel fast and contained, with no page scroll leakage.
- Charts and meters should use subtle glow/gradient motion only where it helps scanning.
- Daedalus view switching should reuse the existing right-side view toggle pattern and not create a standalone playground product.

## Status

- [x] React Doctor maintenance note added to `AGENTS.md`.
- [x] Package primitives and blocks implemented.
- [x] Playground Daedalus page wired from package exports.
- [x] Validation passed.
- [x] Browser polish pass complete.

## Daedalus Polish Pass

- [x] Replace native bright dropdown/time surfaces with package-owned dark controls.
- [x] Make horizontal component scrolling contained so wheel gestures do not scroll the page.
- [x] Hide internal scrollbars and add subtle right-edge fades where content continues horizontally.
- [x] Add reusable line graph and donut chart primitives.
- [x] Add dual-calendar and single-calendar date range picker primitives.
- [x] Add inspector hide/reopen behavior without turning the playground into product UI.
- [x] Validate and visually review the Daedalus playground page.

## Chart And Date Picker Polish

- [x] Add multiple reusable bar-chart styling directions for review.
- [x] Show the bar-chart directions in the Daedalus playground.
- [x] Bound date picker scaling so roomy layouts do not create oversized day cells.
- [x] Validate and refresh visual review screenshots.

## Hourly Pacing Graph

- [x] Scout the `nextide-web` per-hour pacing graph behavior.
- [x] Add a reusable Nextide-ified hourly pacing chart primitive.
- [x] Wire the pacing chart into the Daedalus playground from package exports.
- [x] Validate and refresh screenshots.

## Bar Chart Usability Polish

- [x] Remove internal glyph outlines from rail, block, and capsule chart variants.
- [x] Add useful legend/summary affordances to `TrendBarChart`.
- [x] Add a fifth pacing-style bar direction using `HourlyPacingChart`.
- [x] Validate and refresh chart screenshots.

## Intelligence Report UI Mining

- [x] Fix Daedalus filter dropdown sizing/alignment and pacing bar click sizing.
- [x] Mine creator select components, including the full left-to-right transfer motion.
- [x] Mine date creator override rail and add a reusable creator flow/Gantt chart.
- [x] Mine stream selector rows with per-creator filtering and FLIP motion.
- [x] Mine report context chip rows with contained horizontal fade.
- [x] Mine the intelligence progression chart.
- [x] Add an intelligence playground view that consumes package exports.
- [x] Validate with screenshots and project checks.

## Cross-Repo Mining Sweep And CPU Optimization

Goal: scout `nextide-web`, `nextide-saas-vod-kraken`, and `nextide-saas-vod-intelligence-ui` for remaining reusable UI candidates, then fix any package/playground runtime work that causes high CPU when opening the test page.

- [x] Dispatch deep explorers for the three source repos.
- [x] Inspect current playground/package runtime hot paths locally.
- [x] Capture CPU/performance evidence for the current playground.
- [x] Implement targeted runtime fixes in package-owned components.
- [x] Present mined candidates with an opinionated port/leave decision.
- [x] Validate with project checks and a refreshed browser/performance pass.

### Phase 2026-05-15 Sweep And CPU Pass

**Status:** complete

Deep explorers completed their read-only source repo sweeps, performance fixes landed in package-owned components, candidate decisions are recorded, and validation passed.

## Mining Target Pages

Goal: turn the accepted mining shortlist into separated playground pages while keeping reusable implementation in `packages/ui` and leaving `apps/playground` as sample-state wiring only.

Visual thesis: each source-family page should feel like a dense Nextide operations surface, with a clear page-local purpose and no giant mixed grab-bag of unrelated demos.

Content plan:

- `nextide-web` campaign page: schedule matrix, pacing controls, export console, and LiveGuard proof review.
- Kraken operations page: run monitor table, evidence drawer, and incident timeline.
- Intelligence report page: report history rail and document-style report reader.

Interaction thesis:

- Page switching should be explicit and URL-friendly.
- Horizontal/data-heavy sections should retain contained scrolling and fade hints.
- New mined blocks should be reusable package exports, not playground-only components.

Status:

- [x] Add package blocks/components for the new mining candidates.
- [x] Add individual playground pages for the three mining families.
- [x] Wire page switching and initial URL resolution.
- [x] Validate typecheck/lint/build and browser screenshot.

### Phase 2026-05-15 Mining Target Pages

**Status:** complete

The accepted mining candidates are represented as separated package-backed playground pages, screenshots were refreshed for all three new pages, and validation passed.
