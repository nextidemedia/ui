import { expect, test } from "@playwright/test"
import {
  expectNoSeriousAxeViolations,
  openQualification,
} from "./qualification-helpers"

test.beforeEach(openQualification)

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
