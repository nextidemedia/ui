import * as React from "react"

import { clamp } from "./campaign-schedule-matrix-model.js"
import type { ScrollRef } from "./campaign-schedule-matrix-zoom.js"

type Drag = {
  pointerId: number
  startX: number
  startScrollLeft: number
  dragged: boolean
}
type DragTracking = {
  drag: Drag | null
  suppressClick: boolean
  timer: ReturnType<typeof setTimeout> | null
}

function useScheduleDrag(scrollRef: ScrollRef) {
  const tracking = React.useRef<DragTracking>({
    drag: null,
    suppressClick: false,
    timer: null,
  })
  const [dragging, setDragging] = React.useState(false)
  usePointerDrag(scrollRef, tracking, setDragging)
  React.useEffect(
    () => () => {
      if (tracking.current.timer) clearTimeout(tracking.current.timer)
    },
    []
  )

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (
      !(event.target instanceof Element) ||
      !event.target.closest('[data-slot="campaign-schedule-board-row"]') ||
      event.pointerType !== "mouse" ||
      event.button !== 0 ||
      event.currentTarget.scrollWidth <= event.currentTarget.clientWidth
    )
      return
    tracking.current.suppressClick = false
    tracking.current.drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: event.currentTarget.scrollLeft,
      dragged: false,
    }
  }
  const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    const state = tracking.current
    if (!state.suppressClick) return
    state.suppressClick = false
    if (state.timer) clearTimeout(state.timer)
    event.preventDefault()
    event.stopPropagation()
  }
  return { dragging, handlePointerDown, handleClickCapture }
}

function usePointerDrag(
  scrollRef: ScrollRef,
  tracking: React.RefObject<DragTracking>,
  setDragging: React.Dispatch<React.SetStateAction<boolean>>
) {
  React.useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const drag = tracking.current.drag
      const node = scrollRef.current
      if (!drag || !node || event.pointerId !== drag.pointerId) return
      const distance = event.clientX - drag.startX
      if (!drag.dragged && Math.abs(distance) < 4) return
      if (!drag.dragged) {
        drag.dragged = true
        setDragging(true)
      }
      event.preventDefault()
      node.scrollLeft = clamp(
        drag.startScrollLeft - distance,
        0,
        Math.max(node.scrollWidth - node.clientWidth, 0)
      )
    }
    const finishPointerDrag = (event: PointerEvent) => {
      const state = tracking.current
      const drag = state.drag
      if (!drag || event.pointerId !== drag.pointerId) return
      state.suppressClick = drag.dragged
      if (state.timer) clearTimeout(state.timer)
      if (drag.dragged) {
        state.timer = setTimeout(() => {
          state.suppressClick = false
        }, 0)
      }
      state.drag = null
      setDragging(false)
    }
    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", finishPointerDrag)
    window.addEventListener("pointercancel", finishPointerDrag)
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", finishPointerDrag)
      window.removeEventListener("pointercancel", finishPointerDrag)
    }
  }, [scrollRef, tracking, setDragging])
}

export { useScheduleDrag }
