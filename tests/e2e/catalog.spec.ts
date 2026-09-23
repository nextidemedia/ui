import { expect, test } from "@playwright/test"
import {
  expectNoSeriousAxeViolations,
  openQualification,
} from "./qualification-helpers"

test.beforeEach(openQualification)

test("scramble text reveals changed labels and respects reduced motion", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Math.random = () => 0
  })
  await page.goto("/?view=report")
  await page.getByRole("button", { name: /Primitives/ }).click()
  const reference = page.locator('[data-component-name="ScrambleText"]')
  const example = reference.locator("xpath=..").locator("xpath=..")
  const visual = example.locator('[aria-hidden="true"]')
  await expect(visual).toHaveText("Every · minutes")
  await page.clock.install()
  await page.clock.pauseAt(new Date())
  await example.getByRole("button", { name: "Change label" }).click()
  await expect(example.locator(".sr-only")).toHaveText(
    "Trigger Cooldown · minutes"
  )
  await page.clock.runFor(30)
  await expect(visual).toHaveText("TriAAAA AAAAAAAA · AAAAAAA")
  await page.clock.runFor(300)
  await expect(visual).toHaveText("Trigger Cooldown · minutes")

  await page.emulateMedia({ reducedMotion: "reduce" })
  await example.getByRole("button", { name: "Change label" }).click()
  await expect(visual).toHaveText("Every · minutes")
})

test("looping carousel preserves edited slides when reordered", async ({
  page,
}) => {
  await page.goto("/?view=report")
  await page.getByRole("button", { name: /Primitives/ }).click()
  const track = page.locator('[data-slot="carousel-content"]')
  const slides = track.locator(':scope > [data-slot="carousel-item"]')
  const note = slides.getByRole("textbox", { name: "Campaign delivery note" })
  await note.fill("Keep this draft")
  await page.getByRole("button", { name: "Reverse slides" }).click()
  await expect(slides.first()).toContainText("Safety review")
  await expect(note).toHaveValue("Keep this draft")
})

test("playground shows exact public names beside component examples", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto("/?view=report")

  const expectComponentReferences = async (names: readonly string[]) => {
    for (const name of names) {
      await expect(
        page.locator(`[data-component-name="${name}"]`).first()
      ).toBeVisible()
    }
  }

  await page.getByRole("button", { name: /Primitives/ }).click()
  await expectComponentReferences(primitiveReferences)
  const openDialog = page.getByRole("button", { name: "Open dialog" })
  await openDialog.click()
  const dialog = page.getByRole("dialog", { name: "Review report scope" })
  await expect(dialog).toBeVisible()
  await expect(dialog).toHaveAttribute("data-dialog-content", "")
  await expectNoSeriousAxeViolations(page, "shared dialog", "[role=dialog]")
  await page.keyboard.press("Escape")
  await expect(dialog).toBeHidden()
  await expect(openDialog).toBeFocused()

  const segmented = page.getByRole("group", { name: "Segmented control" })
  const compactSegment = segmented.getByRole("button", { name: "Compact" })
  const comfortSegment = segmented.getByRole("button", { name: "Comfort" })
  await compactSegment.click()
  await compactSegment.press("ArrowRight")
  await expect(comfortSegment).toBeFocused()
  await expect(compactSegment).toHaveAttribute("aria-pressed", "true")
  await expect(comfortSegment).toHaveAttribute("aria-pressed", "false")
  const segmentedLayers = await segmented.evaluate((element) => ({
    focused: Number.parseInt(
      getComputedStyle(element.querySelector(":focus")!).zIndex,
      10
    ),
    overlay: Number.parseInt(
      getComputedStyle(
        element.querySelector('[data-slot="segmented-control-label-overlay"]')!
      ).zIndex,
      10
    ),
  }))
  expect(segmentedLayers.focused).toBeLessThan(segmentedLayers.overlay)

  const carouselPrevious = page.getByRole("button", {
    name: "Previous slide",
  })
  const carouselNext = page.getByRole("button", { name: "Next slide" })
  await expect(carouselPrevious).toHaveCSS("border-style", "solid")
  await expect(carouselNext).toHaveCSS("border-style", "solid")
  expect(
    await carouselPrevious.evaluate(
      (element) =>
        getComputedStyle(element).backgroundColor ===
        getComputedStyle(document.body).backgroundColor
    )
  ).toBe(true)
  await expect(page.locator('[id^="carousel-demo-panel-"]')).toHaveCount(3)
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    const overflow = await page.evaluate(
      () =>
        Math.max(
          document.documentElement.scrollWidth,
          document.body.scrollWidth
        ) - window.innerWidth
    )
    expect(overflow).toBeLessThanOrEqual(1)
  }
  await page.setViewportSize({ width: 1440, height: 1000 })

  await page.getByRole("button", { name: /Patterns/ }).click()
  await expectComponentReferences(patternReferences)

  await page.getByRole("button", { name: /Daedalus/ }).click()
  await expectComponentReferences(dashboardReferences)

  await page.getByRole("button", { name: /Creator workflow/ }).click()
  await expectComponentReferences(creatorReferences)

  await page.getByRole("button", { name: /Campaign tools/ }).click()
  await expectComponentReferences(campaignReferences)

  await page.getByRole("button", { name: /Kraken operations/ }).click()
  await expectComponentReferences(krakenReferences)

  await page.getByRole("button", { name: /Report reader/ }).click()
  await expectComponentReferences(reportReferences)

  await page.getByRole("button", { name: "Settings", exact: true }).click()
  await expectComponentReferences(settingsReferences)
})

const primitiveReferences = [
  "AppShell",
  "NavigationPanel",
  "Surface",
  "Card",
  "Button",
  "Dialog",
  "Popover",
  "Tooltip",
  "ScrollArea",
  "Input",
  "DurationPicker",
  "Checkbox",
  "Switch",
  "SegmentedControl",
  "Slider",
  "Autocomplete",
  "StatusBadge",
  "Badge",
  "Notice",
  "ProcessingText",
  "ScrambleText",
  "Avatar",
  "AvatarGroup",
  "Progress",
  "Spinner",
  "Skeleton",
  "Empty",
  "Metric",
] as const

const patternReferences = [
  "AppShell",
  "NavigationPanel",
  "NavigationUserMenu",
  "Surface",
  "ProgressiveSummaryRail",
  "WorkflowStepper",
  "Metric",
  "Separator",
] as const

const dashboardReferences = [
  "SignalPlate",
  "DashboardFilterBar",
  "Metric",
  "SingleCalendarDateRangePicker",
  "DurationPicker",
  "TrendBarChart",
  "HourlyPacingChart",
  "SignalRidgeChart",
  "LineItemGraph",
  "LineGraph",
  "DonutChart",
  "ExportWorkbench",
  "LiveguardCockpit",
] as const

const creatorReferences = [
  "SignalPlate",
  "FitLeaderboard",
  "CreatorTransfer",
  "CreatorScopePanel",
  "SingleCalendarDateRangePicker",
  "CreatorFlowChart",
  "StreamSelector",
  "ReportContextBuilder",
  "IntelligenceProgressionChart",
] as const

const campaignReferences = [
  "SignalPlate",
  "CampaignScheduleMatrix",
  "PacingConfigurator",
  "ExportWorkbench",
  "LiveguardIncidentReview",
] as const

const krakenReferences = [
  "SignalPlate",
  "Metric",
  "RunMonitorTable",
  "EvidenceDrawer",
  "DataLedger",
] as const

const reportReferences = [
  "ReportRail",
  "ReportReader",
  "IntelligenceProgressionChart",
] as const

const settingsReferences = [
  "SettingsModal",
  "SettingsModalSection",
  "SelectMenu",
] as const

test("field focus stays inside the control and dropdowns preserve selection and edge alignment", async ({
  page,
}) => {
  await page.goto("/?view=report")
  await page
    .getByRole("button", { name: "Primitives Controls and states" })
    .click()
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    const brand = page.getByRole("textbox", { name: "Brand", exact: true })
    await brand.click()
    await brand.pressSequentially("Acme")
    await expect(brand).toHaveCSS("border-color", "rgb(30, 228, 188)")
    await expect(brand).not.toHaveCSS("box-shadow", /1px inset/)
    await brand.press("Tab")
    await page.keyboard.press("Shift+Tab")
    await expect(brand).toHaveCSS("border-color", "rgb(30, 228, 188)")
    await expect(brand).toHaveCSS("box-shadow", /inset/)
    const trigger = page.getByRole("combobox", { name: "Campaign time zone" })
    await trigger.focus()
    await trigger.press("Enter")
    const menu = page.locator('[data-slot="select-content"]')
    await expect(menu).toBeVisible()
    await expect(menu).toHaveCSS("opacity", "1")
    const fieldBox = (await trigger.boundingBox())!
    const menuBox = (await menu.boundingBox())!
    expect(Math.abs(menuBox.x - fieldBox.x)).toBeLessThanOrEqual(1)
    // Near the viewport edge the popup flips above the field.
    expect(
      menuBox.y >= fieldBox.y + fieldBox.height - 1 ||
        menuBox.y + menuBox.height <= fieldBox.y + 1
    ).toBe(true)
    await expect(
      page.getByRole("option", { name: "Europe/Berlin", exact: true })
    ).toHaveAttribute("aria-selected", "true")
    await page.keyboard.press("Escape")
    await expect(trigger).toBeFocused()
    await expect(trigger).toHaveCSS("box-shadow", /inset/)
    const search = page.getByRole("combobox", { name: "Find a creator" })
    await search.click()
    await search.fill("Mina")
    const group = page
      .locator('[data-slot="autocomplete-input-group"]')
      .filter({ has: search })
    await expect(group).toHaveCSS("border-color", "rgb(30, 228, 188)")
    await expect(group).not.toHaveCSS("box-shadow", /1px inset/)
    await search.press("Shift+Tab")
    await page.keyboard.press("Tab")
    await expect(group).toHaveCSS("box-shadow", /1px inset/)
    await expect(search).toHaveCSS("box-shadow", "none")
    await search.press("Escape")
    await search.fill("")
  }
})
