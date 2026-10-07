import { expect, test } from "@playwright/test"
import { evidenceModel, evidenceStates, inspectedPayload } from "../src/evidence/model"
import { operationsModel } from "../src/operations/model"

test("bounded evidence index preserves graph joins annotations and withheld resources", () => {
  for (const scenario of ["populated", "large", "empty", "permission-denied"])
    for (const state of evidenceStates) {
      const model = operationsModel(scenario),
        index = evidenceModel(model, state)
      expect(JSON.stringify(index)).toBe(JSON.stringify(evidenceModel(model, state)))
      expect(index.source).toContain(model.dataset.profile)
      for (const row of index.rows) {
        expect(model.tasks.some((t) => t.id === row.taskId && t.runId === row.runId)).toBe(true)
        expect(row.time <= index.clock).toBe(true)
        const raw = inspectedPayload(row, index.malformed)
        expect(raw.raw.length).toBeLessThan(20000)
        if (state !== "malformed") expect(JSON.parse(raw.raw)).toEqual(raw.value)
      }
      if (
        !model.accessible ||
        ["empty", "loading", "denied", "error"].includes(state) ||
        scenario === "empty"
      )
        expect(index.rows).toEqual([])
    }
  const nested = evidenceModel(operationsModel("populated"), "nested", "TOOL-003", "tool")
  expect(nested.rows.map((r) => r.id)).toEqual(["TOOL-003"])
  expect(JSON.stringify(nested.rows[0].value)).toContain("TRACE-003")
  expect(evidenceModel(operationsModel("populated"), "recorded", "no-such-evidence").rows).toEqual(
    [],
  )
})
test("actual payload summary syntax metadata and modal keyboard contracts", async ({
  page,
}, info) => {
  const writes: string[] = [],
    external: string[] = [],
    downloads: string[] = [],
    errors: string[] = []
  page.on("request", (r) => {
    if (r.method() !== "GET") writes.push(r.url())
    if (!r.url().startsWith("http://127.0.0.1:")) external.push(r.url())
  })
  page.on("download", (d) => downloads.push(d.suggestedFilename()))
  page.on("pageerror", (e) => errors.push(e.message))
  await page.goto("/?view=Evidence&theme=p4-white&mode=light")
  const search = page.getByRole("searchbox", { name: "Search evidence" })
  await page.getByRole("heading", { name: "Evidence", exact: true }).click()
  await page.keyboard.press("/")
  await expect(search).toBeFocused()
  await search.fill("TOOL-003")
  await expect(
    page.getByRole("button", { name: "Inspect tool TOOL-003", exact: true }),
  ).toBeVisible()
  await search.press("/")
  await expect(search).toHaveValue("TOOL-003/")
  await search.press("Escape")
  await expect(search).toHaveValue("")
  await expect(search).not.toBeFocused()
  await expect(
    page.getByRole("button", { name: "Inspect task TASK-001", exact: true }),
  ).toBeVisible()
  await page.getByLabel("Evidence kind").selectOption("tool")
  await page.getByRole("button", { name: "Inspect tool TOOL-003", exact: true }).click()
  const metadata = page.locator(".evidence-metadata")
  await expect(metadata.locator("dt")).toHaveCount(6)
  await expect(metadata.locator("dd")).toHaveCount(6)
  await expect(metadata).toContainText("TASK-003")
  await expect(metadata).toContainText("RUN-003")
  await expect(metadata).toContainText("2026-10-04T14:14:15Z")
  const summary = page.locator(".evidence-selected-summary")
  await expect(summary).toContainText("id:")
  await expect(summary).toContainText("spanId:")
  await expect(summary).not.toContainText("name:")
  const viewer = page.locator(".evidence-json").first()
  await expect(viewer).toContainText('"name": "fixture.inspect"')
  const colors = await viewer
    .locator("span")
    .evaluateAll((nodes) =>
      Object.fromEntries(nodes.map((n) => [n.className, getComputedStyle(n).color])),
    )
  expect(colors["text-syntax-key"]).toBeTruthy()
  expect(colors["text-syntax-string"]).toBeTruthy()
  expect(new Set(Object.values(colors)).size).toBeGreaterThan(1)
  await page.getByRole("button", { name: "Open structured payload", exact: true }).focus()
  await page.keyboard.press("Enter")
  const modal = page.getByRole("dialog", { name: "Evidence payload TOOL-003", exact: true })
  await expect(modal).toBeVisible()
  await modal.getByRole("button", { name: "Close payload", exact: true }).focus()
  await page.keyboard.press("/")
  await expect.poll(() => modal.evaluate((n) => n.contains(document.activeElement))).toBe(true)
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press("Tab")
    await expect.poll(() => modal.evaluate((n) => n.contains(document.activeElement))).toBe(true)
  }
  await expect(page.getByRole("button", { name: /copy|download/i })).toHaveCount(0)
  await page.screenshot({ path: info.outputPath("payload-desktop.png"), animations: "disabled" })
  await page.keyboard.press("Escape")
  await expect(modal).not.toBeVisible()
  await expect(
    page.getByRole("button", { name: "Open structured payload", exact: true }),
  ).toBeFocused()
  await page.getByTestId("page-scroll").evaluate((n) => (n.scrollTop = 0))
  await page.screenshot({ path: info.outputPath("evidence-desktop.png"), animations: "disabled" })
  await page.getByLabel("Evidence kind").selectOption("run")
  await page.getByRole("button", { name: "Inspect run RUN-001", exact: true }).click()
  await expect(page.locator(".evidence-json .text-syntax-null").first()).toHaveText("null")
  await page.getByLabel("Evidence state").selectOption("unknown")
  await page.getByLabel("Evidence kind").selectOption("task")
  await page.getByRole("button", { name: "Inspect task TASK-003", exact: true }).click()
  await expect(page.locator(".evidence-json .text-syntax-boolean")).toHaveText("false")
  expect(await page.locator(".evidence-json .text-syntax-number").count()).toBeGreaterThan(0)
  await expect(page.locator(".evidence-selected-summary")).toContainText("recognized: false")
  expect(writes).toEqual([])
  expect(external).toEqual([])
  expect(downloads).toEqual([])
  expect(errors).toEqual([])
})
test("debounced source selection reset and malformed payload do not retain old content", async ({
  page,
}) => {
  await page.goto("/?view=Evidence")
  const search = page.getByRole("searchbox", { name: "Search evidence" })
  await page.clock.install()
  await search.fill("retired-search")
  await page.getByRole("button", { name: "Inspect task TASK-001", exact: true }).click()
  await page.clock.runFor(500)
  await expect(search).toHaveValue("")
  await expect(page.locator(".evidence-metadata")).toContainText("TASK-001")
  await search.fill("TASK-003")
  await page.getByLabel("Evidence state").selectOption("denied")
  await page.clock.runFor(500)
  await expect(search).toHaveCount(0)
  await expect(page.locator(".evidence-json")).toHaveCount(0)
  await expect(page.getByText("Record count unavailable", { exact: true })).toBeVisible()
  await page.getByLabel("Evidence state").selectOption("recorded")
  await expect(search).toHaveValue("")
  await search.fill("retired-source")
  await page.getByLabel("Scenario", { exact: true }).selectOption("large")
  await page.clock.runFor(500)
  await expect(search).toHaveValue("")
  await expect(page.getByText(/unfiltered full snapshot/)).toContainText("records-80")
  await page.getByLabel("Evidence kind").selectOption("tool")
  await page.getByRole("button", { name: "Inspect tool TOOL-001", exact: true }).click()
  await page.getByLabel("Evidence state").selectOption("malformed")
  await page.getByLabel("Evidence kind").selectOption("tool")
  await page.getByRole("button", { name: "Inspect tool TOOL-001", exact: true }).click()
  await expect(page.locator(".evidence-selected-summary")).toContainText(
    '{"authoredDiagnostic":true,"record":',
  )
  await expect(
    page.getByText("Malformed authored raw diagnostic; displayed as text, not parsed evidence", {
      exact: true,
    }),
  ).toBeVisible()
  await page.getByText("Exact raw payload text", { exact: true }).click()
  await expect(page.locator(".evidence-raw")).toHaveText('{"authoredDiagnostic":true,"record":')
  await page.getByRole("button", { name: "Open structured payload", exact: true }).click()
  const modal = page.getByRole("dialog", { name: "Evidence payload TOOL-001", exact: true })
  await modal.getByRole("button", { name: "Reset evidence context" }).click()
  await expect(modal).not.toBeVisible()
  await expect(page.getByLabel("Evidence state")).toBeFocused()
  await expect(page.locator(".evidence-json")).toHaveCount(0)
  await page.getByRole("button", { name: "Activity", exact: true }).click()
  await page.getByRole("button", { name: "Evidence", exact: true }).click()
  await expect(search).toHaveValue("")
  await expect(page.locator(".evidence-json")).toHaveCount(0)
})
test("long nested dark narrow payload and standalone story share the same artifact", async ({
  page,
}, info) => {
  await page.goto("/?view=Evidence&theme=p1-green-phosphor&mode=dark")
  await page.getByLabel("Evidence state").selectOption("long")
  await page.getByLabel("Evidence kind").selectOption("tool")
  await page.getByRole("button", { name: "Inspect tool TOOL-003", exact: true }).click()
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByLabel("Theme")).toHaveValue("p1-green-phosphor")
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true)
  await page
    .getByRole("button", { name: "Open structured payload", exact: true })
    .scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath("evidence-narrow.png"), animations: "disabled" })
  await page.getByRole("button", { name: "Open structured payload", exact: true }).click()
  const modal = page.getByRole("dialog", { name: "Evidence payload TOOL-003", exact: true })
  await expect(modal).toBeVisible()
  await expect(modal.locator(".evidence-json")).toContainText("presentationAnnotation")
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true)
  await modal.getByRole("button", { name: "Close payload", exact: true }).focus()
  await page.screenshot({ path: info.outputPath("payload-narrow.png"), animations: "disabled" })
  const body = modal.locator(".overflow-y-auto")
  expect(await body.evaluate((n) => n.scrollHeight > n.clientHeight)).toBe(true)
  await body.evaluate((n) => (n.scrollTop = n.scrollHeight))
  await expect(
    modal.getByRole("button", { name: "Reset evidence context", exact: true }),
  ).toBeInViewport()
  await expect(modal.getByRole("button", { name: "Close payload", exact: true })).toBeInViewport()
  await page.keyboard.press("Escape")
  const api: string[] = []
  page.on("request", (r) => {
    if (/\/(api|plugins)\//.test(r.url())) api.push(r.url())
  })
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=evidence-controlled-inspector--nested&viewMode=story",
  )
  await page.getByLabel("Evidence kind").selectOption("tool")
  await page.getByRole("button", { name: "Inspect tool TOOL-003", exact: true }).click()
  await expect(page.locator(".evidence-json")).toContainText("SPAN-TOOL-003")
  await page.getByRole("button", { name: "Open structured payload", exact: true }).click()
  await expect(modal).toBeVisible()
  await modal.getByRole("button", { name: "Reset evidence context" }).click()
  await expect(page.locator(".evidence-json")).toHaveCount(0)
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=evidence-controlled-inspector--empty&viewMode=story",
  )
  await expect(page.getByText("0 of 0 indexed records", { exact: true })).toBeVisible()
  await expect(page.locator(".evidence-json")).toHaveCount(0)
  expect(api).toEqual([])
})

test("same-scenario reviewed source replacement retires payload and pending search", async ({
  page,
}) => {
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=evidence-controlled-inspector--same-scenario-replacement&viewMode=story",
  )
  const search = page.getByRole("searchbox", { name: "Search evidence" })
  await page.clock.install()
  await page.getByRole("button", { name: "Inspect task TASK-001", exact: true }).click()
  await expect(page.locator(".evidence-json")).toContainText("TASK-001")
  await search.fill("retired-identical-scenario-search")
  await page.getByRole("button", { name: "Replace reviewed source copy", exact: true }).click()
  await page.clock.runFor(500)
  await expect(search).toHaveValue("")
  await expect(page.locator(".evidence-json")).toHaveCount(0)
  await expect(page.getByText(/unfiltered full snapshot/)).toContainText(
    "operations/v2/reviewed-copy",
  )
  await page.getByRole("button", { name: "Inspect task TASK-001", exact: true }).click()
  await expect(page.locator(".evidence-json")).toContainText("TASK-001")
})
