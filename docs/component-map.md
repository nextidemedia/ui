# Nextide UI Component Map

`@nextide/ui` is the shared shadcn-based UI package for Nextide product surfaces. Prefer importing from this package before creating app-local components.

## Import Shape

Use public subpath exports:

```tsx
import { Button } from "@nextide/ui/components/button"
import { SingleCalendarDateRangePicker } from "@nextide/ui/components/date-range-picker"
import { NavigationPanel } from "@nextide/ui/blocks/navigation-panel"
import { ProgressiveSummaryRail } from "@nextide/ui/blocks/progressive-summary-rail"
import { useStagedDrawer } from "@nextide/ui/hooks/use-staged-drawer"
```

When a trigger should look like an existing control, compose it with the
`render` prop so the result stays a single interactive element:

```tsx
<PopoverTrigger render={<Button variant="outline" />}>
  Open details
</PopoverTrigger>
```

## Where To Look First

- `packages/ui/src/components`: shadcn-style primitives and focused reusable controls.
- `packages/ui/src/blocks`: composed, prop-driven product patterns.
- `packages/ui/src/hooks`: reusable interaction behavior.
- `packages/ui/src/styles/globals.css`: shared theme tokens and base styles.
- `packages/ui/src/styles/typeset.css`: shadcn Typeset flow adapted to Nextide typography and radius tokens.
- `apps/playground`: visual harness for exercising exported package components.

Playground examples show the exact public export name in turquoise monospace
above the rendered component. Use that identifier in requests and handoffs:
`DurationPicker`, `LineItemGraph`, or `ProgressiveSummaryRail`, rather than a
description of where the component happens to appear.

## Components

| Need                       | Start with                                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Actions and commands       | `components/button`, `components/badge`, `components/status-badge`                                                                                                                                                                                                                                                                                                                                |
| Forms and inputs           | `components/input`, `components/field`, `components/label`, `components/checkbox`, `components/switch`, `components/slider`, `components/select`, `components/select-menu`, `components/autocomplete`, `components/token-list-editor`                                                                                                                                                             |
| Choice controls            | `components/segmented-control`, `components/tabs`, `components/collapsible`, `components/dropdown-menu`, `components/popover`, `components/tooltip`                                                                                                                                                                                                                                               |
| Date and schedule controls | `components/date-range-picker`, `components/duration-picker`, `components/schedule-control`                                                                                                                                                                                                                                                                                                       |
| Layout and surfaces        | `components/surface`, `components/card`, `components/separator`, `components/scroll-area`, `components/carousel`, `components/table`, `components/alert`, `components/notice`, `components/metric`, `components/kbd`                                                                                                                                                                              |
| Identity and feedback      | `components/avatar`, `components/empty`, `components/progress`, `components/processing-text`, `components/spinner`, `components/skeleton`                                                                                                                                                                                                                                                         |
| Data visualization         | `components/graph-tooltip`, `components/donut-chart`, `components/line-graph`, `components/line-item-graph`, `components/trend-bar-chart`, `components/signal-ridge-chart`, `components/hourly-pacing-chart`, `components/score-threshold-meter`, `components/score-ring`, `components/sentiment-meter`, `components/creator-flow-chart`, `components/data-ledger`, `components/platform-cluster` |

## Blocks

| Need                        | Start with                                                                                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App frame and navigation    | `blocks/app-shell`, `blocks/sidebar`, `blocks/navigation-panel`, `blocks/navigation-user-menu`, `blocks/workflow-stepper`, `blocks/signal-plate`, `blocks/settings-modal` |
| Report building and reading | `blocks/report-context-builder`, `blocks/progressive-summary-rail`, `blocks/report-reader`, `blocks/report-rail`, `blocks/export-workbench`                               |
| Creator workflows           | `blocks/creator-transfer`, `blocks/creator-scope-panel`, `blocks/campaign-schedule-matrix`, `blocks/pacing-configurator`, `blocks/fit-leaderboard`                        |
| Operations and dashboards   | `blocks/dashboard-filter-bar`, `blocks/run-monitor-table`, `blocks/stream-selector`, `blocks/intelligence-progression-chart`, `blocks/evidence-drawer`                    |
| Live/event safety           | `blocks/liveguard-cockpit`, `blocks/liveguard-incident-review`, `blocks/live-event-timeline`, `blocks/live-event-proof-modal`                                             |

## Hooks

| Need                                  | Start with                                            |
| ------------------------------------- | ----------------------------------------------------- |
| Hand nested scroll back at edges      | `hooks/use-contained-scroll`                          |
| Staged drawer and compact-icon motion | `hooks/use-staged-drawer`, `hooks/use-staged-sidebar` |

## Upstream Workflow

The global stylesheet also owns the v2 typography utilities `text-ui-brand`,
`text-ui-display`, `text-ui-headline`, `text-ui-title`, `text-ui-body`,
`text-ui-label`, `text-ui-caption`, and `text-ui-micro`. Use the first two only
for the primary product lockup and rare intro or report mastheads. Reserve Micro
for short badges and dense chart labels; shared controls and blocks should use
the semantic roles instead of arbitrary font sizes or baseline offsets.

Use `blocks/signal-plate` for a top-level summary with a current status. Its
accent follows the semantic status tone. Use `components/surface` for ordinary
work areas, forms, and operational containers; those stay visually plain.

Navigation uses the quiet active rail. Report history uses a contained outline
so navigation and record selection remain visually distinct.

`blocks/navigation-panel` includes section-aware search through the shared
autocomplete surface. The Search field is the input itself; focusing it or
pressing Command/Ctrl+K filters navigation results directly beneath the field.
In compact mode the icon opens that same field beside the rail without expanding
the full sidebar. Matching is deliberately conservative and requires direct text
matches across labels and their visible context. Selection navigates through
`onSelectItem`, while Escape and outside clicks clear the query. Pass an empty
`commandShortcut` when a secondary panel must not
register the global shortcut.

Collapsed navigation controls use the same 44px icon track and hit area. Their
final positions are measured before the layout changes so every control follows
one direct path instead of inheriting competing row, heading, and gap reflows.
The horizontal text-and-shell motion starts first; compact icon geometry joins
only for the final icon-duration window so both stages land together.
The search label and shortcut move as one stable-width track behind the search
icon, so neither element reflows or stretches while the drawer changes width.

Desktop navigation retracts its text and shell while each icon moves directly
to its measured compact position. Expansion uses the same measured path in
reverse.

Pass `userMenu` to `blocks/navigation-panel` for the shadcn-style sidebar footer:
the shared block owns the Avatar trigger, up/down glyph, compact avatar state,
and Base UI dropdown containing Settings and Logout. Consumers provide identity
copy and the two product callbacks only.

Clickable hover feedback changes color, border, glow, or emphasis without
moving the control. Reserve hover translation or scaling for non-clickable data
feedback where the motion communicates the inspected value.

`components/status-badge` owns status tone, compact sizing, and optional
indicators. Use `indicator="pulse"` only for a currently live or running state;
use `indicator="none"` for categorical labels such as Review or Queued.

`components/processing-text` adds a length-aware shimmer to concise progress
copy. Choose `variant="classic"`, `variant="aurora"`, or `variant="flame"`;
use the neutral tone for ordinary work in progress and `tone="processing"` for
the shared purple active state. `travelSpeed` sets the approximate characters
crossed per second and defaults to `5`, so text length changes duration rather
than perceived speed. Reduced-motion and forced-color modes render static text.

The `components/segmented-control` fill variant changes label contrast exactly
where its moving selection indicator overlaps the label. The quiet and
underline variants keep their simpler state-color transition.

`blocks/campaign-schedule-matrix` derives day/week/month/quarter headers from
each slot's ISO `date`. It opens at week scale and, when a `today` slot exists,
positions that week after one visible week of history. Its wheel interaction
steps between day, week, and month zoom only while another level is available,
then hands scrolling back to the page. Pointer users can drag the timeline
horizontally; a drag suppresses the booking click while an ordinary click still
selects it.

`blocks/intelligence-progression-chart` measures each rendered node and attaches
its SVG connectors to the horizontal equator of the actual circle edges. Curves
can bend between branches, but they always leave and enter at cardinal side
points. Below 640 pixels it switches to a taller two-branch composition;
consumers keep the same seven canonical stage ids without supplying
viewport-specific geometry.

Give each `blocks/live-event-proof-modal` `evidenceFields` entry a stable `id`
so evidence rows preserve their identity when the list changes.

`components/graph-tooltip` owns graph tooltip portaling, viewport clamping,
right-first placement with edge flipping, and the shared series-row treatment.
Charts continue to own hit testing, guide geometry, labels, and value content.

`blocks/app-shell` is viewport-bound. Its sidebar stays within the available
height while the main workspace and optional inspector own their vertical
scroll independently; consumers should not restore document-level scrolling
around the shell.

Long-form report and evidence content can use `.typeset`. Tune only
`--typeset-size`, `--typeset-leading`, and `--typeset-flow`; the shared CSS owns
the semantic element treatment and keeps headings at Medium weight.

Changing counters, axes, and dense metrics should use
`lib/format-number`'s compact notation with at most three significant digits.
Keep exact values available in detailed tables and tooltips when the precision
matters to a decision.

1. Search this map and the source package before creating app-local UI.
2. If polish or bug fixes affect a shared component, apply the fix in `nextide-ui` first.
3. If an app needs a reusable pattern, propose adding it to `packages/ui/src/components` or `packages/ui/src/blocks` instead of copying it locally.
4. Keep app-specific data fetching, domain state, and copy in the consuming app. Keep reusable behavior, layout primitives, and product-agnostic interaction patterns in `nextide-ui`.
5. Update this map when adding, renaming, or substantially changing shared components.

## Reorganization Guidance

Do not reorganize directories just to make the package feel tidier. The current split is intentional:

- `components` for shadcn-style primitives and focused reusable controls.
- `blocks` for composed product patterns that still stay prop-driven and app-agnostic.
- `hooks` for behavior that multiple components or apps can share.

Reorganize only when there is a repeated lookup problem or repeated import ambiguity. Good next steps, in order:

1. Add or update examples in `apps/playground` for new shared components.
2. Keep this map current and grouped by user need.
3. Add a lightweight generated export/catalog script only after the manual map starts drifting.
4. Split directories further only when one folder becomes too broad to scan quickly, such as `components/data-viz`, `components/forms`, or `blocks/live`.
