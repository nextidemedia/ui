import * as React from "react"

import {
  clamp,
  wheelThreshold,
  zoomOrder,
  type CampaignScheduleZoom,
} from "./campaign-schedule-matrix-model.js"
import type {
  ScrollRef,
  ZoomTracking,
} from "./campaign-schedule-matrix-zoom.js"

type WheelTracking = {
  accumulated: number
  resetTimer: ReturnType<typeof setTimeout> | null
  lockUntil: number
}
type RequestZoom = (zoom: CampaignScheduleZoom, viewportX?: number) => void

function useScheduleWheel(
  scrollRef: ScrollRef,
  zoomTracking: React.RefObject<ZoomTracking>,
  requestZoom: RequestZoom
) {
  const tracking = React.useRef<WheelTracking>({
    accumulated: 0,
    resetTimer: null,
    lockUntil: 0,
  })
  React.useEffect(() => {
    const node = scrollRef.current
    if (!node) return
    const wheelState = tracking.current
    const handleWheel = (event: WheelEvent) => {
      handleScheduleWheel(
        event,
        node,
        wheelState,
        zoomTracking.current,
        requestZoom
      )
    }
    node.addEventListener("wheel", handleWheel, { passive: false })
    return () => node.removeEventListener("wheel", handleWheel)
  }, [scrollRef, zoomTracking, requestZoom])
  React.useEffect(
    () => () => {
      if (tracking.current.resetTimer) clearTimeout(tracking.current.resetTimer)
    },
    []
  )
}

function handleScheduleWheel(
  event: WheelEvent,
  node: HTMLDivElement,
  wheel: WheelTracking,
  zoom: ZoomTracking,
  requestZoom: RequestZoom
) {
  const target = event.target
  const overBoard =
    target instanceof Element &&
    target.closest('[data-slot="campaign-schedule-board-row"]')
  if (!overBoard) {
    if (event.shiftKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY))
      event.preventDefault()
    return
  }
  const multiplier =
    event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? node.clientHeight : 1
  if (event.shiftKey) {
    panWithWheel(event, node, multiplier)
    return
  }
  if (
    event.ctrlKey ||
    event.metaKey ||
    Math.abs(event.deltaX) >= Math.abs(event.deltaY)
  )
    return
  stepWheelZoom(event, node, multiplier, wheel, zoom, requestZoom)
}

function panWithWheel(
  event: WheelEvent,
  node: HTMLDivElement,
  multiplier: number
) {
  const delta =
    (Math.abs(event.deltaX) >= Math.abs(event.deltaY)
      ? event.deltaX
      : event.deltaY) * multiplier
  const nextScrollLeft = clamp(
    node.scrollLeft + delta,
    0,
    Math.max(node.scrollWidth - node.clientWidth, 0)
  )
  if (nextScrollLeft !== node.scrollLeft) {
    event.preventDefault()
    event.stopPropagation()
    node.scrollLeft = nextScrollLeft
  }
}

function stepWheelZoom(
  event: WheelEvent,
  node: HTMLDivElement,
  multiplier: number,
  wheel: WheelTracking,
  zoom: ZoomTracking,
  requestZoom: RequestZoom
) {
  const currentIndex = zoomOrder.indexOf(zoom.zoom)
  const direction = event.deltaY < 0 ? -1 : 1
  const nextIndex = currentIndex + direction
  if (nextIndex < 0 || nextIndex >= zoomOrder.length) {
    wheel.accumulated = 0
    return
  }
  const now = performance.now()
  if (now < wheel.lockUntil) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  event.preventDefault()
  event.stopPropagation()
  const delta = event.deltaY * multiplier
  if (
    wheel.accumulated !== 0 &&
    Math.sign(wheel.accumulated) !== Math.sign(delta)
  )
    wheel.accumulated = 0
  wheel.accumulated += delta
  if (wheel.resetTimer) clearTimeout(wheel.resetTimer)
  wheel.resetTimer = setTimeout(() => {
    wheel.accumulated = 0
  }, 140)
  if (Math.abs(wheel.accumulated) < wheelThreshold) return
  const bounds = node.getBoundingClientRect()
  wheel.accumulated = 0
  requestZoom(
    zoomOrder[nextIndex],
    clamp(event.clientX - bounds.left, 0, node.clientWidth)
  )
  wheel.lockUntil = now + zoom.duration
}

export { useScheduleWheel }
