import * as React from "react"
import { CalendarClock, Clock3 } from "lucide-react"

import { Metric } from "@nextide/ui/components/metric"
import { StatusBadge } from "@nextide/ui/components/status-badge"
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
}

const bookingToneClasses: Record<CampaignScheduleTone, string> = {
  neutral: "border-nextide-line bg-muted/20 text-foreground",
  success:
    "border-nextide-tide/45 bg-nextide-tide/12 text-foreground shadow-[0_0_22px_rgb(30_228_188/0.12)]",
  processing:
    "border-nextide-purple/45 bg-nextide-purple/12 text-foreground shadow-[0_0_22px_rgb(175_46_255/0.12)]",
  warning:
    "border-nextide-yellow/45 bg-nextide-yellow/12 text-foreground shadow-[0_0_22px_rgb(255_218_83/0.1)]",
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
          <div className="sticky left-0 z-20 border-r border-b border-nextide-line bg-nextide-panel p-3 text-xs font-semibold text-muted-foreground">
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
              <div className="font-semibold text-foreground">{day.label}</div>
              {day.meta ? (
                <div className="mt-1 text-[0.68rem] text-muted-foreground">
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
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-nextide-line bg-background/35 text-xs font-semibold text-nextide-tide">
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
                          "absolute top-2 bottom-2 grid min-w-0 content-center gap-1 rounded-lg border px-3 text-left transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[var(--nextide-ease-out-quart)] hover:-translate-y-0.5 focus-visible:outline-none",
                          bookingToneClasses[booking.tone ?? "success"],
                          active &&
                            "border-nextide-tide shadow-[0_0_0_1px_rgb(30_228_188/0.5),0_0_30px_rgb(30_228_188/0.18)]"
                        )}
                        style={{
                          left: `${(start / boundedDays) * 100}%`,
                          width: `${((end - start + 1) / boundedDays) * 100}%`,
                        }}
                        onClick={() => onBookingSelect?.(booking)}
                      >
                        <span className="truncate text-xs font-semibold">
                          {booking.title}
                        </span>
                        <span className="flex min-w-0 items-center gap-2 text-[0.68rem] text-muted-foreground">
                          {booking.status ? (
                            <StatusBadge tone={booking.tone ?? "success"}>
                              {booking.status}
                            </StatusBadge>
                          ) : null}
                          {booking.meta ? (
                            <span className="truncate">{booking.meta}</span>
                          ) : null}
                        </span>
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
