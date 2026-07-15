import * as React from "react"
import { CalendarClock, Clock3 } from "lucide-react"

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
import { useContainedScroll } from "@nextide/ui/hooks/use-contained-scroll"
import { cn } from "@nextide/ui/lib/utils"

type CampaignScheduleTone = "neutral" | "success" | "processing" | "warning"

type CampaignScheduleCreator = {
  id: string
  name: React.ReactNode
  meta?: React.ReactNode
  avatar?: React.ReactNode
}

type CampaignScheduleDay = {
  id: string
  label: React.ReactNode
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
  onBookingSelect?: (booking: CampaignScheduleBooking) => void
}) {
  const { ref: scrollRef, onWheel } = useContainedScroll<HTMLDivElement>({
    axis: "x",
  })
  const boundedDays = Math.max(days.length, 1)
  const liveBookings = bookings.filter((booking) =>
    creators.some((creator) => creator.id === booking.creatorId)
  )

  return (
    <Surface
      data-slot="campaign-schedule-matrix"
      className={cn("grid gap-4", className)}
      {...props}
    >
      <SurfaceHeader>
        <SurfaceTitle>{title}</SurfaceTitle>
        {description ? (
          <SurfaceDescription>{description}</SurfaceDescription>
        ) : null}
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
        onWheel={onWheel}
        className="nextide-contained-scroll nextide-scrollbar-none relative overflow-x-auto rounded-xl border border-nextide-line bg-background/20"
      >
        <div
          className="grid min-w-[52rem]"
          style={{
            gridTemplateColumns: `10rem repeat(${boundedDays}, minmax(5.5rem, 1fr))`,
          }}
        >
          <div className="sticky left-0 z-20 border-r border-b border-nextide-line bg-nextide-panel p-3 text-xs font-medium text-muted-foreground">
            Creator
          </div>
          {days.map((day) => (
            <div
              key={day.id}
              className={cn(
                "border-b border-nextide-line p-3 text-center text-xs",
                day.today && "bg-nextide-tide/8 text-nextide-tide"
              )}
            >
              <div className="font-medium text-foreground">{day.label}</div>
              {day.meta ? (
                <div className="mt-1 text-ui-caption text-muted-foreground">
                  {day.meta}
                </div>
              ) : null}
            </div>
          ))}

          {creators.map((creator) => {
            const creatorBookings = liveBookings.filter(
              (booking) => booking.creatorId === creator.id
            )

            return (
              <React.Fragment key={creator.id}>
                <div className="sticky left-0 z-10 flex min-w-0 items-center gap-2 border-r border-b border-nextide-line bg-nextide-panel p-3">
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
                  className="relative col-span-full grid min-h-16 border-b border-nextide-line/70"
                  style={{
                    gridColumn: `2 / span ${boundedDays}`,
                    gridTemplateColumns: `repeat(${boundedDays}, minmax(5.5rem, 1fr))`,
                  }}
                >
                  {days.map((day) => (
                    <span
                      key={day.id}
                      className={cn(
                        "border-r border-nextide-line/50 last:border-r-0",
                        day.today && "bg-nextide-tide/5"
                      )}
                    />
                  ))}
                  {creatorBookings.map((booking) => {
                    const start = clamp(booking.startIndex, 0, boundedDays - 1)
                    const end = clamp(booking.endIndex, start, boundedDays - 1)
                    const active = booking.id === activeBookingId

                    return (
                      <button
                        key={booking.id}
                        type="button"
                        className={cn(
                          "absolute top-2 bottom-2 flex min-w-0 items-center rounded-lg border py-2 pr-16 pl-4 text-left shadow-[inset_0_1px_0_rgb(255_255_255/0.04)] transition-[background-color,border-color,box-shadow] duration-[var(--nextide-motion-state)] before:absolute before:inset-y-2 before:left-1.5 before:w-0.5 before:rounded-sm focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                          bookingToneClasses[booking.tone ?? "success"],
                          active &&
                            "border-nextide-tide bg-nextide-tide/12 shadow-[0_0_0_1px_rgb(30_228_188/0.38),0_0_24px_rgb(30_228_188/0.14)]"
                        )}
                        style={{
                          left: `${(start / boundedDays) * 100}%`,
                          width: `${((end - start + 1) / boundedDays) * 100}%`,
                        }}
                        onClick={() => onBookingSelect?.(booking)}
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

export {
  CampaignScheduleMatrix,
  type CampaignScheduleBooking,
  type CampaignScheduleCreator,
  type CampaignScheduleDay,
  type CampaignScheduleTone,
}
