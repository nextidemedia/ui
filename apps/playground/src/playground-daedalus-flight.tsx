import {
  CampaignScheduleMatrix,
  type CampaignScheduleBooking,
  type CampaignScheduleDefaultZoom,
} from "@nextide/ui/blocks/campaign-schedule-matrix"
import { SegmentedControl } from "@nextide/ui/components/segmented-control"
import { useState } from "react"
import { scheduleCreators } from "./mining-data"

const flightDays = Array.from({ length: 14 }, (_, index) => {
  const date = new Date(Date.UTC(2026, 5, 1 + index)).toISOString().slice(0, 10)
  return { id: date, date, today: index === 9 }
})

const flightBookings: CampaignScheduleBooking[] = [
  {
    id: "flight-launch",
    creatorId: "mina",
    title: "Starforge launch read",
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
]

const openingOptions: { value: CampaignScheduleDefaultZoom; label: string }[] =
  [
    { value: "fit", label: "Fit flight" },
    { value: "day", label: "Days" },
    { value: "week", label: "Weeks" },
    { value: "month", label: "Months" },
  ]

function CreatorFlightDemo() {
  const [opening, setOpening] = useState<CampaignScheduleDefaultZoom>("fit")
  return (
    <div className="grid gap-3">
      <SegmentedControl
        aria-label="Flight opening zoom"
        className="max-w-md"
        value={opening}
        options={openingOptions}
        onValueChange={(value) =>
          setOpening(value as CampaignScheduleDefaultZoom)
        }
      />
      <div data-slot="creator-flight-panel" className="w-full max-w-[34rem]">
        <CampaignScheduleMatrix
          key={opening}
          defaultZoom={opening}
          title="Your flight"
          description="Mina Vale · Starforge, June 1–14"
          showMetrics={false}
          creators={[scheduleCreators[0]!]}
          days={flightDays}
          bookings={flightBookings}
          campaignStartIndex={0}
          campaignEndIndex={13}
        />
      </div>
    </div>
  )
}

export { CreatorFlightDemo }
