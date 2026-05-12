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
      className={cn(
        "flex h-full min-h-0 flex-col gap-3 overflow-hidden",
        collapsed ? "items-center p-2" : "p-3",
        className
      )}
      {...props}
    >
      <header
        className={cn(
          "flex w-full items-center gap-3",
          collapsed ? "justify-center" : "justify-between"
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-nextide-line bg-nextide-panel-strong text-nextide-tide shadow-[0_0_22px_rgb(30_228_188/0.16)]">
            {logo ?? <span className="text-sm font-semibold">N</span>}
          </span>
          {!collapsed ? (
            <span className="grid min-w-0 gap-1">
              <strong className="truncate text-base leading-none font-semibold">
                {brand}
              </strong>
              <small className="truncate text-xs font-medium text-nextide-tide uppercase">
                {eyebrow}
              </small>
            </span>
          ) : null}
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
          className={cn("w-full", collapsed && "size-9 px-0")}
          aria-label={actionLabel}
          onClick={onAction}
        >
          <Plus />
          {!collapsed ? <span>{actionLabel}</span> : null}
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
                "group grid min-h-11 w-full items-center gap-2 rounded-lg border border-transparent text-left transition-colors",
                collapsed
                  ? "place-items-center p-2"
                  : "grid-cols-[auto_1fr] p-2",
                active
                  ? "border-nextide-tide/55 bg-nextide-tide/10"
                  : "hover:border-nextide-line hover:bg-nextide-panel"
              )}
              aria-current={active ? "page" : undefined}
              onClick={() => onSelectItem?.(item)}
            >
              <span className="grid size-7 place-items-center rounded-md bg-nextide-panel text-nextide-tide [&_svg]:size-4">
                {item.icon ?? item.label.slice(0, 1)}
              </span>
              {!collapsed ? (
                <span className="grid min-w-0 gap-1">
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

      {footer && !collapsed ? (
        <footer className="border-t border-nextide-line pt-3">{footer}</footer>
      ) : null}
    </Surface>
  )
}

export { Sidebar, type SidebarItem, type SidebarStatusTone }
