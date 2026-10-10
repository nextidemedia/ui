import * as React from "react"
import { flushSync } from "react-dom"

import {
  clamp,
  creatorColumnWidth,
  fitScheduleZoom,
  fittedTimelineMinWidth,
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

type ScheduleLayers = { standard: HeaderLayers; fitted: HeaderLayers }

function useScheduleZoom(
  scrollRef: ScrollRef,
  layers: ScheduleLayers,
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
  // A fitted board spans only the supplied days without the standard width
  // floor. The first toolbar or wheel zoom hands over to the standard board,
  // with its trailing month padding and width floor, and ends re-fitting.
  const [fitted, setFitted] = React.useState(fit)
  const [zoomTransition, setZoomTransition] =
    React.useState<ZoomTransition | null>(null)
  const headerLayers = fitted ? layers.fitted : layers.standard
  const boundedDays = Math.max(headerLayers[zoom].dayCount, 1)
  const requestZoom = React.useCallback(
    (nextZoom: CampaignScheduleZoom, viewportX?: number) => {
      const state = tracking.current
      if (state.zoom === nextZoom) return
      const transition = beginZoom(
        state,
        scrollRef.current,
        nextZoom,
        headerLayers[state.zoom],
        viewportX
      )
      setZoomTransition(transition)
      setZoom(nextZoom)
      state.timer = setTimeout(() => setZoomTransition(null), state.duration)
    },
    [scrollRef, headerLayers]
  )
  const requestUserZoom = React.useCallback<RequestZoom>(
    (nextZoom, viewportX) => {
      if (tracking.current.zoom === nextZoom) return
      setFitted(false)
      requestZoom(nextZoom, viewportX)
    },
    [requestZoom]
  )
  const applyFit = React.useCallback((fittedZoom: CampaignScheduleZoom) => {
    tracking.current.zoom = fittedZoom
    setZoom(fittedZoom)
  }, [])
  const { fitting, fitWidth } = useScheduleFit(
    scrollRef,
    layers.fitted,
    fit,
    fitted,
    applyFit,
    requestZoom
  )
  const timelineMinWidth = fitted
    ? Math.max(fittedTimelineMinWidth(zoom, headerLayers), fitWidth)
    : scheduleTimelineMinWidth(zoom, headerLayers)
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
    headerLayers,
    timelineMinWidth,
    zoomBy,
    boundedDays,
    fitting,
    // A fitted board follows its container; only zoom transitions animate it.
    animateWidth: !fitted || zoomTransition !== null,
  }
}

// Fit mode measures the timeline before its content mounts and the first
// paint, then re-measures on every resize until the viewer zooms. The fitted
// track is floored at the measured width, not only stretched to it, so layout
// passes that size the board intrinsically already see the final width and
// size-dependent header labels resolve against it.
function useScheduleFit(
  scrollRef: ScrollRef,
  fittedLayers: HeaderLayers,
  fit: boolean,
  fitted: boolean,
  applyFit: (zoom: CampaignScheduleZoom) => void,
  requestZoom: RequestZoom
) {
  const [fitting, setFitting] = React.useState(fit)
  const [width, setWidth] = React.useState(0)
  React.useLayoutEffect(() => {
    const node = scrollRef.current
    if (!fitting || !node) return
    const measured = measureFitWidth(node)
    setWidth(measured)
    applyFit(fitScheduleZoom(measured, fittedLayers))
    setFitting(false)
  }, [scrollRef, fittedLayers, fitting, applyFit])
  React.useEffect(() => {
    const node = scrollRef.current
    if (!fitted || fitting || !node) return
    const observer = new ResizeObserver(() => {
      const measured = measureFitWidth(node)
      flushSync(() => {
        setWidth(measured)
        requestZoom(fitScheduleZoom(measured, fittedLayers))
      })
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [scrollRef, fittedLayers, fitted, fitting, requestZoom])
  return { fitting, fitWidth: width }
}

// The timeline width beside the creator column, rounded down so a track
// floored at it never overflows.
function measureFitWidth(node: HTMLDivElement) {
  const style = window.getComputedStyle(node)
  const width =
    Number.parseFloat(style.width) -
    Number.parseFloat(style.borderLeftWidth) -
    Number.parseFloat(style.borderRightWidth)
  return Math.floor(width) - creatorColumnWidth
}

function beginZoom(
  state: ZoomTracking,
  node: HTMLDivElement | null,
  nextZoom: CampaignScheduleZoom,
  currentLayer: ScheduleHeaderLayer,
  viewportX?: number
): ZoomTransition {
  const currentZoom = state.zoom
  const dayCount = Math.max(currentLayer.dayCount, 1)
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
    fromLayer: currentLayer,
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
