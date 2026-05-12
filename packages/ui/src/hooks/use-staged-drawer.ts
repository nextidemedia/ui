import * as React from "react"

const DEFAULT_STAGE_DURATION_MS = 260

function useStagedDrawer({
  defaultCollapsed = false,
  durationMs = DEFAULT_STAGE_DURATION_MS,
}: {
  defaultCollapsed?: boolean
  durationMs?: number
} = {}) {
  const [requestedCollapsed, setRequestedCollapsed] =
    React.useState(defaultCollapsed)
  const [collapsed, setCollapsedState] = React.useState(defaultCollapsed)
  const [drawerCollapsed, setDrawerCollapsed] = React.useState(defaultCollapsed)
  const [transitioning, setTransitioning] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const setCollapsed = React.useCallback(
    (nextCollapsed: boolean) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      setRequestedCollapsed(nextCollapsed)
      setTransitioning(true)

      if (nextCollapsed) {
        setDrawerCollapsed(true)
        timeoutRef.current = setTimeout(() => {
          setCollapsedState(true)
          setTransitioning(false)
          timeoutRef.current = null
        }, durationMs)
        return
      }

      setCollapsedState(false)
      timeoutRef.current = setTimeout(() => {
        setDrawerCollapsed(false)
        setTransitioning(false)
        timeoutRef.current = null
      }, durationMs)
    },
    [durationMs]
  )

  const toggleCollapsed = React.useCallback(() => {
    setCollapsed(!requestedCollapsed)
  }, [requestedCollapsed, setCollapsed])

  return {
    collapsed,
    drawerCollapsed,
    requestedCollapsed,
    transitioning,
    setCollapsed,
    toggleCollapsed,
  }
}

export { useStagedDrawer }
