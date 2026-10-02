import * as React from "react"

import {
  clamp,
  creatorColumnWidth,
  fitScheduleZoom,
  readCssTime,
  scheduleTimelineMinWidth,
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
  focus: { dayIndex: number; viewportX: number } | null
}

type ScrollRef = React.RefObject<HTMLDivElement | null>
type HeaderLayers = Record<CampaignScheduleZoom, ScheduleHeaderLayer>
type CampaignScheduleDefaultZoom = CampaignScheduleZoom | "fit"
type RequestZoom = (zoom: CampaignScheduleZoom, viewportX?: number) => void

function useScheduleZoom(
  scrollRef: ScrollRef,
  headerLayers: HeaderLayers,
  defaultZoom: CampaignScheduleDefaultZoom
) {
  const fit = defaultZoom === "fit"
  const startZoom = fit ? "week" : defaultZoom
  const tracking = React.useRef<ZoomTracking>({
    zoom: startZoom,
    duration: zoomDuration,
    transitionId: 0,
    timer: null,
    focus: null,
  })
  const [zoom, setZoom] = React.useState<CampaignScheduleZoom>(startZoom)
  const [fitting, setFitting] = React.useState(fit)
  const [zoomTransition, setZoomTransition] =
    React.useState<ZoomTransition | null>(null)
  const boundedDays = Math.max(headerLayers[zoom].dayCount, 1)
  const timelineMinWidth = scheduleTimelineMinWidth(zoom, headerLayers)
  const requestZoom = React.useCallback(
    (nextZoom: CampaignScheduleZoom, viewportX?: number) => {
      const state = tracking.current
      if (state.zoom === nextZoom) return
      const transition = beginZoom(
        state,
        scrollRef.current,
        nextZoom,
        Math.max(headerLayers[state.zoom].dayCount, 1),
        viewportX
      )
      setZoomTransition(transition)
      setZoom(nextZoom)
      state.timer = setTimeout(() => setZoomTransition(null), state.duration)
    },
    [scrollRef, headerLayers]
  )
  const userZoomed = React.useRef(false)
  const requestUserZoom = React.useCallback<RequestZoom>(
    (nextZoom, viewportX) => {
      userZoomed.current = true
      requestZoom(nextZoom, viewportX)
    },
    [requestZoom]
  )

  // The timeline content mounts only after this measurement, before paint,
  // so the fitted zoom never animates in from the placeholder zoom.
  React.useLayoutEffect(() => {
    const node = scrollRef.current
    if (!fitting || !node) return
    const fittedZoom = fitScheduleZoom(fitWidth(node), headerLayers)
    tracking.current.zoom = fittedZoom
    setZoom(fittedZoom)
    setFitting(false)
  }, [scrollRef, headerLayers, fitting])
  useRefitOnResize(
    scrollRef,
    headerLayers,
    fit && !fitting,
    userZoomed,
    requestZoom
  )
  useAnchoredZoom(
    scrollRef,
    tracking,
    timelineMinWidth,
    zoomTransition,
    boundedDays
  )
  useInitialScroll(
    scrollRef,
    tracking,
    headerLayers,
    boundedDays,
    timelineMinWidth,
    fit ? null : startZoom
  )
  useScheduleWheel(scrollRef, tracking, requestUserZoom)
  React.useEffect(
    () => () => {
      if (tracking.current.timer) clearTimeout(tracking.current.timer)
    },
    []
  )

  const zoomBy = (step: -1 | 1) => {
    const nextZoom = zoomOrder[zoomOrder.indexOf(zoom) + step]
    if (nextZoom) requestUserZoom(nextZoom)
  }
  return {
    zoom,
    zoomTransition,
    timelineMinWidth,
    zoomBy,
    boundedDays,
    fitting,
  }
}

function useRefitOnResize(
  scrollRef: ScrollRef,
  headerLayers: HeaderLayers,
  enabled: boolean,
  userZoomed: React.RefObject<boolean>,
  requestZoom: RequestZoom
) {
  React.useEffect(() => {
    const node = scrollRef.current
    if (!enabled || !node) return
    const observer = new ResizeObserver(() => {
      if (userZoomed.current) {
        observer.disconnect()
        return
      }
      requestZoom(fitScheduleZoom(fitWidth(node), headerLayers))
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [scrollRef, headerLayers, enabled, userZoomed, requestZoom])
}

function fitWidth(node: HTMLDivElement) {
  return node.clientWidth - creatorColumnWidth
}

function beginZoom(
  state: ZoomTracking,
  node: HTMLDivElement | null,
  nextZoom: CampaignScheduleZoom,
  dayCount: number,
  viewportX?: number
): ZoomTransition {
  const currentZoom = state.zoom
  if (node) {
    state.duration = readCssTime(
      window.getComputedStyle(node).getPropertyValue("--nextide-motion-layout"),
      zoomDuration
    )
    const resolvedViewportX = viewportX ?? node.clientWidth / 2
    const currentTimelineWidth = scheduleDateWidth(node)
    state.focus = {
      dayIndex:
        dayCount *
        clamp(
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
  zoomTransition: ZoomTransition | null,
  boundedDays: number
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
      const currentTimelineWidth = scheduleDateWidth(node)
      const nextScrollLeft =
        creatorColumnWidth +
        (focus.dayIndex / boundedDays) * currentTimelineWidth -
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
  }, [scrollRef, tracking, timelineMinWidth, zoomTransition, boundedDays])
}

function useInitialScroll(
  scrollRef: ScrollRef,
  tracking: React.RefObject<ZoomTracking>,
  headerLayers: HeaderLayers,
  boundedDays: number,
  timelineMinWidth: number,
  initialZoom: CampaignScheduleZoom | null
) {
  const positioned = React.useRef(false)
  React.useLayoutEffect(() => {
    const node = scrollRef.current
    if (
      !node ||
      !initialZoom ||
      positioned.current ||
      tracking.current.zoom !== initialZoom
    )
      return
    const spans = headerLayers[initialZoom].primary
    const todayIndex = spans.findIndex((span) => span.today)
    if (todayIndex < 0) return
    const firstVisibleSpan = spans[Math.max(0, todayIndex - 1)]
    if (!firstVisibleSpan) return
    const timelineWidth = scheduleDateWidth(node)
    node.scrollLeft = clamp(
      (firstVisibleSpan.startIndex / boundedDays) * timelineWidth,
      0,
      Math.max(node.scrollWidth - node.clientWidth, 0)
    )
    positioned.current = true
  }, [
    scrollRef,
    tracking,
    boundedDays,
    headerLayers,
    timelineMinWidth,
    initialZoom,
  ])
}

function scheduleDateWidth(node: HTMLDivElement) {
  return Math.max(
    (node.firstElementChild?.getBoundingClientRect().width ??
      node.scrollWidth) - creatorColumnWidth,
    1
  )
}

export {
  useScheduleZoom,
  type CampaignScheduleDefaultZoom,
  type ZoomTracking,
  type ScrollRef,
}
