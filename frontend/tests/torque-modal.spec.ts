import { expect, test } from "@playwright/test"
import { torqueSource } from "../src/examples/torque/reference"
import { timelineFrames } from "../src/playback/model"

const entry = "/?example=torque&screen=tasks&profile=torque-16w"
const inspection = (page: any) =>
  page.getByRole("dialog", { name: "Task and run inspection", exact: true })

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
  { width: 1440, height: 420 },
  { width: 390, height: 420 },
]) {
  test(`Operations modal preserves mounted context and history at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    await page.goto(entry)
    if (viewport.width < 760) await page.getByLabel("Toggle Operations filters").click()
    await page.getByRole("button", { name: "P1", exact: true }).click()
    if (viewport.width < 760) await page.getByLabel("Toggle Operations filters").click()
    await page.locator("thead button").filter({ hasText: "Task" }).click()
    const row = page.locator("tbody tr").nth(4)
    await row.locator("input").check()
    const link = row.locator("a")
    await link.focus()
    const table = page.locator(".torque-ops-table-region")
    const top = await table.evaluate((e) => e.scrollTop)
    const href = await link.getAttribute("href")
    await page.keyboard.press("Enter")
    const dialog = inspection(page)
    await expect(dialog).toBeVisible()
    await expect(
      dialog.getByRole("heading", { name: "Task and run inspection", exact: true }),
    ).toBeFocused()
    await expect(page.locator(".torque-operations")).toBeAttached()
    const rect = await dialog.boundingBox()
    expect(rect!.y).toBeGreaterThanOrEqual(0)
    expect(rect!.y + rect!.height).toBeLessThanOrEqual(viewport.height)
    await dialog.getByRole("button", { name: "Next task", exact: true }).click()
    await expect(page).not.toHaveURL(new URL(href!, "http://127.0.0.1:18541").href)
    await page.goBack()
    await expect(dialog).toHaveCount(0)
    await expect(
      page.getByRole("button", { name: "P1", exact: true, includeHidden: true }),
    ).toHaveAttribute("aria-pressed", "true")
    await expect(row.locator("input")).toBeChecked()
    expect(await table.evaluate((e) => e.scrollTop)).toBe(top)
    await link.click()
    await expect(dialog).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(dialog).toHaveCount(0)
    await expect(link).toBeFocused()
    await page.goto(href!)
    await expect(dialog).toBeVisible()
    await page.reload()
    await expect(dialog).toBeVisible()
    await dialog.getByRole("button", { name: "Close record inspection", exact: true }).click()
    await expect(page).toHaveURL(/screen=tasks/)
    await expect(dialog).toHaveCount(0)
  })
}

test("cold missing, denied and cutoff selections never expose stale joins", async ({ page }) => {
  for (const suffix of [
    "selected=missing",
    "selected=TASK-003&scenario=permission-denied",
    "selected=TASK-003&resource=unavailable",
    `selected=TASK-003&cutoff=${timelineFrames(torqueSource("populated", "torque-16w"))[0]}`,
  ]) {
    await page.goto(entry.replace("screen=tasks", "screen=task") + "&" + suffix)
    const dialog = inspection(page)
    await expect(dialog).toBeVisible()
    await expect(dialog).not.toContainText("RUN-003")
    await expect(dialog.getByRole("button", { name: "Next task", exact: true })).toBeDisabled()
    await dialog.getByRole("button", { name: "Close record inspection", exact: true }).click()
    await expect(dialog).toHaveCount(0)
    await expect(page.getByLabel("Example task filter", { exact: true })).toBeFocused()
  }
})

test("portable Operations uses the same automatic modal and local close without outer routing", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:18542/iframe.html?id=app-examples-torque--tasks&viewMode=story")
  const url = page.url()
  const link = page.locator(".torque-ops-task > a").first()
  await link.click()
  const dialog = inspection(page)
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText("Read-only fixture inspection")
  await dialog.getByRole("button", { name: "Next task", exact: true }).click()
  await page.keyboard.press("Escape")
  await expect(dialog).toHaveCount(0)
  await expect(link).toBeFocused()
  expect(page.url()).toBe(url)
})

test("native row Space and pointer activation exclude controls and wrap only the loaded board order", async ({
  page,
}) => {
  await page.goto(entry)
  const rows = page.locator("tbody tr").filter({ has: page.locator(".torque-ops-task") })
  const first = rows.first()
  await first.locator("input").check()
  await expect(inspection(page)).toHaveCount(0)
  const firstId = new URL(
    (await first.locator("a").getAttribute("href"))!,
    "http://localhost",
  ).searchParams.get("selected")
  const lastId = new URL(
    (await rows.last().locator("a").getAttribute("href"))!,
    "http://localhost",
  ).searchParams.get("selected")
  await first.focus()
  await page.keyboard.press("Space")
  const dialog = inspection(page)
  await expect(dialog).toBeVisible()
  await expect(dialog.locator(".torque-inspection-header")).toContainText(firstId!)
  await dialog.getByRole("button", { name: "Previous task", exact: true }).click()
  await expect(dialog.locator(".torque-inspection-header")).toContainText(lastId!)
  await dialog.getByRole("button", { name: "Next task", exact: true }).click()
  await expect(dialog.locator(".torque-inspection-header")).toContainText(firstId!)
  await page.keyboard.press("Escape")
  await expect(first).toBeFocused()
  await first.locator(".torque-ops-status").click()
  await expect(dialog).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(dialog).toHaveCount(0)
})
