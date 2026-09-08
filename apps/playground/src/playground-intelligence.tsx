import { CreatorScopePanel } from "@nextide/ui/blocks/creator-scope-panel"
import { CreatorTransfer } from "@nextide/ui/blocks/creator-transfer"
import { FitLeaderboard } from "@nextide/ui/blocks/fit-leaderboard"
import { IntelligenceProgressionChart } from "@nextide/ui/blocks/intelligence-progression-chart"
import {
  type ReportContextBucket,
  ReportContextBuilder,
} from "@nextide/ui/blocks/report-context-builder"
import { SignalPlate } from "@nextide/ui/blocks/signal-plate"
import { StreamSelector } from "@nextide/ui/blocks/stream-selector"
import { Checkbox } from "@nextide/ui/components/checkbox"
import {
  CreatorFlowChart,
  type CreatorFlowSession,
} from "@nextide/ui/components/creator-flow-chart"
import {
  type DateRange,
  SingleCalendarDateRangePicker,
} from "@nextide/ui/components/date-range-picker"
import {
  Surface,
  SurfaceDescription,
  SurfaceHeader,
  SurfaceTitle,
} from "@nextide/ui/components/surface"
import { type ReactNode, useState } from "react"
import { ComponentReference } from "./component-reference"
import {
  intelligenceCreators,
  intelligenceFitRows,
  intelligenceProgressionStages,
  intelligenceStreamRows,
} from "./playground-intelligence-data"

function IntelligencePlayground({
  selectedCreatorIds,
  dateRange,
  contextBuckets,
  flowSessions,
  selectedStreamIds,
  onSelectedCreatorIdsChange,
  onDateRangeChange,
  onContextBucketsChange,
  onFlowSessionsChange,
  onSelectedStreamIdsChange,
}: {
  selectedCreatorIds: string[]
  dateRange: DateRange
  contextBuckets: ReportContextBucket[]
  flowSessions: CreatorFlowSession[]
  selectedStreamIds: string[]
  onSelectedCreatorIdsChange: (ids: string[]) => void
  onDateRangeChange: (range: DateRange) => void
  onContextBucketsChange: (buckets: ReportContextBucket[]) => void
  onFlowSessionsChange: (sessions: CreatorFlowSession[]) => void
  onSelectedStreamIdsChange: (ids: string[]) => void
}) {
  const selectedCreators = intelligenceCreators.filter((creator) =>
    selectedCreatorIds.includes(creator.id)
  )
  const scopedStreams = intelligenceStreamRows.filter((stream) =>
    selectedCreatorIds.includes(stream.creatorId)
  )

  return (
    <section className="grid gap-4">
      <div className="grid gap-2">
        <ComponentReference names="SignalPlate" />
        <IntelligenceOverview
          selectedCreatorIds={selectedCreatorIds}
          selectedStreamIds={selectedStreamIds}
        />
      </div>

      <CreatorFitPreview />

      <Surface className="grid gap-4">
        <SurfaceHeader>
          <ComponentReference names="CreatorTransfer" />
          <SurfaceTitle>Creator Select</SurfaceTitle>
          <SurfaceDescription>
            Individual searchable creator bars and the fused left-to-right
            transfer workflow.
          </SurfaceDescription>
        </SurfaceHeader>
        <CreatorTransfer
          creators={intelligenceCreators}
          selectedIds={selectedCreatorIds}
          onSelectedIdsChange={onSelectedCreatorIdsChange}
        />
      </Surface>

      <IntelligenceDates
        selectedCreators={selectedCreators}
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
        flowSessions={flowSessions}
        onFlowSessionsChange={onFlowSessionsChange}
      />

      <Surface className="grid gap-4">
        <SurfaceHeader>
          <ComponentReference names="StreamSelector" />
          <SurfaceTitle>Stream Select</SurfaceTitle>
          <SurfaceDescription>
            Per-creator filtering with the same exit, reflow, and enter motion
            from the intelligence workflow.
          </SurfaceDescription>
        </SurfaceHeader>
        <StreamSelector
          creators={selectedCreators}
          streams={scopedStreams}
          selectedIds={selectedStreamIds}
          onSelectedIdsChange={onSelectedStreamIdsChange}
          creatorScopeProps={{ allLabel: "All report creators" }}
        />
      </Surface>

      <IntelligenceContext
        contextBuckets={contextBuckets}
        onContextBucketsChange={onContextBucketsChange}
      />

      <div className="grid gap-2">
        <ComponentReference names="IntelligenceProgressionChart" />
        <IntelligenceProgressionChart
          stages={intelligenceProgressionStages}
          title="Generate"
          description="Reusable generation progression map for sponsored content reports."
        />
      </div>
    </section>
  )
}

export { IntelligencePlayground }

function IntelligenceOverview({
  selectedCreatorIds,
  selectedStreamIds,
}: Pick<
  Parameters<typeof IntelligencePlayground>[0],
  "selectedCreatorIds" | "selectedStreamIds"
>) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.72fr)]">
      <SignalPlate
        eyebrow="Creator select"
        title="Report workflow shell"
        description="Move from creator selection through dates, streams, context, and generation with progress always visible."
        status="Workflow ready"
        statusTone="success"
        metrics={[
          {
            label: "Creators",
            value: selectedCreatorIds.length.toString(),
            detail: "selected right now",
          },
          {
            label: "Streams",
            value: selectedStreamIds.length.toString(),
            detail: "selected for report",
          },
          {
            label: "Stages",
            value: "7",
            detail: "generation pipeline",
          },
        ]}
      />
      <SignalPlate
        eyebrow="Workflow coverage"
        title="Report preparation"
        description="Choose creators, narrow evidence, set the reporting context, and confirm the final source set."
        status="Ready"
        statusTone="processing"
        metrics={[
          { label: "Transfer", value: "FLIP", detail: "row handoff" },
          { label: "Streams", value: "FLIP", detail: "filter motion" },
          { label: "Dates", value: "Gantt", detail: "creator flow" },
        ]}
      />
    </div>
  )
}

function IntelligenceDates({
  selectedCreators,
  dateRange,
  onDateRangeChange,
  flowSessions,
  onFlowSessionsChange,
}: Pick<
  Parameters<typeof IntelligencePlayground>[0],
  "dateRange" | "onDateRangeChange" | "flowSessions" | "onFlowSessionsChange"
> & { selectedCreators: typeof intelligenceCreators }) {
  const [activeDateScope, setActiveDateScope] = useState("all")
  return (
    <Surface className="grid gap-4">
      <SurfaceHeader>
        <SurfaceTitle>Date Select</SurfaceTitle>
        <SurfaceDescription>
          Creator override rail, existing date windows, and draggable campaign
          flow slots.
        </SurfaceDescription>
      </SurfaceHeader>
      <div className="grid gap-4 xl:grid-cols-[16rem_minmax(0,1fr)]">
        <div className="grid content-start gap-2">
          <ComponentReference names="CreatorScopePanel" />
          <CreatorScopePanel
            creators={selectedCreators}
            activeId={activeDateScope}
            onActiveIdChange={setActiveDateScope}
            getAction={(creator) => (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>Override</span>
                <Checkbox
                  aria-label={`Override ${creator.name}`}
                  checked={activeDateScope === creator.id}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setActiveDateScope(creator.id)
                    }
                  }}
                />
              </span>
            )}
          />
        </div>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <ComponentReference names="SingleCalendarDateRangePicker" />
            <SingleCalendarDateRangePicker
              value={dateRange}
              onValueChange={onDateRangeChange}
            />
          </div>
          <div className="grid gap-2">
            <ComponentReference names="CreatorFlowChart" />
            <CreatorFlowChart
              creators={intelligenceCreators.map((creator) => ({
                id: creator.id,
                name: creator.name,
                meta: creator.meta,
              }))}
              days={[
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
                "Sun",
                "Mon",
                "Tue",
              ]}
              sessions={flowSessions}
              onSessionsChange={onFlowSessionsChange}
            />
          </div>
        </div>
      </div>
    </Surface>
  )
}

function IntelligenceContext({
  contextBuckets,
  onContextBucketsChange,
}: Pick<
  Parameters<typeof IntelligencePlayground>[0],
  "contextBuckets" | "onContextBucketsChange"
>) {
  const [lastAddBucket, setLastAddBucket] = useState<ReactNode>(null)
  return (
    <Surface className="grid gap-4">
      <SurfaceHeader>
        <ComponentReference names="ReportContextBuilder" />
        <SurfaceTitle>Report Context</SurfaceTitle>
        <SurfaceDescription>
          Required and optional context rows with selected chips, suggestion
          lanes, contained scrolling, and right-edge fade.
        </SurfaceDescription>
      </SurfaceHeader>
      <ReportContextBuilder
        buckets={contextBuckets}
        onBucketsChange={onContextBucketsChange}
        onAdd={(bucketId) =>
          setLastAddBucket(
            contextBuckets.find((bucket) => bucket.id === bucketId)?.label
          )
        }
      />
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {lastAddBucket ? (
          <>Add requested for {lastAddBucket}.</>
        ) : (
          "Choose Add to extend an editable row."
        )}
      </p>
    </Surface>
  )
}

function CreatorFitPreview() {
  return (
    <Surface className="grid gap-4">
      <SurfaceHeader>
        <ComponentReference names="FitLeaderboard" />
        <SurfaceTitle>Creator fit</SurfaceTitle>
        <SurfaceDescription>
          Compare fit, safety, audience sentiment, and evidence volume in one
          responsive ranking.
        </SurfaceDescription>
      </SurfaceHeader>
      <FitLeaderboard items={intelligenceFitRows} />
    </Surface>
  )
}
