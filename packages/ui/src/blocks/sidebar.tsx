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

  const toggleButton = onToggle ? (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      onClick={onToggle}
    >
      {collapsed ? <ChevronRight /> : <ChevronLeft />}
    </Button>
  ) : null

  const brandMark = (
    <span
      className={cn(
        "grid shrink-0 place-items-center overflow-hidden rounded-[16px] border border-nextide-line bg-[#08080b] transition-[width,height,border-radius] duration-[260ms] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
        collapsed ? "size-8 rounded-xl" : "size-12"
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
  )

  return (
    <Surface
      data-slot="sidebar"
      data-collapsed={collapsed}
      className={cn(
        "flex h-full min-h-0 flex-col gap-3 overflow-hidden transition-[padding,border-radius,box-shadow,background-color] duration-[260ms] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
        collapsed ? "items-center p-2" : "p-3",
        className
      )}
      {...props}
    >
      <header
        className={cn(
          "grid w-full transition-[gap] duration-[260ms] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
          collapsed
            ? "justify-items-center gap-2"
            : "grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3"
        )}
      >
        {collapsed ? toggleButton : null}
        {brandMark}
        {!collapsed ? (
          <span
            className={cn(
              "grid min-w-0 gap-0.5 overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-[260ms] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
              "max-w-44 opacity-100"
            )}
          >
            <strong className="truncate text-lg leading-none font-bold">
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
  )
}

export { Sidebar, type SidebarItem, type SidebarStatusTone }
