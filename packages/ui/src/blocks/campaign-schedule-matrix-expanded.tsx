import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@nextide/ui/components/dialog"

function useScheduleExpanded() {
  const [{ expanded, scrollRef }, setState] = React.useState(() => ({
    expanded: false,
    scrollRef: React.createRef<HTMLDivElement>(),
  }))
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const position = React.useRef(0)
  const restoreFocus = React.useRef(false)
  const change = (open: boolean) => {
    restoreFocus.current = !open
    position.current = scrollRef.current?.scrollLeft ?? position.current
    setState({ expanded: open, scrollRef: React.createRef<HTMLDivElement>() })
  }
  React.useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = position.current
  }, [scrollRef])
  React.useEffect(() => {
    if (expanded || !restoreFocus.current) return
    const frame = requestAnimationFrame(() => {
      triggerRef.current?.focus({ preventScroll: true })
      restoreFocus.current = false
    })
    return () => cancelAnimationFrame(frame)
  }, [expanded])
  return { expanded, change, scrollRef, triggerRef }
}
function ScheduleExpanded({
  state,
  title,
  children,
}: {
  state: ReturnType<typeof useScheduleExpanded>
  title: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Dialog open={state.expanded} onOpenChange={state.change}>
      {state.expanded ? (
        <DialogContent
          className="h-[calc(100dvh-2rem)] max-h-none max-w-none content-start overflow-y-auto"
          finalFocus={state.triggerRef}
          showCloseButton={false}
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          {children}
        </DialogContent>
      ) : (
        children
      )}
    </Dialog>
  )
}
export { ScheduleExpanded, useScheduleExpanded }
