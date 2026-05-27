import * as React from "react"

import { cn } from "@nextide/ui/lib/utils"

type DonutChartTone = "success" | "processing" | "warning" | "danger" | "neutral"

type DonutChartSegment = {
  id: string
  label: React.ReactNode
  value: number
  valueLabel?: React.ReactNode
  tone?: DonutChartTone
}

const toneStroke: Record<DonutChartTone, string> = {
  success: "var(--nextide-tide)",
  processing: "var(--nextide-purple)",
  warning: "var(--nextide-yellow)",
  danger: "var(--nextide-red)",
  neutral: "color-mix(in srgb, var(--foreground) 42%, transparent)",
}

function DonutChart({
  segments,
  totalLabel,
  centerLabel = "Total",
  emptyLabel = "No distribution data available.",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  segments: DonutChartSegment[]
  totalLabel?: React.ReactNode
  centerLabel?: React.ReactNode
  emptyLabel?: React.ReactNode
}) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const total = segments.reduce(
    (sum, segment) => sum + Math.max(0, segment.value),
    0
  )
  const plottedSegments = React.useMemo(() => {
    if (total <= 0) return []

    return segments.reduce<{
      offset: number
      items: Array<{
        segment: DonutChartSegment
        length: number
        dashOffset: number
      }>
    }>(
      (result, segment) => {
        const length =
          (Math.max(0, segment.value) / total) * circumference
        return {
          offset: result.offset + length,
          items: [
            ...result.items,
            {
              segment,
              length,
              dashOffset: -result.offset,
            },
          ],
        }
      },
      { offset: 0, items: [] }
    ).items
  }, [circumference, segments, total])

  if (segments.length === 0 || total <= 0) {
    return (
      <div
        data-slot="donut-chart"
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

  return (
    <div
      data-slot="donut-chart"
      className={cn(
        "grid gap-4 rounded-lg border border-nextide-line bg-nextide-panel p-3 sm:grid-cols-[11rem_minmax(0,1fr)]",
        className
      )}
      {...props}
    >
      <div className="relative grid min-h-44 place-items-center">
        <svg
          viewBox="0 0 120 120"
          role="img"
          aria-label="Donut chart"
          className="size-44"
        >
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="color-mix(in srgb, var(--foreground) 10%, transparent)"
            strokeWidth="14"
          />
          {plottedSegments.map(({ segment, length, dashOffset }) => {
            return (
              <circle
                key={segment.id}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={toneStroke[segment.tone ?? "success"]}
                strokeDasharray={`${length} ${circumference}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                strokeWidth="14"
                transform="rotate(-90 60 60)"
              />
            )
          })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div className="grid gap-0.5">
            <strong className="text-2xl leading-none font-bold">
              {totalLabel ?? total}
            </strong>
            <span className="text-xs font-medium text-muted-foreground">
              {centerLabel}
            </span>
          </div>
        </div>
      </div>
      <div className="grid content-center gap-2">
        {segments.map((segment) => (
          <div
            key={segment.id}
            className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-nextide-line bg-background/20 p-2 text-sm"
          >
            <span
              className="size-2.5 rounded-full shadow-[0_0_14px_currentColor]"
              style={{ color: toneStroke[segment.tone ?? "success"] }}
            />
            <span className="min-w-0 truncate text-muted-foreground">
              {segment.label}
            </span>
            <strong className="truncate text-right font-bold">
              {segment.valueLabel ?? segment.value}
            </strong>
          </div>
        ))}
      </div>
    </div>
  )
}

export { DonutChart, type DonutChartSegment, type DonutChartTone }
