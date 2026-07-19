import * as React from "react"

import {
  StatusBadge,
  type StatusBadgeTone,
} from "@nextide/ui/components/status-badge"
import {
  Surface,
  SurfaceDescription,
  SurfaceHeader,
  SurfaceTitle,
} from "@nextide/ui/components/surface"
import { cn } from "@nextide/ui/lib/utils"

type SignalPlateMetric = {
  id?: string
  label: React.ReactNode
  value: React.ReactNode
  detail?: React.ReactNode
}

const emptyMetrics: SignalPlateMetric[] = []

const toneClasses: Record<StatusBadgeTone, string> = {
  neutral: "before:via-muted-foreground/45 after:bg-muted-foreground/[0.06]",
  success: "before:via-nextide-tide/75 after:bg-nextide-tide/[0.12]",
  processing: "before:via-nextide-purple/75 after:bg-nextide-purple/[0.12]",
  warning: "before:via-nextide-yellow/75 after:bg-nextide-yellow/[0.11]",
  danger: "before:via-nextide-red/75 after:bg-nextide-red/[0.11]",
}

function SignalPlate({
  eyebrow,
  title,
  description,
  status,
  statusTone = "neutral",
  metrics = emptyMetrics,
  actions,
  className,
  ...props
}: React.ComponentProps<typeof Surface> & {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  status: React.ReactNode
  statusTone?: StatusBadgeTone
  metrics?: SignalPlateMetric[]
  actions?: React.ReactNode
}) {
  return (
    <Surface
      data-slot="signal-plate"
      data-tone={statusTone}
      variant="strong"
      className={cn(
        "relative isolate grid gap-5 overflow-hidden p-5 before:pointer-events-none before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:to-transparent after:pointer-events-none after:absolute after:top-0 after:left-1/2 after:h-14 after:w-3/5 after:-translate-x-1/2 after:blur-2xl",
        toneClasses[statusTone],
        className
      )}
      {...props}
    >
      <div className="relative z-10 grid items-start gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
        <SurfaceHeader className="max-w-2xl min-w-0">
          {eyebrow ? (
            <SurfaceDescription className="uppercase">
              {eyebrow}
            </SurfaceDescription>
          ) : null}
          <SurfaceTitle className="text-2xl leading-tight">
            {title}
          </SurfaceTitle>
          {description ? (
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
          ) : null}
        </SurfaceHeader>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <StatusBadge tone={statusTone}>{status}</StatusBadge>
          {actions}
        </div>
      </div>
      {metrics.length > 0 ? (
        <div className="relative z-10 grid gap-2 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div
              key={metric.id ?? `${metric.label}-${metric.value}`}
              className="grid gap-1 rounded-lg border border-nextide-line bg-background/25 p-3"
            >
              <span className="text-xs text-muted-foreground">
                {metric.label}
              </span>
              <strong className="text-xl leading-none">{metric.value}</strong>
              {metric.detail ? (
                <span className="text-xs text-muted-foreground">
                  {metric.detail}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </Surface>
  )
}

export { SignalPlate, type SignalPlateMetric }
