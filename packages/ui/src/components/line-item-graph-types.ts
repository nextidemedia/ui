import * as React from "react"
import type {
  getLineItemPlots,
  useLineItemData,
} from "./line-item-graph-data.js"

export type LineItemGraphTone =
  | "cyan"
  | "tide"
  | "yellow"
  | "red"
  | "violet"
  | "neutral"

export type LineItemGraphAxisLabelMode = "day" | "weekday-day" | "angled-day"

export type LineItemGraphDay = {
  id: string
  label: React.ReactNode
  weekday?: React.ReactNode
  hidden?: boolean
}

export type LineItemGraphPoint = {
  dayId: string
  value: number
  valueLabel?: React.ReactNode
}

export type LineItemGraphSeries = {
  id: string
  label: React.ReactNode
  points: LineItemGraphPoint[]
  tone?: LineItemGraphTone
  color?: string
  disabled?: boolean
}

export type LineItemGraphTotalLine =
  | boolean
  | {
      label?: React.ReactNode
      color?: string
    }

export type LineItemGraphHover =
  | {
      kind: "day"
      dayId: string
      x: number
      y: number
      viewportX: number
      viewportY: number
    }
  | {
      kind: "point"
      dayId: string
      seriesId: string
      x: number
      y: number
      viewportX: number
      viewportY: number
    }

export type PlottedLineItemPoint = LineItemGraphPoint & {
  x: number
  y: number
  hidden: boolean
}

export type LineItemGraphProps = React.ComponentProps<"section"> & {
  title?: React.ReactNode
  rangeLabel?: React.ReactNode
  days: LineItemGraphDay[]
  series: LineItemGraphSeries[]
  totalLine?: LineItemGraphTotalLine
  axisLabelMode?: LineItemGraphAxisLabelMode
  minValue?: number
  maxValue?: number
  activeSeriesIds?: string[]
  defaultActiveSeriesIds?: string[]
  onActiveSeriesIdsChange?: (ids: string[]) => void
  valueFormatter?: (value: number) => React.ReactNode
  tickFormatter?: (value: number) => React.ReactNode
  emptyLabel?: React.ReactNode
}

type LineItemSeriesPlot = ReturnType<
  typeof getLineItemPlots
>["seriesPlots"][number]

export type LineItemCanvasProps = LineItemPlotProps & {
  viewportRef: React.RefObject<HTMLDivElement | null>
  chartRef: React.RefObject<HTMLDivElement | null>
  hoveredDay: LineItemGraphDay | undefined
  hoveredSeries: LineItemSeriesPlot | undefined
  pointMaps: Map<string, Map<string, LineItemGraphPoint>>
}

export type LineItemPlotProps = Omit<
  ReturnType<typeof useLineItemData>,
  "pointMaps"
> & {
  title: React.ReactNode
  clipId: string
  tickFormatter: (value: number) => React.ReactNode
  showDayHover: (
    dayId: string,
    x: number,
    y: number,
    viewportY?: number
  ) => void
  resolvedHover: LineItemGraphHover | null
  valueFormatter: (value: number) => React.ReactNode
  showPointHover: (
    dayId: string,
    seriesId: string,
    x: number,
    y: number,
    viewportY?: number
  ) => void
  setHover: React.Dispatch<React.SetStateAction<LineItemGraphHover | null>>
  axisLabelMode: LineItemGraphAxisLabelMode
}

export type LineItemValueTickProps = {
  tick: number
  plotLeft: number
  plotRight: number
  y: number
  tickFormatter: (value: number) => React.ReactNode
}

export type LineItemAxisTickProps = {
  day: LineItemGraphDay
  shouldAngleLabels: boolean
  x: number
  labelY: number
  textAnchor: "end" | "middle"
  label: React.JSX.Element
}

export type LineItemControlsProps = {
  selectableSeries: LineItemGraphSeries[]
  activeIdSet: Set<string>
  toggleSeries: (id: string) => void
}

export type LineItemSeriesProps = {
  item: LineItemSeriesPlot
  clipId: string
}

export type LineItemPointProps = {
  item: LineItemSeriesPlot
  point: PlottedLineItemPoint
  dayById: Map<string, LineItemGraphDay>
  valueFormatter: (value: number) => React.ReactNode
  showPointHover: (
    dayId: string,
    seriesId: string,
    x: number,
    y: number,
    viewportY?: number
  ) => void
  setHover: React.Dispatch<React.SetStateAction<LineItemGraphHover | null>>
}

export type LineItemTooltipProps = {
  hover: LineItemGraphHover
  day: LineItemGraphDay
  series: Array<
    LineItemGraphSeries & {
      color: string
      plottedPoints: PlottedLineItemPoint[]
    }
  >
  hoveredSeries?: LineItemGraphSeries & { color: string }
  totalLabel?: React.ReactNode
  totalValue?: number
  valueFormatter: (value: number) => React.ReactNode
  pointMaps: Map<string, Map<string, LineItemGraphPoint>>
  onDismiss: () => void
}

export type LineItemTooltipRowsProps = {
  hover: LineItemGraphHover
  hoveredSeries: (LineItemGraphSeries & { color: string }) | undefined
  pointMaps: Map<string, Map<string, LineItemGraphPoint>>
  valueFormatter: (value: number) => React.ReactNode
  series: (LineItemGraphSeries & {
    color: string
    plottedPoints: PlottedLineItemPoint[]
  })[]
  totalLabel: React.ReactNode
  totalValue: number | undefined
}

export type AxisLabelProps = {
  day: LineItemGraphDay
  axisLabelMode: LineItemGraphAxisLabelMode
}
