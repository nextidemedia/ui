# Progress

## 2026-05-13

- Started Daedalus component migration lane.
- Confirmed current package exports use wildcard subpaths (`./components/*`, `./blocks/*`, `./hooks/*`), so new files are importable without a central barrel.
- Existing playground has report/platform modes and right-side mode toggle; Daedalus should extend that pattern.
- Added package primitives for trend bars, platform clusters, score thresholds, data ledgers, schedule controls, and token lists.
- Added package blocks for dashboard filters, intro plates, Excel export workbench, and LiveGuard cockpit.
- Added a Daedalus playground view that imports only public `@nextide/ui` package exports and can be deep-linked with `?view=daedalus`.
- Validated with `pnpm typecheck`, `pnpm lint`, and `pnpm build`.
- Captured visual review screenshots at `output/playwright/daedalus-desktop.png` and `output/playwright/daedalus-mobile.png`; polished filter clear layout, chart clipping, schedule cadence, and mobile score labels after review.
- Started Daedalus polish pass for dark dropdowns, contained component scrolling, line/donut charts, date pickers, and inspector hide behavior.
- Replaced Daedalus native select/time surfaces with the shared `SelectMenu`, added contained scroll utilities, added line/donut chart primitives, and added dual/single-calendar date range picker primitives.
- Wired inspector hide/reopen state through the playground harness, kept Daedalus demo state in `apps/playground`, and visually checked refreshed desktop/mobile screenshots.
- Revalidated with `pnpm typecheck`, `pnpm lint`, `pnpm build`, and `pnpm security:deps`.
- Fixed dropdown stacking by portaling `SelectMenu` content to `document.body`, and removed the campaign carousel clear-button divider.
- Started chart/date polish pass: added `rail`, `block`, `signal`, and `capsule` bar chart variants and bounded calendar day sizing.
- Finished chart/date polish pass: the Daedalus playground now shows four reusable bar-chart directions, date picker sizing is bounded across roomy and narrow layouts, and refreshed screenshots are at `output/playwright/daedalus-chart-date-polish.png` and `output/playwright/daedalus-chart-date-polish-mobile.png`.
- Revalidated the final state with `pnpm typecheck`, `pnpm lint`, `pnpm build`, and `pnpm security:deps`.
- Started hourly pacing graph pass after scouting `nextide-web` pacing source. Scope is a reusable chart primitive only; campaign save/profile management stays out of the package.
- Added `HourlyPacingChart` as a reusable package primitive and wired it into the Daedalus playground trend section with 24 hourly buckets, a 100% target line, active bucket focus/click readout, and contained horizontal scrolling.
- Refreshed screenshots at `output/playwright/daedalus-hourly-pacing.png` and `output/playwright/daedalus-hourly-pacing-mobile.png`.
- Revalidated hourly pacing changes with `pnpm typecheck`, `pnpm lint`, `pnpm build`, and `pnpm security:deps`.
- Started bar chart usability polish: remove decorative internal outlines, add package-level readouts, and compare the pacing chart bar grammar as a fifth option.
- Finished bar chart usability polish: rail/block/capsule glyph outlines are removed, `TrendBarChart` now has reusable peak/average/bucket readouts, and the Daedalus playground compares those four concepts against the `HourlyPacingChart` pacing bars as a fifth option.
- Refreshed screenshots at `output/playwright/daedalus-bar-chart-usability.png` and `output/playwright/daedalus-bar-chart-usability-mobile.png`.
- Revalidated with `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm security:deps`, and `git diff --check`.
- Started intelligence report UI mining pass. First scoped fixes are Daedalus dropdown anchoring and pacing bar fixed sizing; package candidates are creator transfer, creator scope rail, creator flow/Gantt chart, stream selector, report context builder, and progression chart.
- Fixed Daedalus dropdown positioning by allowing `SelectMenu` content to anchor to a separate slider element while keeping the trigger on the left. The campaign dropdown now opens under the slider lane, matches its width, and uses stronger option text.
- Stabilized `HourlyPacingChart` active selection so clicking a bar changes brightness/detail only and does not change chart dimensions.
- Added intelligence report package surfaces: `CreatorTransfer`, `CreatorScopePanel`, `CreatorFlowChart`, `StreamSelector`, `ReportContextBuilder`, and `IntelligenceProgressionChart`.
- Added the `?view=intelligence` playground page as a consumer of public package exports for creator select, date/creator override, creator flow/Gantt, stream select, report context, and generation progression.
- Refreshed screenshots at `output/playwright/daedalus-dropdown-pacing-fix.png`, `output/playwright/intelligence-report-ui.png`, and `output/playwright/intelligence-report-ui-mobile.png`.
- Revalidated with `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm security:deps`, `git diff --check`, and `npx react-doctor@latest`. React Doctor is clean for `apps/playground` and scores 94/100 for `packages/ui`; remaining package notes are architectural/performance cleanup candidates around the large transfer component and low-risk style guidance.

## 2026-05-15

- Started cross-repo mining sweep and CPU optimization lane.
- Added a fresh task section so the previous Daedalus/Intelligence lane remains closed and this pass has its own checklist.
- Received scout results for `nextide-web`, `nextide-saas-vod-kraken`, and `nextide-saas-vod-intelligence-ui`; recorded the candidate shortlist and leave-behind boundaries in `findings.md`.
- Profiled report/platform/Daedalus/intelligence playground views with headless Chrome/CDP. Baseline idle main-thread deltas were low, but report/platform/Daedalus had forever-running pulse animations.
- Reworked `StatusBadge` pulse from infinite `animate-pulse` to a finite dot flourish so the page settles to zero running animations.
- Tightened `CreatorTransfer` runtime behavior by batching panel resize inline style writes/restores, removing React 19 `forwardRef`, switching derived ID state to reducers, memoizing filtered visible IDs, and keeping unchanged ID arrays stable.
- Cleaned the React Doctor findings that were cheap and aligned with runtime hygiene: redundant padding, DataLedger default state, bold heading weight, and the `CreatorScopePanel` action prop.
- Validated with `pnpm typecheck`, `pnpm lint`, `pnpm build`, and `npx react-doctor@latest . --verbose`; package React Doctor score is now 99/100, playground remains 100/100.
- Started mining target page implementation from the accepted shortlist.
- Added package blocks for campaign schedule matrix, pacing configurator, LiveGuard incident review, Kraken-style run monitor table, evidence drawer, report history rail, and report reader.
- Added separated playground pages for `?view=web-mining`, `?view=kraken-mining`, and `?view=report-mining`; the page tabs and right-side view rail can navigate all pages and keep the `view` query parameter current.
- Captured visual review screenshots at `output/playwright/mining-web.png`, `output/playwright/mining-kraken.png`, and `output/playwright/mining-report-reader.png`.
- Fixed visual overlap found during screenshot review by stacking Kraken evidence/timeline panels below 2xl and switching report evidence cards to component-safe auto-fit columns.
- Revalidated with `pnpm typecheck`, `pnpm lint`, `pnpm build`, and `npx react-doctor@latest . --verbose`; React Doctor remains 100/100 for playground and 99/100 for `@nextide/ui`.
