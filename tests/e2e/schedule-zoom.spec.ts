import { expect, test } from "@playwright/test"

test("one-day campaign labels remain readable across zoom and viewport sizes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/?view=web-mining")
  await page.getByRole("button", { name: "Show one day" }).click()
  const matrix = page.locator('[data-slot="campaign-schedule-matrix"]')
  const timeline = matrix.getByRole("region", {
    name: "Campaign schedule timeline",
  })
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await matrix.getByRole("button", { name: "Zoom out" }).click()
    const bounds = await timeline.evaluate((node) => {
      const start = node
        .querySelector('[data-slot="campaign-start-marker"] span')!
        .getBoundingClientRect()
      const end = node
        .querySelector('[data-slot="campaign-end-marker"] span')!
        .getBoundingClientRect()
      return {
        overlap:
          start.left < end.right &&
          start.right > end.left &&
          start.top < end.bottom &&
          start.bottom > end.top,
        filled:
          node.firstElementChild!.getBoundingClientRect().width >=
          node.clientWidth,
      }
    })
    expect(bounds).toEqual({ overlap: false, filled: true })
    await matrix.getByRole("button", { name: "Zoom in" }).click()
    await expect(timeline).toHaveAttribute("data-zoom", "week")
    await expect(
      matrix.locator('[data-booking-id="booking-1"]')
    ).toHaveAttribute("data-start-index", "4")
    await expect(
      matrix.locator('[data-booking-id="booking-1"]')
    ).toHaveAttribute("data-end-index", "4")
  }
})

test("four-week schedule zoom changes booking scale and keeps dates aligned", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/?view=web-mining")
  await page.getByRole("button", { name: "Show four weeks" }).click()
  const matrix = page.locator('[data-slot="campaign-schedule-matrix"]')
  const timeline = matrix.getByRole("region", {
    name: "Campaign schedule timeline",
  })
  const booking = matrix.locator('[data-booking-id="booking-1"]')
  const measure = () =>
    timeline.evaluate((node) => {
      const track = node.firstElementChild!.getBoundingClientRect()
      const row = node
        .querySelector('[data-slot="campaign-schedule-board-row"]')!
        .getBoundingClientRect()
      const booking = node
        .querySelector('[data-booking-id="booking-1"]')!
        .getBoundingClientRect()
      const start = node
        .querySelector('[data-slot="campaign-start-marker"]')!
        .getBoundingClientRect()
      const end = node
        .querySelector('[data-slot="campaign-end-marker"]')!
        .getBoundingClientRect()
      return {
        frame: node.getBoundingClientRect().width,
        track: track.width,
        row: row.width,
        booking: booking.width,
        bookingX: booking.x,
        startX: start.x,
        endX: end.x,
        rowRight: row.right,
      }
    })
  const week = await measure()
  expect(week.track).toBeGreaterThanOrEqual(week.frame - 2)
  await matrix.getByRole("button", { name: "Zoom out" }).click()
  await expect(timeline).toHaveAttribute("data-zoom", "month")
  await expect
    .poll(async () => (await measure()).booking)
    .toBeLessThan(week.booking * 0.75)
  const month = await measure()
  expect(month.frame).toBeCloseTo(week.frame, 0)
  expect(month.track).toBeGreaterThanOrEqual(month.frame - 2)
  expect(month.booking).toBeLessThan(week.booking * 0.75)
  expect(month.bookingX).toBeCloseTo(month.startX, 0)
  expect(month.endX).toBeLessThan(month.rowRight - month.row * 0.4)
  await booking
    .getByRole("button", { name: "Resize end of Launch read" })
    .press("ArrowRight")
  await page.keyboard.press("Enter")
  await expect(booking).toHaveAttribute("data-end-index", "19")
  await matrix.getByRole("button", { name: "Zoom in" }).click()
  await expect(timeline).toHaveAttribute("data-zoom", "week")
  await expect
    .poll(async () => (await measure()).booking)
    .toBeGreaterThan(month.booking * 1.5)
  await expect(booking).toHaveAttribute("data-end-index", "19")
  await matrix.getByRole("button", { name: "Expand schedule" }).click()
  await matrix.getByRole("button", { name: "Zoom out" }).click()
  await expect(timeline).toHaveAttribute("data-zoom", "month")
  const expanded = await measure()
  expect(expanded.track).toBeGreaterThanOrEqual(expanded.frame - 2)
  expect(expanded.bookingX).toBeCloseTo(expanded.startX, 0)
  await page.setViewportSize({ width: 320, height: 900 })
  await expect
    .poll(() =>
      timeline.evaluate((node) => node.scrollWidth - node.clientWidth)
    )
    .toBeGreaterThan(0)
})
