import { expect, test } from "@playwright/test"

test("Agents preserves grouped identities and readable details without source commands", async ({
  page,
}, info) => {
  const effects: string[] = []
  page.on("request", (r) => {
    if (r.method() !== "GET" || /tachyon\.nanite|torque\.nanite|tether\.nanite/.test(r.url()))
      effects.push(r.url())
  })
  // Older captures remain readable after activity history becomes available.
  await page.route("**/api/snapshots/current", async (route) => {
    const data = await (await route.fetch()).json()
    delete data.sources.console.fleet.observation
    for (const agent of data.sources.console.fleet.items) delete agent.history
    await route.fulfill({ json: data })
  })
  await page.goto("/?example=snapshots&source=agents")
  await expect(page.getByRole("heading", { name: "Agents", exact: true })).toBeVisible()
  await expect(page.getByText(/Provisional scores use captured uptime/)).toBeVisible()
  const opener = page.getByRole("button", { name: /^Inspect / }).first()
  const name = await opener.locator("strong").textContent()
  if (!name) throw Error("Missing captured agent name")
  await opener.focus()
  await page.keyboard.press("Enter")
  const dialog = page.getByRole("dialog", { name, exact: true })
  await expect(dialog.getByRole("heading", { name, exact: true })).toBeVisible()
  await expect(dialog.getByRole("group", { name: "Activity facts" })).toContainText("agent id")
  await expect(dialog.getByRole("region", { name: "Observed state timeline" })).toContainText(
    "Timeline not captured",
  )
  await expect(dialog).toContainText("no recorded series")
  const actions = dialog.getByRole("region", { name: "Message", exact: true }).getByRole("button")
  for (const action of await actions.all()) await expect(action).toBeDisabled()
  await dialog.getByText("Captured identity", { exact: true }).click()
  await expect(dialog.locator("details")).toContainText("Captured at")
  await expect(dialog.locator("pre")).toHaveCount(0)
  await page.keyboard.press("Escape")
  await expect(dialog).toBeHidden()
  await expect(opener).toBeFocused()
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
    } else {
      const opener = page.getByRole("button", { name: /^Inspect / }).first()
      await opener.click()
      const dialog = page.getByRole("dialog")
      await expect(dialog.getByRole("group", { name: "Activity facts" })).toBeVisible()
      await dialog.getByText("Captured identity", { exact: true }).click()
      await dialog.getByText("Captured at", { exact: true }).scrollIntoViewIfNeeded()
      expect(await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true)
      await page.keyboard.press("Escape")
      await expect(opener).toBeFocused()
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
