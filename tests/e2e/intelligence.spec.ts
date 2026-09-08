import { expect, test } from "@playwright/test"
import {
  expectNoSeriousAxeViolations,
  openQualification,
} from "./qualification-helpers"

test.beforeEach(openQualification)

test("autocomplete empty state reuses a result row footprint", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto("/?view=report")
  await page.getByRole("button", { name: /Primitives/ }).click()

  const input = page.getByRole("combobox", { name: "Find a creator" })
  const popup = page.locator('[data-slot="autocomplete-content"]')
  const list = popup.locator('[data-slot="autocomplete-list"]')
  await input.click()

  const item = popup.locator('[data-slot="autocomplete-item"]').first()
  await expect(item).toBeVisible()
  const itemBox = await item.boundingBox()
  const itemMetrics = await item.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      minHeight: style.minHeight,
      padding: style.padding,
    }
  })
  const listPadding = await list.evaluate((element) => {
    const style = getComputedStyle(element)
    return (
      Number.parseFloat(style.paddingTop) +
      Number.parseFloat(style.paddingBottom)
    )
  })

  await input.fill("no-such-creator")
  const empty = popup.locator('[data-slot="autocomplete-empty"]')
  await expect(empty).toBeVisible()
  await expect(list).toBeHidden()

  const emptyBox = await empty.boundingBox()
  const emptyPopupBox = await popup.boundingBox()
  const emptyMetrics = await empty.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      minHeight: style.minHeight,
      padding: style.padding,
    }
  })
  expect(itemBox).not.toBeNull()
  expect(emptyBox).not.toBeNull()
  expect(emptyPopupBox).not.toBeNull()
  expect(emptyMetrics).toEqual(itemMetrics)
  expect(emptyPopupBox!.height).toBeLessThanOrEqual(
    itemBox!.height + listPadding
  )
  await expectNoSeriousAxeViolations(
    page,
    "autocomplete empty state",
    '[data-slot="autocomplete-content"]'
  )
})

test("processing text follows progress state and reduced-motion preference", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 800 })
  await page.goto("/?view=report")
  await page.getByRole("button", { name: /Primitives/ }).click()

  const examples = [
    ["classic", "Classic", "Preparing your campaign report"],
    ["aurora", "Aurora", "Analyzing creator evidence"],
    ["flame", "Flame", "Generating delivery insights"],
  ] as const
  const standalone = page.getByText(examples[0][2], { exact: true })
  await standalone.scrollIntoViewIfNeeded()

  for (const [variant, label, copy] of examples) {
    await expect(
      page.getByText(`ProcessingText · ${label}`, { exact: true })
    ).toBeVisible()
    const example = page.getByText(copy, { exact: true })
    await expect(example).toHaveAttribute("data-slot", "processing-text")
    await expect(example).toHaveAttribute("data-tone", "neutral")
    await expect(example).toHaveAttribute("data-variant", variant)
    await expect(example).toHaveCSS(
      "animation-name",
      "nextide-processing-text-shimmer"
    )
  }

  const standaloneDuration = await standalone.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).animationDuration)
  )
  expect(examples[0][2].length / (standaloneDuration * 0.8)).toBeCloseTo(5, 1)

  await page.goto("/?view=intelligence")
  const progression = page.locator(
    '[data-slot="intelligence-progression-chart"]'
  )
  const activeLabel = progression.getByText("Analyze VODs", { exact: true })
  const activeDetail = progression.getByText("Creator evidence", {
    exact: true,
  })

  await expect(activeLabel).toHaveAttribute("data-slot", "processing-text")
  await expect(activeLabel).toHaveAttribute("data-tone", "processing")
  await expect(activeLabel).toHaveAttribute("data-variant", "classic")
  await expect(activeDetail).toHaveAttribute("data-slot", "processing-text")
  await expect(activeLabel).toHaveAttribute("data-sync-length", "16")
  await expect(activeDetail).toHaveAttribute("data-sync-length", "16")
  await expect(
    progression.locator('[data-slot="processing-text"]')
  ).toHaveCount(4)
  await expect(
    progression.locator('[data-slot="processing-text"]').filter({
      hasText: "Analyze chat",
    })
  ).toHaveCount(0)
  await expect(activeLabel).toHaveCSS(
    "animation-name",
    "nextide-processing-text-shimmer"
  )

  const activeDuration = await activeLabel.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).animationDuration)
  )
  const activeDetailDuration = await activeDetail.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).animationDuration)
  )
  const activePhases = await activeLabel
    .locator("..")
    .locator("..")
    .locator('[data-slot="processing-text"]')
    .evaluateAll((elements) =>
      elements.map((element) => {
        const animation = element.getAnimations()[0]
        const duration = Number(animation.effect?.getTiming().duration)
        return (Number(animation.currentTime) % duration) / duration
      })
    )
  expect(activeDetailDuration).toBe(activeDuration)
  expect(activePhases).toHaveLength(2)
  expect(Math.abs(activePhases[0] - activePhases[1])).toBeLessThan(0.01)
  expect("Creator evidence".length / (activeDuration * 0.8)).toBeCloseTo(5, 1)
  expect(standaloneDuration).toBeGreaterThan(activeDuration)
  await expectNoSeriousAxeViolations(
    page,
    "processing progression",
    '[data-slot="intelligence-progression-chart"]'
  )

  await page.emulateMedia({ reducedMotion: "reduce" })
  await expect(activeLabel).toHaveCSS("animation-name", "none")
  expect(
    await activeLabel.evaluate((element) => getComputedStyle(element).color)
  ).not.toBe("rgba(0, 0, 0, 0)")
})

test("playground session reports reverse cleanly and Kraken evidence tabs reflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto("/?view=web-mining")

  const sessionLedger = page
    .locator('[data-slot="data-ledger"]')
    .filter({ hasText: "Session reports" })
  const sessionToggle = sessionLedger.getByRole("button", {
    name: "3 sessions",
  })
  const ledgerBody = sessionLedger.locator(":scope > div[aria-hidden]")
  await sessionToggle.scrollIntoViewIfNeeded()
  await expect(ledgerBody).toBeVisible()
  await expect(ledgerBody).toHaveCount(1)

  await sessionToggle.click()
  await expect(sessionLedger).toHaveAttribute("data-collapsed", "true")
  await expect(ledgerBody).toHaveCSS("transform", "none")
  await expect(ledgerBody).toBeHidden()
  await expect(ledgerBody).toHaveCount(1)

  await sessionToggle.click()
  await expect(sessionLedger).toHaveAttribute("data-collapsed", "false")
  await expect(ledgerBody).toHaveCSS("transform", "none")
  await expect(ledgerBody).toBeVisible()
  await expect(ledgerBody).toHaveCount(1)

  await page.goto("/?view=kraken-mining")
  const evidenceDrawer = page.locator('[data-slot="evidence-drawer"]')
  await evidenceDrawer.scrollIntoViewIfNeeded()
  const choices = ["Decisions", "Sources", "Costs"].map((name) =>
    evidenceDrawer.getByRole("button", { name })
  )
  const boxes = await Promise.all(choices.map((choice) => choice.boundingBox()))

  for (const box of boxes) {
    expect(box).not.toBeNull()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(321)
  }
  expect(boxes[0]!.x + boxes[0]!.width).toBeLessThanOrEqual(boxes[1]!.x)
  expect(boxes[1]!.x + boxes[1]!.width).toBeLessThanOrEqual(boxes[2]!.x)

  await choices[0].focus()
  await page.keyboard.press("ArrowRight")
  await expect(choices[1]).toBeFocused()
  await page.keyboard.press("Enter")
  await expect(choices[1]).toHaveAttribute("aria-pressed", "true")
  await expect(
    evidenceDrawer.getByText("Monitor cache warmed").first()
  ).toBeVisible()

  const overflow = await page.evaluate(
    () =>
      Math.max(
        document.documentElement.scrollWidth,
        document.body.scrollWidth
      ) - window.innerWidth
  )
  expect(overflow).toBeLessThanOrEqual(1)

  await page.goto("/?view=report-mining")
  const reportRail = page.locator('[data-slot="report-rail"]')
  await expect(reportRail).toHaveAttribute("data-selection", "outline")
  await expect(
    page.getByRole("radiogroup", { name: "Report history selection style" })
  ).toHaveCount(0)
  const activeReport = reportRail.locator('button[aria-pressed="true"]')
  await expect(activeReport).toHaveCount(1)
  await expect(activeReport).toHaveCSS("border-style", "solid")
})

test("playground queues creator and context changes without losing updates", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/?view=intelligence")

  const creatorTransfer = page.locator('[data-slot="creator-transfer"]')
  const taro = creatorTransfer.getByRole("button", {
    name: "TA Taro YouTube - scheduled",
  })
  const ivy = creatorTransfer.getByRole("button", {
    name: "IN Ivy North Twitch - partner",
  })

  await taro.click()
  await ivy.click()
  await expect(
    creatorTransfer.getByRole("heading", { name: "Added creators (4)" })
  ).toBeVisible()

  const creatorScope = page.locator('[data-slot="creator-scope-panel"]').first()
  await expect(creatorScope.locator("button button")).toHaveCount(0)
  const disabledCreator = creatorScope.getByRole("button", {
    name: /RK Ren Kade/,
  })
  await expect(disabledCreator).toBeDisabled()
  await expect(
    creatorScope.getByRole("checkbox", { name: "Override Ren Kade" })
  ).toHaveCount(0)
  await disabledCreator.evaluate((element: HTMLButtonElement) =>
    element.click()
  )
  await expect(
    creatorScope.getByRole("button", { name: "All creators" })
  ).toHaveAttribute("aria-pressed", "true")

  const streamSelector = page.locator('[data-slot="stream-selector"]')
  const disabledStream = streamSelector.getByRole("button", {
    name: /Sponsored challenge slot/,
  })
  await expect(disabledStream).toBeDisabled()
  await disabledStream.evaluate((element: HTMLButtonElement) => element.click())
  await expect(disabledStream).toHaveAttribute("aria-pressed", "true")

  const contextBuilder = page.locator('[data-slot="report-context-builder"]')
  const contextRows = contextBuilder.locator(":scope > section")
  const brandRow = contextRows.filter({
    has: page.getByText("Brand", { exact: true }),
  })
  const productRow = contextRows.filter({
    has: page.getByText("Products", { exact: true }),
  })
  const disabledRow = contextRows.filter({
    has: page.getByText("Special phrases", { exact: true }),
  })
  const normalRow = contextRows.filter({
    has: page.getByText("Competing brands", { exact: true }),
  })

  await brandRow.getByRole("button", { name: "Nextide", exact: true }).click()
  await expect(
    brandRow.getByRole("button", { name: "Daedalus", exact: true })
  ).toBeEnabled()
  await expect(
    brandRow.getByRole("button", { name: "Nextide", exact: true })
  ).toBeDisabled()
  await expect(
    productRow.getByRole("button", { name: "Creator roster", exact: true })
  ).toBeDisabled()
  await expect(
    disabledRow.getByRole("button", { name: "brand-safe", exact: true })
  ).toBeDisabled()
  await normalRow.getByRole("button", { name: "Orbit", exact: true }).click()
  await normalRow
    .getByRole("button", { name: "Nova Media", exact: true })
    .click()
  await normalRow.getByRole("button", { name: "Add", exact: true }).click()
  await expect(
    page.getByText("Add requested for Competing brands.")
  ).toBeVisible()

  const streamList = streamSelector.locator(".nextide-scrollbar-none")
  await expect(streamList).toHaveCSS("scrollbar-width", "none")
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth
      )
    ).toBeLessThanOrEqual(1)
  }
  await page.emulateMedia({ reducedMotion: "reduce" })
  await expect(contextBuilder).toBeVisible()

  const progression = page.locator(
    '[data-slot="intelligence-progression-chart"]'
  )
  await expect(progression.locator("linearGradient")).toHaveCount(7)
  await expect(progression.locator('mask ellipse[fill="black"]')).toHaveCount(7)
  await expect(progression.locator('g[mask^="url("]')).toHaveCount(1)
  await expect(
    progression.locator('path.nextide-flow-line[stroke^="url("]')
  ).toHaveCount(7)
  await expect(progression.locator("div.absolute.z-20")).toHaveCount(7)
})
