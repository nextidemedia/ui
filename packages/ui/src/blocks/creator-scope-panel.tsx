import * as React from "react"

import { cn } from "@nextide/ui/lib/utils"

type CreatorScopeItem = {
  id: string
  name: string
  meta?: React.ReactNode
  avatar?: React.ReactNode
  disabled?: boolean
}

function CreatorScopePanel({
  creators,
  activeId = "all",
  onActiveIdChange,
  title = "Creators",
  allLabel = "All creators",
  beforeHeader,
  getAction,
  children,
  className,
  ...props
}: React.ComponentProps<"section"> & {
  creators: CreatorScopeItem[]
  activeId?: string
  onActiveIdChange: (id: string) => void
  title?: React.ReactNode
  allLabel?: React.ReactNode
  beforeHeader?: React.ReactNode
  getAction?: (creator: CreatorScopeItem) => React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <section
      data-slot="creator-scope-panel"
      className={cn(
        "grid content-start gap-3 rounded-lg border border-nextide-line bg-background/20 p-3",
        className
      )}
      {...props}
    >
      {beforeHeader}
      <h3 className="text-sm">{title}</h3>
      <div className="grid gap-2">
        <button
          type="button"
          aria-pressed={activeId === "all"}
          className={cn(scopeRowClass(activeId === "all"), "px-3")}
          onClick={() => onActiveIdChange("all")}
        >
          <span className="col-span-2 truncate">{allLabel}</span>
        </button>
        <span className="h-px bg-nextide-line" aria-hidden="true" />
        {creators.map((creator) => (
          <div
            key={creator.id}
            className={scopeRowClass(activeId === creator.id)}
          >
            <button
              type="button"
              disabled={creator.disabled}
              aria-pressed={activeId === creator.id}
              className="grid min-h-10 min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-2 px-3 text-left disabled:cursor-not-allowed disabled:opacity-45"
              onClick={() => onActiveIdChange(creator.id)}
            >
              <span className="grid size-7 place-items-center rounded-full bg-nextide-tide/10 text-ui-caption font-medium text-nextide-tide">
                {creator.avatar ?? initials(creator.name)}
              </span>
              <span className="grid min-w-0 gap-0.5 text-left">
                <strong className="truncate text-sm">{creator.name}</strong>
                {creator.meta ? (
                  <small className="truncate text-xs text-muted-foreground">
                    {creator.meta}
                  </small>
                ) : null}
              </span>
            </button>
            {getAction && !creator.disabled ? (
              <span className="shrink-0 pr-3">{getAction(creator)}</span>
            ) : null}
          </div>
        ))}
      </div>
      {children}
    </section>
  )
}

function scopeRowClass(active: boolean) {
  return cn(
    "grid min-h-10 w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center rounded-lg border text-left transition-[background-color,border-color,box-shadow]",
    active
      ? "border-nextide-tide/55 bg-nextide-tide/10 text-foreground shadow-[0_0_24px_rgb(30_228_188/0.14)]"
      : "border-transparent bg-transparent text-muted-foreground hover:bg-nextide-panel"
  )
}

function initials(name: string) {
  let result = ""

  for (const part of name.split(/\s+/)) {
    if (!part) continue
    result += part[0]
    if (result.length >= 2) break
  }

  return result.toUpperCase()
}

export { CreatorScopePanel, type CreatorScopeItem }
