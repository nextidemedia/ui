import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@nextide/ui/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center rounded-md border font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "border-nextide-line bg-nextide-panel text-muted-foreground",
        success: "border-nextide-tide/45 bg-nextide-tide/10 text-nextide-tide",
        processing:
          "border-nextide-purple/45 bg-nextide-purple/10 text-nextide-purple",
        warning:
          "border-nextide-yellow/45 bg-nextide-yellow/10 text-nextide-yellow",
        danger: "border-nextide-red/45 bg-nextide-red/10 text-nextide-red",
      },
      size: {
        default: "gap-1.5 px-2 py-1 text-xs",
        compact: "gap-1 px-1.5 py-0.5 text-ui-micro",
      },
    },
    defaultVariants: {
      tone: "neutral",
      size: "default",
    },
  }
)

type StatusBadgeTone = NonNullable<
  VariantProps<typeof statusBadgeVariants>["tone"]
>
type StatusBadgeIndicator = "none" | "dot" | "pulse"

function StatusBadge({
  className,
  tone,
  size,
  children,
  indicator = "dot",
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof statusBadgeVariants> & {
    indicator?: StatusBadgeIndicator
  }) {
  const pulse = indicator === "pulse"

  return (
    <span
      data-slot="status-badge"
      data-tone={tone}
      data-size={size ?? "default"}
      data-indicator={indicator}
      className={cn(statusBadgeVariants({ tone, size }), className)}
      {...props}
    >
      {indicator !== "none" ? (
        <span
          data-slot="status-badge-dot"
          data-pulse={pulse ? "true" : undefined}
          className={cn(
            "rounded-full bg-current",
            size === "compact" ? "size-1" : "size-1.5",
            pulse && "shadow-[0_0_10px_currentColor]"
          )}
          aria-hidden="true"
        />
      ) : null}
      {children}
    </span>
  )
}

export {
  StatusBadge,
  statusBadgeVariants,
  type StatusBadgeIndicator,
  type StatusBadgeTone,
}
