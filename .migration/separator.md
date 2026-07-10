# separator

2026-07-10, golden pair via CLI; migrated cleanly.

## Changed

- `packages/ui/src/components/separator.tsx:3` replaces the Radix root with the callable Base UI Separator.
- `rg -n "radix-ui|@radix-ui" packages/ui/src/components/separator.tsx` returns no matches.

## Left alone

- All package call sites already use the default horizontal separator and required no edits.

## Behavior changes

- The removed `decorative` prop means the component now exposes separator semantics by default.

## Verify by hand

- Inspect horizontal and vertical separators and confirm size, contrast, and accessibility-tree role.
