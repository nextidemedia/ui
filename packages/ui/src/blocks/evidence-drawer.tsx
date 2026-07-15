import * as React from "react"
import { FileText, GitBranch, ReceiptText } from "lucide-react"

import { DataLedger } from "@nextide/ui/components/data-ledger"
import { Metric } from "@nextide/ui/components/metric"
import { SegmentedControl } from "@nextide/ui/components/segmented-control"
import { StatusBadge } from "@nextide/ui/components/status-badge"
import {
  Surface,
  SurfaceDescription,
  SurfaceHeader,
  SurfaceTitle,
} from "@nextide/ui/components/surface"
import { cn } from "@nextide/ui/lib/utils"

type EvidenceDrawerTone =
  | "neutral"
  | "success"
  | "processing"
  | "warning"
  | "danger"

type EvidenceDrawerFact = {
  id: string
  label: React.ReactNode
  value: React.ReactNode
  detail?: React.ReactNode
}

type EvidenceDrawerEvent = {
  id: string
  time: React.ReactNode
  title: React.ReactNode
  detail?: React.ReactNode
  tone?: EvidenceDrawerTone
}

type EvidenceDrawerCost = {
  id: string
  label: React.ReactNode
  amount: React.ReactNode
  detail?: React.ReactNode
}

function EvidenceDrawer({
  title = "Evidence drawer",
  description = "Tabbed run evidence, decisions, and cost context.",
  subject,
  status,
  tone = "processing",
  facts,
  events,
  costs,
  className,
  ...props
}: React.ComponentProps<typeof Surface> & {
  title?: React.ReactNode
  description?: React.ReactNode
  subject: React.ReactNode
  status: React.ReactNode
  tone?: EvidenceDrawerTone
  facts: EvidenceDrawerFact[]
  events: EvidenceDrawerEvent[]
  costs: EvidenceDrawerCost[]
}) {
  const [activeTab, setActiveTab] = React.useReducer(
    (_current: string, nextTab: string) => nextTab,
    "decisions"
  )
  const [leavingTab, setLeavingTab] = React.useState<string | null>(null)
  const [swapDirection, setSwapDirection] = React.useState<
    "forward" | "backward"
  >("forward")
  const swapTimerRef = React.useRef<number | null>(null)
  const tabOrder = ["decisions", "sources", "costs"]

  React.useEffect(
    () => () => {
      if (swapTimerRef.current) window.clearTimeout(swapTimerRef.current)
    },
    []
  )

  const changeTab = (nextTab: string) => {
    if (nextTab === activeTab) return
    if (swapTimerRef.current) window.clearTimeout(swapTimerRef.current)
    setSwapDirection(
      tabOrder.indexOf(nextTab) > tabOrder.indexOf(activeTab)
        ? "forward"
        : "backward"
    )
    setLeavingTab(activeTab)
    setActiveTab(nextTab)
    swapTimerRef.current = window.setTimeout(() => {
      setLeavingTab(null)
      swapTimerRef.current = null
    }, 220)
  }

  return (
    <Surface
      data-slot="evidence-drawer"
      className={cn("grid gap-4", className)}
      {...props}
    >
      <SurfaceHeader>
        <SurfaceTitle>{title}</SurfaceTitle>
        {description ? (
          <SurfaceDescription>{description}</SurfaceDescription>
        ) : null}
      </SurfaceHeader>

      <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-nextide-line bg-background/20 p-3">
        <div className="grid gap-1">
          <span className="text-xs text-muted-foreground">Subject</span>
          <strong className="text-lg leading-tight">{subject}</strong>
        </div>
        <StatusBadge tone={tone}>{status}</StatusBadge>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {facts.slice(0, 3).map((fact) => (
          <Metric
            key={fact.id}
            value={fact.value}
            label={fact.label}
            detail={fact.detail}
          />
        ))}
      </div>

      <SegmentedControl
        value={activeTab}
        onValueChange={changeTab}
        aria-label="Evidence view"
        options={[
          {
            value: "decisions",
            label: <EvidenceChoice icon={<GitBranch />} label="Decisions" />,
          },
          {
            value: "sources",
            label: <EvidenceChoice icon={<FileText />} label="Sources" />,
          },
          {
            value: "costs",
            label: <EvidenceChoice icon={<ReceiptText />} label="Costs" />,
          },
        ]}
      />

      <div className="grid min-w-0 overflow-hidden [&>*]:[grid-area:1/1]">
        {leavingTab ? (
          <div
            aria-hidden="true"
            inert
            className={cn(
              "pointer-events-none min-w-0",
              swapDirection === "forward"
                ? "nextide-panel-exit-left"
                : "nextide-panel-exit-right"
            )}
          >
            <EvidencePanel tab={leavingTab} events={events} costs={costs} />
          </div>
        ) : null}
        <div
          key={activeTab}
          className={cn(
            "min-w-0",
            swapDirection === "forward"
              ? "nextide-panel-enter-right"
              : "nextide-panel-enter-left"
          )}
        >
          <EvidencePanel tab={activeTab} events={events} costs={costs} />
        </div>
      </div>
    </Surface>
  )
}

function EvidenceChoice({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: React.ReactNode
}) {
  return (
    <span className="flex min-w-0 items-center justify-center gap-1.5 max-[24rem]:[&_svg]:hidden [&_svg]:size-3.5">
      {icon}
      <span className="min-w-0 truncate">{label}</span>
    </span>
  )
}

function EvidencePanel({
  tab,
  events,
  costs,
}: {
  tab: string
  events: EvidenceDrawerEvent[]
  costs: EvidenceDrawerCost[]
}) {
  if (tab !== "costs") return <EvidenceEventList events={events} />

  return (
    <DataLedger
      title="Cost ledger"
      description="Reusable cost rows without Kraken-specific payloads."
      countLabel={`${costs.length} rows`}
    >
      <div className="grid min-w-0 gap-2">
        {costs.map((cost) => (
          <div
            key={cost.id}
            className="grid grid-cols-[1fr_auto] gap-3 rounded-lg border border-nextide-line bg-background/25 p-2 text-sm"
          >
            <span className="grid min-w-0 gap-0.5">
              <strong className="truncate">{cost.label}</strong>
              {cost.detail ? (
                <span className="truncate text-xs text-muted-foreground">
                  {cost.detail}
                </span>
              ) : null}
            </span>
            <strong>{cost.amount}</strong>
          </div>
        ))}
      </div>
    </DataLedger>
  )
}

function EvidenceEventList({ events }: { events: EvidenceDrawerEvent[] }) {
  return (
    <div className="grid gap-2">
      {events.map((event) => (
        <div
          key={event.id}
          className="grid grid-cols-[3.25rem_minmax(0,1fr)] items-start gap-2 rounded-lg border border-nextide-line bg-background/25 p-3 text-sm sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:gap-3"
        >
          <span className="text-xs font-medium text-nextide-tide">
            {event.time}
          </span>
          <span className="grid min-w-0 gap-0.5">
            <strong className="truncate">{event.title}</strong>
            {event.detail ? (
              <span className="text-xs text-muted-foreground">
                {event.detail}
              </span>
            ) : null}
          </span>
          <StatusBadge
            tone={event.tone ?? "neutral"}
            className="col-start-2 w-fit sm:col-start-auto"
          >
            {event.tone ?? "note"}
          </StatusBadge>
        </div>
      ))}
    </div>
  )
}

export {
  EvidenceDrawer,
  type EvidenceDrawerCost,
  type EvidenceDrawerEvent,
  type EvidenceDrawerFact,
  type EvidenceDrawerTone,
}
