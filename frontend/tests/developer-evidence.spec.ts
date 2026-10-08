import { expect, test } from "@playwright/test"
import {
  admittedFile,
  developerEvidenceModel,
  evidenceStates,
} from "../src/developer-evidence/model"
import { operationsModel } from "../src/operations/model"
import { sourceDataset, timelineFrames } from "../src/playback/model"

test("developer evidence admits recorded boundary joins and finite authored ledger without modifying source", () => {
  const source = sourceDataset("populated"),
    encoded = JSON.stringify(source)
  const before = developerEvidenceModel(
    operationsModel("populated", "", { cutoff: "2026-10-04T14:14:15Z" }),
  )
  expect(before.available).toBe(false)
  expect(before.files).toEqual([])
  expect(before.run).toBeUndefined()
  expect(before.usage).toBeUndefined()
  const at = developerEvidenceModel(
    operationsModel("populated", "", { cutoff: "2026-10-04T14:15:15Z" }),
  )
  expect(at.available).toBe(true)
  expect(at.run?.status).toBe("running")
  expect(at.tool?.finished).toBe("2026-10-04T14:15:15Z")
  expect(at.usage?.id).toBe("USAGE-003")
  expect(developerEvidenceModel(operationsModel("large")).available).toBe(false)
  for (const state of evidenceStates) {
    const data = developerEvidenceModel(operationsModel("populated"), state)
    expect(data.summary.passed + data.summary.failed + data.summary.skipped).toBeLessThanOrEqual(
      data.summary.total,
    )
    expect(
      data.cases.every(
        (c) =>
          data.files.some((f) => f.id === c.fileId) &&
          (c.duration === undefined || (Number.isFinite(c.duration) && Number(c.duration) >= 0)),
      ),
    ).toBe(true)
  }
  expect(admittedFile(at, "FILE-001", 0)).toBeNull()
  expect(admittedFile(at, "FILE-001", 99)).toBeNull()
  expect(admittedFile(at, "FILE-001", 1, 999)).toBeNull()
  expect(admittedFile(at, "unlisted")).toBeNull()
  expect(admittedFile(at, "FILE-001", 1, 1)?.file.runId).toBe("RUN-003")
  expect(JSON.stringify(source)).toBe(encoded)
})
test("actual test progress status duration errors and native readonly disclosures agree", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto("/?view=Developer%20Evidence&mode=light")
  const progress = page.getByRole("progressbar", { name: "Tests passed or failed", exact: true })
  await expect(progress).toHaveAttribute("aria-valuenow", "66.66666666666666")
  const paint = await progress.evaluate((e) => {
    const r = e.getBoundingClientRect()
    return [...e.children].map((c) => ({
      ratio: c.getBoundingClientRect().width / r.width,
      color: getComputedStyle(c).backgroundColor,
      height: r.height,
    }))
  })
  expect(paint[0].ratio).toBeCloseTo(1 / 3, 2)
  expect(paint[1].ratio).toBeCloseTo(1 / 3, 2)
  expect(paint[0].color).not.toBe(paint[1].color)
  expect(paint[0].height).toBeGreaterThan(0)
  await expect(page.getByLabel("Authored test ledger")).toContainText("0ms authored")
  await expect(page.getByLabel("Authored test ledger")).toContainText("1250ms authored")
  await expect(page.getByLabel("Authored test ledger")).toContainText("Duration unavailable")
  await expect(page.getByLabel("Authored test ledger")).toContainText(
    "FixtureRefusal: review requires explicit context",
  )
  const suite = page.getByRole("button", { name: /Recorded review examples/ })
  await suite.focus()
  await suite.press("Enter")
  await expect(suite).toHaveAttribute("aria-expanded", "false")
  await expect(
    page.getByRole("button", { name: "Inspect case file FILE-001", exact: true }),
  ).not.toBeVisible()
  await suite.press("Enter")
  await expect(suite).toHaveAttribute("aria-expanded", "true")
  const stack = page.getByRole("button", { name: "Stack trace", exact: true })
  await stack.focus()
  await stack.press("Enter")
  await expect(stack).toHaveAttribute("aria-expanded", "false")
  await stack.press("Enter")
  await expect(page.getByText("unknown frame remains text", { exact: true })).toBeVisible()
  const commit = page.getByRole("button", { name: /f17e4421.*Fictional inspect-mode proposal/ })
  await commit.focus()
  await commit.press("Enter")
  await expect(commit).toHaveAttribute("aria-expanded", "false")
  await commit.press("Enter")
  await expect(page.getByText("2026-10-04T14:15:15Z", { exact: true })).toBeVisible()
  await page.screenshot({
    path: info.outputPath("developer-evidence-desktop.png"),
    animations: "disabled",
  })
  await page.getByLabel("Developer evidence appearance").selectOption("running")
  await expect(progress).toHaveAttribute("aria-valuenow", "33.33333333333333")
  await expect(page.getByLabel("Authored test ledger")).toContainText("1 passive running")
  await expect(page.getByLabel("Authored test ledger")).toContainText("Duration unavailable")
  await page.getByLabel("Developer evidence appearance").selectOption("empty")
  await expect(progress).toHaveAttribute("aria-valuenow", "0")
  await expect(page.getByText("Observed empty ledger · no suites")).toBeVisible()
})
test("declared stack and commit file navigation stays local and old callbacks refuse after selection source and StrictMode replay", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:18545/?view=Developer%20Evidence")
  const path = page.getByRole("button", { name: "src/review.ts:1:1", exact: true })
  await path.evaluate((node) => {
    const k = Object.keys(node).find((k) => k.startsWith("__reactProps$"))
    if (!k) throw Error("Missing callback")
    ;(window as unknown as { oldFile: () => void }).oldFile = (
      node as unknown as Record<string, { onClick: () => void }>
    )[k].onClick
  })
  await path.focus()
  await path.press("Enter")
  await expect(page.getByLabel("Selected developer file")).toContainText(
    "FILE-001 · src/review.ts:1:1",
  )
  await page.getByRole("button", { name: "Inspect proposal README.md", exact: true }).click()
  await expect(page.getByLabel("Selected developer file")).toContainText("FILE-003")
  await page.evaluate(() => (window as unknown as { oldFile: () => void }).oldFile())
  await expect(page.getByLabel("Selected developer file")).toContainText("FILE-003")
  await page.getByRole("button", { name: "Replace review source copy", exact: true }).click()
  await expect(page.getByLabel("Selected developer file")).toContainText("No source opened")
  await page.evaluate(() => (window as unknown as { oldFile: () => void }).oldFile())
  await expect(page.getByLabel("Selected developer file")).toContainText("No source opened")
  await page.getByRole("button", { name: "fixtures/outcome.json:1:1", exact: true }).click()
  await expect(page.getByLabel("Selected developer file")).toContainText('"outcome": "refused"')
  await expect(page.getByRole("button", { name: /^Copy/ })).toHaveCount(0)
})
test("native playback admits exact evidence receipt boundary and withholds later run finish without reused historical IDs", async ({
  page,
}) => {
  await page.goto("/?view=Developer%20Evidence")
  await page.getByText("Fixture timeline review", { exact: true }).click()
  const frames = timelineFrames(sourceDataset("populated"))
  const seek = async (cutoff: string) =>
    page.getByLabel("Playback position").fill(String(frames.indexOf(cutoff)))
  await seek("2026-10-04T14:14:15Z")
  await expect(
    page.getByText("Developer evidence not observed through this cutoff", { exact: true }),
  ).toBeVisible()
  await expect(page.getByRole("progressbar")).toHaveCount(0)
  await expect(page.getByRole("button", { name: "src/review.ts:1:1", exact: true })).toHaveCount(0)
  await seek("2026-10-04T14:15:15Z")
  await expect(page.getByLabel("Recorded stack and commit")).toContainText("RUN-003 · run running")
  await expect(page.getByLabel("Recorded stack and commit")).toContainText("3812 recorded tokens")
  await page.getByRole("button", { name: "src/review.ts:1:1", exact: true }).click()
  await expect(page.getByLabel("Selected developer file")).toContainText("FILE-001")
  await seek("2026-10-04T14:15:30Z")
  await expect(page.getByLabel("Recorded stack and commit")).toContainText("RUN-003 · run failed")
  await expect(page.getByLabel("Selected developer file")).toContainText("No source opened")
  await page.getByLabel("Scenario", { exact: true }).selectOption("large")
  await expect(
    page.getByText("Developer evidence unavailable for this source profile", { exact: true }),
  ).toBeVisible()
  await expect(page.getByRole("progressbar")).toHaveCount(0)
})
test("narrow dark long evidence wraps and source pane remains within one page-scroll", async ({
  page,
}, info) => {
  const bad: string[] = []
  page.on("request", (r) => {
    if (r.method() !== "GET" || !["localhost", "127.0.0.1"].includes(new URL(r.url()).hostname))
      bad.push(r.url())
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/?view=Developer%20Evidence&theme=p1-green-phosphor&navigation=drawer")
  await page.getByLabel("Developer evidence appearance").selectOption("long-content")
  await page.getByLabel("Authored test ledger").scrollIntoViewIfNeeded()
  await page.screenshot({
    path: info.outputPath("developer-evidence-tests-narrow.png"),
    animations: "disabled",
  })
  await page.getByRole("button", { name: "Inspect case file FILE-001", exact: true }).click()
  await expect(page.getByTestId("authored-long-source")).toBeVisible()
  expect(
    await page
      .getByTestId("authored-long-source")
      .evaluate((n) => n.getBoundingClientRect().width > 0 && n.scrollWidth <= n.clientWidth + 1),
  ).toBe(true)
  await page.getByLabel("Developer evidence appearance").selectOption("recorded")
  await page.getByRole("button", { name: "Inspect case file FILE-001", exact: true }).click()
  await page.getByLabel("Selected developer file").scrollIntoViewIfNeeded()
  await page.screenshot({
    path: info.outputPath("developer-evidence-source-narrow.png"),
    animations: "disabled",
  })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(
    await page.locator(".developer-evidence pre").evaluateAll((nodes) =>
      nodes.every((n) => {
        const r = n.getBoundingClientRect()
        return r.width > 0 && n.scrollWidth <= n.clientWidth + 1
      }),
    ),
  ).toBe(true)
  await expect(page.getByTestId("page-scroll")).toHaveCount(1)
  await expect(page.locator("html")).toHaveAttribute("data-theme", "p1-green-phosphor")
  expect(bad).toEqual([])
})
test("portable independent developer evidence supports guarded resource raw-frame and absent-duration states without APIs", async ({
  page,
}) => {
  const requests: string[] = []
  page.on("request", (r) => {
    if (/\/(api|plugins)\//.test(r.url())) requests.push(r.url())
  })
  for (const name of [
    "loading",
    "read-failure",
    "denied",
    "before-evidence",
    "incompatible-source",
  ]) {
    await page.goto(
      `http://127.0.0.1:18542/iframe.html?id=developer-independent-evidence--${name}&viewMode=story`,
    )
    await expect(page.getByRole("progressbar")).toHaveCount(0)
    await expect(page.getByRole("button", { name: /Inspect case file/ })).toHaveCount(0)
  }
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=developer-independent-evidence--unknown-raw-frame&viewMode=story",
  )
  await expect(
    page.getByText("Authored unknown frame: no file path classified", { exact: true }),
  ).toBeVisible()
  await expect(page.getByText("unknown frame remains text", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "not-supplied.ts:99:1", exact: true }).click()
  await expect(page.getByRole("status")).toContainText(
    "File or line unavailable in supplied source",
  )
  await page.getByLabel("Developer evidence appearance").selectOption("missing-duration")
  await expect(page.getByLabel("Authored test ledger")).toContainText("Duration unavailable")
  await expect(page.getByLabel("Authored test ledger")).toContainText("0ms authored")
  expect(requests).toEqual([])
})
