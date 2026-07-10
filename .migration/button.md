# button

2026-07-10, golden pair via CLI with customization replay; migrated to the Base UI Button primitive.

## Changed

- `packages/ui/src/components/button.tsx:1` uses `@base-ui/react/button` and retains the Nextide primary and secondary treatments.
- `rg -n "radix-ui|@radix-ui" packages/ui/src/components/button.tsx` returns no matches.

## Left alone

- The custom tide primary treatment and package size variants were preserved.

## Behavior changes

- `asChild` is removed. Use `buttonVariants` on a native link rather than rendering an anchor through Button, so link semantics stay intact.

## Verify by hand

- Click every button variant, tab through them, and confirm disabled, focus-visible, pressed, and icon-only states.
