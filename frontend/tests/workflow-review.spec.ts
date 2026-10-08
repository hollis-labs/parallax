import { expect, test } from "@playwright/test"
import { operationsModel } from "../src/operations/model"
import { sourceDataset, timelineFrames } from "../src/playback/model"
import { workflowModel, workflowTarget } from "../src/workflow-review/model"

test("workflow source graph and current receipt span joins admit only recorded compatible evidence", () => {
  const source = sourceDataset("populated"),
    encoded = JSON.stringify(source)
  const before = workflowModel(operationsModel("populated", "", { cutoff: "2026-10-04T14:14:15Z" }))
  expect(before.available).toBe(false)
  expect(before.nodes).toEqual([])
  expect(workflowTarget(before, "NODE-001")).toBeNull()
  const at = workflowModel(operationsModel("populated", "", { cutoff: "2026-10-04T14:15:15Z" }))
  expect(at.nodes.map((n) => n.id)).toEqual(["NODE-001", "NODE-002", "NODE-003"])
  expect(at.edges.map((e) => [e.source, e.target])).toEqual([
    ["NODE-001", "NODE-002"],
    ["NODE-002", "NODE-003"],
  ])
  expect(at.run?.status).toBe("running")
  expect(at.tool?.status).toBe("failed")
  expect(at.usage?.tokens).toBe(3812)
  expect(at.spans.every((s) => s.traceId === at.run?.traceId)).toBe(true)
  expect(workflowTarget(at, "unrecognized")).toBeNull()
  expect(workflowModel(operationsModel("large")).available).toBe(false)
  expect(workflowModel(operationsModel("populated"), "empty").nodes).toEqual([])
  expect(JSON.stringify(source)).toBe(encoded)
})
test("actual readonly canvas node slots selected toolbar panel and native relationships stay coherent", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto("/?view=Workflow%20Review&mode=light")
  await expect(page.locator(".workflow-review .react-flow__node")).toHaveCount(3)
  await expect(page.locator(".workflow-review .react-flow__edge")).toHaveCount(2)
  const node = page.getByRole("button", { name: "Inspect NODE-001: Run review", exact: true })
  await node.focus()
  await node.press("Enter")
  const toolbar = page.getByLabel("Selected node toolbar")
  await expect(toolbar).toBeVisible()
  await expect(page.getByLabel("Workflow canvas review panel")).toContainText("NODE-001")
  expect(
    await toolbar.evaluate((e) => {
      const r = e.getBoundingClientRect()
      return r.width > 0 && r.height > 0
    }),
  ).toBe(true)
  expect(
    await toolbar.evaluate((e) => {
      const t = e.getBoundingClientRect()
      const c = document.querySelector(".workflow-review-canvas")?.getBoundingClientRect()
      return !!c && t.left >= c.left && t.right <= c.right && t.top >= c.top && t.bottom <= c.bottom
    }),
  ).toBe(true)
  await toolbar.getByRole("button", { name: "Inspect selected node", exact: true }).click()
  await expect(page.getByLabel("Workflow evidence inspector")).toContainText("SPAN-ROOT-003")
  const graph = page.getByLabel("Recorded workflow canvas")
  await graph.scrollIntoViewIfNeeded()
  await page.screenshot({
    path: info.outputPath("workflow-review-desktop.png"),
    animations: "disabled",
  })
  const original = await page
    .locator(".workflow-review .react-flow__node")
    .evaluateAll((ns) => ns.map((n) => n.getAttribute("style")))
  const flowNode = page.locator(".workflow-review .react-flow__node").first()
  await flowNode.focus()
  await flowNode.press("Delete")
  await flowNode.press("Backspace")
  await expect(page.locator(".workflow-review .react-flow__node")).toHaveCount(3)
  expect(
    await page
      .locator(".workflow-review .react-flow__node")
      .evaluateAll((ns) => ns.map((n) => n.getAttribute("style"))),
  ).toEqual(original)
  await page
    .getByRole("button", { name: "Inspect EDGE-001: NODE-001 → NODE-002", exact: true })
    .click()
  await expect(page.getByLabel("Workflow evidence inspector")).toContainText(
    "Authored inspection order",
  )
  await page
    .locator(".workflow-review .react-flow__node")
    .first()
    .getByRole("button", { name: "Review linked evidence", exact: true })
    .click()
  await expect(page.getByLabel("Workflow evidence inspector")).toContainText("NODE-001: Run review")
  await expect(
    page.getByRole("button", { name: /^(Save|Run workflow|Copy|Connect)$/ }),
  ).toHaveCount(0)
})
test("actual bounded connection ring danger paths and edge namespace specimens preserve decorative reduced motion", async ({
  page,
}, info) => {
  await page.goto("/?view=Workflow%20Review&mode=light")
  const path = page.getByTestId("connection-specimen").locator("path")
  const ring = await path.evaluate((e) => getComputedStyle(e).stroke)
  await page.getByLabel("Connection specimen state").selectOption("valid")
  expect(await path.evaluate((e) => getComputedStyle(e).stroke)).toBe(ring)
  await page.getByLabel("Connection specimen state").selectOption("invalid")
  expect(await path.evaluate((e) => getComputedStyle(e).stroke)).not.toBe(ring)
  for (const id of ["connection-specimen", "animated-specimen", "temporary-specimen"]) {
    const svg = page.getByTestId(id)
    expect(
      await svg
        .locator("path")
        .first()
        .evaluate((e) => {
          const b = (e as SVGGraphicsElement).getBBox()
          const values = e.getAttribute("d") ?? ""
          return b.width > 0 && b.height > 0 && !/NaN|Infinity/.test(values)
        }),
    ).toBe(true)
  }
  await expect(
    page.locator(
      ".workflow-specimen-svg .wf-connection path, .workflow-specimen-svg .react-flow__edge-path",
    ),
  ).toHaveCount(3)
  expect(
    await page
      .locator(
        ".workflow-specimen-svg .wf-connection path, .workflow-specimen-svg .react-flow__edge-path",
      )
      .evaluateAll((nodes) =>
        nodes.every((n) => {
          const s = getComputedStyle(n)
          return (
            s.stroke !== "none" &&
            s.stroke !== "transparent" &&
            s.stroke !== "rgba(0, 0, 0, 0)" &&
            Number.parseFloat(s.strokeWidth) > 0 &&
            Number.parseFloat(s.strokeOpacity) > 0 &&
            Number.parseFloat(s.opacity) > 0
          )
        }),
      ),
  ).toBe(true)
  const temp = page.getByTestId("temporary-specimen").locator(".wf-edge-temporary")
  expect(await temp.evaluate((e) => getComputedStyle(e).strokeDasharray)).not.toBe("none")
  const traveller = page.getByTestId("animated-specimen").locator(".wf-edge-traveller")
  expect(await traveller.evaluate((e) => getComputedStyle(e).animationName)).toBe(
    "hl-workflow-travel",
  )
  await page.getByLabel("Authored connection and edge specimens").scrollIntoViewIfNeeded()
  await page.screenshot({
    path: info.outputPath("workflow-review-specimens-desktop.png"),
    animations: "disabled",
  })
  await page.emulateMedia({ reducedMotion: "reduce" })
  expect(await traveller.evaluate((e) => getComputedStyle(e).display)).toBe("none")
  expect(await traveller.evaluate((e) => getComputedStyle(e).animationName)).toBe("none")
  expect(
    await page
      .getByTestId("animated-specimen")
      .locator("path")
      .first()
      .evaluate((e) => getComputedStyle(e).stroke),
  ).not.toBe("none")
})
test("actual StrictMode source selection viewport and captured node callbacks retire before later inspection", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:18545/?view=Workflow%20Review")
  const button = page.getByRole("button", { name: "Inspect NODE-001: Run review", exact: true })
  await button.evaluate((node) => {
    const k = Object.keys(node).find((k) => k.startsWith("__reactProps$"))
    if (!k) throw Error("Missing native callback")
    ;(window as unknown as { oldWorkflow: () => void }).oldWorkflow = (
      node as unknown as Record<string, { onClick: () => void }>
    )[k].onClick
  })
  await button.click()
  await expect(page.getByLabel("Workflow evidence inspector")).toContainText("NODE-001")
  await button.click()
  await button.click()
  await expect(page.getByLabel("Workflow evidence inspector")).toContainText("NODE-001")
  await page
    .getByRole("button", { name: "Inspect NODE-002: Inspect recorded tool", exact: true })
    .click()
  await page.evaluate(() => (window as unknown as { oldWorkflow: () => void }).oldWorkflow())
  await expect(page.getByLabel("Workflow evidence inspector")).toContainText("NODE-002")
  await page.getByRole("button", { name: "Zoom in review", exact: true }).click()
  await expect(page.getByLabel("Workflow canvas review panel")).toContainText("75%")
  await expect(page.getByLabel("Workflow evidence inspector")).toContainText(
    "No evidence inspected",
  )
  await page.getByRole("button", { name: "Replace workflow source copy", exact: true }).click()
  await page.evaluate(() => (window as unknown as { oldWorkflow: () => void }).oldWorkflow())
  await expect(page.getByLabel("Workflow canvas review panel")).toContainText("No selection")
  await page
    .getByRole("button", { name: "Inspect NODE-003: Review recorded result", exact: true })
    .click()
  await expect(page.getByLabel("Workflow evidence inspector")).toContainText("NODE-003")
  await page.getByText("Fixture timeline review", { exact: true }).click()
  const frames = timelineFrames(sourceDataset("populated"))
  await page.getByLabel("Playback position").fill(String(frames.indexOf("2026-10-04T14:14:15Z")))
  await expect(
    page.getByText("Workflow not observed through this cutoff", { exact: true }),
  ).toBeVisible()
  await page.evaluate(() => (window as unknown as { oldWorkflow: () => void }).oldWorkflow())
  await expect(page.getByLabel("Workflow evidence inspector")).toHaveCount(0)
  await page.getByLabel("Playback position").fill(String(frames.indexOf("2026-10-04T14:15:15Z")))
  await page
    .getByRole("button", { name: "Inspect NODE-002: Inspect recorded tool", exact: true })
    .click()
  await expect(page.getByLabel("Workflow evidence inspector")).toContainText("RUN-003 · running")
  await expect(page.getByLabel("Workflow evidence inspector")).toContainText(
    "USAGE-003 · 3812 tokens",
  )
})
test("390 dark workflow native inspection and specimen geometry stays within one page-scroll", async ({
  page,
}, info) => {
  const bad: string[] = []
  page.on("request", (r) => {
    if (r.method() !== "GET" || !["localhost", "127.0.0.1"].includes(new URL(r.url()).hostname))
      bad.push(r.url())
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/?view=Workflow%20Review&theme=p1-green-phosphor&navigation=drawer")
  await page.getByLabel("Workflow review appearance").selectOption("long-content")
  await page.getByRole("button", { name: /Inspect NODE-001:/ }).click()
  const toolbar = page.getByLabel("Selected node toolbar")
  await expect(toolbar).toBeVisible()
  expect(
    await toolbar.evaluate((e) => {
      const t = e.getBoundingClientRect()
      const c = document.querySelector(".workflow-review-canvas")?.getBoundingClientRect()
      return (
        !!c &&
        t.width > 0 &&
        t.height > 0 &&
        t.left >= c.left &&
        t.right <= c.right &&
        t.top >= c.top &&
        t.bottom <= c.bottom
      )
    }),
  ).toBe(true)
  await page.getByLabel("Recorded workflow canvas").scrollIntoViewIfNeeded()
  await page.screenshot({
    path: info.outputPath("workflow-review-canvas-narrow.png"),
    animations: "disabled",
  })

  await page.getByRole("button", { name: /Inspect NODE-002:/ }).focus()
  await page.getByRole("button", { name: /Inspect NODE-002:/ }).press("Enter")
  await page.getByLabel("Workflow evidence inspector").scrollIntoViewIfNeeded()
  await page.screenshot({
    path: info.outputPath("workflow-review-inspector-narrow.png"),
    animations: "disabled",
  })
  await page.getByLabel("Authored connection and edge specimens").scrollIntoViewIfNeeded()
  await page.screenshot({
    path: info.outputPath("workflow-review-specimens-narrow.png"),
    animations: "disabled",
  })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(
    await page.locator(".workflow-review svg.workflow-specimen-svg").evaluateAll((ns) =>
      ns.every((n) => {
        const b = n.getBoundingClientRect()
        return b.width > 0 && b.height > 0 && b.left >= 0 && b.right <= innerWidth
      }),
    ),
  ).toBe(true)
  await page.emulateMedia({ reducedMotion: "reduce" })
  expect(
    await page
      .getByTestId("animated-specimen")
      .locator(".wf-edge-traveller")
      .evaluate((e) => getComputedStyle(e).display),
  ).toBe("none")
  await expect(
    page.locator(
      ".workflow-specimen-svg .wf-connection path, .workflow-specimen-svg .react-flow__edge-path",
    ),
  ).toHaveCount(3)
  expect(
    await page
      .locator(
        ".workflow-specimen-svg .wf-connection path, .workflow-specimen-svg .react-flow__edge-path",
      )
      .evaluateAll((nodes) =>
        nodes.every((n) => {
          const s = getComputedStyle(n)
          return (
            s.stroke !== "none" &&
            s.stroke !== "transparent" &&
            s.stroke !== "rgba(0, 0, 0, 0)" &&
            Number.parseFloat(s.strokeWidth) > 0 &&
            Number.parseFloat(s.strokeOpacity) > 0 &&
            Number.parseFloat(s.opacity) > 0
          )
        }),
      ),
  ).toBe(true)
  await expect(page.getByTestId("page-scroll")).toHaveCount(1)
  await expect(page.locator("html")).toHaveAttribute("data-theme", "p1-green-phosphor")
  expect(bad).toEqual([])
})
test("portable workflow shares readonly supported empty blocked unknown and current source joins without API requests", async ({
  page,
}) => {
  const requests: string[] = []
  page.on("request", (r) => {
    if (/\/(api|plugins)\//.test(r.url())) requests.push(r.url())
  })
  for (const name of [
    "empty",
    "loading",
    "read-failure",
    "denied",
    "before-evidence",
    "incompatible-source",
  ]) {
    await page.goto(
      `http://127.0.0.1:18542/iframe.html?id=developer-workflow-review--${name}&viewMode=story`,
    )
    await expect(page.locator(".react-flow__node")).toHaveCount(0)
    await expect(page.getByTestId("animated-specimen")).toHaveCount(0)
  }
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=developer-workflow-review--unknown-kind&viewMode=story",
  )
  await expect(
    page.getByText("Unknown authored kind: unrecognized-fixture-step", { exact: true }),
  ).toBeVisible()
  await page.getByRole("button", { name: /Inspect NODE-003:/ }).click()
  await expect(page.getByLabel("Workflow evidence inspector")).toContainText(
    "unrecognized-fixture-step",
  )
  await page.getByLabel("Workflow review appearance").selectOption("locked")
  await expect(page.getByLabel("Workflow evidence inspector")).toContainText(
    "No evidence inspected",
  )
  expect(requests).toEqual([])
})
