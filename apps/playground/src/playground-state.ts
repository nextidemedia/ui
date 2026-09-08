import { type ShellDensity } from "@nextide/ui/blocks/app-shell"
import { type ReportContextBucket } from "@nextide/ui/blocks/report-context-builder"
import { type CreatorFlowSession } from "@nextide/ui/components/creator-flow-chart"
import { type DateRange } from "@nextide/ui/components/date-range-picker"
import type { ScheduleControlValue } from "@nextide/ui/components/schedule-control"
import { formatCompactNumber } from "@nextide/ui/lib/format-number"
import {
  intelligenceContextBuckets,
  intelligenceFlowSessions,
} from "./playground-intelligence-data"
import { type PlaygroundViewMode } from "./playground-navigation-data"

type PlaygroundState = {
  viewMode: PlaygroundViewMode
  activeItemId: string
  daedalusFilterGroupId: string
  daedalusFilterId: string
  daedalusDateRange: DateRange
  exportSchedule: ScheduleControlValue
  watchlistTokens: string[]
  intelligenceCreatorIds: string[]
  intelligenceDateRange: DateRange
  intelligenceContext: ReportContextBucket[]
  intelligenceFlowSessions: CreatorFlowSession[]
  intelligenceStreamIds: string[]
  inspectorVisible: boolean
  density: string
  confidence: number[]
  checked: boolean
  enabled: boolean
  slowAnimations: boolean
  shellDensity: ShellDensity
}

const initialPlaygroundState: PlaygroundState = {
  viewMode: "report",
  activeItemId: "theme",
  daedalusFilterGroupId: "campaign",
  daedalusFilterId: "campaign-starforge",
  daedalusDateRange: {
    start: "2026-05-01",
    end: "2026-05-13",
  },
  exportSchedule: {
    cadence: "weekly",
    time: "09:00",
    weekdayIso: 1,
    dayOfMonth: 1,
    biweeklyAnchor: "this",
  },
  watchlistTokens: ["Brand spill", "Unscheduled read", "Competitor mention"],
  intelligenceCreatorIds: ["creator-mina", "creator-ren"],
  intelligenceDateRange: {
    start: "2026-05-01",
    end: "2026-05-13",
  },
  intelligenceContext: intelligenceContextBuckets,
  intelligenceFlowSessions,
  intelligenceStreamIds: ["stream-mina-1", "stream-ren-1"],
  inspectorVisible: false,
  density: "comfortable",
  confidence: [72],
  checked: true,
  enabled: true,
  slowAnimations: false,
  shellDensity: "compact",
}

function createInitialPlaygroundState(state: PlaygroundState) {
  return { ...state, viewMode: resolveInitialViewMode(state.viewMode) }
}

function resolveInitialViewMode(fallback: PlaygroundViewMode) {
  if (typeof window === "undefined") {
    return fallback
  }

  const viewMode = new URLSearchParams(window.location.search).get("view")
  return viewMode === "report" ||
    viewMode === "platform" ||
    viewMode === "daedalus" ||
    viewMode === "intelligence" ||
    viewMode === "web-mining" ||
    viewMode === "kraken-mining" ||
    viewMode === "report-mining"
    ? viewMode
    : fallback
}

function playgroundReducer(
  state: PlaygroundState,
  patch: Partial<PlaygroundState>
) {
  return { ...state, ...patch }
}

const DRAWER_STAGE_DURATION_MS = 300

const DRAWER_ICON_STAGE_DURATION_MS = 160

const PLAYGROUND_MOTION_DURATIONS = {
  "--nextide-motion-instant": 120,
  "--nextide-motion-control": 160,
  "--nextide-motion-state": 220,
  "--nextide-motion-layout": 300,
  "--nextide-motion-context-exit": 110,
  "--nextide-motion-context-enter": 190,
  "--nextide-motion-flow-dash": 700,
  "--nextide-motion-status-pulse": 880,
  "--nextide-motion-brand-glow": 6000,
} as const

const playgroundViewCopy: Record<
  PlaygroundViewMode,
  {
    eyebrow: string
    title: string
    description: string
  }
> = {
  report: {
    eyebrow: "Shared interface system",
    title: "Nextide UI v2",
    description:
      "Tune one design language, then prove it against real product compositions.",
  },
  platform: {
    eyebrow: "Platform shell preview",
    title: "Shared platform shell",
    description:
      "Application wayfinding with product-level identity and compact operational context.",
  },
  daedalus: {
    eyebrow: "Campaign delivery platform",
    title: "Campaign operations",
    description:
      "Dense controls for planning, pacing, delivery, and human approval.",
  },
  intelligence: {
    eyebrow: "Creator intelligence workflow",
    title: "Creator report workflow",
    description:
      "A guided sequence for selecting creators, evidence, context, and streams.",
  },
  "web-mining": {
    eyebrow: "Campaign operations toolkit",
    title: "Campaign tools",
    description:
      "Plan schedules, tune delivery, export results, and review campaign proof.",
  },
  "kraken-mining": {
    eyebrow: "Kraken operations",
    title: "Kraken operations",
    description:
      "Monitoring and evidence patterns that stay recognizably Kraken in composition.",
  },
  "report-mining": {
    eyebrow: "Intelligence report targets",
    title: "Intelligence report reader",
    description:
      "History, evidence, and long-form report patterns for focused analytical reading.",
  },
}

function getPlaygroundViewCopy(mode: PlaygroundViewMode) {
  return playgroundViewCopy[mode]
}

function formatLargeMetricValue(value: number) {
  return value.toLocaleString("en-US")
}

const formatCompactMetricValue = formatCompactNumber

export {
  createInitialPlaygroundState,
  DRAWER_ICON_STAGE_DURATION_MS,
  DRAWER_STAGE_DURATION_MS,
  formatCompactMetricValue,
  formatLargeMetricValue,
  getPlaygroundViewCopy,
  initialPlaygroundState,
  PLAYGROUND_MOTION_DURATIONS,
  playgroundReducer,
}
