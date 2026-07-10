# separator

2026-07-10, golden pair via CLI; migrated cleanly.

## Changed

- `packages/ui/src/components/separator.tsx:3` replaces the Radix root with the callable Base UI Separator.
- The wrapper preserves the package's decorative default with `role="none"`; callers can opt into separator semantics with `decorative={false}`.
- `rg -n "radix-ui|@radix-ui" packages/ui/src/components/separator.tsx` returns no matches.

## Left alone

- All package call sites already use the default horizontal separator and required no edits.

## Behavior changes

## Verify by hand

- Inspect horizontal and vertical separators and confirm size, contrast, and the decorative/semantic accessibility-tree roles.
