"use client"

import * as React from "react"
import { Check, Pencil } from "lucide-react"

import { Button } from "@nextide/ui/components/button"
import { cn } from "@nextide/ui/lib/utils"

type EditToggleProps = Omit<
  React.ComponentProps<typeof Button>,
  "variant" | "size" | "children"
> & {
  editing: boolean
  /** Compact fits 24px rows; the default joins a 48px field on its left until editing. */
  size?: "default" | "compact"
}

const iconMotion =
  "absolute transition-[opacity,transform] duration-[var(--nextide-motion-control)] ease-[var(--nextide-ease-out-quart)] motion-reduce:transition-none"

/** The pencil that turns into a check beside an in-place editor. */
function EditToggle({
  editing,
  size = "default",
  className,
  ...props
}: EditToggleProps) {
  const compact = size === "compact"
  return (
    <Button
      type="button"
      variant={compact ? "ghost" : "secondary"}
      size={compact ? "icon-xs" : "icon-lg"}
      data-slot="edit-toggle"
      className={cn(
        // The fill reaches the border edge so the toggle matches the field beside it.
        "relative overflow-hidden bg-clip-border transition-[border-radius,opacity,background-color] duration-[var(--nextide-motion-layout)] ease-[var(--nextide-ease-in-out-quart)] motion-reduce:transition-none",
        compact
          ? "size-6 rounded-md text-muted-foreground [&_svg]:size-3"
          : cn(
              "size-12",
              editing ? "rounded-xl" : "rounded-l-none rounded-r-xl"
            ),
        className
      )}
      {...props}
    >
      <Pencil
        aria-hidden="true"
        className={cn(
          iconMotion,
          editing ? "scale-75 rotate-45 opacity-0" : "scale-100 opacity-100"
        )}
      />
      <Check
        aria-hidden="true"
        className={cn(
          iconMotion,
          editing ? "scale-100 opacity-100" : "scale-75 -rotate-45 opacity-0"
        )}
      />
    </Button>
  )
}

/** Returns focus to the toggle after editing without lighting up its focus ring. */
function focusEditToggle(toggle: HTMLButtonElement | null) {
  toggle?.focus({ focusVisible: false })
}

export { EditToggle, focusEditToggle, type EditToggleProps }
