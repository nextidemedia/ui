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
    if (await collapse.isVisible()) {
      const shell = browser.locator('[data-slot="app-shell"]')
      const frame = browser
        .locator('[data-slot="navigation-panel-frame"]')
        .first()
      const expectSettled = async (collapsed: "true" | "false") => {
        await expect(shell).toHaveAttribute(
          "data-sidebar-transitioning",
          "false"
        )
        await expect(frame).toHaveAttribute("data-drawer-collapsed", collapsed)
        await expect(frame).toHaveAttribute("data-collapsed", collapsed)
      }
      const reducedMotion = await browser.evaluate(
        () => matchMedia("(prefers-reduced-motion: reduce)").matches
      )
      if (reducedMotion) {
        // Reduced motion settles directly, with no text transition to interrupt.
        await collapse.tap()
        await expectSettled("true")
        await screen.getByRole("button", "Expand sidebar").first().tap()
      } else {
        await browser.evaluate(async () => {
          const panel = document.querySelector(
            '[data-slot="navigation-panel-frame"]'
          )!
          const toggle = panel.querySelector<HTMLButtonElement>(
            '[data-slot="sidebar-toggle"]'
          )!
          const text = panel.querySelector<HTMLElement>(
            '[data-slot="sidebar-brand-text"]'
          )!
          const events = new AbortController()
          try {
            const fadeStarted = new Promise<void>((resolve) => {
              text.addEventListener(
                "transitionstart",
                (event: TransitionEvent) => {
                  if (event.target === text && event.propertyName === "opacity")
                    resolve()
                },
                { signal: events.signal }
              )
            })
            toggle.click()
            await fadeStarted
            if (
              panel.getAttribute("data-drawer-collapsed") !== "true" ||
              panel.getAttribute("data-collapsed") !== "false"
            ) {
              throw new Error(
                "Sidebar text must start fading before its icons collapse"
              )
            }
            toggle.click()
          } finally {
            events.abort()
          }
          return null
        })
      }
      await expectSettled("false")
      await collapse.tap()
      await expectSettled("true")
    }
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

type NotificationClockWindow = typeof window & {
  advanceNotificationClock: (milliseconds: number) => void
}

// The pinned browser fixture has no clock API. Control timeout time in
// this page while leaving the browser's input and exit animation native.
function installNotificationClock() {
  let now = Date.now()
  let nextId = -1
  const timers = new Map<number, { due: number; run: () => void }>()
  const page: Window = window
  const realSetTimeout = page.setTimeout.bind(page)
  const realClearTimeout = page.clearTimeout.bind(page)
  const clock = window as NotificationClockWindow

  Date.now = () => now
  page.setTimeout = (handler, delay = 0, ...args: unknown[]) => {
    if (typeof handler === "string") {
      return realSetTimeout(handler, delay, ...args)
    }
    const id = nextId--
    timers.set(id, {
      due: now + Math.max(1, delay),
      run: () => handler(...args),
    })
    return id
  }
  page.clearTimeout = (id) => {
    if (id !== undefined && id < 0) timers.delete(id)
    else realClearTimeout(id)
  }
  clock.advanceNotificationClock = (milliseconds) => {
    const end = now + milliseconds
    while (true) {
      const next = [...timers].sort(([, a], [, b]) => a.due - b.due)[0]
      if (!next || next[1].due > end) break
      const [id, { due, run }] = next
      timers.delete(id)
      now = due
      run()
    }
    now = end
  }
}

test(
  "notification expiry preserves overlapping hover and focus pauses",
  { platforms: ["web"] },
  async ({ app, screen, browser }) => {
    await browser.addInitScript(installNotificationClock)
    await app.open("/qualification")
    const trigger = screen.getByRole("button", "success notification")
    const toastSelector = '[data-slot="toast"]'
    const notification = browser.locator(toastSelector)
    const openNotification = browser.locator(
      `${toastSelector}:not([data-ending-style])`
    )
    const dismiss = notification.getByRole("button", "Dismiss notification")

    async function focusDismiss() {
      await browser.keyboard.press("F6")
      await browser.keyboard.press("Tab")
      await browser.keyboard.press("Tab")
      await expect(dismiss).toBeFocused()
    }

    async function advanceClock(milliseconds: number) {
      await browser.evaluate((elapsed) => {
        const clock = window as NotificationClockWindow
        clock.advanceNotificationClock(elapsed)
        return null
      }, milliseconds)
    }

    async function remainsOpenFor(milliseconds: number) {
      await advanceClock(milliseconds)
      expect(await openNotification.count()).toBe(1)
    }

    async function expiresAfterResume() {
      await remainsOpenFor(3999)
      await advanceClock(1)
      // Closing starts at the timer boundary. Removal follows the exit animation.
      expect(await openNotification.count()).toBe(0)
      await browser.evaluate(async (selector) => {
        const toast = document.querySelector(selector)
        if (!toast) return null
        await new Promise<void>((resolve) => {
          const observer = new MutationObserver(() => {
            if (toast.isConnected) return
            observer.disconnect()
            resolve()
          })
          observer.observe(document.body, { childList: true, subtree: true })
        })
        return null
      }, toastSelector)
      expect(await notification.count()).toBe(0)
    }

    await trigger.tap()
    await notification.hover()
    await focusDismiss()
    await remainsOpenFor(4500)
    await browser.mouse.move(0, 0)
    await expect(dismiss).toBeFocused()
    await remainsOpenFor(4500)
    await browser.keyboard.press("Tab")
    await expect(trigger).toBeFocused()
    await expiresAfterResume()

    await trigger.tap()
    await notification.hover()
    await focusDismiss()
    await browser.keyboard.press("Tab")
    await expect(trigger).toBeFocused()
    await remainsOpenFor(4500)
    await browser.mouse.move(0, 0)
    await expiresAfterResume()
  }
)
