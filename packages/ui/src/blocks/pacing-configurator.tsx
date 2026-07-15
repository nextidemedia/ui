import * as React from "react"
import { RotateCcw, Save } from "lucide-react"

import { Button } from "@nextide/ui/components/button"
import {
  HourlyPacingChart,
  type HourlyPacingBucket,
} from "@nextide/ui/components/hourly-pacing-chart"
import { Metric } from "@nextide/ui/components/metric"
import { SegmentedControl } from "@nextide/ui/components/segmented-control"
import { StatusBadge } from "@nextide/ui/components/status-badge"
import {
  Surface,
  SurfaceDescription,
  SurfaceHeader,
  SurfaceTitle,
} from "@nextide/ui/components/surface"
import { cn } from "@nextide/ui/lib/utils"

type PacingPreset = {
  id: string
  label: React.ReactNode
  meta?: React.ReactNode
}

function PacingConfigurator({
  presets,
  activePresetId,
  buckets,
  title = "Pacing configurator",
  description = "Preset range, active delivery window, and hourly pressure.",
  targetValue = 100,
  rangeLabel,
  targetLabel,
  actualLabel,
  onPresetChange,
  onSave,
  onRevert,
  className,
  ...props
}: React.ComponentProps<typeof Surface> & {
  presets: PacingPreset[]
  activePresetId: string
  buckets: HourlyPacingBucket[]
  title?: React.ReactNode
  description?: React.ReactNode
  targetValue?: number
  rangeLabel?: React.ReactNode
  targetLabel?: React.ReactNode
  actualLabel?: React.ReactNode
  onPresetChange?: (preset: PacingPreset) => void
  onSave?: () => void
  onRevert?: () => void
}) {
  const activePreset =
    presets.find((preset) => preset.id === activePresetId) ?? presets[0]

  return (
    <Surface
      data-slot="pacing-configurator"
      className={cn("grid gap-4", className)}
      {...props}
    >
      <SurfaceHeader>
        <SurfaceTitle>{title}</SurfaceTitle>
        {description ? (
          <SurfaceDescription>{description}</SurfaceDescription>
        ) : null}
      </SurfaceHeader>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="nextide-contained-scroll nextide-scrollbar-none max-w-full overflow-x-auto">
          <SegmentedControl
            value={activePreset?.id ?? ""}
            size="tall"
            className="min-w-[30rem]"
            aria-label="Pacing preset"
            options={presets.map((preset) => ({
              value: preset.id,
              label: (
                <span className="grid min-w-0 gap-0.5 text-left">
                  <strong className="truncate font-medium">
                    {preset.label}
                  </strong>
                  {preset.meta ? (
                    <span className="truncate text-ui-caption opacity-75">
                      {preset.meta}
                    </span>
                  ) : null}
                </span>
              ),
            }))}
            onValueChange={(presetId) => {
              const preset = presets.find((item) => item.id === presetId)
              if (preset) onPresetChange?.(preset)
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={onRevert}>
            <RotateCcw />
            Revert
          </Button>
          <Button type="button" onClick={onSave}>
            <Save />
            Save
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Metric
          value={rangeLabel ?? activePreset?.label ?? "Custom"}
          label="Range"
          detail={activePreset?.meta ?? "Viewport preset"}
        />
        <Metric value={targetLabel ?? `${targetValue}%`} label="Target" />
        <Metric
          value={actualLabel ?? "Live"}
          label="Delivery"
          detail="Current pacing"
        />
      </div>

      <HourlyPacingChart
        buckets={buckets}
        targetValue={targetValue}
        title="Per-hour pacing"
        description="Compare each delivery hour against the campaign target."
      />

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <StatusBadge tone="success">Preset ready</StatusBadge>
        <span>Review the delivery window, then save the pacing plan.</span>
      </div>
    </Surface>
  )
}

export { PacingConfigurator, type PacingPreset }
