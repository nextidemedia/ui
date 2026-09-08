import { ArrowRight, Plus, Search, X } from "lucide-react"
import * as React from "react"
import { createPortal } from "react-dom"

import { Empty, EmptyDescription } from "@nextide/ui/components/empty"
import { Input } from "@nextide/ui/components/input"
import { cn } from "@nextide/ui/lib/utils"

import { useCreatorTransfer } from "./creator-transfer-state.js"
import {
  type CreatorTransferFlyer,
  type CreatorTransferItem,
  type CreatorTransferProps,
  type CreatorTransferSide,
  type CreatorTransferTarget,
} from "./creator-transfer-types.js"
function CreatorTransfer({
  creators,
  selectedIds,
  onSelectedIdsChange,
  availableTitle = "Available creators",
  selectedTitle = "Added creators",
  className,
  ...props
}: CreatorTransferProps) {
  const {
    availableQuery,
    setAvailableQuery,
    selectedQuery,
    setSelectedQuery,
    addedIds,
    transferTarget,
    transferFlyer,
    creatorById,
    visibleAvailableIds,
    visibleAddedIds,
    availablePanelRef,
    addedPanelRef,
    availableRefs,
    addedRefs,
    flyerRef,
    transferCreator,
  } = useCreatorTransfer({ creators, selectedIds, onSelectedIdsChange })

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
        transferTarget={transferTarget}
        transferFlyer={transferFlyer}
        side="selected"
        action="remove"
        onTransfer={transferCreator}
      />
      <CreatorTransferOverlay
        transferFlyer={transferFlyer}
        creatorById={creatorById}
        flyerRef={flyerRef}
      />
    </section>
  )
}

function CreatorTransferOverlay({
  transferFlyer,
  creatorById,
  flyerRef,
}: {
  transferFlyer: CreatorTransferFlyer | null
  creatorById: Map<string, CreatorTransferItem>
  flyerRef: React.RefObject<HTMLDivElement | null>
}) {
  const flyerCreator = transferFlyer ? creatorById.get(transferFlyer.id) : null
  const flyerStyle = transferFlyer
    ? ({
        left: `${transferFlyer.from.left}px`,
        top: `${transferFlyer.from.top}px`,
        width: `${transferFlyer.from.width}px`,
        height: `${transferFlyer.from.height}px`,
      } satisfies React.CSSProperties)
    : undefined
  return transferFlyer && flyerCreator && typeof document !== "undefined"
    ? createPortal(
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-[1001] will-change-transform"
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
    : null
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
        className="grid h-10 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-lg border border-nextide-line bg-nextide-panel px-3 text-nextide-tide"
      >
        <Search className="size-4" />
        <Input
          id={searchId}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search creators..."
          className="h-auto border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
      </label>
      <div className="grid gap-2">
        {items.length === 0 ? (
          <Empty className="border border-nextide-line px-3 py-4">
            <EmptyDescription>{emptyLabel}</EmptyDescription>
          </Empty>
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
      <span className="grid size-[2.125rem] place-items-center rounded-full bg-nextide-tide text-xs font-medium text-background">
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
        {action === "add" ? (
          <Plus className="size-4" />
        ) : (
          <X className="size-4" />
        )}
      </span>
    </span>
  )
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

export { CreatorTransfer, type CreatorTransferItem }
