import * as React from "react"

import { Field, FieldLabel } from "@nextide/ui/components/field"
import { Input } from "@nextide/ui/components/input"
import { SelectMenu } from "@nextide/ui/components/select-menu"
import { cn } from "@nextide/ui/lib/utils"

type ScheduleCadence = "daily" | "weekly" | "biweekly" | "monthly"

type ScheduleControlValue = {
  cadence: ScheduleCadence
  time: string
  weekdayIso: number
  dayOfMonth: number
  biweeklyAnchor: "this" | "next"
}

const cadenceOptions: { value: ScheduleCadence; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Bi-weekly" },
  { value: "monthly", label: "Monthly" },
]

const weekdayOptions = [
  [1, "Monday"],
  [2, "Tuesday"],
  [3, "Wednesday"],
  [4, "Thursday"],
  [5, "Friday"],
  [6, "Saturday"],
  [7, "Sunday"],
] as const

const timeOptions = Array.from({ length: 96 }, (_, index) => {
  const hour = Math.floor(index / 4)
  const minute = (index % 4) * 15
  const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(
    2,
    "0"
  )}`
  return { value, label: value }
})

function ScheduleControl({
  value,
  onValueChange,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  value: ScheduleControlValue
  onValueChange: (value: ScheduleControlValue) => void
}) {
  const update = React.useCallback(
    (patch: Partial<ScheduleControlValue>) =>
      onValueChange({ ...value, ...patch }),
    [onValueChange, value]
  )

  return (
    <div
      data-slot="schedule-control"
      className={cn("grid gap-3", className)}
      {...props}
    >
      <ScheduleField label="Cadence">
        <SelectMenu
          value={value.cadence}
          onValueChange={(nextValue) =>
            update({ cadence: nextValue as ScheduleCadence })
          }
          options={cadenceOptions}
          aria-label="Cadence"
          triggerClassName={inputClassName}
          contentClassName="max-h-52"
        />
      </ScheduleField>
      <div className="grid gap-3 sm:grid-cols-2">
        <ScheduleField label="Run time">
          <SelectMenu
            value={value.time}
            onValueChange={(nextValue) => update({ time: nextValue })}
            options={timeOptions}
            aria-label="Run time"
            triggerClassName={inputClassName}
            contentClassName="max-h-56"
          />
        </ScheduleField>
        {(value.cadence === "weekly" || value.cadence === "biweekly") && (
          <ScheduleField label="Weekday">
            <SelectMenu
              value={String(value.weekdayIso)}
              onValueChange={(nextValue) =>
                update({ weekdayIso: Number(nextValue) })
              }
              options={weekdayOptions.map(([weekday, label]) => ({
                value: String(weekday),
                label,
              }))}
              aria-label="Weekday"
              triggerClassName={inputClassName}
              contentClassName="max-h-56"
            />
          </ScheduleField>
        )}
        {value.cadence === "monthly" && (
          <ScheduleField label="Day of month">
            <Input
              type="number"
              min={1}
              max={31}
              value={value.dayOfMonth}
              onChange={(event) =>
                update({ dayOfMonth: Number(event.target.value) })
              }
              className={inputClassName}
            />
          </ScheduleField>
        )}
        {value.cadence === "biweekly" && (
          <ScheduleField label="First run">
            <SelectMenu
              value={value.biweeklyAnchor}
              onValueChange={(nextValue) =>
                update({
                  biweeklyAnchor:
                    nextValue as ScheduleControlValue["biweeklyAnchor"],
                })
              }
              options={[
                { value: "this", label: "This week" },
                { value: "next", label: "Next week" },
              ]}
              aria-label="First run"
              triggerClassName={inputClassName}
            />
          </ScheduleField>
        )}
      </div>
    </div>
  )
}

function ScheduleField({
  label,
  children,
}: {
  label: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Field className="gap-1.5">
      <FieldLabel className="text-xs font-medium text-muted-foreground">
        {label}
      </FieldLabel>
      {children}
    </Field>
  )
}

const inputClassName =
  "h-9 rounded-lg border border-nextide-line bg-nextide-panel px-3 text-sm text-foreground outline-none transition-[border-color,box-shadow,background-color] focus:border-nextide-tide/50 focus:ring-3 focus:ring-nextide-tide/15"

export { ScheduleControl, type ScheduleCadence, type ScheduleControlValue }
