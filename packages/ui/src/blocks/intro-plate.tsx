import * as React from "react"

import { StatusBadge } from "@nextide/ui/components/status-badge"
import {
  Surface,
  SurfaceDescription,
  SurfaceHeader,
  SurfaceTitle,
} from "@nextide/ui/components/surface"
import { cn } from "@nextide/ui/lib/utils"

type IntroPlateMetric = {
  id?: string
  label: React.ReactNode
  value: React.ReactNode
  detail?: React.ReactNode
}

const emptyMetrics: IntroPlateMetric[] = []

function IntroPlate({
  eyebrow,
  title,
  description,
  status,
  metrics = emptyMetrics,
  actions,
  className,
  ...props
}: React.ComponentProps<typeof Surface> & {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  status?: React.ReactNode
  metrics?: IntroPlateMetric[]
  actions?: React.ReactNode
}) {
  return (
    <Surface
      data-slot="intro-plate"
      variant="strong"
      className={cn(
        "relative isolate grid gap-5 overflow-hidden p-5 before:pointer-events-none before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-nextide-tide/70 before:to-transparent after:pointer-events-none after:absolute after:top-0 after:left-1/2 after:h-12 after:w-1/2 after:-translate-x-1/2 after:bg-nextide-tide/10 after:blur-2xl",
        className
      )}
      {...props}
    >
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
        <SurfaceHeader className="max-w-2xl">
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
          {status ? <StatusBadge tone="success">{status}</StatusBadge> : null}
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

export { IntroPlate, type IntroPlateMetric }
