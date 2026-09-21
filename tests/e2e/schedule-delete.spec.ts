import { expect, test, type Page, type Locator } from "@playwright/test"

const matrixSelector = '[data-slot="campaign-schedule-matrix"]'
const bookingSelector = '[data-slot="campaign-schedule-booking"]'

async function openSchedule(page: Page, width = 1440) {
  await page.setViewportSize({ width, height: 900 })
  await page.goto("/?view=web-mining")
  const matrix = page.locator(matrixSelector)
  await matrix.getByRole("region").evaluate((node) => {
    node.scrollLeft = 0
  })
  return matrix
}

async function sweep(
  page: Page,
  booking: Locator,
  reverse = false,
  cancel = false
) {
  const body = booking.getByRole("button", { name: "Launch read", exact: true })
  const box = (await body.boundingBox())!
  const from = reverse ? box.x + box.width - 1 : box.x + 1
  const to = reverse ? box.x + 1 : box.x + box.width - 1
  await page.mouse.move(from, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(to, box.y + box.height / 2, { steps: 5 })
  await expect(booking.locator("output")).toHaveText("Release to delete")
  if (cancel) await page.keyboard.press("Escape")
  await page.mouse.up()
}

test("booking deletion is focus-scoped and retains creator rows at every width", async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1440]) {
    const matrix = await openSchedule(page, width)
    const booking = matrix.locator('[data-booking-id="booking-1"]')
    await page
      .getByRole("button", { name: "Clear creators", exact: true })
      .focus()
    await page.keyboard.press("Delete")
    await expect(matrix.locator(bookingSelector)).toHaveCount(4)
    await booking
      .getByRole("button", { name: "Launch read", exact: true })
      .press("Delete")
    await expect(booking).toHaveCount(0)
    await expect(
      matrix.locator('[data-slot="campaign-schedule-creator-row"]')
    ).toHaveCount(4)
    await expect(
      matrix.getByRole("button", { name: "Reorder Mina Vale" })
    ).toBeFocused()
    await matrix
      .locator('[data-booking-id="booking-2"]')
      .getByRole("button", { name: "Challenge stream", exact: true })
      .press("Backspace")
    await expect(matrix.locator(bookingSelector)).toHaveCount(2)
    await expect(
      matrix.getByRole("button", { name: "Reorder Ren Kade" })
    ).toBeFocused()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth
      )
    ).toBeLessThanOrEqual(1)
  }
})

test("scissors sweeps delete in both directions and cancel partial or escaped gestures", async ({
  page,
}) => {
  for (const reverse of [false, true]) {
    const matrix = await openSchedule(page, reverse ? 768 : 1440)
    if (reverse) {
      await matrix.getByRole("button", { name: "Zoom out" }).click()
      await expect
        .poll(() =>
          matrix.evaluate(
            (node) =>
              node
                .getAnimations({ subtree: true })
                .filter((animation) => animation.playState === "running").length
          )
        )
        .toBe(0)
      await matrix.getByRole("region").evaluate((node) => {
        node.scrollLeft = 0
      })
    }
    const booking = matrix.locator('[data-booking-id="booking-1"]')
    const tool = matrix.getByRole("button", { name: "Scissors tool" })
    await tool.click()
    const body = booking.getByRole("button", {
      name: "Launch read",
      exact: true,
    })
    const box = (await body.boundingBox())!
    await page.mouse.move(box.x + box.width / 3, box.y + box.height / 2)
    await page.mouse.down()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
      steps: 5,
    })
    await page.mouse.up()
    await expect(matrix.locator(bookingSelector)).toHaveCount(4)
    await sweep(page, booking, reverse, true)
    await expect(booking).toHaveCount(1)
    await expect(tool).toHaveAttribute("aria-pressed", "false")
    await tool.click()
    await sweep(page, booking, reverse)
    await expect(booking).toHaveCount(0)
    await expect(
      matrix.getByRole("button", { name: "Reorder Mina Vale" })
    ).toBeFocused()
    expect(await page.evaluate(() => getSelection()?.toString())).toBe("")
  }
  const matrix = await openSchedule(page)
  const booking = matrix.locator('[data-booking-id="booking-1"]')
  await matrix.getByRole("button", { name: "Scissors tool" }).click()
  const body = booking.getByRole("button", { name: "Launch read", exact: true })
  await body.press("Home")
  await body.press("Enter")
  await expect(booking).toHaveAttribute("data-end-index", "4")
  await matrix.getByRole("region").evaluate((node) => {
    node.scrollLeft = 0
  })
  await sweep(page, booking)
  await expect(booking).toHaveCount(0)
  await expect(matrix.locator(bookingSelector)).toHaveCount(4)
})

test("chart tools toggle, resize handles remain usable, and eraser removes only its target", async ({
  page,
}) => {
  const matrix = await openSchedule(page)
  const scissors = matrix.getByRole("button", { name: "Scissors tool" })
  await expect(matrix).toHaveAttribute("data-demo-ref", "attached")
  const eraser = matrix.getByRole("button", { name: "Eraser tool" })
  const booking = matrix.locator('[data-booking-id="booking-1"]')
  await scissors.click()
  await expect(scissors).toHaveAttribute("aria-pressed", "true")
  await expect(
    booking.getByRole("button", { name: "Resize start of Launch read" })
  ).toBeVisible()
  const end = booking.getByRole("button", { name: "Resize end of Launch read" })
  await end.press("ArrowRight")
  await end.press("Enter")
  await expect(booking).toHaveAttribute("data-end-index", "19")
  await scissors.click()
  await scissors.click()
  await expect(scissors).toHaveAttribute("aria-pressed", "false")
  await eraser.click()
  await expect(eraser).toHaveAttribute("aria-pressed", "true")
  await booking
    .getByRole("button", { name: "Launch read", exact: true })
    .click()
  await expect(booking).toHaveCount(0)
  await expect(matrix.locator(bookingSelector)).toHaveCount(3)
  await page
    .getByRole("button", { name: "Clear creators", exact: true })
    .click({ button: "right" })
  await expect(eraser).toHaveAttribute("aria-pressed", "false")
})

test("creator order previews while held, reverses, cancels, and commits on drop", async ({
  page,
}) => {
  const matrix = await openSchedule(page)
  const handle = matrix.getByRole("button", { name: "Reorder Mina Vale" })
  const legends = matrix.locator(
    '[data-slot="campaign-schedule-creator-legend"]'
  )
  const box = (await handle.boundingBox())!
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 128, {
    steps: 5,
  })
  await expect(legends.nth(2)).toContainText("Mina Vale")
  await expect(handle).toBeFocused()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 64, {
    steps: 3,
  })
  await expect(legends.nth(1)).toContainText("Mina Vale")
  await page.keyboard.press("Escape")
  await page.mouse.up()
  await expect(legends.first()).toContainText("Mina Vale")
  await expect
    .poll(() =>
      matrix.evaluate(
        (node) =>
          node
            .getAnimations({ subtree: true })
            .filter((animation) => animation.playState === "running").length
      )
    )
    .toBe(0)
  const restored = (await handle.boundingBox())!
  await page.mouse.move(
    restored.x + restored.width / 2,
    restored.y + restored.height / 2
  )
  await page.mouse.down()
  await page.mouse.move(
    restored.x + restored.width / 2,
    restored.y + restored.height / 2 + 128,
    { steps: 5 }
  )
  await expect(legends.nth(2)).toContainText("Mina Vale")
  await page.mouse.up()
  await matrix.getByRole("button", { name: "Expand schedule" }).click()
  await expect(legends.nth(2)).toContainText("Mina Vale")
})
