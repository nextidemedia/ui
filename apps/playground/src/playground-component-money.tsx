import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@nextide/ui/components/card"
import { MoneyPicker } from "@nextide/ui/components/money-picker"
import { useState } from "react"
import { ComponentReference } from "./component-reference"

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

type CreatorFee = {
  id: string
  name: string
  fee: number | null
  suggestion: number | null
}

const creatorFees: CreatorFee[] = [
  { id: "huskerrs", name: "Huskerrs", fee: 3800, suggestion: null },
  { id: "aydan", name: "Aydan", fee: null, suggestion: 2400 },
  { id: "jynxzi", name: "Jynxzi", fee: 12500, suggestion: null },
  { id: "stableronaldo", name: "StableRonaldo", fee: null, suggestion: null },
  { id: "fanum", name: "Fanum", fee: 950, suggestion: null },
]

function MoneyPickerPreview() {
  const [fee, setFee] = useState<number | null>(3800)
  const [budget, setBudget] = useState<number | null>(12500.5)
  const [euro, setEuro] = useState<number | null>(1234.5)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Money</CardTitle>
        <CardDescription>
          Amounts that read as values until you edit them.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="grid justify-items-start gap-2">
          <ComponentReference names="MoneyPicker" />
          <MoneyPicker label="Fee" value={fee} onConfirm={setFee} />
          <output
            data-slot="money-picker-output"
            className="text-ui-caption text-muted-foreground"
            aria-live="polite"
          >
            {fee === null ? "No fee" : String(fee)}
          </output>
        </div>
        <div className="grid justify-items-start gap-2">
          <span className="text-ui-caption text-muted-foreground">
            With cents
          </span>
          <MoneyPicker
            cents
            label="Budget"
            value={budget}
            onConfirm={setBudget}
          />
        </div>
        <div className="grid justify-items-start gap-2">
          <span className="text-ui-caption text-muted-foreground">
            Euro, German format
          </span>
          <MoneyPicker
            cents
            currency="EUR"
            locale="de-DE"
            label="Budget in euros"
            value={euro}
            onConfirm={setEuro}
          />
        </div>
        <CompactFees />
      </CardContent>
    </Card>
  )
}

function CompactFees() {
  const [fees, setFees] = useState(creatorFees)
  const total = fees.reduce(
    (sum, row) => sum + (row.fee ?? row.suggestion ?? 0),
    0
  )
  return (
    <div className="grid gap-2">
      <span className="text-ui-caption text-muted-foreground">
        Compact, in 24px rows
      </span>
      <div className="grid rounded-lg border border-border text-ui-caption">
        {fees.map((row) => (
          <div
            key={row.id}
            className="flex h-6 items-center justify-between gap-3 border-b border-border/60 pl-2.5"
          >
            <span className="truncate">{row.name}</span>
            <MoneyPicker
              size="compact"
              label={"Fee for " + row.name}
              placeholder="Set fee"
              value={row.fee}
              suggestion={row.suggestion}
              onConfirm={(fee) =>
                setFees((current) =>
                  current.map((item) =>
                    item.id === row.id ? { ...item, fee } : item
                  )
                )
              }
            />
          </div>
        ))}
        <div className="flex h-6 items-center justify-between gap-3 pl-2.5 font-medium">
          <span>Total</span>
          <span className="pr-6.5 tabular-nums">{usd.format(total)}</span>
        </div>
      </div>
    </div>
  )
}

export { MoneyPickerPreview }
