import { test } from "@e2e-dev/web"
import { expect } from "e2e"

test(
  "creator additions commit immediately and controlled reset wins pending motion",
  { platforms: ["web"] },
  async ({ app, screen, browser }) => {
    await app.open("/?view=intelligence")
    const transfer = browser.locator('[data-slot="creator-transfer"]')
    const available = transfer.getByRole("textbox", "Search available creators")
    await available.fill("taro")
    await available.press("Enter")
    await expect(
      transfer.getByRole("heading", "Added creators (3)")
    ).toBeVisible()
    await browser.evaluate(() => {
      const transfer = document.querySelector('[data-slot="creator-transfer"]')!
      const ivy = [
        ...transfer.querySelectorAll<HTMLButtonElement>("button"),
      ].find((node) => node.textContent?.includes("Ivy North"))!
      ivy.click()
      const reset = [
        ...document.querySelectorAll<HTMLButtonElement>("button"),
      ].find((node) => node.textContent === "Reset creators")!
      reset.click()
      return null
    })
    await expect(
      transfer.getByRole("heading", "Added creators (2)")
    ).toBeVisible()
    await expect(
      transfer.getByRole("heading", "Added creators (4)")
    ).not.toBeVisible()
    await expect(transfer.getByRole("button", /^IN Ivy North/)).toBeVisible()
    await available.fill("taro")
    await available.press("Enter")
    await expect(
      transfer.getByRole("heading", "Added creators (3)")
    ).toBeVisible()
    await screen.getByRole("button", /^Primitives/).tap()
    await screen.getByRole("button", /^Creator workflow/).tap()
    await expect(
      transfer.getByRole("heading", "Added creators (3)")
    ).toBeVisible()
  }
)

test(
  "declined removal remains retryable and preserves another selection",
  { platforms: ["web"] },
  async ({ app, screen, browser }) => {
    await app.open("/?view=intelligence")
    const transfer = browser.locator('[data-slot="creator-transfer"]')
    const available = transfer.getByRole("textbox", "Search available creators")
    await available.fill("taro")
    await available.press("Enter")
    const selectedPanel = browser
      .locator('[data-slot="creator-transfer"] section')
      .filter({ has: screen.getByRole("textbox", "Search added creators") })
    const taro = selectedPanel.getByRole("button", /^TA Taro /)
    await screen.getByRole("button", "Decline removals").tap()
    await taro.tap()
    await expect(
      transfer.getByRole("heading", "Added creators (3)")
    ).toBeVisible()
    await expect(taro).toBeVisible()
    await transfer.getByRole("button", /^IN Ivy North/).tap()
    await expect(
      transfer.getByRole("heading", "Added creators (4)")
    ).toBeVisible()
    await screen.getByRole("button", "Allow removals").tap()
    await taro.tap()
    await expect(
      transfer.getByRole("heading", "Added creators (3)")
    ).toBeVisible()
  }
)

test(
  "creator typo search and lock action keep keyboard focus separate",
  { platforms: ["web"] },
  async ({ app, screen, browser }) => {
    await app.open("/?view=intelligence")
    const transfer = browser.locator('[data-slot="creator-transfer"]')
    const available = transfer.getByRole("textbox", "Search available creators")
    await available.fill("fornite")
    await expect(transfer.getByRole("button", /^TA Taro /)).toBeVisible()
    await available.press("Enter")
    const selected = transfer.getByRole("textbox", "Search added creators")
    const panel = browser
      .locator('[data-slot="creator-transfer"] section')
      .filter({ has: screen.getByRole("textbox", "Search added creators") })
    const row = panel.getByRole("button", /^TA Taro /)
    await row.focus()
    await row.press("Tab")
    const lock = panel.getByRole("button", "Lock Taro")
    await expect(lock).toBeFocused()
    await lock.press("Enter")
    await expect(panel.getByRole("button", "Unlock Taro")).toHaveAttribute(
      "aria-pressed",
      "true"
    )
    await expect(
      transfer.getByRole("heading", "Added creators (3)")
    ).toBeVisible()
    await row.press("Enter")
    await expect(
      transfer.getByRole("heading", "Added creators (2)")
    ).toBeVisible()
    await expect(selected).toBeFocused()
  }
)

test(
  "chart focus exposes exact detail and hiding a series removes its tooltip",
  { platforms: ["web"] },
  async ({ app, browser }) => {
    await app.open("/?view=daedalus")
    const graph = browser
      .locator('[data-slot="line-item-graph"]')
      .filter({ hasText: "Banner impressions" })
    const point = graph
      .getByRole("image", /^Immersive frame impressions /)
      .first()
    await point.focus()
    const tooltip = browser.locator('[data-slot="graph-tooltip"]')
    await expect(tooltip).toContainText("Immersive frame impressions")
    await graph.getByRole("button", "Immersive frame impressions").tap()
    await expect(
      graph.getByRole("button", "Immersive frame impressions")
    ).toHaveAttribute("aria-pressed", "false")
    await expect(tooltip).toBeHidden()
    await graph.getByRole("image").last().focus()
    await expect(tooltip).toContainText(/\d{1,3}(,\d{3})+/)
    const box = (await tooltip.boundingBox())!
    const viewport = await browser.evaluate(() => ({
      width: innerWidth,
      height: innerHeight,
    }))
    expect(box.x).toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width)
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height)
    await graph.getByRole("image").last().press("Tab")
    await expect(tooltip).toBeHidden()
  }
)

test(
  "clearing a dashboard selection disables clear until a campaign is selected",
  { platforms: ["web"] },
  async ({ app, screen, browser }) => {
    await app.open("/?view=daedalus")
    const bar = browser.locator('[data-slot="dashboard-filter-bar"]')
    const clear = bar.getByRole("button", "Clear filter")
    await browser.evaluate(async () => {
      await document.fonts.ready
      document
        .querySelector('[aria-label="Clear filter"]')!
        .scrollIntoView({ block: "center", behavior: "instant" })
      return null
    })
    const box = (await clear.boundingBox())!
    // Locator tap re-scrolls this control into the shell clip; use its visible center.
    await screen.tapAt({ x: box.x + box.width / 2, y: box.y + box.height / 2 })
    await expect(clear).toBeDisabled()
    await browser
      .locator('[data-slot="dashboard-filter-scroll"]')
      .getByRole("button")
      .first()
      .tap()
    await expect(clear).toBeEnabled()
  }
)
