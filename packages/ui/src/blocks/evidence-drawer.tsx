import * as React from "react"
import { FileText, GitBranch, ReceiptText } from "lucide-react"

import { DataLedger } from "@nextide/ui/components/data-ledger"
import { Metric } from "@nextide/ui/components/metric"
import { StatusBadge } from "@nextide/ui/components/status-badge"
import {
  Surface,
  SurfaceDescription,
  SurfaceHeader,
  SurfaceTitle,
} from "@nextide/ui/components/surface"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@nextide/ui/components/tabs"
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid h-auto w-full grid-cols-3 rounded-lg border border-nextide-line bg-background/20 p-1">
          <EvidenceTab value="decisions" icon={<GitBranch />}>
            Decisions
          </EvidenceTab>
          <EvidenceTab value="sources" icon={<FileText />}>
            Sources
          </EvidenceTab>
          <EvidenceTab value="costs" icon={<ReceiptText />}>
            Costs
          </EvidenceTab>
        </TabsList>

        <TabsContent value="decisions" className="mt-0">
          <EvidenceEventList events={events} />
        </TabsContent>
        <TabsContent value="sources" className="mt-0">
          <EvidenceEventList events={events} />
        </TabsContent>
        <TabsContent value="costs" className="mt-0">
          <DataLedger
            title="Cost ledger"
            description="Reusable cost rows without Kraken-specific payloads."
            countLabel={`${costs.length} rows`}
          >
            <div className="grid min-w-[30rem] gap-2">
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
        </TabsContent>
      </Tabs>
    </Surface>
  )
}

function EvidenceTab({
  value,
  icon,
  children,
}: {
  value: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <TabsTrigger
      value={value}
      className="h-8 min-w-0 gap-1.5 data-active:bg-nextide-tide data-active:text-black data-active:shadow-[0_0_18px_rgb(30_228_188/0.2)]"
    >
      {icon}
      {children}
    </TabsTrigger>
  )
}

function EvidenceEventList({ events }: { events: EvidenceDrawerEvent[] }) {
  return (
    <div className="grid gap-2">
      {events.map((event) => (
        <div
          key={event.id}
          className="grid grid-cols-[4rem_minmax(0,1fr)_auto] items-start gap-3 rounded-lg border border-nextide-line bg-background/25 p-2 text-sm"
        >
          <span className="text-xs font-semibold text-nextide-tide">
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
          <StatusBadge tone={event.tone ?? "neutral"}>
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
