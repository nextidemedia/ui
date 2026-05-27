import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@nextide/ui/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-medium whitespace-nowrap",
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
    },
    defaultVariants: {
      tone: "neutral",
    },
  }
)

function StatusBadge({
  className,
  tone,
  children,
  pulse = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof statusBadgeVariants> & {
    pulse?: boolean
  }) {
  return (
    <span
      data-slot="status-badge"
      data-tone={tone}
      className={cn(statusBadgeVariants({ tone }), className)}
      {...props}
    >
      <span
        data-slot="status-badge-dot"
        data-pulse={pulse ? "true" : undefined}
        className={cn(
          "size-1.5 rounded-full bg-current",
          pulse && "shadow-[0_0_10px_currentColor]"
        )}
        aria-hidden="true"
      />
      {children}
    </span>
  )
}

export { StatusBadge, statusBadgeVariants }
