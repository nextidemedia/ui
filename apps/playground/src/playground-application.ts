import { useStagedDrawer } from "@nextide/ui/hooks/use-staged-drawer"
import { useEffect, useReducer, useRef, useState } from "react"
import {
  type PlaygroundViewMode,
  krakenNavigationSections,
  workbenchNavigationSections,
  workbenchViewByItemId,
} from "./playground-navigation-data"
import {
  DRAWER_ICON_STAGE_DURATION_MS,
  DRAWER_STAGE_DURATION_MS,
  PLAYGROUND_MOTION_DURATIONS,
  createInitialPlaygroundState,
  getPlaygroundViewCopy,
  initialPlaygroundState,
  playgroundReducer,
} from "./playground-state"
function usePlaygroundApplication() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [playgroundSessionActive, setPlaygroundSessionActive] = useState(true)
  const [krakenActiveItemId, setKrakenActiveItemId] =
    useState("kraken-discovery")
  const settingsContentRef = useRef<HTMLDivElement>(null)
  const settingsSelectAnchorRef = useRef<HTMLDivElement>(null)
  const settingsSelectWidthRef = useRef<HTMLDivElement>(null)
  const [playgroundState, updatePlaygroundState] = useReducer(
    playgroundReducer,
    initialPlaygroundState,
    createInitialPlaygroundState
  )
  const motionScale = playgroundState.slowAnimations ? 10 : 1
  const sidebar = useStagedDrawer({
    durationMs: DRAWER_STAGE_DURATION_MS * motionScale,
    iconDurationMs: DRAWER_ICON_STAGE_DURATION_MS * motionScale,
  })
  const { viewMode, activeItemId, slowAnimations, shellDensity } =
    playgroundState

  usePlaygroundMotion(slowAnimations)
  const daedalusView = viewMode === "daedalus"
  const intelligenceView = viewMode === "intelligence"
  const webMiningView = viewMode === "web-mining"
  const krakenMiningView = viewMode === "kraken-mining"
  const reportMiningView = viewMode === "report-mining"
  const platformView = viewMode === "platform"
  const viewCopy = getPlaygroundViewCopy(viewMode)
  const workbenchActiveItemId = viewMode === "report" ? activeItemId : viewMode
  const navigationSections = platformView
    ? krakenNavigationSections
    : workbenchNavigationSections
  const navigationActiveItemId = platformView
    ? krakenActiveItemId
    : workbenchActiveItemId
  const navigationActiveLabel =
    navigationSections
      .flatMap((section) => section.items)
      .find((item) => item.id === navigationActiveItemId)?.label ??
    viewCopy.title
  const shellHeaderTitle =
    shellDensity === "current"
      ? platformView
        ? "Kraken Intelligence"
        : viewCopy.title
      : `${platformView ? "Kraken" : "Nextide UI"} / ${navigationActiveLabel}`
  const setViewMode = (nextMode: PlaygroundViewMode) => {
    updatePlaygroundState({ viewMode: nextMode })

    if (typeof window !== "undefined") {
      const nextUrl = new URL(window.location.href)
      nextUrl.searchParams.set("view", nextMode)
      window.history.replaceState(null, "", nextUrl)
    }
  }
  const selectWorkbenchItem = (itemId: string) => {
    const nextMode = workbenchViewByItemId[itemId]
    if (!nextMode) return

    if (nextMode === "report") {
      updatePlaygroundState({ activeItemId: itemId })
    }
    setViewMode(nextMode)
  }

  return {
    ...playgroundState,
    settingsOpen,
    setSettingsOpen,
    playgroundSessionActive,
    setPlaygroundSessionActive,
    krakenActiveItemId,
    setKrakenActiveItemId,
    settingsContentRef,
    settingsSelectAnchorRef,
    settingsSelectWidthRef,
    updatePlaygroundState,
    motionScale,
    sidebar,
    daedalusView,
    intelligenceView,
    webMiningView,
    krakenMiningView,
    reportMiningView,
    platformView,
    navigationSections,
    navigationActiveItemId,
    shellHeaderTitle,
    setViewMode,
    selectWorkbenchItem,
  }
}

function usePlaygroundMotion(slowAnimations: boolean) {
  useEffect(() => {
    const root = document.documentElement
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (!slowAnimations || reducedMotion) {
      for (const property of Object.keys(PLAYGROUND_MOTION_DURATIONS)) {
        root.style.removeProperty(property)
      }
      return
    }

    for (const [property, duration] of Object.entries(
      PLAYGROUND_MOTION_DURATIONS
    )) {
      root.style.setProperty(property, `${duration * 10}ms`)
    }

    return () => {
      for (const property of Object.keys(PLAYGROUND_MOTION_DURATIONS)) {
        root.style.removeProperty(property)
      }
    }
  }, [slowAnimations])
}

type PlaygroundApplication = ReturnType<typeof usePlaygroundApplication>
export { usePlaygroundApplication, type PlaygroundApplication }
