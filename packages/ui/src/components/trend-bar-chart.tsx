import * as React from "react"

import { useContainedScroll } from "@nextide/ui/hooks/use-contained-scroll"
import { cn } from "@nextide/ui/lib/utils"

type TrendBarChartTone = "neutral" | "success" | "warning" | "danger"
type TrendBarChartVariant = "rail" | "block" | "signal" | "capsule"

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
              Math.min(100, (row.value / resolvedMax) * 100)
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
                <div className="pointer-events-none h-5 text-center text-[0.68rem] leading-none font-medium text-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  {row.valueLabel ?? row.value}
                </div>
                <BarGlyph height={height} tone={tone} variant={variant} />
                <div className="grid gap-0.5 text-center">
                  <span className="text-[0.68rem] leading-tight font-medium text-muted-foreground">
                    {row.label}
                  </span>
                  {row.meta ? (
                    <span className="text-[0.62rem] leading-none text-muted-foreground/70">
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
}: {
  height: number
  tone: TrendBarChartTone
  variant: TrendBarChartVariant
}) {
  if (variant === "block") {
    return (
      <div className="flex h-32 w-full max-w-11 min-w-7 items-end rounded-md bg-white/[0.025] p-1 shadow-[inset_0_1px_1px_rgb(255_255_255/0.03)]">
        <span
          className={cn(
            "relative block w-full rounded-[0.35rem] bg-linear-to-b transition-[height,filter] duration-500 ease-[var(--nextide-ease-out-quart)] group-hover:brightness-110 group-hover:filter before:absolute before:inset-x-1 before:top-1 before:h-px before:bg-white/30",
            toneClasses[tone]
          )}
          style={{ height: `${height}%` }}
        />
      </div>
    )
  }

  if (variant === "signal") {
    return (
      <div className="relative flex h-32 w-full max-w-10 min-w-0 items-end justify-center overflow-visible">
        <span className="absolute inset-y-2 left-1/2 w-px -translate-x-1/2 bg-nextide-line" />
        <span className="absolute inset-y-2 left-1/2 w-1 -translate-x-1/2 overflow-visible">
          <span
            className={cn(
              "absolute inset-x-0 bottom-0 rounded-full bg-linear-to-b opacity-75 transition-[height,filter] duration-500 ease-[var(--nextide-ease-out-quart)] group-hover:brightness-110 group-hover:filter",
              toneClasses[tone]
            )}
            style={{ height: `${Math.max(8, height)}%` }}
          >
            <span className="absolute top-0 left-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-nextide-tide shadow-[0_0_18px_rgb(30_228_188/0.42)] transition-transform duration-300 ease-[var(--nextide-ease-out-quart)] group-hover:scale-110" />
          </span>
        </span>
      </div>
    )
  }

  if (variant === "capsule") {
    return (
      <div className="flex h-36 w-full max-w-8 items-end rounded-full bg-white/[0.025] p-1 shadow-[inset_0_1px_1px_rgb(255_255_255/0.03)]">
        <span
          className={cn(
            "block w-full rounded-full bg-linear-to-b shadow-[0_0_18px_rgb(30_228_188/0.16)] transition-[height,filter] duration-500 ease-[var(--nextide-ease-out-quart)] group-hover:brightness-110 group-hover:filter",
            toneClasses[tone]
          )}
          style={{ height: `${height}%` }}
        />
      </div>
    )
  }

  return (
    <div className="flex h-32 w-full max-w-9 min-w-7 items-end justify-center px-2">
      <span
        className={cn(
          "block w-full max-w-3 rounded-full bg-linear-to-b shadow-[0_0_20px_rgb(30_228_188/0.18)] transition-[height,filter] duration-500 ease-[var(--nextide-ease-out-quart)] group-hover:brightness-110 group-hover:filter",
          toneClasses[tone]
        )}
        style={{ height: `${height}%` }}
      />
    </div>
  )
}

function ChartLegend({ items }: { items: TrendBarChartLegendItem[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-t border-nextide-line/70 pt-2 text-[0.68rem] leading-none text-muted-foreground">
      {items.map((item) => (
        <span
          key={item.id}
          className="inline-flex min-h-6 items-center gap-1.5 rounded-full border border-nextide-line bg-background/25 px-2"
        >
          <span
            className={cn(
              "size-1.5 rounded-full bg-linear-to-b",
              toneClasses[item.tone ?? "neutral"]
            )}
          />
          <span>{item.label}</span>
          <strong className="font-semibold text-foreground">
            {item.value}
          </strong>
        </span>
      ))}
    </div>
  )
}

function formatChartValue(value: number) {
  return Number.isInteger(value)
    ? value.toLocaleString("en-US")
    : value.toLocaleString("en-US", { maximumFractionDigits: 1 })
}

export {
  TrendBarChart,
  type TrendBarChartLegendItem,
  type TrendBarChartRow,
  type TrendBarChartTone,
  type TrendBarChartVariant,
}
