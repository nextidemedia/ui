import * as React from "react"
import {
  clamp,
  type CampaignScheduleBooking,
} from "./campaign-schedule-matrix-model.js"

type BookingEdit = "move" | "start" | "end"
type ScheduleEditing = {
  editableStartIndex: number
  editableEndIndex: number
  dayLabels: string[]
  onBookingChange?: (booking: CampaignScheduleBooking) => void
  onBookingSplit?: (
    booking: CampaignScheduleBooking,
    splitIndex: number
  ) => void
}

function editBooking(
  booking: CampaignScheduleBooking,
  mode: BookingEdit,
  delta: number,
  min: number,
  max: number
) {
  if (mode === "start")
    return {
      ...booking,
      startIndex: clamp(booking.startIndex + delta, min, booking.endIndex),
    }
  if (mode === "end")
    return {
      ...booking,
      endIndex: clamp(booking.endIndex + delta, booking.startIndex, max),
    }
  const distance = clamp(
    delta,
    min - booking.startIndex,
    max - booking.endIndex
  )
  return {
    ...booking,
    startIndex: booking.startIndex + distance,
    endIndex: booking.endIndex + distance,
  }
}

type PointerGesture = {
  axis: "x" | "y"
  unit: number
  preview: (delta: number) => void
  finish: (delta: number | null) => void
}

function useSchedulePointer() {
  const cleanup = React.useRef<(() => void) | null>(null)
  const suppressClick = React.useRef(false)
  const cancelGesture = React.useRef<(() => void) | null>(null)
  React.useEffect(() => () => cleanup.current?.(), [])
  const start = (
    event: React.PointerEvent<HTMLElement>,
    gesture: PointerGesture
  ) => {
    if (event.button !== 0) return
    event.stopPropagation()
    event.preventDefault()
    event.currentTarget.focus({ preventScroll: true })
    cleanup.current?.()
    suppressClick.current = false
    const origin = gesture.axis === "x" ? event.clientX : event.clientY
    let delta = 0
    let moved = false
    const move = (next: PointerEvent) => {
      if (next.pointerId !== event.pointerId) return
      const distance =
        (gesture.axis === "x" ? next.clientX : next.clientY) - origin
      if (Math.abs(distance) < 4 && !moved) return
      moved = true
      next.preventDefault()
      delta = Math.round(distance / gesture.unit)
      gesture.preview(delta)
    }
    const finish = (value: number | null) => {
      cleanup.current?.()
      suppressClick.current = moved
      gesture.finish(value)
    }
    cancelGesture.current = () => finish(null)
    const up = (next: PointerEvent) => {
      if (next.pointerId === event.pointerId) finish(moved ? delta : null)
    }
    const cancel = (next: PointerEvent) => {
      if (next.pointerId === event.pointerId) finish(null)
    }
    const key = (next: KeyboardEvent) => {
      if (next.key === "Escape") {
        next.preventDefault()
        finish(null)
      }
    }
    window.addEventListener("pointermove", move, { passive: false })
    window.addEventListener("pointerup", up)
    window.addEventListener("pointercancel", cancel)
    window.addEventListener("keydown", key)
    cleanup.current = () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      window.removeEventListener("pointercancel", cancel)
      window.removeEventListener("keydown", key)
      cleanup.current = null
      cancelGesture.current = null
    }
  }
  const consumeClick = (event: React.MouseEvent) => {
    const value = event.detail > 0 && suppressClick.current
    suppressClick.current = false
    return value
  }
  return { start, consumeClick, cancel: () => cancelGesture.current?.() }
}

function useBookingEdit(
  booking: CampaignScheduleBooking,
  editing: ScheduleEditing,
  boundedDays: number
) {
  const [draft, setDraft] = React.useState<CampaignScheduleBooking | null>(null)
  const pointer = useSchedulePointer()
  const {
    editableStartIndex: min,
    editableEndIndex: max,
    onBookingChange,
  } = editing
  const canEdit =
    Boolean(onBookingChange) &&
    booking.startIndex >= min &&
    booking.endIndex <= max
  const commit = (next: CampaignScheduleBooking | null) => {
    if (
      next &&
      (next.startIndex !== booking.startIndex ||
        next.endIndex !== booking.endIndex)
    )
      onBookingChange?.(next)
    setDraft(null)
  }
  const pointerDown = (
    event: React.PointerEvent<HTMLElement>,
    mode: BookingEdit
  ) => {
    if (!canEdit) return
    const row = event.currentTarget.closest(
      '[data-slot="campaign-schedule-board-row"]'
    )
    if (!row) return
    pointer.start(event, {
      axis: "x",
      unit: row.getBoundingClientRect().width / boundedDays,
      preview: (delta) => setDraft(editBooking(booking, mode, delta, min, max)),
      finish: (delta) =>
        commit(
          delta === null ? null : editBooking(booking, mode, delta, min, max)
        ),
    })
  }
  const keyDown = (
    event: React.KeyboardEvent<HTMLElement>,
    mode: BookingEdit
  ) => {
    if (!canEdit) return
    if (event.key === "Escape") {
      event.preventDefault()
      setDraft(null)
    }
    if (event.key === "Enter" && draft) {
      event.preventDefault()
      commit(draft)
    }
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
    event.preventDefault()
    setDraft(
      editBooking(
        draft ?? booking,
        mode,
        event.key === "ArrowLeft" ? -1 : 1,
        min,
        max
      )
    )
  }
  return {
    draft,
    shown: draft ?? booking,
    canEdit,
    pointerDown,
    keyDown,
    cancel: () => {
      pointer.cancel()
      setDraft(null)
    },
    consumeClick: pointer.consumeClick,
  }
}

export { useBookingEdit, useSchedulePointer }
export type { ScheduleEditing }
