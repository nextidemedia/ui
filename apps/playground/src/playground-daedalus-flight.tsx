import {
  CampaignScheduleMatrix,
  type CampaignScheduleBooking,
  type CampaignScheduleDefaultZoom,
} from "@nextide/ui/blocks/campaign-schedule-matrix"
import { SegmentedControl } from "@nextide/ui/components/segmented-control"
import { useState } from "react"
import { scheduleCreators } from "./mining-data"

type FlightLength = "two-weeks" | "four-weeks"

function flightDays(start: string, length: number, todayIndex: number) {
  return Array.from({ length }, (_, index) => {
    const date = new Date(`${start}T00:00:00Z`)
    date.setUTCDate(date.getUTCDate() + index)
    const day = date.toISOString().slice(0, 10)
    return { id: day, date: day, today: index === todayIndex }
  })
}

const flights: Record<
  FlightLength,
  {
    description: string
    days: ReturnType<typeof flightDays>
    bookings: CampaignScheduleBooking[]
  }
> = {
  "two-weeks": {
    description: "Mina Vale · Starforge, June 1–14",
    days: flightDays("2026-06-01", 14, 9),
    bookings: [
      {
        id: "flight-launch",
        creatorId: "mina",
        title: "Launch read",
        meta: "Evening streams",
        startIndex: 0,
        endIndex: 6,
        tone: "success",
        status: "Booked",
      },
      {
        id: "flight-recap",
        creatorId: "mina",
        title: "Patch recap",
        meta: "VOD follow-up",
        startIndex: 9,
        endIndex: 13,
        tone: "processing",
        status: "Booked",
      },
    ],
  },
  "four-weeks": {
    description: "Mina Vale · Starforge, June 15–July 12",
    days: flightDays("2026-06-15", 28, 6),
    bookings: [
      {
        id: "flight-season",
        creatorId: "mina",
        title: "Season launch",
        meta: "Evening streams",
        startIndex: 0,
        endIndex: 13,
        tone: "success",
        status: "Booked",
      },
      {
        id: "flight-tournament",
        creatorId: "mina",
        title: "Tournament week",
        meta: "Co-stream reads",
        startIndex: 17,
        endIndex: 27,
        tone: "processing",
        status: "Booked",
      },
    ],
  },
}

const openingOptions: { value: CampaignScheduleDefaultZoom; label: string }[] =
  [
    { value: "fit", label: "Fit flight" },
    { value: "day", label: "Days" },
    { value: "week", label: "Weeks" },
    { value: "month", label: "Months" },
  ]

const lengthOptions: { value: FlightLength; label: string }[] = [
  { value: "two-weeks", label: "Two weeks" },
  { value: "four-weeks", label: "Four weeks" },
]

function CreatorFlightDemo() {
  const [opening, setOpening] = useState<CampaignScheduleDefaultZoom>("fit")
  const [length, setLength] = useState<FlightLength>("two-weeks")
  const flight = flights[length]
  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        <SegmentedControl
          aria-label="Flight opening zoom"
          className="max-w-md"
          value={opening}
          options={openingOptions}
          onValueChange={(value) =>
            setOpening(value as CampaignScheduleDefaultZoom)
          }
        />
        <SegmentedControl
          aria-label="Flight length"
          className="max-w-xs"
          value={length}
          options={lengthOptions}
          onValueChange={(value) => setLength(value as FlightLength)}
        />
      </div>
      <div data-slot="creator-flight-panel" className="w-full max-w-[34rem]">
        <CampaignScheduleMatrix
          key={`${opening}-${length}`}
          defaultZoom={opening}
          title="Your flight"
          description={flight.description}
          showMetrics={false}
          creators={[scheduleCreators[0]!]}
          days={flight.days}
          bookings={flight.bookings}
        />
      </div>
    </div>
  )
}

export { CreatorFlightDemo }
