import { expect, test } from "@playwright/test"

test("coherent detail, transient intent, reset, themes and scroll", async ({ page }, testInfo) => {
  await page.goto("/")
  await expect(page.getByRole("heading", { name: "Activity", exact: true })).toBeVisible()
  await page.getByRole("button", { name: /Review gateway permission/ }).click()
  await expect(page.getByText("TASK-001 / RUN-001")).toBeVisible()
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
  await page.screenshot({ path: testInfo.outputPath("desktop.png") })
})
test("narrow layout retains accessible controls", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/")
  await page.getByLabel("Scenario").selectOption("long-labels")
  await expect(page.getByRole("heading", { name: "Activity", exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  await page.screenshot({ path: testInfo.outputPath("mobile.png") })
})
test("real admitted widget/panel follows controlled scenario and uses reviewed bytes", async ({
  page,
}) => {
  await page.goto("/")
  await expect(page.getByLabel("Plugin widget")).toContainText("8 fixture records")
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
  await expect(page.getByLabel("Plugin widget")).toContainText("10 fixture records · 0 complete")
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
    "http://127.0.0.1:18443/iframe.html?id=operations-fixed-activity--populated&viewMode=story",
  )
  await expect(page.getByText("24-hour execution pulse")).toBeVisible()
  await expect(page.getByText("8 observations")).toBeVisible()
  await expect(page.getByText("Window ends 14:30 UTC")).toBeVisible()
})
