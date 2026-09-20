import * as React from "react"

const DEFAULT_STAGE_DURATION_MS = 300
const DEFAULT_ICON_STAGE_DURATION_MS = 160

function useStagedDrawer({
  defaultCollapsed = false,
  durationMs = DEFAULT_STAGE_DURATION_MS,
  iconDurationMs = DEFAULT_ICON_STAGE_DURATION_MS,
}: {
  defaultCollapsed?: boolean
  durationMs?: number
  iconDurationMs?: number
} = {}) {
  const [collapsed, setCollapsedState] = React.useState(defaultCollapsed)
  const [drawerCollapsed, setDrawerCollapsed] = React.useState(defaultCollapsed)
  const [iconsCollapsed, setIconsCollapsed] = React.useState(defaultCollapsed)
  const [requestedCollapsed, setRequestedCollapsed] =
    React.useState(defaultCollapsed)
  const [transitioning, setTransitioning] = React.useState(false)
  const requestedCollapsedRef = React.useRef(defaultCollapsed)
  const stageTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )
  const settleTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )

  const clearTimers = React.useCallback(() => {
    if (stageTimeoutRef.current) clearTimeout(stageTimeoutRef.current)
    if (settleTimeoutRef.current) clearTimeout(settleTimeoutRef.current)
    stageTimeoutRef.current = null
    settleTimeoutRef.current = null
  }, [])

  React.useEffect(
    () => () => {
      clearTimers()
    },
    [clearTimers]
  )

  const setCollapsed = React.useCallback(
    (nextCollapsed: boolean) => {
      clearTimers()
      requestedCollapsedRef.current = nextCollapsed
      setRequestedCollapsed(nextCollapsed)
      setTransitioning(true)

      const reducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      const drawerDuration = reducedMotion ? 0 : durationMs
      const iconDuration = reducedMotion ? 0 : iconDurationMs

      if (reducedMotion) {
        setIconsCollapsed(nextCollapsed)
        setCollapsedState(nextCollapsed)
        setDrawerCollapsed(nextCollapsed)
        setTransitioning(false)
        return
      }

      // Exit the text before moving icons; reverse that sequence on expansion.
      if (nextCollapsed) {
        setCollapsedState(true)
        setDrawerCollapsed(true)
      } else {
        setIconsCollapsed(false)
      }
      stageTimeoutRef.current = setTimeout(
        () => {
          if (nextCollapsed) {
            setIconsCollapsed(true)
          } else {
            setCollapsedState(false)
            setDrawerCollapsed(false)
          }
          stageTimeoutRef.current = null
          settleTimeoutRef.current = setTimeout(
            () => {
              setTransitioning(false)
              settleTimeoutRef.current = null
            },
            nextCollapsed ? iconDuration : drawerDuration
          )
        },
        nextCollapsed ? drawerDuration : iconDuration
      )
    },
    [clearTimers, durationMs, iconDurationMs]
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
