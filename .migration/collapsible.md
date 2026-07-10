# collapsible

2026-07-10, golden pair via CLI plus consumer sweep; migrated cleanly.

## Changed

- `packages/ui/src/components/collapsible.tsx:3` maps Root, Trigger, and Panel to Base UI.
- `packages/ui/src/components/data-ledger.tsx:54` replaces `asChild` with `render`; `packages/ui/src/components/data-ledger.tsx:97` replaces `forceMount` with `keepMounted`.
- The data ledger uses its grid/opacity transition without layering a keyframe animation onto the Base UI panel.
- `rg -n "radix-ui|@radix-ui" packages/ui/src/components/collapsible.tsx packages/ui/src/components/data-ledger.tsx` returns no matches.

## Left alone

- DataLedger's controlled collapsed state and custom grid transition remain package behavior.

## Behavior changes


## Verify by hand

- Expand and collapse DataLedger by mouse and keyboard, confirm the chevron, mounted content, animation, and focus state remain synchronized.
