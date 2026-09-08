import { type ShellDensity } from "@nextide/ui/blocks/app-shell"
import { NavigationPanel } from "@nextide/ui/blocks/navigation-panel"
import {
  SettingsModal,
  SettingsModalSection,
} from "@nextide/ui/blocks/settings-modal"
import { Button } from "@nextide/ui/components/button"
import { SelectMenu } from "@nextide/ui/components/select-menu"
import { Switch } from "@nextide/ui/components/switch"
import { cn } from "@nextide/ui/lib/utils"
import { PanelRightOpen, Radar, Settings } from "lucide-react"
import { ComponentReference } from "./component-reference"
import { type PlaygroundApplication } from "./playground-application"
import { shellDensityOptions } from "./playground-navigation-data"
function PlaygroundHeader({ app }: { app: PlaygroundApplication }) {
  const {
    setSettingsOpen,
    updatePlaygroundState,
    platformView,
    inspectorVisible,
    shellDensity,
  } = app
  return (
    <div className="flex shrink-0 items-center gap-2">
      <SelectMenu
        aria-label="Shell theme"
        value={shellDensity}
        onValueChange={(nextDensity) =>
          updatePlaygroundState({
            shellDensity: nextDensity as ShellDensity,
          })
        }
        options={shellDensityOptions}
        contentMinWidth={144}
        className="w-28 sm:w-32"
        triggerClassName={cn(shellDensity !== "current" && "lg:h-9")}
      />
      {!platformView && !inspectorVisible ? (
        <Button
          type="button"
          variant="outline"
          size={shellDensity === "current" ? "default" : "sm"}
          onClick={() => updatePlaygroundState({ inspectorVisible: true })}
        >
          <PanelRightOpen data-icon="inline-start" />
          Inspect
        </Button>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(shellDensity !== "current" && "lg:size-9")}
        aria-label="Settings"
        onClick={() => setSettingsOpen(true)}
      >
        <Settings />
      </Button>
    </div>
  )
}

function PlaygroundNavigation({ app }: { app: PlaygroundApplication }) {
  const {
    setSettingsOpen,
    playgroundSessionActive,
    setPlaygroundSessionActive,
    setKrakenActiveItemId,
    sidebar,
    platformView,
    navigationSections,
    navigationActiveItemId,
    setViewMode,
    selectWorkbenchItem,
    shellDensity,
  } = app
  return (
    <NavigationPanel
      brand={platformView ? "Kraken" : "Nextide UI"}
      eyebrow={platformView ? "Data Platform" : "System workbench"}
      activeItemId={navigationActiveItemId}
      collapsed={sidebar.iconsCollapsed}
      drawerCollapsed={sidebar.drawerCollapsed}
      drawerTransitioning={sidebar.transitioning}
      density={shellDensity}
      sections={navigationSections}
      commandLabel="Search Navigation"
      logo={
        platformView ? (
          <Radar
            aria-hidden="true"
            className={cn(
              "text-nextide-tide",
              shellDensity === "current" ? "size-10" : "size-6"
            )}
          />
        ) : undefined
      }
      userMenu={
        playgroundSessionActive
          ? {
              name: "Nextide Operator",
              email: "operator@nextide.media",
              initials: "NO",
              onSettings: () => setSettingsOpen(true),
              onLogout: () => setPlaygroundSessionActive(false),
            }
          : undefined
      }
      onSelectItem={(item) => {
        if (!platformView) {
          selectWorkbenchItem(item.id)
          return
        }
        if (item.id === "system-workbench") {
          setViewMode("report")
          return
        }
        setKrakenActiveItemId(item.id)
      }}
      onToggle={sidebar.toggleCollapsed}
    />
  )
}

function PlaygroundSettings({ app }: { app: PlaygroundApplication }) {
  const {
    density,
    settingsOpen,
    setSettingsOpen,
    settingsContentRef,
    settingsSelectAnchorRef,
    settingsSelectWidthRef,
    updatePlaygroundState,
    enabled,
    slowAnimations,
  } = app
  return (
    <SettingsModal
      contentRef={settingsContentRef}
      open={settingsOpen}
      onOpenChange={setSettingsOpen}
      title="Preview settings"
      description="Adjust the shared component preview."
      kicker="Package"
    >
      <SettingsModalSection
        title="Runtime checks"
        description="Show enabled states across the preview."
      >
        <ComponentReference
          names={["SettingsModal", "SettingsModalSection", "SelectMenu"]}
        />
        <div ref={settingsSelectWidthRef} className="w-44 sm:w-full">
          <div ref={settingsSelectAnchorRef} className="w-full sm:w-56">
            <SelectMenu
              aria-label="Preview density"
              contentAnchorRef={settingsSelectAnchorRef}
              contentMinWidth={220}
              contentPortalRef={settingsContentRef}
              contentWidthRef={settingsSelectWidthRef}
              onValueChange={(nextDensity) =>
                updatePlaygroundState({ density: nextDensity })
              }
              options={[
                { value: "compact", label: "Compact" },
                { value: "comfortable", label: "Comfort" },
                { value: "spacious", label: "Spacious", disabled: true },
              ]}
              value={density}
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-lg border border-nextide-line bg-nextide-panel p-3">
          <span className="text-sm font-medium">Enable runtime checks</span>
          <Switch
            aria-label="Enable runtime checks"
            checked={enabled}
            onCheckedChange={(nextEnabled) =>
              updatePlaygroundState({ enabled: nextEnabled })
            }
          />
        </div>
        <div className="flex items-center justify-between gap-4 rounded-lg border border-nextide-line bg-nextide-panel p-3">
          <span className="grid gap-0.5">
            <span className="text-sm font-medium">Slow motion</span>
            <small className="text-xs text-muted-foreground">
              Run interface animations at 10× duration.
            </small>
          </span>
          <Switch
            aria-label="Slow motion"
            checked={slowAnimations}
            onCheckedChange={(nextSlowAnimations) =>
              updatePlaygroundState({ slowAnimations: nextSlowAnimations })
            }
          />
        </div>
      </SettingsModalSection>
    </SettingsModal>
  )
}
export { PlaygroundHeader, PlaygroundNavigation, PlaygroundSettings }
