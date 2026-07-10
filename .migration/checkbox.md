# checkbox

2026-07-10, golden pair via CLI with Lucide customization replay; migrated cleanly.

## Changed

- `packages/ui/src/components/checkbox.tsx:3` moves the wrapper to Base UI Checkbox while preserving its Lucide checkmark and visual states.
- `rg -n "radix-ui|@radix-ui" packages/ui/src/components/checkbox.tsx` returns no matches.

## Left alone

- Field composition remains in `field.tsx`; it is not Radix-backed and required no primitive rewrite.

## Behavior changes

- Indeterminate state is now the separate `indeterminate` prop; `checked` and change callbacks are boolean.

## Verify by hand

- Toggle with mouse and Space, verify focus and disabled styles, then check checked, unchecked, invalid, and indeterminate states.
