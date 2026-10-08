import { expect, test } from "@playwright/test"
import {
  chatPack,
  chatPackCompatible,
  chatPackDetail,
  chatPackModel,
  chatPackStates,
} from "../src/examples/chat/model"

test("snapshot pack resolves original message/source operands and refuses unsupported identities", () => {
  const model = chatPackModel()
  expect(model.pack.clock).toBe("2026-10-04T14:30:00Z")
  const detail = chatPackDetail(model, "CHAT-003")
  expect(detail?.recordedCount).toBe(2)
  expect(detail?.authoredCount).toBe(24)
  expect(detail?.run?.id).toBe("RUN-003")
  expect(detail?.turns.at(-1)).toMatchObject({
    id: "MSG-RESULT-003",
    kind: "recorded reference",
    time: "2026-10-04T14:15:30Z",
  })
  expect(detail?.turns[0].time).toBeNull()
  expect(detail?.sources.find((s) => s.kind === "tool")?.value).toMatchObject({
    id: "TOOL-003",
    status: "failed",
    spanId: "SPAN-TOOL-003",
  })
  expect(detail?.sources.find((s) => s.kind === "attachment")?.value).toContain("TOOL-003")
  expect(detail?.history).toHaveLength(13)
  expect(chatPackDetail(chatPackModel("empty"), "CHAT-AUTHORED-EMPTY")).toMatchObject({
    recordedCount: 0,
    authoredCount: 0,
    turns: [],
  })
  for (const patch of [
    { version: "future" },
    { generator: "future" },
    { seed: 1 },
    { clock: "2026-10-04T14:14:00Z" },
    { projection: "prefix" },
  ]) {
    const supplied = { ...chatPack, ...patch }
    expect(chatPackCompatible(supplied)).toBe(false)
    expect(chatPackModel("recorded", supplied)).toMatchObject({ accessible: false, sessions: [] })
  }
  for (const state of ["loading", "error", "denied", "unknown"] as const)
    expect(chatPackModel(state).sessions).toEqual([])
  expect(chatPackModel("locked").editable).toBe(false)
  expect(chatPackDetail(chatPackModel("pending-card"), "CHAT-001")?.prior).toBe("handling")
  expect(chatPackDetail(chatPackModel("unknown-card"), "CHAT-001")?.prior).toBe("future-resolution")
})

test("native Chat pack reveals finite ordered history and source literals without changing recorded messages", async ({
  page,
}, info) => {
  await page.goto("/?view=Chat")
  await expect(
    page.getByRole("region", { name: "Supplied snapshot transcript", exact: true }),
  ).toHaveCount(0)
  await page.getByText("Inspect whole-chat fixture pack", { exact: true }).click()
  const pack = page.getByRole("region", { name: "Full-snapshot chat fixture pack", exact: true })
  await expect(pack).toContainText("snapshot UTC 2026-10-04T14:30:00Z")
  await expect(pack).toContainText("26 total · 2 recorded references · 24 authored history")
  const region = pack.getByRole("region", { name: "Supplied snapshot transcript", exact: true })
  await expect(region.getByRole("article")).toHaveCount(6)
  await pack.getByRole("button", { name: "Reveal supplied older history" }).click()
  await expect(region.getByRole("article")).toHaveCount(12)
  for (let i = 0; i < 3; i++)
    await pack.getByRole("button", { name: "Reveal supplied older history" }).click()
  await expect(region.getByRole("article")).toHaveCount(26)
  await expect(pack.getByRole("button", { name: "Reveal supplied older history" })).toBeDisabled()
  await expect(region.getByRole("article").first()).toContainText("Which run is linked")
  await expect(region.getByRole("article").last()).toContainText("MSG-RESULT-001")
  await pack.scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath("chat-pack-desktop.png") })
  await pack.getByText("Local text sources and original tool evidence", { exact: true }).click()
  const literal = pack.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: "authored text · SOURCE-CHAT-001-literal",
      exact: true,
    }),
  })
  await literal.scrollIntoViewIfNeeded()
  await expect(literal).toContainText("<script>neverExecute()</script>")
  await expect(literal.locator("script,a")).toHaveCount(0)
  await page.screenshot({ path: info.outputPath("chat-pack-source-desktop.png") })
  await pack.getByLabel("Snapshot session", { exact: true }).selectOption("CHAT-003")
  await expect(region.getByRole("article")).toHaveCount(6)
  await expect(pack).toContainText("RUN-003 / SESSION-003")
  await pack.getByLabel("Pack appearance", { exact: true }).selectOption("empty")
  await expect(pack).toContainText("Known empty transcript: 0 supplied rows.")
  await page.getByText("Inspect whole-chat fixture pack", { exact: true }).click()
  await expect(pack).toHaveCount(0)
})

test("portable snapshot history is keyboard-scrollable and all controlled states are API-free at390", async ({
  page,
}, info) => {
  const effects: string[] = []
  page.on("request", (r) => {
    if (r.url().includes("/api/") || r.method() !== "GET") effects.push(r.url())
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=examples-chat-fixture-pack--long-history&viewMode=story&globals=theme:p1-green-phosphor;mode:dark",
  )
  const pack = page.getByRole("region", { name: "Full-snapshot chat fixture pack", exact: true })
  const region = pack.getByRole("region", { name: "Supplied snapshot transcript", exact: true })
  await expect(region.getByRole("article")).toHaveCount(26)
  const reveal = pack.getByRole("button", { name: "Reveal supplied older history" })
  await expect(reveal).toBeDisabled()
  // Native Tab from the session control reaches the focusable scroll region; disabled button is skipped.
  await pack
    .getByRole("heading", { name: "Full-snapshot chat fixture pack", exact: true })
    .scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath("chat-pack-context-narrow.png") })
  await pack.getByLabel("Snapshot session", { exact: true }).click()
  await page.keyboard.press("Escape")
  await expect(pack.getByLabel("Snapshot session", { exact: true })).toBeFocused()
  await page.keyboard.press("Tab")
  await expect(region).toBeFocused()
  await page.keyboard.press("Control+End")
  await expect.poll(() => region.evaluate((e) => e.scrollTop)).toBeGreaterThan(100)
  await expect
    .poll(() => region.evaluate((e) => Math.abs(e.scrollHeight - e.clientHeight - e.scrollTop)))
    .toBeLessThan(2)
  await region.scrollIntoViewIfNeeded()
  await expect(region.getByRole("article").last()).toContainText("MSG-RESULT-001")
  await page.screenshot({ path: info.outputPath("chat-pack-history-narrow.png") })
  await pack.getByText("Local text sources and original tool evidence", { exact: true }).click()
  const literal = pack.getByRole("heading", {
    name: "authored text · SOURCE-CHAT-001-literal",
    exact: true,
  })
  await literal.scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath("chat-pack-source-narrow.png") })
  for (const state of chatPackStates) {
    await pack.getByLabel("Pack appearance", { exact: true }).selectOption(state)
    if (["loading", "error", "denied", "unknown"].includes(state))
      await expect(pack.getByRole("status")).toContainText("count Unknown")
    else await expect(pack.getByLabel("Snapshot session", { exact: true })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  }
  expect(effects).toEqual([])
})
