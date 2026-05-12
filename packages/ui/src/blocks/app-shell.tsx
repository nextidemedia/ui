import * as React from "react"

import { cn } from "@nextide/ui/lib/utils"

function AppShell({
  sidebar,
  aside,
  children,
  collapsed = false,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  sidebar?: React.ReactNode
  aside?: React.ReactNode
  collapsed?: boolean
}) {
  return (
    <div
      data-slot="app-shell"
      data-collapsed={collapsed}
      className={cn(
        "grid min-h-svh grid-cols-1 gap-4 bg-background p-4 text-foreground transition-[grid-template-columns] duration-[260ms] ease-[var(--nextide-drawer-ease)] motion-reduce:transition-none",
        collapsed
          ? "lg:grid-cols-[4.5rem_minmax(0,1fr)]"
          : "lg:grid-cols-[18rem_minmax(0,1fr)]",
        aside && "lg:grid-cols-[18rem_minmax(0,1fr)_20rem]",
        collapsed && aside && "lg:grid-cols-[4.5rem_minmax(0,1fr)_20rem]",
        className
      )}
      {...props}
    >
      {sidebar ? <aside className="min-h-0">{sidebar}</aside> : null}
      <main className="min-w-0">{children}</main>
      {aside ? (
        <aside className="hidden min-h-0 lg:block">{aside}</aside>
      ) : null}
    </div>
  )
}

export { AppShell }
