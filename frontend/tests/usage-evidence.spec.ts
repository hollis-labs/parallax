import { expect, type Locator, type Page, test } from "@playwright/test"
import { operationsModel } from "../src/operations/model"
import { sourceDataset, timelineFrames } from "../src/playback/model"
import {
  capacitySample,
  finiteAmount,
  usageEvidence,
  usageEvidenceModel,
} from "../src/usage-evidence/model"

async function capture(node: Locator, name: string) {
  await node.evaluate((node, name) => {
    const key = Object.keys(node).find((k) => k.startsWith("__reactProps$"))
    if (!key) throw Error("Missing callback")
    ;(window as unknown as Record<string, unknown>)[name] = (
      node as unknown as Record<string, { onClick: () => void }>
    )[key].onClick
  }, name)
}
async function invoke(page: Page, name: string) {
  await page.evaluate((name) => (window as unknown as Record<string, () => void>)[name](), name)
}
async function chooseRun(page: Page, id: string) {
  await page.getByRole("combobox", { name: "Recorded run", exact: true }).click()
  await page.getByRole("option", { name: new RegExp(`^${id} ·`) }).click()
}
async function align(node: Locator) {
  await node.evaluate((target) => {
    const root = document.querySelector('[data-testid="page-scroll"]')
    if (!root) throw Error("Missing page-scroll")
    root.scrollTop += target.getBoundingClientRect().top - root.getBoundingClientRect().top
  })
}
test("usage evidence admits only exact run receipt joins and leaves capacity and absent cost portions unknown", () => {
  const source = sourceDataset("populated"),
    before = JSON.stringify(source)
  const early = usageEvidence(
    usageEvidenceModel(operationsModel("populated", "", { cutoff: "2026-10-04T14:10:15Z" })),
    "RUN-001",
  )
  expect(early?.receipt).toBeUndefined()
  const current = usageEvidence(
    usageEvidenceModel(operationsModel("populated", "", { cutoff: "2026-10-04T14:11:15Z" })),
    "RUN-001",
  )
  expect(current?.receipt?.id).toBe("USAGE-001")
  expect(current?.receipt?.tokens).toBe(7791)
  if (!current?.receipt) throw Error("Missing admitted receipt")
  expect(current.receipt.inputTokens + current.receipt.outputTokens).toBe(current.receipt.tokens)
  const malformed = operationsModel("populated")
  malformed.usage = malformed.usage.map((u) =>
    u.id === "USAGE-001" ? { ...u, runId: "RUN-002" } : u,
  )
  expect(usageEvidence(usageEvidenceModel(malformed), "RUN-001")?.receipt).toBeUndefined()
  for (const state of ["denied", "loading", "error"] as const)
    expect(
      usageEvidence(usageEvidenceModel(operationsModel("populated"), state), "RUN-001"),
    ).toBeNull()
  expect(usageEvidence(usageEvidenceModel(operationsModel("large")), "RUN-001")).toBeNull()
  expect(finiteAmount(0)).toBe("0")
  expect(finiteAmount(undefined)).toBe("Unknown")
  expect(finiteAmount(Number.NaN)).toBe("Unknown")
  expect(finiteAmount(-1)).toBe("Unknown")
  expect(capacitySample("overbudget")).toEqual({ usedTokens: 1500, maxTokens: 1000 })
  expect(JSON.stringify(source)).toBe(before)
})
test("actual receipt popup exposes supplied usage unknown fields and native Escape current trigger focus", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto("/?view=Usage%20Evidence&mode=light")
  await page.screenshot({
    path: info.outputPath("usage-overview-desktop.png"),
    animations: "disabled",
  })
  const trigger = page.getByRole("button", { name: "Inspect recorded receipt usage", exact: true })
  await trigger.focus()
  await trigger.press("Enter")
  const popup = page.getByLabel("Recorded usage popup", { exact: true })
  await expect(popup).toBeVisible()
  await expect(popup).toContainText("5.8K")
  await expect(popup).toContainText("1.9K")
  await expect(popup.getByRole("progressbar")).toHaveCount(0)
  await expect(popup).toContainText("Reasoning")
  await expect(popup).toContainText("Cache")
  await expect(popup).toContainText("0.015581999999999999")
  expect(
    await popup.evaluate(
      (n) => n.getBoundingClientRect().width > 100 && n.getBoundingClientRect().height > 100,
    ),
  ).toBe(true)
  expect(
    await page
      .getByLabel("Recorded receipt usage", { exact: true })
      .evaluate((n) => parseFloat(getComputedStyle(n).paddingTop) >= 12),
  ).toBe(true)
  expect(
    await page.locator(".usage-grid").evaluate((n) => parseFloat(getComputedStyle(n).gap) >= 12),
  ).toBe(true)
  expect(await popup.evaluate((n) => parseFloat(getComputedStyle(n).paddingTop) >= 8)).toBe(true)
  await page.screenshot({
    path: info.outputPath("usage-receipt-desktop.png"),
    animations: "disabled",
  })
  await page.keyboard.press("Escape")
  await expect(popup).not.toBeVisible()
  await expect(trigger).toBeFocused()
  await page.getByRole("button", { name: "Preview raw receipt", exact: true }).click()
  await expect(page.getByRole("region", { name: "Raw recorded receipt" })).toContainText(
    '"inputTokens": 5843',
  )
  await align(page.getByLabel("Readonly USAGE-001 preview", { exact: true }))
  await page.screenshot({
    path: info.outputPath("usage-artifact-desktop.png"),
    animations: "disabled",
  })
  await page.getByRole("button", { name: "Close receipt preview", exact: true }).click()
  await expect(page.getByRole("button", { name: "Preview raw receipt", exact: true })).toBeFocused()
  await page.getByRole("button", { name: "Preview raw receipt", exact: true }).click()
  await trigger.click()
  await expect(page.getByRole("region", { name: "Raw recorded receipt" })).toHaveCount(0)
  await expect(popup).toBeVisible()
})
test("authored finite zero overbudget invalid capacity uses real native progress and exact tiny USD companion", async ({
  page,
}, info) => {
  await page.goto("/?view=Usage%20Evidence&theme=p1-green-phosphor")
  const choice = page.getByRole("combobox", { name: "Capacity specimen", exact: true }),
    trigger = page.getByRole("button", { name: "Inspect authored capacity sample", exact: true }),
    popup = page.getByLabel("Authored capacity popup", { exact: true })
  for (const [mode, value] of [
    ["zero", 0],
    ["normal", 25],
    ["overbudget", 100],
  ] as const) {
    await choice.selectOption(mode)
    await trigger.click()
    const meter = popup.getByRole("progressbar", { name: "Context capacity used" })
    await expect(meter).toHaveAttribute("value", String(value))
    expect(
      await meter.evaluate(
        (n) => n.getBoundingClientRect().width > 100 && n.getBoundingClientRect().height > 0,
      ),
    ).toBe(true)
    await expect(popup).toContainText("USD 0.000001")
    await expect(popup).toContainText("$0.00")
    await expect(popup).toContainText("Reasoning")
    await page.keyboard.press("Escape")
  }
  await expect(page.getByLabel("Authored capacity specimen", { exact: true })).toContainText(
    "used 1500 / max 1000",
  )
  await trigger.click()
  await page.screenshot({
    path: info.outputPath("usage-capacity-desktop.png"),
    animations: "disabled",
  })
  await page.keyboard.press("Escape")
  for (const mode of ["unknown", "negative", "nan", "infinity", "zero-max"]) {
    await choice.selectOption(mode)
    await trigger.click()
    await expect(popup.getByRole("progressbar")).toHaveCount(0)
    await expect(popup).toContainText("Unknown")
    await page.keyboard.press("Escape")
  }
})
test("actual StrictMode held inspection current leases close selection popup source cutoff and unmount refuse retired callbacks", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:18545/?view=Usage%20Evidence")
  const preview = page.getByRole("button", { name: "Preview raw receipt", exact: true }),
    inspect = page.getByRole("button", { name: "Inspect current receipt", exact: true }),
    close = page.getByRole("button", { name: "Close receipt preview", exact: true }),
    release = page.getByRole("button", { name: /Release oldest scripted inspection/ })
  await preview.click()
  await capture(close, "oldCloseUsage")
  await inspect.click()
  await expect(
    page.getByText("Held local inspection; supplied receipt is unchanged."),
  ).toBeVisible()
  await close.click()
  await preview.click()
  await invoke(page, "oldCloseUsage")
  await expect(inspect).toBeVisible()
  await release.click()
  await expect(page.getByText(/Inspected USAGE-/)).toHaveCount(0)
  await inspect.click()
  await release.click()
  await expect(
    page.getByText("Inspected USAGE-001; no receipt or access record changed."),
  ).toBeVisible()
  await capture(inspect, "oldInspectUsage")
  await chooseRun(page, "RUN-002")
  await preview.click()
  await invoke(page, "oldInspectUsage")
  await expect(page.getByText(/Held local inspection/)).toHaveCount(0)
  await inspect.click()
  await page.getByRole("button", { name: "Inspect authored capacity sample", exact: true }).click()
  await expect(inspect).toHaveCount(0)
  await page.keyboard.press("Escape")
  await preview.click()
  await release.click()
  await expect(page.getByText(/Inspected USAGE-/)).toHaveCount(0)
  await capture(close, "resetCloseUsage")
  await page.getByRole("button", { name: "Reset usage review", exact: true }).click()
  await preview.click()
  await invoke(page, "resetCloseUsage")
  await expect(inspect).toBeVisible()
  await close.click()
  await page.getByRole("button", { name: "Inspect recorded receipt usage", exact: true }).click()
  const reset = page.getByRole("button", { name: "Reset usage review", exact: true })
  await page.evaluate(() => {
    const popup = document.querySelector('[aria-label="Recorded usage popup"]'),
      reset = [...document.querySelectorAll("button")].find(
        (n) => n.textContent === "Reset usage review",
      )
    if (!popup || !reset) throw Error("Missing actual close/reset targets")
    popup.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }))
    reset.click()
    reset.focus()
  })
  await expect(reset).toBeFocused()
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  )
  await expect(reset).toBeFocused()
  await preview.click()
  await expect(
    page.getByRole("region", { name: "Raw recorded receipt", exact: true }),
  ).toBeFocused()
  await capture(inspect, "cutoffInspectUsage")
  await page.getByText("Fixture timeline review", { exact: true }).click()
  const frames = timelineFrames(sourceDataset("populated"))
  await page.getByLabel("Playback position").fill(String(frames.indexOf("2026-10-04T14:10:15Z")))
  await invoke(page, "cutoffInspectUsage")
  await expect(page.getByText("Receipt unavailable at this cutoff", { exact: false })).toBeVisible()
  await expect(inspect).toHaveCount(0)
  await page.goto("http://127.0.0.1:18545/?view=Usage%20Evidence")
  await preview.click()
  await capture(inspect, "unmountInspectUsage")
  await page.getByRole("button", { name: "Activity", exact: true }).click()
  await invoke(page, "unmountInspectUsage")
  await expect(page.getByLabel("Usage Evidence review")).toHaveCount(0)
})
test("390 dark raw Artifact has bounded literal content keyboard scroll and complete local footer without effects", async ({
  page,
}, info) => {
  const bad: string[] = []
  page.on("request", (r) => {
    if (r.method() !== "GET" || !["localhost", "127.0.0.1"].includes(new URL(r.url()).hostname))
      bad.push(r.url())
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/?view=Usage%20Evidence&theme=p1-green-phosphor&navigation=drawer")
  await page.getByLabel("Usage evidence appearance").selectOption("long-content")
  await page.getByRole("button", { name: "Preview raw receipt", exact: true }).click()
  const region = page.getByRole("region", { name: "Raw recorded receipt", exact: true })
  await align(region)
  await region.focus()
  await region.press("PageDown")
  expect(
    await region.evaluate(
      (n) => n.clientHeight > 0 && n.clientHeight <= 400 && n.scrollHeight > n.clientHeight,
    ),
  ).toBe(true)
  await expect.poll(() => region.evaluate((n) => n.scrollTop)).toBeGreaterThan(0)
  await region.press("Home")
  await region.evaluate((n) => {
    n.scrollTop = 0
  })
  await align(page.getByLabel("Readonly USAGE-001 preview", { exact: true }))
  await page.screenshot({
    path: info.outputPath("usage-artifact-narrow.png"),
    animations: "disabled",
  })
  expect(
    await region.evaluate(
      (n) => n.getBoundingClientRect().width > 100 && n.scrollWidth <= n.clientWidth + 1,
    ),
  ).toBe(true)
  expect(
    await region
      .locator("pre")
      .evaluateAll((ns) =>
        ns.every((n) => n.getBoundingClientRect().width > 0 && n.scrollWidth <= n.clientWidth + 1),
      ),
  ).toBe(true)
  await expect(region.locator("script,a")).toHaveCount(0)
  await page.getByRole("button", { name: "Inspect current receipt", exact: true }).focus()
  await page.keyboard.press("Enter")
  await page.getByRole("button", { name: /Release oldest scripted inspection/ }).focus()
  await page.keyboard.press("Enter")
  await expect(page.getByText(/Inspected USAGE-001/)).toBeVisible()
  await align(page.getByRole("button", { name: /Release oldest scripted inspection/ }))
  await page.screenshot({
    path: info.outputPath("usage-artifact-footer-narrow.png"),
    animations: "disabled",
  })
  await page.getByRole("button", { name: "Close receipt preview", exact: true }).click()
  await page.getByRole("button", { name: "Inspect authored capacity sample", exact: true }).click()
  await page.screenshot({
    path: info.outputPath("usage-capacity-narrow.png"),
    animations: "disabled",
  })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(bad).toEqual([])
})
test("portable usage states preserve before receipt unknown empty denied and isolated authored values without APIs", async ({
  page,
}) => {
  const bad: string[] = []
  page.on("request", (r) => {
    if (/\/api\/|\/plugins\//.test(r.url())) bad.push(r.url())
  })
  for (const [story, text] of [
    ["before-receipt", "Receipt unavailable at this cutoff"],
    ["empty", "No admitted runs"],
    ["denied", "Usage evidence unavailable"],
    ["incompatible-source", "Incompatible operations source profile"],
    ["locked", "Locked readonly evidence"],
    ["global-read-failure", "Operations error resource"],
    ["global-loading", "Operations loading resource"],
    ["global-denied", "Operations permission-denied resource"],
  ]) {
    await page.goto(
      `http://127.0.0.1:18542/iframe.html?id=chat-usage-evidence--${story}&viewMode=story`,
    )
    await expect(page.getByLabel("Usage Evidence review")).toContainText(text)
  }
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=chat-usage-evidence--over-budget&viewMode=story",
  )
  await page.getByRole("button", { name: "Inspect authored capacity sample", exact: true }).click()
  await expect(page.getByRole("progressbar")).toHaveAttribute("value", "100")
  expect(bad).toEqual([])
})
