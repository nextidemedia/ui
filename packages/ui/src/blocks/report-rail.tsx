import * as React from "react"
import { FileText, LoaderCircle, TriangleAlert } from "lucide-react"

import { StatusBadge } from "@nextide/ui/components/status-badge"
import {
  Surface,
  SurfaceDescription,
  SurfaceHeader,
  SurfaceTitle,
} from "@nextide/ui/components/surface"
import { cn } from "@nextide/ui/lib/utils"

type ReportRailStatus =
  | "draft"
  | "queued"
  | "processing"
  | "completed"
  | "failed"

type ReportRailItem = {
  id: string
  title: React.ReactNode
  meta?: React.ReactNode
  status: ReportRailStatus
  timestamp?: React.ReactNode
}

const statusTone: Record<
  ReportRailStatus,
  React.ComponentProps<typeof StatusBadge>["tone"]
> = {
  draft: "neutral",
  queued: "warning",
  processing: "processing",
  completed: "success",
  failed: "danger",
}

function ReportRail({
  items,
  activeItemId,
  title = "Report history",
  description = "Draft, queued, processing, and completed report records.",
  onItemSelect,
  className,
  ...props
}: React.ComponentProps<typeof Surface> & {
  items: ReportRailItem[]
  activeItemId?: string
  title?: React.ReactNode
  description?: React.ReactNode
  onItemSelect?: (item: ReportRailItem) => void
}) {
  return (
    <Surface
      data-slot="report-rail"
      className={cn("grid content-start gap-4", className)}
      {...props}
    >
      <SurfaceHeader>
        <SurfaceTitle>{title}</SurfaceTitle>
        {description ? (
          <SurfaceDescription>{description}</SurfaceDescription>
        ) : null}
      </SurfaceHeader>
      <div className="grid gap-2">
        {items.map((item) => {
          const active = item.id === activeItemId

          return (
            <button
              key={item.id}
              type="button"
              className={cn(
                "grid grid-cols-[2rem_minmax(0,1fr)] gap-2 rounded-lg border border-transparent p-2 text-left transition-[background-color,border-color,box-shadow] duration-200 hover:bg-nextide-panel-strong",
                active &&
                  "border-nextide-tide/60 bg-nextide-tide/10 shadow-[0_0_24px_rgb(30_228_188/0.14)]"
              )}
              onClick={() => onItemSelect?.(item)}
            >
              <span
                className={cn(
                  "grid size-8 place-items-center rounded-lg bg-nextide-panel text-nextide-tide [&_svg]:size-4",
                  active && "shadow-[0_0_20px_rgb(30_228_188/0.16)]"
                )}
              >
                {statusIcon(item.status)}
              </span>
              <span className="grid min-w-0 gap-1">
                <span className="truncate text-sm font-semibold">
                  {item.title}
                </span>
                <span className="flex min-w-0 flex-wrap items-center gap-2">
                  <StatusBadge tone={statusTone[item.status]}>
                    {item.status}
                  </StatusBadge>
                  {item.timestamp ? (
                    <small className="truncate text-xs text-muted-foreground">
                      {item.timestamp}
                    </small>
                  ) : null}
                </span>
                {item.meta ? (
                  <small className="truncate text-xs text-muted-foreground">
                    {item.meta}
                  </small>
                ) : null}
              </span>
            </button>
          )
        })}
      </div>
    </Surface>
  )
}

function statusIcon(status: ReportRailStatus) {
  if (status === "processing" || status === "queued") {
    return <LoaderCircle />
  }
  if (status === "failed") {
    return <TriangleAlert />
  }
  return <FileText />
}

export { ReportRail, type ReportRailItem, type ReportRailStatus }
