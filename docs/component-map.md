# Nextide UI Component Map

`@nextide/ui` is the shared shadcn-based UI package for Nextide product surfaces. Prefer importing from this package before creating app-local components.

## Import Shape

Use public subpath exports:

```tsx
import { Button } from "@nextide/ui/components/button"
import { DualDateRangePicker } from "@nextide/ui/components/date-range-picker"
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
- `apps/playground`: visual harness for exercising exported package components.

## Components

| Need                       | Start with                                                                                                                                                                                                                                                                    |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Actions and commands       | `components/button`, `components/badge`, `components/status-badge`                                                                                                                                                                                                            |
| Forms and inputs           | `components/input`, `components/field`, `components/label`, `components/checkbox`, `components/switch`, `components/slider`, `components/select`, `components/select-menu`, `components/token-list-editor`                                                                    |
| Choice controls            | `components/segmented-control`, `components/tabs`, `components/collapsible`, `components/popover`, `components/tooltip`                                                                                                                                                       |
| Date and schedule controls | `components/date-range-picker`, `components/schedule-control`                                                                                                                                                                                                                 |
| Layout and surfaces        | `components/surface`, `components/card`, `components/separator`, `components/scroll-area`, `components/table`, `components/alert`, `components/notice`, `components/metric`, `components/kbd`                                                                                 |
| Data visualization         | `components/donut-chart`, `components/line-graph`, `components/line-item-graph`, `components/trend-bar-chart`, `components/hourly-pacing-chart`, `components/score-threshold-meter`, `components/creator-flow-chart`, `components/data-ledger`, `components/platform-cluster` |

## Blocks

| Need                        | Start with                                                                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| App frame and navigation    | `blocks/app-shell`, `blocks/sidebar`, `blocks/navigation-panel`, `blocks/workflow-stepper`, `blocks/intro-plate`, `blocks/settings-modal`              |
| Report building and reading | `blocks/report-context-builder`, `blocks/progressive-summary-rail`, `blocks/report-reader`, `blocks/report-rail`, `blocks/export-workbench`            |
| Creator workflows           | `blocks/creator-transfer`, `blocks/creator-scope-panel`, `blocks/campaign-schedule-matrix`, `blocks/pacing-configurator`                               |
| Operations and dashboards   | `blocks/dashboard-filter-bar`, `blocks/run-monitor-table`, `blocks/stream-selector`, `blocks/intelligence-progression-chart`, `blocks/evidence-drawer` |
| Live/event safety           | `blocks/liveguard-cockpit`, `blocks/liveguard-incident-review`, `blocks/live-event-timeline`, `blocks/live-event-proof-modal`                          |

## Hooks

| Need                             | Start with                                            |
| -------------------------------- | ----------------------------------------------------- |
| Prevent nested scroll bleed      | `hooks/use-contained-scroll`                          |
| Staged collapse/expand animation | `hooks/use-staged-drawer`, `hooks/use-staged-sidebar` |

## Upstream Workflow

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
