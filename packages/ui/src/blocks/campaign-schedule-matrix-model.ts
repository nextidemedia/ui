import type * as React from "react"
import type { StatusBadgeIndicator } from "@nextide/ui/components/status-badge"

type CampaignScheduleTone = "neutral" | "success" | "processing" | "warning"
type CampaignScheduleZoom = "day" | "week" | "month"
type CampaignScheduleTier = CampaignScheduleZoom | "quarter"

type CampaignScheduleCreator = {
  id: string
  name: React.ReactNode
  meta?: React.ReactNode
  avatar?: React.ReactNode
}

type CampaignScheduleDay = {
  id: string
  date: string
  label?: React.ReactNode
  meta?: React.ReactNode
  today?: boolean
}

type CampaignScheduleBooking = {
  id: string
  creatorId: string
  title: React.ReactNode
  meta?: React.ReactNode
  startIndex: number
  endIndex: number
  tone?: CampaignScheduleTone
  status?: React.ReactNode
  statusIndicator?: StatusBadgeIndicator
}

type DatedScheduleDay = CampaignScheduleDay & {
  dateValue: Date
  index: number
}

type ScheduleHeaderSpan = {
  id: string
  label: React.ReactNode
  contextLabel?: React.ReactNode
  meta?: React.ReactNode
  startIndex: number
  endIndex: number
  today?: boolean
}

type ScheduleHeaderLayer = {
  context: ScheduleHeaderSpan[]
  primary: ScheduleHeaderSpan[]
}

type ZoomTransition = {
  id: number
  from: CampaignScheduleZoom
  direction: "in" | "out"
}

const bookingToneClasses: Record<CampaignScheduleTone, string> = {
  neutral:
    "border-nextide-line bg-background/70 text-foreground before:bg-muted-foreground",
  success:
    "border-nextide-tide/35 bg-[linear-gradient(90deg,rgb(30_228_188/0.11),rgb(30_228_188/0.035))] text-foreground before:bg-nextide-tide",
  processing:
    "border-nextide-purple/35 bg-[linear-gradient(90deg,rgb(175_46_255/0.11),rgb(175_46_255/0.035))] text-foreground before:bg-nextide-purple",
  warning:
    "border-nextide-yellow/35 bg-[linear-gradient(90deg,rgb(255_218_83/0.11),rgb(255_218_83/0.035))] text-foreground before:bg-nextide-yellow",
}

const headerTierClasses: Record<CampaignScheduleTier, string> = {
  day: "bg-background/20",
  week: "bg-nextide-panel/55",
  month: "bg-nextide-panel-strong/45",
  quarter: "bg-nextide-tide/[0.045]",
}

const zoomOrder = ["day", "week", "month"] as const
const zoomLabels: Record<CampaignScheduleZoom, string> = {
  day: "Days",
  week: "Weeks",
  month: "Months",
}
const contextLabels: Record<CampaignScheduleZoom, string> = {
  day: "Week",
  week: "Month",
  month: "Quarter",
}
const minimumUnitWidths: Record<CampaignScheduleZoom, number> = {
  day: 88,
  week: 112,
  month: 176,
}
const creatorColumnWidth = 160
const minimumTimelineWidth = 672
const zoomDuration = 300
const wheelThreshold = 48

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  timeZone: "UTC",
})
const monthDayFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
})
const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
})

function scheduleTransitionClass(
  phase: "idle" | "enter" | "exit",
  direction: "in" | "out"
) {
  if (phase === "idle") return undefined
  return `nextide-schedule-layer-${phase}-${direction}`
}

function contextTierForZoom(zoom: CampaignScheduleZoom): CampaignScheduleTier {
  if (zoom === "day") return "week"
  if (zoom === "week") return "month"
  return "quarter"
}

function createScheduleHeaderLayers(
  days: DatedScheduleDay[]
): Record<CampaignScheduleZoom, ScheduleHeaderLayer> {
  const daySpans = days.map((day) => ({
    id: day.id,
    label: day.label ?? weekdayFormatter.format(day.dateValue),
    meta: day.meta ?? monthDayFormatter.format(day.dateValue),
    startIndex: day.index,
    endIndex: day.index,
    today: day.today,
  }))
  const weekSpans = groupScheduleDays(days, weekKey, (start, end) => {
    const { week, year } = isoWeek(start.dateValue)
    return {
      id: `week-${year}-${week}`,
      label: `W${week}`,
      contextLabel: `Week ${week}`,
      meta: formatDateRange(start.dateValue, end.dateValue),
    }
  })
  const monthSpans = groupScheduleDays(days, monthKey, (start) => ({
    id: `month-${monthKey(start.dateValue)}`,
    label: monthFormatter.format(start.dateValue),
    contextLabel: `${monthFormatter.format(start.dateValue)} ${start.dateValue.getUTCFullYear()}`,
    meta: start.dateValue.getUTCFullYear().toString(),
  }))
  const quarterSpans = groupScheduleDays(days, quarterKey, (start) => {
    const quarter = Math.floor(start.dateValue.getUTCMonth() / 3) + 1
    const year = start.dateValue.getUTCFullYear()
    return {
      id: `quarter-${year}-${quarter}`,
      label: `Q${quarter}`,
      contextLabel: `Q${quarter} ${year}`,
      meta: year.toString(),
    }
  })

  return {
    day: { context: weekSpans, primary: daySpans },
    week: { context: monthSpans, primary: weekSpans },
    month: { context: quarterSpans, primary: monthSpans },
  }
}

function groupScheduleDays(
  days: DatedScheduleDay[],
  keyFor: (date: Date) => string,
  describe: (
    start: DatedScheduleDay,
    end: DatedScheduleDay
  ) => Pick<ScheduleHeaderSpan, "id" | "label" | "contextLabel" | "meta">
) {
  const spans: ScheduleHeaderSpan[] = []
  let startAt = 0

  for (let index = 1; index <= days.length; index += 1) {
    const previous = days[index - 1]
    const next = days[index]
    if (next && keyFor(next.dateValue) === keyFor(previous.dateValue)) {
      continue
    }

    const start = days[startAt]
    const end = previous
    if (start && end) {
      spans.push({
        ...describe(start, end),
        startIndex: start.index,
        endIndex: end.index,
        today: days.slice(startAt, index).some((day) => day.today),
      })
    }
    startAt = index
  }

  return spans
}

function parseScheduleDate(value: string, index: number) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return new Date(Date.UTC(1970, 0, index + 1))

  return new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  )
}

function isoWeek(date: Date) {
  const target = new Date(date.getTime())
  const day = target.getUTCDay() || 7
  target.setUTCDate(target.getUTCDate() + 4 - day)
  const year = target.getUTCFullYear()
  const yearStart = new Date(Date.UTC(year, 0, 1))
  const week = Math.ceil(
    ((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  )
  return { week, year }
}

function weekKey(date: Date) {
  const { week, year } = isoWeek(date)
  return `${year}-${week}`
}

function monthKey(date: Date) {
  return `${date.getUTCFullYear()}-${date.getUTCMonth()}`
}

function quarterKey(date: Date) {
  return `${date.getUTCFullYear()}-${Math.floor(date.getUTCMonth() / 3)}`
}

function formatDateRange(start: Date, end: Date) {
  if (
    start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth()
  ) {
    return `${monthFormatter.format(start)} ${start.getUTCDate()}–${end.getUTCDate()}`
  }

  return `${monthDayFormatter.format(start)}–${monthDayFormatter.format(end)}`
}

function initialsFromNode(node: React.ReactNode) {
  return typeof node === "string"
    ? node
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "NX"
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function readCssTime(value: string, fallback: number) {
  const parsed = Number.parseFloat(value)
  if (!Number.isFinite(parsed)) return fallback
  return value.trim().endsWith("s") && !value.trim().endsWith("ms")
    ? parsed * 1000
    : parsed
}

export {
  type CampaignScheduleTone,
  type CampaignScheduleZoom,
  type CampaignScheduleCreator,
  type CampaignScheduleDay,
  type CampaignScheduleBooking,
  type ScheduleHeaderLayer,
  type ScheduleHeaderSpan,
  type ZoomTransition,
  bookingToneClasses,
  headerTierClasses,
  zoomOrder,
  zoomLabels,
  contextLabels,
  minimumUnitWidths,
  creatorColumnWidth,
  minimumTimelineWidth,
  zoomDuration,
  wheelThreshold,
  createScheduleHeaderLayers,
  parseScheduleDate,
  contextTierForZoom,
  scheduleTransitionClass,
  initialsFromNode,
  clamp,
  readCssTime,
}
