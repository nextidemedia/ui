import * as React from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

import { Button } from "@nextide/ui/components/button"
import { StatusBadge } from "@nextide/ui/components/status-badge"
import { Surface } from "@nextide/ui/components/surface"
import { cn } from "@nextide/ui/lib/utils"

const defaultLogoUrl = new URL(
  "../assets/logos/nextide-mark-white.png",
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
  collapsed?: boolean
  onToggle?: () => void
  className?: string
}

const brandTitleGlow: React.CSSProperties = {
  textShadow:
    "0 0 1px rgba(255,255,255,0.9), 0 0 14px rgba(30,228,188,0.72), 0 0 28px rgba(30,228,188,0.32)",
}

function SidebarBrand({
  brand = "Nextide UI",
  eyebrow = "Package",
  byline = "Nextide",
  logo,
  collapsed = false,
  onToggle,
  className,
}: SidebarBrandProps) {
  const toggleButton = onToggle ? (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className="relative z-10"
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      onClick={onToggle}
    >
      {collapsed ? <ChevronRight /> : <ChevronLeft />}
    </Button>
  ) : null

  const brandMark = (
    <span
      className={cn(
        "relative z-10 grid shrink-0 place-items-center overflow-visible transition-[width,height] duration-[260ms] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
        collapsed ? "size-8" : "size-12"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute rounded-[22px] bg-[linear-gradient(135deg,rgb(30_228_188/0.55),rgb(30_228_188/0.04))] blur-xl",
          collapsed ? "-inset-1.5 opacity-75" : "-inset-2 opacity-85"
        )}
      />
      <span
        className={cn(
          "relative grid size-full place-items-center overflow-hidden border border-nextide-line bg-[#08080b] shadow-[inset_0_1px_1px_rgb(255_255_255/0.06)] transition-[border-radius] duration-[260ms] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
          collapsed ? "rounded-xl" : "rounded-[16px]"
        )}
      >
        {logo ?? (
          <img
            src={defaultLogoUrl}
            alt=""
            draggable={false}
            className={cn(
              "block object-contain",
              collapsed ? "size-5" : "size-8"
            )}
          />
        )}
      </span>
    </span>
  )

  return (
    <header
      data-slot="sidebar-brand"
      data-collapsed={collapsed}
      className={cn(
        "relative z-30 grid w-full overflow-visible transition-[gap,min-height,padding] duration-[260ms] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
        collapsed
          ? "justify-items-center gap-2"
          : "grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-2 py-1",
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
        <span className="relative z-10 grid min-w-0 gap-0.5 overflow-visible whitespace-nowrap">
          <strong
            className="text-lg leading-none font-bold"
            style={brandTitleGlow}
          >
            {brand}
          </strong>
          <small className="truncate text-xs leading-none font-bold text-nextide-tide uppercase">
            {eyebrow}
          </small>
          <span className="mt-1 flex items-baseline gap-1.5 text-[0.64rem] leading-none uppercase">
            <b className="-translate-y-[0.32em] text-[0.62em] font-bold text-muted-foreground">
              By
            </b>
            <strong className="font-bold tracking-normal text-foreground">
              {byline}
            </strong>
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
  items,
  activeItemId,
  collapsed = false,
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
  items: SidebarItem[]
  activeItemId?: string
  collapsed?: boolean
  actionLabel?: string
  onAction?: () => void
  onToggle?: () => void
  onSelectItem?: (item: SidebarItem) => void
  footer?: React.ReactNode
}) {
  const activeIndex = items.findIndex((item) => item.id === activeItemId)
  const navRef = React.useRef<HTMLElement | null>(null)
  const itemRefs = React.useRef<Array<HTMLButtonElement | null>>([])

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
      setOutline(
        activeItem.offsetTop,
        activeItem.offsetHeight,
        activeItem.offsetLeft,
        activeItem.offsetWidth
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
  }, [activeIndex, collapsed, items.length])

  return (
    <div
      data-slot="sidebar-frame"
      data-collapsed={collapsed}
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
        collapsed={collapsed}
        onToggle={onToggle}
      />

      <Surface
        data-slot="sidebar"
        data-collapsed={collapsed}
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-3 overflow-hidden transition-[padding,border-radius,box-shadow,background-color] duration-[260ms] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
          collapsed ? "items-center p-2" : "p-3"
        )}
        {...props}
      >
        {onAction ? (
          <Button
            type="button"
            className={cn(
              "transition-[width,padding] duration-[260ms] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
              collapsed ? "size-10 gap-0 p-0" : "w-full"
            )}
            aria-label={actionLabel}
            onClick={onAction}
          >
            <Plus />
            {!collapsed ? (
              <span className="overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-[260ms] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none">
                {actionLabel}
              </span>
            ) : null}
          </Button>
        ) : null}

        <nav
          ref={navRef}
          className={cn(
            "relative grid min-h-0 flex-1 content-start gap-2 overflow-y-auto",
            activeIndex < 0 && "[--sidebar-outline-height:0px]"
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute z-0 rounded-lg border border-nextide-tide/55 bg-nextide-tide/10 shadow-[inset_0_1px_1px_rgb(30_228_188/0.18),0_0_28px_rgb(30_228_188/0.18)] transition-[top,height,left,width,opacity] duration-[520ms] ease-[var(--nextide-ease-in-out-quart)] motion-reduce:transition-none",
              activeIndex < 0 ? "opacity-0" : "opacity-100"
            )}
            style={{
              top: "var(--sidebar-outline-top, 0px)",
              left: "var(--sidebar-outline-left, 0px)",
              width: "var(--sidebar-outline-width, 0px)",
              height: "var(--sidebar-outline-height, 0px)",
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
                  "group relative z-10 grid min-h-11 w-full items-center gap-2 rounded-lg border border-transparent text-left transition-[width,height,grid-template-columns,padding,color,background-color] duration-[260ms] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
                  collapsed
                    ? "size-12 grid-cols-1 place-items-center p-0"
                    : "grid-cols-[auto_1fr] p-2",
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
                    "grid size-7 place-items-center rounded-full bg-nextide-panel leading-none text-nextide-tide [&_svg]:block [&_svg]:size-4",
                    collapsed && "[&_svg]:translate-y-px"
                  )}
                >
                  {item.icon ?? item.label.slice(0, 1)}
                </span>
                {!collapsed ? (
                  <span className="grid max-w-52 min-w-0 gap-1 overflow-hidden whitespace-nowrap opacity-100 transition-[max-width,opacity,transform] duration-[260ms] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none">
                    <span className="truncate text-sm font-medium">
                      {item.label}
                    </span>
                    <span className="flex min-w-0 items-center gap-2">
                      {item.status ? (
                        <StatusBadge tone={item.tone ?? "neutral"}>
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
                ) : null}
              </button>
            )
          })}
        </nav>

        {footer ? (
          <footer
            aria-hidden={collapsed}
            className={cn(
              "w-full overflow-hidden border-t border-nextide-line transition-[max-height,opacity,padding] duration-[260ms] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
              collapsed ? "max-h-0 pt-0 opacity-0" : "max-h-24 pt-3 opacity-100"
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
  type SidebarBrandProps,
  type SidebarItem,
  type SidebarStatusTone,
}
