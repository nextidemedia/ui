import {
  NavigationPanel,
  defaultNavigationPanelSections,
} from "@nextide/ui/blocks/navigation-panel"
import { ProgressiveSummaryRail } from "@nextide/ui/blocks/progressive-summary-rail"
import { Metric } from "@nextide/ui/components/metric"
import { Separator } from "@nextide/ui/components/separator"
import { StatusBadge } from "@nextide/ui/components/status-badge"
import {
  Surface,
  SurfaceDescription,
  SurfaceHeader,
  SurfaceTitle,
} from "@nextide/ui/components/surface"
import { useStagedDrawer } from "@nextide/ui/hooks/use-staged-drawer"
import { cn } from "@nextide/ui/lib/utils"
import {
  Activity,
  Check,
  Circle,
  Database,
  Layers3,
  LoaderCircle,
  PanelLeft,
  Plus,
  ShieldAlert,
  X,
} from "lucide-react"
import { useReducer, useState } from "react"
import { ComponentReference } from "./component-reference"
import { blockPreviewNavigationLabels } from "./playground-navigation-data"
import {
  DRAWER_ICON_STAGE_DURATION_MS,
  DRAWER_STAGE_DURATION_MS,
} from "./playground-state"

function BlockPreview({ motionScale }: { motionScale: number }) {
  const navigation = useBlockNavigation(motionScale)
  const { navigationDrawer, activeNavigationLabel, navigationActionCount } =
    navigation

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
        <BlockPatterns />

        <BlockSummary />
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
        <NavigationPreviewPanel navigation={navigation} />
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
            <div className="grid justify-items-end gap-1">
              <StatusBadge tone="success">Nominal</StatusBadge>
              <span
                aria-live="polite"
                className="text-ui-caption text-muted-foreground"
              >
                {navigationActionCount
                  ? `Create campaign requested ${navigationActionCount} ${navigationActionCount === 1 ? "time" : "times"}`
                  : "No action requested"}
              </span>
            </div>
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

export { BlockPreview }

function BlockPatterns() {
  return (
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
  )
}

function BlockSummary() {
  return (
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
  )
}

function useBlockNavigation(motionScale: number) {
  const navigationDrawer = useStagedDrawer({
    durationMs: DRAWER_STAGE_DURATION_MS * motionScale,
    iconDurationMs: DRAWER_ICON_STAGE_DURATION_MS * motionScale,
  })
  const [activeNavigationItemId, updateActiveNavigationItemId] = useReducer(
    (_current: string, nextItemId: string) => nextItemId,
    "dashboard"
  )
  const [campaignsExpanded, setCampaignsExpanded] = useState(false)
  const [navigationActionCount, setNavigationActionCount] = useState(0)
  const navigationSections = defaultNavigationPanelSections.map((section) => ({
    ...section,
    items: section.items.map((item) =>
      item.id === "campaigns"
        ? {
            ...item,
            expanded: campaignsExpanded,
            action: { label: "Create campaign", icon: <Plus /> },
            children: [
              {
                id: "summer-launch",
                label: "Summer launch",
                status: "Completed",
                tone: "success" as const,
                statusIcon: <Check />,
              },
              {
                id: "partner-rollout",
                label: "Partner rollout",
                status: "Processing",
                tone: "processing" as const,
                statusIcon: (
                  <LoaderCircle className="motion-safe:animate-spin" />
                ),
              },
              {
                id: "creative-review",
                label: "Creative review",
                status: "Degraded",
                tone: "neutral" as const,
                statusIcon: <Circle className="fill-current" />,
              },
              {
                id: "failed-sync",
                label: "Failed sync",
                status: "Failed",
                tone: "danger" as const,
                statusIcon: <X />,
              },
            ],
          }
        : item
    ),
  }))
  const activeNavigationLabel =
    blockPreviewNavigationLabels[activeNavigationItemId] ?? "Dashboard"

  return {
    navigationDrawer,
    activeNavigationItemId,
    updateActiveNavigationItemId,
    navigationSections,
    setNavigationActionCount,
    setCampaignsExpanded,
    activeNavigationLabel,
    navigationActionCount,
  }
}

function NavigationPreviewPanel({
  navigation,
}: {
  navigation: ReturnType<typeof useBlockNavigation>
}) {
  const {
    navigationDrawer,
    activeNavigationItemId,
    navigationSections,
    updateActiveNavigationItemId,
    setNavigationActionCount,
    setCampaignsExpanded,
  } = navigation
  return (
    <div className="h-full min-h-[31rem] min-w-0 overflow-visible">
      <NavigationPanel
        brand="Nextide"
        eyebrow="Platform"
        activeItemId={activeNavigationItemId}
        collapsed={navigationDrawer.iconsCollapsed}
        drawerCollapsed={navigationDrawer.drawerCollapsed}
        drawerTransitioning={navigationDrawer.transitioning}
        sections={navigationSections}
        commandShortcut=""
        footer={
          <div className="grid gap-2 text-xs text-muted-foreground">
            <StatusBadge tone="success">Workspace live</StatusBadge>
            <span>Shared staged drawer motion</span>
          </div>
        }
        onSelectItem={(item) => updateActiveNavigationItemId(item.id)}
        onActionItem={() => setNavigationActionCount((count) => count + 1)}
        onToggleItem={() => setCampaignsExpanded((expanded) => !expanded)}
        onToggle={navigationDrawer.toggleCollapsed}
      />
    </div>
  )
}
