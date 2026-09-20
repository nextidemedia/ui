import * as React from "react"
import { MoreHorizontal, Scissors } from "lucide-react"
import { Button } from "@nextide/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@nextide/ui/components/dropdown-menu"
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
  onBookingSelect: (booking: CampaignScheduleBooking) => void
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
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [cutIndex, setCutIndex] = React.useState<number | null>(null)
  const hintId = React.useId()
  const start = clamp(edit.shown.startIndex, 0, boundedDays - 1)
  const end = clamp(edit.shown.endIndex, start, boundedDays - 1)
  const titleId = React.useId()
  const cuttable =
    Boolean(editing.onBookingSplit) && booking.startIndex < booking.endIndex
  const contextMenu = (event: React.MouseEvent) => {
    if (!cuttable) return
    event.preventDefault()
    const box = event.currentTarget.getBoundingClientRect()
    setCutIndex(
      clamp(
        Math.round(
          booking.startIndex +
            ((event.clientX - box.left) / box.width) *
              (booking.endIndex - booking.startIndex + 1)
        ),
        booking.startIndex + 1,
        booking.endIndex
      )
    )
    setMenuOpen(true)
  }
  return (
    // oxlint-disable-next-line jsx-a11y/no-static-element-interactions -- Context menu duplicates the keyboard-accessible booking actions button.
    <div
      data-slot="campaign-schedule-booking"
      data-booking-id={booking.id}
      data-start-index={start}
      data-end-index={end}
      onContextMenu={contextMenu}
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
      {edit.canEdit && (
        <BookingEdge
          edge="start"
          titleId={titleId}
          hintId={hintId}
          edit={edit}
        />
      )}
      <button
        type="button"
        aria-labelledby={titleId}
        aria-pressed={active}
        aria-describedby={edit.canEdit ? hintId : undefined}
        className={cn(
          "flex min-w-0 flex-1 items-center overflow-hidden px-[min(0.75rem,8%)] text-left outline-none focus-visible:ring-2 focus-visible:ring-ring",
          edit.canEdit && "cursor-grab touch-none active:cursor-grabbing"
        )}
        onPointerDown={(event) => edit.pointerDown(event, "move")}
        onKeyDown={(event) => edit.keyDown(event, "move")}
        onBlur={edit.cancel}
        onClick={(event) => {
          if (!edit.consumeClick(event)) onBookingSelect(booking)
        }}
      >
        <BookingLabel booking={booking} titleId={titleId} />
      </button>
      {cuttable && (
        <BookingCutMenu
          {...{ booking, editing, menuOpen, setMenuOpen, cutIndex, titleId }}
        />
      )}
      {edit.canEdit && (
        <BookingEdge edge="end" titleId={titleId} hintId={hintId} edit={edit} />
      )}
      <span id={hintId} className="sr-only">
        Left and right arrows adjust one day. Enter saves. Escape cancels.
      </span>
      {edit.draft && (
        <output className="sr-only">
          {editing.dayLabels[start]} to {editing.dayLabels[end]}
        </output>
      )}
    </div>
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

function BookingCutMenu({
  booking,
  editing,
  menuOpen,
  setMenuOpen,
  cutIndex,
  titleId,
}: {
  booking: CampaignScheduleBooking
  editing: ScheduleEditing
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
  cutIndex: number | null
  titleId: string
}) {
  const actionId = React.useId()
  const indices = Array.from(
    { length: booking.endIndex - booking.startIndex },
    (_, index) => booking.startIndex + index + 1
  )
  if (cutIndex !== null)
    indices.sort((a, b) => Number(b === cutIndex) - Number(a === cutIndex))
  return (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon-xs" />}
        aria-labelledby={`${actionId} ${titleId}`}
        className="z-10 w-[min(2rem,25%)] shrink-0 self-center overflow-hidden"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <span id={actionId} className="sr-only">
          Cut
        </span>
        <MoreHorizontal />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-72 w-60" align="end">
        {indices.map((index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => editing.onBookingSplit?.(booking, index)}
          >
            <Scissors />
            Cut before {editing.dayLabels[index]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { ScheduleBooking }
