"use client"

import * as React from "react"
import { Check, Pencil } from "lucide-react"

import { Button } from "@nextide/ui/components/button"
import { cn } from "@nextide/ui/lib/utils"
import {
  amountToDraft,
  caretAfterDigits,
  countDigits,
  draftToAmount,
  groupDigits,
  maxWholeDigits,
  onlyDigits,
  roundAmount,
  stripLeadingZeros,
  useMoneyFormat,
  type MoneyDraft,
  type MoneyFormat,
} from "@nextide/ui/components/money-picker-format"
import {
  MoneyInput,
  MoneySegment,
  MoneySymbol,
  type MoneyPickerSize,
  type MoneyTone,
} from "@nextide/ui/components/money-picker-parts"

type MoneyPickerProps = Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange" | "placeholder"
> & {
  /** Amount in major units (dollars, euros); null when no amount is set. */
  value?: number | null
  defaultValue?: number | null
  /** Shown quieter while no amount is set, and as the placeholder while editing. */
  suggestion?: number | null
  /** Receives the confirmed amount; Escape keeps the previous one. */
  onConfirm?: (value: number | null) => void
  onEditingChange?: (editing: boolean) => void
  defaultEditing?: boolean
  /** ISO 4217 code. */
  currency?: string
  locale?: string
  /** Edit cents as their own field; whole units only by default. */
  cents?: boolean
  size?: MoneyPickerSize
  /** Names the amount for assistive technology, e.g. "Fee for Huskerrs". */
  label?: string
  /** Shown while no amount or suggestion is set. */
  placeholder?: string
  disabled?: boolean
}

/** Resting shows the formatted amount; opening settles before the focus ring appears. */
type MoneyPickerMode = "resting" | "opening" | "editing"

function MoneyPicker({
  value,
  defaultValue,
  suggestion,
  onConfirm,
  onEditingChange,
  defaultEditing,
  currency = "USD",
  locale = "en-US",
  cents = false,
  size = "default",
  label = "Amount",
  placeholder = "Set amount",
  disabled = false,
  className,
  onBlur,
  onClick,
  onKeyDown,
  ...props
}: MoneyPickerProps) {
  const format = useMoneyFormat(locale, currency)
  const showCents = cents && format.fractionDigits > 0
  const state = useMoneyPickerState({
    value,
    defaultValue,
    onConfirm,
    onEditingChange,
    defaultEditing,
    disabled,
    showCents,
    format,
  })
  const { rootRef, mode } = state
  const editing = mode !== "resting"
  const handlers = moneyRootHandlers(state, { onBlur, onClick, onKeyDown })
  return (
    // oxlint-disable-next-line react-doctor/no-static-element-interactions -- The wrapper expands the pointer hit area; the nested Edit button provides semantic keyboard activation.
    <div
      ref={rootRef}
      data-slot="money-picker"
      data-size={size}
      data-editing={editing}
      data-edit-settled={mode === "editing" ? "true" : "false"}
      data-disabled={disabled || undefined}
      className={cn(moneyRootClass(size, editing, disabled), className)}
      {...handlers}
      {...props}
    >
      <MoneyFields
        state={state}
        format={format}
        options={{ size, label, placeholder, disabled, showCents, suggestion }}
      />
      <MoneyToggle
        state={state}
        size={size}
        label={label}
        disabled={disabled}
      />
    </div>
  )
}

function moneyRootClass(
  size: MoneyPickerSize,
  editing: boolean,
  disabled: boolean
) {
  const compact = size === "compact"
  return cn(
    "group/money inline-flex max-w-full items-center tabular-nums transition-[gap,opacity] duration-[var(--nextide-motion-layout)] ease-[var(--nextide-ease-in-out-quart)] motion-reduce:transition-none",
    compact ? "h-6 text-ui-caption" : "text-ui-label",
    editing ? (compact ? "gap-1" : "gap-2") : "gap-0",
    !editing && !disabled && "cursor-pointer",
    disabled && "cursor-not-allowed opacity-50"
  )
}

function moneyRootHandlers(
  state: MoneyPickerState,
  {
    onBlur,
    onClick,
    onKeyDown,
  }: Pick<React.ComponentProps<"div">, "onBlur" | "onClick" | "onKeyDown">
): Pick<React.ComponentProps<"div">, "onBlur" | "onClick" | "onKeyDown"> {
  const editing = state.mode !== "resting"
  return {
    onBlur: (event) => {
      onBlur?.(event)
      const inside = event.currentTarget.contains(
        event.relatedTarget as Node | null
      )
      if (!event.defaultPrevented && editing && !inside) state.confirm(false)
    },
    onClick: (event) => {
      onClick?.(event)
      if (!event.defaultPrevented && !editing) state.startEditing()
    },
    onKeyDown: (event) => {
      onKeyDown?.(event)
      if (event.defaultPrevented || !editing) return
      if (event.key === "Enter") {
        event.preventDefault()
        state.confirm()
      } else if (event.key === "Escape") {
        // Escape keeps the previous amount without closing a surrounding dialog.
        event.preventDefault()
        event.stopPropagation()
        state.cancel()
      }
    },
  }
}

function useMoneyPickerState({
  value,
  defaultValue = null,
  onConfirm,
  onEditingChange,
  defaultEditing = false,
  disabled,
  showCents,
  format,
}: Pick<
  MoneyPickerProps,
  "value" | "defaultValue" | "onConfirm" | "onEditingChange" | "defaultEditing"
> & { disabled: boolean; showCents: boolean; format: MoneyFormat }) {
  const controlled = value !== undefined
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const currentValue = roundAmount(
    controlled ? value : internalValue,
    showCents
  )
  const [draft, setDraft] = React.useState<MoneyDraft>(() =>
    amountToDraft(currentValue, format)
  )
  const [mode, setMode] = React.useState<MoneyPickerMode>(
    defaultEditing ? "editing" : "resting"
  )
  const rootRef = React.useRef<HTMLDivElement>(null)
  const wholeRef = React.useRef<HTMLInputElement>(null)
  const centsRef = React.useRef<HTMLInputElement>(null)
  const toggleRef = React.useRef<HTMLButtonElement>(null)

  useMoneyEditFocus({ mode, setMode, rootRef, wholeRef })
  const close = (restoreFocus: boolean) => {
    setMode("resting")
    onEditingChange?.(false)
    if (restoreFocus) toggleRef.current?.focus()
  }

  const startEditing = () => {
    if (disabled) return
    setDraft(amountToDraft(currentValue, format))
    setMode("opening")
    onEditingChange?.(true)
  }

  const confirm = (restoreFocus = true) => {
    const nextValue = draftToAmount(draft, showCents)
    close(restoreFocus)
    if (nextValue === currentValue) return
    if (!controlled) setInternalValue(nextValue)
    onConfirm?.(nextValue)
  }

  const cancel = () => close(true)

  const editDraft = useMoneyDraftEditing({
    draft,
    setDraft,
    format,
    showCents,
    wholeRef,
    centsRef,
  })

  return {
    mode,
    rootRef,
    wholeRef,
    centsRef,
    toggleRef,
    currentValue,
    draft,
    startEditing,
    confirm,
    cancel,
    ...editDraft,
  }
}

function useMoneyDraftEditing({
  draft,
  setDraft,
  format,
  showCents,
  wholeRef,
  centsRef,
}: {
  draft: MoneyDraft
  setDraft: React.Dispatch<React.SetStateAction<MoneyDraft>>
  format: MoneyFormat
  showCents: boolean
  wholeRef: React.RefObject<HTMLInputElement | null>
  centsRef: React.RefObject<HTMLInputElement | null>
}) {
  const pendingCaret = React.useRef<{
    input: HTMLInputElement | null
    at: number
  } | null>(null)

  // Grouping separators shift text, so the caret follows the digit it was after.
  React.useLayoutEffect(() => {
    const pending = pendingCaret.current
    if (!pending?.input) return
    const at = Math.min(pending.at, pending.input.value.length)
    pending.input.setSelectionRange(at, at)
    pendingCaret.current = null
  })

  const updateWhole = (input: HTMLInputElement) => {
    const raw = input.value
    const decimalAt = raw.indexOf(format.decimal)
    const head = decimalAt === -1 ? raw : raw.slice(0, decimalAt)
    const caret = Math.min(input.selectionStart ?? head.length, head.length)
    const digitsBeforeCaret = countDigits(head.slice(0, caret))
    const digits = stripLeadingZeros(onlyDigits(head)).slice(0, maxWholeDigits)
    const whole = groupDigits(digits, format.group)
    const next = { ...draft, whole }
    if (decimalAt !== -1 && showCents) {
      // Typing the decimal separator moves on to the cents.
      next.cents = onlyDigits(raw.slice(decimalAt + 1)).slice(0, 2)
      centsRef.current?.focus()
      pendingCaret.current = { input: centsRef.current, at: 2 }
    } else {
      pendingCaret.current = {
        input,
        at: caretAfterDigits(whole, digitsBeforeCaret),
      }
    }
    setDraft(next)
  }

  const updateCents = (rawValue: string) => {
    const digits = onlyDigits(rawValue)
    // A full field takes the newest digit, so typing over "50" starts again.
    setDraft({ ...draft, cents: digits.length > 2 ? digits.slice(-1) : digits })
  }

  const leaveCents = () => {
    const input = wholeRef.current
    if (!input) return
    input.focus()
    input.setSelectionRange(input.value.length, input.value.length)
  }

  return { updateWhole, updateCents, leaveCents }
}

type MoneyPickerState = ReturnType<typeof useMoneyPickerState>

function useMoneyEditFocus({
  mode,
  setMode,
  rootRef,
  wholeRef,
}: {
  mode: MoneyPickerMode
  setMode: React.Dispatch<React.SetStateAction<MoneyPickerMode>>
  rootRef: React.RefObject<HTMLDivElement | null>
  wholeRef: React.RefObject<HTMLInputElement | null>
}) {
  const editing = mode !== "resting"
  React.useEffect(() => {
    const input = wholeRef.current
    if (!editing || !input) return
    input.focus()
    // Caret at the end, without a selection highlight.
    input.setSelectionRange(input.value.length, input.value.length)
  }, [editing, wholeRef])

  React.useEffect(() => {
    const root = rootRef.current
    if (mode !== "opening" || !root) return
    const duration = readCssTime(
      window.getComputedStyle(root).getPropertyValue("--nextide-motion-layout"),
      300
    )
    const timer = window.setTimeout(() => setMode("editing"), duration)
    return () => window.clearTimeout(timer)
  }, [mode, rootRef, setMode])
}

type MoneyFieldOptions = {
  size: MoneyPickerSize
  label: string
  placeholder: string
  disabled: boolean
  showCents: boolean
  suggestion: number | null | undefined
}

function MoneyFields({
  state,
  format,
  options,
}: {
  state: MoneyPickerState
  format: MoneyFormat
  options: MoneyFieldOptions
}) {
  const { mode, wholeRef, centsRef } = state
  const { size, label, disabled } = options
  const editing = mode !== "resting"
  const text = moneyFieldText(state, format, options)
  const segment = {
    size,
    editing,
    settled: mode === "editing",
    tone: text.tone,
  }
  const symbol = <MoneySymbol format={format} editing={editing} />
  const shown = text.tone !== "empty"
  return (
    <>
      <MoneySegment {...segment} position={text.cents ? "first" : "only"}>
        {format.symbolFirst && shown && symbol}
        <MoneyInput
          ref={wholeRef}
          aria-label={label}
          editing={editing}
          disabled={disabled}
          value={text.whole}
          placeholder={text.wholePlaceholder}
          onChange={(event) => state.updateWhole(event.currentTarget)}
        />
        {!format.symbolFirst && !text.cents && shown && symbol}
      </MoneySegment>
      {text.cents && (
        <MoneySegment {...segment} position="last">
          <span
            aria-hidden="true"
            className={cn(editing && "text-muted-foreground")}
          >
            {format.decimal}
          </span>
          <MoneyInput
            ref={centsRef}
            aria-label={label + " cents"}
            editing={editing}
            disabled={disabled}
            value={text.cents.value}
            placeholder={text.cents.placeholder}
            sizeTo="00"
            onChange={(event) => state.updateCents(event.currentTarget.value)}
            onKeyDown={(event) => {
              // Backspace from the start of the cents returns to the whole amount.
              if (
                event.key === "Backspace" &&
                event.currentTarget.selectionEnd === 0
              ) {
                event.preventDefault()
                state.leaveCents()
              }
            }}
          />
          {!format.symbolFirst && symbol}
        </MoneySegment>
      )}
    </>
  )
}

function moneyFieldText(
  state: MoneyPickerState,
  format: MoneyFormat,
  options: MoneyFieldOptions
) {
  const editing = state.mode !== "resting"
  const suggestion = roundAmount(options.suggestion ?? null, options.showCents)
  const tone = moneyTone(editing, state.currentValue, suggestion)
  const resting = amountToDraft(
    state.currentValue ?? suggestion,
    format,
    options.showCents
  )
  const hint = amountToDraft(suggestion, format, options.showCents)
  const cents =
    options.showCents && tone !== "empty"
      ? editing
        ? { value: state.draft.cents, placeholder: hint.cents || "00" }
        : { value: resting.cents, placeholder: "" }
      : null
  if (editing) {
    return {
      tone,
      whole: state.draft.whole,
      wholePlaceholder: hint.whole || "0",
      cents,
    }
  }
  return {
    tone,
    whole: tone === "empty" ? "" : resting.whole,
    wholePlaceholder: options.placeholder,
    cents,
  }
}

function moneyTone(
  editing: boolean,
  value: number | null,
  suggestion: number | null
): MoneyTone {
  if (editing || value !== null) return "set"
  return suggestion === null ? "empty" : "suggested"
}

function MoneyToggle({
  state,
  size,
  label,
  disabled,
}: {
  state: MoneyPickerState
  size: MoneyPickerSize
  label: string
  disabled: boolean
}) {
  const { mode, confirm, toggleRef } = state
  const editing = mode !== "resting"
  const compact = size === "compact"
  const name = lowerFirst(label)
  const icon =
    "absolute transition-[opacity,transform] duration-[var(--nextide-motion-control)] ease-[var(--nextide-ease-out-quart)] motion-reduce:transition-none"
  return (
    <Button
      ref={toggleRef}
      type="button"
      variant={compact ? "ghost" : "secondary"}
      size={compact ? "icon-xs" : "icon-lg"}
      aria-label={editing ? "Save " + name : "Edit " + name}
      disabled={disabled}
      className={cn(
        "relative overflow-hidden transition-[border-radius,opacity,background-color] duration-[var(--nextide-motion-layout)] ease-[var(--nextide-ease-in-out-quart)] motion-reduce:transition-none",
        compact
          ? cn(
              "size-6 rounded-md text-muted-foreground [&_svg]:size-3",
              !editing &&
                "opacity-60 group-hover/money:opacity-100 focus-visible:opacity-100"
            )
          : cn(
              "size-12",
              editing ? "rounded-xl" : "rounded-l-none rounded-r-xl"
            )
      )}
      onClick={editing ? () => confirm() : undefined}
    >
      <Pencil
        aria-hidden="true"
        className={cn(
          icon,
          editing ? "scale-75 rotate-45 opacity-0" : "scale-100 opacity-100"
        )}
      />
      <Check
        aria-hidden="true"
        className={cn(
          icon,
          editing ? "scale-100 opacity-100" : "scale-75 -rotate-45 opacity-0"
        )}
      />
    </Button>
  )
}

function lowerFirst(text: string) {
  return text.charAt(0).toLowerCase() + text.slice(1)
}

function readCssTime(value: string, fallback: number) {
  const parsed = Number.parseFloat(value)
  if (!Number.isFinite(parsed)) return fallback
  return value.trim().endsWith("s") && !value.trim().endsWith("ms")
    ? parsed * 1000
    : parsed
}

export { MoneyPicker, type MoneyPickerProps }
