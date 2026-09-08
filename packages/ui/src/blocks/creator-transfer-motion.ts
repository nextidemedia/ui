import * as React from "react"
import {
  transferEase,
  transferMoveMs,
  transferReflowMs,
  type CreatorPanelResize,
  type CreatorTransferFlyer,
  type CreatorTransferSide,
} from "./creator-transfer-types.js"
function useTransferMotion() {
  const availablePanelRef = React.useRef<HTMLElement | null>(null)
  const addedPanelRef = React.useRef<HTMLElement | null>(null)
  const availableRefs = React.useRef<Record<string, HTMLButtonElement | null>>(
    {}
  )
  const addedRefs = React.useRef<Record<string, HTMLButtonElement | null>>({})
  const flyerRef = React.useRef<HTMLDivElement | null>(null)
  const availableReflowRef = React.useRef<Map<string, DOMRect> | null>(null)
  const addedReflowRef = React.useRef<Map<string, DOMRect> | null>(null)
  const availableResize = React.useRef<CreatorPanelResize | null>(null)
  const addedResize = React.useRef<CreatorPanelResize | null>(null)
  const transferTimers = React.useRef<number[]>([])
  const resizeTimersRef = React.useRef<
    Record<CreatorTransferSide, number | null>
  >({ available: null, selected: null })
  const clearTransferTimers = React.useCallback(() => {
    transferTimers.current.forEach((timer) => window.clearTimeout(timer))
    transferTimers.current = []
  }, [])

  const clearResizeTimer = React.useCallback((side: CreatorTransferSide) => {
    const timer = resizeTimersRef.current[side]
    if (timer) {
      window.clearTimeout(timer)
      resizeTimersRef.current[side] = null
    }
  }, [])

  const queueTransferTimer = React.useCallback(
    (callback: () => void, delay: number) => {
      const timer = window.setTimeout(callback, delay)
      transferTimers.current.push(timer)
    },
    []
  )

  const capturePanelResize = (side: CreatorTransferSide, duration: number) => {
    const node =
      side === "available" ? availablePanelRef.current : addedPanelRef.current
    const resizeRef = side === "available" ? availableResize : addedResize
    if (node) {
      resizeRef.current = {
        height: node.getBoundingClientRect().height,
        duration,
      }
    }
  }

  const animatePanelResize = usePanelResize(clearResizeTimer, resizeTimersRef)
  return {
    availablePanelRef,
    addedPanelRef,
    availableRefs,
    addedRefs,
    flyerRef,
    availableReflowRef,
    addedReflowRef,
    availableResize,
    addedResize,
    clearTransferTimers,
    clearResizeTimer,
    queueTransferTimer,
    capturePanelResize,
    animatePanelResize,
  }
}
type TransferMotion = ReturnType<typeof useTransferMotion>
function usePanelResize(
  clearResizeTimer: (side: CreatorTransferSide) => void,
  resizeTimersRef: React.RefObject<Record<CreatorTransferSide, number | null>>
) {
  const animatePanelResize = React.useCallback(
    (
      side: CreatorTransferSide,
      ref: React.MutableRefObject<HTMLElement | null>,
      resizeRef: React.MutableRefObject<CreatorPanelResize | null>
    ) => {
      const node = ref.current
      const resize = resizeRef.current
      resizeRef.current = null
      if (!node || !resize) return

      const nextHeight = node.getBoundingClientRect().height
      if (Math.abs(resize.height - nextHeight) < 0.5) return

      clearResizeTimer(side)
      const originalStyle = node.getAttribute("style") ?? ""
      node.setAttribute(
        "style",
        mergeInlineStyle(originalStyle, {
          transition: "none",
          height: `${resize.height}px`,
        })
      )
      void node.offsetHeight
      node.setAttribute(
        "style",
        mergeInlineStyle(originalStyle, {
          transition: `height ${resize.duration}ms ${transferEase}`,
          height: `${nextHeight}px`,
        })
      )

      resizeTimersRef.current[side] = window.setTimeout(() => {
        restoreInlineStyle(node, originalStyle)
        resizeTimersRef.current[side] = null
      }, resize.duration)
    },
    [clearResizeTimer, resizeTimersRef]
  )

  return animatePanelResize
}
function useTransferMotionEffects(
  motion: TransferMotion,
  visibleAvailableIds: string[],
  visibleAddedIds: string[],
  transferFlyer: CreatorTransferFlyer | null
) {
  const {
    availablePanelRef,
    addedPanelRef,
    availableRefs,
    addedRefs,
    flyerRef,
    availableReflowRef,
    addedReflowRef,
    availableResize,
    addedResize,
    clearTransferTimers,
    clearResizeTimer,
    animatePanelResize,
  } = motion
  React.useEffect(
    () => () => {
      clearTransferTimers()
      clearResizeTimer("available")
      clearResizeTimer("selected")
    },
    [clearResizeTimer, clearTransferTimers]
  )

  React.useLayoutEffect(() => {
    animateRows(visibleAvailableIds, availableRefs, availableReflowRef.current)
    animatePanelResize("available", availablePanelRef, availableResize)
    availableReflowRef.current = null
  }, [
    animatePanelResize,
    visibleAvailableIds,
    availableReflowRef,
    availablePanelRef,
    availableRefs,
    availableResize,
  ])

  React.useLayoutEffect(() => {
    animateRows(visibleAddedIds, addedRefs, addedReflowRef.current)
    animatePanelResize("selected", addedPanelRef, addedResize)
    addedReflowRef.current = null
  }, [
    animatePanelResize,
    visibleAddedIds,
    addedRefs,
    addedResize,
    addedPanelRef,
    addedReflowRef,
  ])

  React.useLayoutEffect(() => {
    const node = flyerRef.current
    if (!node || !transferFlyer) return

    node.animate(
      [
        { transform: "translate3d(0, 0, 0) scale(1)", opacity: 1 },
        {
          transform: `translate3d(${transferFlyer.to.left - transferFlyer.from.left}px, ${transferFlyer.to.top - transferFlyer.from.top}px, 0) scale(1)`,
          opacity: 1,
        },
      ],
      {
        duration: transferMoveMs,
        easing: transferEase,
        fill: "forwards",
      }
    )
  }, [transferFlyer, flyerRef])
}
function captureRows(
  ids: string[],
  refs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>
) {
  const rects = new Map<string, DOMRect>()
  ids.forEach((id) => {
    const row = refs.current[id]
    if (row) rects.set(id, row.getBoundingClientRect())
  })
  return rects
}

function animateRows(
  ids: string[],
  refs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>,
  previousRects: Map<string, DOMRect> | null
) {
  if (!previousRects) return

  ids.forEach((id) => {
    const row = refs.current[id]
    const previousRect = previousRects.get(id)
    if (!row || !previousRect) return

    const nextRect = row.getBoundingClientRect()
    const deltaX = previousRect.left - nextRect.left
    const deltaY = previousRect.top - nextRect.top
    if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) return

    row.animate(
      [
        { transform: `translate3d(${deltaX}px, ${deltaY}px, 0)`, opacity: 1 },
        { transform: "translate3d(0, 0, 0)", opacity: 1 },
      ],
      { duration: transferReflowMs, easing: transferEase }
    )
  })
}

function mergeInlineStyle(
  originalStyle: string,
  styles: Record<string, string>
) {
  const suffix = Object.entries(styles)
    .map(([property, value]) => `${property}: ${value}`)
    .join("; ")

  return originalStyle ? `${originalStyle}; ${suffix}` : suffix
}

function restoreInlineStyle(node: HTMLElement, originalStyle: string) {
  if (originalStyle) {
    node.setAttribute("style", originalStyle)
    return
  }

  node.removeAttribute("style")
}

export {
  captureRows,
  useTransferMotion,
  useTransferMotionEffects,
  type TransferMotion,
}
