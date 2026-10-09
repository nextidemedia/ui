import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

for (const [path, name] of JSON.parse(process.argv[2])) {
  assert(name in (await import(path)), path + " must export " + name)
}

const { buildSmoothPath, getLineItemPlots } =
  await import("@nextide/ui/components/line-item-graph-data")
const contextDays = [
  { id: "0", label: "Today" },
  { id: "1", label: "Tomorrow" },
]
const contextSeries = [
  {
    id: "a",
    label: "A",
    previousValue: 100,
    points: [
      { dayId: "0", value: 5 },
      { dayId: "1", value: 10 },
    ],
  },
  {
    id: "b",
    label: "B",
    previousValue: 0,
    points: [
      { dayId: "0", value: 2 },
      { dayId: "1", value: 4 },
    ],
  },
]
const contextPlots = (series) =>
  getLineItemPlots(
    undefined,
    undefined,
    [5, 10, 2, 4, 7, 14],
    series,
    new Map([
      ["0", 100],
      ["1", 200],
    ]),
    new Map(contextDays.map((day) => [day.id, day])),
    new Set(["a", "b"]),
    { label: "Total" },
    [
      { dayId: "0", value: 7 },
      { dayId: "1", value: 14 },
    ],
    contextDays,
    50,
    120,
    100,
    100
  )
const contextual = contextPlots(contextSeries)
assert.deepEqual(
  contextual.seriesPlots[0].plottedPoints.map((point) => point.value),
  [100, 5, 10]
)
assert.equal(contextual.seriesPlots[0].plottedPoints[0].x, 0)
assert.equal(contextual.seriesPlots[1].plottedPoints[0].value, 0)
assert.equal(contextual.seriesPlots[1].plottedPoints[0].hidden, true)
assert.deepEqual(
  contextual.totalPlot.plottedPoints.map((point) => point.value),
  [100, 7, 14]
)
assert.equal(
  contextual.range,
  20,
  "Context must not change the displayed value scale"
)
assert.equal(contextual.interactivePoints.length, 4)
assert(
  contextual.interactivePoints.every(
    ({ point }) => point.dayId !== "__previous"
  )
)
const partialContext = contextPlots([
  contextSeries[0],
  { ...contextSeries[1], previousValue: undefined },
])
assert.deepEqual(
  partialContext.totalPlot.plottedPoints.map((point) => point.value),
  [7, 14],
  "Incomplete aggregate context must not invent a previous total"
)

for (const values of [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 100, 40, 40],
  [100, 0, 0, 0],
  [0, 100, 0, 100, 0],
  [20, 30, 40, 50],
]) {
  const points = values.map((value, index) => ({
    x: index * index * 7,
    y: 100 - value,
  }))
  const segments = buildSmoothPath(points).split(" C ").slice(1)
  assert.equal(segments.length, points.length - 1)
  for (const [index, segment] of segments.entries()) {
    const [x1, y1, x2, y2, x3, y3] = segment
      .replaceAll(",", "")
      .split(" ")
      .map(Number)
    const start = points[index]
    const end = points[index + 1]
    assert.equal(x3, end.x)
    assert.equal(y3, end.y)
    let previousY = start.y
    for (let step = 0; step <= 20; step++) {
      const t = step / 20
      const u = 1 - t
      const x =
        u ** 3 * start.x +
        3 * u ** 2 * t * x1 +
        3 * u * t ** 2 * x2 +
        t ** 3 * x3
      const y =
        u ** 3 * start.y +
        3 * u ** 2 * t * y1 +
        3 * u * t ** 2 * y2 +
        t ** 3 * y3
      assert(
        x >= start.x - 1e-9 && x <= end.x + 1e-9,
        "Curve must stay between sample dates"
      )
      assert(
        y >= Math.min(start.y, end.y) - 1e-9 &&
          y <= Math.max(start.y, end.y) + 1e-9,
        "Curve must not invent values beyond adjacent samples"
      )
      assert(
        (y - previousY) * Math.sign(end.y - start.y) >= -1e-9,
        "Curve must not reverse between adjacent samples"
      )
      previousY = y
    }
  }
}

const { createElement } = await import("react")
const { renderToStaticMarkup } = await import("react-dom/server")
const { ScrollArea } = await import("@nextide/ui/components/scroll-area")
const scrollMarkup = renderToStaticMarkup(
  createElement(
    ScrollArea,
    {
      className: (state) =>
        state.hasOverflowY ? "overflowing-root" : "fitting-root",
      viewportProps: {
        className: (state) =>
          state.hasOverflowY ? "overflowing-viewport" : "fitting-viewport",
      },
    },
    "Content"
  )
)
assert(scrollMarkup.includes("fitting-root"))
assert(scrollMarkup.includes("fitting-viewport"))

const cssPath = fileURLToPath(import.meta.resolve("@nextide/ui/globals.css"))
const css = await readFile(cssPath, "utf8")
const { cn } = await import("@nextide/ui/lib/utils")
assert.equal(
  cn("text-ui-micro", "text-muted-foreground"),
  "text-ui-micro text-muted-foreground"
)
const typeRoles = [...css.matchAll(/--text-([a-z0-9-]+?):/g)]
  .map(([, name]) => name)
  .filter((name) => !name.includes("--"))
assert(
  typeRoles.includes("ui-micro"),
  "type roles must be readable from globals.css"
)
for (const role of typeRoles) {
  const size = "text-" + role
  assert.equal(
    cn(size, "text-nextide-tide"),
    size + " text-nextide-tide",
    size + " must merge as a font size, not a text colour"
  )
  assert.equal(
    cn("text-ui-body", size),
    size,
    size + " must replace another type role"
  )
}

const displayCssPath = fileURLToPath(
  import.meta.resolve("@nextide/ui/display-font.css")
)
const displayCss = await readFile(displayCssPath, "utf8")
const displayFonts = [
  ...displayCss.matchAll(/url\(["']?(\.\.\/assets\/fonts\/[^"')]+)/g),
]
assert.equal(displayFonts.length, 1, "display CSS must reference one font")
for (const [, font] of displayFonts) {
  await access(resolve(dirname(displayCssPath), font))
}
