import * as React from "react"
import { formatCompactNumber } from "@nextide/ui/lib/format-number"
import {
  type LineItemGraphTone,
  type LineItemGraphAxisLabelMode,
  type LineItemGraphDay,
  type LineItemGraphPoint,
  type LineItemGraphSeries,
  type LineItemGraphTotalLine,
  type PlottedLineItemPoint,
} from "./line-item-graph-types.js"

export const toneColors: Record<LineItemGraphTone, string> = {
  cyan: "rgb(0 181 255)",
  tide: "var(--nextide-tide)",
  yellow: "var(--nextide-yellow)",
  red: "var(--nextide-red)",
  violet: "rgb(175 46 255)",
  neutral: "rgb(210 214 222)",
}

export function getAxisLabelIndices(count: number, stride: number) {
  const indices = new Set<number>()
  if (count === 0) return indices

  indices.add(0)
  indices.add(count - 1)

  for (let index = stride; index < count - 1; index += stride) {
    if (count - 1 - index >= Math.max(1, Math.ceil(stride * 0.75))) {
      indices.add(index)
    }
  }

  return indices
}

export function resolveDayPositions(
  days: LineItemGraphDay[],
  plotLeft: number,
  plotRight: number,
  step: number
) {
  const positions = new Map<string, number>()
  let visibleIndex = 0
  let leadingHidden = 0
  const visibleCount = days.filter((day) => !day.hidden).length

  days.forEach((day) => {
    if (!day.hidden) {
      const x =
        visibleCount > 1
          ? plotLeft + visibleIndex * step
          : (plotLeft + plotRight) / 2
      positions.set(day.id, x)
      visibleIndex += 1
      return
    }

    if (visibleIndex === 0) {
      leadingHidden += 1
      positions.set(day.id, plotLeft - step * leadingHidden)
      return
    }

    if (visibleIndex >= visibleCount) {
      positions.set(day.id, plotRight + step)
      return
    }

    positions.set(day.id, plotLeft + (visibleIndex - 0.5) * step)
  })

  return positions
}

export function valueToY(
  value: number,
  min: number,
  range: number,
  plotBottom: number,
  plotHeight: number
) {
  return plotBottom - ((value - min) / range) * plotHeight
}

export function buildSmoothPath(points: PlottedLineItemPoint[]) {
  if (points.length === 0) return ""
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  let path = `M ${points[0].x} ${points[0].y}`
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[index - 1] ?? points[index]
    const current = points[index]
    const next = points[index + 1]
    const afterNext = points[index + 2] ?? next
    const controlOneX = current.x + (next.x - previous.x) / 6
    const controlOneY = current.y + (next.y - previous.y) / 6
    const controlTwoX = next.x - (afterNext.x - current.x) / 6
    const controlTwoY = next.y - (afterNext.y - current.y) / 6

    path += ` C ${controlOneX} ${controlOneY}, ${controlTwoX} ${controlTwoY}, ${next.x} ${next.y}`
  }

  return path
}

export function resolveSeriesColor(series: LineItemGraphSeries) {
  return series.color ?? toneColors[series.tone ?? "tide"]
}

export function getNiceChartMax(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 1

  const exponent = Math.floor(Math.log10(value))
  const power = 10 ** exponent
  const fraction = value / power
  const niceFraction =
    fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10

  return niceFraction * power
}

export function formatLineItemValue(value: number) {
  return value.toLocaleString("en-US")
}

export const formatCompactLineItemValue = formatCompactNumber

export function stringifyNode(value: React.ReactNode) {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : ""
}

export function withAlpha(color: string, alpha: number) {
  if (!color.startsWith("rgb(")) return "rgb(30 228 188 / 0.18)"

  return color.replace("rgb(", "rgb(").replace(")", ` / ${alpha})`)
}

export function getLineItemLayout(
  measuredChartWidth: number,
  visibleDays: LineItemGraphDay[],
  axisLabelMode: LineItemGraphAxisLabelMode
) {
  const chartWidth = measuredChartWidth || 760
  const compactAxis = chartWidth < 520
  const plotTop = 22
  const plotLeft = compactAxis ? 48 : 58
  const plotRight = chartWidth - (compactAxis ? 12 : 22)
  const plotWidth = plotRight - plotLeft
  const step =
    visibleDays.length > 1 ? plotWidth / (visibleDays.length - 1) : plotWidth
  const angleThreshold =
    axisLabelMode === "weekday-day"
      ? 74
      : axisLabelMode === "angled-day"
        ? 58
        : 52
  const shouldAngleLabels = visibleDays.length > 1 && step < angleThreshold
  const chartHeight = shouldAngleLabels ? 306 : 274
  const plotBottom = shouldAngleLabels ? 214 : 204
  const plotHeight = plotBottom - plotTop
  const minimumLabelGap = shouldAngleLabels
    ? 52
    : axisLabelMode === "weekday-day"
      ? 82
      : 58
  const axisLabelIndices = getAxisLabelIndices(
    visibleDays.length,
    Math.max(1, Math.ceil(minimumLabelGap / Math.max(step, 1)))
  )

  return {
    chartWidth,
    chartHeight,
    plotTop,
    plotLeft,
    plotRight,
    plotWidth,
    step,
    shouldAngleLabels,
    plotBottom,
    plotHeight,
    axisLabelIndices,
  }
}

export function useLineItemTotals(
  totalLine: LineItemGraphTotalLine | undefined,
  days: LineItemGraphDay[],
  activeSeries: LineItemGraphSeries[],
  pointMaps: Map<string, Map<string, LineItemGraphPoint>>
) {
  const totalLineConfig = React.useMemo(
    () =>
      typeof totalLine === "object"
        ? totalLine
        : totalLine
          ? { label: "Total" }
          : null,
    [totalLine]
  )
  const totalPoints = React.useMemo(
    () =>
      totalLineConfig
        ? days.map((day) => ({
            dayId: day.id,
            value: activeSeries.reduce(
              (sum, item) =>
                sum + (pointMaps.get(item.id)?.get(day.id)?.value ?? 0),
              0
            ),
          }))
        : [],
    [activeSeries, days, pointMaps, totalLineConfig]
  )
  const chartValues = React.useMemo(
    () => [
      ...activeSeries.flatMap((item) =>
        item.points.map((point) => point.value)
      ),
      ...totalPoints.map((point) => point.value),
    ],
    [activeSeries, totalPoints]
  )

  return { totalLineConfig, totalPoints, chartValues }
}

export function getLineItemPlots(
  minValue: number | undefined,
  maxValue: number | undefined,
  chartValues: number[],
  selectableSeries: LineItemGraphSeries[],
  dayX: Map<string, number>,
  dayById: Map<string, LineItemGraphDay>,
  activeIdSet: Set<string>,
  totalLineConfig: Exclude<LineItemGraphTotalLine, boolean> | null,
  totalPoints: LineItemGraphPoint[],
  days: LineItemGraphDay[],
  plotLeft: number,
  plotBottom: number,
  plotHeight: number
) {
  const { resolvedMin, resolvedMax, range } = getLineItemRange(
    minValue,
    maxValue,
    chartValues
  )
  const ticks = Array.from({ length: 5 }, (_, index) => {
    const progress = index / 4
    return resolvedMax - progress * range
  })
  const seriesPlots = selectableSeries.map((item) => {
    const plottedPoints: PlottedLineItemPoint[] = []

    for (const point of item.points) {
      const x = dayX.get(point.dayId)
      if (x === undefined) continue

      plottedPoints.push({
        ...point,
        x,
        y: valueToY(point.value, resolvedMin, range, plotBottom, plotHeight),
        hidden: dayById.get(point.dayId)?.hidden ?? false,
      })
    }

    return {
      ...item,
      active: activeIdSet.has(item.id),
      color: resolveSeriesColor(item),
      plottedPoints,
    }
  })
  const interactivePoints: Array<{
    item: (typeof seriesPlots)[number]
    point: PlottedLineItemPoint
  }> = []

  for (const item of seriesPlots) {
    if (!item.active) continue
    for (const point of item.plottedPoints) {
      if (!point.hidden) interactivePoints.push({ item, point })
    }
  }
  const totalPlot =
    totalLineConfig && totalPoints.length > 0
      ? {
          id: "__total",
          label: totalLineConfig.label ?? "Total",
          color: totalLineConfig.color ?? "var(--muted-foreground)",
          plottedPoints: totalPoints.map((point) => ({
            ...point,
            x: dayX.get(point.dayId) ?? plotLeft,
            y: valueToY(
              point.value,
              resolvedMin,
              range,
              plotBottom,
              plotHeight
            ),
            hidden: days.find((day) => day.id === point.dayId)?.hidden ?? false,
          })),
        }
      : null

  return {
    resolvedMin,
    range,
    ticks,
    seriesPlots,
    interactivePoints,
    totalPlot,
  }
}

export function useLineItemData(
  days: LineItemGraphDay[],
  series: LineItemGraphSeries[],
  activeSeries: LineItemGraphSeries[],
  selectableSeries: LineItemGraphSeries[],
  activeIdSet: Set<string>,
  measuredChartWidth: number,
  axisLabelMode: LineItemGraphAxisLabelMode,
  totalLine: LineItemGraphTotalLine | undefined,
  minValue: number | undefined,
  maxValue: number | undefined
) {
  const pointMaps = React.useMemo(
    () =>
      new Map(
        series.map((item) => [
          item.id,
          new Map(item.points.map((point) => [point.dayId, point])),
        ])
      ),
    [series]
  )
  const visibleDays = React.useMemo(
    () => days.filter((day) => !day.hidden),
    [days]
  )
  const dayById = React.useMemo(
    () => new Map(days.map((day) => [day.id, day])),
    [days]
  )

  const layout = getLineItemLayout(
    measuredChartWidth,
    visibleDays,
    axisLabelMode
  )
  const { plotLeft, plotRight, step } = layout
  const dayX = useLineItemDayPositions(days, plotLeft, plotRight, step)
  const { totalLineConfig, totalPoints, chartValues } = useLineItemTotals(
    totalLine,
    days,
    activeSeries,
    pointMaps
  )
  const plots = getLineItemPlots(
    minValue,
    maxValue,
    chartValues,
    selectableSeries,
    dayX,
    dayById,
    activeIdSet,
    totalLineConfig,
    totalPoints,
    days,
    layout.plotLeft,
    layout.plotBottom,
    layout.plotHeight
  )

  return { ...layout, ...plots, pointMaps, visibleDays, dayById, dayX }
}

export function getLineItemRange(
  minValue: number | undefined,
  maxValue: number | undefined,
  chartValues: number[]
) {
  const resolvedMin =
    typeof minValue === "number" && Number.isFinite(minValue)
      ? minValue
      : Math.min(0, ...chartValues)
  const resolvedMax =
    typeof maxValue === "number" && Number.isFinite(maxValue)
      ? maxValue
      : getNiceChartMax(Math.max(...chartValues, 1))
  const range = Math.max(1, resolvedMax - resolvedMin)

  return { resolvedMin, resolvedMax, range }
}

export function useLineItemDayPositions(
  days: LineItemGraphDay[],
  plotLeft: number,
  plotRight: number,
  step: number
) {
  return React.useMemo(
    () => resolveDayPositions(days, plotLeft, plotRight, step),
    [days, plotLeft, plotRight, step]
  )
}
