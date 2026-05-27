import * as React from "react"

type ContainedScrollAxis = "x" | "y" | "both"

function useContainedScroll<T extends HTMLElement>({
  axis = "x",
}: {
  axis?: ContainedScrollAxis
} = {}) {
  const ref = React.useRef<T | null>(null)

  const onWheel = React.useCallback(
    (event: React.WheelEvent<T>) => {
      const node = event.currentTarget
      const maxLeft = node.scrollWidth - node.clientWidth
      const maxTop = node.scrollHeight - node.clientHeight
      const canScrollX = maxLeft > 0
      const canScrollY = maxTop > 0

      if (axis === "x" && canScrollX) {
        const delta =
          Math.abs(event.deltaX) > Math.abs(event.deltaY)
            ? event.deltaX
            : event.deltaY
        event.preventDefault()
        node.scrollLeft = clamp(node.scrollLeft + delta, 0, maxLeft)
        return
      }

      if (axis === "y" && canScrollY) {
        event.preventDefault()
        node.scrollTop = clamp(node.scrollTop + event.deltaY, 0, maxTop)
        return
      }

      if (axis === "both" && (canScrollX || canScrollY)) {
        event.preventDefault()
        node.scrollLeft = clamp(node.scrollLeft + event.deltaX, 0, maxLeft)
        node.scrollTop = clamp(node.scrollTop + event.deltaY, 0, maxTop)
      }
    },
    [axis]
  )

  return { ref, onWheel }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

export { useContainedScroll, type ContainedScrollAxis }
