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
