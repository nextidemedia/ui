import * as React from "react"
import { Eraser, LockKeyhole, Scissors } from "lucide-react"
import { Button } from "@nextide/ui/components/button"
import { Surface } from "@nextide/ui/components/surface"
import { useRender } from "@base-ui/react/use-render"

function ScheduleSurface({
  rootRef,
  ref,
  ...props
}: React.ComponentProps<typeof Surface> & { rootRef: React.Ref<HTMLElement> }) {
  return useRender({
    render: <Surface />,
    ref: ref ? [rootRef, ref] : rootRef,
    props,
  })
}

type ScheduleTool = "cut" | "delete" | "lock" | null

function useScheduleTools(
  rootRef: React.RefObject<HTMLElement | null>,
  changeView: (open: boolean) => void
) {
  const [tool, setTool] = React.useState<ScheduleTool>(null)
  React.useEffect(() => {
    if (!tool) return
    const outside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setTool(null)
    }
    const escape = (event: KeyboardEvent) => {
      if (
        event.key !== "Escape" ||
        (event.target instanceof HTMLElement &&
          event.target.closest(
            'input,textarea,select,[contenteditable]:not([contenteditable="false"])'
          ))
      )
        return
      event.preventDefault()
      event.stopPropagation()
      setTool(null)
    }
    document.addEventListener("pointerdown", outside, true)
    document.addEventListener("keydown", escape, true)
    return () => {
      document.removeEventListener("pointerdown", outside, true)
      document.removeEventListener("keydown", escape, true)
    }
  }, [tool, rootRef])
  return {
    tool,
    setTool,
    expand: (open: boolean) => {
      setTool(null)
      changeView(open)
    },
  }
}

function ScheduleTools({
  tool,
  onToolChange,
  canCut,
  canDelete,
  canLock,
}: {
  tool: ScheduleTool
  onToolChange: (tool: ScheduleTool) => void
  canCut: boolean
  canDelete: boolean
  canLock: boolean
}) {
  if (!canCut && !canDelete && !canLock) return null
  return (
    <span className="inline-flex items-center gap-1">
      <span className="mr-1 text-ui-caption text-muted-foreground">Tools:</span>
      <Button
        type="button"
        variant={tool === "cut" ? "secondary" : "ghost"}
        size="icon-sm"
        aria-label="Scissors tool"
        aria-pressed={tool === "cut"}
        disabled={!canCut}
        onClick={() => onToolChange(tool === "cut" ? null : "cut")}
      >
        <Scissors />
      </Button>
      <Button
        type="button"
        variant={tool === "delete" ? "secondary" : "ghost"}
        size="icon-sm"
        aria-label="Eraser tool"
        aria-pressed={tool === "delete"}
        disabled={!canDelete}
        onClick={() => onToolChange(tool === "delete" ? null : "delete")}
      >
        <Eraser />
      </Button>
      {canLock && (
        <Button
          type="button"
          variant={tool === "lock" ? "secondary" : "ghost"}
          size="icon-sm"
          aria-label="Lock tool"
          aria-pressed={tool === "lock"}
          onClick={() => onToolChange(tool === "lock" ? null : "lock")}
        >
          <LockKeyhole />
        </Button>
      )}
    </span>
  )
}
export { ScheduleTools, ScheduleSurface, useScheduleTools }
export type { ScheduleTool }
