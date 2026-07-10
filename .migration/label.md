# label

2026-07-10, golden pair via CLI; replaced the primitive with a native label.

## Changed

- `packages/ui/src/components/label.tsx:7` now renders a native `label` with the existing package styling.
- `rg -n "radix-ui|@radix-ui" packages/ui/src/components/label.tsx` returns no matches.

## Left alone

- `field.tsx` keeps its existing form layout and association behavior.

## Behavior changes


## Verify by hand

- Click labels for text, checkbox, and switch fields and confirm focus or value toggling reaches the associated control.
