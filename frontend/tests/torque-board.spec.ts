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
    await page.getByLabel("Filter by project").selectOption("Gateway")
    await expect(page.getByLabel("Filter by epic").locator("option")).toHaveText([
      "All epics",
      "Permission boundaries",
    ])
    await page.getByLabel("Filter by epic").selectOption("Permission boundaries")
    await page.getByLabel("Filter by sprint").selectOption("Review sprint 1")
    await page.getByLabel("Filter by project").selectOption("Client workspace")
    await expect(page.getByLabel("Filter by epic")).toHaveValue("")
    await expect(page.getByLabel("Filter by sprint")).toHaveValue("")
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
    const selected = page.locator("tbody tr").filter({ has: page.locator(`code:text-is("${id}")`) })
    await expect(selected.locator("input")).toBeChecked()
    await expect(page.locator('th[aria-sort="ascending"]')).toContainText("Task")
    const menu = selected.getByRole("button", { name: `Task actions ${id}` })
    await menu.click()
    await expect(page.getByRole("menu")).toBeVisible()
    await expect(page.getByRole("dialog")).toHaveCount(0)
    await page.keyboard.press("Escape")
    await expect(menu).toBeFocused()
    await menu.click()
    await page.getByRole("menuitem", { name: /Inspect task/ }).click()
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
    for (const [status, result] of [
      ["blocked", "Simulated error"],
      ["done", "Simulated refusal"],
      ["review", "Preview complete"],
    ]) {
      const row = page
        .locator("tbody tr")
        .filter({ has: page.locator(`.torque-ops-status[data-status="${status}"]`) })
        .first()
      const before = await row.innerText()
      const trigger = row.getByRole("button", { name: /Task actions/ })
      await trigger.click()
      await page.getByRole("menuitem", { name: /Preview / }).click()
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
