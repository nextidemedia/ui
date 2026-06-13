# nextide-ui

Shared Nextide shadcn/ui components with a Vite playground.

## Brand

The implementation guide from `nextide-saas-meta` is copied into `docs/brand_assets/NEXTIDE_BRAND_AGENT_GUIDE.md`. The large PDF and font zip stay in the meta repo for now.

## Structure

- `packages/ui/src/components`: primitive shadcn-compatible components.
- `packages/ui/src/blocks`: composed, prop-driven Nextide app patterns such as `AppShell`, `Sidebar`, `NavigationPanel`, and `WorkflowStepper`.
- `packages/ui/src/hooks`: shared interaction hooks such as `useStagedDrawer` for collapse/expand drawer motion.
- `apps/playground`: Vite consumer app for visual checks.
- `docs/component-map.md`: quick lookup map for shared primitives, blocks, hooks, and the upstream workflow.

Start with [docs/component-map.md](docs/component-map.md) when deciding whether a UI element should be imported from `@nextide/ui`, polished upstream, or created as a new shared component.

## Adding components

To add components to the shared UI package, run:

```bash
pnpm dlx shadcn@latest add button -c packages/ui
```

This will place the ui components in the `packages/ui/src/components` directory.

## Using components

Until `@nextide/ui` is published to a registry, consume this package directly from
the GitHub repo. Install the `packages/ui` subdirectory, ideally pinned to a tag
or commit SHA so consuming apps do not drift on every install:

```bash
pnpm add "github:Pimpmuckl/nextide-ui#<tag-or-sha>&path:/packages/ui"
```

For local development against a sibling checkout, use a file dependency instead:

```bash
pnpm add "@nextide/ui@file:../nextide-ui/packages/ui"
```

Then import from the public package exports:

```tsx
import "@nextide/ui/globals.css"
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
