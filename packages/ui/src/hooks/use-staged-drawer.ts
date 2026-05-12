import * as React from "react"

const DEFAULT_STAGE_DURATION_MS = 260
const DEFAULT_ICON_STAGE_DURATION_MS = 180

function useStagedDrawer({
  defaultCollapsed = false,
  durationMs = DEFAULT_STAGE_DURATION_MS,
  iconDurationMs = DEFAULT_ICON_STAGE_DURATION_MS,
}: {
  defaultCollapsed?: boolean
  durationMs?: number
  iconDurationMs?: number
} = {}) {
  const [requestedCollapsed, setRequestedCollapsed] =
    React.useState(defaultCollapsed)
  const [collapsed, setCollapsedState] = React.useState(defaultCollapsed)
  const [iconsCollapsed, setIconsCollapsed] = React.useState(defaultCollapsed)
  const [drawerCollapsed, setDrawerCollapsed] = React.useState(defaultCollapsed)
  const [transitioning, setTransitioning] = React.useState(false)
  const requestedCollapsedRef = React.useRef(defaultCollapsed)
  const timeoutRefs = React.useRef<Array<ReturnType<typeof setTimeout>>>([])

  const clearTimers = React.useCallback(() => {
    for (const timeout of timeoutRefs.current) {
      clearTimeout(timeout)
    }
    timeoutRefs.current = []
  }, [])

  const schedule = React.useCallback((callback: () => void, delay: number) => {
    const timeout = setTimeout(() => {
      timeoutRefs.current = timeoutRefs.current.filter(
        (scheduledTimeout) => scheduledTimeout !== timeout
      )
      callback()
    }, delay)
    timeoutRefs.current.push(timeout)
  }, [])

  React.useEffect(() => clearTimers, [clearTimers])

  const setCollapsed = React.useCallback(
    (nextCollapsed: boolean) => {
      clearTimers()

      setRequestedCollapsed(nextCollapsed)
      requestedCollapsedRef.current = nextCollapsed
      setTransitioning(true)

      if (nextCollapsed) {
        setCollapsedState(true)
        setDrawerCollapsed(true)
        schedule(() => setIconsCollapsed(true), durationMs)
        schedule(() => {
          setTransitioning(false)
        }, durationMs + iconDurationMs)
        return
      }

      setIconsCollapsed(false)
      schedule(() => setCollapsedState(false), iconDurationMs)
      schedule(() => {
        setDrawerCollapsed(false)
        setTransitioning(false)
      }, iconDurationMs + durationMs)
    },
    [clearTimers, durationMs, iconDurationMs, schedule]
  )

  const toggleCollapsed = React.useCallback(() => {
    setCollapsed(!requestedCollapsedRef.current)
  }, [setCollapsed])

  return {
    collapsed,
    drawerCollapsed,
    iconsCollapsed,
    requestedCollapsed,
    transitioning,
    setCollapsed,
    toggleCollapsed,
  }
}

export { useStagedDrawer }
