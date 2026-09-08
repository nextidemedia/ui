import * as React from "react"
import type { CreatorScopeItem } from "@nextide/ui/blocks/creator-scope-panel"
import type { StreamSelectorItem } from "./stream-selector.js"
import { useContainedScroll } from "@nextide/ui/hooks/use-contained-scroll"

const filterEase = "cubic-bezier(0.76, 0, 0.24, 1)"
const defaultFilterMotion = { exit: 220, move: 300, enter: 220 }

type MotionContext = {
  activeCreatorId: string
  sortedStreams: StreamSelectorItem[]
  renderedStreams: StreamSelectorItem[]
  motionLocked: boolean
  rowRefs: React.RefObject<Record<string, HTMLButtonElement | null>>
  listRef: React.RefObject<HTMLDivElement | null>
  filterMotion: React.RefObject<typeof defaultFilterMotion>
  reflowMotion: React.RefObject<{
    previousRects: Map<string, DOMRect>
    enteringIds: Set<string>
  } | null>
  takeReflowMotion: () => MotionContext["reflowMotion"]["current"]
  queueMotionTimer: (callback: () => void, delay: number) => void
  setActiveCreatorId: React.Dispatch<React.SetStateAction<string>>
  setMotionLocked: React.Dispatch<React.SetStateAction<boolean>>
  setEnteringStreamIds: React.Dispatch<React.SetStateAction<Set<string>>>
  setRenderedStreams: React.Dispatch<React.SetStateAction<StreamSelectorItem[]>>
}

function useStreamFilterMotion(
  creators: CreatorScopeItem[],
  streams: StreamSelectorItem[]
) {
  const [activeCreatorId, setActiveCreatorId] = React.useState("all")
  const sortedStreams = React.useMemo(() => streams, [streams])
  const [renderedStreams, setRenderedStreams] = React.useState(sortedStreams)
  const [enteringStreamIds, setEnteringStreamIds] = React.useState<Set<string>>(
    () => new Set()
  )
  const [motionLocked, setMotionLocked] = React.useState(false)
  const rowRefs = React.useRef<Record<string, HTMLButtonElement | null>>({})
  const filterMotion = React.useRef(defaultFilterMotion)
  const reflowMotion = React.useRef<{
    previousRects: Map<string, DOMRect>
    enteringIds: Set<string>
  } | null>(null)
  const { ref: listRef, onWheel } = useContainedScroll<HTMLDivElement>({
    axis: "y",
  })
  const visibleStreams = React.useMemo(
    () =>
      activeCreatorId === "all"
        ? sortedStreams
        : sortedStreams.filter(
            (stream) => stream.creatorId === activeCreatorId
          ),
    [activeCreatorId, sortedStreams]
  )

  const { clearMotionTimers, queueMotionTimer } = useMotionTimers()
  const takeReflowMotion = React.useCallback(() => {
    const motion = reflowMotion.current
    reflowMotion.current = null
    return motion
  }, [])
  const setRowRef = (id: string, node: HTMLButtonElement | null) => {
    if (node) rowRefs.current[id] = node
    else delete rowRefs.current[id]
  }

  const context = {
    activeCreatorId,
    sortedStreams,
    renderedStreams,
    motionLocked,
    rowRefs,
    listRef,
    filterMotion,
    reflowMotion,
    takeReflowMotion,
    queueMotionTimer,
    setActiveCreatorId,
    setMotionLocked,
    setEnteringStreamIds,
    setRenderedStreams,
  }
  React.useEffect(() => () => clearMotionTimers(), [clearMotionTimers])
  useStreamReflow(context)
  useStreamFilterSync({
    activeCreatorId,
    creators,
    motionLocked,
    renderedStreams,
    visibleStreams,
    setRenderedStreams,
    setActiveCreatorId,
  })
  return {
    activeCreatorId,
    renderedStreams,
    enteringStreamIds,
    motionLocked,
    setRowRef,
    listRef,
    onWheel,
    changeCreatorFilter: (nextCreatorId: string) =>
      changeCreatorFilter(nextCreatorId, context),
  }
}

function changeCreatorFilter(
  nextCreatorId: string,
  {
    motionLocked,
    activeCreatorId,
    filterMotion,
    listRef,
    sortedStreams,
    renderedStreams,
    rowRefs,
    setActiveCreatorId,
    setMotionLocked,
    queueMotionTimer,
    reflowMotion,
    setEnteringStreamIds,
    setRenderedStreams,
  }: MotionContext
) {
  if (motionLocked || nextCreatorId === activeCreatorId) return

  filterMotion.current = readFilterMotion(listRef.current)
  const motion = filterMotion.current
  const stateScale = motion.exit / defaultFilterMotion.exit

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
        delay: Math.min(index * 17, 50) * stateScale,
        duration: motion.exit,
        easing: filterEase,
        fill: "forwards",
      }
    )
  })

  const exitDelay =
    exitingIds.size > 0
      ? motion.exit + Math.min((exitingIds.size - 1) * 17, 50) * stateScale
      : 0
  queueMotionTimer(() => {
    reflowMotion.current = { previousRects, enteringIds }
    setEnteringStreamIds(enteringIds)
    setRenderedStreams(nextStreams)
  }, exitDelay)
}

function useStreamReflow({
  takeReflowMotion,
  filterMotion,
  renderedStreams,
  rowRefs,
  queueMotionTimer,
  setEnteringStreamIds,
  setMotionLocked,
}: MotionContext) {
  React.useLayoutEffect(() => {
    const motion = takeReflowMotion()
    if (!motion) return
    const durations = filterMotion.current
    const stateScale = durations.enter / defaultFilterMotion.enter

    const survivors = renderedStreams.filter(
      (stream) =>
        motion.previousRects.has(stream.id) &&
        !motion.enteringIds.has(stream.id)
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
            {
              transform: `translate3d(${deltaX}px, ${deltaY}px, 0)`,
              opacity: 1,
            },
            { transform: "translate3d(0, 0, 0)", opacity: 1 },
          ],
          { duration: durations.move, easing: filterEase }
        )
      }
    })

    queueMotionTimer(
      () => {
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
              delay: Math.min(index * 20, 61) * stateScale,
              duration: durations.enter,
              easing: filterEase,
              fill: "both",
            }
          )
        })

        const enterDelay =
          enteringIds.length > 0
            ? durations.enter +
              Math.min((enteringIds.length - 1) * 20, 61) * stateScale
            : 0
        queueMotionTimer(() => {
          setEnteringStreamIds(new Set())
          setMotionLocked(false)
        }, enterDelay)
      },
      survivors.length > 0 ? durations.move : 0
    )
  }, [
    queueMotionTimer,
    renderedStreams,
    takeReflowMotion,
    filterMotion,
    rowRefs,
    setEnteringStreamIds,
    setMotionLocked,
  ])
}

function useStreamFilterSync({
  activeCreatorId,
  creators,
  motionLocked,
  renderedStreams,
  visibleStreams,
  setRenderedStreams,
  setActiveCreatorId,
}: Pick<
  MotionContext,
  | "activeCreatorId"
  | "motionLocked"
  | "renderedStreams"
  | "setRenderedStreams"
  | "setActiveCreatorId"
> & {
  creators: CreatorScopeItem[]
  visibleStreams: StreamSelectorItem[]
}) {
  React.useEffect(() => {
    if (motionLocked) return

    const renderedIds = renderedStreams.map((stream) => stream.id).join("|")
    const visibleIds = visibleStreams.map((stream) => stream.id).join("|")
    if (renderedIds === visibleIds) return

    const syncTimer = window.setTimeout(() => {
      setRenderedStreams(visibleStreams)
    }, 0)

    return () => window.clearTimeout(syncTimer)
  }, [motionLocked, renderedStreams, visibleStreams, setRenderedStreams])

  React.useEffect(() => {
    if (activeCreatorId === "all") return
    if (creators.some((creator) => creator.id === activeCreatorId)) return

    const syncTimer = window.setTimeout(() => {
      setActiveCreatorId("all")
    }, 0)

    return () => window.clearTimeout(syncTimer)
  }, [activeCreatorId, creators, setActiveCreatorId])
}

function readFilterMotion(node: HTMLElement | null) {
  if (!node || typeof window === "undefined") return defaultFilterMotion

  const styles = window.getComputedStyle(node)
  return {
    exit: readCssTime(
      styles.getPropertyValue("--nextide-motion-state"),
      defaultFilterMotion.exit
    ),
    move: readCssTime(
      styles.getPropertyValue("--nextide-motion-layout"),
      defaultFilterMotion.move
    ),
    enter: readCssTime(
      styles.getPropertyValue("--nextide-motion-state"),
      defaultFilterMotion.enter
    ),
  }
}

function readCssTime(value: string, fallback: number) {
  const parsed = Number.parseFloat(value)
  if (!Number.isFinite(parsed)) return fallback
  return value.trim().endsWith("s") && !value.trim().endsWith("ms")
    ? parsed * 1000
    : parsed
}

export { useStreamFilterMotion }

function useMotionTimers() {
  const motionTimers = React.useRef<number[]>([])
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

  return { clearMotionTimers, queueMotionTimer }
}
