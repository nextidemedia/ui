import {
  BookOpenText,
  Boxes,
  BriefcaseBusiness,
  Building2,
  Check,
  FileText,
  Gauge,
  Layers3,
  PanelLeft,
  RadioTower,
  Search,
  ServerCog,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react"

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
  {
    id: "swap-workspace",
    label: "Swap workspace",
    pinned: true,
    items: [
      {
        id: "platform",
        label: "Platform shell",
        meta: "Shared application frame",
        icon: <PanelLeft />,
      },
    ],
  },
]

const krakenNavigationSections = [
  {
    id: "kraken",
    label: "Kraken",
    items: [
      { id: "kraken-discovery", label: "Discovery", icon: <Search /> },
      {
        id: "kraken-creator-fit",
        label: "Creator Fit",
        icon: <UsersRound />,
      },
      {
        id: "kraken-campaign-reports",
        label: "Campaign Reports",
        icon: <FileText />,
      },
      {
        id: "kraken-creator-portal",
        label: "Creator Portal",
        icon: <UserRound />,
      },
      {
        id: "kraken-brand-portal",
        label: "Brand Portal",
        icon: <Building2 />,
      },
    ],
  },
  {
    id: "live",
    label: "Live",
    items: [
      {
        id: "kraken-live-events",
        label: "Live Events",
        icon: <RadioTower />,
      },
    ],
  },
  {
    id: "internal",
    label: "Internal",
    items: [
      { id: "kraken-brand-focus", label: "Brand Focus", icon: <Gauge /> },
      {
        id: "kraken-catalog-review",
        label: "Catalog Review",
        icon: <Check />,
      },
      {
        id: "kraken-creator-rosters",
        label: "Creator Rosters",
        icon: <Boxes />,
      },
      {
        id: "kraken-universe",
        label: "Universe (Demo)",
        icon: <Sparkles />,
      },
    ],
  },
  {
    id: "swap-workspace",
    label: "Swap workspace",
    pinned: true,
    items: [
      {
        id: "system-workbench",
        label: "System workbench",
        meta: "Shared UI reference",
        icon: <PanelLeft />,
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
  "summer-launch": "Summer launch",
  "partner-rollout": "Partner rollout",
}

const shellDensityOptions = [
  { value: "current", label: "Large" },
  { value: "compact", label: "Compact" },
  { value: "ops", label: "Ops" },
]

export {
  blockPreviewNavigationLabels,
  krakenNavigationSections,
  shellDensityOptions,
  workbenchNavigationSections,
  workbenchViewByItemId,
}

export type { PlaygroundViewMode }
