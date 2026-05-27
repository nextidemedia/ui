import * as React from "react"
import { Check, CircleAlert } from "lucide-react"

import { cn } from "@nextide/ui/lib/utils"

type IntelligenceStageStatus = "completed" | "processing" | "queued" | "degraded"

type IntelligenceProgressionStage = {
  id: string
  label: React.ReactNode
  detail: React.ReactNode
  status: IntelligenceStageStatus
  icon?: React.ReactNode
}

const stagePositions = [
  ["queue", "top-1/2 left-[9%]"],
  ["vod-ingest", "top-[24%] left-[30.5%]"],
  ["vod-analyze", "top-[24%] left-[47.5%]"],
  ["chat-ingest", "top-[76%] left-[30.5%]"],
  ["chat-analyze", "top-[76%] left-[47.5%]"],
  ["fuse", "top-1/2 left-[70%]"],
  ["assemble", "top-1/2 left-[88%]"],
] as const

const stagePositionClasses = new Map(stagePositions)

const statusClasses: Record<IntelligenceStageStatus, string> = {
  completed:
    "border-nextide-tide text-nextide-tide bg-[radial-gradient(circle,rgb(30_228_188/0.18),transparent_62%),#050508] shadow-[0_0_32px_rgb(30_228_188/0.28)]",
  processing:
    "border-nextide-purple text-nextide-purple bg-[radial-gradient(circle,rgb(175_46_255/0.16),transparent_62%),#050508] shadow-[0_0_32px_rgb(175_46_255/0.24)]",
  queued:
    "border-nextide-line text-muted-foreground bg-background shadow-none",
  degraded:
    "border-nextide-yellow text-nextide-yellow bg-[radial-gradient(circle,rgb(255_218_83/0.14),transparent_62%),#050508] shadow-[0_0_32px_rgb(255_218_83/0.22)]",
}

function IntelligenceProgressionChart({
  stages,
  title = "Intelligence progression",
  description,
  className,
  ...props
}: React.ComponentProps<"section"> & {
  stages: IntelligenceProgressionStage[]
  title?: React.ReactNode
  description?: React.ReactNode
}) {
  return (
    <section
      data-slot="intelligence-progression-chart"
      className={cn(
        "grid gap-3 rounded-lg border border-nextide-line bg-nextide-panel p-4",
        className
      )}
      {...props}
    >
      <div className="grid gap-1">
        <strong className="text-sm">{title}</strong>
        {description ? (
          <span className="text-xs text-muted-foreground">{description}</span>
        ) : null}
      </div>
      <div className="relative isolate min-h-[clamp(20rem,32vw,28rem)] w-full">
        <svg
          className="absolute inset-0 z-0 h-full w-full overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <g className="[&>path]:fill-none [&>path]:stroke-nextide-tide/20 [&>path]:stroke-[5] [&>path]:[filter:blur(0.5px)_drop-shadow(0_0_14px_rgb(30_228_188/0.48))] [&>path]:[vector-effect:non-scaling-stroke]">
            {progressionPaths.map((path) => (
              <path key={`glow-${path}`} d={path} />
            ))}
          </g>
          <g className="[&>path]:fill-none [&>path]:stroke-nextide-tide/80 [&>path]:stroke-[1.05] [&>path]:[stroke-dasharray:2.7_1.8] [&>path]:[filter:drop-shadow(0_0_7px_rgb(30_228_188/0.5))] [&>path]:[vector-effect:non-scaling-stroke]">
            {progressionPaths.map((path) => (
              <path key={`line-${path}`} d={path} />
            ))}
          </g>
        </svg>
        {stages.map((stage, index) => {
          const position =
            stagePositionClasses.get(stage.id as (typeof stagePositions)[number][0]) ??
            "top-1/2 left-1/2"

          return (
            <div
              key={stage.id}
              className={cn(
                "absolute z-10 grid w-36 -translate-x-1/2 translate-y-[calc(var(--orbit-size,5.5rem)/-2)] justify-items-center gap-2 text-center",
                position,
                stage.status === "queued" && "text-muted-foreground/60"
              )}
            >
              <span
                className={cn(
                  "grid size-[var(--orbit-size,5.5rem)] place-items-center rounded-full border-2",
                  statusClasses[stage.status]
                )}
              >
                {stage.status === "degraded" ? (
                  <CircleAlert className="size-7" />
                ) : (
                  stage.icon ?? <Check className="size-7" />
                )}
              </span>
              <strong className="text-xs leading-tight">{stage.label}</strong>
              <small className="max-w-24 text-[0.68rem] leading-tight text-muted-foreground">
                {stage.detail}
              </small>
              <span className="sr-only">Step {index + 1}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

const progressionPaths = [
  "M 13.8 50 C 19 50, 20.8 24, 26.1 24",
  "M 13.8 50 C 19 50, 20.8 76, 26.1 76",
  "M 34.9 24 C 37.4 24, 40.6 24, 43.1 24",
  "M 34.9 76 C 37.4 76, 40.6 76, 43.1 76",
  "M 51.9 24 C 58.6 24, 58.8 50, 65.1 50",
  "M 51.9 76 C 58.6 76, 58.8 50, 65.1 50",
  "M 74.9 50 C 77.4 50, 80.6 50, 83.1 50",
]

export {
  IntelligenceProgressionChart,
  type IntelligenceProgressionStage,
  type IntelligenceStageStatus,
}
