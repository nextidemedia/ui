# tooltip

2026-07-10, golden pair via CLI; migrated cleanly.

## Changed

- `packages/ui/src/components/tooltip.tsx:3` adopts Base UI Provider, Positioner, Popup, and Arrow parts with forwarded placement props.
- `apps/playground/src/App.tsx:1791` adds an interactive hover and focus preview.
- `rg -n "radix-ui|@radix-ui" packages/ui/src/components/tooltip.tsx` returns no matches.

## Left alone

- Keyboard shortcut and Kbd styling hooks remain unchanged.

## Behavior changes

- Provider delay is named `delay`, and the popup now uses the Base UI registry's four-pixel default offset.

## Verify by hand

- Hover and focus the preview trigger, move the pointer onto the tooltip, press Escape, and compare delay and placement on every side.
