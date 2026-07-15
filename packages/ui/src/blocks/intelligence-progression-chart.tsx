import * as React from "react"
import { Check, CircleAlert } from "lucide-react"

import { cn } from "@nextide/ui/lib/utils"

type IntelligenceStageStatus =
  | "completed"
  | "processing"
  | "queued"
  | "degraded"

type IntelligenceProgressionStage = {
  id: string
  label: React.ReactNode
  detail: React.ReactNode
  status: IntelligenceStageStatus
  icon?: React.ReactNode
}

const stagePositions = [
  { id: "queue", x: 9, y: 50, className: "top-1/2 left-[9%]" },
  { id: "vod-ingest", x: 30.5, y: 24, className: "top-[24%] left-[30.5%]" },
  { id: "vod-analyze", x: 47.5, y: 24, className: "top-[24%] left-[47.5%]" },
  { id: "chat-ingest", x: 30.5, y: 76, className: "top-[76%] left-[30.5%]" },
  { id: "chat-analyze", x: 47.5, y: 76, className: "top-[76%] left-[47.5%]" },
  { id: "fuse", x: 70, y: 50, className: "top-1/2 left-[70%]" },
  { id: "assemble", x: 88, y: 50, className: "top-1/2 left-[88%]" },
] as const

const stagePositionById = new Map<string, (typeof stagePositions)[number]>(
  stagePositions.map((position) => [position.id, position])
)
const nodeRadii = { x: 5.4, y: 13.5 }

const statusClasses: Record<IntelligenceStageStatus, string> = {
  completed:
    "border-nextide-tide text-nextide-tide bg-[radial-gradient(circle,rgb(30_228_188/0.18),transparent_62%),#050508] shadow-[0_0_32px_rgb(30_228_188/0.28)]",
  processing:
    "border-nextide-purple text-nextide-purple bg-[radial-gradient(circle,rgb(175_46_255/0.16),transparent_62%),#050508] shadow-[0_0_32px_rgb(175_46_255/0.24)]",
  queued: "border-nextide-line text-muted-foreground bg-background shadow-none",
  degraded:
    "border-nextide-yellow text-nextide-yellow bg-[radial-gradient(circle,rgb(255_218_83/0.14),transparent_62%),#050508] shadow-[0_0_32px_rgb(255_218_83/0.22)]",
}

const statusColors: Record<IntelligenceStageStatus, string> = {
  completed: "rgb(30 228 188)",
  processing: "rgb(175 46 255)",
  queued: "rgb(163 163 163)",
  degraded: "rgb(255 218 83)",
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
  const rawId = React.useId().replace(/:/g, "")
  const maskId = `${rawId}-node-mask`
  const statusByStage = React.useMemo(
    () => new Map(stages.map((stage) => [stage.id, stage.status])),
    [stages]
  )
  const renderedEdges = progressionEdges
    .map((edge) => {
      const source = stagePositionById.get(edge.from)
      const target = stagePositionById.get(edge.to)
      if (!source || !target) return null

      const start = pointOnEllipse(source, edge.controlOne, nodeRadii)
      const end = pointOnEllipse(target, edge.controlTwo, nodeRadii)

      return {
        ...edge,
        start,
        end,
        path: `M ${start.x} ${start.y} C ${edge.controlOne.x} ${edge.controlOne.y}, ${edge.controlTwo.x} ${edge.controlTwo.y}, ${end.x} ${end.y}`,
      }
    })
    .filter((edge): edge is NonNullable<typeof edge> => edge !== null)

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
          <defs>
            {renderedEdges.map((edge) => {
              const sourceStatus = statusByStage.get(edge.from) ?? "queued"
              const targetStatus = statusByStage.get(edge.to) ?? "queued"

              return (
                <linearGradient
                  key={edge.id}
                  id={`${rawId}-${edge.id}`}
                  gradientUnits="userSpaceOnUse"
                  x1={edge.start.x}
                  y1={edge.start.y}
                  x2={edge.end.x}
                  y2={edge.end.y}
                >
                  <stop offset="0" stopColor={statusColors[sourceStatus]} />
                  <stop offset="1" stopColor={statusColors[targetStatus]} />
                </linearGradient>
              )
            })}
            <mask
              id={maskId}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="100"
              height="100"
            >
              <rect width="100" height="100" fill="white" />
              {stages.map((stage) => {
                const position = stagePositionById.get(stage.id)
                if (!position) return null

                return (
                  <ellipse
                    key={stage.id}
                    cx={position.x}
                    cy={position.y}
                    rx={nodeRadii.x}
                    ry={nodeRadii.y}
                    fill="black"
                  />
                )
              })}
            </mask>
          </defs>
          <g
            data-slot="progression-flow-glow"
            mask={`url(#${maskId})`}
            className="[&>path]:fill-none [&>path]:stroke-[5] [&>path]:opacity-20 [&>path]:[filter:blur(0.5px)_drop-shadow(0_0_14px_rgb(30_228_188/0.38))] [&>path]:[vector-effect:non-scaling-stroke]"
          >
            {renderedEdges.map((edge) => (
              <path
                key={`glow-${edge.id}`}
                d={edge.path}
                stroke={`url(#${rawId}-${edge.id})`}
              />
            ))}
          </g>
          <g
            data-slot="progression-flow-lines"
            mask={`url(#${maskId})`}
            className="[&>path]:fill-none [&>path]:stroke-[1.05] [&>path]:[filter:drop-shadow(0_0_7px_rgb(30_228_188/0.42))] [&>path]:[vector-effect:non-scaling-stroke]"
          >
            {renderedEdges.map((edge) => (
              <path
                key={`line-${edge.id}`}
                d={edge.path}
                className="nextide-flow-line"
                pathLength="100"
                stroke={`url(#${rawId}-${edge.id})`}
                strokeDasharray="5 4"
                strokeLinecap="round"
              />
            ))}
          </g>
        </svg>
        {stages.map((stage, index) => {
          const position = stagePositionById.get(stage.id)

          return (
            <div
              key={stage.id}
              className={cn(
                "absolute z-20 grid w-36 -translate-x-1/2 translate-y-[calc(var(--orbit-size,5.5rem)/-2)] justify-items-center gap-2 text-center",
                position?.className ?? "top-1/2 left-1/2",
                stage.status === "queued" && "text-muted-foreground/60"
              )}
            >
              <span
                className={cn(
                  "relative isolate grid size-[var(--orbit-size,5.5rem)] place-items-center overflow-hidden rounded-full border-2 bg-[#050508]",
                  statusClasses[stage.status]
                )}
              >
                {stage.status === "degraded" ? (
                  <CircleAlert className="size-7" />
                ) : (
                  (stage.icon ?? <Check className="size-7" />)
                )}
              </span>
              <strong className="text-xs leading-tight">{stage.label}</strong>
              <small className="max-w-24 text-ui-caption leading-tight text-muted-foreground">
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

const progressionEdges = [
  {
    id: "queue-vod-ingest",
    from: "queue",
    to: "vod-ingest",
    controlOne: { x: 19, y: 50 },
    controlTwo: { x: 20.5, y: 24 },
  },
  {
    id: "queue-chat-ingest",
    from: "queue",
    to: "chat-ingest",
    controlOne: { x: 19, y: 50 },
    controlTwo: { x: 20.5, y: 76 },
  },
  {
    id: "vod-ingest-analyze",
    from: "vod-ingest",
    to: "vod-analyze",
    controlOne: { x: 36, y: 24 },
    controlTwo: { x: 42, y: 24 },
  },
  {
    id: "chat-ingest-analyze",
    from: "chat-ingest",
    to: "chat-analyze",
    controlOne: { x: 36, y: 76 },
    controlTwo: { x: 42, y: 76 },
  },
  {
    id: "vod-analyze-fuse",
    from: "vod-analyze",
    to: "fuse",
    controlOne: { x: 59, y: 24 },
    controlTwo: { x: 58.5, y: 50 },
  },
  {
    id: "chat-analyze-fuse",
    from: "chat-analyze",
    to: "fuse",
    controlOne: { x: 59, y: 76 },
    controlTwo: { x: 58.5, y: 50 },
  },
  {
    id: "fuse-assemble",
    from: "fuse",
    to: "assemble",
    controlOne: { x: 76, y: 50 },
    controlTwo: { x: 82, y: 50 },
  },
]

function pointOnEllipse(
  center: { x: number; y: number },
  toward: { x: number; y: number },
  radii: { x: number; y: number }
) {
  const deltaX = toward.x - center.x
  const deltaY = toward.y - center.y
  const scale =
    1 /
    Math.sqrt(
      (deltaX * deltaX) / (radii.x * radii.x) +
        (deltaY * deltaY) / (radii.y * radii.y)
    )

  return {
    x: center.x + deltaX * scale,
    y: center.y + deltaY * scale,
  }
}

export {
  IntelligenceProgressionChart,
  type IntelligenceProgressionStage,
  type IntelligenceStageStatus,
}
