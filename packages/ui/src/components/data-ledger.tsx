import * as React from "react"
import { ChevronDown } from "lucide-react"

import { Button } from "@nextide/ui/components/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@nextide/ui/components/collapsible"
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
    <Collapsible
      open={!resolvedCollapsed}
      onOpenChange={(open) => setCollapsed(!open)}
      render={
        <section
          data-slot="data-ledger"
          data-collapsed={resolvedCollapsed}
          className={cn(
            "grid gap-0 overflow-hidden rounded-xl border border-nextide-line bg-nextide-panel",
            className
          )}
          {...props}
        />
      }
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-nextide-line p-3">
        <div className="grid min-w-0 gap-1">
          <h3 className="truncate text-sm font-semibold">{title}</h3>
          {description ? (
            <p className="text-xs text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
          {search}
          {actions}
          <CollapsibleTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-expanded={!resolvedCollapsed}
              />
            }
          >
            {countLabel ? <span>{countLabel}</span> : null}
            <ChevronDown
              className={cn(
                "transition-transform duration-200",
                resolvedCollapsed && "-rotate-90"
              )}
            />
          </CollapsibleTrigger>
        </div>
      </header>
      <CollapsibleContent
        keepMounted
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-[var(--nextide-ease-out-quart)]",
          resolvedCollapsed
            ? "grid-rows-[0fr] opacity-0"
            : "nextide-flip-open grid-rows-[1fr] opacity-100"
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
      </CollapsibleContent>
    </Collapsible>
  )
}

export { DataLedger }
