import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Locator, type Page } from "@playwright/test"

async function expectVisibleFocus(locator: Locator) {
  await expect(locator).toBeFocused()
  await expect
    .poll(() =>
      locator.evaluate((element) => {
        const style = getComputedStyle(element)
        return style.outlineStyle !== "none" || style.boxShadow !== "none"
      })
    )
    .toBe(true)
}

async function expectNoSeriousAxeViolations(page: Page, state: string) {
  const results = await new AxeBuilder({ page }).analyze()
  const violations = results.violations.filter(
    ({ impact }) => impact === "serious" || impact === "critical"
  )

  expect(
    violations,
    `${state}: ${JSON.stringify(violations, null, 2)}`
  ).toEqual([])
}

test.beforeEach(async ({ page }) => {
  await page.goto("/qualification")
  await expect(
    page.getByRole("heading", { level: 1, name: "Workspace setup" })
  ).toBeVisible()
})

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
  await expect(
    page.getByRole("dialog", { name: "Project review" })
  ).toBeVisible()
  await expectNoSeriousAxeViolations(page, "open project review")
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("dialog", { name: "Project review" })
  ).toBeHidden()
  await expectVisibleFocus(review)

  const reviewStep = page.getByRole("button", {
    name: /Review Confirm choices/,
  })
  await reviewStep.focus()
  await reviewStep.press("Enter")
  await expect(reviewStep).toHaveAttribute("aria-current", "step")
  await expect(page.getByText("Current step: review")).toBeVisible()

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
  })
}
