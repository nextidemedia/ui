import * as React from "react"
import { Bolt, Download, FileSpreadsheet } from "lucide-react"

import { Button } from "@nextide/ui/components/button"
import { DataLedger } from "@nextide/ui/components/data-ledger"
import { Metric } from "@nextide/ui/components/metric"
import {
  ScheduleControl,
  type ScheduleControlValue,
} from "@nextide/ui/components/schedule-control"
import { StatusBadge } from "@nextide/ui/components/status-badge"
import {
  Surface,
  SurfaceDescription,
  SurfaceHeader,
  SurfaceTitle,
} from "@nextide/ui/components/surface"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@nextide/ui/components/table"
import { cn } from "@nextide/ui/lib/utils"

type ExportWorkbookState = "current" | "stale" | "missing"

type ExportSessionRow = {
  id: string
  creator: React.ReactNode
  window: React.ReactNode
  metric: React.ReactNode
  status: React.ReactNode
}

function ExportWorkbench({
  schedule,
  onScheduleChange,
  workbookState,
  nextRun,
  workbookName,
  generatedUntil,
  sessions,
  className,
  onGenerate,
  onDownload,
  ...props
}: React.ComponentProps<typeof Surface> & {
  schedule: ScheduleControlValue
  onScheduleChange: (value: ScheduleControlValue) => void
  workbookState: ExportWorkbookState
  nextRun: React.ReactNode
  workbookName?: React.ReactNode
  generatedUntil?: React.ReactNode
  sessions: ExportSessionRow[]
  onGenerate?: () => void
  onDownload?: () => void
}) {
  const workbookTone =
    workbookState === "current"
      ? "success"
      : workbookState === "stale"
        ? "warning"
        : "neutral"
  const workbookLabel =
    workbookState === "current"
      ? "Current"
      : workbookState === "stale"
        ? "Stale"
        : "Missing"

  return (
    <Surface
      data-slot="export-workbench"
      className={cn("grid gap-4", className)}
      {...props}
    >
      <SurfaceHeader>
        <SurfaceTitle>Excel export workbench</SurfaceTitle>
        <SurfaceDescription>
          Schedule automation, inspect workbook freshness, and review session
          output.
        </SurfaceDescription>
      </SurfaceHeader>
      <div className="grid gap-3 md:grid-cols-3">
        <Metric
          icon={<FileSpreadsheet />}
          value={workbookLabel}
          label="Workbook state"
          detail={workbookName ?? "Campaign workbook"}
          className={cn(
            workbookState === "current" && "border-nextide-tide/35",
            workbookState === "stale" && "border-nextide-yellow/35"
          )}
        />
        <Metric
          icon={<Bolt />}
          value={nextRun}
          label="Next run"
          detail="Server cadence"
        />
        <div className="grid gap-2 rounded-lg border border-nextide-line bg-nextide-panel p-3">
          <span className="text-xs font-medium text-muted-foreground">
            Workbook actions
          </span>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={onGenerate}>
              <Bolt />
              Generate
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={workbookState !== "current"}
              onClick={onDownload}
            >
              <Download />
              Download
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">
            {generatedUntil ?? "No generated window yet"}
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Surface variant="plain" className="grid gap-3">
          <div className="flex items-center justify-between gap-3">
            <strong className="text-sm">Schedule</strong>
            <StatusBadge tone={workbookTone}>{workbookLabel}</StatusBadge>
          </div>
          <ScheduleControl value={schedule} onValueChange={onScheduleChange} />
        </Surface>

        <DataLedger
          title="Session reports"
          description="Dense run output ready for spreadsheet export."
          countLabel={`${sessions.length} sessions`}
        >
          <div className="grid gap-2 sm:hidden">
            {sessions.map((row) => (
              <div
                key={row.id}
                className="grid gap-2 rounded-lg border border-nextide-line bg-background/25 p-2 text-sm"
              >
                <div className="flex min-w-0 items-start justify-between gap-2">
                  <strong className="min-w-0 truncate">{row.creator}</strong>
                  <span className="shrink-0">{row.status}</span>
                </div>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 text-xs">
                  <span className="min-w-0 truncate text-muted-foreground">
                    {row.window}
                  </span>
                  <strong>{row.metric}</strong>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden sm:block">
            <Table className="table-fixed border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead className="w-[28%]">Creator</TableHead>
                  <TableHead className="w-[32%]">Window</TableHead>
                  <TableHead className="w-[16%]">Metric</TableHead>
                  <TableHead className="w-[24%]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-0 hover:bg-transparent"
                  >
                    <TableCell className="rounded-l-lg border-y border-l border-nextide-line bg-background/25 whitespace-normal">
                      <span className="block min-w-0 truncate">
                        {row.creator}
                      </span>
                    </TableCell>
                    <TableCell className="border-y border-nextide-line bg-background/25 whitespace-normal text-muted-foreground">
                      <span className="block min-w-0 truncate">
                        {row.window}
                      </span>
                    </TableCell>
                    <TableCell className="border-y border-nextide-line bg-background/25 font-medium whitespace-normal">
                      {row.metric}
                    </TableCell>
                    <TableCell className="rounded-r-lg border-y border-r border-nextide-line bg-background/25 whitespace-normal">
                      {row.status}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DataLedger>
      </div>
    </Surface>
  )
}

export { ExportWorkbench, type ExportSessionRow, type ExportWorkbookState }
