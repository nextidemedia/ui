import * as React from "react"

type ContainedScrollAxis = "x" | "y" | "both" | "auto"

function useContainedScroll<T extends HTMLElement>({
  axis = "x",
}: {
  axis?: ContainedScrollAxis
} = {}) {
  const ref = React.useRef<T | null>(null)

  const containWheel = React.useCallback(
    (node: T, event: ContainedWheelEvent) => {
      if (event.defaultPrevented) return
      const next = getScrollTarget(node, event, axis)
      if (!next) return
      event.preventDefault()
      if (next.left !== undefined) node.scrollLeft = next.left
      if (next.top !== undefined) node.scrollTop = next.top
    },
    [axis]
  )

  React.useEffect(() => {
    const node = ref.current
    if (!node) return

    const onNativeWheel = (event: WheelEvent) => containWheel(node, event)
    node.addEventListener("wheel", onNativeWheel, { passive: false })

    return () => node.removeEventListener("wheel", onNativeWheel)
  }, [containWheel])

  const onWheel = React.useCallback(
    (event: React.WheelEvent<T>) => containWheel(event.currentTarget, event),
    [containWheel]
  )

  return { ref, onWheel }
}

type ContainedWheelEvent = Pick<
  WheelEvent,
  "defaultPrevented" | "deltaMode" | "deltaX" | "deltaY" | "preventDefault"
>

function resolveAxis(
  axis: ContainedScrollAxis,
  canScrollX: boolean,
  canScrollY: boolean
) {
  if (axis !== "auto") return axis
  if (canScrollX && !canScrollY) return "x"
  if (canScrollY && !canScrollX) return "y"
  return "both"
}

function wheelMultiplier(mode: number, pageSize: number) {
  return mode === 1 ? 16 : mode === 2 ? pageSize : 1
}

function getScrollTarget(
  node: HTMLElement,
  event: ContainedWheelEvent,
  axis: ContainedScrollAxis
): { left?: number; top?: number } | undefined {
  const maxLeft = node.scrollWidth - node.clientWidth
  const maxTop = node.scrollHeight - node.clientHeight
  const canScrollX = maxLeft > 0
  const canScrollY = maxTop > 0
  const resolvedAxis = resolveAxis(axis, canScrollX, canScrollY)
  const xMultiplier = wheelMultiplier(event.deltaMode, node.clientWidth)
  const yMultiplier = wheelMultiplier(event.deltaMode, node.clientHeight)
  if (resolvedAxis === "x" && canScrollX) {
    const delta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY
    const left = clamp(node.scrollLeft + delta * xMultiplier, 0, maxLeft)
    return left === node.scrollLeft ? undefined : { left }
  }
  if (resolvedAxis === "y" && canScrollY) {
    const top = clamp(node.scrollTop + event.deltaY * yMultiplier, 0, maxTop)
    return top === node.scrollTop ? undefined : { top }
  }
  if (resolvedAxis === "both" && (canScrollX || canScrollY)) {
    return getTwoAxisTarget(
      node,
      event.deltaX * xMultiplier,
      event.deltaY * yMultiplier,
      maxLeft,
      maxTop
    )
  }
}

function getTwoAxisTarget(
  node: HTMLElement,
  deltaX: number,
  deltaY: number,
  maxLeft: number,
  maxTop: number
) {
  const left = clamp(node.scrollLeft + deltaX, 0, maxLeft)
  const top = clamp(node.scrollTop + deltaY, 0, maxTop)
  return left === node.scrollLeft && top === node.scrollTop
    ? undefined
    : { left, top }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export { useContainedScroll, type ContainedScrollAxis }
