import { readFileSync } from "node:fs"
import { expect, test } from "@playwright/test"
import { operationsModel } from "../src/operations/model"
import { dashboardMetrics } from "../src/ops-dashboard/model"
import { sourceDataset, timelineFrames } from "../src/playback/model"

test("unified dashboard metrics follow admitted task lifecycle and joined receipts rather than future run status", () => {
  const inventory = JSON.parse(
    readFileSync(new URL("../../docs/export-inventory.json", import.meta.url), "utf8"),
  )
  expect(
    inventory.find(
      (r: { name: string; entry: string }) => r.name === "PageHeader" && r.entry === ".",
    ).disposition,
  ).toBe("reviewed")
  expect(
    inventory.find(
      (r: { name: string; entry: string }) => r.name === "PageHeader" && r.entry === "./ui",
    ).disposition,
  ).toBe("deferred")
  for (const cutoff of timelineFrames(sourceDataset("populated"))) {
    const model = operationsModel("populated", "", { cutoff }),
      m = dashboardMetrics(model)
    expect(m.activeTasks).toBe(
      model.tasks.filter((t) => !["archived", "done"].includes(t.status)).length,
    )
    expect(m.done).toBe(model.tasks.filter((t) => t.status === "done").length)
    expect(m.tokens).toBe(
      !model.runs.length || model.usage.length
        ? model.usage.reduce((s, u) => s + u.tokens, 0)
        : null,
    )
  }
  expect(dashboardMetrics(operationsModel("empty")).tokens).toBe(0)
  expect(dashboardMetrics(operationsModel("loading")).tokens).toBeNull()
  expect(
    dashboardMetrics(operationsModel("populated", "", { cutoff: "2026-10-04T14:10:00Z" })).tokens,
  ).toBeNull()
  const m = dashboardMetrics(operationsModel("populated", "", { cutoff: "2026-10-04T14:11:15Z" }))
  expect(m.cost).toBe(0.015581999999999999)
  expect(m.tokens).toBe(7791)
})
test("actual unified native tabs preserve chosen page and selected current run across advancing cutoff", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto("/?view=Ops+Dashboard&mode=light")
  const activity = page.getByRole("tab", { name: "Activity", exact: true })
  await activity.focus()
  await page.keyboard.press("ArrowRight")
  const mission = page.getByRole("tab", { name: "Mission Control", exact: true })
  await expect(mission).toBeFocused()
  await expect(activity).toHaveAttribute("aria-selected", "true")
  await page.keyboard.press("Enter")
  await expect(page.getByText("14-day run volume", { exact: true })).toBeVisible()
  await page.locator(".page-scroll").evaluate((e) => (e.scrollTop = 0))
  await page.screenshot({
    path: info.outputPath("ops-dashboard-mission-desktop.png"),
    animations: "disabled",
  })
  await page.getByText("Fixture timeline review", { exact: true }).click()
  const frames = timelineFrames(sourceDataset("populated"))
  await page.getByLabel("Playback position").fill(String(frames.indexOf("2026-10-04T14:15:30Z")))
  await expect(mission).toHaveAttribute("aria-selected", "true")
  await page.getByLabel("Playback position").fill(String(frames.indexOf("2026-10-04T14:15:35Z")))
  await expect(mission).toHaveAttribute("aria-selected", "true")
  await page.getByRole("button", { name: "Step recorded event", exact: true }).click()
  await expect(mission).toHaveAttribute("aria-selected", "true")
  await page.keyboard.press("End")
  await page.getByRole("tab", { name: "Usage", exact: true }).click()
  await expect(page.getByText("14-day cost", { exact: true })).toBeVisible()
  await page.getByRole("tab", { name: "Activity", exact: true }).click()
  await page.getByRole("button", { name: /Review gateway permission.*TASK-001/ }).click()
  await page.getByRole("button", { name: "Close", exact: true }).click()
  await page.getByRole("tab", { name: "Usage", exact: true }).click()
  await expect(page.getByLabel("Selected run")).toContainText("TASK-001")
  await page.getByRole("tab", { name: "Activity", exact: true }).click()
  await page.getByText("Fixture timeline review", { exact: true }).click()
  await page.locator(".page-scroll").evaluate((e) => (e.scrollTop = 0))
  await page.screenshot({
    path: info.outputPath("ops-dashboard-activity-desktop.png"),
    animations: "disabled",
  })
  await page.locator(".activity-pair").evaluate((e) => {
    const owner = document.querySelector(".page-scroll")!
    owner.scrollTop += e.getBoundingClientRect().top - owner.getBoundingClientRect().top - 12
  })
  await page.screenshot({
    path: info.outputPath("ops-dashboard-pair-desktop.png"),
    animations: "disabled",
  })
  await page.getByRole("tab", { name: "Usage", exact: true }).click()
  await page.locator(".page-scroll").evaluate((e) => (e.scrollTop = 0))
  await page.screenshot({
    path: info.outputPath("ops-dashboard-usage-desktop.png"),
    animations: "disabled",
  })
  await page.getByText("Provider / model attribution", { exact: true }).evaluate((e) => {
    const owner = document.querySelector(".page-scroll")!
    owner.scrollTop += e.getBoundingClientRect().top - owner.getBoundingClientRect().top - 12
  })
  await page.screenshot({
    path: info.outputPath("ops-dashboard-attribution-desktop.png"),
    animations: "disabled",
  })
  await page.getByRole("tab", { name: "Mission Control", exact: true }).click()
  await page.getByText("Token throughput", { exact: true }).evaluate((e) => {
    const owner = document.querySelector(".page-scroll")!
    owner.scrollTop += e.getBoundingClientRect().top - owner.getBoundingClientRect().top - 12
  })
  await page.screenshot({
    path: info.outputPath("ops-dashboard-throughput-desktop.png"),
    animations: "disabled",
  })
})
test("metric companion exposes exact receipt fractions amounts explicit statuses and guarded metadata inspection", async ({
  page,
}, info) => {
  await page.goto("/?view=Ops+Dashboard&mode=light")
  const companion = page.getByLabel("App-owned metric companion", { exact: true })
  await companion.scrollIntoViewIfNeeded()
  await expect(companion).toContainText("8 receipts across 8 admitted runs")
  const raw = page.getByRole("table", { name: "Exact raw current-prefix metric amounts" })
  const model = operationsModel("populated")
  await expect(raw).toContainText(String(dashboardMetrics(model).cost))
  await expect(raw).toContainText(String(dashboardMetrics(model).tokens))
  await page.getByLabel("Metric record", { exact: true }).selectOption("TASK-003")
  await expect(companion).toContainText("raw supplied run status: failed")
  await expect(companion).toContainText("Raw supplied task status: blocked")
  await page.getByRole("button", { name: "Inspect metric metadata", exact: true }).click()
  await expect(companion.getByRole("status")).toContainText("TASK-003 / RUN-003")
  await companion.evaluate((e) => {
    const owner = document.querySelector(".page-scroll")!
    owner.scrollTop += e.getBoundingClientRect().top - owner.getBoundingClientRect().top - 12
  })
  await page.screenshot({
    path: info.outputPath("ops-dashboard-metrics-desktop.png"),
    animations: "disabled",
  })
  await page.getByLabel("Metric record", { exact: true }).focus()
  await page.keyboard.press("Tab")
  await expect(
    page.getByRole("button", { name: "Inspect metric metadata", exact: true }),
  ).toBeFocused()
  await page.keyboard.press("Space")
  await expect(companion.getByRole("status")).toContainText("TASK-003 / RUN-003")
  await page.screenshot({
    path: info.outputPath("ops-dashboard-metric-footer-desktop.png"),
    animations: "disabled",
  })
  expect(
    await companion.evaluate((e) => parseFloat(getComputedStyle(e).paddingTop)),
  ).toBeGreaterThan(0)
  await page.getByLabel("Scenario", { exact: true }).selectOption("empty")
  await expect(
    page.getByRole("table", { name: "Exact raw current-prefix metric amounts" }),
  ).toContainText("Receipt tokens0tokens")
  await expect(page.getByLabel("App-owned metric companion", { exact: true })).toContainText(
    "raw supplied run status: Unknown",
  )
  await page.getByLabel("Scenario", { exact: true }).selectOption("loading")
  await expect(
    page.getByRole("table", { name: "Exact raw current-prefix metric amounts" }),
  ).toContainText("Unknown")
  await page.getByLabel("Scenario", { exact: true }).selectOption("unknown-status")
  await expect(page.getByLabel("App-owned metric companion", { exact: true })).toContainText(
    "Raw supplied task status: external-review",
  )
})
test("390 dark dashboard and metrics maintain real grid bounds raw amounts and current native header children", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/?view=Ops+Dashboard&theme=p1-green-phosphor&mode=dark")
  await page.screenshot({
    path: info.outputPath("ops-dashboard-header-narrow.png"),
    animations: "disabled",
  })
  await page.locator(".ops-dashboard").evaluate((e) => {
    const owner = document.querySelector(".page-scroll")!
    owner.scrollTop += e.getBoundingClientRect().top - owner.getBoundingClientRect().top - 12
  })
  await page.screenshot({
    path: info.outputPath("ops-dashboard-tabs-narrow.png"),
    animations: "disabled",
  })
  const metric = page.getByLabel("App-owned metric companion", { exact: true })
  await metric.evaluate((e) => {
    const owner = document.querySelector(".page-scroll")!
    owner.scrollTop += e.getBoundingClientRect().top - owner.getBoundingClientRect().top - 12
  })
  await page.screenshot({
    path: info.outputPath("ops-dashboard-metrics-narrow.png"),
    animations: "disabled",
  })
  await page
    .getByRole("table", { name: "Exact raw current-prefix metric amounts" })
    .evaluate((e) => {
      const owner = document.querySelector(".page-scroll")!
      owner.scrollTop += e.getBoundingClientRect().top - owner.getBoundingClientRect().top - 12
    })
  await page.screenshot({
    path: info.outputPath("ops-dashboard-raw-narrow.png"),
    animations: "disabled",
  })
  await page.getByLabel("Metric record", { exact: true }).focus()
  await page.keyboard.press("Tab")
  await expect(
    page.getByRole("button", { name: "Inspect metric metadata", exact: true }),
  ).toBeFocused()
  await page.keyboard.press("Space")
  await expect(metric.getByRole("status")).toContainText("TASK-001 / RUN-001")
  await page.screenshot({
    path: info.outputPath("ops-dashboard-metric-footer-narrow.png"),
    animations: "disabled",
  })
  expect(await metric.evaluate((e) => e.getBoundingClientRect().right)).toBeLessThanOrEqual(391)
  expect(await metric.evaluate((e) => e.scrollWidth <= e.clientWidth)).toBe(true)
  const grid = metric.locator(".grid").first()
  expect(
    await grid.evaluate((e) => getComputedStyle(e).gridTemplateColumns.split(" ").length),
  ).toBe(2)
  await page.getByRole("button", { name: "Clear dashboard filter", exact: true }).click()
  await expect(page.getByRole("tab", { name: "Activity", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  )
})
test("StrictMode current first callbacks and retired tab cutoff source inspector callbacks remain fenced", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:18545/?view=Ops+Dashboard")
  await page.getByRole("tab", { name: "Usage", exact: true }).click()
  await expect(page.getByRole("tab", { name: "Usage", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  )
  const inspect = page.getByRole("button", { name: "Inspect metric metadata", exact: true })
  await inspect.click()
  await expect(
    page.getByLabel("App-owned metric companion", { exact: true }).getByRole("status"),
  ).toContainText("TASK-001")
  await inspect.evaluate((e) => {
    const key = Object.keys(e).find((k) => k.startsWith("__reactProps$"))!
    ;(window as unknown as { oldMetric: () => void }).oldMetric = (
      e as unknown as Record<string, { onClick: () => void }>
    )[key].onClick
  })
  await page.getByRole("tab", { name: "Mission Control", exact: true }).click()
  await page.evaluate(() => {
    ;(window as unknown as { oldMetric: () => void }).oldMetric()
  })
  await expect(
    page.getByLabel("App-owned metric companion", { exact: true }).getByRole("status"),
  ).toHaveCount(0)
  await page.getByText("Fixture timeline review", { exact: true }).click()
  await page.getByLabel("Playback position").fill("0")
  await page.evaluate(() => {
    ;(window as unknown as { oldMetric: () => void }).oldMetric()
  })
  await expect(page.getByRole("tab", { name: "Mission Control", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  )
  await expect(
    page.getByLabel("App-owned metric companion", { exact: true }).getByRole("status"),
  ).toHaveCount(0)
  await page.getByRole("button", { name: "Open Review Workbench", exact: true }).click()
  await page.evaluate(() => {
    ;(window as unknown as { oldMetric: () => void }).oldMetric()
  })
  await expect(page.getByRole("heading", { name: "Review Workbench", exact: true })).toBeVisible()
})
test("portable unified review long root header literal and metric zero unknown remain API-free", async ({
  page,
}) => {
  const calls: string[] = []
  page.on("request", (r) => {
    if (/\/api\/|\/plugins\//.test(r.url()) || r.method() !== "GET") calls.push(r.url())
  })
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=operations-unified-dashboard--long-header&viewMode=story",
  )
  await expect(
    page.getByText(
      "Recorded operations review · supplied long fixture scope <script>inert</script>",
      { exact: true },
    ),
  ).toBeVisible()
  await expect(page.locator(".ops-dashboard script")).toHaveCount(0)
  await page.getByRole("tab", { name: "Usage", exact: true }).click()
  await expect(page.getByRole("tab", { name: "Usage", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  )
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=operations-unified-dashboard--before-receipt&viewMode=story",
  )
  await expect(
    page.getByRole("table", { name: "Exact raw current-prefix metric amounts" }),
  ).toContainText("Receipt tokensUnknowntokens")
  expect(calls).toEqual([])
})
