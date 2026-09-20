import * as React from "react"

import { cn } from "@nextide/ui/lib/utils"
import { useFieldFocus } from "@nextide/ui/hooks/use-field-focus"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  const focusProps = useFieldFocus(props)
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-md border border-input bg-background px-3 py-2 text-ui-body transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-ui-label file:font-medium file:text-foreground placeholder:text-muted-foreground focus:border-ring focus-visible:ring-ring focus-visible:ring-inset focus-visible:not-data-[pointer-focus]:ring-1 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive/60 aria-invalid:ring-destructive/60 dark:bg-input/30 dark:disabled:bg-input/80",
        className
      )}
      {...props}
      {...focusProps}
    />
  )
}

export { Input }
