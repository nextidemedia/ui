import * as React from "react"

import { useContainedScroll } from "@nextide/ui/hooks/use-contained-scroll"
import { cn } from "@nextide/ui/lib/utils"

type HourlyPacingTone = "low" | "nominal" | "high" | "critical"

type HourlyPacingBucket = {
  id?: string
  hour: number
  value: number
  valueLabel?: React.ReactNode
  detail?: React.ReactNode
  tone?: HourlyPacingTone
}

const toneClasses: Record<HourlyPacingTone, string> = {
  low: "from-nextide-tide/60 via-nextide-tide/45 to-nextide-tide/20",
  nominal: "from-nextide-tide via-nextide-tide/85 to-nextide-tide/35",
  high: "from-nextide-yellow via-nextide-yellow/80 to-nextide-yellow/30",
  critical: "from-nextide-red via-nextide-red/80 to-nextide-red/30",
}

function HourlyPacingChart({
  buckets,
  targetValue = 100,
  averageValue,
  maxValue,
  title = "24h pacing",
  description,
  activeHour,
  emptyLabel = "No pacing data available.",
  className,
  onActiveHourChange,
  ...props
}: React.ComponentProps<"div"> & {
  buckets: HourlyPacingBucket[]
  targetValue?: number
  averageValue?: number
  maxValue?: number
  title?: React.ReactNode
  description?: React.ReactNode
  activeHour?: number
  emptyLabel?: React.ReactNode
  onActiveHourChange?: (bucket: HourlyPacingBucket) => void
}) {
  const { ref: chartScrollRef, onWheel: onChartWheel } =
    useContainedScroll<HTMLDivElement>({ axis: "x" })
  const [internalActiveHour, setInternalActiveHour] = React.useState<
    number | null
  >(null)
  const normalizedBuckets = React.useMemo(
    () =>
      buckets
        .map((bucket) => ({
          ...bucket,
          hour: clamp(Math.round(bucket.hour), 0, 23),
          value: Math.max(0, Number(bucket.value) || 0),
        }))
        .sort((a, b) => a.hour - b.hour),
    [buckets]
  )
  const resolvedAverage =
    typeof averageValue === "number" && Number.isFinite(averageValue)
      ? Math.max(0, averageValue)
      : average(normalizedBuckets.map((bucket) => bucket.value))
  const peak = normalizedBuckets.reduce(
    (max, bucket) => Math.max(max, bucket.value),
    0
  )
  const low = normalizedBuckets.reduce(
    (min, bucket) => Math.min(min, bucket.value),
    normalizedBuckets.length > 0 ? normalizedBuckets[0].value : 0
  )
  const scaleMax =
    typeof maxValue === "number" && Number.isFinite(maxValue)
      ? Math.max(1, maxValue)
      : niceScaleMax(Math.max(peak * 1.12, targetValue * 1.28, 200))
  const resolvedActiveHour = activeHour ?? internalActiveHour
  const activeBucket =
    resolvedActiveHour === null || resolvedActiveHour === undefined
      ? null
      : normalizedBuckets.find((bucket) => bucket.hour === resolvedActiveHour)
  const ticks = buildTicks(scaleMax, targetValue)

  if (normalizedBuckets.length === 0 || scaleMax <= 0) {
    return (
      <div
        data-slot="hourly-pacing-chart"
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
      data-slot="hourly-pacing-chart"
      className={cn(
        "grid gap-3 rounded-lg border border-nextide-line bg-nextide-panel p-3",
        className
      )}
      {...props}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <strong className="text-sm">{title}</strong>
          {description ? (
            <span className="max-w-xl text-xs leading-snug text-muted-foreground">
              {description}
            </span>
          ) : null}
        </div>
        <div className="rounded-md border border-nextide-tide/35 bg-nextide-tide/10 px-2.5 py-1 text-xs font-medium text-nextide-tide">
          Avg {formatPercent(resolvedAverage)}
        </div>
      </div>

      <div
        ref={chartScrollRef}
        onWheel={onChartWheel}
        className="nextide-contained-scroll nextide-scrollbar-none overflow-x-auto"
      >
        <div className="grid min-w-[48rem] grid-cols-[3.6rem_minmax(0,1fr)] gap-3">
          <div className="relative h-80 text-ui-caption font-medium text-muted-foreground">
            <div className="absolute inset-x-0 top-0 bottom-7">
              {ticks.map((tick) => (
                <span
                  key={tick}
                  className="absolute right-0 translate-y-1/2 whitespace-nowrap"
                  style={{ bottom: `${percentOf(tick, scaleMax)}%` }}
                >
                  {formatPercent(tick)}
                </span>
              ))}
            </div>
          </div>
          <div className="relative h-80 rounded-md border-b border-l border-nextide-line bg-[linear-gradient(90deg,rgb(30_228_188/0.035),transparent_22%,transparent_74%,rgb(245_184_61/0.035)),linear-gradient(180deg,rgb(255_255_255/0.035),transparent_46%,rgb(0_0_0/0.16))]">
            <div className="absolute inset-x-0 top-0 bottom-7">
              {ticks.map((tick) => (
                <span
                  key={tick}
                  className="absolute inset-x-0 border-t border-dashed border-nextide-line/70"
                  style={{ bottom: `${percentOf(tick, scaleMax)}%` }}
                />
              ))}
              <span
                className="absolute inset-x-0 z-10 border-t border-dashed border-foreground/70 shadow-[0_0_18px_rgb(245_250_252/0.16)]"
                style={{ bottom: `${percentOf(targetValue, scaleMax)}%` }}
              />
              <div className="absolute inset-x-3 top-0 bottom-0 grid [grid-template-columns:repeat(24,minmax(0,1fr))] items-end gap-1.5">
                {normalizedBuckets.map((bucket) => {
                  const height = Math.max(2, percentOf(bucket.value, scaleMax))
                  const tone =
                    bucket.tone ?? toneForValue(bucket.value, targetValue)
                  const selected = activeBucket?.hour === bucket.hour

                  return (
                    <button
                      key={bucket.id ?? bucket.hour}
                      type="button"
                      className="group relative flex h-full min-w-0 cursor-pointer items-end justify-center rounded-sm px-0.5 focus-visible:outline-none"
                      aria-label={`${padHour(bucket.hour)}:00 pacing ${formatPercent(bucket.value)}`}
                      onClick={() => {
                        setInternalActiveHour(bucket.hour)
                        onActiveHourChange?.(bucket)
                      }}
                      onFocus={() => {
                        setInternalActiveHour(bucket.hour)
                        onActiveHourChange?.(bucket)
                      }}
                    >
                      <span
                        className={cn(
                          "relative block w-full max-w-7 rounded-t-[0.35rem] rounded-b-[0.16rem] bg-linear-to-b shadow-[0_10px_24px_rgb(30_228_188/0.18)] transition-[height,filter] duration-[var(--nextide-motion-layout)] ease-[var(--nextide-ease-out-quart)] group-hover:brightness-110 group-focus-visible:brightness-110 before:absolute before:inset-0 before:rounded-[inherit] before:bg-linear-to-b before:from-white/35 before:to-transparent before:opacity-45",
                          toneClasses[tone],
                          selected && "brightness-110"
                        )}
                        style={{ height: `${height}%` }}
                      />
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="absolute inset-x-3 bottom-2 grid [grid-template-columns:repeat(24,minmax(0,1fr))] gap-1.5">
              {normalizedBuckets.map((bucket) => (
                <span
                  key={bucket.id ?? bucket.hour}
                  className="text-center text-ui-caption leading-none font-medium text-muted-foreground"
                >
                  {padHour(bucket.hour)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-8 flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>
          Peak{" "}
          <strong className="text-foreground">{formatPercent(peak)}</strong>
        </span>
        <span className="text-muted-foreground/45">/</span>
        <span>
          Low <strong className="text-foreground">{formatPercent(low)}</strong>
        </span>
        {activeBucket ? (
          <>
            <span className="text-muted-foreground/45">/</span>
            <span className="rounded-md border border-nextide-line bg-background/30 px-2 py-1">
              <strong className="text-foreground">
                {padHour(activeBucket.hour)}:00
              </strong>{" "}
              {activeBucket.valueLabel ?? formatPercent(activeBucket.value)}
              {activeBucket.detail ? (
                <span className="text-muted-foreground">
                  {" "}
                  · {activeBucket.detail}
                </span>
              ) : null}
            </span>
          </>
        ) : (
          <>
            <span className="text-muted-foreground/45">/</span>
            <span className="rounded-md border border-nextide-line bg-background/30 px-2 py-1 text-muted-foreground/70">
              Select an hour for detail
            </span>
          </>
        )}
      </div>
    </div>
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function average(values: number[]) {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function niceScaleMax(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 200
  if (value <= 200) return 200
  if (value <= 400) return Math.ceil(value / 50) * 50
  return Math.ceil(value / 100) * 100
}

function buildTicks(scaleMax: number, targetValue: number) {
  const step = scaleMax <= 400 ? 50 : 100
  const ticks = new Set<number>([0, targetValue, scaleMax])
  for (let tick = step; tick < scaleMax; tick += step) {
    ticks.add(tick)
  }
  return Array.from(ticks).sort((a, b) => a - b)
}

function percentOf(value: number, max: number) {
  return clamp((Math.max(0, value) / Math.max(1, max)) * 100, 0, 100)
}

function toneForValue(value: number, targetValue: number): HourlyPacingTone {
  const ratio = targetValue > 0 ? value / targetValue : 1
  if (ratio >= 2.35) return "critical"
  if (ratio >= 1.45) return "high"
  if (ratio < 0.62) return "low"
  return "nominal"
}

function formatPercent(value: number) {
  return `${Math.round(value).toLocaleString("en-US")}%`
}

function padHour(hour: number) {
  return String(clamp(Math.round(hour), 0, 23)).padStart(2, "0")
}

export { HourlyPacingChart, type HourlyPacingBucket, type HourlyPacingTone }
