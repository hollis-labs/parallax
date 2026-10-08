import { acceptsInput, classifyPriorResponse } from "@hollis-labs/kit-chat"
import { expect, type Locator, type Page, test } from "@playwright/test"
import {
  conversationCandidate,
  conversationReviewModel,
  conversationStates,
  previewChunks,
} from "../src/conversation-review/model"

test("conversation projections keep supplied records and reject wrong current questions actions values and prior states", () => {
  const data = conversationReviewModel(),
    original = JSON.stringify([data.fixture, data.operations])
  for (const state of conversationStates) {
    const m = conversationReviewModel(state)
    expect(JSON.stringify([m.fixture, m.operations])).toBe(original)
    expect(m.messages.every((msg) => msg.sessionId === m.session.sessionId)).toBe(true)
    expect(m.cards.every((card) => card.chatId === m.session.id)).toBe(true)
  }
  for (const [raw, kind, allowed] of [
    [null, "open", true],
    ["", "open", true],
    ["partial", "open", true],
    ["handling", "pending", false],
    ["submitted", "submitted", false],
    ["canceled", "canceled", false],
    ["cancelled", "canceled", false],
    ["failed", "failed", false],
    ["error", "failed", false],
    ["open", "unrecognized", false],
    ["pending", "unrecognized", false],
    ["future-response", "unrecognized", false],
  ] as const) {
    const status = classifyPriorResponse(raw)
    expect(status.kind).toBe(kind)
    expect(acceptsInput(status)).toBe(allowed)
  }
  expect(conversationCandidate(data, "composer", "stale", "fresh", "")).toBeNull()
  expect(
    conversationCandidate(
      data,
      "confirmation",
      { status: "submitted", decisions: [{ itemId: "wrong", action: "inspect-handoff" }] },
      "",
      "",
    ),
  ).toBeNull()
  const prompt = conversationReviewModel("recorded", "populated", "CHAT-001", "none", "prompt")
  expect(
    conversationCandidate(
      prompt,
      "prompt",
      { status: "submitted", answers: [{ questionId: "wrong", value: "note" }] },
      "",
      "note",
    ),
  ).toBeNull()
  expect(
    conversationCandidate(
      prompt,
      "prompt",
      {
        status: "submitted",
        answers: [{ questionId: prompt.card!.id, value: "note", note: "unexpected" }],
      },
      "",
      "note",
    ),
  ).toBeNull()
  expect(
    conversationCandidate(conversationReviewModel("streaming"), "composer", "fresh", "fresh", ""),
  ).toBeNull()
  expect(
    conversationCandidate(
      conversationReviewModel("streaming"),
      "composer",
      "fresh",
      "fresh",
      "",
      true,
    )?.value,
  ).toBe("fresh")
})
async function capture(locator: Locator, key: string) {
  await locator.evaluate((n, k) => {
    const prop = Object.keys(n).find((p) => p.startsWith("__reactProps$"))
    if (!prop) throw Error("missing current props")
    ;(window as unknown as Record<string, unknown>)[k] = (
      n as unknown as Record<string, { onClick?: () => void }>
    )[prop].onClick
  }, key)
}
async function invoke(page: Page, key: string) {
  await page.evaluate((k) => {
    const fn = (window as unknown as Record<string, unknown>)[k]
    if (typeof fn !== "function") throw Error("missing callback")
    fn()
  }, key)
}
test("composer native multiline IME finite history busy Stop and manual stream never append committed items", async ({
  page,
}, info) => {
  const writes: string[] = [],
    external: string[] = []
  page.on("request", (r) => {
    if (r.method() !== "GET") writes.push(r.url())
    if (!r.url().startsWith("http://127.0.0.1:")) external.push(r.url())
  })
  await page.goto("/?view=Conversation%20Review&theme=p4-white&mode=light")
  const composer = page.getByRole("combobox", { name: "Local composer draft", exact: true })
  await composer.fill("first")
  await composer.press("Shift+Enter")
  await composer.press("x")
  await expect(composer).toHaveValue("first\nx")
  await composer.evaluate((n) =>
    n.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true, isComposing: true }),
    ),
  )
  await composer.evaluate((n) =>
    n.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, keyCode: 229 })),
  )
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await composer.press("Enter")
  await expect(page.locator(".evidence-json")).toContainText("first\\nx")
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Release oldest scripted inspection", exact: true })
    .click()
  await expect(page.getByRole("dialog")).toContainText("Transcript and supplied prior unchanged")
  await page.screenshot({ path: info.outputPath("conversation-intent-desktop.png") })
  await page.keyboard.press("Escape")
  await expect(page.locator(".settings-plan-dialog")).toHaveCount(0)
  await expect(page.getByTestId("conversation-count")).toHaveText("1 visible / 2 supplied messages")
  await composer.fill("")
  await composer.press("ArrowUp")
  await expect(composer).not.toHaveValue("")
  await composer.press("ArrowDown")
  await expect(composer).toHaveValue("")
  await page.getByLabel("Conversation appearance").selectOption("streaming")
  await composer.fill("editable busy draft")
  await composer.press("Enter")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(composer).toBeEnabled()
  await page.getByRole("button", { name: "Advance manual preview", exact: true }).click()
  await expect(composer).toHaveValue("")
  await expect(page.locator("[data-slot=chat-stream-streaming]")).toContainText(previewChunks[0])
  await expect(page.locator("[data-slot=chat-stream-item]")).toHaveCount(2)
  await page.getByRole("button", { name: "Stop response", exact: true }).click()
  await expect(page.locator("[data-slot=chat-stream-streaming]")).toHaveCount(0)
  await composer.fill("fresh after Stop")
  await composer.press("Enter")
  await expect(page.locator(".evidence-json")).toContainText("fresh after Stop")
  await page.keyboard.press("Escape")
  await page.getByLabel("Conversation appearance").selectOption("recorded")
  await page.locator(".conversation-viewport").evaluate((n) => (n.scrollTop = 0))
  await page.getByRole("button", { name: "Load older messages", exact: true }).click()
  await expect(page.getByTestId("conversation-count")).toHaveText("2 visible / 2 supplied messages")
  await expect(page.locator("[data-slot=chat-stream-item]")).toHaveCount(3)
  await page.locator(".conversation-viewport").evaluate((n) => (n.scrollTop = 0))
  await page.getByRole("heading", { name: "Controlled conversation review", exact: true }).count()
  await page.screenshot({ path: info.outputPath("conversation-transcript-desktop.png") })
  expect(writes).toEqual([])
  expect(external).toEqual([])
})
test("confirmation and prompt preserve supplied prior and enforce actual open pending terminal unknown input states", async ({
  page,
}, info) => {
  await page.goto("/?view=Conversation%20Review")
  await page.getByLabel("Conversation composition").selectOption("cards")
  const action = page.getByRole("button", { name: "Inspect handoff candidate", exact: true })
  await action.click()
  await expect(page.locator(".evidence-json")).toContainText("inspect-handoff")
  await page.keyboard.press("Escape")
  await expect(action).toBeEnabled()
  await expect(page.getByTestId("conversation-review-source")).toContainText(
    "Prior raw none → open",
  )
  for (const prior of [
    "handling",
    "submitted",
    "canceled",
    "cancelled",
    "failed",
    "open",
    "pending",
    "future-response",
  ]) {
    await page.getByLabel("Authored prior appearance").selectOption(prior)
    await expect(action).toHaveCount(0)
    if (["open", "pending", "future-response"].includes(prior))
      await expect(
        page.getByText(/This build does not recognise the recorded status/),
      ).toContainText(prior)
  }
  await page.getByLabel("Authored prior appearance").selectOption("partial")
  await expect(action).toBeEnabled()
  await capture(action, "oldAction")
  await page.getByLabel("Reviewed card").selectOption("prompt")
  await invoke(page, "oldAction")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  const note = page.getByLabel("Local prompt draft", { exact: true })
  await note.fill("local note")
  await note.evaluate((n) =>
    n.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true, isComposing: true }),
    ),
  )
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await note.press("Enter")
  await expect(page.locator(".evidence-json")).toContainText("CARD-PROMPT-001")
  await expect(page.locator(".evidence-json")).toContainText("local note")
  await page.keyboard.press("Escape")
  await expect(page.getByLabel("Authored prior appearance")).toHaveValue("partial")
  await page.getByLabel("Authored prior appearance").selectOption("handling")
  await expect(note).toBeDisabled()
  await expect(
    page.getByRole("button", { name: "Inspect prompt candidate", exact: true }),
  ).toBeDisabled()
  await page.getByLabel("Authored prior appearance").selectOption("submitted")
  await expect(note).toHaveCount(0)
  await expect(
    page.getByText("Authored prior answer appearance; no recorded fixture response", {
      exact: true,
    }),
  ).toBeVisible()
  await page.getByLabel("Authored prior appearance").selectOption("none")
  await expect(page.locator(".settings-plan-dialog")).toHaveCount(0)
  await page.screenshot({ path: info.outputPath("conversation-cards-desktop.png") })
})
test("source session prior mode draft step reset and unmount retire held candidates and captured callbacks in StrictMode", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:18545/?view=Conversation%20Review")
  await page.getByRole("button", { name: "Inspect handoff candidate", exact: true }).click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Release oldest scripted inspection", exact: true })
    .click()
  await expect(page.getByRole("dialog")).toContainText("Candidate response inspected locally")
  await capture(page.getByRole("button", { name: "Close inspection", exact: true }), "oldClose")
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: "Inspect handoff candidate", exact: true }).click()
  await invoke(page, "oldClose")
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.keyboard.press("Escape")
  await page.getByLabel("Fixture session").selectOption("CHAT-002")
  await page
    .getByTestId("page-scroll")
    .getByRole("button", { name: /Release oldest scripted inspection/ })
    .click()
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(page.getByTestId("conversation-review-source")).toContainText("SESSION-002")
  await capture(
    page.getByRole("button", { name: "Inspect handoff candidate", exact: true }),
    "oldResponse",
  )
  await page.getByLabel("Authored prior appearance").selectOption("handling")
  await invoke(page, "oldResponse")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.getByLabel("Authored prior appearance").selectOption("none")
  await page.getByRole("button", { name: "Inspect handoff candidate", exact: true }).click()
  await page.keyboard.press("Escape")
  await page
    .getByRole("combobox", { name: "Local composer draft", exact: true })
    .fill("edit retires old intent")
  await page
    .getByTestId("page-scroll")
    .getByRole("button", { name: /Release oldest scripted inspection/ })
    .click()
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.getByLabel("Reviewed conversation source").selectOption("copy")
  await invoke(page, "oldResponse")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.getByLabel("Conversation appearance").selectOption("streaming")
  await page.getByRole("button", { name: "Inspect handoff candidate", exact: true }).click()
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: "Advance manual preview", exact: true }).click()
  await page
    .getByTestId("page-scroll")
    .getByRole("button", { name: /Release oldest scripted inspection/ })
    .click()
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.getByRole("button", { name: "Reset conversation review", exact: true }).click()
  await expect(
    page.getByRole("combobox", { name: "Local composer draft", exact: true }),
  ).toHaveValue("")
  await page.getByRole("button", { name: "Activity", exact: true }).click()
  await invoke(page, "oldResponse")
  await expect(page.getByRole("dialog")).toHaveCount(0)
})
test("bounded transcript scroll jump finite prepend and narrow keyboard dialog preserve rendered tokens", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/?view=Conversation%20Review&theme=p1-green-phosphor&mode=dark")
  await page.getByLabel("Conversation appearance").selectOption("long")
  const viewport = page.locator(".conversation-viewport")
  await viewport.scrollIntoViewIfNeeded()
  const bounds = await viewport.evaluate((n) => ({
    height: n.clientHeight,
    scroll: n.scrollHeight,
    overflow: getComputedStyle(n).overflowY,
  }))
  expect(bounds.height).toBeGreaterThan(250)
  expect(bounds.scroll).toBeGreaterThan(bounds.height)
  expect(bounds.overflow).toBe("auto")
  await viewport.evaluate((n) => (n.scrollTop = 0))
  await expect(
    page.getByRole("button", { name: "Jump to supplied latest", exact: true }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Load older messages", exact: true }).click()
  await expect(page.getByTestId("conversation-count")).toHaveText("2 visible / 2 supplied messages")
  await page.getByRole("button", { name: "Jump to supplied latest", exact: true }).click()
  await expect
    .poll(() => viewport.evaluate((n) => n.scrollHeight - n.clientHeight - n.scrollTop))
    .toBeLessThan(100)
  await page.screenshot({ path: info.outputPath("conversation-transcript-narrow.png") })
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await page.getByRole("button", { name: "Inspect handoff candidate", exact: true }).click()
  await expect(page.getByRole("dialog")).toBeVisible()
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press("Tab")
    await expect
      .poll(() => page.evaluate(() => !!document.activeElement?.closest("[role=dialog]")))
      .toBe(true)
  }
  await page.locator(".evidence-json").scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath("conversation-intent-narrow.png") })
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("button", { name: "Inspect handoff candidate", exact: true }),
  ).toBeFocused()
  const composer = page.getByRole("combobox", { name: "Local composer draft", exact: true })
  const paint = await composer.evaluate((n) => ({
    fg: getComputedStyle(n).color,
    bg: getComputedStyle(n.closest("[data-slot=chat-input]")!).backgroundColor,
  }))
  expect(paint.fg).not.toBe(paint.bg)
  await page.getByLabel("Conversation appearance").selectOption("locked")
  await expect(composer).toBeDisabled()
  await expect(
    page.getByRole("button", { name: "Inspect handoff candidate", exact: true }),
  ).toHaveCount(0)
})
test("portable conversation states and finite history error retry require no API or external transport", async ({
  page,
}) => {
  const requests: string[] = []
  page.on("request", (r) => {
    if (/\/api\/|\/plugins\//.test(r.url())) requests.push(r.url())
  })
  for (const state of [
    "empty",
    "loading",
    "streaming",
    "stalled",
    "stream-error",
    "denied",
    "locked",
    "unknown-prior",
    "literal-open",
    "literal-pending",
    "submitted-prompt",
    "history-error",
    "history-loading",
  ]) {
    await page.goto(
      `http://127.0.0.1:18542/iframe.html?id=conversation-controlled-conversation-review--${state}&viewMode=story`,
    )
    await expect(page.getByLabel("Controlled conversation review")).toBeVisible()
    if (state === "empty")
      await expect(
        page.getByText("Known empty transcript; no supplied messages or card."),
      ).toBeVisible()
    if (state === "denied") await expect(page.locator("[data-slot=chat-input]")).toHaveCount(0)
    if (state === "history-error") {
      await page.locator(".conversation-viewport").evaluate((n) => (n.scrollTop = 0))
      await page.getByRole("button", { name: "Retry loading history", exact: true }).click()
      await expect(page.getByTestId("conversation-count")).toHaveText(
        "2 visible / 2 supplied messages",
      )
    }
  }
  expect(requests).toEqual([])
})
