import * as React from "react"
import { Clock, ShieldAlert, ShieldCheck, UsersRound } from "lucide-react"

import { DataLedger } from "@nextide/ui/components/data-ledger"
import { Metric } from "@nextide/ui/components/metric"
import {
  PlatformCluster,
  type PlatformId,
} from "@nextide/ui/components/platform-cluster"
import { ScoreThresholdMeter } from "@nextide/ui/components/score-threshold-meter"
import { StatusBadge } from "@nextide/ui/components/status-badge"
import {
  Surface,
  SurfaceDescription,
  SurfaceHeader,
  SurfaceTitle,
} from "@nextide/ui/components/surface"
import { TokenListEditor } from "@nextide/ui/components/token-list-editor"
import { cn } from "@nextide/ui/lib/utils"

type LiveguardCreatorRow = {
  id: string
  name: React.ReactNode
  platforms: PlatformId[]
  state: React.ReactNode
  lastEvent: React.ReactNode
}

type LiveguardIncidentRow = {
  id: string
  time: React.ReactNode
  creator: React.ReactNode
  type: React.ReactNode
  severity: React.ReactNode
  summary: React.ReactNode
}

function LiveguardCockpit({
  enabled,
  activeRules,
  scheduledCreators,
  cooldown,
  creators,
  incidents,
  watchlistTokens,
  onWatchlistTokensChange,
  score,
  threshold,
  className,
  ...props
}: React.ComponentProps<typeof Surface> & {
  enabled: boolean
  activeRules: number
  scheduledCreators: number
  cooldown: React.ReactNode
  creators: LiveguardCreatorRow[]
  incidents: LiveguardIncidentRow[]
  watchlistTokens: string[]
  onWatchlistTokensChange: (tokens: string[]) => void
  score: number
  threshold: number
}) {
  return (
    <Surface
      data-slot="liveguard-cockpit"
      className={cn("grid gap-4", className)}
      {...props}
    >
      <SurfaceHeader>
        <SurfaceTitle>LiveGuard cockpit</SurfaceTitle>
        <SurfaceDescription>
          Campaign safety state, policy tokens, creators, and proof surfaces.
        </SurfaceDescription>
      </SurfaceHeader>

      <div className="grid gap-3 md:grid-cols-4">
        <Metric
          icon={enabled ? <ShieldCheck /> : <ShieldAlert />}
          value={enabled ? "Enabled" : "Disabled"}
          label="LiveGuard"
          detail={enabled ? "Policy active" : "Suppression disabled"}
          className={
            enabled ? "border-nextide-tide/35" : "border-nextide-red/35"
          }
        />
        <Metric
          icon={<ShieldAlert />}
          value={activeRules}
          label="Safety rules"
          detail="Configured categories"
        />
        <Metric
          icon={<UsersRound />}
          value={scheduledCreators}
          label="Scheduled creators"
          detail="Current campaign"
        />
        <Metric
          icon={<Clock />}
          value={cooldown}
          label="Cooldown"
          detail="Delivery window"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Surface variant="plain" className="grid gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <strong className="text-sm">Policy watchlist</strong>
            <StatusBadge tone={enabled ? "success" : "neutral"}>
              {enabled ? "Nominal" : "Paused"}
            </StatusBadge>
          </div>
          <TokenListEditor
            tokens={watchlistTokens}
            placeholder="Add brand or keyword"
            onTokensChange={onWatchlistTokensChange}
          />
          <ScoreThresholdMeter score={score} threshold={threshold} />
        </Surface>

        <div className="grid gap-4">
          <DataLedger
            title="Scheduled creators"
            description="Runtime safety states by creator."
            countLabel={`${creators.length} creators`}
          >
            <div className="grid min-w-[34rem] gap-2">
              {creators.map((creator) => (
                <div
                  key={creator.id}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-lg border border-nextide-line bg-background/25 p-2 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <PlatformCluster platforms={creator.platforms} size="sm" />
                    <span className="min-w-0 truncate">{creator.name}</span>
                  </span>
                  <span>{creator.state}</span>
                  <span className="text-muted-foreground">
                    {creator.lastEvent}
                  </span>
                </div>
              ))}
            </div>
          </DataLedger>

          <DataLedger
            title="Incident history"
            description="Recent proof rows with policy outcome."
            countLabel={`${incidents.length} incidents`}
          >
            <div className="grid min-w-[42rem] gap-2">
              <div className="grid grid-cols-[0.7fr_1fr_1fr_0.8fr_1.6fr] gap-3 px-2 text-xs font-medium text-muted-foreground">
                <span>Time</span>
                <span>Creator</span>
                <span>Type</span>
                <span>Severity</span>
                <span>Summary</span>
              </div>
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="grid grid-cols-[0.7fr_1fr_1fr_0.8fr_1.6fr] items-center gap-3 rounded-lg border border-nextide-line bg-background/25 p-2 text-sm"
                >
                  <span className="text-muted-foreground">{incident.time}</span>
                  <span className="truncate">{incident.creator}</span>
                  <span>{incident.type}</span>
                  <span>{incident.severity}</span>
                  <span className="truncate text-muted-foreground">
                    {incident.summary}
                  </span>
                </div>
              ))}
            </div>
          </DataLedger>
        </div>
      </div>
    </Surface>
  )
}

export { LiveguardCockpit, type LiveguardCreatorRow, type LiveguardIncidentRow }
