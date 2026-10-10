import { expect, test } from "@playwright/test"
import { exampleContext, fixtureContracts, torqueDefinition } from "../src/examples/contracts"
import { sourceDataset, timelineFrames } from "../src/playback/model"

test("example admission distinguishes original identity, declared profiles and exact recorded boundary", () => {
  for (const scenario of ["populated", "large"]) {
    const artifact = sourceDataset(scenario),
      frames = timelineFrames(artifact)
    expect(exampleContext(torqueDefinition, artifact, frames[1], frames)).toMatchObject({
      available: true,
      referenceClock: artifact.clock,
      reviewCutoff: frames[1],
      profile: artifact.profile,
    })
    for (const patch of [
      { version: "operations/future" },
      { generator: "unknown" },
      { profile: "unknown" },
      { clock: frames[1] },
    ]) {
      expect(
        exampleContext(torqueDefinition, { ...artifact, ...patch }, frames[1], frames).available,
      ).toBe(false)
    }
    expect(
      exampleContext(torqueDefinition, artifact, "2026-10-04T14:15:14Z", frames).available,
    ).toBe(false)
  }
  const f = fixtureContracts.families.find((f) => f.id === "communications")
  if (!f) throw new Error("Missing communications contract")
  const snapshot = exampleContext(
    { ...torqueDefinition, primaryFamily: "communications", projection: "snapshot" },
    { version: f.version, generator: f.generator, seed: f.seed, clock: f.referenceClock },
    "2026-10-04T14:15:15Z",
    [],
  )
  expect(
    exampleContext(
      { ...torqueDefinition, primaryFamily: "communications", projection: "prefix" },
      { version: f.version, generator: f.generator, seed: f.seed, clock: f.referenceClock },
      "2026-10-04T14:15:15Z",
      ["2026-10-04T14:15:15Z"],
    ),
  ).toMatchObject({
    available: false,
    reviewCutoff: null,
    problem: "Unsupported projection for this supplied family.",
  })
  expect(snapshot).toMatchObject({
    available: true,
    referenceClock: f.referenceClock,
    reviewCutoff: null,
    profileKind: "declared review label; not artifact history",
  })
})

test("native About exposes six actual artifact identities and independent snapshot clocks at a prefix", async ({
  page,
}, testInfo) => {
  await page.goto("/?example=torque&screen=about&cutoff=2026-10-04T14:15:15Z")
  const matrix = page.getByRole("region", { name: "Bundled fixture-family contracts", exact: true })
  await expect(matrix.getByRole("article")).toHaveCount(fixtureContracts.families.length)
  const comm = matrix.getByRole("article", { name: "communications fixture contract", exact: true })
  await expect(comm).toContainText("streamChunks: 3")
  await expect(comm).toContainText("2026-10-04T14:30:00Z")
  await expect(comm).toContainText("independent full snapshot")
  await comm.getByText("Relationships, coverage and remaining scope", { exact: true }).click()
  await expect(comm).toContainText("No timestamped metadata contract")
  const admin = matrix.getByRole("article", {
    name: "administration fixture contract",
    exact: true,
  })
  await expect(admin).toContainText("parallax/v4 / 4421")
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.locator(".torque-page").evaluate((e) => e.scrollTo({ top: 0 }))
  await page.screenshot({ path: testInfo.outputPath("contracts-context-desktop.png") })
  await matrix.scrollIntoViewIfNeeded()
  await page.screenshot({ path: testInfo.outputPath("contracts-desktop.png") })
  const developer = matrix.getByRole("article", { name: "developer fixture contract", exact: true })
  await developer.scrollIntoViewIfNeeded()
  await page.screenshot({ path: testInfo.outputPath("contracts-lower-desktop.png") })
  await page.setViewportSize({ width: 390, height: 844 })
  await admin.scrollIntoViewIfNeeded()
  await page.screenshot({ path: testInfo.outputPath("contracts-narrow.png") })
  await developer.scrollIntoViewIfNeeded()
  await page.screenshot({ path: testInfo.outputPath("contracts-lower-narrow.png") })
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})

test("portable About consumes the same family manifest without a Go or plugin request", async ({
  page,
}) => {
  const calls: string[] = []
  page.on("request", (r) => {
    if (
      new URL(r.url()).pathname.startsWith("/api/") ||
      new URL(r.url()).pathname.startsWith("/plugins/")
    )
      calls.push(r.url())
  })
  await page.goto("http://127.0.0.1:18542/iframe.html?id=app-examples-torque--about&viewMode=story")
  await expect(
    page
      .getByRole("region", { name: "Bundled fixture-family contracts", exact: true })
      .getByRole("article"),
  ).toHaveCount(6)
  expect(calls).toEqual([])
})
