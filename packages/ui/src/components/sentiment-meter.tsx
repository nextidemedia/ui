import * as React from "react"

import { cn } from "@nextide/ui/lib/utils"

function SentimentMeter({
  value,
  min = -5,
  max = 5,
  label = "Sentiment",
  valueLabel,
  detail,
  className,
  style,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-valuetext": ariaValueText,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  value?: number
  min?: number
  max?: number
  label?: string
  valueLabel?: React.ReactNode
  detail?: React.ReactNode
}) {
  const hasValue =
    typeof value === "number" && Number.isFinite(value) && max > min
  const normalizedValue = hasValue ? clamp(value, min, max) : undefined
  const position =
    normalizedValue === undefined
      ? 50
      : ((normalizedValue - min) / (max - min)) * 100
  const fallbackValueLabel = formatSignedValue(normalizedValue)
  const accessibleValue =
    normalizedValue === undefined ? "Unavailable" : fallbackValueLabel
  const accessibleDetail =
    typeof detail === "string" || typeof detail === "number"
      ? `, ${detail}`
      : ""

  return (
    <div
      {...props}
      data-slot="sentiment-meter"
      className={cn("grid min-w-0 gap-1.5", className)}
      style={
        {
          ...style,
          "--sentiment-meter-position": `${position}%`,
          "--sentiment-meter-color": sentimentColor(normalizedValue),
        } as React.CSSProperties
      }
    >
      <meter
        className="sr-only"
        min={min}
        max={max}
        value={normalizedValue ?? min}
        aria-label={ariaLabel ?? (ariaLabelledBy ? undefined : label)}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-valuetext={
          ariaValueText ?? `${accessibleValue}${accessibleDetail}`
        }
      />
      <span
        className="flex min-w-0 items-baseline justify-between gap-2"
        aria-hidden="true"
      >
        <small className="truncate text-[0.65rem] font-semibold text-muted-foreground uppercase">
          {label}
        </small>
        <strong className="shrink-0 text-xs font-bold text-[var(--sentiment-meter-color)] tabular-nums">
          {valueLabel ?? fallbackValueLabel}
        </strong>
      </span>
      <span
        aria-hidden="true"
        className="relative block h-2 rounded-full bg-[linear-gradient(90deg,var(--nextide-red),color-mix(in_srgb,var(--muted-foreground)_32%,transparent)_50%,var(--nextide-tide))]"
      >
        <span className="absolute top-1/2 left-[var(--sentiment-meter-position)] size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-background bg-[var(--sentiment-meter-color)] shadow-[0_0_12px_color-mix(in_srgb,var(--sentiment-meter-color)_52%,transparent)]" />
      </span>
      {detail ? (
        <small
          className="truncate text-[0.65rem] text-muted-foreground"
          aria-hidden="true"
        >
          {detail}
        </small>
      ) : null}
    </div>
  )
}

function clamp(value: number | undefined, min: number, max: number) {
  return Math.max(min, Math.min(max, value ?? min))
}

function formatSignedValue(value: number | undefined) {
  if (value === undefined) {
    return "--"
  }

  const formatted = Number.isInteger(value) ? String(value) : value.toFixed(1)
  return value > 0 ? `+${formatted}` : formatted
}

function sentimentColor(value: number | undefined) {
  if (value === undefined || Math.abs(value) < 0.5) {
    return "var(--muted-foreground)"
  }

  return value > 0 ? "var(--nextide-tide)" : "var(--nextide-red)"
}

export { SentimentMeter }
