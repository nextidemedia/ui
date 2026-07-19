const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  compactDisplay: "short",
  maximumSignificantDigits: 3,
  useGrouping: true,
})

const standardNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "standard",
  maximumSignificantDigits: 3,
  useGrouping: true,
})

function formatCompactNumber(value: number) {
  if (!Number.isFinite(value)) return "-"

  const formatter =
    Math.abs(value) >= 1000 ? compactNumberFormatter : standardNumberFormatter
  return formatter.format(value).toLowerCase()
}

export { formatCompactNumber }
