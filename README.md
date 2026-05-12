# nextide-ui

Shared Nextide shadcn/ui components with a Vite playground.

## Brand

The implementation guide from `nextide-saas-meta` is copied into `docs/brand_assets/NEXTIDE_BRAND_AGENT_GUIDE.md`. The large PDF and font zip stay in the meta repo for now.

## Structure

- `packages/ui/src/components`: primitive shadcn-compatible components.
- `packages/ui/src/blocks`: composed, prop-driven Nextide app patterns such as `AppShell`, `Sidebar`, `NavigationPanel`, and `WorkflowStepper`.
- `packages/ui/src/hooks`: shared interaction hooks such as `useStagedDrawer` for collapse/expand drawer motion.
- `apps/playground`: Vite consumer app for visual checks.

## Adding components

To add components to the shared UI package, run:

```bash
pnpm dlx shadcn@latest add button -c packages/ui
```

This will place the ui components in the `packages/ui/src/components` directory.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@nextide/ui/components/button"
import { AppShell } from "@nextide/ui/blocks/app-shell"
import { NavigationPanel } from "@nextide/ui/blocks/navigation-panel"
import { useStagedDrawer } from "@nextide/ui/hooks/use-staged-drawer"
```

## Checks

```bash
pnpm run typecheck
pnpm run lint
pnpm run build
pnpm run security:deps
```

Direct dependencies are pinned exactly. The workspace also uses pnpm release-age and build-script guardrails, plus `scripts/check-supply-chain.mjs` for the current Mini Shai-Hulud/TanStack/SAP/Intercom/Axios watchlist.
