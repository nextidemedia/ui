# project

2026-07-10, whole-project Radix UI to Base UI migration; migrated cleanly.

## Changed

- Added `@base-ui/react@1.6.0`, removed `radix-ui`, and regenerated the lockfile with no Radix packages remaining.
- Switched `packages/ui/components.json` and `apps/playground/components.json` from `radix-nova` to `base-nova`.
- Migrated 14 shared primitive or overlay surfaces and their package/playground consumers to Base UI.
- Added focused playground coverage for popover, tooltip, scroll area, and the shared settings dialog.
- Updated `docs/component-map.md` for Base UI composition and corrected the stale date-range component name.
- Final validation passed frozen install, typecheck, lint, production build, dependency security checks, and the full visual interaction matrix. Zero wrappers remain on Radix UI.

## Left alone

- Nextide tokens, variants, animation, and public component names remain package-owned.
- Product/demo state and sample copy remain in `apps/playground`.
- Existing React Doctor cleanup findings outside the migrated behavior remain separate follow-up work.

## Behavior changes

- Polymorphic composition uses Base UI `render` or `useRender` instead of Radix `asChild` and Slot.
- Persistent disclosure content uses `keepMounted` instead of `forceMount`.
- Slider callbacks accept Base UI scalar or readonly-range values, and commit callbacks use `onValueCommitted`.
- Dialog, popover, select, tabs, tooltip, and other state selectors now follow Base UI anatomy and data attributes.

## Verify by hand

- Exercise pointer and keyboard interaction for every migrated primitive, including Escape dismissal and focus restoration for overlays.
- Check report, platform, Daedalus, intelligence, web-mining, Kraken-mining, and report-mining views at 320, 390, 768, and 1440 pixels.
- Confirm controlled select, collapsible, tabs, slider, checkbox, switch, and settings-dialog state changes remain synchronized.
- Confirm no horizontal overflow, console errors, or warnings appear during the playground smoke pass.
