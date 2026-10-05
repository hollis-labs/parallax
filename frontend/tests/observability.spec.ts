import { expect, test } from "@playwright/test"

test("recorded log trace span tool and usage inspection joins the actual graph", async ({
  page,
}, info) => {
  const writes: string[] = []
  page.on("request", (r) => {
    if (!["GET", "HEAD"].includes(r.method())) writes.push(r.url())
  })
  await page.goto("/?view=Observability&mode=light")
  await page.getByRole("button", { name: "Logs", exact: true }).click()
  await page.getByLabel("Log level", { exact: true }).selectOption("error")
  await page.getByLabel("Log search", { exact: true }).fill("RUN-003")
  await expect(page.getByRole("button", { name: /LOG-OUTCOME-003/ })).toBeVisible()
  await page.screenshot({ animations: "disabled", path: info.outputPath("logs-desktop.png") })
  await page.getByRole("button", { name: /LOG-OUTCOME-003/ }).click()
  await expect(page.getByText("TRACE-003 · RUN-003 · SESSION-003", { exact: true })).toBeVisible()
  await expect(page.getByRole("heading", { name: "SPAN-TOOL-003", exact: true })).toBeVisible()
  await expect(page.getByText("TOOL-003 · fixture.inspect", { exact: true })).toBeVisible()
  await expect(page.getByText(/USAGE-003 · .*input/)).toBeVisible()
  await page.screenshot({ animations: "disabled", path: info.outputPath("trace-desktop.png") })
  await page
    .getByRole("heading", { name: "Related tool calls", exact: true })
    .scrollIntoViewIfNeeded()
  await page.screenshot({
    animations: "disabled",
    path: info.outputPath("trace-span-tool-desktop.png"),
  })
  await page
    .getByRole("button", { name: "Inspect related run (full snapshot)", exact: true })
    .click()
  await expect(page.getByRole("dialog")).toContainText("RUN-003")
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: "Usage records", exact: true }).click()
  await expect(page.getByText(/Provider\/model attribution is unavailable/)).toBeVisible()
  await page.getByRole("button", { name: /USAGE-002 · RUN-002/ }).click()
  await expect(page.getByText("TRACE-002 · RUN-002 · SESSION-002", { exact: true })).toBeVisible()
  await expect(
    page.getByText("LOG-START-002 · Bundled context admitted", { exact: true }),
  ).toBeVisible()
  await page.getByLabel("Inspection state").selectOption("denied")
  await expect(page.getByText(/TOOL-002/)).toHaveCount(0)
  await expect(page.getByLabel("Trace run")).toHaveCount(0)
  expect(writes).toEqual([])
})
test("shared exact series distinguishes zero gap missing stale and independent refresh", async ({
  page,
}, info) => {
  await page.goto("/?view=Observability&mode=light")
  const series = page.getByRole("region", { name: "Exact cumulative token samples", exact: true }),
    health = page.getByRole("region", { name: "Fixture review outcomes", exact: true }),
    duration = page.getByRole("region", { name: "Recorded run durations", exact: true })
  await expect(
    series.getByText("Exact cumulative token samples — count, cumulative counter", { exact: true }),
  ).toBeVisible()
  await expect(
    duration.getByText("Recorded run durations — seconds, gauge", { exact: true }),
  ).toBeVisible()
  await expect(series.getByRole("cell", { name: "0", exact: true })).toHaveCount(1)
  const before = await series.locator("time").first().getAttribute("datetime")
  await page.getByRole("button", { name: "Preview held refresh failure" }).click()
  await expect(series.getByText("Refreshing", { exact: true })).toBeVisible()
  await expect(health.getByText("Refreshing", { exact: true })).toHaveCount(0)
  await expect(duration.getByText("Refreshing", { exact: true })).toHaveCount(0)
  await page.getByRole("button", { name: "Release refresh outcome", exact: true }).click()
  await expect(series.getByText("Refresh failed", { exact: true })).toBeVisible()
  expect(await series.locator("time").first().getAttribute("datetime")).toBe(before)
  await page.getByLabel("Inspection state").selectOption("sparse")
  await expect(series.getByRole("cell", { name: "No sample", exact: true })).toHaveCount(1)
  await expect(series.getByRole("cell", { name: "0", exact: true })).toHaveCount(1)
  await page.getByLabel("Inspection state").selectOption("stale")
  await expect(series.getByText("Stale", { exact: true })).toBeVisible()
  expect(await series.locator("time").first().getAttribute("datetime")).toBe(before)
  await page.getByLabel("Inspection state").selectOption("missing")
  await expect(series.getByText("Observation unavailable", { exact: true })).toBeVisible()
  await expect(series.getByRole("table")).toHaveCount(0)
  await page.getByLabel("Inspection state").selectOption("empty")
  await expect(series.getByText("No samples in requested range", { exact: true })).toBeVisible()
  await page.getByLabel("Inspection state").selectOption("truncated")
  await expect(series.getByText("Incomplete series", { exact: true })).toBeVisible()
  await page.getByLabel("Inspection state").selectOption("invalid-diagnostic")
  await expect(
    page.getByText(/Diagnostic keys, bounds or failed-run relationships are invalid/),
  ).toBeVisible()
  await page.getByLabel("Inspection state").selectOption("normal")
  await page.getByTestId("page-scroll").evaluate((e) => {
    e.scrollTop = 0
  })
  await page.screenshot({
    animations: "disabled",
    path: info.outputPath("observation-evidence-desktop.png"),
  })
  await series.scrollIntoViewIfNeeded()
  await page.screenshot({
    animations: "disabled",
    path: info.outputPath("observation-series-desktop.png"),
  })
})
test("manual timeline hides future terminal outcomes and retires held refresh", async ({
  page,
}) => {
  const { inspectionModel, traceDetail, timelineTimes, validateDiagnostic } = await import(
    "../src/observability/model"
  )
  expect(inspectionModel("missing").health).toBe("unknown")
  expect(inspectionModel("missing").tokens).toBeNull()
  expect(inspectionModel("missing").series).toEqual([])
  const before = inspectionModel("normal", "", "all", "2026-10-04T14:14:15Z"),
    detail = traceDetail(before, "RUN-003", "SPAN-TOOL-003")
  expect(detail?.run.status).toBe("running")
  expect(detail?.selected?.status).toBe("running")
  expect(detail?.tools[0].status).toBe("running")
  expect(detail?.tools[0].output).toBeNull()
  expect(detail?.usage).toBeUndefined()
  expect(before.health).toBe("unknown")
  const after = traceDetail(
    inspectionModel("normal", "", "all", "2026-10-04T14:15:30Z"),
    "RUN-003",
    "SPAN-TOOL-003",
  )
  expect(after?.run.status).toBe("failed")
  expect(after?.selected?.status).toBe("failed")
  expect(after?.tools[0].status).toBe("failed")
  expect(after?.usage?.id).toBe("USAGE-003")
  expect(
    validateDiagnostic({
      fixture: true,
      operationsVersion: "operations/v2",
      failedRunIds: ["RUN-003"],
      secret: "extra",
    }).state,
  ).toBe("invalid")
  expect(
    validateDiagnostic({
      fixture: true,
      operationsVersion: "operations/v2",
      failedRunIds: Array(9).fill("RUN-003"),
    }).state,
  ).toBe("invalid")
  expect(() => inspectionModel("normal", "", "all", "2027-01-01T00:00:00Z")).toThrow()
  await page.goto("/?view=Observability")
  await page.getByRole("button", { name: "Preview held refresh failure" }).click()
  await page.getByRole("button", { name: "Start recorded timeline" }).click()
  await page.getByRole("button", { name: "Release retired refresh outcome" }).click()
  await expect(
    page.getByText("Scripted series refresh failed; retained evidence unchanged", { exact: true }),
  ).toHaveCount(0)
  await page.getByRole("button", { name: "Logs", exact: true }).click()
  await expect(page.getByRole("button", { name: /LOG-START-/ })).toHaveCount(1)
  await page.getByRole("button", { name: "Advance recorded timeline" }).click()
  await page.getByRole("button", { name: "Show all recorded events" }).click()
  await expect(page.getByRole("button", { name: /LOG-(START|OUTCOME)-/ })).toHaveCount(16)
  await page.getByLabel("Log search", { exact: true }).fill("nothing matches")
  await expect(page.getByText("No matching recorded logs", { exact: true })).toBeVisible()
  expect(timelineTimes[0]).toBe("2026-10-04T14:10:00Z")
})
test("portable observation stories and narrow theme preserve shared chart CSS and single scroll", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/?view=Observability&theme=p3-amber-phosphor&mode=dark")
  await page
    .getByRole("region", { name: "Exact cumulative token samples", exact: true })
    .scrollIntoViewIfNeeded()
  await page.screenshot({
    animations: "disabled",
    path: info.outputPath("observation-series-narrow.png"),
  })
  expect(
    await page
      .getByLabel("Timeline position", { exact: true })
      .evaluate((e) => getComputedStyle(e).accentColor),
  ).not.toBe("auto")
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  const owners = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("main *")]
      .filter(
        (e) =>
          e.scrollHeight > e.clientHeight + 1 &&
          ["auto", "scroll"].includes(getComputedStyle(e).overflowY),
      )
      .map((e) => e.dataset.testid ?? e.className),
  )
  expect(owners).toEqual(["page-scroll"])
  const requests: string[] = []
  page.on("request", (r) => {
    if (/\/(api|plugins)\//.test(r.url())) requests.push(r.url())
  })
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=observability-controlled-inspection--sparse&viewMode=story",
  )
  await expect(
    page
      .getByRole("region", { name: "Exact cumulative token samples", exact: true })
      .getByRole("cell", { name: "No sample", exact: true }),
  ).toHaveCount(1)
  expect(requests).toEqual([])
})
