# badge

2026-07-10, golden pair via CLI with customization replay; migrated cleanly to Base UI composition.

## Changed

- `packages/ui/src/components/badge.tsx:1` replaces the Radix Slot path with Base UI `useRender` and `mergeProps` while preserving all variants and styling.
- `rg -n "radix-ui|@radix-ui" packages/ui/src/components/badge.tsx` returns no matches.

## Left alone

- Badge variants and Nextide token usage were preserved because they are package styling, not primitive behavior.

## Behavior changes

- Polymorphic composition now uses `render` instead of `asChild`.

## Verify by hand

- Render every badge variant, then render a badge as a link and confirm focus, hover, and text wrapping remain correct.
