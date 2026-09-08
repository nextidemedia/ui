import { type DashboardFilterItem } from "@nextide/ui/blocks/dashboard-filter-bar"
import {
  type LineItemGraphDay,
  type LineItemGraphSeries,
} from "@nextide/ui/components/line-item-graph"
import { StatusBadge } from "@nextide/ui/components/status-badge"

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
    id: "campaign-helix",
    groupId: "campaign",
    title: "Helix Launch Week",
    subtitle: "12 creators · starts Monday",
    badge: "Ready",
    tone: "success",
  },
  {
    id: "campaign-neon",
    groupId: "campaign",
    title: "Neon Arena Series",
    subtitle: "4 live · 2 awaiting proof",
    badge: "Watch",
    tone: "warning",
  },
  {
    id: "campaign-atlas",
    groupId: "campaign",
    title: "Atlas Creator Sprint",
    subtitle: "Daily report at 18:00",
    badge: "Export",
    tone: "processing",
  },
  {
    id: "campaign-ember",
    groupId: "campaign",
    title: "Ember Winter Drop",
    subtitle: "Creative review in progress",
    badge: "Review",
    tone: "neutral",
  },
  {
    id: "campaign-vanguard",
    groupId: "campaign",
    title: "Vanguard Finals",
    subtitle: "8 creators · all approved",
    badge: "Ready",
    tone: "success",
  },
  {
    id: "campaign-lumen",
    groupId: "campaign",
    title: "Lumen Partner Flight",
    subtitle: "Partner evidence attached",
    badge: "Scoped",
    tone: "success",
  },
  {
    id: "campaign-afterglow",
    groupId: "campaign",
    title: "Afterglow Retargeting",
    subtitle: "Pacing 6% above plan",
    badge: "Pacing",
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

export {
  bannerImpressionDays,
  bannerImpressionSeries,
  campaignLinePoints,
  channelMixSegments,
  daedalusFilterGroups,
  daedalusFilterItems,
  exportSessionRows,
  hourlyPacingBuckets,
  liveguardCreators,
  liveguardIncidents,
  weeklyImpressionDays,
  weeklyImpressionSeries,
  weeklyTrendRows,
}
