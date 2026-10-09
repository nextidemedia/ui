import { test } from "@e2e-dev/web"
import { expect } from "e2e"

test(
  "keyboard controls expose validation and restore dialog focus",
  { platforms: ["web"] },
  async ({ app, screen, browser }) => {
    await app.open("/qualification")
    const name = screen.getByRole("textbox", "Project name")
    const region = screen.getByRole("combobox", "Delivery region")
    await expect(region).toHaveAttribute("aria-invalid", "true")
    const description = await region.getAttribute("aria-describedby")
    expect(description).toBeTruthy()
    await expect(browser.locator(`[id="${description}"]`)).toHaveText(
      "Choose a delivery region."
    )
    await name.fill("Campaign launch")
    await name.press("Tab")
    await expect(region).toBeFocused()
    await region.press("Enter")
    await expect(screen.getByRole("listbox")).toBeVisible()
    await browser.keyboard.press("Home")
    await browser.keyboard.press("ArrowDown")
    await browser.keyboard.press("Enter")
    await expect(region).toContainText("Americas")
    await expect(region).toHaveAttribute("aria-invalid", "false")
    await expect(region).toBeFocused()
    await region.press("Tab")
    const summary = screen.getByRole("checkbox", "Include a weekly summary")
    await expect(summary).toBeFocused()
    await summary.press("Space")
    await expect(summary).toBeChecked()
    await summary.press("Tab")
    const review = screen.getByRole("button", "Review settings")
    await expect(review).toBeFocused()
    await review.press("Enter")
    await expect(screen.getByRole("dialog", "Project review")).toBeVisible()
    await browser.keyboard.press("Escape")
    await expect(screen.getByRole("dialog", "Project review")).toBeHidden()
    await expect(review).toBeFocused()
    const overview = screen.getByRole("tab", "Overview")
    const activity = screen.getByRole("tab", "Activity")
    await overview.focus()
    await overview.press("ArrowRight")
    await expect(activity).toBeFocused()
    await activity.press("Enter")
    await expect(activity).toHaveAttribute("aria-selected", "true")
    await expect(screen.getByText("Recent activity is ready.")).toBeVisible()
  }
)

test(
  "a reviewer opens and dismisses project review",
  { platforms: ["web"], tags: ["recording"] },
  async ({ app, agent, screen }) => {
    await app.open("/qualification")
    await agent.act("Open Project review using Review settings.")
    await expect(screen.getByRole("dialog", "Project review")).toBeVisible()
    await screen.getByRole("dialog", "Project review").press("Escape")
    await expect(screen.getByRole("button", "Review settings")).toBeFocused()
  }
)

test(
  "currency typing preserves cents and large decimal strings",
  { platforms: ["web"] },
  async ({ app, screen, browser }) => {
    await app.open("/?view=report")
    await screen.getByRole("button", /Primitives/).tap()
    const budget = screen.getByRole("textbox", "Budget (USD)")
    await budget.fill("")
    await budget.pressSequentially("1234.05")
    await expect(budget).toHaveValue("$1,234.05")
    await budget.press("Home")
    await budget.press("ArrowRight")
    await budget.press("ArrowRight")
    await budget.pressSequentially("9")
    await expect(budget).toHaveValue("$19,234.05")
    await budget.press("Backspace")
    await expect(budget).toHaveValue("$1,234.05")
    await budget.fill("9007199254740993.01")
    await budget.press("Tab")
    await expect(budget).toHaveValue("$9,007,199,254,740,993.01")
    await budget.fill(".05")
    await budget.press("Tab")
    await expect(budget).toHaveValue("$0.05")
    await expect
      .poll(() =>
        browser.evaluate(
          () => document.documentElement.scrollWidth - innerWidth
        )
      )
      .toBeLessThanOrEqual(1)
  }
)

test(
  "duration edits confirm on blur and Enter with bounded values",
  { platforms: ["web"] },
  async ({ app, screen, browser }) => {
    await app.open("/?view=report")
    await screen.getByRole("button", /Primitives/).tap()
    const picker = browser.locator('[data-slot="duration-picker"]')
    const edit = picker.getByRole("button", "Edit duration")
    await edit.tap()
    const days = picker.getByRole("textbox", "Days")
    await expect(days).toBeFocused()
    await days.fill("4")
    await screen.getByRole("textbox", "Report name").tap()
    await expect(
      browser.locator('[data-slot="duration-picker-output"]')
    ).toHaveText("4 d 2 hr 33 min")
    await edit.press("Enter")
    await days.fill("999")
    await expect(days).toHaveValue("365")
    await picker.getByRole("textbox", "Hours").fill("4")
    const minutes = picker.getByRole("textbox", "Minutes")
    await minutes.fill("61")
    await expect(minutes).toHaveValue("59")
    await minutes.press("Enter")
    await expect(
      browser.locator('[data-slot="duration-picker-output"]')
    ).toHaveText("365 d 4 hr 59 min")
    await expect(edit).toBeFocused()
  }
)

test(
  "carousel reordering preserves an edited draft",
  { platforms: ["web"] },
  async ({ app, screen, browser }) => {
    await app.open("/?view=report")
    await screen.getByRole("button", /Primitives/).tap()
    const slides = browser.locator(
      '[data-slot="carousel-content"] > [data-slot="carousel-item"]'
    )
    const note = slides.getByRole("textbox", "Campaign delivery note")
    await note.fill("Keep this draft")
    await screen.getByRole("button", "Reverse slides").tap()
    await expect(slides.first()).toContainText("Safety review")
    await expect(note).toHaveValue("Keep this draft")
  }
)
