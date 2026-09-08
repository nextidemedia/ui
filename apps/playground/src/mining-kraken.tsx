import { EvidenceDrawer } from "@nextide/ui/blocks/evidence-drawer"
import {
  RunMonitorTable,
  type RunMonitorRow,
} from "@nextide/ui/blocks/run-monitor-table"
import { SignalPlate } from "@nextide/ui/blocks/signal-plate"
import { DataLedger } from "@nextide/ui/components/data-ledger"
import { Metric } from "@nextide/ui/components/metric"
import {
  Surface,
  SurfaceHeader,
  SurfaceTitle,
} from "@nextide/ui/components/surface"
import { Activity, Database, DollarSign } from "lucide-react"
import { useState } from "react"
import { ComponentReference } from "./component-reference"
import { runRows } from "./mining-data"
function KrakenMiningPage() {
  const [activeRunId, setActiveRunId] = useState("run-2")
  const activeRun = runRows.find((row) => row.id === activeRunId) ?? runRows[0]

  return (
    <section className="grid gap-4">
      <div className="grid gap-2">
        <ComponentReference names={["SignalPlate", "Metric"]} />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.72fr)]">
          <SignalPlate
            eyebrow="Kraken"
            title="Operations monitor candidates"
            description="Run table, evidence drawer, and incident timeline patterns distilled out of the Kraken operations UI."
            status="Mining target page"
            statusTone="processing"
            metrics={[
              {
                label: "Runs",
                value: runRows.length.toString(),
                detail: "sample rows",
              },
              { label: "Stages", value: "4", detail: "monitor rail" },
              { label: "Blocks", value: "3", detail: "ops surfaces" },
            ]}
          />
          <Surface className="grid gap-3">
            <SurfaceHeader>
              <SurfaceTitle>Queue pulse</SurfaceTitle>
            </SurfaceHeader>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <Metric icon={<Activity />} value="2" label="Active lanes" />
              <Metric icon={<Database />} value="14" label="Queued jobs" />
              <Metric icon={<DollarSign />} value="$12.42" label="Run cost" />
            </div>
          </Surface>
        </div>
      </div>

      <div className="grid gap-2">
        <ComponentReference names="RunMonitorTable" />
        <RunMonitorTable
          rows={runRows}
          activeRowId={activeRunId}
          onRowSelect={(row) => setActiveRunId(row.id)}
        />
      </div>

      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.72fr)]">
        <div className="grid content-start gap-2">
          <ComponentReference names="EvidenceDrawer" />
          <RunEvidence activeRun={activeRun} />
        </div>

        <div className="grid content-start gap-2">
          <ComponentReference names="DataLedger" />
          <RunTimeline />
        </div>
      </div>
    </section>
  )
}
export { KrakenMiningPage }

function RunEvidence({ activeRun }: { activeRun: RunMonitorRow }) {
  return (
    <EvidenceDrawer
      subject={activeRun.title}
      status={activeRun.status}
      tone={activeRun.tone}
      facts={[
        { id: "owner", label: "Owner", value: activeRun.owner ?? "-" },
        { id: "source", label: "Source", value: activeRun.source ?? "-" },
        { id: "cost", label: "Cost", value: activeRun.cost ?? "$4.12" },
      ]}
      events={[
        {
          id: "decision-1",
          time: "19:14",
          title: "Monitor cache warmed",
          detail: "Stage projection was loaded before the row updated.",
          tone: "success",
        },
        {
          id: "decision-2",
          time: "19:18",
          title: "Chat evidence deferred",
          detail: "Processing continues without blocking VOD analysis.",
          tone: "processing",
        },
        {
          id: "decision-3",
          time: "19:23",
          title: "Report assembly waiting",
          detail: "Fuse stage owns the next state transition.",
          tone: "warning",
        },
      ]}
      costs={[
        {
          id: "vod",
          label: "VOD analysis",
          amount: "$2.88",
          detail: "Gemini batch",
        },
        {
          id: "chat",
          label: "Chat analysis",
          amount: "$0.91",
          detail: "Transcript map",
        },
        {
          id: "fuse",
          label: "Evidence fuse",
          amount: "$0.33",
          detail: "Report context",
        },
      ]}
    />
  )
}

function RunTimeline() {
  return (
    <DataLedger
      title="Incident timeline"
      description="Reusable event sequence without Kraken payload coupling."
      countLabel="4 events"
    >
      <div className="grid min-w-[24rem] gap-2">
        {[
          ["19:12", "Run accepted", "Queue lane selected"],
          ["19:14", "Audio extracted", "VOD stage complete"],
          ["19:18", "Chat lagged", "Retry window opened"],
          ["19:23", "Fuse pending", "Awaiting context"],
        ].map(([time, label, detail]) => (
          <div
            key={`${time}-${label}`}
            className="grid grid-cols-[4rem_minmax(0,1fr)] gap-3 rounded-lg border border-nextide-line bg-background/25 p-2 text-sm"
          >
            <span className="text-xs font-medium text-nextide-tide">
              {time}
            </span>
            <span className="grid gap-0.5">
              <strong>{label}</strong>
              <span className="text-xs text-muted-foreground">{detail}</span>
            </span>
          </div>
        ))}
      </div>
    </DataLedger>
  )
}
