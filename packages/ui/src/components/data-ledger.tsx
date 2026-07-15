import * as React from "react"
import { ChevronDown } from "lucide-react"

import { Button } from "@nextide/ui/components/button"
import { cn } from "@nextide/ui/lib/utils"

function DataLedger({
  title,
  description,
  countLabel,
  actions,
  search,
  children,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  className,
  bodyClassName,
  ...props
}: Omit<React.ComponentProps<"section">, "title"> & {
  title: React.ReactNode
  description?: React.ReactNode
  countLabel?: React.ReactNode
  actions?: React.ReactNode
  search?: React.ReactNode
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  bodyClassName?: string
}) {
  const [internalCollapsed, setInternalCollapsed] = React.useReducer(
    (_current: boolean, nextCollapsed: boolean) => nextCollapsed,
    defaultCollapsed
  )
  const resolvedCollapsed = collapsed ?? internalCollapsed

  const setCollapsed = React.useCallback(
    (nextCollapsed: boolean) => {
      setInternalCollapsed(nextCollapsed)
      onCollapsedChange?.(nextCollapsed)
    },
    [onCollapsedChange]
  )

  return (
    <section
      data-slot="data-ledger"
      data-collapsed={resolvedCollapsed}
      className={cn(
        "grid gap-0 overflow-hidden rounded-xl border border-nextide-line bg-nextide-panel",
        className
      )}
      {...props}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-nextide-line p-3">
        <div className="grid min-w-0 gap-1">
          <h3 className="truncate text-sm font-medium">{title}</h3>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
          {search}
          {actions}
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-expanded={!resolvedCollapsed}
            onClick={() => setCollapsed(!resolvedCollapsed)}
          >
            {countLabel ? <span>{countLabel}</span> : null}
            <ChevronDown
              className={cn(
                "transition-transform duration-[var(--nextide-motion-state)]",
                resolvedCollapsed && "-rotate-90"
              )}
            />
          </Button>
        </div>
      </header>
      <div
        aria-hidden={resolvedCollapsed}
        inert={resolvedCollapsed ? true : undefined}
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-[var(--nextide-motion-layout)] ease-[var(--nextide-ease-in-out-quart)] motion-reduce:transition-none",
          resolvedCollapsed
            ? "grid-rows-[0fr] opacity-0"
            : "grid-rows-[1fr] opacity-100"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={cn(
              "nextide-contained-scroll nextide-scrollbar-none overflow-auto p-3",
              bodyClassName
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  )
}

export { DataLedger }
