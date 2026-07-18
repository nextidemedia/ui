import * as React from "react"
import { CalendarClock, Clock3, ZoomIn, ZoomOut } from "lucide-react"

import { Button } from "@nextide/ui/components/button"
import { Metric } from "@nextide/ui/components/metric"
import {
  StatusBadge,
  type StatusBadgeIndicator,
} from "@nextide/ui/components/status-badge"
import {
  Surface,
  SurfaceDescription,
  SurfaceHeader,
  SurfaceTitle,
} from "@nextide/ui/components/surface"
import { cn } from "@nextide/ui/lib/utils"

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

function CampaignScheduleMatrix({
  creators,
  days,
  bookings,
  title = "Campaign schedule",
  description = "Creator sessions arranged across campaign slots.",
  activeBookingId,
  onBookingSelect,
  className,
  ...props
}: React.ComponentProps<typeof Surface> & {
  creators: CampaignScheduleCreator[]
  days: CampaignScheduleDay[]
  bookings: CampaignScheduleBooking[]
  title?: React.ReactNode
  description?: React.ReactNode
  activeBookingId?: string
  onBookingSelect: (booking: CampaignScheduleBooking) => void
}) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  const zoomRef = React.useRef<CampaignScheduleZoom>("week")
  const zoomDurationRef = React.useRef(zoomDuration)
  const initialScrollPositionedRef = React.useRef(false)
  const zoomTransitionIdRef = React.useRef(0)
  const zoomTransitionTimerRef = React.useRef<ReturnType<
    typeof setTimeout
  > | null>(null)
  const wheelAccumulatorRef = React.useRef(0)
  const wheelResetTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  const wheelLockUntilRef = React.useRef(0)
  const zoomFocusRef = React.useRef<{
    ratio: number
    viewportX: number
  } | null>(null)
  const dragRef = React.useRef<{
    pointerId: number
    startX: number
    startScrollLeft: number
    dragged: boolean
  } | null>(null)
  const suppressClickRef = React.useRef(false)
  const suppressClickTimerRef = React.useRef<ReturnType<
    typeof setTimeout
  > | null>(null)
  const [zoom, setZoom] = React.useState<CampaignScheduleZoom>("week")
  const [zoomTransition, setZoomTransition] =
    React.useState<ZoomTransition | null>(null)
  const [dragging, setDragging] = React.useState(false)

  const datedDays = React.useMemo(
    () =>
      days.map((day, index) => ({
        ...day,
        dateValue: parseScheduleDate(day.date, index),
        index,
      })),
    [days]
  )
  const headerLayers = React.useMemo(
    () => createScheduleHeaderLayers(datedDays),
    [datedDays]
  )
  const boundedDays = Math.max(days.length, 1)
  const primaryUnits = headerLayers[zoom].primary.length
  const timelineMinWidth = Math.max(
    minimumTimelineWidth,
    primaryUnits * minimumUnitWidths[zoom]
  )
  const zoomIndex = zoomOrder.indexOf(zoom)
  const canZoomIn = zoomIndex > 0
  const canZoomOut = zoomIndex < zoomOrder.length - 1
  const liveBookings = bookings.filter((booking) =>
    creators.some((creator) => creator.id === booking.creatorId)
  )

  const requestZoom = React.useCallback(
    (nextZoom: CampaignScheduleZoom, viewportX?: number) => {
      const currentZoom = zoomRef.current
      if (currentZoom === nextZoom) return

      const node = scrollRef.current
      if (node) {
        zoomDurationRef.current = readCssTime(
          window
            .getComputedStyle(node)
            .getPropertyValue("--nextide-motion-layout"),
          zoomDuration
        )
        const resolvedViewportX = viewportX ?? node.clientWidth / 2
        const currentTimelineWidth = Math.max(
          node.scrollWidth - creatorColumnWidth,
          1
        )
        zoomFocusRef.current = {
          ratio: clamp(
            (node.scrollLeft + resolvedViewportX - creatorColumnWidth) /
              currentTimelineWidth,
            0,
            1
          ),
          viewportX: resolvedViewportX,
        }
      }

      const nextIndex = zoomOrder.indexOf(nextZoom)
      const currentIndex = zoomOrder.indexOf(currentZoom)
      const nextTransition: ZoomTransition = {
        id: ++zoomTransitionIdRef.current,
        from: currentZoom,
        direction: nextIndex > currentIndex ? "out" : "in",
      }

      if (zoomTransitionTimerRef.current) {
        clearTimeout(zoomTransitionTimerRef.current)
      }

      zoomRef.current = nextZoom
      setZoomTransition(nextTransition)
      setZoom(nextZoom)
      zoomTransitionTimerRef.current = setTimeout(
        () => setZoomTransition(null),
        zoomDurationRef.current
      )
    },
    []
  )

  React.useLayoutEffect(() => {
    const focus = zoomFocusRef.current
    const node = scrollRef.current
    if (!focus || !node || !zoomTransition) return

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    const startedAt = performance.now()
    const duration = reduceMotion ? 1 : zoomDurationRef.current
    let frame = 0

    const keepFocusAnchored = () => {
      const currentTimelineWidth = Math.max(
        node.scrollWidth - creatorColumnWidth,
        1
      )
      const nextScrollLeft =
        creatorColumnWidth +
        focus.ratio * currentTimelineWidth -
        focus.viewportX
      node.scrollLeft = clamp(
        nextScrollLeft,
        0,
        Math.max(node.scrollWidth - node.clientWidth, 0)
      )

      if (performance.now() - startedAt < duration) {
        frame = requestAnimationFrame(keepFocusAnchored)
      } else {
        zoomFocusRef.current = null
      }
    }

    frame = requestAnimationFrame(keepFocusAnchored)
    return () => cancelAnimationFrame(frame)
  }, [timelineMinWidth, zoomTransition])

  React.useLayoutEffect(() => {
    const node = scrollRef.current
    if (
      !node ||
      initialScrollPositionedRef.current ||
      zoomRef.current !== "week"
    ) {
      return
    }

    const todayWeekIndex = headerLayers.week.primary.findIndex(
      (span) => span.today
    )
    if (todayWeekIndex < 0) return

    const firstVisibleWeek =
      headerLayers.week.primary[Math.max(0, todayWeekIndex - 1)]
    if (!firstVisibleWeek) return

    const timelineWidth = Math.max(
      node.scrollWidth - creatorColumnWidth,
      timelineMinWidth
    )
    node.scrollLeft = clamp(
      (firstVisibleWeek.startIndex / boundedDays) * timelineWidth,
      0,
      Math.max(node.scrollWidth - node.clientWidth, 0)
    )
    initialScrollPositionedRef.current = true
  }, [boundedDays, headerLayers, timelineMinWidth])

  React.useEffect(() => {
    const node = scrollRef.current
    if (!node) return

    const handleWheel = (event: WheelEvent) => {
      if (
        event.ctrlKey ||
        event.metaKey ||
        Math.abs(event.deltaX) >= Math.abs(event.deltaY)
      ) {
        return
      }

      const now = performance.now()
      if (now < wheelLockUntilRef.current) {
        event.preventDefault()
        event.stopPropagation()
        return
      }

      const currentIndex = zoomOrder.indexOf(zoomRef.current)
      const direction = event.deltaY < 0 ? -1 : 1
      const nextIndex = currentIndex + direction
      if (nextIndex < 0 || nextIndex >= zoomOrder.length) {
        wheelAccumulatorRef.current = 0
        return
      }

      event.preventDefault()
      event.stopPropagation()

      const multiplier =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? node.clientHeight
            : 1
      const delta = event.deltaY * multiplier
      if (
        wheelAccumulatorRef.current !== 0 &&
        Math.sign(wheelAccumulatorRef.current) !== Math.sign(delta)
      ) {
        wheelAccumulatorRef.current = 0
      }
      wheelAccumulatorRef.current += delta

      if (wheelResetTimerRef.current) {
        clearTimeout(wheelResetTimerRef.current)
      }
      wheelResetTimerRef.current = setTimeout(() => {
        wheelAccumulatorRef.current = 0
      }, 140)

      if (Math.abs(wheelAccumulatorRef.current) < wheelThreshold) return

      const bounds = node.getBoundingClientRect()
      wheelAccumulatorRef.current = 0
      requestZoom(
        zoomOrder[nextIndex],
        clamp(event.clientX - bounds.left, 0, node.clientWidth)
      )
      wheelLockUntilRef.current = now + zoomDurationRef.current
    }

    node.addEventListener("wheel", handleWheel, { passive: false })
    return () => node.removeEventListener("wheel", handleWheel)
  }, [requestZoom])

  React.useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const drag = dragRef.current
      const node = scrollRef.current
      if (!drag || !node || event.pointerId !== drag.pointerId) return

      const distance = event.clientX - drag.startX
      if (!drag.dragged && Math.abs(distance) < 4) return

      if (!drag.dragged) {
        drag.dragged = true
        setDragging(true)
      }

      event.preventDefault()
      node.scrollLeft = clamp(
        drag.startScrollLeft - distance,
        0,
        Math.max(node.scrollWidth - node.clientWidth, 0)
      )
    }

    const finishPointerDrag = (event: PointerEvent) => {
      const drag = dragRef.current
      if (!drag || event.pointerId !== drag.pointerId) return

      suppressClickRef.current = drag.dragged
      if (suppressClickTimerRef.current) {
        clearTimeout(suppressClickTimerRef.current)
      }
      if (drag.dragged) {
        suppressClickTimerRef.current = setTimeout(() => {
          suppressClickRef.current = false
        }, 0)
      }
      dragRef.current = null
      setDragging(false)
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", finishPointerDrag)
    window.addEventListener("pointercancel", finishPointerDrag)
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", finishPointerDrag)
      window.removeEventListener("pointercancel", finishPointerDrag)
    }
  }, [])

  React.useEffect(
    () => () => {
      if (zoomTransitionTimerRef.current) {
        clearTimeout(zoomTransitionTimerRef.current)
      }
      if (wheelResetTimerRef.current) {
        clearTimeout(wheelResetTimerRef.current)
      }
      if (suppressClickTimerRef.current) {
        clearTimeout(suppressClickTimerRef.current)
      }
    },
    []
  )

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (
      event.pointerType !== "mouse" ||
      event.button !== 0 ||
      event.currentTarget.scrollWidth <= event.currentTarget.clientWidth
    ) {
      return
    }

    suppressClickRef.current = false
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: event.currentTarget.scrollLeft,
      dragged: false,
    }
  }

  const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return

    suppressClickRef.current = false
    if (suppressClickTimerRef.current) {
      clearTimeout(suppressClickTimerRef.current)
    }
    event.preventDefault()
    event.stopPropagation()
  }

  const zoomBy = (step: -1 | 1) => {
    const nextZoom = zoomOrder[zoomIndex + step]
    if (nextZoom) requestZoom(nextZoom)
  }

  return (
    <Surface
      data-slot="campaign-schedule-matrix"
      className={cn("grid gap-4", className)}
      {...props}
    >
      <SurfaceHeader className="flex flex-wrap items-start justify-between gap-3">
        <span className="grid gap-1">
          <SurfaceTitle>{title}</SurfaceTitle>
          {description ? (
            <SurfaceDescription>{description}</SurfaceDescription>
          ) : null}
        </span>
        <span className="grid justify-items-end">
          <span className="inline-flex h-8 items-center overflow-hidden rounded-md border border-nextide-line bg-background/25">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="rounded-none border-r border-nextide-line"
              disabled={!canZoomOut}
              aria-label="Zoom out"
              onClick={() => zoomBy(1)}
            >
              <ZoomOut />
            </Button>
            <span
              className="min-w-16 px-2 text-center text-ui-caption font-medium text-foreground"
              aria-live="polite"
            >
              {zoomLabels[zoom]}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="rounded-none border-l border-nextide-line"
              disabled={!canZoomIn}
              aria-label="Zoom in"
              onClick={() => zoomBy(-1)}
            >
              <ZoomIn />
            </Button>
          </span>
        </span>
      </SurfaceHeader>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric
          icon={<CalendarClock />}
          value={creators.length}
          label="Creators"
          detail="Rows in scope"
        />
        <Metric
          icon={<Clock3 />}
          value={days.length}
          label="Slots"
          detail="Visible window"
        />
        <Metric
          value={liveBookings.length}
          label="Bookings"
          detail="Planned sessions"
        />
      </div>

      <div
        ref={scrollRef}
        role="region"
        aria-label="Campaign schedule timeline"
        tabIndex={0}
        data-zoom={zoom}
        data-dragging={dragging ? "true" : "false"}
        onPointerDown={handlePointerDown}
        onClickCapture={handleClickCapture}
        onDragStart={(event) => event.preventDefault()}
        className="nextide-scrollbar-none relative cursor-grab overflow-x-auto rounded-xl border border-nextide-line bg-background/20 outline-none focus-visible:ring-2 focus-visible:ring-ring data-[dragging=true]:cursor-grabbing data-[dragging=true]:select-none"
      >
        <div
          className="grid w-full transition-[min-width] duration-[var(--nextide-motion-layout)] ease-[var(--nextide-ease-in-out-quart)] motion-reduce:transition-none"
          style={{
            minWidth: `calc(${creatorColumnWidth}px + ${timelineMinWidth}px)`,
            gridTemplateColumns: `${creatorColumnWidth}px minmax(0, 1fr)`,
          }}
        >
          <div className="sticky left-0 z-30 grid h-20 grid-rows-[1.75rem_3.25rem] border-r border-b border-nextide-line bg-nextide-panel">
            <span
              className={cn(
                "relative overflow-hidden text-ui-micro font-medium text-muted-foreground",
                headerTierClasses[contextTierForZoom(zoom)]
              )}
            >
              {zoomTransition ? (
                <ScheduleContextLabel
                  key={`old-context-${zoomTransition.id}`}
                  label={contextLabels[zoomTransition.from]}
                  phase="exit"
                  direction={zoomTransition.direction}
                />
              ) : null}
              <ScheduleContextLabel
                key={`current-context-${zoom}-${zoomTransition?.id ?? "idle"}`}
                label={contextLabels[zoom]}
                phase={zoomTransition ? "enter" : "idle"}
                direction={zoomTransition?.direction ?? "out"}
              />
            </span>
            <span
              className={cn(
                "flex items-center border-t border-nextide-line/70 px-3 text-ui-caption font-medium text-muted-foreground",
                headerTierClasses[zoom]
              )}
            >
              Creator
            </span>
          </div>
          <div className="relative h-20 overflow-hidden border-b border-nextide-line bg-background/35">
            {zoomTransition ? (
              <ScheduleHeader
                key={`old-${zoomTransition.id}`}
                layer={headerLayers[zoomTransition.from]}
                zoom={zoomTransition.from}
                boundedDays={boundedDays}
                phase="exit"
                direction={zoomTransition.direction}
              />
            ) : null}
            <ScheduleHeader
              key={`current-${zoom}-${zoomTransition?.id ?? "idle"}`}
              layer={headerLayers[zoom]}
              zoom={zoom}
              boundedDays={boundedDays}
              phase={zoomTransition ? "enter" : "idle"}
              direction={zoomTransition?.direction ?? "out"}
            />
          </div>

          {creators.map((creator) => {
            const creatorBookings = liveBookings.filter(
              (booking) => booking.creatorId === creator.id
            )

            return (
              <React.Fragment key={creator.id}>
                <div className="sticky left-0 z-20 flex min-w-0 items-center gap-2 border-r border-b border-nextide-line bg-nextide-panel p-3">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-nextide-line bg-background/35 text-xs font-medium text-nextide-tide">
                    {creator.avatar ?? initialsFromNode(creator.name)}
                  </span>
                  <span className="grid min-w-0 gap-0.5">
                    <strong className="truncate text-sm leading-tight">
                      {creator.name}
                    </strong>
                    {creator.meta ? (
                      <span className="truncate text-xs text-muted-foreground">
                        {creator.meta}
                      </span>
                    ) : null}
                  </span>
                </div>
                <div
                  className="relative grid min-h-16 border-b border-nextide-line/70"
                  style={{
                    gridTemplateColumns: `repeat(${boundedDays}, minmax(0, 1fr))`,
                  }}
                >
                  {zoomTransition ? (
                    <ScheduleGridLines
                      key={`old-grid-${creator.id}-${zoomTransition.id}`}
                      spans={headerLayers[zoomTransition.from].primary}
                      boundedDays={boundedDays}
                      phase="exit"
                      direction={zoomTransition.direction}
                    />
                  ) : null}
                  <ScheduleGridLines
                    key={`current-grid-${creator.id}-${zoom}-${zoomTransition?.id ?? "idle"}`}
                    spans={headerLayers[zoom].primary}
                    boundedDays={boundedDays}
                    phase={zoomTransition ? "enter" : "idle"}
                    direction={zoomTransition?.direction ?? "out"}
                  />
                  {creatorBookings.map((booking) => {
                    const start = clamp(booking.startIndex, 0, boundedDays - 1)
                    const end = clamp(booking.endIndex, start, boundedDays - 1)
                    const active = booking.id === activeBookingId

                    return (
                      <button
                        key={booking.id}
                        type="button"
                        data-slot="campaign-schedule-booking"
                        className={cn(
                          "absolute top-2 bottom-2 flex min-w-0 cursor-pointer items-center rounded-lg border py-2 pr-16 pl-4 text-left shadow-[inset_0_1px_0_rgb(255_255_255/0.04)] transition-[background-color,border-color,box-shadow] duration-[var(--nextide-motion-state)] before:absolute before:inset-y-2 before:left-1.5 before:w-0.5 before:rounded-sm focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none in-data-[dragging=true]:cursor-grabbing",
                          bookingToneClasses[booking.tone ?? "success"],
                          active &&
                            "border-nextide-tide bg-nextide-tide/12 shadow-[0_0_0_1px_rgb(30_228_188/0.38),0_0_24px_rgb(30_228_188/0.14)]"
                        )}
                        style={{
                          left: `${(start / boundedDays) * 100}%`,
                          width: `${((end - start + 1) / boundedDays) * 100}%`,
                        }}
                        onClick={() => onBookingSelect(booking)}
                      >
                        <span className="grid min-w-0 gap-0.5 self-center">
                          <span className="truncate text-sm leading-tight font-medium">
                            {booking.title}
                          </span>
                          {booking.meta ? (
                            <span className="truncate text-ui-caption text-muted-foreground">
                              {booking.meta}
                            </span>
                          ) : null}
                        </span>
                        {booking.status ? (
                          <StatusBadge
                            tone={booking.tone ?? "success"}
                            size="compact"
                            indicator={booking.statusIndicator ?? "none"}
                            className="absolute top-1.5 right-2 uppercase"
                          >
                            {booking.status}
                          </StatusBadge>
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </Surface>
  )
}

function ScheduleHeader({
  layer,
  zoom,
  boundedDays,
  phase,
  direction,
}: {
  layer: ScheduleHeaderLayer
  zoom: CampaignScheduleZoom
  boundedDays: number
  phase: "idle" | "enter" | "exit"
  direction: "in" | "out"
}) {
  return (
    <div
      aria-hidden={phase === "exit" ? "true" : undefined}
      className={cn(
        "absolute inset-0 grid grid-rows-[1.75rem_3.25rem] bg-background/95",
        scheduleTransitionClass(phase, direction)
      )}
    >
      <span
        className={cn(
          "grid border-b border-nextide-line/70",
          headerTierClasses[contextTierForZoom(zoom)]
        )}
        style={{
          gridTemplateColumns: `repeat(${boundedDays}, minmax(0, 1fr))`,
        }}
      >
        {layer.context.map((span) => (
          <span
            key={span.id}
            className="flex min-w-0 items-center justify-center border-r border-nextide-line/60 px-2 text-ui-micro font-medium text-muted-foreground last:border-r-0"
            style={{
              gridColumn: `${span.startIndex + 1} / ${span.endIndex + 2}`,
            }}
          >
            <span className="truncate">{span.contextLabel ?? span.label}</span>
          </span>
        ))}
      </span>
      <span
        className={cn("grid", headerTierClasses[zoom])}
        style={{
          gridTemplateColumns: `repeat(${boundedDays}, minmax(0, 1fr))`,
        }}
      >
        {layer.primary.map((span) => (
          <span
            key={span.id}
            className={cn(
              "grid min-w-0 content-center border-r border-nextide-line/60 px-2 text-center last:border-r-0",
              span.today && "bg-nextide-tide/8 text-nextide-tide"
            )}
            style={{
              gridColumn: `${span.startIndex + 1} / ${span.endIndex + 2}`,
            }}
          >
            <span className="truncate text-ui-caption font-medium text-foreground">
              {span.label}
            </span>
            {span.meta ? (
              <span className="truncate text-ui-micro text-muted-foreground">
                {span.meta}
              </span>
            ) : null}
          </span>
        ))}
      </span>
    </div>
  )
}

function ScheduleContextLabel({
  label,
  phase,
  direction,
}: {
  label: React.ReactNode
  phase: "idle" | "enter" | "exit"
  direction: "in" | "out"
}) {
  return (
    <span
      aria-hidden={phase === "exit" ? "true" : undefined}
      className={cn(
        "absolute inset-0 flex items-center px-3",
        scheduleTransitionClass(phase, direction)
      )}
    >
      {label}
    </span>
  )
}

function ScheduleGridLines({
  spans,
  boundedDays,
  phase,
  direction,
}: {
  spans: ScheduleHeaderSpan[]
  boundedDays: number
  phase: "idle" | "enter" | "exit"
  direction: "in" | "out"
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 grid",
        scheduleTransitionClass(phase, direction)
      )}
      style={{
        gridTemplateColumns: `repeat(${boundedDays}, minmax(0, 1fr))`,
      }}
    >
      {spans.map((span) => (
        <span
          key={span.id}
          className={cn(
            "border-r border-nextide-line/50 last:border-r-0",
            span.today && "bg-nextide-tide/5"
          )}
          style={{
            gridColumn: `${span.startIndex + 1} / ${span.endIndex + 2}`,
          }}
        />
      ))}
    </span>
  )
}

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
  CampaignScheduleMatrix,
  type CampaignScheduleBooking,
  type CampaignScheduleCreator,
  type CampaignScheduleDay,
  type CampaignScheduleTone,
  type CampaignScheduleZoom,
}
