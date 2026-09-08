import { ChevronDown } from "lucide-react"
import * as React from "react"

import { StatusBadge } from "@nextide/ui/components/status-badge"
import { cn } from "@nextide/ui/lib/utils"

import type { useNavigationMotion } from "./navigation-panel-motion.js"
import type {
  NavigationPanelItem,
  NavigationPanelNavProps,
  NavigationPanelSection,
  NavigationPanelSelectionStyle,
} from "./navigation-panel-types.js"
function NavigationPanelStatus({
  item,
  iconOnly = false,
}: {
  item: NavigationPanelItem
  iconOnly?: boolean
}) {
  if (!item.status) return null

  return (
    <StatusBadge
      title={iconOnly ? item.status : undefined}
      tone={item.tone ?? "neutral"}
      size="compact"
      icon={item.statusIcon}
      indicator={item.statusIndicator}
      className={cn(
        "relative z-20",
        iconOnly && "absolute top-2 right-2 size-5 justify-center p-0"
      )}
    >
      {iconOnly ? <span className="sr-only">{item.status}</span> : item.status}
    </StatusBadge>
  )
}

function getNavigationPanelMobileSelectionClass(
  selectionStyle: NavigationPanelSelectionStyle
) {
  switch (selectionStyle) {
    case "fill":
      return "max-lg:bg-linear-to-r max-lg:from-nextide-tide/[0.16] max-lg:to-nextide-tide/[0.03]"
    case "outline":
      return "max-lg:ring-1 max-lg:ring-nextide-tide/50 max-lg:ring-inset"
    case "dot":
      return "max-lg:after:absolute max-lg:after:bottom-1 max-lg:after:left-1/2 max-lg:after:size-1 max-lg:after:-translate-x-1/2 max-lg:after:rounded-full max-lg:after:bg-nextide-tide max-lg:after:content-['']"
    case "rail":
      return "max-lg:bg-nextide-tide/[0.07]"
  }
}

type NavigationRenderState = NavigationPanelNavProps &
  Pick<
    ReturnType<typeof useNavigationMotion>,
    "setItemRef" | "measureOutline" | "compact"
  >
function NavigationSection({
  section,
  state,
}: {
  section: NavigationPanelSection
  state: NavigationRenderState
}) {
  const { density, collapsed } = state
  return (
    <React.Fragment key={section.id}>
      <section
        data-pinned={section.pinned || undefined}
        className={cn(
          "relative z-10 grid shrink-0 gap-2 before:absolute before:-top-2 before:left-1/2 before:h-px before:w-8 before:-translate-x-1/2 before:rounded-full before:bg-nextide-line before:transition-opacity before:duration-[var(--nextide-drawer-icon-duration)] before:ease-[var(--nextide-drawer-ease)] max-lg:before:hidden",
          density === "compact" && "lg:gap-1.5",
          density === "ops" && "lg:gap-1",
          collapsed ? "before:opacity-100" : "before:opacity-0",
          section.pinned &&
            "sticky bottom-0 z-30 mt-auto bg-nextide-panel max-lg:static max-lg:mt-0 max-lg:bg-transparent"
        )}
      >
        <NavigationSectionHeading section={section} state={state} />
        <div
          className={cn(
            "grid gap-1.5 max-lg:flex",
            density !== "current" && "lg:gap-0.5"
          )}
        >
          {section.items.map((item) => (
            <NavigationBranch key={item.id} item={item} state={state} />
          ))}
        </div>
      </section>
    </React.Fragment>
  )
}
type BranchProps = { item: NavigationPanelItem; state: NavigationRenderState }
function NavigationBranch({
  item,
  state,
}: {
  item: NavigationPanelItem
  state: NavigationRenderState
}) {
  const { activeItemId, collapsed, drawerCollapsed, compact } = state
  const activeChild = item.children?.find((child) => child.id === activeItemId)
  const hasChildren = Boolean(item.children?.length)

  return (
    <div
      key={item.id}
      data-slot="navigation-panel-branch"
      className="grid min-w-0 gap-1 max-lg:contents"
    >
      <div
        data-slot="navigation-panel-item-row"
        className={cn(
          "grid min-w-0 items-center gap-1 max-lg:flex max-lg:min-w-max",
          !collapsed && !drawerCollapsed && (item.action || hasChildren)
            ? item.action && hasChildren
              ? "grid-cols-[minmax(0,1fr)_2rem_2rem]"
              : "grid-cols-[minmax(0,1fr)_2rem]"
            : "grid-cols-1"
        )}
      >
        <NavigationItemButton item={item} state={state} />
        <NavigationActions item={item} state={state} />
      </div>
      <NavigationChildren item={item} state={state} />
      {activeChild && !item.expanded && !compact ? (
        <span
          data-slot="navigation-panel-current-child"
          aria-current="page"
          className="sr-only"
        >
          {activeChild.label}
        </span>
      ) : null}
    </div>
  )
}
function NavigationChildren({ item, state }: BranchProps) {
  const {
    activeItemId,
    selectionStyle,
    collapsed,
    drawerCollapsed,
    onSelectItem,
    setItemRef,
    measureOutline,
  } = state
  const hasChildren = Boolean(item.children?.length)
  return hasChildren && item.expanded && !collapsed && !drawerCollapsed ? (
    <div
      data-slot="navigation-panel-children"
      className="ml-[1.375rem] grid gap-1 border-l border-nextide-line/70 pl-3 max-lg:ml-0 max-lg:flex max-lg:border-l-0 max-lg:pl-0"
    >
      {item.children?.map((child) => {
        const childActive = child.id === activeItemId

        return (
          <button
            key={child.id}
            type="button"
            ref={(node) => {
              setItemRef(child.id, node)
            }}
            data-slot="navigation-panel-child"
            className={cn(
              "group relative grid min-h-11 w-full grid-cols-[2rem_minmax(0,1fr)] items-center rounded-lg border border-transparent pr-8 text-left text-sm transition-colors max-lg:w-auto max-lg:min-w-max",
              childActive
                ? cn(
                    "text-foreground",
                    getNavigationPanelMobileSelectionClass(selectionStyle)
                  )
                : "text-muted-foreground hover:bg-nextide-panel-strong/70 hover:text-foreground"
            )}
            aria-current={childActive ? "page" : undefined}
            onClick={(event) => {
              measureOutline(event.currentTarget)
              onSelectItem(child)
            }}
          >
            <span
              data-slot="navigation-panel-item-icon"
              className="grid size-8 place-items-center"
            >
              <span
                data-slot="navigation-panel-item-glyph"
                className="grid size-6 place-items-center text-nextide-tide [&_svg]:size-3.5"
              >
                {child.icon ?? (
                  <span className="size-1.5 rounded-full bg-current" />
                )}
              </span>
            </span>
            <span className="grid min-w-0 gap-0.5">
              <span className="truncate font-medium">{child.label}</span>
              {child.meta ? (
                <small className="truncate text-xs text-muted-foreground max-lg:hidden">
                  {child.meta}
                </small>
              ) : null}
            </span>
            <NavigationPanelStatus item={child} iconOnly />
          </button>
        )
      })}
    </div>
  ) : null
}
function NavigationActions({ item, state }: BranchProps) {
  const { collapsed, drawerCollapsed, onToggleItem, onActionItem } = state
  const hasChildren = Boolean(item.children?.length)
  if (collapsed || drawerCollapsed) return null
  return (
    <>
      {item.action && onActionItem ? (
        <button
          type="button"
          data-slot="navigation-panel-item-action"
          aria-label={item.action.label}
          className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-nextide-panel-strong hover:text-nextide-tide focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:outline-none max-lg:size-11 [&_svg]:size-4"
          onClick={() => onActionItem(item)}
        >
          {item.action.icon ?? "+"}
        </button>
      ) : null}
      {hasChildren && onToggleItem ? (
        <button
          type="button"
          data-slot="navigation-panel-item-toggle"
          aria-label={`${item.expanded ? "Collapse" : "Expand"} ${item.label}`}
          aria-expanded={item.expanded ?? false}
          className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-nextide-panel-strong hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:outline-none max-lg:size-11"
          onClick={() => onToggleItem(item)}
        >
          <ChevronDown
            className={cn(
              "size-4 transition-transform duration-[var(--nextide-motion-control)] motion-reduce:transition-none",
              !item.expanded && "-rotate-90"
            )}
          />
        </button>
      ) : null}
    </>
  )
}
function getItemClass(
  { item, state }: BranchProps,
  active: boolean,
  branchActive: boolean
) {
  const { collapsed, density, selectionStyle } = state
  return cn(
    "group relative grid min-h-11 w-full items-center gap-2 rounded-lg border border-transparent text-left transition-[color,background-color] duration-[var(--nextide-motion-control)] ease-[var(--nextide-ease-out-quart)] motion-reduce:transition-none max-lg:h-11 max-lg:w-auto max-lg:min-w-max max-lg:grid-cols-[2rem_minmax(0,1fr)] max-lg:pr-3",
    getItemHeight(item, density, collapsed),
    collapsed
      ? cn(
          "mr-auto w-11 grid-cols-[2.75rem_0fr] gap-0 p-0",
          density === "compact" && "lg:w-10 lg:grid-cols-[2.5rem_0fr]",
          density === "ops" && "lg:w-[2.375rem] lg:grid-cols-[2.375rem_0fr]"
        )
      : cn(
          "grid-cols-[2.75rem_minmax(0,1fr)] p-0",
          density === "compact" &&
            "lg:grid-cols-[2.5rem_minmax(0,1fr)] lg:gap-1",
          density === "ops" && "lg:grid-cols-[2.375rem_minmax(0,1fr)] lg:gap-0"
        ),
    active
      ? cn(
          "text-foreground",
          getNavigationPanelMobileSelectionClass(selectionStyle)
        )
      : branchActive
        ? "text-foreground"
        : "text-muted-foreground hover:bg-nextide-panel-strong/70 hover:text-foreground"
  )
}
function NavigationItemContent({
  item,
  state,
  active,
  branchActive,
}: BranchProps & { active: boolean; branchActive: boolean }) {
  const { collapsed, drawerCollapsed, density } = state
  return (
    <>
      <span
        data-slot="navigation-panel-item-icon"
        className={cn(
          "grid size-11 place-items-center justify-self-center",
          density === "compact" && "lg:size-10",
          density === "ops" && "lg:size-[2.375rem]"
        )}
      >
        <span
          data-slot="navigation-panel-item-glyph"
          className={cn(
            "grid size-7 place-items-center justify-self-center text-nextide-tide transition-[color,filter] duration-[var(--nextide-drawer-icon-duration)] ease-[var(--nextide-drawer-ease)] [&_svg]:block [&_svg]:size-4",
            density !== "current" && "lg:size-6",
            (active || branchActive) &&
              "drop-shadow-[0_0_8px_rgb(30_228_188/0.24)]"
          )}
        >
          {item.icon ?? item.label.slice(0, 1)}
        </span>
      </span>
      <span
        aria-hidden={collapsed || drawerCollapsed}
        className={cn(
          "min-w-0 whitespace-nowrap transition-[max-width,opacity] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
          drawerCollapsed
            ? "max-w-0 overflow-visible opacity-0"
            : "max-w-52 overflow-hidden opacity-100"
        )}
      >
        <span
          className={cn(
            "grid min-w-0 gap-0.5 transition-transform duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none max-lg:block",
            drawerCollapsed ? "w-52 -translate-x-12" : "translate-x-0"
          )}
        >
          <span className="truncate text-sm font-medium">{item.label}</span>
          <NavigationItemMetadata item={item} />
        </span>
      </span>
    </>
  )
}
function NavigationItemButton({ item, state }: BranchProps) {
  const {
    activeItemId,
    collapsed,
    drawerCollapsed,
    onSelectItem,
    setItemRef,
    measureOutline,
  } = state
  const active = item.id === activeItemId
  const activeChild = item.children?.find((child) => child.id === activeItemId)
  const branchActive = Boolean(activeChild)
  const compactChildActive = branchActive && (collapsed || drawerCollapsed)
  return (
    <button
      type="button"
      ref={(node) => {
        setItemRef(item.id, node)
      }}
      data-slot="navigation-panel-item"
      className={getItemClass({ item, state }, active, branchActive)}
      aria-current={active || compactChildActive ? "page" : undefined}
      aria-label={
        collapsed || drawerCollapsed
          ? [activeChild?.label ?? item.label, item.status, item.meta]
              .filter(Boolean)
              .join(" ")
          : undefined
      }
      onClick={(event) => {
        measureOutline(event.currentTarget)
        onSelectItem(compactChildActive && activeChild ? activeChild : item)
      }}
    >
      <NavigationItemContent
        item={item}
        state={state}
        active={active}
        branchActive={branchActive}
      />
    </button>
  )
}

function NavigationSectionHeading({
  section,
  state,
}: {
  section: NavigationPanelSection
  state: NavigationRenderState
}) {
  const { density, collapsed, drawerCollapsed } = state
  return section.label ? (
    <h3
      aria-hidden={collapsed || drawerCollapsed}
      className={cn(
        "text-ui-caption font-medium tracking-[0.08em] text-muted-foreground uppercase max-lg:hidden",
        density === "compact" && "text-xs leading-4",
        density === "ops" &&
          "text-[13px] leading-5 font-semibold tracking-normal normal-case",
        collapsed ? "max-h-0 overflow-visible" : "max-h-6 overflow-hidden"
      )}
    >
      <span
        className={cn(
          "block px-2 transition-transform duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
          density === "compact" && "lg:px-1.5",
          density === "ops" && "lg:px-2",
          drawerCollapsed ? "w-52 -translate-x-72" : "translate-x-0"
        )}
      >
        {section.label}
      </span>
    </h3>
  ) : null
}

function getItemHeight(
  item: NavigationPanelItem,
  density: NavigationPanelNavProps["density"],
  collapsed: boolean
) {
  return collapsed || (!item.meta && !item.status)
    ? cn(
        "h-11",
        density === "compact" && "lg:h-10 lg:min-h-10",
        density === "ops" &&
          "lg:h-[2.375rem] lg:min-h-[2.375rem] lg:rounded-[7px]"
      )
    : cn(
        "h-[3.25rem]",
        density === "compact" && "lg:h-12 lg:min-h-12",
        density === "ops" && "lg:h-11 lg:min-h-11 lg:rounded-[7px]"
      )
}

function NavigationItemMetadata({ item }: { item: NavigationPanelItem }) {
  return item.meta || item.status ? (
    <span className="flex min-w-0 items-center gap-2 max-lg:hidden">
      {item.meta ? (
        <small className="min-w-0 truncate text-xs text-muted-foreground">
          {item.meta}
        </small>
      ) : null}
      <NavigationPanelStatus item={item} />
    </span>
  ) : null
}

export { NavigationSection }
