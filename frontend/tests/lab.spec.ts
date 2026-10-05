import { expect, test } from "@playwright/test"

test("coherent detail, transient intent, reset, themes and scroll", async ({ page }, testInfo) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { name: "Activity", exact: true })).toBeVisible()
  await page.getByRole("button", { name: /Review gateway permission/ }).click()
  await expect(page.getByRole("dialog").getByText("TASK-001 / RUN-001")).toBeVisible()
  await page.getByRole("button", { name: "Inspect stop intent" }).click()
  await expect(page.getByText(/Simulated intent captured/)).toBeVisible()
  await page.keyboard.press("Escape")
  await page.getByLabel("Scenario").selectOption("empty")
  await expect(page.getByText("No activity to display")).toBeVisible()
  await expect(page.getByText(/Simulated intent captured/)).toHaveCount(0)
  await page.getByLabel("Scenario").selectOption("large")
  const scroll = page.getByTestId("page-scroll")
  await expect(scroll).toBeVisible()
  expect(await scroll.evaluate((el) => el.scrollHeight > el.clientHeight)).toBeTruthy()
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight === innerHeight),
  ).toBeTruthy()
  await page.getByLabel("Mode").selectOption("light")
  await expect(page.locator("html")).toHaveAttribute("data-mode", "light")
  await page.screenshot({ animations: "disabled", path: testInfo.outputPath("desktop.png") })
})
test("narrow layout retains accessible controls", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/")
  await page.getByLabel("Scenario").selectOption("long-labels")
  await expect(page.getByRole("heading", { name: "Activity", exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  await page.screenshot({ animations: "disabled", path: testInfo.outputPath("mobile.png") })
})
test("real admitted widget/panel follows controlled scenario and uses reviewed bytes", async ({
  page,
}) => {
  await page.goto("/")
  await expect(page.getByLabel("Plugin widget")).toContainText("8 fixture records")
  await expect(page.getByLabel("Plugin panel")).toContainText("Plugin context provenance")
  await expect(page.getByLabel("Plugin panel")).toContainText("operations/v2/records-8/populated")
  await page.getByRole("button", { name: "Inspect plugin detail" }).click()
  await expect(page.getByText("Plugin admission evidence")).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')))
    .toBeTruthy()
  await page.keyboard.press("Tab")
  await expect
    .poll(() => page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')))
    .toBeTruthy()
  await page.keyboard.press("Escape")
  await page.getByLabel("Scenario").selectOption("empty")
  await expect(page.getByLabel("Plugin widget")).toContainText("0 fixture records")
  await page.getByLabel("Scenario").selectOption("large")
  await expect(page.getByLabel("Plugin widget")).toContainText("80 fixture records")
  await page.getByLabel("Filter tasks").fill("Build deterministic")
  await expect(page.getByLabel("Plugin widget")).toContainText("10 fixture records · 10 complete")
  await page.getByLabel("Filter tasks").fill("Review gateway")
  await expect(page.getByLabel("Plugin widget")).toContainText("10 fixture records · 9 complete")
  await expect(page.getByLabel("Plugin widget")).toContainText("10 fixture records")
  const registry = await page.request.get("/plugins/registry")
  expect(registry.ok()).toBeTruthy()
  const dto = await registry.json()
  expect(dto.registry_version).toBe(2)
  expect(dto.plugins.ops.bundle_version).toMatch(/^sha256:/)
  expect((await page.request.post("/api/scenario", { data: { action: "save" } })).status()).toBe(
    405,
  )
})
test("theme colors change and authored error is not reported healthy", async ({ page }) => {
  await page.goto("/")
  const dark = await page
    .locator("main")
    .evaluate((el) => getComputedStyle(el.closest(".h-dvh") ?? el).backgroundColor)
  await page.getByLabel("Mode").selectOption("light")
  const light = await page
    .locator("main")
    .evaluate((el) => getComputedStyle(el.closest(".h-dvh") ?? el).backgroundColor)
  expect(light).not.toBe(dark)
  await page.getByLabel("Scenario").selectOption("unavailable")
  await expect(page.getByText("Resource unavailable")).toBeVisible()
  await expect(page.getByText("Tasks observed")).toHaveCount(0)
})
test("fixed-clock bins exclude future records and preserve inclusive end", async () => {
  const { activityBuckets } = await import("../src/timeBuckets")
  const clock = "2026-10-04T14:30:00Z"
  const observations = ["2026-10-04T14:30:00Z", "2026-10-04T14:30:01Z", "2026-10-03T14:30:00Z"].map(
    (started) => ({ started, tokens: 1, status: "done" }),
  )
  const bins = activityBuckets(observations, clock)
  expect(bins.hours.reduce((n, b) => n + b.count, 0)).toBe(1)
  expect(bins.days.reduce((n, b) => n + b.count, 0)).toBe(2)
})
test("plugin unload preserves embedded view and shareable review URL", async ({ page }) => {
  await page.goto(
    "/?view=Activity&scenario=populated&theme=p1-green-phosphor&mode=light&viewport=narrow",
  )
  await expect(page.getByLabel("Plugin widget")).toContainText("8 fixture records")
  await page.getByRole("button", { name: "Unload fixture plugin" }).click()
  await expect(page.getByLabel("Plugin widget")).toContainText("Plugin unavailable")
  await expect(page.getByRole("button", { name: /Review gateway permission/ })).toBeVisible()
  await expect(page.getByLabel("Theme")).toHaveValue("p1-green-phosphor")
  await expect(page.getByLabel("Viewport")).toHaveValue("narrow")
})
test("built Storybook uses the same controlled fixed-clock records", async ({ page }) => {
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=operations-fixed-activity--populated&viewMode=story",
  )
  await expect(page.getByText("24-hour execution pulse")).toBeVisible()
  await expect(page.getByText("8 recorded starts")).toBeVisible()
  await expect(page.getByText("Window ends 14:30 UTC")).toBeVisible()
})

test("operations graph joins real messages, tools, logs and trace; selection survives views", async ({
  page,
}) => {
  await page.goto("/")
  await page.getByRole("button", { name: /Review gateway permission/ }).focus()
  await page.keyboard.press("Enter")
  const dialog = page.getByRole("dialog")
  await expect(dialog.getByText("Session messages", { exact: true })).toBeVisible()
  await expect(dialog.getByText(/MSG-REQUEST-001/)).toBeVisible()
  await expect(dialog.getByText(/TOOL-001/).first()).toBeVisible()
  await expect(dialog.getByText(/SPAN-TOOL-001/).first()).toBeVisible()
  await expect(dialog.getByText(/LOG-START-001/).first()).toBeVisible()
  await expect(dialog.getByText("Trace TRACE-001")).toBeVisible()
  await page.keyboard.press("Escape")
  await page.getByTestId("page-scroll").evaluate((el) => {
    el.scrollTop = 300
  })
  await page.getByRole("button", { name: "Usage", exact: true }).click()
  await expect.poll(() => page.getByTestId("page-scroll").evaluate((el) => el.scrollTop)).toBe(0)
  await expect(page.getByRole("region", { name: "Selected run" })).toContainText(
    "TASK-001 / RUN-001",
  )
  await page.getByRole("button", { name: "Inspect selected run" }).click()
  await expect(page.getByRole("dialog").getByText("Trace TRACE-001")).toBeVisible()
  await page.keyboard.press("Escape")
  await page.getByLabel("Scenario").selectOption("empty")
  await expect(page.getByRole("region", { name: "Selected run" })).toHaveCount(0)
})
test("shared gateway navigation, modal target and reset fence a late scripted command", async ({
  page,
}) => {
  await page.goto("/")
  await page.getByRole("button", { name: "Open Usage through plugin action" }).click()
  await expect(page.getByRole("heading", { name: "Usage", exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Activity", exact: true }).click()
  await page.getByRole("button", { name: "Inspect plugin detail" }).click()
  await expect(page.getByRole("dialog").getByText("Plugin admission evidence")).toBeVisible()
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: "Simulate plugin review" }).click()
  await expect(page.getByLabel("Plugin simulation receipts")).toContainText("pending")
  await page.getByLabel("Scenario").selectOption("empty")
  await page.getByRole("button", { name: "Complete scripted outcome" }).click()
  await expect(page.getByLabel("Plugin simulation receipts")).toHaveCount(0)
  await expect(page.getByLabel("Plugin action result")).toHaveCount(0)
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(page.getByRole("heading", { name: "Activity", exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Simulate plugin review" }).click()
  await expect(page.getByLabel("Plugin simulation receipts")).toContainText("pending")
  await page.getByRole("button", { name: "Complete scripted outcome" }).click()
  await expect(page.getByLabel("Plugin simulation receipts")).toContainText("simulated · success")
})
test("plugin registry failure has explicit unavailable UI while embedded records work", async ({
  page,
}) => {
  await page.route("**/plugins/registry", (route) => route.abort())
  await page.goto("/")
  await expect(page.getByLabel("Plugin widget")).toContainText(
    "Plugin unavailable: reviewed contribution could not load",
  )
  await expect(page.getByRole("button", { name: /Review gateway permission/ })).toBeVisible()
})
test("controlled model distinguishes sparse and inaccessible windows and task/run lifecycles", async () => {
  const { operationsModel, daySeries, dayObservation, runDetail } = await import(
    "../src/operations/model"
  )
  const large = operationsModel("large"),
    days = daySeries(large)
  expect(days.every((d) => (d.count !== null) === dayObservation(large, d.date).known)).toBeTruthy()
  const partial = structuredClone(large)
  partial.dataset.observedSince = "2026-09-22T12:00:00Z"
  expect(daySeries(partial).find((d) => d.date === "2026-09-22")?.partial).toBeTruthy()
  for (const state of ["unavailable", "permission-denied", "error", "loading"]) {
    const m = operationsModel(state)
    expect(m.stats.count).toBeNull()
    expect(daySeries(m).every((d) => d.count === null)).toBeTruthy()
    expect(runDetail(m, "TASK-001")).toBeNull()
  }
  const sparse = daySeries(operationsModel("sparse"))
  expect(sparse.some((d) => d.count === null)).toBeTruthy()
  expect(sparse.some((d) => d.count !== null && d.count > 0)).toBeTruthy()
  const queued = runDetail(operationsModel("populated"), "TASK-005")
  expect(queued?.task.status).toBe("queued")
  expect(queued?.run.status).toBe("done")
  const blocked = runDetail(operationsModel("populated"), "TASK-003")
  expect(blocked?.task.status).toBe("blocked")
  expect(blocked?.run.status).toBe("failed")
  expect((blocked?.usage?.inputTokens ?? 0) + (blocked?.usage?.outputTokens ?? 0)).toBe(
    blocked?.usage?.tokens,
  )
})
test("portable operations stories inspect the same graph without an API", async ({ page }) => {
  const apiRequests: string[] = []
  page.on("request", (request) => {
    if (request.url().includes("/api/") || request.url().includes("/plugins/"))
      apiRequests.push(request.url())
  })
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=operations-controlled-views--mission-control&viewMode=story",
  )
  await expect(page.getByText("14-day run volume", { exact: true })).toBeVisible()
  await page
    .getByRole("button", { name: /Review gateway permission/ })
    .first()
    .click()
  await expect(page.getByText("Session messages", { exact: true })).toBeVisible()
  expect(apiRequests).toEqual([])
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=operations-controlled-views--unavailable&viewMode=story",
  )
  await expect(page.getByText("Resource unavailable", { exact: true })).toBeVisible()
})
test("historical trend compositions show numeric variation and survive narrow review", async ({
  page,
}, testInfo) => {
  await page.goto("/?scenario=large&view=Activity&mode=light")
  await expect(page.getByLabel("Plugin widget")).toContainText("80 fixture records")
  await page.getByTestId("page-scroll").evaluate((el) => {
    el.scrollTop = 0
  })
  await page.screenshot({ animations: "disabled", path: testInfo.outputPath("activity-top.png") })
  await page.goto("/?scenario=large&view=Mission+Control&mode=light")
  await expect(page.getByText("14-day run volume", { exact: true })).toBeVisible()
  const chart = page.getByRole("img", { name: "14-day run volume with coverage gaps" })
  await expect(chart).toBeVisible()
  const heights = await chart
    .locator("rect")
    .evaluateAll((rects) => rects.map((rect) => rect.getAttribute("height")))
  expect(new Set(heights).size).toBeGreaterThan(1)
  await page.getByTestId("page-scroll").evaluate((el) => {
    el.scrollTop = 0
  })
  await page.screenshot({
    animations: "disabled",
    path: testInfo.outputPath("mission-control.png"),
  })
  await page.getByRole("button", { name: "Usage", exact: true }).click()
  await expect(page.getByRole("img", { name: "14-day cost with coverage gaps" })).toBeVisible()
  await expect(page.getByText("Provider / model attribution", { exact: true })).toBeVisible()
  await page.getByTestId("page-scroll").evaluate((el) => {
    el.scrollTop = 0
  })
  await page.screenshot({ animations: "disabled", path: testInfo.outputPath("usage.png") })
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  await page
    .getByRole("button", { name: /Review gateway permission/ })
    .first()
    .click()
  await expect(
    page.getByRole("dialog").getByText("Session messages", { exact: true }),
  ).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  await page.getByRole("dialog").evaluate((el) => {
    for (const node of el.querySelectorAll<HTMLElement>("*"))
      if (getComputedStyle(node).overflowY === "auto") node.scrollTop = 0
  })
  await page.screenshot({ animations: "disabled", path: testInfo.outputPath("narrow-detail.png") })
})
