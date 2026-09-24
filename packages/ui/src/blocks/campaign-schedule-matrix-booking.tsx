import type { BookingShape } from "./campaign-schedule-matrix-overlap.js"
import { LockKeyhole } from "lucide-react"
import * as React from "react"
import { deleteFocusedBooking } from "./campaign-schedule-matrix-delete.js"
import {
  useBookingCut,
  BookingCutPreview,
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
  shape?: BookingShape
  booking: CampaignScheduleBooking
  boundedDays: number
  active: boolean
  onBookingSelect?: (booking: CampaignScheduleBooking) => void
  editing: ScheduleEditing
}

function ScheduleBooking({
  shape,
  booking,
  boundedDays,
  active,
  onBookingSelect,
  editing,
}: BookingProps) {
  const edit = useBookingEdit(booking, editing, boundedDays)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const bodyRef = React.useRef<HTMLButtonElement>(null)
  const cut = useBookingCut(booking, editing, rootRef)
  const hintId = React.useId()
  const start = clamp(edit.shown.startIndex, 0, boundedDays - 1)
  const end = clamp(edit.shown.endIndex, start, boundedDays - 1)
  const titleId = React.useId()
  const onDelete = booking.locked ? undefined : editing.onBookingDelete
  return (
    <div
      data-slot="campaign-schedule-booking"
      data-booking-id={booking.id}
      data-start-index={start}
      data-end-index={end}
      data-locked={booking.locked}
      ref={rootRef}
      onKeyDownCapture={(event) =>
        deleteFocusedBooking(event, booking, rootRef, onDelete)
      }
      data-cutting={cut.armed || undefined}
      className="pointer-events-none absolute top-2 bottom-2"
      onFocusCapture={() => shape && onBookingSelect?.(booking)}
      style={{
        left: `${(start / boundedDays) * 100}%`,
        width: `${((end - start + 1) / boundedDays) * 100}%`,
        ...shapeVisibility(shape),
      }}
    >
      <div
        className={cn(
          "pointer-events-auto absolute inset-0 flex min-w-0 rounded-lg border shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]",
          bookingToneClasses[booking.tone ?? "success"],
          active && "border-nextide-tide bg-nextide-tide/12",
          edit.draft && "ring-2 ring-ring"
        )}
        style={{ clipPath: shape?.clip }}
      >
        {edit.canEdit && (
          <BookingEdge
            edge="start"
            titleId={titleId}
            hintId={hintId}
            edit={edit}
            onStart={cut.cancel}
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
            shape,
            editing,
          }}
        />
        {edit.canEdit && (
          <BookingEdge
            edge="end"
            titleId={titleId}
            hintId={hintId}
            edit={edit}
            onStart={cut.cancel}
          />
        )}
      </div>
      <BookingCutPreview cut={cut} booking={booking} />
      <span id={hintId} className="sr-only">
        {cut.armed
          ? "Left and right arrows choose a cut. Enter cuts. Escape cancels."
          : "Left and right arrows adjust one day. Enter saves. Escape cancels."}
        {onDelete &&
          " Delete or Backspace removes this booking. With scissors, sweep across the whole booking to delete."}
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
  shape,
  editing,
}: {
  bodyRef: React.RefObject<HTMLButtonElement | null>
  cut: ReturnType<typeof useBookingCut>
  edit: ReturnType<typeof useBookingEdit>
  titleId: string
  hintId: string
} & Pick<
  BookingProps,
  "booking" | "active" | "onBookingSelect" | "shape" | "editing"
>) {
  return (
    <button
      type="button"
      ref={bodyRef}
      style={
        cut.tool
          ? {
              cursor:
                cut.tool === "cut"
                  ? scissorsCursor
                  : cut.tool === "lock"
                    ? "pointer"
                    : "crosshair",
            }
          : undefined
      }
      aria-labelledby={titleId}
      aria-pressed={onBookingSelect ? active : undefined}
      aria-describedby={edit.canEdit || cut.armed ? hintId : undefined}
      className={cn(
        "flex min-w-0 flex-1 items-center overflow-hidden px-[min(0.75rem,8%)] text-left outline-none focus-visible:ring-2 focus-visible:ring-ring",
        edit.canEdit && "cursor-grab touch-none active:cursor-grabbing"
      )}
      onPointerDown={(event) => {
        if (cut.tool) {
          event.stopPropagation()
          if (cut.tool !== "lock") event.preventDefault()
          if (cut.armed) cut.pointerDown(event)
        } else edit.pointerDown(event, "move")
      }}
      onPointerMove={cut.preview}
      onPointerLeave={cut.leave}
      onFocus={cut.focus}
      onKeyDown={(event) =>
        cut.tool ? cut.keyDown(event) : edit.keyDown(event, "move")
      }
      onBlur={() => {
        edit.cancel()
        cut.blur()
      }}
      onClick={(event) => {
        if (cut.tool === "lock" && editing.onBookingLockChange) {
          editing.onBookingLockChange(booking, !booking.locked)
        } else if (!cut.click(event) && !edit.consumeClick(event))
          onBookingSelect?.(booking)
      }}
    >
      <span
        className={
          shape
            ? "pointer-events-none absolute flex min-w-0 items-center overflow-hidden px-3"
            : "min-w-0"
        }
        style={
          shape
            ? {
                left: `${shape.label.left}%`,
                width: `${shape.label.width}%`,
                top: `${shape.label.top}%`,
                height: `${shape.label.height}%`,
              }
            : undefined
        }
      >
        <BookingLabel
          booking={edit.shown}
          titleId={titleId}
          compact={Boolean(shape && shape.label.height < 100)}
        />
      </span>
    </button>
  )
}

function BookingEdge({
  edge,
  titleId,
  hintId,
  edit,
  onStart,
}: {
  edge: "start" | "end"
  titleId: string
  hintId: string
  edit: ReturnType<typeof useBookingEdit>
  onStart: () => void
}) {
  const actionId = React.useId()
  return (
    <button
      type="button"
      aria-labelledby={`${actionId} ${titleId}`}
      aria-describedby={hintId}
      className="z-10 w-[min(0.75rem,15%)] shrink-0 cursor-ew-resize touch-none rounded-sm outline-none after:mx-auto after:block after:h-5 after:w-0.5 after:rounded-full after:bg-current after:opacity-50 hover:bg-nextide-tide/20 focus-visible:ring-2 focus-visible:ring-ring"
      onPointerDown={(event) => {
        onStart()
        edit.pointerDown(event, edge)
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") onStart()
        edit.keyDown(event, edge)
      }}
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
  compact,
}: {
  booking: CampaignScheduleBooking
  titleId: string
  compact: boolean
}) {
  return (
    <span
      className={
        compact ? "flex min-w-0 items-center gap-2" : "grid min-w-0 gap-0.5"
      }
    >
      <span id={titleId} className="truncate text-sm leading-tight font-medium">
        {booking.locked && (
          <LockKeyhole
            aria-hidden="true"
            className="mr-1 inline size-3 align-[-1px]"
          />
        )}
        {booking.locked && <span className="sr-only">Locked </span>}
        {typeof booking.title === "function"
          ? booking.title(booking)
          : booking.title}
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

function shapeVisibility(shape?: BookingShape): React.CSSProperties {
  return { display: shape && !shape.visible ? "none" : undefined }
}
