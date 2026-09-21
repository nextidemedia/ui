import { expect, test } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.goto("/?view=report")
  await page.getByRole("button", { name: /Primitives/ }).click()
})

test("currency edits retain formatting, cents, and the caret", async ({
  page,
}) => {
  const input = page.getByRole("textbox", { name: "Budget (USD)" })
  await input.fill("")
  await input.pressSequentially("1234.05")
  await expect(input).toHaveValue("$1,234.05")
  await input.press("Home")
  await input.press("ArrowRight")
  await input.press("ArrowRight")
  await input.pressSequentially("9")
  await expect(input).toHaveValue("$19,234.05")
  await input.press("Backspace")
  await expect(input).toHaveValue("$1,234.05")

  await input.evaluate((element: HTMLInputElement) => {
    element.setSelectionRange(3, 6)
  })
  await input.pressSequentially("56")
  await expect(input).toHaveValue("$156.05")
  await input.press("ControlOrMeta+A")
  await input.press("Backspace")
  await expect(input).toHaveValue("")
  await input.pressSequentially(".05")
  await expect(input).toHaveValue("$.05")
  await input.blur()
  await expect(input).toHaveValue("$0.05")
  await input.fill("12.")
  await expect(input).toHaveValue("$12.")
  await input.pressSequentially("30")
  await expect(input).toHaveValue("$12.30")
  await input.pressSequentially("9")
  await expect(input).toHaveValue("$12.30")
})

test("paste, large decimal strings, and both control modes work", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"])
  const input = page.getByRole("textbox", { name: "Budget (USD)" })
  await page.evaluate(() => navigator.clipboard.writeText("$9,876.54"))
  await input.focus()
  await input.press("ControlOrMeta+A")
  await input.press("ControlOrMeta+V")
  await expect(input).toHaveValue("$9,876.54")
  await page.evaluate(() => navigator.clipboard.writeText("12"))
  await input.evaluate((element: HTMLInputElement) =>
    element.setSelectionRange(3, 6)
  )
  await input.press("ControlOrMeta+V")
  await expect(input).toHaveValue("$912.54")
  await input.pressSequentially("3")
  await expect(input).toHaveValue("$9,123.54")
  await input.fill("9007199254740993.01")
  await input.blur()
  await expect(input).toHaveValue("$9,007,199,254,740,993.01")
  const cpm = page.getByRole("textbox", { name: "CPM (USD)" })
  await cpm.fill("0.01")
  await cpm.blur()
  await expect(cpm).toHaveValue("$0.01")

  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    await input.scrollIntoViewIfNeeded()
    const bounds = await input.boundingBox()
    expect(bounds).not.toBeNull()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width)
  }
})
