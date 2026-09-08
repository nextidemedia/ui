import { expect, test, type Locator, type Page } from "@playwright/test"
import {
  expectVisibleFocus,
  expectNoSeriousAxeViolations,
  openQualification,
} from "./qualification-helpers"

test.beforeEach(openQualification)

test("campaign schedule interactions start only inside the board", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/?view=web-mining")

  const matrix = page.locator('[data-slot="campaign-schedule-matrix"]')
  const timeline = matrix.getByRole("region", {
    name: "Campaign schedule timeline",
  })
  const topLegend = matrix.locator('[data-slot="campaign-schedule-top-legend"]')
  const creatorLegend = matrix
    .locator('[data-slot="campaign-schedule-creator-legend"]')
    .first()
  const boardRow = matrix
    .locator('[data-slot="campaign-schedule-board-row"]')
    .first()

  await timeline.scrollIntoViewIfNeeded()
  await expect(timeline).toHaveAttribute("data-zoom", "week")
  await timeline.evaluate((element) => {
    element.scrollLeft = 300
  })
  const startingScrollLeft = await timeline.evaluate(
    (element) => element.scrollLeft
  )

  await topLegend.hover()
  await page.mouse.wheel(120, 0)
  expect(await timeline.evaluate((element) => element.scrollLeft)).toBe(
    startingScrollLeft
  )
  await creatorLegend.hover()
  await page.mouse.wheel(120, 0)
  expect(await timeline.evaluate((element) => element.scrollLeft)).toBe(
    startingScrollLeft
  )
  await boardRow.hover()
  await page.mouse.wheel(120, 0)
  await expect
    .poll(() => timeline.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(startingScrollLeft)

  await timeline.evaluate((element) => {
    element.scrollLeft = 300
  })
  await boardRow.hover()
  await page.keyboard.down("Shift")
  await page.mouse.wheel(0, 120)
  await page.keyboard.up("Shift")
  await expect
    .poll(() => timeline.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(300)
  await expect(timeline).toHaveAttribute("data-zoom", "week")

  await timeline.evaluate((element) => {
    element.scrollLeft = 300
  })
  await expectScheduleDragBoundary(page, creatorLegend, boardRow, timeline)

  await topLegend.dispatchEvent("wheel", { deltaY: 60 })
  await expect(timeline).toHaveAttribute("data-zoom", "week")
  await creatorLegend.dispatchEvent("wheel", { deltaY: 60 })
  await expect(timeline).toHaveAttribute("data-zoom", "week")
  const zoomConsumed = await boardRow.evaluate((element) =>
    element.dispatchEvent(
      new WheelEvent("wheel", {
        bubbles: true,
        cancelable: true,
        deltaY: 60,
      })
    )
  )
  expect(zoomConsumed).toBe(false)
  await expect(timeline).toHaveAttribute("data-zoom", "month")
  const boundaryHandedOff = await boardRow.evaluate((element) =>
    element.dispatchEvent(
      new WheelEvent("wheel", {
        bubbles: true,
        cancelable: true,
        deltaY: 60,
      })
    )
  )
  expect(boundaryHandedOff).toBe(true)
})

test("duration picker optionally supports days and confirms on blur or Enter", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 })
  await page.goto("/?view=report")
  await page.getByRole("button", { name: /Primitives/ }).click()

  const picker = page.locator('[data-slot="duration-picker"]')
  const output = page.locator('[data-slot="duration-picker-output"]')
  const edit = picker.getByRole("button", { name: "Edit duration" })
  await edit.scrollIntoViewIfNeeded()
  await expect(
    page.locator('[data-component-name="DurationPicker"]').first()
  ).toBeVisible()
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 800 })
    const pickerBox = await picker.boundingBox()
    const outputBox = await output.boundingBox()
    expect(pickerBox).not.toBeNull()
    expect(outputBox).not.toBeNull()
    expect(outputBox!.y).toBeGreaterThanOrEqual(
      pickerBox!.y + pickerBox!.height
    )
  }
  await page.setViewportSize({ width: 390, height: 800 })
  const reportName = page.getByRole("textbox", { name: "Report name" })
  const days = picker.getByRole("textbox", { name: "Days" })
  const hours = picker.getByRole("textbox", { name: "Hours" })
  const minutes = picker.getByRole("textbox", { name: "Minutes" })

  await picker.locator('[data-slot="duration-picker-field"]').first().click()
  await expect(picker).toHaveAttribute("data-editing", "true")
  await expect(days).toBeFocused()
  await expect(picker).toHaveAttribute("data-edit-settled", "false")
  await expect(days.locator("..")).toHaveCSS("box-shadow", "none")
  await expect(picker).toHaveAttribute("data-edit-settled", "true")
  await expect(days.locator("..")).not.toHaveCSS("box-shadow", "none")
  await days.fill("4")
  await reportName.click()
  await expect(picker).toHaveAttribute("data-editing", "false")
  await expect(reportName).toBeFocused()
  await expect(output).toHaveText("4 d 2 hr 33 min")

  await page.getByRole("checkbox", { name: "Include degraded runs" }).focus()
  await page.keyboard.press("Shift+Tab")
  await expectVisibleFocus(edit)
  await edit.press("Enter")

  await expect(picker).toHaveAttribute("data-editing", "true")
  await expect(days).toBeFocused()
  await days.fill("999")
  await expect(days).toHaveValue("365")
  await days.press("Tab")
  await expect(hours.locator("..")).not.toHaveCSS("box-shadow", "none")
  await hours.fill("4")
  await hours.press("Tab")
  await expect(minutes).toBeFocused()
  await expect(minutes.locator("..")).not.toHaveCSS("box-shadow", "none")
  await minutes.fill("61")
  await expect(minutes).toHaveValue("59")
  await minutes.press("Enter")

  await expect(picker).toHaveAttribute("data-editing", "false")
  await expectVisibleFocus(
    picker.getByRole("button", { name: "Edit duration" })
  )
  await expect(output).toHaveText("365 d 4 hr 59 min")
  await expectNoSeriousAxeViolations(
    page,
    "confirmed duration",
    '[data-slot="duration-picker"]'
  )
})

test("live proof modal keeps audio actionable in the shared dialog shell", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/?view=web-mining")

  const openProof = page.getByRole("button", { name: "Open proof modal" })
  await openProof.scrollIntoViewIfNeeded()
  await openProof.click()

  const proof = page.getByRole("dialog", {
    name: "Competitor mention under threshold",
  })
  await expect(proof).toBeVisible()
  await expect(proof).toHaveAttribute("data-dialog-content", "")
  await proof.evaluate(async (element) => {
    await Promise.all(
      element.getAnimations().map((animation) => animation.finished)
    )
  })
  const timelineCenterOffset = await proof
    .locator('[data-slot="live-event-proof-timeline-marker"]')
    .first()
    .evaluate((marker) => {
      const item = marker.parentElement!
      const itemBounds = item.getBoundingClientRect()
      const markerBounds = marker.getBoundingClientRect()
      return Math.abs(
        Number.parseFloat(getComputedStyle(item, "::after").left) -
          (markerBounds.left - itemBounds.left + markerBounds.width / 2)
      )
    })
  expect(timelineCenterOffset).toBeLessThanOrEqual(0.5)
  const playAudio = proof.getByRole("button", { name: "Play audio proof" })
  const audioRow = playAudio.locator("..")
  await playAudio.click()
  await expect(proof.getByText("Audio proof started.")).toBeVisible()

  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        )
    )
    const box = await proof.evaluate((element) => {
      const bounds = element.getBoundingClientRect()
      const style = getComputedStyle(element)
      return {
        x: bounds.x,
        width: bounds.width,
        viewportWidth: window.innerWidth,
        cssWidth: style.width,
        maxWidth: style.maxWidth,
      }
    })
    expect(
      box.x,
      JSON.stringify({ viewport: width, ...box })
    ).toBeGreaterThanOrEqual(0)
    expect(
      box.x + box.width,
      JSON.stringify({ viewport: width, ...box })
    ).toBeLessThanOrEqual(width + 1)
    const audioWidth = await audioRow.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }))
    expect(
      audioWidth.scrollWidth,
      JSON.stringify({ viewport: width, ...audioWidth })
    ).toBeLessThanOrEqual(audioWidth.clientWidth + 1)
  }

  await page.keyboard.press("Escape")
  await expect(proof).toBeHidden()
  await expect(openProof).toBeFocused()
})

async function expectScheduleDragBoundary(
  page: Page,
  creatorLegend: Locator,
  boardRow: Locator,
  timeline: Locator
) {
  const creatorLegendBox = await creatorLegend.boundingBox()
  const boardRowBox = await boardRow.boundingBox()
  expect(creatorLegendBox).not.toBeNull()
  expect(boardRowBox).not.toBeNull()

  await page.mouse.move(
    creatorLegendBox!.x + creatorLegendBox!.width / 2,
    creatorLegendBox!.y + creatorLegendBox!.height / 2
  )
  await page.mouse.down()
  await page.mouse.move(
    creatorLegendBox!.x + creatorLegendBox!.width / 2 - 100,
    creatorLegendBox!.y + creatorLegendBox!.height / 2
  )
  await page.mouse.up()
  expect(await timeline.evaluate((element) => element.scrollLeft)).toBe(300)

  await page.mouse.move(
    boardRowBox!.x + boardRowBox!.width / 2,
    boardRowBox!.y + boardRowBox!.height / 2
  )
  await page.mouse.down()
  await page.mouse.move(
    boardRowBox!.x + boardRowBox!.width / 2 - 100,
    boardRowBox!.y + boardRowBox!.height / 2
  )
  await page.mouse.up()
  await expect
    .poll(() => timeline.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(300)
}
