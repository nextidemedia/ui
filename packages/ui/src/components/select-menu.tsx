import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@nextide/ui/components/select"
import { cn } from "@nextide/ui/lib/utils"

type SelectMenuOption = {
  value: string
  label: React.ReactNode
  description?: React.ReactNode
  disabled?: boolean
}

type SelectMenuProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  value?: string
  options: SelectMenuOption[]
  onValueChange: (value: string) => void
  placeholder?: React.ReactNode
  triggerClassName?: string
  contentClassName?: string
  contentAnchorRef?: React.RefObject<HTMLElement | null>
  contentWidthRef?: React.RefObject<HTMLElement | null>
  contentPortalRef?: React.RefObject<HTMLElement | null>
  contentMinWidth?: number
  optionClassName?: string
  optionLabelClassName?: string
  disabled?: boolean
}

function SelectMenu({
  value,
  options,
  onValueChange,
  placeholder = "Select",
  className,
  triggerClassName,
  contentClassName,
  contentAnchorRef,
  contentWidthRef,
  contentPortalRef,
  contentMinWidth,
  optionClassName,
  optionLabelClassName,
  disabled,
  "aria-label": ariaLabel = "Select option",
  ...props
}: SelectMenuProps) {
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const items = React.useMemo(
    () => Object.fromEntries(options.map(({ value, label }) => [value, label])),
    [options]
  )
  const selectedOption = options.find((option) => option.value === value)
  const contentAnchor = React.useCallback(() => {
    const anchor = contentAnchorRef?.current ?? triggerRef.current
    if (!anchor) return null

    return {
      contextElement: anchor,
      getBoundingClientRect() {
        const rect = anchor.getBoundingClientRect()
        const width = contentWidthRef?.current?.getBoundingClientRect().width
        return width === undefined
          ? rect
          : new DOMRect(rect.x, rect.y, width, rect.height)
      },
    }
  }, [contentAnchorRef, contentWidthRef])
  const usesExternalAnchor = !!(contentAnchorRef || contentWidthRef)
  const contentWidth =
    contentMinWidth === undefined
      ? "var(--anchor-width)"
      : `max(var(--anchor-width), ${contentMinWidth}px)`

  return (
    <div
      data-slot="select-menu"
      className={cn("relative min-w-0", className)}
      {...props}
    >
      <Select
        items={items}
        value={value ?? null}
        onValueChange={(nextValue) => {
          if (nextValue !== null) onValueChange(nextValue)
        }}
        disabled={disabled}
      >
        <SelectTrigger
          ref={triggerRef}
          aria-label={ariaLabel}
          className={cn(
            "h-9 w-full border-nextide-line bg-nextide-panel px-3 text-left font-medium hover:bg-nextide-panel-strong focus-visible:border-nextide-tide/50 focus-visible:ring-nextide-tide/15",
            triggerClassName
          )}
        >
          <span data-slot="select-value" className="min-w-0 truncate">
            {selectedOption?.label ?? placeholder}
          </span>
        </SelectTrigger>
        <SelectContent
          anchor={usesExternalAnchor ? contentAnchor : undefined}
          alignItemWithTrigger={false}
          align="start"
          container={contentPortalRef}
          sideOffset={usesExternalAnchor ? 8 : 4}
          style={
            {
              "--nextide-select-width": contentWidth,
              width: "var(--nextide-select-width)",
            } as React.CSSProperties
          }
          className={cn(
            "nextide-contained-scroll max-h-64 border border-nextide-line bg-background/96 p-1 shadow-[0_18px_60px_rgb(0_0_0/0.45)] backdrop-blur-xl",
            contentClassName
          )}
        >
          <SelectGroup>
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={cn(
                  "py-2 focus:bg-nextide-tide/10 focus:text-foreground data-selected:text-nextide-tide",
                  optionClassName
                )}
              >
                <span className="grid min-w-0 gap-0.5">
                  <span
                    className={cn("truncate font-medium", optionLabelClassName)}
                  >
                    {option.label}
                  </span>
                  {option.description ? (
                    <span className="truncate text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  ) : null}
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

export { SelectMenu, type SelectMenuOption }
