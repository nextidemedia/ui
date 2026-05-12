import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { CircleAlert } from "lucide-react"

import { cn } from "@nextide/ui/lib/utils"

const noticeVariants = cva(
  "flex items-start gap-3 rounded-xl border p-3 text-sm",
  {
    variants: {
      tone: {
        neutral: "border-nextide-line bg-nextide-panel text-foreground",
        info: "border-nextide-tide/35 bg-nextide-tide/10 text-foreground",
        warning:
          "border-nextide-yellow/40 bg-nextide-yellow/10 text-foreground",
        danger: "border-nextide-red/40 bg-nextide-red/10 text-foreground",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  }
)

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
    <div
      data-slot="notice"
      data-tone={tone}
      className={cn(noticeVariants({ tone }), className)}
      {...props}
    >
      <span className="mt-0.5 text-nextide-tide [&_svg]:size-4">{icon}</span>
      <span className="grid min-w-0 flex-1 gap-1">
        <strong className="text-sm leading-none font-semibold">{title}</strong>
        <span className="text-xs text-muted-foreground">{children}</span>
      </span>
      {action ? <span className="shrink-0">{action}</span> : null}
    </div>
  )
}

export { Notice, noticeVariants }
