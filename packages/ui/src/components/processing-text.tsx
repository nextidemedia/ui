import * as React from "react"

import { cn } from "@nextide/ui/lib/utils"

type ProcessingTextTone = "neutral" | "processing"
type ProcessingTextVariant = "classic" | "aurora" | "flame"

type ProcessingTextProps = Omit<React.ComponentProps<"span">, "children"> & {
  children: string
  syncLength?: number
  tone?: ProcessingTextTone
  travelSpeed?: number
  variant?: ProcessingTextVariant
}

const processingTextTravelRatio = 0.8

function ProcessingText({
  children,
  syncLength,
  tone = "neutral",
  travelSpeed = 5,
  variant = "classic",
  className,
  style,
  ...props
}: ProcessingTextProps) {
  const resolvedTravelSpeed =
    Number.isFinite(travelSpeed) && travelSpeed > 0 ? travelSpeed : 5
  const resolvedSyncLength =
    typeof syncLength === "number" &&
    Number.isFinite(syncLength) &&
    syncLength > 0
      ? syncLength
      : undefined
  const duration =
    (Math.max(resolvedSyncLength ?? children.trim().length, 1) /
      resolvedTravelSpeed /
      processingTextTravelRatio) *
    1000

  return (
    <span
      data-slot="processing-text"
      data-sync-length={resolvedSyncLength}
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
