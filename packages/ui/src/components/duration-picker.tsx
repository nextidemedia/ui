"use client"

import * as React from "react"
import { Check, Pencil } from "lucide-react"

import { Button } from "@nextide/ui/components/button"
import { cn } from "@nextide/ui/lib/utils"

type DurationValue = {
  days?: number
  hours: number
  minutes: number
}

type DurationPickerProps = Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange"
> & {
  value?: DurationValue
  defaultValue?: DurationValue
  onValueChange?: (value: DurationValue) => void
  onConfirm?: (value: DurationValue) => void
  onEditingChange?: (editing: boolean) => void
  defaultEditing?: boolean
  showDays?: boolean
  maxDays?: number
  maxHours?: number
  maxMinutes?: number
  daysLabel?: string
  hoursLabel?: string
  minutesLabel?: string
  daysInputLabel?: string
  hoursInputLabel?: string
  minutesInputLabel?: string
  disabled?: boolean
}

type DurationDraft = {
  days: string
  hours: string
  minutes: string
}

type DurationLimits = Required<DurationValue>

const emptyDuration: DurationValue = { hours: 0, minutes: 0 }

function DurationPicker({
  value,
  defaultValue = emptyDuration,
  onValueChange,
  onConfirm,
  onEditingChange,
  defaultEditing = false,
  showDays = false,
  maxDays = 999,
  maxHours = 24,
  maxMinutes = 59,
  daysLabel = "Day",
  hoursLabel = "Hr.",
  minutesLabel = "Min.",
  daysInputLabel = "Days",
  hoursInputLabel = "Hours",
  minutesInputLabel = "Minutes",
  disabled = false,
  className,
  onBlur,
  onClick,
  onKeyDown,
  ...props
}: DurationPickerProps) {
  const controlled = value !== undefined
  const limits: DurationLimits = {
    days: clampLimit(maxDays),
    hours: clampLimit(maxHours),
    minutes: clampLimit(maxMinutes),
  }
  const [internalValue, setInternalValue] = React.useState(() =>
    normalizeDuration(defaultValue, limits, showDays)
  )
  const currentValue = normalizeDuration(
    controlled ? value : internalValue,
    limits,
    showDays
  )
  const [draft, setDraft] = React.useState<DurationDraft>(() =>
    durationToDraft(currentValue)
  )
  const [editing, setEditing] = React.useState(defaultEditing)
  const [editSettled, setEditSettled] = React.useState(defaultEditing)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const firstInputRef = React.useRef<HTMLInputElement>(null)
  const toggleRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (editing) firstInputRef.current?.focus()
  }, [editing, showDays])

  React.useEffect(() => {
    if (!editing || editSettled) return

    const root = rootRef.current
    if (!root) return

    const duration = readCssTime(
      window.getComputedStyle(root).getPropertyValue("--nextide-motion-layout"),
      300
    )
    const timer = window.setTimeout(() => setEditSettled(true), duration)

    return () => window.clearTimeout(timer)
  }, [editSettled, editing])

  const publish = (nextValue: DurationValue) => {
    if (!controlled) setInternalValue(nextValue)
    onValueChange?.(nextValue)
  }

  const updateField = (field: keyof DurationDraft, rawValue: string) => {
    const digits = rawValue.replace(/\D/g, "")
    const nextText =
      digits === "" ? "" : String(Math.min(limits[field], Number(digits)))
    const nextDraft = { ...draft, [field]: nextText }

    setDraft(nextDraft)
    publish(draftToDuration(nextDraft, limits, showDays))
  }

  const startEditing = () => {
    if (disabled) return

    setDraft(durationToDraft(currentValue))
    setEditSettled(false)
    setEditing(true)
    onEditingChange?.(true)
  }

  const confirm = (restoreFocus = true) => {
    const nextValue = draftToDuration(draft, limits, showDays)

    setDraft(durationToDraft(nextValue))
    setEditSettled(false)
    setEditing(false)
    onEditingChange?.(false)
    onConfirm?.(nextValue)
    if (restoreFocus) toggleRef.current?.focus()
  }

  const shownDraft = editing ? draft : durationToDraft(currentValue)

  return (
    <div
      ref={rootRef}
      data-slot="duration-picker"
      data-editing={editing}
      data-edit-settled={editSettled ? "true" : "false"}
      data-disabled={disabled || undefined}
      className={cn(
        "inline-flex max-w-full items-center transition-[gap,opacity] duration-[var(--nextide-motion-layout)] ease-[var(--nextide-ease-in-out-quart)] motion-reduce:transition-none",
        editing ? (showDays ? "gap-1" : "gap-2") : "gap-0",
        !editing && !disabled && "cursor-pointer",
        disabled && "cursor-not-allowed",
        disabled && "opacity-50",
        className
      )}
      onBlur={(event) => {
        onBlur?.(event)
        if (
          event.defaultPrevented ||
          !editing ||
          event.currentTarget.contains(event.relatedTarget as Node | null)
        ) {
          return
        }
        confirm(false)
      }}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented && !editing) startEditing()
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event)
        if (event.defaultPrevented || !editing) return
        if (event.key === "Enter") {
          event.preventDefault()
          confirm()
        }
      }}
      {...props}
    >
      {showDays && (
        <DurationField
          ref={firstInputRef}
          value={shownDraft.days}
          label={daysLabel}
          inputLabel={daysInputLabel}
          max={limits.days}
          editing={editing}
          showFocus={editSettled}
          disabled={disabled}
          compact
          position="first"
          onValueChange={(nextValue) => updateField("days", nextValue)}
        />
      )}
      <DurationField
        ref={showDays ? undefined : firstInputRef}
        value={shownDraft.hours}
        label={hoursLabel}
        inputLabel={hoursInputLabel}
        max={limits.hours}
        editing={editing}
        showFocus={editSettled}
        disabled={disabled}
        compact={showDays}
        position={showDays ? "middle" : "first"}
        onValueChange={(nextValue) => updateField("hours", nextValue)}
      />
      <DurationField
        value={shownDraft.minutes}
        label={minutesLabel}
        inputLabel={minutesInputLabel}
        max={limits.minutes}
        editing={editing}
        showFocus={editSettled}
        disabled={disabled}
        compact={showDays}
        position="middle"
        onValueChange={(nextValue) => updateField("minutes", nextValue)}
      />
      <Button
        ref={toggleRef}
        type="button"
        variant="secondary"
        size="icon-lg"
        aria-label={editing ? "Save duration" : "Edit duration"}
        disabled={disabled}
        className={cn(
          "relative size-12 overflow-hidden transition-[border-radius,transform] duration-[var(--nextide-motion-layout)] ease-[var(--nextide-ease-in-out-quart)] motion-reduce:transition-none",
          editing ? "rounded-xl" : "rounded-l-none rounded-r-xl"
        )}
        onClick={editing ? () => confirm() : undefined}
      >
        <Pencil
          aria-hidden="true"
          className={cn(
            "absolute transition-[opacity,transform] duration-[var(--nextide-motion-control)] ease-[var(--nextide-ease-out-quart)] motion-reduce:transition-none",
            editing ? "scale-75 rotate-45 opacity-0" : "scale-100 opacity-100"
          )}
        />
        <Check
          aria-hidden="true"
          className={cn(
            "absolute transition-[opacity,transform] duration-[var(--nextide-motion-control)] ease-[var(--nextide-ease-out-quart)] motion-reduce:transition-none",
            editing ? "scale-100 opacity-100" : "scale-75 -rotate-45 opacity-0"
          )}
        />
      </Button>
    </div>
  )
}

const DurationField = React.forwardRef<
  HTMLInputElement,
  {
    value: string
    label: string
    inputLabel: string
    max: number
    editing: boolean
    showFocus: boolean
    disabled: boolean
    compact?: boolean
    position: "first" | "middle"
    onValueChange: (value: string) => void
  }
>(function DurationField(
  {
    value,
    label,
    inputLabel,
    max,
    editing,
    showFocus,
    disabled,
    compact = false,
    position,
    onValueChange,
  },
  ref
) {
  return (
    <div
      data-slot="duration-picker-field"
      className={cn(
        "flex h-12 min-w-0 items-center gap-1 bg-secondary px-3 text-secondary-foreground transition-[border-radius,padding,transform,box-shadow] duration-[var(--nextide-motion-layout)] ease-[var(--nextide-ease-in-out-quart)] motion-reduce:transition-none",
        showFocus && "focus-within:ring-3 focus-within:ring-ring",
        editing
          ? cn("rounded-xl", compact && "px-2")
          : position === "first"
            ? "rounded-l-xl rounded-r-none pr-2"
            : "rounded-none px-2"
      )}
    >
      <input
        ref={ref}
        data-slot="duration-picker-input"
        aria-label={inputLabel}
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        value={value}
        placeholder={editing ? "" : "0"}
        readOnly={!editing}
        tabIndex={editing ? 0 : -1}
        disabled={disabled}
        maxLength={String(max).length}
        className={cn(
          "h-full min-w-3 border-0 bg-transparent p-0 text-right text-ui-label font-medium text-foreground tabular-nums transition-[width] duration-[var(--nextide-motion-layout)] ease-[var(--nextide-ease-in-out-quart)] outline-none placeholder:text-foreground motion-reduce:transition-none",
          !editing && "pointer-events-none"
        )}
        style={
          editing
            ? {
                width: compact
                  ? `calc(${String(max).length}ch + 0.25rem)`
                  : "2.75rem",
              }
            : { width: `calc(${Math.max(value.length, 1)}ch + 0.125rem)` }
        }
        onChange={(event) => onValueChange(event.target.value)}
      />
      <span className="shrink-0 text-ui-label font-medium text-muted-foreground">
        {label}
      </span>
    </div>
  )
})

function clampLimit(value: number) {
  return Math.max(0, Math.trunc(value) || 0)
}

function normalizeDuration(
  value: DurationValue,
  limits: DurationLimits,
  showDays: boolean
): DurationValue {
  const duration: DurationValue = {
    hours: clampValue(value.hours, limits.hours),
    minutes: clampValue(value.minutes, limits.minutes),
  }

  if (showDays) duration.days = clampValue(value.days ?? 0, limits.days)
  return duration
}

function draftToDuration(
  draft: DurationDraft,
  limits: DurationLimits,
  showDays: boolean
): DurationValue {
  return normalizeDuration(
    {
      days: Number(draft.days),
      hours: Number(draft.hours),
      minutes: Number(draft.minutes),
    },
    limits,
    showDays
  )
}

function durationToDraft(value: DurationValue): DurationDraft {
  return {
    days:
      value.days === undefined || value.days === 0 ? "" : String(value.days),
    hours: value.hours === 0 ? "" : String(value.hours),
    minutes: value.minutes === 0 ? "" : String(value.minutes),
  }
}

function clampValue(value: number, max: number) {
  return Math.min(max, Math.max(0, Math.trunc(value) || 0))
}

function readCssTime(value: string, fallback: number) {
  const parsed = Number.parseFloat(value)
  if (!Number.isFinite(parsed)) return fallback
  return value.trim().endsWith("s") && !value.trim().endsWith("ms")
    ? parsed * 1000
    : parsed
}

export { DurationPicker, type DurationPickerProps, type DurationValue }
