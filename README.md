# nextide-ui

Shared Nextide shadcn/ui components with a Vite playground.

Run `npm run dev`, then open [http://127.0.0.1:5174](http://127.0.0.1:5174) to view the component catalogue.

## Development checks

Install Node 24.18.0 (matching CI), npm 12.0.2, `just`, and uv. On Windows, install PowerShell 7.5+
with `pwsh` available on PATH.

- `just setup` installs the frozen workspace lockfile.
- `just check` runs Prettier, Oxlint, existing ESLint, the supply-chain watchlist,
  LOC budgets, strict TypeScript checks, and packed-consumer qualification.
- `just fmt`, `just fmt-check`, `just lint`, and `just typecheck` run separately.
- `just quality` runs full formatting, lint, and LOC checks.
- `just correctness` runs correctness lint, the supply-chain watchlist, TypeScript,
  packed-consumer checks, the playground build, and native TesterArmy browser
  checks. `just qualify-deploy` runs the same checks without publishing.
- `just qualify` runs both groups. `just check` keeps its existing scope.
- `just test` runs native package acceptance: a packed tarball installed into an
  isolated npm consumer, public TypeScript/runtime exports, stylesheet/font assets,
  and known chart, scroll-state, and typography regressions. It needs npm registry access.
  Native tooling acceptance also invokes the real lint processes against disposable
  unsafe-operation and React Hooks probes; source-shape qualification units are removed.
- `just test-integration` builds both workspaces and runs native TesterArmy E2E.
  First run `npm exec -- e2e-web install chromium` (Linux CI adds `--with-deps`).
  The runner owns an isolated preview port and stops the server on exit.
  Focus with `npm exec -- e2e run tests/schedule.e2e.ts --target mobile`.
- Normal runs use committed recordings, strict read-only cache, zero retries, and
  unavailable model credentials. Tests use the built library through playground
  public exports at desktop (1440px) and mobile (390px) widths. The packed consumer
  separately proves installation without workspace links. No visible browser is opened.
- To author a changed recorded goal, set `UI_E2E_RECORD=1` with saved ChatGPT OAuth,
  then run the affected case and one target with `--grep` and `--max-failures 1`.
  Use `gpt-6-luna` with low reasoning. Inspect the generated `.e2e/cache` JSON for
  sensitive data and literal origins before committing it unchanged. Clear the
  recording variable and replay without credentials; never edit cache outcomes.

The [shared baseline](https://github.com/nextidemedia/meta/blob/main/docs/development-baseline.md)
sets complexity 12, function length 100, and source/test LOC limits. All source
files meet the 600-line limit and browser suites meet the 900-line test limit;
`.loc.json` has no exceptions. Accessibility exceptions explain specific SVG,
forwarded-prop, or scroll-region semantics. Existing ESLint/React Hooks rules remain until parity
with Oxlint is verified. Oxlint 1.80.0 was the newest stable npm release at least
seven days old on 2026-09-08; the existing formatter and TypeScript remain pinned.

Correctness lint retains the configured React Hooks, accessibility, unsafe-operation,
and accumulating-spread checks. Only explicit cosmetic rules (size/complexity,
unused declarations, redundant syntax/types, and syntax preferences) are omitted;
the complete rule sets still run in Quality. Type safety restrictions and the
supply-chain watchlist remain required in both profiles.

Pull requests, main pushes, and the weekly **Qualification** workflow run full qualification. Manual runs select
`full` or `deploy`; deploy deliberately skips **Quality**. **Qualification result**
requires every selected group to succeed and reports the validated commit. The
package has no service deployment or database integration lane; its integration
surface is the packed consumer and playground browser suite.

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
npx shadcn@latest add button -c packages/ui
```

This will place the ui components in the `packages/ui/src/components` directory.

## Consuming `@nextide/ui`

The package expects React 19 and Tailwind CSS 4. Install an exact release so a
consumer upgrades deliberately:

```bash
npm install --save-exact @nextide/ui@2.6.2
npm install --save-dev --save-exact tailwindcss@4.3.1 @tailwindcss/vite@4.3.1
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
npm install "@nextide/ui@file:../nextide-ui/packages/ui"
```

## Checks

```bash
npm run check
npm exec -- e2e-web install chromium
npm run qualify
cd packages/ui
npm pack --dry-run --access public
```

`npm run check` keeps its lint, typecheck, build, and targeted supply-chain scope.
Install Chromium once, then run the explicit, headless `npm run qualify` gate for packed-package consumer resolution and
representative Chromium interaction, accessibility, and responsive checks.
Use `just qualify` for all checks or `just qualify-deploy` for release validation.
Direct dependencies are pinned exactly. The workspace also enforces a seven-day release age (except native E2E packages),
strict peer dependencies, and explicitly approved dependency install scripts.

## Releasing

1. Update `packages/ui/package.json` and the install examples in both READMEs.
2. Run `just qualify-deploy` and the package dry run above (`just qualify` includes Quality too).
3. Merge the release commit and create a matching `v<version>` tag on that merge.
4. Run **Publish @nextide/ui** manually with the exact tag.

Publication requires successful deploy qualification. Running either
qualification profile alone never publishes a package.

## Dead-code report

Run `just deadcode-setup` once, then `just deadcode`. Reports are written to
`.artifacts/deadcode/` and uploaded by the monthly/manual Dead-code report workflow.
Findings are advisory candidates for review; the command never deletes code.
Tool execution failures return a nonzero exit status. Knip can report recoverable
plugin loading errors without failing, so read diagnostics before trusting a report.
`@nextide/ui` public export paths are Knip entrypoints, including exports unused by the playground.
