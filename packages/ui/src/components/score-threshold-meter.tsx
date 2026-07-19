import * as React from "react"

import { cn } from "@nextide/ui/lib/utils"

function ScoreThresholdMeter({
  score,
  threshold,
  title = "Score vs threshold",
  scoreLabel = "Incident",
  thresholdLabel = "Threshold",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  score: number
  threshold: number
  title?: React.ReactNode
  scoreLabel?: React.ReactNode
  thresholdLabel?: React.ReactNode
}) {
  const scorePosition = clampPercent(score)
  const thresholdPosition = clampPercent(threshold)
  const blocked = score >= threshold

  return (
    <div
      data-slot="score-threshold-meter"
      className={cn(
        "grid gap-3 rounded-lg border border-nextide-line bg-nextide-panel p-3",
        className
      )}
      style={
        {
          "--score-pos": `${scorePosition}%`,
          "--threshold-pos": `${thresholdPosition}%`,
        } as React.CSSProperties
      }
      {...props}
    >
      <div className="flex items-center justify-between gap-3">
        <strong className="text-sm leading-tight">{title}</strong>
        <span
          className={cn(
            "rounded-md border px-2 py-0.5 text-xs font-medium",
            blocked
              ? "border-nextide-red/40 bg-nextide-red/10 text-nextide-red"
              : "border-nextide-tide/40 bg-nextide-tide/10 text-nextide-tide"
          )}
        >
          {blocked ? "Blocked" : "Under"}
        </span>
      </div>
      <div className="grid grid-cols-[2rem_minmax(0,1fr)_2rem] items-center gap-2">
        <span className="text-center text-ui-caption text-muted-foreground">
          0.00
        </span>
        <div className="relative h-12">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,var(--nextide-tide)_0%,color-mix(in_srgb,var(--nextide-tide)_78%,var(--nextide-yellow))_var(--threshold-pos),var(--nextide-red)_var(--threshold-pos),color-mix(in_srgb,var(--nextide-red)_42%,transparent)_100%)]"
          />
          <MeterMarker
            label={thresholdLabel}
            value={threshold}
            className="left-[var(--threshold-pos)] border-black bg-white text-black"
          />
          <MeterMarker
            label={scoreLabel}
            value={score}
            className={cn(
              "left-[var(--score-pos)] text-black",
              blocked ? "bg-nextide-red" : "bg-nextide-tide"
            )}
          />
        </div>
        <span className="text-center text-ui-caption text-muted-foreground">
          1.00
        </span>
      </div>
    </div>
  )
}

function MeterMarker({
  label,
  value,
  className,
}: {
  label: React.ReactNode
  value: number
  className?: string
}) {
  return (
    <span
      className={cn(
        "absolute top-1/2 grid size-4 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-black shadow-[0_0_18px_rgb(0_0_0/0.28)]",
        className
      )}
    >
      <span className="absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 rounded-md border border-nextide-line bg-background px-1.5 py-0.5 text-ui-caption font-medium whitespace-nowrap text-foreground shadow-sm sm:block">
        {label} {value.toFixed(2)}
      </span>
    </span>
  )
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.max(0, Math.min(100, value * 100))
}

export { ScoreThresholdMeter }
