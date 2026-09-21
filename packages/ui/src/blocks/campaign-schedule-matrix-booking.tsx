import * as React from "react"
import {
  useBookingCut,
  BookingScissors,
  scissorsCursor,
} from "./campaign-schedule-matrix-cut.js"
import { StatusBadge } from "@nextide/ui/components/status-badge"
import { cn } from "@nextide/ui/lib/utils"
import {
  bookingToneClasses,
  clamp,
  type CampaignScheduleBooking,
} from "./campaign-schedule-matrix-model.js"
import {
  useBookingEdit,
  type ScheduleEditing,
} from "./campaign-schedule-matrix-edit.js"

type BookingProps = {
  booking: CampaignScheduleBooking
  boundedDays: number
  active: boolean
  onBookingSelect?: (booking: CampaignScheduleBooking) => void
  editing: ScheduleEditing
}

function ScheduleBooking({
  booking,
  boundedDays,
  active,
  onBookingSelect,
  editing,
}: BookingProps) {
  const edit = useBookingEdit(booking, editing, boundedDays)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const bodyRef = React.useRef<HTMLButtonElement>(null)
  const cut = useBookingCut(booking, editing, rootRef, bodyRef)
  const hintId = React.useId()
  const start = clamp(edit.shown.startIndex, 0, boundedDays - 1)
  const end = clamp(edit.shown.endIndex, start, boundedDays - 1)
  const titleId = React.useId()
  return (
    <div
      data-slot="campaign-schedule-booking"
      data-booking-id={booking.id}
      data-start-index={start}
      data-end-index={end}
      ref={rootRef}
      data-cutting={cut.armed || undefined}
      className={cn(
        "absolute top-2 bottom-2 flex min-w-0 rounded-lg border shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]",
        bookingToneClasses[booking.tone ?? "success"],
        active && "border-nextide-tide bg-nextide-tide/12",
        edit.draft && "ring-2 ring-ring"
      )}
      style={{
        left: `${(start / boundedDays) * 100}%`,
        width: `${((end - start + 1) / boundedDays) * 100}%`,
      }}
    >
      {edit.canEdit && !cut.armed && (
        <BookingEdge
          edge="start"
          titleId={titleId}
          hintId={hintId}
          edit={edit}
        />
      )}
      <BookingBody
        {...{
          bodyRef,
          cut,
          edit,
          titleId,
          active,
          hintId,
          booking,
          onBookingSelect,
        }}
      />
      {cut.enabled && (
        <BookingScissors
          cut={cut}
          titleId={titleId}
          booking={booking}
          dayLabels={editing.dayLabels}
        />
      )}
      {edit.canEdit && !cut.armed && (
        <BookingEdge edge="end" titleId={titleId} hintId={hintId} edit={edit} />
      )}
      <span id={hintId} className="sr-only">
        {cut.armed
          ? "Left and right arrows choose a cut. Enter cuts. Escape cancels."
          : "Left and right arrows adjust one day. Enter saves. Escape cancels."}
      </span>
      {edit.draft && (
        <output className="sr-only">
          {editing.dayLabels[start]} to {editing.dayLabels[end]}
        </output>
      )}
    </div>
  )
}

function BookingBody({
  bodyRef,
  cut,
  edit,
  titleId,
  active,
  hintId,
  booking,
  onBookingSelect,
}: {
  bodyRef: React.RefObject<HTMLButtonElement | null>
  cut: ReturnType<typeof useBookingCut>
  edit: ReturnType<typeof useBookingEdit>
  titleId: string
  hintId: string
} & Pick<BookingProps, "booking" | "active" | "onBookingSelect">) {
  return (
    <button
      type="button"
      ref={bodyRef}
      style={cut.armed ? { cursor: scissorsCursor } : undefined}
      aria-labelledby={titleId}
      aria-pressed={onBookingSelect ? active : undefined}
      aria-describedby={edit.canEdit ? hintId : undefined}
      className={cn(
        "flex min-w-0 flex-1 items-center overflow-hidden px-[min(0.75rem,8%)] text-left outline-none focus-visible:ring-2 focus-visible:ring-ring",
        edit.canEdit && "cursor-grab touch-none active:cursor-grabbing"
      )}
      onPointerDown={(event) => {
        if (cut.armed) {
          event.stopPropagation()
          event.preventDefault()
        } else edit.pointerDown(event, "move")
      }}
      onPointerMove={cut.preview}
      onKeyDown={(event) =>
        cut.armed ? cut.keyDown(event) : edit.keyDown(event, "move")
      }
      onBlur={edit.cancel}
      onClick={(event) => {
        if (!cut.click(event) && !edit.consumeClick(event))
          onBookingSelect?.(booking)
      }}
    >
      <BookingLabel booking={booking} titleId={titleId} />
    </button>
  )
}

function BookingEdge({
  edge,
  titleId,
  hintId,
  edit,
}: {
  edge: "start" | "end"
  titleId: string
  hintId: string
  edit: ReturnType<typeof useBookingEdit>
}) {
  const actionId = React.useId()
  return (
    <button
      type="button"
      aria-labelledby={`${actionId} ${titleId}`}
      aria-describedby={hintId}
      className="z-10 w-[min(0.75rem,15%)] shrink-0 cursor-ew-resize touch-none rounded-sm outline-none after:mx-auto after:block after:h-5 after:w-0.5 after:rounded-full after:bg-current after:opacity-50 hover:bg-nextide-tide/20 focus-visible:ring-2 focus-visible:ring-ring"
      onPointerDown={(event) => edit.pointerDown(event, edge)}
      onKeyDown={(event) => edit.keyDown(event, edge)}
      onBlur={edit.cancel}
    >
      <span id={actionId} className="sr-only">
        Resize {edge} of
      </span>
    </button>
  )
}

function BookingLabel({
  booking,
  titleId,
}: {
  booking: CampaignScheduleBooking
  titleId: string
}) {
  return (
    <span className="grid min-w-0 gap-0.5">
      <span id={titleId} className="truncate text-sm leading-tight font-medium">
        {booking.title}
      </span>
      <span className="flex min-w-0 items-center gap-2">
        {booking.meta && (
          <span className="truncate text-ui-caption text-muted-foreground">
            {booking.meta}
          </span>
        )}
        {booking.status && (
          <StatusBadge
            tone={booking.tone ?? "success"}
            size="compact"
            indicator={booking.statusIndicator ?? "none"}
            className="shrink-0 uppercase"
          >
            {booking.status}
          </StatusBadge>
        )}
      </span>
    </span>
  )
}

export { ScheduleBooking }
