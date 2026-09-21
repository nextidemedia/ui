import * as React from "react"

import { useContainedScroll } from "@nextide/ui/hooks/use-contained-scroll"
import { useFlowViewport } from "./creator-flow-chart-viewport.js"

import { cn } from "@nextide/ui/lib/utils"

type CreatorFlowTone = "success" | "processing" | "warning" | "danger"

type CreatorFlowCreator = {
  id: string
  name: React.ReactNode
  avatar?: React.ReactNode
  meta?: React.ReactNode
}

type CreatorFlowSession = {
  id: string
  creatorId: string
  label: React.ReactNode
  startIndex: number
  endIndex: number
  tone?: CreatorFlowTone
  continuesBefore?: boolean | undefined
}

type DragState = {
  id: string
  mode: "move" | "start" | "end"
  pointerStartX: number
  originalStart: number
  originalEnd: number
  columnWidth: number
}

const toneClasses: Record<CreatorFlowTone, string> = {
  success: "border-nextide-tide/60 bg-nextide-tide/16 text-nextide-tide",
  processing:
    "border-nextide-purple/60 bg-nextide-purple/16 text-nextide-purple",
  warning: "border-nextide-yellow/60 bg-nextide-yellow/16 text-nextide-yellow",
  danger: "border-nextide-red/60 bg-nextide-red/16 text-nextide-red",
}

type CreatorFlowChartProps = Omit<React.ComponentProps<"section">, "title"> & {
  creators: CreatorFlowCreator[]
  days: React.ReactNode[]
  sessions: CreatorFlowSession[]
  onSessionsChange?: (sessions: CreatorFlowSession[]) => void
  onSessionSelect?: (session: CreatorFlowSession) => void
  title?: React.ReactNode
  description?: React.ReactNode
  compact?: boolean
  continuationFade?: number
  visibleStartIndex?: number
  visibleColumnCount?: number
  onVisibleStartIndexChange?: (index: number) => void
}

function CreatorFlowChart({
  creators,
  days,
  sessions,
  onSessionsChange,
  onSessionSelect,
  title = "Creator flow chart",
  description,
  compact = false,
  continuationFade = 0.1,
  visibleStartIndex = 0,
  visibleColumnCount,
  onVisibleStartIndexChange,
  className,
  ...props
}: CreatorFlowChartProps) {
  const viewportColumns =
    compact && !onSessionsChange ? visibleColumnCount : undefined
  const { ref: scrollRef, onWheel } = useContainedScroll<HTMLDivElement>({
    axis: viewportColumns !== undefined ? "both" : "x",
  })
  const interaction = useFlowInteraction(
    days.length,
    sessions,
    onSessionsChange
  )
  const { columnCount } = interaction
  const viewport = useFlowViewport(
    scrollRef,
    columnCount,
    viewportColumns,
    visibleStartIndex,
    onVisibleStartIndexChange
  )

  return (
    <section
      data-slot="creator-flow-chart"
      className={cn(
        "grid min-w-0 gap-3 rounded-lg border border-nextide-line bg-nextide-panel p-3",
        viewport.enabled && "flex min-h-0 flex-col",
        className
      )}
      {...props}
    >
      <FlowHeading
        title={title}
        description={flowDescription(description, title, onSessionsChange)}
      />
      <div
        data-slot="creator-flow-viewport"
        ref={scrollRef}
        {...viewport.handlers}
        onWheel={onWheel}
        className={cn(
          "nextide-contained-scroll nextide-scrollbar-none overflow-x-auto",
          viewport.enabled &&
            "min-h-0 flex-1 touch-none overflow-auto select-none"
        )}
      >
        <div
          style={viewport.gridStyle}
          className={cn(
            "grid items-start gap-3",
            compact
              ? "grid-cols-[minmax(0,1fr)_minmax(0,3fr)]"
              : "min-w-[48rem] grid-cols-[10rem_minmax(0,1fr)]"
          )}
        >
          <FlowCreators
            creators={creators}
            compact={compact}
            sticky={viewport.enabled}
          />
          <div className="grid min-w-0 gap-0">
            <FlowDays
              compact={compact}
              columnCount={columnCount}
              days={days}
              sticky={viewport.enabled}
            />
            <FlowRows
              viewport={viewport.enabled ? viewport : undefined}
              {...interaction}
              creators={creators}
              sessions={sessions}
              onSessionsChange={onSessionsChange}
              onSessionSelect={onSessionSelect}
              compact={compact}
              continuationFade={continuationFade}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function flowDescription(
  description: React.ReactNode,
  title: React.ReactNode,
  editing: unknown
) {
  if (description !== undefined) return description
  return editing && title === "Creator flow chart"
    ? "Drag a block to move a creator session. Drag an edge to resize its date range."
    : null
}

function FlowHeading({
  title,
  description,
}: {
  title: React.ReactNode
  description: React.ReactNode
}) {
  if (!title && !description) return null
  return (
    <div className="grid gap-1">
      {title ? <strong className="text-sm">{title}</strong> : null}
      {description ? (
        <span className="text-xs text-muted-foreground">{description}</span>
      ) : null}
    </div>
  )
}

function FlowDays({
  compact,
  days,
  columnCount,
  sticky,
}: {
  compact: boolean
  days: React.ReactNode[]
  columnCount: number
  sticky: boolean
}) {
  return (
    <div
      data-slot="creator-flow-header"
      className={cn(
        "grid h-9 border-b border-nextide-line text-center text-ui-caption font-medium text-muted-foreground",
        compact && "text-xs",
        sticky && "sticky top-0 z-10 bg-nextide-panel"
      )}
      style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
    >
      {days.map((day, index) => (
        <span
          key={dayKey(day, index)}
          className="grid min-w-0 place-items-center border-l border-nextide-line/60 wrap-break-word first:border-l-0"
        >
          {day}
        </span>
      ))}
    </div>
  )
}

function FlowCreators({
  creators,
  compact,
  sticky,
}: {
  sticky: boolean
  creators: CreatorFlowCreator[]
  compact: boolean
}) {
  return (
    <div
      data-slot="creator-flow-creators"
      className={cn(
        "min-w-0",
        sticky && "sticky left-0 z-20 -mr-3 bg-nextide-panel pr-3"
      )}
    >
      <div
        className={cn("h-9", sticky && "sticky top-0 z-30 bg-nextide-panel")}
      />
      {creators.map((creator) => (
        <div
          key={creator.id}
          data-slot="creator-flow-creator"
          data-creator-id={creator.id}
          className={cn(
            "flex min-w-0 items-center gap-2 border-t border-nextide-line/70",
            compact ? "h-12" : "h-14"
          )}
        >
          {creator.avatar ? (
            <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-sm">
              {creator.avatar}
            </span>
          ) : null}
          <div className="min-w-0">
            <strong className="block truncate text-xs">{creator.name}</strong>
            {creator.meta ? (
              <small className="block truncate text-ui-caption text-muted-foreground">
                {creator.meta}
              </small>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}

function FlowRows({
  viewport,
  continuationFade,
  gridRef,
  creators,
  sessions,
  columnCount,
  onSessionsChange,
  onSessionSelect,
  compact,
  beginDrag,
  moveDrag,
  endDrag,
}: {
  viewport: { start: number; count: number } | undefined
  continuationFade: number
  gridRef: React.RefObject<HTMLDivElement | null>
  creators: CreatorFlowCreator[]
  sessions: CreatorFlowSession[]
  columnCount: number
  onSessionsChange: ((sessions: CreatorFlowSession[]) => void) | undefined
  onSessionSelect: ((session: CreatorFlowSession) => void) | undefined
  compact: boolean
  beginDrag: (
    event: React.PointerEvent,
    session: CreatorFlowSession,
    mode: DragState["mode"]
  ) => void
  moveDrag: (event: React.PointerEvent) => void
  endDrag: (event: React.PointerEvent) => void
}) {
  return (
    <div ref={gridRef} className="grid">
      {creators.map((creator) => {
        const creatorSessions = sessions.filter(
          (session) => session.creatorId === creator.id
        )
        return (
          <div
            key={creator.id}
            className={cn(
              "relative border-t border-nextide-line/70 bg-[linear-gradient(90deg,rgb(255_255_255/0.035)_1px,transparent_1px)]",
              compact ? "h-12" : "h-14"
            )}
            style={{
              backgroundSize: `${100 / columnCount}% 100%`,
            }}
          >
            {creatorSessions.map((session) => {
              const start = clamp(session.startIndex, 0, columnCount - 1)
              const end = clamp(session.endIndex, start, columnCount - 1)
              const visibleStart = Math.max(start, viewport?.start ?? start)
              const visibleEnd = Math.min(
                end + 1,
                viewport ? viewport.start + viewport.count : end + 1
              )
              const left = (visibleStart / columnCount) * 100
              const width =
                (Math.max(0, visibleEnd - visibleStart) / columnCount) * 100

              return (
                <FlowSession
                  key={session.id}
                  session={session}
                  continuation={flowContinuation(
                    session,
                    compact && !onSessionsChange,
                    start,
                    visibleStart,
                    visibleEnd,
                    continuationFade
                  )}
                  onSessionsChange={onSessionsChange}
                  onSessionSelect={onSessionSelect}
                  compact={compact}
                  left={left}
                  width={width}
                  beginDrag={beginDrag}
                  moveDrag={moveDrag}
                  endDrag={endDrag}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

function flowContinuation(
  session: CreatorFlowSession,
  readOnly: boolean,
  start: number,
  visibleStart: number,
  visibleEnd: number,
  continuationFade: number
) {
  if (!readOnly) return {}
  const before = Boolean(session.continuesBefore || visibleStart > start)
  const after = visibleEnd < session.endIndex + 1
  const continuing = before || after
  const fade = Math.min(
    50,
    (100 * continuationFade) / Math.max(0.01, visibleEnd - visibleStart)
  )
  return {
    maskImage: continuing
      ? `linear-gradient(to right, ${before ? "transparent" : "#000"}, #000 ${before ? fade : 0}%, #000 ${after ? 100 - fade : 100}%, ${after ? "transparent" : "#000"})`
      : undefined,
    className: cn(
      before && "rounded-l-none border-l-0",
      after && "rounded-r-none border-r-0",
      continuing &&
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
    ),
  }
}

function FlowSession({
  continuation,
  session,
  onSessionsChange,
  onSessionSelect,
  compact,
  left,
  width,
  beginDrag,
  moveDrag,
  endDrag,
}: {
  continuation: ReturnType<typeof flowContinuation>
  session: CreatorFlowSession
  onSessionsChange: ((sessions: CreatorFlowSession[]) => void) | undefined
  onSessionSelect: ((session: CreatorFlowSession) => void) | undefined
  compact: boolean
  left: number
  width: number
  beginDrag: (
    event: React.PointerEvent,
    session: CreatorFlowSession,
    mode: DragState["mode"]
  ) => void
  moveDrag: (event: React.PointerEvent) => void
  endDrag: (event: React.PointerEvent) => void
}): React.JSX.Element {
  const interactive = onSessionsChange || onSessionSelect
  const className = cn(
    "absolute grid items-center rounded-lg border text-left text-xs font-medium",
    compact ? "top-1 bottom-1 min-w-0" : "top-2 bottom-2 min-w-12",
    toneClasses[session.tone ?? "success"],
    onSessionsChange
      ? "cursor-grab grid-cols-[0.75rem_minmax(0,1fr)_0.75rem] px-1 active:cursor-grabbing"
      : "px-2",
    interactive &&
      "transition-[filter] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    continuation.className
  )
  const style = {
    left: `${left}%`,
    width: `${width}%`,
    maskImage: continuation.maskImage,
  }
  const label = <span className="truncate">{session.label}</span>
  if (!interactive) {
    return (
      <div hidden={width === 0} className={className} style={style}>
        {label}
      </div>
    )
  }
  const dragHandlers = onSessionsChange
    ? {
        onPointerDown: (event: React.PointerEvent) =>
          beginDrag(event, session, "move"),
        onPointerMove: moveDrag,
        onPointerUp: endDrag,
        onPointerCancel: endDrag,
      }
    : {}
  return (
    <button
      type="button"
      hidden={width === 0}
      className={className}
      style={style}
      onClick={onSessionSelect ? () => onSessionSelect(session) : undefined}
      {...dragHandlers}
    >
      {onSessionsChange ? (
        <span
          className="h-full cursor-ew-resize rounded-l-md"
          onPointerDown={(event) => {
            event.stopPropagation()
            beginDrag(event, session, "start")
          }}
        />
      ) : null}
      {label}
      {onSessionsChange ? (
        <span
          className="h-full cursor-ew-resize rounded-r-md"
          onPointerDown={(event) => {
            event.stopPropagation()
            beginDrag(event, session, "end")
          }}
        />
      ) : null}
    </button>
  )
}

function moveFlowDrag(
  event: React.PointerEvent,
  drag: DragState | null,
  columnCount: number,
  updateSession: (id: string, start: number, end: number) => void
) {
  if (!drag) return

  const deltaColumns = Math.round(
    (event.clientX - drag.pointerStartX) / drag.columnWidth
  )
  const span = drag.originalEnd - drag.originalStart
  if (drag.mode === "move") {
    const nextStart = clamp(
      drag.originalStart + deltaColumns,
      0,
      columnCount - span - 1
    )
    updateSession(drag.id, nextStart, nextStart + span)
    return
  }
  if (drag.mode === "start") {
    updateSession(
      drag.id,
      clamp(drag.originalStart + deltaColumns, 0, drag.originalEnd),
      drag.originalEnd
    )
    return
  }
  updateSession(
    drag.id,
    drag.originalStart,
    clamp(drag.originalEnd + deltaColumns, drag.originalStart, columnCount - 1)
  )
}

function beginFlowDrag(
  event: React.PointerEvent,
  session: CreatorFlowSession,
  mode: DragState["mode"],
  grid: HTMLDivElement | null,
  dragState: React.RefObject<DragState | null>,
  columnCount: number,
  onSessionsChange: ((sessions: CreatorFlowSession[]) => void) | undefined
) {
  if (!grid || !onSessionsChange) return

  const rect = grid.getBoundingClientRect()
  dragState.current = {
    id: session.id,
    mode,
    pointerStartX: event.clientX,
    originalStart: session.startIndex,
    originalEnd: session.endIndex,
    columnWidth: rect.width / columnCount,
  }
  event.currentTarget.setPointerCapture(event.pointerId)
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function dayKey(day: React.ReactNode, index: number) {
  if (typeof day === "string" || typeof day === "number") {
    return `${day}-${index}`
  }

  return `day-${index}`
}

export {
  CreatorFlowChart,
  type CreatorFlowCreator,
  type CreatorFlowSession,
  type CreatorFlowTone,
}

function useFlowInteraction(
  dayCount: number,
  sessions: CreatorFlowSession[],
  onSessionsChange: ((sessions: CreatorFlowSession[]) => void) | undefined
) {
  const gridRef = React.useRef<HTMLDivElement | null>(null)
  const dragState = React.useRef<DragState | null>(null)
  const columnCount = Math.max(1, dayCount)

  const updateSession = React.useCallback(
    (sessionId: string, startIndex: number, endIndex: number) => {
      onSessionsChange?.(
        sessions.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                startIndex: clamp(startIndex, 0, columnCount - 1),
                endIndex: clamp(endIndex, 0, columnCount - 1),
              }
            : session
        )
      )
    },
    [columnCount, onSessionsChange, sessions]
  )

  const beginDrag = (
    event: React.PointerEvent,
    session: CreatorFlowSession,
    mode: DragState["mode"]
  ) =>
    beginFlowDrag(
      event,
      session,
      mode,
      gridRef.current,
      dragState,
      columnCount,
      onSessionsChange
    )

  const moveDrag = (event: React.PointerEvent) =>
    moveFlowDrag(event, dragState.current, columnCount, updateSession)

  const endDrag = (event: React.PointerEvent) => {
    dragState.current = null
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      // The resize handles own pointer capture, while the row handles bubbling.
    }
  }

  return { gridRef, columnCount, beginDrag, moveDrag, endDrag }
}
