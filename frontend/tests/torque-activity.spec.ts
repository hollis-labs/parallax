import { expect, test } from "@playwright/test"
import {
  activityLevel,
  referencePulseCount,
  torqueActivityModel,
} from "../src/examples/torque/activity"
import { torqueSource } from "../src/examples/torque/reference"
import { operationsModel } from "../src/operations/model"
import { sourceDataset, timelineFrames } from "../src/playback/model"

const source = torqueSource("populated", "torque-16w")
const at = (scenario = "populated", cutoff = source.clock, query = "") =>
  operationsModel(scenario, query, { source, cutoff })
const entry = "/?example=torque&screen=dashboard&profile=torque-16w&theme=p4-white&mode=light"

test("reference Activity age endpoints and fixed cutoff retain exact calendar totals and covered zero semantics", async ({
  page,
}) => {
  const data = torqueActivityModel(at())
  expect(data.starts).toHaveLength(9)
  expect(data.pulseTotal).toBe(8)
  expect(data.calendarTotal).toBe(192)
  expect(data.calendar).toHaveLength(112)
  expect(data.recent).toHaveLength(12)
  const from = data.reference.pulse.from,
    to = data.reference.pulse.to
  expect(referencePulseCount([{ time: from }, { time: to }], from, to, to)).toBe(1)
  expect(referencePulseCount([{ time: to }], from, to, "2026-10-04T14:15:15Z")).toBe(0)
  expect(data.pulse.reduce((n, b) => n + (b.count ?? 0), 0)).toBe(8)
  const prefix = torqueActivityModel(at("populated", "2026-10-04T14:15:15Z"))
  expect(prefix.pulseTotal).toBe(3)
  expect(prefix.pulse.at(-1)?.partial).toBe(true)
  expect(prefix.recent[0].id).toBe("RUN-003")
  const empty = torqueActivityModel(at("empty")),
    blocked = torqueActivityModel(at("loading"))
  expect(empty.maximum).toBe(0)
  expect(empty.pulseTotal).toBe(0)
  expect(empty.calendar.some((c) => c.count === 0)).toBe(true)
  expect(blocked.calendarTotal).toBeNull()
  expect(blocked.pulseTotal).toBeNull()
  const early = timelineFrames(source)
    .filter((t) => t < data.reference.pulse.from)
    .at(-1)
  if (!early) throw new Error("missing before-window fixture frame")
  expect(torqueActivityModel(at("populated", early)).pulseTotal).toBeNull()
  await page.goto(entry + "&cutoff=" + early)
  await expect(page.locator(".torque-activity")).toContainText(
    "Unknown visible starts · peak Unknown",
  )
  for (const [count, max, level] of [
    [0, 0, "0"],
    [1, 10, "1"],
    [2, 10, "2"],
    [4, 10, "3"],
    [7, 10, "4"],
  ] as const)
    expect(activityLevel(count, max)).toBe(level)
  expect(activityLevel(null, 10)).toBe("unknown")
  expect(torqueActivityModel(at("sparse")).unknownDays).toBeGreaterThan(data.unknownDays)
})

test("native Activity reference renders discrete paint, exact UTC operands and fixed summary/header", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(entry)
  const activity = page.getByRole("region", { name: "Torque reference Activity", exact: true })
  await expect(page.getByRole("heading", { name: "Ops Dashboard", exact: true })).toBeVisible()
  await expect(
    page.getByRole("region", { name: "Unified Ops Dashboard", exact: true }),
  ).toContainText("Original reference 2026-10-04T14:30:00Z")
  await expect(activity).toContainText("9 admitted supplied buffer entries; 8 visible starts")
  await expect(activity.locator(".torque-calendar-week")).toHaveCount(16)
  await expect(activity.locator(".torque-calendar-week .torque-calendar-cell")).toHaveCount(112)
  const known = activity.locator('.torque-calendar-week [data-level="0"]').first(),
    positive = activity.locator('.torque-calendar-week [data-level="4"]').first(),
    gap = activity.locator('.torque-calendar-week [data-level="unknown"]').first()
  const paint = async (l: any) =>
    l.evaluate((e: Element) => ({
      bg: getComputedStyle(e).backgroundColor,
      image: getComputedStyle(e).backgroundImage,
    }))
  expect((await paint(positive)).bg).not.toBe((await paint(known)).bg)
  expect((await paint(gap)).image).not.toBe("none")
  const bins = activity.locator(".torque-pulse-bin")
  await expect(bins).toHaveCount(24)
  expect(
    await bins
      .locator("i")
      .evaluateAll((es) => Math.max(...es.map((e) => e.getBoundingClientRect().height))),
  ).toBe(48)
  await page.screenshot({ path: info.outputPath("activity-reference-desktop.png") })
  const a = await activity.locator(".torque-activity-pair > div").nth(0).boundingBox(),
    b = await activity.locator(".torque-activity-pair > div").nth(1).boundingBox()
  if (!a || !b) throw new Error("missing pair")
  expect(a.y).toBe(b.y)
  expect(a.x + a.width).toBeLessThan(b.x)
  await activity
    .locator(".torque-activity-pair")
    .evaluate((e) => e.scrollIntoView({ block: "start" }))
  await page.screenshot({ path: info.outputPath("activity-pair-desktop.png") })
  await activity.getByText("Exact recorded pulse intervals", { exact: true }).click()
  await page.keyboard.press("Tab")
  await expect(
    activity.getByRole("region", { name: "Activity pulse UTC table", exact: true }),
  ).toBeFocused()
  await page.keyboard.press("Tab")
  for (let i = 1; i < 12; i++) await page.keyboard.press("Tab")
  await expect(activity.locator(".torque-recent button").last()).toBeFocused()
  await activity.locator(".torque-recent button").last().scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath("activity-recent-last-desktop.png") })
})

test("native UTC disclosures recent keyboard detail and fresh StrictMode callbacks preserve admitted lifecycle", async ({
  page,
}, info) => {
  await page.goto("http://127.0.0.1:18545" + entry + "&cutoff=2026-10-04T14:15:15Z")
  const activity = page.getByRole("region", { name: "Torque reference Activity", exact: true })
  await activity.getByText("Exact recorded pulse intervals", { exact: true }).click()
  await page.keyboard.press("Tab")
  const table = activity.getByRole("region", { name: "Activity pulse UTC table", exact: true })
  await expect(table).toBeFocused()
  await page.keyboard.press("Control+End")
  await expect
    .poll(() => table.evaluate((e) => e.scrollHeight - e.clientHeight - e.scrollTop))
    .toBeLessThanOrEqual(1)
  await page.keyboard.press("Tab")
  const first = activity.locator(".torque-recent button").first()
  await expect(first).toBeFocused()
  await first.evaluate((e) => {
    const key = Object.keys(e).find((k) => k.startsWith("__reactProps"))
    if (!key) throw new Error("missing rendered callback")
    ;(window as any).oldRecent = (e as any)[key].onClick
  })
  await page.keyboard.press("Enter")
  await expect(page).toHaveURL(/selected=TASK-003/)
  await expect(
    page.getByRole("heading", { name: "Task and run inspection", exact: true }),
  ).toBeVisible()
  const dialog = page.getByRole("dialog", { name: "Task and run inspection", exact: true })
  await expect(dialog).toContainText("TASK-003 / RUN-003")
  await expect(dialog).toContainText("3,812")
  await expect(dialog).toContainText("running")
  await expect.poll(() => dialog.evaluate((e) => getComputedStyle(e).opacity)).toBe("1")
  await page.keyboard.press("Control+Home")
  await expect(
    dialog.getByText("Inspect telemetry sampling drift", { exact: true }),
  ).toBeInViewport()
  await page.screenshot({ path: info.outputPath("activity-record-prefix-desktop.png") })
  await page.keyboard.press("Escape")
  await expect(dialog).toHaveCount(0)
  await expect(page).toHaveURL(/screen=dashboard/)
  await page.setViewportSize({ width: 390, height: 650 })
  await page.goForward()
  await expect.poll(() => dialog.evaluate((e) => getComputedStyle(e).opacity)).toBe("1")
  const body = dialog.locator(".example-body")
  const scrollState = () =>
    body.evaluate((e) => {
      for (let n = e.parentElement; n; n = n.parentElement) {
        if (
          n.scrollHeight > n.clientHeight &&
          ["auto", "scroll"].includes(getComputedStyle(n).overflowY)
        )
          return {
            top: n.scrollTop,
            remaining: n.scrollHeight - n.clientHeight - n.scrollTop,
            y: n.getBoundingClientRect().y,
            bottom: n.getBoundingClientRect().bottom,
          }
      }
      throw new Error("missing native record scroll owner")
    })
  const geometry = await dialog.boundingBox()
  if (!geometry) throw new Error("missing dialog geometry")
  await page.mouse.move(geometry.x + geometry.width / 2, geometry.y + geometry.height / 2)
  await page.mouse.wheel(0, -5000)
  await expect.poll(async () => (await scrollState()).top).toBe(0)
  await expect(dialog.locator("dl dd").nth(0)).toBeInViewport()
  await expect(dialog.locator("dl dd").nth(1)).toBeInViewport()
  await expect(dialog.locator("dl dd").nth(2)).toBeInViewport()
  await expect(dialog.locator("dl dd").nth(3)).toBeInViewport()
  await expect
    .poll(async () => {
      const bounds = await scrollState()
      for (let i = 0; i < 4; i++) {
        const r = await dialog.locator("dl dd").nth(i).boundingBox()
        if (!r || r.y < bounds.y || r.y + r.height > bounds.bottom) return false
      }
      return true
    })
    .toBe(true)
  await page.screenshot({ path: info.outputPath("activity-record-prefix-narrow-top.png") })
  await page.mouse.wheel(0, 120)
  const usage = dialog.locator("dl dd").nth(5)
  await expect
    .poll(async () => {
      const u = await usage.boundingBox(),
        c = await dialog
          .getByRole("button", { name: "Close record inspection", exact: true })
          .boundingBox()
      return !!u && !!c && u.y + u.height <= c.y
    })
    .toBe(true)
  await expect(usage).toContainText("USAGE-003 · 3,812")
  await page.screenshot({ path: info.outputPath("activity-record-prefix-narrow-receipt.png") })
  const close = dialog.getByRole("button", { name: "Close record inspection", exact: true })
  for (let i = 0; i < 12 && !(await close.evaluate((e) => e === document.activeElement)); i++)
    await page.keyboard.press("Tab")
  await expect(close).toBeFocused()
  await page.keyboard.press("Shift+Tab")
  await page.keyboard.press("Control+End")
  await page.mouse.move(geometry.x + geometry.width / 2, geometry.y + geometry.height / 2)
  await page.mouse.wheel(0, 5000)
  await expect.poll(async () => (await scrollState()).remaining).toBeLessThanOrEqual(1)
  await page.keyboard.press("Tab")
  await expect(close).toBeFocused()
  await expect(dialog.locator(".log-line").last()).toBeInViewport()
  await expect
    .poll(async () => {
      const lastRect = await dialog.locator(".log-line").last().boundingBox(),
        footerRect = await close.boundingBox()
      if (!lastRect || !footerRect) throw new Error("missing record tail geometry")
      return lastRect.y + lastRect.height <= footerRect.y
    })
    .toBe(true)
  await page.screenshot({ path: info.outputPath("activity-record-prefix-narrow-tail.png") })
  await page.keyboard.press("Escape")
  await expect(dialog).toHaveCount(0)
  await expect(page).toHaveURL(/screen=dashboard/)
  await page.setViewportSize({ width: 1280, height: 720 })
  await page
    .getByRole("navigation", { name: "Torque application navigation", exact: true })
    .getByRole("link", { name: "Observability", exact: true })
    .click()
  await page.evaluate(() => {
    ;(window as any).oldRecent()
  })
  await expect(page).toHaveURL(/screen=dashboard/)
  await page.getByRole("tab", { name: "Mission Control", exact: true }).click()
  await page.evaluate(() => {
    ;(window as any).oldRecent()
  })
  await expect(page.getByRole("tab", { name: "Mission Control", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  )
  await page.getByRole("tab", { name: "Activity", exact: true }).click()
  await expect(activity.locator(".torque-recent button")).toHaveCount(12)
})

test("390px dark Activity complete calendar pulse recent last row and short footer remain natively reachable", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(entry.replace("p4-white", "p1-green-phosphor").replace("mode=light", "mode=dark"))
  const activity = page.getByRole("region", { name: "Torque reference Activity", exact: true })
  await page.screenshot({ path: info.outputPath("activity-reference-narrow.png") })
  await activity
    .getByRole("heading", { name: "Activity — 16w", exact: true })
    .evaluate((e) => e.scrollIntoView({ block: "start" }))
  await page.screenshot({ path: info.outputPath("activity-calendar-graphic-narrow.png") })
  await activity.getByText("Exact Activity calendar evidence", { exact: true }).click()
  await page.keyboard.press("Tab")
  const calendar = activity.getByRole("region", {
    name: "Activity calendar UTC table",
    exact: true,
  })
  await expect(calendar).toBeFocused()
  await page.keyboard.press("Control+End")
  await expect
    .poll(() => calendar.evaluate((e) => e.scrollHeight - e.clientHeight - e.scrollTop))
    .toBeLessThanOrEqual(1)
  await calendar.scrollIntoViewIfNeeded()
  const last = calendar.getByRole("row").last(),
    rect = await last.boundingBox(),
    bounds = await calendar.boundingBox()
  if (!rect || !bounds) throw new Error("missing calendar endpoint")
  expect(rect.y).toBeGreaterThanOrEqual(bounds.y)
  expect(rect.y + rect.height).toBeLessThanOrEqual(bounds.y + bounds.height)
  await expect(last).toContainText("2026-10-10UnknownUnknown")
  await page.screenshot({ path: info.outputPath("activity-calendar-narrow.png") })
  await activity
    .locator(".torque-activity-pair > div")
    .first()
    .evaluate((e) => e.scrollIntoView({ block: "center", behavior: "instant" }))
  await page.screenshot({ path: info.outputPath("activity-pulse-narrow.png") })
  await activity.getByText("Exact recorded pulse intervals", { exact: true }).click()
  await page.keyboard.press("Tab")
  await expect(
    activity.getByRole("region", { name: "Activity pulse UTC table", exact: true }),
  ).toBeFocused()
  await page.keyboard.press("Tab")
  for (let i = 1; i < 12; i++) await page.keyboard.press("Tab")
  const recentLast = activity.locator(".torque-recent button").last()
  await expect(recentLast).toBeFocused()
  await recentLast.scrollIntoViewIfNeeded()
  expect(await recentLast.evaluate((e) => getComputedStyle(e).outlineStyle)).toBe("solid")
  await page.screenshot({ path: info.outputPath("activity-recent-last-narrow.png") })
  expect(await page.locator(".torque-page").evaluate((e) => e.scrollWidth)).toBeLessThanOrEqual(390)
  await page.setViewportSize({ width: 1280, height: 500 })
  await page.locator(".torque-page").evaluate((e) => e.scrollTo({ top: e.scrollHeight }))
  await expect(page.locator(".torque-page-footer")).toBeVisible()
  await page.screenshot({ path: info.outputPath("activity-footer-short.png") })
})

test("portable Activity states distinguish known empty unknown coverage degraded and denied without effects", async ({
  page,
}) => {
  const effects: string[] = []
  page.on("request", (r) => {
    if (/^\/(api|plugins)\//.test(new URL(r.url()).pathname)) effects.push(r.url())
  })
  for (const [story, text] of [
    ["activity-empty", "No admitted matching runs · known count 0"],
    ["activity-loading", "Loading scenario"],
    ["activity-error", "Could not load observations"],
    ["activity-degraded", "Degraded fixture presentation"],
    ["activity-denied", "Access denied"],
    ["activity-sparse", "Authored sparse review mask"],
    ["activity-unknown", "external-review"],
  ]) {
    await page.goto(
      `http://127.0.0.1:18542/iframe.html?id=app-examples-torque--${story}&viewMode=story`,
    )
    await expect(page.locator(".torque-page")).toContainText(text)
    if (story === "activity-empty")
      await expect(page.locator(".torque-activity")).toContainText(
        "0 visible covered events · peak 0",
      )
    if (story === "activity-loading" || story === "activity-denied")
      await expect(page.locator(".torque-calendar")).toHaveCount(0)
  }
  expect(effects).toEqual([])
})

test("visible reference entry replaces incompatible legacy frame consistently across native reload and history", async ({
  page,
}) => {
  const old = timelineFrames(sourceDataset("large")).find(
    (t) => !timelineFrames(source).includes(t),
  )
  if (!old) throw new Error("missing distinct legacy frame")
  await page.goto(`/?example=torque&screen=dashboard&profile=legacy&scenario=large&cutoff=${old}`)
  await page.getByRole("tab", { name: "Usage", exact: true }).click()
  await page.getByRole("button", { name: "Open Torque Activity reference", exact: true }).click()
  await expect(page.getByRole("tab", { name: "Activity", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  )
  await expect(page).toHaveURL(/profile=torque-16w/)
  expect(new URL(page.url()).searchParams.get("cutoff")).toBe(source.clock)
  await expect(
    page.getByRole("region", { name: "Torque reference Activity", exact: true }),
  ).toBeVisible()
  await page.reload()
  expect(new URL(page.url()).searchParams.get("cutoff")).toBe(source.clock)
  await page.goBack()
  await expect(
    page.getByRole("button", { name: "Open Torque Activity reference", exact: true }),
  ).toBeVisible()
  expect(new URL(page.url()).searchParams.get("cutoff")).toBe(old)
})
