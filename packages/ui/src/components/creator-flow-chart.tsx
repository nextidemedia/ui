import * as React from "react"

import { useContainedScroll } from "@nextide/ui/hooks/use-contained-scroll"
import { cn } from "@nextide/ui/lib/utils"

type CreatorFlowTone = "success" | "processing" | "warning" | "danger"

type CreatorFlowCreator = {
  id: string
  name: string
  meta?: React.ReactNode
}

type CreatorFlowSession = {
  id: string
  creatorId: string
  label: React.ReactNode
  startIndex: number
  endIndex: number
  tone?: CreatorFlowTone
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

function CreatorFlowChart({
  creators,
  days,
  sessions,
  onSessionsChange,
  className,
  ...props
}: React.ComponentProps<"section"> & {
  creators: CreatorFlowCreator[]
  days: React.ReactNode[]
  sessions: CreatorFlowSession[]
  onSessionsChange?: (sessions: CreatorFlowSession[]) => void
}) {
  const gridRef = React.useRef<HTMLDivElement | null>(null)
  const dragState = React.useRef<DragState | null>(null)
  const { ref: scrollRef, onWheel } =
    useContainedScroll<HTMLDivElement>({ axis: "x" })
  const columnCount = Math.max(1, days.length)

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
  ) => {
    const grid = gridRef.current
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

  const moveDrag = (event: React.PointerEvent) => {
    const drag = dragState.current
    if (!drag) return

    const deltaColumns = Math.round(
      (event.clientX - drag.pointerStartX) / drag.columnWidth
    )
    const span = drag.originalEnd - drag.originalStart
    if (drag.mode === "move") {
      const nextStart = clamp(drag.originalStart + deltaColumns, 0, columnCount - span - 1)
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

  const endDrag = (event: React.PointerEvent) => {
    dragState.current = null
    try {
      event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      // The resize handles own pointer capture, while the row handles bubbling.
    }
  }

  return (
    <section
      data-slot="creator-flow-chart"
      className={cn(
        "grid gap-3 rounded-lg border border-nextide-line bg-nextide-panel p-3",
        className
      )}
      {...props}
    >
      <div className="grid gap-1">
        <strong className="text-sm">Creator flow chart</strong>
        <span className="text-xs text-muted-foreground">
          Drag a block to move a creator session. Drag an edge to resize its
          date range.
        </span>
      </div>
      <div
        ref={scrollRef}
        onWheel={onWheel}
        className="nextide-contained-scroll nextide-scrollbar-none overflow-x-auto"
      >
        <div className="grid min-w-[48rem] grid-cols-[10rem_minmax(0,1fr)] gap-3">
          <div className="pt-9">
            {creators.map((creator) => (
              <div
                key={creator.id}
                className="grid h-14 content-center border-t border-nextide-line/70"
              >
                <strong className="truncate text-xs">{creator.name}</strong>
                {creator.meta ? (
                  <small className="truncate text-[0.68rem] text-muted-foreground">
                    {creator.meta}
                  </small>
                ) : null}
              </div>
            ))}
          </div>
          <div className="grid gap-0">
            <div
              className="grid h-9 border-b border-nextide-line text-center text-[0.68rem] font-semibold text-muted-foreground"
              style={{
                gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
              }}
            >
              {days.map((day, index) => (
                <span
                  key={dayKey(day, index)}
                  className="grid place-items-center border-l border-nextide-line/60 first:border-l-0"
                >
                  {day}
                </span>
              ))}
            </div>
            <div ref={gridRef} className="grid">
              {creators.map((creator) => {
                const creatorSessions = sessions.filter(
                  (session) => session.creatorId === creator.id
                )
                return (
                  <div
                    key={creator.id}
                    className="relative h-14 border-t border-nextide-line/70 bg-[linear-gradient(90deg,rgb(255_255_255/0.035)_1px,transparent_1px)]"
                    style={{
                      backgroundSize: `${100 / columnCount}% 100%`,
                    }}
                  >
                    {creatorSessions.map((session) => {
                      const start = clamp(session.startIndex, 0, columnCount - 1)
                      const end = clamp(session.endIndex, start, columnCount - 1)
                      const left = (start / columnCount) * 100
                      const width = ((end - start + 1) / columnCount) * 100

                      return (
                        <button
                          key={session.id}
                          type="button"
                          className={cn(
                            "absolute top-2 bottom-2 grid min-w-12 grid-cols-[0.75rem_minmax(0,1fr)_0.75rem] items-center rounded-lg border px-1 text-left text-xs font-semibold shadow-[0_0_24px_rgb(30_228_188/0.12)] transition-[filter] hover:brightness-110",
                            toneClasses[session.tone ?? "success"],
                            onSessionsChange && "cursor-grab active:cursor-grabbing"
                          )}
                          style={{ left: `${left}%`, width: `${width}%` }}
                          onPointerDown={(event) => beginDrag(event, session, "move")}
                          onPointerMove={moveDrag}
                          onPointerUp={endDrag}
                          onPointerCancel={endDrag}
                        >
                          <span
                            className="h-full cursor-ew-resize rounded-l-md"
                            onPointerDown={(event) => {
                              event.stopPropagation()
                              beginDrag(event, session, "start")
                            }}
                          />
                          <span className="truncate px-1">{session.label}</span>
                          <span
                            className="h-full cursor-ew-resize rounded-r-md"
                            onPointerDown={(event) => {
                              event.stopPropagation()
                              beginDrag(event, session, "end")
                            }}
                          />
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
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
