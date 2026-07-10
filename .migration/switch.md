# switch

2026-07-10, golden pair via CLI; migrated cleanly.

## Changed

- `packages/ui/src/components/switch.tsx:3` moves Root and Thumb to Base UI while preserving sizes and state styling.
- `rg -n "radix-ui|@radix-ui" packages/ui/src/components/switch.tsx` returns no matches.

## Left alone

- Existing field and playground consumers use the compatible boolean control shape.

## Behavior changes


## Verify by hand

- Toggle both sizes with mouse and Space and confirm checked, unchecked, disabled, invalid, and focus-visible states.
