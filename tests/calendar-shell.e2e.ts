import { test } from "@e2e-dev/web"
import { expect } from "e2e"

test(
  "read-only calendar selects without moving and enabled editing commits a move",
  { platforms: ["web"] },
  async ({ app, screen, browser }) => {
    await app.open("/qualification")
    const calendar = screen.getByRole("region", "Campaign calendar")
    const session = calendar.getByRole("button", "Autumn launch")
    await session.scrollIntoView()
    const initial = (await session.boundingBox())!
    await browser.mouse.move(
      initial.x + initial.width / 2,
      initial.y + initial.height / 2
    )
    await browser.mouse.down()
    await browser.mouse.move(
      initial.x + initial.width,
      initial.y + initial.height / 2
    )
    await browser.mouse.up()
    expect((await session.boundingBox())!.x).toBeCloseTo(initial.x, 0)
    await session.press("Enter")
    await expect(screen.getByLabel("Selected campaign")).toHaveText(
      "Autumn launch"
    )
    await screen.getByRole("button", "Edit calendar").tap()
    await session.scrollIntoView()
    const editable = (await session.boundingBox())!
    await browser.mouse.move(
      editable.x + editable.width / 2,
      editable.y + editable.height / 2
    )
    await browser.mouse.down()
    await browser.mouse.move(
      editable.x + editable.width,
      editable.y + editable.height / 2
    )
    await browser.mouse.up()
    await expect
      .poll(() =>
        browser.evaluate(
          () =>
            document.querySelector<HTMLElement>(
              '[aria-label="Campaign calendar"] button'
            )!.style.left
        )
      )
      .toBe("25%")
  }
)

test(
  "panning calendar keeps campaign clicks usable and distinguishes clipped ends",
  { platforms: ["web"] },
  async ({ app, screen, browser }) => {
    await app.open("/qualification")
    const calendar = screen.getByRole("region", "Pannable calendar")
    await calendar.scrollIntoView()
    const session = calendar.getByRole("button", "Campaign 1")
    await expect
      .poll(() =>
        browser.evaluate(
          () =>
            getComputedStyle(
              [
                ...document.querySelectorAll(
                  '[aria-label="Pannable calendar"] button'
                ),
              ].find((node) => node.textContent === "Campaign 1")!
            ).borderRightWidth
        )
      )
      .toBe("0px")
    await session.tap()
    await expect(screen.getByLabel("Panned campaign")).toHaveText("Campaign 1")
    for (let step = 0; step < 4; step++)
      await screen.getByRole("button", "Next calendar week").tap()
    await expect
      .poll(() =>
        browser.evaluate(
          () =>
            getComputedStyle(
              [
                ...document.querySelectorAll(
                  '[aria-label="Pannable calendar"] button'
                ),
              ].find((node) => node.textContent === "Campaign 1")!
            ).borderRightWidth
        )
      )
      .toBe("1px")
    await calendar.getByRole("button", "Inspect 2").tap()
    await expect(screen.getByLabel("Panned campaign")).toHaveText("Inspect 2")
  }
)

test(
  "shell hash navigation preserves its frame and collapsed search releases focus",
  { platforms: ["web"] },
  async ({ app, screen, browser }) => {
    await app.open("/?view=foundations")
    const header = browser.locator('[data-slot="app-shell-header"]')
    const before = (await header.boundingBox())!
    await browser.evaluate(() => {
      const viewport = document.querySelector<HTMLElement>(
        '[data-slot="app-shell-workspace"] [data-slot="scroll-area-viewport"]'
      )!
      const target =
        viewport.querySelector<HTMLElement>("[id]") ??
        (viewport.lastElementChild as HTMLElement)
      target.id = "shell-bottom"
      target.scrollIntoView({ block: "end", behavior: "instant" })
      location.hash = "shell-bottom"
      return null
    })
    await expect
      .poll(() =>
        browser.evaluate(
          () => document.querySelector('[data-slot="app-shell"]')!.scrollTop
        )
      )
      .toBe(0)
    expect((await header.boundingBox())!.y).toBeCloseTo(before.y, 0)
    const collapse = screen.getByRole("button", "Collapse sidebar").first()
    if (await collapse.isVisible()) await collapse.tap()
    const command = browser
      .locator('[data-slot="navigation-panel-command-control"]')
      .first()
    await command.tap()
    const search = screen.getByRole("combobox", "Search Navigation")
    await expect(search).toBeFocused()
    await search.press("Escape")
    await expect(search).not.toBeFocused()
  }
)

test(
  "notifications announce without taking focus and can be dismissed",
  { platforms: ["web"] },
  async ({ app, screen, browser }) => {
    await app.open("/qualification")
    const trigger = screen.getByRole("button", "success notification")
    await trigger.tap()
    await expect(trigger).toBeFocused()
    const viewport = browser.locator('[data-slot="toast-viewport"]')
    await expect(viewport).toHaveAttribute("aria-live", "polite")
    await expect(browser.locator('[data-slot="toast"]')).toHaveCount(1)
    await browser.locator('[data-slot="toast"]').hover()
    await viewport.getByRole("button", "Dismiss notification").tap()
    await expect(browser.locator('[data-slot="toast"]')).toHaveCount(0)
  }
)

test(
  "notification expiry pauses during hover and resumes after leaving",
  { platforms: ["web"] },
  async ({ app, screen, browser }) => {
    await app.open("/qualification")
    const trigger = screen.getByRole("button", "success notification")
    await trigger.tap()
    const notification = browser.locator('[data-slot="toast"]')
    await notification.hover()
    await expect(notification).toBeVisible()
    const started = Date.now()
    await expect
      .poll(
        async () => (Date.now() - started >= 4500 ? notification.count() : 0),
        { timeout: 5500 }
      )
      .toBe(1)
    await trigger.focus()
    await browser.mouse.move(0, 0)
    await expect(notification).toHaveCount(0, { timeout: 6000 })
  }
)
