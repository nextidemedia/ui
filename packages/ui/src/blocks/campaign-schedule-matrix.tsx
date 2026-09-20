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

type CampaignScheduleMatrixProps = React.ComponentProps<typeof Surface> & {
  creators: CampaignScheduleCreator[]
  days: CampaignScheduleDay[]
  bookings: CampaignScheduleBooking[]
  title?: React.ReactNode
  description?: React.ReactNode
  activeBookingId?: string
  onBookingSelect: (booking: CampaignScheduleBooking) => void
  minimumRows?: number
  showMetrics?: boolean
  campaignStartIndex?: number
  campaignEndIndex?: number
  editableStartIndex?: number
  editableEndIndex?: number
  onBookingChange?: (booking: CampaignScheduleBooking) => void
  onBookingSplit?: (
    booking: CampaignScheduleBooking,
    splitIndex: number
  ) => void
  onCreatorOrderChange?: (creatorIds: string[]) => void
}

function CampaignScheduleMatrix({
  creators,
  days,
  bookings,
  title = "Campaign schedule",
  description = "Creator sessions arranged across campaign slots.",
  activeBookingId,
  onBookingSelect,
  minimumRows = 0,
  showMetrics = true,
  campaignStartIndex,
  campaignEndIndex,
  editableStartIndex = 0,
  editableEndIndex = days.length - 1,
  onBookingChange,
  onBookingSplit,
  onCreatorOrderChange,
  className,
  ...props
}: CampaignScheduleMatrixProps) {
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
      {showMetrics && (
        <ScheduleMetrics
          creatorCount={creators.length}
          dayCount={days.length}
          bookingCount={liveBookings.length}
        />
      )}
      <ScheduleTimeline
        campaignStartIndex={campaignStartIndex}
        campaignEndIndex={campaignEndIndex}
        scrollRef={scrollRef}
        timelineMinWidth={timelineMinWidth}
        zoom={zoom}
        zoomTransition={zoomTransition}
        headerLayers={headerLayers}
        boundedDays={boundedDays}
      >
        <ScheduleRows
          creators={creators}
          minimumRows={minimumRows}
          bookings={liveBookings}
          activeBookingId={activeBookingId}
          onBookingSelect={onBookingSelect}
          editing={{
            editableStartIndex,
            editableEndIndex,
            onBookingChange,
            onBookingSplit,
            dayLabels: days.map((day) => day.date),
          }}
          reorder={{ creators, onCreatorOrderChange }}
          zoom={zoom}
          zoomTransition={zoomTransition}
          headerLayers={headerLayers}
          boundedDays={boundedDays}
        />
      </ScheduleTimeline>
    </Surface>
  )
}

function ScheduleRows({
  creators,
  minimumRows,
  ...rowProps
}: Omit<React.ComponentProps<typeof ScheduleCreatorRow>, "creator"> & {
  creators: CampaignScheduleCreator[]
  minimumRows: number
}) {
  return (
    <>
      {creators.map((creator) => (
        <ScheduleCreatorRow key={creator.id} creator={creator} {...rowProps} />
      ))}
      {Array.from(
        { length: Math.max(0, minimumRows - creators.length) },
        (_, index) => (
          <React.Fragment key={`empty-${index}`}>
            <div
              aria-hidden="true"
              className="sticky left-0 z-20 border-r border-b border-nextide-line bg-nextide-panel"
            />
            <div
              data-slot="campaign-schedule-board-row"
              data-placeholder="true"
              aria-hidden="true"
              className="min-h-16 cursor-grab border-b border-nextide-line/70"
            />
          </React.Fragment>
        )
      )}
    </>
  )
}

function ScheduleTimeline({
  campaignStartIndex,
  campaignEndIndex,
  scrollRef,
  timelineMinWidth,
  zoom,
  zoomTransition,
  headerLayers,
  boundedDays,
  children,
}: ScheduleViewState & {
  campaignStartIndex?: number
  campaignEndIndex?: number
  scrollRef: ScrollRef
  timelineMinWidth: number
  children: React.ReactNode
}) {
  const { dragging, handlePointerDown, handleClickCapture } =
    useScheduleDrag(scrollRef)
  return (
    <>
      {/* react-doctor-disable-next-line react-doctor/click-events-have-key-events -- Only cancels child clicks after pointer dragging; no action to activate. */}
      <div // oxlint-disable-line jsx-a11y/no-noninteractive-element-interactions -- Named scroll region supports pointer panning, not activation.
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
          className="relative grid w-full transition-[min-width] duration-[var(--nextide-motion-layout)] ease-[var(--nextide-ease-in-out-quart)] motion-reduce:transition-none"
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
          <ScheduleCampaignMarkers
            start={campaignStartIndex}
            end={campaignEndIndex}
            boundedDays={boundedDays}
          />
        </div>
      </div>
    </>
  )
}

function ScheduleCampaignMarkers({
  start,
  end,
  boundedDays,
}: {
  start?: number
  end?: number
  boundedDays: number
}) {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-0 z-10"
      style={{ left: creatorColumnWidth }}
    >
      {start !== undefined && (
        <div
          data-slot="campaign-start-marker"
          className="absolute inset-y-0 border-l border-nextide-tide/70"
          style={{ left: `${(start / boundedDays) * 100}%` }}
        >
          <span className="absolute top-1 left-1 rounded-sm bg-nextide-panel px-1 text-ui-micro whitespace-nowrap text-nextide-tide">
            Campaign start
          </span>
        </div>
      )}
      {end !== undefined && (
        <div
          data-slot="campaign-end-marker"
          className="absolute inset-y-0 border-r border-nextide-tide/70"
          style={{ left: `${((end + 1) / boundedDays) * 100}%` }}
        >
          <span className="absolute top-1 right-1 rounded-sm bg-nextide-panel px-1 text-ui-micro whitespace-nowrap text-nextide-tide">
            Campaign end
          </span>
        </div>
      )}
    </div>
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
