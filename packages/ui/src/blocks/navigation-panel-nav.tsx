import * as React from "react"

import { cn } from "@nextide/ui/lib/utils"

import { NavigationSection } from "./navigation-panel-items.js"
import { useNavigationMotion } from "./navigation-panel-motion.js"
import type { NavigationPanelNavProps } from "./navigation-panel-types.js"
function NavigationPanelNav({
  sections,
  activeItemId,
  selectionStyle,
  density,
  collapsed,
  drawerCollapsed,
  drawerTransitioning,
  onSelectItem,
  onToggleItem,
  onActionItem,
}: NavigationPanelNavProps) {
  const motion = useNavigationMotion({
    sections,
    activeItemId,
    selectionStyle,
    density,
    collapsed,
    drawerCollapsed,
    drawerTransitioning,
    onSelectItem,
    onToggleItem,
    onActionItem,
  })
  const {
    navRef,
    onWheel,
    setItemRef,
    railRef,
    compact,
    effectiveActiveItemId,
    measureOutline,
  } = motion
  const selectionSurfaceVisible =
    Boolean(activeItemId) &&
    selectionStyle !== "dot" &&
    (!compact || selectionStyle !== "rail")
  const selectionMarkerVisible =
    Boolean(activeItemId) &&
    (selectionStyle === "rail" || selectionStyle === "dot")
  const activeInPinnedSection = sections.some(
    (section) =>
      section.pinned &&
      section.items.some(
        (item) =>
          item.id === effectiveActiveItemId ||
          item.children?.some((child) => child.id === effectiveActiveItemId)
      )
  )
  const state = {
    sections,
    activeItemId,
    selectionStyle,
    density,
    collapsed,
    drawerCollapsed,
    drawerTransitioning,
    onSelectItem,
    onToggleItem,
    onActionItem,
    setItemRef,
    measureOutline,
    compact,
  }

  return (
    <nav
      ref={navRef}
      onWheel={onWheel}
      className={cn(
        "nextide-scrollbar-none relative flex min-h-0 w-full flex-1 flex-col gap-4 overflow-y-auto max-lg:flex-none max-lg:flex-row max-lg:gap-2 max-lg:overflow-x-auto max-lg:overflow-y-hidden max-lg:pb-1",
        density !== "current" && "lg:gap-3"
      )}
    >
      <SelectionSurface
        activeInPinnedSection={activeInPinnedSection}
        selectionStyle={selectionStyle}
        drawerTransitioning={drawerTransitioning}
        selectionSurfaceVisible={selectionSurfaceVisible}
        collapsed={collapsed}
      />
      <SelectionRail
        activeInPinnedSection={activeInPinnedSection}
        selectionStyle={selectionStyle}
        drawerTransitioning={drawerTransitioning}
        selectionMarkerVisible={selectionMarkerVisible}
        railRef={railRef}
      />
      {sections.map((section) => (
        <NavigationSection key={section.id} section={section} state={state} />
      ))}
    </nav>
  )
}

function SelectionSurface({
  activeInPinnedSection,
  selectionStyle,
  drawerTransitioning,
  selectionSurfaceVisible,
  collapsed,
}: Pick<
  NavigationPanelNavProps,
  "selectionStyle" | "drawerTransitioning" | "collapsed"
> & { activeInPinnedSection: boolean; selectionSurfaceVisible: boolean }) {
  return (
    <span
      aria-hidden="true"
      data-slot="navigation-panel-selection"
      className={cn(
        "pointer-events-none absolute rounded-lg ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none max-lg:hidden",
        activeInPinnedSection ? "z-40" : "z-0",
        selectionStyle === "rail" && "bg-nextide-tide/[0.07]",
        selectionStyle === "fill" && "nextide-navigation-selection-wave",
        selectionStyle === "outline" &&
          "ring-1 ring-nextide-tide/50 ring-inset",
        drawerTransitioning
          ? "transition-opacity duration-[var(--nextide-drawer-icon-duration)]"
          : activeInPinnedSection
            ? "transition-none"
            : "transition-[top,height,left,width,opacity] duration-[var(--nextide-motion-state)]",
        selectionSurfaceVisible
          ? "opacity-100"
          : "opacity-0 duration-[var(--nextide-drawer-icon-duration)]",
        collapsed && "transition-none"
      )}
      style={{
        top: "var(--navigation-outline-top, 0px)",
        left: "var(--navigation-outline-left, 0px)",
        width: "var(--navigation-outline-width, 0px)",
        height: "var(--navigation-outline-height, 0px)",
      }}
    />
  )
}
function SelectionRail({
  activeInPinnedSection,
  selectionStyle,
  drawerTransitioning,
  selectionMarkerVisible,
  railRef,
}: Pick<NavigationPanelNavProps, "selectionStyle" | "drawerTransitioning"> & {
  activeInPinnedSection: boolean
  selectionMarkerVisible: boolean
  railRef: React.RefObject<HTMLSpanElement | null>
}) {
  return (
    <span
      ref={railRef}
      aria-hidden="true"
      data-slot="navigation-panel-rail"
      className={cn(
        "pointer-events-none absolute ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none max-lg:hidden",
        activeInPinnedSection ? "z-40" : "z-20",
        selectionStyle === "rail" &&
          "rounded-full bg-nextide-tide shadow-[0_0_14px_rgb(30_228_188/0.34)]",
        selectionStyle === "dot" &&
          "bg-transparent after:absolute after:top-1/2 after:left-1/2 after:size-1.5 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-nextide-tide after:shadow-[0_0_12px_rgb(30_228_188/0.4)] after:content-['']",
        drawerTransitioning
          ? "transition-opacity duration-[var(--nextide-drawer-icon-duration)]"
          : activeInPinnedSection
            ? "transition-none"
            : "transition-[top,height,opacity] duration-[var(--nextide-motion-state)]",
        selectionMarkerVisible ? "opacity-100" : "opacity-0"
      )}
      style={{
        top: "var(--navigation-rail-top, 0px)",
        left: "0px",
        width: selectionStyle === "dot" ? "8px" : "2px",
        height: "var(--navigation-rail-height, 0px)",
      }}
    />
  )
}

export { NavigationPanelNav }
