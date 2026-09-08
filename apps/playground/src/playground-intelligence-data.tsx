import { type IntelligenceProgressionStage } from "@nextide/ui/blocks/intelligence-progression-chart"
import { type ReportContextBucket } from "@nextide/ui/blocks/report-context-builder"
import { type StreamSelectorItem } from "@nextide/ui/blocks/stream-selector"
import { type CreatorFlowSession } from "@nextide/ui/components/creator-flow-chart"
import {
  Check,
  FileJson,
  FileText,
  Layers3,
  Search,
  Sparkles,
  Video,
} from "lucide-react"

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
    disabled: true,
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
    disabled: true,
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
    selectionPolicy: "single",
    selected: ["Daedalus"],
    suggestions: ["Nextide", "Starforge", "Orbit"],
  },
  {
    id: "products",
    label: "Products",
    locked: true,
    selected: ["Command center"],
    suggestions: ["Creator roster", "Weekly export", "LiveGuard cockpit"],
  },
  {
    id: "phrases",
    label: "Special phrases",
    disabled: true,
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

export {
  autocompleteCreatorValue,
  intelligenceContextBuckets,
  intelligenceCreators,
  intelligenceFitRows,
  intelligenceFlowSessions,
  intelligenceProgressionStages,
  intelligenceStreamRows,
}
