import * as React from "react"

type MoneyDraft = { whole: string; cents: string }

type MoneyFormat = {
  symbol: string
  symbolFirst: boolean
  symbolSpaced: boolean
  group: string
  decimal: string
  fractionDigits: number
}

// Whole units stay within the range a JavaScript number holds exactly, cents included.
const maxWholeDigits = 13

function useMoneyFormat(locale: string, currency: string): MoneyFormat {
  return React.useMemo(() => {
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    })
    const parts = formatter.formatToParts(1234.5)
    const find = (type: Intl.NumberFormatPartTypes) =>
      parts.find((part) => part.type === type)?.value
    const symbolAt = parts.findIndex((part) => part.type === "currency")
    const integerAt = parts.findIndex((part) => part.type === "integer")
    const between = parts.slice(
      Math.min(symbolAt, integerAt) + 1,
      Math.max(symbolAt, integerAt)
    )
    return {
      symbol: find("currency") ?? currency,
      symbolFirst: symbolAt < integerAt,
      symbolSpaced: between.some((part) => part.type === "literal"),
      // Some locales leave four-digit amounts ungrouped, so probe a larger one.
      group:
        formatter.formatToParts(1234567.5).find((part) => part.type === "group")
          ?.value ?? ",",
      // Read from a fractional number so currencies without minor units still get
      // the locale's decimal mark rather than one that matches its grouping.
      decimal:
        new Intl.NumberFormat(locale, { minimumFractionDigits: 1 })
          .formatToParts(1.5)
          .find((part) => part.type === "decimal")?.value ?? ".",
      fractionDigits: formatter.resolvedOptions().maximumFractionDigits ?? 2,
    }
  }, [locale, currency])
}

function amountToDraft(
  amount: number | null,
  format: MoneyFormat,
  padCents = false
): MoneyDraft {
  if (amount === null) return { whole: "", cents: "" }
  const [whole = "0", fraction = "00"] = amount.toFixed(2).split(".")
  return {
    whole: groupDigits(whole, format.group),
    cents: fraction === "00" && !padCents ? "" : fraction,
  }
}

function draftToAmount(draft: MoneyDraft, showCents: boolean) {
  const whole = onlyDigits(draft.whole)
  if (whole === "" && draft.cents === "") return null
  const cents = showCents ? draft.cents.padEnd(2, "0") : "00"
  return Number((whole || "0") + "." + cents)
}

function roundAmount(amount: number | null, showCents: boolean) {
  if (amount === null || !Number.isFinite(amount)) return null
  const scale = showCents ? 100 : 1
  return Math.round(Math.max(0, amount) * scale) / scale
}

function groupDigits(digits: string, group: string) {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, group)
}

function caretAfterDigits(text: string, digits: number) {
  if (digits === 0) return 0
  let seen = 0
  for (let index = 0; index < text.length; index += 1) {
    if (/\d/.test(text[index] ?? "")) seen += 1
    if (seen === digits) return index + 1
  }
  return text.length
}

function onlyDigits(text: string) {
  return text.replace(/\D/g, "")
}

function countDigits(text: string) {
  return onlyDigits(text).length
}

function stripLeadingZeros(digits: string) {
  return digits.replace(/^0+(?=\d)/, "")
}

export {
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
}
