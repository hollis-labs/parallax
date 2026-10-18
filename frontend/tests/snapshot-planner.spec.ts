import { expect, test } from "@playwright/test"

test("Planner captured views, search, details and local draft use no business endpoints", async ({
  page,
}, info) => {
  const effects: string[] = []
  page.on("request", (r) => {
    if (r.method() !== "GET" || /torque\.nanite|tether\.nanite|tachyon\.nanite/.test(r.url()))
      effects.push(r.url())
  })
  await page.goto("/?example=snapshots&source=planner")
  await expect(page.getByRole("heading", { name: "Planner", exact: true })).toBeVisible()
  await expect(page.getByRole("heading", { name: "In motion", exact: true })).toBeVisible()
  await page.screenshot({ path: info.outputPath("planner-board.png"), animations: "disabled" })
  await page.getByRole("button", { name: "Activity", exact: true }).click()
  await expect(page.getByRole("heading", { name: "In flight", exact: true })).toBeVisible()
  for (const label of [
    "Priorities",
    "Workstreams",
    "Roadmap",
    "Ideas",
    "Decisions",
    "Risks",
    "Inbox",
  ]) {
    await page.getByRole("button", { name: new RegExp(`^${label}`) }).click()
    await expect(page.getByRole("searchbox", { name: `Filter ${label}` })).toBeVisible()
  }
  await page.getByRole("button", { name: /^Decisions/ }).click()
  await expect(page.getByText(/partial capture/)).toBeVisible()
  await page.getByRole("button", { name: /^Workstreams/ }).click()
  const first = page.getByRole("button", { name: /^Open / }).first()
  const name = await first.getAttribute("aria-label")
  if (!name) throw Error("Missing accessible row label")
  await first.click()
  await expect(page.getByRole("dialog")).toContainText("Snapshot coverage")
  await expect(page.getByRole("dialog").locator("pre")).toHaveCount(0)
  await page.keyboard.press("Escape")
  await page
    .getByRole("searchbox", { name: "Filter Workstreams" })
    .fill("no-such-planner-item-unique")
  await expect(page.getByText("Nothing matches", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Reset review", exact: true }).click()
  await expect(page.getByRole("searchbox", { name: "Filter Workstreams" })).toHaveValue("")
  await page.getByRole("button", { name: "Filter Planner status", exact: true }).click()
  await page.getByRole("option", { name: /^active/ }).click()
  await expect(page.getByRole("button", { name: /^Show settled/ })).toBeDisabled()
  await page
    .getByRole("searchbox", { name: "Search all captured Planner lists" })
    .fill(name.split(":")[0].replace("Open ", ""))
  await expect(page.getByText(/matches across/)).toBeVisible()
  await expect(page.getByRole("button", { name: name, exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Clear Planner search", exact: true }).click()
  await page.getByRole("button", { name: "New item preview", exact: true }).click()
  await page.getByRole("textbox", { name: "Planner draft title" }).fill("Local review item")
  await page.getByRole("button", { name: "Preview item", exact: true }).click()
  await expect(page.getByRole("dialog")).toContainText("The captured lists are unchanged")
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: "Board", exact: true }).click()
  await page.goBack()
  await expect(page.getByRole("button", { name: /^Workstreams/ })).toHaveAttribute(
    "aria-current",
    "page",
  )
  expect(effects).toEqual([])
})

test("Planner wraps navigation and bounds tables with enlarged text at phone width", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/?example=snapshots&source=planner")
  await page.getByRole("heading", { name: "Planner", exact: true }).waitFor()
  await page.evaluate(() => (document.documentElement.style.fontSize = "20px"))
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(390)
  await page.getByRole("button", { name: /^Workstreams/ }).click()
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(390)
  const lastTab = await page.getByRole("button", { name: /^Inbox/ }).boundingBox()
  const filter = await page.getByRole("searchbox", { name: "Filter Workstreams" }).boundingBox()
  if (!lastTab || !filter) throw Error("Missing Planner controls")
  expect(filter.y).toBeGreaterThanOrEqual(lastTab.y + lastTab.height)
  await page.locator(".snapshot-review").evaluate((el) => (el.scrollTop = 0))
  await page.screenshot({ path: info.outputPath("planner-narrow.png"), animations: "disabled" })
  await page
    .getByRole("button", { name: /^Open / })
    .first()
    .click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
    .toBeLessThanOrEqual(390)
})

test("older snapshots disclose missing Planner data", async ({ page, request }) => {
  const pack = await (await request.get("/api/snapshots/current")).json()
  delete pack.sources.torque.planner
  await page.route("**/api/snapshots/current", (route) => route.fulfill({ json: pack }))
  await page.goto("/?example=snapshots&source=planner")
  await expect(page.getByText("No Planner capture installed", { exact: true })).toBeVisible()
})
