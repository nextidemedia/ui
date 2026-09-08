import { expect, test, type Locator, type Page } from "@playwright/test"
import {
  expectVisibleFocus,
  expectNoSeriousAxeViolations,
  openQualification,
} from "./qualification-helpers"

test.beforeEach(openQualification)

test("playground keeps control sizing, Typeset presets, and sidebar motion coherent", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/?view=foundations")

  const settings = await expectShellControlSizing(page)

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
    name: "Search Navigation",
  })
  const toggle = mainSidebar.locator('[data-slot="sidebar-toggle"]')
  await expect(toggle).toHaveAccessibleName("Collapse sidebar")
  const commandCopy = mainSidebar.locator(
    '[data-slot="navigation-panel-command-copy"]'
  )
  const { commandCopyBox, searchInputBox } = await expectExpandedCommandSizing(
    search,
    searchInput,
    toggle,
    commandCopy,
    commandRow
  )

  await expectNavigationUserMenu(page, mainSidebar)

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

  await expectSidebarCollapseStage(
    page,
    mainSidebar,
    commandCopyBox!,
    searchInputBox!
  )

  await expect(mainSidebar).toHaveAttribute("data-collapsed", "true")
  await expect(shell).toHaveCSS("grid-template-columns", /72px [0-9.]+px/)
  await expect(brandText).toHaveCSS("opacity", "0")
  await expect(brandText).toHaveCount(1)
  const collapsedActiveItemBox = await activeNavItem.boundingBox()
  expect(collapsedActiveItemBox).not.toBeNull()
  expect(collapsedActiveItemBox!.height).toBeCloseTo(44, 0)

  await expectSidebarExpansion(
    mainSidebar,
    search,
    commandRow,
    shell,
    brandText
  )

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

  const shellTheme = page.getByRole("combobox", { name: "Shell theme" })
  await shellTheme.click()
  await page.getByRole("option", { name: "Large" }).click()

  const mainSidebar = page
    .locator('[data-slot="navigation-panel-frame"]')
    .first()
  const search = mainSidebar.locator(
    '[data-slot="navigation-panel-command-control"]'
  )
  const searchInput = mainSidebar.getByRole("combobox", {
    name: "Search Navigation",
  })

  await mainSidebar.getByRole("button", { name: "Collapse sidebar" }).click()
  await expect(mainSidebar).toHaveAttribute("data-collapsed", "true")

  await search.click()
  await expect(searchInput).toBeFocused()
  await expect(search).toHaveCSS("background-color", "rgb(31, 31, 31)")
  await expect(search).toHaveCSS("width", "288px")

  await page.keyboard.press("Escape")
  await expect(searchInput).not.toBeFocused()
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

  await expect(navigation.getByRole("button", { name: "Dashboard" })).toHaveCSS(
    "height",
    "44px"
  )
  await expect(
    navigation.getByRole("button", {
      name: "Campaigns Launch plans",
      exact: true,
    })
  ).toHaveCSS("height", "52px")
  await expect(expand).toBeVisible()
  await expect(
    navigation.getByRole("button", { name: "Summer launch" })
  ).toHaveCount(0)
  await expand.click()

  const report = navigation.getByRole("button", { name: "Summer launch" })
  await expectNavigationStatuses(page, navigation, report)

  await expect(
    navigation.getByRole("button", { name: "Collapse Campaigns" })
  ).toBeVisible()
  await report.click()
  await expect(report).toHaveAttribute("aria-current", "page")
  await expect(report).toHaveCSS("background-color", "rgba(0, 0, 0, 0)")
  const selection = navigation.locator(
    '[data-slot="navigation-panel-selection"]'
  )
  await expect
    .poll(async () => {
      const [reportBox, selectionBox] = await Promise.all([
        report.boundingBox(),
        selection.boundingBox(),
      ])
      if (!reportBox || !selectionBox) return 100
      return Math.max(
        Math.abs(reportBox.x - selectionBox.x),
        Math.abs(reportBox.y - selectionBox.y),
        Math.abs(reportBox.width - selectionBox.width),
        Math.abs(reportBox.height - selectionBox.height)
      )
    })
    .toBeLessThan(1)

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

  await expectResponsiveBranchActions(page, navigation, report, rail)
})

async function expectShellControlSizing(page: Page) {
  const shellTheme = page.getByRole("combobox", { name: "Shell theme" })
  await expect(shellTheme).toContainText("Compact")
  await shellTheme.click()
  await page.getByRole("option", { name: "Large" }).click()

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

  return settings
}

async function expectExpandedCommandSizing(
  search: Locator,
  searchInput: Locator,
  toggle: Locator,
  commandCopy: Locator,
  commandRow: Locator
) {
  const searchBox = await search.boundingBox()
  const searchInputBox = await searchInput.boundingBox()
  const toggleBox = await toggle.boundingBox()
  const commandCopyBox = await commandCopy.boundingBox()
  const commandRowBox = await commandRow.boundingBox()

  expect(searchBox).not.toBeNull()
  expect(searchInputBox).not.toBeNull()
  expect(toggleBox).not.toBeNull()
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
  return { commandCopyBox, searchInputBox }
}

async function expectNavigationUserMenu(page: Page, mainSidebar: Locator) {
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
}

async function expectSidebarCollapseStage(
  page: Page,
  mainSidebar: Locator,
  commandCopyBox: NonNullable<Awaited<ReturnType<Locator["boundingBox"]>>>,
  searchInputBox: NonNullable<Awaited<ReturnType<Locator["boundingBox"]>>>
) {
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
      'input[aria-label="Search Navigation"]'
    )
    const toggleButton = element.querySelector(
      'button[aria-label="Expand sidebar"]'
    )
    const coordinate = (
      node: Element | null,
      key: "x" | "y" | "width" | "height"
    ) => node?.getBoundingClientRect()[key] ?? 0
    return {
      shellWidth:
        element.closest("aside")?.getBoundingClientRect().width ??
        (shell
          ? Number.parseFloat(getComputedStyle(shell).gridTemplateColumns)
          : 0),
      rowHeight: coordinate(row, "height"),
      searchY: coordinate(searchControl, "y"),
      toggleY: coordinate(toggleButton, "y"),
      commandCopyX: coordinate(commandCopy, "x"),
      searchInputWidth: coordinate(searchInput, "width"),
    }
  })
  expect(stageOne.shellWidth).toBeGreaterThan(72)
  expect(stageOne.shellWidth).toBeLessThan(288)
  expect(stageOne.rowHeight).toBe(44)
  expect(Math.abs(stageOne.searchY - stageOne.toggleY)).toBeLessThanOrEqual(2)
  expect(stageOne.commandCopyX).toBeLessThan(commandCopyBox!.x - 1)
  expect(stageOne.searchInputWidth).toBeCloseTo(searchInputBox!.width, 0)
}

async function expectSidebarExpansion(
  mainSidebar: Locator,
  search: Locator,
  commandRow: Locator,
  shell: Locator,
  brandText: Locator
) {
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
  expect(Math.abs(collapsedSearchBox!.x - expandBox!.x)).toBeLessThanOrEqual(4)
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
}

async function expectNavigationStatuses(
  page: Page,
  navigation: Locator,
  report: Locator
) {
  const completedBadge = report.locator('[data-slot="status-badge"]')
  await expect(completedBadge).toHaveAttribute("data-tone", "success")
  await expect(completedBadge.getByText("Completed")).toHaveClass("sr-only")
  await expect(
    completedBadge.locator('[data-slot="status-badge-icon"]')
  ).toBeVisible()
  const [reportBox, completedBadgeBox] = await Promise.all([
    report.boundingBox(),
    completedBadge.boundingBox(),
  ])
  expect(completedBadgeBox?.x).toBeGreaterThan(
    (reportBox?.x ?? 0) + (reportBox?.width ?? 0) / 2
  )
  expect(completedBadgeBox?.y).toBeLessThan(
    (reportBox?.y ?? 0) + (reportBox?.height ?? 0) / 2
  )
  await expect(
    navigation
      .getByRole("button", { name: "Creative review" })
      .locator('[data-slot="status-badge"]')
  ).toHaveAttribute("data-tone", "neutral")
  await expect(
    navigation
      .getByRole("button", { name: "Failed sync" })
      .locator('[data-slot="status-badge"]')
  ).toHaveAttribute("data-tone", "danger")
  const processingIcon = navigation
    .getByRole("button", { name: "Partner rollout" })
    .locator('[data-slot="status-badge-icon"] svg')
  await expect
    .poll(() =>
      processingIcon.evaluate((icon) => getComputedStyle(icon).animationName)
    )
    .not.toBe("none")
  await page.emulateMedia({ reducedMotion: "reduce" })
  await expect
    .poll(() =>
      processingIcon.evaluate((icon) => getComputedStyle(icon).animationName)
    )
    .toBe("none")
  await page.emulateMedia({ reducedMotion: "no-preference" })
}

async function expectResponsiveBranchActions(
  page: Page,
  navigation: Locator,
  report: Locator,
  rail: Locator
) {
  await page.setViewportSize({ width: 390, height: 900 })
  await expect(report).not.toHaveCSS("background-image", "none")
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
}
