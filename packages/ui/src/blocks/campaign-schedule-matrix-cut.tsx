import * as React from "react"
import {
  clamp,
  type CampaignScheduleBooking,
} from "./campaign-schedule-matrix-model.js"
import type { ScheduleEditing } from "./campaign-schedule-matrix-edit.js"
import {
  requestBookingDelete,
  useBookingSweep,
} from "./campaign-schedule-matrix-delete.js"

const scissorsCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Ccircle cx='6' cy='6' r='3'/%3E%3Ccircle cx='6' cy='18' r='3'/%3E%3Cpath d='m8 8 13 13M8 16 21 3'/%3E%3C/svg%3E") 12 12, crosshair`

function useBookingCut(
  booking: CampaignScheduleBooking,
  editing: ScheduleEditing,
  rootRef: React.RefObject<HTMLDivElement | null>
) {
  const midpoint = Math.round((booking.startIndex + booking.endIndex + 1) / 2)
  const [boundary, setBoundary] = React.useState(midpoint)
  const [previewing, setPreviewing] = React.useState(false)
  const enabled =
    Boolean(editing.onBookingSplit) && booking.startIndex < booking.endIndex
  const armed = enabled && editing.tool === "cut"
  const cancel = () => editing.onToolChange(null)
  const sweep = useBookingSweep(
    booking,
    rootRef,
    editing.onBookingDelete,
    cancel
  )
  const cancelSweep = sweep.cancel
  React.useEffect(() => {
    if (armed) return cancelSweep
  }, [armed, cancelSweep])
  const atPointer = (clientX: number) => {
    const rect = rootRef.current!.getBoundingClientRect()
    return clamp(
      Math.round(
        booking.startIndex +
          ((clientX - rect.left) / rect.width) *
            (booking.endIndex - booking.startIndex + 1)
      ),
      booking.startIndex + 1,
      booking.endIndex
    )
  }
  const commit = (index: number) => editing.onBookingSplit?.(booking, index)
  const keyDown = (event: React.KeyboardEvent) => {
    if (!armed) return
    const indices: Record<string, number> = {
      ArrowLeft: boundary - 1,
      ArrowRight: boundary + 1,
      Home: booking.startIndex + 1,
      End: booking.endIndex,
    }
    if (event.key === "Enter") {
      event.preventDefault()
      commit(clamp(boundary, booking.startIndex + 1, booking.endIndex))
      return
    }
    if (indices[event.key] === undefined) return
    event.preventDefault()
    setBoundary(
      clamp(indices[event.key], booking.startIndex + 1, booking.endIndex)
    )
  }
  return {
    armed,
    previewing,
    boundary: clamp(boundary, booking.startIndex + 1, booking.endIndex),
    deleting: sweep.deleting,
    cancel,
    tool: editing.tool,
    pointerDown: sweep.start,
    focus: () => {
      setBoundary(midpoint)
      setPreviewing(true)
    },
    blur: () => {
      setPreviewing(false)
      cancelSweep()
    },
    leave: () => setPreviewing(false),
    keyDown,
    preview: (event: React.PointerEvent) => {
      if (armed) {
        setBoundary(atPointer(event.clientX))
        setPreviewing(true)
      }
    },
    click: (event: React.MouseEvent) => {
      if (sweep.consumeClick(event)) return true
      if (editing.tool === "delete") {
        requestBookingDelete(booking, rootRef, editing.onBookingDelete)
        return true
      }
      if (armed) {
        commit(
          event.detail
            ? atPointer(event.clientX)
            : clamp(boundary, booking.startIndex + 1, booking.endIndex)
        )
        return true
      }
      return false
    },
  }
}

function BookingCutPreview({
  cut,
  booking,
}: {
  cut: ReturnType<typeof useBookingCut>
  booking: CampaignScheduleBooking
}) {
  if (!cut.armed || !cut.previewing) return null
  return (
    <span
      data-slot="campaign-cut-boundary"
      className="pointer-events-none absolute inset-y-0 z-20 border-l-2 border-nextide-tide"
      style={{
        left: `${((cut.boundary - booking.startIndex) / (booking.endIndex - booking.startIndex + 1)) * 100}%`,
      }}
    >
      <output className="absolute bottom-full left-0 mb-1 rounded-sm bg-nextide-panel px-1 text-ui-micro whitespace-nowrap text-nextide-tide">
        {cut.deleting ? (
          "Release to delete"
        ) : (
          <>
            <span className="inline-block min-w-[2ch] text-right tabular-nums">
              {cut.boundary - booking.startIndex}
            </span>{" "}
            days |{" "}
            <span className="inline-block min-w-[2ch] text-right tabular-nums">
              {booking.endIndex - cut.boundary + 1}
            </span>{" "}
            days
          </>
        )}
      </output>
    </span>
  )
}
export { useBookingCut, BookingCutPreview, scissorsCursor }
