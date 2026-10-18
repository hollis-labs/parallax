import { expect, type Page, test } from "@playwright/test"

async function sessionsFixture(page: Page) {
  const pack = await (await page.request.get("/api/snapshots/current")).json()
  pack.sources.tether.sessions.items = Array.from({ length: 60 }, (_, i) => ({
    id: `session-${String(i).padStart(4, "0")}-review`,
    launch_id: `launch-${i % 2}`,
    logical_agent_id: `agent-${i}`,
    project_id: "parallax",
    provider_id: i % 2 ? "provider-b" : "provider-a",
    provider_kind: "cli",
    state: i === 0 ? "running" : i === 1 ? "detached" : i === 2 ? "new-state" : "completed",
    created_at: "2026-10-17T00:00:00Z",
    updated_at: new Date(Date.UTC(2026, 9, 18, 2, 0, -i)).toISOString(),
  }))
  pack.sources.tether.sessions.sourceTotal = 150
  await page.route("**/api/snapshots/current", (route) => route.fulfill({ json: pack }))
  await page.goto("/?example=snapshots&source=sessions")
  await expect(page.getByRole("heading", { name: "Tether operations", exact: true })).toBeVisible()
}

test("sessions search, facets, sorting and reset share the captured slice", async ({ page }) => {
  await sessionsFixture(page)
  const rows = page.locator("tbody tr[tabindex]")
  await expect(rows.first()).toContainText("session-0000-review")
  await page
    .getByRole("table")
    .getByRole("button", { name: /^Session\s*[⇕↑↓]/ })
    .click()
  await page
    .getByRole("table")
    .getByRole("button", { name: /^Session\s*[⇕↑↓]/ })
    .click()
  await expect(rows.first()).toContainText("session-0059-review")
  await page.getByRole("button", { name: "Filter sessions by state", exact: true }).click()
  await page.getByRole("option", { name: /^running/ }).click()
  await expect(rows).toHaveCount(1)
  await expect(rows.first()).toContainText("session-0000-review")
  await page.getByRole("button", { name: "Filter sessions by provider", exact: true }).click()
  await page.getByRole("option", { name: /^provider-b/ }).click()
  await expect(page.getByText("No matching sessions", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Reload captured sessions", exact: true }).click()
  await expect(rows.first()).toContainText("session-0000-review")
  const search = page.getByRole("searchbox", { name: "Search captured sessions", exact: true })
  await search.fill("agent-42")
  await expect(rows).toHaveCount(1)
  await expect(rows.first()).toContainText("session-0042-review")
  await page.getByRole("button", { name: "Reset review", exact: true }).click()
  await expect(search).toHaveValue("")
  await expect(rows.first()).toContainText("session-0000-review")
})

test("session inspection and stop previews are keyboard accessible and never write", async ({
  page,
}) => {
  await sessionsFixture(page)
  const effects: string[] = []
  page.on("request", (r) => {
    if (r.method() !== "GET" || /tether\.nanite|torque\.nanite/.test(r.url())) effects.push(r.url())
  })
  const row = page.getByRole("button", { name: "Open session session-0000-review", exact: true })
  await row.focus()
  await page.keyboard.press("Enter")
  const details = page.getByRole("dialog", { name: "Session details", exact: true })
  await expect(details).toContainText("launch-0")
  await expect(details).toContainText("not included in this capture")
  await details.getByRole("button", { name: "Preview Stop Live", exact: true }).click()
  const preview = page.getByRole("dialog", { name: "Stop session · local preview", exact: true })
  const confirm = preview.getByRole("button", { name: "Confirm stop preview", exact: true })
  await expect(confirm).toBeDisabled()
  await preview.getByRole("textbox", { name: "Confirm session ID" }).fill("session-0000")
  await confirm.click()
  await expect(preview.getByRole("status")).toContainText("No runtime was stopped")
  await page.keyboard.press("Escape")
  await expect(preview).toHaveCount(0)
  await expect(details).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(details).toHaveCount(0)
  await expect(row).toBeFocused()
  await expect(row).toContainText("running")
  await page
    .getByRole("button", { name: "Session actions session-0001-review", exact: true })
    .click()
  await expect(page.getByRole("menuitem", { name: "Preview Stop Live" })).toBeDisabled()
  await page.getByRole("menuitem", { name: "View session", exact: true }).click()
  await expect(details).toContainText("Daemon disconnected")
  await expect(details.getByRole("button", { name: "Preview Stop Live" })).toBeDisabled()
  await page.keyboard.press("Escape")
  expect(effects).toEqual([])
})

test("sessions reveal later rows and remain usable with narrow larger-text layouts", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await sessionsFixture(page)
  await page.screenshot({ path: info.outputPath("sessions-desktop.png"), animations: "disabled" })
  await page.getByRole("heading", { name: "App snapshots", exact: true }).click()
  await page.keyboard.press("Control+End")
  await page.getByRole("button", { name: "Show more", exact: true }).click()
  await expect(
    page.getByRole("button", { name: "Open session session-0059-review", exact: true }),
  ).toBeAttached()
  await page.setViewportSize({ width: 390, height: 844 })
  await page.evaluate(() => {
    document.documentElement.style.fontSize = "20px"
  })
  await page.getByRole("button", { name: "Reload captured sessions", exact: true }).click()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: info.outputPath("sessions-narrow.png"), animations: "disabled" })
  await page
    .getByRole("searchbox", { name: "Search captured sessions" })
    .fill("session-0002-review")
  const unknown = page.getByRole("button", {
    name: "Open session session-0002-review",
    exact: true,
  })
  await unknown.focus()
  await page.keyboard.press("Enter")
  const details = page.getByRole("dialog", { name: "Session details", exact: true })
  await expect(details).toContainText("Unknown lifecycle")
  await expect(details).toContainText("new-state")
  await expect(details.getByRole("button", { name: "Preview Stop Live" })).toBeDisabled()
  await page.screenshot({
    path: info.outputPath("session-details-narrow.png"),
    animations: "disabled",
  })
})
