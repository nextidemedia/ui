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

    await page.goto("/?view=foundations")
    const userMenu = page.getByRole("button", {
      name: "Nextide Operator menu",
    })
    await expect(userMenu).toBeVisible()
    const userMenuBox = await userMenu.boundingBox()
    expect(userMenuBox).not.toBeNull()
    expect(userMenuBox!.x).toBeGreaterThanOrEqual(0)
    expect(userMenuBox!.x + userMenuBox!.width).toBeLessThanOrEqual(width + 1)
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

  await page.getByRole("button", { name: "Report", exact: true }).click()
  const typesetArticle = page.locator("article.typeset")
  await expect(typesetArticle).toHaveCSS("font-size", "17px")
  await expect(typesetArticle).toHaveCSS("line-height", "29.75px")

  const typesetSelector = page.locator(
    '[data-slot="segmented-control"][aria-label="Typeset preset"]'
  )
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
  const commandCopy = mainSidebar.locator(
    '[data-slot="navigation-panel-command-copy"]'
  )
  const searchBox = await search.boundingBox()
  const searchInputBox = await searchInput.boundingBox()
  const toggleBox = await toggle.boundingBox()
  const shortcutBox = await shortcut.boundingBox()
  const commandCopyBox = await commandCopy.boundingBox()
  const commandRowBox = await commandRow.boundingBox()

  expect(searchBox).not.toBeNull()
  expect(searchInputBox).not.toBeNull()
  expect(toggleBox).not.toBeNull()
  expect(shortcutBox).not.toBeNull()
  expect(commandCopyBox).not.toBeNull()
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

  await settings.click()
  const settingsDialog = page.getByRole("dialog", { name: "Preview settings" })
  const slowMotion = settingsDialog
    .getByText("Slow motion")
    .locator("../..")
    .getByRole("switch")
  await slowMotion.click()
  await page.keyboard.press("Escape")

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

  await page.waitForTimeout(600)
  const stageOne = await mainSidebar.evaluate((element) => {
    const shell = document.querySelector('[data-slot="app-shell"]')
    const row = element.querySelector(
      '[data-slot="navigation-panel-command-row"]'
    )
    const searchControl = element.querySelector(
      '[data-slot="navigation-panel-command-control"]'
    )
    const commandCopy = element.querySelector(
      '[data-slot="navigation-panel-command-copy"]'
    )
    const searchInput = element.querySelector(
      'input[aria-label="Search library"]'
    )
    const shortcut = searchControl?.querySelector("kbd")
    const toggleButton = element.querySelector(
      'button[aria-label="Expand sidebar"]'
    )
    return {
      shellWidth:
        element.closest("aside")?.getBoundingClientRect().width ??
        (shell
          ? Number.parseFloat(getComputedStyle(shell).gridTemplateColumns)
          : 0),
      rowHeight: row?.getBoundingClientRect().height ?? 0,
      searchY: searchControl?.getBoundingClientRect().y ?? 0,
      toggleY: toggleButton?.getBoundingClientRect().y ?? 0,
      commandCopyX: commandCopy?.getBoundingClientRect().x ?? 0,
      searchInputWidth: searchInput?.getBoundingClientRect().width ?? 0,
      shortcutWidth: shortcut?.getBoundingClientRect().width ?? 0,
      shortcutHeight: shortcut?.getBoundingClientRect().height ?? 0,
    }
  })
  expect(stageOne.shellWidth).toBeGreaterThan(72)
  expect(stageOne.shellWidth).toBeLessThan(288)
  expect(stageOne.rowHeight).toBe(44)
  expect(Math.abs(stageOne.searchY - stageOne.toggleY)).toBeLessThanOrEqual(2)
  expect(stageOne.commandCopyX).toBeLessThan(commandCopyBox!.x - 1)
  expect(stageOne.searchInputWidth).toBeCloseTo(searchInputBox!.width, 0)
  expect(stageOne.shortcutWidth).toBeCloseTo(shortcutBox!.width, 0)
  expect(stageOne.shortcutHeight).toBeCloseTo(shortcutBox!.height, 0)
  await expect(mainSidebar).toHaveAttribute("data-collapsed", "true")
  await expect(shell).toHaveCSS("grid-template-columns", /72px [0-9.]+px/)
  await expect(brandText).toHaveCSS("opacity", "0")
  await expect(brandText).toHaveCount(1)
  const collapsedActiveItemBox = await activeNavItem.boundingBox()
  expect(collapsedActiveItemBox).not.toBeNull()
  expect(collapsedActiveItemBox!.height).toBeCloseTo(44, 0)

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

  const expandingShortcutSize = await mainSidebar.evaluate(async (element) => {
    const expandButton = element.querySelector<HTMLButtonElement>(
      'button[aria-label="Expand sidebar"]'
    )
    expandButton?.click()
    await new Promise(requestAnimationFrame)

    const shortcut = element.querySelector("kbd")
    const box = shortcut?.getBoundingClientRect()
    return { width: box?.width ?? 0, height: box?.height ?? 0 }
  })
  expect(expandingShortcutSize.width).toBeCloseTo(shortcutBox!.width, 0)
  expect(expandingShortcutSize.height).toBeCloseTo(shortcutBox!.height, 0)
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

  await settings.click()
  await slowMotion.click()
  await page.keyboard.press("Escape")

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

test("collapsed navigation search closes cleanly", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/?view=foundations")

  const mainSidebar = page
    .locator('[data-slot="navigation-panel-frame"]')
    .first()
  const search = mainSidebar.locator(
    '[data-slot="navigation-panel-command-control"]'
  )
  const searchInput = mainSidebar.getByRole("combobox", {
    name: "Search library",
  })
  const shortcut = search.getByText("CTRL K", { exact: true })

  await mainSidebar.getByRole("button", { name: "Collapse sidebar" }).click()
  await expect(mainSidebar).toHaveAttribute("data-collapsed", "true")

  await search.click()
  await expect(searchInput).toBeFocused()
  await expect(search).toHaveCSS("background-color", "rgb(31, 31, 31)")
  await expect(search).toHaveCSS("width", "288px")
  await expect(shortcut).toHaveCount(0)

  await page.keyboard.press("Escape")
  await expect(searchInput).not.toBeFocused()
  await expect(shortcut).toHaveCSS("opacity", "0")
  await page.waitForTimeout(50)
  const closingSearchWidth = await search.evaluate(
    (element) => element.getBoundingClientRect().width
  )
  expect(closingSearchWidth).toBeGreaterThan(44)
  expect(closingSearchWidth).toBeLessThan(288)
  await expect(search).toHaveCSS("width", "44px")

  await search.click()
  await expect(search).toHaveCSS("width", "288px")
  await page.getByRole("button", { name: "Inspect" }).click()
  await expect(shortcut).toHaveCSS("opacity", "0")
  await expect(search).toHaveCSS("width", "44px")
})

test("navigation branches keep destinations and create actions distinct", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/")
  await page.getByRole("button", { name: /Patterns/ }).click()

  const navigation = page.locator('[data-slot="navigation-panel-frame"]').nth(1)
  const expand = navigation.getByRole("button", { name: "Expand Campaigns" })

  await expect(expand).toBeVisible()
  await expect(
    navigation.getByRole("button", { name: "Summer launch" })
  ).toHaveCount(0)
  await expand.click()

  const report = navigation.getByRole("button", { name: "Summer launch" })
  await expect(
    navigation.getByRole("button", { name: "Collapse Campaigns" })
  ).toBeVisible()
  await report.click()
  await expect(report).toHaveAttribute("aria-current", "page")

  await navigation.getByRole("button", { name: "Create campaign" }).click()
  await expect(
    page.getByText("Create campaign requested 1 time", { exact: true })
  ).toBeVisible()
  await expect(report).toHaveAttribute("aria-current", "page")

  await navigation.getByRole("button", { name: "Collapse Campaigns" }).click()
  const closedBranchGlyph = navigation
    .getByRole("button", { name: "Campaigns" })
    .locator('[data-slot="navigation-panel-item-glyph"]')
  const rail = navigation.locator('[data-slot="navigation-panel-rail"]')
  await expect(
    navigation.locator(
      '[data-slot="navigation-panel-current-child"][aria-current="page"]'
    )
  ).toHaveText("Summer launch")
  await expect
    .poll(async () => {
      const glyphBox = await closedBranchGlyph.boundingBox()
      const railBox = await rail.boundingBox()
      return glyphBox && railBox ? Math.abs(railBox.y - (glyphBox.y - 2)) : 100
    })
    .toBeLessThan(1)
  await navigation
    .getByRole("combobox", { name: "Search" })
    .fill("Summer launch")
  await page
    .locator('[data-slot="autocomplete-item"]')
    .filter({ hasText: "Summer launch" })
    .click()
  await expect(report).toHaveAttribute("aria-current", "page")

  await page.setViewportSize({ width: 390, height: 900 })
  const action = navigation.getByRole("button", { name: "Create campaign" })
  const disclosure = navigation.getByRole("button", {
    name: "Collapse Campaigns",
  })
  await action.scrollIntoViewIfNeeded()
  for (const control of [action, disclosure]) {
    const box = await control.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.width).toBeGreaterThanOrEqual(44)
    expect(box!.height).toBeGreaterThanOrEqual(44)
  }

  await page.setViewportSize({ width: 1440, height: 900 })
  await navigation.getByRole("button", { name: "Collapse sidebar" }).click()
  const current = navigation.getByRole("button", { name: "Summer launch" })
  await expect(current).toHaveAttribute("aria-current", "page")
  await expect(navigation).toHaveAttribute("data-collapsed", "true")
  const currentGlyph = current.locator(
    '[data-slot="navigation-panel-item-glyph"]'
  )
  await expect
    .poll(async () => {
      const glyphBox = await currentGlyph.boundingBox()
      const railBox = await rail.boundingBox()
      return glyphBox && railBox
        ? Math.max(
            Math.abs(railBox.y - (glyphBox.y - 2)),
            Math.abs(railBox.height - (glyphBox.height + 4))
          )
        : 100
    })
    .toBeLessThan(1)
  await navigation
    .getByRole("combobox", { name: "Search" })
    .fill("Create campaign")
  await page
    .locator('[data-slot="autocomplete-item"]')
    .filter({ hasText: "Create campaign" })
    .click()
  await expect(
    page.getByText("Create campaign requested 2 times", { exact: true })
  ).toBeVisible()
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
  ])
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

  const contextBuilder = page.locator('[data-slot="report-context-builder"]')
  await contextBuilder
    .getByRole("button", { name: "Nextide", exact: true })
    .click()
  await contextBuilder
    .getByRole("button", { name: "Creator roster", exact: true })
    .click()
  const contextRows = contextBuilder.locator(":scope > section")
  const brandSelected = contextRows
    .filter({ has: page.getByText("Brand", { exact: true }) })
    .locator(".nextide-contained-scroll")
    .first()
  const productSelected = contextRows
    .filter({ has: page.getByText("Products", { exact: true }) })
    .locator(".nextide-contained-scroll")
    .first()
  await expect(
    brandSelected.getByRole("button", { name: "Nextide", exact: true })
  ).toBeVisible()
  await expect(
    productSelected.getByRole("button", {
      name: "Creator roster",
      exact: true,
    })
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
  await impressions.locator("svg > rect").first().hover()
  await expect(tooltip).toContainText("Day breakdown")
  await expect(tooltip).not.toContainText("Immersive frame impressions")
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
