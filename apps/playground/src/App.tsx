import { type CSSProperties, type ReactNode, useReducer, useState } from "react"
import {
  Activity,
  BarChart3,
  BookOpenText,
  Boxes,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  Database,
  Download,
  FileJson,
  FileText,
  Filter,
  Gauge,
  Layers3,
  PanelRightClose,
  PanelRightOpen,
  PanelLeft,
  RadioTower,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
  ServerCog,
  Video,
  WalletCards,
} from "lucide-react"

import { AppShell } from "@nextide/ui/blocks/app-shell"
import { CreatorScopePanel } from "@nextide/ui/blocks/creator-scope-panel"
import { CreatorTransfer } from "@nextide/ui/blocks/creator-transfer"
import {
  DashboardFilterBar,
  type DashboardFilterItem,
} from "@nextide/ui/blocks/dashboard-filter-bar"
import { ExportWorkbench } from "@nextide/ui/blocks/export-workbench"
import {
  IntelligenceProgressionChart,
  type IntelligenceProgressionStage,
} from "@nextide/ui/blocks/intelligence-progression-chart"
import { IntroPlate } from "@nextide/ui/blocks/intro-plate"
import { LiveguardCockpit } from "@nextide/ui/blocks/liveguard-cockpit"
import { NavigationPanel } from "@nextide/ui/blocks/navigation-panel"
import { ProgressiveSummaryRail } from "@nextide/ui/blocks/progressive-summary-rail"
import {
  ReportContextBuilder,
  type ReportContextBucket,
} from "@nextide/ui/blocks/report-context-builder"
import { Sidebar } from "@nextide/ui/blocks/sidebar"
import {
  StreamSelector,
  type StreamSelectorItem,
} from "@nextide/ui/blocks/stream-selector"
import { WorkflowStepper } from "@nextide/ui/blocks/workflow-stepper"
import { Badge } from "@nextide/ui/components/badge"
import { Button } from "@nextide/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nextide/ui/components/card"
import { Checkbox } from "@nextide/ui/components/checkbox"
import {
  CreatorFlowChart,
  type CreatorFlowSession,
} from "@nextide/ui/components/creator-flow-chart"
import {
  DualDateRangePicker,
  SingleCalendarDateRangePicker,
  type DateRange,
} from "@nextide/ui/components/date-range-picker"
import { DonutChart } from "@nextide/ui/components/donut-chart"
import { HourlyPacingChart } from "@nextide/ui/components/hourly-pacing-chart"
import { Input } from "@nextide/ui/components/input"
import { LineGraph } from "@nextide/ui/components/line-graph"
import {
  LineItemGraph,
  type LineItemGraphDay,
  type LineItemGraphSeries,
} from "@nextide/ui/components/line-item-graph"
import { Metric } from "@nextide/ui/components/metric"
import { Notice } from "@nextide/ui/components/notice"
import type { ScheduleControlValue } from "@nextide/ui/components/schedule-control"
import { SegmentedControl } from "@nextide/ui/components/segmented-control"
import { Separator } from "@nextide/ui/components/separator"
import { Slider } from "@nextide/ui/components/slider"
import { StatusBadge } from "@nextide/ui/components/status-badge"
import {
  Surface,
  SurfaceDescription,
  SurfaceHeader,
  SurfaceTitle,
} from "@nextide/ui/components/surface"
import { Switch } from "@nextide/ui/components/switch"
import { TrendBarChart } from "@nextide/ui/components/trend-bar-chart"
import { useStagedDrawer } from "@nextide/ui/hooks/use-staged-drawer"
import { cn } from "@nextide/ui/lib/utils"

import {
  IntelligenceReportMiningPage,
  KrakenMiningPage,
  WebMiningPage,
} from "./mining-pages"

const sidebarItems = [
  {
    id: "primitives",
    label: "Primitives",
    meta: "9 components",
    status: "Ready",
    tone: "success" as const,
    icon: <Boxes />,
  },
  {
    id: "blocks",
    label: "Blocks",
    meta: "4 patterns",
    status: "Active",
    tone: "processing" as const,
    icon: <Layers3 />,
  },
  {
    id: "theme",
    label: "Theme",
    meta: "Nextide tokens",
    status: "Draft",
    tone: "warning" as const,
    icon: <Sparkles />,
  },
]

const workflowSteps = [
  { id: "scaffold", label: "Scaffold", meta: "shadcn monorepo" },
  { id: "primitives", label: "Primitives", meta: "buttons and inputs" },
  { id: "blocks", label: "Blocks", meta: "shell and workflow" },
  { id: "publish", label: "Publish", meta: "main branch" },
]

const daedalusFilterGroups = [
  { id: "campaign", label: "Campaigns" },
  { id: "creator", label: "Creators" },
  { id: "partner", label: "Partners" },
]

const daedalusFilterItems: DashboardFilterItem[] = [
  {
    id: "campaign-starforge",
    groupId: "campaign",
    title: "Starforge Summer",
    subtitle: "9 creators · 3 live",
    badge: "Live",
    live: true,
    tone: "success",
  },
  {
    id: "campaign-orbit",
    groupId: "campaign",
    title: "Orbit Creator Push",
    subtitle: "Weekly report ready",
    badge: "Export",
    tone: "processing",
  },
  {
    id: "campaign-daedalus",
    groupId: "campaign",
    title: "Daedalus Pilot",
    subtitle: "LiveGuard warmup",
    badge: "Guarded",
    tone: "warning",
  },
  {
    id: "creator-mina",
    groupId: "creator",
    title: "Mina Vale",
    subtitle: "Twitch · YouTube",
    badge: "Clean",
    tone: "success",
  },
  {
    id: "creator-ren",
    groupId: "creator",
    title: "Ren Kade",
    subtitle: "Kick · scheduled today",
    badge: "Watch",
    tone: "warning",
  },
  {
    id: "partner-nova",
    groupId: "partner",
    title: "Nova Media",
    subtitle: "4 campaigns in scope",
    badge: "Scoped",
    tone: "success",
  },
]

const weeklyTrendRows = [
  { id: "mon", label: "Mon", value: 42, valueLabel: "42k" },
  { id: "tue", label: "Tue", value: 51, valueLabel: "51k" },
  { id: "wed", label: "Wed", value: 47, valueLabel: "47k" },
  {
    id: "thu",
    label: "Thu",
    value: 74,
    valueLabel: "74k",
    tone: "success" as const,
  },
  { id: "fri", label: "Fri", value: 68, valueLabel: "68k" },
  { id: "sat", label: "Sat", value: 59, valueLabel: "59k" },
  { id: "sun", label: "Sun", value: 63, valueLabel: "63k" },
]

const monthlyTrendRows = [
  { id: "jan", label: "Jan", value: 320, valueLabel: "320k" },
  { id: "feb", label: "Feb", value: 344, valueLabel: "344k" },
  { id: "mar", label: "Mar", value: 396, valueLabel: "396k" },
  { id: "apr", label: "Apr", value: 418, valueLabel: "418k" },
  { id: "may", label: "May", value: 486, valueLabel: "486k" },
  { id: "jun", label: "Jun", value: 441, valueLabel: "441k" },
  { id: "jul", label: "Jul", value: 509, valueLabel: "509k" },
  { id: "aug", label: "Aug", value: 544, valueLabel: "544k" },
]

const hourlyPacingBuckets = [
  70, 50, 40, 35, 35, 40, 45, 55, 70, 90, 115, 150, 190, 150, 120, 105, 110,
  135, 190, 260, 310, 310, 250, 160,
].map((value, hour) => ({
  id: `hour-${hour}`,
  hour,
  value,
  valueLabel: `${value}%`,
  detail:
    hour >= 19 && hour <= 21
      ? "prime window"
      : hour >= 11 && hour <= 13
        ? "lunch lift"
        : hour < 6
          ? "overnight floor"
          : "steady delivery",
}))

const campaignLinePoints = [
  { id: "w1", label: "W1", value: 64, valueLabel: "64k", meta: "baseline" },
  { id: "w2", label: "W2", value: 72, valueLabel: "72k" },
  { id: "w3", label: "W3", value: 69, valueLabel: "69k" },
  { id: "w4", label: "W4", value: 91, valueLabel: "91k", meta: "launch" },
  { id: "w5", label: "W5", value: 104, valueLabel: "104k" },
  { id: "w6", label: "W6", value: 118, valueLabel: "118k" },
]

const weeklyImpressionDays: LineItemGraphDay[] = [
  { id: "may-11", label: "May 11", weekday: "Mo", hidden: true },
  { id: "may-12", label: "May 12", weekday: "Tu" },
  { id: "may-13", label: "May 13", weekday: "We" },
  { id: "may-14", label: "May 14", weekday: "Th" },
  { id: "may-15", label: "May 15", weekday: "Fr" },
  { id: "may-16", label: "May 16", weekday: "Sa" },
  { id: "may-17", label: "May 17", weekday: "Su" },
  { id: "may-18", label: "May 18", weekday: "Mo" },
]

const weeklyImpressionSeries: LineItemGraphSeries[] = [
  {
    id: "coca-cola-q2",
    label: "Coca Cola Q2",
    tone: "cyan",
    points: [
      { dayId: "may-11", value: 382000 },
      { dayId: "may-12", value: 330000 },
      { dayId: "may-13", value: 194000 },
      { dayId: "may-14", value: 116000 },
      { dayId: "may-15", value: 301000 },
      { dayId: "may-16", value: 356000 },
      { dayId: "may-17", value: 352000 },
      { dayId: "may-18", value: 140000 },
    ],
  },
  {
    id: "snickers-testbuy-q2",
    label: "Snickers Testbuy Q2",
    tone: "yellow",
    points: [
      { dayId: "may-11", value: 85000 },
      { dayId: "may-12", value: 86000 },
      { dayId: "may-13", value: 87000 },
      { dayId: "may-14", value: 87500 },
      { dayId: "may-15", value: 86000 },
      { dayId: "may-16", value: 85000 },
      { dayId: "may-17", value: 85000 },
      { dayId: "may-18", value: 88000 },
    ],
  },
  {
    id: "frozen-reprise",
    label: "Frozen Reprise Movie Campaign Q2",
    tone: "red",
    points: [
      { dayId: "may-11", value: 0 },
      { dayId: "may-12", value: 0 },
      { dayId: "may-13", value: 32000 },
      { dayId: "may-14", value: 28000 },
      { dayId: "may-15", value: 105000 },
      { dayId: "may-16", value: 0 },
      { dayId: "may-17", value: 118000 },
      { dayId: "may-18", value: 22000 },
    ],
  },
  {
    id: "rtx6000",
    label: "RTX6000 Launch Campaign",
    tone: "tide",
    points: weeklyImpressionDays.map((day) => ({
      dayId: day.id,
      value: day.hidden ? 0 : 1200,
    })),
  },
]

const bannerImpressionDays: LineItemGraphDay[] = [
  "Apr 28",
  "Apr 29",
  "Apr 30",
  "May 1",
  "May 2",
  "May 3",
  "May 4",
  "May 5",
  "May 6",
  "May 7",
  "May 8",
  "May 9",
  "May 10",
  "May 11",
  "May 12",
  "May 13",
  "May 14",
  "May 15",
  "May 16",
  "May 17",
  "May 18",
].map((label) => ({
  id: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  label,
}))

const bannerImpressionSeries: LineItemGraphSeries[] = [
  {
    id: "banner-impressions",
    label: "Banner impressions",
    tone: "cyan",
    points: [
      92000, 570000, 318000, 284000, 268000, 98000, 205000, 190000, 410000,
      295000, 336000, 356000, 330000, 718000, 292000, 315000, 246000, 345000,
      270000, 315000, 140000,
    ].map((value, index) => ({
      dayId: bannerImpressionDays[index].id,
      value,
    })),
  },
  {
    id: "immersive-frame-impressions",
    label: "Immersive frame impressions",
    tone: "red",
    points: [
      110000, 142000, 92000, 78000, 102000, 276000, 44000, 156000, 132000,
      82000, 74000, 105000, 98000, 76000, 42000, 83000, 26000, 18000, 96000,
      22000, 112000,
    ].map((value, index) => ({
      dayId: bannerImpressionDays[index].id,
      value,
    })),
  },
  {
    id: "link-clicks",
    label: "Link clicks",
    tone: "tide",
    points: [
      7200, 11800, 9200, 8600, 7600, 6000, 5100, 9400, 11000, 8300, 7800, 6900,
      13200, 9600, 8300, 7400, 7000, 12100, 8800, 9500, 6200,
    ].map((value, index) => ({
      dayId: bannerImpressionDays[index].id,
      value,
    })),
  },
]

const channelMixSegments = [
  {
    id: "twitch",
    label: "Twitch",
    value: 48,
    valueLabel: "48%",
    tone: "success" as const,
  },
  {
    id: "youtube",
    label: "YouTube",
    value: 31,
    valueLabel: "31%",
    tone: "processing" as const,
  },
  {
    id: "kick",
    label: "Kick",
    value: 14,
    valueLabel: "14%",
    tone: "warning" as const,
  },
  {
    id: "other",
    label: "Other",
    value: 7,
    valueLabel: "7%",
    tone: "neutral" as const,
  },
]

const exportSessionRows = [
  {
    id: "run-1",
    creator: "Mina Vale",
    window: "May 12, 18:00-20:00",
    metric: "74k",
    status: <StatusBadge tone="success">Reported</StatusBadge>,
  },
  {
    id: "run-2",
    creator: "Ren Kade",
    window: "May 13, live",
    metric: "31k",
    status: (
      <StatusBadge tone="processing" pulse>
        Live
      </StatusBadge>
    ),
  },
  {
    id: "run-3",
    creator: "Taro",
    window: "May 14, scheduled",
    metric: "Pending",
    status: <StatusBadge tone="warning">Final</StatusBadge>,
  },
]

const liveguardCreators = [
  {
    id: "creator-1",
    name: "Mina Vale",
    platforms: ["twitch", "youtube"],
    state: <StatusBadge tone="success">Clean</StatusBadge>,
    lastEvent: "6m ago",
  },
  {
    id: "creator-2",
    name: "Ren Kade",
    platforms: ["kick"],
    state: <StatusBadge tone="warning">Watch</StatusBadge>,
    lastEvent: "12m ago",
  },
  {
    id: "creator-3",
    name: "Taro",
    platforms: ["youtube"],
    state: <StatusBadge tone="neutral">Offline</StatusBadge>,
    lastEvent: "1h ago",
  },
]

const liveguardIncidents = [
  {
    id: "incident-1",
    time: "18:42",
    creator: "Ren Kade",
    type: "Brand mention",
    severity: <StatusBadge tone="warning">Under</StatusBadge>,
    summary: "Competitor mention stayed under threshold.",
  },
  {
    id: "incident-2",
    time: "19:04",
    creator: "Mina Vale",
    type: "Transcript proof",
    severity: <StatusBadge tone="success">Clean</StatusBadge>,
    summary: "Scheduled read detected and ignored.",
  },
]

const intelligenceCreators = [
  {
    id: "creator-mina",
    name: "Mina Vale",
    meta: "Twitch - 6 streams",
    avatar: "MV",
  },
  {
    id: "creator-ren",
    name: "Ren Kade",
    meta: "Kick - live today",
    avatar: "RK",
  },
  {
    id: "creator-taro",
    name: "Taro",
    meta: "YouTube - scheduled",
    avatar: "TA",
  },
  {
    id: "creator-ivy",
    name: "Ivy North",
    meta: "Twitch - partner",
    avatar: "IN",
  },
]

const intelligenceStreamRows: StreamSelectorItem[] = [
  {
    id: "stream-mina-1",
    creatorId: "creator-mina",
    creatorName: "Mina Vale",
    title: "Launch room watch party",
    meta: "Twitch",
    dateLabel: "May 11",
    durationLabel: "3h 12m",
    readinessLabel: "Finished",
    readinessTone: "success",
    thumbnail:
      "linear-gradient(135deg, rgb(30 228 188 / 0.24), rgb(0 0 0 / 0.2))",
  },
  {
    id: "stream-mina-2",
    creatorId: "creator-mina",
    creatorName: "Mina Vale",
    title: "Creator recap and chat Q&A",
    meta: "Twitch",
    dateLabel: "May 12",
    durationLabel: "2h 48m",
    readinessLabel: "Processing",
    readinessTone: "processing",
    thumbnail:
      "linear-gradient(135deg, rgb(175 46 255 / 0.24), rgb(30 228 188 / 0.08))",
  },
  {
    id: "stream-ren-1",
    creatorId: "creator-ren",
    creatorName: "Ren Kade",
    title: "Sponsored challenge slot",
    meta: "Kick",
    dateLabel: "May 13",
    durationLabel: "1h 56m",
    readinessLabel: "Finished",
    readinessTone: "success",
    thumbnail:
      "linear-gradient(135deg, rgb(30 228 188 / 0.2), rgb(255 218 83 / 0.12))",
  },
  {
    id: "stream-taro-1",
    creatorId: "creator-taro",
    creatorName: "Taro",
    title: "Late night product read",
    meta: "YouTube",
    dateLabel: "May 14",
    durationLabel: "scheduled",
    readinessLabel: "Queued",
    readinessTone: "warning",
    thumbnail:
      "linear-gradient(135deg, rgb(255 218 83 / 0.18), rgb(0 0 0 / 0.18))",
  },
  {
    id: "stream-ivy-1",
    creatorId: "creator-ivy",
    creatorName: "Ivy North",
    title: "Co-stream safety proof",
    meta: "Twitch",
    dateLabel: "May 15",
    durationLabel: "2h 20m",
    readinessLabel: "Finished",
    readinessTone: "success",
    thumbnail:
      "linear-gradient(135deg, rgb(30 228 188 / 0.16), rgb(255 51 85 / 0.1))",
  },
]

const intelligenceContextBuckets: ReportContextBucket[] = [
  {
    id: "brand",
    label: "Brand",
    required: true,
    selected: ["Daedalus"],
    suggestions: ["Nextide", "Starforge", "Orbit"],
  },
  {
    id: "products",
    label: "Products",
    selected: ["Command center"],
    suggestions: ["Creator roster", "Weekly export", "LiveGuard cockpit"],
  },
  {
    id: "phrases",
    label: "Special phrases",
    selected: ["runtime proof"],
    suggestions: ["brand-safe", "chat lift", "campaign slot"],
  },
  {
    id: "competitors",
    label: "Competing brands",
    selected: [],
    suggestions: ["Orbit", "Nova Media", "CreatorOS"],
  },
]

const intelligenceFlowSessions: CreatorFlowSession[] = [
  {
    id: "flow-mina",
    creatorId: "creator-mina",
    label: "Starforge",
    startIndex: 1,
    endIndex: 4,
    tone: "success",
  },
  {
    id: "flow-ren",
    creatorId: "creator-ren",
    label: "Daedalus",
    startIndex: 3,
    endIndex: 6,
    tone: "processing",
  },
  {
    id: "flow-taro",
    creatorId: "creator-taro",
    label: "LiveGuard",
    startIndex: 5,
    endIndex: 8,
    tone: "warning",
  },
  {
    id: "flow-ivy",
    creatorId: "creator-ivy",
    label: "Orbit",
    startIndex: 0,
    endIndex: 2,
    tone: "success",
  },
]

const intelligenceProgressionStages: IntelligenceProgressionStage[] = [
  {
    id: "queue",
    label: "Queue streams",
    detail: "5 selected",
    status: "completed",
    icon: <Check />,
  },
  {
    id: "vod-ingest",
    label: "Ingest VODs",
    detail: "5/5 ready",
    status: "completed",
    icon: <Video />,
  },
  {
    id: "vod-analyze",
    label: "Analyze VODs",
    detail: "Creator evidence",
    status: "processing",
    icon: <Sparkles />,
  },
  {
    id: "chat-ingest",
    label: "Ingest chat",
    detail: "Coverage ready",
    status: "completed",
    icon: <FileText />,
  },
  {
    id: "chat-analyze",
    label: "Analyze chat",
    detail: "Signals pending",
    status: "queued",
    icon: <Search />,
  },
  {
    id: "fuse",
    label: "Fuse evidence",
    detail: "Partial fuse",
    status: "processing",
    icon: <Layers3 />,
  },
  {
    id: "assemble",
    label: "Assemble",
    detail: "Waiting JSON",
    status: "queued",
    icon: <FileJson />,
  },
]

type PlaygroundViewMode =
  | "report"
  | "platform"
  | "daedalus"
  | "intelligence"
  | "web-mining"
  | "kraken-mining"
  | "report-mining"

type PlaygroundState = {
  viewMode: PlaygroundViewMode
  activeItemId: string
  activeNavigationItemId: string
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
  activeStepId: string
}

const initialPlaygroundState: PlaygroundState = {
  viewMode: "report",
  activeItemId: "primitives",
  activeNavigationItemId: "dashboard",
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
  inspectorVisible: true,
  density: "comfortable",
  confidence: [72],
  checked: true,
  enabled: true,
  activeStepId: "blocks",
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

const DRAWER_DEBUG_SLOWDOWN = 1
const DRAWER_STAGE_DURATION_MS = 260 * DRAWER_DEBUG_SLOWDOWN
const DRAWER_ICON_STAGE_DURATION_MS = 180 * DRAWER_DEBUG_SLOWDOWN
const DRAWER_OUTLINE_DURATION_MS = 520 * DRAWER_DEBUG_SLOWDOWN
const drawerDebugMotionStyle = {
  "--nextide-drawer-duration": `${DRAWER_STAGE_DURATION_MS}ms`,
  "--nextide-drawer-icon-duration": `${DRAWER_ICON_STAGE_DURATION_MS}ms`,
  "--nextide-drawer-outline-duration": `${DRAWER_OUTLINE_DURATION_MS}ms`,
} as CSSProperties

const playgroundViewPages: {
  mode: PlaygroundViewMode
  label: string
  description: string
  icon: ReactNode
}[] = [
  {
    mode: "report",
    label: "Package",
    description: "primitives and blocks",
    icon: <Layers3 />,
  },
  {
    mode: "platform",
    label: "Platform",
    description: "navigation shell",
    icon: <PanelLeft />,
  },
  {
    mode: "daedalus",
    label: "Daedalus",
    description: "campaign components",
    icon: <RadioTower />,
  },
  {
    mode: "intelligence",
    label: "Workflow",
    description: "creator report flow",
    icon: <Sparkles />,
  },
  {
    mode: "web-mining",
    label: "Web mining",
    description: "schedule and pacing",
    icon: <BriefcaseBusiness />,
  },
  {
    mode: "kraken-mining",
    label: "Kraken ops",
    description: "run monitor evidence",
    icon: <ServerCog />,
  },
  {
    mode: "report-mining",
    label: "Report reader",
    description: "history and document UI",
    icon: <BookOpenText />,
  },
]

const playgroundViewCopy: Record<
  PlaygroundViewMode,
  {
    eyebrow: string
    title: string
    sidebarEyebrow: string
    sidebarStatus: string
    sidebarDetail: string
  }
> = {
  report: {
    eyebrow: "Shared component package",
    title: "Nextide UI primitives and product blocks",
    sidebarEyebrow: "Package",
    sidebarStatus: "Local package",
    sidebarDetail: "@nextide/ui",
  },
  platform: {
    eyebrow: "Platform shell preview",
    title: "Nextide platform shell and product blocks",
    sidebarEyebrow: "Platform",
    sidebarStatus: "Workspace live",
    sidebarDetail: "Platform navigation",
  },
  daedalus: {
    eyebrow: "Daedalus component migration",
    title: "Daedalus campaign intelligence blocks",
    sidebarEyebrow: "Daedalus",
    sidebarStatus: "Daedalus ready",
    sidebarDetail: "Shared campaign primitives",
  },
  intelligence: {
    eyebrow: "Intelligence report UI mining",
    title: "Intelligence report workflow components",
    sidebarEyebrow: "Intelligence",
    sidebarStatus: "Report UI ready",
    sidebarDetail: "Mined workflow primitives",
  },
  "web-mining": {
    eyebrow: "nextide-web mining targets",
    title: "Campaign schedule, pacing, export, and proof blocks",
    sidebarEyebrow: "Campaigns",
    sidebarStatus: "Web targets",
    sidebarDetail: "P1 source candidates",
  },
  "kraken-mining": {
    eyebrow: "Kraken mining targets",
    title: "Operations monitor and evidence blocks",
    sidebarEyebrow: "Kraken Ops",
    sidebarStatus: "Ops targets",
    sidebarDetail: "Run monitor patterns",
  },
  "report-mining": {
    eyebrow: "Intelligence report targets",
    title: "Report history rail and reader components",
    sidebarEyebrow: "Reports",
    sidebarStatus: "Reader targets",
    sidebarDetail: "Document report UI",
  },
}

function getPlaygroundViewCopy(mode: PlaygroundViewMode) {
  return playgroundViewCopy[mode]
}

function formatLargeMetricValue(value: number) {
  return value.toLocaleString("en-US")
}

function formatCompactMetricValue(value: number) {
  return Intl.NumberFormat("en-US", {
    maximumFractionDigits: value >= 1000000 ? 1 : 0,
    notation: value >= 1000 ? "compact" : "standard",
  })
    .format(value)
    .toLowerCase()
}

export function App() {
  const [playgroundState, updatePlaygroundState] = useReducer(
    playgroundReducer,
    initialPlaygroundState,
    createInitialPlaygroundState
  )
  const sidebar = useStagedDrawer({
    durationMs: DRAWER_STAGE_DURATION_MS,
    iconDurationMs: DRAWER_ICON_STAGE_DURATION_MS,
  })
  const {
    viewMode,
    activeItemId,
    activeNavigationItemId,
    daedalusFilterGroupId,
    daedalusFilterId,
    daedalusDateRange,
    exportSchedule,
    watchlistTokens,
    intelligenceCreatorIds,
    intelligenceDateRange,
    intelligenceContext,
    intelligenceFlowSessions,
    intelligenceStreamIds,
    inspectorVisible,
    density,
    confidence,
    checked,
    enabled,
    activeStepId,
  } = playgroundState
  const daedalusView = viewMode === "daedalus"
  const intelligenceView = viewMode === "intelligence"
  const webMiningView = viewMode === "web-mining"
  const krakenMiningView = viewMode === "kraken-mining"
  const reportMiningView = viewMode === "report-mining"
  const viewCopy = getPlaygroundViewCopy(viewMode)
  const setViewMode = (nextMode: PlaygroundViewMode) => {
    updatePlaygroundState({ viewMode: nextMode })

    if (typeof window !== "undefined") {
      const nextUrl = new URL(window.location.href)
      nextUrl.searchParams.set("view", nextMode)
      window.history.replaceState(null, "", nextUrl)
    }
  }

  return (
    <>
      <AppShell
        style={drawerDebugMotionStyle}
        collapsed={sidebar.collapsed}
        drawerCollapsed={sidebar.drawerCollapsed}
        sidebarTransitioning={sidebar.transitioning}
        sidebar={
          viewMode !== "report" ? (
            <NavigationPanel
              brand="Nextide"
              eyebrow={viewCopy.sidebarEyebrow}
              activeItemId={activeNavigationItemId}
              collapsed={sidebar.iconsCollapsed}
              drawerCollapsed={sidebar.drawerCollapsed}
              drawerTransitioning={sidebar.transitioning}
              footer={
                <div className="grid gap-2 text-xs text-muted-foreground">
                  <StatusBadge tone="success">
                    {viewCopy.sidebarStatus}
                  </StatusBadge>
                  <span>{viewCopy.sidebarDetail}</span>
                </div>
              }
              onCommand={() =>
                updatePlaygroundState({
                  activeNavigationItemId: "campaigns",
                })
              }
              onSelectItem={(item) =>
                updatePlaygroundState({ activeNavigationItemId: item.id })
              }
              onToggle={sidebar.toggleCollapsed}
            />
          ) : (
            <Sidebar
              brand="Nextide UI"
              eyebrow="Package"
              byline="Nextide"
              items={sidebarItems}
              activeItemId={activeItemId}
              collapsed={sidebar.iconsCollapsed}
              drawerCollapsed={sidebar.drawerCollapsed}
              drawerTransitioning={sidebar.transitioning}
              actionLabel="New block"
              footer={
                <div className="grid gap-2 text-xs text-muted-foreground">
                  <StatusBadge tone="success">Local package</StatusBadge>
                  <span>@nextide/ui</span>
                </div>
              }
              onAction={() => updatePlaygroundState({ activeItemId: "blocks" })}
              onSelectItem={(item) =>
                updatePlaygroundState({ activeItemId: item.id })
              }
              onToggle={sidebar.toggleCollapsed}
            />
          )
        }
        aside={
          inspectorVisible ? (
            <Inspector
              density={density}
              confidence={confidence[0] ?? 0}
              viewMode={viewMode}
              onHide={() => updatePlaygroundState({ inspectorVisible: false })}
            />
          ) : null
        }
      >
        <div className="grid gap-4">
          <Surface variant="strong" className="grid gap-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <SurfaceHeader>
                <SurfaceDescription>{viewCopy.eyebrow}</SurfaceDescription>
                <h1 className="max-w-3xl text-3xl leading-tight font-semibold tracking-normal">
                  {viewCopy.title}
                </h1>
              </SurfaceHeader>
              <div className="flex flex-wrap gap-2">
                <Button>
                  <Download />
                  Export
                </Button>
                <Button variant="outline" size="icon" aria-label="Settings">
                  <Settings />
                </Button>
              </div>
            </div>
            <WorkflowStepper
              steps={workflowSteps}
              activeStepId={activeStepId}
              onStepChange={(step) =>
                updatePlaygroundState({ activeStepId: step.id })
              }
            />
            <PlaygroundPageTabs mode={viewMode} onModeChange={setViewMode} />
          </Surface>

          {intelligenceView ? (
            <IntelligencePlayground
              selectedCreatorIds={intelligenceCreatorIds}
              dateRange={intelligenceDateRange}
              contextBuckets={intelligenceContext}
              flowSessions={intelligenceFlowSessions}
              selectedStreamIds={intelligenceStreamIds}
              onSelectedCreatorIdsChange={(nextIds) =>
                updatePlaygroundState({ intelligenceCreatorIds: nextIds })
              }
              onDateRangeChange={(nextRange) =>
                updatePlaygroundState({ intelligenceDateRange: nextRange })
              }
              onContextBucketsChange={(nextBuckets) =>
                updatePlaygroundState({ intelligenceContext: nextBuckets })
              }
              onFlowSessionsChange={(nextSessions) =>
                updatePlaygroundState({
                  intelligenceFlowSessions: nextSessions,
                })
              }
              onSelectedStreamIdsChange={(nextIds) =>
                updatePlaygroundState({ intelligenceStreamIds: nextIds })
              }
            />
          ) : webMiningView ? (
            <WebMiningPage />
          ) : krakenMiningView ? (
            <KrakenMiningPage />
          ) : reportMiningView ? (
            <IntelligenceReportMiningPage />
          ) : daedalusView ? (
            <DaedalusPlayground
              filterGroupId={daedalusFilterGroupId}
              selectedFilterId={daedalusFilterId}
              dateRange={daedalusDateRange}
              exportSchedule={exportSchedule}
              watchlistTokens={watchlistTokens}
              onFilterGroupChange={(nextGroupId) =>
                updatePlaygroundState({
                  daedalusFilterGroupId: nextGroupId,
                  daedalusFilterId:
                    daedalusFilterItems.find(
                      (item) => item.groupId === nextGroupId
                    )?.id ?? "",
                })
              }
              onFilterSelect={(item) =>
                updatePlaygroundState({ daedalusFilterId: item.id })
              }
              onFilterClear={() =>
                updatePlaygroundState({ daedalusFilterId: "" })
              }
              onExportScheduleChange={(nextSchedule) =>
                updatePlaygroundState({ exportSchedule: nextSchedule })
              }
              onDateRangeChange={(nextRange) =>
                updatePlaygroundState({ daedalusDateRange: nextRange })
              }
              onWatchlistTokensChange={(nextTokens) =>
                updatePlaygroundState({ watchlistTokens: nextTokens })
              }
            />
          ) : (
            <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="grid gap-4">
                <ComponentMatrix
                  density={density}
                  confidence={confidence}
                  checked={checked}
                  enabled={enabled}
                  onDensityChange={(nextDensity) =>
                    updatePlaygroundState({ density: nextDensity })
                  }
                  onConfidenceChange={(nextConfidence) =>
                    updatePlaygroundState({ confidence: nextConfidence })
                  }
                  onCheckedChange={(nextChecked) =>
                    updatePlaygroundState({ checked: nextChecked })
                  }
                  onEnabledChange={(nextEnabled) =>
                    updatePlaygroundState({ enabled: nextEnabled })
                  }
                />
                <BlockPreview />
              </div>
              <Surface className="grid content-start gap-4 self-start">
                <SurfaceHeader>
                  <SurfaceTitle>Signals</SurfaceTitle>
                  <SurfaceDescription>
                    Operational states from the mined intelligence UI.
                  </SurfaceDescription>
                </SurfaceHeader>
                <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,14rem),1fr))] gap-3 xl:grid-cols-1">
                  <Metric
                    icon={<Activity />}
                    value="24"
                    label="Queued states"
                    detail="Includes warning and processing tones"
                  />
                  <Metric
                    icon={<ShieldAlert />}
                    value="3"
                    label="Risk levels"
                    detail="Danger, warning, neutral"
                  />
                  <Metric
                    icon={<BarChart3 />}
                    value="72%"
                    label="Confidence"
                    detail="Bound to the slider primitive"
                  />
                </div>
              </Surface>
            </section>
          )}
        </div>
      </AppShell>
      <ViewModeToggle mode={viewMode} onModeChange={setViewMode} />
      {!inspectorVisible ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Show inspector"
          title="Show inspector"
          className="fixed right-3 bottom-4 z-50 bg-background/80 shadow-[0_12px_40px_rgb(0_0_0/0.28)] backdrop-blur-xl"
          onClick={() => updatePlaygroundState({ inspectorVisible: true })}
        >
          <PanelRightOpen />
        </Button>
      ) : null}
    </>
  )
}

function IntelligencePlayground({
  selectedCreatorIds,
  dateRange,
  contextBuckets,
  flowSessions,
  selectedStreamIds,
  onSelectedCreatorIdsChange,
  onDateRangeChange,
  onContextBucketsChange,
  onFlowSessionsChange,
  onSelectedStreamIdsChange,
}: {
  selectedCreatorIds: string[]
  dateRange: DateRange
  contextBuckets: ReportContextBucket[]
  flowSessions: CreatorFlowSession[]
  selectedStreamIds: string[]
  onSelectedCreatorIdsChange: (ids: string[]) => void
  onDateRangeChange: (range: DateRange) => void
  onContextBucketsChange: (buckets: ReportContextBucket[]) => void
  onFlowSessionsChange: (sessions: CreatorFlowSession[]) => void
  onSelectedStreamIdsChange: (ids: string[]) => void
}) {
  const [activeDateScope, setActiveDateScope] = useState("all")
  const selectedCreators = intelligenceCreators.filter((creator) =>
    selectedCreatorIds.includes(creator.id)
  )
  const scopedStreams = intelligenceStreamRows.filter((stream) =>
    selectedCreatorIds.includes(stream.creatorId)
  )

  return (
    <section className="grid gap-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.72fr)]">
        <IntroPlate
          eyebrow="Creator select"
          title="Report workflow shell"
          description="Creator movement, date overrides, streams, context, and generation progress are split into reusable package components."
          status="Mined from intelligence UI"
          metrics={[
            {
              label: "Creators",
              value: selectedCreatorIds.length.toString(),
              detail: "selected right now",
            },
            {
              label: "Streams",
              value: selectedStreamIds.length.toString(),
              detail: "selected for report",
            },
            {
              label: "Stages",
              value: "7",
              detail: "generation pipeline",
            },
          ]}
        />
        <IntroPlate
          eyebrow="Package seam"
          title="Shared report primitives"
          description="The playground owns sample state only; the mined behavior lives in package blocks and components."
          status="Public exports"
          metrics={[
            { label: "Transfer", value: "FLIP", detail: "row handoff" },
            { label: "Streams", value: "FLIP", detail: "filter motion" },
            { label: "Dates", value: "Gantt", detail: "creator flow" },
          ]}
        />
      </div>

      <Surface className="grid gap-4">
        <SurfaceHeader>
          <SurfaceTitle>Creator Select</SurfaceTitle>
          <SurfaceDescription>
            Individual searchable creator bars and the fused left-to-right
            transfer workflow.
          </SurfaceDescription>
        </SurfaceHeader>
        <CreatorTransfer
          creators={intelligenceCreators}
          selectedIds={selectedCreatorIds}
          onSelectedIdsChange={onSelectedCreatorIdsChange}
        />
      </Surface>

      <Surface className="grid gap-4">
        <SurfaceHeader>
          <SurfaceTitle>Date Select</SurfaceTitle>
          <SurfaceDescription>
            Creator override rail, existing date windows, and draggable campaign
            flow slots.
          </SurfaceDescription>
        </SurfaceHeader>
        <div className="grid gap-4 xl:grid-cols-[16rem_minmax(0,1fr)]">
          <CreatorScopePanel
            creators={selectedCreators}
            activeId={activeDateScope}
            onActiveIdChange={setActiveDateScope}
            getAction={(creator) => (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>Override</span>
                <Checkbox
                  aria-label={`Override ${creator.name}`}
                  checked={activeDateScope === creator.id}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setActiveDateScope(creator.id)
                    }
                  }}
                />
              </span>
            )}
          />
          <div className="grid gap-4">
            <DualDateRangePicker
              value={dateRange}
              onValueChange={onDateRangeChange}
            />
            <CreatorFlowChart
              creators={intelligenceCreators.map((creator) => ({
                id: creator.id,
                name: creator.name,
                meta: creator.meta,
              }))}
              days={[
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
                "Sun",
                "Mon",
                "Tue",
              ]}
              sessions={flowSessions}
              onSessionsChange={onFlowSessionsChange}
            />
          </div>
        </div>
      </Surface>

      <Surface className="grid gap-4">
        <SurfaceHeader>
          <SurfaceTitle>Stream Select</SurfaceTitle>
          <SurfaceDescription>
            Per-creator filtering with the same exit, reflow, and enter motion
            from the intelligence workflow.
          </SurfaceDescription>
        </SurfaceHeader>
        <StreamSelector
          creators={selectedCreators}
          streams={scopedStreams}
          selectedIds={selectedStreamIds}
          onSelectedIdsChange={onSelectedStreamIdsChange}
        />
      </Surface>

      <Surface className="grid gap-4">
        <SurfaceHeader>
          <SurfaceTitle>Report Context</SurfaceTitle>
          <SurfaceDescription>
            Required and optional context rows with selected chips, suggestion
            lanes, contained scrolling, and right-edge fade.
          </SurfaceDescription>
        </SurfaceHeader>
        <ReportContextBuilder
          buckets={contextBuckets}
          onBucketsChange={onContextBucketsChange}
        />
      </Surface>

      <IntelligenceProgressionChart
        stages={intelligenceProgressionStages}
        title="Generate"
        description="Reusable generation progression map for sponsored content reports."
      />
    </section>
  )
}

function DaedalusPlayground({
  filterGroupId,
  selectedFilterId,
  dateRange,
  exportSchedule,
  watchlistTokens,
  onFilterGroupChange,
  onFilterSelect,
  onFilterClear,
  onDateRangeChange,
  onExportScheduleChange,
  onWatchlistTokensChange,
}: {
  filterGroupId: string
  selectedFilterId: string
  dateRange: DateRange
  exportSchedule: ScheduleControlValue
  watchlistTokens: string[]
  onFilterGroupChange: (groupId: string) => void
  onFilterSelect: (item: DashboardFilterItem) => void
  onFilterClear: () => void
  onDateRangeChange: (value: DateRange) => void
  onExportScheduleChange: (value: ScheduleControlValue) => void
  onWatchlistTokensChange: (tokens: string[]) => void
}) {
  const selectedFilter =
    daedalusFilterItems.find((item) => item.id === selectedFilterId) ?? null

  return (
    <section className="grid gap-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.72fr)]">
        <IntroPlate
          eyebrow="Campaign surface"
          title="Daedalus command"
          description="Campaign filters, graph slices, workbook output, and LiveGuard proof share one reusable component lane."
          status="Live data ready"
          metrics={[
            { label: "Creators", value: "42", detail: "6 live now" },
            { label: "Reports", value: "18", detail: "Weekly scope" },
            {
              label: "Export health",
              value: "96%",
              detail: "Workbook current",
            },
          ]}
          actions={
            <Button type="button" variant="outline">
              <WalletCards />
              Ledger
            </Button>
          }
        />
        <IntroPlate
          eyebrow="LiveGuard"
          title="Cockpit proof"
          description="Safety tokens, score thresholds, creator states, and incident rows stay package-owned."
          status="Nominal"
          metrics={[
            { label: "Rules", value: "12", detail: "Brand plus safety" },
            { label: "Incidents", value: "2", detail: "Below threshold" },
            { label: "Cooldown", value: "8m", detail: "Delivery window" },
          ]}
        />
      </div>

      <DashboardFilterBar
        groups={daedalusFilterGroups}
        items={daedalusFilterItems}
        activeGroupId={filterGroupId}
        selectedItemId={selectedFilterId}
        onGroupChange={onFilterGroupChange}
        onItemSelect={onFilterSelect}
        onClear={onFilterClear}
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={<Filter />}
          value={selectedFilter?.badge ?? "Scoped"}
          label="Active filter"
          detail={selectedFilter?.title ?? "No campaign selected"}
        />
        <Metric
          icon={<CalendarClock />}
          value="Mon 09:00"
          label="Export cadence"
          detail="Campaign workbook"
        />
        <Metric
          icon={<Gauge />}
          value="0.71"
          label="Latest safety score"
          detail="Under threshold"
        />
        <Metric
          icon={<RadioTower />}
          value="3"
          label="Live channels"
          detail="Runtime watchlist"
        />
      </div>

      <Surface className="grid gap-4">
        <SurfaceHeader>
          <SurfaceTitle>Date pickers</SurfaceTitle>
          <SurfaceDescription>
            Dual date controls and a single-calendar range control for export
            and report windows.
          </SurfaceDescription>
        </SurfaceHeader>
        <div className="grid gap-4">
          <DualDateRangePicker
            value={dateRange}
            onValueChange={onDateRangeChange}
          />
          <SingleCalendarDateRangePicker
            value={dateRange}
            onValueChange={onDateRangeChange}
          />
        </div>
      </Surface>

      <Surface className="grid gap-4">
        <SurfaceHeader>
          <SurfaceTitle>Trend graphs</SurfaceTitle>
          <SurfaceDescription>
            Bar, line, and donut primitives with Nextide chart treatment.
          </SurfaceDescription>
        </SurfaceHeader>
        <div className="grid gap-4 xl:grid-cols-2">
          <Surface variant="plain" className="grid gap-3 xl:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <strong className="text-sm">Bar chart directions</strong>
              <StatusBadge tone="neutral">5 concepts</StatusBadge>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              <ChartDirection title="Rail" badge="+18%">
                <TrendBarChart
                  rows={weeklyTrendRows}
                  variant="rail"
                  valueFormatter={(value) => `${Math.round(value)}k`}
                />
              </ChartDirection>
              <ChartDirection title="Block" badge="Dense">
                <TrendBarChart
                  rows={weeklyTrendRows}
                  variant="block"
                  valueFormatter={(value) => `${Math.round(value)}k`}
                />
              </ChartDirection>
              <ChartDirection title="Signal" badge="Live">
                <TrendBarChart
                  rows={weeklyTrendRows}
                  variant="signal"
                  valueFormatter={(value) => `${Math.round(value)}k`}
                />
              </ChartDirection>
              <ChartDirection title="Capsule" badge="Soft">
                <TrendBarChart
                  rows={monthlyTrendRows}
                  variant="capsule"
                  valueFormatter={(value) => `${Math.round(value)}k`}
                />
              </ChartDirection>
              <ChartDirection
                title="Pacing bars"
                badge="Target line"
                className="lg:col-span-2"
              >
                <HourlyPacingChart
                  buckets={hourlyPacingBuckets}
                  targetValue={100}
                  title="Hourly pressure"
                  description="The pacing graph bar grammar reused as a general comparison option."
                />
              </ChartDirection>
            </div>
          </Surface>
          <LineItemGraph
            className="xl:col-span-2"
            title="Weekly total impressions"
            rangeLabel="Last 7 days"
            days={weeklyImpressionDays}
            series={weeklyImpressionSeries}
            axisLabelMode="weekday-day"
            minChartWidth={560}
            valueFormatter={formatLargeMetricValue}
            tickFormatter={formatCompactMetricValue}
          />
          <LineItemGraph
            className="xl:col-span-2"
            title="Banner impressions"
            rangeLabel="Last 30 days"
            days={bannerImpressionDays}
            series={bannerImpressionSeries}
            totalLine={{ label: "Total" }}
            axisLabelMode="angled-day"
            minChartWidth={1120}
            valueFormatter={formatLargeMetricValue}
            tickFormatter={formatCompactMetricValue}
          />
          <Surface variant="plain" className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <strong className="text-sm">Reach trajectory</strong>
              <StatusBadge tone="success">Climbing</StatusBadge>
            </div>
            <LineGraph points={campaignLinePoints} />
          </Surface>
          <Surface variant="plain" className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <strong className="text-sm">Channel mix</strong>
              <StatusBadge tone="neutral">Current</StatusBadge>
            </div>
            <DonutChart
              segments={channelMixSegments}
              totalLabel="100%"
              centerLabel="Reach mix"
            />
          </Surface>
        </div>
      </Surface>

      <ExportWorkbench
        schedule={exportSchedule}
        onScheduleChange={onExportScheduleChange}
        workbookState="current"
        nextRun="Mon 09:00"
        workbookName="Starforge weekly workbook"
        generatedUntil="Generated through May 12"
        sessions={exportSessionRows}
      />

      <LiveguardCockpit
        enabled
        activeRules={12}
        scheduledCreators={liveguardCreators.length}
        cooldown="8m"
        creators={liveguardCreators}
        incidents={liveguardIncidents}
        watchlistTokens={watchlistTokens}
        onWatchlistTokensChange={onWatchlistTokensChange}
        score={0.71}
        threshold={0.82}
      />
    </section>
  )
}

function ChartDirection({
  title,
  badge,
  children,
  className,
}: {
  title: ReactNode
  badge: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "grid gap-2 rounded-lg border border-nextide-line bg-background/20 p-2",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 px-1">
        <strong className="text-sm">{title}</strong>
        <StatusBadge tone="success">{badge}</StatusBadge>
      </div>
      {children}
    </div>
  )
}

function ComponentMatrix({
  density,
  confidence,
  checked,
  enabled,
  onDensityChange,
  onConfidenceChange,
  onCheckedChange,
  onEnabledChange,
}: {
  density: string
  confidence: number[]
  checked: boolean
  enabled: boolean
  onDensityChange: (value: string) => void
  onConfidenceChange: (value: number[]) => void
  onCheckedChange: (value: boolean) => void
  onEnabledChange: (value: boolean) => void
}) {
  return (
    <Surface className="grid gap-4">
      <SurfaceHeader>
        <SurfaceTitle>Primitives</SurfaceTitle>
        <SurfaceDescription>
          Buttons, controls, badges, metrics, and notices.
        </SurfaceDescription>
      </SurfaceHeader>

      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,20rem),1fr))] gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>
              Default shadcn variants with Nextide tokens available.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Danger</Button>
            <Button size="icon" aria-label="Search">
              <Search />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
            <CardDescription>
              Compact form controls for dense app surfaces.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Input defaultValue="Sponsored report" aria-label="Report name" />
            <div className="flex items-center gap-3">
              <Checkbox
                checked={checked}
                onCheckedChange={(value) => onCheckedChange(value === true)}
              />
              <span className="text-sm">Include degraded runs</span>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={enabled} onCheckedChange={onEnabledChange} />
              <span className="text-sm">Runtime checks</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Segmented choice and confidence range.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <SegmentedControl
              value={density}
              options={[
                { value: "compact", label: "Compact" },
                { value: "comfortable", label: "Comfort" },
                { value: "spacious", label: "Spacious" },
              ]}
              onValueChange={onDensityChange}
            />
            <Slider
              value={confidence}
              min={0}
              max={100}
              step={1}
              onValueChange={onConfidenceChange}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>
              Badges and notices for runtime state.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="success">Ready</StatusBadge>
              <StatusBadge tone="processing" pulse>
                Processing
              </StatusBadge>
              <StatusBadge tone="warning">Degraded</StatusBadge>
              <StatusBadge tone="danger">Failed</StatusBadge>
              <Badge variant="outline">Outline</Badge>
            </div>
            <Notice title="Projection cache warm" tone="info">
              Read model data is available for the current playground run.
            </Notice>
          </CardContent>
        </Card>
      </div>
    </Surface>
  )
}

function BlockPreview() {
  const navigationDrawer = useStagedDrawer({
    durationMs: DRAWER_STAGE_DURATION_MS,
    iconDurationMs: DRAWER_ICON_STAGE_DURATION_MS,
  })
  const [activeNavigationItemId, updateActiveNavigationItemId] = useReducer(
    (_current: string, nextItemId: string) => nextItemId,
    "dashboard"
  )
  const navigationLabels: Record<string, string> = {
    dashboard: "Dashboard",
    campaigns: "Campaigns",
    "clients-partners": "Clients & Partners",
    creators: "Creators",
    settings: "Settings",
    "service-health": "Service Health",
  }
  const activeNavigationLabel =
    navigationLabels[activeNavigationItemId] ?? "Dashboard"

  return (
    <Surface className="grid gap-4">
      <SurfaceHeader>
        <SurfaceTitle>Blocks</SurfaceTitle>
        <SurfaceDescription>
          Composed app patterns that stay outside primitive components.
        </SurfaceDescription>
      </SurfaceHeader>

      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,14rem),1fr))] gap-4">
        <Surface variant="plain" className="grid gap-3">
          <div className="flex items-center gap-2">
            <Database className="size-4 text-nextide-tide" />
            <strong className="text-sm">App shell</strong>
          </div>
          <Separator />
          <p className="text-sm text-muted-foreground">
            Sidebar, main workspace, and optional inspector slots share one
            responsive frame.
          </p>
        </Surface>
        <Surface variant="plain" className="grid gap-3">
          <div className="flex items-center gap-2">
            <Layers3 className="size-4 text-nextide-tide" />
            <strong className="text-sm">Report sidebar</strong>
          </div>
          <Separator />
          <p className="text-sm text-muted-foreground">
            Brand, action, status-aware nav items, collapse behavior, and footer
            slot.
          </p>
        </Surface>
        <Surface variant="plain" className="grid gap-3">
          <div className="flex items-center gap-2">
            <PanelLeft className="size-4 text-nextide-tide" />
            <strong className="text-sm">Navigation panel</strong>
          </div>
          <Separator />
          <p className="text-sm text-muted-foreground">
            Product wayfinding for workspace and system-level application areas.
          </p>
        </Surface>
        <Surface variant="plain" className="grid gap-3">
          <div className="flex items-center gap-2">
            <Check className="size-4 text-nextide-tide" />
            <strong className="text-sm">Stepper</strong>
          </div>
          <Separator />
          <p className="text-sm text-muted-foreground">
            Horizontal workflow navigation with active and completed states.
          </p>
        </Surface>
      </div>

      <ProgressiveSummaryRail
        title="Progressive summary"
        description="Section headers remain stable while filled rows enter as values become available."
        sections={[
          {
            id: "report",
            title: "Report",
            summary: "Creator fit review",
            rows: [{ id: "brand", label: "Brand", badge: "BR", value: "Daedalus" }],
          },
          {
            id: "campaign",
            title: "Campaign Shape",
            emptyLabel: "Timing and goals pending",
            rows: [],
          },
          {
            id: "safety",
            title: "Safety Gate",
            summary: "0.72 minimum",
            rows: [
              { id: "qualified", label: "qualified creators", badge: "18" },
              { id: "overrides", label: "category overrides", badge: "2" },
            ],
          },
        ]}
        className="rounded-xl border border-nextide-line bg-nextide-panel p-4"
      />

      <div
        className={cn(
          "grid min-h-[34rem] grid-cols-1 items-start gap-3 overflow-hidden rounded-xl border border-nextide-line bg-black/20 p-3 transition-[grid-template-columns] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
          "2xl:grid-cols-[18rem_minmax(0,1fr)]",
          navigationDrawer.collapsed && "2xl:grid-cols-[4.5rem_minmax(0,1fr)]"
        )}
      >
        <div
          className={cn(
            "h-full min-h-[31rem] overflow-visible transition-[width] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
            navigationDrawer.collapsed ? "w-[4.5rem]" : "w-full max-w-[18rem]"
          )}
        >
          <NavigationPanel
            brand="Nextide"
            eyebrow="Platform"
            activeItemId={activeNavigationItemId}
            collapsed={navigationDrawer.iconsCollapsed}
            drawerCollapsed={navigationDrawer.drawerCollapsed}
            drawerTransitioning={navigationDrawer.transitioning}
            footer={
              <div className="grid gap-2 text-xs text-muted-foreground">
                <StatusBadge tone="success">Workspace live</StatusBadge>
                <span>Shared staged drawer motion</span>
              </div>
            }
            onCommand={() => updateActiveNavigationItemId("campaigns")}
            onSelectItem={(item) => updateActiveNavigationItemId(item.id)}
            onToggle={navigationDrawer.toggleCollapsed}
          />
        </div>
        <div
          className={cn(
            "min-w-0 overflow-hidden rounded-xl border border-nextide-line bg-nextide-panel p-4 transition-[opacity,transform] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
            navigationDrawer.transitioning && "will-change-transform"
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="grid gap-1">
              <span className="text-xs text-muted-foreground">
                Navigation target
              </span>
              <strong className="text-xl leading-tight font-bold">
                {activeNavigationLabel}
              </strong>
            </div>
            <StatusBadge tone="success">Nominal</StatusBadge>
          </div>
          <div className="mt-5 grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-3">
            <Metric
              icon={<Activity />}
              value="6"
              label="Primary routes"
              detail="Workspace plus system"
            />
            <Metric
              icon={<ShieldAlert />}
              value="0"
              label="Service alerts"
              detail="Nominal behaviour"
            />
          </div>
          <Separator className="my-5" />
          <div className="grid gap-2 text-sm text-muted-foreground">
            <span>Dashboard</span>
            <span>Campaigns</span>
            <span>Clients & Partners</span>
            <span>Creators</span>
            <span>Settings</span>
            <span>Service Health</span>
          </div>
        </div>
      </div>
    </Surface>
  )
}

function PlaygroundPageTabs({
  mode,
  onModeChange,
}: {
  mode: PlaygroundViewMode
  onModeChange: (mode: PlaygroundViewMode) => void
}) {
  return (
    <div
      data-slot="playground-page-tabs"
      className="nextide-contained-scroll nextide-scrollbar-none flex gap-2 overflow-x-auto rounded-lg border border-nextide-line bg-background/20 p-1"
      aria-label="Playground page"
      role="radiogroup"
    >
      {playgroundViewPages.map((page) => {
        const active = page.mode === mode

        return (
          <button
            key={page.mode}
            type="button"
            role="radio"
            aria-checked={active}
            className={cn(
              "grid min-w-36 grid-cols-[1.75rem_minmax(0,1fr)] items-center gap-2 rounded-md px-2.5 py-2 text-left transition-[background-color,color,box-shadow] duration-200",
              active
                ? "bg-nextide-tide text-black shadow-[0_0_18px_rgb(30_228_188/0.18)]"
                : "text-muted-foreground hover:bg-nextide-panel hover:text-foreground"
            )}
            onClick={() => onModeChange(page.mode)}
          >
            <span className="[&_svg]:size-4">{page.icon}</span>
            <span className="grid min-w-0">
              <strong className="truncate text-xs font-semibold">
                {page.label}
              </strong>
              <span className="truncate text-[0.68rem] opacity-75">
                {page.description}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

function ViewModeToggle({
  mode,
  onModeChange,
}: {
  mode: PlaygroundViewMode
  onModeChange: (mode: PlaygroundViewMode) => void
}) {
  return (
    <div
      data-slot="view-mode-toggle"
      className="fixed top-1/2 right-3 z-50 hidden -translate-y-1/2 gap-1 rounded-full border border-nextide-line bg-background/80 p-1 shadow-[0_12px_40px_rgb(0_0_0/0.32)] backdrop-blur-xl md:grid"
      aria-label="Playground view"
      role="radiogroup"
    >
      {playgroundViewPages.map((page) => {
        const active = page.mode === mode

        return (
          <button
            key={page.mode}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${page.label} view`}
            title={`${page.label} view`}
            className={cn(
              "grid size-9 place-items-center rounded-full text-muted-foreground transition-[background-color,color,box-shadow] duration-[220ms] hover:text-foreground",
              active &&
                "bg-nextide-tide text-black shadow-[0_0_18px_rgb(30_228_188/0.2)]"
            )}
            onClick={() => onModeChange(page.mode)}
          >
            <span className="[&_svg]:size-4">{page.icon}</span>
          </button>
        )
      })}
    </div>
  )
}

function Inspector({
  density,
  confidence,
  viewMode,
  onHide,
}: {
  density: string
  confidence: number
  viewMode: PlaygroundViewMode
  onHide: () => void
}) {
  return (
    <Surface className="grid gap-4">
      <SurfaceHeader className="grid-cols-[minmax(0,1fr)_auto] items-start">
        <div className="grid gap-1">
          <SurfaceTitle>Inspector</SurfaceTitle>
          <SurfaceDescription>Live playground state.</SurfaceDescription>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Hide inspector"
          title="Hide inspector"
          onClick={onHide}
        >
          <PanelRightClose />
        </Button>
      </SurfaceHeader>
      <div className="grid gap-3 text-sm">
        <InspectorRow label="Package" value="@nextide/ui" />
        <InspectorRow label="View" value={viewMode} />
        <InspectorRow label="Density" value={density} />
        <InspectorRow label="Confidence" value={`${confidence}%`} />
        <InspectorRow label="Consumer" value="apps/playground" />
      </div>
      <Notice title="Import boundary" tone="warning" icon={<FileText />}>
        The playground imports from package exports, not internal relative
        paths.
      </Notice>
    </Surface>
  )
}

function InspectorRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-nextide-line bg-nextide-panel px-3 py-2">
      <span className="text-muted-foreground">{label}</span>
      <strong className="truncate text-right font-medium">{value}</strong>
    </div>
  )
}
