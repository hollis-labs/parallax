import { expect, test } from "@playwright/test"
import { calendarSeries, dayObservation, daySeries, operationsModel } from "../src/operations/model"
import { sourceDataset, timelineFrames } from "../src/playback/model"

test("dashboard rollups preserve partial coverage receipt breakdown and every visible cutoff", () => {
  for (const scenario of ["populated", "large", "sparse"]) {
    for (const cutoff of timelineFrames(sourceDataset(scenario))) {
      const model = operationsModel(scenario, "", { cutoff }),
        days = daySeries(model),
        calendar = calendarSeries(model)
      for (const day of days) {
        const coverage = dayObservation(model, day.date)
        const receipts = model.usage.filter(
          (u) => u.time.startsWith(day.date) && Date.parse(u.time) >= coverage.from,
        )
        expect(day.count === null).toBe(!coverage.known)
        if (day.tokens !== null) {
          expect(day.inputTokens! + day.outputTokens!).toBe(day.tokens)
          expect(day.tokens).toBe(receipts.reduce((sum, u) => sum + u.tokens, 0))
        }
      }
      expect(
        calendar.every(
          (c) =>
            c.count === null ||
            c.count ===
              model.runs.filter(
                (r) =>
                  r.started.startsWith(c.day) &&
                  Date.parse(r.started) >= c.from &&
                  Date.parse(r.started) <= c.through,
              ).length,
        ),
      ).toBeTruthy()
      expect(
        calendar.filter((c) => c.day > cutoff.slice(0, 10)).every((c) => c.count === null),
      ).toBeTruthy()
    }
  }
  const early = operationsModel("populated", "", { cutoff: "2026-10-04T14:10:01Z" })
  expect(early.stats.tokens).toBeNull()
  expect(daySeries(early).every((d) => d.tokens === null)).toBeTruthy()
  const final = daySeries(operationsModel("populated")).at(-1)!
  expect(final.partial).toBeTruthy()
  expect(final.count).toBe(8)
  for (const state of ["unavailable", "loading", "error", "permission-denied"])
    expect(calendarSeries(operationsModel(state)).every((c) => c.count === null)).toBeTruthy()
})

test("reference dashboard compositions preserve intensity exact date tables themes and narrow inspection", async ({
  page,
}, info) => {
  await page.goto("/?scenario=large&view=Activity&mode=light")
  const weights = await page
    .locator(".calendar-intensity")
    .evaluateAll((nodes) =>
      nodes.map((n) => (n as HTMLElement).style.getPropertyValue("--activity-weight")),
    )
  expect(new Set(weights).size).toBeGreaterThan(1)
  const paints = await page.locator(".calendar-weeks .heatmap-cell").evaluateAll((nodes) =>
    nodes.map((n) => ({
      count: n.getAttribute("data-count"),
      background: getComputedStyle(n).backgroundColor,
    })),
  )
  const positivePaints = paints.filter((p) => Number(p.count) > 0),
    zeroPaint = paints.find((p) => p.count === "0"),
    gapPaint = paints.find((p) => p.count === "unavailable")
  expect(new Set(positivePaints.map((p) => p.background)).size).toBeGreaterThan(1)
  expect(zeroPaint).toBeDefined()
  expect(gapPaint).toBeDefined()
  expect(zeroPaint?.background).not.toBe(gapPaint?.background)
  expect(
    positivePaints.every(
      (p) => p.background !== zeroPaint?.background && p.background !== gapPaint?.background,
    ),
  ).toBeTruthy()

  const pair = page.locator(".activity-pair"),
    columns = await pair.evaluate((n) => getComputedStyle(n).gridTemplateColumns)
  expect(columns.split(" ").length).toBe(2)
  const calendarDisclosure = page.getByText("Exact calendar dates, counts and coverage", {
    exact: true,
  })
  await calendarDisclosure.focus()
  await page.keyboard.press("Enter")
  await expect(
    page
      .getByRole("table", { name: "Run-start evidence at the selected fixed UTC cutoff" })
      .getByRole("row")
      .filter({ hasText: "2026-10-04" }),
  ).toContainText("Partial day")
  await page.keyboard.press("Enter")
  await page.getByTestId("page-scroll").evaluate((n) => {
    n.scrollTop = 0
  })
  await page.screenshot({ path: info.outputPath("activity-reference.png"), animations: "disabled" })
  await pair.scrollIntoViewIfNeeded()
  await page.screenshot({
    path: info.outputPath("activity-pulse-recent.png"),
    animations: "disabled",
  })
  await page.getByRole("button", { name: "Mission Control", exact: true }).click()
  await expect(
    page.getByRole("img", { name: "14-day run volume with coverage gaps" }),
  ).toBeVisible()
  await expect(page.getByRole("table", { name: /Input \/ output tokens/ })).toBeVisible()
  await page.getByTestId("page-scroll").evaluate((n) => {
    n.scrollTop = 0
  })
  await page.screenshot({ path: info.outputPath("mission-reference.png"), animations: "disabled" })
  await page.getByRole("button", { name: "Usage", exact: true }).click()
  await expect(page.getByRole("img", { name: "14-day cost with coverage gaps" })).toBeVisible()
  await page.screenshot({ path: info.outputPath("usage-reference.png"), animations: "disabled" })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/?scenario=sparse&view=Activity&mode=dark&theme=p1-green-phosphor")
  expect(
    await pair.evaluate((n) => getComputedStyle(n).gridTemplateColumns.split(" ").length),
  ).toBe(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  await page.getByTestId("page-scroll").evaluate((n) => {
    n.scrollTop = 0
  })
  await page.screenshot({ path: info.outputPath("activity-narrow.png"), animations: "disabled" })
  await page
    .getByRole("button", { name: /Review gateway permission/ })
    .first()
    .focus()
  await page.keyboard.press("Enter")
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).not.toBeVisible()
})

for (const rootSize of [16, 20, 24]) {
  test(`dashboard defaults reach catalog and Torque routes at root ${rootSize}`, async ({
    page,
  }) => {
    for (const view of ["Examples", "Primitives", "Run Explorer"]) {
      await page.goto(`/?view=${encodeURIComponent(view)}`)
      await page.evaluate((size) => {
        document.documentElement.style.fontSize = `${size}px`
      }, rootSize)
      await expect(page.locator("h1").first()).toHaveCSS("font-size", "11px")
      if (view !== "Run Explorer") {
        await expect(page.getByRole("heading", { name: view, exact: true })).toHaveCSS(
          "font-size",
          "11px",
        )
        const card = page.locator('[data-slot="card"]').first()
        await expect(card).toHaveCSS("border-top-width", "0px")
        const background = await page
          .locator("body")
          .evaluate((el) => getComputedStyle(el).backgroundColor)
        await expect(card).toHaveCSS("background-color", background)
      } else {
        await expect(page.locator("tbody td").first()).toHaveCSS("font-size", "13px")
        await expect(page.locator("thead").first()).toHaveCSS("font-size", "10px")
      }
    }
    for (const screen of ["tasks", "runs", "dashboard", "about"]) {
      await page.goto(`/?example=torque&screen=${screen}`)
      await page.evaluate((size) => {
        document.documentElement.style.fontSize = `${size}px`
      }, rootSize)
      await expect(page.locator(".torque-header h1")).toHaveCSS("font-size", "11px")
      await expect(page.locator(".torque-header")).toHaveCSS("padding-left", `${rootSize}px`)
    }
  })
}

test("app theme overrides reach separate catalog pages and explicit raised surfaces", async ({
  page,
}) => {
  for (const view of ["Examples", "Primitives"]) {
    await page.goto(`/?view=${view}`)
    await page.evaluate(() => {
      document.documentElement.style.setProperty("--dash-page-padding", "27px")
      document.documentElement.style.setProperty("--dash-page-heading-size", "15px")
    })
    await expect(page.getByTestId("page-scroll")).toHaveCSS("padding-left", "27px")
    await expect(page.getByRole("heading", { name: view, exact: true })).toHaveCSS(
      "font-size",
      "15px",
    )
    const card = page.locator('[data-slot="card"]').first()
    await card.evaluate((el) => el.setAttribute("data-dashboard-surface", "raised"))
    await expect(card).toHaveCSS("border-top-width", "1px")
  }
})

for (const rootSize of [16, 20]) {
  test(`shared dropdown and search controls stay coherent at root ${rootSize}`, async ({
    page,
  }) => {
    await page.goto("/?view=Primitives")
    await page.evaluate((size) => {
      document.documentElement.style.fontSize = `${size}px`
    }, rootSize)
    const gallery = page.getByLabel("Gallery state"),
      reset = page.getByRole("button", { name: "Reset gallery", exact: true })
    await expect(gallery).toHaveCSS("height", `${rootSize * 2}px`)
    await expect(reset).toHaveCSS("height", `${rootSize * 2}px`)
    const font = await reset.evaluate((el) => getComputedStyle(el).fontSize)
    await expect(gallery).toHaveCSS("font-size", font)
    await expect(page.getByLabel("Scenario", { exact: true })).toHaveCSS("font-size", font)
    await gallery.click()
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("Enter")
    await expect(gallery).toHaveValue("empty")
    await gallery.focus()
    await expect(gallery).toHaveCSS("outline-style", "none")
    await page.keyboard.press("Tab")
    await expect(reset).toBeFocused()
    await expect(reset).toHaveCSS("outline-style", "none")
    expect(
      await reset.evaluate((el) =>
        getComputedStyle(el).getPropertyValue("--tw-ring-shadow").trim(),
      ),
    ).toBe("0 0 transparent")

    const backgrounds: string[] = []
    for (const screen of ["tasks", "runs"]) {
      await page.goto(`/?example=torque&screen=${screen}`)
      const input = page.getByLabel(
        screen === "tasks" ? "Example task filter" : "Search admitted runs",
        { exact: true },
      )
      await expect(input).toHaveCSS("border-top-width", "0px")
      await expect(input).toHaveCSS("padding-top", "0px")
      const field = input.locator("..")
      const before = await field.evaluate((el) => getComputedStyle(el).backgroundColor)
      backgrounds.push(before)
      await input.focus()
      await expect(input).toHaveCSS("outline-style", "none")
      await expect(field).toHaveCSS("outline-style", "none")
      await expect(field).not.toHaveCSS("background-color", before)
      await expect(input).toHaveCSS("background-color", "rgba(0, 0, 0, 0)")
      const trigger = page.getByRole("button", {
        name: screen === "tasks" ? "Filter by project" : "Filter run owner",
        exact: true,
      })
      await trigger.click()
      const popup = page.locator('[data-slot="popover-content"]')
      const second = popup.getByRole("option").nth(1)
      await expect(second).toHaveCSS("border-top-width", "1px")
      if (screen === "runs") {
        const viewport = popup.locator('[data-slot="scroll-area-viewport"]')
        expect(await viewport.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true)
        await popup.getByRole("option").last().scrollIntoViewIfNeeded()
        await expect(popup.getByRole("option").last()).toBeInViewport()
      }
      await expect(trigger).toHaveCSS("outline-style", "none")
      await page.keyboard.press("Escape")
      await expect(trigger).toBeFocused()
      await expect(trigger).toHaveCSS("outline-style", "none")
    }
    expect(backgrounds[0]).toBe(backgrounds[1])
    await page.locator('[data-testid="data-table-row"]').first().click()
    await expect(page.getByRole("dialog")).toBeVisible()
    await expect(page.locator(".torque-header h1")).toHaveCSS("outline-style", "none")
    await page.keyboard.press("Escape")
  })
}
