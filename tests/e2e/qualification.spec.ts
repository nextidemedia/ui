import { expect, test } from "@playwright/test"
import {
  expectVisibleFocus,
  expectNoSeriousAxeViolations,
  openQualification,
} from "./qualification-helpers"

test.beforeEach(openQualification)

test("public controls and block are keyboard operable and accessible", async ({
  page,
}) => {
  await expectNoSeriousAxeViolations(page, "default state")

  const projectName = page.getByRole("textbox", { name: "Project name" })
  await projectName.focus()
  await expectVisibleFocus(projectName)
  await projectName.fill("Campaign launch")

  const region = page.getByRole("combobox", { name: "Delivery region" })
  await projectName.press("Tab")
  await expectVisibleFocus(region)
  await region.press("Enter")
  await expect(page.getByRole("listbox")).toBeVisible()
  await page.waitForTimeout(250)
  await expectNoSeriousAxeViolations(page, "open region selection")
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("Enter")
  await expect(region).toContainText("Americas")
  await expect(region).toBeFocused()

  const weeklySummary = page.getByRole("checkbox", {
    name: "Include a weekly summary",
  })
  await region.press("Tab")
  await expectVisibleFocus(weeklySummary)
  await weeklySummary.press("Space")
  await expect(weeklySummary).toBeChecked()

  const review = page.getByRole("button", { name: "Review settings" })
  await weeklySummary.press("Tab")
  await expectVisibleFocus(review)
  await review.press("Enter")
  const projectReview = page.getByRole("dialog", { name: "Project review" })
  await expect(projectReview).toBeVisible()
  await projectReview.evaluate(async (element) => {
    await Promise.all(
      element.getAnimations().map((animation) => animation.finished)
    )
  })
  await expectNoSeriousAxeViolations(page, "open project review")
  await page.keyboard.press("Escape")
  await expect(projectReview).toBeHidden()
  await expectVisibleFocus(review)

  const reviewStep = page.getByRole("button", {
    name: /Review Confirm choices/,
  })
  await reviewStep.focus()
  await reviewStep.press("Enter")
  await expect(reviewStep).toHaveAttribute("aria-current", "step")
  await expect(page.getByText("Current step: review")).toBeVisible()
  await page
    .getByRole("button", { name: /Details Project basics Completed/ })
    .click()
  await expect(page.getByText("Current step: details")).toBeVisible()
  await expect(
    page.getByRole("navigation", { name: "Workflow" }).getByText("Completed")
  ).toHaveCount(3)

  const overviewTab = page.getByRole("tab", { name: "Overview" })
  const activityTab = page.getByRole("tab", { name: "Activity" })
  await overviewTab.focus()
  await overviewTab.press("ArrowRight")
  await expect(activityTab).toBeFocused()
  await activityTab.press("Enter")
  await expect(activityTab).toHaveAttribute("aria-selected", "true")
  await expect(page.getByText("Recent activity is ready.")).toBeVisible()
  await expectNoSeriousAxeViolations(page, "exercised controls")
})

test("nested horizontal scroll hands the wheel back to the page at its boundaries", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 500 })
  await page.reload()
  await page.evaluate(() => {
    document.querySelector("main")?.style.setProperty("padding-bottom", "300px")
  })

  const workflow = page.getByRole("navigation", { name: "Workflow" })
  await workflow.scrollIntoViewIfNeeded()
  await workflow.evaluate((element) => {
    element.scrollLeft = 0
  })
  await workflow.hover()

  const pageBeforeContainedScroll = await page.evaluate(() => window.scrollY)
  await page.mouse.wheel(0, 180)
  await expect
    .poll(() => workflow.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0)
  expect(await page.evaluate(() => window.scrollY)).toBe(
    pageBeforeContainedScroll
  )

  await workflow.evaluate((element) => {
    element.scrollLeft = element.scrollWidth - element.clientWidth
  })
  const pageBeforeEndBoundary = await page.evaluate(() => window.scrollY)
  await page.mouse.wheel(0, 180)
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(pageBeforeEndBoundary)

  await workflow.evaluate((element) => {
    element.scrollLeft = 0
  })
  const pageBeforeStartBoundary = await page.evaluate(() => window.scrollY)
  await page.mouse.wheel(0, -180)
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeLessThan(pageBeforeStartBoundary)
})

for (const width of [320, 390, 768, 1440]) {
  test(`${width}px keeps required actions reachable without page overflow`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.reload()

    const overflow = await page.evaluate(
      () =>
        Math.max(
          document.documentElement.scrollWidth,
          document.body.scrollWidth
        ) - window.innerWidth
    )
    expect(overflow).toBeLessThanOrEqual(1)

    for (const action of [
      page.getByRole("button", { name: "Review settings" }),
      page.getByRole("button", { name: "Continue", exact: true }),
      page.getByRole("button", { name: /Complete Ready to continue/ }),
      page.getByRole("tab", { name: "Activity" }),
    ]) {
      await action.scrollIntoViewIfNeeded()
      await expect(action).toBeVisible()
      const box = await action.boundingBox()
      expect(box).not.toBeNull()
      expect(box!.x).toBeGreaterThanOrEqual(0)
      expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1)
    }

    await page.goto("/?view=foundations")
    const userMenu = page.getByRole("button", {
      name: "Nextide Operator menu",
    })
    await expect(userMenu).toBeVisible()
    const userMenuBox = await userMenu.boundingBox()
    expect(userMenuBox).not.toBeNull()
    expect(userMenuBox!.x).toBeGreaterThanOrEqual(0)
    expect(userMenuBox!.x + userMenuBox!.width).toBeLessThanOrEqual(width + 1)
  })
}
