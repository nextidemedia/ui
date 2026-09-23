import type { CampaignScheduleBooking } from "./campaign-schedule-matrix-model.js"

type OverlapSpan = {
  start: number
  end: number
  bookings: CampaignScheduleBooking[]
}
type BookingShape = {
  clip: string
  label: { left: number; width: number; top: number; height: number }
  visible: boolean
}
export function scheduleOverlapSpans(
  bookings: CampaignScheduleBooking[]
): OverlapSpan[] {
  const edges = [
    ...new Set(
      bookings.flatMap((booking) => [booking.startIndex, booking.endIndex + 1])
    ),
  ].sort((a, b) => a - b)
  return edges.slice(0, -1).map((start, index) => ({
    start,
    end: edges[index + 1]!,
    bookings: bookings.filter(
      (booking) => booking.startIndex <= start && booking.endIndex >= start
    ),
  }))
}
export function scheduleBookingShape(
  booking: CampaignScheduleBooking,
  spans: OverlapSpan[],
  selectedId?: string
): BookingShape {
  const length = booking.endIndex - booking.startIndex + 1
  const parts = spans
    .filter((span) => span.bookings.some((item) => item.id === booking.id))
    .map((span) => {
      const count = span.bookings.length
      const primary =
        span.bookings.find((item) => item.id === selectedId) ??
        span.bookings[0]!
      const index = span.bookings.findIndex((item) => item.id === booking.id)
      const top =
        count > 2
          ? primary.id === booking.id
            ? 0
            : 100
          : (index * 100) / count
      const height =
        count > 2 ? (primary.id === booking.id ? 50 : 0) : 100 / count
      return {
        left: ((span.start - booking.startIndex) * 100) / length,
        width: ((span.end - span.start) * 100) / length,
        top,
        height,
      }
    })
  const upper = parts.flatMap((part) => [
    `${part.left}% ${part.top}%`,
    `${part.left + part.width}% ${part.top}%`,
  ])
  const lower = [...parts]
    .reverse()
    .flatMap((part) => [
      `${part.left + part.width}% ${part.top + part.height}%`,
      `${part.left}% ${part.top + part.height}%`,
    ])
  const label = parts.reduce(
    (best, part) =>
      part.width * part.height > best.width * best.height ? part : best,
    { left: 0, width: 0, top: 0, height: 0 }
  )
  return {
    clip: `polygon(${[...upper, ...lower].join(",")})`,
    label,
    visible: label.height > 0,
  }
}
export type { OverlapSpan, BookingShape }
