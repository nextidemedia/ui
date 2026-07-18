import * as React from "react"
import { Toggle } from "@base-ui/react/toggle"
import { ToggleGroup } from "@base-ui/react/toggle-group"

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

function getSegmentedLabelOverlayStyle(
  activeIndex: number,
  count: number
): React.CSSProperties {
  const left = (activeIndex / count) * 100
  const right = ((count - activeIndex - 1) / count) * 100

  return {
    clipPath: `inset(0 ${right}% 0 ${left}%)`,
    gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
  }
}

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
}: Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> & {
  value: string
  options: SegmentedControlOption[]
  onValueChange: (value: string) => void
  variant?: SegmentedControlVariant
  size?: SegmentedControlSize
}) {
  const activeIndex = options.findIndex((option) => option.value === value)
  const count = Math.max(options.length, 1)

  return (
    <ToggleGroup
      data-slot="segmented-control"
      className={cn(
        "relative grid w-full min-w-0 grid-flow-col rounded-lg border border-nextide-line bg-nextide-panel p-1",
        className
      )}
      aria-label={ariaLabel}
      value={activeIndex >= 0 ? [value] : []}
      onValueChange={(nextValue) => {
        if (nextValue[0]) onValueChange(nextValue[0])
      }}
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
      {activeIndex >= 0 ? (
        <span
          aria-hidden="true"
          data-slot="segmented-control-indicator"
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
          <Toggle
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className={cn(
              "relative z-10 grid min-w-0 place-items-center truncate rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors duration-[var(--nextide-motion-state)] outline-none",
              size === "tall" ? "min-h-12 py-1.5" : "h-7",
              active && variant !== "fill" && "text-foreground",
              "focus-visible:z-30 focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
            )}
          >
            {option.label}
          </Toggle>
        )
      })}
      {activeIndex >= 0 && variant === "fill" ? (
        // Intentionally duplicate the labels in a clipped overlay: the moving
        // selection fill acts as a mask that flips only the covered text color.
        <span
          aria-hidden="true"
          data-slot="segmented-control-label-overlay"
          className="pointer-events-none absolute inset-1 z-20 grid grid-flow-col transition-[clip-path] duration-[var(--nextide-motion-layout)] ease-[var(--nextide-ease-in-out-quart)] motion-reduce:transition-none"
          style={getSegmentedLabelOverlayStyle(activeIndex, count)}
        >
          {options.map((option) => (
            <span
              key={option.value}
              className={cn(
                "grid min-w-0 place-items-center truncate rounded-md px-2 text-xs font-medium text-primary-foreground",
                size === "tall" ? "min-h-12 py-1.5" : "h-7",
                option.disabled && "opacity-40"
              )}
            >
              {option.label}
            </span>
          ))}
        </span>
      ) : null}
    </ToggleGroup>
  )
}

export {
  SegmentedControl,
  type SegmentedControlOption,
  type SegmentedControlSize,
  type SegmentedControlVariant,
}
