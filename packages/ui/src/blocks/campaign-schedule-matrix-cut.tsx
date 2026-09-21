import * as React from "react"
import { Scissors } from "lucide-react"
import { Button } from "@nextide/ui/components/button"
import {
  clamp,
  type CampaignScheduleBooking,
} from "./campaign-schedule-matrix-model.js"
import type { ScheduleEditing } from "./campaign-schedule-matrix-edit.js"

const scissorsCursor = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Ccircle cx='6' cy='6' r='3'/%3E%3Ccircle cx='6' cy='18' r='3'/%3E%3Cpath d='m8 8 13 13M8 16 21 3'/%3E%3C/svg%3E") 12 12, crosshair`

function useBookingCut(
  booking: CampaignScheduleBooking,
  editing: ScheduleEditing,
  rootRef: React.RefObject<HTMLDivElement | null>,
  bodyRef: React.RefObject<HTMLButtonElement | null>
) {
  const [boundary, setBoundary] = React.useState<number | null>(null)
  const enabled =
    Boolean(editing.onBookingSplit) && booking.startIndex < booking.endIndex
  const armed = enabled && boundary !== null
  React.useEffect(() => {
    if (!armed) return
    const outside = (event: Event) => {
      if (!rootRef.current?.contains(event.target as Node)) setBoundary(null)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      event.stopPropagation()
      setBoundary(null)
      bodyRef.current?.focus({ preventScroll: true })
    }
    document.addEventListener("pointerdown", outside, true)
    document.addEventListener("focusin", outside, true)
    document.addEventListener("keydown", escape, true)
    return () => {
      document.removeEventListener("pointerdown", outside, true)
      document.removeEventListener("focusin", outside, true)
      document.removeEventListener("keydown", escape, true)
    }
  }, [armed, rootRef, bodyRef])
  const atPointer = (clientX: number) => {
    const rect = rootRef.current!.getBoundingClientRect()
    return clamp(
      Math.round(
        booking.startIndex +
          ((clientX - rect.left) / rect.width) *
            (booking.endIndex - booking.startIndex + 1)
      ),
      booking.startIndex + 1,
      booking.endIndex
    )
  }
  const commit = (index: number) => {
    setBoundary(null)
    editing.onBookingSplit?.(booking, index)
  }
  const keyDown = (event: React.KeyboardEvent) => {
    if (!armed) return
    const indices: Record<string, number> = {
      ArrowLeft: boundary! - 1,
      ArrowRight: boundary! + 1,
      Home: booking.startIndex + 1,
      End: booking.endIndex,
    }
    if (event.key === "Enter") {
      event.preventDefault()
      commit(boundary!)
      return
    }
    if (indices[event.key] === undefined) return
    event.preventDefault()
    setBoundary(
      clamp(indices[event.key], booking.startIndex + 1, booking.endIndex)
    )
  }
  return {
    armed,
    enabled,
    boundary,
    arm: () => {
      setBoundary(
        armed
          ? null
          : Math.round((booking.startIndex + booking.endIndex + 1) / 2)
      )
      bodyRef.current?.focus({ preventScroll: true })
    },
    keyDown,
    preview: (event: React.PointerEvent) => {
      if (armed) setBoundary(atPointer(event.clientX))
    },
    click: (event: React.MouseEvent) => {
      if (armed) {
        commit(event.detail ? atPointer(event.clientX) : boundary!)
        return true
      }
      return false
    },
  }
}

function BookingScissors({
  cut,
  titleId,
  booking,
  dayLabels,
}: {
  cut: ReturnType<typeof useBookingCut>
  titleId: string
  booking: CampaignScheduleBooking
  dayLabels: string[]
}) {
  const actionId = React.useId()
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-labelledby={`${actionId} ${titleId}`}
        aria-pressed={cut.armed}
        className="z-10 w-[min(2rem,25%)] shrink-0 self-center overflow-hidden"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={cut.arm}
      >
        <span id={actionId} className="sr-only">
          Cut
        </span>
        <Scissors />
      </Button>
      {cut.armed && (
        <span
          data-slot="campaign-cut-boundary"
          className="pointer-events-none absolute inset-y-0 z-20 border-l-2 border-nextide-tide"
          style={{
            left: `${((cut.boundary! - booking.startIndex) / (booking.endIndex - booking.startIndex + 1)) * 100}%`,
          }}
        >
          <output className="absolute bottom-full left-0 mb-1 rounded-sm bg-nextide-panel px-1 text-ui-micro whitespace-nowrap text-nextide-tide">
            Cut before {dayLabels[cut.boundary!]}
          </output>
        </span>
      )}
    </>
  )
}
export { useBookingCut, BookingScissors, scissorsCursor }
