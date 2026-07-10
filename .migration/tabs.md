# tabs

2026-07-10, golden pair via CLI with consumer verification; migrated with the documented activation delta.

## Changed

- `packages/ui/src/components/tabs.tsx:3` maps Trigger to Tab and Content to Panel, including Base UI disabled-state hooks.
- Existing EvidenceDrawer consumers retain their controlled string values.
- `rg -n "radix-ui|@radix-ui" packages/ui/src/components/tabs.tsx packages/ui/src/blocks/evidence-drawer.tsx` returns no matches.

## Left alone

- EvidenceDrawer's tab state and content composition remain unchanged.

## Behavior changes

- Keyboard focus does not activate a tab until Space or Enter; Base UI defaults to manual activation.

## Verify by hand

- In Kraken evidence, move focus with arrow keys, activate with Space and Enter, and confirm the panel, line indicator, and focus ring stay synchronized.
