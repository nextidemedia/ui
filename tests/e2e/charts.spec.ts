import { expect, test, type Locator, type Page } from "@playwright/test"
import {
  expectNoSeriousAxeViolations,
  openQualification,
} from "./qualification-helpers"

test.beforeEach(openQualification)

test("dashboard filter bar scrolls campaigns and disables clear without a selection", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/?view=daedalus")

  const filterBar = page.locator('[data-slot="dashboard-filter-bar"]')
  const carousel = filterBar.locator('[data-slot="dashboard-filter-carousel"]')
  const scopeAction = filterBar.locator(
    '[data-slot="dashboard-filter-scope-action"]'
  )
  const slider = filterBar.locator('[data-slot="dashboard-filter-slider"]')
  const scroller = filterBar.locator('[data-slot="dashboard-filter-scroll"]')
  const effectLayer = filterBar.locator(
    '[data-slot="dashboard-filter-effect-layer"]'
  )
  const fade = filterBar.locator('[data-slot="dashboard-filter-fade"]')
  const startFade = filterBar.locator(
    '[data-slot="dashboard-filter-fade-start"]'
  )
  const clearFilter = filterBar.getByRole("button", { name: "Clear filter" })
  const scope = filterBar.getByRole("combobox", {
    name: "Scope: Campaigns",
  })

  await expectFilterSizing(page, scroller, scope, clearFilter)

  await expect(scroller.getByRole("button")).toHaveCount(10)
  await expect(carousel).toHaveCSS("background-color", "rgba(0, 0, 0, 0)")
  await expect(scopeAction).toHaveCSS("background-color", "rgba(0, 0, 0, 0)")
  await expect(scope).toHaveCSS("background-color", "rgba(0, 0, 0, 0)")
  await expect(scope).toHaveCSS("border-color", "rgba(255, 255, 255, 0.15)")
  await expect(scope).toHaveCSS("color", "rgb(250, 250, 250)")
  const selectedCampaign = scroller.getByRole("button").first()
  const nextCampaign = scroller.getByRole("button").nth(1)
  await expect(effectLayer).toBeVisible()
  await expect(effectLayer).toHaveClass(/nextide-effect-layer/)
  await expect(effectLayer).toHaveCSS("position", "absolute")
  await expect(effectLayer).toHaveCSS("z-index", "1")
  expect(
    await effectLayer.evaluate((element) => getComputedStyle(element).boxShadow)
  ).toContain("rgba(30, 228, 188, 0.18) 0px 0px 28px 0px")
  await expect(nextCampaign).toHaveCSS("z-index", "auto")
  await expect(slider).toHaveCSS("overflow", "visible")

  const selectedCampaignBox = await selectedCampaign.boundingBox()
  const effectLayerBox = await effectLayer.boundingBox()
  const sliderBox = await slider.boundingBox()
  expect(selectedCampaignBox).not.toBeNull()
  expect(effectLayerBox).not.toBeNull()
  expect(sliderBox).not.toBeNull()
  expect(Math.abs(effectLayerBox!.x - selectedCampaignBox!.x)).toBeLessThan(1)
  expect(Math.abs(effectLayerBox!.y - selectedCampaignBox!.y)).toBeLessThan(1)
  expect(
    Math.abs(effectLayerBox!.width - selectedCampaignBox!.width)
  ).toBeLessThan(1)
  expect(
    Math.abs(effectLayerBox!.height - selectedCampaignBox!.height)
  ).toBeLessThan(1)
  expect(effectLayerBox!.x - sliderBox!.x).toBeLessThan(28)
  await expect(startFade).toHaveCSS("opacity", "0")
  await expect(fade).toHaveCSS("opacity", "1")

  await scope.click()
  const selectedScopeOption = page.getByRole("option", {
    name: "Campaigns 10 available",
  })
  const otherScopeOption = page.getByRole("option", {
    name: "Creators 2 available",
  })
  await expect(scope).toHaveCSS("background-color", "rgb(30, 228, 188)")
  await expect(scope).toHaveCSS("color", "rgb(0, 0, 0)")
  await expect(selectedScopeOption).toHaveCSS("color", "rgb(30, 228, 188)")
  await otherScopeOption.hover()
  await expect(selectedScopeOption).toHaveCSS("color", "rgb(30, 228, 188)")
  await selectedScopeOption.hover()
  await expect(selectedScopeOption).toHaveCSS("color", "rgb(30, 228, 188)")
  await page.keyboard.press("Escape")

  await scroller.hover()
  await page.mouse.wheel(0, 600)
  await expect
    .poll(() => scroller.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0)
  await expect(startFade).toHaveCSS("opacity", "1")

  await scroller.evaluate((element) => {
    element.scrollLeft = element.scrollWidth
  })
  await expect(fade).toHaveCSS("opacity", "0")

  await clearFilter.click()
  await expect(clearFilter).toBeDisabled()
  await expect(effectLayer).toBeHidden()
  await expectNoSeriousAxeViolations(
    page,
    "dashboard filter bar without a selection",
    '[data-slot="dashboard-filter-bar"]'
  )
})

test("signal ridge and impression details share compact overview and exact detail", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/?view=daedalus")

  const ridge = page.locator('[data-slot="signal-ridge-chart"]')
  await expect(ridge).toHaveCount(1)
  await ridge.scrollIntoViewIfNeeded()
  const ridgePoint = ridge.locator('g[role="img"]').first()
  await ridgePoint.focus()
  const tooltip = page.locator('[data-slot="graph-tooltip"]')
  await expect(tooltip).toBeVisible()
  await expect(ridge.locator('g[role="button"]')).toHaveCount(0)
  const workspace = ridge.locator("xpath=ancestor::main")
  const initialScrollTop = await workspace.evaluate(
    (element) => element.scrollTop
  )
  await workspace.evaluate((element) => {
    const maxScrollTop = element.scrollHeight - element.clientHeight
    element.scrollTop += element.scrollTop < maxScrollTop ? 1 : -1
  })
  await expect
    .poll(() => workspace.evaluate((element) => element.scrollTop))
    .not.toBe(initialScrollTop)
  await expect(tooltip).toBeHidden()

  const impressions = page
    .locator('[data-slot="line-item-graph"]')
    .filter({ has: page.getByRole("heading", { name: "Banner impressions" }) })
  const graphViewport = impressions.locator(
    '[data-slot="line-item-graph-viewport"]'
  )
  const graphCanvas = impressions.locator(
    '[data-slot="line-item-graph-canvas"]'
  )
  const viewportBox = await graphViewport.boundingBox()
  const canvasBox = await graphCanvas.boundingBox()
  expect(viewportBox).not.toBeNull()
  expect(canvasBox).not.toBeNull()
  expect(Math.abs(viewportBox!.width - canvasBox!.width)).toBeLessThanOrEqual(1)
  const hiddenSeries = impressions.getByRole("button", {
    name: "Immersive frame impressions",
    exact: true,
  })
  const hiddenSeriesPoint = impressions
    .getByRole("img", { name: /^Immersive frame impressions / })
    .first()
  await hiddenSeriesPoint.focus()
  await expect(tooltip).toContainText("Immersive frame impressions")
  await hiddenSeries.evaluate((element) => (element as HTMLElement).click())
  await expect(hiddenSeries).toHaveAttribute("aria-pressed", "false")
  await expect(tooltip).toBeHidden()
  const hoverZones = impressions.locator("svg > rect")
  await hoverZones.first().hover()
  await expect(tooltip).toContainText("Day breakdown")
  await expect(tooltip).not.toContainText("Immersive frame impressions")
  await expectTooltipAnchorMovesWithoutRemeasuring(page, tooltip, hoverZones)

  const lastPoint = impressions.getByRole("img").last()
  await lastPoint.focus()

  await expect(
    impressions.locator('[data-slot="line-item-hover-guide"]')
  ).toHaveCount(1)
  await expect(tooltip).toBeVisible()
  expect(
    await tooltip.evaluate((element) => element.parentElement === document.body)
  ).toBe(true)
  const tooltipBox = await tooltip.boundingBox()
  expect(tooltipBox).not.toBeNull()
  expect(tooltipBox!.x).toBeGreaterThanOrEqual(8)
  expect(tooltipBox!.y).toBeGreaterThanOrEqual(8)
  expect(tooltipBox!.x + tooltipBox!.width).toBeLessThanOrEqual(1432)
  expect(tooltipBox!.y + tooltipBox!.height).toBeLessThanOrEqual(892)
  await expect(tooltip).toContainText(/\d{1,3}(,\d{3})+/)
  await lastPoint.press("Tab")
  await expect(tooltip).toBeHidden()
  await expect(
    impressions.locator('[data-slot="line-item-hover-guide"]')
  ).toHaveCount(0)
})

async function expectFilterSizing(
  page: Page,
  scroller: Locator,
  scope: Locator,
  clearFilter: Locator
) {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    const overflow = await page.evaluate(
      () =>
        Math.max(
          document.documentElement.scrollWidth,
          document.body.scrollWidth
        ) - window.innerWidth
    )
    expect(overflow).toBeLessThanOrEqual(1)
    expect(
      await scroller.evaluate(
        (element) => element.scrollWidth > element.clientWidth
      )
    ).toBe(true)
  }

  const scopeBox = await scope.boundingBox()
  const scopeIconBox = await scope.locator("svg").first().boundingBox()
  const clearFilterBox = await clearFilter.boundingBox()
  expect(scopeBox).not.toBeNull()
  expect(scopeIconBox).not.toBeNull()
  expect(clearFilterBox).not.toBeNull()
  expect(
    Math.abs(
      scopeIconBox!.x +
        scopeIconBox!.width / 2 -
        (scopeBox!.x + scopeBox!.width / 2)
    )
  ).toBeLessThanOrEqual(0.5)
  expect(
    Math.abs(scopeBox!.height - clearFilterBox!.height)
  ).toBeLessThanOrEqual(1)
  expect(Math.abs(scopeBox!.width - clearFilterBox!.width)).toBeLessThanOrEqual(
    1
  )
}

async function expectTooltipAnchorMovesWithoutRemeasuring(
  page: Page,
  tooltip: Locator,
  hoverZones: Locator
) {
  await page.waitForTimeout(32)
  await tooltip.evaluate((element) => {
    const fail = () => {
      throw new Error("Anchor movement repeated tooltip measurement setup")
    }
    Object.defineProperties(element, {
      offsetWidth: { configurable: true, get: fail },
      offsetHeight: { configurable: true, get: fail },
    })
    Reflect.set(window, "graphTooltipResizeObserver", window.ResizeObserver)
    window.ResizeObserver = class {
      constructor() {
        fail()
      }
    } as typeof ResizeObserver
  })
  const translateBefore = await tooltip.evaluate(
    (element) => element.style.translate
  )
  for (const index of [1, 2, 3]) await hoverZones.nth(index).hover()
  await expect
    .poll(() => tooltip.evaluate((element) => element.style.translate))
    .not.toBe(translateBefore)
  await tooltip.evaluate((element) => {
    for (const property of ["offsetWidth", "offsetHeight"])
      Reflect.deleteProperty(element, property)
    window.ResizeObserver = Reflect.get(window, "graphTooltipResizeObserver")
  })
}
