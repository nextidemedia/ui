import * as React from "react"
import {
  useSchedulePointer,
  type ScheduleEditing,
} from "./campaign-schedule-matrix-edit.js"
import type { CampaignScheduleBooking } from "./campaign-schedule-matrix-model.js"

type BookingRoot = React.RefObject<HTMLDivElement | null>

function requestBookingDelete(
  booking: CampaignScheduleBooking,
  root: BookingRoot,
  onDelete: ScheduleEditing["onBookingDelete"]
) {
  if (!onDelete) return
  const row = root.current?.closest(
    '[data-slot="campaign-schedule-creator-row"]'
  )
  const focusTarget =
    row?.querySelector<HTMLButtonElement>(
      '[data-slot="campaign-schedule-creator-legend"] button'
    ) ?? root.current?.closest<HTMLElement>('[role="region"]')
  focusTarget?.focus({ preventScroll: true })
  onDelete(booking)
}

function deleteFocusedBooking(
  event: React.KeyboardEvent,
  booking: CampaignScheduleBooking,
  root: BookingRoot,
  onDelete: ScheduleEditing["onBookingDelete"]
) {
  if (!onDelete || event.repeat || !["Delete", "Backspace"].includes(event.key))
    return
  if (
    !(event.target instanceof HTMLElement) ||
    event.target.closest(
      'input, textarea, select, [contenteditable]:not([contenteditable="false"])'
    )
  )
    return
  event.preventDefault()
  event.stopPropagation()
  requestBookingDelete(booking, root, onDelete)
}

function useBookingSweep(
  booking: CampaignScheduleBooking,
  root: BookingRoot,
  onDelete: ScheduleEditing["onBookingDelete"],
  cancel: () => void
) {
  const pointer = useSchedulePointer()
  const [deleting, setDeleting] = React.useState(false)
  const start = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!onDelete || !root.current) return
    const rect = root.current.getBoundingClientRect()
    const origin = (event.clientX - rect.left) / rect.width
    const tolerance = Math.min(
      0.25,
      1 / (booking.endIndex - booking.startIndex + 1)
    )
    const covers = (delta: number) => {
      const end = origin + delta / rect.width
      return (
        Math.min(origin, end) <= tolerance &&
        Math.max(origin, end) >= 1 - tolerance
      )
    }
    pointer.start(event, {
      axis: "x",
      unit: 1,
      preview: (delta) => setDeleting(covers(delta)),
      finish: (delta, next) => {
        setDeleting(false)
        if (delta === null && next) return
        if (delta === null) cancel()
        if (
          delta !== null &&
          next &&
          next.clientY >= rect.top &&
          next.clientY <= rect.bottom &&
          covers(delta)
        ) {
          requestBookingDelete(booking, root, onDelete)
        }
      },
    })
  }
  return {
    deleting,
    start,
    consumeClick: pointer.consumeClick,
    cancel: pointer.cancel,
  }
}

export { deleteFocusedBooking, requestBookingDelete, useBookingSweep }
