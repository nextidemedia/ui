import { AppShell } from "@nextide/ui/blocks/app-shell"
import { cn } from "@nextide/ui/lib/utils"
import { usePlaygroundApplication } from "./playground-application"
import { Inspector, KrakenDiscoveryPreview } from "./playground-platform"
import {
  PlaygroundHeader,
  PlaygroundNavigation,
  PlaygroundSettings,
} from "./playground-shell"
import { PlaygroundContent } from "./playground-views"
function App() {
  const app = usePlaygroundApplication()
  const {
    krakenActiveItemId,
    updatePlaygroundState,
    sidebar,
    platformView,
    shellHeaderTitle,
    inspectorVisible,
    density,
    confidence,
    viewMode,
    shellDensity,
  } = app

  return (
    <>
      <AppShell
        collapsed={sidebar.collapsed}
        density={shellDensity}
        drawerCollapsed={sidebar.drawerCollapsed}
        sidebarTransitioning={sidebar.transitioning}
        header={
          <div
            className={cn(
              "flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6",
              shellDensity !== "current" && "lg:min-h-[3.25rem]"
            )}
          >
            <strong
              className={cn(
                "truncate font-medium max-[520px]:hidden",
                shellDensity === "current" ? "text-ui-title" : "text-sm"
              )}
            >
              {shellHeaderTitle}
            </strong>
            <PlaygroundHeader app={app} />
          </div>
        }
        sidebar={<PlaygroundNavigation app={app} />}
        aside={
          inspectorVisible && !platformView ? (
            <Inspector
              density={density}
              confidence={confidence[0] ?? 0}
              viewMode={viewMode}
              onHide={() => updatePlaygroundState({ inspectorVisible: false })}
            />
          ) : null
        }
      >
        {platformView ? (
          <KrakenDiscoveryPreview activeItemId={krakenActiveItemId} />
        ) : null}
        <PlaygroundContent app={app} />
      </AppShell>
      <PlaygroundSettings app={app} />
    </>
  )
}
export { App }
