import * as React from "react"
import { Play, Radio, ShieldAlert, X } from "lucide-react"

import { cn } from "@nextide/ui/lib/utils"

type LiveEventProofTimelineItem = {
  id: string
  title: React.ReactNode
  meta?: React.ReactNode
  timeLabel: React.ReactNode
  dateLabel?: React.ReactNode
  severity?: "clean" | "watch" | "alert" | "critical"
  kind?: "incident" | "stream"
}

type LiveEventProofEvidenceField = {
  label: React.ReactNode
  value: React.ReactNode
}

function LiveEventProofModal({
  creatorLabel,
  creatorMark,
  evidenceFields,
  evidenceSummary,
  incidentMeta,
  incidentTitle,
  isFlagged = false,
  onClose,
  onTimelineItemSelect,
  open,
  selectedTimelineItemId,
  timelineItems,
  transcript,
  waveform = defaultWaveform(),
}: {
  creatorLabel: React.ReactNode
  creatorMark?: React.ReactNode
  evidenceFields: LiveEventProofEvidenceField[]
  evidenceSummary: React.ReactNode
  incidentMeta?: React.ReactNode
  incidentTitle: React.ReactNode
  isFlagged?: boolean
  onClose: () => void
  onTimelineItemSelect?: (item: LiveEventProofTimelineItem) => void
  open: boolean
  selectedTimelineItemId?: string | null
  timelineItems: LiveEventProofTimelineItem[]
  transcript: React.ReactNode
  waveform?: number[]
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4 backdrop-blur-xl"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        className="grid max-h-[calc(100vh-2rem)] w-[min(70rem,calc(100vw-2rem))] grid-rows-[auto_minmax(0,1fr)] overflow-hidden rounded-lg border border-nextide-tide/20 bg-background shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex min-w-0 items-center justify-between gap-4 border-b border-nextide-line px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-nextide-tide/25 bg-nextide-tide/10 text-xs font-medium text-nextide-tide">
              {creatorMark ?? "LI"}
            </span>
            <span className="grid min-w-0 gap-0.5">
              <small className="text-xs font-medium text-muted-foreground uppercase">
                Live evidence
              </small>
              <strong className="truncate text-lg leading-none">
                {creatorLabel}
              </strong>
            </span>
            <span
              className={cn(
                "inline-flex min-h-6 items-center gap-1.5 rounded-md border px-2 text-xs font-medium",
                isFlagged
                  ? "border-nextide-red/30 bg-nextide-red/10 text-nextide-red"
                  : "border-nextide-tide/30 bg-nextide-tide/10 text-nextide-tide"
              )}
            >
              <span className="size-1.5 rounded-full bg-current shadow-[0_0_10px_currentColor]" />
              {isFlagged ? "Flagged" : "Clean"}
            </span>
          </div>
          <button
            type="button"
            aria-label="Close"
            className="grid size-9 place-items-center rounded-lg border border-nextide-line bg-card/60 text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="grid min-h-0 lg:grid-cols-[21rem_minmax(0,1fr)]">
          <aside className="min-h-0 overflow-y-auto border-b border-nextide-line bg-black/15 p-4 lg:border-r lg:border-b-0">
            <h3 className="mb-3 text-xs font-medium tracking-wide uppercase">
              Timeline
            </h3>
            <div className="grid">
              {timelineItems.map((item) => (
                <TimelineItem
                  item={item}
                  key={item.id}
                  selected={item.id === selectedTimelineItemId}
                  onSelect={onTimelineItemSelect}
                />
              ))}
            </div>
          </aside>
          <main className="grid min-h-0 content-start gap-3 overflow-y-auto p-4">
            <div className="grid gap-1">
              <span className="text-xs font-medium text-muted-foreground uppercase">
                Incident proof
              </span>
              <h2 className="text-2xl leading-none font-medium">
                {incidentTitle}
              </h2>
              {incidentMeta ? (
                <p className="text-sm text-muted-foreground">{incidentMeta}</p>
              ) : null}
            </div>
            <ProofPanel title="Transcript">
              <div className="grid grid-cols-[3.75rem_minmax(0,1fr)] gap-3 font-mono text-sm">
                <span className="text-nextide-tide">0:00</span>
                <strong>{transcript}</strong>
              </div>
            </ProofPanel>
            <ProofPanel title="Audio">
              <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_4.5rem] items-center gap-3 rounded-lg border border-nextide-line bg-black/20 p-2">
                <button
                  type="button"
                  aria-label="Play audio proof"
                  className="grid size-10 place-items-center rounded-full bg-nextide-tide text-background"
                >
                  <Play className="size-4" />
                </button>
                <div className="relative grid h-14 grid-cols-[repeat(72,minmax(2px,1fr))] items-center gap-0.5 before:absolute before:inset-x-0 before:top-1/2 before:h-px before:bg-nextide-tide/20">
                  {waveform.map((height, index) => (
                    <span
                      className="relative z-10 min-h-1 rounded bg-nextide-tide/35"
                      key={index}
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
                <span className="text-right text-xs text-muted-foreground tabular-nums">
                  0:00 / 0:19
                </span>
              </div>
            </ProofPanel>
            <ProofPanel title="Evidence">
              <dl className="grid gap-2 sm:grid-cols-3">
                {evidenceFields.map((field, index) => (
                  <div
                    className="min-w-0 rounded-lg border border-nextide-line bg-black/15 p-2"
                    key={index}
                  >
                    <dt className="text-ui-caption font-medium text-muted-foreground uppercase">
                      {field.label}
                    </dt>
                    <dd className="mt-1 truncate text-sm">{field.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-sm text-muted-foreground">{evidenceSummary}</p>
            </ProofPanel>
          </main>
        </div>
      </section>
    </div>
  )
}

function TimelineItem({
  item,
  onSelect,
  selected,
}: {
  item: LiveEventProofTimelineItem
  onSelect?: (item: LiveEventProofTimelineItem) => void
  selected?: boolean
}) {
  const icon =
    item.kind === "stream" ? (
      <Radio className="size-3.5" />
    ) : (
      <ShieldAlert className="size-3.5" />
    )

  const body = (
    <>
      <span className="pt-2 text-right text-xs text-muted-foreground tabular-nums">
        {item.timeLabel}
      </span>
      <span
        className={cn(
          "relative z-10 grid size-8 place-items-center rounded-full border bg-background",
          item.kind === "stream" &&
            "border-nextide-purple/45 text-nextide-purple",
          item.severity === "clean" &&
            "border-nextide-tide/45 text-nextide-tide",
          item.severity === "watch" &&
            "border-nextide-yellow/45 text-nextide-yellow",
          ["alert", "critical"].includes(item.severity ?? "") &&
            "border-nextide-red/45 text-nextide-red"
        )}
      >
        {icon}
      </span>
      <span className="grid min-w-0 gap-0.5 pt-1 text-left">
        <strong
          className={cn(
            "truncate text-sm",
            selected ? "text-nextide-tide" : "text-foreground"
          )}
        >
          {item.title}
        </strong>
        {item.meta ? (
          <small className="truncate text-xs text-muted-foreground">
            {item.meta}
          </small>
        ) : null}
      </span>
    </>
  )

  const className =
    "relative grid min-h-14 grid-cols-[3.375rem_2rem_minmax(0,1fr)] gap-2 pb-3 after:absolute after:bottom-0 after:left-[4.375rem] after:top-8 after:w-0.5 after:rounded-full after:bg-gradient-to-b after:from-nextide-tide/55 after:to-nextide-purple/35"

  if (!onSelect || item.kind === "stream") {
    return <div className={className}>{body}</div>
  }

  return (
    <button type="button" className={className} onClick={() => onSelect(item)}>
      {body}
    </button>
  )
}

function ProofPanel({
  children,
  title,
}: {
  children: React.ReactNode
  title: React.ReactNode
}) {
  return (
    <section className="grid gap-3 rounded-lg border border-nextide-line bg-card/60 p-3">
      <header className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </header>
      {children}
    </section>
  )
}

function defaultWaveform() {
  return Array.from({ length: 72 }, (_, index) => {
    const a = Math.sin(index * 0.72) * 0.5 + 0.5
    const b = Math.sin(index * 0.21 + 1.4) * 0.5 + 0.5
    const c = Math.sin(index * 1.37 + 0.2) * 0.5 + 0.5
    return Math.round(
      18 +
        Math.max(0.14, Math.min(0.92, 0.14 + a * 0.34 + b * 0.22 + c * 0.14)) *
          82
    )
  })
}

export {
  LiveEventProofModal,
  type LiveEventProofEvidenceField,
  type LiveEventProofTimelineItem,
}
