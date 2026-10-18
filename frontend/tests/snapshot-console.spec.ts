import { expect, test } from "@playwright/test"

test("Agents preserves grouped identities and readable details without source commands", async ({
  page,
}, info) => {
  const effects: string[] = []
  page.on("request", (r) => {
    if (r.method() !== "GET" || /tachyon\.nanite|torque\.nanite|tether\.nanite/.test(r.url()))
      effects.push(r.url())
  })
  await page.goto("/?example=snapshots&source=agents")
  await expect(page.getByRole("heading", { name: "Agents", exact: true })).toBeVisible()
  await expect(page.getByText(/Provisional scores use captured uptime/)).toBeVisible()
  await page
    .getByRole("button", { name: /^Inspect / })
    .first()
    .click()
  await expect(page.getByRole("dialog")).toContainText("Captured identity")
  await expect(page.getByRole("dialog")).toContainText("no recorded series")
  await expect(page.getByRole("dialog").locator("pre")).toHaveCount(0)
  await page.keyboard.press("Escape")
  await page.screenshot({ path: info.outputPath("agents-desktop.png"), animations: "disabled" })
  expect(effects).toEqual([])
})

test("Builder filters definitions, previews edits and teams, and stages assignments locally", async ({
  page,
}, info) => {
  const effects: string[] = []
  page.on("request", (r) => {
    if (r.method() !== "GET" || /tachyon\.nanite|torque\.nanite|tether\.nanite/.test(r.url()))
      effects.push(r.url())
  })
  await page.goto("/?example=snapshots&source=builder")
  const search = page.getByRole("searchbox", { name: "Search agent definitions" })
  await search.fill("no-such-definition-unique")
  await expect(page.getByText("No matching definitions", { exact: true })).toBeVisible()
  await search.fill("")
  await expect(page.getByRole("article")).toContainText("Permissions and policy")
  const label = await page.getByRole("article").locator("dt").first().boundingBox()
  const value = await page.getByRole("article").locator("dd").first().boundingBox()
  if (!label || !value) throw Error("Missing definition metadata")
  expect(Math.abs(label.y - value.y)).toBeLessThan(2)
  expect(value.x).toBeGreaterThan(label.x)

  await page.screenshot({ path: info.outputPath("builder-desktop.png"), animations: "disabled" })
  await page.getByRole("button", { name: "Edit preview", exact: true }).click()
  await page.getByRole("textbox", { name: "Definition name" }).fill("Local edited identity")
  await page.getByRole("button", { name: "Review definition", exact: true }).click()
  await expect(page.getByRole("status")).toContainText("captured definition is unchanged")
  await page.getByRole("button", { name: "Teams", exact: true }).click()
  await expect(page.getByText("Saved teams", { exact: true })).toHaveCount(0)
  await expect(page.getByRole("list", { name: "Saved teams" })).toBeVisible()
  await page.getByRole("list", { name: "Saved teams" }).getByRole("button").last().click()
  await expect(page.getByText("Shared policy", { exact: true })).toBeVisible()
  await page.screenshot({ path: info.outputPath("builder-teams.png"), animations: "disabled" })
  await page.getByRole("button", { name: "New team preview", exact: true }).click()
  await page.getByRole("textbox", { name: "Team preview name" }).fill("Review team")
  await page.getByRole("combobox", { name: "Team coordinator launch" }).selectOption({ index: 1 })
  await page.getByRole("button", { name: "Review team", exact: true }).click()
  await expect(page.getByRole("status")).toContainText("no saved team changed")
  await page.getByRole("button", { name: "Assignments", exact: true }).click()
  await page.getByRole("combobox", { name: "Assignment agent" }).selectOption({ index: 1 })
  await page.getByRole("textbox", { name: "Assignment target" }).fill("CW-preview-only")
  await page.getByRole("button", { name: "Stage assignment", exact: true }).click()
  await page.getByRole("button", { name: "Review assignments", exact: true }).click()
  await expect(page.getByRole("status")).toContainText("Nothing was saved or dispatched")
  await page.getByRole("button", { name: "Definitions", exact: true }).click()
  await expect(page.getByRole("textbox", { name: "Definition name" })).toHaveValue(
    "Local edited identity",
  )
  await page.getByRole("button", { name: "Reset review", exact: true }).click()
  await expect(page.getByRole("article")).toContainText("Capture coverage")
  await page.getByRole("button", { name: "New agent preview", exact: true }).click()
  await page
    .getByRole("dialog")
    .getByRole("textbox", { name: "Definition name" })
    .fill("Another local preview")
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Review definition", exact: true })
    .click()
  await expect(page.getByRole("dialog")).toContainText("captured definition is unchanged")
  await page.keyboard.press("Escape")
  expect(effects).toEqual([])
})

for (const source of ["agents", "builder"])
  test(`${source} remains usable at narrow width with enlarged text`, async ({ page }, info) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(`/?example=snapshots&source=${source}`)
    await page.locator(".snapshot-content").waitFor()
    await page.evaluate(() => (document.documentElement.style.fontSize = "20px"))
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(390)
    if (source === "builder") {
      await page.getByRole("button", { name: "Teams", exact: true }).click()
      await expect(page.getByText("Shared policy", { exact: true })).toBeVisible()
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(390)
    }
    await page.locator(".snapshot-review").evaluate((el) => (el.scrollTop = 0))
    await page.screenshot({ path: info.outputPath(`${source}-narrow.png`), animations: "disabled" })
  })

test("Planner section and search gutters align and separate the tab strip", async ({
  page,
}, info) => {
  await page.goto("/?example=snapshots&source=planner")
  const heading = page.getByRole("heading", { name: "In motion", exact: true })
  await heading.waitFor()
  const title = await heading.boundingBox(),
    section = await page.getByRole("region", { name: "In motion", exact: true }).boundingBox()
  if (!title || !section) throw Error("Missing section")
  expect(title.x).toBeGreaterThan(section.x)
  expect(title.y).toBeGreaterThan(section.y)
  const input = page.getByRole("searchbox", { name: "Search all captured Planner lists" })
  expect(await input.evaluate((el) => getComputedStyle(el).borderTopWidth)).toBe("0px")
  const band = input.locator('xpath=ancestor::div[contains(@class,"dash-toolbar")][1]')
  expect(await band.evaluate((el) => getComputedStyle(el).borderBottomWidth)).toBe("1px")
  await page.screenshot({ path: info.outputPath("planner-spacing.png"), animations: "disabled" })
})
