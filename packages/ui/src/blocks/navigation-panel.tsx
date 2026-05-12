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

import { SidebarBrand } from "@nextide/ui/blocks/sidebar"
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
  commandLabel = "Search",
  commandShortcut,
  onCommand,
  onToggle,
  onSelectItem,
  footer,
  className,
  ...props
}: React.ComponentProps<typeof Surface> & {
  brand?: string
  eyebrow?: string
  byline?: string
  logo?: React.ReactNode
  bylineLogo?: React.ReactNode
  sections?: NavigationPanelSection[]
  activeItemId?: string
  collapsed?: boolean
  drawerCollapsed?: boolean
  commandLabel?: string
  commandShortcut?: string
  onCommand?: () => void
  onToggle?: () => void
  onSelectItem?: (item: NavigationPanelItem) => void
  footer?: React.ReactNode
}) {
  const navRef = React.useRef<HTMLElement | null>(null)
  const itemRefs = React.useRef<Record<string, HTMLButtonElement | null>>({})
  const commandShortcutLabel = commandShortcut ?? getDefaultCommandShortcut()
  const showCommandShortcut = commandShortcutLabel.length > 0
  const railActive = collapsed || drawerCollapsed

  const setOutline = React.useCallback(
    (top: number, height: number, left: number, width: number) => {
      const nav = navRef.current
      if (!nav) return

      nav.style.setProperty("--navigation-outline-top", `${top}px`)
      nav.style.setProperty("--navigation-outline-height", `${height}px`)
      nav.style.setProperty("--navigation-outline-left", `${left}px`)
      nav.style.setProperty("--navigation-outline-width", `${width}px`)
    },
    []
  )

  const measureOutline = React.useCallback(
    (item: HTMLButtonElement) => {
      const nav = navRef.current
      if (!nav) return

      const itemRect = item.getBoundingClientRect()
      const navRect = nav.getBoundingClientRect()
      const compactOutline = collapsed || drawerCollapsed
      const compactWidth = Math.min(item.offsetWidth, 44)
      const left = itemRect.left - navRect.left + nav.scrollLeft
      const top = itemRect.top - navRect.top + nav.scrollTop

      setOutline(
        top,
        item.offsetHeight,
        compactOutline ? left + (item.offsetWidth - compactWidth) / 2 : left,
        compactOutline ? compactWidth : item.offsetWidth
      )
    },
    [collapsed, drawerCollapsed, setOutline]
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
      setOutline(top + height / 2, 0, left + width / 2, 0)
      return
    }

    let frame = 0
    const measureActiveOutline = () => measureOutline(activeItem)
    const scheduleMeasureOutline = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(measureActiveOutline)
    }

    measureActiveOutline()

    const resizeObserver = new ResizeObserver(scheduleMeasureOutline)
    resizeObserver.observe(nav)
    resizeObserver.observe(activeItem)
    window.addEventListener("resize", scheduleMeasureOutline)

    return () => {
      window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      window.removeEventListener("resize", scheduleMeasureOutline)
    }
  }, [activeItemId, measureOutline, sections, setOutline])

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
        onToggle={onToggle}
      />

      <Surface
        data-slot="navigation-panel"
        data-collapsed={collapsed}
        data-drawer-collapsed={drawerCollapsed}
        padding="none"
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-3 overflow-hidden transition-[padding,border-radius,box-shadow,background-color] duration-[260ms] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
          collapsed ? "items-center p-2" : "p-3"
        )}
        {...props}
      >
        <button
          type="button"
          className={cn(
            "grid min-h-11 items-center rounded-lg border border-nextide-line bg-nextide-panel text-left text-sm text-foreground transition-[width,grid-template-columns,padding,color,background-color] duration-[260ms] ease-[var(--nextide-drawer-ease)] hover:bg-nextide-panel-strong motion-reduce:transition-none",
            collapsed
              ? "size-10 grid-cols-1 place-items-center p-0"
              : "w-full grid-cols-[auto_minmax(0,1fr)] gap-2 px-3"
          )}
          aria-label={commandLabel}
          onClick={onCommand}
        >
          <Search className="size-4 text-nextide-tide" />
          {!collapsed ? (
            <>
              <span
                className={cn(
                  "min-w-0 overflow-hidden [mask-image:linear-gradient(to_right,transparent_0,black_5px,black_100%)] whitespace-nowrap transition-[max-width] duration-[260ms] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
                  drawerCollapsed
                    ? "max-w-0"
                    : "max-w-52 [mask-image:linear-gradient(to_right,black_0,black_100%)]"
                )}
              >
                <span
                  className={cn(
                    "flex min-w-0 items-center justify-between gap-2 transition-transform duration-[260ms] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
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
            </>
          ) : null}
        </button>

        <nav
          ref={navRef}
          className="relative grid min-h-0 flex-1 content-start gap-4 overflow-y-auto"
        >
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute z-0 rounded-lg border border-nextide-tide/55 bg-nextide-tide/10 shadow-[inset_0_1px_1px_rgb(30_228_188/0.18),0_0_28px_rgb(30_228_188/0.18)] transition-[top,height,left,width,opacity] duration-[520ms] ease-[var(--nextide-ease-in-out-quart)] motion-reduce:transition-none",
              activeItemId && !railActive ? "opacity-100" : "opacity-0",
              railActive && "transition-none"
            )}
            style={{
              top: "var(--navigation-outline-top, 0px)",
              left: "var(--navigation-outline-left, 0px)",
              width: "var(--navigation-outline-width, 0px)",
              height: "var(--navigation-outline-height, 0px)",
            }}
          />
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute z-0 rounded-full bg-nextide-tide shadow-[0_0_16px_rgb(30_228_188/0.45)] transition-[top,height,opacity] duration-[180ms] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
              activeItemId && railActive ? "opacity-100" : "opacity-0"
            )}
            style={{
              top: "calc(var(--navigation-outline-top, 0px) + 10px)",
              left: "2px",
              width: "3px",
              height: "calc(var(--navigation-outline-height, 0px) - 20px)",
            }}
          />
          {sections.map((section) => (
            <section key={section.id} className="relative z-10 grid gap-2">
              {section.label ? (
                <h3
                  aria-hidden={collapsed || drawerCollapsed}
                  className={cn(
                    "overflow-hidden px-2 text-xs font-normal tracking-normal text-muted-foreground transition-[max-height,opacity,transform] duration-[260ms] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
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
                        "group relative grid min-h-11 w-full items-center gap-2 rounded-lg border border-transparent text-left transition-[width,height,grid-template-columns,padding,color,background-color] duration-[260ms] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
                        collapsed
                          ? "size-12 grid-cols-1 place-items-center p-0"
                          : "grid-cols-[auto_minmax(0,1fr)] p-2",
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
                        className={cn(
                          "grid size-7 place-items-center rounded-full bg-nextide-panel text-nextide-tide transition-[background-color,box-shadow] duration-[260ms] ease-[var(--nextide-drawer-ease)] [&_svg]:block [&_svg]:size-4",
                          active &&
                            "bg-nextide-tide/10 shadow-[0_0_20px_rgb(30_228_188/0.16)]",
                          collapsed && "[&_svg]:translate-y-px"
                        )}
                      >
                        {item.icon ?? item.label.slice(0, 1)}
                      </span>
                      {!collapsed ? (
                        <>
                          <span
                            className={cn(
                              "min-w-0 overflow-hidden [mask-image:linear-gradient(to_right,transparent_0,black_5px,black_100%)] whitespace-nowrap transition-[max-width] duration-[260ms] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
                              drawerCollapsed
                                ? "max-w-0"
                                : "max-w-52 [mask-image:linear-gradient(to_right,black_0,black_100%)]"
                            )}
                          >
                            <span
                              className={cn(
                                "grid min-w-0 gap-0.5 transition-transform duration-[260ms] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
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
                                      className="px-1.5 py-0.5"
                                    >
                                      {item.status}
                                    </StatusBadge>
                                  ) : null}
                                </span>
                              ) : null}
                            </span>
                          </span>
                        </>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </section>
          ))}
        </nav>

        {footer ? (
          <footer
            aria-hidden={collapsed || drawerCollapsed}
            className={cn(
              "w-full overflow-hidden border-t border-nextide-line transition-[max-height,opacity,padding,transform] duration-[260ms] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
              collapsed || drawerCollapsed
                ? "max-h-0 -translate-x-10 pt-0 opacity-0"
                : "max-h-24 translate-x-0 pt-3 opacity-100"
            )}
          >
            {footer}
          </footer>
        ) : null}
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
