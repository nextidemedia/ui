import * as React from "react"
import {
  Handshake,
  HeartPulse,
  LayoutDashboard,
  Megaphone,
  Search,
  Settings,
  UsersRound,
} from "lucide-react"

import { SidebarBrand, SidebarToggleButton } from "@nextide/ui/blocks/sidebar"
import { StatusBadge } from "@nextide/ui/components/status-badge"
import { Surface } from "@nextide/ui/components/surface"
import { cn } from "@nextide/ui/lib/utils"

type NavigationPanelStatusTone =
  | "neutral"
  | "success"
  | "processing"
  | "warning"
  | "danger"

type NavigationPanelItem = {
  id: string
  label: string
  meta?: string
  status?: string
  tone?: NavigationPanelStatusTone
  icon?: React.ReactNode
}

type NavigationPanelSection = {
  id: string
  label?: string
  items: NavigationPanelItem[]
}

const defaultNavigationPanelSections: NavigationPanelSection[] = [
  {
    id: "workspace",
    label: "Navigation",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        meta: "Command center",
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

type NavigationPanelProps = React.ComponentProps<typeof Surface> & {
  brand?: string
  eyebrow?: string
  byline?: string
  logo?: React.ReactNode
  bylineLogo?: React.ReactNode
  sections?: NavigationPanelSection[]
  activeItemId?: string
  collapsed?: boolean
  drawerCollapsed?: boolean
  drawerTransitioning?: boolean
  commandLabel?: string
  commandShortcut?: string
  onCommand?: () => void
  onToggle?: () => void
  onSelectItem?: (item: NavigationPanelItem) => void
  footer?: React.ReactNode
}

type NavigationPanelCommandRowProps = {
  collapsed: boolean
  drawerCollapsed: boolean
  commandLabel: string
  commandShortcut?: string
  onCommand?: () => void
  onToggle?: () => void
}

type NavigationPanelNavProps = {
  sections: NavigationPanelSection[]
  activeItemId?: string
  collapsed: boolean
  drawerCollapsed: boolean
  drawerTransitioning: boolean
  onSelectItem?: (item: NavigationPanelItem) => void
}

type NavigationPanelFooterProps = {
  collapsed: boolean
  drawerCollapsed: boolean
  footer?: React.ReactNode
}

function NavigationPanelCommandRow({
  collapsed,
  drawerCollapsed,
  commandLabel,
  commandShortcut,
  onCommand,
  onToggle,
}: NavigationPanelCommandRowProps) {
  const commandShortcutLabel = commandShortcut ?? getDefaultCommandShortcut()
  const showCommandShortcut = commandShortcutLabel.length > 0

  return (
    <div
      className={cn(
        "relative flex h-11 w-full items-center overflow-visible",
        collapsed && "justify-center"
      )}
    >
      <button
        type="button"
        className={cn(
          "grid min-h-11 items-center rounded-lg border border-nextide-line bg-nextide-panel text-left text-sm text-foreground transition-[width,grid-template-columns,padding,color,background-color] duration-[var(--nextide-drawer-icon-duration)] ease-[var(--nextide-drawer-ease)] hover:bg-nextide-panel-strong motion-reduce:transition-none",
          collapsed
            ? "size-11 grid-cols-1 place-items-center p-0"
            : "w-[max(2.75rem,calc(100%-2.75rem))] grid-cols-[2.75rem_minmax(0,1fr)] gap-0 p-0"
        )}
        aria-label={commandLabel}
        onClick={onCommand}
      >
        <Search className="mx-auto size-4 justify-self-center text-nextide-tide" />
        {!collapsed ? (
          <span
            className={cn(
              "min-w-0 overflow-hidden [mask-image:linear-gradient(to_right,transparent_0,black_5px,black_100%)] whitespace-nowrap transition-[max-width] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
              drawerCollapsed
                ? "max-w-0"
                : "max-w-52 [mask-image:linear-gradient(to_right,black_0,black_100%)]"
            )}
          >
            <span
              className={cn(
                "flex min-w-0 items-center justify-between gap-2 transition-transform duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
                drawerCollapsed ? "-translate-x-10" : "translate-x-0"
              )}
            >
              <span className="min-w-0 truncate">{commandLabel}</span>
              {showCommandShortcut ? (
                <kbd className="hidden shrink-0 rounded-md border border-nextide-line bg-background/40 px-1.5 py-0.5 text-[0.65rem] leading-none text-muted-foreground sm:inline-flex">
                  {commandShortcutLabel}
                </kbd>
              ) : null}
            </span>
          </span>
        ) : null}
      </button>
      {onToggle ? (
        <SidebarToggleButton
          drawerCollapsed={drawerCollapsed}
          onToggle={onToggle}
          className={cn(
            "absolute top-1.5 shadow-[0_0_18px_rgb(30_228_188/0.16)]",
            drawerCollapsed || collapsed ? "right-[-1.75rem]" : "right-0"
          )}
        />
      ) : null}
    </div>
  )
}

function NavigationPanelNav({
  sections,
  activeItemId,
  collapsed,
  drawerCollapsed,
  drawerTransitioning,
  onSelectItem,
}: NavigationPanelNavProps) {
  const navRef = React.useRef<HTMLElement | null>(null)
  const itemRefs = React.useRef<Record<string, HTMLButtonElement | null>>({})
  const railActive = collapsed || drawerCollapsed

  const writeOutlineVars = React.useCallback(
    (
      top: number,
      height: number,
      left: number,
      width: number,
      railTop = top + 6,
      railHeight = Math.max(0, height - 12)
    ) => {
      const nav = navRef.current
      if (!nav) return

      nav.style.setProperty("--navigation-outline-top", `${top}px`)
      nav.style.setProperty("--navigation-outline-height", `${height}px`)
      nav.style.setProperty("--navigation-outline-left", `${left}px`)
      nav.style.setProperty("--navigation-outline-width", `${width}px`)
      nav.style.setProperty("--navigation-rail-top", `${railTop}px`)
      nav.style.setProperty("--navigation-rail-height", `${railHeight}px`)
    },
    []
  )

  const measureOutline = React.useCallback(
    (item: HTMLButtonElement) => {
      const nav = navRef.current
      if (!nav) return

      const itemRect = item.getBoundingClientRect()
      const navRect = nav.getBoundingClientRect()
      const compactOutline = collapsed
      const compactWidth = Math.min(itemRect.width, 44)
      const left = itemRect.left - navRect.left + nav.scrollLeft
      const top = itemRect.top - navRect.top + nav.scrollTop
      const icon = item.querySelector<HTMLElement>(
        "[data-slot='navigation-panel-item-icon']"
      )
      const iconRect = icon?.getBoundingClientRect()
      const railTop = iconRect
        ? iconRect.top - navRect.top + nav.scrollTop - 2
        : top + 6
      const railHeight = iconRect
        ? iconRect.height + 4
        : Math.max(0, itemRect.height - 12)

      writeOutlineVars(
        top,
        itemRect.height,
        compactOutline ? left + (itemRect.width - compactWidth) / 2 : left,
        compactOutline ? compactWidth : itemRect.width,
        railTop,
        railHeight
      )
    },
    [collapsed, writeOutlineVars]
  )

  React.useLayoutEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const activeItem = activeItemId ? itemRefs.current[activeItemId] : null
    if (!activeItem) {
      const top =
        Number.parseFloat(
          nav.style.getPropertyValue("--navigation-outline-top")
        ) || 0
      const height =
        Number.parseFloat(
          nav.style.getPropertyValue("--navigation-outline-height")
        ) || 0
      const left =
        Number.parseFloat(
          nav.style.getPropertyValue("--navigation-outline-left")
        ) || 0
      const width =
        Number.parseFloat(
          nav.style.getPropertyValue("--navigation-outline-width")
        ) || 0
      writeOutlineVars(top + height / 2, 0, left + width / 2, 0)
      return
    }

    let frame = 0
    let transitionFrame = 0
    const measureActiveOutline = () => measureOutline(activeItem)
    const scheduleMeasureOutline = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(measureActiveOutline)
    }
    const measureDuringTransition = () => {
      measureActiveOutline()
      transitionFrame = window.requestAnimationFrame(measureDuringTransition)
    }

    measureActiveOutline()

    if (drawerTransitioning) {
      transitionFrame = window.requestAnimationFrame(measureDuringTransition)
    }

    const resizeObserver = new ResizeObserver(scheduleMeasureOutline)
    resizeObserver.observe(nav)
    resizeObserver.observe(activeItem)
    window.addEventListener("resize", scheduleMeasureOutline)

    return () => {
      window.cancelAnimationFrame(frame)
      window.cancelAnimationFrame(transitionFrame)
      resizeObserver.disconnect()
      window.removeEventListener("resize", scheduleMeasureOutline)
    }
  }, [
    activeItemId,
    drawerTransitioning,
    measureOutline,
    sections,
    writeOutlineVars,
  ])

  return (
    <nav
      ref={navRef}
      className="relative grid min-h-0 w-full flex-1 content-start gap-4 overflow-y-auto"
    >
      <span
        aria-hidden="true"
        data-slot="navigation-panel-selection"
        className={cn(
          "pointer-events-none absolute z-0 rounded-lg border border-nextide-tide/55 bg-nextide-tide/10 shadow-[inset_0_1px_1px_rgb(30_228_188/0.18),0_0_28px_rgb(30_228_188/0.18)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
          drawerTransitioning
            ? "transition-opacity duration-[var(--nextide-drawer-icon-duration)]"
            : "transition-[top,height,left,width,opacity] duration-[220ms]",
          activeItemId && !collapsed && !drawerCollapsed
            ? "opacity-100"
            : "opacity-0 duration-[var(--nextide-drawer-icon-duration)]",
          collapsed && "transition-none"
        )}
        style={{
          top: "var(--navigation-outline-top, 0px)",
          left: "0px",
          width: "100%",
          height: "var(--navigation-outline-height, 0px)",
        }}
      />
      <span
        aria-hidden="true"
        data-slot="navigation-panel-rail"
        className={cn(
          "pointer-events-none absolute z-0 rounded-full bg-nextide-tide shadow-[0_0_16px_rgb(30_228_188/0.45)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
          drawerTransitioning
            ? "transition-opacity duration-[var(--nextide-drawer-icon-duration)]"
            : "transition-[top,height,opacity] duration-[220ms]",
          activeItemId && railActive ? "opacity-100" : "opacity-0"
        )}
        style={{
          top: "var(--navigation-rail-top, 0px)",
          left: "2px",
          width: "3px",
          height: "var(--navigation-rail-height, 0px)",
        }}
      />
      {sections.map((section) => (
        <React.Fragment key={section.id}>
          <section
            className={cn(
              "relative z-10 grid gap-2",
              collapsed &&
                "before:absolute before:-top-2 before:left-1/2 before:h-px before:w-8 before:-translate-x-1/2 before:rounded-full before:bg-nextide-line"
            )}
          >
            {section.label ? (
              <h3
                aria-hidden={collapsed || drawerCollapsed}
                className={cn(
                  "overflow-hidden px-2 text-xs font-normal tracking-normal text-muted-foreground transition-[max-height,opacity,transform] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
                  collapsed || drawerCollapsed
                    ? "max-h-0 -translate-x-6 opacity-0"
                    : "max-h-6 translate-x-0 opacity-100"
                )}
              >
                {section.label}
              </h3>
            ) : null}
            <div className="grid gap-1.5">
              {section.items.map((item) => {
                const active = item.id === activeItemId

                return (
                  <button
                    key={item.id}
                    type="button"
                    ref={(node) => {
                      itemRefs.current[item.id] = node
                    }}
                    className={cn(
                      "group relative grid min-h-11 w-full items-center gap-2 rounded-lg border border-transparent text-left transition-[width,height,grid-template-columns,padding,color,background-color] duration-[var(--nextide-drawer-icon-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
                      collapsed
                        ? "mx-auto size-11 grid-cols-1 place-items-center p-0"
                        : "h-[3.25rem] grid-cols-[2.75rem_minmax(0,1fr)] p-0",
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:bg-nextide-panel hover:text-foreground"
                    )}
                    aria-current={active ? "page" : undefined}
                    aria-label={
                      collapsed || drawerCollapsed
                        ? [item.label, item.status, item.meta]
                            .filter(Boolean)
                            .join(" ")
                        : undefined
                    }
                    onClick={(event) => {
                      measureOutline(event.currentTarget)
                      onSelectItem?.(item)
                    }}
                  >
                    <span
                      data-slot="navigation-panel-item-icon"
                      className={cn(
                        "grid size-7 place-items-center justify-self-center rounded-full bg-nextide-panel text-nextide-tide transition-[background-color,box-shadow] duration-[var(--nextide-drawer-icon-duration)] ease-[var(--nextide-drawer-ease)] [&_svg]:block [&_svg]:size-4",
                        active &&
                          "bg-nextide-tide/10 shadow-[0_0_20px_rgb(30_228_188/0.16)]",
                        collapsed && "[&_svg]:translate-y-px"
                      )}
                    >
                      {item.icon ?? item.label.slice(0, 1)}
                    </span>
                    {!collapsed ? (
                      <span
                        className={cn(
                          "min-w-0 overflow-hidden [mask-image:linear-gradient(to_right,transparent_0,black_5px,black_100%)] whitespace-nowrap transition-[max-width] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
                          drawerCollapsed
                            ? "max-w-0"
                            : "max-w-52 [mask-image:linear-gradient(to_right,black_0,black_100%)]"
                        )}
                      >
                        <span
                          className={cn(
                            "grid min-w-0 gap-0.5 transition-transform duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
                            drawerCollapsed
                              ? "-translate-x-12"
                              : "translate-x-0"
                          )}
                        >
                          <span className="truncate text-sm font-medium">
                            {item.label}
                          </span>
                          {item.meta || item.status ? (
                            <span className="flex min-w-0 items-center gap-2">
                              {item.meta ? (
                                <small className="min-w-0 truncate text-xs text-muted-foreground">
                                  {item.meta}
                                </small>
                              ) : null}
                              {item.status ? (
                                <StatusBadge
                                  tone={item.tone ?? "neutral"}
                                  className="relative z-20 px-1.5 py-0.5"
                                >
                                  {item.status}
                                </StatusBadge>
                              ) : null}
                            </span>
                          ) : null}
                        </span>
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </section>
        </React.Fragment>
      ))}
    </nav>
  )
}

function NavigationPanelFooter({
  collapsed,
  drawerCollapsed,
  footer,
}: NavigationPanelFooterProps) {
  if (!footer) {
    return null
  }

  return (
    <footer
      aria-hidden={collapsed || drawerCollapsed}
      className={cn(
        "w-full overflow-hidden border-t border-nextide-line transition-[max-height,opacity,padding,transform] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
        collapsed || drawerCollapsed
          ? "max-h-0 -translate-x-10 pt-0 opacity-0"
          : "max-h-24 translate-x-0 pt-3 opacity-100"
      )}
    >
      {footer}
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
  collapsed = false,
  drawerCollapsed = collapsed,
  drawerTransitioning = false,
  commandLabel = "Search",
  commandShortcut,
  onCommand,
  onToggle,
  onSelectItem,
  footer,
  className,
  ...props
}: NavigationPanelProps) {
  return (
    <div
      data-slot="navigation-panel-frame"
      data-collapsed={collapsed}
      data-drawer-collapsed={drawerCollapsed}
      className={cn(
        "relative z-20 flex h-full min-h-0 flex-col gap-3 overflow-visible",
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
      />

      <Surface
        data-slot="navigation-panel"
        data-collapsed={collapsed}
        data-drawer-collapsed={drawerCollapsed}
        padding="none"
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-3 overflow-visible transition-[padding,border-radius,box-shadow,background-color] duration-[var(--nextide-drawer-icon-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
          collapsed ? "items-center overflow-visible p-3" : "p-3"
        )}
        {...props}
      >
        <NavigationPanelCommandRow
          collapsed={collapsed}
          drawerCollapsed={drawerCollapsed}
          commandLabel={commandLabel}
          commandShortcut={commandShortcut}
          onCommand={onCommand}
          onToggle={onToggle}
        />
        <NavigationPanelNav
          sections={sections}
          activeItemId={activeItemId}
          collapsed={collapsed}
          drawerCollapsed={drawerCollapsed}
          drawerTransitioning={drawerTransitioning}
          onSelectItem={onSelectItem}
        />
        <NavigationPanelFooter
          collapsed={collapsed}
          drawerCollapsed={drawerCollapsed}
          footer={footer}
        />
      </Surface>
    </div>
  )
}

function getDefaultCommandShortcut() {
  if (typeof navigator === "undefined") {
    return "CMD K"
  }

  const platform = `${navigator.platform} ${navigator.userAgent}`
  return /win/i.test(platform) ? "CTRL K" : "CMD K"
}

export {
  NavigationPanel,
  defaultNavigationPanelSections,
  type NavigationPanelItem,
  type NavigationPanelSection,
  type NavigationPanelStatusTone,
}
