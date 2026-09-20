import * as React from "react"
import { cn } from "@nextide/ui/lib/utils"
import {
  useLineItemSelection,
  useLineItemHover,
  useLineItemViewport,
  resolveLineItemHover,
} from "./line-item-graph-state.js"
import {
  formatLineItemValue,
  formatCompactLineItemValue,
  useLineItemData,
} from "./line-item-graph-data.js"
import {
  LineItemCanvas,
  LineItemControls,
  LineItemHeading,
} from "./line-item-graph-views.js"
import { type LineItemGraphProps } from "./line-item-graph-types.js"
import type {
  LineItemGraphAxisLabelMode,
  LineItemGraphDay,
  LineItemGraphPoint,
  LineItemGraphSeries,
  LineItemGraphTotalLine,
  LineItemGraphTone,
} from "./line-item-graph-types.js"

function LineItemGraph({
  title,
  rangeLabel,
  days,
  series,
  totalLine,
  axisLabelMode = "day",
  height,
  compact = false,
  showPoints = true,
  glow = true,
  minValue,
  maxValue,
  activeSeriesIds,
  defaultActiveSeriesIds,
  onActiveSeriesIdsChange,
  valueFormatter = formatLineItemValue,
  tickFormatter = formatCompactLineItemValue,
  emptyLabel = "No line data available.",
  className,
  ...props
}: LineItemGraphProps) {
  const clipId = `nextide-line-item-clip-${React.useId().replace(/:/g, "")}`
  const { selectableSeries, activeIdSet, activeSeries, toggleSeries } =
    useLineItemSelection(
      series,
      defaultActiveSeriesIds,
      activeSeriesIds,
      onActiveSeriesIdsChange
    )
  const { hover, setHover, chartRef, showDayHover, showPointHover } =
    useLineItemHover()
  const { measuredChartWidth, viewportRef } = useLineItemViewport()
  const data = useLineItemData(
    days,
    series,
    activeSeries,
    selectableSeries,
    activeIdSet,
    measuredChartWidth,
    axisLabelMode,
    totalLine,
    minValue,
    maxValue,
    height,
    compact
  )
  const { resolvedHover, hoveredDay, hoveredSeries } = resolveLineItemHover(
    hover,
    activeIdSet,
    days,
    data.seriesPlots
  )

  const empty = days.length === 0 || selectableSeries.length === 0

  return (
    <section
      data-slot="line-item-graph"
      className={cn(
        "grid rounded-lg border border-nextide-line bg-nextide-panel",
        empty
          ? "min-h-60 place-items-center px-4 py-8 text-sm text-muted-foreground"
          : "gap-4 p-4",
        className
      )}
      {...props}
    >
      {empty ? (
        emptyLabel
      ) : (
        <>
          <LineItemHeading title={title} rangeLabel={rangeLabel} />

          <LineItemControls
            glow={glow}
            selectableSeries={selectableSeries}
            activeIdSet={activeIdSet}
            toggleSeries={toggleSeries}
          />

          <LineItemCanvas
            {...data}
            showPoints={showPoints}
            glow={glow}
            viewportRef={viewportRef}
            chartRef={chartRef}
            setHover={setHover}
            title={title}
            clipId={clipId}
            tickFormatter={tickFormatter}
            showDayHover={showDayHover}
            resolvedHover={resolvedHover}
            valueFormatter={valueFormatter}
            showPointHover={showPointHover}
            axisLabelMode={axisLabelMode}
            hoveredDay={hoveredDay}
            hoveredSeries={hoveredSeries}
          />
        </>
      )}
    </section>
  )
}

export {
  LineItemGraph,
  type LineItemGraphAxisLabelMode,
  type LineItemGraphDay,
  type LineItemGraphPoint,
  type LineItemGraphSeries,
  type LineItemGraphTotalLine,
  type LineItemGraphTone,
}
