import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@nextide/ui/lib/utils"

const surfaceVariants = cva(
  "rounded-xl border text-card-foreground transition-colors",
  {
    variants: {
      variant: {
        panel:
          "border-nextide-line bg-nextide-panel shadow-[0_8px_32px_rgb(0_0_0/0.16)] backdrop-blur-xl",
        strong:
          "border-nextide-line bg-nextide-panel-strong shadow-[0_12px_40px_rgb(0_0_0/0.22)] backdrop-blur-xl",
        plain: "border-border bg-card",
        ghost: "border-transparent bg-transparent",
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        md: "p-4",
        lg: "p-5",
      },
    },
    defaultVariants: {
      variant: "panel",
      padding: "md",
    },
  }
)

function Surface({
  className,
  variant,
  padding,
  ...props
}: React.ComponentProps<"section"> & VariantProps<typeof surfaceVariants>) {
  return (
    <section
      data-slot="surface"
      className={cn(surfaceVariants({ variant, padding }), className)}
      {...props}
    />
  )
}

function SurfaceHeader({
  className,
  ...props
}: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="surface-header"
      className={cn("grid gap-1", className)}
      {...props}
    />
  )
}

function SurfaceTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="surface-title"
      className={cn("text-sm font-semibold tracking-normal", className)}
      {...props}
    />
  )
}

function SurfaceDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="surface-description"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Surface,
  SurfaceHeader,
  SurfaceTitle,
  SurfaceDescription,
  surfaceVariants,
}
