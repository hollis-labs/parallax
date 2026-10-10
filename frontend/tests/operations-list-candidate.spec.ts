import { fileURLToPath } from "node:url"
import type { OperationsActionScope } from "@hollis-labs/kit-dashboard/layout"
import { expect, test } from "@playwright/test"
import type { OperationsProofDiagnostics } from "../src/operations-list-proof/Proof"

declare global {
  interface Window {
    operationsProof: OperationsProofDiagnostics
    retiredScope?: OperationsActionScope
  }
}
// The standalone HTML entry is served by Vite; the default suite's base URL is Go.
test.use({
  baseURL: `http://127.0.0.1:${process.env.OPS_PORT ?? 18545}`,
  launchOptions: { executablePath: process.env.OPS_CHROMIUM, args: ["--no-sandbox"] },
})
const screenshotRoot = fileURLToPath(
  new URL("../../.scratch/operations-list/screens/", import.meta.url),
)
const path = (consumer = "torque", scenario = "populated") =>
  `/operations-list.html?consumer=${consumer}&scenario=${scenario}`
for (const consumer of ["torque", "runs"]) {
  test(`${consumer}: native projection/count/selection/search and retained source action fence`, async ({
    page,
  }) => {
    const errors: string[] = [],
      requests: string[] = []
    page.on("pageerror", (e) => errors.push(e.message))
    page.on("request", (r) => {
      if (/\/api\/|\/events|\/sse/.test(r.url())) requests.push(r.url())
    })
    await page.goto(path(consumer))
    const row = page.locator("[data-ops-row-id]").first(),
      search = page.getByRole("searchbox")
    await expect(row).toBeVisible()
    await row.focus()
    await page.keyboard.press("/")
    await expect(search).toBeFocused()
    await search.fill("no-such-record")
    await expect(page.locator('[data-ops-count="matched"]')).toHaveText("0 matched")
    await page.keyboard.press("Escape")
    await expect(search).toHaveValue("")
    await expect(search).toBeFocused()
    const editor = page.getByRole("textbox", { name: "Independent editable pane" })
    await editor.fill("/")
    await expect(editor).toBeFocused()
    const revealed = Number(
      (await page.locator('[data-ops-count="revealed"]').innerText()).split(" ")[0],
    )
    await page.getByRole("checkbox", { name: "Select all revealed rows" }).check()
    await expect(page.locator('[data-ops-count="selected"]')).toHaveText(`${revealed} selected`)
    await search.fill("no-such-record")
    await expect(page.locator('[data-ops-count="selected"]')).toHaveText("0 selected")
    await search.fill("")
    await row.focus()
    await page.keyboard.press("Enter")
    const inspector =
      consumer === "torque"
        ? page.getByRole("dialog").first()
        : page.getByRole("region", { name: "Record inspector" })
    await expect(inspector).toBeVisible()
    await inspector.getByRole("button", { name: "Inspect current evidence" }).click()
    expect(await page.evaluate(() => window.operationsProof.calls.length)).toBe(1)
    await page.evaluate(() => {
      window.retiredScope = window.operationsProof.scopes.at(-1)
    })
    expect(
      await page.evaluate(() =>
        window.retiredScope?.run(() => window.operationsProof.calls.push("positive")),
      ),
    ).toBe(true)
    await page.evaluate(() => window.operationsProof.refresh?.())
    await expect(inspector).not.toBeVisible()
    expect(
      await page.evaluate(() =>
        window.retiredScope?.run(() => window.operationsProof.calls.push("STALE")),
      ),
    ).toBe(false)
    await row.focus()
    await page.keyboard.press("Space")
    await expect(inspector).toBeVisible()
    expect(
      await page.evaluate(() =>
        window.operationsProof.scopes
          .at(-1)
          ?.run(() => window.operationsProof.calls.push("current")),
      ),
    ).toBe(true)
    expect(await page.evaluate(() => window.operationsProof.calls.includes("STALE"))).toBe(false)
    const local = inspector.getByRole("textbox", { name: "Local evidence note" })
    await local.fill("editor/")
    await page.keyboard.press("ArrowRight")
    await expect(local).toBeFocused()
    await inspector.getByRole("button", { name: "Open nested evidence" }).click()
    const nested = page.getByRole("dialog", { name: "Nested evidence" })
    await expect(nested).toBeVisible()
    expect(
      await page.evaluate(() =>
        window.operationsProof.scopes
          .at(-1)
          ?.run(() => window.operationsProof.calls.push("BACKGROUND")),
      ),
    ).toBe(false)
    await nested.getByRole("textbox").fill("nested/")
    await page.keyboard.press("Escape")
    await expect(nested).not.toBeVisible()
    await expect(inspector).toBeVisible()
    if (consumer === "torque") {
      await page.keyboard.press("Escape")
    } else {
      await inspector.getByRole("button", { name: "Back to list" }).click()
    }
    await expect(inspector).not.toBeVisible()
    await expect(row).toBeFocused()
    expect(errors).toEqual([])
    expect(requests).toEqual([])
  })
}
test("synthetic IME/modifier controls, reveal and sort membership", async ({ page }) => {
  await page.goto(path("torque", "large"))
  const composingSearch = page.getByRole("searchbox", { name: "Search Torque tasks" })
  await composingSearch.evaluate((node) => {
    node.focus()
    node.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true, data: "" }))
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(node, "字")
    node.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        data: "字",
        inputType: "insertCompositionText",
        isComposing: true,
      }),
    )
  })
  await expect(composingSearch).toHaveValue("字")
  await composingSearch.dispatchEvent("keydown", { key: "Escape", isComposing: true, keyCode: 229 })
  await expect(composingSearch).toHaveValue("字")
  await composingSearch.evaluate((node) =>
    node.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true, data: "字" })),
  )
  await page.keyboard.press("Escape")
  await expect(composingSearch).toHaveValue("")
  const row = page.locator("[data-ops-row-id]").first()
  await row.focus()
  await row.dispatchEvent("keydown", { key: "Enter", keyCode: 229 })
  await row.dispatchEvent("keydown", { key: " ", isComposing: true })
  await page.keyboard.press("Control+Enter")
  await expect(page.getByRole("dialog")).not.toBeVisible()
  const before = await page.locator('[data-ops-count="revealed"]').innerText()
  const more = page.getByRole("button", { name: "Show more" })
  await more.scrollIntoViewIfNeeded()
  await more.click()
  await expect(page.locator('[data-ops-count="revealed"]')).not.toHaveText(before)
  await page.getByRole("checkbox", { name: "Select all revealed rows" }).check()
  const selected = await page.locator('[data-ops-count="selected"]').innerText()
  await page
    .getByRole("columnheader")
    .filter({ has: page.getByRole("button", { name: /^Task / }) })
    .getByRole("button")
    .click()
  await expect(page.locator('[data-ops-count="selected"]')).toHaveText(selected)
  await page.getByLabel("Density", { exact: true }).selectOption("comfortable")
  await expect(page.locator('[data-ops-count="selected"]')).toHaveText(selected)
})
for (const scenario of ["loading", "error", "empty", "permission-denied", "sparse"]) {
  test(`resource ${scenario}`, async ({ page }) => {
    await page.goto(path("torque", scenario))
    const counts = page.locator("[data-ops-count-state]")
    await expect(counts).toHaveAttribute(
      "data-ops-count-state",
      ["empty", "sparse"].includes(scenario) ? "known" : "withheld",
    )
    if (scenario === "empty")
      await expect(page.locator('[data-ops-count="admitted"]')).toHaveText("0 admitted")
  })
}
test("Torque facet option counts exclude their own facet; entity and cycle own native keys", async ({
  page,
}) => {
  await page.goto(path())
  const facet = page.locator('[data-ops-facet="status"]')
  const first = facet.getByRole("button").first()
  const original = await first.textContent()
  await first.click()
  await expect(first).toHaveAttribute("aria-pressed", "true")
  await expect(first).toHaveText(original)
  await page.getByRole("button", { name: "Execution mode, current: All modes" }).click()
  await expect(page.getByRole("button", { name: "Execution mode, current: Manual" })).toBeVisible()
  await page.getByRole("button", { name: "Task project", exact: true }).click()
  const popup = page.locator('[data-slot="popover-content"]')
  await expect(popup).toBeVisible()
  await popup.getByRole("combobox").fill("Gateway")
  await page.keyboard.press("Escape")
  await expect(popup).not.toBeVisible()
  await expect(page.getByRole("searchbox", { name: "Search Torque tasks" })).toHaveValue("")
})
for (const consumer of ["torque", "runs"]) {
  test(`${consumer}: current composition controls respect competing layers`, async ({ page }) => {
    await page.goto(path(consumer))
    const search = page.locator('[data-ops-pane="list"] input[type="search"]')
    const row = page.locator("[data-ops-row-id]").first()
    await row.focus()
    await page.keyboard.press("Enter")
    const inspector =
      consumer === "torque"
        ? page.locator('[role="dialog"]').filter({ has: page.locator('[data-ops-action="next"]') })
        : page.locator('[data-ops-pane="inspector"]')
    await expect(inspector).toBeVisible()
    const currentSearch = () =>
      page.evaluate(() => {
        const node = document.querySelector(
          '[data-ops-pane="list"] input[type="search"]',
        ) as HTMLInputElement
        const key = Object.keys(node).find((key) => key.startsWith("__reactProps"))!
        ;(node as unknown as Record<string, { onChange(event: unknown): void }>)[key].onChange({
          target: { value: "BLOCKED" },
        })
      })
    if (consumer === "torque") {
      await currentSearch()
      await expect(search).toHaveValue("")
    }
    const title = await inspector.locator("h2").first().textContent()
    await inspector.getByRole("button", { name: "Open nested evidence" }).click()
    const nested = page.getByRole("dialog", { name: "Nested evidence" })
    await expect(nested).toBeVisible()
    await currentSearch()
    await inspector.locator('[data-ops-action="next"]').dispatchEvent("click")
    if (consumer === "runs")
      await inspector.locator('[data-ops-action="back"]').dispatchEvent("click")
    await expect(search).toHaveValue("")
    await expect(inspector.locator("h2").first()).toHaveText(title ?? "")
    await expect(inspector).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(nested).not.toBeVisible()
    await inspector.getByRole("button", { name: "Next", exact: true }).click()
    await expect(inspector.locator("h2").first()).not.toHaveText(title ?? "")
    if (consumer === "runs") {
      await search.fill("run")
      await expect(search).toHaveValue("run")
    }
  })
}
test("owned entity popup selection changes its facet", async ({ page }) => {
  await page.goto(path())
  await page.getByRole("button", { name: "Task project", exact: true }).click()
  const popup = page.locator('[data-slot="popover-content"]')
  const option = popup.getByRole("option").filter({ hasNotText: "All projects" }).first()
  const label = await option.innerText()
  await option.click()
  await expect(popup).not.toBeVisible()
  await expect(page.getByRole("button", { name: "Task project", exact: true })).not.toHaveText(
    /All projects/,
  )
  expect(label.length).toBeGreaterThan(0)
})
const themes = [
  "nanite-default",
  "dir-a",
  "dir-b",
  "dir-d",
  "dir-e",
  "dir-f",
  "sysop-p4-white",
  "sysop-green-phosphor",
  "sysop-amber-phosphor",
  "sysop-hi-contrast",
]
for (const size of [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 390, height: 844 },
  { width: 390, height: 420 },
]) {
  test(`theme/mode and geometry ${size.width}x${size.height}`, async ({ page }) => {
    test.setTimeout(180000)
    await page.setViewportSize(size)
    const errors: string[] = []
    page.on("pageerror", (e) => errors.push(e.message))
    for (const consumer of ["torque", "runs"])
      for (const theme of themes)
        for (const mode of ["light", "dark"]) {
          await page.goto(`${path(consumer)}&theme=${theme}&mode=${mode}`)
          await expect(page.locator("html")).toHaveAttribute("data-theme", theme)
          await expect(page.locator("html")).toHaveAttribute("data-mode", mode)
          await page.screenshot({
            path: `${screenshotRoot}${consumer}-${theme}-${size.width}x${size.height}-${mode}-list.png`,
          })
          await page.locator("[data-ops-row-id]").first().focus()
          await page.keyboard.press("Enter")
          const inspector =
            consumer === "torque"
              ? page.getByRole("dialog").first()
              : page.getByRole("region", { name: "Record inspector" })
          await expect(inspector).toBeVisible()
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
          ).toBe(true)
          await page.screenshot({
            path: `${screenshotRoot}${consumer}-${theme}-${size.width}x${size.height}-${mode}-inspector.png`,
          })
          const body =
            consumer === "torque"
              ? inspector.locator('[data-slot="inspection-body"]')
              : inspector.locator('[data-ops-scroll="detail"]')
          const box = await body.boundingBox()
          expect(box?.height).toBeGreaterThan(0)
        }
    expect(errors).toEqual([])
  })
}
