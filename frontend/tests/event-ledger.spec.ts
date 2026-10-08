import { expect, type Page, test } from "@playwright/test"
import { ledgerModel } from "../src/event-ledger/model"
import { operationsModel } from "../src/operations/model"
import { sourceDataset, timelineFrames } from "../src/playback/model"

async function inspectGeometry(page: Page) {
  const dialog = page.getByRole("dialog")
  const bounds = await dialog.evaluate((e) => {
    const body = e.querySelector(".ledger-dialog-body")!.parentElement!.getBoundingClientRect()
    const footer = e.querySelector(".ledger-footer")!.parentElement!.getBoundingClientRect()
    const shell = e.getBoundingClientRect()
    return {
      separated: body.bottom <= footer.top + 1,
      buttons: [...e.querySelectorAll(".ledger-footer button")].map((b) => {
        const r = b.getBoundingClientRect()
        return (
          r.width > 0 &&
          r.height > 0 &&
          r.left >= shell.left &&
          r.right <= shell.right + 1 &&
          r.top >= footer.top &&
          r.bottom <= footer.bottom + 1
        )
      }),
    }
  })
  expect(bounds.separated).toBe(true)
  expect(bounds.buttons).toEqual([true])
  await dialog.locator(".ledger-metadata").evaluate((e) => {
    e.parentElement!.parentElement!.scrollTop = 0
  })
  await expect(dialog.getByText("Source", { exact: true })).toBeInViewport()
  await expect(dialog.getByText("RUN-001", { exact: true })).toBeInViewport()
  await dialog.getByRole("button", { name: "Close ledger inspection", exact: true }).focus()
  for (const name of ["Inspect related admitted run RUN-001", "Inspect local metadata"]) {
    await page.keyboard.press("Shift+Tab")
    const button = dialog.getByRole("button", { name, exact: true })
    await expect(button).toBeFocused()
    await expect
      .poll(() =>
        button.evaluate((e) => {
          const r = e.getBoundingClientRect(),
            d = e.closest('[role="dialog"]')!
          const body = d
            .querySelector(".ledger-dialog-body")!
            .parentElement!.getBoundingClientRect()
          const footer = d.querySelector(".ledger-footer")!.parentElement!.getBoundingClientRect()
          return { top: r.top >= body.top - 1, bottom: r.bottom <= footer.top + 1 }
        }),
      )
      .toEqual({ top: true, bottom: true })
  }
  await dialog.getByRole("button", { name: "Close ledger inspection", exact: true }).focus()
  await dialog.locator(".ledger-metadata").evaluate((e) => {
    e.parentElement!.parentElement!.scrollTop = 0
  })
}

test("ledger admission uses actual current run IDs and policy not retained dataset arrays", () => {
  const full = ledgerModel(operationsModel("populated"))
  expect(full.count).toBe(32)
  expect(ledgerModel(operationsModel("large")).count).toBe(320)
  for (const scenario of ["loading", "error", "permission-denied", "unavailable"]) {
    const ops = operationsModel(scenario)
    expect(ops.dataset.events.length).toBeGreaterThan(0)
    expect(ledgerModel(ops).count).toBeNull()
    expect(ledgerModel(ops).rows).toEqual([])
  }
  expect(ledgerModel(operationsModel("empty")).count).toBe(0)
  expect(ledgerModel(operationsModel("populated", "no supplied task")).rows).toEqual([])
  for (const cutoff of timelineFrames(sourceDataset("populated"))) {
    const ops = operationsModel("populated", "", { cutoff }),
      d = ledgerModel(ops)
    for (const row of d.rows) {
      expect(row.time! <= cutoff).toBe(true)
      expect(ops.runs.some((r) => r.id === row.runId)).toBe(true)
    }
  }
  const missing = ledgerModel(operationsModel("populated"), "missing").rows.find(
    (r) => r.origin === "authored",
  )!
  expect(missing.raw).toEqual({ count: 0, message: null })
  const mixed = ledgerModel(operationsModel("populated"), "missing")
  expect(mixed.count).toBe(32)
  expect(mixed.authoredCount).toBe(1)
  expect(mixed.rows).toHaveLength(33)
  expect(missing.reference).toBeNull()
  expect(Object.hasOwn(missing.raw as object, "annotation")).toBe(false)
})
test("native semantic table caption columns footer UTC filter and sort use exact admitted rows", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto("/?view=Event+Ledger&mode=light")
  const table = page.getByRole("table")
  await expect(table.getByRole("columnheader")).toHaveCount(5)
  await expect(table.locator("tbody tr")).toHaveCount(32)
  await expect(table.locator("tfoot")).toContainText("32 matching rows / 32 supplied rows")
  await expect(table.locator("caption")).toContainText("2026-10-04T14:30:00Z")
  await page.getByLabel("Filter ledger", { exact: true }).pressSequentially("LOG-")
  await expect(table.locator("tbody tr")).toHaveCount(16)
  await expect(page.getByLabel("Filter ledger", { exact: true })).toBeFocused()
  await page.getByLabel("UTC order", { exact: true }).selectOption("descending")
  const times = await table.locator("tbody time").allTextContents()
  expect(times).toEqual([...times].sort().reverse())
  await page.getByRole("button", { name: "Reset ledger review", exact: true }).click()
  await expect(table.locator("tbody tr")).toHaveCount(32)
  await page.locator(".ledger-scroll").evaluate((e) => {
    const p = document.querySelector(".page-scroll")!
    p.scrollTop += e.getBoundingClientRect().top - p.getBoundingClientRect().top - 12
  })
  await page.screenshot({ path: info.outputPath("ledger-desktop.png"), animations: "disabled" })
  await page.getByRole("button", { name: "Inspect EVENT-START-001", exact: true }).click()
  await expect(page.getByRole("dialog")).toContainText("Fixture run admitted")
  await inspectGeometry(page)
  await page.screenshot({
    path: info.outputPath("ledger-metadata-desktop.png"),
    animations: "disabled",
  })
  await page.getByRole("button", { name: "Inspect local metadata", exact: true }).click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /Release oldest ledger inspection/ })
    .click()
  await expect(page.getByRole("dialog")).toContainText("Inspected supplied metadata locally")
  await page.screenshot({
    path: info.outputPath("ledger-inspection-desktop.png"),
    animations: "disabled",
  })
  await page
    .getByRole("button", { name: "Inspect related admitted run RUN-001", exact: true })
    .click()
  await expect(page.getByRole("dialog")).toContainText("TASK-001")
})
test("actual bounded viewport native keyboard reaches footer and implicit vertical thumb without page scroll", async ({
  page,
}, info) => {
  await page.goto("/?view=Event+Ledger&scenario=large")
  const viewport = page.locator('.ledger-scroll [data-slot="scroll-area-viewport"]')
  await page.getByRole("button", { name: "Reset ledger review", exact: true }).focus()
  await page.keyboard.press("Tab")
  await expect(viewport).toBeFocused()
  const before = await page.locator(".page-scroll").evaluate((e) => e.scrollTop)
  await page.keyboard.press("PageDown")
  await expect.poll(() => viewport.evaluate((e) => e.scrollTop)).toBeGreaterThan(100)
  await page.keyboard.press("Control+End")
  await expect
    .poll(() => viewport.evaluate((e) => e.scrollTop + e.clientHeight >= e.scrollHeight - 2))
    .toBe(true)
  expect(await page.locator(".page-scroll").evaluate((e) => e.scrollTop)).toBe(before)
  await expect(page.getByRole("table").locator("tfoot")).toContainText(
    "320 matching rows / 320 supplied rows",
  )
  await expect(page.locator('.ledger-scroll [data-slot="scroll-area-scrollbar"]')).toHaveCount(1)
  const thumb = page.locator('.ledger-scroll [data-slot="scroll-area-thumb"]'),
    box = await thumb.boundingBox()
  expect(box!.width).toBeGreaterThan(0)
  expect(box!.height).toBeGreaterThan(0)
  await page.locator(".ledger-scroll").evaluate((e) => {
    const p = document.querySelector(".page-scroll")!
    p.scrollTop += e.getBoundingClientRect().top - p.getBoundingClientRect().top - 12
  })
  await expect(page.getByRole("table").locator("caption")).toBeInViewport()
  await page.screenshot({
    path: info.outputPath("ledger-footer-desktop.png"),
    animations: "disabled",
  })
})
test("StrictMode fresh held inspection and retained native callback retire on close selection filter source and cutoff", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:18545/?view=Event+Ledger")
  await page.getByRole("button", { name: "Inspect EVENT-START-001", exact: true }).click()
  await page.getByRole("button", { name: "Inspect local metadata", exact: true }).click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /Release oldest ledger inspection/ })
    .click()
  await expect(page.getByRole("dialog")).toContainText("Inspected supplied metadata locally")
  await page.getByRole("button", { name: "Close ledger inspection", exact: true }).evaluate((e) => {
    const key = Object.keys(e).find((k) => k.startsWith("__reactProps$"))!
    ;(window as unknown as { oldClose: () => void }).oldClose = (
      e as unknown as Record<string, { onClick: () => void }>
    )[key].onClick
  })
  await page.getByRole("button", { name: "Close ledger inspection", exact: true }).click()
  await expect(
    page.getByRole("button", { name: "Inspect EVENT-START-001", exact: true }),
  ).toBeFocused()
  await page.getByRole("button", { name: "Inspect LOG-START-001", exact: true }).click()
  await page.evaluate(() => {
    ;(window as unknown as { oldClose: () => void }).oldClose()
  })
  await expect(page.getByRole("dialog")).toContainText("LOG-START-001")
  await page.getByRole("button", { name: "Inspect local metadata", exact: true }).click()
  await page.getByRole("button", { name: "Close ledger inspection", exact: true }).click()
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page
    .getByLabel("Event Ledger review", { exact: true })
    .getByRole("button", { name: /Release oldest ledger inspection/ })
    .click()
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.getByRole("button", { name: "Inspect EVENT-START-001", exact: true }).evaluate((e) => {
    const key = Object.keys(e).find((k) => k.startsWith("__reactProps$"))!
    const callback = (
      e as unknown as Record<string, { onClick: (event: { currentTarget: HTMLElement }) => void }>
    )[key].onClick
    ;(window as unknown as { oldInspect: () => void }).oldInspect = () =>
      callback({ currentTarget: e as HTMLElement })
  })
  await page.getByLabel("Filter ledger", { exact: true }).fill("LOG-")
  await page.evaluate(() => {
    ;(window as unknown as { oldInspect: () => void }).oldInspect()
  })
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.getByRole("button", { name: "Reset ledger review", exact: true }).click()
  await page.getByLabel("UTC order", { exact: true }).selectOption("descending")
  await page.evaluate(() => {
    ;(window as unknown as { oldInspect: () => void }).oldInspect()
  })
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.getByRole("button", { name: "Reset ledger review", exact: true }).click()
  await page.getByRole("button", { name: "Inspect EVENT-START-001", exact: true }).click()
  await page.getByRole("button", { name: "Inspect local metadata", exact: true }).click()
  await page.getByLabel("Scenario", { exact: true }).selectOption("empty")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(page.getByRole("table").locator("tbody tr")).toHaveCount(0)
  await page.getByLabel("Scenario", { exact: true }).selectOption("populated")
  await page.getByText("Fixture timeline review", { exact: true }).click()
  await page
    .getByLabel("Playback position")
    .fill(String(timelineFrames(sourceDataset("populated")).indexOf("2026-10-04T14:10:00Z")))
  await expect(page.getByRole("table").locator("tbody tr")).toHaveCount(2)
  await expect(page.getByRole("table").locator("tbody")).not.toContainText("EVENT-TASK-001")
})
test("narrow dark wrapped complete table footer raw modal and withdrawn hint stay readable and bounded", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/?view=Event+Ledger&theme=p1-green-phosphor&mode=dark")
  await expect(page.locator("html")).toHaveAttribute("data-theme", "p1-green-phosphor")
  await page.locator(".ledger-scroll").evaluate((e) => {
    const p = document.querySelector(".page-scroll")!
    p.scrollTop += e.getBoundingClientRect().top - p.getBoundingClientRect().top - 12
  })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(
    await page.locator(".ledger-scroll").evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
  ).toBe(true)
  await page.screenshot({
    path: info.outputPath("ledger-table-narrow.png"),
    animations: "disabled",
  })
  await page.getByRole("button", { name: "Inspect EVENT-START-001", exact: true }).click()
  await inspectGeometry(page)
  await page.screenshot({
    path: info.outputPath("ledger-metadata-narrow.png"),
    animations: "disabled",
  })
  await page.getByRole("dialog").locator(".ledger-json").scrollIntoViewIfNeeded()
  await page.screenshot({
    path: info.outputPath("ledger-inspection-narrow.png"),
    animations: "disabled",
  })
  await expect(page.getByRole("dialog").locator(".ledger-json")).toContainText("EVENT-START-001")
  expect(
    await page
      .getByRole("dialog")
      .locator(".ledger-json")
      .evaluate((e) => e.scrollWidth <= e.clientWidth),
  ).toBe(true)
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Inspect local metadata", exact: true })
    .click()
  await page.keyboard.press("Tab")
  const release = page
    .getByRole("dialog")
    .getByRole("button", { name: /Release oldest ledger inspection/ })
  await expect(release).toBeFocused()
  await release.click()
  await expect(page.getByRole("dialog")).toContainText("Inspected supplied metadata locally")
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Close ledger inspection", exact: true })
    .focus()
  await page.keyboard.press("Shift+Tab")
  await expect(
    page.getByRole("button", { name: "Inspect related admitted run RUN-001", exact: true }),
  ).toBeFocused()
  await page.screenshot({
    path: info.outputPath("ledger-actions-narrow.png"),
    animations: "disabled",
  })
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  const viewport = page.locator('.ledger-scroll [data-slot="scroll-area-viewport"]')
  await page.getByRole("button", { name: "Reset ledger review", exact: true }).focus()
  await page.keyboard.press("Tab")
  await expect(viewport).toBeFocused()
  await page.keyboard.press("Control+End")
  await expect
    .poll(() => viewport.evaluate((e) => e.scrollTop + e.clientHeight >= e.scrollHeight - 2))
    .toBe(true)
  await expect(page.getByRole("table").locator("tfoot")).toBeInViewport()
  await page.locator(".ledger-scroll").evaluate((e) => {
    const p = document.querySelector(".page-scroll")!
    p.scrollTop += e.getBoundingClientRect().top - p.getBoundingClientRect().top - 12
  })
  await expect(page.getByRole("table").locator("caption")).toBeInViewport()
  await page.screenshot({
    path: info.outputPath("ledger-footer-narrow.png"),
    animations: "disabled",
  })
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=workbench-keyboard-switcher--withdrawn&viewMode=story",
  )
  await page.getByRole("combobox", { name: "Find review view", exact: true }).fill("withdrawn")
  const hint = page.locator(".switcher-unavailable-hint")
  expect(await hint.evaluate((e) => getComputedStyle(e).whiteSpace)).toBe("nowrap")
  expect(await hint.evaluate((e) => e.scrollWidth <= e.clientWidth)).toBe(true)
  await page.screenshot({
    path: info.outputPath("withdrawn-hint-narrow.png"),
    animations: "disabled",
  })
})
test("portable missing zero null absent unknown and escaped long specimens remain metadata without APIs", async ({
  page,
}) => {
  const effects: string[] = []
  page.on("request", (r) => {
    if (r.method() !== "GET" || /\/api\/|\/plugins\//.test(r.url())) effects.push(r.url())
  })
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=evidence-event-ledger--missing&viewMode=story",
  )
  await page.getByRole("button", { name: "Inspect AUTHORED-MISSING", exact: true }).click()
  await expect(page.getByRole("dialog")).toContainText("count is supplied 0")
  await expect(page.getByLabel("Event Ledger review", { exact: true })).toContainText(
    "32 admitted recorded rows + 1 authored specimen",
  )
  await expect(page.getByRole("dialog")).toContainText("annotation key is absent")
  await expect(
    page.getByRole("dialog").getByRole("button", { name: /Inspect related/ }),
  ).toHaveCount(0)
  await page.keyboard.press("Escape")
  await page.getByLabel("Ledger specimen", { exact: true }).selectOption("unknown")
  await expect(page.getByRole("table")).toContainText("external-observation")
  await page.getByLabel("Ledger specimen", { exact: true }).selectOption("long")
  await page.getByRole("button", { name: "Inspect AUTHORED-LONG", exact: true }).click()
  await expect(page.locator(".event-ledger script")).toHaveCount(0)
  await expect(page.getByRole("dialog")).toContainText("<script>inert</script>")
  await expect(page.getByRole("dialog").locator("a")).toHaveCount(0)
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=evidence-event-ledger--recorded&viewMode=story",
  )
  await page.getByLabel("Authored operations matching filter", { exact: true }).fill("gateway")
  await expect(page.getByRole("table").locator("tbody tr")).toHaveCount(4)
  await page.getByRole("button", { name: "Inspect EVENT-START-001", exact: true }).click()
  await page.getByRole("button", { name: "Inspect local metadata", exact: true }).click()
  await page
    .getByLabel("Authored operations matching filter", { exact: true })
    .fill("gateway permission")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(page.getByRole("table").locator("tbody tr")).toHaveCount(4)
  await page.getByRole("button", { name: /Release oldest ledger inspection/ }).click()
  await expect(page.getByLabel("Event Ledger review", { exact: true })).not.toContainText(
    "Inspected supplied metadata locally",
  )
  expect(effects).toEqual([])
})
