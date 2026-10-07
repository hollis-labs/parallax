import { expect, test } from "@playwright/test"
import { operationsModel } from "../src/operations/model"
import { sourceDataset, timelineFrames } from "../src/playback/model"
import { widgetModel, widgetStates } from "../src/widgets/model"

test("widget buckets use admitted receipts preserve null positions and same-unit partitions", () => {
  for (const scenario of ["populated", "large", "empty", "permission-denied"])
    for (const state of widgetStates) {
      const source = sourceDataset(scenario)
      for (const cutoff of timelineFrames(source)
        .filter((_, i) => i % 5 === 0)
        .concat(source.clock)) {
        const model = operationsModel(scenario, "", { cutoff }),
          view = widgetModel(model, state)
        expect(JSON.stringify(view)).toBe(JSON.stringify(widgetModel(model, state)))
        const actual = new Set(
          model.dataset.events
            .filter((e) => e.type === "run.started" && e.time <= cutoff)
            .map((e) => e.runId),
        )
        expect(view.runs.every((r) => actual.has(r.id) && r.started <= cutoff)).toBe(true)
        expect(view.primary.length).toBe(view.secondary.length)
        view.primary.forEach((n, i) => {
          expect(n + view.secondary[i]).toBe(view.totals[i])
          expect(Number.isFinite(n) && n >= 0).toBe(true)
        })
        for (const bucket of view.bins)
          if (bucket.known) {
            expect((bucket.finished ?? 0) + (bucket.noFinish ?? 0)).toBe(bucket.total)
            expect(bucket.from <= cutoff).toBe(true)
          } else expect(bucket.total).toBeNull()
        if (view.count !== null)
          expect(view.segments.reduce((s, n) => s + n.value, 0)).toBe(view.count)
        expect(view.recent.map((r) => r.started)).toEqual(
          [...view.recent.map((r) => r.started)].sort().reverse(),
        )
        if (
          state === "gapped" &&
          view.bins.some((b) => b.index === 2 && !b.known && view.bins.at(-1)?.known)
        )
          expect(view.chartAllowed).toBe(false)
      }
    }
  const zero = widgetModel(operationsModel("populated"), "observed-zero")
  expect(zero.totals).toEqual([0, 0])
  expect(zero.peak).toBe(0)
  expect(zero.scaleFloor).toBe(1)
  expect(zero.count).toBe(0)
  const final = widgetModel(operationsModel("populated"))
  expect(final.totals).toEqual([2, 1, 1, 1, 2, 1, 0, 0])
  expect(final.primary.reduce((s, n) => s + n, 0)).toBe(6)
  const missing = widgetModel(operationsModel("populated", "", { cutoff: "2026-10-04T14:09:59Z" }))
  expect(missing.count).toBeNull()
  expect(missing.totals).toEqual([])
})
async function geometry(page: import("@playwright/test").Page) {
  const spark = await page
    .getByTestId("widget-spark")
    .locator('[aria-hidden="true"]>div')
    .evaluateAll((cols) =>
      cols.map((col) => ({
        title: col.getAttribute("title"),
        height: col.getBoundingClientRect().height,
        viewport: col.parentElement?.getBoundingClientRect().height,
        cells: [...col.children].map((c) => ({
          color: getComputedStyle(c).backgroundColor,
          height: c.getBoundingClientRect().height,
          width: c.getBoundingClientRect().width,
        })),
      })),
    )
  expect(spark).toHaveLength(8)
  expect(spark.map((c) => Number(c.title))).toEqual([2, 1, 1, 1, 2, 1, 0, 0])
  for (const col of spark) {
    expect(col.cells).toHaveLength(6)
    expect(col.height).toBeLessThanOrEqual((col.viewport ?? 0) + 0.1)
    expect(col.cells.every((c) => c.height > 0 && Math.abs(c.height - c.width) < 0.2)).toBe(true)
  }
  expect(new Set(spark.flatMap((c) => c.cells.map((cell) => cell.color))).size).toBeGreaterThan(1)
  expect(spark[0].cells.filter((c) => c.color === spark[0].cells[0].color)).toHaveLength(6)
  expect(spark[1].cells.filter((c) => c.color === spark[0].cells[0].color)).toHaveLength(3)
  const mini = await page
    .getByTestId("widget-mini")
    .locator('[aria-hidden="true"]>div')
    .evaluateAll((cols) =>
      cols.map((c) => ({
        height: c.getBoundingClientRect().height,
        viewport: c.parentElement?.getBoundingClientRect().height,
      })),
    )
  expect(mini).toHaveLength(8)
  expect(
    mini.every((c) => c.height <= (c.viewport ?? 0) + 0.2),
    JSON.stringify(mini),
  ).toBe(true)
  const signal = await page
    .getByTestId("widget-signal")
    .locator('[aria-hidden="true"]>div')
    .evaluateAll((cols) =>
      cols.map((c) => ({
        title: c.getAttribute("title"),
        height: c.getBoundingClientRect().height,
        viewport: c.parentElement?.getBoundingClientRect().height,
        colors: [...c.children].map((n) => getComputedStyle(n).backgroundColor),
      })),
    )
  expect(signal).toHaveLength(16)
  expect(signal.every((c) => c.height <= (c.viewport ?? 0) + 0.2)).toBe(true)
  expect(new Set(signal.flatMap((c) => c.colors)).size).toBeGreaterThan(2)
}
test("actual widget normalized paint geometry denominator and recent keyboard inspection", async ({
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
  await page.goto("/?view=Widgets&theme=p4-white&mode=light")
  await geometry(page)
  await expect(page.getByTestId("widget-actual-peak")).toHaveText("2")
  const circles = page.locator(".widget-gallery svg circle[stroke]")
  await expect(circles).toHaveCount(3)
  const strokes = await circles.evaluateAll((nodes) =>
    nodes.map((n) => ({
      color: getComputedStyle(n).stroke,
      dashes: (n.getAttribute("stroke-dasharray") ?? "").split(" ").map(Number),
    })),
  )
  expect(new Set(strokes.map((n) => n.color)).size).toBeGreaterThan(1)
  expect(strokes.every((n) => n.dashes[0] > 0 && n.dashes[1] > 0)).toBe(true)
  const recent = page.locator(".widget-gallery ul button")
  await expect(recent).toHaveCount(5)
  await expect(recent.first()).toContainText("RUN-008")
  await expect(recent.last()).toContainText("RUN-004")
  await recent.first().focus()
  await page.keyboard.press("Enter")
  const modal = page.getByRole("dialog", { name: "Widget run inspection RUN-008", exact: true })
  await expect(modal).toBeVisible()
  await expect(modal).toContainText("TRACE-008")
  await modal.getByRole("button", { name: "Close widget record", exact: true }).evaluate((n) => {
    const key = Object.keys(n).find((k) => k.startsWith("__reactProps$"))
    const props = key ? (n as unknown as Record<string, { onClick?: () => void }>)[key] : undefined
    ;(window as unknown as { retiredWidgetClose?: () => void }).retiredWidgetClose = props?.onClick
  })
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press("Tab")
    await expect.poll(() => modal.evaluate((n) => n.contains(document.activeElement))).toBe(true)
  }
  await page.keyboard.press("Escape")
  await expect(recent.first()).toBeFocused()
  await recent.nth(1).click()
  const replacement = page.getByRole("dialog", {
    name: "Widget run inspection RUN-007",
    exact: true,
  })
  await expect(replacement).toBeVisible()
  await page.evaluate(() => {
    const callback = (window as unknown as { retiredWidgetClose?: () => void }).retiredWidgetClose
    if (!callback) throw new Error("Actual captured close callback missing")
    callback()
  })
  await expect(replacement).toBeVisible()
  await page.keyboard.press("Escape")
  await page.getByTestId("page-scroll").evaluate((n) => (n.scrollTop = 0))
  await page.screenshot({ path: info.outputPath("widgets-desktop.png"), animations: "disabled" })
  await page.getByTestId("widget-signal").scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath("widgets-bars.png"), animations: "disabled" })
  await page.getByRole("heading", { name: "DonutChart", exact: true }).scrollIntoViewIfNeeded()
  await page.screenshot({
    path: info.outputPath("widgets-distribution-recent.png"),
    animations: "disabled",
  })
  expect(writes).toEqual([])
  expect(external).toEqual([])
  expect(errors).toEqual([])
})
test("observed zero gaps blocked states and playback retire stale selected records", async ({
  page,
}) => {
  await page.goto("/?view=Widgets")
  await page.getByLabel("Widget state").selectOption("observed-zero")
  await expect(page.getByTestId("widget-actual-peak")).toHaveText("0")
  await expect(page.getByTestId("widget-signal")).toContainText("peak 1")
  await expect(page.getByText("No data recorded", { exact: true })).toBeVisible()
  const dataRows = page
    .getByRole("table", { name: "Recorded run-start bucket counts (unit: runs)" })
    .locator("tbody tr")
  await expect(dataRows).toHaveCount(2)
  await expect(dataRows.first()).toContainText("Covered")
  await page.getByLabel("Widget state").selectOption("gapped")
  await expect(page.getByTestId("widget-spark")).toHaveCount(0)
  await expect(dataRows).toHaveCount(8)
  await expect(dataRows.nth(2)).toContainText("Unavailable")
  await expect(dataRows.nth(3)).toContainText("Covered")
  for (const state of ["loading", "error", "denied", "unknown"]) {
    await page.getByLabel("Widget state").selectOption(state)
    await expect(page.getByTestId("widget-signal")).toHaveCount(0)
    await expect(page.getByTestId("widget-actual-peak")).toHaveText("Unavailable")
  }
  await page.getByLabel("Widget state").selectOption("recorded")
  await page.getByText("Fixture timeline review", { exact: true }).click()
  const frames = timelineFrames(sourceDataset("populated"))
  await page.getByLabel("Playback position").fill(String(frames.indexOf("2026-10-04T14:14:15Z")))
  const recent = page.locator(".widget-gallery ul button")
  await expect(recent.first()).toContainText("RUN-003 · running")
  await recent.first().evaluate((n) => {
    const key = Object.keys(n).find((k) => k.startsWith("__reactProps$"))
    const props = key ? (n as unknown as Record<string, { onClick?: () => void }>)[key] : undefined
    ;(window as unknown as { retiredWidgetSelect?: () => void }).retiredWidgetSelect =
      props?.onClick
  })
  await recent.first().click()
  const modal = page.getByRole("dialog", { name: "Widget run inspection RUN-003", exact: true })
  await expect(modal).toContainText("Not observed through cutoff")
  await page.getByLabel("Playback position").evaluate((n, index) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(
      n,
      String(index),
    )
    n.dispatchEvent(new Event("input", { bubbles: true }))
  }, frames.indexOf("2026-10-04T14:15:30Z"))
  await expect(modal).not.toBeVisible()
  await page.evaluate(() => {
    const callback = (window as unknown as { retiredWidgetSelect?: () => void }).retiredWidgetSelect
    if (!callback) throw new Error("Actual captured selection callback missing")
    callback()
  })
  await expect(page.getByRole("dialog", { name: /Widget run inspection/ })).toHaveCount(0)
  await expect(page.locator(".widget-gallery ul button").first()).toContainText("RUN-003 · failed")
  await page.locator(".widget-gallery ul button").first().click()
  const next = page.getByRole("dialog", { name: "Widget run inspection RUN-003", exact: true })
  await expect(next).toBeVisible()
  await expect(next).toContainText("2026-10-04T14:15:30Z")
  await next.getByRole("button", { name: "Reset widget context" }).click()
  await expect(next).not.toBeVisible()
  await expect(page.getByLabel("Widget state")).toBeFocused()
  await page.getByLabel("Scenario", { exact: true }).selectOption("permission-denied")
  await expect(page.locator(".widget-gallery ul button")).toHaveCount(0)
  await expect(page.getByTestId("widget-actual-peak")).toHaveCount(0)
  await expect(page.getByText("Access denied by fixture policy", { exact: true })).toBeVisible()
})
test("narrow dark long list and portable fixed-prefix widgets preserve bounds and no API", async ({
  page,
}, info) => {
  await page.goto("/?view=Widgets&theme=p1-green-phosphor&mode=dark")
  await page.getByLabel("Widget state").selectOption("long")
  await page.getByLabel("Widget layout").selectOption("stack")
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByLabel("Theme")).toHaveValue("p1-green-phosphor")
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true)
  await page.getByTestId("widget-spark").scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath("widgets-narrow.png"), animations: "disabled" })
  await geometry(page)
  const recent = page.locator(".widget-gallery ul button")
  await recent.first().scrollIntoViewIfNeeded()
  await recent.first().focus()
  await page.keyboard.press("Enter")
  const modal = page.getByRole("dialog", { name: "Widget run inspection RUN-008", exact: true })
  await expect(modal).toBeVisible()
  await expect(modal.getByRole("button", { name: "Reset widget context" })).toBeInViewport()
  await page.keyboard.press("Escape")
  await expect(recent.first()).toBeFocused()
  const api: string[] = []
  page.on("request", (r) => {
    if (/\/(api|plugins)\//.test(r.url())) api.push(r.url())
  })
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=widgets-recorded-review--partial-prefix&viewMode=story",
  )
  await expect(page.getByTestId("widget-cutoff")).toHaveText("2026-10-04T14:14:15Z")
  await expect(page.getByTestId("widget-spark").locator('[aria-hidden="true"]>div')).toHaveCount(2)
  await expect(page.getByRole("table").locator("tbody tr").nth(1)).toContainText("Partial")
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=widgets-recorded-review--before-window&viewMode=story",
  )
  await expect(page.getByTestId("widget-spark")).toHaveCount(0)
  await expect(page.getByTestId("widget-actual-peak")).toHaveText("Unavailable")
  expect(api).toEqual([])
})
