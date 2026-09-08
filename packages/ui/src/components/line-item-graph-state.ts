import * as React from "react"
import { getLineItemPlots } from "./line-item-graph-data.js"
import {
  type LineItemGraphDay,
  type LineItemGraphSeries,
  type LineItemGraphHover,
} from "./line-item-graph-types.js"

export function useLineItemSelection(
  series: LineItemGraphSeries[],
  defaultActiveSeriesIds: string[] | undefined,
  activeSeriesIds: string[] | undefined,
  onActiveSeriesIdsChange: ((ids: string[]) => void) | undefined
) {
  const selectableSeries = React.useMemo(
    () => series.filter((item) => !item.disabled),
    [series]
  )
  const fallbackActiveIds = React.useMemo(
    () =>
      defaultActiveSeriesIds?.length
        ? defaultActiveSeriesIds
        : selectableSeries.map((item) => item.id),
    [defaultActiveSeriesIds, selectableSeries]
  )
  const [uncontrolledActiveIds, setUncontrolledActiveIds] =
    React.useState(fallbackActiveIds)
  const availableIdSet = React.useMemo(
    () => new Set(selectableSeries.map((item) => item.id)),
    [selectableSeries]
  )
  const resolvedActiveIds = React.useMemo(() => {
    const retained = (activeSeriesIds ?? uncontrolledActiveIds).filter((id) =>
      availableIdSet.has(id)
    )

    return retained.length > 0 ? retained : fallbackActiveIds
  }, [
    activeSeriesIds,
    availableIdSet,
    fallbackActiveIds,
    uncontrolledActiveIds,
  ])
  const activeIdSet = React.useMemo(
    () => new Set(resolvedActiveIds),
    [resolvedActiveIds]
  )
  const activeSeries = React.useMemo(
    () => selectableSeries.filter((item) => activeIdSet.has(item.id)),
    [activeIdSet, selectableSeries]
  )
  const updateActiveIds = React.useCallback(
    (ids: string[]) => {
      if (activeSeriesIds === undefined) {
        setUncontrolledActiveIds(ids)
      }
      onActiveSeriesIdsChange?.(ids)
    },
    [activeSeriesIds, onActiveSeriesIdsChange]
  )

  const toggleSeries = React.useCallback(
    (id: string) => {
      const current = resolvedActiveIds.filter((activeId) =>
        selectableSeries.some((item) => item.id === activeId)
      )
      const next = current.includes(id)
        ? current.length > 1
          ? current.filter((activeId) => activeId !== id)
          : current
        : [...current, id]

      updateActiveIds(next)
    },
    [resolvedActiveIds, selectableSeries, updateActiveIds]
  )

  return { selectableSeries, activeIdSet, activeSeries, toggleSeries }
}

export function useLineItemHover() {
  const [hover, setHover] = React.useState<LineItemGraphHover | null>(null)
  const chartRef = React.useRef<HTMLDivElement | null>(null)

  const showDayHover = React.useCallback(
    (dayId: string, x: number, y: number, viewportY?: number) => {
      const chartRect = chartRef.current?.getBoundingClientRect()
      setHover({
        kind: "day",
        dayId,
        x,
        y,
        viewportX: (chartRect?.left ?? 0) + x,
        viewportY: viewportY ?? (chartRect?.top ?? 0) + y,
      })
    },
    []
  )

  const showPointHover = React.useCallback(
    (
      dayId: string,
      seriesId: string,
      x: number,
      y: number,
      viewportY?: number
    ) => {
      const chartRect = chartRef.current?.getBoundingClientRect()
      setHover({
        kind: "point",
        dayId,
        seriesId,
        x,
        y,
        viewportX: (chartRect?.left ?? 0) + x,
        viewportY: viewportY ?? (chartRect?.top ?? 0) + y,
      })
    },
    []
  )

  return { hover, setHover, chartRef, showDayHover, showPointHover }
}

export function useLineItemViewport() {
  const [measuredChartWidth, setMeasuredChartWidth] = React.useState(0)
  const viewportRef = React.useRef<HTMLDivElement | null>(null)
  React.useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const updateWidth = (width: number) => {
      const nextWidth = Math.max(1, Math.round(width))
      setMeasuredChartWidth((current) =>
        current === nextWidth ? current : nextWidth
      )
    }

    updateWidth(viewport.getBoundingClientRect().width)
    if (typeof ResizeObserver === "undefined") return

    const observer = new ResizeObserver(([entry]) => {
      if (entry) updateWidth(entry.contentRect.width)
    })
    observer.observe(viewport)

    return () => observer.disconnect()
  }, [])

  return { measuredChartWidth, viewportRef }
}

export function resolveLineItemHover(
  hover: LineItemGraphHover | null,
  activeIdSet: Set<string>,
  days: LineItemGraphDay[],
  seriesPlots: ReturnType<typeof getLineItemPlots>["seriesPlots"]
) {
  const resolvedHover =
    hover?.kind === "point" && !activeIdSet.has(hover.seriesId) ? null : hover
  const hoveredDay = resolvedHover
    ? days.find((day) => day.id === resolvedHover.dayId)
    : undefined
  const hoveredSeries =
    resolvedHover?.kind === "point"
      ? seriesPlots.find((item) => item.id === resolvedHover.seriesId)
      : undefined
  return { resolvedHover, hoveredDay, hoveredSeries }
}
