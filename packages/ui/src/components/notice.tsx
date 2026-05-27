import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { CircleAlert } from "lucide-react"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@nextide/ui/components/alert"
import { cn } from "@nextide/ui/lib/utils"

const noticeVariants = cva("rounded-xl", {
  variants: {
    tone: {
      neutral: "border-nextide-line bg-nextide-panel text-foreground",
      info: "border-nextide-tide/35 bg-nextide-tide/10 text-foreground",
      warning: "border-nextide-yellow/40 bg-nextide-yellow/10 text-foreground",
      danger: "border-nextide-red/40 bg-nextide-red/10 text-foreground",
    },
  },
  defaultVariants: {
    tone: "neutral",
  },
})

function Notice({
  className,
  tone,
  icon = <CircleAlert />,
  title,
  children,
  action,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof noticeVariants> & {
    icon?: React.ReactNode
    title: React.ReactNode
    action?: React.ReactNode
  }) {
  return (
    <Alert
      data-slot="notice"
      data-tone={tone}
      variant={tone === "danger" ? "destructive" : "default"}
      className={cn(
        "grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1 p-3",
        noticeVariants({ tone }),
        className
      )}
      {...props}
    >
      <span className="mt-0.5 text-nextide-tide [&_svg]:size-4">{icon}</span>
      <span className="grid min-w-0 gap-1">
        <AlertTitle className="text-sm leading-none font-semibold">
          {title}
        </AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground">
          {children}
        </AlertDescription>
      </span>
      {action ? (
        <AlertAction className="static col-start-3 row-span-2 row-start-1 shrink-0">
          {action}
        </AlertAction>
      ) : null}
    </Alert>
  )
}

export { Notice, noticeVariants }
