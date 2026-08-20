# @nextide/ui

Shared Nextide React components and product interface patterns, built with
shadcn/ui, Base UI, Tailwind CSS 4, and React 19.

## Install

Pin an exact release so upgrades remain deliberate:

```bash
pnpm add --save-exact @nextide/ui@2.2.0
pnpm add --save-dev --save-exact tailwindcss@4.3.1 @tailwindcss/vite@4.3.1
```

The consumer must provide React 19, React DOM 19, and Tailwind CSS 4. In a Vite
app, enable Tailwind's Vite plugin:

```ts
// vite.config.ts
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({ plugins: [react(), tailwindcss()] })
```

Import the shared stylesheet once in the application entry point, before any
app-specific styles:

```tsx
import "@nextide/ui/globals.css"
import "./app.css"
```

Products that need the optional Obviously display face may import it separately:

```tsx
import "@nextide/ui/display-font.css"
```

This enables `font-display` for rare, single-line hero and report masthead text.
Do not apply it to controls, navigation labels, forms, tables, metrics, or body
copy.
Without the optional import, `font-display` falls back to the standard UI stack.

## Use

Import through explicit public package exports:

```tsx
import { AppShell } from "@nextide/ui/blocks/app-shell"
import { Button } from "@nextide/ui/components/button"
import { PopoverTrigger } from "@nextide/ui/components/popover"
import { useStagedDrawer } from "@nextide/ui/hooks/use-staged-drawer"
```

The primitives use Base UI. Compose trigger controls with Base UI's `render`
prop rather than Radix's `asChild` convention:

```tsx
function DetailsTrigger() {
  return (
    <PopoverTrigger render={<Button variant="outline" />}>
      Open details
    </PopoverTrigger>
  )
}
```

Do not import internal `src` or `dist` paths. The supported exports are
`globals.css`, `components/*`, `blocks/*`, `hooks/*`, and `lib/*`.

## v2 foundation

Version 2 uses a metric-stable platform UI stack, a fixed type scale,
tonal surfaces, and signal color reserved for current action and state. Use the
Tailwind utilities `text-ui-brand`, `text-ui-display`, `text-ui-headline`,
`text-ui-title`, `text-ui-body`, `text-ui-label`, `text-ui-caption`, and
`text-ui-micro`;
everyday product UI uses only 400 and 500 weights. Brand and Display are the
sole 700 exceptions.

The default stylesheet no longer loads Obviously or another bundled UI font.
The separate display stylesheet ships one explicit Obviously weight for hero
use; controls, navigation labels, forms, tables, metrics, and body copy must not
depend on it or on per-component baseline offsets.

Named surface radii resolve to 8, 10, or 12 pixels. True circles and data marks
are the only rounder exceptions. Shared motion uses 120, 160, 220, and 300
millisecond tokens for instant, control, state, and layout changes.

This package is publicly downloadable but proprietary. No license to copy,
modify, or redistribute it is granted.
