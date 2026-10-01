import { expect, test } from "@playwright/test"
import {
  expectNoSeriousAxeViolations,
  openQualification,
} from "./qualification-helpers"

test.beforeEach(openQualification)

for (const width of [320, 390, 768, 1440]) {
  test(`${width}px notifications stack without moving content or taking focus`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: "reduce" })
    const viewport = page.locator('[data-slot="toast-viewport"]')
    await expect(viewport).toHaveAttribute("aria-live", "polite")
    for (const tone of ["success", "info", "warning"]) {
      const trigger = page.getByRole("button", {
        name: `${tone} notification`,
        exact: true,
      })
      await trigger.scrollIntoViewIfNeeded()
      const before = await trigger.boundingBox()
      await trigger.click()
      await expect(trigger).toBeFocused()
      expect(await trigger.boundingBox()).toEqual(before)
    }
    const toasts = page.locator('[data-slot="toast"]')
    await expect(toasts).toHaveCount(3)
    const boxes = await toasts.evaluateAll((elements) =>
      elements
        .map((element) => {
          const { x, y, width, height } = element.getBoundingClientRect()
          return { x, y, width, height }
        })
        .sort((a, b) => a.y - b.y)
    )
    for (const [index, box] of boxes.entries()) {
      expect(box.x).toBeGreaterThanOrEqual(0)
      expect(box.x + box.width).toBeLessThanOrEqual(width)
      expect(box.y).toBeGreaterThanOrEqual(0)
      expect(box.y + box.height).toBeLessThanOrEqual(900 - 16)
      if (index > 0)
        expect(box.y).toBeGreaterThan(
          boxes[index - 1]!.y + boxes[index - 1]!.height
        )
    }
    expect(
      await toasts.evaluateAll(
        (elements) =>
          elements.flatMap((element) => element.getAnimations()).length
      )
    ).toBe(0)
    await toasts.last().hover()
    await expectNoSeriousAxeViolations(
      page,
      "stacked notifications",
      '[data-slot="toast-viewport"]'
    )
    await viewport
      .getByRole("button", { name: "Dismiss notification" })
      .first()
      .click()
    await expect(toasts).toHaveCount(2)
  })
}

test("notifications expire around four seconds and pause while hovered or keyboard focused", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.clock.install()
  const trigger = page.getByRole("button", {
    name: "success notification",
    exact: true,
  })
  const notification = page.locator('[data-slot="toast"]')
  await trigger.click()
  await expect(notification).toBeVisible()
  await page.clock.fastForward(3500)
  await expect(notification).toBeVisible()
  await notification.hover()
  await page.clock.fastForward(5000)
  await expect(notification).toBeVisible()
  await page.keyboard.press("F6")
  await page.mouse.move(0, 0)
  await expect
    .poll(() =>
      page
        .locator('[data-slot="toast-viewport"]')
        .evaluate((element) => element.contains(document.activeElement))
    )
    .toBe(true)
  await page.clock.fastForward(5000)
  await expect(notification).toBeVisible()
  await trigger.focus()
  await page.clock.fastForward(4001)
  await expect(notification).toHaveCount(0)

  await trigger.click()
  await notification.hover()
  await page.keyboard.press("F6")
  await trigger.focus()
  await page.clock.fastForward(5000)
  await expect(notification).toBeVisible()
  await page.mouse.move(0, 0)
  await page.clock.fastForward(4001)
  await expect(notification).toHaveCount(0)
})

test("a notification can be swiped away", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 })
  await page
    .getByRole("button", { name: "success notification", exact: true })
    .click()
  const notification = page.locator('[data-slot="toast"]')
  await expect(notification).toBeVisible()
  const box = (await notification.boundingBox())!
  await page.mouse.move(box.x + 40, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width + 100, box.y + box.height / 2, {
    steps: 5,
  })
  await page.mouse.up()
  await expect(notification).toHaveCount(0)
})
