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

test("campaign schedule edits preserve days, cancellation, and independent split bookings", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/?view=web-mining")
  const matrix = page.locator('[data-slot="campaign-schedule-matrix"]')
  const timeline = matrix.getByRole("region", {
    name: "Campaign schedule timeline",
  })
  const booking = matrix.locator('[data-booking-id="booking-1"]')
  const move = booking.getByRole("button", { name: "Launch read", exact: true })
  await move.focus()
  await move.press("ArrowRight")
  await expect(booking).toHaveAttribute("data-start-index", "5")
  await move.press("Escape")
  await expect(booking).toHaveAttribute("data-start-index", "4")
  await move.press("ArrowRight")
  await move.press("Enter")
  await expect(booking).toHaveAttribute("data-end-index", "19")
  const end = booking.getByRole("button", { name: "Resize end of Launch read" })
  await end.focus()
  await end.press("ArrowLeft")
  await end.press("Enter")
  await expect(booking).toHaveAttribute("data-end-index", "18")
  const start = booking.getByRole("button", {
    name: "Resize start of Launch read",
  })
  await start.focus()
  await start.press("ArrowLeft")
  await start.press("Enter")
  await expect(booking).toHaveAttribute("data-start-index", "4")
  await start.press("ArrowLeft")
  await start.press("Enter")
  await expect(booking).toHaveAttribute("data-start-index", "4")

  await booking.getByRole("button", { name: "Cut Launch read" }).click()
  await move.press("ArrowLeft")
  await move.press("Enter")
  const row = matrix
    .locator('[data-slot="campaign-schedule-board-row"]')
    .first()
  const pieces = row.locator('[data-slot="campaign-schedule-booking"]')
  await expect(pieces).toHaveCount(2)
  await expect(pieces.nth(0)).toHaveAttribute("data-start-index", "4")
  await expect(pieces.nth(0)).toHaveAttribute("data-end-index", "10")
  await expect(pieces.nth(1)).toHaveAttribute("data-start-index", "11")
  await expect(pieces.nth(1)).toHaveAttribute("data-end-index", "18")
  await pieces
    .nth(1)
    .getByRole("button", { name: "Launch read", exact: true })
    .press("ArrowRight")
  await pieces
    .nth(1)
    .getByRole("button", { name: "Launch read", exact: true })
    .press("Enter")
  await expect(pieces.nth(1)).toHaveAttribute("data-start-index", "12")
  await expect(pieces.nth(1)).toHaveAttribute("data-end-index", "19")
  await expect(pieces.nth(0)).toHaveAttribute("data-end-index", "10")

  await timeline.evaluate((element) => {
    element.scrollLeft = 0
  })
  const unit = await row.evaluate(
    (element) => element.getBoundingClientRect().width / 91
  )
  const body = pieces
    .nth(1)
    .getByRole("button", { name: "Launch read", exact: true })
  await dragBy(page, body, unit * 2, 0)
  await expect(pieces.nth(1)).toHaveAttribute("data-start-index", "14")
  await expect(pieces.nth(1)).toHaveAttribute("data-end-index", "21")
  expect(await timeline.evaluate((element) => element.scrollLeft)).toBe(0)
  await dragBy(
    page,
    pieces.nth(1).getByRole("button", { name: "Resize end of Launch read" }),
    unit,
    0
  )
  await expect(pieces.nth(1)).toHaveAttribute("data-end-index", "22")
  await dragBy(page, body, unit * 2, 0, true)
  await expect(pieces.nth(1)).toHaveAttribute("data-start-index", "14")

  await verifyCreatorReorder(page, matrix)
  await expectNoSeriousAxeViolations(
    page,
    "editable schedule",
    '[data-slot="campaign-schedule-matrix"]'
  )
})

test("campaign schedule preserves an empty board and contained editing at every viewport", async ({
  page,
}) => {
  await page.goto("/?view=web-mining")
  const matrix = page.locator('[data-slot="campaign-schedule-matrix"]')
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page
      .getByRole("button", { name: "Clear creators", exact: true })
      .click()
    await expect(matrix.locator('[data-placeholder="true"]')).toHaveCount(5)
    await expect(
      matrix.locator('[data-slot="campaign-schedule-creator-legend"]')
    ).toHaveCount(0)
    const emptyHeight = await matrix
      .getByRole("region")
      .evaluate((element) => element.clientHeight)
    await page
      .getByRole("button", { name: "Restore creators", exact: true })
      .click()
    expect(
      await matrix
        .getByRole("region")
        .evaluate((element) => element.clientHeight)
    ).toBe(emptyHeight)
    const body = matrix
      .locator('[data-booking-id="booking-1"]')
      .getByRole("button", { name: "Launch read", exact: true })
    await body.focus()
    await body.press("ArrowRight")
    await body.press("Escape")
    await expect(
      matrix.locator('[data-booking-id="booking-1"]')
    ).toHaveAttribute("data-start-index", "4")
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth
      )
    ).toBeLessThanOrEqual(1)
    await matrix.screenshot({ path: `output/schedule-${width}.png` })
  }
})

async function dragBy(
  page: Page,
  locator: Locator,
  x: number,
  y: number,
  cancel = false
) {
  const box = await locator.boundingBox()
  expect(box).not.toBeNull()
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
  await page.mouse.down()
  await page.mouse.move(
    box!.x + box!.width / 2 + x,
    box!.y + box!.height / 2 + y,
    { steps: 5 }
  )
  if (cancel) await page.keyboard.press("Escape")
  await page.mouse.up()
}

async function verifyCreatorReorder(page: Page, matrix: Locator) {
  const handle = matrix.getByRole("button", { name: "Reorder Mina Vale" })
  await handle.press("ArrowDown")
  await handle.press("Escape")
  await expect(
    matrix.locator('[data-slot="campaign-schedule-creator-legend"]').first()
  ).toContainText("Mina Vale")
  await handle.press("ArrowDown")
  await handle.press("Enter")
  await expect(
    matrix.locator('[data-slot="campaign-schedule-creator-legend"]').first()
  ).toContainText("Ren Kade")
  await dragBy(page, handle, 0, 64)
  await expect(
    matrix.locator('[data-slot="campaign-schedule-creator-legend"]').nth(2)
  ).toContainText("Mina Vale")
}

test("campaign scissors cancel without changes and cut at complete-day boundaries", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/?view=web-mining")
  const booking = page.locator('[data-booking-id="booking-1"]')
  const cut = booking.getByRole("button", { name: "Cut Launch read" })
  await cut.focus()
  await cut.press("Enter")
  await expect(booking).toHaveAttribute("data-cutting", "true")
  await page.keyboard.press("Escape")
  await expect(booking).not.toHaveAttribute("data-cutting", "true")
  await expect(
    page.locator('[data-slot="campaign-schedule-booking"]')
  ).toHaveCount(4)
  await cut.click()
  await page
    .getByRole("button", { name: "Clear creators", exact: true })
    .focus()
  await page.getByRole("button", { name: "Expand schedule" }).click()
  await page.getByRole("button", { name: "Close expanded schedule" }).click()
  await expect(booking).not.toHaveAttribute("data-cutting", "true")
  await cut.click()
  await page.keyboard.press("Home")
  await page.keyboard.press("Enter")
  const row = booking.locator("..")
  const pieces = row.locator('[data-slot="campaign-schedule-booking"]')
  await expect(pieces).toHaveCount(2)
  await expect(pieces.first()).toHaveAttribute("data-end-index", "4")
  await expect(pieces.nth(1)).toHaveAttribute("data-start-index", "5")
  await expect(pieces.nth(1)).toHaveAttribute("data-end-index", "18")
  // A one-day piece remains pointer-movable without another booking's controls covering it.
  const unit = await row.evaluate(
    (element) => element.getBoundingClientRect().width / 91
  )
  await dragBy(
    page,
    pieces.first().getByRole("button", { name: "Launch read", exact: true }),
    unit,
    0
  )
  await expect(pieces.first()).toHaveAttribute("data-start-index", "5")
  await expect(pieces.first()).toHaveAttribute("data-end-index", "5")
})

test("schedule blur cancels pointer edits and resize leaves keyboard selection available", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/?view=web-mining")
  await page.getByRole("button", { name: "Enable booking selection" }).click()
  const booking = page.locator('[data-booking-id="booking-1"]')
  const body = booking.getByRole("button", { name: "Launch read", exact: true })
  await body.scrollIntoViewIfNeeded()
  await page
    .getByRole("region", { name: "Campaign schedule timeline" })
    .evaluate((element) => {
      element.scrollLeft = 0
    })
  const unit = await booking
    .locator("..")
    .evaluate((element) => element.getBoundingClientRect().width / 91)
  const box = await body.boundingBox()
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
  await page.mouse.down()
  await page.mouse.move(
    box!.x + box!.width / 2 + unit * 2,
    box!.y + box!.height / 2,
    { steps: 5 }
  )
  await expect(booking).toHaveAttribute("data-start-index", "6")
  await page.keyboard.press("Tab")
  await expect(booking).toHaveAttribute("data-start-index", "4")
  await page.mouse.up()
  await expect(booking).toHaveAttribute("data-start-index", "4")
  await expect(booking).toHaveAttribute("data-end-index", "18")
  await dragBy(
    page,
    booking.getByRole("button", { name: "Resize end of Launch read" }),
    unit,
    0
  )
  await expect(booking).toHaveAttribute("data-end-index", "19")
  await expect(body).toHaveAttribute("aria-pressed", "false")
  await body.focus()
  await body.press("Enter")
  await expect(body).toHaveAttribute("aria-pressed", "true")
  const handle = page.getByRole("button", { name: "Reorder Mina Vale" })
  const handleBox = await handle.boundingBox()
  await page.mouse.move(
    handleBox!.x + handleBox!.width / 2,
    handleBox!.y + handleBox!.height / 2
  )
  await page.mouse.down()
  await page.mouse.move(
    handleBox!.x + handleBox!.width / 2,
    handleBox!.y + handleBox!.height / 2 + 64
  )
  await page.keyboard.press("Tab")
  await page.mouse.up()
  await expect(
    page.locator('[data-slot="campaign-schedule-creator-legend"]').first()
  ).toContainText("Mina Vale")
})

test("expanded schedule keeps one editor, view state, and scissors work at every viewport", async ({
  page,
}) => {
  await page.goto("/?view=web-mining")
  const timeline = page.getByRole("region", {
    name: "Campaign schedule timeline",
  })
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await timeline.evaluate((element) => {
      element.scrollLeft = 64
    })
    await page.getByRole("button", { name: "Expand schedule" }).click()
    const dialog = page.getByRole("dialog", { name: "Campaign schedule" })
    await expect(dialog).toBeVisible()
    await dialog.screenshot({ path: `output/schedule-expanded-${width}.png` })
    await expect(timeline).toHaveCount(1)
    await expect(timeline).toHaveAttribute("data-zoom", "week")
    await dialog.getByRole("button", { name: "Zoom in" }).click()
    await expect(timeline).toHaveAttribute("data-zoom", "day")
    await dialog.getByRole("button", { name: "Zoom out" }).click()
    await expect(timeline).toHaveAttribute("data-zoom", "week")
    const booking = dialog.locator('[data-booking-id="booking-1"]')
    await booking.getByRole("button", { name: "Cut Launch read" }).focus()
    await page.keyboard.press("Enter")
    await expect(booking).toHaveAttribute("data-cutting", "true")
    await page.keyboard.press("Escape")
    await expect(dialog).toBeVisible()
    await expect(booking).not.toHaveAttribute("data-cutting", "true")
    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    await expect(
      page.getByRole("button", { name: "Expand schedule" })
    ).toBeFocused()
    await expect(timeline).toHaveCount(1)
    const row = page
      .locator('[data-slot="campaign-schedule-board-row"]')
      .first()
    await row.dispatchEvent("wheel", { deltaY: 60 })
    await expect(timeline).toHaveAttribute("data-zoom", "month")
    await page.getByRole("button", { name: "Zoom in" }).click()
    await expect(timeline).toHaveAttribute("data-zoom", "week")
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth
      )
    ).toBeLessThanOrEqual(1)
  }
})

test("scissors snap pointer cuts and leaving a booking cancels without selection", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/?view=web-mining")
  const matrix = page.locator('[data-slot="campaign-schedule-matrix"]')
  const booking = matrix.locator('[data-booking-id="booking-1"]')
  const cut = booking.getByRole("button", { name: "Cut Launch read" })
  await cut.click()
  await matrix.getByRole("heading", { name: "Campaign schedule" }).click()
  await expect(booking).not.toHaveAttribute("data-cutting", "true")
  await expect(
    matrix.locator('[data-slot="campaign-schedule-booking"]')
  ).toHaveCount(4)
  await cut.click()
  await matrix.getByRole("region").evaluate((element) => {
    element.scrollLeft = 0
  })
  const rect = await booking.boundingBox()
  const x = rect!.x + (rect!.width * 7.1) / 15
  const y = rect!.y + rect!.height / 2
  await page.mouse.move(x, y)
  await expect(
    booking.locator('[data-slot="campaign-cut-boundary"]')
  ).toHaveText("Cut before 2026-05-22")
  await page.mouse.click(x, y)
  await expect(booking).not.toHaveAttribute("data-cutting", "true")
  await expect(booking).toHaveAttribute("data-end-index", "10")
  const right = booking
    .locator("..")
    .locator('[data-slot="campaign-schedule-booking"]')
    .nth(1)
  await expect(right).toHaveAttribute("data-start-index", "11")
  await expect(right).toHaveAttribute("data-end-index", "18")
  await expect(
    booking.getByRole("button", { name: "Launch read", exact: true })
  ).not.toHaveAttribute("aria-pressed")
})

test("schedule removal respects reduced motion and keeps the five-row floor", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/?view=web-mining")
  const matrix = page.locator('[data-slot="campaign-schedule-matrix"]')
  const height = await matrix
    .getByRole("region")
    .evaluate((element) => element.clientHeight)
  await page
    .getByRole("button", { name: "Clear creators", exact: true })
    .click()
  await expect(matrix.locator('[data-exiting="true"]')).toHaveCount(0)
  await expect(matrix.locator('[data-placeholder="true"]')).toHaveCount(5)
  expect(
    await matrix.getByRole("region").evaluate((element) => element.clientHeight)
  ).toBe(height)
  await page
    .getByRole("button", { name: "Restore creators", exact: true })
    .click()
  await expect(
    matrix.locator('[data-slot="campaign-schedule-creator-row"]')
  ).toHaveCount(4)
  expect(
    await matrix.getByRole("region").evaluate((element) => element.clientHeight)
  ).toBe(height)
  const moving = await matrix.evaluate(
    (element) =>
      element
        .getAnimations({ subtree: true })
        .filter((animation) => animation.playState === "running").length
  )
  expect(moving).toBe(0)
})
