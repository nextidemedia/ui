# popover

2026-07-10, golden pair via CLI with an explicit missing-part fallback; migrated with one flagged delta.

## Changed

- `packages/ui/src/components/popover.tsx:4` uses Base UI Popover with Portal, Positioner, Popup, Title, and Description parts.
- `packages/ui/src/components/popover.tsx:47` keeps `PopoverAnchor` as an inert child passthrough because Base UI has no matching part.
- `apps/playground/src/App.tsx:1777` adds an interactive package preview for placement and focus QA.
- `rg -n "radix-ui|@radix-ui" packages/ui/src/components/popover.tsx` returns no matches.

## Left alone

- No consumer used `PopoverAnchor`, so no positioning workaround was invented.

## Behavior changes

- `PopoverAnchor` no longer changes positioning; callers needing a custom anchor must use the positioning API directly.

## Verify by hand

- Open the package preview by mouse and keyboard, confirm placement, outside-click and Escape dismissal, and focus return to the trigger.
