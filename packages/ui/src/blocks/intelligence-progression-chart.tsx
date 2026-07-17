import * as React from "react"
import { Check, CircleAlert } from "lucide-react"

import { ProcessingText } from "@nextide/ui/components/processing-text"
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

type StagePosition = { x: number; y: number }
type NodeGeometry = StagePosition & { radiusX: number; radiusY: number }
type ChartGeometry = {
  width: number
  height: number
  nodes: Record<string, NodeGeometry>
}

const desktopStagePositions: Record<string, StagePosition> = {
  queue: { x: 9, y: 50 },
  "vod-ingest": { x: 30.5, y: 24 },
  "vod-analyze": { x: 47.5, y: 24 },
  "chat-ingest": { x: 30.5, y: 76 },
  "chat-analyze": { x: 47.5, y: 76 },
  fuse: { x: 70, y: 50 },
  assemble: { x: 88, y: 50 },
}

const compactStagePositions: Record<string, StagePosition> = {
  queue: { x: 50, y: 7 },
  "vod-ingest": { x: 25, y: 27 },
  "vod-analyze": { x: 25, y: 50 },
  "chat-ingest": { x: 75, y: 27 },
  "chat-analyze": { x: 75, y: 50 },
  fuse: { x: 50, y: 70 },
  assemble: { x: 50, y: 88 },
}

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

const progressionEdges = [
  { id: "queue-vod-ingest", from: "queue", to: "vod-ingest" },
  { id: "queue-chat-ingest", from: "queue", to: "chat-ingest" },
  { id: "vod-ingest-analyze", from: "vod-ingest", to: "vod-analyze" },
  {
    id: "chat-ingest-analyze",
    from: "chat-ingest",
    to: "chat-analyze",
  },
  { id: "vod-analyze-fuse", from: "vod-analyze", to: "fuse" },
  { id: "chat-analyze-fuse", from: "chat-analyze", to: "fuse" },
  { id: "fuse-assemble", from: "fuse", to: "assemble" },
] as const

const initialGeometry: ChartGeometry = { width: 1, height: 1, nodes: {} }

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
  const chartRef = React.useRef<HTMLDivElement | null>(null)
  const nodeRefs = React.useRef(new Map<string, HTMLSpanElement>())
  const [compact, setCompact] = React.useState(false)
  const [geometry, setGeometry] = React.useState<ChartGeometry>(initialGeometry)
  const rawId = React.useId().replace(/:/g, "")
  const maskId = `${rawId}-node-mask`
  const stagePositions = compact ? compactStagePositions : desktopStagePositions
  const statusByStage = React.useMemo(
    () => new Map(stages.map((stage) => [stage.id, stage.status])),
    [stages]
  )
  const renderedEdges = React.useMemo(
    () =>
      progressionEdges.flatMap((edge) => {
        const source = geometry.nodes[edge.from]
        const target = geometry.nodes[edge.to]
        if (!source || !target) return []

        const connection = connectNodeEdges(source, target, geometry.width / 2)
        return [{ ...edge, ...connection }]
      }),
    [geometry]
  )

  React.useLayoutEffect(() => {
    const chart = chartRef.current
    if (!chart) return

    let frame = 0
    const measure = () => {
      const chartRect = chart.getBoundingClientRect()
      const nextCompact = chartRect.width < 640
      setCompact((current) => (current === nextCompact ? current : nextCompact))

      const nodes: Record<string, NodeGeometry> = {}
      for (const stage of stages) {
        const node = nodeRefs.current.get(stage.id)
        if (!node) continue

        const nodeRect = node.getBoundingClientRect()
        nodes[stage.id] = {
          x: nodeRect.left - chartRect.left + nodeRect.width / 2,
          y: nodeRect.top - chartRect.top + nodeRect.height / 2,
          radiusX: nodeRect.width / 2,
          radiusY: nodeRect.height / 2,
        }
      }

      const nextGeometry = {
        width: Math.max(chartRect.width, 1),
        height: Math.max(chartRect.height, 1),
        nodes,
      }
      setGeometry((current) =>
        geometryMatches(current, nextGeometry) ? current : nextGeometry
      )
    }
    const scheduleMeasure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }

    scheduleMeasure()
    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(scheduleMeasure)
    resizeObserver?.observe(chart)
    nodeRefs.current.forEach((node) => resizeObserver?.observe(node))
    window.addEventListener("resize", scheduleMeasure)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver?.disconnect()
      window.removeEventListener("resize", scheduleMeasure)
    }
  }, [compact, stages])

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
      <div
        ref={chartRef}
        data-layout={compact ? "compact" : "wide"}
        className={cn(
          "relative isolate w-full",
          compact ? "min-h-[48rem]" : "min-h-[clamp(20rem,32vw,28rem)]"
        )}
      >
        <svg
          className="absolute inset-0 z-0 h-full w-full overflow-visible"
          viewBox={`0 0 ${geometry.width} ${geometry.height}`}
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
              width={geometry.width}
              height={geometry.height}
            >
              <rect
                width={geometry.width}
                height={geometry.height}
                fill="white"
              />
              {Object.entries(geometry.nodes).map(([id, node]) => (
                <ellipse
                  key={id}
                  cx={node.x}
                  cy={node.y}
                  rx={Math.max(node.radiusX - 1, 0)}
                  ry={Math.max(node.radiusY - 1, 0)}
                  fill="black"
                />
              ))}
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
          const position = stagePositions[stage.id] ?? { x: 50, y: 50 }
          const processingTextSyncLength =
            stage.status === "processing"
              ? Math.max(
                  typeof stage.label === "string"
                    ? stage.label.trim().length
                    : 0,
                  typeof stage.detail === "string"
                    ? stage.detail.trim().length
                    : 0
                ) || undefined
              : undefined

          return (
            <div
              key={stage.id}
              className={cn(
                "absolute z-20 grid -translate-x-1/2 translate-y-[calc(var(--orbit-size)/-2)] justify-items-center gap-2 text-center",
                compact
                  ? "w-28 [--orbit-size:4.75rem]"
                  : "w-36 [--orbit-size:5.5rem]",
                stage.status === "queued" && "text-muted-foreground/60"
              )}
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
            >
              <span
                ref={(node) => {
                  if (node) nodeRefs.current.set(stage.id, node)
                  else nodeRefs.current.delete(stage.id)
                }}
                data-stage-id={stage.id}
                className={cn(
                  "relative isolate grid size-[var(--orbit-size)] place-items-center overflow-hidden rounded-full border-2 bg-[#050508]",
                  statusClasses[stage.status]
                )}
              >
                {stage.status === "degraded" ? (
                  <CircleAlert className="size-7" />
                ) : (
                  (stage.icon ?? <Check className="size-7" />)
                )}
              </span>
              <strong className="text-xs leading-tight">
                {stage.status === "processing" &&
                typeof stage.label === "string" ? (
                  <ProcessingText
                    syncLength={processingTextSyncLength}
                    tone="processing"
                  >
                    {stage.label}
                  </ProcessingText>
                ) : (
                  stage.label
                )}
              </strong>
              <small className="max-w-24 text-ui-caption leading-tight text-muted-foreground">
                {stage.status === "processing" &&
                typeof stage.detail === "string" ? (
                  <ProcessingText
                    syncLength={processingTextSyncLength}
                    tone="processing"
                  >
                    {stage.detail}
                  </ProcessingText>
                ) : (
                  stage.detail
                )}
              </small>
              <span className="sr-only">Step {index + 1}</span>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function connectNodeEdges(
  source: NodeGeometry,
  target: NodeGeometry,
  chartCenterX: number
) {
  const centerDeltaX = target.x - source.x
  const verticallyAligned = Math.abs(centerDeltaX) < 1
  const direction = verticallyAligned
    ? source.x < chartCenterX
      ? -1
      : 1
    : Math.sign(centerDeltaX)
  const start = {
    x: source.x + source.radiusX * direction,
    y: source.y,
  }
  const end = {
    x: target.x + target.radiusX * (verticallyAligned ? direction : -direction),
    y: target.y,
  }
  const deltaX = end.x - start.x
  const deltaY = end.y - start.y
  const handle = verticallyAligned
    ? Math.max(24, Math.abs(deltaY) * 0.28)
    : Math.max(24, Math.abs(deltaX) * 0.46)
  const controlOne = {
    x: start.x + direction * handle,
    y: start.y,
  }
  const controlTwo = {
    x: end.x - (verticallyAligned ? -direction : direction) * handle,
    y: end.y,
  }

  return {
    start,
    end,
    path: `M ${start.x} ${start.y} C ${controlOne.x} ${controlOne.y}, ${controlTwo.x} ${controlTwo.y}, ${end.x} ${end.y}`,
  }
}

function geometryMatches(current: ChartGeometry, next: ChartGeometry) {
  if (
    Math.abs(current.width - next.width) > 0.25 ||
    Math.abs(current.height - next.height) > 0.25
  ) {
    return false
  }

  const currentIds = Object.keys(current.nodes)
  const nextIds = Object.keys(next.nodes)
  if (currentIds.length !== nextIds.length) return false

  return nextIds.every((id) => {
    const currentNode = current.nodes[id]
    const nextNode = next.nodes[id]
    return (
      currentNode &&
      nextNode &&
      Math.abs(currentNode.x - nextNode.x) <= 0.25 &&
      Math.abs(currentNode.y - nextNode.y) <= 0.25 &&
      Math.abs(currentNode.radiusX - nextNode.radiusX) <= 0.25 &&
      Math.abs(currentNode.radiusY - nextNode.radiusY) <= 0.25
    )
  })
}

export {
  IntelligenceProgressionChart,
  type IntelligenceProgressionStage,
  type IntelligenceStageStatus,
}
