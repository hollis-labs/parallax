import { expect, type Locator, test } from "@playwright/test"

const entry = "/?example=chat&theme=p4-white&mode=light"
async function captured(locator: Locator, key: string) {
  await locator.evaluate((n, k) => {
    const p = Object.keys(n).find((v) => v.startsWith("__reactProps$"))
    if (!p) throw Error("props missing")
    ;(window as any)[k] = (n as any)[p].onClick
  }, key)
}
async function invoke(page: any, key: string) {
  await page.evaluate((k: string) => (window as any)[k]({ preventDefault() {} }), key)
}
test("chat standalone native session search route reload and back keep truthful snapshot and current selection", async ({
  page,
}, info) => {
  await page.goto(entry)
  await expect(page.locator(".chat-example")).toHaveCount(1)
  await expect(page.locator(".page-scroll")).toHaveCount(0)
  const search = page.getByRole("textbox", { name: "Search chat sessions", exact: true })
  await search.pressSequentially("telemetry")
  await expect(search).toBeFocused()
  await expect(page.locator(".chat-session-list a[aria-current]")).toHaveCount(0)
  await page.getByRole("link", { name: /Inspect telemetry sampling/ }).click()
  await expect(page).toHaveURL(/session=CHAT-003/)
  await page.reload()
  await expect(page.locator(".chat-example-header")).toContainText("Inspect telemetry")
  await search.fill("")
  await page.getByRole("link", { name: /Review gateway permission/ }).click()
  await page.goBack()
  await expect(page.locator(".chat-example-header")).toContainText("Inspect telemetry")
  await page.screenshot({ path: info.outputPath("chat-example-desktop.png") })
  await page.getByRole("button", { name: /^tool · SOURCE-CHAT-003-tool$/ }).click()
  const tool = page.getByRole("dialog", { name: "Source SOURCE-CHAT-003-tool", exact: true })
  await expect(tool).toContainText("TOOL-003")
  await expect(tool).toContainText("failed")
  await expect.poll(() => tool.evaluate((n) => getComputedStyle(n).opacity)).toBe("1")
  await page.screenshot({ path: info.outputPath("chat-example-tool-desktop.png") })
  const toolBody = tool.locator(".chat-inspection-body")
  await toolBody.hover()
  await page.mouse.wheel(0, -2000)
  await expect.poll(() => toolBody.evaluate((n) => n.parentElement!.scrollTop)).toBe(0)
  await expect(toolBody).toContainText("RUN-003")
  await page.screenshot({ path: info.outputPath("chat-example-tool-top-desktop.png") })
  await page.keyboard.press("Escape")
})
test("native multiline IME draft inspection history and busy Stop never append supplied messages", async ({
  page,
}, info) => {
  const writes: string[] = []
  page.on("request", (r) => {
    if (r.method() !== "GET") writes.push(r.url())
  })
  await page.goto(entry)
  const input = page.getByRole("combobox", { name: "Local chat draft", exact: true })
  await input.fill(" first ")
  await input.press("Shift+Enter")
  await input.press("x")
  await input.evaluate((n) =>
    n.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true, isComposing: true }),
    ),
  )
  await input.evaluate((n) =>
    n.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, keyCode: 229 })),
  )
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await input.press("Enter")
  const modal = page.getByRole("dialog", { name: "Draft candidate", exact: true })
  await expect(modal).toContainText("first ")
  await modal.getByRole("button", { name: /Release oldest scripted outcome/ }).click()
  await expect(modal).toContainText("Supplied transcript and card prior unchanged")
  await page.screenshot({ path: info.outputPath("chat-example-intent-desktop.png") })
  await page.keyboard.press("Escape")
  await expect(input).toBeFocused()
  await input.fill("")
  await input.press("ArrowUp")
  await expect(input).not.toHaveValue("")
  await input.press("ArrowDown")
  await expect(input).toHaveValue("")
  await page.getByRole("button", { name: "Review", exact: true }).click()
  await page.getByRole("button", { name: "Step manual preview", exact: true }).click()
  await page.keyboard.press("Escape")
  await input.fill("busy editable")
  await input.press("Enter")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(input).toBeEnabled()
  await page.getByRole("button", { name: "Stop response", exact: true }).click()
  await input.fill("fresh after Stop")
  await input.press("Enter")
  await expect(page.getByRole("dialog", { name: "Draft candidate", exact: true })).toContainText(
    "fresh after Stop",
  )
  await expect(page.locator('[data-slot="chat-stream-item"]')).toHaveCount(6)
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: "Review", exact: true }).click()
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: "Step manual preview", exact: true }).click()
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("region", { name: "Completed manual preview", exact: true }),
  ).toContainText("Complete authored preview")
  await expect(page.locator('[data-slot="chat-stream-item"]')).toHaveCount(6)
  expect(writes).toEqual([])
})
test("finite native history preserves anchor and jump latest while authored preview stays outside immutable turns", async ({
  page,
}, info) => {
  await page.goto(entry)
  const viewport = page.getByRole("region", { name: "Chat example transcript", exact: true })
  await expect(viewport).toHaveCount(1)
  await viewport.click({ position: { x: 5, y: 5 } })
  await viewport.press("Control+Home")
  await expect.poll(() => viewport.evaluate((n) => n.scrollTop)).toBe(0)
  const anchor = page.locator('[data-slot="chat-stream-item"]').first()
  const anchorId = await anchor.getAttribute("data-message-id")
  const before = (await anchor.boundingBox())!.y
  await page.getByRole("button", { name: /Load older/ }).click()
  await expect(page.locator('[data-slot="chat-stream-item"]')).toHaveCount(12)
  await expect
    .poll(async () =>
      Math.abs((await page.locator(`[data-message-id="${anchorId}"]`).boundingBox())!.y - before),
    )
    .toBeLessThan(3)
  await page.getByRole("button", { name: /Load older/ }).click()
  await expect(page.locator('[data-slot="chat-stream-item"]')).toHaveCount(18)
  await viewport.hover()
  await page.mouse.wheel(0, 3000)
  await expect
    .poll(() => viewport.evaluate((n) => n.scrollHeight - n.clientHeight - n.scrollTop))
    .toBeLessThan(2)
  await viewport.hover()
  await page.mouse.wheel(0, -1800)
  await expect(
    page.getByRole("button", { name: "Jump to latest supplied turn", exact: true }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Jump to latest supplied turn", exact: true }).click()
  await expect
    .poll(() => viewport.evaluate((n) => n.scrollHeight - n.clientHeight - n.scrollTop))
    .toBeLessThan(2)
  await page.screenshot({ path: info.outputPath("chat-example-history-desktop.png") })
})
test("current selected card annotation overlay and held ignored-abort outcomes retire on edit prior session and reset", async ({
  page,
}, info) => {
  await page.goto("http://127.0.0.1:18545" + entry)
  await page.getByRole("button", { name: "Inspect inspect candidate", exact: true }).click()
  await expect(
    page.getByRole("dialog", { name: "Card response candidate", exact: true }),
  ).toBeVisible()
  await page.keyboard.press("Escape")
  await page.getByLabel("Selected chat card", { exact: true }).selectOption("CARD-PROMPT-001")
  await page.getByRole("textbox", { name: "Local card note", exact: true }).fill("current note")
  await page.screenshot({ path: info.outputPath("chat-example-card-desktop.png") })
  await page.getByRole("textbox", { name: "Local card note", exact: true }).evaluate((n) => {
    const key = Object.keys(n).find((k) => k.startsWith("__reactFiber$"))!
    let f = (n as any)[key]
    while (f && typeof f.memoizedProps?.onRespond !== "function") f = f.return
    if (!f) throw Error("Current card responder absent")
    ;(window as any).oldPromptRespond = f.memoizedProps.onRespond
    f.memoizedProps.onRespond({
      status: "canceled",
      answers: [{ questionId: "review-note", value: "unexpected" }],
    })
  })
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.getByRole("button", { name: "Inspect note candidate", exact: true }).click()
  await expect(page.getByRole("dialog")).toContainText("review-note")
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: "Review", exact: true }).click()
  await page.getByRole("button", { name: "Step manual preview", exact: true }).click()
  await page.keyboard.press("Escape")
  await page
    .getByRole("combobox", { name: "Local chat draft", exact: true })
    .fill("draft retired by prior")
  await page.getByRole("button", { name: "Review", exact: true }).click()
  await page.getByLabel("Chat card prior overlay", { exact: true }).selectOption("handling")
  await page.keyboard.press("Escape")
  await expect(page.getByRole("combobox", { name: "Local chat draft", exact: true })).toHaveValue(
    "",
  )
  await expect(page.locator('[data-slot="chat-stream-streaming"]')).toHaveCount(0)
  await expect(page.getByRole("textbox", { name: "Local card note", exact: true })).toBeDisabled()
  await page.evaluate(() => (window as any).oldPromptRespond({ status: "canceled" }))
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.getByRole("button", { name: "Review", exact: true }).click()
  await page.getByRole("button", { name: /Release oldest scripted outcome/ }).click()
  await page.getByRole("button", { name: "Reset chat context", exact: true }).click()
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(
    page.getByRole("heading", { name: "Review gateway permission boundaries", exact: true }),
  ).toBeFocused()
  await expect(page.getByLabel("Selected chat card", { exact: true })).toHaveValue(
    "CARD-CONFIRM-001",
  )
  await page.getByRole("button", { name: "Inspect inspect candidate", exact: true }).click()
  const fresh = page.getByRole("dialog", { name: "Card response candidate", exact: true })
  await fresh.getByRole("button", { name: /Release oldest scripted outcome/ }).click()
  await expect(fresh).toContainText("Held local inspection")
  await fresh.getByRole("button", { name: /Release oldest scripted outcome/ }).click()
  await expect(fresh).toContainText("Local candidate inspected")
  await page.keyboard.press("Escape")
  const link = page.getByRole("link", { name: /Build deterministic/ })
  await captured(link, "oldChatNav")
  await link.click()
  await page.getByRole("link", { name: /Review gateway/ }).click()
  await invoke(page, "oldChatNav")
  await expect(page).toHaveURL(/session=CHAT-001/)
})
test("390 dark and short height native sheets evidence literals dialog scroll and current focus remain bounded", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 650 })
  await page.goto(entry.replace("p4-white", "p1-green-phosphor").replace("light", "dark"))
  await page.getByRole("button", { name: "Sessions", exact: true }).click()
  const nav = page.getByRole("dialog", { name: "Chat session navigation", exact: true })
  await expect(nav).toBeVisible()
  await nav.getByRole("link", { name: /Inspect telemetry/ }).click()
  await expect(nav).toHaveCount(0)
  await expect(
    page.getByRole("heading", { name: "Inspect telemetry sampling drift", exact: true }),
  ).toBeFocused()
  await page.getByRole("button", { name: "Evidence", exact: true }).click()
  const sheet = page.getByRole("dialog", { name: "Chat evidence", exact: true })
  await expect(sheet).toBeVisible()
  await expect(sheet.getByRole("heading", { name: "Sources and tools", exact: true })).toBeVisible()
  await expect(sheet.getByRole("button", { name: /^tool · SOURCE-CHAT-003-tool$/ })).toBeVisible()
  await expect
    .poll(() =>
      sheet.evaluate((n) => ({
        opacity: getComputedStyle(n).opacity,
        rightOffset: window.innerWidth - n.getBoundingClientRect().right,
      })),
    )
    .toEqual({ opacity: "1", rightOffset: 0 })
  await page.screenshot({ path: info.outputPath("chat-example-evidence-narrow-settled.png") })
  await sheet.getByRole("button", { name: /authored text/ }).click()
  const modal = page.getByRole("dialog", { name: /Source / })
  await expect(modal).toContainText("neverExecute")
  await expect.poll(() => modal.evaluate((n) => getComputedStyle(n).opacity)).toBe("1")
  await expect(modal.locator("script")).toHaveCount(0)
  await modal.hover()
  await page.mouse.wheel(0, 2000)
  await expect(modal.getByRole("button", { name: "Close inspection", exact: true })).toBeVisible()
  await page.screenshot({ path: info.outputPath("chat-example-source-narrow.png") })
  await page.keyboard.press("Escape")
  await expect(sheet.getByRole("button", { name: /authored text/ })).toBeFocused()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("button", { name: "Evidence", exact: true })).toBeFocused()
  await page.setViewportSize({ width: 390, height: 500 })
  await expect(page.getByRole("combobox", { name: "Local chat draft", exact: true })).toBeVisible()
  await page.screenshot({ path: info.outputPath("chat-example-short-narrow.png") })
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})
test("same fullscreen portable shell states are API-free and honest about empty unavailable locked and long history", async ({
  page,
}) => {
  const requests: string[] = []
  page.on("request", (r) => {
    if (r.url().includes("/api/") || r.method() !== "GET") requests.push(r.url())
  })
  await page.setViewportSize({ width: 390, height: 650 })
  for (const story of [
    "conversation",
    "failed-tool",
    "empty",
    "loading",
    "resource-error",
    "denied",
    "locked",
    "unknown",
    "long-history",
    "stalled-preview",
    "pending-card",
    "unknown-card",
  ]) {
    await page.goto(
      `http://127.0.0.1:18542/iframe.html?id=app-examples-chat--${story}&viewMode=story`,
    )
    await expect(page.locator(".chat-example")).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    if (story === "conversation") {
      const before = await page
        .locator(".chat-conversation")
        .evaluate((n) => getComputedStyle(n).color)
      await page.getByRole("button", { name: "Review", exact: true }).click()
      await page.getByLabel("Chat example theme", { exact: true }).selectOption("p1-green-phosphor")
      await page.getByRole("button", { name: "Review", exact: true }).click()
      await page.getByLabel("Chat example mode", { exact: true }).selectOption("dark")
      await expect(page.locator("html")).toHaveAttribute("data-theme", "p1-green-phosphor")
      await expect(page.locator("html")).toHaveAttribute("data-mode", "dark")
      await expect
        .poll(() => page.locator(".chat-conversation").evaluate((n) => getComputedStyle(n).color))
        .not.toBe(before)
    }
    if (["loading", "resource-error", "denied", "unknown"].includes(story))
      await expect(
        page.getByRole("combobox", { name: "Local chat draft", exact: true }),
      ).toBeDisabled()
    if (story === "locked") {
      const draft = page.getByRole("combobox", { name: "Local chat draft", exact: true })
      await draft.evaluate((n) => {
        const key = Object.keys(n).find((k) => k.startsWith("__reactFiber$"))!
        let f = (n as any)[key]
        while (f && typeof f.memoizedProps?.onValueChange !== "function") f = f.return
        if (!f) throw Error("composer props absent")
        f.memoizedProps.onValueChange("refused locked draft")
      })
      await expect(draft).toHaveValue("")
      await page.getByRole("button", { name: "Evidence", exact: true }).click()
      await page
        .getByRole("dialog", { name: "Chat evidence", exact: true })
        .getByRole("button", { name: /^tool ·/ })
        .click()
      await expect(page.getByRole("dialog", { name: /Source / })).toContainText("TOOL-001")
    }
    if (story === "pending-card" || story === "unknown-card") {
      await page.getByRole("button", { name: "Evidence", exact: true }).click()
      await expect(page.getByRole("dialog", { name: "Chat evidence", exact: true })).toContainText(
        story === "pending-card"
          ? "Authored overlay: handling"
          : "Authored overlay: future-resolution",
      )
    }
    if (story === "empty")
      await expect(page.locator(".chat-composer")).toContainText("0 revealed / 0 supplied")
    if (story === "long-history")
      await expect(page.locator(".chat-composer")).toContainText("26 revealed / 26 supplied")
  }
  expect(requests).toEqual([])
})
