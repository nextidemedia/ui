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
      <header data-slot="progressive-summary-rail-header">
        <h2>{title}</h2>
        {hasNode(description) ? <p>{description}</p> : null}
      </header>
      <div data-slot="progressive-summary-rail-sections">
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

  return (
    <section
      data-slot="progressive-summary-rail-section"
      data-state={hasRows ? "filled" : "pending"}
    >
      <h3>{section.title}</h3>
      {hasNode(section.summary) ? (
        <strong data-slot="progressive-summary-rail-summary">
          {section.summary}
        </strong>
      ) : null}
      {hasRows ? (
        <div data-slot="progressive-summary-rail-rows">
          {rows.map((row) => (
            <div
              key={row.id}
              data-slot="progressive-summary-rail-row"
              className="nextide-flip-open transition-[opacity,transform] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none"
            >
              {hasNode(row.badge) ? <i>{row.badge}</i> : null}
              <span>{row.label}</span>
              {hasNode(row.value) ? <b>{row.value}</b> : null}
              {hasNode(row.meta) ? <small>{row.meta}</small> : null}
            </div>
          ))}
        </div>
      ) : hasNode(section.emptyLabel) ? (
        <p data-slot="progressive-summary-rail-empty">{section.emptyLabel}</p>
      ) : null}
    </section>
  )
}

function hasNode(value: React.ReactNode) {
  return value !== null && value !== undefined && value !== false && value !== ""
}

export {
  ProgressiveSummaryRail,
  type ProgressiveSummaryRailRow,
  type ProgressiveSummaryRailSection,
}
