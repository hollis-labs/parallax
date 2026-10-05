import { expect, test } from "@playwright/test"
import { inspectionModel } from "../src/observability/model"
import { operationsModel, runDetail } from "../src/operations/model"
import { projectDataset, sourceDataset, timelineFrames } from "../src/playback/model"

test("ordered deterministic evidence frames preserve every cutoff relationship", () => {
  for (const scenario of ["populated", "large"]) {
    const source = sourceDataset(scenario),
      frames = timelineFrames(source)
    expect(frames).toEqual(timelineFrames(source))
    expect([...new Set(frames)]).toEqual(frames)
    expect(frames).toEqual([...frames].sort())
    expect(frames.at(-1)).toBe(source.clock)
    for (const cutoff of frames) {
      const data = projectDataset(source, cutoff)
      expect(JSON.stringify(data)).toBe(JSON.stringify(projectDataset(source, cutoff)))
      expect(
        data.runs.every((r) => r.started <= cutoff && (!r.finished || r.finished <= cutoff)),
      ).toBeTruthy()
      expect(
        data.toolCalls.every(
          (t) => t.started <= cutoff && (t.finished ? t.finished <= cutoff : t.output === null),
        ),
      ).toBeTruthy()
      expect(
        [data.messages, data.logs, data.events, data.usage].every((rows) =>
          rows.every((r) => r.time <= cutoff),
        ),
      ).toBeTruthy()
      expect(
        data.tasks.every((t) => {
          const receipt = data.usage.find((u) => u.runId === t.runId)
          return t.tokens === (receipt?.tokens ?? null) && t.cost === (receipt?.cost ?? null)
        }),
      ).toBeTruthy()
    }
  }
  for (const override of ["loading", "error", "unavailable"] as const) {
    const missing = operationsModel("populated", "", { override })
    expect(missing.stats.tokens).toBeNull()
    expect(missing.stats.cost).toBeNull()
    expect(missing.stats.count).toBeNull()
  }
  const before = runDetail(
    operationsModel("populated", "", { cutoff: "2026-10-04T14:14:15Z" }),
    "TASK-003",
  )
  expect(before?.run.status).toBe("running")
  expect(before?.task.status).toBe("running")
  expect(before?.task.narrative).not.toContain("Previous run failed")
  expect(before?.usage).toBeUndefined()
  expect(before?.messages.map((m) => m.role)).toEqual(["user"])
  expect(before?.toolCalls[0].output).toBeNull()
  const finished = runDetail(
    operationsModel("populated", "", { cutoff: "2026-10-04T14:15:30Z" }),
    "TASK-003",
  )
  expect(finished?.run.status).toBe("failed")
  expect(finished?.task.status).toBe("running")
  const blocked = runDetail(
    operationsModel("populated", "", { cutoff: "2026-10-04T14:15:35Z" }),
    "TASK-003",
  )
  expect(blocked?.task.status).toBe("blocked")
  const early = inspectionModel("normal", "", "all", "2026-10-04T14:15:30Z")
  expect(early.health).toBe("unknown")
  expect(early.diagnostic).toBeNull()
  expect(early.observations.health.observedAt).toBeUndefined()
  expect(
    inspectionModel("normal", "", "all", "2026-09-30T14:30:00Z", {}, true).outOfCoverage,
  ).toBeTruthy()
  expect(
    inspectionModel("normal", "", "all", "2026-10-04T14:30:00Z", {}, true, "records-80").accessible,
  ).toBeFalsy()
  expect(() => projectDataset(sourceDataset("populated"), "2027-01-01T00:00:00Z")).toThrow()
})
test("controlled play pause seek reset end source and detail progression", async ({
  page,
}, info) => {
  await page.goto("/?view=Layouts&layout=split")
  await page.getByText("Fixture timeline review", { exact: true }).click()
  await page.clock.install()
  const frames = timelineFrames(sourceDataset("populated")),
    seek = async (cutoff: string) =>
      page.getByLabel("Playback position").fill(String(frames.indexOf(cutoff)))
  await seek("2026-10-04T14:14:15Z")
  await page.getByRole("button", { name: /Inspect telemetry sampling drift.*TASK-003/ }).click()
  const detail = page.getByLabel("Comparison selected record")
  await expect(detail).toContainText("RUN-003 · running")
  await expect(detail).toContainText("Fixture output: Not observed through this cutoff")
  await page.getByRole("button", { name: "Play recorded events", exact: true }).click()
  await page.clock.runFor(1500)
  await expect(detail).toContainText("TASK-003")
  await page.getByRole("button", { name: "Pause playback", exact: true }).click()
  const paused = await page.getByTestId("playback-cutoff").textContent()
  await page.clock.runFor(3000)
  await expect(page.getByTestId("playback-cutoff")).toHaveText(paused!)
  await seek("2026-10-04T14:15:30Z")
  await expect(detail).toContainText("RUN-003 · failed")
  await expect(detail).toContainText("TASK-003 · running")
  await page.getByRole("button", { name: "Step recorded event", exact: true }).click()
  await expect(detail).toContainText("TASK-003 · blocked")
  await page.screenshot({
    path: info.outputPath("playback-split-frame.png"),
    animations: "disabled",
  })
  await page.getByRole("button", { name: "Open detail drawer", exact: true }).click()
  await expect(page.getByRole("dialog")).toContainText("TASK-003 · blocked")
  await page.screenshot({
    path: info.outputPath("playback-cutoff-inspector.png"),
    animations: "disabled",
  })
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: "Reset playback", exact: true }).click()
  await expect(page.getByLabel("Comparison selected record")).toHaveCount(0)
  await expect(page.getByTestId("playback-cutoff")).toHaveText(frames[0])
  await page.clock.runFor(3000)
  await expect(page.getByTestId("playback-cutoff")).toHaveText(frames[0])
  await page.getByLabel("Playback position").fill(String(frames.length - 2))
  await page.getByRole("button", { name: "Play recorded events", exact: true }).click()
  await page.clock.runFor(1000)
  await expect(page.getByTestId("playback-cutoff")).toHaveText(frames.at(-1)!)
  await expect(
    page.getByRole("button", { name: "Play recorded events", exact: true }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Play recorded events", exact: true }).click()
  await page.getByLabel("Scenario").selectOption("large")
  await page.clock.runFor(3000)
  await expect(page.getByTestId("playback-cutoff")).toHaveText(sourceDataset("large").clock)
  await expect(
    page.getByRole("button", { name: "Play recorded events", exact: true }),
  ).toBeVisible()
})
test("cursor retirement fences real plugin/observation producers and truthful overrides", async ({
  page,
}) => {
  await page.goto("/")
  await expect(page.getByLabel("Plugin widget")).toContainText("8 fixture records")
  await page.getByText("Fixture timeline review", { exact: true }).click()
  await page.getByRole("button", { name: "Simulate plugin review" }).click()
  await expect(page.getByLabel("Plugin simulation receipts")).toContainText("pending")
  await page.getByRole("button", { name: "Reset playback", exact: true }).click()
  await page.getByRole("button", { name: "Complete scripted outcome" }).click()
  await expect(page.getByText(/Accepted local presentation action|Local simulation #/)).toHaveCount(
    0,
  )
  await page.getByRole("button", { name: "Show fixture snapshot", exact: true }).click()
  for (const value of ["loading", "error", "unavailable"]) {
    await page.getByLabel("Resource override").selectOption(value)
    await expect(
      page.getByText(
        "Controlled presentation state; fixture counts are unavailable, not healthy zero.",
      ),
    ).toBeVisible()
    await expect(page.getByLabel("Plugin widget")).toHaveCount(0)
  }
  await page.getByLabel("Resource override").selectOption("scenario")
  await page.getByRole("button", { name: "Observability", exact: true }).click()
  await page.getByRole("button", { name: "Preview held refresh failure" }).click()
  await page.getByRole("button", { name: "Reset playback", exact: true }).click()
  await page.getByRole("button", { name: "Release retired refresh outcome" }).click()
  await expect(
    page.getByText("Scripted series refresh failed; retained evidence unchanged", { exact: true }),
  ).toHaveCount(0)
  await expect(
    page.getByText(/Observation fixture unavailable for this source\/cutoff/),
  ).toBeVisible()
  await page.getByRole("button", { name: "Show fixture snapshot", exact: true }).click()
  await page.getByLabel("Scenario").selectOption("large")
  await expect(
    page.getByText(/Observation fixture unavailable for this source\/cutoff/),
  ).toBeVisible()
})
test("narrow keyboard seek and portable frame retirement require no external stream", async ({
  page,
}, info) => {
  const bad: string[] = []
  page.on("request", (r) => {
    if (r.method() !== "GET" || !new URL(r.url()).hostname.match(/^(127\.0\.0\.1|localhost)$/))
      bad.push(r.url())
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/")
  await page.getByText("Fixture timeline review", { exact: true }).click()
  await page.getByRole("button", { name: "Reset playback", exact: true }).click()
  const range = page.getByLabel("Playback position")
  await range.focus()
  await page.keyboard.press("ArrowRight")
  await expect(range).toHaveValue("1")
  await expect(page.getByTestId("playback-cutoff")).toHaveText("2026-10-04T14:10:00Z")
  await page.getByLabel("Theme").selectOption("p1-green-phosphor")
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  await page.screenshot({
    path: info.outputPath("playback-narrow-keyboard.png"),
    animations: "disabled",
  })
  const api: string[] = []
  page.on("request", (r) => {
    if (/\/api\/|\/plugins\//.test(r.url())) api.push(r.url())
  })
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=playback-recorded-frames--before-outcome&viewMode=story",
  )
  await page.getByRole("button", { name: /Inspect telemetry sampling drift.*TASK-003/ }).click()
  await expect(page.getByLabel("Playback selected run")).toContainText(
    "Not observed through this cutoff",
  )
  await page.getByRole("button", { name: "Play recorded events", exact: true }).click()
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=playback-recorded-frames--task-blocked&viewMode=story",
  )
  await page.clock.install()
  await page.clock.runFor(3000)
  await expect(page.getByTestId("playback-cutoff")).toHaveText("2026-10-04T14:15:35Z")
  await expect(
    page.getByRole("button", { name: "Play recorded events", exact: true }),
  ).toBeVisible()
  expect(api).toEqual([])
  expect(bad).toEqual([])
})
