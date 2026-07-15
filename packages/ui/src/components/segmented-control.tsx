import * as React from "react"

import { cn } from "@nextide/ui/lib/utils"

type SegmentedControlOption = {
  value: string
  label: React.ReactNode
  disabled?: boolean
}

type SegmentedControlVariant = "fill" | "quiet" | "underline"
type SegmentedControlSize = "default" | "tall"

const segmentedIndicatorStyle = {
  width: "calc((100% - 0.5rem) / var(--segmented-count))",
  transform: "translateX(calc(var(--segmented-index) * 100%))",
} satisfies React.CSSProperties

function SegmentedControl({
  value,
  options,
  onValueChange,
  variant = "fill",
  size = "default",
  className,
  style,
  "aria-label": ariaLabel = "Segmented control",
  ...props
}: Omit<React.ComponentProps<"div">, "onChange"> & {
  value: string
  options: SegmentedControlOption[]
  onValueChange: (value: string) => void
  variant?: SegmentedControlVariant
  size?: SegmentedControlSize
}) {
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  )
  const count = Math.max(options.length, 1)

  return (
    <div
      data-slot="segmented-control"
      className={cn(
        "relative grid w-full min-w-0 grid-flow-col rounded-lg border border-nextide-line bg-nextide-panel p-1",
        className
      )}
      role="radiogroup"
      aria-label={ariaLabel}
      style={
        {
          "--segmented-count": count,
          "--segmented-index": activeIndex,
          gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {options.length > 0 ? (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-y-1 left-1 z-10 transition-transform duration-[var(--nextide-motion-layout)] ease-[var(--nextide-ease-in-out-quart)] motion-reduce:transition-none",
            variant === "fill" && "rounded-md bg-nextide-tide",
            variant === "quiet" &&
              "rounded-md bg-nextide-tide/[0.09] outline outline-1 -outline-offset-1 outline-nextide-tide/20",
            variant === "underline" &&
              "border-b-2 border-nextide-tide bg-nextide-tide/[0.04]"
          )}
          style={segmentedIndicatorStyle}
        />
      ) : null}
      {options.map((option) => {
        const active = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={option.disabled}
            className={cn(
              "relative z-10 min-w-0 truncate rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors duration-[var(--nextide-motion-state)] outline-none",
              size === "tall" ? "min-h-12 py-1.5" : "h-7",
              active && variant === "fill" && "text-black",
              active && variant !== "fill" && "text-foreground",
              "focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
            )}
            onClick={() => onValueChange(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export {
  SegmentedControl,
  type SegmentedControlOption,
  type SegmentedControlSize,
  type SegmentedControlVariant,
}
