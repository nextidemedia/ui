# dialog

2026-07-10, transformation engine using the current Base UI dialog shape; custom SettingsModal migrated cleanly.

## Changed

- `packages/ui/src/blocks/settings-modal.tsx:4` moves the custom modal from Radix Dialog to Base UI Dialog.
- `packages/ui/src/blocks/settings-modal.tsx:41` maps Overlay to Backdrop and `packages/ui/src/blocks/settings-modal.tsx:48` maps Content to Popup with Base state hooks.
- `apps/playground/src/App.tsx:1222` wires the existing Settings action to a focused modal preview.
- `rg -n "radix-ui|@radix-ui" packages/ui/src/blocks/settings-modal.tsx` returns no matches.

## Left alone

- SettingsModal layout, body scrolling, progress action, and Nextide styling remain package-owned behavior.

## Behavior changes


## Verify by hand

- Open from Settings, verify initial focus, Tab containment, Escape and outside-click dismissal, scroll lock, close button, and focus return.
