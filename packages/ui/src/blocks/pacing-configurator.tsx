import * as React from "react"
import { RotateCcw, Save } from "lucide-react"

import { Button } from "@nextide/ui/components/button"
import {
  HourlyPacingChart,
  type HourlyPacingBucket,
} from "@nextide/ui/components/hourly-pacing-chart"
import { Metric } from "@nextide/ui/components/metric"
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
        <div
          className="nextide-contained-scroll nextide-scrollbar-none flex max-w-full gap-2 overflow-x-auto rounded-lg border border-nextide-line bg-background/20 p-1"
          role="radiogroup"
          aria-label="Pacing preset"
        >
          {presets.map((preset) => {
            const active = preset.id === activePreset?.id

            return (
              <button
                key={preset.id}
                type="button"
                role="radio"
                aria-checked={active}
                className={cn(
                  "grid min-h-10 min-w-28 content-center rounded-md px-3 text-left text-xs transition-[background-color,color,box-shadow] duration-200",
                  active
                    ? "bg-nextide-tide text-black shadow-[0_0_18px_rgb(30_228_188/0.18)]"
                    : "text-muted-foreground hover:bg-nextide-panel hover:text-foreground"
                )}
                onClick={() => onPresetChange?.(preset)}
              >
                <strong className="truncate font-semibold">
                  {preset.label}
                </strong>
                {preset.meta ? (
                  <span className="truncate text-[0.68rem] opacity-75">
                    {preset.meta}
                  </span>
                ) : null}
              </button>
            )
          })}
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
        description="Ported as a reusable pacing bar grammar with stable bar sizing."
      />

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <StatusBadge tone="success">Preset ready</StatusBadge>
        <span>Configured presets stay outside campaign API wiring.</span>
      </div>
    </Surface>
  )
}

export { PacingConfigurator, type PacingPreset }
