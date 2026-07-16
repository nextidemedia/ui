import AxeBuilder from "@axe-core/playwright"
import { expect, test, type Locator, type Page } from "@playwright/test"

async function expectVisibleFocus(locator: Locator) {
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

async function expectNoSeriousAxeViolations(
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

test.beforeEach(async ({ page }) => {
  await page.goto("/qualification")
  await expect(
    page.getByRole("heading", { level: 1, name: "Workspace setup" })
  ).toBeVisible()
})

test("public controls and block are keyboard operable and accessible", async ({
  page,
}) => {
  await expectNoSeriousAxeViolations(page, "default state")

  const projectName = page.getByRole("textbox", { name: "Project name" })
  await projectName.focus()
  await expectVisibleFocus(projectName)
  await projectName.fill("Campaign launch")

  const region = page.getByRole("combobox", { name: "Delivery region" })
  await projectName.press("Tab")
  await expectVisibleFocus(region)
  await region.press("Enter")
  await expect(page.getByRole("listbox")).toBeVisible()
  await page.waitForTimeout(250)
  await expectNoSeriousAxeViolations(page, "open region selection")
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("Enter")
  await expect(region).toContainText("Americas")
  await expect(region).toBeFocused()

  const weeklySummary = page.getByRole("checkbox", {
    name: "Include a weekly summary",
  })
  await region.press("Tab")
  await expectVisibleFocus(weeklySummary)
  await weeklySummary.press("Space")
  await expect(weeklySummary).toBeChecked()

  const review = page.getByRole("button", { name: "Review settings" })
  await weeklySummary.press("Tab")
  await expectVisibleFocus(review)
  await review.press("Enter")
  const projectReview = page.getByRole("dialog", { name: "Project review" })
  await expect(projectReview).toBeVisible()
  await projectReview.evaluate(async (element) => {
    await Promise.all(
      element.getAnimations().map((animation) => animation.finished)
    )
  })
  await expectNoSeriousAxeViolations(page, "open project review")
  await page.keyboard.press("Escape")
  await expect(projectReview).toBeHidden()
  await expectVisibleFocus(review)

  const reviewStep = page.getByRole("button", {
    name: /Review Confirm choices/,
  })
  await reviewStep.focus()
  await reviewStep.press("Enter")
  await expect(reviewStep).toHaveAttribute("aria-current", "step")
  await expect(page.getByText("Current step: review")).toBeVisible()

  const overviewTab = page.getByRole("tab", { name: "Overview" })
  const activityTab = page.getByRole("tab", { name: "Activity" })
  await overviewTab.focus()
  await overviewTab.press("ArrowRight")
  await expect(activityTab).toBeFocused()
  await activityTab.press("Enter")
  await expect(activityTab).toHaveAttribute("aria-selected", "true")
  await expect(page.getByText("Recent activity is ready.")).toBeVisible()
  await expectNoSeriousAxeViolations(page, "exercised controls")
})

test("nested horizontal scroll hands the wheel back to the page at its boundaries", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 500 })
  await page.reload()
  await page.evaluate(() => {
    document.querySelector("main")?.style.setProperty("padding-bottom", "300px")
  })

  const workflow = page.getByRole("navigation", { name: "Workflow" })
  await workflow.scrollIntoViewIfNeeded()
  await workflow.evaluate((element) => {
    element.scrollLeft = 0
  })
  await workflow.hover()

  const pageBeforeContainedScroll = await page.evaluate(() => window.scrollY)
  await page.mouse.wheel(0, 180)
  await expect
    .poll(() => workflow.evaluate((element) => element.scrollLeft))
    .toBeGreaterThan(0)
  expect(await page.evaluate(() => window.scrollY)).toBe(
    pageBeforeContainedScroll
  )

  await workflow.evaluate((element) => {
    element.scrollLeft = element.scrollWidth - element.clientWidth
  })
  const pageBeforeEndBoundary = await page.evaluate(() => window.scrollY)
  await page.mouse.wheel(0, 180)
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(pageBeforeEndBoundary)

  await workflow.evaluate((element) => {
    element.scrollLeft = 0
  })
  const pageBeforeStartBoundary = await page.evaluate(() => window.scrollY)
  await page.mouse.wheel(0, -180)
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeLessThan(pageBeforeStartBoundary)
})

for (const width of [320, 390, 768, 1440]) {
  test(`${width}px keeps required actions reachable without page overflow`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.reload()

    const overflow = await page.evaluate(
      () =>
        Math.max(
          document.documentElement.scrollWidth,
          document.body.scrollWidth
        ) - window.innerWidth
    )
    expect(overflow).toBeLessThanOrEqual(1)

    for (const action of [
      page.getByRole("button", { name: "Review settings" }),
      page.getByRole("button", { name: "Continue", exact: true }),
      page.getByRole("button", { name: /Complete Ready to continue/ }),
      page.getByRole("tab", { name: "Activity" }),
    ]) {
      await action.scrollIntoViewIfNeeded()
      await expect(action).toBeVisible()
      const box = await action.boundingBox()
      expect(box).not.toBeNull()
      expect(box!.x).toBeGreaterThanOrEqual(0)
      expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1)
    }
  })
}

test("playground keeps control sizing, Typeset presets, and sidebar motion coherent", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/?view=foundations")

  const inspect = page.getByRole("button", { name: "Inspect" })
  const settings = page.getByRole("button", { name: "Settings" })
  const inspectBox = await inspect.boundingBox()
  const settingsBox = await settings.boundingBox()
  expect(inspectBox).not.toBeNull()
  expect(settingsBox).not.toBeNull()
  expect(settingsBox!.height).toBe(inspectBox!.height)

  await page.getByRole("radio", { name: "Report" }).click()
  const typesetArticle = page.locator("article.typeset")
  await expect(typesetArticle).toHaveCSS("font-size", "17px")
  await expect(typesetArticle).toHaveCSS("line-height", "29.75px")

  const typesetSelector = page.getByRole("radiogroup", {
    name: "Typeset preset",
  })
  await expect(typesetSelector).toHaveAttribute(
    "data-slot",
    "segmented-control"
  )
  await expect(
    typesetSelector.locator(
      ':scope > [data-slot="segmented-control-indicator"]'
    )
  ).toHaveCSS("box-shadow", "none")

  const shell = page.locator('[data-slot="app-shell"]')
  const mainSidebar = page
    .locator('[data-slot="navigation-panel-frame"]')
    .first()
  const brandText = mainSidebar.locator('[data-slot="sidebar-brand-text"]')
  const commandRow = mainSidebar.locator(
    '[data-slot="navigation-panel-command-row"]'
  )
  const activeNavItem = mainSidebar.locator('nav button[aria-current="page"]')
  const search = mainSidebar.locator(
    '[data-slot="navigation-panel-command-control"]'
  )
  const searchInput = mainSidebar.getByRole("combobox", {
    name: "Search library",
  })
  const toggle = mainSidebar.locator('[data-slot="sidebar-toggle"]')
  await expect(toggle).toHaveAccessibleName("Collapse sidebar")
  const shortcut = search.getByText("CTRL K", { exact: true })
  const searchBox = await search.boundingBox()
  const toggleBox = await toggle.boundingBox()
  const shortcutBox = await shortcut.boundingBox()
  const commandRowBox = await commandRow.boundingBox()

  expect(searchBox).not.toBeNull()
  expect(toggleBox).not.toBeNull()
  expect(shortcutBox).not.toBeNull()
  expect(commandRowBox).not.toBeNull()
  expect(toggleBox!.height).toBe(searchBox!.height)
  expect(toggleBox!.width).toBe(toggleBox!.height)
  expect(searchBox!.width).toBeGreaterThan(toggleBox!.width * 3)
  expect(toggleBox!.x - (searchBox!.x + searchBox!.width)).toBeCloseTo(8, 0)
  expect(toggleBox!.x + toggleBox!.width - commandRowBox!.x).toBeCloseTo(
    commandRowBox!.width,
    0
  )
  expect(
    searchBox!.x + searchBox!.width - (shortcutBox!.x + shortcutBox!.width)
  ).toBeGreaterThanOrEqual(8)

  const userMenu = mainSidebar.getByRole("button", {
    name: "Nextide Operator menu",
  })
  await userMenu.click()
  const userMenuContent = page.locator('[data-slot="dropdown-menu-content"]')
  await expect(userMenuContent).toBeVisible()
  await expect(
    userMenuContent.getByRole("menuitem", { name: "Settings" })
  ).toBeVisible()
  await expect(
    userMenuContent.getByRole("menuitem", { name: "Logout" })
  ).toBeVisible()
  await expectNoSeriousAxeViolations(
    page,
    "open navigation user menu",
    '[data-slot="dropdown-menu-content"]'
  )
  await page.keyboard.press("Escape")
  await expect(userMenuContent).toBeHidden()
  await expectVisibleFocus(userMenu)

  await searchInput.fill("Foundations")
  await expect(searchInput).toHaveValue("Foundations")
  await expect(mainSidebar).toHaveAttribute("data-collapsed", "false")
  await toggle.focus()
  await toggle.press("Enter")
  await expect(searchInput).toHaveValue("")
  expect(
    await mainSidebar.evaluate((element) => ({
      collapsed: element.getAttribute("data-collapsed"),
      drawerCollapsed: element.getAttribute("data-drawer-collapsed"),
    }))
  ).toEqual({ collapsed: "false", drawerCollapsed: "true" })
  await expect(shell).toHaveAttribute("data-collapsed", "true")

  await page.waitForTimeout(100)
  const stageOne = await mainSidebar.evaluate((element) => {
    const shell = document.querySelector('[data-slot="app-shell"]')
    const row = element.querySelector(
      '[data-slot="navigation-panel-command-row"]'
    )
    const searchControl = element.querySelector(
      '[data-slot="navigation-panel-command-control"]'
    )
    const toggleButton = element.querySelector(
      'button[aria-label="Expand sidebar"]'
    )
    const activeItem = element.querySelector('nav button[aria-current="page"]')

    return {
      shellWidth:
        element.closest("aside")?.getBoundingClientRect().width ??
        (shell
          ? Number.parseFloat(getComputedStyle(shell).gridTemplateColumns)
          : 0),
      rowHeight: row?.getBoundingClientRect().height ?? 0,
      searchY: searchControl?.getBoundingClientRect().y ?? 0,
      toggleY: toggleButton?.getBoundingClientRect().y ?? 0,
      activeItemHeight: activeItem?.getBoundingClientRect().height ?? 0,
    }
  })
  expect(stageOne.shellWidth).toBeGreaterThan(72)
  expect(stageOne.shellWidth).toBeLessThan(288)
  expect(stageOne.rowHeight).toBeGreaterThan(44)
  expect(stageOne.rowHeight).toBeLessThan(96)
  expect(Math.abs(stageOne.searchY - stageOne.toggleY)).toBeLessThanOrEqual(2)
  expect(stageOne.activeItemHeight).toBeCloseTo(44, 0)

  await expect(mainSidebar).toHaveAttribute("data-collapsed", "true")
  await expect(shell).toHaveCSS("grid-template-columns", /72px [0-9.]+px/)
  await expect(brandText).toHaveCSS("opacity", "0")
  await expect(brandText).toHaveCount(1)

  const expand = mainSidebar.getByRole("button", { name: "Expand sidebar" })
  await expect(expand).toBeVisible()
  const expandBox = await expand.boundingBox()
  const collapsedSearchBox = await search.boundingBox()
  const collapsedRowBox = await commandRow.boundingBox()
  expect(expandBox).not.toBeNull()
  expect(collapsedSearchBox).not.toBeNull()
  expect(collapsedRowBox).not.toBeNull()
  expect(expandBox!.width).toBe(44)
  expect(expandBox!.height).toBe(44)
  expect(collapsedSearchBox!.width).toBe(44)
  expect(collapsedSearchBox!.height).toBe(44)
  expect(Math.abs(collapsedSearchBox!.x - expandBox!.x)).toBeLessThanOrEqual(2)
  expect(
    collapsedSearchBox!.y - (expandBox!.y + expandBox!.height)
  ).toBeCloseTo(6, 0)
  expect(collapsedRowBox!.height).toBe(94)
  await expect(expand).toBeFocused()

  await expand.click()
  expect(
    await mainSidebar.evaluate((element) => ({
      collapsed: element.getAttribute("data-collapsed"),
      drawerCollapsed: element.getAttribute("data-drawer-collapsed"),
    }))
  ).toEqual({ collapsed: "false", drawerCollapsed: "false" })
  await expect(mainSidebar).toHaveAttribute("data-collapsed", "false")
  await expect(mainSidebar).toHaveAttribute("data-drawer-collapsed", "false")
  await expect(shell).toHaveCSS("grid-template-columns", /288px [0-9.]+px/)
  await expect(brandText).toHaveCSS("opacity", "1")
  await expect(brandText).toHaveCount(1)
  await expect(
    mainSidebar.getByRole("button", { name: "Collapse sidebar" })
  ).toBeFocused()

  const stagedDurations = await mainSidebar.evaluate((element) => {
    const shell = document.querySelector('[data-slot="app-shell"]')
    const commandRow = element.querySelector(
      '[data-slot="navigation-panel-command-row"]'
    )
    const searchControl = element.querySelector(
      '[data-slot="navigation-panel-command-control"]'
    )
    const activeItem = element.querySelector(
      '[data-slot="navigation-panel"] nav button[aria-current="page"]'
    )

    return [shell, commandRow, searchControl, activeItem].map((node) =>
      node ? getComputedStyle(node).transitionDuration : null
    )
  })
  expect(stagedDurations).toEqual(["0.3s", "0s", "0.16s", "0.16s"])
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
  await expectComponentReferences([
    "AppShell",
    "NavigationPanel",
    "Surface",
    "Card",
    "Button",
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
  ])
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
  await expectComponentReferences([
    "AppShell",
    "NavigationPanel",
    "NavigationUserMenu",
    "Surface",
    "ProgressiveSummaryRail",
    "WorkflowStepper",
    "Metric",
    "Separator",
  ])

  await page.getByRole("button", { name: /Daedalus/ }).click()
  await expectComponentReferences([
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
  ])

  await page.getByRole("button", { name: /Creator workflow/ }).click()
  await expectComponentReferences([
    "SignalPlate",
    "FitLeaderboard",
    "CreatorTransfer",
    "CreatorScopePanel",
    "SingleCalendarDateRangePicker",
    "CreatorFlowChart",
    "StreamSelector",
    "ReportContextBuilder",
    "IntelligenceProgressionChart",
  ])

  await page.getByRole("button", { name: /Campaign tools/ }).click()
  await expectComponentReferences([
    "SignalPlate",
    "CampaignScheduleMatrix",
    "PacingConfigurator",
    "ExportWorkbench",
    "LiveguardIncidentReview",
  ])

  await page.getByRole("button", { name: /Kraken operations/ }).click()
  await expectComponentReferences([
    "SignalPlate",
    "Metric",
    "RunMonitorTable",
    "EvidenceDrawer",
    "DataLedger",
  ])

  await page.getByRole("button", { name: /Report reader/ }).click()
  await expectComponentReferences([
    "ReportRail",
    "ReportReader",
    "IntelligenceProgressionChart",
  ])

  await page.getByRole("button", { name: "Settings", exact: true }).click()
  await expectComponentReferences([
    "SettingsModal",
    "SettingsModalSection",
    "SelectMenu",
  ])
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

  await page.keyboard.press("Tab")
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
  expect((examples[0][2].length * 2) / standaloneDuration).toBeCloseTo(5, 1)

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
  expect(("Analyze VODs".length * 2) / activeDuration).toBeCloseTo(5, 1)
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
    evidenceDrawer.getByRole("radio", { name })
  )
  const boxes = await Promise.all(choices.map((choice) => choice.boundingBox()))

  for (const box of boxes) {
    expect(box).not.toBeNull()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(321)
  }
  expect(boxes[0]!.x + boxes[0]!.width).toBeLessThanOrEqual(boxes[1]!.x)
  expect(boxes[1]!.x + boxes[1]!.width).toBeLessThanOrEqual(boxes[2]!.x)

  await choices[1].click()
  await expect(choices[1]).toHaveAttribute("aria-checked", "true")
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

test("playground queues creator changes and keeps generated flow edges contained", async ({
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

  const streamList = page
    .locator('[data-slot="stream-selector"]')
    .locator(".nextide-scrollbar-none")
  await expect(streamList).toHaveCSS("scrollbar-width", "none")

  const progression = page.locator(
    '[data-slot="intelligence-progression-chart"]'
  )
  await expect(progression.locator("linearGradient")).toHaveCount(7)
  await expect(progression.locator('mask ellipse[fill="black"]')).toHaveCount(7)
  await expect(progression.locator('g[mask^="url("]')).toHaveCount(2)
  await expect(
    progression.locator('path.nextide-flow-line[stroke^="url("]')
  ).toHaveCount(7)
  await expect(progression.locator("div.absolute.z-20")).toHaveCount(7)
})

test("signal ridge and impression details share compact overview and exact detail", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/?view=daedalus")

  await expect(page.locator('[data-slot="signal-ridge-chart"]')).toHaveCount(1)

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
  const lastPoint = impressions.getByRole("button").last()
  await lastPoint.focus()

  await expect(
    impressions.locator('[data-slot="line-item-hover-guide"]')
  ).toHaveCount(1)
  const tooltip = page.locator('[data-slot="graph-tooltip"]')
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
})
