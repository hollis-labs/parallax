import { expect, test } from "@playwright/test"

test("shared list/table/split/drawer keep selection and one body owner", async ({ page }, info) => {
  await page.goto("/?view=Layouts&scenario=large")
  await expect(page.getByRole("heading", { name: "Layouts", exact: true })).toBeVisible()
  const body = page.getByTestId("layout-scroll")
  await expect(body).toBeVisible()
  expect(await body.evaluate((e) => e.scrollHeight > e.clientHeight)).toBeTruthy()
  await page.getByRole("button", { name: /Review gateway permission.*TASK-001/ }).click()
  await expect(page.getByLabel("Comparison selected record")).toContainText("TASK-001 / RUN-001")
  for (const name of ["Table", "Split", "Drawer"]) {
    await page.getByRole("button", { name, exact: true }).click()
    await expect(page.getByText(/8[0]? linked tasks · TASK-001/)).toBeVisible()
  }
  await page.getByRole("button", { name: "Open detail drawer" }).click()
  await expect(page.getByRole("dialog")).toContainText("TASK-001 / RUN-001")
  await page.keyboard.press("Escape")
  await expect(page.getByRole("button", { name: "Open detail drawer" })).toBeFocused()
  await page.getByRole("button", { name: "Table", exact: true }).click()
  await page.getByRole("button", { name: "Inspect TASK-003" }).focus()
  await page.keyboard.press("Enter")
  await expect(page.getByLabel("Comparison selected record")).toContainText("TASK-003 / RUN-003")
  await page.getByRole("button", { name: "Split", exact: true }).click()
  await page.getByLabel("Detail width").fill("30")
  await expect(page.getByLabel("Detail width")).toHaveValue("30")
  await page.screenshot({
    path: info.outputPath("layout-split-desktop.png"),
    animations: "disabled",
  })
  await page.getByLabel("Navigation variant").selectOption("header")
  await page.getByRole("button", { name: "Usage", exact: true }).click()
  await expect(page.getByLabel("Selected run")).toContainText("TASK-003")
  await page.getByRole("button", { name: "Layouts", exact: true }).click()
  await expect(page.getByLabel("Comparison selected record")).toContainText("TASK-003")
  await page.getByLabel("Scenario").selectOption("permission-denied")
  await expect(page.getByText("Access denied by fixture policy")).toBeVisible()
  await expect(page.getByLabel("Comparison selected record")).toHaveCount(0)
  expect(
    await page.evaluate(() => document.documentElement.scrollHeight === innerHeight),
  ).toBeTruthy()
})
test("narrow drawers keyboard navigation and short rail remain reachable", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/?view=Layouts&layout=split&navigation=drawer&scenario=long-labels")
  await page.getByRole("button", { name: /Review gateway permission.*TASK-001/ }).click()
  await expect(page.getByRole("dialog")).toContainText("TASK-001")
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("button", { name: /Review gateway permission.*TASK-001/ }),
  ).toBeFocused()
  await page.getByRole("button", { name: "Open detail drawer" }).click()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("button", { name: "Open detail drawer" })).toBeFocused()
  await page.getByRole("button", { name: "Open navigation" }).click()
  await expect(page.getByRole("dialog")).toContainText("Parallax navigation")
  await page.keyboard.press("Escape")
  await expect(page.getByRole("button", { name: "Open navigation" })).toBeFocused()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  expect(await page.getByTestId("layout-scroll").evaluate((e) => e.clientHeight)).toBeGreaterThan(
    250,
  )
  await page.screenshot({ path: info.outputPath("layout-narrow.png"), animations: "disabled" })
  await page.getByLabel("Navigation variant").selectOption("header")
  await page.getByRole("button", { name: "Layouts", exact: true }).scrollIntoViewIfNeeded()
  await expect(page.getByRole("button", { name: "Layouts", exact: true })).toBeVisible()
  expect(await page.getByTestId("layout-scroll").evaluate((e) => e.clientHeight)).toBeGreaterThan(
    250,
  )
  await page.reload()
  await expect(page.getByLabel("Navigation variant")).toHaveValue("header")
  await expect(page.getByTestId("layout-scroll")).toHaveAttribute(
    "data-context",
    "long-labels/split",
  )
  await page.setViewportSize({ width: 1280, height: 600 })
  await page.getByLabel("Navigation variant").selectOption("rail")
  await page.getByRole("button", { name: "Layouts", exact: true }).scrollIntoViewIfNeeded()
  await expect(page.getByRole("button", { name: "Layouts", exact: true })).toBeVisible()
  expect(
    await page.locator(".navigation-scroll").evaluate((e) => e.scrollHeight > e.clientHeight),
  ).toBeTruthy()
})
test("comparison plugins and portable layouts reuse records without business requests", async ({
  page,
}, info) => {
  const bad: string[] = []
  page.on("request", (r) => {
    if (r.method() !== "GET" || !new URL(r.url()).hostname.match(/^(127\.0\.0\.1|localhost)$/))
      bad.push(r.url())
  })
  await page.goto("/?view=Layouts&layout=table&navigation=header&mode=light")
  await page.getByRole("button", { name: "Inspect TASK-003" }).click()
  await page.getByRole("button", { name: "Inspect tool intent" }).click()
  await expect(page.getByText(/Local inspection; fixture unchanged/)).toBeVisible()
  await page.getByRole("button", { name: "Inspect TASK-002" }).click()
  await expect(page.getByText(/Local inspection; fixture unchanged/)).toHaveCount(0)
  await page.getByText("Reviewed plugin widget and panel", { exact: true }).click()
  await expect(page.getByLabel("Plugin widget")).toContainText("8 fixture records")
  await expect(page.getByLabel("Plugin panel")).toContainText("operations/v2/records-8/populated")
  await page.getByTestId("layout-scroll").evaluate((e) => e.scrollTo({ top: 0 }))
  await page.screenshot({
    path: info.outputPath("layout-table-header-light.png"),
    animations: "disabled",
  })
  expect(bad).toEqual([])
  const api: string[] = []
  page.on("request", (r) => {
    if (r.url().includes("/api/") || r.url().includes("/plugins/")) api.push(r.url())
  })
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=layouts-controlled-comparison--split&viewMode=story",
  )
  await page.getByRole("button", { name: /Review gateway permission.*TASK-001/ }).click()
  await expect(page.getByLabel("Comparison selected record")).toContainText("SESSION-001")
  await page.getByRole("button", { name: "Table", exact: true }).click()
  await expect(page.getByLabel("Comparison selected record")).toContainText("TASK-001")
  expect(api).toEqual([])
})
