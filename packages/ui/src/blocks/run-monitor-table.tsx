import * as React from "react"
import { Activity, Clock3, Gauge } from "lucide-react"

import { DataLedger } from "@nextide/ui/components/data-ledger"
import { Metric } from "@nextide/ui/components/metric"
import { StatusBadge } from "@nextide/ui/components/status-badge"
import {
  Surface,
  SurfaceDescription,
  SurfaceHeader,
  SurfaceTitle,
} from "@nextide/ui/components/surface"
import { cn } from "@nextide/ui/lib/utils"

type RunMonitorTone =
  | "neutral"
  | "success"
  | "processing"
  | "warning"
  | "danger"

type RunMonitorStage = {
  id: string
  label: React.ReactNode
  status: "queued" | "running" | "complete" | "failed"
}

type RunMonitorRow = {
  id: string
  title: React.ReactNode
  owner?: React.ReactNode
  source?: React.ReactNode
  startedAt?: React.ReactNode
  duration?: React.ReactNode
  cost?: React.ReactNode
  status: React.ReactNode
  tone?: RunMonitorTone
  stages: RunMonitorStage[]
}

const stageClasses: Record<RunMonitorStage["status"], string> = {
  queued: "bg-muted-foreground/25",
  running: "bg-nextide-purple shadow-[0_0_14px_rgb(175_46_255/0.35)]",
  complete: "bg-nextide-tide shadow-[0_0_14px_rgb(30_228_188/0.35)]",
  failed: "bg-nextide-red shadow-[0_0_14px_rgb(255_51_85/0.35)]",
}

function RunMonitorTable({
  rows,
  title = "Run monitor",
  description = "Operational run state with inline stage progression.",
  activeRowId,
  onRowSelect,
  className,
  ...props
}: React.ComponentProps<typeof Surface> & {
  rows: RunMonitorRow[]
  title?: React.ReactNode
  description?: React.ReactNode
  activeRowId?: string
  onRowSelect?: (row: RunMonitorRow) => void
}) {
  const runningCount = rows.filter((row) => row.tone === "processing").length
  const failedCount = rows.filter((row) => row.tone === "danger").length

  return (
    <Surface
      data-slot="run-monitor-table"
      className={cn("grid gap-4", className)}
      {...props}
    >
      <SurfaceHeader>
        <SurfaceTitle>{title}</SurfaceTitle>
        {description ? (
          <SurfaceDescription>{description}</SurfaceDescription>
        ) : null}
      </SurfaceHeader>

      <div className="grid gap-3 md:grid-cols-3">
        <Metric icon={<Activity />} value={rows.length} label="Runs" />
        <Metric icon={<Gauge />} value={runningCount} label="Running" />
        <Metric icon={<Clock3 />} value={failedCount} label="Attention" />
      </div>

      <DataLedger
        title="Execution queue"
        description="Dense monitor rows for streams, jobs, and report tasks."
        countLabel={`${rows.length} rows`}
        bodyClassName="max-h-[34rem]"
      >
        <div className="grid min-w-[58rem] gap-2">
          <div className="grid grid-cols-[1.4fr_0.9fr_0.8fr_0.8fr_1.4fr_0.8fr] gap-3 px-2 text-xs font-medium text-muted-foreground">
            <span>Run</span>
            <span>Source</span>
            <span>Started</span>
            <span>Duration</span>
            <span>Stages</span>
            <span>Status</span>
          </div>
          {rows.map((row) => {
            const active = row.id === activeRowId

            return (
              <button
                key={row.id}
                type="button"
                className={cn(
                  "grid grid-cols-[1.4fr_0.9fr_0.8fr_0.8fr_1.4fr_0.8fr] items-center gap-3 rounded-lg border border-nextide-line bg-background/25 p-2 text-left text-sm transition-[background-color,border-color,box-shadow] duration-200 hover:bg-nextide-panel",
                  active &&
                    "border-nextide-tide/70 bg-nextide-tide/8 shadow-[0_0_22px_rgb(30_228_188/0.12)]"
                )}
                onClick={() => onRowSelect?.(row)}
              >
                <span className="grid min-w-0 gap-0.5">
                  <strong className="truncate">{row.title}</strong>
                  {row.owner ? (
                    <span className="truncate text-xs text-muted-foreground">
                      {row.owner}
                    </span>
                  ) : null}
                </span>
                <span className="truncate text-muted-foreground">
                  {row.source ?? "-"}
                </span>
                <span className="truncate text-muted-foreground">
                  {row.startedAt ?? "-"}
                </span>
                <span className="truncate text-muted-foreground">
                  {row.duration ?? "-"}
                </span>
                <StageRail stages={row.stages} />
                <span className="flex justify-start">
                  <StatusBadge tone={row.tone ?? "neutral"}>
                    {row.status}
                  </StatusBadge>
                </span>
              </button>
            )
          })}
        </div>
      </DataLedger>
    </Surface>
  )
}

function StageRail({ stages }: { stages: RunMonitorStage[] }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      {stages.map((stage) => (
        <span
          key={stage.id}
          className="group relative grid size-5 place-items-center rounded-full border border-nextide-line bg-background"
          title={typeof stage.label === "string" ? stage.label : undefined}
        >
          <span
            className={cn("size-2 rounded-full", stageClasses[stage.status])}
          />
        </span>
      ))}
    </span>
  )
}

export {
  RunMonitorTable,
  type RunMonitorRow,
  type RunMonitorStage,
  type RunMonitorTone,
}
