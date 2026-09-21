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

const qualifiedExports = [
  ["@nextide/ui/components/creator-flow-chart", "CreatorFlowChart"],
  ["@nextide/ui/blocks/app-shell", "AppShell"],
  ["@nextide/ui/blocks/navigation-panel", "NavigationPanel"],
  ["@nextide/ui/blocks/campaign-schedule-matrix", "CampaignScheduleMatrix"],
  ["@nextide/ui/blocks/creator-transfer", "CreatorTransfer"],
  ["@nextide/ui/blocks/stream-selector", "StreamSelector"],
  ["@nextide/ui/components/button", "Button"],
  ["@nextide/ui/components/currency-input", "CurrencyInput"],
  ["@nextide/ui/components/segmented-control", "SegmentedControl"],
  ["@nextide/ui/components/signal-ridge-chart", "SignalRidgeChart"],
  ["@nextide/ui/components/line-item-graph", "LineItemGraph"],
  ["@nextide/ui/components/duration-picker", "DurationPicker"],
  ["@nextide/ui/hooks/use-contained-scroll", "useContainedScroll"],
  ["@nextide/ui/lib/format-number", "formatCompactNumber"],
  ["@nextide/ui/lib/utils", "cn"],
]

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
      ...qualifiedExports.map(
        ([path, name]) => `import { ${name} } from "${path}"`
      ),
      `void [${qualifiedExports.map(([, name]) => name).join(", ")}]`,
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

for (const [path, name] of ${JSON.stringify(qualifiedExports)}) {
  assert(name in (await import(path)), path + " must export " + name)
}

const { formatCompactNumber } = await import("@nextide/ui/lib/format-number")
assert.equal(formatCompactNumber(1320), "1.32k")
assert.equal(formatCompactNumber(10300), "10.3k")
assert.equal(formatCompactNumber(100100000), "100m")

const { buildSmoothPath, getLineItemLayout, resolveDayPositions, getLineItemPlots } = await import("@nextide/ui/components/line-item-graph-data")
const paddedDays = Array.from({ length: 7 }, (_, index) => ({ id: String(index), label: String(index) }))
const paddedLayout = getLineItemLayout(780, paddedDays, "day", 180, true, 0.5)
assert.equal(paddedLayout.plotLeft, 58)
assert.equal(paddedLayout.plotRight, 758)
assert.equal(paddedLayout.step, 100)
const paddedPositions = resolveDayPositions(paddedDays,
  paddedLayout.plotLeft + paddedLayout.edgeOffset,
  paddedLayout.plotRight - paddedLayout.edgeOffset, paddedLayout.step)
assert.deepEqual([...paddedPositions.values()], [108, 208, 308, 408, 508, 608, 708])
const unpaddedLayout = getLineItemLayout(780, paddedDays, "day")
assert.equal(unpaddedLayout.edgeOffset, 0)
assert.equal(unpaddedLayout.plotRight, 758)

const contextDays = [{ id: "0", label: "Today" }, { id: "1", label: "Tomorrow" }]
const contextSeries = [
  { id: "a", label: "A", previousValue: 100, points: [{ dayId: "0", value: 5 }, { dayId: "1", value: 10 }] },
  { id: "b", label: "B", previousValue: 0, points: [{ dayId: "0", value: 2 }, { dayId: "1", value: 4 }] },
]
const contextPlots = (series) => getLineItemPlots(undefined, undefined, [5, 10, 2, 4, 7, 14],
  series, new Map([["0", 100], ["1", 200]]), new Map(contextDays.map(day => [day.id, day])),
  new Set(["a", "b"]), { label: "Total" }, [{ dayId: "0", value: 7 }, { dayId: "1", value: 14 }],
  contextDays, 50, 120, 100, 100)
const contextual = contextPlots(contextSeries)
assert.deepEqual(contextual.seriesPlots[0].plottedPoints.map(point => point.value), [100, 5, 10])
assert.equal(contextual.seriesPlots[0].plottedPoints[0].x, 0)
assert.equal(contextual.seriesPlots[1].plottedPoints[0].value, 0)
assert.equal(contextual.seriesPlots[1].plottedPoints[0].hidden, true)
assert.deepEqual(contextual.totalPlot.plottedPoints.map(point => point.value), [100, 7, 14])
assert.equal(contextual.range, 20, "Context must not change the displayed value scale")
assert.equal(contextual.interactivePoints.length, 4)
assert(contextual.interactivePoints.every(({ point }) => point.dayId !== "__previous"))
const partialContext = contextPlots([contextSeries[0], { ...contextSeries[1], previousValue: undefined }])
assert.deepEqual(partialContext.totalPlot.plottedPoints.map(point => point.value), [7, 14],
  "Incomplete aggregate context must not invent a previous total")

for (const values of [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 40, 40],
  [100, 0, 0, 0],
  [0, 100, 0, 100, 0],
  [20, 30, 40, 50],
]) {
  const points = values.map((value, index) => ({ x: index * index * 7, y: 100 - value }))
  const segments = buildSmoothPath(points).split(" C ").slice(1)
  assert.equal(segments.length, points.length - 1)
  for (const [index, segment] of segments.entries()) {
    const [x1, y1, x2, y2, x3, y3] = segment.replaceAll(",", "").split(" ").map(Number)
    const start = points[index]
    const end = points[index + 1]
    assert.equal(x3, end.x)
    assert.equal(y3, end.y)
    let previousY = start.y
    for (let step = 0; step <= 20; step++) {
      const t = step / 20
      const u = 1 - t
      const x = u ** 3 * start.x + 3 * u ** 2 * t * x1 + 3 * u * t ** 2 * x2 + t ** 3 * x3
      const y = u ** 3 * start.y + 3 * u ** 2 * t * y1 + 3 * u * t ** 2 * y2 + t ** 3 * y3
      assert(x >= start.x - 1e-9 && x <= end.x + 1e-9, "Curve must stay between sample dates")
      assert(y >= Math.min(start.y, end.y) - 1e-9 && y <= Math.max(start.y, end.y) + 1e-9,
        "Curve must not invent values beyond adjacent samples")
      assert((y - previousY) * Math.sign(end.y - start.y) >= -1e-9,
        "Curve must not reverse between adjacent samples")
      previousY = y
    }
  }
}

const { createElement } = await import("react")
const { renderToStaticMarkup } = await import("react-dom/server")
const { ScrollArea } = await import("@nextide/ui/components/scroll-area")
const scrollMarkup = renderToStaticMarkup(createElement(ScrollArea, {
  className: state => state.hasOverflowY ? "overflowing-root" : "fitting-root",
  viewportProps: {
    className: state => state.hasOverflowY ? "overflowing-viewport" : "fitting-viewport",
  },
}, "Content"))
assert(scrollMarkup.includes("fitting-root"))
assert(scrollMarkup.includes("fitting-viewport"))

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
