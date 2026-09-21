import { expect, test } from "@playwright/test"
import { expectVisibleFocus, openQualification } from "./qualification-helpers"

test.beforeEach(openQualification)

test("flow calendar selects without editing and edits only when enabled", async ({
  page,
}) => {
  const calendar = page.getByRole("region", { name: "Campaign calendar" })
  const session = calendar.getByRole("button", { name: "Autumn launch" })
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(
      await calendar.evaluate(
        (element) => element.scrollWidth - element.clientWidth
      )
    ).toBeLessThanOrEqual(1)
    const bounds = await session.boundingBox()
    const calendarBounds = await calendar.boundingBox()
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(
      calendarBounds!.x + calendarBounds!.width
    )
    await calendar.screenshot({ path: `output/flow-calendar-${width}.png` })
  }
  const originalLeft = await session.evaluate((element) => element.style.left)
  const originalWidth = await session.evaluate((element) => element.style.width)
  const bounds = await session.boundingBox()
  await page.mouse.move(
    bounds!.x + bounds!.width / 2,
    bounds!.y + bounds!.height / 2
  )
  await page.mouse.down()
  await page.mouse.move(
    bounds!.x + bounds!.width,
    bounds!.y + bounds!.height / 2
  )
  await page.mouse.up()
  expect(await session.evaluate((element) => element.style.left)).toBe(
    originalLeft
  )
  expect(await session.evaluate((element) => element.style.width)).toBe(
    originalWidth
  )
  await session.focus()
  await page.keyboard.press("Enter")
  await expect(page.getByLabel("Selected campaign")).toHaveText("Autumn launch")
  await expectVisibleFocus(session)
  await page.getByRole("button", { name: "Edit calendar", exact: true }).click()
  const editableBounds = await session.boundingBox()
  await page.mouse.move(
    editableBounds!.x + editableBounds!.width / 2,
    editableBounds!.y + editableBounds!.height / 2
  )
  await page.mouse.down()
  await page.mouse.move(
    editableBounds!.x + editableBounds!.width,
    editableBounds!.y + editableBounds!.height / 2
  )
  await page.mouse.up()
  expect(await session.evaluate((element) => element.style.left)).toBe("25%")
  expect(await session.evaluate((element) => element.style.width)).toBe(
    originalWidth
  )
  const movedBounds = await session.boundingBox()
  await page.mouse.move(
    movedBounds!.x + movedBounds!.width - 6,
    movedBounds!.y + movedBounds!.height / 2
  )
  await page.mouse.down()
  await page.mouse.move(
    movedBounds!.x + movedBounds!.width * 1.5 - 6,
    movedBounds!.y + movedBounds!.height / 2
  )
  await page.mouse.up()
  expect(await session.evaluate((element) => element.style.left)).toBe("25%")
  expect(await session.evaluate((element) => element.style.width)).toBe("75%")
})

test("flow calendar pans stable rows with sticky labels and dates", async ({
  page,
}) => {
  const calendar = page.getByRole("region", { name: "Pannable calendar" })
  const viewport = calendar.locator('[data-slot="creator-flow-viewport"]')
  const creator = calendar.locator('[data-slot="creator-flow-creator"]').first()
  const header = calendar.locator('[data-slot="creator-flow-header"]')
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await calendar.scrollIntoViewIfNeeded()
    await expect
      .poll(() => viewport.evaluate((el) => el.scrollLeft))
      .toBeGreaterThan(0)
    const original = await creator.boundingBox()
    const headerBefore = await header.boundingBox()
    const node = await creator.elementHandle()
    const leftBefore = await viewport.evaluate((el) => el.scrollLeft)
    await page.getByRole("button", { name: "Next calendar week" }).click()
    await expect
      .poll(() => viewport.evaluate((el) => el.scrollLeft))
      .toBeGreaterThan(leftBefore + 5)
    expect(await node!.evaluate((el) => el.isConnected)).toBe(true)
    expect((await creator.boundingBox())!.x).toBeCloseTo(original!.x, 0)
    await viewport.evaluate((el) => {
      el.scrollTop = 50
    })
    expect((await header.boundingBox())!.y).toBeCloseTo(headerBefore!.y, 0)
    await viewport.evaluate((el) => {
      el.scrollTop = 0
    })
    const session = calendar.getByRole("button", {
      name: "Campaign 1",
      exact: true,
    })
    await session.click()
    await expect(page.getByLabel("Panned campaign")).toHaveText("Campaign 1")
    const draggedSession = calendar.getByRole("button", {
      name: "Campaign 2",
      exact: true,
    })
    const box = await draggedSession.boundingBox()
    const left = await viewport.evaluate((el) => el.scrollLeft)
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
    await page.mouse.down()
    await page.mouse.move(
      box!.x + box!.width / 2 + 35,
      box!.y + box!.height / 2 - 25,
      { steps: 5 }
    )
    await page.mouse.up()
    expect(await viewport.evaluate((el) => el.scrollLeft)).toBeLessThan(left)
    expect(await viewport.evaluate((el) => el.scrollTop)).toBeGreaterThan(0)
    await expect(page.getByLabel("Panned campaign")).toHaveText("Campaign 1")
    expect((await creator.boundingBox())!.x).toBeCloseTo(original!.x, 0)
    await calendar.screenshot({ path: `output/flow-viewport-${width}.png` })
  }
})
