"use client"

import * as React from "react"
import { createPortal } from "react-dom"

import { cn } from "@nextide/ui/lib/utils"

type GraphTooltipAnchor = {
  x: number
  y: number
}

function GraphTooltip({
  anchor,
  children,
  className,
  onDismiss,
  sideOffset = 14,
  style,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & {
  anchor: GraphTooltipAnchor
  children: React.ReactNode
  onDismiss?: () => void
  sideOffset?: number
}) {
  const tooltipRef = React.useRef<HTMLDivElement | null>(null)
  const onDismissRef = React.useRef(onDismiss)
  const [position, setPosition] = React.useState({
    left: anchor.x + sideOffset,
    top: anchor.y - 36,
  })

  React.useEffect(() => {
    onDismissRef.current = onDismiss
  }, [onDismiss])

  React.useLayoutEffect(() => {
    const node = tooltipRef.current
    if (!node) return

    const place = () => {
      const gutter = 8
      const width = node.offsetWidth
      const height = node.offsetHeight
      const preferredLeft = anchor.x + sideOffset
      const left =
        preferredLeft + width + gutter <= window.innerWidth
          ? preferredLeft
          : anchor.x - width - sideOffset
      const top = anchor.y - Math.min(42, height * 0.28)
      const nextPosition = {
        left: Math.max(
          gutter,
          Math.min(left, window.innerWidth - width - gutter)
        ),
        top: Math.max(
          gutter,
          Math.min(top, window.innerHeight - height - gutter)
        ),
      }

      setPosition((current) =>
        current.left === nextPosition.left && current.top === nextPosition.top
          ? current
          : nextPosition
      )
    }

    place()
    const resizeObserver = new ResizeObserver(place)
    resizeObserver.observe(node)
    window.addEventListener("resize", place)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", place)
    }
  }, [anchor.x, anchor.y, sideOffset])

  React.useEffect(() => {
    const dismiss = () => onDismissRef.current?.()
    const listenerOptions = { capture: true, passive: true }
    const frame = window.requestAnimationFrame(() => {
      document.addEventListener("scroll", dismiss, listenerOptions)
    })

    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener("scroll", dismiss, listenerOptions)
    }
  }, [])

  if (typeof document === "undefined") return null

  return createPortal(
    <div
      {...props}
      ref={tooltipRef}
      data-slot="graph-tooltip"
      className={cn(
        "pointer-events-none fixed z-[1100] w-64 rounded-lg border border-nextide-line bg-background/95 p-3 text-xs shadow-[0_18px_60px_rgb(0_0_0/0.42)] backdrop-blur-xl sm:w-72",
        className
      )}
      style={{ ...style, ...position }}
    >
      {children}
    </div>,
    document.body
  )
}

function GraphTooltipRow({
  color,
  label,
  value,
  dashed,
  className,
  ...props
}: React.ComponentProps<"span"> & {
  color: string
  label: React.ReactNode
  value: React.ReactNode
  dashed?: boolean
}) {
  return (
    <span
      {...props}
      data-slot="graph-tooltip-row"
      className={cn(
        "grid grid-cols-[0.75rem_minmax(0,1fr)_auto] items-start gap-2",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn("mt-1.5 h-0.5 w-3 rounded-full", dashed && "border-t")}
        style={{
          backgroundColor: dashed ? "transparent" : color,
          borderColor: color,
        }}
      />
      <span className="min-w-0 leading-tight text-muted-foreground">
        {label}
      </span>
      <strong className="font-medium text-foreground">{value}</strong>
    </span>
  )
}

export { GraphTooltip, GraphTooltipRow, type GraphTooltipAnchor }
