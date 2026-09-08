import * as React from "react"
import {
  valueToY,
  buildSmoothPath,
  stringifyNode,
} from "./line-item-graph-data.js"
import {
  type LineItemPlotProps,
  type LineItemValueTickProps,
  type LineItemAxisTickProps,
  type LineItemSeriesProps,
  type LineItemPointProps,
  type AxisLabelProps,
} from "./line-item-graph-types.js"

export function LineItemPlot(props: LineItemPlotProps) {
  const {
    chartWidth,
    chartHeight,
    title,
    clipId,
    plotTop,
    plotBottom,
    resolvedHover,
    totalPlot,
    seriesPlots,
    interactivePoints,
    dayById,
    valueFormatter,
    showPointHover,
    setHover,
  } = props
  return (
    <svg
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- SVG semantics require an explicit ARIA role; HTML replacement elements cannot contain these graphics.
      role="group"
      aria-label={typeof title === "string" ? title : "Line item graph"}
      className="h-full w-full overflow-visible text-muted-foreground"
    >
      <LineItemGrid {...props} />
      <LineItemDayZones {...props} />
      {resolvedHover ? (
        <line
          data-slot="line-item-hover-guide"
          x1={resolvedHover.x}
          x2={resolvedHover.x}
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
        <LineItemSeries key={item.id} item={item} clipId={clipId} />
      ))}
      {interactivePoints.map(({ item, point }) => (
        <LineItemPoint
          key={`${item.id}-${point.dayId}`}
          item={item}
          point={point}
          dayById={dayById}
          valueFormatter={valueFormatter}
          showPointHover={showPointHover}
          setHover={setHover}
        />
      ))}
      <LineItemXAxis {...props} />
    </svg>
  )
}

export function LineItemValueTick({
  tick,
  plotLeft,
  plotRight,
  y,
  tickFormatter,
}: LineItemValueTickProps): React.JSX.Element {
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
}

export function LineItemAxisTick({
  day,
  shouldAngleLabels,
  x,
  labelY,
  textAnchor,
  label,
}: LineItemAxisTickProps): React.JSX.Element | null {
  return (
    <text
      key={day.id}
      data-slot="line-item-axis-label"
      data-angled={shouldAngleLabels ? "true" : undefined}
      x={x}
      y={labelY}
      textAnchor={textAnchor}
      transform={shouldAngleLabels ? `rotate(-42 ${x} ${labelY})` : undefined}
      className="fill-current text-ui-caption font-medium"
    >
      {label}
    </text>
  )
}

export function LineItemSeries({
  item,
  clipId,
}: LineItemSeriesProps): React.JSX.Element {
  return (
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
  )
}

export function LineItemPoint({
  item,
  point,
  dayById,
  valueFormatter,
  showPointHover,
  setHover,
}: LineItemPointProps): React.JSX.Element {
  return (
    <g
      key={`${item.id}-${point.dayId}`}
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- SVG semantics require an explicit ARIA role; HTML replacement elements cannot contain these graphics.
      role="img"
      tabIndex={0}
      aria-label={`${stringifyNode(item.label)} ${stringifyNode(
        dayById.get(point.dayId)?.label
      )}: ${stringifyNode(point.valueLabel ?? valueFormatter(point.value))}`}
      className="cursor-pointer outline-none"
      onFocus={() => showPointHover(point.dayId, item.id, point.x, point.y)}
      onBlur={() => setHover(null)}
      onMouseEnter={(event) =>
        showPointHover(point.dayId, item.id, point.x, point.y, event.clientY)
      }
      onMouseMove={(event) =>
        showPointHover(point.dayId, item.id, point.x, point.y, event.clientY)
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
  )
}

export function AxisLabel({ day, axisLabelMode }: AxisLabelProps) {
  if (axisLabelMode === "weekday-day" && day.weekday) {
    return `${stringifyNode(day.weekday)} | ${stringifyNode(day.label)}`
  }

  return stringifyNode(day.label)
}

export function LineItemGrid({
  clipId,
  plotLeft,
  plotTop,
  plotWidth,
  plotHeight,
  ticks,
  resolvedMin,
  range,
  plotBottom,
  plotRight,
  tickFormatter,
}: Pick<
  LineItemPlotProps,
  | "clipId"
  | "plotLeft"
  | "plotTop"
  | "plotWidth"
  | "plotHeight"
  | "ticks"
  | "resolvedMin"
  | "range"
  | "plotBottom"
  | "plotRight"
  | "tickFormatter"
>) {
  return (
    <>
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
        const y = valueToY(tick, resolvedMin, range, plotBottom, plotHeight)

        return (
          <LineItemValueTick
            key={tick}
            tick={tick}
            plotLeft={plotLeft}
            plotRight={plotRight}
            y={y}
            tickFormatter={tickFormatter}
          />
        )
      })}
    </>
  )
}

export function LineItemDayZones({
  visibleDays,
  dayX,
  plotLeft,
  step,
  plotRight,
  plotTop,
  plotHeight,
  showDayHover,
}: Pick<
  LineItemPlotProps,
  | "visibleDays"
  | "dayX"
  | "plotLeft"
  | "step"
  | "plotRight"
  | "plotTop"
  | "plotHeight"
  | "showDayHover"
>) {
  return (
    <>
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
    </>
  )
}

export function LineItemXAxis({
  visibleDays,
  axisLabelIndices,
  dayX,
  plotLeft,
  axisLabelMode,
  plotBottom,
  shouldAngleLabels,
}: Pick<
  LineItemPlotProps,
  | "visibleDays"
  | "axisLabelIndices"
  | "dayX"
  | "plotLeft"
  | "axisLabelMode"
  | "plotBottom"
  | "shouldAngleLabels"
>) {
  return (
    <>
      {visibleDays.map((day, index) => {
        if (!axisLabelIndices.has(index)) return null

        const x = dayX.get(day.id) ?? plotLeft
        const label = <AxisLabel day={day} axisLabelMode={axisLabelMode} />
        const labelY = plotBottom + (shouldAngleLabels ? 32 : 25)
        const textAnchor = shouldAngleLabels ? "end" : "middle"

        return (
          <LineItemAxisTick
            key={day.id}
            day={day}
            shouldAngleLabels={shouldAngleLabels}
            x={x}
            labelY={labelY}
            textAnchor={textAnchor}
            label={label}
          />
        )
      })}
    </>
  )
}
