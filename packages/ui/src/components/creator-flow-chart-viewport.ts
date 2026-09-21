import * as React from "react"

export function useFlowViewport(
  ref: React.RefObject<HTMLDivElement | null>,
  columnCount: number,
  visibleColumnCount: number | undefined,
  visibleStartIndex: number,
  onChange: ((index: number) => void) | undefined
) {
  const [width, setWidth] = React.useState(0)
  const [start, setStart] = React.useState(visibleStartIndex)
  const count = Math.min(
    columnCount,
    Math.max(1, visibleColumnCount ?? columnCount)
  )
  const creatorWidth = Math.max(0, (width - 12) / 4)
  const columnWidth = (creatorWidth * 3) / count
  const enabled = visibleColumnCount !== undefined
  const previousWidth = React.useRef(0)

  React.useEffect(() => {
    const element = ref.current
    if (!element || !enabled) return
    const observer = new ResizeObserver(() => setWidth(element.clientWidth))
    observer.observe(element)
    return () => observer.disconnect()
  }, [enabled, ref])

  React.useEffect(() => {
    const element = ref.current
    if (!element || !enabled || !columnWidth) return
    const left =
      Math.max(0, Math.min(columnCount - count, visibleStartIndex)) *
      columnWidth
    const resized = previousWidth.current !== columnWidth
    previousWidth.current = columnWidth
    if (Math.abs(element.scrollLeft - left) < 1) return
    element.scrollTo({
      left,
      behavior:
        resized || matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
    })
  }, [columnCount, columnWidth, count, enabled, ref, visibleStartIndex])

  const handlers = useViewportPan(enabled, columnWidth, onChange)
  return {
    enabled,
    start,
    count,
    gridStyle:
      enabled && width
        ? {
            width: creatorWidth + 12 + columnWidth * columnCount,
            gridTemplateColumns: `${creatorWidth}px minmax(0, 1fr)`,
          }
        : undefined,
    handlers: enabled
      ? {
          ...handlers,
          onScroll: (event: React.UIEvent<HTMLDivElement>) => {
            if (columnWidth)
              setStart(event.currentTarget.scrollLeft / columnWidth)
          },
        }
      : {},
  }
}

function useViewportPan(
  enabled: boolean,
  columnWidth: number,
  onChange: ((index: number) => void) | undefined
) {
  const drag = React.useRef<{
    x: number
    y: number
    left: number
    top: number
    moved: boolean
  } | null>(null)
  const suppressClick = React.useRef(false)
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    suppressClick.current = false
    if (
      !enabled ||
      event.button !== 0 ||
      (event.target as HTMLElement).closest(
        '[data-slot="creator-flow-creators"]'
      )
    )
      return
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      top: event.currentTarget.scrollTop,
      left: event.currentTarget.scrollLeft,
      moved: false,
    }
    const target =
      (event.target as HTMLElement).closest("button") ?? event.currentTarget
    target.setPointerCapture(event.pointerId)
  }
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const state = drag.current
    if (!state) return
    const delta = event.clientX - state.x
    const deltaY = event.clientY - state.y
    if (!state.moved && Math.hypot(delta, deltaY) < 4) return
    state.moved = true
    event.currentTarget.scrollLeft = state.left - delta
    event.currentTarget.scrollTop = state.top - deltaY
  }
  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current?.moved) {
      suppressClick.current = true
      onChange?.(event.currentTarget.scrollLeft / columnWidth)
    }
    drag.current = null
  }
  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: () => {
      drag.current = null
    },
    onClickCapture: (event: React.MouseEvent) => {
      if (suppressClick.current && event.detail > 0) {
        event.preventDefault()
        event.stopPropagation()
      }
    },
  }
}
