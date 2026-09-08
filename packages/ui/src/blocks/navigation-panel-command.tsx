import { Search } from "lucide-react"
import * as React from "react"

import type { ShellDensity } from "@nextide/ui/blocks/app-shell"
import { SidebarToggleButton } from "@nextide/ui/blocks/sidebar"
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
import { cn } from "@nextide/ui/lib/utils"

import type {
  NavigationPanelCommandRowProps,
  NavigationPanelSearchItem,
} from "./navigation-panel-types.js"
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
  const search = useCommandSearch({
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
  })
  const {
    setSearchFocused,
    searchValue,
    setSearchValue,
    commandRowRef,
    searchItems,
    showSearchResults,
    clearSearch,
  } = search

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
        <CommandControl
          density={density}
          collapsed={collapsed}
          drawerCollapsed={drawerCollapsed}
          commandLabel={commandLabel}
          search={search}
        />
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
      <CommandResults
        onSelectItem={onSelectItem}
        onToggleItem={onToggleItem}
        onActionItem={onActionItem}
        clearSearch={clearSearch}
      />
    </Autocomplete>
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

export { NavigationPanelCommandRow }
function useCommandSearch({
  sections,
  commandShortcut,
  collapsed,
  drawerCollapsed,
  onActionItem,
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

  useSearchDismiss(searchFocused, commandRowRef, clearSearch)
  useSearchShortcut(showCommandShortcut, focusSearchInput)

  return {
    searchFocused,
    setSearchFocused,
    searchValue,
    setSearchValue,
    commandRowRef,
    inputRef,
    commandShortcutLabel,
    showCommandShortcut,
    compactSearchOpen,
    commandFieldVisible,
    searchItems,
    showSearchResults,
    clearSearch,
    focusSearchInput,
  }
}
function useSearchDismiss(
  searchFocused: boolean,
  commandRowRef: React.RefObject<HTMLDivElement | null>,
  clearSearch: () => void
) {
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
  }, [clearSearch, searchFocused, commandRowRef])
}
function useSearchShortcut(
  showCommandShortcut: boolean,
  focusSearchInput: () => void
) {
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
}
type SearchState = ReturnType<typeof useCommandSearch>
type CommandControlProps = Pick<
  NavigationPanelCommandRowProps,
  "density" | "collapsed" | "drawerCollapsed" | "commandLabel"
> & { search: SearchState }
function getCommandControlClass(
  density: ShellDensity,
  compactSearchOpen: boolean,
  collapsed: boolean,
  drawerCollapsed: boolean
) {
  return cn(
    "absolute top-0 left-0 flex h-11 min-w-0 items-center gap-0 overflow-hidden rounded-lg border px-0 text-left text-sm text-muted-foreground/65 transition-[top,width,height,padding,color,background-color,border-color,box-shadow] duration-[var(--nextide-drawer-icon-duration)] ease-[var(--nextide-drawer-ease)] hover:bg-nextide-panel-strong motion-reduce:transition-none max-lg:static max-lg:w-full",
    density === "compact" && "lg:h-10",
    density === "ops" && "lg:h-[2.375rem] lg:rounded-[7px]",
    compactSearchOpen
      ? "z-50 w-[min(18rem,calc(100vw-6rem))] border-nextide-line bg-popover! shadow-md focus-within:border-nextide-tide/55 focus-within:ring-0"
      : collapsed
        ? "z-30 w-11"
        : "w-[calc(100%-3.25rem)]",
    !compactSearchOpen && getCommandWidth(density, collapsed),
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
  )
}
function CommandControl({
  density,
  collapsed,
  drawerCollapsed,
  commandLabel,
  search,
}: CommandControlProps) {
  const { compactSearchOpen, inputRef, focusSearchInput } = search
  return (
    <AutocompleteInputGroup
      data-slot="navigation-panel-command-control"
      className={getCommandControlClass(
        density,
        compactSearchOpen,
        collapsed,
        drawerCollapsed
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
      <CommandCopy
        density={density}
        collapsed={collapsed}
        commandLabel={commandLabel}
        search={search}
      />
    </AutocompleteInputGroup>
  )
}
function CommandCopy({
  density,
  collapsed,
  commandLabel,
  search,
}: Omit<CommandControlProps, "drawerCollapsed">) {
  const {
    commandFieldVisible,
    inputRef,
    setSearchFocused,
    showCommandShortcut,
    compactSearchOpen,
    commandShortcutLabel,
  } = search
  return (
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
  )
}
function CommandResults({
  onSelectItem,
  onToggleItem,
  onActionItem,
  clearSearch,
}: Pick<
  NavigationPanelCommandRowProps,
  "onSelectItem" | "onToggleItem" | "onActionItem"
> & { clearSearch: () => void }) {
  return (
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
  )
}

function getCommandWidth(density: ShellDensity, collapsed: boolean) {
  return collapsed
    ? { current: "", compact: "lg:w-10", ops: "lg:w-[2.375rem]" }[density]
    : {
        current: "",
        compact: "lg:w-[calc(100%-2.875rem)]",
        ops: "lg:w-[calc(100%-2.625rem)]",
      }[density]
}
