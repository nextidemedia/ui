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
  const rawId = React.useId()
  const clipId = `nextide-line-item-clip-${rawId.replace(/:/g, "")}`
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
    maxValue
  )
  const { resolvedHover, hoveredDay, hoveredSeries } = resolveLineItemHover(
    hover,
    activeIdSet,
    days,
    data.seriesPlots
  )

  if (days.length === 0 || selectableSeries.length === 0) {
    return (
      <section
        data-slot="line-item-graph"
        className={cn(
          "grid min-h-60 place-items-center rounded-lg border border-nextide-line bg-nextide-panel px-4 py-8 text-sm text-muted-foreground",
          className
        )}
        {...props}
      >
        {emptyLabel}
      </section>
    )
  }

  return (
    <section
      data-slot="line-item-graph"
      className={cn(
        "grid gap-4 rounded-lg border border-nextide-line bg-nextide-panel p-4",
        className
      )}
      {...props}
    >
      <LineItemHeading title={title} rangeLabel={rangeLabel} />

      <LineItemControls
        selectableSeries={selectableSeries}
        activeIdSet={activeIdSet}
        toggleSeries={toggleSeries}
      />

      <LineItemCanvas
        {...data}
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
