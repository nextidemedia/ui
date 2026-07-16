import * as React from "react"

import {
  GraphTooltip,
  GraphTooltipRow,
} from "@nextide/ui/components/graph-tooltip"
import { formatCompactNumber } from "@nextide/ui/lib/format-number"
import { cn } from "@nextide/ui/lib/utils"

type LineItemGraphTone =
  | "cyan"
  | "tide"
  | "yellow"
  | "red"
  | "violet"
  | "neutral"

type LineItemGraphAxisLabelMode = "day" | "weekday-day" | "angled-day"

type LineItemGraphDay = {
  id: string
  label: React.ReactNode
  weekday?: React.ReactNode
  hidden?: boolean
}

type LineItemGraphPoint = {
  dayId: string
  value: number
  valueLabel?: React.ReactNode
}

type LineItemGraphSeries = {
  id: string
  label: React.ReactNode
  points: LineItemGraphPoint[]
  tone?: LineItemGraphTone
  color?: string
  disabled?: boolean
}

type LineItemGraphTotalLine =
  | boolean
  | {
      label?: React.ReactNode
      color?: string
    }

type LineItemGraphHover =
  | {
      kind: "day"
      dayId: string
      x: number
      y: number
      viewportX: number
      viewportY: number
    }
  | {
      kind: "point"
      dayId: string
      seriesId: string
      x: number
      y: number
      viewportX: number
      viewportY: number
    }

type PlottedLineItemPoint = LineItemGraphPoint & {
  x: number
  y: number
  hidden: boolean
}

const toneColors: Record<LineItemGraphTone, string> = {
  cyan: "rgb(0 181 255)",
  tide: "var(--nextide-tide)",
  yellow: "var(--nextide-yellow)",
  red: "var(--nextide-red)",
  violet: "rgb(175 46 255)",
  neutral: "rgb(210 214 222)",
}

function LineItemGraph({
  title,
  rangeLabel,
  days,
  series,
  totalLine,
  axisLabelMode = "day",
  minValue,
  maxValue,
  activeSeriesIds,
  defaultActiveSeriesIds,
  onActiveSeriesIdsChange,
  valueFormatter = formatLineItemValue,
  tickFormatter = formatCompactLineItemValue,
  emptyLabel = "No line data available.",
  className,
  ...props
}: React.ComponentProps<"section"> & {
  title?: React.ReactNode
  rangeLabel?: React.ReactNode
  days: LineItemGraphDay[]
  series: LineItemGraphSeries[]
  totalLine?: LineItemGraphTotalLine
  axisLabelMode?: LineItemGraphAxisLabelMode
  minValue?: number
  maxValue?: number
  activeSeriesIds?: string[]
  defaultActiveSeriesIds?: string[]
  onActiveSeriesIdsChange?: (ids: string[]) => void
  valueFormatter?: (value: number) => React.ReactNode
  tickFormatter?: (value: number) => React.ReactNode
  emptyLabel?: React.ReactNode
}) {
  const rawId = React.useId()
  const clipId = `nextide-line-item-clip-${rawId.replace(/:/g, "")}`
  const selectableSeries = React.useMemo(
    () => series.filter((item) => !item.disabled),
    [series]
  )
  const fallbackActiveIds = React.useMemo(
    () =>
      defaultActiveSeriesIds?.length
        ? defaultActiveSeriesIds
        : selectableSeries.map((item) => item.id),
    [defaultActiveSeriesIds, selectableSeries]
  )
  const [uncontrolledActiveIds, setUncontrolledActiveIds] =
    React.useState(fallbackActiveIds)
  const [hover, setHover] = React.useState<LineItemGraphHover | null>(null)
  const [measuredChartWidth, setMeasuredChartWidth] = React.useState(0)
  const viewportRef = React.useRef<HTMLDivElement | null>(null)
  const chartRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const updateWidth = (width: number) => {
      const nextWidth = Math.max(1, Math.round(width))
      setMeasuredChartWidth((current) =>
        current === nextWidth ? current : nextWidth
      )
    }

    updateWidth(viewport.getBoundingClientRect().width)
    if (typeof ResizeObserver === "undefined") return

    const observer = new ResizeObserver(([entry]) => {
      if (entry) updateWidth(entry.contentRect.width)
    })
    observer.observe(viewport)

    return () => observer.disconnect()
  }, [])

  const availableIdSet = React.useMemo(
    () => new Set(selectableSeries.map((item) => item.id)),
    [selectableSeries]
  )
  const resolvedActiveIds = React.useMemo(() => {
    const retained = (activeSeriesIds ?? uncontrolledActiveIds).filter((id) =>
      availableIdSet.has(id)
    )

    return retained.length > 0 ? retained : fallbackActiveIds
  }, [
    activeSeriesIds,
    availableIdSet,
    fallbackActiveIds,
    uncontrolledActiveIds,
  ])
  const activeIdSet = React.useMemo(
    () => new Set(resolvedActiveIds),
    [resolvedActiveIds]
  )
  const activeSeries = React.useMemo(
    () => selectableSeries.filter((item) => activeIdSet.has(item.id)),
    [activeIdSet, selectableSeries]
  )
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
  const dayX = React.useMemo(
    () => resolveDayPositions(days, plotLeft, plotRight, step),
    [days, plotLeft, plotRight, step]
  )
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
  const resolvedMin =
    typeof minValue === "number" && Number.isFinite(minValue)
      ? minValue
      : Math.min(0, ...chartValues)
  const resolvedMax =
    typeof maxValue === "number" && Number.isFinite(maxValue)
      ? maxValue
      : getNiceChartMax(Math.max(...chartValues, 1))
  const range = Math.max(1, resolvedMax - resolvedMin)
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
  const hoveredDay = hover
    ? days.find((day) => day.id === hover.dayId)
    : undefined
  const hoveredSeries =
    hover?.kind === "point"
      ? seriesPlots.find((item) => item.id === hover.seriesId)
      : undefined

  const updateActiveIds = React.useCallback(
    (ids: string[]) => {
      if (activeSeriesIds === undefined) {
        setUncontrolledActiveIds(ids)
      }
      onActiveSeriesIdsChange?.(ids)
    },
    [activeSeriesIds, onActiveSeriesIdsChange]
  )

  const toggleSeries = React.useCallback(
    (id: string) => {
      const current = resolvedActiveIds.filter((activeId) =>
        selectableSeries.some((item) => item.id === activeId)
      )
      const next = current.includes(id)
        ? current.length > 1
          ? current.filter((activeId) => activeId !== id)
          : current
        : [...current, id]

      updateActiveIds(next)
    },
    [resolvedActiveIds, selectableSeries, updateActiveIds]
  )

  const showDayHover = React.useCallback(
    (dayId: string, x: number, y: number, viewportY?: number) => {
      const chartRect = chartRef.current?.getBoundingClientRect()
      setHover({
        kind: "day",
        dayId,
        x,
        y,
        viewportX: (chartRect?.left ?? 0) + x,
        viewportY: viewportY ?? (chartRect?.top ?? 0) + y,
      })
    },
    []
  )

  const showPointHover = React.useCallback(
    (
      dayId: string,
      seriesId: string,
      x: number,
      y: number,
      viewportY?: number
    ) => {
      const chartRect = chartRef.current?.getBoundingClientRect()
      setHover({
        kind: "point",
        dayId,
        seriesId,
        x,
        y,
        viewportX: (chartRect?.left ?? 0) + x,
        viewportY: viewportY ?? (chartRect?.top ?? 0) + y,
      })
    },
    []
  )

  if (days.length === 0 || selectableSeries.length === 0) {
    return (
      <section
        data-slot="line-item-graph"
        className={cn(
          "grid min-h-60 place-items-center rounded-lg border border-nextide-line bg-nextide-panel px-4 py-8 text-sm text-muted-foreground",
          className
        )}
        {...props}
      >
        {emptyLabel}
      </section>
    )
  }

  return (
    <section
      data-slot="line-item-graph"
      className={cn(
        "grid gap-4 rounded-lg border border-nextide-line bg-nextide-panel p-4",
        className
      )}
      {...props}
    >
      {(title || rangeLabel) && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          {title ? (
            <h3 className="text-sm leading-tight font-medium">{title}</h3>
          ) : null}
          {rangeLabel ? (
            <span className="text-xs leading-tight font-medium text-muted-foreground">
              {rangeLabel}
            </span>
          ) : null}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {selectableSeries.map((item) => {
          const color = resolveSeriesColor(item)
          const active = activeIdSet.has(item.id)

          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => toggleSeries(item.id)}
              className={cn(
                "inline-flex min-h-7 items-center rounded-md border px-3 text-ui-caption leading-none font-medium tracking-normal uppercase transition-[background-color,border-color,color,opacity] duration-[var(--nextide-motion-state)]",
                active
                  ? "bg-background/35 text-foreground"
                  : "border-nextide-line bg-transparent text-muted-foreground/60"
              )}
              style={
                active
                  ? {
                      borderColor: color,
                      boxShadow: `0 0 20px ${withAlpha(color, 0.18)}`,
                    }
                  : undefined
              }
            >
              {item.label}
            </button>
          )
        })}
      </div>

      <div
        ref={viewportRef}
        data-slot="line-item-graph-viewport"
        className="min-w-0 overflow-visible"
      >
        <div
          ref={chartRef}
          data-slot="line-item-graph-canvas"
          className="relative w-full min-w-0"
          style={{ height: chartHeight }}
          onMouseLeave={() => setHover(null)}
        >
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            role="img"
            aria-label={typeof title === "string" ? title : "Line item graph"}
            className="h-full w-full overflow-visible text-muted-foreground"
          >
            <defs>
              <clipPath id={clipId}>
                <rect
                  x={plotLeft}
                  y={plotTop - 12}
                  width={plotWidth}
                  height={plotHeight + 24}
                />
              </clipPath>
            </defs>
            {ticks.map((tick) => {
              const y = valueToY(
                tick,
                resolvedMin,
                range,
                plotBottom,
                plotHeight
              )

              return (
                <g key={tick}>
                  <line
                    x1={plotLeft}
                    x2={plotRight}
                    y1={y}
                    y2={y}
                    stroke="currentColor"
                    strokeOpacity="0.13"
                    strokeWidth="1"
                  />
                  <text
                    x={plotLeft - 12}
                    y={y + 3}
                    textAnchor="end"
                    className="fill-current text-ui-caption font-medium"
                  >
                    {tickFormatter(Math.max(tick, 0))}
                  </text>
                </g>
              )
            })}
            {visibleDays.map((day, index) => {
              const x = dayX.get(day.id) ?? plotLeft
              const zoneLeft =
                visibleDays.length === 1
                  ? plotLeft
                  : index === 0
                    ? plotLeft
                    : x - step / 2
              const zoneRight =
                visibleDays.length === 1
                  ? plotRight
                  : index === visibleDays.length - 1
                    ? plotRight
                    : x + step / 2

              return (
                <rect
                  key={day.id}
                  x={zoneLeft}
                  y={plotTop}
                  width={Math.max(1, zoneRight - zoneLeft)}
                  height={plotHeight}
                  fill="transparent"
                  onMouseEnter={(event) =>
                    showDayHover(day.id, x, plotTop + 12, event.clientY)
                  }
                  onMouseMove={(event) =>
                    showDayHover(day.id, x, plotTop + 12, event.clientY)
                  }
                />
              )
            })}
            {hover ? (
              <line
                data-slot="line-item-hover-guide"
                x1={hover.x}
                x2={hover.x}
                y1={plotTop}
                y2={plotBottom}
                stroke="var(--nextide-tide)"
                strokeDasharray="2 3"
                strokeOpacity="0.48"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
                pointerEvents="none"
              />
            ) : null}
            {totalPlot ? (
              <path
                d={buildSmoothPath(totalPlot.plottedPoints)}
                clipPath={`url(#${clipId})`}
                className="nextide-line-draw"
                fill="none"
                pathLength={1}
                stroke={totalPlot.color}
                strokeDasharray="0.02 0.025"
                strokeDashoffset="0"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.85"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
            {seriesPlots.map((item) => (
              <g key={item.id} clipPath={`url(#${clipId})`}>
                <path
                  d={buildSmoothPath(item.plottedPoints)}
                  className={item.active ? "nextide-line-draw" : undefined}
                  fill="none"
                  pathLength={1}
                  stroke={item.color}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity={item.active ? "0.28" : "0"}
                  strokeDasharray="1"
                  strokeDashoffset={item.active ? "0" : "1"}
                  strokeWidth="7"
                  vectorEffect="non-scaling-stroke"
                  style={{
                    transition:
                      "stroke-dashoffset var(--nextide-motion-layout) var(--nextide-ease-out-quart), opacity var(--nextide-motion-state) linear",
                  }}
                />
                <path
                  d={buildSmoothPath(item.plottedPoints)}
                  className={item.active ? "nextide-line-draw" : undefined}
                  fill="none"
                  pathLength={1}
                  stroke={item.color}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeOpacity={item.active ? "1" : "0"}
                  strokeDasharray="1"
                  strokeDashoffset={item.active ? "0" : "1"}
                  strokeWidth="2.25"
                  vectorEffect="non-scaling-stroke"
                  style={{
                    transition:
                      "stroke-dashoffset var(--nextide-motion-layout) var(--nextide-ease-out-quart), opacity var(--nextide-motion-state) linear",
                  }}
                />
              </g>
            ))}
            {interactivePoints.map(({ item, point }) => (
              <g
                key={`${item.id}-${point.dayId}`}
                role="button"
                tabIndex={0}
                aria-label={`${stringifyNode(item.label)} ${stringifyNode(
                  dayById.get(point.dayId)?.label
                )}: ${stringifyNode(point.valueLabel ?? valueFormatter(point.value))}`}
                className="cursor-pointer outline-none"
                onFocus={() =>
                  showPointHover(point.dayId, item.id, point.x, point.y)
                }
                onMouseEnter={(event) =>
                  showPointHover(
                    point.dayId,
                    item.id,
                    point.x,
                    point.y,
                    event.clientY
                  )
                }
                onMouseMove={(event) =>
                  showPointHover(
                    point.dayId,
                    item.id,
                    point.x,
                    point.y,
                    event.clientY
                  )
                }
              >
                <circle cx={point.x} cy={point.y} r="8" fill="transparent" />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="3"
                  fill="var(--background)"
                  stroke={item.color}
                  strokeWidth="1.75"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            ))}
            {visibleDays.map((day, index) => {
              if (!axisLabelIndices.has(index)) return null

              const x = dayX.get(day.id) ?? plotLeft
              const label = renderAxisLabel(day, axisLabelMode)
              const labelY = plotBottom + (shouldAngleLabels ? 32 : 25)
              const textAnchor = shouldAngleLabels
                ? "end"
                : index === 0
                  ? "start"
                  : index === visibleDays.length - 1
                    ? "end"
                    : "middle"

              return (
                <text
                  key={day.id}
                  data-slot="line-item-axis-label"
                  data-angled={shouldAngleLabels ? "true" : undefined}
                  x={x}
                  y={labelY}
                  textAnchor={textAnchor}
                  transform={
                    shouldAngleLabels ? `rotate(-42 ${x} ${labelY})` : undefined
                  }
                  className="fill-current text-ui-caption font-medium"
                >
                  {label}
                </text>
              )
            })}
          </svg>
          {hover && hoveredDay ? (
            <LineItemTooltip
              hover={hover}
              day={hoveredDay}
              series={seriesPlots}
              hoveredSeries={hoveredSeries}
              totalLabel={totalPlot?.label}
              totalValue={
                totalPlot?.plottedPoints.find(
                  (point) => point.dayId === hover.dayId
                )?.value
              }
              valueFormatter={valueFormatter}
              pointMaps={pointMaps}
            />
          ) : null}
        </div>
      </div>
    </section>
  )
}

function getAxisLabelIndices(count: number, stride: number) {
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

function LineItemTooltip({
  hover,
  day,
  series,
  hoveredSeries,
  totalLabel,
  totalValue,
  valueFormatter,
  pointMaps,
}: {
  hover: LineItemGraphHover
  day: LineItemGraphDay
  series: Array<
    LineItemGraphSeries & {
      color: string
      plottedPoints: PlottedLineItemPoint[]
    }
  >
  hoveredSeries?: LineItemGraphSeries & { color: string }
  totalLabel?: React.ReactNode
  totalValue?: number
  valueFormatter: (value: number) => React.ReactNode
  pointMaps: Map<string, Map<string, LineItemGraphPoint>>
}) {
  return (
    <GraphTooltip
      anchor={{ x: hover.viewportX, y: hover.viewportY }}
      data-chart="line-item"
    >
      <div className="grid gap-1">
        <span className="text-ui-caption font-medium text-muted-foreground">
          {day.weekday ? (
            <>
              {day.weekday} | {day.label}
            </>
          ) : (
            day.label
          )}
        </span>
        {hover.kind === "point" && hoveredSeries ? (
          <strong className="text-sm leading-tight text-foreground">
            {hoveredSeries.label}
          </strong>
        ) : (
          <strong className="text-sm leading-tight text-foreground">
            Day breakdown
          </strong>
        )}
      </div>
      <div className="mt-2 grid gap-1.5">
        {hover.kind === "point" && hoveredSeries ? (
          <GraphTooltipRow
            color={hoveredSeries.color}
            label={hoveredSeries.label}
            value={
              pointMaps.get(hoveredSeries.id)?.get(hover.dayId)?.valueLabel ??
              valueFormatter(
                pointMaps.get(hoveredSeries.id)?.get(hover.dayId)?.value ?? 0
              )
            }
          />
        ) : (
          series.map((item) => {
            const point = pointMaps.get(item.id)?.get(hover.dayId)

            return (
              <GraphTooltipRow
                key={item.id}
                color={item.color}
                label={item.label}
                value={point?.valueLabel ?? valueFormatter(point?.value ?? 0)}
              />
            )
          })
        )}
        {totalLabel && totalValue !== undefined ? (
          <GraphTooltipRow
            color="rgb(210 214 222)"
            label={totalLabel}
            value={valueFormatter(totalValue)}
            dashed
          />
        ) : null}
      </div>
    </GraphTooltip>
  )
}

function resolveDayPositions(
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

function valueToY(
  value: number,
  min: number,
  range: number,
  plotBottom: number,
  plotHeight: number
) {
  return plotBottom - ((value - min) / range) * plotHeight
}

function buildSmoothPath(points: PlottedLineItemPoint[]) {
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

function resolveSeriesColor(series: LineItemGraphSeries) {
  return series.color ?? toneColors[series.tone ?? "tide"]
}

function renderAxisLabel(
  day: LineItemGraphDay,
  axisLabelMode: LineItemGraphAxisLabelMode
) {
  if (axisLabelMode === "weekday-day" && day.weekday) {
    return `${stringifyNode(day.weekday)} | ${stringifyNode(day.label)}`
  }

  return stringifyNode(day.label)
}

function getNiceChartMax(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 1

  const exponent = Math.floor(Math.log10(value))
  const power = 10 ** exponent
  const fraction = value / power
  const niceFraction =
    fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10

  return niceFraction * power
}

function formatLineItemValue(value: number) {
  return value.toLocaleString("en-US")
}

const formatCompactLineItemValue = formatCompactNumber

function stringifyNode(value: React.ReactNode) {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : ""
}

function withAlpha(color: string, alpha: number) {
  if (!color.startsWith("rgb(")) return "rgb(30 228 188 / 0.18)"

  return color.replace("rgb(", "rgb(").replace(")", ` / ${alpha})`)
}

export {
  LineItemGraph,
  type LineItemGraphAxisLabelMode,
  type LineItemGraphDay,
  type LineItemGraphPoint,
  type LineItemGraphSeries,
  type LineItemGraphTone,
  type LineItemGraphTotalLine,
}
