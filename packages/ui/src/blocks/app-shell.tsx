import * as React from "react"

import { cn } from "@nextide/ui/lib/utils"

type ShellDensity = "current" | "compact" | "ops"

function AppShell({
  sidebar,
  header,
  aside,
  children,
  collapsed = false,
  drawerCollapsed = collapsed,
  sidebarTransitioning = false,
  stabilizeResize = true,
  density = "current",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  sidebar?: React.ReactNode
  header?: React.ReactNode
  aside?: React.ReactNode
  collapsed?: boolean
  drawerCollapsed?: boolean
  sidebarTransitioning?: boolean
  stabilizeResize?: boolean
  density?: ShellDensity
}) {
  return (
    <div
      data-slot="app-shell"
      data-collapsed={collapsed}
      data-drawer-collapsed={drawerCollapsed}
      data-sidebar-transitioning={sidebarTransitioning}
      data-density={density}
      className={cn(
        "isolate grid h-dvh max-h-dvh min-h-0 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-background text-foreground transition-[grid-template-columns] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none lg:grid-rows-1",
        getAppShellGridClass(density, collapsed, Boolean(aside)),
        className
      )}
      {...props}
    >
      {sidebar ? (
        <aside className="relative z-20 min-h-0 overflow-visible">
          {sidebar}
        </aside>
      ) : null}
      <div
        data-slot="app-shell-workspace"
        className={cn(
          "relative z-0 grid min-h-0 min-w-0 overflow-hidden bg-background",
          header
            ? "grid-rows-[auto_minmax(0,1fr)]"
            : "grid-rows-[minmax(0,1fr)]"
        )}
      >
        {header ? (
          <header
            data-slot="app-shell-header"
            className="relative z-10 min-w-0 border-b border-nextide-line bg-nextide-panel"
          >
            {header}
          </header>
        ) : null}
        <main
          className={cn(
            "relative z-0 min-h-0 min-w-0 [scrollbar-gutter:stable] overflow-x-hidden overflow-y-auto overscroll-y-contain",
            stabilizeResize && sidebarTransitioning && "will-change-transform"
          )}
        >
          {children}
        </main>
      </div>
      {aside ? (
        <aside className="relative z-10 hidden min-h-0 min-w-0 [scrollbar-gutter:stable] overflow-x-hidden overflow-y-auto overscroll-y-contain lg:block">
          {aside}
        </aside>
      ) : null}
    </div>
  )
}

function getAppShellGridClass(
  density: ShellDensity,
  collapsed: boolean,
  hasAside: boolean
) {
  if (density === "compact") {
    if (hasAside) {
      return collapsed
        ? "lg:grid-cols-[4rem_minmax(0,1fr)_20rem]"
        : "lg:grid-cols-[15rem_minmax(0,1fr)_20rem]"
    }
    return collapsed
      ? "lg:grid-cols-[4rem_minmax(0,1fr)]"
      : "lg:grid-cols-[15rem_minmax(0,1fr)]"
  }

  if (density === "ops") {
    if (hasAside) {
      return collapsed
        ? "lg:grid-cols-[3.625rem_minmax(0,1fr)_20rem]"
        : "lg:grid-cols-[14.5rem_minmax(0,1fr)_20rem]"
    }
    return collapsed
      ? "lg:grid-cols-[3.625rem_minmax(0,1fr)]"
      : "lg:grid-cols-[14.5rem_minmax(0,1fr)]"
  }

  if (hasAside) {
    return collapsed
      ? "lg:grid-cols-[4.5rem_minmax(0,1fr)_20rem]"
      : "lg:grid-cols-[18rem_minmax(0,1fr)_20rem]"
  }
  return collapsed
    ? "lg:grid-cols-[4.5rem_minmax(0,1fr)]"
    : "lg:grid-cols-[18rem_minmax(0,1fr)]"
}

export { AppShell, type ShellDensity }
