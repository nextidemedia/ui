import * as React from "react"
import { createPortal } from "react-dom"
import { Check, ChevronDown } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@nextide/ui/components/select"
import { useContainedScroll } from "@nextide/ui/hooks/use-contained-scroll"
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

function SelectMenu(props: SelectMenuProps) {
  const { contentAnchorRef, contentWidthRef, contentMinWidth } = props

  if (contentAnchorRef || contentWidthRef || contentMinWidth !== undefined) {
    return <AnchoredSelectMenu {...props} />
  }

  return <ShadcnSelectMenu {...props} />
}

function ShadcnSelectMenu({
  value,
  options,
  onValueChange,
  placeholder = "Select",
  className,
  triggerClassName,
  contentClassName,
  optionClassName,
  optionLabelClassName,
  disabled,
  "aria-label": ariaLabel = "Select option",
  ...props
}: SelectMenuProps) {
  const selectedOption = options.find((option) => option.value === value)

  return (
    <div
      data-slot="select-menu"
      className={cn("relative min-w-0", className)}
      {...props}
    >
      <Select
        items={options}
        value={value ?? null}
        onValueChange={(nextValue) => {
          if (nextValue !== null) onValueChange(nextValue)
        }}
        disabled={disabled}
      >
        <SelectTrigger
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
          alignItemWithTrigger={false}
          align="start"
          className={cn(
            "max-h-64 border border-nextide-line bg-background/96 p-1 shadow-[0_18px_60px_rgb(0_0_0/0.45)] backdrop-blur-xl",
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

function AnchoredSelectMenu({
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
  const id = React.useId()
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const { ref: menuScrollRef, onWheel: onMenuWheel } =
    useContainedScroll<HTMLDivElement>({ axis: "y" })
  const [open, setOpen] = React.useState(false)
  const [portalTarget, setPortalTarget] = React.useState<HTMLElement | null>(
    null
  )
  const selectedOption = options.find((option) => option.value === value)

  const closeMenu = React.useCallback(() => {
    setOpen(false)
    setPortalTarget(null)
  }, [])

  const openMenu = React.useCallback(() => {
    setPortalTarget(
      typeof document === "undefined"
        ? null
        : (contentPortalRef?.current ?? document.body)
    )
    setOpen(true)
  }, [contentPortalRef])

  React.useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (
        !rootRef.current?.contains(target) &&
        !menuScrollRef.current?.contains(target)
      ) {
        closeMenu()
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu()
      }
    }

    window.addEventListener("pointerdown", onPointerDown)
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("pointerdown", onPointerDown)
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [closeMenu, menuScrollRef, open])

  const moveSelection = React.useCallback(
    (direction: 1 | -1) => {
      const enabledOptions = options.filter((option) => !option.disabled)
      if (enabledOptions.length === 0) return

      const currentIndex = Math.max(
        0,
        enabledOptions.findIndex((option) => option.value === value)
      )
      const nextIndex =
        (currentIndex + direction + enabledOptions.length) %
        enabledOptions.length
      onValueChange(enabledOptions[nextIndex]?.value ?? enabledOptions[0].value)
    },
    [onValueChange, options, value]
  )

  React.useLayoutEffect(() => {
    if (!open) return

    const updateMenuPosition = () => {
      const root = rootRef.current
      const menu = menuScrollRef.current
      if (!root || !menu) return

      const rect = root.getBoundingClientRect()
      const anchorRect =
        contentAnchorRef?.current?.getBoundingClientRect() ?? rect
      const widthRect = contentWidthRef?.current?.getBoundingClientRect()
      const portalRect = contentPortalRef?.current?.getBoundingClientRect()
      const left = portalRect
        ? anchorRect.left - portalRect.left
        : anchorRect.left
      const top = portalRect
        ? anchorRect.bottom - portalRect.top + 8
        : anchorRect.bottom + 8
      const resolvedWidth = Math.max(
        contentMinWidth ?? 0,
        widthRect?.width ?? anchorRect.width
      )
      menu.style.setProperty(
        "--nextide-select-position",
        portalRect ? "absolute" : "fixed"
      )
      menu.style.setProperty("--nextide-select-left", `${left}px`)
      menu.style.setProperty("--nextide-select-top", `${top}px`)
      menu.style.setProperty("--nextide-select-width", `${resolvedWidth}px`)
      menu.style.setProperty(
        "--nextide-select-max-width",
        `${Math.max(0, (portalRect?.width ?? window.innerWidth) - left - 12)}px`
      )
    }

    updateMenuPosition()
    window.addEventListener("resize", updateMenuPosition)
    window.addEventListener("scroll", updateMenuPosition, true)
    return () => {
      window.removeEventListener("resize", updateMenuPosition)
      window.removeEventListener("scroll", updateMenuPosition, true)
    }
  }, [
    contentAnchorRef,
    contentMinWidth,
    contentPortalRef,
    contentWidthRef,
    menuScrollRef,
    open,
  ])

  const content = open ? (
    <div
      ref={menuScrollRef}
      id={`${id}-listbox`}
      role="listbox"
      data-nextide-scroll-lock=""
      onWheel={onMenuWheel}
      style={{
        position:
          "var(--nextide-select-position, fixed)" as React.CSSProperties["position"],
        top: "var(--nextide-select-top, 0px)",
        left: "var(--nextide-select-left, 0px)",
        width: "var(--nextide-select-width, auto)",
        maxWidth: "var(--nextide-select-max-width, calc(100vw - 24px))",
      }}
      className={cn(
        "nextide-contained-scroll nextide-scrollbar-none fixed z-[1000] max-h-64 overflow-auto rounded-lg border border-nextide-line bg-background/96 p-1 shadow-[0_18px_60px_rgb(0_0_0/0.45)] backdrop-blur-xl",
        contentClassName
      )}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="option"
            aria-selected={selected}
            disabled={option.disabled}
            className={cn(
              "grid w-full min-w-0 grid-cols-[1rem_minmax(0,1fr)] items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-[background-color,color] outline-none hover:bg-nextide-tide/10 focus-visible:bg-nextide-tide/10 disabled:pointer-events-none disabled:opacity-35",
              selected ? "text-nextide-tide" : "text-foreground",
              optionClassName
            )}
            onClick={() => {
              onValueChange(option.value)
              closeMenu()
            }}
          >
            <span className="grid size-4 place-items-center">
              {selected ? <Check className="size-3.5" /> : null}
            </span>
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
          </button>
        )
      })}
    </div>
  ) : null

  return (
    <div
      ref={rootRef}
      data-slot="select-menu"
      className={cn("relative min-w-0", open && "z-[90]", className)}
      {...props}
    >
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => {
          if (open) {
            closeMenu()
          } else {
            openMenu()
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault()
            openMenu()
            moveSelection(1)
          }
          if (event.key === "ArrowUp") {
            event.preventDefault()
            openMenu()
            moveSelection(-1)
          }
        }}
        className={cn(
          "flex h-9 w-full min-w-0 items-center justify-between gap-3 rounded-lg border border-nextide-line bg-nextide-panel px-3 text-left text-sm font-medium text-foreground transition-[border-color,box-shadow,background-color] outline-none hover:bg-nextide-panel-strong focus-visible:border-nextide-tide/50 focus-visible:ring-3 focus-visible:ring-nextide-tide/15 disabled:pointer-events-none disabled:opacity-50",
          triggerClassName
        )}
      >
        <span className="min-w-0 truncate">
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180 text-nextide-tide"
          )}
        />
      </button>

      {content && portalTarget ? createPortal(content, portalTarget) : null}
    </div>
  )
}

export { SelectMenu, type SelectMenuOption }
