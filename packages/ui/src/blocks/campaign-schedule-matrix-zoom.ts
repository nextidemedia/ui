import * as React from "react"

import {
  clamp,
  creatorColumnWidth,
  minimumTimelineWidth,
  minimumUnitWidths,
  readCssTime,
  zoomDuration,
  zoomOrder,
  type CampaignScheduleZoom,
  type ScheduleHeaderLayer,
  type ZoomTransition,
} from "./campaign-schedule-matrix-model.js"
import { useScheduleWheel } from "./campaign-schedule-matrix-wheel.js"

type ZoomTracking = {
  zoom: CampaignScheduleZoom
  duration: number
  transitionId: number
  timer: ReturnType<typeof setTimeout> | null
  focus: { ratio: number; viewportX: number } | null
}

type ScrollRef = React.RefObject<HTMLDivElement | null>

function useScheduleZoom(
  scrollRef: ScrollRef,
  headerLayers: Record<CampaignScheduleZoom, ScheduleHeaderLayer>,
  boundedDays: number
) {
  const tracking = React.useRef<ZoomTracking>({
    zoom: "week",
    duration: zoomDuration,
    transitionId: 0,
    timer: null,
    focus: null,
  })
  const [zoom, setZoom] = React.useState<CampaignScheduleZoom>("week")
  const [zoomTransition, setZoomTransition] =
    React.useState<ZoomTransition | null>(null)
  const timelineMinWidth = Math.max(
    minimumTimelineWidth,
    headerLayers[zoom].primary.length * minimumUnitWidths[zoom]
  )
  const requestZoom = React.useCallback(
    (nextZoom: CampaignScheduleZoom, viewportX?: number) => {
      const state = tracking.current
      if (state.zoom === nextZoom) return
      const transition = beginZoom(
        state,
        scrollRef.current,
        nextZoom,
        viewportX
      )
      setZoomTransition(transition)
      setZoom(nextZoom)
      state.timer = setTimeout(() => setZoomTransition(null), state.duration)
    },
    [scrollRef]
  )

  useAnchoredZoom(scrollRef, tracking, timelineMinWidth, zoomTransition)
  useInitialScroll(
    scrollRef,
    tracking,
    headerLayers,
    boundedDays,
    timelineMinWidth
  )
  useScheduleWheel(scrollRef, tracking, requestZoom)
  React.useEffect(
    () => () => {
      if (tracking.current.timer) clearTimeout(tracking.current.timer)
    },
    []
  )

  const zoomBy = (step: -1 | 1) => {
    const nextZoom = zoomOrder[zoomOrder.indexOf(zoom) + step]
    if (nextZoom) requestZoom(nextZoom)
  }
  return { zoom, zoomTransition, timelineMinWidth, zoomBy }
}

function beginZoom(
  state: ZoomTracking,
  node: HTMLDivElement | null,
  nextZoom: CampaignScheduleZoom,
  viewportX?: number
): ZoomTransition {
  const currentZoom = state.zoom
  if (node) {
    state.duration = readCssTime(
      window.getComputedStyle(node).getPropertyValue("--nextide-motion-layout"),
      zoomDuration
    )
    const resolvedViewportX = viewportX ?? node.clientWidth / 2
    const currentTimelineWidth = Math.max(
      node.scrollWidth - creatorColumnWidth,
      1
    )
    state.focus = {
      ratio: clamp(
        (node.scrollLeft + resolvedViewportX - creatorColumnWidth) /
          currentTimelineWidth,
        0,
        1
      ),
      viewportX: resolvedViewportX,
    }
  }
  const nextIndex = zoomOrder.indexOf(nextZoom)
  const currentIndex = zoomOrder.indexOf(currentZoom)
  const transition: ZoomTransition = {
    id: ++state.transitionId,
    from: currentZoom,
    direction: nextIndex > currentIndex ? "out" : "in",
  }
  if (state.timer) clearTimeout(state.timer)
  state.zoom = nextZoom
  return transition
}

function useAnchoredZoom(
  scrollRef: ScrollRef,
  tracking: React.RefObject<ZoomTracking>,
  timelineMinWidth: number,
  zoomTransition: ZoomTransition | null
) {
  React.useLayoutEffect(() => {
    const focus = tracking.current.focus
    const node = scrollRef.current
    if (!focus || !node || !zoomTransition) return
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    const startedAt = performance.now()
    const duration = reduceMotion ? 1 : tracking.current.duration
    let frame = 0
    const keepFocusAnchored = () => {
      const currentTimelineWidth = Math.max(
        node.scrollWidth - creatorColumnWidth,
        1
      )
      const nextScrollLeft =
        creatorColumnWidth +
        focus.ratio * currentTimelineWidth -
        focus.viewportX
      node.scrollLeft = clamp(
        nextScrollLeft,
        0,
        Math.max(node.scrollWidth - node.clientWidth, 0)
      )
      if (performance.now() - startedAt < duration) {
        frame = requestAnimationFrame(keepFocusAnchored)
      } else {
        tracking.current.focus = null
      }
    }
    frame = requestAnimationFrame(keepFocusAnchored)
    return () => cancelAnimationFrame(frame)
  }, [scrollRef, tracking, timelineMinWidth, zoomTransition])
}

function useInitialScroll(
  scrollRef: ScrollRef,
  tracking: React.RefObject<ZoomTracking>,
  headerLayers: Record<CampaignScheduleZoom, ScheduleHeaderLayer>,
  boundedDays: number,
  timelineMinWidth: number
) {
  const positioned = React.useRef(false)
  React.useLayoutEffect(() => {
    const node = scrollRef.current
    if (!node || positioned.current || tracking.current.zoom !== "week") return
    const todayWeekIndex = headerLayers.week.primary.findIndex(
      (span) => span.today
    )
    if (todayWeekIndex < 0) return
    const firstVisibleWeek =
      headerLayers.week.primary[Math.max(0, todayWeekIndex - 1)]
    if (!firstVisibleWeek) return
    const timelineWidth = Math.max(
      node.scrollWidth - creatorColumnWidth,
      timelineMinWidth
    )
    node.scrollLeft = clamp(
      (firstVisibleWeek.startIndex / boundedDays) * timelineWidth,
      0,
      Math.max(node.scrollWidth - node.clientWidth, 0)
    )
    positioned.current = true
  }, [scrollRef, tracking, boundedDays, headerLayers, timelineMinWidth])
}

export { useScheduleZoom, type ZoomTracking, type ScrollRef }
