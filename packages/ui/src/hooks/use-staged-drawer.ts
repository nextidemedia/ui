import * as React from "react"

const DEFAULT_STAGE_DURATION_MS = 300
const DEFAULT_ICON_STAGE_DURATION_MS = 160

// "text-hidden": the drawer is collapsed while its icons keep their expanded positions.
type StagedDrawerLayout = "expanded" | "text-hidden" | "collapsed"

// `collapsed` is the requested end state. Text exits before icons move on
// collapse; icons return before text on expansion. "staging" holds the first
// step's layout, "settling" waits for the second step's motion to finish.
type StagedDrawerPhase =
  | { kind: "resting"; collapsed: boolean }
  | { kind: "staging"; collapsed: boolean; layout: StagedDrawerLayout }
  | { kind: "settling"; collapsed: boolean }

function phaseLayout(phase: StagedDrawerPhase): StagedDrawerLayout {
  if (phase.kind === "staging") return phase.layout
  return phase.collapsed ? "collapsed" : "expanded"
}

// A new request starts from the visible layout, so an interrupted sequence
// resumes from where it stands.
function startStaging(
  phase: StagedDrawerPhase,
  collapsed: boolean
): StagedDrawerPhase {
  const layout = phaseLayout(phase)
  const opposite = collapsed ? "expanded" : "collapsed"
  return {
    kind: "staging",
    collapsed,
    layout: layout === opposite ? "text-hidden" : layout,
  }
}

function useStagedDrawer({
  defaultCollapsed = false,
  durationMs = DEFAULT_STAGE_DURATION_MS,
  iconDurationMs = DEFAULT_ICON_STAGE_DURATION_MS,
}: {
  defaultCollapsed?: boolean
  durationMs?: number
  iconDurationMs?: number
} = {}) {
  const [phase, setPhase] = React.useState<StagedDrawerPhase>({
    kind: "resting",
    collapsed: defaultCollapsed,
  })
  const requestedCollapsedRef = React.useRef(defaultCollapsed)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }, [])

  React.useEffect(() => clearTimer, [clearTimer])

  const setCollapsed = React.useCallback(
    (nextCollapsed: boolean) => {
      clearTimer()
      requestedCollapsedRef.current = nextCollapsed

      const reducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      if (reducedMotion) {
        setPhase({ kind: "resting", collapsed: nextCollapsed })
        return
      }

      setPhase((current) => startStaging(current, nextCollapsed))
      timeoutRef.current = setTimeout(
        () => {
          setPhase({ kind: "settling", collapsed: nextCollapsed })
          timeoutRef.current = setTimeout(
            () => {
              setPhase({ kind: "resting", collapsed: nextCollapsed })
              timeoutRef.current = null
            },
            nextCollapsed ? iconDurationMs : durationMs
          )
        },
        nextCollapsed ? durationMs : iconDurationMs
      )
    },
    [clearTimer, durationMs, iconDurationMs]
  )

  const toggleCollapsed = React.useCallback(() => {
    setCollapsed(!requestedCollapsedRef.current)
  }, [setCollapsed])

  const layout = phaseLayout(phase)
  const drawerCollapsed = layout !== "expanded"
  return {
    collapsed: drawerCollapsed,
    drawerCollapsed,
    iconsCollapsed: layout === "collapsed",
    requestedCollapsed: phase.collapsed,
    transitioning: phase.kind !== "resting",
    setCollapsed,
    toggleCollapsed,
  }
}

export { useStagedDrawer }
