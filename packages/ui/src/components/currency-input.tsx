import * as React from "react"
import { NumericFormat } from "react-number-format"

import { Input } from "@nextide/ui/components/input"

type CurrencyInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "value" | "defaultValue" | "onChange" | "type" | "inputMode"
> & {
  /** Unformatted USD decimal string. Use an empty string for no amount. */
  value?: string
  defaultValue?: string
  /** Receives the decimal string, including incomplete entries such as "12.". */
  onValueChange?: (value: string) => void
  allowNegative?: boolean
}

function CurrencyInput({
  ref,
  onValueChange,
  allowNegative = false,
  ...props
}: CurrencyInputProps) {
  return (
    <NumericFormat
      {...props}
      customInput={Input}
      getInputRef={ref}
      type="text"
      inputMode="decimal"
      valueIsNumericString
      prefix="$"
      thousandSeparator=","
      decimalSeparator="."
      decimalScale={2}
      allowNegative={allowNegative}
      onValueChange={({ value }) => onValueChange?.(value)}
    />
  )
}

export { CurrencyInput, type CurrencyInputProps }
