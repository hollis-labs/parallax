import { expect, test } from "@playwright/test"

for (const source of ["tether", "sessions"]) {
  for (const width of [1280, 390]) {
    test(`captured ${source} scrolls with keyboard and wheel at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto(`/?example=snapshots&source=${source}`)
      await page.locator(".snapshot-content").waitFor()
      const review = page.locator(".snapshot-review")
      await page.getByRole("heading", { name: "App snapshots", exact: true }).click()
      await page.keyboard.press("Control+End")
      await expect
        .poll(() => review.evaluate((el) => el.scrollHeight - el.clientHeight - el.scrollTop))
        .toBeLessThanOrEqual(1)
      await page.mouse.move(width / 2, 600)
      await page.mouse.wheel(0, -20000)
      await expect.poll(() => review.evaluate((el) => el.scrollTop)).toBe(0)
      await page.mouse.wheel(0, 20000)
      await expect
        .poll(() => review.evaluate((el) => el.scrollHeight - el.clientHeight - el.scrollTop))
        .toBeLessThanOrEqual(1)
      await page.mouse.wheel(0, -20000)
      await expect.poll(() => review.evaluate((el) => el.scrollTop)).toBe(0)
      await expect(page.getByLabel("Captured view", { exact: true })).toBeInViewport()
    })
  }
}

test("captured app review filters resets inspects and switches sources without business requests", async ({
  page,
}, info) => {
  const effects: string[] = []
  page.on("request", (r) => {
    if (r.method() !== "GET" || /torque\.nanite|tether\.nanite/.test(r.url())) effects.push(r.url())
  })
  await page.goto("/?view=Review+Workbench")
  await page.getByRole("button", { name: "Open App Snapshots", exact: true }).click()
  await expect(page.getByRole("heading", { name: "App snapshots", exact: true })).toBeVisible()
  const table = page.getByRole("region", { name: "Operations task table" })
  await expect(table.locator("tbody tr").first()).toBeVisible()
  const search = page.getByLabel("Example task filter", { exact: true })
  await search.fill("no-such-captured-task-unique")
  await expect(table).toContainText("No results found")
  await page.getByRole("button", { name: "Reset review", exact: true }).click()
  await expect(search).toHaveValue("")
  await table.locator("tbody a").first().click()
  await expect(page.getByRole("dialog")).toContainText(
    "task body and run details were not captured",
  )
  await expect(page.getByRole("dialog")).toContainText("Organization")
  await expect(page.getByRole("dialog")).toContainText("History")
  await expect(page.getByRole("dialog").locator("pre")).toHaveCount(0)
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.screenshot({ path: info.outputPath("captured-torque.png"), animations: "disabled" })
  await page.getByLabel("Captured view", { exact: true }).selectOption("tether")
  await expect(page.locator(".tether-overview-root")).toBeVisible()
  await expect(page).toHaveURL(/source=tether/)
  await page.screenshot({ path: info.outputPath("captured-tether.png"), animations: "disabled" })
  await page.getByLabel("Captured view", { exact: true }).selectOption("sessions")
  await expect(page.getByRole("table")).toBeVisible()
  await page.goBack()
  await expect(page.getByLabel("Captured view", { exact: true })).toHaveValue("tether")
  expect(effects).toEqual([])
})

test("captured review remains bounded with larger text on a narrow screen", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/?example=snapshots")
  await page.getByRole("region", { name: "Operations task table" }).waitFor()
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "20px"
  })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByLabel("Toggle Operations filters", { exact: true }).click()
  await page.getByLabel("Filter by project", { exact: true }).click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.keyboard.press("Escape")
  await page.screenshot({ path: info.outputPath("captured-narrow.png"), animations: "disabled" })
})

test("missing or incompatible capture is visible instead of silently substituting fixtures", async ({
  page,
}) => {
  await page.route("**/api/snapshots/current", (route) =>
    route.fulfill({ json: { version: "parallax-capture/v1", id: null, sources: null } }),
  )
  await page.goto("/?example=snapshots")
  await expect(page.getByText("No captured data installed", { exact: true })).toBeVisible()
  await expect(page.getByRole("table")).toHaveCount(0)
  await page.unroute("**/api/snapshots/current")
  await page.route("**/api/snapshots/current", (route) =>
    route.fulfill({ json: { version: "unsupported" } }),
  )
  await page.reload()
  await expect(page.getByRole("alert")).toHaveText("Unsupported snapshot version")
})
