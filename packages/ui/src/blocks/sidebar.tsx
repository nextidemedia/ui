import * as React from "react"
import { ChevronLeft, Plus } from "lucide-react"

import { Button } from "@nextide/ui/components/button"
import { StatusBadge } from "@nextide/ui/components/status-badge"
import { Surface } from "@nextide/ui/components/surface"
import { cn } from "@nextide/ui/lib/utils"

const defaultLogoUrl = new URL(
  "../assets/logos/nextide-mark-white.png",
  import.meta.url
).href
const defaultBylineLogoUrl = new URL(
  "../assets/logos/nextide-wordmark-white.png",
  import.meta.url
).href

type SidebarStatusTone =
  | "neutral"
  | "success"
  | "processing"
  | "warning"
  | "danger"

type SidebarItem = {
  id: string
  label: string
  meta?: string
  status?: string
  tone?: SidebarStatusTone
  icon?: React.ReactNode
}

type SidebarBrandProps = {
  brand?: string
  eyebrow?: string
  byline?: string
  logo?: React.ReactNode
  bylineLogo?: React.ReactNode
  collapsed?: boolean
  drawerCollapsed?: boolean
  drawerTransitioning?: boolean
  onToggle?: () => void
  className?: string
}

type SidebarToggleButtonProps = {
  drawerCollapsed?: boolean
  onToggle: () => void
  className?: string
}

const brandTitleGlow: React.CSSProperties = {
  textShadow:
    "0 0 1px rgba(255,255,255,0.9), 0 0 14px rgba(30,228,188,0.72), 0 0 28px rgba(30,228,188,0.32)",
}

const brandTextGlowFilter: React.CSSProperties = {
  filter:
    "drop-shadow(0 0 10px rgb(30 228 188 / 0.46)) drop-shadow(0 0 22px rgb(30 228 188 / 0.22))",
}

function SidebarToggleButton({
  drawerCollapsed = false,
  onToggle,
  className,
}: SidebarToggleButtonProps) {
  const handledPointerToggleRef = React.useRef(false)

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      data-slot="sidebar-toggle"
      className={cn(
        "relative z-30 overflow-visible transition-[right,rotate,opacity,box-shadow,background-color] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] before:absolute before:-inset-1 before:content-[''] active:translate-y-0 motion-reduce:transition-none",
        className
      )}
      aria-label={drawerCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      onPointerDown={(event) => {
        if (event.button !== 0) return

        handledPointerToggleRef.current = true
        window.setTimeout(() => {
          handledPointerToggleRef.current = false
        }, 500)
        onToggle()
      }}
      onClick={() => {
        if (handledPointerToggleRef.current) {
          handledPointerToggleRef.current = false
          return
        }

        onToggle()
      }}
    >
      <ChevronLeft
        className={cn(
          "transition-[rotate] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
          drawerCollapsed && "rotate-180"
        )}
      />
    </Button>
  )
}

function SidebarBrand({
  brand = "Nextide UI",
  eyebrow = "Package",
  byline = "Nextide",
  logo,
  bylineLogo,
  collapsed = false,
  drawerCollapsed = collapsed,
  drawerTransitioning = false,
  onToggle,
  className,
}: SidebarBrandProps) {
  const clipBrandText = drawerCollapsed || drawerTransitioning
  const toggleButton = onToggle ? (
    <SidebarToggleButton
      drawerCollapsed={drawerCollapsed}
      onToggle={onToggle}
    />
  ) : null

  const brandMark = (
    <span className="relative z-30 grid size-16 shrink-0 place-items-center overflow-visible transition-[width,height] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-2.5 rounded-[24px] bg-[linear-gradient(135deg,rgb(30_228_188/0.55),rgb(30_228_188/0.04))] opacity-85 blur-xl"
      />
      <span className="relative grid size-full place-items-center overflow-hidden rounded-[18px] border border-nextide-line bg-[#08080b] shadow-[inset_0_1px_1px_rgb(255_255_255/0.06)] transition-[border-radius] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none">
        {logo ?? (
          <img
            src={defaultLogoUrl}
            alt=""
            draggable={false}
            className="block size-11 object-contain"
          />
        )}
      </span>
    </span>
  )
  const bylineMark = bylineLogo ?? (
    <img
      src={defaultBylineLogoUrl}
      alt={byline}
      draggable={false}
      className="h-5 w-auto object-contain object-left drop-shadow-[0_0_10px_rgb(30_228_188/0.45)]"
    />
  )

  return (
    <header
      data-slot="sidebar-brand"
      data-collapsed={collapsed}
      data-drawer-collapsed={drawerCollapsed}
      className={cn(
        "relative z-30 grid w-full overflow-visible transition-[gap,min-height,padding] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
        collapsed
          ? "grid-cols-[4rem] items-center py-1 pr-0 pl-1"
          : "grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-1 pr-2 pl-1",
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute z-0 rounded-[30px] bg-[linear-gradient(90deg,rgb(30_228_188/0.10),transparent)] blur-[22px]",
          collapsed
            ? "inset-x-0 top-9 bottom-0 opacity-65"
            : "-inset-y-3 right-10 -left-2 opacity-100"
        )}
      />
      {collapsed ? toggleButton : null}
      {brandMark}
      {!collapsed ? (
        <span
          data-slot="sidebar-brand-text"
          className={cn(
            "relative z-10 -my-3 min-w-0 py-3 whitespace-nowrap transition-[max-width] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
            drawerCollapsed ? "max-w-0" : "max-w-56",
            clipBrandText
              ? "overflow-hidden [mask-image:linear-gradient(to_right,transparent_0,black_5px,black_100%)]"
              : "overflow-visible [mask-image:none]"
          )}
          style={brandTextGlowFilter}
        >
          <span
            data-slot="sidebar-brand-text-inner"
            className={cn(
              "grid gap-0.5 transition-transform duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
              drawerCollapsed ? "-translate-x-16" : "translate-x-0"
            )}
          >
            <strong
              className="text-lg leading-none font-bold"
              style={brandTitleGlow}
            >
              {brand}
            </strong>
            <small className="truncate text-xs leading-none font-bold text-nextide-tide uppercase">
              {eyebrow}
            </small>
            <span className="mt-1 flex items-start gap-1.5 leading-none uppercase">
              <b className="-translate-y-[0.24rem] text-[0.6rem] leading-none font-bold text-muted-foreground">
                By
              </b>
              <span className="grid h-5 min-w-0 place-items-start overflow-visible">
                {bylineMark}
              </span>
            </span>
          </span>
        </span>
      ) : null}
      {!collapsed ? toggleButton : null}
    </header>
  )
}

function Sidebar({
  brand = "Nextide UI",
  eyebrow = "Package",
  byline = "Nextide",
  logo,
  bylineLogo,
  items,
  activeItemId,
  collapsed = false,
  drawerCollapsed = collapsed,
  drawerTransitioning = false,
  actionLabel = "New",
  onAction,
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
  items: SidebarItem[]
  activeItemId?: string
  collapsed?: boolean
  drawerCollapsed?: boolean
  drawerTransitioning?: boolean
  actionLabel?: string
  onAction?: () => void
  onToggle?: () => void
  onSelectItem?: (item: SidebarItem) => void
  footer?: React.ReactNode
}) {
  const activeIndex = items.findIndex((item) => item.id === activeItemId)
  const navRef = React.useRef<HTMLElement | null>(null)
  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([])
  const railActive = collapsed || drawerCollapsed
  const compactAction = collapsed

  React.useLayoutEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const setOutline = (
      top: number,
      height: number,
      left: number,
      width: number
    ) => {
      nav.style.setProperty("--sidebar-outline-top", `${top}px`)
      nav.style.setProperty("--sidebar-outline-height", `${height}px`)
      nav.style.setProperty("--sidebar-outline-left", `${left}px`)
      nav.style.setProperty("--sidebar-outline-width", `${width}px`)
    }

    if (activeIndex < 0) {
      const top =
        Number.parseFloat(
          nav.style.getPropertyValue("--sidebar-outline-top")
        ) || 0
      const height =
        Number.parseFloat(
          nav.style.getPropertyValue("--sidebar-outline-height")
        ) || 0
      const left =
        Number.parseFloat(
          nav.style.getPropertyValue("--sidebar-outline-left")
        ) || 0
      const width =
        Number.parseFloat(
          nav.style.getPropertyValue("--sidebar-outline-width")
        ) || 0
      setOutline(top + height / 2, 0, left + width / 2, 0)
      return
    }

    const activeItem = itemRefs.current[activeIndex]
    if (!activeItem) return

    let frame = 0
    const measureOutline = () => {
      const navRect = nav.getBoundingClientRect()
      const itemRect = activeItem.getBoundingClientRect()
      const compactOutline = collapsed
      const compactWidth = Math.min(itemRect.width, 44)
      const left = itemRect.left - navRect.left + nav.scrollLeft
      const top = itemRect.top - navRect.top + nav.scrollTop
      setOutline(
        top,
        itemRect.height,
        collapsed
          ? left + (itemRect.width - compactWidth) / 2
          : left,
        compactOutline ? compactWidth : itemRect.width
      )
    }
    const scheduleMeasureOutline = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(measureOutline)
    }

    measureOutline()

    const resizeObserver = new ResizeObserver(scheduleMeasureOutline)
    resizeObserver.observe(nav)
    resizeObserver.observe(activeItem)
    window.addEventListener("resize", scheduleMeasureOutline)

    return () => {
      window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      window.removeEventListener("resize", scheduleMeasureOutline)
    }
  }, [activeIndex, collapsed, drawerCollapsed, items.length])

  return (
    <div
      data-slot="sidebar-frame"
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
        data-slot="sidebar"
        data-collapsed={collapsed}
        data-drawer-collapsed={drawerCollapsed}
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-3 overflow-visible transition-[padding,border-radius,box-shadow,background-color] duration-[var(--nextide-drawer-icon-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
          collapsed ? "items-center overflow-visible p-3" : "p-3"
        )}
        {...props}
      >
        {onAction || onToggle ? (
          <div
            className={cn(
              "relative flex h-8 w-full items-center overflow-visible",
              compactAction && "justify-center"
            )}
          >
            {onAction ? (
              <Button
                type="button"
                className={cn(
                  "relative h-8 gap-0 overflow-visible transition-[width,padding] duration-[var(--nextide-drawer-icon-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
                  compactAction
                    ? "size-8 p-0"
                    : "grid w-[max(2.75rem,calc(100%-2.75rem))] grid-cols-[2.75rem_minmax(0,1fr)] p-0"
                )}
                aria-label={actionLabel}
                onClick={onAction}
              >
                <span
                  className={cn(
                    "pointer-events-none absolute -top-px grid size-8 shrink-0 place-items-center",
                    compactAction
                      ? "left-[calc((100%-2rem)/2)]"
                      : "left-[0.375rem]"
                  )}
                >
                  <Plus />
                </span>
                {!collapsed ? (
                  <span
                    className={cn(
                      "col-start-2 min-w-0 overflow-hidden [mask-image:linear-gradient(to_right,transparent_0,black_5px,black_100%)] whitespace-nowrap transition-[max-width] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
                      drawerCollapsed
                        ? "max-w-0"
                        : "max-w-32 [mask-image:linear-gradient(to_right,black_0,black_100%)]"
                    )}
                  >
                    <span
                      className={cn(
                        "block transition-transform duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
                        drawerCollapsed ? "-translate-x-6" : "translate-x-0"
                      )}
                    >
                      {actionLabel}
                    </span>
                  </span>
                ) : null}
              </Button>
            ) : null}
            {onToggle ? (
              <SidebarToggleButton
                drawerCollapsed={drawerCollapsed}
                onToggle={onToggle}
                className={cn(
                  "absolute top-0 shadow-[0_0_18px_rgb(30_228_188/0.16)]",
                  drawerCollapsed || collapsed ? "right-[-1.75rem]" : "right-0"
                )}
              />
            ) : null}
          </div>
        ) : null}

        <nav
          ref={navRef}
          className={cn(
            "relative grid min-h-0 w-full flex-1 content-start gap-2 overflow-y-auto",
            activeIndex < 0 && "[--sidebar-outline-height:0px]"
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute z-0 rounded-lg border border-nextide-tide/55 bg-nextide-tide/10 shadow-[inset_0_1px_1px_rgb(30_228_188/0.18),0_0_28px_rgb(30_228_188/0.18)] transition-[top,height,left,width,opacity] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
              activeIndex < 0 || collapsed || drawerCollapsed
                ? "opacity-0 duration-[var(--nextide-drawer-icon-duration)]"
                : "opacity-100 duration-[var(--nextide-drawer-outline-duration)]",
              collapsed && "transition-none"
            )}
            style={{
              top: "calc(var(--sidebar-outline-top, 0px) - 1px)",
              left: "0px",
              width: "100%",
              height: "calc(var(--sidebar-outline-height, 0px) + 2px)",
            }}
          />
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute z-0 rounded-full bg-nextide-tide shadow-[0_0_16px_rgb(30_228_188/0.45)] transition-[top,height,opacity] duration-[var(--nextide-drawer-icon-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
              activeIndex >= 0 && railActive ? "opacity-100" : "opacity-0"
            )}
            style={{
              top: "calc(var(--sidebar-outline-top, 0px) + 6px)",
              left: "2px",
              width: "3px",
              height: "calc(var(--sidebar-outline-height, 0px) - 12px)",
            }}
          />
          {items.map((item, itemIndex) => {
            const active = item.id === activeItemId
            return (
              <button
                key={item.id}
                type="button"
                ref={(node) => {
                  itemRefs.current[itemIndex] = node
                }}
                className={cn(
                  "group relative z-10 grid min-h-11 w-full items-center gap-2 rounded-lg border border-transparent text-left transition-[width,height,grid-template-columns,padding,color,background-color] duration-[var(--nextide-drawer-icon-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
                  collapsed
                    ? "mx-auto size-11 grid-cols-1 place-items-center p-0"
                    : "h-[3.25rem] grid-cols-[2.75rem_minmax(0,1fr)] p-0",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:bg-nextide-panel hover:text-foreground"
                )}
                aria-current={active ? "page" : undefined}
                aria-label={
                  collapsed
                    ? [item.label, item.status, item.meta]
                        .filter(Boolean)
                        .join(" ")
                    : undefined
                }
                onClick={() => onSelectItem?.(item)}
              >
                <span
                  className={cn(
                    "grid size-7 place-items-center justify-self-center rounded-full bg-nextide-panel leading-none text-nextide-tide [&_svg]:block [&_svg]:size-4",
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
                        "grid min-w-0 gap-1 transition-transform duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
                        drawerCollapsed ? "-translate-x-12" : "translate-x-0"
                      )}
                    >
                      <span className="truncate text-sm font-medium">
                        {item.label}
                      </span>
                      <span className="flex min-w-0 items-center gap-2">
                        {item.status ? (
                          <StatusBadge
                            tone={item.tone ?? "neutral"}
                            className="relative z-20"
                          >
                            {item.status}
                          </StatusBadge>
                        ) : null}
                        {item.meta ? (
                          <small className="truncate text-xs text-muted-foreground">
                            {item.meta}
                          </small>
                        ) : null}
                      </span>
                    </span>
                  </span>
                ) : null}
              </button>
            )
          })}
        </nav>

        {footer ? (
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
        ) : null}
      </Surface>
    </div>
  )
}

export {
  Sidebar,
  SidebarBrand,
  SidebarToggleButton,
  type SidebarBrandProps,
  type SidebarItem,
  type SidebarStatusTone,
}
