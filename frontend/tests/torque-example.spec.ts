import { expect, test } from "@playwright/test"
import { sourceDataset, timelineFrames } from "../src/playback/model"

const entry = "/?example=torque&theme=p4-white&mode=light"
const nav = (page: any) =>
  page.getByRole("navigation", { name: "Torque application navigation", exact: true })
test("standalone app native routes reload and browser back retain admitted selected record and cutoff", async ({
  page,
}) => {
  await page.goto(entry + "&screen=task&selected=TASK-003&cutoff=2026-10-04T14:15:15Z")
  await expect(
    page.getByRole("heading", { name: "Task and run inspection", exact: true }),
  ).toBeVisible()
  await expect(page.locator(".torque-page")).toContainText("TASK-003 / RUN-003")
  await nav(page).getByRole("link", { name: "About", exact: true }).click()
  await expect(page.locator('dt:text-is("Reference") + dd')).toHaveText("2026-10-04T14:30:00Z")
  await expect(page.locator('dt:text-is("Cutoff") + dd')).toHaveText("2026-10-04T14:15:15Z")
  await nav(page).getByRole("link", { name: "Tasks", exact: true }).click()
  await expect(page).toHaveURL(/screen=tasks/)
  await expect(page).toHaveURL(/selected=TASK-003/)
  await page.reload()
  await expect(nav(page).getByRole("link", { name: "Tasks", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  )
  await nav(page).getByRole("link", { name: "Dashboard", exact: true }).click()
  await expect(
    page.getByRole("region", { name: "Unified Ops Dashboard", exact: true }),
  ).toBeVisible()
  await page.goBack()
  await expect(page.getByRole("heading", { name: "Tasks", exact: true })).toBeVisible()
  await nav(page).getByRole("link", { name: "Dashboard", exact: true }).click()
  await page.getByRole("tab", { name: "Usage", exact: true }).click()
  await expect(page).toHaveURL(/tab=Usage/)
  await nav(page).getByRole("link", { name: "Tasks", exact: true }).click()
  await page.goBack()
  await expect(page.getByRole("tab", { name: "Usage", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  )
  await nav(page).getByRole("link", { name: "Runs", exact: true }).click()
  await expect(page.getByRole("heading", { name: "Run Explorer", exact: true })).toBeVisible()
  await page.getByRole("button", { name: /^Inspect RUN-001 / }).click()
  await expect(page).toHaveURL(/screen=task/)
  await expect(page).toHaveURL(/selected=TASK-001/)
  await expect(page.locator(".torque-page")).toContainText("TASK-001 / RUN-001")
  await expect(
    page.getByRole("button", { name: "Open Review Workbench", exact: true }),
  ).toHaveCount(0)
  await page.goto("/?theme=p3-amber-phosphor&mode=dark")
  await page.getByRole("button", { name: /Review gateway permission/ }).click()
  await page.keyboard.press("Escape")
  await page.getByText("Fixture timeline review", { exact: true }).click()
  await page
    .getByLabel("Playback position")
    .fill(String(timelineFrames(sourceDataset("populated")).indexOf("2026-10-04T14:15:15Z")))
  await page.getByRole("button", { name: "Open Review Workbench", exact: true }).click()
  await page.getByRole("button", { name: "Open Torque Example", exact: true }).click()
  await expect(page).toHaveURL(/example=torque/)
  for (const [key, value] of Object.entries({
    selected: "TASK-001",
    cutoff: "2026-10-04T14:15:15Z",
    theme: "p3-amber-phosphor",
    mode: "dark",
  }))
    expect(new URL(page.url()).searchParams.get(key)).toBe(value)
  await expect(page.locator(".torque-page-footer")).toContainText("TASK-001 / RUN-001")
})
test("native compact review source and prefix retirement withhold old selection while current callbacks stay usable", async ({
  page,
}) => {
  await page.goto(entry + "&screen=task&selected=TASK-003")
  await page.getByRole("button", { name: "Review fixtures", exact: true }).click()
  await page.getByLabel("Example review position", { exact: true }).fill("1")
  await expect(page).not.toHaveURL(/selected=/)
  await expect(
    page.getByRole("dialog", { name: "Torque fixture review", exact: true }),
  ).toHaveCount(0)
  await page.getByRole("button", { name: "Review fixtures", exact: true }).click()
  await expect(page.getByLabel("Example review position", { exact: true })).toHaveValue("1")
  await page.getByLabel("Example scenario", { exact: true }).selectOption("empty")
  await expect(page.locator(".torque-page")).toContainText("No selected admitted task")
  await page.getByRole("button", { name: "Review fixtures", exact: true }).click()
  await page.getByLabel("Example scenario", { exact: true }).selectOption("populated")
  await nav(page).getByRole("link", { name: "Tasks", exact: true }).click()
  await page.getByLabel("Example task filter", { exact: true }).pressSequentially("gateway")
  await expect(page.getByLabel("Example task filter", { exact: true })).toBeFocused()
  await expect(page.locator(".torque-task-list a")).toHaveCount(1)
  await page.locator(".torque-task-list a").click()
  await expect(page).toHaveURL(/selected=TASK-001/)
})
test("history roundtrips and StrictMode native first interaction retire captured callbacks and invalid reload selection", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:18545" + entry + "&screen=tasks")
  const dashboard = nav(page).getByRole("link", { name: "Dashboard", exact: true })
  await dashboard.evaluate((e) => {
    const key = Object.keys(e).find((k) => k.startsWith("__reactProps"))!
    ;(window as any).oldNav = (e as any)[key].onClick
  })
  await dashboard.click()
  await page.goBack()
  await expect(page.getByRole("heading", { name: "Tasks", exact: true })).toBeVisible()
  await page.evaluate(() => {
    ;(window as any).oldNav({ button: 0, preventDefault() {} })
  })
  await expect(page).toHaveURL(/screen=tasks/)
  await page.setViewportSize({ width: 390, height: 650 })
  await page.getByRole("button", { name: "Open app navigation", exact: true }).click()
  await page.evaluate(() => {
    ;(window as any).oldNav({ button: 0, preventDefault() {} })
  })
  await expect(page.getByRole("dialog", { name: "Torque navigation", exact: true })).toBeVisible()
  await expect(page).toHaveURL(/screen=tasks/)
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog", { name: "Torque navigation", exact: true })).toHaveCount(0)
  await page.setViewportSize({ width: 1280, height: 720 })
  await nav(page).getByRole("link", { name: "About", exact: true }).click()
  await expect(page.getByRole("heading", { name: "About this example", exact: true })).toBeVisible()
  await page.goto(entry + "&screen=task&selected=TASK-003&cutoff=2026-10-04T14:10:00Z")
  await expect(page).not.toHaveURL(/selected=/)
  await expect(page.locator(".torque-page")).toContainText("No selected admitted task")
})
test("desktop and short-height app show complete nav footer connected readonly record and admitted plugins", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(entry)
  await expect(page.locator(".torque-sidebar")).toBeVisible()
  await page.screenshot({ path: info.outputPath("torque-shell-dashboard-desktop.png") })
  await nav(page).getByRole("link", { name: "Tasks", exact: true }).click()
  await page.screenshot({ path: info.outputPath("torque-shell-tasks-desktop.png") })
  await nav(page).getByRole("link", { name: "Runs", exact: true }).click()
  await expect(page.getByRole("heading", { name: "Run Explorer", exact: true })).toBeVisible()
  await page.screenshot({ path: info.outputPath("torque-shell-runs-desktop.png") })
  await nav(page).getByRole("link", { name: "Tasks", exact: true }).click()
  await page.locator(".torque-task-list a").first().click()
  await page.screenshot({ path: info.outputPath("torque-shell-record-desktop.png") })
  await page.getByRole("button", { name: "Open bounded record details", exact: true }).click()
  await expect(
    page.getByRole("dialog", { name: "Torque record inspection", exact: true }),
  ).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("dialog", { name: "Torque record inspection", exact: true }),
  ).toHaveCount(0)
  await nav(page).getByRole("link", { name: "About", exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "Operations readiness", exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole("heading", { name: "Plugin context provenance", exact: true }),
  ).toBeVisible()
  await expect(page.getByText(/8 fixture records/)).toBeVisible()
  await page.getByRole("button", { name: "Open Usage through plugin action", exact: true }).click()
  await expect(page.getByRole("tab", { name: "Usage", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  )
  await nav(page).getByRole("link", { name: "About", exact: true }).click()
  await page.setViewportSize({ width: 1200, height: 500 })
  await expect(page.getByRole("link", { name: "Back to review lab", exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBe(500)
  await page.screenshot({ path: info.outputPath("torque-shell-about-short.png") })
  await page.getByRole("button", { name: "Open Usage through plugin action", exact: true }).focus()
  await expect(
    page.getByRole("button", { name: "Open Usage through plugin action", exact: true }),
  ).toBeFocused()
  await page.screenshot({ path: info.outputPath("torque-shell-plugin-short.png") })
})
test("390 dark native navigation and bounded review sheets focus return and app scroll stay usable", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 650 })
  await page.goto(entry.replace("p4-white&mode=light", "p1-green-phosphor&mode=dark"))
  await expect(page.locator(".torque-sidebar")).toBeHidden()
  await page.getByRole("button", { name: "Open app navigation", exact: true }).click()
  const leftSheet = page.getByRole("dialog", { name: "Torque navigation", exact: true })
  await expect
    .poll(() => leftSheet.evaluate((e) => Math.round(e.getBoundingClientRect().x)))
    .toBe(0)
  await expect.poll(() => leftSheet.evaluate((e) => getComputedStyle(e).opacity)).toBe("1")
  const rows = await leftSheet
    .getByRole("navigation")
    .getByRole("link")
    .evaluateAll((es) =>
      es.map((e) => {
        const r = e.getBoundingClientRect()
        return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, height: r.height }
      }),
    )
  expect(rows).toHaveLength(4)
  rows.forEach((r, i) => {
    expect(r.height).toBeGreaterThanOrEqual(40)
    expect(r.left).toBeGreaterThanOrEqual(0)
    expect(r.right).toBeLessThanOrEqual(390)
    if (i) expect(r.top).toBeGreaterThan(rows[i - 1].bottom)
  })
  await page.screenshot({ path: info.outputPath("torque-shell-navigation-narrow.png") })
  await page
    .getByRole("dialog", { name: "Torque navigation", exact: true })
    .getByRole("link", { name: "Tasks", exact: true })
    .click()
  await expect(page.getByRole("heading", { name: "Tasks", exact: true })).toBeVisible()
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.screenshot({ path: info.outputPath("torque-shell-tasks-narrow.png") })
  await page.getByRole("button", { name: "Review fixtures", exact: true }).click()
  const reviewDialog = page.getByRole("dialog", { name: "Torque fixture review", exact: true })
  await expect
    .poll(() => reviewDialog.evaluate((e) => Math.round(e.getBoundingClientRect().right)))
    .toBe(390)
  await expect.poll(() => reviewDialog.evaluate((e) => getComputedStyle(e).opacity)).toBe("1")
  for (
    let i = 0;
    i < 12 &&
    !(await page
      .getByRole("button", { name: "Reset example context", exact: true })
      .evaluate((e) => e === document.activeElement));
    i++
  )
    await page.keyboard.press("Tab")
  await expect(
    page.getByRole("button", { name: "Reset example context", exact: true }),
  ).toBeFocused()
  await expect(
    page.getByRole("button", { name: "Reset example context", exact: true }),
  ).toBeVisible()
  await page.screenshot({ path: info.outputPath("torque-shell-review-narrow.png") })
  await page.keyboard.press("Escape")
  await expect(page.getByRole("button", { name: "Review fixtures", exact: true })).toBeFocused()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await page.locator(".torque-task-list a").first().click()
  const trigger = page.getByRole("button", { name: "Open bounded record details", exact: true })
  await trigger.click()
  const dialog = page.getByRole("dialog", { name: "Torque record inspection", exact: true })
  await expect(dialog).toContainText("TASK-001 / RUN-001")
  await expect(dialog).toBeVisible()
  await expect.poll(() => dialog.evaluate((e) => getComputedStyle(e).opacity)).toBe("1")
  await page.keyboard.press("Control+Home")
  await expect(
    dialog.getByText("Review gateway permission boundaries", { exact: true }),
  ).toBeInViewport()
  await page.screenshot({ path: info.outputPath("torque-shell-record-overlay-narrow.png") })
  const close = dialog.getByRole("button", { name: "Close record inspection", exact: true })
  for (let i = 0; i < 12 && !(await close.evaluate((e) => e === document.activeElement)); i++)
    await page.keyboard.press("Tab")
  await expect(close).toBeFocused()
  await page.keyboard.press("Shift+Tab")
  await page.keyboard.press("Control+End")
  await expect(
    dialog.getByRole("heading", { name: "Lifecycle events", exact: true }),
  ).toBeInViewport()
  await expect(close).toBeInViewport()
  await page.screenshot({ path: info.outputPath("torque-shell-record-overlay-tail-narrow.png") })
  await page.keyboard.press("Escape")
  await expect(dialog).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await trigger.click()
  await expect(dialog).toBeVisible()
  await page.keyboard.press("Escape")
})
test("fullscreen portable complete app shares native routes and resource policy without API plugin requests", async ({
  page,
}) => {
  const forbidden: string[] = []
  page.on("request", (r) => {
    if (/\/(api|plugins)\//.test(r.url()) || r.method() !== "GET") forbidden.push(r.url())
  })
  for (const story of [
    "dashboard",
    "tasks",
    "runs",
    "record",
    "about",
    "empty",
    "loading",
    "denied",
    "prefix",
    "long-tasks",
  ]) {
    await page.goto(
      `http://127.0.0.1:18542/iframe.html?id=app-examples-torque--${story}&viewMode=story`,
    )
    await expect(page.locator(".torque-example")).toBeVisible()
    expect(await page.locator(".torque-example").count()).toBe(1)
  }
  await nav(page).getByRole("link", { name: "Dashboard", exact: true }).click()
  await expect(
    page.getByRole("region", { name: "Unified Ops Dashboard", exact: true }),
  ).toBeVisible()
  expect(forbidden).toEqual([])
})
