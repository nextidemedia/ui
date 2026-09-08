import {
  DashboardFilterBar,
  type DashboardFilterItem,
} from "@nextide/ui/blocks/dashboard-filter-bar"
import { ExportWorkbench } from "@nextide/ui/blocks/export-workbench"
import { LiveguardCockpit } from "@nextide/ui/blocks/liveguard-cockpit"
import { SignalPlate } from "@nextide/ui/blocks/signal-plate"
import {
  type DateRange,
  SingleCalendarDateRangePicker,
} from "@nextide/ui/components/date-range-picker"
import { DonutChart } from "@nextide/ui/components/donut-chart"
import {
  DurationPicker,
  type DurationValue,
} from "@nextide/ui/components/duration-picker"
import { HourlyPacingChart } from "@nextide/ui/components/hourly-pacing-chart"
import { LineGraph } from "@nextide/ui/components/line-graph"
import { LineItemGraph } from "@nextide/ui/components/line-item-graph"
import { Metric } from "@nextide/ui/components/metric"
import type { ScheduleControlValue } from "@nextide/ui/components/schedule-control"
import { SignalRidgeChart } from "@nextide/ui/components/signal-ridge-chart"
import { StatusBadge } from "@nextide/ui/components/status-badge"
import {
  Surface,
  SurfaceDescription,
  SurfaceHeader,
  SurfaceTitle,
} from "@nextide/ui/components/surface"
import { TrendBarChart } from "@nextide/ui/components/trend-bar-chart"
import { formatCompactNumber } from "@nextide/ui/lib/format-number"
import { cn } from "@nextide/ui/lib/utils"
import { CalendarClock, Filter, Gauge, RadioTower } from "lucide-react"
import { type ReactNode, useState } from "react"
import { ComponentReference } from "./component-reference"
import {
  bannerImpressionDays,
  bannerImpressionSeries,
  campaignLinePoints,
  channelMixSegments,
  daedalusFilterGroups,
  daedalusFilterItems,
  exportSessionRows,
  hourlyPacingBuckets,
  liveguardCreators,
  liveguardIncidents,
  weeklyImpressionDays,
  weeklyImpressionSeries,
  weeklyTrendRows,
} from "./playground-campaign-data"
import {
  formatCompactMetricValue,
  formatLargeMetricValue,
} from "./playground-state"

function DaedalusPlayground({
  filterGroupId,
  selectedFilterId,
  dateRange,
  exportSchedule,
  watchlistTokens,
  onFilterGroupChange,
  onFilterSelect,
  onFilterClear,
  onDateRangeChange,
  onExportScheduleChange,
  onWatchlistTokensChange,
}: {
  filterGroupId: string
  selectedFilterId: string
  dateRange: DateRange
  exportSchedule: ScheduleControlValue
  watchlistTokens: string[]
  onFilterGroupChange: (groupId: string) => void
  onFilterSelect: (item: DashboardFilterItem) => void
  onFilterClear: () => void
  onDateRangeChange: (value: DateRange) => void
  onExportScheduleChange: (value: ScheduleControlValue) => void
  onWatchlistTokensChange: (tokens: string[]) => void
}) {
  const [workbookAction, setWorkbookAction] = useState(
    "Generated through May 12"
  )
  const selectedFilter =
    daedalusFilterItems.find((item) => item.id === selectedFilterId) ?? null

  return (
    <section className="grid gap-4">
      <div className="grid gap-2">
        <ComponentReference names="SignalPlate" />
        <DaedalusOverview />
      </div>

      <div className="grid gap-2">
        <ComponentReference names="DashboardFilterBar" />
        <DashboardFilterBar
          groups={daedalusFilterGroups}
          items={daedalusFilterItems}
          activeGroupId={filterGroupId}
          selectedItemId={selectedFilterId}
          onGroupChange={onFilterGroupChange}
          onItemSelect={onFilterSelect}
          onClear={onFilterClear}
        />
      </div>

      <div className="grid gap-2">
        <ComponentReference names="Metric" />
        <DaedalusMetrics selectedFilter={selectedFilter} />
      </div>

      <DaedalusDates
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
      />

      <DaedalusTrends />

      <div className="grid gap-2">
        <ComponentReference names="ExportWorkbench" />
        <ExportWorkbench
          schedule={exportSchedule}
          onScheduleChange={onExportScheduleChange}
          workbookState="current"
          nextRun="Mon 09:00"
          workbookName="Starforge weekly workbook"
          generatedUntil={workbookAction}
          sessions={exportSessionRows}
          onGenerate={() => setWorkbookAction("Generated just now")}
          onDownload={() => setWorkbookAction("Downloaded just now")}
        />
      </div>

      <div className="grid gap-2">
        <ComponentReference names="LiveguardCockpit" />
        <LiveguardCockpit
          enabled
          activeRules={12}
          scheduledCreators={liveguardCreators.length}
          cooldown="8m"
          creators={liveguardCreators}
          incidents={liveguardIncidents}
          watchlistTokens={watchlistTokens}
          onWatchlistTokensChange={onWatchlistTokensChange}
          score={0.71}
          threshold={0.82}
        />
      </div>
    </section>
  )
}

function ChartDirection({
  componentName,
  title,
  badge,
  children,
  className,
}: {
  componentName: string
  title: ReactNode
  badge: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "grid gap-2 rounded-lg border border-nextide-line bg-background/20 p-2",
        className
      )}
    >
      <ComponentReference names={componentName} />
      <div className="flex items-center justify-between gap-3 px-1">
        <strong className="text-sm">{title}</strong>
        <StatusBadge tone="success">{badge}</StatusBadge>
      </div>
      {children}
    </div>
  )
}

export { DaedalusPlayground }

function DaedalusOverview() {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.72fr)]">
      <SignalPlate
        eyebrow="Campaign surface"
        title="Daedalus command"
        description="Coordinate campaign filters, delivery signals, workbook output, and safety proof from one operational view."
        status="Live data ready"
        statusTone="success"
        metrics={[
          { label: "Creators", value: "42", detail: "6 live now" },
          { label: "Reports", value: "18", detail: "Weekly scope" },
          {
            label: "Export health",
            value: "96%",
            detail: "Workbook current",
          },
        ]}
      />
      <SignalPlate
        eyebrow="LiveGuard"
        title="Cockpit proof"
        description="Track safety rules, thresholds, creator state, and incidents without losing campaign context."
        status="Nominal"
        statusTone="success"
        metrics={[
          { label: "Rules", value: "12", detail: "Brand plus safety" },
          { label: "Incidents", value: "2", detail: "Below threshold" },
          { label: "Cooldown", value: "8m", detail: "Delivery window" },
        ]}
      />
    </div>
  )
}

function DaedalusTrends() {
  return (
    <Surface className="grid gap-4">
      <SurfaceHeader>
        <SurfaceTitle>Trend graphs</SurfaceTitle>
        <SurfaceDescription>
          Compare delivery signals, pacing, reach, and channel mix at a glance.
        </SurfaceDescription>
      </SurfaceHeader>
      <div className="grid gap-4 xl:grid-cols-2">
        <DaedalusBarDirections />
        <div className="grid gap-2 xl:col-span-2">
          <ComponentReference names="LineItemGraph" />
          <LineItemGraph
            title="Weekly total impressions"
            rangeLabel="Last 7 days"
            days={weeklyImpressionDays}
            series={weeklyImpressionSeries}
            axisLabelMode="weekday-day"
            valueFormatter={formatLargeMetricValue}
            tickFormatter={formatCompactMetricValue}
          />
        </div>
        <div className="grid gap-2 xl:col-span-2">
          <ComponentReference names="LineItemGraph" />
          <LineItemGraph
            title="Banner impressions"
            rangeLabel="Last 30 days"
            days={bannerImpressionDays}
            series={bannerImpressionSeries}
            totalLine={{ label: "Total" }}
            axisLabelMode="angled-day"
            valueFormatter={formatLargeMetricValue}
            tickFormatter={formatCompactMetricValue}
          />
        </div>
        <Surface variant="plain" className="grid gap-3">
          <ComponentReference names="LineGraph" />
          <div className="flex items-center justify-between gap-3">
            <strong className="text-sm">Reach trajectory</strong>
            <StatusBadge tone="success">Climbing</StatusBadge>
          </div>
          <LineGraph points={campaignLinePoints} />
        </Surface>
        <Surface variant="plain" className="grid gap-3">
          <ComponentReference names="DonutChart" />
          <div className="flex items-center justify-between gap-3">
            <strong className="text-sm">Channel mix</strong>
            <StatusBadge tone="neutral">Current</StatusBadge>
          </div>
          <DonutChart
            segments={channelMixSegments}
            totalLabel="100%"
            centerLabel="Reach mix"
          />
        </Surface>
      </div>
    </Surface>
  )
}

function DaedalusBarDirections() {
  return (
    <Surface variant="plain" className="grid gap-3 xl:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <strong className="text-sm">Bar chart directions</strong>
        <StatusBadge tone="neutral">7 directions</StatusBadge>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <ChartDirection componentName="TrendBarChart" title="Rail" badge="+18%">
          <TrendBarChart
            rows={weeklyTrendRows}
            variant="rail"
            valueFormatter={(value) => `${Math.round(value)}k`}
          />
        </ChartDirection>
        <ChartDirection
          componentName="TrendBarChart"
          title="Block"
          badge="Dense"
        >
          <TrendBarChart
            rows={weeklyTrendRows}
            variant="block"
            valueFormatter={(value) => `${Math.round(value)}k`}
          />
        </ChartDirection>
        <ChartDirection
          componentName="TrendBarChart"
          title="Signal"
          badge="Live"
        >
          <TrendBarChart
            rows={weeklyTrendRows}
            variant="signal"
            valueFormatter={(value) => `${Math.round(value)}k`}
          />
        </ChartDirection>
        <ChartDirection
          componentName="HourlyPacingChart"
          title="Pacing bars"
          badge="Target line"
          className="lg:col-span-2"
        >
          <HourlyPacingChart
            buckets={hourlyPacingBuckets}
            targetValue={100}
            title="Hourly pressure"
            description="The pacing graph bar grammar reused as a general comparison option."
          />
        </ChartDirection>
        <ChartDirection
          componentName="SignalRidgeChart"
          title="Signal ridge"
          badge="Trajectory"
          className="lg:col-span-2"
        >
          <SignalRidgeChart
            points={weeklyTrendRows}
            valueFormatter={(value) => `${formatCompactNumber(value * 1000)}`}
          />
        </ChartDirection>
      </div>
    </Surface>
  )
}

function DaedalusDates({
  dateRange,
  onDateRangeChange,
}: Pick<
  Parameters<typeof DaedalusPlayground>[0],
  "dateRange" | "onDateRangeChange"
>) {
  const [reportDuration, setReportDuration] = useState<DurationValue>({
    hours: 2,
    minutes: 33,
  })
  return (
    <Surface className="grid gap-4">
      <SurfaceHeader>
        <SurfaceTitle>Date range</SurfaceTitle>
        <SurfaceDescription>
          One calendar keeps export and report windows in a single context.
        </SurfaceDescription>
      </SurfaceHeader>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <ComponentReference names="SingleCalendarDateRangePicker" />
          <SingleCalendarDateRangePicker
            value={dateRange}
            onValueChange={onDateRangeChange}
          />
        </div>
        <Surface
          variant="plain"
          padding="sm"
          className="grid w-fit max-w-full justify-items-start gap-2"
        >
          <ComponentReference names="DurationPicker" />
          <DurationPicker
            value={reportDuration}
            onValueChange={setReportDuration}
          />
        </Surface>
      </div>
    </Surface>
  )
}

function DaedalusMetrics({
  selectedFilter,
}: {
  selectedFilter: DashboardFilterItem | null
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <Metric
        icon={<Filter />}
        value={selectedFilter?.badge ?? "Scoped"}
        label="Active filter"
        detail={selectedFilter?.title ?? "No campaign selected"}
      />
      <Metric
        icon={<CalendarClock />}
        value="Mon 09:00"
        label="Export cadence"
        detail="Campaign workbook"
      />
      <Metric
        icon={<Gauge />}
        value="0.71"
        label="Latest safety score"
        detail="Under threshold"
      />
      <Metric
        icon={<RadioTower />}
        value="3"
        label="Live channels"
        detail="Runtime watchlist"
      />
    </div>
  )
}
