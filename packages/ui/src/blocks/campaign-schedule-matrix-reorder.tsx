import * as React from "react"
import { GripVertical } from "lucide-react"
import { useSchedulePointer } from "./campaign-schedule-matrix-edit.js"
import {
  clamp,
  type CampaignScheduleCreator,
} from "./campaign-schedule-matrix-model.js"

type ScheduleReorder = {
  creators: CampaignScheduleCreator[]
  onCreatorOrderChange?: (ids: string[]) => void
  onPreviewOrderChange?: (ids: string[] | null) => void
}
function useScheduleRowOrder(
  creators: CampaignScheduleCreator[],
  reorder: ScheduleReorder
) {
  const [preview, setPreview] = React.useState<{
    base: string[]
    ids: string[]
  } | null>(null)
  const active =
    preview &&
    preview.base.length === creators.length &&
    preview.base.every((id, index) => id === creators[index]?.id)
  return {
    creators: active
      ? preview.ids.map((id) => creators.find((creator) => creator.id === id)!)
      : creators,
    reorder: {
      ...reorder,
      onPreviewOrderChange: (ids: string[] | null) =>
        setPreview(
          ids ? { base: creators.map((creator) => creator.id), ids } : null
        ),
    },
  }
}
function ScheduleReorderHandle({
  creator,
  reorder,
  nameId,
}: {
  creator: CampaignScheduleCreator
  reorder: ScheduleReorder
  nameId: string
}) {
  const [position, setPosition] = React.useState<number | null>(null)
  const { start, consumeClick, cancel } = useSchedulePointer()
  const index = reorder.creators.findIndex((item) => item.id === creator.id)
  const actionId = React.useId()
  const hintId = React.useId()
  const target = (delta: number) =>
    clamp(index + delta, 0, reorder.creators.length - 1)
  const orderAt = (to: number) => {
    const ids = reorder.creators.map((item) => item.id)
    ids.splice(index, 1)
    ids.splice(to, 0, creator.id)
    return ids
  }
  const preview = (to: number) => {
    setPosition(to)
    reorder.onPreviewOrderChange?.(orderAt(to))
  }
  const commit = (to: number | null) => {
    reorder.onPreviewOrderChange?.(null)
    if (to !== null && to !== index) {
      reorder.onCreatorOrderChange?.(orderAt(to))
    }
    setPosition(null)
  }
  if (!reorder.onCreatorOrderChange) return null
  return (
    <>
      <button
        type="button"
        aria-labelledby={`${actionId} ${nameId}`}
        aria-describedby={hintId}
        aria-pressed={position !== null}
        className="-mr-1 -ml-2 grid min-h-9 w-6 shrink-0 cursor-grab touch-none place-items-center rounded-sm text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        onPointerDown={(event) =>
          start(event, {
            axis: "y",
            unit: event.currentTarget.parentElement!.getBoundingClientRect()
              .height,
            preview: (delta) => preview(target(delta)),
            finish: (delta) => commit(delta === null ? null : target(delta)),
          })
        }
        onClick={consumeClick}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault()
            commit(null)
          }
          if (event.key === "Enter") {
            event.preventDefault()
            commit(position)
          }
          if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return
          event.preventDefault()
          preview(
            clamp(
              (position ?? index) + (event.key === "ArrowUp" ? -1 : 1),
              0,
              reorder.creators.length - 1
            )
          )
        }}
        onBlur={() => {
          cancel()
          commit(null)
        }}
      >
        <span id={actionId} className="sr-only">
          Reorder
        </span>
        <GripVertical className="size-4" />
      </button>
      <span id={hintId} className="sr-only">
        Up and down arrows choose row. Enter saves. Escape cancels.
      </span>
      {position !== null && (
        <output className="absolute right-1 bottom-0 text-ui-micro text-nextide-tide">
          Row {position + 1} of {reorder.creators.length}
        </output>
      )}
    </>
  )
}
export { ScheduleReorderHandle, useScheduleRowOrder }
export type { ScheduleReorder }
