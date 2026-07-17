import * as React from "react"
import { Filter, X } from "lucide-react"

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
  const sliderRef = React.useRef<HTMLDivElement>(null)
  const effectLayerRef = React.useRef<HTMLDivElement>(null)
  const visibleItems = items.filter((item) => item.groupId === activeGroupId)
  const visibleItemCount = visibleItems.length
  const activeGroup = groups.find((group) => group.id === activeGroupId)
  const hasSelection = visibleItems.some((item) => item.id === selectedItemId)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)

  const updateScrollState = React.useCallback(() => {
    const scroller = scrollerRef.current

    if (!scroller) return

    setCanScrollLeft(scroller.scrollLeft > 1)
    setCanScrollRight(
      scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 1
    )
  }, [scrollerRef])

  const updateEffectLayer = React.useCallback(() => {
    const scroller = scrollerRef.current
    const slider = sliderRef.current
    const effectLayer = effectLayerRef.current
    const selectedItem = scroller?.querySelector<HTMLElement>(
      '[aria-pressed="true"]'
    )

    if (!slider || !effectLayer || !selectedItem) {
      if (effectLayer) effectLayer.hidden = true
      return
    }

    const sliderRect = slider.getBoundingClientRect()
    const selectedItemRect = selectedItem.getBoundingClientRect()

    effectLayer.style.width = `${selectedItemRect.width}px`
    effectLayer.style.height = `${selectedItemRect.height}px`
    effectLayer.style.transform = `translate3d(${selectedItemRect.left - sliderRect.left}px, ${selectedItemRect.top - sliderRect.top}px, 0)`
    effectLayer.hidden = false
  }, [scrollerRef])

  const updateLayout = React.useCallback(() => {
    updateScrollState()
    updateEffectLayer()
  }, [updateEffectLayer, updateScrollState])

  React.useEffect(() => {
    scrollerRef.current?.scrollTo({ left: 0, behavior: "smooth" })
  }, [activeGroupId, scrollerRef])

  React.useLayoutEffect(() => {
    updateEffectLayer()
  }, [activeGroupId, selectedItemId, updateEffectLayer, visibleItemCount])

  React.useEffect(() => {
    const scroller = scrollerRef.current

    if (!scroller) return

    updateLayout()

    const resizeObserver = new ResizeObserver(updateLayout)
    resizeObserver.observe(scroller)

    return () => resizeObserver.disconnect()
  }, [activeGroupId, scrollerRef, updateLayout, visibleItemCount])

  return (
    <section
      data-slot="dashboard-filter-bar"
      className={cn(
        "rounded-xl border border-nextide-line bg-nextide-panel p-2",
        className
      )}
      {...props}
    >
      <div
        data-slot="dashboard-filter-carousel"
        className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-lg border border-nextide-line"
      >
        <div
          data-slot="dashboard-filter-scope-action"
          className="grid place-items-center px-2"
        >
          <SelectMenu
            value={activeGroupId}
            onValueChange={onGroupChange}
            options={groups.map((group) => ({
              value: group.id,
              label: group.label,
              description: `${items.filter((item) => item.groupId === group.id).length} available`,
            }))}
            triggerContent={<Filter aria-hidden="true" />}
            triggerClassName="size-9! justify-center! border-input! bg-transparent! p-0! text-foreground! hover:bg-nextide-panel-strong! data-popup-open:border-nextide-tide! data-popup-open:bg-nextide-tide! data-popup-open:text-black! data-popup-open:hover:bg-nextide-tide! [&_svg:last-child]:hidden"
            aria-label={`Scope: ${activeGroup?.label ?? "Select"}`}
          />
        </div>
        <div
          ref={sliderRef}
          data-slot="dashboard-filter-slider"
          className="relative min-w-0"
        >
          <div
            ref={scrollerRef}
            onWheel={onWheel}
            onScroll={updateLayout}
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
                        ? "border-nextide-tide/65 bg-nextide-tide/10"
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
          <div
            ref={effectLayerRef}
            aria-hidden="true"
            hidden
            data-slot="dashboard-filter-effect-layer"
            className="nextide-effect-layer pointer-events-none absolute top-0 left-0 rounded-lg shadow-[0_0_28px_rgb(30_228_188/0.18)]"
          />
          <div
            aria-hidden="true"
            data-slot="dashboard-filter-fade-start"
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 w-14 bg-linear-to-r from-nextide-panel via-nextide-panel/65 to-transparent transition-opacity duration-[var(--nextide-motion-state)]",
              canScrollLeft ? "opacity-100" : "opacity-0"
            )}
          />
          <div
            aria-hidden="true"
            data-slot="dashboard-filter-fade"
            className={cn(
              "pointer-events-none absolute inset-y-0 right-0 w-14 bg-linear-to-r from-transparent via-nextide-panel/65 to-nextide-panel transition-opacity duration-[var(--nextide-motion-state)]",
              canScrollRight ? "opacity-100" : "opacity-0"
            )}
          />
        </div>
        <div
          data-slot="dashboard-filter-actions"
          className="grid place-items-center bg-nextide-panel px-2"
        >
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
