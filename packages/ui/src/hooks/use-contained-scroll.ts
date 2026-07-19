import * as React from "react"

type ContainedScrollAxis = "x" | "y" | "both" | "auto"

function useContainedScroll<T extends HTMLElement>({
  axis = "x",
}: {
  axis?: ContainedScrollAxis
} = {}) {
  const ref = React.useRef<T | null>(null)

  const containWheel = React.useCallback(
    (
      node: T,
      event: Pick<
        WheelEvent,
        | "defaultPrevented"
        | "deltaMode"
        | "deltaX"
        | "deltaY"
        | "preventDefault"
      >
    ) => {
      if (event.defaultPrevented) return

      const maxLeft = node.scrollWidth - node.clientWidth
      const maxTop = node.scrollHeight - node.clientHeight
      const canScrollX = maxLeft > 0
      const canScrollY = maxTop > 0
      const resolvedAxis =
        axis === "auto"
          ? canScrollX && !canScrollY
            ? "x"
            : canScrollY && !canScrollX
              ? "y"
              : "both"
          : axis
      const lineMultiplier = 16
      const xMultiplier =
        event.deltaMode === 1
          ? lineMultiplier
          : event.deltaMode === 2
            ? node.clientWidth
            : 1
      const yMultiplier =
        event.deltaMode === 1
          ? lineMultiplier
          : event.deltaMode === 2
            ? node.clientHeight
            : 1

      if (resolvedAxis === "x" && canScrollX) {
        const delta =
          Math.abs(event.deltaX) > Math.abs(event.deltaY)
            ? event.deltaX
            : event.deltaY
        const nextLeft = clamp(
          node.scrollLeft + delta * xMultiplier,
          0,
          maxLeft
        )
        if (nextLeft === node.scrollLeft) return

        event.preventDefault()
        node.scrollLeft = nextLeft
        return
      }

      if (resolvedAxis === "y" && canScrollY) {
        const nextTop = clamp(
          node.scrollTop + event.deltaY * yMultiplier,
          0,
          maxTop
        )
        if (nextTop === node.scrollTop) return

        event.preventDefault()
        node.scrollTop = nextTop
        return
      }

      if (resolvedAxis === "both" && (canScrollX || canScrollY)) {
        const nextLeft = clamp(
          node.scrollLeft + event.deltaX * xMultiplier,
          0,
          maxLeft
        )
        const nextTop = clamp(
          node.scrollTop + event.deltaY * yMultiplier,
          0,
          maxTop
        )
        if (nextLeft === node.scrollLeft && nextTop === node.scrollTop) return

        event.preventDefault()
        node.scrollLeft = nextLeft
        node.scrollTop = nextTop
      }
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

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export { useContainedScroll, type ContainedScrollAxis }
