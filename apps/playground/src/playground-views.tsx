import { Metric } from "@nextide/ui/components/metric"
import {
  Surface,
  SurfaceDescription,
  SurfaceHeader,
  SurfaceTitle,
} from "@nextide/ui/components/surface"
import { Activity, BarChart3, ShieldAlert } from "lucide-react"
import { ComponentReference } from "./component-reference"
import {
  IntelligenceReportMiningPage,
  KrakenMiningPage,
  WebMiningPage,
} from "./mining-pages"
import { type PlaygroundApplication } from "./playground-application"
import { BlockPreview } from "./playground-blocks"
import { daedalusFilterItems } from "./playground-campaign-data"
import { ComponentMatrix } from "./playground-components"
import { DaedalusPlayground } from "./playground-daedalus"
import { FoundationsPreview } from "./playground-foundations"
import { IntelligencePlayground } from "./playground-intelligence"
function PlaygroundContent({ app }: { app: PlaygroundApplication }) {
  const {
    motionScale,
    daedalusView,
    intelligenceView,
    webMiningView,
    krakenMiningView,
    reportMiningView,
    platformView,
    activeItemId,
  } = app
  return (
    <div className="grid gap-4 p-4 sm:px-8 sm:py-6" hidden={platformView}>
      <ComponentReference names={["AppShell", "NavigationPanel"]} />
      {intelligenceView ? (
        <IntelligenceView app={app} />
      ) : webMiningView ? (
        <WebMiningPage />
      ) : krakenMiningView ? (
        <KrakenMiningPage />
      ) : reportMiningView ? (
        <IntelligenceReportMiningPage />
      ) : daedalusView ? (
        <DaedalusView app={app} />
      ) : activeItemId === "theme" ? (
        <FoundationsPreview />
      ) : activeItemId === "blocks" ? (
        <BlockPreview motionScale={motionScale} />
      ) : (
        <ComponentsView app={app} />
      )}
    </div>
  )
}

function IntelligenceView({ app }: { app: PlaygroundApplication }) {
  const {
    updatePlaygroundState,
    intelligenceCreatorIds,
    intelligenceDateRange,
    intelligenceContext,
    intelligenceFlowSessions,
    intelligenceStreamIds,
  } = app
  return (
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
  )
}

function DaedalusView({ app }: { app: PlaygroundApplication }) {
  const {
    updatePlaygroundState,
    daedalusFilterGroupId,
    daedalusFilterId,
    daedalusDateRange,
    exportSchedule,
    watchlistTokens,
  } = app
  return (
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
            daedalusFilterItems.find((item) => item.groupId === nextGroupId)
              ?.id ?? "",
        })
      }
      onFilterSelect={(item) =>
        updatePlaygroundState({ daedalusFilterId: item.id })
      }
      onFilterClear={() => updatePlaygroundState({ daedalusFilterId: "" })}
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
  )
}

function ComponentsView({ app }: { app: PlaygroundApplication }) {
  const { updatePlaygroundState, density, confidence, checked, enabled } = app
  return (
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
  )
}
export { PlaygroundContent }
