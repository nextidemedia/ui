import * as React from "react"

import { cn } from "@nextide/ui/lib/utils"

function Metric({
  icon,
  value,
  label,
  detail,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  icon?: React.ReactNode
  value: React.ReactNode
  label: React.ReactNode
  detail?: React.ReactNode
}) {
  return (
    <div
      data-slot="metric"
      className={cn(
        "grid min-w-0 gap-1 rounded-lg border border-nextide-line bg-nextide-panel p-3",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 text-nextide-tide">
        {icon ? <span className="[&_svg]:size-4">{icon}</span> : null}
        <strong className="truncate text-xl leading-none font-semibold text-foreground">
          {value}
        </strong>
      </div>
      <span className="truncate text-xs font-medium text-muted-foreground">
        {label}
      </span>
      {detail ? (
        <small className="text-xs text-muted-foreground">{detail}</small>
      ) : null}
    </div>
  )
}

export { Metric }
