import * as React from "react"

import type { ShellDensity } from "@nextide/ui/blocks/app-shell"
import { type NavigationUserMenuProps } from "@nextide/ui/blocks/navigation-user-menu"
import { type StatusBadgeIndicator } from "@nextide/ui/components/status-badge"
import { Surface } from "@nextide/ui/components/surface"

type NavigationPanelStatusTone =
  | "neutral"
  | "success"
  | "processing"
  | "warning"
  | "danger"

type NavigationPanelSelectionStyle = "rail" | "fill" | "outline" | "dot"

type NavigationPanelItem = {
  id: string
  label: string
  meta?: string
  status?: string
  tone?: NavigationPanelStatusTone
  statusIcon?: React.ReactNode
  statusIndicator?: StatusBadgeIndicator
  icon?: React.ReactNode
  children?: NavigationPanelItem[]
  expanded?: boolean
  action?: {
    label: string
    icon?: React.ReactNode
  }
}

type NavigationPanelSection = {
  id: string
  label?: string
  pinned?: boolean
  items: NavigationPanelItem[]
}

type NavigationPanelSearchItem = NavigationPanelItem & {
  sectionLabel?: string
  parent?: NavigationPanelItem
  actionFor?: NavigationPanelItem
}

type NavigationPanelUserMenu = Omit<
  NavigationUserMenuProps,
  "collapsed" | "drawerCollapsed"
>

type NavigationPanelProps = React.ComponentProps<typeof Surface> & {
  brand?: string
  eyebrow?: string
  byline?: string
  logo?: React.ReactNode
  bylineLogo?: React.ReactNode
  sections?: NavigationPanelSection[]
  activeItemId?: string
  selectionStyle?: NavigationPanelSelectionStyle
  density?: ShellDensity
  collapsed?: boolean
  drawerCollapsed?: boolean
  drawerTransitioning?: boolean
  commandLabel?: string
  commandShortcut?: string
  onToggle?: () => void
  onSelectItem: (item: NavigationPanelItem) => void
  onToggleItem?: (item: NavigationPanelItem) => void
  onActionItem?: (item: NavigationPanelItem) => void
  footer?: React.ReactNode
  userMenu?: NavigationPanelUserMenu
}

type NavigationPanelCommandRowProps = {
  density: ShellDensity
  collapsed: boolean
  drawerCollapsed: boolean
  sections: NavigationPanelSection[]
  commandLabel: string
  commandShortcut?: string
  onSelectItem: (item: NavigationPanelItem) => void
  onToggleItem?: (item: NavigationPanelItem) => void
  onActionItem?: (item: NavigationPanelItem) => void
  onToggle?: () => void
}

type NavigationPanelNavProps = {
  sections: NavigationPanelSection[]
  activeItemId?: string
  selectionStyle: NavigationPanelSelectionStyle
  density: ShellDensity
  collapsed: boolean
  drawerCollapsed: boolean
  drawerTransitioning: boolean
  onSelectItem: (item: NavigationPanelItem) => void
  onToggleItem?: (item: NavigationPanelItem) => void
  onActionItem?: (item: NavigationPanelItem) => void
}

type NavigationPanelFooterProps = {
  collapsed: boolean
  drawerCollapsed: boolean
  footer?: React.ReactNode
  userMenu?: NavigationPanelUserMenu
}

export type {
  NavigationPanelCommandRowProps,
  NavigationPanelFooterProps,
  NavigationPanelItem,
  NavigationPanelNavProps,
  NavigationPanelProps,
  NavigationPanelSearchItem,
  NavigationPanelSection,
  NavigationPanelSelectionStyle,
  NavigationPanelStatusTone,
  NavigationPanelUserMenu,
}
