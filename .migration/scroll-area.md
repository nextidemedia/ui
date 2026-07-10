# scroll-area

2026-07-10, golden pair via CLI; migrated cleanly.

## Changed

- `packages/ui/src/components/scroll-area.tsx:4` maps the scrollbar and thumb parts to Base UI.
- `apps/playground/src/App.tsx:1797` adds a compact overflow preview.
- `rg -n "radix-ui|@radix-ui" packages/ui/src/components/scroll-area.tsx` returns no matches.

## Left alone

- `use-contained-scroll` remains the owner of nested application scroll behavior; it is unrelated to Radix.

## Behavior changes

- Radix visibility props such as `type` and `scrollHideDelay` are no longer part of the public wrapper API; visibility is CSS-driven.

## Verify by hand

- Scroll the package preview with wheel, touchpad, keyboard, and dragged thumb; confirm focus rings and no page scroll bleed.
