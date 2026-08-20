# nextide-ui

Shared Nextide shadcn/ui components with a Vite playground.

## Brand

The implementation guide from `nextide-saas-meta` is copied into `docs/brand_assets/NEXTIDE_BRAND_AGENT_GUIDE.md`. The large PDF and font zip stay in the meta repo for now.

## Structure

- `packages/ui/src/components`: primitive shadcn-compatible components.
- `packages/ui/src/blocks`: composed, prop-driven Nextide app patterns such as `AppShell`, `NavigationPanel`, and `WorkflowStepper`.
- `packages/ui/src/hooks`: shared interaction hooks such as `useStagedDrawer` for collapse/expand drawer motion.
- `apps/playground`: Vite consumer app for visual checks.
- `docs/component-map.md`: quick lookup map for shared primitives, blocks, hooks, and the upstream workflow.
- `docs/responsive-support.md`: required responsive acceptance widths and shared component behavior.

Start with [docs/component-map.md](docs/component-map.md) when deciding whether a UI element should be imported from `@nextide/ui`, polished upstream, or created as a new shared component.
Use [docs/responsive-support.md](docs/responsive-support.md) when changing layout,
navigation, overflow, or responsive component behavior.

## Adding components

To add components to the shared UI package, run:

```bash
pnpm dlx shadcn@latest add button -c packages/ui
```

This will place the ui components in the `packages/ui/src/components` directory.

## Consuming `@nextide/ui`

The package expects React 19 and Tailwind CSS 4. Install an exact release so a
consumer upgrades deliberately:

```bash
pnpm add --save-exact @nextide/ui@2.1.0
pnpm add --save-dev --save-exact tailwindcss@4.3.1 @tailwindcss/vite@4.3.1
```

Vite consumers need the Tailwind CSS Vite plugin. Import the shared stylesheet
once in the application entry point, before app-specific styles:

```ts
// vite.config.ts
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({ plugins: [react(), tailwindcss()] })
```

```tsx
// src/main.tsx
import "@nextide/ui/globals.css"
import "./app.css"
```

Import only through the package's public subpaths:

```tsx
import { AppShell } from "@nextide/ui/blocks/app-shell"
import { NavigationPanel } from "@nextide/ui/blocks/navigation-panel"
import { Button } from "@nextide/ui/components/button"
import { PopoverTrigger } from "@nextide/ui/components/popover"
import { useStagedDrawer } from "@nextide/ui/hooks/use-staged-drawer"
```

The primitives use Base UI. When a Base UI trigger must adopt an existing
control, compose it with `render`; do not use Radix's `asChild` convention:

```tsx
function DetailsTrigger() {
  return (
    <PopoverTrigger render={<Button variant="outline" />}>
      Open details
    </PopoverTrigger>
  )
}
```

Do not import from `src` or `dist`, and do not copy shared components into a
consumer. Fix reusable behavior here, publish a release, then update the
consumer's exact package version. See [packages/ui/README.md](packages/ui/README.md)
for the npm-facing quick start and [docs/component-map.md](docs/component-map.md)
for the complete component map.

For local development against a sibling checkout, use a file dependency:

```bash
pnpm add "@nextide/ui@file:../nextide-ui/packages/ui"
```

## Checks

```bash
pnpm run check
pnpm exec playwright install chromium
pnpm run qualify
cd packages/ui
npm pack --dry-run --access public
```

`pnpm run check` remains the canonical lint, typecheck, build, and targeted
supply-chain release gate. Install Chromium once, then run the explicit,
headless `pnpm run qualify` gate for packed-package consumer resolution and
representative Chromium interaction, accessibility, and responsive checks.
Direct dependencies are pinned exactly. The workspace also enforces pnpm
release-age and build-script guardrails.

## Releasing

1. Update `packages/ui/package.json` and the install examples in both READMEs.
2. Run `pnpm run check`, `pnpm run qualify`, and the package dry run above.
3. Merge the release commit and create a matching `v<version>` tag on that merge.
4. Run **Publish @nextide/ui** manually with the exact tag.
