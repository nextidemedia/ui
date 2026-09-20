import { expect, test } from "@playwright/test"
import { expectNoSeriousAxeViolations } from "./qualification-helpers"

test("hourly pacing stays readable with optional summaries hidden", async ({
  page,
}, testInfo) => {
  await page.goto("/?view=report")
  await page.getByRole("button", { name: /Daedalus/ }).click()
  const chart = page.locator('[data-slot="hourly-pacing-chart"]')
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    await chart.scrollIntoViewIfNeeded()
    await expect(chart.getByText(/^Avg /)).toHaveCount(0)
    await expect(chart.getByText("Select an hour for detail")).toHaveCount(0)
    await expect(chart.getByText("303%", { exact: true })).toHaveCount(0)
    const topTick = await chart.getByText("350%", { exact: true }).boundingBox()
    const nextTick = await chart
      .getByText("100%", { exact: true })
      .boundingBox()
    expect(topTick).not.toBeNull()
    expect(nextTick!.y).toBeGreaterThan(topTick!.y + topTick!.height)
    const plot = await chart.locator(".nextide-contained-scroll").boundingBox()
    expect(plot!.height).toBeLessThanOrEqual(192)
    expect(topTick!.y).toBeGreaterThanOrEqual(plot!.y)
    const zeroTick = await chart.getByText("0%", { exact: true }).boundingBox()
    expect(zeroTick!.y + zeroTick!.height).toBeLessThanOrEqual(
      plot!.y + plot!.height
    )
    await chart.screenshot({ path: testInfo.outputPath(`pacing-${width}.png`) })
    const firstHour = chart.getByRole("button", {
      name: "00:00 pacing 70% · 70% · overnight floor",
    })
    await firstHour.focus()
    await expect(firstHour).toBeFocused()
    await firstHour.press("Tab")
    await expect(
      chart.getByRole("button", { name: /^01:00 pacing/ })
    ).toBeFocused()
    const lastHour = chart.getByRole("button", { name: /^23:00 pacing/ })
    await lastHour.focus()
    await expect(lastHour).toBeInViewport()
    expect(
      await chart.evaluate((element) => element.getBoundingClientRect().right)
    ).toBeLessThanOrEqual(width)
  }
  await expectNoSeriousAxeViolations(
    page,
    "pacing chart",
    '[data-slot="hourly-pacing-chart"]'
  )

  await page.goto("/?view=web-mining")
  await expect(chart.getByText(/^Avg /)).toBeVisible()
  await expect(chart.getByText("Select an hour for detail")).toBeVisible()
  expect(
    (await chart.locator(".nextide-contained-scroll").boundingBox())!.height
  ).toBe(320)
})
