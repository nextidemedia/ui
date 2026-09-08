import AxeBuilder from "@axe-core/playwright"
import { expect, type Locator, type Page } from "@playwright/test"

export async function expectVisibleFocus(locator: Locator) {
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

export async function expectNoSeriousAxeViolations(
  page: Page,
  state: string,
  include?: string
) {
  const builder = new AxeBuilder({ page })
  const results = await (include ? builder.include(include) : builder).analyze()
  const violations = results.violations.filter(
    ({ impact }) => impact === "serious" || impact === "critical"
  )

  expect(
    violations,
    `${state}: ${JSON.stringify(violations, null, 2)}`
  ).toEqual([])
}

export async function openQualification({ page }: { page: Page }) {
  await page.goto("/qualification")
  await expect(
    page.getByRole("heading", { level: 1, name: "Workspace setup" })
  ).toBeVisible()
}
