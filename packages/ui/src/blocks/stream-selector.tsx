import * as React from "react"
import { Check, Video } from "lucide-react"

import {
  CreatorScopePanel,
  type CreatorScopeItem,
} from "@nextide/ui/blocks/creator-scope-panel"
import { StatusBadge } from "@nextide/ui/components/status-badge"
import { useContainedScroll } from "@nextide/ui/hooks/use-contained-scroll"
import { cn } from "@nextide/ui/lib/utils"

type StreamSelectorTone = "success" | "processing" | "warning" | "danger"

type StreamSelectorItem = {
  id: string
  creatorId: string
  creatorName: string
  title: React.ReactNode
  meta?: React.ReactNode
  dateLabel?: React.ReactNode
  durationLabel?: React.ReactNode
  thumbnail?: string
  readinessLabel?: React.ReactNode
  readinessTone?: StreamSelectorTone
}

const filterEase = "cubic-bezier(0.76, 0, 0.24, 1)"
const filterExitMs = 180
const filterMoveMs = 312
const filterEnterMs = 228

function StreamSelector({
  creators,
  streams,
  selectedIds,
  onSelectedIdsChange,
  title = "Creator filter",
  emptyLabel = "No streams in this view.",
  className,
  ...props
}: React.ComponentProps<"section"> & {
  creators: CreatorScopeItem[]
  streams: StreamSelectorItem[]
  selectedIds: string[]
  onSelectedIdsChange: (ids: string[]) => void
  title?: React.ReactNode
  emptyLabel?: React.ReactNode
}) {
  const [activeCreatorId, setActiveCreatorId] = React.useState("all")
  const sortedStreams = React.useMemo(() => streams, [streams])
  const [renderedStreams, setRenderedStreams] = React.useState(sortedStreams)
  const [enteringStreamIds, setEnteringStreamIds] = React.useState<Set<string>>(
    () => new Set()
  )
  const [motionLocked, setMotionLocked] = React.useState(false)
  const rowRefs = React.useRef<Record<string, HTMLButtonElement | null>>({})
  const motionTimers = React.useRef<number[]>([])
  const reflowMotion = React.useRef<{
    previousRects: Map<string, DOMRect>
    enteringIds: Set<string>
  } | null>(null)
  const { ref: listRef, onWheel } =
    useContainedScroll<HTMLDivElement>({ axis: "y" })
  const visibleStreams = React.useMemo(
    () =>
      activeCreatorId === "all"
        ? sortedStreams
        : sortedStreams.filter((stream) => stream.creatorId === activeCreatorId),
    [activeCreatorId, sortedStreams]
  )

  const clearMotionTimers = React.useCallback(() => {
    motionTimers.current.forEach((timer) => window.clearTimeout(timer))
    motionTimers.current = []
  }, [])

  const queueMotionTimer = React.useCallback(
    (callback: () => void, delay: number) => {
      const timer = window.setTimeout(callback, delay)
      motionTimers.current.push(timer)
    },
    []
  )

  const changeCreatorFilter = (nextCreatorId: string) => {
    if (motionLocked || nextCreatorId === activeCreatorId) return

    const nextStreams =
      nextCreatorId === "all"
        ? sortedStreams
        : sortedStreams.filter((stream) => stream.creatorId === nextCreatorId)
    const previousIds = new Set(renderedStreams.map((stream) => stream.id))
    const nextIds = new Set(nextStreams.map((stream) => stream.id))
    const exitingIds = new Set(
      [...previousIds].filter((streamId) => !nextIds.has(streamId))
    )
    const enteringIds = new Set<string>()
    nextStreams.forEach((stream) => {
      if (!previousIds.has(stream.id)) {
        enteringIds.add(stream.id)
      }
    })
    const previousRects = new Map<string, DOMRect>()

    renderedStreams.forEach((stream) => {
      const row = rowRefs.current[stream.id]
      if (row) {
        row.getAnimations().forEach((animation) => animation.cancel())
        previousRects.set(stream.id, row.getBoundingClientRect())
      }
    })

    setActiveCreatorId(nextCreatorId)
    setMotionLocked(true)

    ;[...exitingIds].forEach((streamId, index) => {
      const row = rowRefs.current[streamId]
      if (!row) return

      row.animate(
        [
          { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
          { opacity: 0, transform: "translate3d(108%, 0, 0) scale(0.985)" },
        ],
        {
          delay: Math.min(index * 17, 50),
          duration: filterExitMs,
          easing: filterEase,
          fill: "forwards",
        }
      )
    })

    const exitDelay =
      exitingIds.size > 0
        ? filterExitMs + Math.min((exitingIds.size - 1) * 17, 50)
        : 0
    queueMotionTimer(() => {
      reflowMotion.current = { previousRects, enteringIds }
      setEnteringStreamIds(enteringIds)
      setRenderedStreams(nextStreams)
    }, exitDelay)
  }

  React.useEffect(() => () => clearMotionTimers(), [clearMotionTimers])

  React.useLayoutEffect(() => {
    const motion = reflowMotion.current
    if (!motion) return

    reflowMotion.current = null
    const survivors = renderedStreams.filter(
      (stream) =>
        motion.previousRects.has(stream.id) && !motion.enteringIds.has(stream.id)
    )

    survivors.forEach((stream) => {
      const row = rowRefs.current[stream.id]
      const previousRect = motion.previousRects.get(stream.id)
      if (!row || !previousRect) return

      const nextRect = row.getBoundingClientRect()
      const deltaX = previousRect.left - nextRect.left
      const deltaY = previousRect.top - nextRect.top

      if (Math.abs(deltaX) > 0.5 || Math.abs(deltaY) > 0.5) {
        row.animate(
          [
            { transform: `translate3d(${deltaX}px, ${deltaY}px, 0)`, opacity: 1 },
            { transform: "translate3d(0, 0, 0)", opacity: 1 },
          ],
          { duration: filterMoveMs, easing: filterEase }
        )
      }
    })

    queueMotionTimer(() => {
      const enteringIds = [...motion.enteringIds]
      enteringIds.forEach((streamId, index) => {
        const row = rowRefs.current[streamId]
        if (!row) return

        row.animate(
          [
            { opacity: 0, transform: "translate3d(108%, 0, 0) scale(0.985)" },
            { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
          ],
          {
            delay: Math.min(index * 20, 61),
            duration: filterEnterMs,
            easing: filterEase,
            fill: "both",
          }
        )
      })

      const enterDelay =
        enteringIds.length > 0
          ? filterEnterMs + Math.min((enteringIds.length - 1) * 20, 61)
          : 0
      queueMotionTimer(() => {
        setEnteringStreamIds(new Set())
        setMotionLocked(false)
      }, enterDelay)
    }, survivors.length > 0 ? filterMoveMs : 0)
  }, [queueMotionTimer, renderedStreams])

  React.useEffect(() => {
    if (motionLocked) return

    const renderedIds = renderedStreams.map((stream) => stream.id).join("|")
    const visibleIds = visibleStreams.map((stream) => stream.id).join("|")
    if (renderedIds === visibleIds) return

    const syncTimer = window.setTimeout(() => {
      setRenderedStreams(visibleStreams)
    }, 0)

    return () => window.clearTimeout(syncTimer)
  }, [motionLocked, renderedStreams, visibleStreams])

  React.useEffect(() => {
    if (activeCreatorId === "all") return
    if (creators.some((creator) => creator.id === activeCreatorId)) return

    const syncTimer = window.setTimeout(() => {
      setActiveCreatorId("all")
    }, 0)

    return () => window.clearTimeout(syncTimer)
  }, [activeCreatorId, creators])

  return (
    <section
      data-slot="stream-selector"
      className={cn("grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]", className)}
      {...props}
    >
      <CreatorScopePanel
        title={title}
        creators={creators}
        activeId={activeCreatorId}
        onActiveIdChange={changeCreatorFilter}
      />
      <div
        ref={listRef}
        onWheel={onWheel}
        className={cn(
          "nextide-contained-scroll grid max-h-[32rem] min-h-0 content-start gap-2 overflow-y-auto pr-1",
          motionLocked && "pointer-events-none"
        )}
        aria-busy={motionLocked}
      >
        {renderedStreams.length === 0 ? (
          <div className="rounded-lg border border-dashed border-nextide-line px-4 py-8 text-sm text-muted-foreground">
            {emptyLabel}
          </div>
        ) : null}
        {renderedStreams.map((stream) => {
          const selected = selectedIds.includes(stream.id)

          return (
            <button
              key={stream.id}
              type="button"
              ref={(node) => {
                if (node) {
                  rowRefs.current[stream.id] = node
                } else {
                  delete rowRefs.current[stream.id]
                }
              }}
              className={cn(
                "grid min-h-[4.9rem] w-full min-w-0 grid-cols-[5.5rem_minmax(0,1fr)_7rem_auto_1.75rem] items-center gap-3 rounded-lg border border-nextide-line bg-nextide-panel px-3 py-2 text-left transition-[background-color,border-color,box-shadow]",
                selected &&
                  "border-nextide-tide/55 bg-nextide-tide/10 shadow-[0_0_24px_rgb(30_228_188/0.13)]",
                enteringStreamIds.has(stream.id) &&
                  "opacity-0 translate-x-full scale-[0.985]"
              )}
              onClick={() =>
                onSelectedIdsChange(
                  selected
                    ? selectedIds.filter((id) => id !== stream.id)
                    : [...selectedIds, stream.id]
                )
              }
            >
              <span
                className="grid h-14 place-items-center rounded-md bg-nextide-panel-strong text-nextide-tide"
                style={
                  stream.thumbnail
                    ? { background: stream.thumbnail }
                    : undefined
                }
              >
                {!stream.thumbnail ? <Video className="size-5" /> : null}
              </span>
              <span className="grid min-w-0 gap-1">
                <strong className="truncate text-sm">{stream.title}</strong>
                <small className="truncate text-xs text-muted-foreground">
                  {stream.creatorName}
                  {stream.meta ? <> - {stream.meta}</> : null}
                </small>
              </span>
              <span className="grid justify-items-end gap-1 text-xs text-muted-foreground">
                {stream.dateLabel ? <span>{stream.dateLabel}</span> : null}
                {stream.durationLabel ? <small>{stream.durationLabel}</small> : null}
              </span>
              <StatusBadge tone={stream.readinessTone ?? "success"}>
                {stream.readinessLabel ?? "Ready"}
              </StatusBadge>
              <span
                className={cn(
                  "grid size-6 place-items-center rounded-md border border-nextide-line",
                  selected && "border-nextide-tide bg-nextide-tide text-background"
                )}
              >
                {selected ? <Check className="size-3.5" /> : null}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export {
  StreamSelector,
  type StreamSelectorItem,
  type StreamSelectorTone,
}
