import { expect, test } from "@playwright/test"

test("developer route keeps canvas ANSI and highlighting out of Activity and source startup", async ({
  page,
}, info) => {
  const requests: string[] = []
  page.on("request", (r) => requests.push(r.url()))
  await page.goto("/?view=Activity&mode=light")
  await expect(page.getByRole("heading", { name: "Activity", exact: true })).toBeVisible()
  expect(requests.filter((u) => /\/(Output|Workflow)-|shiki|ansi-to-react|xyflow/.test(u))).toEqual(
    [],
  )
  await page.getByRole("button", { name: "Developer", exact: true }).click()
  await expect(page.getByLabel("Transient source draft")).toHaveValue(
    "export const mode = 'inspect'\n",
  )
  expect(requests.filter((u) => /\/(Output|Workflow)-|shiki|ansi-to-react|xyflow/.test(u))).toEqual(
    [],
  )
  await page.getByLabel("Transient source draft").fill("local draft only")
  await page.getByRole("button", { name: "Inspect source save intent" }).click()
  await expect(page.getByText(/Source save intent refused/)).toBeVisible()
  await page.getByRole("button", { name: "outcome.json", exact: true }).click()
  await expect(page.getByLabel("Transient source draft")).not.toHaveValue("local draft only")
  await page.getByRole("button", { name: "Diff", exact: true }).click()
  await expect(page.getByRole("heading", { name: "Before and proposed text" })).toBeVisible()
  await page.screenshot({
    path: info.outputPath("developer-diff-desktop.png"),
    animations: "disabled",
  })
  await page.getByLabel("Developer state").selectOption("denied")
  await expect(page.getByText(/Developer evidence denied/)).toBeVisible()
  await expect(page.getByLabel("Transient source draft")).toHaveCount(0)
  await page.getByLabel("Developer state").selectOption("locked")
  await page.getByRole("button", { name: "Source", exact: true }).click()
  await expect(page.getByLabel("Transient source draft")).toBeDisabled()
  await page.getByLabel("Developer state").selectOption("normal")
  await expect(page.getByLabel("Transient source draft")).toHaveValue(
    "export const mode = 'inspect'\n",
  )
})
test("recorded code metadata stack and ANSI are inert correlated presentation", async ({
  page,
}, info) => {
  const writes: string[] = []
  page.on("request", (r) => {
    if (!["GET", "HEAD"].includes(r.method())) writes.push(r.url())
  })
  await page.goto("/?view=Developer&mode=light")
  await page.getByRole("button", { name: "Records", exact: true }).click()
  await expect(page.getByText(/RUN-003\/TOOL-003\/TRACE-003/)).toBeVisible()
  await expect(page.getByText("2026-10-04T14:15:15Z UTC", { exact: true })).toBeVisible()
  await expect(page.getByLabel("Static command example")).toHaveValue(
    "review-fixture --inspect-only",
  )
  await expect(page.getByLabel("Static command example")).toHaveAttribute("readonly", "")
  await page.getByRole("heading", { name: "Recorded refusal stack" }).scrollIntoViewIfNeeded()
  await page.screenshot({
    path: info.outputPath("developer-records-desktop.png"),
    animations: "disabled",
  })
  await page.getByRole("button", { name: /src\/review.ts:1:1/ }).click()
  await expect(page.getByLabel("Transient source draft")).toBeVisible()
  await page.getByRole("button", { name: "Output", exact: true }).click()
  const output = page.getByRole("log")
  await expect(output).toContainText("<script>inert fixture text</script>")
  await expect(output.locator("a,script,input")).toHaveCount(0)
  await output.scrollIntoViewIfNeeded()
  await page.screenshot({
    path: info.outputPath("developer-output-desktop.png"),
    animations: "disabled",
  })
  expect(writes).toEqual([])
})
test("read-only shared workflow supports keyboard alternatives and preserves graph relationships", async ({
  page,
}, info) => {
  await page.goto("/?view=Developer&mode=light")
  await page.getByRole("button", { name: "Workflow", exact: true }).click()
  await expect(page.locator(".react-flow__node")).toHaveCount(3)
  expect(
    await page
      .locator(".node-container")
      .first()
      .evaluate((e) => parseFloat(getComputedStyle(e).width)),
  ).toBeGreaterThan(300)
  await expect(page.locator(".react-flow__edge")).toHaveCount(2)
  await page.getByRole("button", { name: "NODE-002 · Inspect recorded tool", exact: true }).click()
  await expect(page.getByText("RUN-003 / SPAN-TOOL-003 / TOOL-003", { exact: true })).toBeVisible()
  await expect(page.getByText(/USAGE-003 · .*recorded tokens/)).toBeVisible()
  await page
    .getByRole("button", { name: "Inspect related run (full snapshot)", exact: true })
    .click()
  await expect(page.getByRole("dialog")).toContainText("RUN-003")
  await page.keyboard.press("Escape")
  await page.locator(".react-flow__node").nth(1).click()
  await page.keyboard.press("Delete")
  await page.keyboard.press("Backspace")
  await expect(page.locator(".react-flow__node")).toHaveCount(3)
  await expect(page.locator(".react-flow__edge")).toHaveCount(2)
  await page.getByRole("button", { name: /EDGE-001 ·/ }).click()
  await expect(page.getByRole("heading", { name: "EDGE-001", exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Inspect workflow run intent" }).click()
  await expect(page.getByText(/Workflow run intent refused/)).toBeVisible()
  await page.getByRole("button", { name: "Close intent", exact: true }).click()
  await page.locator(".workflow-viewport").scrollIntoViewIfNeeded()
  await page.screenshot({
    path: info.outputPath("developer-workflow-desktop.png"),
    animations: "disabled",
  })
  await page.getByLabel("Developer state").selectOption("unknown")
  await expect(
    page.getByText("Unknown kind: unrecognized-fixture-step", { exact: true }),
  ).toBeVisible()
  await page.getByLabel("Developer state").selectOption("empty")
  await expect(page.locator(".react-flow__node")).toHaveCount(0)
  await expect(page.getByText(/No developer files or workflow records/)).toBeVisible()
})
test("portable developer stories and narrow themes share bounded drafts and graph records", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/?view=Developer&theme=p3-amber-phosphor&mode=dark")
  await page.getByLabel("Developer state").selectOption("long-content")
  await page.getByLabel("Transient source draft").scrollIntoViewIfNeeded()
  await page.screenshot({
    path: info.outputPath("developer-source-narrow.png"),
    animations: "disabled",
  })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
  await page.getByRole("button", { name: "Workflow", exact: true }).click()
  await expect(page.locator(".react-flow__node")).toHaveCount(3)
  await page.screenshot({
    path: info.outputPath("developer-workflow-narrow.png"),
    animations: "disabled",
  })
  const api: string[] = []
  page.on("request", (r) => {
    if (/\/api\/|\/plugins\//.test(r.url())) api.push(r.url())
  })
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=developer-controlled-review--unknown&viewMode=story",
  )
  await expect(
    page.getByText("Unknown kind: unrecognized-fixture-step", { exact: true }),
  ).toBeVisible()
  expect(api).toEqual([])
})
