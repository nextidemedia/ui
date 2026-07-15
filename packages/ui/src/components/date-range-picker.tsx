import * as React from "react"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@nextide/ui/lib/utils"

type DateRange = {
  start: string
  end: string
}

type DateRangeEdge = "start" | "end"
type CalendarGridSize = "compact" | "regular"

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
})

const compactDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

function SingleCalendarDateRangePicker({
  value,
  onValueChange,
  className,
  ...props
}: React.ComponentProps<"section"> & {
  value: DateRange
  onValueChange: (value: DateRange) => void
}) {
  const [activeEdge, setActiveEdge] = React.useState<DateRangeEdge>("start")
  const [month, setMonth] = React.useState(() =>
    startOfMonth(parseDate(value.start))
  )

  return (
    <section
      data-slot="single-calendar-date-range-picker"
      className={cn(
        "grid gap-3 rounded-lg border border-nextide-line bg-nextide-panel p-3",
        className
      )}
      {...props}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-nextide-tide" />
          <strong className="text-sm">Single calendar range</strong>
        </div>
        <div className="flex flex-wrap gap-2">
          <RangeEdgeButton
            edge="start"
            activeEdge={activeEdge}
            value={value.start}
            onClick={() => setActiveEdge("start")}
          />
          <RangeEdgeButton
            edge="end"
            activeEdge={activeEdge}
            value={value.end}
            onClick={() => setActiveEdge("end")}
          />
        </div>
      </div>
      <div className="mx-auto w-full max-w-[30rem]">
        <CalendarGrid
          month={month}
          value={value}
          activeEdge={activeEdge}
          size="regular"
          onMonthChange={setMonth}
          onSelectDate={(date) => {
            const dateKey = formatDateKey(date)
            if (activeEdge === "start") {
              onValueChange({
                start: dateKey,
                end: dateKey > value.end ? dateKey : value.end,
              })
              setActiveEdge("end")
              return
            }

            onValueChange({
              start: dateKey < value.start ? dateKey : value.start,
              end: dateKey,
            })
            setActiveEdge("start")
          }}
        />
      </div>
    </section>
  )
}

function SingleDatePicker({
  value,
  onValueChange,
  label = "Event date",
  className,
  ...props
}: React.ComponentProps<"section"> & {
  value: string
  onValueChange: (value: string) => void
  label?: React.ReactNode
}) {
  return (
    <section
      data-slot="single-date-picker"
      className={cn(
        "grid gap-3 rounded-lg border border-nextide-line bg-nextide-panel p-3",
        className
      )}
      {...props}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-nextide-tide" />
          <strong className="text-sm">{label}</strong>
        </div>
        <span className="rounded-md border border-nextide-line bg-background/25 px-2 py-1 text-xs font-medium text-muted-foreground">
          {formatDisplayDate(value)}
        </span>
      </div>
      <SingleDateCalendar
        key={value}
        value={value}
        onValueChange={onValueChange}
      />
    </section>
  )
}

function SingleDateCalendar({
  value,
  onValueChange,
}: {
  value: string
  onValueChange: (value: string) => void
}) {
  const [month, setMonth] = React.useState(() => startOfMonth(parseDate(value)))

  return (
    <CalendarGrid
      month={month}
      value={{ start: value, end: value }}
      activeEdge="start"
      size="regular"
      onMonthChange={setMonth}
      onSelectDate={(date) => onValueChange(formatDateKey(date))}
    />
  )
}

function CalendarGrid({
  month,
  value,
  activeEdge,
  size = "regular",
  todayDate,
  onMonthChange,
  onSelectDate,
}: {
  month: Date
  value: DateRange
  activeEdge: DateRangeEdge
  size?: CalendarGridSize
  todayDate?: Date
  onMonthChange: (date: Date) => void
  onSelectDate: (date: Date) => void
}) {
  const days = React.useMemo(() => buildCalendarDays(month), [month])
  const rangeStart = value.start <= value.end ? value.start : value.end
  const rangeEnd = value.start <= value.end ? value.end : value.start
  const todayKey = formatDateKey(todayDate ?? new Date())

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="Previous month"
          className={calendarIconButtonClassName}
          onClick={() => onMonthChange(addMonths(month, -1))}
        >
          <ChevronLeft className="size-4" />
        </button>
        <strong className="text-sm">{monthFormatter.format(month)}</strong>
        <button
          type="button"
          aria-label="Next month"
          className={calendarIconButtonClassName}
          onClick={() => onMonthChange(addMonths(month, 1))}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdayLabels.map((weekday) => (
          <span
            key={weekday}
            className="py-1 text-ui-caption font-medium text-muted-foreground"
          >
            {weekday}
          </span>
        ))}
        {days.map((date) => {
          const key = formatDateKey(date)
          const inMonth = isSameMonth(date, month)
          const inRange = key >= rangeStart && key <= rangeEnd
          const selected = key === value.start || key === value.end
          const active = key === value[activeEdge]
          const today = key === todayKey

          return (
            <button
              key={key}
              type="button"
              aria-pressed={selected}
              aria-current={today ? "date" : undefined}
              onClick={() => onSelectDate(date)}
              className={cn(
                "relative grid place-items-center rounded-lg border border-transparent font-medium transition-[background-color,border-color,color,box-shadow] duration-[var(--nextide-motion-state)] outline-none hover:border-nextide-tide/35 hover:bg-nextide-tide/10 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring",
                size === "compact" ? "h-9 text-xs" : "h-11 text-sm sm:h-12",
                !inMonth && "text-muted-foreground/35",
                inRange && "bg-nextide-tide/8 text-foreground",
                today &&
                  "border-nextide-yellow/55 text-nextide-yellow ring-1 ring-nextide-yellow/25",
                selected &&
                  "border-nextide-tide/65 bg-nextide-tide/18 text-nextide-tide shadow-[0_0_20px_rgb(30_228_188/0.12)]",
                active && "ring-1 ring-nextide-tide/35"
              )}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function RangeEdgeButton({
  edge,
  activeEdge,
  value,
  onClick,
}: {
  edge: DateRangeEdge
  activeEdge: DateRangeEdge
  value: string
  onClick: () => void
}) {
  const active = edge === activeEdge

  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "rounded-md border px-2 py-1 text-xs font-medium transition-[background-color,border-color,color,box-shadow]",
        active
          ? "border-nextide-tide/65 bg-nextide-tide/12 text-nextide-tide shadow-[0_0_16px_rgb(30_228_188/0.14)]"
          : "border-nextide-line bg-background/25 text-muted-foreground"
      )}
      onClick={onClick}
    >
      {edge === "start" ? "Start" : "End"} {formatDisplayDate(value)}
    </button>
  )
}

function buildCalendarDays(month: Date) {
  const firstDay = startOfMonth(month)
  const mondayOffset = (firstDay.getDay() + 6) % 7
  const gridStart = addDays(firstDay, -mondayOffset)
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index))
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) {
    return new Date()
  }

  return new Date(year, month - 1, day)
}

function formatDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`
}

function formatDisplayDate(value: string) {
  return compactDateFormatter.format(parseDate(value))
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

function isSameMonth(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth()
  )
}

const calendarIconButtonClassName =
  "grid size-8 place-items-center rounded-lg border border-nextide-line bg-background/25 text-muted-foreground transition-[background-color,color,border-color] hover:border-nextide-tide/45 hover:bg-nextide-tide/10 hover:text-nextide-tide focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring"

export {
  SingleCalendarDateRangePicker,
  SingleDatePicker,
  type DateRange,
}
