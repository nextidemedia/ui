import * as React from "react"
import { Check, Video } from "lucide-react"

import {
  CreatorScopePanel,
  type CreatorScopeItem,
} from "@nextide/ui/blocks/creator-scope-panel"
import { Empty, EmptyDescription } from "@nextide/ui/components/empty"
import { StatusBadge } from "@nextide/ui/components/status-badge"
import { useStreamFilterMotion } from "./stream-selector-motion.js"
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
  disabled?: boolean
}

type StreamSelectorCreatorScopeProps = Pick<
  React.ComponentProps<typeof CreatorScopePanel>,
  "beforeHeader" | "children" | "getAction" | "title" | "allLabel"
>

function StreamSelector({
  creators,
  streams,
  selectedIds,
  onSelectedIdsChange,
  title = "Creator filter",
  creatorScopeProps,
  emptyLabel = "No streams in this view.",
  className,
  ...props
}: React.ComponentProps<"section"> & {
  creators: CreatorScopeItem[]
  streams: StreamSelectorItem[]
  selectedIds: string[]
  onSelectedIdsChange: (ids: string[]) => void
  title?: React.ReactNode
  creatorScopeProps?: StreamSelectorCreatorScopeProps
  emptyLabel?: React.ReactNode
}) {
  const {
    activeCreatorId,
    renderedStreams,
    enteringStreamIds,
    motionLocked,
    setRowRef,
    listRef,
    onWheel,
    changeCreatorFilter,
  } = useStreamFilterMotion(creators, streams)
  const selectedIdSet = React.useMemo(() => new Set(selectedIds), [selectedIds])

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
        {...creatorScopeProps}
      />
      <div
        ref={listRef}
        onWheel={onWheel}
        className={cn(
          "nextide-contained-scroll nextide-scrollbar-none grid max-h-[32rem] min-h-0 content-start gap-2 overflow-y-auto pr-1",
          motionLocked && "pointer-events-none"
        )}
        aria-busy={motionLocked}
      >
        {renderedStreams.length === 0 ? (
          <Empty className="border border-nextide-line px-4 py-8">
            <EmptyDescription>{emptyLabel}</EmptyDescription>
          </Empty>
        ) : null}
        {renderedStreams.map((stream) => (
          <StreamRow
            key={stream.id}
            stream={stream}
            selected={selectedIdSet.has(stream.id)}
            entering={enteringStreamIds.has(stream.id)}
            setRowRef={setRowRef}
            selectedIds={selectedIds}
            onSelectedIdsChange={onSelectedIdsChange}
          />
        ))}
      </div>
    </section>
  )
}

function StreamRow({
  stream,
  selected,
  entering,
  setRowRef,
  selectedIds,
  onSelectedIdsChange,
}: {
  stream: StreamSelectorItem
  selected: boolean
  entering: boolean
  setRowRef: (id: string, node: HTMLButtonElement | null) => void
  selectedIds: string[]
  onSelectedIdsChange: (ids: string[]) => void
}) {
  return (
    <button
      type="button"
      disabled={stream.disabled}
      aria-pressed={selected}
      ref={(node) => setRowRef(stream.id, node)}
      className={cn(
        "grid min-h-[4.9rem] w-full min-w-0 grid-cols-[5.5rem_minmax(0,1fr)_7rem_auto_1.75rem] items-center gap-3 rounded-lg border border-nextide-line bg-nextide-panel px-3 py-2 text-left transition-[background-color,border-color,box-shadow]",
        selected &&
          "border-nextide-tide/55 bg-nextide-tide/10 shadow-[0_0_24px_rgb(30_228_188/0.13)]",
        "disabled:cursor-not-allowed disabled:opacity-45"
      )}
      style={
        entering
          ? {
              opacity: 0,
              transform: "translate3d(108%, 0, 0) scale(0.985)",
            }
          : undefined
      }
      onClick={() =>
        onSelectedIdsChange(
          selected
            ? selectedIds.filter((id) => id !== stream.id)
            : [...selectedIds, stream.id]
        )
      }
    >
      <StreamRowContents stream={stream} selected={selected} />
    </button>
  )
}

function StreamRowContents({
  stream,
  selected,
}: {
  stream: StreamSelectorItem
  selected: boolean
}) {
  return (
    <>
      <span
        className="grid h-14 place-items-center rounded-md bg-nextide-panel-strong text-nextide-tide"
        style={stream.thumbnail ? { background: stream.thumbnail } : undefined}
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
    </>
  )
}

export {
  StreamSelector,
  type StreamSelectorCreatorScopeProps,
  type StreamSelectorItem,
  type StreamSelectorTone,
}
