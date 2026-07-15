import * as React from "react"
import { X } from "lucide-react"

import { Button } from "@nextide/ui/components/button"
import { SelectMenu } from "@nextide/ui/components/select-menu"
import { StatusBadge } from "@nextide/ui/components/status-badge"
import { useContainedScroll } from "@nextide/ui/hooks/use-contained-scroll"
import { cn } from "@nextide/ui/lib/utils"

type DashboardFilterTone =
  | "neutral"
  | "success"
  | "processing"
  | "warning"
  | "danger"

type DashboardFilterGroup = {
  id: string
  label: string
}

type DashboardFilterItem = {
  id: string
  groupId: string
  title: React.ReactNode
  subtitle?: React.ReactNode
  badge?: React.ReactNode
  tone?: DashboardFilterTone
  live?: boolean
}

function DashboardFilterBar({
  groups,
  items,
  activeGroupId,
  selectedItemId,
  onGroupChange,
  onItemSelect,
  onClear,
  className,
  ...props
}: React.ComponentProps<"section"> & {
  groups: DashboardFilterGroup[]
  items: DashboardFilterItem[]
  activeGroupId: string
  selectedItemId?: string
  onGroupChange: (groupId: string) => void
  onItemSelect: (item: DashboardFilterItem) => void
  onClear?: () => void
}) {
  const { ref: scrollerRef, onWheel } = useContainedScroll<HTMLDivElement>({
    axis: "x",
  })
  const visibleItems = items.filter((item) => item.groupId === activeGroupId)
  const hasSelection = !!selectedItemId

  React.useEffect(() => {
    scrollerRef.current?.scrollTo({ left: 0, behavior: "smooth" })
  }, [activeGroupId, scrollerRef])

  return (
    <section
      data-slot="dashboard-filter-bar"
      className={cn(
        "grid gap-2 rounded-xl border border-nextide-line bg-nextide-panel p-2 sm:grid-cols-[12rem_minmax(0,1fr)]",
        className
      )}
      {...props}
    >
      <div className="grid gap-1">
        <span className="sr-only">Filter group</span>
        <SelectMenu
          value={activeGroupId}
          onValueChange={onGroupChange}
          options={groups.map((group) => ({
            value: group.id,
            label: group.label,
          }))}
          aria-label="Filter group"
        />
      </div>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] overflow-hidden rounded-lg border border-nextide-line bg-background/20">
        <div
          data-slot="dashboard-filter-slider"
          className="relative min-w-0 overflow-hidden"
        >
          <div
            ref={scrollerRef}
            onWheel={onWheel}
            data-slot="dashboard-filter-scroll"
            className="nextide-contained-scroll nextide-scrollbar-none flex min-h-11 gap-2 overflow-x-auto p-2"
          >
            {visibleItems.length === 0 ? (
              <div className="grid min-h-16 min-w-full place-items-center text-sm text-muted-foreground">
                No filters in this group.
              </div>
            ) : (
              visibleItems.map((item) => {
                const selected = item.id === selectedItemId
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onItemSelect(item)}
                    className={cn(
                      "grid min-w-52 gap-1 rounded-lg border px-3 py-2 text-left transition-[background-color,border-color,box-shadow] duration-[var(--nextide-motion-state)] hover:bg-nextide-panel-strong",
                      selected
                        ? "border-nextide-tide/65 bg-nextide-tide/10 shadow-[0_0_28px_rgb(30_228_188/0.18)]"
                        : "border-nextide-line bg-nextide-panel"
                    )}
                  >
                    <span className="flex min-w-0 items-start justify-between gap-2">
                      <strong className="min-w-0 truncate text-sm">
                        {item.title}
                      </strong>
                      {item.badge || item.live ? (
                        <StatusBadge
                          tone={
                            item.tone ?? (item.live ? "success" : "neutral")
                          }
                          indicator={item.live ? "pulse" : "none"}
                          className="px-1.5 py-0.5 text-ui-caption"
                        >
                          {item.badge ?? "Live"}
                        </StatusBadge>
                      ) : null}
                    </span>
                    {item.subtitle ? (
                      <span className="truncate text-xs text-muted-foreground">
                        {item.subtitle}
                      </span>
                    ) : null}
                  </button>
                )
              })
            )}
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-linear-to-r from-transparent via-background/65 to-background/95" />
        </div>
        <div className="grid place-items-center bg-background/30 px-2">
          <Button
            type="button"
            size="icon-sm"
            variant={hasSelection ? "default" : "outline"}
            disabled={!hasSelection}
            aria-label="Clear filter"
            onClick={onClear}
          >
            <X />
          </Button>
        </div>
      </div>
    </section>
  )
}

export {
  DashboardFilterBar,
  type DashboardFilterGroup,
  type DashboardFilterItem,
  type DashboardFilterTone,
}
