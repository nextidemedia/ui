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
  "aria-label": ariaLabel = "Segmented control",
  ...props
}: Omit<React.ComponentProps<"div">, "onChange"> & {
  value: string
  options: SegmentedControlOption[]
  onValueChange: (value: string) => void
}) {
  return (
    <div
      data-slot="segmented-control"
      className={cn(
        "grid w-full min-w-0 grid-flow-col rounded-lg border border-nextide-line bg-nextide-panel p-1",
        className
      )}
      role="radiogroup"
      aria-label={ariaLabel}
      {...props}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          disabled={option.disabled}
          className={cn(
            "h-7 min-w-0 truncate rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors outline-none",
            "focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40",
            option.value === value &&
              "bg-nextide-tide text-black shadow-[0_0_18px_rgb(30_228_188/0.2)]"
          )}
          onClick={() => onValueChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export { SegmentedControl, type SegmentedControlOption }
