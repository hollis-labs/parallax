import { expect, test } from "@playwright/test"
import { operationsModel } from "../src/operations/model"
import { explorerProjection } from "../src/run-explorer/model"

const rows = '[data-testid="data-table-row"]'
test("explorer receipts join admitted runs and filters never convert withheld evidence into zero", () => {
  const snapshot = operationsModel("populated"),
    before = operationsModel("populated", "", { cutoff: "2026-10-04T14:10:00Z" })
  const p = explorerProjection(snapshot)
  expect(p.admitted).toHaveLength(8)
  for (const r of p.admitted) {
    const receipt = snapshot.usage.find((u) => u.id === r.run.usageId && u.runId === r.run.id)
    expect(r.tokens).toBe(receipt?.tokens ?? null)
    expect(snapshot.dataset.sessions.some((s) => s.id === r.run.sessionId)).toBe(true)
    expect(snapshot.dataset.traces.some((t) => t.id === r.run.traceId)).toBe(true)
  }
  expect(explorerProjection(before, "", [], null, "missing").matches.map((r) => r.tokens)).toEqual([
    null,
  ])
  expect(explorerProjection(before, "", [], null, "zero").matches).toHaveLength(0)
  expect(explorerProjection(snapshot, "", [], "unlisted").matches).toHaveLength(0)
  expect(
    explorerProjection(snapshot, "gateway", ["done"]).matches.every(
      (r) => r.run.status === "done" && r.task.title.toLowerCase().includes("gateway"),
    ),
  ).toBe(true)
})
test("native search caret, facets, sorting and checkbox reset describe current revealed records", async ({
  page,
}, info) => {
  await page.goto("/?view=Run%20Explorer")
  const search = page.getByLabel("Search admitted runs")
  await search.pressSequentially("gateway", { delay: 300 })
  await expect(search).toBeFocused()
  await expect(search).toHaveValue("gateway")
  expect(await search.evaluate((e) => (e as HTMLInputElement).selectionStart)).toBe(7)
  await expect(page.locator(rows)).toHaveCount(1)
  await search.fill("")
  await expect(page.locator(rows)).toHaveCount(8)
  const done = page.getByRole("button", { name: "done", exact: true })
  await done.focus()
  await page.keyboard.press("Enter")
  await expect(done).toBeFocused()
  await expect(done).toHaveAttribute("aria-pressed", "true")
  await expect(page.locator(rows)).toHaveCount(4)
  await page.getByRole("checkbox", { name: "Select all rows", exact: true }).check()
  await expect(page.locator(".explorer-footer")).toContainText("4 locally checked")
  await page.getByRole("button", { name: /Started UTC/ }).click()
  await expect(page.getByRole("columnheader", { name: /Started UTC/ })).toHaveAttribute(
    "aria-sort",
    "ascending",
  )
  await done.press("Enter")
  await expect(page.locator(rows)).toHaveCount(8)
  await expect(
    page.getByRole("checkbox", { name: "Select all rows", exact: true }),
  ).not.toBeChecked()
  await expect(page.getByRole("columnheader", { name: /Started UTC/ })).toHaveAttribute(
    "aria-sort",
    "descending",
  )
  const cycle = page.getByRole("button", { name: /^Usage evidence, current:/ })
  await cycle.focus()
  await cycle.press("Enter")
  await expect(cycle).toBeFocused()
  await expect(cycle).toContainText("Receipt observed")
  await cycle.press("Enter")
  await expect(page.getByText("No matching admitted runs")).toBeVisible()
  await cycle.press("Enter")
  await expect(cycle).toContainText("Recorded zero")
  await expect(page.locator(".explorer-footer")).toContainText("Recorded zero receipts: 0")
  await page.getByRole("button", { name: "Reset explorer", exact: true }).click()
  await page.getByRole("button", { name: "Filter run owner", exact: true }).click()
  await page.getByRole("dialog").getByRole("combobox").fill("Adaline")
  await expect(page.getByRole("option", { name: "Adaline 1", exact: true })).toBeVisible()
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("Enter")
  await expect(page.getByRole("button", { name: "Filter run owner", exact: true })).toBeFocused()
  await expect(page.getByRole("button", { name: "Filter run owner", exact: true })).toContainText(
    "Adaline",
  )
  await expect(page.locator(rows)).toHaveCount(1)
  await page.getByRole("button", { name: "Reset explorer", exact: true }).click()
  await page.screenshot({ path: info.outputPath("explorer-desktop.png"), animations: "disabled" })
})
test("bounded eighty records reveal through real table scroll root and header checkbox means revealed only", async ({
  page,
}) => {
  await page.goto("/?view=Run%20Explorer&scenario=large")
  await expect(page.locator(rows)).toHaveCount(24)
  await page.getByRole("checkbox", { name: "Select all rows", exact: true }).check()
  const checked = await page.locator(`${rows} input:checked`).count()
  expect(checked).toBeGreaterThanOrEqual(12)
  expect(checked).toBeLessThan(80)
  const body = page.locator(".run-explorer-page .shrink.overflow-auto")
  await expect(body).toHaveCount(1)
  expect(await body.evaluate((e) => getComputedStyle(e).overflowY)).toBe("auto")
  for (let i = 0; i < 12 && (await page.locator(rows).count()) < 80; i++) {
    await body.evaluate((e) => {
      e.scrollTop = e.scrollHeight
    })
    await page.waitForTimeout(150)
  }
  await expect(page.locator(rows)).toHaveCount(80)
  await expect(page.locator(".explorer-footer")).toContainText(
    `80 admitted · 80 matched · 80 revealed · ${checked} locally checked`,
  )
  await expect(
    page.getByRole("checkbox", { name: "Select all rows", exact: true }),
  ).not.toBeChecked()
  await expect(page.locator(rows).filter({ hasText: "RUN-080" })).toHaveCount(1)
  const oldest = explorerProjection(operationsModel("large"))
    .admitted.toSorted((a, b) => b.run.started.localeCompare(a.run.started))
    .at(-1)
  await expect(page.locator(rows).last()).toContainText(oldest?.run.id ?? "missing")
  const actual = await page
    .locator(rows)
    .evaluateAll((nodes) => nodes.map((n) => n.querySelectorAll("td")[1]?.textContent))
  expect(actual).toEqual(
    explorerProjection(operationsModel("large"))
      .admitted.toSorted((a, b) => b.run.started.localeCompare(a.run.started))
      .map((r) => r.run.id),
  )
  await page.getByLabel("Row density").selectOption("comfortable")
  await expect(page.locator("table")).toHaveAttribute("data-density", "comfortable")
  await expect(page.locator(rows)).toHaveCount(80)
  expect(await page.evaluate(() => document.documentElement.scrollHeight === innerHeight)).toBe(
    true,
  )
  await expect(page.getByTestId("page-scroll")).toHaveCount(0)
})
test("run inspection keyboard shortcut and cutoff/resource retirement withhold old records", async ({
  page,
}) => {
  await page.goto("/?view=Run%20Explorer")
  const row = page.getByRole("button", { name: /Inspect RUN-001 / })
  await row.focus()
  await row.press("Enter")
  const dialog = page.getByRole("dialog")
  await expect(dialog).toContainText("TASK-001")
  await expect(dialog).toContainText("RUN-001")
  await page.getByRole("button", { name: "Close run inspection", exact: true }).evaluate((node) => {
    const key = Object.keys(node).find((k) => k.startsWith("__reactProps$"))
    if (!key) throw Error("Missing current callback")
    ;(window as unknown as { retiredExplorerClose: () => void }).retiredExplorerClose = (
      node as unknown as Record<string, { onClick: () => void }>
    )[key].onClick
  })
  await page.getByRole("button", { name: "Close run inspection", exact: true }).focus()
  await page.keyboard.press("/")
  expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true)
  await page.keyboard.press("Escape")
  await expect(row).toBeFocused()
  await page.keyboard.press("/")
  await expect(page.getByLabel("Search admitted runs")).toBeFocused()
  await page.getByRole("button", { name: /Inspect RUN-002 / }).click()
  await page.evaluate(() =>
    (window as unknown as { retiredExplorerClose: () => void }).retiredExplorerClose(),
  )
  await expect(dialog).toContainText("RUN-002")
  await page.getByRole("button", { name: "Close run inspection", exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await page.getByText("Fixture timeline review", { exact: true }).click()
  await page.getByLabel("Playback position").fill("1")
  await expect(page.locator(".explorer-footer")).toContainText("1 admitted")
  await expect(page.locator(rows).first()).toContainText("No receipt")
  await page.getByRole("button", { name: /Inspect RUN-001 / }).click()
  await expect(dialog).toContainText("Usage not observed through this cutoff")
  await page.getByRole("button", { name: "Close run inspection", exact: true }).click()
  await page.getByLabel("Scenario", { exact: true }).selectOption("permission-denied")
  await expect(page.getByText("Access denied by fixture policy")).toBeVisible()
  await expect(page.locator(rows)).toHaveCount(0)
  await expect(page.locator(".explorer-footer")).toContainText("counts withheld")
})
test("narrow themed native facets and run dialog remain reachable without outer scroll", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(
    "/?view=Run%20Explorer&scenario=long-labels&theme=p1-green-phosphor&navigation=drawer",
  )
  await expect(page.locator("html")).toHaveAttribute("data-theme", "p1-green-phosphor")
  await expect(page.getByRole("button", { name: /^Usage evidence, current:/ })).toBeVisible()
  const body = page.locator(".run-explorer-page .shrink.overflow-auto")
  expect((await body.boundingBox())!.height).toBeGreaterThan(150)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  const seam = page.locator(".run-explorer-page table").locator("..")
  expect(await seam.evaluate((e) => e.scrollWidth > e.clientWidth)).toBe(true)
  expect(
    await page.locator(".explorer-title").evaluateAll((nodes) =>
      nodes.every((n) => {
        const a = n.getBoundingClientRect(),
          b = n.closest("td")?.getBoundingClientRect()
        return !!b && a.width > 0 && a.left >= b.left && a.right <= b.right
      }),
    ),
  ).toBe(true)
  await seam.evaluate((e) => {
    e.scrollLeft = e.scrollWidth
  })
  expect(
    await page.getByRole("columnheader", { name: /Recorded tokens/ }).evaluate((e) => {
      const a = e.getBoundingClientRect(),
        b = e.closest("table")?.parentElement?.getBoundingClientRect()
      return !!b && a.right <= b.right + 1 && a.left >= b.left
    }),
  ).toBe(true)
  await seam.evaluate((e) => {
    e.scrollLeft = 0
  })
  await page.screenshot({ path: info.outputPath("explorer-narrow.png"), animations: "disabled" })
  await page.getByRole("button", { name: /Inspect RUN-001 / }).click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Close run inspection", exact: true }),
  ).toBeVisible()
  await page.screenshot({
    path: info.outputPath("explorer-detail-narrow.png"),
    animations: "disabled",
  })
})
test("portable direct FilterBar and actual table share fixture filters without app APIs", async ({
  page,
}) => {
  const requests: string[] = []
  page.on("request", (r) => {
    if (/\/(api|plugins)\//.test(r.url())) requests.push(r.url())
  })
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=operations-run-explorer--direct-filter-bar&viewMode=story",
  )
  await page.getByLabel("Search admitted runs").pressSequentially("gateway", { delay: 300 })
  await expect(page.locator(".explorer-direct-results button")).toHaveCount(1)
  await expect(page.locator(".explorer-footer")).toContainText("1 matched · 1 revealed")
  await page.getByRole("button", { name: "Clear all filters and search", exact: true }).focus()
  await page.keyboard.press("Enter")
  await expect(page.getByLabel("Search admitted runs")).toBeFocused()
  await expect(page.getByLabel("Search admitted runs")).toHaveValue("")
  await expect(page.locator(".explorer-direct-results button")).toHaveCount(8)
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=operations-run-explorer--recorded&viewMode=story",
  )
  await expect(page.locator(rows)).toHaveCount(8)
  await page.getByRole("button", { name: "unknown", exact: true }).click()
  await expect(page.getByText("No matching admitted runs")).toBeVisible()
  await page.getByRole("button", { name: "Reset explorer", exact: true }).click()
  await expect(page.locator(rows)).toHaveCount(8)
  for (const state of ["empty", "loading", "resource-error"]) {
    await page.goto(
      `http://127.0.0.1:18542/iframe.html?id=operations-run-explorer--${state}&viewMode=story`,
    )
    await expect(page.locator(rows)).toHaveCount(0)
    await expect(page.locator(".explorer-footer")).toContainText(
      state === "empty" ? "0 admitted · 0 matched" : "counts withheld",
    )
    if (state === "loading") await expect(page.locator('[data-slot="skeleton"]')).toHaveCount(6)
  }
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=operations-run-explorer--owner-unavailable&viewMode=story",
  )
  await page.getByRole("button", { name: "Filter run owner", exact: true }).click()
  await page.getByRole("option", { name: "Owner unavailable 8", exact: true }).click()
  await expect(page.getByRole("button", { name: "Filter run owner", exact: true })).toContainText(
    "Owner unavailable",
  )
  await expect(page.locator(rows)).toHaveCount(8)
  expect(requests).toEqual([])
})
