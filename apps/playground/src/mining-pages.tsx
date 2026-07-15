import { useReducer, useState } from "react"
import {
  Activity,
  AudioLines,
  CalendarClock,
  Check,
  Clock3,
  Database,
  DollarSign,
  ShieldAlert,
  Sparkles,
} from "lucide-react"

import {
  CampaignScheduleMatrix,
  type CampaignScheduleBooking,
} from "@nextide/ui/blocks/campaign-schedule-matrix"
import { EvidenceDrawer } from "@nextide/ui/blocks/evidence-drawer"
import { ExportWorkbench } from "@nextide/ui/blocks/export-workbench"
import { IntelligenceProgressionChart } from "@nextide/ui/blocks/intelligence-progression-chart"
import { SignalPlate } from "@nextide/ui/blocks/signal-plate"
import { LiveguardIncidentReview } from "@nextide/ui/blocks/liveguard-incident-review"
import { PacingConfigurator } from "@nextide/ui/blocks/pacing-configurator"
import { ReportRail, type ReportRailItem } from "@nextide/ui/blocks/report-rail"
import { ReportReader } from "@nextide/ui/blocks/report-reader"
import {
  RunMonitorTable,
  type RunMonitorRow,
} from "@nextide/ui/blocks/run-monitor-table"
import { DataLedger } from "@nextide/ui/components/data-ledger"
import { type HourlyPacingBucket } from "@nextide/ui/components/hourly-pacing-chart"
import { Metric } from "@nextide/ui/components/metric"
import type { ScheduleControlValue } from "@nextide/ui/components/schedule-control"
import { StatusBadge } from "@nextide/ui/components/status-badge"
import {
  Surface,
  SurfaceHeader,
  SurfaceTitle,
} from "@nextide/ui/components/surface"

const scheduleCreators = [
  { id: "mina", name: "Mina Vale", meta: "Twitch / YouTube", avatar: "MV" },
  { id: "ren", name: "Ren Kade", meta: "Kick", avatar: "RK" },
  { id: "taro", name: "Taro", meta: "YouTube", avatar: "TA" },
  { id: "ivy", name: "Ivy North", meta: "Twitch partner", avatar: "IN" },
]

const scheduleDays = [
  { id: "mon", label: "Mon", meta: "May 11" },
  { id: "tue", label: "Tue", meta: "May 12" },
  { id: "wed", label: "Wed", meta: "May 13", today: true },
  { id: "thu", label: "Thu", meta: "May 14" },
  { id: "fri", label: "Fri", meta: "May 15" },
  { id: "sat", label: "Sat", meta: "May 16" },
  { id: "sun", label: "Sun", meta: "May 17" },
]

const scheduleBookings: CampaignScheduleBooking[] = [
  {
    id: "booking-1",
    creatorId: "mina",
    title: "Launch read",
    meta: "2h sponsored slot",
    startIndex: 0,
    endIndex: 2,
    tone: "success",
    status: "Live",
    statusIndicator: "pulse",
  },
  {
    id: "booking-2",
    creatorId: "ren",
    title: "Challenge stream",
    meta: "Guarded watch",
    startIndex: 2,
    endIndex: 3,
    tone: "warning",
    status: "Review",
  },
  {
    id: "booking-3",
    creatorId: "taro",
    title: "Late recap",
    meta: "Workbook pending",
    startIndex: 4,
    endIndex: 5,
    tone: "processing",
    status: "Queued",
  },
  {
    id: "booking-4",
    creatorId: "ivy",
    title: "Co-stream proof",
    meta: "2 campaign tags",
    startIndex: 1,
    endIndex: 1,
    tone: "success",
    status: "Ready",
  },
]

const pacingBuckets: HourlyPacingBucket[] = [
  64, 48, 38, 32, 36, 44, 52, 63, 76, 91, 118, 143, 174, 152, 126, 112, 109,
  138, 185, 242, 296, 304, 248, 162,
].map((value, hour) => ({
  id: `pacing-${hour}`,
  hour,
  value,
  detail: hour >= 19 && hour <= 21 ? "prime window" : "delivery pressure",
}))

const exportSchedule: ScheduleControlValue = {
  cadence: "weekly",
  time: "09:00",
  weekdayIso: 1,
  dayOfMonth: 1,
  biweeklyAnchor: "this",
}

const runRows: RunMonitorRow[] = [
  {
    id: "run-1",
    title: "Starforge launch room",
    owner: "Mina Vale",
    source: "Twitch",
    startedAt: "18:04",
    duration: "2h 44m",
    status: "Complete",
    tone: "success",
    stages: [
      { id: "vod", label: "VOD", status: "complete" },
      { id: "chat", label: "Chat", status: "complete" },
      { id: "fuse", label: "Fuse", status: "complete" },
      { id: "report", label: "Report", status: "complete" },
    ],
  },
  {
    id: "run-2",
    title: "Sponsored challenge slot",
    owner: "Ren Kade",
    source: "Kick",
    startedAt: "19:12",
    duration: "46m",
    status: "Running",
    tone: "processing",
    stages: [
      { id: "vod", label: "VOD", status: "complete" },
      { id: "chat", label: "Chat", status: "running" },
      { id: "fuse", label: "Fuse", status: "queued" },
      { id: "report", label: "Report", status: "queued" },
    ],
  },
  {
    id: "run-3",
    title: "Late recap safety pass",
    owner: "Taro",
    source: "YouTube",
    startedAt: "20:35",
    duration: "18m",
    status: "Review",
    tone: "warning",
    stages: [
      { id: "vod", label: "VOD", status: "complete" },
      { id: "chat", label: "Chat", status: "complete" },
      { id: "fuse", label: "Fuse", status: "running" },
      { id: "report", label: "Report", status: "queued" },
    ],
  },
]

const reportHistory: ReportRailItem[] = [
  {
    id: "report-current",
    title: "Starforge weekly report",
    meta: "Creators, streams, context, proof",
    status: "completed",
    timestamp: "Today 09:14",
  },
  {
    id: "report-processing",
    title: "Daedalus pilot fuse",
    meta: "Chat evidence still running",
    status: "processing",
    timestamp: "12m ago",
  },
  {
    id: "report-draft",
    title: "Orbit creator draft",
    meta: "Missing context bucket",
    status: "draft",
    timestamp: "Yesterday",
  },
]

function WebMiningPage() {
  const [activeBookingId, setActiveBookingId] = useState("booking-2")
  const [activePresetId, setActivePresetId] = useState("7d")
  const [schedule, setSchedule] = useReducer(
    (_current: ScheduleControlValue, next: ScheduleControlValue) => next,
    exportSchedule
  )

  return (
    <section className="grid gap-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.72fr)]">
        <SignalPlate
          eyebrow="Campaign operations"
          title="Campaign command center"
          description="Review schedules, pacing, exports, and LiveGuard proof without leaving the active campaign."
          status="Operations ready"
          statusTone="success"
          metrics={[
            { label: "Campaigns", value: "4", detail: "in current scope" },
            { label: "Delivery", value: "Live", detail: "signals current" },
            { label: "Priority", value: "P1", detail: "highest value" },
          ]}
        />
        <SignalPlate
          eyebrow="Operational guardrails"
          title="Clear ownership at every step"
          description="Operators see only the campaign state, controls, and approvals needed for the decision in front of them."
          status="Guardrails active"
          statusTone="warning"
          metrics={[
            { label: "Approvals", value: "2", detail: "awaiting review" },
            { label: "Delivery", value: "Live", detail: "current state" },
            { label: "Exports", value: "3", detail: "ready now" },
          ]}
        />
      </div>

      <CampaignScheduleMatrix
        creators={scheduleCreators}
        days={scheduleDays}
        bookings={scheduleBookings}
        activeBookingId={activeBookingId}
        onBookingSelect={(booking) => setActiveBookingId(booking.id)}
      />

      <PacingConfigurator
        presets={[
          { id: "today", label: "Today", meta: "Live window" },
          { id: "7d", label: "7 days", meta: "Default pacing" },
          { id: "14d", label: "14 days", meta: "Campaign range" },
          { id: "custom", label: "Custom", meta: "Pinned viewport" },
        ]}
        activePresetId={activePresetId}
        buckets={pacingBuckets}
        rangeLabel="7 days"
        targetLabel="100%"
        actualLabel="118%"
        onPresetChange={(preset) => setActivePresetId(preset.id)}
      />

      <ExportWorkbench
        schedule={schedule}
        onScheduleChange={setSchedule}
        workbookState="current"
        nextRun="Mon 09:00"
        workbookName="Starforge weekly workbook"
        generatedUntil="Generated through May 12"
        sessions={[
          {
            id: "session-1",
            creator: "Mina Vale",
            window: "May 12, 18:00-20:00",
            metric: "74k",
            status: <StatusBadge tone="success">Reported</StatusBadge>,
          },
          {
            id: "session-2",
            creator: "Ren Kade",
            window: "May 13, live",
            metric: "31k",
            status: <StatusBadge tone="processing">Live</StatusBadge>,
          },
          {
            id: "session-3",
            creator: "Taro",
            window: "May 14, scheduled",
            metric: "Pending",
            status: <StatusBadge tone="warning">Final</StatusBadge>,
          },
        ]}
      />

      <LiveguardIncidentReview
        creator="Ren Kade"
        incidentLabel="Competitor mention under threshold"
        outcome="No escalation"
        score={0.62}
        threshold={0.82}
        events={[
          {
            id: "event-1",
            time: "18:42",
            label: "Mention detected",
            detail: "Transcript matcher found a competitor reference.",
            tone: "warning",
          },
          {
            id: "event-2",
            time: "18:43",
            label: "Policy context matched",
            detail: "Reference happened during a creator comparison segment.",
            tone: "neutral",
          },
          {
            id: "event-3",
            time: "18:44",
            label: "Below escalation threshold",
            detail: "No suppression or client alert required.",
            tone: "success",
          },
        ]}
        proofRows={[
          { id: "score", label: "Risk score", value: "0.62", tone: "success" },
          {
            id: "confidence",
            label: "Confidence",
            value: "74%",
            tone: "warning",
          },
          { id: "window", label: "Window", value: "42s", tone: "neutral" },
          {
            id: "source",
            label: "Source",
            value: "Transcript",
            tone: "success",
          },
        ]}
        transcript="Ren compared the sponsored read against another tool, then immediately returned to the Starforge talking points. The segment stayed below the configured escalation threshold."
      />
    </section>
  )
}

function KrakenMiningPage() {
  const [activeRunId, setActiveRunId] = useState("run-2")
  const activeRun = runRows.find((row) => row.id === activeRunId) ?? runRows[0]

  return (
    <section className="grid gap-4">
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

      <RunMonitorTable
        rows={runRows}
        activeRowId={activeRunId}
        onRowSelect={(row) => setActiveRunId(row.id)}
      />

      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.72fr)]">
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
                  <span className="text-xs text-muted-foreground">
                    {detail}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </DataLedger>
      </div>
    </section>
  )
}

function IntelligenceReportMiningPage() {
  const [activeReportId, setActiveReportId] = useState("report-current")

  return (
    <section className="grid gap-4">
      <div className="grid gap-4 2xl:grid-cols-[17rem_minmax(0,1fr)]">
        <ReportRail
          items={reportHistory}
          activeItemId={activeReportId}
          onItemSelect={(item) => setActiveReportId(item.id)}
        />
        <ReportReader
          title="Starforge weekly intelligence report"
          description="Document-style report surface for source-separated mentions, warning calls, metrics, and evidence rows."
          status="Ready"
          metrics={[
            {
              id: "mentions",
              label: "Mentions",
              value: "128",
              detail: "source separated",
            },
            {
              id: "risk",
              label: "Risk windows",
              value: "3",
              detail: "all below threshold",
            },
            {
              id: "confidence",
              label: "Confidence",
              value: "82%",
              detail: "evidence backed",
            },
          ]}
          warnings={[
            "Ren Kade has one competitor comparison that needs human review.",
            "Taro's late recap is scheduled but not yet ingested.",
          ]}
          sections={[
            {
              id: "summary",
              title: "Executive summary",
              body: "The campaign read landed cleanly across the selected creator set. Twitch carried the strongest reach, while YouTube added durable replay value with lower safety pressure.",
              evidence: [
                {
                  id: "summary-1",
                  source: "Mina Vale / Twitch",
                  title: "Launch read delivered in the first hour.",
                  detail: "Transcript and chat evidence agree on brand recall.",
                  tone: "success",
                },
                {
                  id: "summary-2",
                  source: "Ren Kade / Kick",
                  title: "Comparison segment stayed under threshold.",
                  detail: "No client escalation recommended.",
                  tone: "warning",
                },
              ],
            },
            {
              id: "mentions",
              title: "Source-separated mentions",
              body: "Mentions are grouped by stream source so reviewers can inspect what came from host speech, chat, and structured campaign metadata independently.",
              evidence: [
                {
                  id: "mention-1",
                  source: "Transcript",
                  title: "42 direct mentions",
                  detail: "High-confidence speech-to-text snippets.",
                  tone: "success",
                },
                {
                  id: "mention-2",
                  source: "Chat",
                  title: "86 chat mentions",
                  detail: "Mostly positive sentiment around launch timing.",
                  tone: "success",
                },
              ],
            },
            {
              id: "safety",
              title: "Safety and compliance",
              body: "The safety section keeps human review cues close to the evidence instead of hiding them behind a separate export step.",
              evidence: [
                {
                  id: "safety-1",
                  source: "LiveGuard",
                  title: "3 soft-warning windows",
                  detail: "All remained below configured threshold.",
                  tone: "warning",
                },
                {
                  id: "safety-2",
                  source: "Policy",
                  title: "0 required escalations",
                  detail: "No failed reads or blocked phrases found.",
                  tone: "success",
                },
              ],
            },
          ]}
        />
      </div>

      <IntelligenceProgressionChart
        title="Report generation backbone"
        description="Follow source preparation, analysis, evidence fusion, and final report assembly."
        stages={[
          {
            id: "queue",
            label: "Queue",
            detail: "Report selected",
            status: "completed",
            icon: <Check />,
          },
          {
            id: "vod-ingest",
            label: "Ingest",
            detail: "Sources ready",
            status: "completed",
            icon: <AudioLines />,
          },
          {
            id: "vod-analyze",
            label: "Analyze",
            detail: "Evidence mapped",
            status: "completed",
            icon: <Sparkles />,
          },
          {
            id: "chat-ingest",
            label: "Review",
            detail: "Human pass",
            status: "processing",
            icon: <ShieldAlert />,
          },
          {
            id: "fuse",
            label: "Fuse",
            detail: "Report context",
            status: "queued",
            icon: <Clock3 />,
          },
          {
            id: "assemble",
            label: "Export",
            detail: "Workbook pending",
            status: "queued",
            icon: <CalendarClock />,
          },
        ]}
      />
    </section>
  )
}

export { IntelligenceReportMiningPage, KrakenMiningPage, WebMiningPage }
