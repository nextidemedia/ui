import { cp, rm } from "node:fs/promises"

await rm(new URL("../dist", import.meta.url), { force: true, recursive: true })
await Promise.all([
  cp(
    new URL("../src/assets", import.meta.url),
    new URL("../dist/assets", import.meta.url),
    { recursive: true }
  ),
  cp(
    new URL("../src/styles", import.meta.url),
    new URL("../dist/styles", import.meta.url),
    { recursive: true }
  ),
])
