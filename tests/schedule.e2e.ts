import { test } from "@e2e-dev/web"
import { expect } from "e2e"

test(
  "schedule edits cancel and commit independent split bookings",
  { platforms: ["web"] },
  async ({ app, screen, browser }) => {
    await app.open("/?view=web-mining")
    const booking = browser.locator('[data-booking-id="booking-1"]')
    const move = booking.getByRole("button", "Launch read")
    await move.press("ArrowRight")
    await expect(booking).toHaveAttribute("data-start-index", "5")
    await move.press("Escape")
    await expect(booking).toHaveAttribute("data-start-index", "4")
    await move.press("ArrowRight")
    await move.press("Enter")
    await expect(booking).toHaveAttribute("data-end-index", "19")
    const end = booking.getByRole("button", "Resize end of Launch read")
    await end.press("ArrowLeft")
    await end.press("Enter")
    await expect(booking).toHaveAttribute("data-end-index", "18")
    const start = booking.getByRole("button", "Resize start of Launch read")
    await start.press("ArrowLeft")
    await start.press("Enter")
    await expect(booking).toHaveAttribute("data-start-index", "4")
    await screen.getByRole("button", "Scissors tool").tap()
    await move.press("ArrowLeft")
    await move.press("Enter")
    await browser.keyboard.press("Escape")
    const pieces = browser
      .locator('[data-slot="campaign-schedule-board-row"]')
      .first()
      .getByRole("button", "Launch read")
    await expect(pieces).toHaveCount(2)
    const split = browser
      .locator('[data-slot="campaign-schedule-board-row"]')
      .first()
      .getByRole("button", "Launch read")
      .nth(1)
    await split.press("ArrowRight")
    await split.press("Enter")
    const bookings = browser
      .locator('[data-slot="campaign-schedule-board-row"]')
      .first()
    await expect(
      browser
        .locator('[data-slot="campaign-schedule-board-row"] [data-booking-id]')
        .first()
    ).toHaveAttribute("data-end-index", "10")
    expect(await bookings.getByRole("button", "Launch read").count()).toBe(2)
  }
)

test(
  "expanded resize previews cancel without closing and persist confirmed days",
  { platforms: ["web"] },
  async ({ app, screen, browser }) => {
    await app.open("/?view=web-mining")
    await screen.getByRole("button", "Expand schedule").tap()
    const dialog = screen.getByRole("dialog", "Campaign schedule")
    const booking = browser.locator('[data-booking-id="booking-3"]')
    const end = booking.getByRole("button", /^Resize end of Late recap/)
    await expect(
      booking.getByRole("button", "Late recap · 22 days")
    ).toBeVisible()
    await end.press("ArrowLeft")
    await expect(
      booking.getByRole("button", "Late recap · 21 days")
    ).toBeVisible()
    await end.press("Escape")
    await expect(dialog).toBeVisible()
    await expect(booking).toHaveAttribute("data-end-index", "66")
    await end.press("ArrowRight")
    await expect(
      booking.getByRole("button", "Late recap · 23 days")
    ).toBeVisible()
    await end.press("Enter")
    await browser.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    await screen.getByRole("button", "Expand schedule").tap()
    await expect(
      booking.getByRole("button", "Late recap · 23 days")
    ).toBeVisible()
    await expect(booking).toHaveAttribute("data-end-index", "67")
    await expect(
      screen.getByRole("region", "Campaign schedule timeline")
    ).toHaveCount(1)
  }
)

test(
  "deletion is focus scoped and returns focus to the retained creator",
  { platforms: ["web"] },
  async ({ app, screen, browser }) => {
    await app.open("/?view=web-mining")
    await screen.getByRole("button", "Clear creators").focus()
    await browser.keyboard.press("Delete")
    await expect(
      browser.locator('[data-slot="campaign-schedule-booking"]')
    ).toHaveCount(4)
    await browser
      .locator('[data-booking-id="booking-1"]')
      .getByRole("button", "Launch read")
      .press("Delete")
    await expect(browser.locator('[data-booking-id="booking-1"]')).toHaveCount(
      0
    )
    await expect(
      browser.locator('[data-slot="campaign-schedule-creator-row"]')
    ).toHaveCount(4)
    await expect(screen.getByRole("button", "Reorder Mina Vale")).toBeFocused()
    await browser
      .locator('[data-booking-id="booking-2"]')
      .getByRole("button", "Challenge stream")
      .press("Backspace")
    await expect(
      browser.locator('[data-slot="campaign-schedule-booking"]')
    ).toHaveCount(2)
    await expect(screen.getByRole("button", "Reorder Ren Kade")).toBeFocused()
  }
)

test(
  "locked bookings survive keyboard deletion and tools until unlocked",
  { platforms: ["web"] },
  async ({ app, screen, browser }) => {
    await app.open("/?view=web-mining")
    const booking = browser.locator('[data-booking-id="booking-1"]')
    const lock = screen.getByRole("button", "Lock tool")
    await lock.tap()
    await booking.getByRole("button", "Launch read").tap()
    await expect(booking).toHaveAttribute("data-locked", "true")
    await lock.tap()
    const body = booking.getByRole("button", "Locked Launch read")
    await body.press("ArrowRight")
    await body.press("Enter")
    await body.press("Delete")
    await expect(booking).toHaveAttribute("data-start-index", "4")
    await screen.getByRole("button", "Eraser tool").tap()
    await body.tap()
    await expect(booking).toHaveCount(1)
    await screen.getByRole("button", "Expand schedule").tap()
    await expect(booking).toHaveAttribute("data-locked", "true")
    await lock.tap()
    await body.tap()
    await expect(
      booking.getByRole("button", "Resize end of Launch read")
    ).toBeVisible()
  }
)

test(
  "pointer resize previews roll back on Escape",
  { platforms: ["web"] },
  async ({ app, screen, browser }) => {
    await app.open("/?view=web-mining")
    await screen.getByRole("button", "Expand schedule").tap()
    const booking = browser.locator('[data-booking-id="booking-3"]')
    const end = booking.getByRole("button", /^Resize end of Late recap/)
    await end.scrollIntoView()
    const box = (await end.boundingBox())!
    const unit = await browser.evaluate(
      () =>
        document
          .querySelector('[data-booking-id="booking-3"]')!
          .parentElement!.getBoundingClientRect().width / 91
    )
    await browser.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await browser.mouse.down()
    await browser.mouse.move(
      box.x + box.width / 2 + unit * 2,
      box.y + box.height / 2
    )
    await expect(
      booking.getByRole("button", "Late recap · 24 days")
    ).toBeVisible()
    await browser.keyboard.press("Escape")
    await browser.mouse.up()
    await expect(
      booking.getByRole("button", "Late recap · 22 days")
    ).toBeVisible()
    await expect(booking).toHaveAttribute("data-end-index", "66")
  }
)

test(
  "flight fit reacts to available width until a manual zoom",
  { platforms: ["web"] },
  async ({ app, screen, browser }) => {
    await app.open("/?view=daedalus")
    const panel = browser.locator('[data-slot="creator-flight-panel"]')
    await panel.scrollIntoView()
    const timeline = panel.getByRole("region", "Campaign schedule timeline")
    await screen
      .getByRole("group", "Flight opening zoom")
      .getByRole("button", "Weeks")
      .tap()
    await screen
      .getByRole("group", "Flight opening zoom")
      .getByRole("button", "Fit flight")
      .tap()
    await browser.evaluate(() => {
      const node = document.querySelector<HTMLElement>(
        '[data-slot="creator-flight-panel"]'
      )!
      node.style.maxWidth = "none"
      node.style.width = "1000px"
      return null
    })
    await expect(timeline).toHaveAttribute("data-zoom", "week")
    await browser.evaluate(() => {
      document.querySelector<HTMLElement>(
        '[data-slot="creator-flight-panel"]'
      )!.style.width = "300px"
      return null
    })
    await expect(timeline).toHaveAttribute("data-zoom", "month")
    await browser.evaluate(() => {
      document.querySelector<HTMLElement>(
        '[data-slot="creator-flight-panel"]'
      )!.style.width = "1000px"
      return null
    })
    await expect(timeline).toHaveAttribute("data-zoom", "week")
    await panel.getByRole("button", "Zoom in").tap()
    await expect(timeline).toHaveAttribute("data-zoom", "day")
    await browser.evaluate(() => {
      document.querySelector<HTMLElement>(
        '[data-slot="creator-flight-panel"]'
      )!.style.width = "300px"
      return null
    })
    await expect(timeline).toHaveAttribute("data-zoom", "day")
  }
)
