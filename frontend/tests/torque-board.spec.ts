import { expect, test } from "@playwright/test"

const entry = "/?example=torque&screen=tasks&profile=torque-16w"
for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
  { width: 1440, height: 420 },
  { width: 390, height: 420 },
]) {
  test(`board search, scope, selection and menu journey ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    await page.goto(entry)
    const search = page.getByLabel("Example task filter", { exact: true })
    await page.locator(".torque-ops-table-region").focus()
    await page.keyboard.press("/")
    await expect(search).toBeFocused()
    await search.pressSequentially("zz-no-results")
    await expect(page.getByText("No results found.", { exact: false })).toBeVisible()
    await search.press("Escape")
    await expect(search).toHaveValue("")
    await expect(search).toBeFocused()
    await page.getByRole("button", { name: "ϟ Eligible", exact: true }).focus()
    await page.keyboard.press("Enter")
    await expect(page.getByRole("status")).toContainText("Eligibility unavailable")
    await page.getByRole("button", { name: "Dismiss explanation" }).click()
    if (viewport.width < 760) await page.getByLabel("Toggle Operations filters").click()
    const scope = async (key: string, value: string) => {
      await page.getByRole("button", { name: `Filter by ${key}`, exact: true }).click()
      await page.getByRole("option", { name: value, exact: true }).click()
    }
    await scope("project", "Gateway")
    await page.getByRole("button", { name: "Filter by epic", exact: true }).click()
    await expect(page.getByRole("option")).toHaveText(["Epics", "Permission boundaries"])
    await page.getByRole("option", { name: "Permission boundaries", exact: true }).click()
    await scope("sprint", "Review sprint 1")
    await scope("project", "Client workspace")
    await expect(page.getByRole("button", { name: "Filter by epic", exact: true })).toHaveText(
      "Epics",
    )
    await expect(page.getByRole("button", { name: "Filter by sprint", exact: true })).toHaveText(
      "Sprints",
    )
    if (viewport.height < 540)
      expect(
        (await page.locator(".torque-ops-table-region").boundingBox())!.height,
      ).toBeGreaterThan(90)
    await page.getByRole("button", { name: "Clear", exact: true }).click()
    await expect(search).toBeFocused()
    await page.getByRole("button", { name: "Auto", exact: true }).click()
    await expect(page.getByRole("button", { name: "Manual", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    )
    await expect(page.getByRole("button", { name: "Auto", exact: true })).toHaveAttribute(
      "aria-pressed",
      "false",
    )
    await page.getByRole("button", { name: "Clear", exact: true }).click()
    if (viewport.width < 760) await page.getByLabel("Toggle Operations filters").click()
    const row = page
      .locator("tbody tr")
      .filter({ has: page.locator(".torque-ops-task") })
      .first()
    const id = await row.locator("code").textContent()
    await row.locator('input[type="checkbox"]').check()
    await page.locator("thead button").filter({ hasText: "Task" }).click()
    const selected = page
      .locator("tbody tr")
      .filter({ has: page.getByRole("button", { name: `Copy ${id}`, exact: true }) })
    await expect(selected.locator("input")).toBeChecked()
    await expect(page.locator('th[aria-sort="ascending"]')).toContainText("Task")
    const menu = selected.getByRole("button", { name: `Task actions ${id}` })
    await menu.click()
    await expect(page.getByRole("menu")).toBeVisible()
    await expect(page.getByRole("dialog")).toHaveCount(0)
    await page.keyboard.press("Escape")
    await expect(menu).toBeFocused()
    await selected.locator('[data-slot="record-title"] a').click()
    await expect(
      page.getByRole("dialog", { name: "Task and run inspection", exact: true }),
    ).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(selected.locator("input")).toBeChecked()
    await page.getByRole("button", { name: "Clear", exact: true }).click()
    await expect(page.locator('th[aria-sort="descending"]')).toContainText("Date")
    await expect(page.locator("tbody input:checked")).toHaveCount(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      viewport.width,
    )
  })
}

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
  { width: 1440, height: 420 },
  { width: 390, height: 420 },
]) {
  test(`authored actions confirm pending error and refusal ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    const mutations: string[] = []
    page.on("request", (request) => {
      if (!["GET", "HEAD", "OPTIONS"].includes(request.method())) mutations.push(request.url())
    })
    await page.goto(entry)
    for (const [status, command, result] of [
      ["blocked", "Mark done", "Simulated error"],
      ["done", "Move to todo", "Simulated refusal"],
      ["review", "Approve", "Preview complete"],
      ["queued", "Delete", "Preview complete"],
    ]) {
      const row = page
        .locator("tbody tr")
        .filter({ has: page.locator(`.torque-ops-status[data-status="${status}"]`) })
        .first()
      const before = await row.innerText()
      const trigger = row.getByRole("button", { name: /Task actions/ })
      await trigger.click()
      await page.getByRole("menuitem", { name: command, exact: true }).click()
      const dialog = page.getByRole("dialog", { name: "Local action preview", exact: true })
      await expect(dialog).toContainText("No task will change")
      const bounds = await dialog.boundingBox()
      expect(bounds?.y).toBeGreaterThanOrEqual(0)
      expect((bounds?.y ?? 0) + (bounds?.height ?? 0)).toBeLessThanOrEqual(viewport.height)
      await dialog.getByRole("button", { name: "Confirm preview" }).click()
      await expect(dialog.getByRole("status")).toContainText("Simulated pending")
      await expect(dialog.getByRole("status")).toContainText(result)
      await dialog.getByRole("button", { name: "Close preview" }).click()
      await expect(trigger).toBeFocused()
      expect(await row.innerText()).toBe(before)
    }
    expect(mutations).toEqual([])
  })
}

test("transition submenu hands keyboard focus to the preview and back to its row", async ({
  page,
}) => {
  await page.goto(entry)
  const row = page.locator('tr[data-task-id="TASK-003"]')
  const trigger = row.getByRole("button", { name: "Task actions TASK-003" })
  await trigger.click()
  await page.getByRole("menuitem", { name: "Transition to…", exact: true }).focus()
  await page.keyboard.press("ArrowRight")
  const target = page.getByRole("menuitem", { name: "Backlog", exact: true })
  await expect(target).toBeFocused()
  await page.keyboard.press("Enter")
  const dialog = page.getByRole("dialog", { name: "Local action preview", exact: true })
  await expect(dialog).toContainText("Transition to backlog · TASK-003")
  await expect(dialog.getByRole("heading")).toBeFocused()
  await page.keyboard.press("Escape")
  await expect(trigger).toBeFocused()
  await expect(row.locator(".torque-ops-status")).toHaveAttribute("data-status", "review")
})

test("portable board menu and search remain local and usable", async ({ page }) => {
  await page.goto("http://127.0.0.1:18542/iframe.html?id=app-examples-torque--tasks&viewMode=story")
  const url = page.url()
  await page
    .getByRole("button", { name: /Task actions/ })
    .first()
    .click()
  await page.keyboard.press("Escape")
  await page.getByLabel("Example task filter", { exact: true }).fill("no-matching-record")
  await expect(page.getByText("No results found.", { exact: false })).toBeVisible()
  await page.getByRole("button", { name: "Clear", exact: true }).click()
  await expect(page.getByLabel("Example task filter", { exact: true })).toBeFocused()
  expect(page.url()).toBe(url)
})

for (const rootSize of [16, 20, 24]) {
  test(`compact record typography and portalled menu at root ${rootSize}`, async ({ page }) => {
    await page.goto(entry)
    await page.locator('[data-slot="record-title"] a').first().waitFor()
    await page.evaluate((size) => {
      document.documentElement.style.fontSize = `${size}px`
    }, rootSize)
    const row = page.locator('tr[data-task-id="TASK-008"]')
    await expect(row.locator('[data-slot="record-title"] a')).toHaveCSS("font-size", "13px")
    await expect(row.locator('[data-slot="record-title"] a')).toHaveCSS("font-weight", "400")
    await expect(row.locator('[data-slot="record-metadata"]')).toHaveCSS("font-size", "10px")
    await expect(row.getByRole("button", { name: "Copy TASK-008", exact: true })).toHaveCSS(
      "font-size",
      "10px",
    )
    await expect(row.locator('[data-slot="badge"]')).toHaveCSS("font-size", "10px")
    await expect(row.locator(".torque-ops-status > span")).toHaveCSS("font-size", "11px")
    await expect(row.locator(".dash-record-priority")).toHaveCSS("font-size", "10px")
    await expect(row.locator(".torque-ops-date small")).toHaveCSS("font-size", "11px")
    await expect(page.locator("thead th").nth(1)).toHaveCSS("font-size", "10px")
    await expect(page.locator("html")).toHaveCSS("font-size", `${rootSize}px`)
    // A scalable surface nested within compact must recover browser text scaling.
    await page.evaluate(() => {
      const host = document.createElement("div")
      host.dataset.dashboardTypography = "scalable"
      host.id = "scalable-probe"
      host.append(document.querySelector('[data-slot="record-summary"]')!.cloneNode(true))
      document.body.append(host)
    })
    await expect(page.locator('#scalable-probe [data-slot="record-title"]')).toHaveCSS(
      "font-size",
      `${(rootSize * 13) / 16}px`,
    )
    await page.locator("#scalable-probe").evaluate((el) => el.remove())
    await row.getByRole("button", { name: "Task actions TASK-008" }).click()
    await expect(page.getByRole("menu")).toHaveAttribute("data-dashboard-typography", "compact")
    await expect(page.getByRole("menuitem", { name: "Move to todo", exact: true })).toHaveCSS(
      "font-size",
      `${(rootSize * 14) / 16}px`,
    )
    await page.getByRole("menuitem", { name: "Transition to…", exact: true }).focus()
    await page.keyboard.press("ArrowRight")
    const target = page.getByRole("menuitem", { name: "Backlog", exact: true })
    await expect(target).toBeFocused()
    await expect(target).toHaveCSS("font-size", `${(rootSize * 14) / 16}px`)
    await expect(page.getByRole("menu").filter({ has: target })).toHaveAttribute(
      "data-dashboard-typography",
      "compact",
    )
  })
}

test("large browser text keeps the short mobile table and portalled actions reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 420 })
  await page.goto(entry)
  await page.locator('[data-slot="record-title"] a').first().waitFor()
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "24px"
  })
  const table = page.locator(".torque-ops-table-region")
  expect((await table.boundingBox())!.height).toBeGreaterThan(80)
  const trigger = page.getByRole("button", { name: "Task actions TASK-008", exact: true })
  await trigger.click()
  await page.getByRole("menuitem", { name: "Transition to…", exact: true }).focus()
  await page.keyboard.press("ArrowRight")
  const target = page.getByRole("menuitem", { name: "Backlog", exact: true })
  await expect(target).toBeFocused()
  await page.keyboard.press("Enter")
  const dialog = page.getByRole("dialog", { name: "Local action preview", exact: true })
  await expect(dialog.getByRole("heading")).toBeFocused()
  await page.keyboard.press("Escape")
  await expect(trigger).toBeFocused()
})

for (const rootSize of [16, 20, 24]) {
  test(`compact header and filters preserve audited scaling at root ${rootSize}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1536, height: 936 })
    await page.goto(entry)
    await page.getByRole("heading", { name: "Operations", exact: true }).waitFor()
    await page.evaluate((size) => {
      document.documentElement.style.fontSize = `${size}px`
    }, rootSize)
    await expect(page.locator(".torque-heading h1")).toHaveCSS("font-size", "11px")
    await expect(page.locator(".torque-heading h1")).toHaveCSS("line-height", "16.5px")
    await expect(page.locator(".torque-header-scopes button").first()).toHaveCSS(
      "font-size",
      `${Number((rootSize * 0.8).toFixed(2))}px`,
    )
    await expect(page.locator(".torque-ops-summary .dash-summary-label").first()).toHaveCSS(
      "font-size",
      "11px",
    )
    await expect(page.locator(".torque-ops-summary .dash-summary-value").first()).toHaveCSS(
      "font-size",
      "13px",
    )
    await expect(page.locator(".torque-ops-summary .dash-summary-value").first()).toHaveCSS(
      "font-weight",
      "600",
    )
    for (const dot of await page.locator(".torque-ops-summary [aria-hidden]").all()) {
      await expect(dot).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)")
    }
    // Reference measurements include scalable separators and padding, not only type.
    const expectedGeometry = { 16: [26, 26], 20: [31, 32], 24: [37, 38] }[rootSize]!
    expect((await page.locator(".torque-ops-summary").boundingBox())!.height).toBeCloseTo(
      expectedGeometry[0],
      1,
    )
    expect((await page.locator(".torque-search-field").boundingBox())!.height).toBeCloseTo(
      expectedGeometry[1],
      1,
    )
    const chip = page
      .locator(".torque-ops-chips")
      .getByRole("button", { name: "backlog", exact: true })
    await expect(chip).toHaveCSS("font-size", "10px")
    expect(await chip.evaluate((el) => parseFloat(getComputedStyle(el).lineHeight))).toBeCloseTo(
      40 / 3,
      3,
    )
    await expect(page.locator(".torque-ops-chips").getByText("Status:", { exact: true })).toHaveCSS(
      "font-size",
      "10px",
    )
    await expect(page.locator(".torque-filter-desktop")).toHaveCSS("font-size", "10px")
    await expect(page.locator(".torque-search-field kbd")).toHaveCSS("font-size", "9px")
    await expect(page.locator(".torque-search-field kbd")).toHaveCSS("line-height", "13.5px")
    for (const selector of [
      ".torque-eligible",
      ".torque-search-field input",
      '[aria-label="Filter by project"]',
    ]) {
      await expect(page.locator(selector)).toHaveCSS("font-size", `${rootSize * 0.75}px`)
      await expect(page.locator(selector)).toHaveCSS("line-height", `${rootSize}px`)
    }
    // A nested scalable preview must restore the shared chip's original root-relative size.
    await page.evaluate(() => {
      const host = document.createElement("div")
      host.dataset.dashboardTypography = "scalable"
      host.id = "scalable-filter-probe"
      host.append(document.querySelector(".torque-ops-chips > div")!.cloneNode(true))
      document.body.append(host)
    })
    await expect(page.locator("#scalable-filter-probe button").first()).toHaveCSS(
      "font-size",
      `${(rootSize * 10) / 16}px`,
    )
    await page.locator("#scalable-filter-probe").evaluate((el) => el.remove())
    const scope = page.getByRole("button", { name: "Filter by project", exact: true })
    await scope.click()
    const popup = page.locator('[data-slot="popover-content"]')
    await expect(popup).toHaveAttribute("data-dashboard-typography", "compact")
    await expect(popup.getByRole("combobox")).toHaveCSS("font-size", "11px")
    await expect(popup.getByRole("option").first()).toHaveCSS(
      "font-size",
      `${(rootSize * 14) / 16}px`,
    )
    await page.keyboard.press("Escape")
    await expect(scope).toBeFocused()
    await expect(page.locator("html")).toHaveCSS("font-size", `${rootSize}px`)
    if (rootSize === 20) await page.screenshot({ path: ".scratch/gui-design/header-root20.png" })
  })
}

test("lab heading defaults yield to explicit component typography", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto("/?view=Review+Workbench")
  await expect(page.locator(".page-title h1")).toHaveCSS("font-size", "11px")
  await page.goto("/?example=reader&fragmentId=FRAG-001")
  const heading = page.getByRole("heading", { level: 1 })
  await expect(heading).toContainText("How Durable Content Memory Reshapes Knowledge Tools")
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "20px"
  })
  await expect(heading).toHaveCSS("font-size", "25px")
  await expect(heading).toHaveCSS("text-transform", "none")
})
