import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useReducer,
  useState,
} from "react"
import { useRef } from "react"
import {
  Activity,
  BarChart3,
  BookOpenText,
  Boxes,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  Database,
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
} from "lucide-react"

import { AppShell } from "@nextide/ui/blocks/app-shell"
import { CreatorScopePanel } from "@nextide/ui/blocks/creator-scope-panel"
import { CreatorTransfer } from "@nextide/ui/blocks/creator-transfer"
import {
  DashboardFilterBar,
  type DashboardFilterItem,
} from "@nextide/ui/blocks/dashboard-filter-bar"
import { ExportWorkbench } from "@nextide/ui/blocks/export-workbench"
import { FitLeaderboard } from "@nextide/ui/blocks/fit-leaderboard"
import {
  IntelligenceProgressionChart,
  type IntelligenceProgressionStage,
} from "@nextide/ui/blocks/intelligence-progression-chart"
import { SignalPlate } from "@nextide/ui/blocks/signal-plate"
import { LiveguardCockpit } from "@nextide/ui/blocks/liveguard-cockpit"
import { NavigationPanel } from "@nextide/ui/blocks/navigation-panel"
import { ProgressiveSummaryRail } from "@nextide/ui/blocks/progressive-summary-rail"
import {
  ReportContextBuilder,
  type ReportContextBucket,
} from "@nextide/ui/blocks/report-context-builder"
import {
  SettingsModal,
  SettingsModalSection,
} from "@nextide/ui/blocks/settings-modal"
import {
  StreamSelector,
  type StreamSelectorItem,
} from "@nextide/ui/blocks/stream-selector"
import {
  Autocomplete,
  AutocompleteClear,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteInputGroup,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePortal,
  AutocompletePositioner,
} from "@nextide/ui/components/autocomplete"
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@nextide/ui/components/avatar"
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
  SingleCalendarDateRangePicker,
  type DateRange,
} from "@nextide/ui/components/date-range-picker"
import { DonutChart } from "@nextide/ui/components/donut-chart"
import {
  DurationPicker,
  type DurationValue,
} from "@nextide/ui/components/duration-picker"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@nextide/ui/components/empty"
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
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@nextide/ui/components/popover"
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@nextide/ui/components/progress"
import { ProcessingText } from "@nextide/ui/components/processing-text"
import type { ScheduleControlValue } from "@nextide/ui/components/schedule-control"
import { ScrollArea } from "@nextide/ui/components/scroll-area"
import { SelectMenu } from "@nextide/ui/components/select-menu"
import { SegmentedControl } from "@nextide/ui/components/segmented-control"
import { Separator } from "@nextide/ui/components/separator"
import { Slider } from "@nextide/ui/components/slider"
import { Skeleton } from "@nextide/ui/components/skeleton"
import { Spinner } from "@nextide/ui/components/spinner"
import { StatusBadge } from "@nextide/ui/components/status-badge"
import {
  Surface,
  SurfaceDescription,
  SurfaceHeader,
  SurfaceTitle,
} from "@nextide/ui/components/surface"
import { Switch } from "@nextide/ui/components/switch"
import { TrendBarChart } from "@nextide/ui/components/trend-bar-chart"
import { SignalRidgeChart } from "@nextide/ui/components/signal-ridge-chart"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@nextide/ui/components/tooltip"
import { useStagedDrawer } from "@nextide/ui/hooks/use-staged-drawer"
import { cn } from "@nextide/ui/lib/utils"
import { formatCompactNumber } from "@nextide/ui/lib/format-number"

import {
  IntelligenceReportMiningPage,
  KrakenMiningPage,
  WebMiningPage,
} from "./mining-pages"
import { ComponentReference } from "./component-reference"

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
      <StatusBadge tone="processing" indicator="pulse">
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

const intelligenceFitRows = [
  {
    id: "fit-mina",
    name: "Mina Vale",
    meta: "Twitch · Lifestyle",
    avatarFallback: "MV",
    fit: 4.8,
    safety: 4.6,
    sentiment: 3.9,
    sentimentDetail: "28.4K mentions",
  },
  {
    id: "fit-ren",
    name: "Ren Kade",
    meta: "Kick · Competitive",
    avatarFallback: "RK",
    fit: 4.1,
    safety: 3.4,
    sentiment: 1.8,
    sentimentDetail: "12.7K mentions",
  },
  {
    id: "fit-ivy",
    name: "Ivy North",
    meta: "Twitch · Variety",
    avatarFallback: "IN",
    fit: 3.6,
    safety: 4.2,
    sentiment: -0.7,
    sentimentDetail: "8.1K mentions",
  },
]

function autocompleteCreatorValue(
  creator: (typeof intelligenceCreators)[number]
) {
  return creator.name
}

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

const workbenchNavigationSections = [
  {
    id: "system",
    label: "System",
    items: [
      {
        id: "theme",
        label: "Foundations",
        meta: "Type, color, radius, motion",
        icon: <Sparkles />,
      },
      {
        id: "primitives",
        label: "Primitives",
        meta: "Controls and states",
        icon: <Boxes />,
      },
      {
        id: "blocks",
        label: "Patterns",
        meta: "Composed shared UI",
        icon: <Layers3 />,
      },
    ],
  },
  {
    id: "product-proofs",
    label: "Product proofs",
    items: [
      {
        id: "platform",
        label: "Platform shell",
        meta: "Shared application frame",
        icon: <PanelLeft />,
      },
      {
        id: "daedalus",
        label: "Daedalus",
        meta: "Campaign operations",
        icon: <RadioTower />,
      },
      {
        id: "intelligence",
        label: "Creator workflow",
        meta: "Guided report flow",
        icon: <Sparkles />,
      },
    ],
  },
  {
    id: "mined-proofs",
    label: "Mined proofs",
    items: [
      {
        id: "web-mining",
        label: "Campaign tools",
        meta: "Schedule and pacing",
        icon: <BriefcaseBusiness />,
      },
      {
        id: "kraken-mining",
        label: "Kraken operations",
        meta: "Monitor and evidence",
        icon: <ServerCog />,
      },
      {
        id: "report-mining",
        label: "Report reader",
        meta: "History and documents",
        icon: <BookOpenText />,
      },
    ],
  },
]

const workbenchViewByItemId: Record<string, PlaygroundViewMode> = {
  theme: "report",
  primitives: "report",
  blocks: "report",
  platform: "platform",
  daedalus: "daedalus",
  intelligence: "intelligence",
  "web-mining": "web-mining",
  "kraken-mining": "kraken-mining",
  "report-mining": "report-mining",
}

const blockPreviewNavigationLabels: Record<string, string> = {
  dashboard: "Dashboard",
  campaigns: "Campaigns",
  "clients-partners": "Clients & Partners",
  creators: "Creators",
  settings: "Settings",
  "service-health": "Service Health",
}

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

export function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [playgroundSessionActive, setPlaygroundSessionActive] = useState(true)
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
  const {
    viewMode,
    activeItemId,
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
    slowAnimations,
  } = playgroundState

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
  const daedalusView = viewMode === "daedalus"
  const intelligenceView = viewMode === "intelligence"
  const webMiningView = viewMode === "web-mining"
  const krakenMiningView = viewMode === "kraken-mining"
  const reportMiningView = viewMode === "report-mining"
  const viewCopy = getPlaygroundViewCopy(viewMode)
  const workbenchActiveItemId = viewMode === "report" ? activeItemId : viewMode
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

  return (
    <>
      <AppShell
        collapsed={sidebar.collapsed}
        drawerCollapsed={sidebar.drawerCollapsed}
        sidebarTransitioning={sidebar.transitioning}
        sidebar={
          <NavigationPanel
            brand="Nextide UI"
            eyebrow="System workbench"
            activeItemId={workbenchActiveItemId}
            collapsed={sidebar.iconsCollapsed}
            drawerCollapsed={sidebar.drawerCollapsed}
            drawerTransitioning={sidebar.transitioning}
            sections={workbenchNavigationSections}
            commandLabel="Search library"
            userMenu={
              playgroundSessionActive
                ? {
                    name: "Nextide Operator",
                    email: "operator@nextide.media",
                    initials: "NO",
                    onSettings: () => setSettingsOpen(true),
                    onLogout: () => setPlaygroundSessionActive(false),
                  }
                : undefined
            }
            onSelectItem={(item) => selectWorkbenchItem(item.id)}
            onToggle={sidebar.toggleCollapsed}
          />
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
          <Surface variant="strong" className="grid gap-4 overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <SurfaceHeader>
                <ComponentReference names={["AppShell", "NavigationPanel"]} />
                <SurfaceDescription>{viewCopy.eyebrow}</SurfaceDescription>
                <h1
                  className={cn(
                    "max-w-3xl text-ui-headline font-medium",
                    viewMode === "report" &&
                      "font-display text-ui-display font-bold"
                  )}
                >
                  {viewCopy.title}
                </h1>
                <p className="max-w-[65ch] text-ui-body text-muted-foreground">
                  {viewCopy.description}
                </p>
              </SurfaceHeader>
              <div className="flex flex-wrap gap-2">
                {!inspectorVisible ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      updatePlaygroundState({ inspectorVisible: true })
                    }
                  >
                    <PanelRightOpen data-icon="inline-start" />
                    Inspect
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Settings"
                  onClick={() => setSettingsOpen(true)}
                >
                  <Settings />
                </Button>
              </div>
            </div>
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
          ) : activeItemId === "theme" ? (
            <FoundationsPreview />
          ) : activeItemId === "blocks" ? (
            <BlockPreview motionScale={motionScale} />
          ) : (
            <section className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_20rem]">
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
              </div>
              <Surface className="grid content-start gap-4 self-start">
                <SurfaceHeader>
                  <ComponentReference names="Metric" />
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
      <SettingsModal
        contentRef={settingsContentRef}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        title="Preview settings"
        description="Adjust the shared component preview."
        kicker="Package"
      >
        <SettingsModalSection
          title="Runtime checks"
          description="Show enabled states across the preview."
        >
          <ComponentReference
            names={["SettingsModal", "SettingsModalSection", "SelectMenu"]}
          />
          <div ref={settingsSelectWidthRef} className="w-44 sm:w-full">
            <div ref={settingsSelectAnchorRef} className="w-full sm:w-56">
              <SelectMenu
                aria-label="Preview density"
                contentAnchorRef={settingsSelectAnchorRef}
                contentMinWidth={220}
                contentPortalRef={settingsContentRef}
                contentWidthRef={settingsSelectWidthRef}
                onValueChange={(nextDensity) =>
                  updatePlaygroundState({ density: nextDensity })
                }
                options={[
                  { value: "compact", label: "Compact" },
                  { value: "comfortable", label: "Comfort" },
                  { value: "spacious", label: "Spacious", disabled: true },
                ]}
                value={density}
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-nextide-line bg-nextide-panel p-3">
            <span className="text-sm font-medium">Enable runtime checks</span>
            <Switch
              checked={enabled}
              onCheckedChange={(nextEnabled) =>
                updatePlaygroundState({ enabled: nextEnabled })
              }
            />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-nextide-line bg-nextide-panel p-3">
            <span className="grid gap-0.5">
              <span className="text-sm font-medium">Slow motion</span>
              <small className="text-xs text-muted-foreground">
                Run interface animations at 10× duration.
              </small>
            </span>
            <Switch
              checked={slowAnimations}
              onCheckedChange={(nextSlowAnimations) =>
                updatePlaygroundState({ slowAnimations: nextSlowAnimations })
              }
            />
          </div>
        </SettingsModalSection>
      </SettingsModal>
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
      <div className="grid gap-2">
        <ComponentReference names="SignalPlate" />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.72fr)]">
          <SignalPlate
            eyebrow="Creator select"
            title="Report workflow shell"
            description="Move from creator selection through dates, streams, context, and generation with progress always visible."
            status="Workflow ready"
            statusTone="success"
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
          <SignalPlate
            eyebrow="Workflow coverage"
            title="Report preparation"
            description="Choose creators, narrow evidence, set the reporting context, and confirm the final source set."
            status="Ready"
            statusTone="processing"
            metrics={[
              { label: "Transfer", value: "FLIP", detail: "row handoff" },
              { label: "Streams", value: "FLIP", detail: "filter motion" },
              { label: "Dates", value: "Gantt", detail: "creator flow" },
            ]}
          />
        </div>
      </div>

      <Surface className="grid gap-4">
        <SurfaceHeader>
          <ComponentReference names="FitLeaderboard" />
          <SurfaceTitle>Creator fit</SurfaceTitle>
          <SurfaceDescription>
            Compare fit, safety, audience sentiment, and evidence volume in one
            responsive ranking.
          </SurfaceDescription>
        </SurfaceHeader>
        <FitLeaderboard items={intelligenceFitRows} />
      </Surface>

      <Surface className="grid gap-4">
        <SurfaceHeader>
          <ComponentReference names="CreatorTransfer" />
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
          <div className="grid content-start gap-2">
            <ComponentReference names="CreatorScopePanel" />
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
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <ComponentReference names="SingleCalendarDateRangePicker" />
              <SingleCalendarDateRangePicker
                value={dateRange}
                onValueChange={onDateRangeChange}
              />
            </div>
            <div className="grid gap-2">
              <ComponentReference names="CreatorFlowChart" />
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
        </div>
      </Surface>

      <Surface className="grid gap-4">
        <SurfaceHeader>
          <ComponentReference names="StreamSelector" />
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
          <ComponentReference names="ReportContextBuilder" />
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

      <div className="grid gap-2">
        <ComponentReference names="IntelligenceProgressionChart" />
        <IntelligenceProgressionChart
          stages={intelligenceProgressionStages}
          title="Generate"
          description="Reusable generation progression map for sponsored content reports."
        />
      </div>
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
  const [reportDuration, setReportDuration] = useState<DurationValue>({
    hours: 2,
    minutes: 33,
  })
  const selectedFilter =
    daedalusFilterItems.find((item) => item.id === selectedFilterId) ?? null

  return (
    <section className="grid gap-4">
      <div className="grid gap-2">
        <ComponentReference names="SignalPlate" />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.72fr)]">
          <SignalPlate
            eyebrow="Campaign surface"
            title="Daedalus command"
            description="Coordinate campaign filters, delivery signals, workbook output, and safety proof from one operational view."
            status="Live data ready"
            statusTone="success"
            metrics={[
              { label: "Creators", value: "42", detail: "6 live now" },
              { label: "Reports", value: "18", detail: "Weekly scope" },
              {
                label: "Export health",
                value: "96%",
                detail: "Workbook current",
              },
            ]}
          />
          <SignalPlate
            eyebrow="LiveGuard"
            title="Cockpit proof"
            description="Track safety rules, thresholds, creator state, and incidents without losing campaign context."
            status="Nominal"
            statusTone="success"
            metrics={[
              { label: "Rules", value: "12", detail: "Brand plus safety" },
              { label: "Incidents", value: "2", detail: "Below threshold" },
              { label: "Cooldown", value: "8m", detail: "Delivery window" },
            ]}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <ComponentReference names="DashboardFilterBar" />
        <DashboardFilterBar
          groups={daedalusFilterGroups}
          items={daedalusFilterItems}
          activeGroupId={filterGroupId}
          selectedItemId={selectedFilterId}
          onGroupChange={onFilterGroupChange}
          onItemSelect={onFilterSelect}
          onClear={onFilterClear}
        />
      </div>

      <div className="grid gap-2">
        <ComponentReference names="Metric" />
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
      </div>

      <Surface className="grid gap-4">
        <SurfaceHeader>
          <SurfaceTitle>Date range</SurfaceTitle>
          <SurfaceDescription>
            One calendar keeps export and report windows in a single context.
          </SurfaceDescription>
        </SurfaceHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <ComponentReference names="SingleCalendarDateRangePicker" />
            <SingleCalendarDateRangePicker
              value={dateRange}
              onValueChange={onDateRangeChange}
            />
          </div>
          <Surface
            variant="plain"
            padding="sm"
            className="grid w-fit max-w-full justify-items-start gap-2"
          >
            <ComponentReference names="DurationPicker" />
            <DurationPicker
              value={reportDuration}
              onValueChange={setReportDuration}
            />
          </Surface>
        </div>
      </Surface>

      <Surface className="grid gap-4">
        <SurfaceHeader>
          <SurfaceTitle>Trend graphs</SurfaceTitle>
          <SurfaceDescription>
            Compare delivery signals, pacing, reach, and channel mix at a
            glance.
          </SurfaceDescription>
        </SurfaceHeader>
        <div className="grid gap-4 xl:grid-cols-2">
          <Surface variant="plain" className="grid gap-3 xl:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <strong className="text-sm">Bar chart directions</strong>
              <StatusBadge tone="neutral">7 directions</StatusBadge>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              <ChartDirection
                componentName="TrendBarChart"
                title="Rail"
                badge="+18%"
              >
                <TrendBarChart
                  rows={weeklyTrendRows}
                  variant="rail"
                  valueFormatter={(value) => `${Math.round(value)}k`}
                />
              </ChartDirection>
              <ChartDirection
                componentName="TrendBarChart"
                title="Block"
                badge="Dense"
              >
                <TrendBarChart
                  rows={weeklyTrendRows}
                  variant="block"
                  valueFormatter={(value) => `${Math.round(value)}k`}
                />
              </ChartDirection>
              <ChartDirection
                componentName="TrendBarChart"
                title="Signal"
                badge="Live"
              >
                <TrendBarChart
                  rows={weeklyTrendRows}
                  variant="signal"
                  valueFormatter={(value) => `${Math.round(value)}k`}
                />
              </ChartDirection>
              <ChartDirection
                componentName="HourlyPacingChart"
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
              <ChartDirection
                componentName="SignalRidgeChart"
                title="Signal ridge"
                badge="Trajectory"
                className="lg:col-span-2"
              >
                <SignalRidgeChart
                  points={weeklyTrendRows}
                  valueFormatter={(value) =>
                    `${formatCompactNumber(value * 1000)}`
                  }
                />
              </ChartDirection>
            </div>
          </Surface>
          <div className="grid gap-2 xl:col-span-2">
            <ComponentReference names="LineItemGraph" />
            <LineItemGraph
              title="Weekly total impressions"
              rangeLabel="Last 7 days"
              days={weeklyImpressionDays}
              series={weeklyImpressionSeries}
              axisLabelMode="weekday-day"
              valueFormatter={formatLargeMetricValue}
              tickFormatter={formatCompactMetricValue}
            />
          </div>
          <div className="grid gap-2 xl:col-span-2">
            <ComponentReference names="LineItemGraph" />
            <LineItemGraph
              title="Banner impressions"
              rangeLabel="Last 30 days"
              days={bannerImpressionDays}
              series={bannerImpressionSeries}
              totalLine={{ label: "Total" }}
              axisLabelMode="angled-day"
              valueFormatter={formatLargeMetricValue}
              tickFormatter={formatCompactMetricValue}
            />
          </div>
          <Surface variant="plain" className="grid gap-3">
            <ComponentReference names="LineGraph" />
            <div className="flex items-center justify-between gap-3">
              <strong className="text-sm">Reach trajectory</strong>
              <StatusBadge tone="success">Climbing</StatusBadge>
            </div>
            <LineGraph points={campaignLinePoints} />
          </Surface>
          <Surface variant="plain" className="grid gap-3">
            <ComponentReference names="DonutChart" />
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

      <div className="grid gap-2">
        <ComponentReference names="ExportWorkbench" />
        <ExportWorkbench
          schedule={exportSchedule}
          onScheduleChange={onExportScheduleChange}
          workbookState="current"
          nextRun="Mon 09:00"
          workbookName="Starforge weekly workbook"
          generatedUntil="Generated through May 12"
          sessions={exportSessionRows}
        />
      </div>

      <div className="grid gap-2">
        <ComponentReference names="LiveguardCockpit" />
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
      </div>
    </section>
  )
}

function ChartDirection({
  componentName,
  title,
  badge,
  children,
  className,
}: {
  componentName: string
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
      <ComponentReference names={componentName} />
      <div className="flex items-center justify-between gap-3 px-1">
        <strong className="text-sm">{title}</strong>
        <StatusBadge tone="success">{badge}</StatusBadge>
      </div>
      {children}
    </div>
  )
}

function FoundationsPreview() {
  return (
    <section className="grid gap-4 2xl:grid-cols-2">
      <Card className="2xl:col-span-2">
        <CardHeader>
          <CardTitle>Typography</CardTitle>
          <CardDescription>
            Regular carries the interface. Medium creates hierarchy. Obviously
            appears only when the title itself is the moment.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
          <div className="grid content-start gap-3">
            <p className="font-display text-ui-display font-bold">
              Signals, not noise.
            </p>
            <p className="text-ui-headline font-medium">
              Campaign state should read in one glance.
            </p>
            <p className="max-w-[65ch] text-ui-body text-muted-foreground">
              The everyday interface uses a metric-stable system stack with no
              baseline offsets or per-component corrections.
            </p>
          </div>
          <dl className="grid content-start gap-3">
            <FoundationDefinition
              label="Display"
              value="Obviously Bold · rare title"
            />
            <FoundationDefinition label="Medium" value="500 · hierarchy" />
            <FoundationDefinition label="Regular" value="400 · body" />
            <FoundationDefinition label="Caption floor" value="12px" />
          </dl>
        </CardContent>
      </Card>

      <TypesetWorkbench />

      <Card>
        <CardHeader>
          <CardTitle>Color and surface</CardTitle>
          <CardDescription>
            Quiet graphite layers keep turquoise scarce enough to remain a
            signal.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <FoundationSwatch className="bg-background" label="Canvas" />
          <FoundationSwatch className="bg-nextide-panel" label="Surface" />
          <FoundationSwatch
            className="bg-nextide-panel-strong"
            label="Raised state"
          />
          <FoundationSwatch
            className="bg-nextide-tide text-black"
            label="Signal"
          />
          <FoundationSwatch
            className="bg-nextide-yellow text-black"
            label="Warning"
          />
          <FoundationSwatch
            className="bg-nextide-red text-white"
            label="Danger"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Radius</CardTitle>
          <CardDescription>
            Every control and surface stays between 8 and 12 pixels. True
            circles and data marks are the only exceptions.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-3">
          {[
            { label: "Control", value: "8px", className: "rounded-md" },
            { label: "Surface", value: "10px", className: "rounded-lg" },
            { label: "Overlay", value: "12px", className: "rounded-xl" },
          ].map((radius) => (
            <div
              key={radius.label}
              className={cn(
                "grid min-h-28 place-content-center gap-1 border border-nextide-tide/28 bg-nextide-tide/[0.06] text-center",
                radius.className
              )}
            >
              <strong className="text-ui-label">{radius.label}</strong>
              <span className="text-ui-caption text-muted-foreground">
                {radius.value}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Motion</CardTitle>
          <CardDescription>
            Four timings cover response, control feedback, state change, and
            layout. Motion explains change; it does not decorate rest.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          {[
            { label: "Instant", value: "120ms", detail: "Tooltip and exit" },
            { label: "Control", value: "160ms", detail: "Hover and focus" },
            { label: "State", value: "220ms", detail: "Selection and reveal" },
            { label: "Layout", value: "300ms", detail: "Drawer and reflow" },
          ].map((motion) => (
            <div
              key={motion.label}
              className="group grid gap-3 rounded-lg border border-nextide-line bg-background/25 p-3"
            >
              <span className="h-1.5 overflow-hidden rounded-full bg-nextide-panel-strong">
                <span className="block h-full w-1/3 rounded-full bg-nextide-tide transition-transform duration-[var(--nextide-motion-state)] ease-[var(--nextide-ease-out-quart)] group-hover:translate-x-[200%] motion-reduce:transition-none" />
              </span>
              <span className="grid gap-0.5">
                <strong className="text-ui-label">
                  {motion.label} · {motion.value}
                </strong>
                <span className="text-ui-caption text-muted-foreground">
                  {motion.detail}
                </span>
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Iconography</CardTitle>
          <CardDescription>
            One outline family, consistent optical size, and text labels for
            every non-obvious action.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-wrap gap-3 text-nextide-tide [&_svg]:size-5">
            <Search />
            <CalendarClock />
            <RadioTower />
            <ShieldAlert />
            <Database />
            <Settings />
          </div>
          <p className="text-ui-label text-muted-foreground">
            Lucide is the current shared default. The family can change later;
            mixing families within a product cannot.
          </p>
        </CardContent>
      </Card>
    </section>
  )
}

type TypesetPreset = "compact" | "editorial" | "report"

const typesetPresets: Record<
  TypesetPreset,
  { size: number; leading: number; flow: number }
> = {
  compact: { size: 14, leading: 1.55, flow: 0.9 },
  editorial: { size: 16, leading: 1.7, flow: 1.25 },
  report: { size: 17, leading: 1.75, flow: 1.45 },
}

function TypesetWorkbench() {
  const [preset, setPreset] = useState<TypesetPreset>("editorial")
  const [settings, setSettings] = useState(typesetPresets.editorial)
  const updateSetting = (
    key: keyof (typeof typesetPresets)[TypesetPreset],
    value: number | readonly number[]
  ) => {
    const nextValue = Array.isArray(value) ? value[0] : value
    setSettings((current) => ({ ...current, [key]: nextValue }))
  }
  const applyPreset = (nextPreset: string) => {
    const resolvedPreset = nextPreset as TypesetPreset
    setPreset(resolvedPreset)
    setSettings(typesetPresets[resolvedPreset])
  }

  return (
    <Card className="2xl:col-span-2">
      <CardHeader>
        <CardTitle>Typeset workbench</CardTitle>
        <CardDescription>
          Tune shadcn Typeset rhythm against real report content. These three
          variables are the shared contract; product screens own the words.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="grid content-start gap-5 self-start rounded-lg border border-nextide-line bg-background/20 p-4">
          <SegmentedControl
            value={preset}
            options={[
              { value: "compact", label: "Compact" },
              { value: "editorial", label: "Editorial" },
              { value: "report", label: "Report" },
            ]}
            onValueChange={applyPreset}
            aria-label="Typeset preset"
          />
          <TypesetControl
            label="Size"
            value={`${settings.size}px`}
            min={13}
            max={19}
            step={1}
            sliderValue={settings.size}
            onValueChange={(value) => updateSetting("size", value)}
          />
          <TypesetControl
            label="Leading"
            value={settings.leading.toFixed(2)}
            min={1.4}
            max={1.9}
            step={0.05}
            sliderValue={settings.leading}
            onValueChange={(value) => updateSetting("leading", value)}
          />
          <TypesetControl
            label="Flow"
            value={`${settings.flow.toFixed(2)}em`}
            min={0.75}
            max={1.75}
            step={0.05}
            sliderValue={settings.flow}
            onValueChange={(value) => updateSetting("flow", value)}
          />
        </div>
        <article
          className="typeset min-w-0 rounded-lg border border-nextide-line bg-nextide-panel p-5 sm:p-6"
          style={
            {
              "--typeset-size": `${settings.size}px`,
              "--typeset-leading": settings.leading,
              "--typeset-flow": `${settings.flow}em`,
            } as CSSProperties
          }
        >
          <h1>Campaign signal review</h1>
          <p>
            Delivery is pacing <strong>within the approved range</strong>. Two
            creator sessions need review before the next flight begins.
          </p>
          <h2>What changed</h2>
          <p>
            Qualified reach increased after the safety threshold moved from
            <code>0.68</code> to <code>0.72</code>. The recommendation remains
            visible until an operator approves it.
          </p>
          <blockquote>
            Keep the decision legible: show the proposed result, its evidence,
            and the human approval state together.
          </blockquote>
          <ul>
            <li>18 creators are ready for review.</li>
            <li>2 category overrides require confirmation.</li>
            <li>Exported evidence remains attached to the report.</li>
          </ul>
        </article>
      </CardContent>
    </Card>
  )
}

function TypesetControl({
  label,
  value,
  sliderValue,
  min,
  max,
  step,
  onValueChange,
}: {
  label: string
  value: string
  sliderValue: number
  min: number
  max: number
  step: number
  onValueChange: (value: number | readonly number[]) => void
}) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center justify-between gap-3 text-ui-caption text-muted-foreground">
        <span className="font-medium uppercase">{label}</span>
        <output className="font-mono text-foreground">{value}</output>
      </span>
      <Slider
        value={sliderValue}
        min={min}
        max={max}
        step={step}
        onValueChange={onValueChange}
        aria-label={`Typeset ${label.toLowerCase()}`}
      />
    </label>
  )
}

function FoundationDefinition({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-3 border-b border-nextide-line pb-2 last:border-b-0 last:pb-0">
      <dt className="text-ui-caption font-medium text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="text-ui-label font-medium">{value}</dd>
    </div>
  )
}

function FoundationSwatch({
  className,
  label,
}: {
  className?: string
  label: string
}) {
  return (
    <div
      className={cn(
        "flex min-h-20 items-end rounded-lg border border-nextide-line p-3",
        className
      )}
    >
      <strong className="text-ui-label">{label}</strong>
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
  const [creatorQuery, setCreatorQuery] = useState("")
  const [duration, setDuration] = useState<DurationValue>({
    days: 2,
    hours: 2,
    minutes: 33,
  })

  return (
    <Surface className="grid gap-4">
      <SurfaceHeader>
        <ComponentReference names={["Surface", "Card"]} />
        <SurfaceTitle>Primitives</SurfaceTitle>
        <SurfaceDescription>
          Buttons, controls, badges, metrics, and notices.
        </SurfaceDescription>
      </SurfaceHeader>

      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,20rem),1fr))] gap-4">
        <Card>
          <CardHeader>
            <ComponentReference names="Button" />
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
            <CardTitle>Overlays and scroll</CardTitle>
            <CardDescription>
              Focused details and compact overflow surfaces.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <ComponentReference names={["Popover", "Tooltip"]} />
              <div className="flex flex-wrap gap-2">
                <Popover>
                  <PopoverTrigger render={<Button variant="outline" />}>
                    Open details
                  </PopoverTrigger>
                  <PopoverContent>
                    <PopoverHeader>
                      <PopoverTitle>Shared preview</PopoverTitle>
                      <PopoverDescription>
                        Review compact overlays without leaving the page.
                      </PopoverDescription>
                    </PopoverHeader>
                  </PopoverContent>
                </Popover>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger render={<Button variant="outline" />}>
                      Hover for status
                    </TooltipTrigger>
                    <TooltipContent>All checks are ready.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <div className="grid gap-2">
              <ComponentReference names="ScrollArea" />
              <ScrollArea className="h-28 rounded-lg border border-nextide-line bg-background/25">
                <div className="grid gap-2 p-3 text-sm">
                  {[
                    "Campaign summary",
                    "Creator confidence",
                    "Safety review",
                    "Export schedule",
                    "Delivery status",
                  ].map((label) => (
                    <div
                      key={label}
                      className="rounded-md bg-nextide-panel px-3 py-2"
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
            <CardDescription>
              Compact form controls for dense app surfaces.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <ComponentReference names="Input" />
              <Input defaultValue="Sponsored report" aria-label="Report name" />
            </div>
            <div className="grid gap-2">
              <ComponentReference names="DurationPicker" />
              <DurationPicker
                showDays
                maxDays={365}
                value={duration}
                onValueChange={setDuration}
              />
              <output
                data-slot="duration-picker-output"
                className="text-ui-caption text-muted-foreground"
                aria-live="polite"
              >
                {duration.days ?? 0} d {duration.hours} hr {duration.minutes}{" "}
                min
              </output>
            </div>
            <div className="grid gap-2">
              <ComponentReference names="Checkbox" />
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={checked}
                  onCheckedChange={(value) => onCheckedChange(value === true)}
                />
                <span className="text-sm">Include degraded runs</span>
              </div>
            </div>
            <div className="grid gap-2">
              <ComponentReference names="Switch" />
              <div className="flex items-center gap-3">
                <Switch checked={enabled} onCheckedChange={onEnabledChange} />
                <span className="text-sm">Runtime checks</span>
              </div>
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
            <div className="grid gap-2">
              <ComponentReference names="SegmentedControl" />
              <SegmentedControl
                value={density}
                options={[
                  { value: "compact", label: "Compact" },
                  { value: "comfortable", label: "Comfort" },
                  { value: "spacious", label: "Spacious" },
                ]}
                onValueChange={onDensityChange}
              />
            </div>
            <div className="grid gap-2">
              <ComponentReference names="Slider" />
              <Slider
                value={confidence}
                min={0}
                max={100}
                step={1}
                onValueChange={(nextValue) =>
                  onConfidenceChange(
                    Array.isArray(nextValue) ? [...nextValue] : [nextValue]
                  )
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <ComponentReference names="Autocomplete" />
            <CardTitle>Autocomplete</CardTitle>
            <CardDescription>
              Free-form search with inline suggestions and keyboard selection.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Autocomplete
              items={intelligenceCreators}
              itemToStringValue={autocompleteCreatorValue}
              mode="both"
              openOnInputClick
              value={creatorQuery}
              onValueChange={setCreatorQuery}
            >
              <label
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
                htmlFor="creator-autocomplete-preview"
              >
                Find a creator
              </label>
              <AutocompleteInputGroup>
                <Search />
                <AutocompleteInput
                  id="creator-autocomplete-preview"
                  placeholder="Search creators"
                />
                <AutocompleteClear aria-label="Clear creator search" />
              </AutocompleteInputGroup>
              <AutocompletePortal>
                <AutocompletePositioner>
                  <AutocompleteContent>
                    <AutocompleteEmpty>No creators found.</AutocompleteEmpty>
                    <AutocompleteList>
                      {(creator: (typeof intelligenceCreators)[number]) => (
                        <AutocompleteItem key={creator.id} value={creator}>
                          <Avatar size="sm">
                            <AvatarFallback>{creator.avatar}</AvatarFallback>
                          </Avatar>
                          <span className="grid min-w-0">
                            <strong className="truncate font-medium">
                              {creator.name}
                            </strong>
                            <small className="truncate text-muted-foreground">
                              {creator.meta}
                            </small>
                          </span>
                        </AutocompleteItem>
                      )}
                    </AutocompleteList>
                  </AutocompleteContent>
                </AutocompletePositioner>
              </AutocompletePortal>
            </Autocomplete>
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
            <div className="grid gap-2">
              <ComponentReference names={["StatusBadge", "Badge"]} />
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone="success">Ready</StatusBadge>
                <StatusBadge tone="processing" indicator="pulse">
                  Processing
                </StatusBadge>
                <StatusBadge tone="warning">Degraded</StatusBadge>
                <StatusBadge tone="danger">Failed</StatusBadge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </div>
            <div className="grid gap-2">
              <ComponentReference names="Notice" />
              <Notice title="Projection cache warm" tone="info">
                Read model data is available for the current playground run.
              </Notice>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <ComponentReference names="ProcessingText" />
            <CardTitle>Processing text</CardTitle>
            <CardDescription>
              Three named styles moving at the same travel speed across any text
              length.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              {
                label: "Classic",
                variant: "classic" as const,
                copy: "Preparing your campaign report",
              },
              {
                label: "Aurora",
                variant: "aurora" as const,
                copy: "Analyzing creator evidence",
              },
              {
                label: "Flame",
                variant: "flame" as const,
                copy: "Generating delivery insights",
              },
            ].map((example) => (
              <div
                key={example.variant}
                className="grid gap-1.5 rounded-lg border border-nextide-line bg-background/25 p-3"
              >
                <strong className="text-ui-caption text-muted-foreground">
                  ProcessingText · {example.label}
                </strong>
                <p className="text-ui-title font-medium">
                  <ProcessingText variant={example.variant}>
                    {example.copy}
                  </ProcessingText>
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Identity and feedback</CardTitle>
            <CardDescription>
              Compact identity, progress, loading, and empty states.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <ComponentReference names={["Avatar", "AvatarGroup"]} />
              <AvatarGroup>
                {intelligenceCreators.slice(0, 3).map((creator, index) => (
                  <Avatar key={creator.id}>
                    <AvatarFallback>{creator.avatar}</AvatarFallback>
                    {index === 0 ? <AvatarBadge aria-hidden="true" /> : null}
                  </Avatar>
                ))}
                <AvatarGroupCount>+2</AvatarGroupCount>
              </AvatarGroup>
            </div>
            <div className="grid gap-2">
              <ComponentReference names="Progress" />
              <Progress value={72}>
                <ProgressLabel>Profile readiness</ProgressLabel>
                <ProgressValue />
              </Progress>
            </div>
            <div className="grid gap-2">
              <ComponentReference names="Spinner" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Spinner />
                Refreshing preview
              </div>
            </div>
            <div className="grid gap-2">
              <ComponentReference names="Skeleton" />
              <div className="flex items-center gap-3" aria-hidden="true">
                <Skeleton className="size-9 rounded-full" />
                <div className="grid flex-1 gap-2">
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <ComponentReference names="Empty" />
              <Empty className="min-h-32 border border-nextide-line bg-background/20">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Search />
                  </EmptyMedia>
                  <EmptyTitle>No saved views</EmptyTitle>
                  <EmptyDescription>
                    Saved views will appear here.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            </div>
          </CardContent>
        </Card>
      </div>
    </Surface>
  )
}

function BlockPreview({ motionScale }: { motionScale: number }) {
  const navigationDrawer = useStagedDrawer({
    durationMs: DRAWER_STAGE_DURATION_MS * motionScale,
    iconDurationMs: DRAWER_ICON_STAGE_DURATION_MS * motionScale,
  })
  const [activeNavigationItemId, updateActiveNavigationItemId] = useReducer(
    (_current: string, nextItemId: string) => nextItemId,
    "dashboard"
  )
  const activeNavigationLabel =
    blockPreviewNavigationLabels[activeNavigationItemId] ?? "Dashboard"

  return (
    <Surface className="grid gap-4">
      <SurfaceHeader>
        <ComponentReference names="Surface" />
        <SurfaceTitle>Blocks</SurfaceTitle>
        <SurfaceDescription>
          Composed app patterns that stay outside primitive components.
        </SurfaceDescription>
      </SurfaceHeader>

      <div className="grid gap-4 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <Surface variant="plain" className="grid content-start">
          <div className="grid gap-1 pb-2">
            <strong className="text-sm">Pattern coverage</strong>
            <span className="text-xs text-muted-foreground">
              Shared compositions proven against a real workspace frame.
            </span>
          </div>
          {[
            {
              icon: Database,
              title: "AppShell",
              detail: "Sidebar, workspace, and inspector",
            },
            {
              icon: Layers3,
              title: "ProgressiveSummaryRail",
              detail: "Stable sections with live values",
            },
            {
              icon: PanelLeft,
              title: "NavigationPanel",
              detail: "Workspace and system wayfinding",
            },
            {
              icon: Check,
              title: "WorkflowStepper",
              detail: "Active and completed decisions",
            },
          ].map((pattern) => (
            <div
              key={pattern.title}
              className="grid min-h-11 grid-cols-[1.75rem_minmax(0,1fr)] items-center gap-2 border-t border-nextide-line py-1.5 first:border-t-0"
            >
              <span className="grid size-7 place-items-center self-center rounded-md border border-nextide-line bg-background/30 text-nextide-tide">
                <pattern.icon className="size-3.5" />
              </span>
              <span className="grid min-w-0 gap-0.5">
                <ComponentReference names={pattern.title} />
                <span className="truncate text-ui-caption text-muted-foreground">
                  {pattern.detail}
                </span>
              </span>
            </div>
          ))}
        </Surface>

        <div className="grid gap-2">
          <ComponentReference names="ProgressiveSummaryRail" />
          <ProgressiveSummaryRail
            title="Progressive summary"
            description="Section headers remain stable while confirmed values enter the review."
            sections={[
              {
                id: "report",
                title: "Report",
                summary: "Creator fit review",
                rows: [
                  {
                    id: "brand",
                    label: "Brand",
                    badge: "BR",
                    value: "Daedalus",
                  },
                ],
              },
              {
                id: "campaign",
                title: "Campaign shape",
                rows: [],
                emptyLabel: "Waiting for campaign input",
              },
              {
                id: "safety",
                title: "Safety gate",
                summary: "0.72 minimum",
                rows: [
                  { id: "qualified", label: "qualified creators", badge: "18" },
                  { id: "overrides", label: "category overrides", badge: "2" },
                ],
              },
            ]}
            className="rounded-xl border border-nextide-line bg-nextide-panel p-4"
          />
        </div>
      </div>

      <ComponentReference
        names={["NavigationPanel", "NavigationUserMenu", "Metric", "Separator"]}
      />
      <div
        className={cn(
          "grid min-h-[34rem] grid-cols-1 items-start gap-3 overflow-hidden rounded-xl border border-nextide-line bg-black/20 p-3 transition-[grid-template-columns] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
          "lg:grid-cols-[18rem_minmax(0,1fr)]",
          navigationDrawer.collapsed && "lg:grid-cols-[4.5rem_minmax(0,1fr)]"
        )}
      >
        <div className="h-full min-h-[31rem] min-w-0 overflow-visible">
          <NavigationPanel
            brand="Nextide"
            eyebrow="Platform"
            activeItemId={activeNavigationItemId}
            collapsed={navigationDrawer.iconsCollapsed}
            drawerCollapsed={navigationDrawer.drawerCollapsed}
            drawerTransitioning={navigationDrawer.transitioning}
            commandShortcut=""
            footer={
              <div className="grid gap-2 text-xs text-muted-foreground">
                <StatusBadge tone="success">Workspace live</StatusBadge>
                <span>Shared staged drawer motion</span>
              </div>
            }
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
              <strong className="text-xl leading-tight font-medium">
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
