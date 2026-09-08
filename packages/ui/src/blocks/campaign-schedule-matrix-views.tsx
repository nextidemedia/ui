import * as React from "react"
import { CalendarClock, Clock3, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@nextide/ui/components/button"
import { Metric } from "@nextide/ui/components/metric"
import { StatusBadge } from "@nextide/ui/components/status-badge"
import {
  SurfaceDescription,
  SurfaceHeader,
  SurfaceTitle,
} from "@nextide/ui/components/surface"
import { cn } from "@nextide/ui/lib/utils"
import {
  bookingToneClasses,
  headerTierClasses,
  zoomOrder,
  zoomLabels,
  contextLabels,
  contextTierForZoom,
  scheduleTransitionClass,
  initialsFromNode,
  clamp,
  type CampaignScheduleZoom,
  type CampaignScheduleCreator,
  type CampaignScheduleBooking,
  type ScheduleHeaderLayer,
  type ScheduleHeaderSpan,
  type ZoomTransition,
} from "./campaign-schedule-matrix-model.js"

type ScheduleViewState = {
  zoom: CampaignScheduleZoom
  zoomTransition: ZoomTransition | null
  headerLayers: Record<CampaignScheduleZoom, ScheduleHeaderLayer>
  boundedDays: number
}

function ScheduleToolbar({
  title,
  description,
  zoom,
  zoomBy,
}: {
  title: React.ReactNode
  description: React.ReactNode
  zoom: CampaignScheduleZoom
  zoomBy: (step: -1 | 1) => void
}) {
  const zoomIndex = zoomOrder.indexOf(zoom)
  const canZoomIn = zoomIndex > 0
  const canZoomOut = zoomIndex < zoomOrder.length - 1
  return (
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
  )
}

function ScheduleMetrics({
  creatorCount,
  dayCount,
  bookingCount,
}: {
  creatorCount: number
  dayCount: number
  bookingCount: number
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Metric
        icon={<CalendarClock />}
        value={creatorCount}
        label="Creators"
        detail="Rows in scope"
      />
      <Metric
        icon={<Clock3 />}
        value={dayCount}
        label="Slots"
        detail="Visible window"
      />
      <Metric value={bookingCount} label="Bookings" detail="Planned sessions" />
    </div>
  )
}

function ScheduleTimelineHeader({
  zoom,
  zoomTransition,
  headerLayers,
  boundedDays,
}: ScheduleViewState) {
  return (
    <>
      <ScheduleCornerLegend zoom={zoom} zoomTransition={zoomTransition} />
      <div
        data-slot="campaign-schedule-top-legend"
        className="relative h-20 overflow-hidden border-b border-nextide-line bg-background/35"
      >
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
    </>
  )
}

function ScheduleCornerLegend({
  zoom,
  zoomTransition,
}: Pick<ScheduleViewState, "zoom" | "zoomTransition">) {
  return (
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
  )
}

function ScheduleCreatorRow({
  creator,
  bookings,
  activeBookingId,
  onBookingSelect,
  zoom,
  zoomTransition,
  headerLayers,
  boundedDays,
}: ScheduleViewState & {
  creator: CampaignScheduleCreator
  bookings: CampaignScheduleBooking[]
  activeBookingId?: string
  onBookingSelect: (booking: CampaignScheduleBooking) => void
}) {
  const creatorBookings = bookings.filter(
    (booking) => booking.creatorId === creator.id
  )
  return (
    <>
      <ScheduleCreatorLegend creator={creator} />
      <div
        data-slot="campaign-schedule-board-row"
        className="relative grid min-h-16 cursor-grab border-b border-nextide-line/70 in-data-[dragging=true]:cursor-grabbing"
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
        {creatorBookings.map((booking) => (
          <ScheduleBooking
            key={booking.id}
            booking={booking}
            boundedDays={boundedDays}
            active={booking.id === activeBookingId}
            onBookingSelect={onBookingSelect}
          />
        ))}
      </div>
    </>
  )
}

function ScheduleCreatorLegend({
  creator,
}: {
  creator: CampaignScheduleCreator
}) {
  return (
    <div
      data-slot="campaign-schedule-creator-legend"
      className="sticky left-0 z-20 flex min-w-0 items-center gap-2 border-r border-b border-nextide-line bg-nextide-panel p-3"
    >
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
  )
}

function ScheduleBooking({
  booking,
  boundedDays,
  active,
  onBookingSelect,
}: {
  booking: CampaignScheduleBooking
  boundedDays: number
  active: boolean
  onBookingSelect: (booking: CampaignScheduleBooking) => void
}) {
  const start = clamp(booking.startIndex, 0, boundedDays - 1)
  const end = clamp(booking.endIndex, start, boundedDays - 1)
  return (
    <button
      type="button"
      data-slot="campaign-schedule-booking"
      className={cn(
        "absolute top-2 bottom-2 flex min-w-0 cursor-pointer items-center rounded-lg border py-2 pr-16 pl-4 text-left shadow-[inset_0_1px_0_rgb(255_255_255/0.04)] transition-[background-color,border-color,box-shadow] duration-[var(--nextide-motion-state)] before:absolute before:inset-y-2 before:left-1.5 before:w-0.5 before:rounded-sm focus-visible:border-ring focus-visible:ring-(length:--nextide-focus-ring-width) focus-visible:ring-ring focus-visible:outline-none in-data-[dragging=true]:cursor-grabbing",
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

export {
  ScheduleToolbar,
  ScheduleMetrics,
  ScheduleTimelineHeader,
  ScheduleCreatorRow,
  type ScheduleViewState,
}
