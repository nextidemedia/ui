# @nextide/ui

Shared Nextide React components and product interface patterns, built with
shadcn/ui, Base UI, Tailwind CSS 4, and React 19.

## Install

Pin an exact release so upgrades remain deliberate:

```bash
pnpm add --save-exact @nextide/ui@1.0.0
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

This package is publicly downloadable but proprietary. No license to copy,
modify, or redistribute it is granted.
