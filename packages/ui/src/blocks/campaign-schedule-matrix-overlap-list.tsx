import * as React from "react"
import { Button } from "@nextide/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverTitle,
} from "@nextide/ui/components/popover"
import type { CampaignScheduleBooking } from "./campaign-schedule-matrix-model.js"
import type { OverlapSpan } from "./campaign-schedule-matrix-overlap.js"
export function ScheduleOverlapList({
  span,
  boundedDays,
  onSelect,
}: {
  span: OverlapSpan
  boundedDays: number
  onSelect: (booking: CampaignScheduleBooking) => void
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <div
      data-slot="schedule-overlap-band"
      className="absolute top-8 bottom-2 z-10"
      style={{
        left: `${(span.start * 100) / boundedDays}%`,
        width: `${((span.end - span.start) * 100) / boundedDays}%`,
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className="h-full w-full min-w-0 rounded-sm px-1 text-xs"
            />
          }
          aria-label={`${span.bookings.length} overlapping creatives`}
        >
          <span className="truncate">{span.bookings.length} creatives</span>
        </PopoverTrigger>
        <PopoverContent className="max-h-72 overflow-y-auto">
          <PopoverTitle>Overlapping creatives</PopoverTitle>
          {span.bookings.map((booking) => (
            <Button
              key={booking.id}
              variant="ghost"
              className="justify-start"
              onClick={() => {
                onSelect(booking)
                setOpen(false)
              }}
            >
              {typeof booking.title === "function"
                ? booking.title(booking)
                : booking.title}
            </Button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  )
}
