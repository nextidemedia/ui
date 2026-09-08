import * as React from "react"

import { Surface } from "@nextide/ui/components/surface"
import { cn } from "@nextide/ui/lib/utils"
import {
  createScheduleHeaderLayers,
  parseScheduleDate,
  creatorColumnWidth,
  type CampaignScheduleCreator,
  type CampaignScheduleDay,
  type CampaignScheduleBooking,
} from "./campaign-schedule-matrix-model.js"
import {
  ScheduleToolbar,
  ScheduleMetrics,
  ScheduleTimelineHeader,
  ScheduleCreatorRow,
  type ScheduleViewState,
} from "./campaign-schedule-matrix-views.js"
import {
  useScheduleZoom,
  type ScrollRef,
} from "./campaign-schedule-matrix-zoom.js"
import { useScheduleDrag } from "./campaign-schedule-matrix-drag.js"

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
  const { zoom, zoomTransition, timelineMinWidth, zoomBy } = useScheduleZoom(
    scrollRef,
    headerLayers,
    boundedDays
  )
  const liveBookings = bookings.filter((booking) =>
    creators.some((creator) => creator.id === booking.creatorId)
  )
  return (
    <Surface
      data-slot="campaign-schedule-matrix"
      className={cn("grid gap-4", className)}
      {...props}
    >
      <ScheduleToolbar
        title={title}
        description={description}
        zoom={zoom}
        zoomBy={zoomBy}
      />
      <ScheduleMetrics
        creatorCount={creators.length}
        dayCount={days.length}
        bookingCount={liveBookings.length}
      />
      <ScheduleTimeline
        scrollRef={scrollRef}
        timelineMinWidth={timelineMinWidth}
        zoom={zoom}
        zoomTransition={zoomTransition}
        headerLayers={headerLayers}
        boundedDays={boundedDays}
      >
        {creators.map((creator) => (
          <ScheduleCreatorRow
            key={creator.id}
            creator={creator}
            bookings={liveBookings}
            activeBookingId={activeBookingId}
            onBookingSelect={onBookingSelect}
            zoom={zoom}
            zoomTransition={zoomTransition}
            headerLayers={headerLayers}
            boundedDays={boundedDays}
          />
        ))}
      </ScheduleTimeline>
    </Surface>
  )
}

function ScheduleTimeline({
  scrollRef,
  timelineMinWidth,
  zoom,
  zoomTransition,
  headerLayers,
  boundedDays,
  children,
}: ScheduleViewState & {
  scrollRef: ScrollRef
  timelineMinWidth: number
  children: React.ReactNode
}) {
  const { dragging, handlePointerDown, handleClickCapture } =
    useScheduleDrag(scrollRef)
  return (
    <>
      {/* oxlint-disable-next-line react-doctor/click-events-have-key-events -- This region only cancels bubbled child clicks after a pointer drag; it is not an activation target. */}
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Named scroll region supports keyboard scrolling and pointer panning; it is not an activation target. */}
      <div
        ref={scrollRef}
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- Named scroll region supports keyboard scrolling and pointer panning; it is not an activation target.
        role="region"
        aria-label="Campaign schedule timeline"
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Named scroll region supports keyboard scrolling and pointer panning; it is not an activation target.
        tabIndex={0}
        data-zoom={zoom}
        data-dragging={dragging ? "true" : "false"}
        onPointerDown={handlePointerDown}
        onClickCapture={handleClickCapture}
        onDragStart={(event) => event.preventDefault()}
        className="nextide-scrollbar-none relative overflow-x-auto rounded-xl border border-nextide-line bg-background/20 outline-none focus-visible:ring-(length:--nextide-focus-ring-width) focus-visible:ring-ring data-[dragging=true]:select-none"
      >
        <div
          className="grid w-full transition-[min-width] duration-[var(--nextide-motion-layout)] ease-[var(--nextide-ease-in-out-quart)] motion-reduce:transition-none"
          style={{
            minWidth: `calc(${creatorColumnWidth}px + ${timelineMinWidth}px)`,
            gridTemplateColumns: `${creatorColumnWidth}px minmax(0, 1fr)`,
          }}
        >
          <ScheduleTimelineHeader
            zoom={zoom}
            zoomTransition={zoomTransition}
            headerLayers={headerLayers}
            boundedDays={boundedDays}
          />
          {children}
        </div>
      </div>
    </>
  )
}

export { CampaignScheduleMatrix }
export type {
  CampaignScheduleBooking,
  CampaignScheduleCreator,
  CampaignScheduleDay,
  CampaignScheduleTone,
  CampaignScheduleZoom,
} from "./campaign-schedule-matrix-model.js"
