import * as React from "react"
import {
  transferEase,
  transferMoveMs,
  transferReflowMs,
  type CreatorTransferFlyer,
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
  const transferTimers = React.useRef<number[]>([])
  const clearTransferTimers = React.useCallback(() => {
    transferTimers.current.forEach((timer) => window.clearTimeout(timer))
    transferTimers.current = []
  }, [])

  const queueTransferTimer = React.useCallback(
    (callback: () => void, delay: number) => {
      const timer = window.setTimeout(callback, delay)
      transferTimers.current.push(timer)
    },
    []
  )

  return {
    availablePanelRef,
    addedPanelRef,
    availableRefs,
    addedRefs,
    flyerRef,
    availableReflowRef,
    addedReflowRef,
    clearTransferTimers,
    queueTransferTimer,
  }
}
type TransferMotion = ReturnType<typeof useTransferMotion>
function useTransferMotionEffects(
  motion: TransferMotion,
  visibleAvailableIds: string[],
  visibleAddedIds: string[],
  transferFlyer: CreatorTransferFlyer | null
) {
  const {
    availableRefs,
    addedRefs,
    flyerRef,
    availableReflowRef,
    addedReflowRef,
    clearTransferTimers,
  } = motion
  React.useEffect(
    () => () => {
      clearTransferTimers()
    },
    [clearTransferTimers]
  )

  React.useLayoutEffect(() => {
    animateRows(visibleAvailableIds, availableRefs, availableReflowRef.current)
    availableReflowRef.current = null
  }, [visibleAvailableIds, availableReflowRef, availableRefs])

  React.useLayoutEffect(() => {
    animateRows(visibleAddedIds, addedRefs, addedReflowRef.current)
    addedReflowRef.current = null
  }, [visibleAddedIds, addedRefs, addedReflowRef])

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

export {
  captureRows,
  useTransferMotion,
  useTransferMotionEffects,
  type TransferMotion,
}
