import * as React from "react"
import { BadgeCheck, Quote, ShieldAlert } from "lucide-react"

import { Metric } from "@nextide/ui/components/metric"
import { Notice } from "@nextide/ui/components/notice"
import { StatusBadge } from "@nextide/ui/components/status-badge"
import {
  Surface,
  SurfaceDescription,
  SurfaceHeader,
} from "@nextide/ui/components/surface"
import { cn } from "@nextide/ui/lib/utils"

type ReportReaderMetric = {
  id: string
  label: React.ReactNode
  value: React.ReactNode
  detail?: React.ReactNode
}

type ReportReaderEvidence = {
  id: string
  source: React.ReactNode
  title: React.ReactNode
  detail?: React.ReactNode
  tone?: "neutral" | "success" | "warning" | "danger"
}

type ReportReaderSection = {
  id: string
  title: React.ReactNode
  body: React.ReactNode
  evidence?: ReportReaderEvidence[]
}

function ReportReader({
  title,
  description,
  status,
  metrics,
  warnings,
  sections,
  className,
  ...props
}: React.ComponentProps<typeof Surface> & {
  title: React.ReactNode
  description?: React.ReactNode
  status?: React.ReactNode
  metrics: ReportReaderMetric[]
  warnings?: React.ReactNode[]
  sections: ReportReaderSection[]
}) {
  return (
    <Surface
      data-slot="report-reader"
      className={cn("grid gap-5", className)}
      {...props}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SurfaceHeader>
          <SurfaceDescription>Intelligence report</SurfaceDescription>
          <h2 className="max-w-3xl text-2xl leading-tight font-medium tracking-normal">
            {title}
          </h2>
          {description ? (
            <SurfaceDescription className="max-w-3xl">
              {description}
            </SurfaceDescription>
          ) : null}
        </SurfaceHeader>
        {status ? <StatusBadge tone="success">{status}</StatusBadge> : null}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {metrics.map((metric) => (
          <Metric
            key={metric.id}
            icon={<BadgeCheck />}
            value={metric.value}
            label={metric.label}
            detail={metric.detail}
          />
        ))}
      </div>

      {warnings?.length ? (
        <Notice title="Review warnings" tone="warning" icon={<ShieldAlert />}>
          <ul className="grid gap-1">
            {warnings.map((warning) => (
              <li key={String(warning)}>{warning}</li>
            ))}
          </ul>
        </Notice>
      ) : null}

      <div className="grid gap-4">
        {sections.map((section) => (
          <section
            key={section.id}
            className="grid gap-3 rounded-xl border border-nextide-line bg-background/20 p-4"
          >
            <h3 className="text-lg leading-tight font-medium">
              {section.title}
            </h3>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {section.body}
            </p>
            {section.evidence?.length ? (
              <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,16rem),1fr))] gap-2">
                {section.evidence.map((evidence) => (
                  <EvidenceCard key={evidence.id} evidence={evidence} />
                ))}
              </div>
            ) : null}
          </section>
        ))}
      </div>
    </Surface>
  )
}

function EvidenceCard({ evidence }: { evidence: ReportReaderEvidence }) {
  return (
    <div className="grid gap-2 rounded-lg border border-nextide-line bg-nextide-panel p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          <Quote className="size-3.5 text-nextide-tide" />
          <span className="truncate">{evidence.source}</span>
        </span>
        <StatusBadge tone={evidence.tone ?? "neutral"}>
          {evidence.tone ?? "source"}
        </StatusBadge>
      </div>
      <strong className="text-sm leading-tight">{evidence.title}</strong>
      {evidence.detail ? (
        <span className="text-xs leading-snug text-muted-foreground">
          {evidence.detail}
        </span>
      ) : null}
    </div>
  )
}

export {
  ReportReader,
  type ReportReaderEvidence,
  type ReportReaderMetric,
  type ReportReaderSection,
}
