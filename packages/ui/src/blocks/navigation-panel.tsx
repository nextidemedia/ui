import type { ShellDensity } from "@nextide/ui/blocks/app-shell"
import {
  Handshake,
  HeartPulse,
  LayoutDashboard,
  Megaphone,
  Settings,
  UsersRound,
} from "lucide-react"

import { NavigationUserMenu } from "@nextide/ui/blocks/navigation-user-menu"
import { SidebarBrand } from "@nextide/ui/blocks/sidebar"
import { Surface } from "@nextide/ui/components/surface"
import { cn } from "@nextide/ui/lib/utils"

import { NavigationPanelCommandRow } from "./navigation-panel-command.js"
import { NavigationPanelNav } from "./navigation-panel-nav.js"
import type {
  NavigationPanelFooterProps,
  NavigationPanelItem,
  NavigationPanelProps,
  NavigationPanelSection,
  NavigationPanelSelectionStyle,
  NavigationPanelStatusTone,
  NavigationPanelUserMenu,
} from "./navigation-panel-types.js"
const defaultNavigationPanelSections: NavigationPanelSection[] = [
  {
    id: "workspace",
    label: "Navigation",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard />,
      },
      {
        id: "campaigns",
        label: "Campaigns",
        meta: "Launch plans",
        icon: <Megaphone />,
      },
      {
        id: "clients-partners",
        label: "Clients & Partners",
        meta: "Relationships",
        icon: <Handshake />,
      },
      {
        id: "creators",
        label: "Creators",
        meta: "Talent graph",
        icon: <UsersRound />,
      },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      {
        id: "settings",
        label: "Settings",
        meta: "Workspace config",
        icon: <Settings />,
      },
      {
        id: "service-health",
        label: "Service Health",
        status: "Nominal",
        tone: "success",
        icon: <HeartPulse />,
      },
    ],
  },
]

function NavigationPanelFooter({
  collapsed,
  drawerCollapsed,
  footer,
  userMenu,
}: NavigationPanelFooterProps) {
  if (!footer && !userMenu) {
    return null
  }

  return (
    <footer
      className={cn(
        "grid w-full overflow-hidden border-t border-nextide-line transition-[max-height,padding] duration-[var(--nextide-drawer-icon-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
        collapsed && !userMenu ? "max-h-0 pt-0" : "max-h-40 pt-3",
        footer && userMenu && !drawerCollapsed ? "gap-2" : "gap-0"
      )}
    >
      {footer ? (
        <div
          aria-hidden={collapsed || drawerCollapsed}
          className={cn(
            "overflow-hidden transition-[max-height,opacity,transform] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
            drawerCollapsed
              ? "max-h-0 -translate-x-10 opacity-0"
              : "max-h-24 translate-x-0 opacity-100"
          )}
        >
          {footer}
        </div>
      ) : null}
      {userMenu ? (
        <NavigationUserMenu
          {...userMenu}
          collapsed={collapsed}
          drawerCollapsed={drawerCollapsed}
        />
      ) : null}
    </footer>
  )
}

function NavigationPanel({
  brand = "Nextide",
  eyebrow = "Workspace",
  byline = "Nextide",
  logo,
  bylineLogo,
  sections = defaultNavigationPanelSections,
  activeItemId,
  selectionStyle = "fill",
  density = "current",
  collapsed = false,
  drawerCollapsed = collapsed,
  drawerTransitioning = false,
  commandLabel = "Search",
  commandShortcut,
  onToggle,
  onSelectItem,
  onToggleItem,
  onActionItem,
  footer,
  userMenu,
  className,
  ...props
}: NavigationPanelProps) {
  return (
    <Surface
      {...props}
      data-slot="navigation-panel-frame"
      data-collapsed={collapsed}
      data-drawer-collapsed={drawerCollapsed}
      data-density={density}
      padding="none"
      className={cn(
        "relative z-20 flex h-full min-h-0 flex-col overflow-visible rounded-none border-x-0 border-t-0 border-nextide-line bg-nextide-panel max-lg:h-auto max-lg:border-b lg:border-r lg:border-b-0",
        className
      )}
    >
      <SidebarBrand
        brand={brand}
        eyebrow={eyebrow}
        byline={byline}
        logo={logo}
        bylineLogo={bylineLogo}
        collapsed={collapsed}
        drawerCollapsed={drawerCollapsed}
        drawerTransitioning={drawerTransitioning}
        density={density}
        className={getBrandClass(density, collapsed)}
      />
      <div
        data-slot="navigation-panel"
        data-collapsed={collapsed}
        data-drawer-collapsed={drawerCollapsed}
        className={getPanelClass(density, collapsed)}
      >
        <NavigationPanelCommandRow
          density={density}
          collapsed={collapsed}
          drawerCollapsed={drawerCollapsed}
          sections={sections}
          commandLabel={commandLabel}
          commandShortcut={commandShortcut}
          onSelectItem={onSelectItem}
          onToggleItem={onToggleItem}
          onActionItem={onActionItem}
          onToggle={onToggle}
        />
        <NavigationPanelNav
          sections={sections}
          activeItemId={activeItemId}
          selectionStyle={selectionStyle}
          density={density}
          collapsed={collapsed}
          drawerCollapsed={drawerCollapsed}
          drawerTransitioning={drawerTransitioning}
          onSelectItem={onSelectItem}
          onToggleItem={onToggleItem}
          onActionItem={onActionItem}
        />
        <NavigationPanelFooter
          collapsed={collapsed}
          drawerCollapsed={drawerCollapsed}
          footer={footer}
          userMenu={userMenu}
        />
      </div>
    </Surface>
  )
}

export {
  defaultNavigationPanelSections,
  NavigationPanel,
  type NavigationPanelItem,
  type NavigationPanelSection,
  type NavigationPanelSelectionStyle,
  type NavigationPanelStatusTone,
  type NavigationPanelUserMenu,
}

function getBrandClass(density: ShellDensity, collapsed: boolean) {
  return cn(
    "shrink-0 border-b border-nextide-line",
    density === "current"
      ? collapsed
        ? "py-2"
        : "p-4"
      : density === "compact"
        ? collapsed
          ? "p-3"
          : "py-3 pr-3 pl-[18px]"
        : collapsed
          ? "px-[9px] py-3"
          : "py-3 pr-2.5 pl-[18px]"
  )
}

function getPanelClass(density: ShellDensity, collapsed: boolean) {
  return cn(
    "flex min-h-0 flex-1 flex-col overflow-visible transition-[padding,background-color] duration-[var(--nextide-drawer-icon-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none max-lg:flex-none",
    density === "current"
      ? collapsed
        ? "items-center gap-1.5 overflow-visible p-3"
        : "gap-4 px-4 py-4"
      : density === "compact"
        ? cn("gap-3 p-3", collapsed && "items-center gap-1.5 overflow-visible")
        : cn(
            "gap-3 px-2.5 py-3",
            collapsed && "items-center gap-1 overflow-visible"
          )
  )
}
