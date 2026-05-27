import * as React from "react"
import { AudioLines, MessageSquareWarning, ShieldCheck } from "lucide-react"

import { Metric } from "@nextide/ui/components/metric"
import { ScoreThresholdMeter } from "@nextide/ui/components/score-threshold-meter"
import { StatusBadge } from "@nextide/ui/components/status-badge"
import {
  Surface,
  SurfaceDescription,
  SurfaceHeader,
  SurfaceTitle,
} from "@nextide/ui/components/surface"
import { cn } from "@nextide/ui/lib/utils"

type LiveguardTimelineEvent = {
  id: string
  time: React.ReactNode
  label: React.ReactNode
  detail?: React.ReactNode
  tone?: "neutral" | "success" | "warning" | "danger"
}

type LiveguardProofRow = {
  id: string
  label: React.ReactNode
  value: React.ReactNode
  tone?: "neutral" | "success" | "warning" | "danger"
}

const eventToneClasses = {
  neutral: "border-nextide-line bg-background/30",
  success: "border-nextide-tide/45 bg-nextide-tide/10",
  warning: "border-nextide-yellow/45 bg-nextide-yellow/10",
  danger: "border-nextide-red/45 bg-nextide-red/10",
}

function LiveguardIncidentReview({
  title = "LiveGuard incident review",
  description = "Creator timeline, transcript proof, and score threshold evidence.",
  creator,
  incidentLabel,
  outcome,
  score,
  threshold,
  events,
  proofRows,
  transcript,
  className,
  ...props
}: React.ComponentProps<typeof Surface> & {
  title?: React.ReactNode
  description?: React.ReactNode
  creator: React.ReactNode
  incidentLabel: React.ReactNode
  outcome: React.ReactNode
  score: number
  threshold: number
  events: LiveguardTimelineEvent[]
  proofRows: LiveguardProofRow[]
  transcript: React.ReactNode
}) {
  return (
    <Surface
      data-slot="liveguard-incident-review"
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
        <Metric
          icon={<ShieldCheck />}
          value={outcome}
          label="Outcome"
          detail={incidentLabel}
        />
        <Metric
          icon={<MessageSquareWarning />}
          value={creator}
          label="Creator"
          detail="Incident owner"
        />
        <Metric
          icon={<AudioLines />}
          value={`${Math.round(score * 100)}%`}
          label="Proof score"
          detail={`Threshold ${Math.round(threshold * 100)}%`}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Surface variant="plain" className="grid content-start gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <strong className="text-sm">Evidence timeline</strong>
            <StatusBadge tone="warning">Review</StatusBadge>
          </div>
          <div className="grid gap-2">
            {events.map((event) => (
              <div
                key={event.id}
                className={cn(
                  "grid grid-cols-[4.25rem_minmax(0,1fr)] gap-3 rounded-lg border p-2 text-sm",
                  eventToneClasses[event.tone ?? "neutral"]
                )}
              >
                <span className="text-xs font-semibold text-nextide-tide">
                  {event.time}
                </span>
                <span className="grid min-w-0 gap-1">
                  <strong className="truncate leading-tight">
                    {event.label}
                  </strong>
                  {event.detail ? (
                    <span className="text-xs text-muted-foreground">
                      {event.detail}
                    </span>
                  ) : null}
                </span>
              </div>
            ))}
          </div>
        </Surface>

        <div className="grid gap-4">
          <Surface variant="plain" className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <strong className="text-sm">Threshold proof</strong>
              <StatusBadge tone={score >= threshold ? "danger" : "success"}>
                {score >= threshold ? "Escalate" : "Below"}
              </StatusBadge>
            </div>
            <ScoreThresholdMeter score={score} threshold={threshold} />
            <div className="grid gap-2 sm:grid-cols-2">
              {proofRows.map((row) => (
                <div
                  key={row.id}
                  className="rounded-lg border border-nextide-line bg-background/25 p-2"
                >
                  <span className="text-xs text-muted-foreground">
                    {row.label}
                  </span>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <strong className="text-sm">{row.value}</strong>
                    <StatusBadge tone={row.tone ?? "neutral"}>
                      {row.tone ?? "neutral"}
                    </StatusBadge>
                  </div>
                </div>
              ))}
            </div>
          </Surface>

          <Surface variant="plain" className="grid gap-2">
            <strong className="text-sm">Transcript proof</strong>
            <div className="max-h-44 overflow-auto rounded-lg border border-nextide-line bg-background/25 p-3 text-sm leading-relaxed text-muted-foreground">
              {transcript}
            </div>
          </Surface>
        </div>
      </div>
    </Surface>
  )
}

export {
  LiveguardIncidentReview,
  type LiveguardProofRow,
  type LiveguardTimelineEvent,
}
