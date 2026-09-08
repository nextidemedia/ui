import * as React from "react"
import {
  GraphTooltip,
  GraphTooltipRow,
} from "@nextide/ui/components/graph-tooltip"
import { cn } from "@nextide/ui/lib/utils"
import { resolveSeriesColor, withAlpha } from "./line-item-graph-data.js"
import { LineItemPlot } from "./line-item-graph-plot.js"
import {
  type LineItemCanvasProps,
  type LineItemControlsProps,
  type LineItemTooltipProps,
  type LineItemTooltipRowsProps,
} from "./line-item-graph-types.js"

export function LineItemCanvas({
  viewportRef,
  chartRef,
  hoveredDay,
  hoveredSeries,
  pointMaps,
  ...plot
}: LineItemCanvasProps) {
  const resolvedHover = plot.resolvedHover
  return (
    <div
      ref={viewportRef}
      data-slot="line-item-graph-viewport"
      className="min-w-0 overflow-visible"
    >
      <div
        ref={chartRef}
        data-slot="line-item-graph-canvas"
        className="relative w-full min-w-0"
        style={{ height: plot.chartHeight }}
        onMouseLeave={() => plot.setHover(null)}
      >
        <LineItemPlot {...plot} />
        {resolvedHover && hoveredDay ? (
          <LineItemTooltip
            hover={resolvedHover}
            day={hoveredDay}
            series={plot.seriesPlots.filter((item) => item.active)}
            hoveredSeries={hoveredSeries}
            totalLabel={plot.totalPlot?.label}
            totalValue={
              plot.totalPlot?.plottedPoints.find(
                (point) => point.dayId === resolvedHover.dayId
              )?.value
            }
            valueFormatter={plot.valueFormatter}
            pointMaps={pointMaps}
            onDismiss={() => plot.setHover(null)}
          />
        ) : null}
      </div>
    </div>
  )
}

export function LineItemControls({
  selectableSeries,
  activeIdSet,
  toggleSeries,
}: LineItemControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {selectableSeries.map((item) => {
        const color = resolveSeriesColor(item)
        const active = activeIdSet.has(item.id)

        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={active}
            onClick={() => toggleSeries(item.id)}
            className={cn(
              "inline-flex min-h-7 items-center rounded-md border px-3 text-ui-caption leading-none font-medium tracking-normal uppercase transition-[background-color,border-color,color,opacity] duration-[var(--nextide-motion-state)]",
              active
                ? "bg-background/35 text-foreground"
                : "border-nextide-line bg-transparent text-muted-foreground/60"
            )}
            style={
              active
                ? {
                    borderColor: color,
                    boxShadow: `0 0 20px ${withAlpha(color, 0.18)}`,
                  }
                : undefined
            }
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

export function LineItemHeading({
  title,
  rangeLabel,
}: {
  title: React.ReactNode
  rangeLabel: React.ReactNode
}) {
  return (
    <>
      {(title || rangeLabel) && (
        <div className="flex flex-wrap items-start justify-between gap-3">
          {title ? (
            <h3 className="text-sm leading-tight font-medium">{title}</h3>
          ) : null}
          {rangeLabel ? (
            <span className="text-xs leading-tight font-medium text-muted-foreground">
              {rangeLabel}
            </span>
          ) : null}
        </div>
      )}
    </>
  )
}

export function LineItemTooltip({
  hover,
  day,
  series,
  hoveredSeries,
  totalLabel,
  totalValue,
  valueFormatter,
  pointMaps,
  onDismiss,
}: LineItemTooltipProps) {
  return (
    <GraphTooltip
      anchor={{ x: hover.viewportX, y: hover.viewportY }}
      data-chart="line-item"
      onDismiss={onDismiss}
    >
      <div className="grid gap-1">
        <span className="text-ui-caption font-medium text-muted-foreground">
          {day.weekday ? (
            <>
              {day.weekday} | {day.label}
            </>
          ) : (
            day.label
          )}
        </span>
        {hover.kind === "point" && hoveredSeries ? (
          <strong className="text-sm leading-tight text-foreground">
            {hoveredSeries.label}
          </strong>
        ) : (
          <strong className="text-sm leading-tight text-foreground">
            Day breakdown
          </strong>
        )}
      </div>
      <LineItemTooltipRows
        hover={hover}
        hoveredSeries={hoveredSeries}
        pointMaps={pointMaps}
        valueFormatter={valueFormatter}
        series={series}
        totalLabel={totalLabel}
        totalValue={totalValue}
      />
    </GraphTooltip>
  )
}

export function LineItemTooltipRows({
  hover,
  hoveredSeries,
  pointMaps,
  valueFormatter,
  series,
  totalLabel,
  totalValue,
}: LineItemTooltipRowsProps) {
  return (
    <div className="mt-2 grid gap-1.5">
      {hover.kind === "point" && hoveredSeries ? (
        <GraphTooltipRow
          color={hoveredSeries.color}
          label={hoveredSeries.label}
          value={
            pointMaps.get(hoveredSeries.id)?.get(hover.dayId)?.valueLabel ??
            valueFormatter(
              pointMaps.get(hoveredSeries.id)?.get(hover.dayId)?.value ?? 0
            )
          }
        />
      ) : (
        series.map((item) => {
          const point = pointMaps.get(item.id)?.get(hover.dayId)

          return (
            <GraphTooltipRow
              key={item.id}
              color={item.color}
              label={item.label}
              value={point?.valueLabel ?? valueFormatter(point?.value ?? 0)}
            />
          )
        })
      )}
      {totalLabel && totalValue !== undefined ? (
        <GraphTooltipRow
          color="rgb(210 214 222)"
          label={totalLabel}
          value={valueFormatter(totalValue)}
          dashed
        />
      ) : null}
    </div>
  )
}
