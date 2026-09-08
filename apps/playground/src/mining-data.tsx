import { type CampaignScheduleBooking } from "@nextide/ui/blocks/campaign-schedule-matrix"
import { type ReportRailItem } from "@nextide/ui/blocks/report-rail"
import { type RunMonitorRow } from "@nextide/ui/blocks/run-monitor-table"
import { type HourlyPacingBucket } from "@nextide/ui/components/hourly-pacing-chart"
import type { ScheduleControlValue } from "@nextide/ui/components/schedule-control"
const scheduleCreators = [
  { id: "mina", name: "Mina Vale", meta: "Twitch / YouTube", avatar: "MV" },
  { id: "ren", name: "Ren Kade", meta: "Kick", avatar: "RK" },
  { id: "taro", name: "Taro", meta: "YouTube", avatar: "TA" },
  { id: "ivy", name: "Ivy North", meta: "Twitch partner", avatar: "IN" },
]
const scheduleDays = Array.from({ length: 91 }, (_, index) => {
  const date = new Date(Date.UTC(2026, 4, 11 + index))
  const dateKey = date.toISOString().slice(0, 10)

  return {
    id: dateKey,
    date: dateKey,
    today: index === 23,
  }
})
const scheduleBookings: CampaignScheduleBooking[] = [
  {
    id: "booking-1",
    creatorId: "mina",
    title: "Launch read",
    meta: "Primary launch flight",
    startIndex: 0,
    endIndex: 18,
    tone: "success",
    status: "Live",
    statusIndicator: "pulse",
  },
  {
    id: "booking-2",
    creatorId: "ren",
    title: "Challenge stream",
    meta: "Guarded creator flight",
    startIndex: 21,
    endIndex: 42,
    tone: "warning",
    status: "Review",
  },
  {
    id: "booking-3",
    creatorId: "taro",
    title: "Late recap",
    meta: "Workbook and VOD follow-up",
    startIndex: 45,
    endIndex: 66,
    tone: "processing",
    status: "Queued",
  },
  {
    id: "booking-4",
    creatorId: "ivy",
    title: "Co-stream proof",
    meta: "Cross-channel proof window",
    startIndex: 63,
    endIndex: 84,
    tone: "success",
    status: "Ready",
  },
]
const pacingBuckets: HourlyPacingBucket[] = [
  64, 48, 38, 32, 36, 44, 52, 63, 76, 91, 118, 143, 174, 152, 126, 112, 109,
  138, 185, 242, 296, 304, 248, 162,
].map((value, hour) => ({
  id: `pacing-${hour}`,
  hour,
  value,
  detail: hour >= 19 && hour <= 21 ? "prime window" : "delivery pressure",
}))
const exportSchedule: ScheduleControlValue = {
  cadence: "weekly",
  time: "09:00",
  weekdayIso: 1,
  dayOfMonth: 1,
  biweeklyAnchor: "this",
}
const runRows: RunMonitorRow[] = [
  {
    id: "run-1",
    title: "Starforge launch room",
    owner: "Mina Vale",
    source: "Twitch",
    startedAt: "18:04",
    duration: "2h 44m",
    status: "Complete",
    tone: "success",
    stages: [
      { id: "vod", label: "VOD", status: "complete" },
      { id: "chat", label: "Chat", status: "complete" },
      { id: "fuse", label: "Fuse", status: "complete" },
      { id: "report", label: "Report", status: "complete" },
    ],
  },
  {
    id: "run-2",
    title: "Sponsored challenge slot",
    owner: "Ren Kade",
    source: "Kick",
    startedAt: "19:12",
    duration: "46m",
    status: "Running",
    tone: "processing",
    stages: [
      { id: "vod", label: "VOD", status: "complete" },
      { id: "chat", label: "Chat", status: "running" },
      { id: "fuse", label: "Fuse", status: "queued" },
      { id: "report", label: "Report", status: "queued" },
    ],
  },
  {
    id: "run-3",
    title: "Late recap safety pass",
    owner: "Taro",
    source: "YouTube",
    startedAt: "20:35",
    duration: "18m",
    status: "Review",
    tone: "warning",
    stages: [
      { id: "vod", label: "VOD", status: "complete" },
      { id: "chat", label: "Chat", status: "complete" },
      { id: "fuse", label: "Fuse", status: "running" },
      { id: "report", label: "Report", status: "queued" },
    ],
  },
]
const reportHistory: ReportRailItem[] = [
  {
    id: "report-current",
    title: "Starforge weekly report",
    meta: "Creators, streams, context, proof",
    status: "completed",
    timestamp: "Today 09:14",
  },
  {
    id: "report-processing",
    title: "Daedalus pilot fuse",
    meta: "Chat evidence still running",
    status: "processing",
    timestamp: "12m ago",
  },
  {
    id: "report-draft",
    title: "Orbit creator draft",
    meta: "Missing context bucket",
    status: "draft",
    timestamp: "Yesterday",
  },
]
export {
  exportSchedule,
  pacingBuckets,
  reportHistory,
  runRows,
  scheduleBookings,
  scheduleCreators,
  scheduleDays,
}
