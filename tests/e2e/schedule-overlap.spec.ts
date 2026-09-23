import { expect, test } from "@playwright/test"

test("stepped overlaps retain row height and expose every creative for editing", async ({
  page,
}) => {
  await page.goto("/?view=web-mining")
  await page.getByRole("button", { name: "Show creative overlaps" }).click()
  const matrix = page.locator('[data-slot="campaign-schedule-matrix"]')
  const row = matrix.locator('[data-slot="campaign-schedule-creator-row"]')
  await expect(row).toHaveCount(1)
  const height = await row.evaluate(
    (node) => node.getBoundingClientRect().height
  )
  expect(height).toBe(64)
  const band = matrix.getByRole("button", { name: "3 overlapping creatives" })
  await band.click()
  await page
    .getByRole("button", { name: "Creative C", exact: true })
    .last()
    .click()
  const selected = matrix.locator('[data-booking-id="creative-c"]')
  await expect(selected).toBeVisible()
  await selected
    .getByRole("button", { name: "Resize end of Creative C" })
    .press("ArrowRight")
  await page.keyboard.press("Enter")
  await expect(selected).toHaveAttribute("data-end-index", "29")
  expect(
    await row.evaluate((node) => node.getBoundingClientRect().height)
  ).toBe(height)
  const targets = await row
    .locator('[data-slot="campaign-schedule-board-row"]')
    .evaluate((node) => {
      const box = node.getBoundingClientRect()
      const x = box.left + (box.width * 16) / 91
      return [box.top + 20, box.top + 44].map((y) =>
        document
          .elementFromPoint(x, y)
          ?.closest("[data-booking-id]")
          ?.getAttribute("data-booking-id")
      )
    })
  expect(targets).toEqual(["creative-a", "creative-b"])
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await matrix.screenshot({ path: `output/overlaps-${width}.png` })
    expect(
      await row.evaluate((node) => node.getBoundingClientRect().height)
    ).toBe(height)
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true)
  }
})
