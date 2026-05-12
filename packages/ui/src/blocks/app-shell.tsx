import * as React from "react"

import { cn } from "@nextide/ui/lib/utils"

function AppShell({
  sidebar,
  aside,
  children,
  collapsed = false,
  drawerCollapsed = collapsed,
  sidebarTransitioning = false,
  stabilizeResize = true,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  sidebar?: React.ReactNode
  aside?: React.ReactNode
  collapsed?: boolean
  drawerCollapsed?: boolean
  sidebarTransitioning?: boolean
  stabilizeResize?: boolean
}) {
  return (
    <div
      data-slot="app-shell"
      data-collapsed={collapsed}
      data-drawer-collapsed={drawerCollapsed}
      data-sidebar-transitioning={sidebarTransitioning}
      className={cn(
        "isolate grid min-h-svh grid-cols-1 gap-4 bg-background p-4 text-foreground transition-[grid-template-columns] duration-[var(--nextide-drawer-duration)] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
        collapsed
          ? "lg:grid-cols-[4.5rem_minmax(0,1fr)]"
          : "lg:grid-cols-[18rem_minmax(0,1fr)]",
        aside && "lg:grid-cols-[18rem_minmax(0,1fr)_20rem]",
        collapsed && aside && "lg:grid-cols-[4.5rem_minmax(0,1fr)_20rem]",
        className
      )}
      {...props}
    >
      {sidebar ? (
        <aside className="relative z-20 min-h-0 overflow-visible">
          {sidebar}
        </aside>
      ) : null}
      <main
        className={cn(
          "relative z-0 min-w-0 overflow-hidden",
          stabilizeResize && sidebarTransitioning && "will-change-transform"
        )}
      >
        {children}
      </main>
      {aside ? (
        <aside className="relative z-10 hidden min-h-0 min-w-0 lg:block">
          {aside}
        </aside>
      ) : null}
    </div>
  )
}

export { AppShell }
