import * as React from "react"

import { cn } from "@nextide/ui/lib/utils"

type ProgressiveSummaryRailRow = {
  id: string
  label: React.ReactNode
  value?: React.ReactNode
  meta?: React.ReactNode
  badge?: React.ReactNode
  hidden?: boolean
}

type ProgressiveSummaryRailSection = {
  id: string
  title: React.ReactNode
  summary?: React.ReactNode
  rows?: ProgressiveSummaryRailRow[]
  emptyLabel?: React.ReactNode
}

type ProgressiveSummaryRailStep = {
  id: string
  label: React.ReactNode
}

type ProgressiveSummaryRailSectionOverride = Omit<
  Partial<ProgressiveSummaryRailSection>,
  "id"
>

function progressiveSummaryRailSectionsFromSteps<
  Step extends ProgressiveSummaryRailStep,
>(
  steps: Step[],
  overrides: Partial<Record<string, ProgressiveSummaryRailSectionOverride>>
): ProgressiveSummaryRailSection[] {
  return steps.map((step) => ({
    id: step.id,
    title: step.label,
    ...overrides[step.id],
  }))
}

function ProgressiveSummaryRail({
  title,
  description,
  sections,
  children,
  className,
  ...props
}: Omit<React.ComponentProps<"aside">, "title"> & {
  title: React.ReactNode
  description?: React.ReactNode
  sections: ProgressiveSummaryRailSection[]
}) {
  return (
    <aside
      data-slot="progressive-summary-rail"
      className={cn("grid content-start gap-3", className)}
      {...props}
    >
      <header
        data-slot="progressive-summary-rail-header"
        className="grid gap-1"
      >
        <h2 className="text-sm font-medium">{title}</h2>
        {hasNode(description) ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </header>
      <div
        data-slot="progressive-summary-rail-sections"
        className="grid gap-2 md:grid-cols-3"
      >
        {sections.map((section) => (
          <ProgressiveSummaryRailSectionView
            key={section.id}
            section={section}
          />
        ))}
      </div>
      {children}
    </aside>
  )
}

function ProgressiveSummaryRailSectionView({
  section,
}: {
  section: ProgressiveSummaryRailSection
}) {
  const rows = (section.rows ?? []).filter(
    (row) =>
      !row.hidden &&
      (hasNode(row.value) || hasNode(row.meta) || hasNode(row.badge))
  )
  const hasRows = rows.length > 0
  const filled = hasRows || hasNode(section.summary)

  return (
    <section
      data-slot="progressive-summary-rail-section"
      data-state={filled ? "filled" : "pending"}
      className="grid min-w-0 content-start gap-2 rounded-lg border border-nextide-line bg-background/25 p-3 data-[state=filled]:border-nextide-tide/24 data-[state=pending]:border-dashed"
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <h3 className="truncate text-ui-caption font-medium tracking-wide text-muted-foreground uppercase">
          {section.title}
        </h3>
        <span
          aria-hidden="true"
          className={cn(
            "size-2 rounded-sm border",
            filled
              ? "border-nextide-tide bg-nextide-tide shadow-[0_0_10px_rgb(30_228_188/0.34)]"
              : "border-muted-foreground/45 bg-transparent"
          )}
        />
      </div>
      {hasNode(section.summary) ? (
        <strong
          data-slot="progressive-summary-rail-summary"
          className="truncate text-sm font-medium"
        >
          {section.summary}
        </strong>
      ) : null}
      {hasRows ? (
        <div
          data-slot="progressive-summary-rail-rows"
          className="grid gap-1.5"
        >
          {rows.map((row) => (
            <div
              key={row.id}
              data-slot="progressive-summary-rail-row"
              className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 text-ui-caption [&>b]:font-medium [&>i]:grid [&>i]:size-6 [&>i]:place-items-center [&>i]:rounded-md [&>i]:border [&>i]:border-nextide-line [&>i]:bg-nextide-panel [&>i]:text-ui-caption [&>i]:font-medium [&>i]:text-nextide-tide [&>i]:not-italic [&>small]:col-start-2 [&>small]:text-muted-foreground [&>span]:min-w-0 [&>span]:truncate"
            >
              {hasNode(row.badge) ? <i>{row.badge}</i> : null}
              <span>{row.label}</span>
              {hasNode(row.value) ? <b>{row.value}</b> : null}
              {hasNode(row.meta) ? <small>{row.meta}</small> : null}
            </div>
          ))}
        </div>
      ) : hasNode(section.emptyLabel) ? (
        <p
          data-slot="progressive-summary-rail-empty"
          className="text-ui-caption text-muted-foreground"
        >
          {section.emptyLabel}
        </p>
      ) : null}
    </section>
  )
}

function hasNode(value: React.ReactNode) {
  return (
    value !== null && value !== undefined && value !== false && value !== ""
  )
}

export {
  ProgressiveSummaryRail,
  progressiveSummaryRailSectionsFromSteps,
  type ProgressiveSummaryRailRow,
  type ProgressiveSummaryRailSection,
  type ProgressiveSummaryRailSectionOverride,
  type ProgressiveSummaryRailStep,
}
