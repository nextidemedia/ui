import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import {
  access,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const packageRoot = join(repoRoot, "packages", "ui")
const npm = process.platform === "win32" ? process.execPath : "npm"
const npmArgs =
  process.platform === "win32"
    ? [
        join(
          dirname(process.execPath),
          "node_modules",
          "npm",
          "bin",
          "npm-cli.js"
        ),
      ]
    : []
const tempRoot = await mkdtemp(join(tmpdir(), "nextide-ui-consumer-"))
const consumerRoot = join(tempRoot, "consumer")

function run(command, args, options = {}) {
  execFileSync(command, args, {
    stdio: "inherit",
    timeout: 120_000,
    ...options,
  })
}

try {
  run(
    npm,
    [
      ...npmArgs,
      "pack",
      "--loglevel=error",
      "--access",
      "public",
      "--pack-destination",
      tempRoot,
    ],
    { cwd: packageRoot }
  )
  const tarball = join(
    tempRoot,
    (await readdir(tempRoot)).find((file) => file.endsWith(".tgz")) ?? ""
  )
  await access(tarball)

  const uiPackage = JSON.parse(
    await readFile(join(packageRoot, "package.json"), "utf8")
  )
  await mkdir(consumerRoot)
  await writeFile(
    join(consumerRoot, "package.json"),
    JSON.stringify({
      name: "nextide-ui-isolated-consumer",
      private: true,
      type: "module",
      dependencies: {
        "@nextide/ui": `file:${tarball}`,
        react: uiPackage.devDependencies.react,
        "react-dom": uiPackage.devDependencies["react-dom"],
        tailwindcss: uiPackage.devDependencies.tailwindcss,
      },
      devDependencies: {
        "@types/react": uiPackage.devDependencies["@types/react"],
        "@types/react-dom": uiPackage.devDependencies["@types/react-dom"],
      },
    })
  )
  run(
    npm,
    [
      ...npmArgs,
      "install",
      "--loglevel=error",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--package-lock=false",
    ],
    { cwd: consumerRoot }
  )

  const installedRoot = join(consumerRoot, "node_modules", "@nextide", "ui")
  assert.equal((await lstat(installedRoot)).isSymbolicLink(), false)
  const installedPackage = JSON.parse(
    await readFile(join(installedRoot, "package.json"), "utf8")
  )
  assert.equal(JSON.stringify(installedPackage).includes("workspace:"), false)

  await writeFile(
    join(consumerRoot, "consumer.ts"),
    [
      'import { AppShell } from "@nextide/ui/blocks/app-shell"',
      'import { Button } from "@nextide/ui/components/button"',
      'import { SegmentedControl } from "@nextide/ui/components/segmented-control"',
      'import { SignalRidgeChart } from "@nextide/ui/components/signal-ridge-chart"',
      'import { useContainedScroll } from "@nextide/ui/hooks/use-contained-scroll"',
      'import { formatCompactNumber } from "@nextide/ui/lib/format-number"',
      'import { cn } from "@nextide/ui/lib/utils"',
      "void [AppShell, Button, SegmentedControl, SignalRidgeChart, useContainedScroll, formatCompactNumber, cn]",
    ].join("\n")
  )
  run(
    process.execPath,
    [
      join(repoRoot, "node_modules", "typescript", "bin", "tsc"),
      "--noEmit",
      "--module",
      "NodeNext",
      "--moduleResolution",
      "NodeNext",
      "--target",
      "ES2022",
      "--skipLibCheck",
      "consumer.ts",
    ],
    { cwd: consumerRoot }
  )

  await writeFile(
    join(consumerRoot, "consumer.mjs"),
    `
import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

for (const [path, name] of ${JSON.stringify([
      ["@nextide/ui/blocks/app-shell", "AppShell"],
      ["@nextide/ui/components/button", "Button"],
      ["@nextide/ui/components/segmented-control", "SegmentedControl"],
      ["@nextide/ui/components/signal-ridge-chart", "SignalRidgeChart"],
      ["@nextide/ui/hooks/use-contained-scroll", "useContainedScroll"],
      ["@nextide/ui/lib/format-number", "formatCompactNumber"],
      ["@nextide/ui/lib/utils", "cn"],
    ])}) {
  assert(name in (await import(path)), path + " must export " + name)
}

const { formatCompactNumber } = await import("@nextide/ui/lib/format-number")
assert.equal(formatCompactNumber(1320), "1.32k")
assert.equal(formatCompactNumber(10300), "10.3k")
assert.equal(formatCompactNumber(100100000), "100m")

const cssPath = fileURLToPath(import.meta.resolve("@nextide/ui/globals.css"))
const css = await readFile(cssPath, "utf8")
assert(!css.includes("@font-face"), "v2 must not load a bundled UI font")
assert(!css.includes("assets/fonts"), "v2 must not reference font assets")
assert(css.includes("--nextide-font-ui"), "v2 must expose its UI font stack")
assert(css.includes("--text-ui-body"), "v2 must expose semantic type roles")

const displayCssPath = fileURLToPath(
  import.meta.resolve("@nextide/ui/display-font.css")
)
const displayCss = await readFile(displayCssPath, "utf8")
const displayFonts = [
  ...displayCss.matchAll(/url\\(["']?(\\.\\.\\/assets\\/fonts\\/[^"')]+)/g),
]
assert.equal(displayFonts.length, 1, "display CSS must reference one font")
for (const [, font] of displayFonts) {
  await access(resolve(dirname(displayCssPath), font))
}
`
  )
  run(process.execPath, ["consumer.mjs"], { cwd: consumerRoot })

  console.log(
    `Packed consumer qualification passed for ${uiPackage.name}@${uiPackage.version}.`
  )
} finally {
  await rm(tempRoot, { recursive: true, force: true })
}
