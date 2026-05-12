import * as React from "react"

import { cn } from "@nextide/ui/lib/utils"

type SegmentedControlOption = {
  value: string
  label: React.ReactNode
  disabled?: boolean
}

function SegmentedControl({
  value,
  options,
  onValueChange,
  className,
  style,
  "aria-label": ariaLabel = "Segmented control",
  ...props
}: Omit<React.ComponentProps<"div">, "onChange"> & {
  value: string
  options: SegmentedControlOption[]
  onValueChange: (value: string) => void
}) {
  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  )
  const count = Math.max(options.length, 1)
  const indicatorStyle = {
    width: "calc((100% - 0.5rem) / var(--segmented-count))",
    transform: "translateX(calc(var(--segmented-index) * 100%))",
  }

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
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {options.length > 0 ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-1 left-1 z-10 rounded-md bg-nextide-tide shadow-[0_0_18px_rgb(30_228_188/0.2)] transition-transform duration-[520ms] ease-[var(--nextide-ease-in-out-quart)] motion-reduce:transition-none"
          style={indicatorStyle}
        />
      ) : null}
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          disabled={option.disabled}
          className={cn(
            "relative z-10 h-7 min-w-0 truncate rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors duration-[220ms] outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40"
          )}
          onClick={() => onValueChange(option.value)}
        >
          {option.label}
        </button>
      ))}
      {options.length > 0 ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-1 left-1 z-20 overflow-hidden rounded-md transition-transform duration-[520ms] ease-[var(--nextide-ease-in-out-quart)] motion-reduce:transition-none"
          style={indicatorStyle}
        >
          <span
            className="grid h-full grid-flow-col transition-transform duration-[520ms] ease-[var(--nextide-ease-in-out-quart)] motion-reduce:transition-none"
            style={{
              width: "calc(var(--segmented-count) * 100%)",
              transform: "translateX(calc(var(--segmented-index) * -100%))",
            }}
          >
            {options.map((option) => (
              <span
                key={option.value}
                className={cn(
                  "grid h-7 min-w-0 place-items-center truncate px-2 text-xs font-medium text-black",
                  option.disabled && "opacity-40"
                )}
              >
                {option.label}
              </span>
            ))}
          </span>
        </span>
      ) : null}
    </div>
  )
}

export { SegmentedControl, type SegmentedControlOption }
