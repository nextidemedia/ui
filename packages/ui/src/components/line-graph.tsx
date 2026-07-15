import * as React from "react"

import { cn } from "@nextide/ui/lib/utils"

type LineGraphPoint = {
  id: string
  label: React.ReactNode
  value: number
  valueLabel?: React.ReactNode
  meta?: React.ReactNode
}

function LineGraph({
  points,
  minValue,
  maxValue,
  emptyLabel = "No line data available.",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  points: LineGraphPoint[]
  minValue?: number
  maxValue?: number
  emptyLabel?: React.ReactNode
}) {
  const rawId = React.useId()
  const gradientId = `nextide-line-${rawId.replace(/:/g, "")}`
  const resolvedMin = React.useMemo(() => {
    if (typeof minValue === "number" && Number.isFinite(minValue)) {
      return minValue
    }

    return points.reduce((min, point) => Math.min(min, point.value), Infinity)
  }, [minValue, points])
  const resolvedMax = React.useMemo(() => {
    if (typeof maxValue === "number" && Number.isFinite(maxValue)) {
      return maxValue
    }

    return points.reduce((max, point) => Math.max(max, point.value), -Infinity)
  }, [maxValue, points])

  if (
    points.length === 0 ||
    !Number.isFinite(resolvedMin) ||
    !Number.isFinite(resolvedMax)
  ) {
    return (
      <div
        data-slot="line-graph"
        className={cn(
          "grid min-h-52 place-items-center rounded-lg border border-nextide-line bg-nextide-panel px-4 py-8 text-sm text-muted-foreground",
          className
        )}
        {...props}
      >
        {emptyLabel}
      </div>
    )
  }

  const range = Math.max(1, resolvedMax - resolvedMin)
  const chartTop = 8
  const chartBottom = 62
  const chartHeight = chartBottom - chartTop
  const plottedPoints = points.map((point, index) => {
    const x = points.length === 1 ? 50 : 8 + (index / (points.length - 1)) * 84
    const progress = (point.value - resolvedMin) / range
    const y = chartBottom - progress * chartHeight
    return { ...point, x, y }
  })
  const path = plottedPoints
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ")
  const areaPath = `${path} L ${
    plottedPoints[plottedPoints.length - 1]?.x ?? 92
  } ${chartBottom} L ${plottedPoints[0]?.x ?? 8} ${chartBottom} Z`
  const lastPoint = plottedPoints[plottedPoints.length - 1]

  return (
    <div
      data-slot="line-graph"
      className={cn(
        "grid gap-3 rounded-lg border border-nextide-line bg-nextide-panel p-3",
        className
      )}
      {...props}
    >
      <div className="relative min-h-52">
        <svg
          viewBox="0 0 100 82"
          role="img"
          aria-label="Line graph"
          className="h-full min-h-52 w-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop
                offset="0%"
                stopColor="var(--nextide-tide)"
                stopOpacity="0.3"
              />
              <stop
                offset="100%"
                stopColor="var(--nextide-tide)"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>
          {[16, 34, 52].map((y) => (
            <line
              key={y}
              x1="5"
              x2="95"
              y1={y}
              y2={y}
              stroke="currentColor"
              strokeOpacity="0.1"
              strokeWidth="0.5"
            />
          ))}
          <path d={areaPath} fill={`url(#${gradientId})`} />
          <path
            d={path}
            fill="none"
            stroke="var(--nextide-tide)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.2"
            vectorEffect="non-scaling-stroke"
          />
          {plottedPoints.map((point) => (
            <circle
              key={point.id}
              cx={point.x}
              cy={point.y}
              r={point.id === lastPoint?.id ? 2.7 : 2.1}
              fill="var(--background)"
              stroke="var(--nextide-tide)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      </div>
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,4.25rem),1fr))] gap-2">
        {points.map((point) => (
          <div key={point.id} className="grid min-w-0 gap-0.5">
            <span className="truncate text-ui-caption leading-tight font-medium text-muted-foreground">
              {point.label}
            </span>
            <strong className="truncate text-sm font-medium">
              {point.valueLabel ?? point.value}
            </strong>
            {point.meta ? (
              <span className="truncate text-ui-caption leading-tight text-muted-foreground/70">
                {point.meta}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

export { LineGraph, type LineGraphPoint }
