import { readFileSync } from "node:fs"
import { expect, test } from "@playwright/test"
import { sourceDataset, timelineFrames } from "../src/playback/model"
import {
  destinations,
  matchDestinations,
  normalizeView,
  storyDestination,
} from "../src/workbench/catalog"

test("finite catalogue validates35 route icon scope and representative story destinations without discovery", () => {
  expect(destinations).toHaveLength(35)
  expect(new Set(destinations.map((d) => d.id)).size).toBe(35)
  const stories = JSON.parse(
    readFileSync(new URL("../../.scratch/storybook/index.json", import.meta.url), "utf8"),
  ).entries
  for (const d of destinations) {
    expect(stories[d.story], d.story).toBeDefined()
    expect(d.source.length).toBeGreaterThan(5)
    expect(d.gap.length).toBeGreaterThan(10)
    expect(normalizeView(d.id)).toBe(d.id)
  }
  expect(normalizeView(null)).toBe("Activity")
  expect(normalizeView("not-declared")).toBe("Activity")
  expect(normalizeView("Review Workbench")).toBe("Review Workbench")
  for (const host of [
    "parallax.nanite.cloud",
    "parallax.os.nanite.cloud",
    "parallax-stories.nanite.cloud",
    "192.168.1.195:18441",
    "100.112.71.40:18441",
  ])
    expect(storyDestination(host, destinations[0].story)).toMatch(
      /^https:\/\/parallax-stories.nanite.cloud\/iframe.html\?/,
    )
  for (const host of ["127.0.0.1:18541", "localhost:18545", "127.0.0.1:18542"])
    expect(storyDestination(host, destinations[0].story)).toContain("127.0.0.1:18542")
  for (const host of ["localhost:18441", "localhost:5173"])
    expect(storyDestination(host, destinations[0].story)).toContain("localhost:18442")
  expect(storyDestination("parallax.nanite.cloud.evil", destinations[0].story)).toBeNull()
  expect(storyDestination("parallax.nanite.cloud", "unknown-story")).toBeNull()
})
test("native Workbench sequential search groups keyboard local navigation and readonly story URL remain coherent", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto("/")
  await page.getByRole("button", { name: "Open Review Workbench", exact: true }).click()
  await expect(page.getByRole("heading", { name: "Review Workbench", exact: true })).toBeVisible()
  await expect(page.locator(".workbench-grid article")).toHaveCount(35)
  await page.screenshot({ path: info.outputPath("workbench-desktop.png"), animations: "disabled" })
  await page.keyboard.press("/")
  const search = page.getByRole("searchbox", { name: "Search review destinations", exact: true })
  await expect(search).toBeFocused()
  await search.pressSequentially("receipt")
  await expect(search).toHaveValue("receipt")
  await expect(search).toBeFocused()
  await expect(page.locator(".workbench-grid article")).toHaveCount(
    matchDestinations("receipt", "All").length,
  )
  await page.getByLabel("Review group", { exact: true }).selectOption("Evidence")
  await expect(page.locator(".workbench-grid article")).toHaveCount(
    matchDestinations("receipt", "Evidence").length,
  )
  const link = page.getByRole("link", { name: "Portable Usage Evidence story", exact: true })
  await expect(link).toHaveAttribute(
    "href",
    storyDestination("127.0.0.1:18541", "chat-usage-evidence--recorded")!,
  )
  await page.getByRole("button", { name: "Open Usage Evidence", exact: true }).focus()
  await page.keyboard.press("Enter")
  await expect(page.getByRole("heading", { name: "Usage Evidence", exact: true })).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Usage Evidence", exact: true }).locator("svg"),
  ).toHaveCount(1)
  await page.getByRole("button", { name: "Open Review Workbench", exact: true }).click()
  await page
    .getByRole("searchbox", { name: "Search review destinations", exact: true })
    .fill("missing-destination")
  await expect(
    page.getByText("No matching review destinations. Clear the search or choose another group."),
  ).toBeVisible()
  await page.getByRole("button", { name: "Reset workbench filters", exact: true }).click()
  await expect(page.locator(".workbench-grid article")).toHaveCount(35)
})
test("Workbench pauses current prefix while ordinary playback navigation and selected admitted evidence survive", async ({
  page,
}) => {
  await page.goto("/")
  await page.getByRole("button", { name: /Review gateway permission/ }).click()
  await page.keyboard.press("Escape")
  await page.getByText("Fixture timeline review", { exact: true }).click()
  const frames = timelineFrames(sourceDataset("populated")),
    index = frames.indexOf("2026-10-04T14:15:15Z")
  await page.getByLabel("Playback position").fill(String(index))
  await page.clock.install()
  await page.getByRole("button", { name: "Play recorded events", exact: true }).click()
  await page.getByRole("button", { name: "Usage", exact: true }).click()
  await expect(page.getByRole("button", { name: "Pause playback", exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Open Review Workbench", exact: true }).click()
  await expect(
    page.getByRole("button", { name: "Play recorded events", exact: true }),
  ).toBeVisible()
  await expect(page.getByLabel("Playback position")).toHaveValue(String(index))
  await expect(page.getByLabel("Review destination catalogue")).toContainText(
    "2026-10-04T14:15:15Z",
  )
  await expect(page.getByLabel("Review destination catalogue")).toContainText("TASK-001 / RUN-001")
  await page.clock.runFor(2000)
  await expect(page.getByLabel("Playback position")).toHaveValue(String(index))
  await page.getByRole("button", { name: "Open Activity", exact: true }).click()
  await expect(page.getByRole("region", { name: "Selected run" })).toContainText(
    "TASK-001 / RUN-001",
  )
})
test("known URL reload and unknown route fallback preserve declared settings under snapshot policy", async ({
  page,
}) => {
  await page.goto(
    "/?view=Run%20Explorer&scenario=large&theme=hi-contrast&mode=light&layout=table&navigation=drawer",
  )
  await page.getByRole("button", { name: "Open Review Workbench", exact: true }).click()
  await page.reload()
  await expect(page.getByRole("heading", { name: "Review Workbench", exact: true })).toBeVisible()
  await expect(page.getByLabel("Scenario", { exact: true })).toHaveValue("large")
  await expect(page.getByLabel("Theme", { exact: true })).toHaveValue("hi-contrast")
  expect(new URL(page.url()).searchParams.get("layout")).toBe("table")
  expect(new URL(page.url()).searchParams.get("navigation")).toBe("drawer")
  await expect(page.getByLabel("Review destination catalogue")).toContainText(
    "No current record selected",
  )
  await page.goto("/?view=not-declared&scenario=populated")
  await expect(page.getByRole("heading", { name: "Activity", exact: true })).toBeVisible()
  await expect(
    page.getByText("Unknown requested view not-declared; showing Activity."),
  ).toBeVisible()
  await expect.poll(() => new URL(page.url()).searchParams.get("view")).toBe("Activity")
})
test("source filter phase and unmount native callbacks retire while390dark cards remain reachable bounded", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(
    "http://127.0.0.1:18545/?view=Review%20Workbench&theme=p1-green-phosphor&navigation=drawer",
  )
  const node = page.getByRole("button", { name: "Open Voice", exact: true })
  await node.evaluate((node) => {
    const key = Object.keys(node).find((k) => k.startsWith("__reactProps$"))
    if (!key) throw Error("Missing callback")
    ;(window as unknown as { oldWorkbench: () => void }).oldWorkbench = (
      node as unknown as Record<string, { onClick: () => void }>
    )[key].onClick
  })
  await page.getByLabel("Review group", { exact: true }).selectOption("Developer")
  await page.evaluate(() => (window as unknown as { oldWorkbench: () => void }).oldWorkbench())
  await expect(page.getByRole("heading", { name: "Review Workbench", exact: true })).toBeVisible()
  await expect(page.locator(".workbench-grid article")).toHaveCount(3)
  const card = page.getByRole("article", {
    name: "Developer Evidence review destination",
    exact: true,
  })
  await card.evaluate((n) => {
    const root = document.querySelector('[data-testid="page-scroll"]')
    if (!root) throw Error("Missing scroll")
    root.scrollTop += n.getBoundingClientRect().top - root.getBoundingClientRect().top
  })
  await page.screenshot({
    path: info.outputPath("workbench-developer-narrow.png"),
    animations: "disabled",
  })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(
    await card.evaluate(
      (n) => n.getBoundingClientRect().width > 200 && n.scrollWidth <= n.clientWidth + 1,
    ),
  ).toBe(true)
  await page.getByLabel("Scenario", { exact: true }).selectOption("empty")
  await page.evaluate(() => (window as unknown as { oldWorkbench: () => void }).oldWorkbench())
  await expect(page.locator(".workbench-grid article")).toHaveCount(35)
  await page.getByRole("button", { name: "Open Usage Evidence", exact: true }).click()
  await page.evaluate(() => (window as unknown as { oldWorkbench: () => void }).oldWorkbench())
  await expect(page.getByRole("heading", { name: "Usage Evidence", exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Open Review Workbench", exact: true }).click()
  await page.getByLabel("Review group", { exact: true }).selectOption("Evidence")
  await page.getByRole("button", { name: "Open Usage Evidence", exact: true }).focus()
  await page.keyboard.press("Enter")
  await expect(page.getByRole("heading", { name: "Usage Evidence", exact: true })).toBeVisible()
})
test("portable catalogue controlled navigation and actual native representative story links avoid app/plugin API", async ({
  page,
}) => {
  const bad: string[] = []
  page.on("request", (r) => {
    if (/\/api\/|\/plugins\//.test(r.url()) || r.method() !== "GET") bad.push(r.url())
  })
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=workbench-review-catalogue--operations&viewMode=story",
  )
  await expect(page.locator(".workbench-grid article")).toHaveCount(
    matchDestinations("", "Operations").length,
  )
  await page.getByRole("button", { name: "Open Activity", exact: true }).click()
  await expect(page.getByText(/Controlled local destination: Activity/)).toBeVisible()
  await page.getByRole("link", { name: "Portable Activity story", exact: true }).click()
  await expect(page.getByText("24-hour execution pulse", { exact: false })).toBeVisible()
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=workbench-review-catalogue--unknown-host&viewMode=story",
  )
  await expect(page.locator(".workbench-grid a")).toHaveCount(0)
  await expect(
    page.getByText("Portable story link unavailable for this host.", { exact: true }),
  ).toHaveCount(35)
  expect(bad).toEqual([])
})
