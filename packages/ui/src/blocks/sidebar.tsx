import * as React from "react"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"

import { Button } from "@nextide/ui/components/button"
import { StatusBadge } from "@nextide/ui/components/status-badge"
import { Surface } from "@nextide/ui/components/surface"
import { cn } from "@nextide/ui/lib/utils"

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
  brand = "Nextide",
  eyebrow = "UI System",
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
  return (
    <Surface
      data-slot="sidebar"
      data-collapsed={collapsed}
      className={cn(
        "flex h-full min-h-0 flex-col gap-3 overflow-hidden transition-[padding,border-radius,box-shadow,background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        collapsed ? "items-center p-2" : "p-3",
        className
      )}
      {...props}
    >
      <header
        className={cn(
          "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 transition-[gap] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          collapsed && "gap-1"
        )}
      >
        <div className="contents">
          <span
            className={cn(
              "grid shrink-0 place-items-center overflow-hidden rounded-full border border-nextide-line bg-nextide-panel-strong text-nextide-tide shadow-[0_0_22px_rgb(30_228_188/0.16)] transition-[width,height] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
              collapsed ? "size-8" : "size-11"
            )}
          >
            {logo ?? (
              <span
                className={cn(
                  "font-semibold",
                  collapsed ? "text-xs" : "text-sm"
                )}
              >
                N
              </span>
            )}
          </span>
          <span
            aria-hidden={collapsed}
            className={cn(
              "grid min-w-0 gap-1 overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-180 ease-out motion-reduce:transition-none",
              collapsed
                ? "max-w-0 -translate-x-2 opacity-0"
                : "max-w-44 opacity-100"
            )}
          >
            <strong className="truncate text-base leading-none font-semibold">
              {brand}
            </strong>
            <small className="truncate text-xs font-medium text-nextide-tide uppercase">
              {eyebrow}
            </small>
          </span>
        </div>
        {onToggle ? (
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={onToggle}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        ) : null}
      </header>

      {onAction ? (
        <Button
          type="button"
          className={cn(
            "transition-[width,padding] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
            collapsed ? "size-9 px-0" : "w-full"
          )}
          aria-label={actionLabel}
          onClick={onAction}
        >
          <Plus />
          <span
            aria-hidden={collapsed}
            className={cn(
              "overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-180 ease-out motion-reduce:transition-none",
              collapsed
                ? "max-w-0 -translate-x-1 opacity-0"
                : "max-w-32 opacity-100"
            )}
          >
            {actionLabel}
          </span>
        </Button>
      ) : null}

      <nav className="grid min-h-0 flex-1 content-start gap-2 overflow-y-auto">
        {items.map((item) => {
          const active = item.id === activeItemId
          return (
            <button
              key={item.id}
              type="button"
              className={cn(
                "group grid min-h-11 w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-2 rounded-lg border border-transparent text-left transition-[grid-template-columns,padding,border-color,background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                collapsed
                  ? "grid-cols-[auto_minmax(0,0fr)] place-items-center p-2"
                  : "grid-cols-[auto_1fr] p-2",
                active
                  ? "border-nextide-tide/55 bg-nextide-tide/10"
                  : "hover:border-nextide-line hover:bg-nextide-panel"
              )}
              aria-current={active ? "page" : undefined}
              onClick={() => onSelectItem?.(item)}
            >
              <span className="grid size-7 place-items-center rounded-full bg-nextide-panel text-nextide-tide [&_svg]:size-4">
                {item.icon ?? item.label.slice(0, 1)}
              </span>
              <span
                aria-hidden={collapsed}
                className={cn(
                  "grid min-w-0 gap-1 overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-180 ease-out motion-reduce:transition-none",
                  collapsed
                    ? "max-w-0 -translate-x-2 opacity-0"
                    : "max-w-52 opacity-100"
                )}
              >
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
            </button>
          )
        })}
      </nav>

      {footer ? (
        <footer
          aria-hidden={collapsed}
          className={cn(
            "w-full overflow-hidden border-t border-nextide-line transition-[max-height,opacity,padding] duration-180 ease-out motion-reduce:transition-none",
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
