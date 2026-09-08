import { IntelligenceProgressionChart } from "@nextide/ui/blocks/intelligence-progression-chart"
import { ReportRail } from "@nextide/ui/blocks/report-rail"
import { ReportReader } from "@nextide/ui/blocks/report-reader"
import {
  AudioLines,
  CalendarClock,
  Check,
  Clock3,
  ShieldAlert,
  Sparkles,
} from "lucide-react"
import type { ComponentProps } from "react"
import { useState } from "react"
import { ComponentReference } from "./component-reference"
import { reportHistory } from "./mining-data"
function IntelligenceReportMiningPage() {
  const [activeReportId, setActiveReportId] = useState("report-current")

  return (
    <section className="grid gap-4">
      <div className="grid gap-4 2xl:grid-cols-[17rem_minmax(0,1fr)]">
        <div className="grid content-start gap-2">
          <ComponentReference names="ReportRail" />
          <ReportRail
            items={reportHistory}
            activeItemId={activeReportId}
            onItemSelect={(item) => setActiveReportId(item.id)}
          />
        </div>
        <div className="grid content-start gap-2">
          <ComponentReference names="ReportReader" />
          <ReportReader
            title="Starforge weekly intelligence report"
            description="Document-style report surface for source-separated mentions, warning calls, metrics, and evidence rows."
            status="Ready"
            metrics={reportMetrics}
            warnings={[
              "Ren Kade has one competitor comparison that needs human review.",
              "Taro's late recap is scheduled but not yet ingested.",
            ]}
            sections={reportSections}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <ComponentReference names="IntelligenceProgressionChart" />
        <IntelligenceProgressionChart
          title="Report generation backbone"
          description="Follow source preparation, analysis, evidence fusion, and final report assembly."
          stages={reportStages}
        />
      </div>
    </section>
  )
}
export { IntelligenceReportMiningPage }

const reportSections: ComponentProps<typeof ReportReader>["sections"] = [
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
]

const reportMetrics: ComponentProps<typeof ReportReader>["metrics"] = [
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
]

const reportStages: ComponentProps<
  typeof IntelligenceProgressionChart
>["stages"] = [
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
    id: "chat-analyze",
    label: "Confirm",
    detail: "Decision pending",
    status: "queued",
    icon: <Check />,
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
]
