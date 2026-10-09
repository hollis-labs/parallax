import { expect, test } from "@playwright/test"
import { exampleContext, torqueDefinition } from "../src/examples/contracts"
import {
  referenceCompatible,
  torqueReferenceModel,
  torqueSource,
} from "../src/examples/torque/reference"
import { operationsModel, runDetail } from "../src/operations/model"
import { timelineFrames } from "../src/playback/model"

const source = torqueSource("populated", "torque-16w")
const at = (cutoff = source.clock, query = "", scenario = "populated") =>
  operationsModel(scenario, query, { source, cutoff })

test("reference projection keeps one latest task update, separate buffer and exact receipt/detail sums", () => {
  const before = torqueReferenceModel(at("2026-10-04T13:00:00Z")),
    after = torqueReferenceModel(at())
  expect(before.effectiveUpdates.find((u) => u.taskId === "TASK-009")?.time).toBe(
    "2026-10-03T14:31:35Z",
  )
  expect(after.effectiveUpdates.find((u) => u.taskId === "TASK-009")?.time).toBe(
    "2026-10-04T13:30:00Z",
  )
  expect(after.effectiveUpdates).toHaveLength(96)
  expect(after.calendar).toHaveLength(112)
  expect(after.calendar[0].date).toBe("2026-06-21")
  expect(after.calendar.at(-1)?.date).toBe("2026-10-10")
  expect(after.calendar.filter((d) => d.date > "2026-10-04").every((d) => d.count === null)).toBe(
    true,
  )
  expect(after.calendar.some((d) => d.known && d.count === 0)).toBe(true)
  expect(after.calendar.some((d) => !d.known && d.count === null)).toBe(true)
  expect(after.calendar.reduce((n, d) => n + (d.count ?? 0), 0)).toBe(192)
  expect(after.starts).toHaveLength(9)
  expect(after.pulse.reduce((n, d) => n + (d.count ?? 0), 0)).toBe(9)
  expect(after.recent).toHaveLength(12)
  expect(after.recent.map((r) => r.id)).toEqual(
    [...at().runs]
      .sort((a, b) => b.started.localeCompare(a.started) || a.id.localeCompare(b.id))
      .slice(0, 12)
      .map((r) => r.id),
  )
  for (const cutoff of [
    "2026-10-04T14:15:00Z",
    "2026-10-04T14:15:15Z",
    "2026-10-04T14:15:30Z",
    source.clock,
  ]) {
    const model = at(cutoff),
      ref = torqueReferenceModel(model)
    const receipts = model.runs
      .filter((r) => r.started >= ref.reference.charts.from)
      .flatMap((r) => {
        const detail = runDetail(model, r.taskId)
        return detail?.usage ? [detail.usage] : []
      })
    expect(ref.days.reduce((n, d) => n + (d.inputTokens ?? 0), 0)).toBe(
      receipts.reduce((n, r) => n + r.inputTokens, 0),
    )
    expect(ref.days.reduce((n, d) => n + (d.outputTokens ?? 0), 0)).toBe(
      receipts.reduce((n, r) => n + r.outputTokens, 0),
    )
    expect(ref.days.reduce((n, d) => n + (d.cost ?? 0), 0)).toBeCloseTo(
      receipts.reduce((n, r) => n + r.cost, 0),
      12,
    )
    expect(ref.days.filter((d) => d.date > cutoff.slice(0, 10)).every((d) => d.runs === null)).toBe(
      true,
    )
  }
  const q = torqueReferenceModel(at(source.clock, "TASK-003"))
  expect(q.recent.map((r) => r.id)).toEqual(["RUN-003"])
  expect(q.effectiveUpdates.map((u) => u.taskId)).toEqual(["TASK-003"])
  expect(q.days.reduce((n, d) => n + (d.runs ?? 0), 0)).toBe(1)
  const initial = torqueReferenceModel(at("2026-10-04T14:14:00Z", "TASK-003"))
  expect(initial.days.find((d) => d.date === "2026-10-04")).toMatchObject({
    runs: 1,
    received: 0,
    missing: 1,
    inputTokens: null,
    cost: null,
  })
  expect(initial.recent[0].status).toBe("running")
  const received = torqueReferenceModel(at("2026-10-04T14:15:15Z", "TASK-003"))
  expect(received.recent[0].status).toBe("running")
  expect(received.days.find((d) => d.date === "2026-10-04")?.inputTokens).toBe(2859)
  expect(
    torqueReferenceModel(at(source.clock, "no matches"))
      .days.filter((d) => d.known)
      .every((d) => d.runs === 0 && d.cost === 0),
  ).toBe(true)
  expect(
    torqueReferenceModel(at(source.clock, "", "sparse"))
      .calendar.filter((d) => Number(d.date.slice(-2)) % 3 === 0)
      .every((d) => d.count === null),
  ).toBe(true)
})
test("reference metadata refuses unsupported matching identities and incomplete window claims", () => {
  const model = at(),
    ref = torqueReferenceModel(model).reference
  expect(referenceCompatible(model)).toBe(true)
  expect(referenceCompatible(operationsModel("populated"))).toBe(false)
  expect(
    referenceCompatible(model, { ...ref, pulse: { ...ref.pulse, to: "2026-10-04T14:20:00Z" } }),
  ).toBe(false)
  expect(
    referenceCompatible(model, { ...ref, pulse: { ...ref.pulse, from: "2026-10-03T15:30:00Z" } }),
  ).toBe(false)
  expect(
    referenceCompatible(
      { ...model, dataset: { ...model.dataset, generator: "future" } },
      { ...ref, operationsGenerator: "future" },
    ),
  ).toBe(false)
  expect(
    exampleContext(torqueDefinition, source, source.clock, timelineFrames(source)).available,
  ).toBe(true)
  expect(
    torqueReferenceModel(operationsModel("permission-denied", "", { source })).calendar.every(
      (d) => d.count === null,
    ),
  ).toBe(true)
})
test("native Torque source profile reload/history/reset and readable reference operands share admitted records", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto("/?example=torque&screen=about&profile=torque-16w")
  const evidence = page.getByRole("region", { name: "Torque reference evidence", exact: true })
  await expect(evidence).toContainText("96 admitted matching runs")
  await expect(evidence).toContainText("9 admitted buffer starts")
  await evidence.scrollIntoViewIfNeeded()
  await page.screenshot({ path: testInfo.outputPath("reference-context-desktop.png") })
  await page.getByText("14 dated run/receipt totals", { exact: true }).click()
  await page
    .getByRole("region", { name: "Run receipt evidence table", exact: true })
    .scrollIntoViewIfNeeded()
  await page.screenshot({ path: testInfo.outputPath("reference-receipts-desktop.png") })
  await page.getByRole("button", { name: "Review fixtures", exact: true }).click()
  await page.getByLabel("Torque fixture profile", { exact: true }).selectOption("legacy")
  await expect(page).toHaveURL(/profile=legacy/)
  await expect(evidence).toHaveCount(0)
  await page.goBack()
  await expect(evidence).toContainText("96 admitted matching runs")
  await page.reload()
  await expect(evidence).toContainText("torque-reference/v1 / parallax/v8")
  const nav = page.getByRole("navigation", { name: "Torque application navigation", exact: true })
  await nav.getByRole("link", { name: "Operations", exact: true }).click()
  await page.getByLabel("Example task filter", { exact: true }).fill("TASK-003")
  await page.locator(".torque-ops-task > a").click()
  await expect(page).toHaveURL(/selected=TASK-003/)
  await expect(page.getByRole("dialog", { name: "Task and run inspection", exact: true })).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog", { name: "Task and run inspection", exact: true })).toHaveCount(0)
  const review = () => page.getByRole("button", { name: "Review fixtures", exact: true }).click()
  await review()
  await page.getByLabel("Example review position", { exact: true }).press("Home")
  await expect(
    page.getByRole("dialog", { name: "Torque fixture review", exact: true }),
  ).toHaveCount(0)
  await review()
  await page.getByLabel("Example resource", { exact: true }).selectOption("error")
  await expect(
    page.getByRole("dialog", { name: "Torque fixture review", exact: true }),
  ).toHaveCount(0)
  await review()
  await page.getByRole("button", { name: "Reset example context", exact: true }).click()
  const reset = new URL(page.url()).searchParams
  expect(reset.get("profile")).toBe("torque-16w")
  expect(reset.get("query")).toBeNull()
  expect(reset.get("selected")).toBeNull()
  expect(reset.get("resource")).toBeNull()
  expect(reset.get("cutoff")).toBe(source.clock)
  await expect(
    page.getByRole("dialog", { name: "Torque fixture review", exact: true }),
  ).toHaveCount(0)
  await nav.getByRole("link", { name: "About", exact: true }).click()
  await page
    .getByText("112 calendar UTC dates and effective update evidence", { exact: true })
    .click()
  const calendar = page.getByRole("region", { name: "Calendar evidence table", exact: true })
  await page.keyboard.press("Tab")
  await expect(calendar).toBeFocused()
  await page.keyboard.press("Control+End")
  await expect
    .poll(() => calendar.evaluate((e) => e.scrollHeight - e.clientHeight - e.scrollTop))
    .toBeLessThanOrEqual(1)
  await expect(calendar.getByRole("row").last()).toContainText("2026-10-10UnknownUnknown")
  await page.setViewportSize({ width: 390, height: 844 })
  await evidence
    .getByRole("heading", { name: "Torque reference evidence pack", exact: true })
    .scrollIntoViewIfNeeded()
  await page.screenshot({ path: testInfo.outputPath("reference-context-narrow.png") })
  await calendar.scrollIntoViewIfNeeded()
  {
    const a = await calendar.getByRole("row").last().boundingBox(),
      b = await calendar.boundingBox()
    if (!a || !b) throw new Error("missing calendar geometry")
    expect(a.y).toBeGreaterThanOrEqual(b.y)
    expect(a.y + a.height).toBeLessThanOrEqual(b.y + b.height)
  }
  await page.screenshot({ path: testInfo.outputPath("reference-calendar-narrow.png") })
  await page.getByText("14 dated run/receipt totals", { exact: true }).click()
  await page.keyboard.press("Tab")
  const receiptTable = page.getByRole("region", { name: "Run receipt evidence table", exact: true })
  await expect(receiptTable).toBeFocused()
  await page.keyboard.press("Control+End")
  await expect
    .poll(() => receiptTable.evaluate((e) => e.scrollHeight - e.clientHeight - e.scrollTop))
    .toBeLessThanOrEqual(1)
  await receiptTable.scrollIntoViewIfNeeded()
  await page.screenshot({ path: testInfo.outputPath("reference-receipts-narrow-left.png") })
  const initialReceiptBounds = await receiptTable.boundingBox()
  for (let i = 0; i < 30; i++) {
    const remaining = await receiptTable.evaluate(
      (e) => e.scrollWidth - e.clientWidth - e.scrollLeft,
    )
    if (remaining <= 1) break
    await page.keyboard.press("ArrowRight", { delay: 30 })
    await page.waitForTimeout(100)
  }
  await expect
    .poll(() => receiptTable.evaluate((e) => e.scrollWidth - e.clientWidth - e.scrollLeft))
    .toBeLessThanOrEqual(1)
  const endpointBounds = await receiptTable.boundingBox()
  expect(endpointBounds?.x).toBe(initialReceiptBounds?.x)
  expect(endpointBounds?.x).toBeGreaterThanOrEqual(0)
  expect((endpointBounds?.x ?? 0) + (endpointBounds?.width ?? 0)).toBeLessThanOrEqual(390)
  expect(await page.locator(".torque-page").evaluate((e) => e.scrollLeft)).toBe(0)
  expect(await page.locator(".torque-page").evaluate((e) => e.scrollWidth)).toBeLessThanOrEqual(390)
  for (const cell of [
    receiptTable.getByRole("row").last().getByRole("cell").nth(5),
    receiptTable.getByRole("row").last().getByRole("cell").nth(6),
  ]) {
    const a = await cell.boundingBox(),
      b = await receiptTable.boundingBox()
    if (!a || !b) throw new Error("missing table geometry")
    expect(a.x).toBeGreaterThanOrEqual(b.x)
    expect(a.x + a.width).toBeLessThanOrEqual(b.x + b.width)
    expect(a.y + a.height).toBeLessThanOrEqual(b.y + b.height)
  }
  await page.screenshot({ path: testInfo.outputPath("reference-receipts-narrow-right.png") })
  await receiptTable.evaluate((e) => e.scrollIntoView({ block: "start" }))
  await page.keyboard.press("Tab")
  const recent = page.getByRole("list", { name: "Reference recent runs", exact: true })
  for (let i = 1; i < 12; i++) await page.keyboard.press("Tab")
  await expect(recent.getByRole("button").last()).toBeFocused()
  await recent.getByRole("button").last().scrollIntoViewIfNeeded()
  await page.screenshot({ path: testInfo.outputPath("reference-recent-narrow.png") })
  await page
    .getByRole("heading", { name: "Plugin context provenance", exact: true })
    .scrollIntoViewIfNeeded()
  await page.screenshot({ path: testInfo.outputPath("reference-plugin-narrow.png") })
  await page.setViewportSize({ width: 1280, height: 500 })
  await page.locator(".torque-page").evaluate((e) => e.scrollTo({ top: e.scrollHeight }))
  await expect(page.locator(".torque-page-footer")).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath("reference-footer-short.png") })
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1280)
})
test("portable reference profile reads identical coverage without API or plugin calls", async ({
  page,
}) => {
  const effects: string[] = []
  page.on("request", (r) => {
    if (/^\/(api|plugins)\//.test(new URL(r.url()).pathname)) effects.push(r.url())
  })
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=app-examples-torque--reference-profile&viewMode=story",
  )
  await expect(
    page.getByRole("region", { name: "Torque reference evidence", exact: true }),
  ).toContainText("96 admitted matching runs")
  expect(effects).toEqual([])
})
