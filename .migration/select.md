# select

2026-07-10, golden pair via CLI with customization replay and consumer sweep; migrated cleanly.

## Changed

- `packages/ui/src/components/select.tsx:4` adopts the Base UI Select anatomy, forwarding all positioning props to Positioner.
- `packages/ui/src/components/select-menu.tsx:70` supplies item metadata, handles nullable values, replaces popper positioning with `alignItemWithTrigger={false}`, and uses `data-selected` styling.
- `rg -n "radix-ui|@radix-ui" packages/ui/src/components/select.tsx packages/ui/src/components/select-menu.tsx` returns no matches.

## Left alone

- The custom anchored SelectMenu path remains native package code because it supports external anchors and portals not exercised by the primitive wrapper.

## Behavior changes

- Selection callbacks can receive `null`; `position="popper"` is replaced by `alignItemWithTrigger={false}`.

## Verify by hand

- Open every Daedalus select, test arrow keys, Home/End, typeahead, selection, Escape, outside click, disabled items, and trigger-width alignment.
