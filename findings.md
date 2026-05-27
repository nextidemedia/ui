# Findings

## Source Surfaces

- `nextide-web-wt-beta/pages/views/index.twig` has dashboard filter groups, horizontal carousel items, live/selected badges, KPI cards, and weekly/monthly chart shells. Port interaction shape, not old visual styling or Chart.js coupling.
- `nextide-web-wt-beta/pages/views/campaigns/{camp_id}/runs/index.twig` has Excel export schedule controls, workbook state rows, generate/download actions, and session-report ledger structure. Keep PHP form submission and workbook generation in the app.
- `nextide-web-wt-beta/pages/views/campaigns/{camp_id}/liveguard/index.twig` has LiveGuard metric strip, policy panels, scheduled creator table, incident history, proof dialog, timeline, waveform, and score-vs-threshold meter. Port reusable visual/interaction building blocks; keep fetch/form/test-event logic in the app.
- `nextide-web-wt-beta/pages/views/onboarding/creator/dashboard.twig` and `content/creator/{creator_id}/earnings.twig` show daily earnings bar/trend layouts and top-level overview plates, but the color/vibe needs full Nextide rework.

## Repo Constraints

- `apps/playground` must remain a consumer of public `@nextide/ui` exports.
- New reusable primitives belong under `packages/ui/src/components`.
- Composed product patterns belong under `packages/ui/src/blocks`.
- Do not add playground-only implementations for package-worthy behavior.

## Port Decision

- Ported reusable display and interaction pieces, not old app-specific request/form logic.
- Left source-app concerns such as PHP route wiring, workbook generation, fetch handlers, proof dialogs, and Chart.js integration outside the package.
- Kept the Daedalus playground page as sample state plus layout wiring; package components own the reusable behavior and visual treatment.

## Polish Findings

- Native `select` and `input[type="time"]` popups introduce bright browser UI that breaks the dark Nextide surface treatment; these should become package primitives.
- Campaign filter scrolling and chart scrolling need the same contained wheel behavior as the workflow rail so page scroll does not leak during horizontal gestures.
- Intelligence UI date picking provides a good interaction baseline, but the package should own a Nextide-styled dual-date picker and a same-calendar range picker.
- Session ledger expansion has the desired flip/open feel; expose the motion treatment through package components rather than one-off Daedalus wiring.
- The first bar chart direction reads too much like decorative dashboard capsules; provide alternate package variants that bias toward operational signal, dense histogram, and thin telemetry rails.
- Date picker day cells should be bounded by component intent rather than available width; the roomy single-calendar layout was scaling day cells too large.
- `nextide-web` owns the source pacing behavior in `assets/js/pacing-delivery-chart.js` and `pages/views/campaigns/{camp_id}/pacing/index.twig`.
- The reusable pacing part is the chart shape: 24 hourly buckets, dynamic scale, target/average line, hour labels, and active bucket detail. Campaign save/profile management stays in product code.
- The bar chart concepts need readout context before they are useful in real screens. Peak, average, count, and optional legend items should live in the package primitive, not in one-off playground wrappers.
- The Daedalus campaign dropdown is portaled and currently sizes itself to the small trigger column; for this filter-bar use case the menu should intentionally expand to the full filter bar width so it feels attached to the adjacent slider lane.
- `nextide-saas-vod-intelligence-ui` has reusable report workflow seams in one large `src/App.tsx`: creator transfer FLIP motion, creator/date override filter rail, stream-filter FLIP motion, report context chip lanes, and the processing pipeline map.
- The filter-bar select needs separate trigger, anchor, and width semantics. `SelectMenu` now supports an anchored content rect so compact triggers can open menus sized and positioned against a larger adjacent surface.
- `HourlyPacingChart` selection should be non-geometric: active state can brighten and update metadata, but bar width/height and footer reserve space must remain stable.
- React Doctor is useful as a freshness check, but the current remaining package warnings are not all same-priority fixes. The large `CreatorTransfer` component should eventually be split/reducer-driven, but that should be a deliberate motion-preserving refactor rather than squeezed into this mining pass.

## 2026-05-15 Cross-Repo Mining Sweep

- `nextide-web` still has strong P1 candidates not yet ported: LiveGuard proof review drawer/timeline, campaign schedule matrix with edit popover, pacing range toolbar/chart viewport controls, and a richer reporting/export console v2. P2 candidates are creator assignment search/combobox and performance leaderboard. The campaign pacing status chip is useful but P3-small.
- `nextide-saas-vod-kraken` strongest candidates are operational blocks: run monitor table with inline stage/status cells, explain/decision/cost evidence drawer, and operations sidebar enhancements. Incident timeline explorer, monitor filter bar, and queue/job monitor dialogs are medium-priority.
- `nextide-saas-vod-intelligence-ui` strongest missed candidates are report history rail, report reader primitives, workflow stepper variants, new-report seed/asset suggestion stage, per-entity date scope editor, context bucket editor, and pipeline progress map. The already-ported creator/stream flows should not be duplicated.
- Do not mine whole product pages or backend-bound widgets. Leave behind PHP/API fetches, campaign/VOD persistence, Kraken queue semantics, report export schema builders, destructive app workflows, product branding, and old widget skins where `@nextide/ui` already has cleaner primitives.

## 2026-05-15 Performance Findings

- Headless Chrome/CDP profiling showed the playground was not leaking main-thread idle work after load, but `StatusBadge pulse` used Tailwind's infinite `animate-pulse`, leaving persistent animations alive in report/platform/Daedalus views.
- After changing status pulse to a finite dot flourish, Chrome reported zero running animations after the initial settle window across report, platform, Daedalus, and intelligence views.
- `CreatorTransfer` had a real hot path: panel resize motion used sequential `element.style` writes, and filtered ID arrays were recreated every render while being used as layout-effect dependencies. This was tightened by batching inline style restoration and memoizing visible IDs.
- React Doctor improved from package score 94/100 to 99/100. Remaining warnings are isolated to `CreatorTransfer` being large and still having enough local UI state that a future reducer/split pass is warranted.

## 2026-05-15 Mining Target Pages

- The accepted shortlist now has three separated playground pages instead of one mixed page: `?view=web-mining`, `?view=kraken-mining`, and `?view=report-mining`.
- New reusable package blocks added for the page split: `CampaignScheduleMatrix`, `PacingConfigurator`, `LiveguardIncidentReview`, `RunMonitorTable`, `EvidenceDrawer`, `ReportRail`, and `ReportReader`.
- The `nextide-web` page intentionally covers campaign schedule, pacing, export workbench, and LiveGuard proof review. It still leaves campaign API writes, permissions, and business rules in source products.
- The Kraken page covers run monitor rows, staged status cells, evidence drawer tabs, cost rows, and incident timeline. It leaves queue/Redis/Kraken taxonomy semantics out of the package.
- The intelligence report page covers report history rail and document-style reader sections; workflow mining remains on the existing `?view=intelligence` page.
- Visual review caught and fixed narrow-shell overlap in the Kraken evidence/timeline area and intelligence report evidence cards. The fix was to avoid viewport breakpoint splits inside constrained app-shell columns and prefer stacked/auto-fit layouts.
