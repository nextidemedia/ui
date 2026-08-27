import * as React from "react"
import {
  ChevronDown,
  Handshake,
  HeartPulse,
  LayoutDashboard,
  Megaphone,
  Search,
  Settings,
  UsersRound,
} from "lucide-react"

import { SidebarBrand, SidebarToggleButton } from "@nextide/ui/blocks/sidebar"
import type { ShellDensity } from "@nextide/ui/blocks/app-shell"
import {
  NavigationUserMenu,
  type NavigationUserMenuProps,
} from "@nextide/ui/blocks/navigation-user-menu"
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteInputGroup,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePortal,
  AutocompletePositioner,
} from "@nextide/ui/components/autocomplete"
import { Kbd } from "@nextide/ui/components/kbd"
import {
  StatusBadge,
  type StatusBadgeIndicator,
} from "@nextide/ui/components/status-badge"
import { Surface } from "@nextide/ui/components/surface"
import { useContainedScroll } from "@nextide/ui/hooks/use-contained-scroll"
import { cn } from "@nextide/ui/lib/utils"

type NavigationPanelStatusTone =
  | "neutral"
  | "success"
  | "processing"
  | "warning"
  | "danger"

type NavigationPanelSelectionStyle = "rail" | "fill" | "outline" | "dot"

type NavigationPanelItem = {
  id: string
  label: string
  meta?: string
  status?: string
  tone?: NavigationPanelStatusTone
  statusIcon?: React.ReactNode
  statusIndicator?: StatusBadgeIndicator
  icon?: React.ReactNode
  children?: NavigationPanelItem[]
  expanded?: boolean
  action?: {
    label: string
    icon?: React.ReactNode
  }
}

type NavigationPanelSection = {
  id: string
  label?: string
  pinned?: boolean
  items: NavigationPanelItem[]
}

type NavigationPanelSearchItem = NavigationPanelItem & {
  sectionLabel?: string
  parent?: NavigationPanelItem
  actionFor?: NavigationPanelItem
}

type NavigationPanelUserMenu = Omit<
  NavigationUserMenuProps,
  "collapsed" | "drawerCollapsed"
>

const defaultNavigationPanelSections: NavigationPanelSection[] = [
  {
    id: "workspace",
    label: "Navigation",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
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
  selectionStyle?: NavigationPanelSelectionStyle
  density?: ShellDensity
  collapsed?: boolean
  drawerCollapsed?: boolean
  drawerTransitioning?: boolean
  commandLabel?: string
  commandShortcut?: string
  onToggle?: () => void
  onSelectItem: (item: NavigationPanelItem) => void
  onToggleItem?: (item: NavigationPanelItem) => void
  onActionItem?: (item: NavigationPanelItem) => void
  footer?: React.ReactNode
  userMenu?: NavigationPanelUserMenu
}

type NavigationPanelCommandRowProps = {
  density: ShellDensity
  collapsed: boolean
  drawerCollapsed: boolean
  sections: NavigationPanelSection[]
  commandLabel: string
  commandShortcut?: string
  onSelectItem: (item: NavigationPanelItem) => void
  onToggleItem?: (item: NavigationPanelItem) => void
  onActionItem?: (item: NavigationPanelItem) => void
  onToggle?: () => void
}

type NavigationPanelNavProps = {
  sections: NavigationPanelSection[]
  activeItemId?: string
  selectionStyle: NavigationPanelSelectionStyle
  density: ShellDensity
  collapsed: boolean
  drawerCollapsed: boolean
  drawerTransitioning: boolean
  onSelectItem: (item: NavigationPanelItem) => void
  onToggleItem?: (item: NavigationPanelItem) => void
  onActionItem?: (item: NavigationPanelItem) => void
}

type NavigationPanelFooterProps = {
  collapsed: boolean
  drawerCollapsed: boolean
  footer?: React.ReactNode
  userMenu?: NavigationPanelUserMenu
}

function NavigationPanelCommandRow({
  density,
  collapsed,
  drawerCollapsed,
  sections,
  commandLabel,
  commandShortcut,
  onSelectItem,
  onToggleItem,
  onActionItem,
  onToggle,
}: NavigationPanelCommandRowProps) {
  const [searchFocused, setSearchFocused] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")
  const commandRowRef = React.useRef<HTMLDivElement | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const commandShortcutLabel = commandShortcut ?? ""
  const showCommandShortcut = commandShortcutLabel.length > 0
  const compactSearchOpen = collapsed && searchFocused
  const commandFieldVisible = !drawerCollapsed || compactSearchOpen
  const searchItems = React.useMemo(
    () =>
      sections.flatMap((section) =>
        section.items.flatMap((item) => [
          { ...item, sectionLabel: section.label },
          ...(item.children ?? []).map((child) => ({
            ...child,
            sectionLabel: section.label,
            parent: item,
          })),
          ...(item.action && onActionItem
            ? [
                {
                  ...item,
                  label: item.action.label,
                  icon: item.action.icon,
                  sectionLabel: section.label,
                  actionFor: item,
                },
              ]
            : []),
        ])
      ),
    [onActionItem, sections]
  )
  const showSearchResults = searchFocused && searchValue.trim().length > 0

  const clearSearch = React.useCallback(() => {
    setSearchFocused(false)
    setSearchValue("")
    inputRef.current?.blur()
  }, [])

  const focusSearchInput = React.useCallback(() => {
    setSearchFocused(true)
    window.requestAnimationFrame(() => {
      inputRef.current?.focus({ preventScroll: true })
      inputRef.current?.select()
    })
  }, [])

  React.useEffect(() => {
    if (!searchFocused) return

    const handleOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      if (commandRowRef.current?.contains(target)) return
      if (target.closest("[data-slot='autocomplete-content']")) return

      clearSearch()
    }
    const handleEscapeKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return

      event.preventDefault()
      event.stopPropagation()
      clearSearch()
    }

    document.addEventListener("pointerdown", handleOutsidePointerDown)
    document.addEventListener("keydown", handleEscapeKeyDown, true)
    return () => {
      document.removeEventListener("pointerdown", handleOutsidePointerDown)
      document.removeEventListener("keydown", handleEscapeKeyDown, true)
    }
  }, [clearSearch, searchFocused])

  React.useEffect(() => {
    if (!showCommandShortcut) return

    const handleShortcut = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.shiftKey ||
        (!event.metaKey && !event.ctrlKey) ||
        event.key.toLowerCase() !== "k"
      ) {
        return
      }

      event.preventDefault()
      focusSearchInput()
    }

    window.addEventListener("keydown", handleShortcut)
    return () => window.removeEventListener("keydown", handleShortcut)
  }, [focusSearchInput, showCommandShortcut])

  return (
    <Autocomplete
      items={searchItems}
      itemToStringValue={(item: NavigationPanelSearchItem) => item.label}
      filter={matchesNavigationPanelSearch}
      autoHighlight="always"
      open={showSearchResults}
      onOpenChange={(open) => {
        if (!open && searchValue.trim().length > 0) clearSearch()
      }}
      value={searchValue}
      onValueChange={(value) => {
        setSearchFocused(true)
        setSearchValue(value)
      }}
    >
      <div
        ref={commandRowRef}
        data-slot="navigation-panel-command-row"
        className={cn(
          "relative h-11 w-full self-start overflow-visible",
          density === "compact" && "lg:h-10",
          density === "ops" && "lg:h-[2.375rem]",
          collapsed &&
            (density === "current"
              ? "h-[5.875rem]"
              : density === "compact"
                ? "h-[5.875rem] lg:h-[5.375rem]"
                : "h-[5.875rem] lg:h-20")
        )}
      >
        <AutocompleteInputGroup
          data-slot="navigation-panel-command-control"
          className={cn(
            "absolute top-0 left-0 flex h-11 min-w-0 items-center gap-0 overflow-hidden rounded-lg border px-0 text-left text-sm text-muted-foreground/65 transition-[top,width,height,padding,color,background-color,border-color,box-shadow] duration-[var(--nextide-drawer-icon-duration)] ease-[var(--nextide-drawer-ease)] hover:bg-nextide-panel-strong motion-reduce:transition-none max-lg:static max-lg:w-full",
            density === "compact" && "lg:h-10",
            density === "ops" && "lg:h-[2.375rem] lg:rounded-[7px]",
            compactSearchOpen
              ? "z-50 w-[min(18rem,calc(100vw-6rem))] border-nextide-line bg-popover! shadow-md focus-within:border-nextide-tide/55 focus-within:ring-0"
              : collapsed
                ? "z-30 w-11"
                : "w-[calc(100%-3.25rem)]",
            !compactSearchOpen &&
              collapsed &&
              density === "compact" &&
              "lg:w-10",
            !compactSearchOpen &&
              collapsed &&
              density === "ops" &&
              "lg:w-[2.375rem]",
            !compactSearchOpen &&
              !collapsed &&
              density === "compact" &&
              "lg:w-[calc(100%-2.875rem)]",
            !compactSearchOpen &&
              !collapsed &&
              density === "ops" &&
              "lg:w-[calc(100%-2.625rem)]",
            !compactSearchOpen && drawerCollapsed
              ? "border-transparent bg-transparent shadow-none ring-0 focus-within:border-transparent focus-within:ring-0 hover:bg-nextide-panel-strong/70 dark:border-transparent dark:bg-transparent"
              : !compactSearchOpen && "border-nextide-line bg-nextide-panel",
            collapsed
              ? cn(
                  "top-[3.125rem] p-0",
                  density === "compact" && "lg:top-[2.875rem]",
                  density === "ops" && "lg:top-[2.625rem]"
                )
              : "top-0 p-0"
          )}
          onPointerDown={(event) => {
            if (event.button !== 0 || event.target === inputRef.current) return

            event.preventDefault()
            focusSearchInput()
          }}
        >
          <span
            aria-hidden="true"
            data-slot="navigation-panel-command-icon"
            className={cn(
              "relative z-10 grid size-11 shrink-0 place-items-center text-nextide-tide [&_svg]:size-4",
              density === "compact" && "lg:size-10",
              density === "ops" && "lg:size-[2.375rem]"
            )}
          >
            <Search />
          </span>
          <span
            data-slot="navigation-panel-command-copy"
            className={cn(
              "absolute inset-y-0 left-11 flex w-[calc(100%-2.75rem)] min-w-[10.25rem] items-center transition-[opacity,translate] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
              density === "compact" &&
                "lg:left-10 lg:w-[calc(100%-2.5rem)] lg:min-w-0",
              density === "ops" &&
                "lg:left-[2.375rem] lg:w-[calc(100%-2.375rem)] lg:min-w-0",
              commandFieldVisible
                ? "translate-x-0 opacity-100"
                : "pointer-events-none -translate-x-[calc(100%+2.75rem)] opacity-0"
            )}
          >
            <AutocompleteInput
              ref={inputRef}
              aria-label={commandLabel}
              autoComplete="off"
              placeholder={commandLabel}
              spellCheck={false}
              className={cn(
                "h-11 min-w-0 px-0 text-sm text-muted-foreground/80 placeholder:text-muted-foreground/55",
                density === "compact" && "lg:h-10",
                density === "ops" && "lg:h-[2.375rem] lg:text-[13px]"
              )}
              onFocus={() => {
                setSearchFocused(true)
              }}
            />
            {showCommandShortcut && !compactSearchOpen ? (
              <Kbd
                className={cn(
                  "mr-2.5 hidden h-auto min-w-0 shrink-0 rounded-none bg-transparent p-0 font-sans text-ui-caption leading-none text-muted-foreground/45 sm:inline-flex",
                  collapsed && "opacity-0"
                )}
              >
                {commandShortcutLabel}
              </Kbd>
            ) : null}
          </span>
        </AutocompleteInputGroup>
        {onToggle ? (
          <SidebarToggleButton
            drawerCollapsed={drawerCollapsed}
            onToggle={() => {
              clearSearch()
              onToggle()
            }}
            className={cn(
              "absolute top-0 right-0 size-11 rounded-lg text-nextide-tide max-lg:hidden",
              density === "compact" && "lg:size-10",
              density === "ops" && "lg:size-[2.375rem] lg:rounded-[7px]",
              drawerCollapsed
                ? "border-transparent bg-transparent shadow-none hover:bg-nextide-panel-strong/70 dark:border-transparent dark:bg-transparent"
                : "shadow-[0_0_18px_rgb(30_228_188/0.12)]"
            )}
          />
        ) : null}
      </div>
      <AutocompletePortal>
        <AutocompletePositioner sideOffset={8}>
          <AutocompleteContent>
            <AutocompleteEmpty>No navigation found.</AutocompleteEmpty>
            <AutocompleteList>
              {(item: NavigationPanelSearchItem) => {
                const detail = [item.sectionLabel, item.meta, item.status]
                  .filter(Boolean)
                  .join(" · ")

                return (
                  <AutocompleteItem
                    key={
                      item.actionFor
                        ? `action:${item.actionFor.id}`
                        : `item:${item.id}`
                    }
                    value={item}
                    className="min-h-11 py-2"
                    onClick={() => {
                      if (item.actionFor) {
                        onActionItem?.(item.actionFor)
                      } else if (item.parent && !item.parent.expanded) {
                        onToggleItem?.(item.parent)
                        onSelectItem(item)
                      } else {
                        onSelectItem(item)
                      }
                      clearSearch()
                    }}
                  >
                    <span className="grid size-7 shrink-0 place-items-center text-nextide-tide [&_svg]:size-4">
                      {item.icon ?? item.label.slice(0, 1)}
                    </span>
                    <span className="grid min-w-0 gap-0.5">
                      <span className="truncate font-medium">{item.label}</span>
                      {detail ? (
                        <small className="truncate text-xs text-muted-foreground">
                          {detail}
                        </small>
                      ) : null}
                    </span>
                  </AutocompleteItem>
                )
              }}
            </AutocompleteList>
          </AutocompleteContent>
        </AutocompletePositioner>
      </AutocompletePortal>
    </Autocomplete>
  )
}

function NavigationPanelNav({
  sections,
  activeItemId,
  selectionStyle,
  density,
  collapsed,
  drawerCollapsed,
  drawerTransitioning,
  onSelectItem,
  onToggleItem,
  onActionItem,
}: NavigationPanelNavProps) {
  const { ref: navRef, onWheel } = useContainedScroll<HTMLElement>({
    axis: "auto",
  })
  const itemRefs = React.useRef<Record<string, HTMLButtonElement | null>>({})
  const itemRectsRef = React.useRef<Record<string, DOMRect>>({})
  const itemAnimationsRef = React.useRef<Record<string, Animation>>({})
  const railRef = React.useRef<HTMLSpanElement | null>(null)
  const railAnimationRef = React.useRef<Animation | null>(null)
  const compact = collapsed || drawerCollapsed
  const selectionSurfaceVisible =
    Boolean(activeItemId) &&
    selectionStyle !== "dot" &&
    (!compact || selectionStyle !== "rail")
  const selectionMarkerVisible =
    Boolean(activeItemId) &&
    (selectionStyle === "rail" || selectionStyle === "dot")
  const effectiveActiveItemId = getEffectiveNavigationItemId(
    sections,
    activeItemId,
    compact
  )
  const previousCompactRef = React.useRef(compact)
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
    [navRef]
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
        "[data-slot='navigation-panel-item-glyph']"
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
    [collapsed, navRef, writeOutlineVars]
  )

  React.useLayoutEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const nextRects: Record<string, DOMRect> = {}
    const visibleItems = getVisibleNavigationPanelItems(sections)
    for (const item of visibleItems) {
      const element = itemRefs.current[item.id]
      if (element) nextRects[item.id] = readNavigationItemMotionRect(element)
    }

    const previousRects = itemRectsRef.current
    const stateChanged = previousCompactRef.current !== compact
    const reducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false

    for (const animation of Object.values(itemAnimationsRef.current)) {
      animation.cancel()
    }
    itemAnimationsRef.current = {}
    railAnimationRef.current?.cancel()
    railAnimationRef.current = null

    if (stateChanged && !reducedMotion && typeof nav.animate === "function") {
      const styles = window.getComputedStyle(nav)
      const duration = readCssTime(
        styles.getPropertyValue("--nextide-drawer-icon-duration"),
        160
      )
      const activeElement = effectiveActiveItemId
        ? itemRefs.current[effectiveActiveItemId]
        : null
      const previousRailTop = Number.parseFloat(
        nav.style.getPropertyValue("--navigation-rail-top")
      )

      if (activeElement) measureOutline(activeElement)
      const nextRailTop = Number.parseFloat(
        nav.style.getPropertyValue("--navigation-rail-top")
      )

      for (const item of visibleItems) {
        const element = itemRefs.current[item.id]
        const previousRect = previousRects[item.id]
        const nextRect = nextRects[item.id]
        if (!element || !previousRect || !nextRect) continue

        const deltaY = previousRect.top - nextRect.top
        if (Math.abs(deltaY) < 0.5) continue

        const animation = element.animate(
          [
            { transform: `translate3d(0, ${deltaY}px, 0)` },
            { transform: "translate3d(0, 0, 0)" },
          ],
          {
            duration,
            easing: "cubic-bezier(0.25, 1, 0.5, 1)",
          }
        )

        itemAnimationsRef.current[item.id] = animation
        void animation.finished
          .then(() => {
            if (itemAnimationsRef.current[item.id] !== animation) return
            delete itemAnimationsRef.current[item.id]
          })
          .catch(() => undefined)
      }

      if (
        railRef.current &&
        Number.isFinite(previousRailTop) &&
        Number.isFinite(nextRailTop)
      ) {
        const deltaY = previousRailTop - nextRailTop
        if (Math.abs(deltaY) >= 0.5) {
          const animation = railRef.current.animate(
            [
              { transform: `translate3d(0, ${deltaY}px, 0)` },
              { transform: "translate3d(0, 0, 0)" },
            ],
            {
              duration,
              easing: "cubic-bezier(0.25, 1, 0.5, 1)",
            }
          )

          railAnimationRef.current = animation
          void animation.finished
            .then(() => {
              if (railAnimationRef.current === animation) {
                railAnimationRef.current = null
              }
            })
            .catch(() => undefined)
        }
      }
    }

    itemRectsRef.current = nextRects
    previousCompactRef.current = compact

    return () => {
      for (const animation of Object.values(itemAnimationsRef.current)) {
        animation.cancel()
      }
      itemAnimationsRef.current = {}
      railAnimationRef.current?.cancel()
      railAnimationRef.current = null
    }
  }, [compact, effectiveActiveItemId, measureOutline, navRef, sections])

  React.useLayoutEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const activeItem = effectiveActiveItemId
      ? itemRefs.current[effectiveActiveItemId]
      : null
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
  }, [
    effectiveActiveItemId,
    drawerTransitioning,
    measureOutline,
    navRef,
    sections,
    writeOutlineVars,
  ])

  return (
    <nav
      ref={navRef}
      onWheel={onWheel}
      className={cn(
        "nextide-scrollbar-none relative flex min-h-0 w-full flex-1 flex-col gap-4 overflow-y-auto max-lg:flex-none max-lg:flex-row max-lg:gap-2 max-lg:overflow-x-auto max-lg:overflow-y-hidden max-lg:pb-1",
        density !== "current" && "lg:gap-3"
      )}
    >
      <span
        aria-hidden="true"
        data-slot="navigation-panel-selection"
        className={cn(
          "pointer-events-none absolute z-0 rounded-lg ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none max-lg:hidden",
          selectionStyle === "rail" && "bg-nextide-tide/[0.07]",
          selectionStyle === "fill" && "nextide-navigation-selection-wave",
          selectionStyle === "outline" &&
            "ring-1 ring-nextide-tide/50 ring-inset",
          drawerTransitioning
            ? "transition-opacity duration-[var(--nextide-drawer-icon-duration)]"
            : "transition-[top,height,left,width,opacity] duration-[var(--nextide-motion-state)]",
          selectionSurfaceVisible
            ? "opacity-100"
            : "opacity-0 duration-[var(--nextide-drawer-icon-duration)]",
          collapsed && "transition-none"
        )}
        style={{
          top: "var(--navigation-outline-top, 0px)",
          left: "var(--navigation-outline-left, 0px)",
          width: "var(--navigation-outline-width, 0px)",
          height: "var(--navigation-outline-height, 0px)",
        }}
      />
      <span
        ref={railRef}
        aria-hidden="true"
        data-slot="navigation-panel-rail"
        className={cn(
          "pointer-events-none absolute z-20 ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none max-lg:hidden",
          selectionStyle === "rail" &&
            "rounded-full bg-nextide-tide shadow-[0_0_14px_rgb(30_228_188/0.34)]",
          selectionStyle === "dot" &&
            "bg-transparent after:absolute after:top-1/2 after:left-1/2 after:size-1.5 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-nextide-tide after:shadow-[0_0_12px_rgb(30_228_188/0.4)] after:content-['']",
          drawerTransitioning
            ? "transition-opacity duration-[var(--nextide-drawer-icon-duration)]"
            : "transition-[top,height,opacity] duration-[var(--nextide-motion-state)]",
          selectionMarkerVisible ? "opacity-100" : "opacity-0"
        )}
        style={{
          top: "var(--navigation-rail-top, 0px)",
          left: "0px",
          width: selectionStyle === "dot" ? "8px" : "2px",
          height: "var(--navigation-rail-height, 0px)",
        }}
      />
      {sections.map((section) => (
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
            {section.label ? (
              <h3
                aria-hidden={collapsed || drawerCollapsed}
                className={cn(
                  "text-ui-caption font-medium tracking-[0.08em] text-muted-foreground uppercase max-lg:hidden",
                  density === "compact" && "text-xs leading-4",
                  density === "ops" &&
                    "text-[13px] leading-5 font-semibold tracking-normal normal-case",
                  collapsed
                    ? "max-h-0 overflow-visible"
                    : "max-h-6 overflow-hidden"
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
            ) : null}
            <div
              className={cn(
                "grid gap-1.5 max-lg:flex",
                density !== "current" && "lg:gap-0.5"
              )}
            >
              {section.items.map((item) => {
                const active = item.id === activeItemId
                const activeChild = item.children?.find(
                  (child) => child.id === activeItemId
                )
                const branchActive = Boolean(activeChild)
                const hasChildren = Boolean(item.children?.length)
                const compactChildActive =
                  branchActive && (collapsed || drawerCollapsed)

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
                        !collapsed &&
                          !drawerCollapsed &&
                          (item.action || hasChildren)
                          ? item.action && hasChildren
                            ? "grid-cols-[minmax(0,1fr)_2rem_2rem]"
                            : "grid-cols-[minmax(0,1fr)_2rem]"
                          : "grid-cols-1"
                      )}
                    >
                      <button
                        type="button"
                        ref={(node) => {
                          itemRefs.current[item.id] = node
                        }}
                        data-slot="navigation-panel-item"
                        className={cn(
                          "group relative grid min-h-11 w-full items-center gap-2 rounded-lg border border-transparent text-left transition-[color,background-color] duration-[var(--nextide-motion-control)] ease-[var(--nextide-ease-out-quart)] motion-reduce:transition-none max-lg:h-11 max-lg:w-auto max-lg:min-w-max max-lg:grid-cols-[2rem_minmax(0,1fr)] max-lg:pr-3",
                          collapsed || (!item.meta && !item.status)
                            ? cn(
                                "h-11",
                                density === "compact" && "lg:h-10 lg:min-h-10",
                                density === "ops" &&
                                  "lg:h-[2.375rem] lg:min-h-[2.375rem] lg:rounded-[7px]"
                              )
                            : cn(
                                "h-[3.25rem]",
                                density === "compact" && "lg:h-12 lg:min-h-12",
                                density === "ops" &&
                                  "lg:h-11 lg:min-h-11 lg:rounded-[7px]"
                              ),
                          collapsed
                            ? cn(
                                "mr-auto w-11 grid-cols-[2.75rem_0fr] gap-0 p-0",
                                density === "compact" &&
                                  "lg:w-10 lg:grid-cols-[2.5rem_0fr]",
                                density === "ops" &&
                                  "lg:w-[2.375rem] lg:grid-cols-[2.375rem_0fr]"
                              )
                            : cn(
                                "grid-cols-[2.75rem_minmax(0,1fr)] p-0",
                                density === "compact" &&
                                  "lg:grid-cols-[2.5rem_minmax(0,1fr)] lg:gap-1",
                                density === "ops" &&
                                  "lg:grid-cols-[2.375rem_minmax(0,1fr)] lg:gap-0"
                              ),
                          active
                            ? cn(
                                "text-foreground",
                                getNavigationPanelMobileSelectionClass(
                                  selectionStyle
                                )
                              )
                            : branchActive
                              ? "text-foreground"
                              : "text-muted-foreground hover:bg-nextide-panel-strong/70 hover:text-foreground"
                        )}
                        aria-current={
                          active || compactChildActive ? "page" : undefined
                        }
                        aria-label={
                          collapsed || drawerCollapsed
                            ? [
                                activeChild?.label ?? item.label,
                                item.status,
                                item.meta,
                              ]
                                .filter(Boolean)
                                .join(" ")
                            : undefined
                        }
                        onClick={(event) => {
                          measureOutline(event.currentTarget)
                          onSelectItem(
                            compactChildActive && activeChild
                              ? activeChild
                              : item
                          )
                        }}
                      >
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
                              drawerCollapsed
                                ? "w-52 -translate-x-12"
                                : "translate-x-0"
                            )}
                          >
                            <span className="truncate text-sm font-medium">
                              {item.label}
                            </span>
                            {item.meta || item.status ? (
                              <span className="flex min-w-0 items-center gap-2 max-lg:hidden">
                                {item.meta ? (
                                  <small className="min-w-0 truncate text-xs text-muted-foreground">
                                    {item.meta}
                                  </small>
                                ) : null}
                                <NavigationPanelStatus item={item} />
                              </span>
                            ) : null}
                          </span>
                        </span>
                      </button>
                      {item.action &&
                      onActionItem &&
                      !collapsed &&
                      !drawerCollapsed ? (
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
                      {hasChildren &&
                      onToggleItem &&
                      !collapsed &&
                      !drawerCollapsed ? (
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
                    </div>
                    {hasChildren &&
                    item.expanded &&
                    !collapsed &&
                    !drawerCollapsed ? (
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
                                itemRefs.current[child.id] = node
                              }}
                              data-slot="navigation-panel-child"
                              className={cn(
                                "group relative grid min-h-11 w-full grid-cols-[2rem_minmax(0,1fr)] items-center rounded-lg border border-transparent pr-8 text-left text-sm transition-colors max-lg:w-auto max-lg:min-w-max",
                                childActive
                                  ? cn(
                                      "text-foreground",
                                      getNavigationPanelMobileSelectionClass(
                                        selectionStyle
                                      )
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
                                <span className="truncate font-medium">
                                  {child.label}
                                </span>
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
                    ) : null}
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
              })}
            </div>
          </section>
        </React.Fragment>
      ))}
    </nav>
  )
}

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

function NavigationPanelFooter({
  collapsed,
  drawerCollapsed,
  footer,
  userMenu,
}: NavigationPanelFooterProps) {
  if (!footer && !userMenu) {
    return null
  }

  return (
    <footer
      className={cn(
        "grid w-full overflow-hidden border-t border-nextide-line transition-[max-height,padding] duration-[var(--nextide-drawer-icon-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
        collapsed && !userMenu ? "max-h-0 pt-0" : "max-h-40 pt-3",
        footer && userMenu && !drawerCollapsed ? "gap-2" : "gap-0"
      )}
    >
      {footer ? (
        <div
          aria-hidden={collapsed || drawerCollapsed}
          className={cn(
            "overflow-hidden transition-[max-height,opacity,transform] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
            drawerCollapsed
              ? "max-h-0 -translate-x-10 opacity-0"
              : "max-h-24 translate-x-0 opacity-100"
          )}
        >
          {footer}
        </div>
      ) : null}
      {userMenu ? (
        <NavigationUserMenu
          {...userMenu}
          collapsed={collapsed}
          drawerCollapsed={drawerCollapsed}
        />
      ) : null}
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
  selectionStyle = "fill",
  density = "current",
  collapsed = false,
  drawerCollapsed = collapsed,
  drawerTransitioning = false,
  commandLabel = "Search",
  commandShortcut,
  onToggle,
  onSelectItem,
  onToggleItem,
  onActionItem,
  footer,
  userMenu,
  className,
  ...props
}: NavigationPanelProps) {
  return (
    <Surface
      {...props}
      data-slot="navigation-panel-frame"
      data-collapsed={collapsed}
      data-drawer-collapsed={drawerCollapsed}
      data-density={density}
      padding="none"
      className={cn(
        "relative z-20 flex h-full min-h-0 flex-col overflow-visible rounded-none border-x-0 border-t-0 border-nextide-line bg-nextide-panel max-lg:h-auto max-lg:border-b lg:border-r lg:border-b-0",
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
        density={density}
        className={cn(
          "shrink-0 border-b border-nextide-line",
          density === "current"
            ? collapsed
              ? "py-2"
              : "p-4"
            : density === "compact"
              ? collapsed
                ? "p-3"
                : "py-3 pr-3 pl-[18px]"
              : collapsed
                ? "px-[9px] py-3"
                : "py-3 pr-2.5 pl-[18px]"
        )}
      />
      <div
        data-slot="navigation-panel"
        data-collapsed={collapsed}
        data-drawer-collapsed={drawerCollapsed}
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-visible transition-[padding,background-color] duration-[var(--nextide-drawer-icon-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none max-lg:flex-none",
          density === "current"
            ? collapsed
              ? "items-center gap-1.5 overflow-visible p-3"
              : "gap-4 px-4 py-4"
            : density === "compact"
              ? cn(
                  "gap-3 p-3",
                  collapsed && "items-center gap-1.5 overflow-visible"
                )
              : cn(
                  "gap-3 px-2.5 py-3",
                  collapsed && "items-center gap-1 overflow-visible"
                )
        )}
      >
        <NavigationPanelCommandRow
          density={density}
          collapsed={collapsed}
          drawerCollapsed={drawerCollapsed}
          sections={sections}
          commandLabel={commandLabel}
          commandShortcut={commandShortcut}
          onSelectItem={onSelectItem}
          onToggleItem={onToggleItem}
          onActionItem={onActionItem}
          onToggle={onToggle}
        />
        <NavigationPanelNav
          sections={sections}
          activeItemId={activeItemId}
          selectionStyle={selectionStyle}
          density={density}
          collapsed={collapsed}
          drawerCollapsed={drawerCollapsed}
          drawerTransitioning={drawerTransitioning}
          onSelectItem={onSelectItem}
          onToggleItem={onToggleItem}
          onActionItem={onActionItem}
        />
        <NavigationPanelFooter
          collapsed={collapsed}
          drawerCollapsed={drawerCollapsed}
          footer={footer}
          userMenu={userMenu}
        />
      </div>
    </Surface>
  )
}

function matchesNavigationPanelSearch(
  item: NavigationPanelSearchItem,
  query: string
) {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return true

  const searchableFields = [
    item.label,
    item.meta,
    item.status,
    item.sectionLabel,
  ]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.toLocaleLowerCase())

  return terms.every((term) =>
    searchableFields.some((field) => field.includes(term))
  )
}

function readCssTime(value: string, fallback: number) {
  const parsed = Number.parseFloat(value)
  if (!Number.isFinite(parsed)) return fallback
  return value.trim().endsWith("s") && !value.trim().endsWith("ms")
    ? parsed * 1000
    : parsed
}

function readNavigationItemMotionRect(item: HTMLButtonElement) {
  return (
    item
      .querySelector<HTMLElement>("[data-slot='navigation-panel-item-icon']")
      ?.getBoundingClientRect() ?? item.getBoundingClientRect()
  )
}

function getVisibleNavigationPanelItems(sections: NavigationPanelSection[]) {
  return sections.flatMap((section) =>
    section.items.flatMap((item) => [
      item,
      ...(item.expanded ? (item.children ?? []) : []),
    ])
  )
}

function getEffectiveNavigationItemId(
  sections: NavigationPanelSection[],
  activeItemId: string | undefined,
  compact: boolean
) {
  if (!activeItemId) return activeItemId

  const parent = sections
    .flatMap((section) => section.items)
    .find((item) => item.children?.some((child) => child.id === activeItemId))

  return parent && (compact || !parent.expanded) ? parent.id : activeItemId
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

export {
  NavigationPanel,
  defaultNavigationPanelSections,
  type NavigationPanelItem,
  type NavigationPanelSection,
  type NavigationPanelSelectionStyle,
  type NavigationPanelStatusTone,
  type NavigationPanelUserMenu,
}
