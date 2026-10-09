import { expect, test } from "@playwright/test"
import {
  costSegments,
  distributionStatus,
  torqueMissionModel,
  volumeStatus,
} from "../src/examples/torque/mission"
import { torqueSource } from "../src/examples/torque/reference"
import { operationsModel } from "../src/operations/model"

const source = torqueSource("populated", "torque-16w")
const at = (scenario = "populated", cutoff = source.clock, query = "") =>
  operationsModel(scenario, query, { source, cutoff })
const entry = "/?example=torque&screen=dashboard&profile=torque-16w&theme=p4-white&mode=light"
test("reference Mission usage sums retain actual receipt joins window sample and independent classifier pipeline operands", () => {
  const d = torqueMissionModel(at())
  expect(d.sample).toMatchObject({ runs: 96, receipts: 96, tokens: 746223 })
  expect(d.sample.cost).toBeCloseTo(1.492446, 12)
  expect(d.window).toMatchObject({ runs: 23, receipts: 23, tokens: 181625 })
  expect(d.window.cost).toBeCloseTo(0.36325, 12)
  expect(d.days).toHaveLength(14)
  expect(d.days.reduce((n, x) => n + (x.inputTokens ?? 0), 0)).toBe(136212)
  expect(d.days.reduce((n, x) => n + (x.outputTokens ?? 0), 0)).toBe(45413)
  expect(d.distribution.map((s) => s.value)).toEqual([70, 24, 2, 0])
  expect(d.pipeline.map((s) => s.value)).toEqual([0, 0, 12, 58])
  expect(d.omitted).toHaveLength(26)
  for (const [raw, volume, donut] of [
    ["completed", "Reference running bucket", "Success"],
    ["canceled", "Reference running bucket", "Error"],
    ["timeout", "Reference running bucket", "Error"],
    ["queued", "Reference running bucket", "Active"],
    ["future", "Unknown", "Other / unknown"],
  ]) {
    expect(volumeStatus(raw)).toBe(volume)
    expect(distributionStatus(raw)).toBe(donut)
  }
  expect(
    torqueMissionModel(at("populated", "2026-10-04T14:14:00Z", "TASK-003")).sample.tokens,
  ).toBeNull()
  const prefix = torqueMissionModel(at("populated", "2026-10-04T14:15:15Z", "TASK-003"))
  expect(prefix.sample.tokens).toBe(3812)
  expect(prefix.days.at(-1)?.inputTokens).toBe(2859)
  const finished = torqueMissionModel(at("populated", "2026-10-04T14:15:30Z", "TASK-003"))
  expect(finished.distribution.map((s) => s.value)).toEqual([0, 1, 0, 0])
  expect(finished.sample.tokens).toBe(prefix.sample.tokens)
  expect(at("populated", "2026-10-04T14:15:15Z", "TASK-003").runs[0].status).toBe("running")
  expect(torqueMissionModel(at("empty")).sample.tokens).toBe(0)
  expect(torqueMissionModel(at("loading")).sample.tokens).toBeNull()
  expect(costSegments([1, null, 2])).toHaveLength(2)
})
test("native Mission renders actual stack contact donut proportions and raw pipeline with exact record inspection", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(entry + "&tab=Mission%20Control")
  const region = page.getByRole("region", { name: "Torque reference Mission Control", exact: true })
  await expect(region).toContainText("746223 tokens; 1.492446 USD")
  await expect(region).toContainText("181625 tokens; 0.36325 USD")
  await expect(region).toContainText("70 of 96 tasks; 26 excluded")
  const stack = page
    .locator(".torque-token g")
    .filter({ has: page.locator("rect[data-part=input]") })
    .last()
  const geometry = await stack.evaluate((g) => {
    const a = g.querySelector("[data-part=input]")!,
      b = g.querySelector("[data-part=output]")!
    const x = a.getBoundingClientRect(),
      y = b.getBoundingClientRect()
    return {
      x: x.x,
      bx: y.x,
      w: x.width,
      bw: y.width,
      y: x.y,
      bottom: y.bottom,
      h: x.height,
      bh: y.height,
      fill: getComputedStyle(a).fill,
      bfill: getComputedStyle(b).fill,
    }
  })
  expect(geometry.w).toBeGreaterThan(0)
  expect(geometry.x).toBeCloseTo(geometry.bx, 5)
  expect(geometry.w).toBeCloseTo(geometry.bw, 5)
  expect(geometry.y).toBeCloseTo(geometry.bottom, 4)
  expect(geometry.h / geometry.bh).toBeGreaterThan(2)
  expect(geometry.fill).not.toBe(geometry.bfill)
  expect((await page.locator(".torque-volume").boundingBox())!.height).toBe(160)
  expect((await page.locator(".torque-token").boundingBox())!.height).toBe(160)
  const donut = page.locator('[aria-label="Run distribution"] svg')
  expect((await donut.boundingBox())!.width).toBe(120)
  expect((await donut.boundingBox())!.height).toBe(120)
  const arcs = await donut.locator("circle[stroke-dasharray]").evaluateAll((es) =>
    es.map((e) => ({
      dash: e.getAttribute("stroke-dasharray")!.split(" ").map(Number),
      offset: Number(e.getAttribute("stroke-dashoffset")),
      paint: getComputedStyle(e).stroke,
    })),
  )
  expect(arcs).toHaveLength(3)
  const circumference = arcs[0].dash.reduce((a, b) => a + b, 0)
  for (const [i, count] of [70, 24, 2].entries()) {
    expect(arcs[i].dash[0] / circumference).toBeCloseTo(count / 96, 6)
    expect(arcs[i].paint).not.toBe("none")
  }
  expect(arcs[1].offset).toBeCloseTo(-arcs[0].dash[0], 6)
  const widths = await page
    .locator('[aria-label="Task pipeline"] div[style*="width"]')
    .evaluateAll((es) => es.map((e) => Number((e as HTMLElement).style.width.replace("%", ""))))
  expect(widths).toHaveLength(4)
  expect(widths[0]).toBe(0)
  expect(widths[1]).toBe(0)
  expect(widths[2]).toBeCloseTo((12 / 58) * 100, 3)
  expect(widths[3]).toBe(100)
  await page.screenshot({ path: info.outputPath("mission-desktop.png") })
  await page.locator(".torque-chart-totals").scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath("mission-throughput-desktop.png") })
})

test("Usage actual nullable area zero unavailable sparse split and exact receipts share source prefix tabs", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto(entry + "&tab=Usage")
  expect((await page.locator(".torque-cost").boundingBox())!.height).toBe(140)
  await expect(page.locator(".torque-cost circle")).toHaveCount(14)
  await expect(page.locator(".torque-cost path")).toHaveCount(1)
  expect(await page.locator(".torque-cost path").getAttribute("fill")).toBe(
    "url(#torque-cost-gradient)",
  )
  await expect(
    page.getByRole("region", { name: "Torque reference Usage", exact: true }),
  ).toContainText("1.492446 USD")
  await page.screenshot({ path: info.outputPath("usage-desktop.png") })
  await page.goto(entry + "&tab=Usage&scenario=sparse")
  expect(await page.locator(".torque-cost path").count()).toBeGreaterThan(1)
  await page.goto(entry + "&tab=Usage&scenario=empty")
  await expect(page.locator(".torque-mission")).toContainText("known 0 USD")
  await page.goto(entry + "&tab=Usage&scenario=loading")
  await expect(page.locator(".torque-cost")).toHaveCount(0)
  await page.goto(entry + "&tab=Mission%20Control&query=TASK-003&cutoff=2026-10-04T14:15:15Z")
  await page.getByText("Exact Mission UTC evidence", { exact: true }).click()
  await page.getByRole("button", { name: "Inspect RUN-003", exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "Task and run inspection", exact: true }),
  ).toBeVisible()
  await expect(page.getByRole("dialog")).toContainText("3,812")
  const dialog = page.getByRole("dialog")
  await expect.poll(() => dialog.evaluate((e) => getComputedStyle(e).opacity)).toBe("1")
  const box = await dialog.boundingBox()
  if (!box) throw new Error("missing current dialog bounds")
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.wheel(0, -5000)
  await expect
    .poll(() =>
      dialog.locator(".example-body").evaluate((e) => {
        for (let p = e.parentElement; p; p = p.parentElement)
          if (
            p.scrollHeight > p.clientHeight &&
            ["auto", "scroll"].includes(getComputedStyle(p).overflowY)
          )
            return p.scrollTop
        throw new Error("missing record owner")
      }),
    )
    .toBe(0)
  await expect(dialog.locator("dl dd").nth(0)).toBeInViewport()
  await page.screenshot({ path: info.outputPath("mission-prefix-record-desktop.png") })
  await page.setViewportSize({ width: 390, height: 750 })
  await page.mouse.move(195, 350)
  await page.mouse.wheel(0, -5000)
  await expect
    .poll(() =>
      dialog.locator(".example-body").evaluate((e) => {
        for (let p = e.parentElement; p; p = p.parentElement)
          if (
            p.scrollHeight > p.clientHeight &&
            ["auto", "scroll"].includes(getComputedStyle(p).overflowY)
          )
            return p.scrollTop
        throw new Error("missing record owner")
      }),
    )
    .toBe(0)
  await expect(dialog.locator("dl dd").nth(0)).toBeInViewport()
  await page.screenshot({ path: info.outputPath("mission-prefix-record-narrow.png") })

  if (await page.getByRole("dialog").count()) {
    await page.keyboard.press("Escape")
    await expect(page.getByRole("dialog")).toHaveCount(0)
  }
  await page.setViewportSize({ width: 1280, height: 750 })
  await page
    .getByRole("navigation", { name: "Torque application navigation", exact: true })
    .getByRole("link", { name: "Observability", exact: true })
    .click()
  await page.getByRole("tab", { name: "Usage", exact: true }).click()
  await expect(page).not.toHaveURL(/selected=/)
  await expect(page.locator(".torque-mission")).toContainText("3812 tokens")
})
test("native UTC companion bounded scroll reaches full final USD coverage and last inspection without outer chaining", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 750 })
  await page.goto(entry + "&tab=Usage")
  await page.getByText("Exact Usage UTC evidence", { exact: true }).click()
  await page.keyboard.press("Tab")
  const region = page.getByRole("region", { name: "Usage UTC table", exact: true })
  await expect(region).toBeFocused()
  const initial = await region.boundingBox()
  await page.keyboard.press("Control+End")
  await expect
    .poll(() => region.evaluate((e) => e.scrollHeight - e.clientHeight - e.scrollTop))
    .toBeLessThanOrEqual(1)
  await region.evaluate((e) => e.scrollIntoView({ block: "center", behavior: "instant" }))
  await page.screenshot({ path: info.outputPath("usage-table-narrow-left.png") })
  for (let i = 0; i < 80; i++) {
    if ((await region.evaluate((e) => e.scrollWidth - e.clientWidth - e.scrollLeft)) <= 2) break
    await page.keyboard.press("ArrowRight")
    await page.waitForTimeout(20)
  }
  await expect
    .poll(() => region.evaluate((e) => e.scrollWidth - e.clientWidth - e.scrollLeft))
    .toBeLessThanOrEqual(2)
  const rect = await region.boundingBox()
  expect(rect!.x).toBeCloseTo(initial!.x, 0)
  expect(rect!.x).toBeGreaterThanOrEqual(0)
  expect(rect!.x + rect!.width).toBeLessThanOrEqual(390)
  expect(await page.locator(".torque-page").evaluate((e) => e.scrollLeft)).toBe(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  const last = region.locator("tbody tr").last()
  await expect
    .poll(async () => {
      const r = await region.boundingBox(),
        a = await last.locator("td").nth(5).boundingBox(),
        b = await last.locator("td").nth(6).boundingBox()
      return (
        !!r &&
        !!a &&
        !!b &&
        a.x >= r.x &&
        b.x + b.width <= r.x + r.width + 1 &&
        a.y >= r.y &&
        b.y + b.height <= r.y + r.height + 1
      )
    })
    .toBe(true)
  await page.screenshot({ path: info.outputPath("usage-table-narrow-right.png") })
  const lastInspect = last.getByRole("button")
  await lastInspect.click()
  await expect(
    page.getByRole("heading", { name: "Task and run inspection", exact: true }),
  ).toBeVisible()
  await expect(page).toHaveURL(/selected=TASK-001/)
  await expect(page.getByRole("dialog")).toContainText("USAGE-001")
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(page).toHaveURL(/screen=dashboard/)
  await page.getByRole("button", { name: "Open app navigation", exact: true }).click()
  await page
    .getByRole("dialog", { name: "Torque navigation", exact: true })
    .getByRole("link", { name: "Observability", exact: true })
    .click()
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.getByRole("heading", { name: "Provider / model attribution" }).scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath("usage-attribution-narrow.png") })
})
test("fresh StrictMode and previous tab callback retirement refuse captured earlier Mission inspection", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:18545" + entry + "&tab=Mission%20Control&query=TASK-003")
  await page.getByText("Exact Mission UTC evidence", { exact: true }).click()
  const b = page.getByRole("button", { name: "Inspect RUN-003", exact: true })
  await b.evaluate((e) => {
    const k = Object.keys(e).find((k) => k.startsWith("__reactProps"))!
    ;(window as any).oldMission = (e as any)[k].onClick
  })
  await b.click()
  await expect(page).toHaveURL(/selected=TASK-003/)
  if (await page.getByRole("dialog").count()) {
    await page.keyboard.press("Escape")
    await expect(page.getByRole("dialog")).toHaveCount(0)
  }
  await page.setViewportSize({ width: 1280, height: 750 })
  await page
    .getByRole("navigation", { name: "Torque application navigation", exact: true })
    .getByRole("link", { name: "Observability", exact: true })
    .click()
  await page.getByRole("tab", { name: "Usage", exact: true }).click()
  await page.evaluate(() => {
    ;(window as any).oldMission()
  })
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.getByRole("tab", { name: "Mission Control", exact: true }).click()
  await page.getByText("Exact Mission UTC evidence", { exact: true }).click()
  await page.getByRole("button", { name: "Inspect RUN-003", exact: true }).click()
  await expect(
    page.getByRole("heading", { name: "Task and run inspection", exact: true }),
  ).toBeVisible()
})
test("portable Mission Usage states and390dark chart pipeline footer remain readable API free", async ({
  page,
}, info) => {
  const api: string[] = []
  page.on("request", (r) => {
    if (/\/api\/|\/plugins\//.test(r.url())) api.push(r.url())
  })
  for (const slug of [
    "mission-reference",
    "mission-empty",
    "mission-loading",
    "mission-degraded",
    "mission-sparse",
    "mission-unknown",
    "mission-denied",
    "usage-reference",
    "usage-empty",
    "usage-loading",
    "usage-degraded",
    "usage-sparse",
    "usage-unknown",
    "usage-denied",
  ]) {
    await page.goto(
      `http://127.0.0.1:18542/iframe.html?id=app-examples-torque--${slug}&viewMode=story`,
    )
    await expect(page.locator(".torque-example")).toBeVisible()
  }
  expect(api).toEqual([])
  await page.setViewportSize({ width: 390, height: 750 })
  await page.goto(
    entry.replace("theme=p4-white&mode=light", "theme=p1-green-phosphor&mode=dark") +
      "&tab=Mission%20Control",
  )
  await expect(page.locator("html")).toHaveAttribute("data-theme", "p1-green-phosphor")
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  const darkStack = page
    .locator(".torque-token g")
    .filter({ has: page.locator("rect[data-part=input]") })
    .last()
  const paints = await darkStack
    .locator("rect")
    .evaluateAll((es) => es.map((e) => getComputedStyle(e).fill))
  expect(paints[0]).not.toBe(paints[1])
  const darkDonut = await page
    .locator('[aria-label="Run distribution"] circle[stroke-dasharray]')
    .evaluateAll((es) => es.map((e) => getComputedStyle(e).stroke))
  expect(darkDonut[0]).not.toBe(darkDonut[2])
  await page
    .locator(".torque-volume")
    .evaluate((e) => e.scrollIntoView({ block: "center", behavior: "instant" }))
  await page.screenshot({ path: info.outputPath("mission-narrow-dark.png") })
  await page
    .locator(".torque-token")
    .evaluate((e) => e.scrollIntoView({ block: "center", behavior: "instant" }))
  await page.screenshot({ path: info.outputPath("mission-throughput-narrow.png") })
  await page
    .locator(".torque-chart-totals")
    .evaluate((e) => e.scrollIntoView({ block: "center", behavior: "instant" }))
  await page.screenshot({ path: info.outputPath("mission-totals-narrow.png") })
  await page
    .locator('[aria-label="Run distribution"]')
    .evaluate((e) => e.scrollIntoView({ block: "center", behavior: "instant" }))
  await page.screenshot({ path: info.outputPath("mission-distribution-narrow.png") })
  await page.getByText("Task pipeline", { exact: true }).scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath("mission-pipeline-narrow.png") })
  await page.goto(
    entry.replace("theme=p4-white&mode=light", "theme=p1-green-phosphor&mode=dark") + "&tab=Usage",
  )
  await page.locator(".torque-cost").scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath("usage-cost-narrow-dark.png") })
  await page.locator(".torque-chart-totals").scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath("usage-totals-narrow-dark.png") })
  await page.goto(entry + "&tab=Mission%20Control&scenario=loading")
  await page.screenshot({ path: info.outputPath("mission-loading-narrow.png") })
  await page.goto(entry + "&tab=Usage&scenario=degraded")
  await page.locator(".torque-cost").scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath("usage-degraded-narrow.png") })
  await page.setViewportSize({ width: 1280, height: 500 })
  await page.locator(".torque-page-footer").scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath("mission-footer-short.png") })
})
