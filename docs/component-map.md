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

Large controls keep their public import paths above. Adjacent modules divide
navigation and schedule rendering from motion, transfer state from animation,
and line-item chart data from plotting. Consumers should continue importing
the named public component rather than its supporting modules.

## Components

| Need                       | Start with                                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Actions and commands       | `components/button`, `components/badge`, `components/status-badge`                                                                                                                                                                                                                                                                                                                                |
| Forms and inputs           | `components/input`, `components/currency-input`, `components/field`, `components/label`, `components/checkbox`, `components/switch`, `components/slider`, `components/select`, `components/select-menu`, `components/autocomplete`, `components/token-list-editor`                                                                                                                                |
| Choice controls            | `components/segmented-control`, `components/tabs`, `components/collapsible`, `components/dropdown-menu`, `components/dialog`, `components/popover`, `components/tooltip`                                                                                                                                                                                                                          |
| Date and schedule controls | `components/date-range-picker`, `components/duration-picker`, `components/schedule-control`                                                                                                                                                                                                                                                                                                       |
| Layout and surfaces        | `components/surface`, `components/card`, `components/separator`, `components/scroll-area`, `components/carousel`, `components/table`, `components/alert`, `components/notice`, `components/metric`, `components/kbd`                                                                                                                                                                              |
| Identity and feedback      | `components/avatar`, `components/empty`, `components/progress`, `components/processing-text`, `components/spinner`, `components/skeleton`                                                                                                                                                                                                                                                         |
| Data visualization         | `components/graph-tooltip`, `components/donut-chart`, `components/line-graph`, `components/line-item-graph`, `components/trend-bar-chart`, `components/signal-ridge-chart`, `components/hourly-pacing-chart`, `components/score-threshold-meter`, `components/score-ring`, `components/sentiment-meter`, `components/creator-flow-chart`, `components/data-ledger`, `components/platform-cluster` |

## Blocks

| Need                        | Start with                                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| App frame and navigation    | `blocks/app-shell`, `blocks/navigation-panel`, `blocks/navigation-user-menu`, `blocks/workflow-stepper`, `blocks/signal-plate`, `blocks/settings-modal` |
| Report building and reading | `blocks/report-context-builder`, `blocks/progressive-summary-rail`, `blocks/report-reader`, `blocks/report-rail`, `blocks/export-workbench`             |
| Creator workflows           | `blocks/creator-transfer`, `blocks/creator-scope-panel`, `blocks/campaign-schedule-matrix`, `blocks/pacing-configurator`, `blocks/fit-leaderboard`      |
| Operations and dashboards   | `blocks/dashboard-filter-bar`, `blocks/run-monitor-table`, `blocks/stream-selector`, `blocks/intelligence-progression-chart`, `blocks/evidence-drawer`  |
| Live/event safety           | `blocks/liveguard-cockpit`, `blocks/liveguard-incident-review`, `blocks/live-event-timeline`, `blocks/live-event-proof-modal`                           |

`WorkflowStepper` accepts explicit per-step completion when progress must
survive revisits. `CreatorScopePanel` keeps row actions beside its selection
button and supports content around the creator heading. `StreamSelector` can
show the same creator-scope controls. Disabled creator and stream rows stay
visible without changing selection. `ReportContextBuilder` supports multiple
or single selection; locked and disabled rows cannot change, while editable
rows can expose Add.

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

Shared interactive primitives use the Tide focus ring width from
`--nextide-focus-ring-width` (0.5px by default). Form fields use the inset
keyboard-focus treatment described below. Invalid fields use a muted red border
without an extra ring at rest; keyboard focus adds the same inset emphasis.

Use `blocks/signal-plate` for a top-level summary with a current status. Its
accent follows the semantic status tone. Use `components/surface` for ordinary
work areas, forms, and operational containers; those stay visually plain.

Navigation uses the quiet active rail. Report history uses a contained outline
so navigation and record selection remain visually distinct.

`blocks/navigation-panel` is the canonical sidebar navigation block. The
smaller `SidebarBrand` and `SidebarToggleButton` exports in `blocks/sidebar`
only provide its shared brand and collapse chrome; they do not implement a
second navigation model.

`blocks/app-shell` and `blocks/navigation-panel` form one edge-to-edge desktop
shell. The product lockup and navigation share a full-height rectangular left
rail. `AppShell` can place a rectangular top bar above the rectangular main
body through its `header` prop. Borders separate these three layout regions;
mobile composition remains the responsibility of each product workflow.
Both blocks accept the same `density`: `current` is presented as Large and
preserves the spacious Nextide lockup, `compact` is the playground default,
and `ops` matches the denser control-dashboard rail and navigation rhythm. All
three retain the three-line brand lockup. Density does not change product-body
components or the selected navigation treatment. The Large navigation rail
uses a 16-pixel inset and section gap. Compact uses 12 pixels; Ops uses a
10-pixel horizontal inset with 12-pixel section spacing.
Product bodies keep their own task-appropriate gutters.
`NavigationPanel.selectionStyle` defaults to a slowly animated soft fill and
can also render the active item as a rail, outline, or dot.

`blocks/navigation-panel` includes section-aware search through the shared
autocomplete surface. The Search field is the input itself; focusing it or
using an explicitly supplied `commandShortcut` filters navigation results
directly beneath the field.
In compact mode the icon opens that same field beside the rail without expanding
the full sidebar. Matching is deliberately conservative and requires direct text
matches across labels and their visible context. Selection navigates through
`onSelectItem`, while Escape and outside clicks clear the query. Navigation does
not register or display a keyboard shortcut by default.

Navigation items can expose one level of `children`, an `expanded` state, and a
separate `action`. Use `onToggleItem` for disclosure and `onActionItem` for the
item action so opening a saved destination, opening its workspace, and creating
a new record remain distinct controls. Closed children remain searchable.
Set a section's `pinned` flag when a workspace switch must remain at the bottom
of the desktop navigation, directly above its footer. Narrow layouts keep that
section in the existing horizontal navigation flow.

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
copy and the two product callbacks only. Footer actions remain below the
horizontally scrollable navigation at narrow widths.

Clickable hover feedback changes color, border, glow, or emphasis without
moving the control. Reserve hover translation or scaling for non-clickable data
feedback where the motion communicates the inspected value.

Apply `nextide-effect-layer` to a glow or shine that must paint above adjacent
surfaces. When a scroll viewport would clip the effect, render its
non-interactive effect layer outside that viewport while keeping the content
inside it.

`components/status-badge` owns status tone, compact sizing, and optional
indicators. Use `indicator="pulse"` only for a currently live or running state;
use `indicator="none"` for categorical labels such as Review or Queued.

`components/processing-text` adds a length-aware shimmer to concise progress
copy. Choose `variant="classic"`, `variant="aurora"`, or `variant="flame"`;
use the neutral tone for ordinary work in progress and `tone="processing"` for
the shared purple active state. `travelSpeed` sets the approximate characters
crossed per second and defaults to `5`, so text length changes duration rather
than perceived speed. Give related lines the same `syncLength` to keep their
shimmer cycles aligned; use the longest line's character count. Reduced-motion
and forced-color modes render static text.

The `components/segmented-control` fill variant changes label contrast exactly
where its moving selection indicator overlaps the label. The quiet and
underline variants keep their simpler state-color transition. Its Base UI
toggle group owns roving focus and Arrow, Home, and End keyboard navigation.

`components/carousel` owns its previous and next `Button` controls. Consumers
may reposition them with `className`, but should not have to add button variants
or repair the pressed-state transform.

Use `components/dialog` for shared modal focus, backdrop, close, and motion
behavior. Product blocks such as `SettingsModal` and `LiveEventProofModal` own
their content layout but compose that primitive instead of styling Base UI
dialog parts directly.

`blocks/campaign-schedule-matrix` derives day/week/month/quarter headers from
each slot's ISO `date`. It opens at week scale and, when a `today` slot exists,
positions that week after one visible week of history. Inside the schedule
board, wheel interaction steps between day, week, and month zoom only while
another level is available, then hands scrolling back to the page. The top and
creator legends remain inert. Pointer users can drag the board horizontally; a
drag suppresses the booking click while an ordinary click still selects it.

`blocks/intelligence-progression-chart` measures each rendered node and attaches
its SVG connectors to the horizontal equator of the actual circle edges. Curves
can bend between branches, but they always leave and enter at cardinal side
points. Below 640 pixels it switches to a taller two-branch composition;
consumers keep the same seven canonical stage ids without supplying
viewport-specific geometry.

Give each `blocks/live-event-proof-modal` `evidenceFields` entry a stable `id`
so evidence rows preserve their identity when the list changes. Provide
`onAudioPlay` when rendering the block; its audio control is always actionable.

`components/graph-tooltip` owns graph tooltip portaling, viewport clamping,
right-first placement with edge flipping, scroll dismissal, and the shared
series-row treatment. Charts continue to own hit testing, guide geometry,
labels, and value content. `components/signal-ridge-chart` point labels and
value labels are text because the chart renders them into SVG and accessible
names as well as its tooltip.

`blocks/app-shell` is viewport-bound. Its sidebar stays within the available
height while the main workspace and optional inspector own their vertical
scroll independently; consumers should not restore document-level scrolling
around the shell.

Its main workspace and inspector use `components/scroll-area`; their scrollbars
fade briefly as content becomes scrollable or fits again, without shifting the
content width. Reduced motion skips the fade. The scrolling main element is
`[data-slot="app-shell-workspace"] main[data-slot="scroll-area-viewport"]`.
`ScrollArea` accepts `viewportProps` for semantic elements, labels and refs.

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

### Form focus and popup placement

Input, Select and Autocomplete use the same control radius and a single inset
keyboard-focus edge, without an additional outer halo. Pointer focus uses only
the turquoise border and stays quiet while typing. Autocomplete owns focus on the
complete input group. Consumers should not add a second outline to its inner
input or a second focus treatment to shared controls.

Select popups open below the trigger and align to its starting edge by default.
Use SelectMenu for ordinary choice fields, including campaign time zones, and
Autocomplete for searchable suggestions. Select is the underlying composition
primitive; SelectMenu owns the standard menu spacing and option presentation.
Use SelectMenu's triggerId to associate a visible field label with its button.
Selected options keep their checkmark; keyboard/pointer highlight is separate.
An explicit `alignItemWithTrigger` opts into the selected-item overlay treatment.
Navigation preserves icon positions through the drawer/text exit, then smoothly
settles heading space, row heights, gaps and search placement. Expansion settles
icons first, then reveals the text. Reduced motion applies the final state directly.

`CreatorFlowChart` accepts caller-owned `title`, `description` (pass `null` to hide),
creator `avatar` and `name` nodes, and `compact` for a fluid, denser calendar.
Supply week labels through `days` and inclusive column indices through sessions.
Without `onSessionsChange`, sessions are read-only; `onSessionSelect(session)`
optionally makes them keyboard-accessible actions. Editing retains move and resize.

`LineItemGraph` accepts a canvas `height` in pixels, preserving the existing
274px/306px defaults when omitted. Without compact, heights retain room for the axes and five
value ticks (minimum 156px, or 178px with angled labels). Series controls expose
`data-slot="line-item-graph-controls"` for scoped layout styling.

`LineItemGraph` also accepts `compact` to reduce axis whitespace, `glow={false}`
to remove series halos and control shadows, and `showPoints={false}` to hide
painted point markers while retaining point/day tooltips and keyboard access.

`LineItemGraph edgePadding={0.5}` adds half a day to each end of the horizontal
domain without changing the plot insets. The default is zero. `angled-day`
explicitly angles labels; `day` and `weekday-day` adapt to available spacing.

For weekday prefixes, supply `day.weekday` separately from `day.label` and choose
`weekday-day` or `angled-day`. Compact axes render the weekday and separator
slightly smaller and quieter while preserving full-size dates and tooltips.

`LineItemGraphSeries.previousValue` supplies a real observation one bucket before
the first visible bucket. It extends the clipped curve without adding an axis
label, hover target, scale value, or displayed total bucket. The total line uses
previous context only when every active series supplies it. Omit unavailable
context; future observations are never inferred.

In compact read-only calendars, `CreatorFlowSession.continuesBefore` opens and
fades the left edge of a session that started before the visible window. Set
`CreatorFlowChart continuationFade={1 / 14}` for a half-day fade in weekly
columns; the default is 0.1 column. Sessions continuing beyond the right viewport
edge receive the same open, faded edge; real ends retain their rounded cap.
This styling never changes session indices.

Compact read-only `CreatorFlowChart` supports `visibleStartIndex`, `visibleColumnCount`, and `onVisibleStartIndexChange` for a bounded full timeline. Navigation pans without replacing campaign rows; dragging pans both axes and reports the final fractional column. Campaign labels stay fixed horizontally and dates stay fixed vertically. Give the chart a height to enable vertical scrolling.

### Creator transfer and campaign scheduling

`CreatorTransfer` keeps each list independently scrollable with `listHeight`
(default `20rem`). Search + Enter transfers the first eligible result and clears
that search. `disabledReason` makes an available creator unavailable to add and
shows why; selected creators can still be removed. Tab retains normal document
focus order. Transfers animate inside a stable-height layout.

`CampaignScheduleMatrix` remains controlled. Set `minimumRows={5}` for a stable
empty board; placeholder rows do not count as creators. `showMetrics={false}`
hides summary metrics. `campaignStartIndex` and `campaignEndIndex` mark the
inclusive campaign range within `days`, independently of the inclusive
`editableStartIndex`/`editableEndIndex` bounds (default: all displayed days).
Display padding is supplied as ordinary days.

With `onBookingChange`, drag a booking to move it without changing its duration,
or drag either edge to resize by whole days. Focus the body or either edge and
use Left/Right to preview, Enter to save, Escape or blur to cancel. Pointer
cancellation also discards the preview. Blank rows retain timeline panning.
Booking `title` accepts a React node or a function of the displayed booking,
including uncommitted edits, so duration labels can follow a resize preview.
The dedicated creator handle uses drag or Up/Down, Enter, and Escape and calls
`onCreatorOrderChange` with the reordered creator IDs.
Rows preview their new order during a drag; drop or Enter commits, while Escape
or blur restores the saved order.

`onBookingSplit(booking, splitIndex)` requests a cut before the indexed day;
the two inclusive ranges are `[startIndex, splitIndex - 1]` and
`[splitIndex, endIndex]`. The consuming app assigns the second booking's ID.
The header scissors tool previews the nearest interior day boundary and both
resulting durations on the targeted booking; click to cut. Focus a booking and
use Left/Right, Home, and End to choose a boundary, then Enter to cut. Adjacent
bookings retain separate identities and move independently. Resize handles stay
visible and switch back to resizing when used.

With `onBookingDelete(booking)`, Delete or Backspace removes the focused booking,
and the header eraser tool deletes a clicked booking. A scissors sweep from the
first day to the last day (or back) also deletes; short bookings use their outer
quarters. Partial sweeps do nothing. Deletion keeps the creator row and returns
focus to its handle, or the timeline when reordering is unavailable. Tools turn
off on a second toggle, Escape, a click outside the matrix, or changing expanded
view. The chart suppresses text selection during gestures.

The web-mining playground demonstrates padded bounds, edits, cuts, reordering,
and clearing all creators while retaining five empty rows.

The schedule's Expand button opens the existing large dialog surface with one
editable timeline. Closing restores focus to Expand and preserves zoom and pan;
an armed cut is cancelled. `onBookingSelect` is optional: omitting it leaves only
focus and temporary edit feedback. Creator additions, removals, and reordering
animate while retaining the minimum row floor; reduced motion skips animation.
Transfer lists hide scrollbar chrome while retaining scrolling and keyboard access.

### Currency entry

`CurrencyInput` edits USD with live dollar, comma-grouping, and decimal-dot
formatting. Pass an unformatted decimal string through `value` and
`onValueChange`; an empty string clears the amount and a trailing dot is retained
while typing. It accepts up to two fraction digits without converting the value
to a JavaScript number. Supply values with at most two fraction digits; numeric
conversion and domain limits belong to the consumer. Negative amounts are disabled
unless `allowNegative` is set. Standard input labels, refs, disabled/read-only,
and error attributes use the same `Input` surface.

CampaignScheduleMatrix accepts `rowLabel` for creative and other schedule lanes; its default is Creator.

Set `overlapLayout="stepped"` to keep overlapping bookings in one fixed-height lane. Two bookings share complementary stepped shapes; three or more show a compact overlap list for selecting each booking. Drag and keyboard previews update the shapes before committing.
