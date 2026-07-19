import * as React from "react"
import { MessageSquare, ShieldAlert, Sparkles } from "lucide-react"

import { cn } from "@nextide/ui/lib/utils"

type LiveEventTimelineLane =
  | "creator-brand-safety"
  | "creator-mentions"
  | "chat-mentions"
type LiveEventTimelineSeverity = "clean" | "watch" | "alert" | "critical"

type LiveEventTimelineIncident = {
  id: string
  lane: LiveEventTimelineLane
  title: React.ReactNode
  kind: React.ReactNode
  timeLabel: React.ReactNode
  severity: LiveEventTimelineSeverity
  score: number
  threshold: number
  tier: React.ReactNode
  detail: React.ReactNode
  transcript: React.ReactNode
}

const laneMeta: Record<
  LiveEventTimelineLane,
  { label: string; icon: React.ReactNode }
> = {
  "creator-brand-safety": {
    label: "Creator Brand Safety",
    icon: <ShieldAlert className="size-4" />,
  },
  "creator-mentions": {
    label: "Creator Mentions",
    icon: <Sparkles className="size-4" />,
  },
  "chat-mentions": {
    label: "Chat Mentions",
    icon: <MessageSquare className="size-4" />,
  },
}

const severityClasses: Record<LiveEventTimelineSeverity, string> = {
  clean: "border-nextide-tide/55 bg-nextide-tide/10 text-nextide-tide",
  watch: "border-nextide-yellow/50 bg-nextide-yellow/10 text-nextide-yellow",
  alert: "border-nextide-red/55 bg-nextide-red/10 text-nextide-red",
  critical: "border-nextide-red bg-nextide-red/15 text-nextide-red",
}

function LiveEventTimeline({
  incidents,
  activeIncidentId,
  onIncidentFocus,
  onIncidentOpen,
  className,
  ...props
}: React.ComponentProps<"section"> & {
  incidents: LiveEventTimelineIncident[]
  activeIncidentId?: string | null
  onIncidentFocus?: (incident: LiveEventTimelineIncident) => void
  onIncidentOpen: (incident: LiveEventTimelineIncident) => void
}) {
  const activeIncident =
    incidents.find((incident) => incident.id === activeIncidentId) ??
    incidents[0] ??
    null

  return (
    <section
      data-slot="live-event-timeline"
      className={cn("grid gap-4 xl:grid-cols-[minmax(0,1fr)_21rem]", className)}
      {...props}
    >
      <div className="grid gap-3">
        {(Object.keys(laneMeta) as LiveEventTimelineLane[]).map((lane) => {
          const laneIncidents = incidents.filter(
            (incident) => incident.lane === lane
          )

          return (
            <div
              key={lane}
              className="grid gap-4 rounded-md border border-nextide-line bg-nextide-panel/80 p-3 md:grid-cols-[13rem_minmax(0,1fr)]"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="grid size-8 shrink-0 place-items-center rounded-full border border-nextide-tide/25 bg-nextide-tide/8 text-nextide-tide">
                  {laneMeta[lane].icon}
                </span>
                <span className="grid min-w-0">
                  <strong className="truncate text-sm">
                    {laneMeta[lane].label}
                  </strong>
                  <small className="text-xs text-muted-foreground">
                    {laneIncidents.length} signals
                  </small>
                </span>
              </div>
              <div className="relative flex min-w-0 gap-4 overflow-x-auto pb-1 before:absolute before:top-4 before:right-3 before:left-16 before:h-0.5 before:rounded-full before:bg-gradient-to-r before:from-nextide-tide/60 before:to-nextide-purple/40">
                {laneIncidents.length > 0 ? (
                  laneIncidents.map((incident) => (
                    <button
                      key={incident.id}
                      type="button"
                      className={cn(
                        "relative z-10 grid w-64 shrink-0 grid-cols-[3.25rem_2.125rem_minmax(0,1fr)] gap-2 border-0 bg-transparent p-0 text-left",
                        "focus-visible:ring-(length:--nextide-focus-ring-width) focus-visible:ring-ring focus-visible:outline-none",
                        activeIncident?.id === incident.id && "text-foreground"
                      )}
                      onClick={() => onIncidentOpen(incident)}
                      onFocus={() => onIncidentFocus?.(incident)}
                      onMouseEnter={() => onIncidentFocus?.(incident)}
                    >
                      <span className="pt-2 text-right text-xs text-muted-foreground tabular-nums">
                        {incident.timeLabel}
                      </span>
                      <span
                        className={cn(
                          "grid size-8 place-items-center rounded-full border shadow-inner",
                          severityClasses[incident.severity]
                        )}
                      >
                        <ShieldAlert className="size-3.5" />
                      </span>
                      <span className="grid min-w-0 gap-0.5 pt-1">
                        <strong className="truncate text-sm text-foreground">
                          {incident.title}
                        </strong>
                        <small className="truncate text-xs text-muted-foreground">
                          {incident.score.toFixed(2)} score
                        </small>
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No incidents in this lane.
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <aside className="grid content-start gap-3 rounded-md border border-nextide-line bg-nextide-panel/80 p-4">
        {activeIncident ? (
          <>
            <span className="text-xs font-medium text-nextide-tide">
              {activeIncident.kind}
            </span>
            <h3 className="text-xl font-medium">{activeIncident.title}</h3>
            <p className="text-sm text-muted-foreground">
              {activeIncident.detail}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <TimelineMetric label="Score">
                {activeIncident.score.toFixed(2)}
              </TimelineMetric>
              <TimelineMetric label="Threshold">
                {activeIncident.threshold.toFixed(2)}
              </TimelineMetric>
              <TimelineMetric label="Tier">
                {activeIncident.tier}
              </TimelineMetric>
            </div>
            <blockquote className="rounded-md border border-nextide-line bg-background/25 p-3 text-sm">
              {activeIncident.transcript}
            </blockquote>
          </>
        ) : null}
      </aside>
    </section>
  )
}

function TimelineMetric({
  label,
  children,
}: {
  label: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <span className="grid gap-1 rounded-md border border-nextide-line bg-background/25 p-2">
      <small className="text-ui-caption text-muted-foreground uppercase">
        {label}
      </small>
      <strong className="text-sm">{children}</strong>
    </span>
  )
}

export {
  LiveEventTimeline,
  type LiveEventTimelineIncident,
  type LiveEventTimelineLane,
  type LiveEventTimelineSeverity,
}
