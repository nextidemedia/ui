import * as React from "react"

import { cn } from "@nextide/ui/lib/utils"

type ScoreRingTone = "success" | "processing" | "warning" | "danger" | "neutral"

const toneClasses: Record<ScoreRingTone, string> = {
  success: "[--score-ring-color:var(--nextide-tide)]",
  processing: "[--score-ring-color:var(--nextide-purple)]",
  warning: "[--score-ring-color:var(--nextide-yellow)]",
  danger: "[--score-ring-color:var(--nextide-red)]",
  neutral: "[--score-ring-color:var(--muted-foreground)]",
}

function ScoreRing({
  value,
  min = 0,
  max = 100,
  label,
  valueLabel,
  tone = "success",
  size = "default",
  className,
  style,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-valuetext": ariaValueText,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  value?: number
  min?: number
  max?: number
  label: string
  valueLabel?: React.ReactNode
  tone?: ScoreRingTone
  size?: "sm" | "default" | "lg"
}) {
  const hasValidRange =
    Number.isFinite(min) && Number.isFinite(max) && max > min
  const hasValue =
    typeof value === "number" && Number.isFinite(value) && hasValidRange
  const normalizedValue = hasValue ? clamp(value, min, max) : undefined
  const progress =
    normalizedValue === undefined
      ? 0
      : ((normalizedValue - min) / (max - min)) * 100
  const fallbackValueLabel = formatValue(normalizedValue)
  const accessibleValue =
    normalizedValue === undefined ? "Unavailable" : fallbackValueLabel
  const meterMin = hasValidRange ? min : 0
  const meterMax = hasValidRange ? max : 1

  return (
    <span
      {...props}
      data-slot="score-ring"
      data-size={size}
      className={cn(
        "group/score-ring relative inline-grid size-16 shrink-0 place-items-center rounded-full bg-[conic-gradient(var(--score-ring-color)_var(--score-ring-progress),color-mix(in_srgb,var(--border)_78%,transparent)_0)] shadow-[0_0_20px_color-mix(in_srgb,var(--score-ring-color)_18%,transparent)] before:absolute before:inset-[5px] before:rounded-full before:bg-background before:bg-[radial-gradient(circle_at_50%_12%,rgb(255_255_255/0.08),transparent_58%)] before:content-[''] data-[size=lg]:size-20 data-[size=sm]:size-12 data-[size=sm]:before:inset-1",
        toneClasses[tone],
        className
      )}
      style={
        {
          ...style,
          "--score-ring-progress": `${progress}%`,
        } as React.CSSProperties
      }
    >
      <meter
        className="sr-only"
        min={meterMin}
        max={meterMax}
        value={normalizedValue ?? meterMin}
        aria-label={ariaLabel ?? (ariaLabelledBy ? undefined : label)}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-valuetext={ariaValueText ?? accessibleValue}
      />
      <span
        className="relative z-10 grid min-w-0 place-items-center gap-0.5 leading-none"
        aria-hidden="true"
      >
        <strong className="max-w-[4.5rem] truncate text-sm font-bold tabular-nums group-data-[size=lg]/score-ring:text-base group-data-[size=sm]/score-ring:text-xs">
          {valueLabel ?? fallbackValueLabel}
        </strong>
        <small className="max-w-[4.5rem] truncate text-[0.58rem] font-bold tracking-wide text-muted-foreground uppercase group-data-[size=lg]/score-ring:text-[0.65rem] group-data-[size=sm]/score-ring:text-[0.5rem]">
          {label}
        </small>
      </span>
    </span>
  )
}

function clamp(value: number | undefined, min: number, max: number) {
  return Math.max(min, Math.min(max, value ?? min))
}

function formatValue(value: number | undefined) {
  if (value === undefined) {
    return "--"
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export { ScoreRing, type ScoreRingTone }
