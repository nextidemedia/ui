# slider

2026-07-10, golden pair via CLI with Nextide customization replay; migrated cleanly.

## Changed

- `packages/ui/src/components/slider.tsx:1` adopts Base UI Control, Track, Indicator, and Thumb anatomy while preserving the Nextide gradient and stable thumb keys.
- `packages/ui/src/components/slider.tsx:31` uses edge thumb alignment and supports both scalar and range value shapes.
- An omitted value renders one thumb because Base UI initializes the slider as a scalar at `min`; explicit arrays render one thumb per range value.
- `rg -n "radix-ui|@radix-ui" packages/ui/src/components/slider.tsx` returns no matches.

## Left alone

- The existing playground confidence control remains a controlled range value.

## Behavior changes

- `onValueCommit` is now `onValueCommitted`; single-thumb values may be numbers while range values remain arrays.

## Verify by hand

- Drag each thumb, use arrow and Page keys, verify min/max edges, range crossing behavior, focus rings, and committed-value timing.
