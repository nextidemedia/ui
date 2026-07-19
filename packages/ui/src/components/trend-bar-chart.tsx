import * as React from "react"

import { useContainedScroll } from "@nextide/ui/hooks/use-contained-scroll"
import { formatCompactNumber } from "@nextide/ui/lib/format-number"
import { cn } from "@nextide/ui/lib/utils"

type TrendBarChartTone = "neutral" | "success" | "warning" | "danger"
type TrendBarChartVariant = "rail" | "block" | "signal"

type TrendBarChartRow = {
  id: string
  label: React.ReactNode
  value: number
  valueLabel?: React.ReactNode
  meta?: React.ReactNode
  tone?: TrendBarChartTone
}

type TrendBarChartLegendItem = {
  id: string
  label: React.ReactNode
  value: React.ReactNode
  tone?: TrendBarChartTone
}

const toneClasses: Record<TrendBarChartTone, string> = {
  neutral:
    "from-muted-foreground/55 via-muted-foreground/35 to-muted-foreground/20",
  success: "from-nextide-tide via-nextide-tide/85 to-nextide-tide/35",
  warning: "from-nextide-yellow via-nextide-yellow/80 to-nextide-yellow/30",
  danger: "from-nextide-red via-nextide-red/80 to-nextide-red/30",
}

function TrendBarChart({
  rows,
  maxValue,
  variant = "rail",
  emptyLabel = "No trend data available.",
  legend,
  showLegend = true,
  valueFormatter,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  rows: TrendBarChartRow[]
  maxValue?: number
  variant?: TrendBarChartVariant
  emptyLabel?: React.ReactNode
  legend?: TrendBarChartLegendItem[]
  showLegend?: boolean
  valueFormatter?: (value: number) => React.ReactNode
}) {
  const { ref: chartScrollRef, onWheel: onChartWheel } =
    useContainedScroll<HTMLDivElement>({ axis: "x" })
  const resolvedMax = React.useMemo(() => {
    if (typeof maxValue === "number" && Number.isFinite(maxValue)) {
      return Math.max(maxValue, 0)
    }

    return rows.reduce((max, row) => Math.max(max, row.value), 0)
  }, [maxValue, rows])
  const formatValue = valueFormatter ?? formatChartValue
  const total = rows.reduce((sum, row) => sum + row.value, 0)
  const average = rows.length > 0 ? total / rows.length : 0
  const peakRow = rows.reduce<TrendBarChartRow | null>(
    (peak, row) => (!peak || row.value > peak.value ? row : peak),
    null
  )
  const resolvedLegend = legend ?? [
    {
      id: "peak",
      label: "Peak",
      value: peakRow ? (
        <>
          {peakRow.label} {peakRow.valueLabel ?? formatValue(peakRow.value)}
        </>
      ) : (
        "-"
      ),
      tone: peakRow?.tone ?? "success",
    },
    {
      id: "avg",
      label: "Average",
      value: formatValue(average),
      tone: "neutral" as const,
    },
    {
      id: "count",
      label: "Buckets",
      value: rows.length.toLocaleString("en-US"),
      tone: "neutral" as const,
    },
  ]

  if (rows.length === 0 || resolvedMax <= 0) {
    return (
      <div
        data-slot="trend-bar-chart"
        className={cn(
          "grid min-h-44 place-items-center rounded-lg border border-nextide-line bg-nextide-panel px-4 py-8 text-sm text-muted-foreground",
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
      data-slot="trend-bar-chart"
      className={cn(
        "grid gap-3 rounded-lg border border-nextide-line bg-nextide-panel p-3",
        className
      )}
      {...props}
    >
      <div
        ref={chartScrollRef}
        onWheel={onChartWheel}
        className="nextide-contained-scroll nextide-scrollbar-none overflow-x-auto"
      >
        <div
          className={cn(
            "flex min-w-full items-end justify-between gap-2",
            variant === "signal" && "gap-3",
            variant === "block" && "gap-1.5"
          )}
        >
          {rows.map((row) => {
            const height = Math.max(
              4,
              Math.min(84, (row.value / resolvedMax) * 84)
            )
            const tone = row.tone ?? "success"

            return (
              <div
                key={row.id}
                className="group grid min-w-0 flex-1 justify-items-center gap-2"
                aria-label={
                  typeof row.label === "string"
                    ? `${row.label}: ${row.valueLabel ?? row.value}`
                    : undefined
                }
              >
                <BarGlyph
                  height={height}
                  tone={tone}
                  variant={variant}
                  valueLabel={row.valueLabel ?? row.value}
                />
                <div className="grid gap-0.5 text-center">
                  <span className="text-ui-caption leading-tight font-medium text-muted-foreground">
                    {row.label}
                  </span>
                  {row.meta ? (
                    <span className="text-ui-caption leading-none text-muted-foreground/70">
                      {row.meta}
                    </span>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {showLegend ? <ChartLegend items={resolvedLegend} /> : null}
    </div>
  )
}

function BarGlyph({
  height,
  tone,
  variant,
  valueLabel,
}: {
  height: number
  tone: TrendBarChartTone
  variant: TrendBarChartVariant
  valueLabel: React.ReactNode
}) {
  if (variant === "block") {
    return (
      <div className="relative flex h-36 w-full max-w-12 min-w-8 items-end border-b border-nextide-line/70 px-1">
        <span
          className={cn(
            "relative block w-full rounded-t-md bg-linear-to-b transition-[height,filter] duration-[var(--nextide-motion-layout)] ease-[var(--nextide-ease-out-quart)] group-hover:brightness-110 group-hover:filter before:absolute before:inset-x-1 before:top-1 before:h-px before:bg-white/30",
            toneClasses[tone]
          )}
          style={{ height: `${height}%` }}
        >
          <BarValue height={height} value={valueLabel} inside={height >= 44} />
        </span>
      </div>
    )
  }

  if (variant === "signal") {
    return (
      <div className="relative flex h-36 w-full max-w-10 min-w-0 items-end justify-center border-b border-nextide-line/70">
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-nextide-line/80" />
        <span className="absolute inset-y-0 left-1/2 w-1.5 -translate-x-1/2 overflow-visible">
          <span
            className={cn(
              "absolute inset-x-0 bottom-0 rounded-t-sm bg-linear-to-b opacity-85 transition-[height,filter] duration-[var(--nextide-motion-layout)] ease-[var(--nextide-ease-out-quart)] group-hover:brightness-110 group-hover:filter",
              toneClasses[tone]
            )}
            style={{ height: `${Math.max(8, height)}%` }}
          >
            <span className="absolute top-0 left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-background bg-nextide-tide shadow-[0_0_14px_rgb(30_228_188/0.38)] transition-transform duration-[var(--nextide-motion-layout)] ease-[var(--nextide-ease-out-quart)] group-hover:scale-110" />
            <BarValue height={height} value={valueLabel} />
          </span>
        </span>
      </div>
    )
  }

  return (
    <div className="relative flex h-36 w-full max-w-10 min-w-7 items-end justify-center border-b border-nextide-line/70 px-2">
      <span
        className={cn(
          "relative block w-full max-w-3 rounded-t-md bg-linear-to-b shadow-[0_0_20px_rgb(30_228_188/0.18)] transition-[height,filter] duration-[var(--nextide-motion-layout)] ease-[var(--nextide-ease-out-quart)] group-hover:brightness-110 group-hover:filter",
          toneClasses[tone]
        )}
        style={{ height: `${height}%` }}
      >
        <BarValue height={height} value={valueLabel} />
      </span>
    </div>
  )
}

function BarValue({
  height,
  value,
  inside = false,
}: {
  height: number
  value: React.ReactNode
  inside?: boolean
}) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-ui-caption leading-none font-medium",
        inside ? "top-2 text-black/80" : "-top-5 text-foreground"
      )}
      data-height={Math.round(height)}
    >
      {value}
    </span>
  )
}

function ChartLegend({ items }: { items: TrendBarChartLegendItem[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-t border-nextide-line/70 pt-2 text-ui-caption leading-none text-muted-foreground">
      {items.map((item) => (
        <span
          key={item.id}
          className="inline-flex min-h-6 items-center gap-1.5 rounded-md border border-nextide-line bg-background/25 px-2"
        >
          <span
            className={cn(
              "size-1.5 rounded-full bg-linear-to-b",
              toneClasses[item.tone ?? "neutral"]
            )}
          />
          <span>{item.label}</span>
          <strong className="font-medium text-foreground">{item.value}</strong>
        </span>
      ))}
    </div>
  )
}

const formatChartValue = formatCompactNumber

export {
  TrendBarChart,
  type TrendBarChartLegendItem,
  type TrendBarChartRow,
  type TrendBarChartTone,
  type TrendBarChartVariant,
}
