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
}
function ScheduleReorderHandle({
  creator,
  reorder,
}: {
  creator: CampaignScheduleCreator
  reorder: ScheduleReorder
}) {
  const [position, setPosition] = React.useState<number | null>(null)
  const { start, consumeClick } = useSchedulePointer()
  const index = reorder.creators.findIndex((item) => item.id === creator.id)
  const name = typeof creator.name === "string" ? creator.name : "creator"
  const hintId = React.useId()
  const target = (delta: number) =>
    clamp(index + delta, 0, reorder.creators.length - 1)
  const commit = (to: number | null) => {
    if (to !== null && to !== index) {
      const ids = reorder.creators.map((item) => item.id)
      ids.splice(index, 1)
      ids.splice(to, 0, creator.id)
      reorder.onCreatorOrderChange?.(ids)
    }
    setPosition(null)
  }
  if (!reorder.onCreatorOrderChange) return null
  return (
    <>
      <button
        type="button"
        aria-label={`Reorder ${name}`}
        aria-describedby={hintId}
        aria-pressed={position !== null}
        className="-ml-2 grid min-h-9 w-6 shrink-0 cursor-grab touch-none place-items-center rounded-sm text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
        onPointerDown={(event) =>
          start(event, {
            axis: "y",
            unit: event.currentTarget.parentElement!.getBoundingClientRect()
              .height,
            preview: (delta) => setPosition(target(delta)),
            finish: (delta) => commit(delta === null ? null : target(delta)),
          })
        }
        onClick={() => consumeClick()}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault()
            setPosition(null)
          }
          if (event.key === "Enter") {
            event.preventDefault()
            commit(position)
          }
          if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return
          event.preventDefault()
          setPosition(
            clamp(
              (position ?? index) + (event.key === "ArrowUp" ? -1 : 1),
              0,
              reorder.creators.length - 1
            )
          )
        }}
        onBlur={() => setPosition(null)}
      >
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
export { ScheduleReorderHandle }
export type { ScheduleReorder }
