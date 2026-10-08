import { expect, type Locator, type Page, test } from "@playwright/test"
import {
  observationAppearances,
  observationCandidate,
  observationReviewModel,
  reviewClocks,
  reviewedResources,
} from "../src/observation-review/model"

test("observation review bounds joins and clocks preserve receipts without fabricating successes", () => {
  const data = observationReviewModel(),
    original = JSON.stringify([data.fixture, data.operations])
  for (const state of observationAppearances)
    for (const resource of reviewedResources) {
      const m = observationReviewModel(state, "populated", resource)
      expect(JSON.stringify([m.fixture, m.operations])).toBe(original)
      expect(m.series.points.length).toBeLessThanOrEqual(m.series.requested.limit)
      expect(
        m.series.points.every(
          (p, i) =>
            Number.isFinite(Date.parse(p.at)) &&
            p.at >= m.series.requested.from &&
            p.at <= m.series.requested.to &&
            (i === 0 || p.at > m.series.points[i - 1].at),
        ),
      ).toBe(true)
    }
  for (const clock of reviewClocks) {
    const m = observationReviewModel("refresh-error", "populated", "health", clock)
    expect(m.observations.health.observedAt).toBe(data.selected.observedAt)
    expect(observationCandidate(m, "health")?.receipt).toBe(data.selected.observedAt)
  }
  expect(observationReviewModel("idle").observations.health.observedAt).toBeUndefined()
  expect(observationCandidate(observationReviewModel("idle"), "health")?.receipt).toBeNull()
  expect(observationCandidate(observationReviewModel("locked"), "health")).toBeNull()
  expect(data.stats.find((r) => r.id === "tokens")?.value).toBe(
    data.operations.usage.reduce((s, u) => s + u.tokens, 0),
  )
  expect(data.stats.find((r) => r.id === "first-zero")?.value).toBe(0)
  expect(data.stats.find((r) => r.id === "missing")?.value).toBeNull()
  expect(Number.isFinite(observationReviewModel("nonfinite").stats.at(-1)!.value)).toBe(false)
  expect(observationReviewModel("gap").series.points[2].value).toBeNull()
  expect(data.fixture.tokenSamples[2].value).not.toBeNull()
  expect(observationReviewModel("bounded-window").series.points).toEqual([])
})
async function capture(locator: Locator, key: string) {
  await locator.evaluate((n, k) => {
    const prop = Object.keys(n).find((p) => p.startsWith("__reactProps$"))
    if (!prop) throw Error("missing props")
    ;(window as unknown as Record<string, unknown>)[k] = (
      n as unknown as Record<string, { onClick?: () => void }>
    )[prop].onClick
  }, key)
}
async function invoke(page: Page, key: string) {
  await page.evaluate((k) => {
    const fn = (window as unknown as Record<string, unknown>)[k]
    if (typeof fn !== "function") throw Error("missing callback")
    fn()
  }, key)
}
const selected = (page: Page) =>
  page.getByRole("heading", { name: "Selected receipt", exact: true }).locator("..")
test("actual status availability equality stale future invalid pause and retained phase stay separate from health", async ({
  page,
}, info) => {
  await page.goto("/?view=Observation%20Review&theme=p4-white&mode=light")
  const receipt = selected(page)
  await expect(receipt.getByText("Observed", { exact: true })).toBeVisible()
  await page.getByLabel("Review clock").selectOption("at-threshold")
  await expect(receipt.getByText("Observed", { exact: true })).toBeVisible()
  await expect(receipt).toContainText("120s ago")
  await page.getByLabel("Review clock").selectOption("after-threshold")
  await expect(receipt.getByText("Stale", { exact: true })).toBeVisible()
  for (const clock of ["future-age", "invalid-clock", "invalid-threshold"]) {
    await page.getByLabel("Review clock").selectOption(clock)
    await expect(receipt.getByText("Observation time unavailable", { exact: true })).toBeVisible()
    await expect(page.getByTestId("retained-observation")).toBeVisible()
  }
  await page.getByLabel("Review clock").selectOption("reference")
  await page.getByLabel("Observation appearance").selectOption("paused")
  await expect(receipt.getByText("Paused", { exact: true })).toBeVisible()
  await expect(receipt).toContainText("Polling paused")
  await page.getByLabel("Review clock").selectOption("after-threshold")
  await expect(receipt.getByText("Stale", { exact: true })).toBeVisible()
  await expect(receipt).toContainText("Polling paused")
  await page.getByLabel("Review clock").selectOption("reference")
  await page.getByLabel("Observation appearance").selectOption("refresh-loading")
  await expect(receipt).toContainText("Refreshing")
  await expect(page.getByTestId("retained-observation")).toBeVisible()
  await expect(receipt.locator("time")).toHaveAttribute("datetime", "2026-10-04T14:29:00Z")
  await page.getByLabel("Observation appearance").selectOption("refresh-error")
  await expect(receipt).toContainText("Refresh failed")
  await expect(receipt.locator("time")).toHaveAttribute("datetime", "2026-10-04T14:29:00Z")
  await expect(page.getByTestId("retained-observation")).toBeVisible()
  for (const state of ["idle", "initial-loading", "initial-error"]) {
    await page.getByLabel("Observation appearance").selectOption(state)
    await expect(page.getByTestId("observation-review-source")).toContainText(
      "displayed successful receipt none (withheld)",
    )
    await expect(page.getByTestId("retained-observation")).toHaveCount(0)
    await expect(receipt.locator("time")).toHaveCount(0)
  }
  await page.getByLabel("Observation appearance").selectOption("unsupported")
  await expect(receipt).toContainText("Unsupported resource")
  await expect(receipt.locator("time")).toHaveCount(0)
  await expect(page.getByTestId("retained-observation")).toHaveCount(0)
  await page.getByLabel("Observation appearance").selectOption("recorded")
  for (const health of ["healthy", "degraded", "unhealthy", "unknown"]) {
    await page.getByLabel("Health appearance", { exact: true }).selectOption(health)
    await expect(
      page
        .getByRole("heading", { name: "Snapshot health appearance", exact: true })
        .locator("..")
        .getByText(health, { exact: true })
        .first(),
    ).toBeVisible()
  }
  await page.getByLabel("Health appearance", { exact: true }).selectOption("derived")
  await page
    .getByRole("heading", { name: "Selected receipt", exact: true })
    .scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath("observation-status-desktop.png") })
  await page
    .getByRole("heading", { name: "Fixed receipt and missing samples", exact: true })
    .scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath("observation-stats-desktop.png") })
})
test("actual stats preserve zero null nonfinite units and supported empty health without false observed values", async ({
  page,
}) => {
  await page.goto("/?view=Observation%20Review")
  const stats = page
    .getByRole("heading", { name: "Fixed receipt and missing samples", exact: true })
    .locator("..")
  await expect(stats).toContainText("Missing sample")
  await expect(stats.getByText("0", { exact: true })).toBeVisible()
  await expect(stats).toContainText("count · cumulative counter")
  await expect(stats).toContainText("seconds · gauge")
  await page.getByLabel("Observation appearance").selectOption("nonfinite")
  await expect(stats).toContainText("Invalid sample")
  await expect(stats).toContainText("milliseconds · gauge")
  await page.getByLabel("Observation appearance").selectOption("empty")
  await expect(stats).toContainText("No stats declared")
  await expect(page.getByText("No checks returned", { exact: true })).toBeVisible()
  await expect(page.getByText("No samples in requested range", { exact: true })).toBeVisible()
  await page.getByLabel("Observation appearance").selectOption("recorded")
  await page.getByLabel("Reviewed resource").selectOption("stats")
  await page.getByLabel("Observation appearance").selectOption("initial-error")
  await expect(stats.getByText("0", { exact: true })).toHaveCount(0)
  await expect(stats.getByText("Missing sample", { exact: true })).toHaveCount(0)
})
test("exact UTC sample nonuniform x geometry null gap bounds truncation and gauge remain real chart inputs", async ({
  page,
}, info) => {
  await page.goto("/?view=Observation%20Review")
  await page.getByLabel("Reviewed resource").selectOption("token-series")
  const chart = page
    .getByRole("heading", { name: "Exact supplied cumulative samples", exact: true })
    .locator("..")
  await chart.scrollIntoViewIfNeeded()
  const dots = chart.locator(".recharts-line-dots circle")
  await expect(dots).toHaveCount(9)
  const x = await dots.evaluateAll((ns) => ns.map((n) => Number(n.getAttribute("cx"))))
  expect((x[1] - x[0]) / (x[2] - x[1])).toBeCloseTo(75 / 120, 2)
  await expect(
    chart.getByRole("rowheader", { name: "2026-10-04T14:10:00Z", exact: true }),
  ).toBeVisible()
  await expect(chart.getByRole("cell", { name: "0", exact: true })).toBeVisible()
  await page.getByLabel("Observation appearance").selectOption("gap")
  await expect(dots).toHaveCount(8)
  const path = await chart.locator(".recharts-line-curve").getAttribute("d")
  expect((path?.match(/M/g) ?? []).length).toBe(2)
  await expect(chart.getByRole("cell", { name: "No sample", exact: true })).toBeVisible()
  await chart.scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath("observation-series-desktop.png") })
  await page.getByLabel("Observation appearance").selectOption("truncated")
  await expect(chart).toContainText("Incomplete series")
  await expect(chart).toContainText("Limit 4; received 4 samples")
  await expect(dots).toHaveCount(4)
  await page.getByLabel("Observation appearance").selectOption("bounded-window")
  await expect(chart).toContainText("No samples in requested range")
  await expect(dots).toHaveCount(0)
  await page.getByLabel("Observation appearance").selectOption("recorded")
  await page.getByLabel("Reviewed resource").selectOption("duration-series")
  await expect(page.getByRole("figure")).toContainText("seconds, gauge")
  await expect(page.getByRole("cell", { name: "No sample", exact: true })).toHaveCount(2)
  await expect(page.getByRole("row").filter({ hasText: "2026-10-04T14:10:00Z" })).toContainText(
    "No sample",
  )
  await expect(page.getByRole("row").filter({ hasText: "2026-10-04T14:20:00Z" })).toContainText(
    "No sample",
  )
  expect(await page.locator(".recharts-line-curve").getAttribute("stroke")).toBe(
    "var(--color-primary)",
  )
})
test("native retry current resource receipt clock policy source and retained callbacks retire across StrictMode", async ({
  page,
}, info) => {
  const writes: string[] = [],
    external: string[] = [],
    errors: string[] = []
  page.on("request", (r) => {
    if (r.method() !== "GET") writes.push(r.url())
    if (!r.url().startsWith("http://127.0.0.1:")) external.push(r.url())
  })
  page.on("pageerror", (e) => errors.push(e.message))
  await page.goto("http://127.0.0.1:18545/?view=Observation%20Review")
  await page.getByLabel("Observation appearance").selectOption("refresh-error")
  const retry = page.getByRole("button", { name: "Retry Selected receipt", exact: true })
  await capture(retry, "oldRetry")
  await retry.focus()
  await page.keyboard.press("Enter")
  await expect(page.locator(".evidence-json")).toContainText("2026-10-04T14:29:00Z")
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Release oldest scripted inspection", exact: true })
    .click()
  await expect(page.getByRole("dialog")).toContainText(
    "Successful receipt time, source values and availability unchanged",
  )
  await page.screenshot({ path: info.outputPath("observation-retry-desktop.png") })
  await capture(page.getByRole("button", { name: "Close inspection", exact: true }), "oldClose")
  await page.keyboard.press("Escape")
  await expect(retry).toBeFocused()
  await retry.click()
  await invoke(page, "oldClose")
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.keyboard.press("Escape")
  await page.getByLabel("Review clock").selectOption("after-threshold")
  await invoke(page, "oldRetry")
  await page
    .getByTestId("page-scroll")
    .getByRole("button", { name: /Release oldest scripted inspection/ })
    .click()
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await retry.click()
  await page.keyboard.press("Escape")
  await page.getByLabel("Reviewed resource").selectOption("stats")
  await page
    .getByTestId("page-scroll")
    .getByRole("button", { name: /Release oldest scripted inspection/ })
    .click()
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await retry.click()
  await expect(page.locator(".evidence-json")).toContainText("2026-10-04T14:29:10Z")
  await page.keyboard.press("Escape")
  await page.getByLabel("Reviewed observation source").selectOption("copy")
  await page
    .getByTestId("page-scroll")
    .getByRole("button", { name: /Release oldest scripted inspection/ })
    .click()
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.getByLabel("Observation appearance").selectOption("locked")
  await expect(retry).toHaveCount(0)
  await expect(page.getByText("Refresh failed", { exact: true }).first()).toBeVisible()
  await page.getByLabel("Observation appearance").selectOption("denied")
  await expect(page.getByText("Observation evidence withheld", { exact: true })).toBeVisible()
  await expect(page.locator("figure")).toHaveCount(0)
  await page.getByRole("button", { name: "Activity", exact: true }).click()
  await invoke(page, "oldRetry")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  expect(writes).toEqual([])
  expect(external).toEqual([])
  expect(errors).toEqual([])
})
test("390 dark observation chart accessible UTC and local modal footer are bounded without copy or APIs", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/?view=Observation%20Review&theme=p1-green-phosphor&mode=dark")
  await page.getByLabel("Reviewed resource").selectOption("token-series")
  await page.getByLabel("Observation appearance").selectOption("gap")
  const chart = page
    .getByRole("heading", { name: "Exact supplied cumulative samples", exact: true })
    .locator("..")
  await chart.scrollIntoViewIfNeeded()
  await expect(chart.locator("svg.recharts-surface")).toBeVisible()
  await page.screenshot({ path: info.outputPath("observation-series-narrow.png") })
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await page.getByLabel("Observation appearance").selectOption("refresh-error")
  await page.getByRole("button", { name: "Retry Selected receipt", exact: true }).click()
  await expect(page.getByRole("dialog")).toBeVisible()
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press("Tab")
    await expect
      .poll(() => page.evaluate(() => !!document.activeElement?.closest("[role=dialog]")))
      .toBe(true)
  }
  await page.locator(".evidence-json").scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath("observation-retry-narrow.png") })
  const dialog = await page.getByRole("dialog").boundingBox()
  for (const button of await page.locator(".settings-plan-footer button").all()) {
    const b = await button.boundingBox()
    expect(b!.x).toBeGreaterThanOrEqual(dialog!.x)
    expect(b!.x + b!.width).toBeLessThanOrEqual(dialog!.x + dialog!.width + 1)
  }
  await page.keyboard.press("Escape")
  await expect(page.locator(".settings-plan-dialog")).toHaveCount(0)
  await expect(page.getByRole("button", { name: /copy/i })).toHaveCount(0)
  const requests: string[] = []
  page.on("request", (r) => {
    if (/\/api\/|\/plugins\//.test(r.url())) requests.push(r.url())
  })
  for (const story of [
    "initial-loading",
    "initial-error",
    "threshold-equality",
    "future-age",
    "invalid-clock",
    "invalid-threshold",
    "invalid-receipt",
    "unsupported",
    "empty",
    "nonfinite-stat",
    "duration-gauge",
    "empty-bounded-window",
    "denied",
    "locked-retry",
  ]) {
    await page.goto(
      `http://127.0.0.1:18542/iframe.html?id=observation-controlled-observation-review--${story}&viewMode=story`,
    )
    await expect(page.getByLabel("Controlled observation review")).toBeVisible()
    await expect(page.getByRole("button", { name: /copy/i })).toHaveCount(0)
  }
  expect(requests).toEqual([])
})
