import * as React from "react"
import type { ScheduleTool } from "./campaign-schedule-matrix-tools.js"
import {
  clamp,
  type CampaignScheduleBooking,
} from "./campaign-schedule-matrix-model.js"

type BookingEdit = "move" | "start" | "end"
type ScheduleEditing = {
  overlapLayout?: "stepped"
  onBookingPreview?: (booking: CampaignScheduleBooking | null) => void
  tool: ScheduleTool
  onToolChange: (tool: ScheduleTool) => void
  editableStartIndex: number
  editableEndIndex: number
  dayLabels: string[]
  onBookingChange?: (booking: CampaignScheduleBooking) => void
  onBookingDelete?: (booking: CampaignScheduleBooking) => void
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
  finish: (delta: number | null, event?: PointerEvent) => void
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
    const finish = (value: number | null, next?: PointerEvent) => {
      cleanup.current?.()
      suppressClick.current = moved
      gesture.finish(value, next)
    }
    cancelGesture.current = () => finish(null)
    const up = (next: PointerEvent) => {
      if (next.pointerId === event.pointerId) finish(moved ? delta : null, next)
    }
    const cancel = (next: PointerEvent) => {
      if (next.pointerId === event.pointerId) finish(null)
    }
    const key = (next: KeyboardEvent) => {
      if (next.key === "Escape") {
        next.preventDefault()
        next.stopPropagation()
        finish(null)
      }
    }
    window.addEventListener("pointermove", move, { passive: false })
    window.addEventListener("pointerup", up)
    window.addEventListener("pointercancel", cancel)
    window.addEventListener("keydown", key, true)
    cleanup.current = () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      window.removeEventListener("pointercancel", cancel)
      window.removeEventListener("keydown", key, true)
      cleanup.current = null
      cancelGesture.current = null
    }
  }
  const consumeClick = (event: React.MouseEvent) => {
    const value = event.detail > 0 && suppressClick.current
    suppressClick.current = false
    return value
  }
  const cancel = React.useCallback(() => cancelGesture.current?.(), [])
  return { start, consumeClick, cancel }
}

function useBookingEdit(
  booking: CampaignScheduleBooking,
  editing: ScheduleEditing,
  boundedDays: number
) {
  const [draft, setLocalDraft] = React.useState<CampaignScheduleBooking | null>(
    null
  )
  const onPreview = editing.onBookingPreview
  const setDraft = React.useCallback(
    (next: CampaignScheduleBooking | null) => {
      setLocalDraft(next)
      onPreview?.(next)
    },
    [onPreview]
  )
  const pointer = useSchedulePointer()
  useDraftCancellation(draft !== null, setDraft)
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

function useDraftCancellation(
  active: boolean,
  setDraft: (next: CampaignScheduleBooking | null) => void
) {
  React.useEffect(() => {
    if (!active) return
    const cancel = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      event.stopPropagation()
      setDraft(null)
    }
    window.addEventListener("keydown", cancel, true)
    return () => window.removeEventListener("keydown", cancel, true)
  }, [active, setDraft])
}

export { useBookingEdit, useSchedulePointer }
export type { ScheduleEditing }
