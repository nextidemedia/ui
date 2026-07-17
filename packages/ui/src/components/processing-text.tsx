import * as React from "react"

import { cn } from "@nextide/ui/lib/utils"

type ProcessingTextTone = "neutral" | "processing"
type ProcessingTextVariant = "classic" | "aurora" | "flame"

type ProcessingTextProps = Omit<React.ComponentProps<"span">, "children"> & {
  children: string
  tone?: ProcessingTextTone
  travelSpeed?: number
  variant?: ProcessingTextVariant
}

const processingTextTravelRatio = 0.8

function ProcessingText({
  children,
  tone = "neutral",
  travelSpeed = 5,
  variant = "classic",
  className,
  style,
  ...props
}: ProcessingTextProps) {
  const resolvedTravelSpeed =
    Number.isFinite(travelSpeed) && travelSpeed > 0 ? travelSpeed : 5
  const duration =
    (Math.max(children.trim().length, 1) /
      resolvedTravelSpeed /
      processingTextTravelRatio) *
    1000

  return (
    <span
      data-slot="processing-text"
      data-tone={tone}
      data-travel-speed={resolvedTravelSpeed}
      data-variant={variant}
      className={cn("nextide-processing-text", className)}
      style={
        {
          "--nextide-processing-text-duration": `${duration}ms`,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </span>
  )
}

export {
  ProcessingText,
  type ProcessingTextProps,
  type ProcessingTextTone,
  type ProcessingTextVariant,
}
