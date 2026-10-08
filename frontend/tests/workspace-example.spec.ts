import { expect, test } from "@playwright/test"

const entry = "/?example=workspace&theme=p4-white&mode=light"
test("workspace native file search caret diagnostic path tool graph and route history share declared context", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1440, height: 950 })
  await page.goto(entry)
  const search = page.getByRole("textbox", { name: "Search project files", exact: true })
  await search.pressSequentially("outcome")
  await expect(search).toHaveValue("outcome")
  await expect(search).toBeFocused()
  expect(await search.evaluate((n: HTMLInputElement) => n.selectionStart)).toBe(7)
  await page.getByRole("button", { name: "outcome.json", exact: true }).click()
  await expect(page).toHaveURL(/file=FILE-002/)
  await expect(page.getByRole("region", { name: "Proposal source", exact: true })).toContainText(
    '"outcome": "refused"',
  )
  await page.screenshot({ path: info.outputPath("workspace-source-desktop.png") })
  await page.getByRole("link", { name: "Diagnostics", exact: true }).click()
  await expect(page.locator(".developer-evidence")).toContainText("not executed CI")
  await expect(page.getByRole("button", { name: "Stack trace", exact: true })).toContainText(
    "FixtureRefusal",
  )
  await page.screenshot({ path: info.outputPath("workspace-diagnostics-desktop.png") })
  await page.getByRole("button", { name: "src/review.ts:1:1", exact: true }).click()
  await expect(page).toHaveURL(/panel=source.*file=FILE-001/)
  await page.getByRole("button", { name: "Open linked tool evidence", exact: true }).click()
  const tool = page.getByRole("region", { name: "Declared tool evidence", exact: true })
  for (const value of ["RUN-003", "TOOL-003", "SPAN-TOOL-003", "USAGE-003", "3812"])
    await expect(tool).toContainText(value)
  await page.screenshot({ path: info.outputPath("workspace-tool-desktop.png") })
  await page.getByRole("button", { name: "Review declared inspection graph", exact: true }).click()
  await page
    .getByRole("button", { name: "Inspect NODE-002: Inspect recorded tool", exact: true })
    .click()
  await expect(
    page.getByRole("region", { name: "Workflow evidence inspector", exact: true }),
  ).toContainText("SPAN-TOOL-003")
  await page.screenshot({ path: info.outputPath("workspace-graph-desktop.png") })
  await page.getByRole("button", { name: "Open declared tool from graph", exact: true }).click()
  await page.reload()
  await expect(tool).toContainText("RUN-003")
  await page.goBack()
  await expect(page.getByRole("link", { name: "Inspection graph", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  )
  await page.goto(entry + "&file=FILE-UNKNOWN&line=99")
  await expect(page.locator(".workspace-current")).toHaveText("No admitted file selected")
})
test("StrictMode first metadata inspection held close query panel source and retained file callbacks refuse old frames", async ({
  page,
}, info) => {
  await page.goto("http://127.0.0.1:18545" + entry + "&panel=tool")
  const inspect = page.getByRole("button", { name: "Inspect linked metadata", exact: true })
  await inspect.evaluate((n) => {
    const k = Object.keys(n).find((k) => k.startsWith("__reactProps$"))!
    ;(window as any).oldInspect = (n as any)[k].onClick
  })
  await inspect.click()
  const modal = page.getByRole("dialog", { name: "Linked developer metadata", exact: true })
  await expect.poll(() => modal.evaluate((n) => getComputedStyle(n).opacity)).toBe("1")
  const release = modal.getByRole("button", { name: /Release oldest metadata outcome/ })
  await release.evaluate((n) => {
    const k = Object.keys(n).find((k) => k.startsWith("__reactProps$"))!
    ;(window as any).oldRelease = (n as any)[k].onClick
  })
  await release.click()
  await expect(modal).toContainText("Metadata inspected locally")
  await page.screenshot({ path: info.outputPath("workspace-metadata-desktop.png") })
  await page.keyboard.press("Escape")
  await expect(inspect).toBeFocused()
  await page.getByRole("link", { name: "Source", exact: true }).click()
  await page.getByRole("link", { name: "Tool evidence", exact: true }).click()
  await page.evaluate(() => {
    ;(window as any).oldInspect()
    ;(window as any).oldRelease()
  })
  await expect(modal).toHaveCount(0)
  await inspect.click()
  await page.keyboard.press("Escape")
  const search = page.getByRole("textbox", { name: "Search project files", exact: true })
  await search.fill("README")
  await page.evaluate(() => (window as any).oldRelease())
  await expect(modal).toHaveCount(0)
  await page.getByRole("button", { name: "README.md", exact: true }).click()
  await page.getByRole("link", { name: "Diagnostics", exact: true }).click()
  const file = page.getByRole("button", { name: "Inspect case file FILE-002", exact: true })
  await file.evaluate((n) => {
    const k = Object.keys(n).find((k) => k.startsWith("__reactProps$"))!
    ;(window as any).oldFile = (n as any)[k].onClick
  })
  await file.click()
  await page.getByRole("link", { name: "Diagnostics", exact: true }).click()
  await page.evaluate(() => (window as any).oldFile())
  await expect(page.getByRole("link", { name: "Diagnostics", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  )
  await page.getByRole("button", { name: "Inspect case file FILE-001", exact: true }).click()
  await expect(page).toHaveURL(/file=FILE-001/)
  await page.getByRole("link", { name: "Tool evidence", exact: true }).click()
  await inspect.click()
  await release.click()
  await expect(modal).toContainText("Held local metadata inspection")
  await release.click()
  await expect(modal).toContainText("Metadata inspected locally")
  await page.keyboard.press("Escape")
  await page.goto(entry + "&panel=graph&query=absent")
  await expect(page.locator(".workspace-current")).toHaveText("No admitted file selected")
  await page.getByRole("button", { name: "Open declared tool from graph", exact: true }).click()
  await expect(page).toHaveURL(/panel=tool.*file=FILE-001/)
  await expect(
    page.getByRole("textbox", { name: "Search project files", exact: true }),
  ).toHaveValue("")
  await expect(
    page.getByRole("region", { name: "Declared tool evidence", exact: true }),
  ).toContainText("TOOL-003")
})
test("native mobile files query sheet caret selection focus graph and short-height workspace body stay usable", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 650 })
  await page.goto(entry.replace("p4-white", "p1-green-phosphor").replace("light", "dark"))
  const files = page.getByRole("button", { name: "Files", exact: true })
  await files.click()
  const nav = page.getByRole("dialog", { name: "Project files", exact: true })
  await expect.poll(() => nav.evaluate((n) => getComputedStyle(n).opacity)).toBe("1")
  const search = nav.getByRole("textbox", { name: "Search project files", exact: true })
  await search.pressSequentially("README")
  await expect(nav).toBeVisible()
  await expect(search).toBeFocused()
  await expect(search).toHaveValue("README")
  expect(await search.evaluate((n: HTMLInputElement) => n.selectionStart)).toBe(6)
  await page.screenshot({ path: info.outputPath("workspace-files-narrow.png") })
  await nav.getByRole("button", { name: "README.md", exact: true }).click()
  await expect(nav).toHaveCount(0)
  await expect(
    page.getByRole("heading", { name: "Developer workspace", exact: true }),
  ).toBeFocused()
  await expect(page.locator(".workspace-current")).toContainText("FILE-003")
  await page.screenshot({ path: info.outputPath("workspace-source-narrow.png") })
  await files.click()
  await search.fill("does-not-match")
  await expect(nav).toContainText("0 matched / 3 supplied files")
  await search.fill("")
  await nav.getByRole("button", { name: "review.ts", exact: true }).click()
  await page.getByRole("link", { name: "Inspection graph", exact: true }).click()
  await expect(
    page.getByRole("region", { name: "Recorded workflow canvas", exact: true }),
  ).toBeVisible()
  await page.screenshot({ path: info.outputPath("workspace-graph-top-narrow.png") })
  await page.setViewportSize({ width: 390, height: 760 })
  const canvas = page.locator(".workspace-page .workflow-review-canvas")
  await canvas.scrollIntoViewIfNeeded()
  await canvas.locator('.react-flow__node[data-id="NODE-001"]').click()
  const toolbar = page.getByLabel("Selected node toolbar", { exact: true })
  await expect
    .poll(async () => {
      const t = await toolbar.boundingBox(),
        c = await canvas.boundingBox()
      return (
        !!t &&
        !!c &&
        t.width > 0 &&
        t.height > 0 &&
        t.x >= c.x &&
        t.x + t.width <= c.x + c.width &&
        t.y >= c.y &&
        t.y + t.height <= c.y + c.height &&
        c.y >= 144 &&
        c.y + c.height <= 700
      )
    })
    .toBe(true)
  await page.screenshot({ path: info.outputPath("workspace-canvas-selected-narrow.png") })
  await page.setViewportSize({ width: 390, height: 650 })
  await page
    .getByRole("button", { name: "Inspect EDGE-002: NODE-002 → NODE-003", exact: true })
    .click()
  await expect(
    page.getByRole("region", { name: "Workflow evidence inspector", exact: true }),
  ).toContainText("supplied relationship")
  await page.screenshot({ path: info.outputPath("workspace-graph-narrow.png") })
  await page
    .getByRole("button", { name: "Inspect NODE-002: Inspect recorded tool", exact: true })
    .click()
  const inspector = page.getByRole("region", { name: "Workflow evidence inspector", exact: true })
  await inspector.scrollIntoViewIfNeeded()
  await expect(inspector).toContainText("SPAN-TOOL-003")
  await page.screenshot({ path: info.outputPath("workspace-graph-inspector-narrow.png") })
  await page.setViewportSize({ width: 390, height: 500 })
  const body = page.getByRole("main", { name: "Workspace content", exact: true })
  await body.hover()
  await page.mouse.wheel(0, 4000)
  await expect
    .poll(() => body.evaluate((n) => n.scrollHeight - n.clientHeight - n.scrollTop))
    .toBeLessThan(2)
  await expect(
    page.getByRole("button", { name: "Open declared tool from graph", exact: true }),
  ).toBeVisible()
  const footer = (await page.locator(".workspace-footer").boundingBox())!
  expect(footer.y + footer.height).toBeLessThanOrEqual(500)
  expect((await body.boundingBox())!.height).toBeGreaterThan(200)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await page.screenshot({ path: info.outputPath("workspace-footer-short.png") })
})
test("authored long literal region native vertical and horizontal endpoints remain escaped and separate from supplied file", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 650 })
  await page.goto(entry + "&appearance=long")
  const region = page.getByRole("region", { name: "Authored long source sample", exact: true })
  await region.scrollIntoViewIfNeeded()
  await region.click({ position: { x: 4, y: 4 } })
  await expect(region).toBeFocused()
  await region.press("Control+End")
  await expect
    .poll(() => region.evaluate((n) => n.scrollHeight - n.clientHeight - n.scrollTop))
    .toBeLessThan(2)
  await page.screenshot({ path: info.outputPath("workspace-long-left-narrow.png") })
  await region.hover()
  await page.mouse.wheel(6000, 0)
  await expect
    .poll(() => region.evaluate((n) => n.scrollWidth - n.clientWidth - n.scrollLeft))
    .toBeLessThan(2)
  await expect(region).toContainText("END-OF-LITERAL")
  await expect
    .poll(() =>
      region.evaluate((n) => {
        const text = n.querySelector("pre")?.firstChild
        if (!text) return false
        const start = text.textContent?.indexOf("END-OF-LITERAL") ?? -1
        if (start < 0) return false
        const range = document.createRange()
        range.setStart(text, start)
        range.setEnd(text, start + 14)
        const r = range.getBoundingClientRect(),
          v = n.getBoundingClientRect()
        return (
          r.width > 0 &&
          r.left >= v.left &&
          r.right <= v.right &&
          r.bottom <= v.bottom &&
          r.top >= v.top &&
          v.left >= 0 &&
          v.right <= innerWidth
        )
      }),
    )
    .toBe(true)
  expect(await page.locator(".workspace-page").evaluate((n) => n.scrollLeft)).toBe(0)
  await expect(page.locator("script").filter({ hasText: "neverExecute()" })).toHaveCount(0)
  await expect(page.locator(".workspace-page a[href^='https:']")).toHaveCount(0)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await page.screenshot({ path: info.outputPath("workspace-long-end-narrow.png") })
})
test("390 short metadata body and single pinned close footer have complete native scroll keyboard focus and current source retirement", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 500 })
  await page.goto(entry + "&panel=tool")
  const inspect = page.getByRole("button", { name: "Inspect linked metadata", exact: true })
  await inspect.click()
  const modal = page.getByRole("dialog", { name: "Linked developer metadata", exact: true })
  await expect.poll(() => modal.evaluate((n) => getComputedStyle(n).opacity)).toBe("1")
  const body = modal.locator(".workspace-inspection").locator("..")
  await body.hover()
  await page.mouse.wheel(0, -3000)
  await expect.poll(() => body.evaluate((n) => n.scrollTop)).toBe(0)
  await page.screenshot({ path: info.outputPath("workspace-metadata-top-narrow.png") })
  await body.hover()
  await page.mouse.wheel(0, 5000)
  await expect
    .poll(() => body.evaluate((n) => n.scrollHeight - n.clientHeight - n.scrollTop))
    .toBeLessThan(2)
  const footer = modal.getByRole("button", { name: "Close metadata inspection", exact: true })
  for (let i = 0; i < 8 && !(await footer.evaluate((n) => n === document.activeElement)); i++)
    await page.keyboard.press("Tab")
  await expect(footer).toBeFocused()
  await body.hover()
  await page.mouse.wheel(0, 5000)
  await expect
    .poll(() => body.evaluate((n) => n.scrollHeight - n.clientHeight - n.scrollTop))
    .toBeLessThan(2)
  const f = (await footer.boundingBox())!,
    m = (await modal.boundingBox())!
  expect(f.y + f.height).toBeLessThanOrEqual(500)
  expect(f.x).toBeGreaterThanOrEqual(m.x)
  expect(f.x + f.width).toBeLessThanOrEqual(m.x + m.width)
  const lastValue = modal.getByText('"2026-10-04T14:30:00Z"', { exact: true })
  await expect
    .poll(async () => {
      const r = (await lastValue.boundingBox())!,
        v = (await body.boundingBox())!,
        f = (await footer.boundingBox())!
      return (
        r.width > 0 &&
        r.x >= v.x &&
        r.x + r.width <= v.x + v.width &&
        r.y >= v.y &&
        r.y + r.height <= f.y
      )
    })
    .toBe(true)
  await page.screenshot({ path: info.outputPath("workspace-metadata-tail-narrow.png") })
  await page.keyboard.press("Escape")
  await expect(inspect).toBeFocused()
  await page.getByRole("button", { name: "Review context", exact: true }).click()
  await page.getByLabel("Workspace appearance", { exact: true }).selectOption("denied")
  await expect(page.getByRole("main", { name: "Workspace content", exact: true })).toContainText(
    "count Unknown",
  )
  await expect(inspect).toHaveCount(0)
})
test("all twelve workspace full-app stories are API-free finite readonly snapshots with literal and resource distinctions", async ({
  page,
}) => {
  const calls: string[] = []
  page.on("request", (r) => {
    if (new URL(r.url()).pathname.startsWith("/api/")) calls.push(r.url())
  })
  await page.setViewportSize({ width: 390, height: 650 })
  for (const state of [
    "source",
    "diagnostics",
    "tool-evidence",
    "inspection-graph",
    "empty",
    "loading",
    "resource-error",
    "denied",
    "unknown",
    "locked",
    "long-source",
    "retained-degraded",
  ]) {
    await page.goto(
      `http://127.0.0.1:18542/iframe.html?id=app-examples-workspace--${state}&viewMode=story`,
    )
    await expect(
      page.getByRole("heading", { name: "Developer workspace", exact: true }),
    ).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    await expect(page.locator(".workspace-footer")).toContainText("2026-10-04T14:30:00Z")
    await expect(
      page.locator(
        ".workspace-example input:not([aria-label='Search project files']),.workspace-example textarea",
      ),
    ).toHaveCount(0)
    if (["loading", "resource-error", "denied", "unknown"].includes(state)) {
      await expect(page.locator(".workspace-page")).toContainText("count Unknown")
      await expect(page.getByRole("button", { name: "review.ts", exact: true })).toHaveCount(0)
    }
    if (state === "empty")
      await expect(page.locator(".workspace-page")).toContainText("0 supplied files")
    if (state === "locked")
      await expect(page.locator(".workspace-page")).toContainText("read-only navigation")
  }
  expect(calls).toEqual([])
})
