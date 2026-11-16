import * as React from "react"

import { cn } from "@nextide/ui/lib/utils"
import type { MoneyFormat } from "@nextide/ui/components/money-picker-format"

type MoneyPickerSize = "default" | "compact"

type MoneyTone = "set" | "suggested" | "empty"

function MoneySymbol({
  format,
  editing,
}: {
  format: MoneyFormat
  editing: boolean
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "shrink-0 transition-colors duration-[var(--nextide-motion-control)] motion-reduce:transition-none",
        editing && "text-muted-foreground",
        format.symbolSpaced && (format.symbolFirst ? "mr-1" : "ml-1")
      )}
    >
      {format.symbol}
    </span>
  )
}

function MoneySegment({
  size,
  editing,
  settled,
  tone,
  position,
  children,
}: {
  size: MoneyPickerSize
  editing: boolean
  settled: boolean
  tone: MoneyTone
  position: "only" | "first" | "last"
  children: React.ReactNode
}) {
  const compact = size === "compact"
  return (
    <div
      data-slot="money-picker-field"
      data-tone={tone}
      className={cn(
        "flex min-w-0 items-center transition-[border-radius,padding,background-color,box-shadow] duration-[var(--nextide-motion-layout)] ease-[var(--nextide-ease-in-out-quart)] motion-reduce:transition-none",
        compact ? "h-6 rounded-md px-1.5" : "h-12 bg-secondary px-3",
        compact && (editing ? "bg-secondary" : "bg-transparent"),
        tone === "set" ? "text-foreground" : "text-muted-foreground",
        tone === "suggested" && "italic",
        settled &&
          "focus-within:shadow-glow-focus focus-within:ring-(length:--nextide-focus-ring-width) focus-within:ring-ring",
        segmentShape(compact, editing, position)
      )}
    >
      {children}
    </div>
  )
}

function segmentShape(
  compact: boolean,
  editing: boolean,
  position: "only" | "first" | "last"
) {
  if (compact) {
    if (editing) return undefined
    if (position === "first") return "pr-0"
    return position === "last" ? "pl-0" : "pr-0.5"
  }
  if (editing) return "rounded-xl"
  if (position === "last") return "rounded-none pl-0 pr-2"
  return cn(
    "rounded-l-xl rounded-r-none",
    position === "first" ? "pr-0" : "pr-2"
  )
}

const MoneyInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentProps<"input">, "value"> & {
    value: string
    placeholder: string
    editing: boolean
    /** Keeps the field at the width of this text, e.g. "00" for cents. */
    sizeTo?: string
  }
>(function MoneyInput(
  { value, placeholder, editing, sizeTo, className, ...props },
  ref
) {
  const mirrorRef = React.useRef<HTMLSpanElement>(null)
  const longest = value.length >= placeholder.length ? value : placeholder
  // Room for the next digit while editing, so typing never waits on the width motion.
  const mirrorText = sizeTo ?? (editing ? longest + "0" : value || placeholder)

  React.useLayoutEffect(() => {
    const mirror = mirrorRef.current
    const input = mirror?.previousElementSibling
    if (!mirror || !(input instanceof HTMLInputElement)) return
    const fit = () => {
      input.style.width = String(mirror.getBoundingClientRect().width) + "px"
    }
    fit()
    // Font loading changes the measured width after the first paint.
    const observer = new ResizeObserver(fit)
    observer.observe(mirror)
    return () => observer.disconnect()
  }, [mirrorText])

  return (
    <span
      className={cn(
        "relative inline-flex h-full items-center font-medium tabular-nums",
        editing && "not-italic"
      )}
    >
      <input
        ref={ref}
        data-slot="money-picker-input"
        inputMode="numeric"
        autoComplete="off"
        value={value}
        placeholder={placeholder}
        readOnly={!editing}
        tabIndex={editing ? 0 : -1}
        className={cn(
          "h-full min-w-0 border-0 bg-transparent p-0 transition-[width] duration-[var(--nextide-motion-layout)] ease-[var(--nextide-ease-in-out-quart)] outline-none placeholder:text-muted-foreground motion-reduce:transition-none",
          editing ? "text-right placeholder:italic" : "pointer-events-none",
          className
        )}
        {...props}
      />
      <span
        ref={mirrorRef}
        aria-hidden="true"
        className="invisible absolute top-0 left-0 whitespace-pre"
      >
        {mirrorText}
      </span>
    </span>
  )
})

export {
  MoneyInput,
  MoneySegment,
  MoneySymbol,
  type MoneyPickerSize,
  type MoneyTone,
}
