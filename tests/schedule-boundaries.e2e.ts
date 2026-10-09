import { test } from "@e2e-dev/web"
import { expect } from "e2e"

test(
  "overlapping creatives remain individually selectable and editable",
  { platforms: ["web"] },
  async ({ app, screen, browser }) => {
    await app.open("/?view=web-mining")
    await screen.getByRole("button", "Show creative overlaps").tap()
    await screen.getByRole("button", "3 overlapping creatives").tap()
    await screen.getByRole("button", "Creative C").last().tap()
    const selected = browser.locator('[data-booking-id="creative-c"]')
    await selected
      .getByRole("button", "Resize end of Creative C")
      .press("ArrowRight")
    await browser.keyboard.press("Enter")
    await expect(selected).toHaveAttribute("data-end-index", "29")
    await browser
      .locator('[data-booking-id="creative-a"]')
      .getByRole("button", "Resize end of Creative A")
      .press("ArrowLeft")
    await browser.keyboard.press("Enter")
    await expect(
      browser.locator('[data-booking-id="creative-a"]')
    ).toHaveAttribute("data-end-index", "23")
    await expect(selected).toHaveAttribute("data-end-index", "29")
  }
)

test(
  "zoom changes scale while preserving edited dates and readable one-day endpoints",
  { platforms: ["web"] },
  async ({ app, screen, browser }) => {
    await app.open("/?view=web-mining")
    await screen.getByRole("button", "Show four weeks").tap()
    const booking = browser.locator('[data-booking-id="booking-1"]')
    const timeline = screen.getByRole("region", "Campaign schedule timeline")
    const weekWidth = (await booking.boundingBox())!.width
    await screen.getByRole("button", "Zoom out").tap()
    await expect(timeline).toHaveAttribute("data-zoom", "month")
    await expect
      .poll(async () => (await booking.boundingBox())!.width)
      .toBeLessThan(weekWidth * 0.75)
    await booking
      .getByRole("button", "Resize end of Launch read")
      .press("ArrowRight")
    await browser.keyboard.press("Enter")
    await screen.getByRole("button", "Zoom in").tap()
    await expect(timeline).toHaveAttribute("data-zoom", "week")
    await expect(booking).toHaveAttribute("data-end-index", "19")
    await screen.getByRole("button", "Show one day").tap()
    await screen.getByRole("button", "Zoom out").tap()
    await expect
      .poll(() =>
        browser.evaluate(() => {
          const start = document
            .querySelector('[data-slot="campaign-start-marker"] span')!
            .getBoundingClientRect()
          const end = document
            .querySelector('[data-slot="campaign-end-marker"] span')!
            .getBoundingClientRect()
          return (
            start.left < end.right &&
            start.right > end.left &&
            start.top < end.bottom &&
            start.bottom > end.top
          )
        })
      )
      .toBe(false)
    await expect(booking).toHaveAttribute("data-start-index", "4")
    await expect(booking).toHaveAttribute("data-end-index", "4")
  }
)

test(
  "an empty schedule restores editable creators and reorder cancellation preserves order",
  { platforms: ["web"] },
  async ({ app, screen, browser }) => {
    await app.open("/?view=web-mining")
    await screen.getByRole("button", "Clear creators").tap()
    await expect(
      browser.locator('[data-slot="campaign-schedule-booking"]')
    ).toHaveCount(0)
    await screen.getByRole("button", "Restore creators").tap()
    await expect(
      browser.locator('[data-slot="campaign-schedule-booking"]')
    ).toHaveCount(4)
    const legends = browser.locator(
      '[data-slot="campaign-schedule-creator-legend"]'
    )
    const handle = screen.getByRole("button", "Reorder Mina Vale")
    await handle.press("ArrowDown")
    await handle.press("Escape")
    await expect(legends.first()).toContainText("Mina Vale")
    await handle.press("ArrowDown")
    await handle.press("Enter")
    await expect(legends.first()).toContainText("Ren Kade")
    const booking = browser.locator('[data-booking-id="booking-1"]')
    await booking.getByRole("button", "Launch read").press("ArrowRight")
    await browser.keyboard.press("Escape")
    await expect(booking).toHaveAttribute("data-start-index", "4")
  }
)
