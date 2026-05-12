import { useState } from "react"
import {
  Activity,
  BarChart3,
  Boxes,
  Check,
  Database,
  Download,
  FileText,
  Layers3,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
} from "lucide-react"

import { AppShell } from "@nextide/ui/blocks/app-shell"
import { Sidebar } from "@nextide/ui/blocks/sidebar"
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
import { Input } from "@nextide/ui/components/input"
import { Metric } from "@nextide/ui/components/metric"
import { Notice } from "@nextide/ui/components/notice"
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
    meta: "3 patterns",
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

export function App() {
  const [activeItemId, setActiveItemId] = useState("primitives")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [density, setDensity] = useState("comfortable")
  const [confidence, setConfidence] = useState([72])
  const [checked, setChecked] = useState(true)
  const [enabled, setEnabled] = useState(true)
  const [activeStepId, setActiveStepId] = useState("blocks")

  return (
    <AppShell
      collapsed={sidebarCollapsed}
      sidebar={
        <Sidebar
          brand="nextide"
          eyebrow="UI package"
          items={sidebarItems}
          activeItemId={activeItemId}
          collapsed={sidebarCollapsed}
          actionLabel="New block"
          footer={
            <div className="grid gap-2 text-xs text-muted-foreground">
              <StatusBadge tone="success">Local package</StatusBadge>
              <span>@nextide/ui</span>
            </div>
          }
          onAction={() => setActiveItemId("blocks")}
          onSelectItem={(item) => setActiveItemId(item.id)}
          onToggle={() => setSidebarCollapsed((value) => !value)}
        />
      }
      aside={<Inspector density={density} confidence={confidence[0] ?? 0} />}
    >
      <div className="grid gap-4">
        <Surface variant="strong" className="grid gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <SurfaceHeader>
              <SurfaceDescription>Shared component package</SurfaceDescription>
              <h1 className="max-w-3xl text-3xl leading-tight font-semibold tracking-normal">
                Nextide UI primitives and product blocks
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
            completedStepIds={["scaffold", "primitives"]}
            onStepChange={(step) => setActiveStepId(step.id)}
          />
        </Surface>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="grid gap-4">
            <ComponentMatrix
              density={density}
              confidence={confidence}
              checked={checked}
              enabled={enabled}
              onDensityChange={setDensity}
              onConfidenceChange={setConfidence}
              onCheckedChange={setChecked}
              onEnabledChange={setEnabled}
            />
            <BlockPreview />
          </div>
          <Surface className="grid content-start gap-4">
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
      </div>
    </AppShell>
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
            <strong className="text-sm">Sidebar</strong>
          </div>
          <Separator />
          <p className="text-sm text-muted-foreground">
            Brand, action, status-aware nav items, collapse behavior, and footer
            slot.
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
    </Surface>
  )
}

function Inspector({
  density,
  confidence,
}: {
  density: string
  confidence: number
}) {
  return (
    <Surface className="grid gap-4">
      <SurfaceHeader>
        <SurfaceTitle>Inspector</SurfaceTitle>
        <SurfaceDescription>Live playground state.</SurfaceDescription>
      </SurfaceHeader>
      <div className="grid gap-3 text-sm">
        <InspectorRow label="Package" value="@nextide/ui" />
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
