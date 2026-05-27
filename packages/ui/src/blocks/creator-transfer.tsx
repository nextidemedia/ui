import * as React from "react"
import { createPortal } from "react-dom"
import { ArrowRight, Plus, Search, X } from "lucide-react"

import { Input } from "@nextide/ui/components/input"
import { cn } from "@nextide/ui/lib/utils"

type CreatorTransferItem = {
  id: string
  name: string
  meta?: React.ReactNode
  avatar?: React.ReactNode
}

type CreatorTransferSide = "available" | "selected"

type CreatorTransferTarget = {
  id: string
  side: CreatorTransferSide
}

type CreatorTransferFlyer = CreatorTransferTarget & {
  source: CreatorTransferSide
  from: DOMRect
  to: DOMRect
}

type CreatorPanelResize = {
  height: number
  duration: number
}

const transferSpaceMs = 120
const transferMoveMs = 360
const transferReflowMs = 312
const transferEase = "cubic-bezier(0.76, 0, 0.24, 1)"

function CreatorTransfer({
  creators,
  selectedIds,
  onSelectedIdsChange,
  availableTitle = "Available creators",
  selectedTitle = "Added creators",
  className,
  ...props
}: React.ComponentProps<"section"> & {
  creators: CreatorTransferItem[]
  selectedIds: string[]
  onSelectedIdsChange: (ids: string[]) => void
  availableTitle?: React.ReactNode
  selectedTitle?: React.ReactNode
}) {
  const [availableQuery, setAvailableQuery] = React.useState("")
  const [selectedQuery, setSelectedQuery] = React.useState("")
  const [availableIds, setAvailableIds] = React.useReducer(
    creatorIdsReducer,
    { creators, selectedIds },
    ({ creators, selectedIds }) =>
      sortCreatorIds(availableIdsFor(creators, selectedIds), creators)
  )
  const [addedIds, setAddedIds] = React.useReducer(
    creatorIdsReducer,
    selectedIds
  )
  const [motionLocked, setMotionLocked] = React.useState(false)
  const [transferTarget, setTransferTarget] =
    React.useState<CreatorTransferTarget | null>(null)
  const [transferFlyer, setTransferFlyer] =
    React.useState<CreatorTransferFlyer | null>(null)
  const availablePanelRef = React.useRef<HTMLElement | null>(null)
  const addedPanelRef = React.useRef<HTMLElement | null>(null)
  const availableRefs = React.useRef<Record<string, HTMLButtonElement | null>>(
    {}
  )
  const addedRefs = React.useRef<Record<string, HTMLButtonElement | null>>({})
  const flyerRef = React.useRef<HTMLDivElement | null>(null)
  const availableReflow = React.useRef<Map<string, DOMRect> | null>(null)
  const addedReflow = React.useRef<Map<string, DOMRect> | null>(null)
  const availableResize = React.useRef<CreatorPanelResize | null>(null)
  const addedResize = React.useRef<CreatorPanelResize | null>(null)
  const transferTimers = React.useRef<number[]>([])
  const resizeTimers = React.useRef<Record<CreatorTransferSide, number | null>>(
    { available: null, selected: null }
  )
  const creatorIds = React.useMemo(
    () => new Set(creators.map((creator) => creator.id)),
    [creators]
  )
  const creatorById = React.useMemo(
    () => new Map(creators.map((creator) => [creator.id, creator])),
    [creators]
  )
  const visibleAvailableIds = React.useMemo(
    () => filterCreatorIds(availableIds, creatorById, availableQuery),
    [availableIds, availableQuery, creatorById]
  )
  const visibleAddedIds = React.useMemo(
    () => filterCreatorIds(addedIds, creatorById, selectedQuery),
    [addedIds, creatorById, selectedQuery]
  )

  const clearTransferTimers = React.useCallback(() => {
    transferTimers.current.forEach((timer) => window.clearTimeout(timer))
    transferTimers.current = []
  }, [])

  const clearResizeTimer = React.useCallback((side: CreatorTransferSide) => {
    const timer = resizeTimers.current[side]
    if (timer) {
      window.clearTimeout(timer)
      resizeTimers.current[side] = null
    }
  }, [])

  const queueTransferTimer = React.useCallback(
    (callback: () => void, delay: number) => {
      const timer = window.setTimeout(callback, delay)
      transferTimers.current.push(timer)
    },
    []
  )

  const captureRows = (
    ids: string[],
    refs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>
  ) => {
    const rects = new Map<string, DOMRect>()
    ids.forEach((id) => {
      const row = refs.current[id]
      if (row) {
        rects.set(id, row.getBoundingClientRect())
      }
    })
    return rects
  }

  const capturePanelResize = (
    side: CreatorTransferSide,
    duration: number
  ) => {
    const node =
      side === "available" ? availablePanelRef.current : addedPanelRef.current
    const resizeRef = side === "available" ? availableResize : addedResize
    if (node) {
      resizeRef.current = {
        height: node.getBoundingClientRect().height,
        duration,
      }
    }
  }

  const animatePanelResize = React.useCallback(
    (
      side: CreatorTransferSide,
      ref: React.MutableRefObject<HTMLElement | null>,
      resizeRef: React.MutableRefObject<CreatorPanelResize | null>
    ) => {
      const node = ref.current
      const resize = resizeRef.current
      resizeRef.current = null
      if (!node || !resize) return

      const nextHeight = node.getBoundingClientRect().height
      if (Math.abs(resize.height - nextHeight) < 0.5) return

      clearResizeTimer(side)
      const originalStyle = node.getAttribute("style") ?? ""
      node.setAttribute(
        "style",
        mergeInlineStyle(originalStyle, {
          transition: "none",
          height: `${resize.height}px`,
        })
      )
      void node.offsetHeight
      node.setAttribute(
        "style",
        mergeInlineStyle(originalStyle, {
          transition: `height ${resize.duration}ms ${transferEase}`,
          height: `${nextHeight}px`,
        })
      )

      resizeTimers.current[side] = window.setTimeout(() => {
        restoreInlineStyle(node, originalStyle)
        resizeTimers.current[side] = null
      }, resize.duration)
    },
    [clearResizeTimer]
  )

  const animateRows = (
    ids: string[],
    refs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>,
    previousRects: Map<string, DOMRect> | null
  ) => {
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

  const startFlyer = (
    id: string,
    source: CreatorTransferSide,
    target: CreatorTransferSide
  ) => {
    const sourceRow =
      (source === "available" ? availableRefs : addedRefs).current[id]
    const targetRow =
      (target === "available" ? availableRefs : addedRefs).current[id]
    if (!sourceRow || !targetRow) return false

    setTransferFlyer({
      id,
      source,
      side: target,
      from: sourceRow.getBoundingClientRect(),
      to: targetRow.getBoundingClientRect(),
    })
    return true
  }

  const completeTransfer = (
    nextAvailableIds: string[],
    nextAddedIds: string[],
    collapseSide: CreatorTransferSide
  ) => {
    capturePanelResize(collapseSide, transferReflowMs)

    if (collapseSide === "available") {
      availableReflow.current = captureRows(visibleAvailableIds, availableRefs)
      setAvailableIds(nextAvailableIds)
    } else {
      addedReflow.current = captureRows(visibleAddedIds, addedRefs)
      setAddedIds(nextAddedIds)
    }

    setTransferTarget(null)
    setTransferFlyer(null)
    setMotionLocked(false)
    onSelectedIdsChange(nextAddedIds)
  }

  const transferCreator = (id: string, direction: "add" | "remove") => {
    if (motionLocked) return

    const source: CreatorTransferSide =
      direction === "add" ? "available" : "selected"
    const target: CreatorTransferSide =
      direction === "add" ? "selected" : "available"
    const nextAddedIds: string[] =
      direction === "add"
        ? [...addedIds, id]
        : addedIds.filter((creatorId) => creatorId !== id)
    const nextAvailableIds: string[] =
      direction === "add"
        ? availableIds.filter((creatorId) => creatorId !== id)
        : sortCreatorIds([...availableIds, id], creators)

    setMotionLocked(true)
    setTransferTarget({ id, side: target })
    capturePanelResize(
      target,
      target === "available" ? transferReflowMs : transferSpaceMs
    )

    if (target === "selected") {
      addedReflow.current = captureRows(visibleAddedIds, addedRefs)
      setAddedIds(nextAddedIds)
    } else {
      availableReflow.current = captureRows(visibleAvailableIds, availableRefs)
      setAvailableIds(nextAvailableIds)
    }

    queueTransferTimer(() => {
      const didStart = startFlyer(id, source, target)
      queueTransferTimer(() => {
        completeTransfer(nextAvailableIds, nextAddedIds, source)
      }, didStart ? transferMoveMs : 0)
    }, transferSpaceMs)
  }

  React.useEffect(() => {
    if (motionLocked) return

    const syncTimer = window.setTimeout(() => {
      setAddedIds(selectedIds.filter((id) => creatorIds.has(id)))
      setAvailableIds(
        sortCreatorIds(availableIdsFor(creators, selectedIds), creators)
      )
    }, 0)

    return () => window.clearTimeout(syncTimer)
  }, [creatorIds, creators, motionLocked, selectedIds])

  React.useEffect(
    () => () => {
      clearTransferTimers()
      clearResizeTimer("available")
      clearResizeTimer("selected")
    },
    [clearResizeTimer, clearTransferTimers]
  )

  React.useLayoutEffect(() => {
    animateRows(visibleAvailableIds, availableRefs, availableReflow.current)
    animatePanelResize("available", availablePanelRef, availableResize)
    availableReflow.current = null
  }, [animatePanelResize, visibleAvailableIds])

  React.useLayoutEffect(() => {
    animateRows(visibleAddedIds, addedRefs, addedReflow.current)
    animatePanelResize("selected", addedPanelRef, addedResize)
    addedReflow.current = null
  }, [animatePanelResize, visibleAddedIds])

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
  }, [transferFlyer])

  const flyerCreator = transferFlyer
    ? creatorById.get(transferFlyer.id)
    : null
  const flyerStyle = transferFlyer
    ? ({
        left: `${transferFlyer.from.left}px`,
        top: `${transferFlyer.from.top}px`,
        width: `${transferFlyer.from.width}px`,
        height: `${transferFlyer.from.height}px`,
      } satisfies React.CSSProperties)
    : undefined

  return (
    <section
      data-slot="creator-transfer"
      className={cn(
        "grid gap-4 lg:grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)]",
        className
      )}
      {...props}
    >
      <CreatorTransferPanel
        panelRef={availablePanelRef}
        title={availableTitle}
        query={availableQuery}
        onQueryChange={setAvailableQuery}
        emptyLabel="No available creators."
        items={visibleAvailableIds}
        itemById={creatorById}
        refs={availableRefs}
        locked={motionLocked}
        transferTarget={transferTarget}
        transferFlyer={transferFlyer}
        side="available"
        action="add"
        onTransfer={transferCreator}
      />
      <div className="hidden justify-center pt-24 lg:flex" aria-hidden="true">
        <span className="grid size-11 place-items-center rounded-xl border border-nextide-line bg-nextide-tide text-background shadow-[0_0_24px_rgb(30_228_188/0.2)]">
          <ArrowRight className="size-5" />
        </span>
      </div>
      <CreatorTransferPanel
        panelRef={addedPanelRef}
        title={
          <>
            {selectedTitle} ({addedIds.length})
          </>
        }
        query={selectedQuery}
        onQueryChange={setSelectedQuery}
        emptyLabel="Add creators from the left."
        items={visibleAddedIds}
        itemById={creatorById}
        refs={addedRefs}
        locked={motionLocked}
        transferTarget={transferTarget}
        transferFlyer={transferFlyer}
        side="selected"
        action="remove"
        onTransfer={transferCreator}
      />
      {transferFlyer && flyerCreator && typeof document !== "undefined"
        ? createPortal(
            <div
              aria-hidden="true"
              className="fixed z-[1001] pointer-events-none will-change-transform"
              ref={flyerRef}
              style={flyerStyle}
            >
              <CreatorTransferRow
                creator={flyerCreator}
                action={transferFlyer.side === "selected" ? "remove" : "add"}
                className="h-full shadow-[0_18px_42px_rgb(0_0_0/0.42),0_0_22px_rgb(30_228_188/0.18)]"
              />
            </div>,
            document.body
          )
        : null}
    </section>
  )
}

function CreatorTransferPanel({
  panelRef,
  title,
  query,
  onQueryChange,
  emptyLabel,
  items,
  itemById,
  refs,
  locked,
  transferTarget,
  transferFlyer,
  side,
  action,
  onTransfer,
}: {
  panelRef: React.RefObject<HTMLElement | null>
    title: React.ReactNode
    query: string
    onQueryChange: (value: string) => void
    emptyLabel: React.ReactNode
    items: string[]
    itemById: Map<string, CreatorTransferItem>
    refs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>
    locked: boolean
    transferTarget: CreatorTransferTarget | null
    transferFlyer: CreatorTransferFlyer | null
    side: CreatorTransferSide
    action: "add" | "remove"
    onTransfer: (id: string, direction: "add" | "remove") => void
}) {
  const searchId = React.useId()

  return (
    <section
      ref={panelRef}
      className="grid content-start gap-3 overflow-hidden rounded-lg border border-nextide-line bg-background/20 p-3 will-change-[height]"
    >
      <h3 className="text-sm">{title}</h3>
      <label
        htmlFor={searchId}
        className="grid h-10 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-full border border-nextide-line bg-nextide-panel px-3 text-nextide-tide"
      >
        <Search className="size-4" />
        <Input
          id={searchId}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search creators..."
          className="h-auto border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
        />
      </label>
      <div className={cn("grid gap-2", locked && "pointer-events-none")}>
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-nextide-line px-3 py-4 text-sm text-muted-foreground">
            {emptyLabel}
          </div>
        ) : null}
        {items.map((id) => {
          const creator = itemById.get(id)
          if (!creator) return null
          const isPlaceholder =
            transferTarget?.side === side && transferTarget.id === id
          const isSource =
            transferFlyer?.source === side && transferFlyer.id === id

          return (
            <button
              key={id}
              ref={(node) => {
                if (node) {
                  refs.current[id] = node
                } else {
                  delete refs.current[id]
                }
              }}
              type="button"
              className={cn(
                "will-change-transform",
                (isPlaceholder || isSource) && "pointer-events-none opacity-0"
              )}
              onClick={() => onTransfer(id, action)}
            >
              <CreatorTransferRow creator={creator} action={action} />
            </button>
          )
        })}
      </div>
    </section>
  )
}

function CreatorTransferRow({
  creator,
  action,
  className,
}: {
  creator: CreatorTransferItem
  action: "add" | "remove"
  className?: string
}) {
  return (
    <span
      className={cn(
        "grid h-[3.25rem] w-full grid-cols-[2.125rem_minmax(0,1fr)_1.875rem] items-center gap-3 rounded-lg border border-nextide-line bg-nextide-panel px-3 text-left transition-[background-color,border-color] hover:border-nextide-tide/45 hover:bg-nextide-panel-strong",
        action === "remove" &&
          "border-nextide-tide/45 bg-nextide-tide/10 text-nextide-tide",
        className
      )}
    >
      <span className="grid size-[2.125rem] place-items-center rounded-full bg-nextide-tide text-xs font-bold text-background">
        {creator.avatar ?? initials(creator.name)}
      </span>
      <span className="grid min-w-0 gap-0.5">
        <strong className="truncate text-sm">{creator.name}</strong>
        {creator.meta ? (
          <small className="truncate text-xs text-muted-foreground">
            {creator.meta}
          </small>
        ) : null}
      </span>
      <span
        className={cn(
          "grid size-7 place-items-center rounded-md",
          action === "add"
            ? "bg-nextide-tide/10 text-nextide-tide"
            : "text-muted-foreground"
        )}
      >
        {action === "add" ? <Plus className="size-4" /> : <X className="size-4" />}
      </span>
    </span>
  )
}

function filterCreatorIds(
  ids: string[],
  creators: Map<string, CreatorTransferItem>,
  query: string
) {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return ids
  return ids.filter((id) =>
    creators.get(id)?.name.toLowerCase().includes(normalizedQuery)
  )
}

function sortCreatorIds(ids: string[], creators: CreatorTransferItem[]) {
  const order = new Map(creators.map((creator, index) => [creator.id, index]))
  const sortedIds = [...ids]
  sortedIds.sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0))
  return sortedIds
}

function creatorIdsReducer(current: string[], next: string[]) {
  return sameStringArray(current, next) ? current : next
}

function sameStringArray(left: string[], right: string[]) {
  if (left.length !== right.length) return false

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false
  }

  return true
}

function availableIdsFor(creators: CreatorTransferItem[], selectedIds: string[]) {
  const selected = new Set(selectedIds)
  const ids: string[] = []

  creators.forEach((creator) => {
    if (!selected.has(creator.id)) {
      ids.push(creator.id)
    }
  })

  return ids
}

function initials(name: string) {
  let result = ""

  for (const part of name.split(/\s+/)) {
    if (!part) continue
    result += part[0]
    if (result.length >= 2) break
  }

  return result.toUpperCase()
}

function mergeInlineStyle(
  originalStyle: string,
  styles: Record<string, string>
) {
  const suffix = Object.entries(styles)
    .map(([property, value]) => `${property}: ${value}`)
    .join("; ")

  return originalStyle ? `${originalStyle}; ${suffix}` : suffix
}

function restoreInlineStyle(node: HTMLElement, originalStyle: string) {
  if (originalStyle) {
    node.setAttribute("style", originalStyle)
    return
  }

  node.removeAttribute("style")
}

export { CreatorTransfer, type CreatorTransferItem }
