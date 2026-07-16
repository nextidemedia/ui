import * as React from "react"

import {
  GraphTooltip,
  GraphTooltipRow,
} from "@nextide/ui/components/graph-tooltip"
import { formatCompactNumber } from "@nextide/ui/lib/format-number"
import { cn } from "@nextide/ui/lib/utils"

type SignalRidgeChartPoint = {
  id: string
  label: React.ReactNode
  value: number
  valueLabel?: React.ReactNode
}

function SignalRidgeChart({
  points,
  valueFormatter = formatCompactNumber,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  points: SignalRidgeChartPoint[]
  valueFormatter?: (value: number) => React.ReactNode
}) {
  const svgRef = React.useRef<SVGSVGElement | null>(null)
  const [hover, setHover] = React.useState<{
    pointId: string
    viewportX: number
    viewportY: number
  } | null>(null)
  const rawId = React.useId().replace(/:/g, "")
  const gradientId = `nextide-ridge-${rawId}`

  if (points.length === 0) {
    return (
      <div
        data-slot="signal-ridge-chart"
        className={cn(
          "grid min-h-48 place-items-center text-sm text-muted-foreground",
          className
        )}
        {...props}
      >
        No trend data available.
      </div>
    )
  }

  const values = points.map((point) => point.value)
  const minimum = Math.min(...values, 0)
  const maximum = Math.max(...values, 1)
  const positions = plotPoints(points, minimum, Math.max(1, maximum - minimum))
  const line = smoothPath(positions)
  const area = `${line} L ${positions.at(-1)?.x ?? 0} 152 L ${
    positions[0]?.x ?? 0
  } 152 Z`
  const hoveredIndex = hover
    ? points.findIndex((point) => point.id === hover.pointId)
    : -1
  const hoveredPoint = hoveredIndex >= 0 ? points[hoveredIndex] : undefined
  const hoveredPosition =
    hoveredIndex >= 0 ? positions[hoveredIndex] : undefined

  const showPointTooltip = (
    point: SignalRidgeChartPoint,
    position: { x: number; y: number },
    viewportY?: number
  ) => {
    const rect = svgRef.current?.getBoundingClientRect()
    setHover({
      pointId: point.id,
      viewportX: (rect?.left ?? 0) + (position.x / 600) * (rect?.width ?? 600),
      viewportY:
        viewportY ??
        (rect?.top ?? 0) + (position.y / 190) * (rect?.height ?? 190),
    })
  }

  return (
    <div
      data-slot="signal-ridge-chart"
      className={cn("relative min-w-0", className)}
      {...props}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 600 190"
        role="img"
        aria-label="Signal ridge trend"
        className="h-auto min-h-48 w-full overflow-visible"
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0"
              stopColor="var(--nextide-tide)"
              stopOpacity="0.32"
            />
            <stop
              offset="0.72"
              stopColor="var(--nextide-tide)"
              stopOpacity="0.04"
            />
            <stop offset="1" stopColor="var(--nextide-tide)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[52, 102, 152].map((y) => (
          <line
            key={y}
            x1="28"
            x2="572"
            y1={y}
            y2={y}
            stroke="currentColor"
            strokeOpacity="0.1"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path d={area} fill={`url(#${gradientId})`} />
        <path
          d={line}
          className="nextide-line-draw"
          fill="none"
          pathLength="1"
          stroke="var(--nextide-tide)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
        />
        {hoveredPosition ? (
          <line
            x1={hoveredPosition.x}
            x2={hoveredPosition.x}
            y1="40"
            y2="152"
            stroke="var(--nextide-tide)"
            strokeDasharray="2 3"
            strokeOpacity="0.42"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            pointerEvents="none"
          />
        ) : null}
        {positions.map((position, index) => (
          <g
            key={points[index].id}
            role="button"
            tabIndex={0}
            aria-label={`${stringifyNode(points[index].label)}: ${stringifyNode(
              points[index].valueLabel ?? valueFormatter(points[index].value)
            )}`}
            className="cursor-pointer outline-none"
            onFocus={() => showPointTooltip(points[index], position)}
            onBlur={() => setHover(null)}
            onMouseEnter={(event) =>
              showPointTooltip(points[index], position, event.clientY)
            }
            onMouseMove={(event) =>
              showPointTooltip(points[index], position, event.clientY)
            }
          >
            <circle cx={position.x} cy={position.y} r="16" fill="transparent" />
            <circle
              cx={position.x}
              cy={position.y}
              r="4"
              fill="var(--background)"
              stroke="var(--nextide-tide)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            <text
              x={position.x}
              y={Math.max(16, position.y - 12)}
              textAnchor="middle"
              className="fill-foreground text-xs font-medium"
            >
              {stringifyNode(
                points[index].valueLabel ?? valueFormatter(points[index].value)
              )}
            </text>
            <text
              x={position.x}
              y="178"
              textAnchor="middle"
              className="fill-muted-foreground text-ui-caption font-medium"
            >
              {stringifyNode(points[index].label)}
            </text>
          </g>
        ))}
      </svg>
      {hover && hoveredPoint ? (
        <GraphTooltip
          anchor={{ x: hover.viewportX, y: hover.viewportY }}
          data-chart="signal-ridge"
        >
          <div className="grid gap-1">
            <span className="text-ui-caption font-medium text-muted-foreground">
              Signal ridge
            </span>
            <strong className="text-sm leading-tight text-foreground">
              {hoveredPoint.label}
            </strong>
          </div>
          <div className="mt-2 grid gap-1.5">
            <GraphTooltipRow
              color="var(--nextide-tide)"
              label={hoveredPoint.label}
              value={
                hoveredPoint.valueLabel ?? valueFormatter(hoveredPoint.value)
              }
            />
          </div>
        </GraphTooltip>
      ) : null}
      <span className="sr-only">
        {points
          .map(
            (point) =>
              `${stringifyNode(point.label)}: ${stringifyNode(
                point.valueLabel ?? valueFormatter(point.value)
              )}`
          )
          .join(", ")}
      </span>
    </div>
  )
}

function plotPoints(
  points: SignalRidgeChartPoint[],
  minimum: number,
  range: number
) {
  const width = 544
  const step = points.length > 1 ? width / (points.length - 1) : 0

  return points.map((point, index) => ({
    x: 28 + index * step,
    y: 152 - ((point.value - minimum) / range) * 112,
  }))
}

function smoothPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return ""
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  return points.slice(1).reduce((path, point, index) => {
    const previous = points[index]
    const midpoint = (previous.x + point.x) / 2
    return `${path} C ${midpoint} ${previous.y}, ${midpoint} ${point.y}, ${point.x} ${point.y}`
  }, `M ${points[0].x} ${points[0].y}`)
}

function stringifyNode(value: React.ReactNode) {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : ""
}

export { SignalRidgeChart, type SignalRidgeChartPoint }
