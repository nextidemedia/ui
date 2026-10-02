import { expect, test, type Locator, type Page } from "@playwright/test"

test("one-day campaign labels remain readable across zoom and viewport sizes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.goto("/?view=web-mining")
  await page.getByRole("button", { name: "Show one day" }).click()
  const matrix = page.locator('[data-slot="campaign-schedule-matrix"]')
  const timeline = matrix.getByRole("region", {
    name: "Campaign schedule timeline",
  })
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await matrix.getByRole("button", { name: "Zoom out" }).click()
    const bounds = await timeline.evaluate((node) => {
      const start = node
        .querySelector('[data-slot="campaign-start-marker"] span')!
        .getBoundingClientRect()
      const end = node
        .querySelector('[data-slot="campaign-end-marker"] span')!
        .getBoundingClientRect()
      return {
        overlap:
          start.left < end.right &&
          start.right > end.left &&
          start.top < end.bottom &&
          start.bottom > end.top,
        filled:
          node.firstElementChild!.getBoundingClientRect().width >=
          node.clientWidth,
      }
    })
    expect(bounds).toEqual({ overlap: false, filled: true })
    await matrix.getByRole("button", { name: "Zoom in" }).click()
    await expect(timeline).toHaveAttribute("data-zoom", "week")
    await expect(
      matrix.locator('[data-booking-id="booking-1"]')
    ).toHaveAttribute("data-start-index", "4")
    await expect(
      matrix.locator('[data-booking-id="booking-1"]')
    ).toHaveAttribute("data-end-index", "4")
  }
})

test("four-week schedule zoom changes booking scale and keeps dates aligned", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/?view=web-mining")
  await page.getByRole("button", { name: "Show four weeks" }).click()
  const matrix = page.locator('[data-slot="campaign-schedule-matrix"]')
  const timeline = matrix.getByRole("region", {
    name: "Campaign schedule timeline",
  })
  const booking = matrix.locator('[data-booking-id="booking-1"]')
  const measure = () =>
    timeline.evaluate((node) => {
      const track = node.firstElementChild!.getBoundingClientRect()
      const row = node
        .querySelector('[data-slot="campaign-schedule-board-row"]')!
        .getBoundingClientRect()
      const booking = node
        .querySelector('[data-booking-id="booking-1"]')!
        .getBoundingClientRect()
      const start = node
        .querySelector('[data-slot="campaign-start-marker"]')!
        .getBoundingClientRect()
      const end = node
        .querySelector('[data-slot="campaign-end-marker"]')!
        .getBoundingClientRect()
      return {
        frame: node.getBoundingClientRect().width,
        track: track.width,
        row: row.width,
        booking: booking.width,
        bookingX: booking.x,
        startX: start.x,
        endX: end.x,
        rowRight: row.right,
      }
    })
  await expect(timeline).toHaveAttribute("data-zoom", "week")
  const week = await measure()
  expect(week.track).toBeGreaterThanOrEqual(week.frame - 2)
  await matrix.getByRole("button", { name: "Zoom out" }).click()
  await expect(timeline).toHaveAttribute("data-zoom", "month")
  await expect
    .poll(async () => (await measure()).booking)
    .toBeLessThan(week.booking * 0.75)
  const month = await measure()
  expect(month.frame).toBeCloseTo(week.frame, 0)
  expect(month.track).toBeGreaterThanOrEqual(month.frame - 2)
  expect(month.booking).toBeLessThan(week.booking * 0.75)
  expect(month.bookingX).toBeCloseTo(month.startX, 0)
  expect(month.endX).toBeLessThan(month.rowRight - month.row * 0.4)
  await booking
    .getByRole("button", { name: "Resize end of Launch read" })
    .press("ArrowRight")
  await page.keyboard.press("Enter")
  await expect(booking).toHaveAttribute("data-end-index", "19")
  await matrix.getByRole("button", { name: "Zoom in" }).click()
  await expect(timeline).toHaveAttribute("data-zoom", "week")
  await expect
    .poll(async () => (await measure()).booking)
    .toBeGreaterThan(month.booking * 1.5)
  await expect(booking).toHaveAttribute("data-end-index", "19")
  await matrix.getByRole("button", { name: "Expand schedule" }).click()
  await matrix.getByRole("button", { name: "Zoom out" }).click()
  await expect(timeline).toHaveAttribute("data-zoom", "month")
  const expanded = await measure()
  expect(expanded.track).toBeGreaterThanOrEqual(expanded.frame - 2)
  expect(expanded.bookingX).toBeCloseTo(expanded.startX, 0)
  await page.setViewportSize({ width: 320, height: 900 })
  await expect
    .poll(() =>
      timeline.evaluate((node) => node.scrollWidth - node.clientWidth)
    )
    .toBeGreaterThan(0)
})

function creatorFlight(page: Page) {
  const panel = page.locator('[data-slot="creator-flight-panel"]')
  const timeline = panel.getByRole("region", {
    name: "Campaign schedule timeline",
  })
  const pick = (group: string, label: string) =>
    page
      .getByRole("group", { name: group })
      .getByRole("button", { name: label })
      .click()
  return {
    panel,
    timeline,
    open: (label: string) => pick("Flight opening zoom", label),
    length: (label: "Two weeks" | "Four weeks") => pick("Flight length", label),
    resize: (width: number) =>
      panel.evaluate((node, nextWidth) => {
        node.style.maxWidth = "none"
        node.style.width = `${nextWidth}px`
      }, width),
    overflow: () =>
      timeline.evaluate((node) => node.scrollWidth - node.clientWidth),
    scrollLeft: () => timeline.evaluate((node) => node.scrollLeft),
    headerLabels: () =>
      timeline
        .locator(
          '[data-slot="campaign-schedule-top-legend"] > :not([aria-hidden]) .text-ui-caption'
        )
        .allTextContents(),
    // ResizeObserver delivers before the next paint; two frames prove none was acted on.
    settle: () =>
      page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve))
          )
      ),
  }
}

async function openCreatorFlight(page: Page) {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.setViewportSize({ width: 1920, height: 1000 })
  await page.goto("/?view=daedalus")
  const flight = creatorFlight(page)
  await flight.panel.scrollIntoViewIfNeeded()
  return flight
}

// How a flight occupies its board: the gaps between its first and last
// bookings and the track edges, the header text a viewer can read, and
// whether any shown text clips.
function measureFlightBoard(timeline: Locator) {
  return timeline.evaluate((node) => {
    const row = node
      .querySelector('[data-slot="campaign-schedule-board-row"]')!
      .getBoundingClientRect()
    const bookings = [...node.querySelectorAll("[data-booking-id]")].map(
      (booking) => booking.getBoundingClientRect()
    )
    const shown = [
      ...node.querySelectorAll(
        '[data-slot="campaign-schedule-top-legend"] > :not([aria-hidden]) [class~="@container"] > span'
      ),
    ].filter((text) => getComputedStyle(text).visibility === "visible")
    return {
      overflow: node.scrollWidth - node.clientWidth,
      startGap: Math.min(...bookings.map((box) => box.left)) - row.left,
      endGap: row.right - Math.max(...bookings.map((box) => box.right)),
      rowWidth: row.width,
      shown: shown.map((text) => text.textContent),
      clipped: shown
        .filter((text) => text.scrollWidth > text.clientWidth)
        .map((text) => text.textContent),
    }
  })
}

test("fit stretches two- and four-week flights edge to edge with readable labels", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  const flight = creatorFlight(page)
  const panelBoards = {
    "Two weeks": {
      zoom: "week",
      shown: ["Jun 2026", "W23", "Jun 1–7", "W24", "Jun 8–14"],
    },
    "Four weeks": {
      zoom: "month",
      shown: ["Q2 2026", "Q3 2026", "Jun", "2026", "Jul", "2026"],
    },
  }
  const expected = {
    1440: panelBoards,
    768: panelBoards,
    390: {
      "Two weeks": { zoom: "month", shown: ["Q2 2026", "Jun", "2026"] },
      "Four weeks": { zoom: "month", shown: ["Q2 2026", "Jun", "Jul"] },
    },
    320: {
      "Two weeks": { zoom: "month", shown: ["Q2 2026", "Jun"] },
      "Four weeks": { zoom: "month", shown: ["Q2 2026", "Jun", "Jul"] },
    },
  } as const
  for (const width of [1440, 768, 390, 320] as const) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto("/?view=daedalus")
    for (const length of ["Two weeks", "Four weeks"] as const) {
      await flight.length(length)
      await flight.panel.scrollIntoViewIfNeeded()
      const { zoom, shown } = expected[width][length]
      await expect(flight.timeline).toHaveAttribute("data-zoom", zoom)
      const board = await measureFlightBoard(flight.timeline)
      // Bookings cover the first and last flight days, so both sit at the
      // track edges when no display dates trail the flight.
      expect(board.startGap).toBeLessThan(8)
      expect(board.endGap).toBeLessThan(8)
      expect(board.shown, `${length} at ${width}px`).toEqual(shown)
      expect(board.clipped).toEqual([])
      if (width >= 768) expect(board.overflow).toBeLessThanOrEqual(0)
      await flight.panel.screenshot({
        path: `output/flight-fit-${length === "Two weeks" ? 14 : 28}d-${width}.png`,
      })
    }
  }
})

test("fit opens a flight at the most detailed zoom its panel shows whole", async ({
  page,
}) => {
  const flight = await openCreatorFlight(page)
  for (const [length, width, zoom] of [
    ["Two weeks", 1500, "day"],
    ["Two weeks", 1000, "week"],
    ["Two weeks", 420, "week"],
    ["Two weeks", 300, "month"],
    ["Four weeks", 1000, "week"],
    ["Four weeks", 544, "month"],
  ] as const) {
    await flight.length(length)
    await flight.resize(width)
    await flight.open("Weeks")
    await flight.open("Fit flight")
    await expect(flight.timeline).toHaveAttribute("data-zoom", zoom)
    expect(await flight.overflow()).toBeLessThanOrEqual(0)
    expect(await flight.scrollLeft()).toBe(0)
  }
  // Months is the coarsest zoom, so a panel too narrow for its labels scrolls.
  await flight.resize(300)
  await flight.open("Weeks")
  await flight.open("Fit flight")
  await expect(flight.timeline).toHaveAttribute("data-zoom", "month")
  expect(await flight.overflow()).toBeGreaterThan(0)
  expect(await flight.headerLabels()).toEqual(["Jun", "Jul"])
})

test("fit settles before the first paint without a zoom animation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/?view=daedalus")
  const flight = creatorFlight(page)
  await flight.panel.scrollIntoViewIfNeeded()
  await flight.length("Four weeks")
  await flight.open("Weeks")
  await expect(flight.timeline).toHaveAttribute("data-zoom", "week")
  await flight.panel.evaluate((panel) => {
    const frames: string[] = []
    Object.assign(window, { flightFrames: frames })
    const record = () => {
      const region = panel.querySelector('[role="region"]')
      const track = region?.firstElementChild?.getBoundingClientRect()
      frames.push(
        `${region?.getAttribute("data-zoom")}:${Math.round(track?.width ?? 0)}`
      )
      if (frames.length < 24) requestAnimationFrame(record)
    }
    document.addEventListener("click", () => requestAnimationFrame(record), {
      capture: true,
      once: true,
    })
  })
  await flight.open("Fit flight")
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { flightFrames: string[] }).flightFrames
      )
    )
    .toHaveLength(24)
  const frames = await page.evaluate(
    () => (window as unknown as { flightFrames: string[] }).flightFrames
  )
  expect(new Set(frames).size).toBe(1)
  expect(frames[0]).toMatch(/^month:[1-9]\d+$/)
})

test("fit follows panel resizes until the viewer zooms", async ({ page }) => {
  const flight = await openCreatorFlight(page)
  await flight.resize(1000)
  await flight.open("Weeks")
  await flight.open("Fit flight")
  await expect(flight.timeline).toHaveAttribute("data-zoom", "week")
  await flight.resize(300)
  await expect(flight.timeline).toHaveAttribute("data-zoom", "month")
  await flight.resize(1000)
  await expect(flight.timeline).toHaveAttribute("data-zoom", "week")
  await flight.panel.getByRole("button", { name: "Zoom in" }).click()
  await expect(flight.timeline).toHaveAttribute("data-zoom", "day")
  for (const width of [300, 1500]) {
    await flight.resize(width)
    await flight.settle()
    await expect(flight.timeline).toHaveAttribute("data-zoom", "day")
  }
})

test("a manual zoom hands a fitted flight to the standard board", async ({
  page,
}) => {
  const flight = await openCreatorFlight(page)
  await flight.length("Four weeks")
  await flight.resize(1000)
  await flight.open("Fit flight")
  await expect(flight.timeline).toHaveAttribute("data-zoom", "week")
  await flight.panel.getByRole("button", { name: "Zoom out" }).click()
  await expect(flight.timeline).toHaveAttribute("data-zoom", "month")
  // The standard month board continues past the flight's last day.
  expect(await flight.headerLabels()).toEqual(["Jun", "Jul", "Aug"])
  const board = await measureFlightBoard(flight.timeline)
  expect(board.endGap).toBeGreaterThan(board.rowWidth / 3)
  await flight.resize(1500)
  await flight.settle()
  await expect(flight.timeline).toHaveAttribute("data-zoom", "month")
})

test("an explicit opening zoom is kept at any panel width", async ({
  page,
}) => {
  const flight = await openCreatorFlight(page)
  await flight.resize(640)
  await flight.open("Days")
  await expect(flight.timeline).toHaveAttribute("data-zoom", "day")
  expect(await flight.overflow()).toBeGreaterThan(0)
  expect(await flight.scrollLeft()).toBeGreaterThan(0)
  await flight.resize(1500)
  await flight.open("Months")
  await expect(flight.timeline).toHaveAttribute("data-zoom", "month")
  await flight.resize(640)
  await flight.settle()
  await expect(flight.timeline).toHaveAttribute("data-zoom", "month")
  // An explicit month board keeps its trailing display dates.
  await flight.length("Four weeks")
  await expect(flight.timeline).toHaveAttribute("data-zoom", "month")
  expect(await flight.headerLabels()).toEqual(["Jun", "Jul", "Aug"])
})

test("schedule header dates keep their type roles beside text colours", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" })
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/?view=web-mining")
  await page.getByRole("button", { name: "Show four weeks" }).click()
  const matrix = page.locator('[data-slot="campaign-schedule-matrix"]')
  const legend = matrix.locator('[data-slot="campaign-schedule-top-legend"]')
  const roleSize = (role: string) =>
    page.evaluate((className) => {
      const probe = document.createElement("span")
      probe.className = className
      document.body.append(probe)
      const size = getComputedStyle(probe).fontSize
      probe.remove()
      return size
    }, role)
  const micro = await roleSize("text-ui-micro")
  const caption = await roleSize("text-ui-caption")
  expect(micro).not.toBe(caption)
  await expect(legend.getByText(/^May \d+–\d+$/).first()).toHaveCSS(
    "font-size",
    micro
  )
  await expect(matrix.getByText("Month", { exact: true })).toHaveCSS(
    "font-size",
    micro
  )
  await expect(matrix.getByText("Creator", { exact: true })).toHaveCSS(
    "font-size",
    caption
  )
})
