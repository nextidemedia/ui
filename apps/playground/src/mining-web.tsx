import { CampaignScheduleMatrix } from "@nextide/ui/blocks/campaign-schedule-matrix"
import { ExportWorkbench } from "@nextide/ui/blocks/export-workbench"
import { LiveEventProofModal } from "@nextide/ui/blocks/live-event-proof-modal"
import { LiveguardIncidentReview } from "@nextide/ui/blocks/liveguard-incident-review"
import { PacingConfigurator } from "@nextide/ui/blocks/pacing-configurator"
import { SignalPlate } from "@nextide/ui/blocks/signal-plate"
import { Button } from "@nextide/ui/components/button"
import type { ScheduleControlValue } from "@nextide/ui/components/schedule-control"
import { StatusBadge } from "@nextide/ui/components/status-badge"
import { useReducer, useState } from "react"
import { ComponentReference } from "./component-reference"
import {
  exportSchedule,
  pacingBuckets,
  scheduleBookings,
  scheduleCreators,
  scheduleDays,
} from "./mining-data"
function WebMiningPage() {
  const [activeBookingId, setActiveBookingId] = useState("booking-2")
  const [activePresetId, setActivePresetId] = useState("7d")
  const [pacingAction, setPacingAction] = useState("Preset ready")

  return (
    <section className="grid gap-4">
      <div className="grid gap-2">
        <ComponentReference names="SignalPlate" />
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
      </div>

      <div className="grid gap-2">
        <ComponentReference names="CampaignScheduleMatrix" />
        <CampaignScheduleMatrix
          creators={scheduleCreators}
          days={scheduleDays}
          bookings={scheduleBookings}
          activeBookingId={activeBookingId}
          onBookingSelect={(booking) => setActiveBookingId(booking.id)}
        />
      </div>

      <div className="grid gap-2">
        <ComponentReference names="PacingConfigurator" />
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
          onSave={() => setPacingAction(`Saved ${activePresetId} preset`)}
          onRevert={() => {
            setActivePresetId("7d")
            setPacingAction("Reverted to 7 days")
          }}
        />
        <output
          data-slot="pacing-configurator-demo-status"
          className="text-ui-caption text-muted-foreground"
          aria-live="polite"
        >
          {pacingAction}
        </output>
      </div>

      <WebExport />

      <WebIncidentProof />
    </section>
  )
}
export { WebMiningPage }

function WebIncidentProof() {
  const [proofOpen, setProofOpen] = useState(false)
  const [proofTimelineItemId, setProofTimelineItemId] = useState("proof-alert")
  const [audioProofStatus, setAudioProofStatus] = useState(
    "Evidence ready for review."
  )
  return (
    <div className="grid gap-2">
      <ComponentReference names="LiveguardIncidentReview" />
      <WebIncidentReview />
      <div className="flex flex-wrap items-center gap-2">
        <ComponentReference names="LiveEventProofModal" />
        <Button type="button" onClick={() => setProofOpen(true)}>
          Open proof modal
        </Button>
      </div>
      <LiveEventProofModal
        open={proofOpen}
        onClose={() => setProofOpen(false)}
        creatorLabel="Ren Kade"
        creatorMark="RK"
        incidentTitle="Competitor mention under threshold"
        incidentMeta="May 13 · 18:42"
        isFlagged
        selectedTimelineItemId={proofTimelineItemId}
        timelineItems={[
          {
            id: "proof-stream",
            title: "Stream started",
            timeLabel: "18:04",
            kind: "stream",
          },
          {
            id: "proof-alert",
            title: "Mention detected",
            meta: "Transcript evidence",
            timeLabel: "18:42",
            severity: "watch",
          },
        ]}
        onTimelineItemSelect={(item) => setProofTimelineItemId(item.id)}
        transcript="Ren compared the sponsored read against another tool, then returned to the Starforge talking points."
        evidenceFields={[
          { id: "risk", label: "Risk score", value: "0.62" },
          { id: "confidence", label: "Confidence", value: "74%" },
          { id: "window", label: "Window", value: "42s" },
        ]}
        evidenceSummary={audioProofStatus}
        onAudioPlay={() => setAudioProofStatus("Audio proof started.")}
      />
    </div>
  )
}

function WebIncidentReview() {
  return (
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
        {
          id: "score",
          label: "Risk score",
          value: "0.62",
          tone: "success",
        },
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
  )
}

function WebExport() {
  const [exportAction, setExportAction] = useState("Generated through May 12")
  const [schedule, setSchedule] = useReducer(
    (_current: ScheduleControlValue, next: ScheduleControlValue) => next,
    exportSchedule
  )
  return (
    <div className="grid gap-2">
      <ComponentReference names="ExportWorkbench" />
      <ExportWorkbench
        schedule={schedule}
        onScheduleChange={setSchedule}
        workbookState="current"
        nextRun="Mon 09:00"
        workbookName="Starforge weekly workbook"
        generatedUntil={exportAction}
        onGenerate={() => setExportAction("Generated just now")}
        onDownload={() => setExportAction("Downloaded just now")}
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
    </div>
  )
}
