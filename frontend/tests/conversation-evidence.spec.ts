import { expect, test } from "@playwright/test"
import {
  conversationEvidenceModel,
  recordedToolState,
  sessionEvidence,
  specimenOutcome,
} from "../src/conversation-evidence/model"
import { operationsModel } from "../src/operations/model"
import { sourceDataset, timelineFrames } from "../src/playback/model"

test("conversation current tool messages receipt and clock-gated metadata preserve immutable supplied evidence", () => {
  const source = sourceDataset("populated"),
    encoded = JSON.stringify(source)
  const prefix = sessionEvidence(
    conversationEvidenceModel(operationsModel("populated", "", { cutoff: "2026-10-04T14:10:30Z" })),
    "SESSION-001",
  )
  expect(prefix?.tools[0].status).toBe("running")
  expect(prefix?.tools[0].finished).toBeNull()
  expect(prefix?.metadata).toBeUndefined()
  expect(prefix?.receipt).toBeUndefined()
  expect(prefix?.messages.every((m) => m.time <= "2026-10-04T14:10:30Z")).toBe(true)
  const finished = sessionEvidence(
    conversationEvidenceModel(operationsModel("populated", "", { cutoff: "2026-10-04T14:11:15Z" })),
    "SESSION-001",
  )
  expect(finished?.tools[0].status).toBe("done")
  expect(finished?.tools[0].output).toContain("Review remains active")
  expect(finished?.metadata).toBeUndefined()
  const snapshot = sessionEvidence(
    conversationEvidenceModel(operationsModel("populated")),
    "SESSION-001",
  )
  expect(snapshot?.metadata?.id).toBe("CHAT-001")
  expect(snapshot?.contact?.id).toBe("CONTACT-001")
  expect(snapshot?.provenance).toHaveLength(3)
  expect(
    sessionEvidence(conversationEvidenceModel(operationsModel("large")), "SESSION-001"),
  ).toBeNull()
  expect(
    sessionEvidence(
      conversationEvidenceModel(operationsModel("populated"), "denied"),
      "SESSION-001",
    ),
  ).toBeNull()
  expect(recordedToolState("external-status")).toBeNull()
  expect(specimenOutcome("absent")).toBeUndefined()
  expect(specimenOutcome("null")).toBeNull()
  expect(specimenOutcome("zero")).toBe(0)
  expect(JSON.stringify(source)).toBe(encoded)
})
test("actual native tool explanation and provenance disclosures remain readonly truthful and rendered", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto("/?view=Conversation%20Evidence&mode=light")
  const tool = page.getByRole("button", { name: /Recorded TOOL-001: fixture.inspect/ })
  await expect(tool).toContainText("Completed")
  await tool.focus()
  await tool.press("Enter")
  await expect(tool).toHaveAttribute("aria-expanded", "false")
  await expect(
    page.getByRole("button", { name: "Inspect recorded TOOL-001", exact: true }),
  ).not.toBeVisible()
  await tool.press("Enter")
  await expect(page.getByLabel("Recorded TOOL-001")).toContainText("Bundled evidence / TASK-001")
  await expect(page.getByLabel("Recorded TOOL-001")).toContainText(
    "Review remains active after the first fixture inspection.",
  )
  const reasoning = page.getByRole("button", {
    name: "Authored explanation · duration unavailable",
    exact: true,
  })
  await reasoning.focus()
  await reasoning.press("Enter")
  await expect(reasoning).toHaveAttribute("aria-expanded", "false")
  await reasoning.press("Enter")
  await expect(
    page.getByText(/Authored review rationale: compare the bundled context/),
  ).toBeVisible()
  const sources = page.getByRole("button", { name: "3 supplied provenance records", exact: true })
  await sources.focus()
  await sources.press("Enter")
  await expect(sources).toHaveAttribute("aria-expanded", "false")
  await sources.press("Enter")
  const section = page.getByLabel("Authored explanation and supplied provenance")
  await expect(section.locator("a")).toHaveCount(0)
  await expect(section).toContainText("USAGE-001")
  await page.getByLabel("Explanation duration specimen").selectOption("zero")
  await expect(
    page.getByRole("button", {
      name: "Authored explanation · supplied duration sample 0s",
      exact: true,
    }),
  ).toBeVisible()
  await page.getByLabel("Explanation duration specimen").selectOption("missing")
  await expect(
    page.getByRole("button", { name: "Authored explanation · duration unavailable", exact: true }),
  ).toBeVisible()
  await expect(section).not.toContainText("few seconds")
  await expect(section.locator('[data-slot="shimmer"]')).toHaveCount(0)
  const dimensions = await page.getByLabel("Recorded TOOL-001").evaluate((e) => {
    const r = e.getBoundingClientRect()
    return { width: r.width, height: r.height }
  })
  expect(dimensions.width).toBeGreaterThan(0)
  expect(dimensions.height).toBeGreaterThan(0)
  await page.getByLabel("Admitted conversation sessions").scrollIntoViewIfNeeded()
  await page.screenshot({
    path: info.outputPath("conversation-evidence-desktop.png"),
    animations: "disabled",
  })
  await expect(
    page.getByRole("button", { name: /^(Copy|Send|Approve|Save|Download|Run)$/ }),
  ).toHaveCount(0)
})
test("seven native authored tool headers and absent null zero error and inert outcomes are distinct supported inputs", async ({
  page,
}, info) => {
  await page.goto("/?view=Conversation%20Evidence&mode=light")
  const specimen = page.getByLabel("Authored tool state specimen")
  const values: [string, string][] = [
    ["pending", "Pending"],
    ["running", "Running"],
    ["awaiting-confirmation", "Awaiting confirmation"],
    ["confirmed", "Confirmed"],
    ["completed", "Completed"],
    ["denied", "Denied"],
    ["error", "Error"],
  ]
  const colors: string[] = []
  for (const [state, label] of values) {
    await page.getByLabel("Authored tool specimen phase").selectOption(state)
    await expect(specimen.getByRole("button", { name: /Authored specimen/ })).toContainText(label)
    colors.push(
      await specimen
        .locator("button svg")
        .nth(1)
        .evaluate((e) => getComputedStyle(e).color),
    )
  }
  expect(new Set(colors).size).toBeGreaterThan(1)
  await page.getByLabel("Authored tool specimen phase").selectOption("completed")
  await page.getByLabel("Authored tool specimen outcome").selectOption("absent")
  await expect(specimen.getByRole("heading", { name: "Result", exact: true })).toHaveCount(0)
  await page.getByLabel("Authored tool specimen outcome").selectOption("null")
  await expect(specimen.getByRole("heading", { name: "Result", exact: true })).toBeVisible()
  await expect(specimen.locator("pre").last()).toContainText("null")
  await page.getByLabel("Authored tool specimen outcome").selectOption("zero")
  await expect(specimen.locator("pre").last()).toContainText("0")
  await page.getByLabel("Authored tool specimen outcome").selectOption("inert-text")
  await expect(specimen.locator("pre").last()).toContainText(
    "<script>inert authored example</script>",
  )
  await expect(specimen.locator("a,script")).toHaveCount(0)
  await specimen.scrollIntoViewIfNeeded()
  await page.screenshot({
    path: info.outputPath("conversation-evidence-specimens-desktop.png"),
    animations: "disabled",
  })
  await page.getByLabel("Authored tool specimen phase").selectOption("unknown")
  await expect(specimen.getByRole("status")).toContainText("future-tool-resolution")
  await expect(specimen.getByRole("button", { name: /Authored specimen/ })).toHaveCount(0)
})
test("actual StrictMode repeated selection and captured inspection refuse session phase disclosure source and cutoff retirement", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:18545/?view=Conversation%20Evidence")
  const inspect = page.getByRole("button", { name: "Inspect recorded TOOL-001", exact: true })
  await inspect.evaluate((node) => {
    const k = Object.keys(node).find((k) => k.startsWith("__reactProps$"))
    if (!k) throw Error("Missing current callback")
    ;(window as unknown as { oldConversation: () => void }).oldConversation = (
      node as unknown as Record<string, { onClick: () => void }>
    )[k].onClick
  })
  await inspect.click()
  await inspect.click()
  await expect(page.getByLabel("Recorded tool inspector")).toContainText(
    "TOOL-001: read-only recorded evidence",
  )
  await page.getByRole("button", { name: "SESSION-002 · RUN-002", exact: true }).click()
  await page.evaluate(() =>
    (window as unknown as { oldConversation: () => void }).oldConversation(),
  )
  await expect(page.getByLabel("Recorded tool inspector")).toContainText(
    "No tool evidence inspected",
  )
  await page.getByRole("button", { name: "Inspect recorded TOOL-002", exact: true }).click()
  await page
    .getByRole("button", { name: "Inspect recorded TOOL-002", exact: true })
    .evaluate((node) => {
      const k = Object.keys(node).find((k) => k.startsWith("__reactProps$"))
      if (!k) throw Error("Missing current callback")
      ;(window as unknown as { phaseConversation: () => void }).phaseConversation = (
        node as unknown as Record<string, { onClick: () => void }>
      )[k].onClick
    })
  await page.getByLabel("Authored tool specimen phase").selectOption("pending")
  await page.evaluate(() =>
    (window as unknown as { phaseConversation: () => void }).phaseConversation(),
  )
  await expect(page.getByLabel("Recorded tool inspector")).toContainText(
    "No tool evidence inspected",
  )
  await page
    .getByRole("button", { name: "Replace conversation evidence source", exact: true })
    .click()
  await page.evaluate(() =>
    (window as unknown as { oldConversation: () => void }).oldConversation(),
  )
  await expect(page.getByLabel("Recorded tool inspector")).toContainText(
    "No tool evidence inspected",
  )
  await page.getByText("Fixture timeline review", { exact: true }).click()
  const frames = timelineFrames(sourceDataset("populated"))
  await page.getByLabel("Playback position").fill(String(frames.indexOf("2026-10-04T14:10:15Z")))
  await expect(page.getByLabel("Recorded TOOL-001")).toContainText(
    "No finish observed; output unavailable",
  )
  await expect(
    page.getByLabel("Recorded TOOL-001").getByRole("heading", { name: "Result", exact: true }),
  ).toHaveCount(0)
  await expect(page.getByLabel("Admitted conversation sessions")).toContainText(
    "Communication metadata unavailable through this cutoff",
  )
  await page.getByLabel("Playback position").fill(String(frames.indexOf("2026-10-04T14:11:15Z")))
  await expect(page.getByLabel("Recorded TOOL-001")).toContainText(
    "Review remains active after the first fixture inspection.",
  )
  await expect(page.getByLabel("Admitted conversation sessions")).not.toContainText(
    "Adaline Rivera",
  )
  await page.getByLabel("Playback position").fill(String(frames.indexOf("2026-10-04T14:30:00Z")))
  await expect(page.getByLabel("Admitted conversation sessions")).toContainText(
    "CHAT-001 · Adaline Rivera",
  )
})
test("390 dark long transcript explanation and literal specimen remain bounded in one page scroll", async ({
  page,
}, info) => {
  const bad: string[] = []
  page.on("request", (r) => {
    if (r.method() !== "GET" || !["localhost", "127.0.0.1"].includes(new URL(r.url()).hostname))
      bad.push(r.url())
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/?view=Conversation%20Evidence&theme=p1-green-phosphor&navigation=drawer")
  await page.getByLabel("Conversation evidence appearance").selectOption("long-content")
  await page.getByRole("button", { name: "Inspect recorded TOOL-001", exact: true }).focus()
  await page.getByRole("button", { name: "Inspect recorded TOOL-001", exact: true }).press("Enter")
  await page.getByLabel("Recorded messages and tools").scrollIntoViewIfNeeded()
  await page.screenshot({
    path: info.outputPath("conversation-evidence-transcript-narrow.png"),
    animations: "disabled",
  })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(
    await page
      .locator(".conversation-evidence pre")
      .evaluateAll((ns) =>
        ns.every((n) => n.getBoundingClientRect().width > 0 && n.scrollWidth <= n.clientWidth + 1),
      ),
  ).toBe(true)
  await page.getByLabel("Conversation evidence appearance").selectOption("recorded")
  await page.getByLabel("Authored explanation and supplied provenance").evaluate((target) => {
    const root = document.querySelector('[data-testid="page-scroll"]')
    if (!root) throw Error("Missing page scroll")
    root.scrollTop += target.getBoundingClientRect().top - root.getBoundingClientRect().top
  })
  await page.screenshot({
    path: info.outputPath("conversation-evidence-provenance-narrow.png"),
    animations: "disabled",
  })
  await page.getByLabel("Authored tool specimen outcome").selectOption("inert-text")
  await page.getByLabel("Authored tool state specimen").evaluate((target) => {
    const root = document.querySelector('[data-testid="page-scroll"]')
    if (!root) throw Error("Missing page scroll")
    root.scrollTop += target.getBoundingClientRect().top - root.getBoundingClientRect().top
  })
  await expect(page.getByLabel("Authored tool state specimen").locator("pre").last()).toBeVisible()
  await page.screenshot({
    path: info.outputPath("conversation-evidence-specimens-narrow.png"),
    animations: "disabled",
  })
  await page
    .getByLabel("Authored tool state specimen")
    .getByRole("button", { name: /Authored specimen/ })
    .evaluate((target) => {
      const root = document.querySelector('[data-testid="page-scroll"]')
      if (!root) throw Error("Missing page scroll")
      root.scrollTop += target.getBoundingClientRect().top - root.getBoundingClientRect().top
    })
  await page.screenshot({
    path: info.outputPath("conversation-evidence-specimen-values-narrow.png"),
    animations: "disabled",
  })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(
    await page
      .locator(".conversation-evidence pre")
      .evaluateAll((ns) =>
        ns.every((n) => n.getBoundingClientRect().width > 0 && n.scrollWidth <= n.clientWidth + 1),
      ),
  ).toBe(true)
  await expect(page.getByTestId("page-scroll")).toHaveCount(1)
  await expect(page.locator("html")).toHaveAttribute("data-theme", "p1-green-phosphor")
  expect(bad).toEqual([])
})
test("portable conversation evidence shares blocked empty unknown and receipt-prefix contracts without APIs", async ({
  page,
}) => {
  const requests: string[] = []
  page.on("request", (r) => {
    if (/\/(api|plugins)\//.test(r.url())) requests.push(r.url())
  })
  for (const name of ["empty", "loading", "read-failure", "denied", "incompatible-source"]) {
    await page.goto(
      `http://127.0.0.1:18542/iframe.html?id=chat-conversation-evidence--${name}&viewMode=story`,
    )
    await expect(page.getByLabel("Recorded messages and tools")).toHaveCount(0)
    await expect(page.getByLabel("Authored tool state specimen")).toHaveCount(0)
  }
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=chat-conversation-evidence--before-tool-finish&viewMode=story",
  )
  await expect(page.getByLabel("Recorded TOOL-001")).toContainText(
    "No recorded outcome admitted through this cutoff",
  )
  await expect(page.getByLabel("Admitted conversation sessions")).toContainText(
    "Communication metadata unavailable through this cutoff",
  )
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=chat-conversation-evidence--unknown-tool-state&viewMode=story",
  )
  await expect(page.getByRole("status")).toContainText("ToolHeader withheld")
  await page.getByLabel("Conversation evidence appearance").selectOption("locked")
  await expect(
    page.getByText(
      "Locked evidence is read-only; local navigation and disclosures remain available.",
      { exact: true },
    ),
  ).toBeVisible()
  await page.getByRole("button", { name: "SESSION-004 · RUN-004", exact: true }).click()
  await expect(page.getByLabel("Admitted conversation sessions")).toContainText(
    "Communication metadata not supplied for this session",
  )
  expect(requests).toEqual([])
})
