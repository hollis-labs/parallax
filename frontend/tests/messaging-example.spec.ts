import { expect, test } from "@playwright/test"

const entry = "/?example=messaging&theme=p4-white&mode=light"
const email = entry + "&conversation=CONVERSATION-001"

test("messaging native contact search opens exact email snapshot and finite routes reload back and channel admission", async ({
  page,
}, info) => {
  await page.goto(entry + "&screen=contacts")
  const search = page.getByRole("textbox", { name: "Find messaging contacts", exact: true })
  await search.pressSequentially("Adaline")
  await expect(search).toBeFocused()
  await page.getByRole("button", { name: /Adaline Rivera.*Operations reviewer/ }).click()
  await expect(page.getByRole("region", { name: "Selected contact", exact: true })).toContainText(
    "reviewer1@example.invalid",
  )
  await page.screenshot({ path: info.outputPath("messaging-contacts-desktop.png") })
  await page
    .getByRole("button", { name: "Open email conversation · CONVERSATION-001", exact: true })
    .click()
  await expect(page).toHaveURL(/conversation=CONVERSATION-001/)
  await expect(page.locator(".messaging-detail-heading")).toContainText("RUN-001")
  await page.reload()
  await expect(page.locator("[data-message-id]")).toHaveCount(2)
  await expect
    .poll(() =>
      page.locator('[data-slot="chat-input"]').evaluate((n) => ({
        actual: getComputedStyle(n).backgroundColor,
        expected: getComputedStyle(
          document.querySelector('.messaging-navigation a[aria-current="page"]')!,
        ).backgroundColor,
      })),
    )
    .toEqual(
      await page.locator('.messaging-navigation a[aria-current="page"]').evaluate((n) => {
        const expected = getComputedStyle(n).backgroundColor
        return { actual: expected, expected }
      }),
    )
  for (const button of [
    page.getByRole("button", { name: "Show all contacts", exact: true }),
    page.getByRole("button", { name: "Inspect run-001-evidence.txt", exact: true }),
  ]) {
    expect(await button.evaluate((n) => getComputedStyle(n).color)).toBe(
      await page
        .locator(".messaging-row")
        .first()
        .evaluate((n) => getComputedStyle(n).color),
    )
  }
  const nativeDraft = page.getByRole("combobox", { name: "Local messaging draft", exact: true })
  expect(await nativeDraft.evaluate((n) => getComputedStyle(n, "::placeholder").color)).not.toBe(
    await nativeDraft.evaluate((n) => getComputedStyle(n).backgroundColor),
  )
  await page.screenshot({ path: info.outputPath("messaging-inbox-desktop.png") })
  await page.getByRole("link", { name: "Inbox", exact: true }).click()
  await page.getByLabel("Messaging channel", { exact: true }).selectOption("SMS")
  await page.getByRole("button", { name: /Fixture contract handoff/ }).click()
  await expect(page.locator(".messaging-detail-heading")).toContainText("CONVERSATION-002")
  await page.goBack()
  await expect(page.locator("[data-message-id]")).toHaveCount(0)
  await page.goto(email + "&channel=SMS")
  await expect(page.locator("[data-message-id]")).toHaveCount(0)
  await expect(page).not.toHaveURL(/conversation=CONVERSATION-001/)
})

test("messaging native Enter trim ShiftEnter IME and ignored-abort local drafts never append or send", async ({
  page,
}, info) => {
  const writes: string[] = []
  page.on("request", (r) => {
    if (r.method() !== "GET") writes.push(r.url())
  })
  await page.goto(email)
  const input = page.getByRole("combobox", { name: "Local messaging draft", exact: true })
  await input.fill("  local reply  ")
  await input.press("Shift+Enter")
  await input.press("x")
  for (const options of [{ isComposing: true }, { keyCode: 229 }])
    await input.evaluate(
      (n, opts) =>
        n.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, ...opts })),
      options,
    )
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await input.press("Enter")
  const dialog = page.getByRole("dialog", { name: "Message draft candidate", exact: true })
  await expect(dialog).toContainText("local reply")
  await page.keyboard.press("Escape")
  await expect(input).toBeFocused()
  await input.fill("fresh draft")
  await page.getByRole("button", { name: "Inspect draft candidate", exact: true }).click()
  await dialog.getByRole("button", { name: /Release oldest scripted outcome/ }).click()
  await expect(dialog).toContainText("Held local inspection")
  await dialog.getByRole("button", { name: /Release oldest scripted outcome/ }).click()
  await expect(dialog).toContainText("Supplied messages and delivery unchanged")
  await expect.poll(() => dialog.evaluate((n) => getComputedStyle(n).opacity)).toBe("1")
  await page.screenshot({ path: info.outputPath("messaging-draft-desktop.png") })
  await expect(page.locator("[data-message-id]")).toHaveCount(2)
  expect(writes).toEqual([])
})

test("StrictMode current-message attachment intersection and captured query channel source callbacks refuse replay", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:18545" + email)
  const attachment = page.getByRole("button", { name: "Inspect run-001-evidence.txt", exact: true })
  await attachment.evaluate((n) => {
    const p = Object.keys(n).find((k) => k.startsWith("__reactProps$"))!
    ;(window as any).oldAttachment = (n as any)[p].onClick
    let f = (n as any)[Object.keys(n).find((k) => k.startsWith("__reactFiber$"))!]
    while (f && typeof f.memoizedProps?.onInspect !== "function") f = f.return
    if (!f) throw Error("Attachment callback absent")
    ;(window as any).attachmentHandler = f.memoizedProps.onInspect
    f.memoizedProps.onInspect("ATTACHMENT-003")
  })
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await attachment.click()
  const modal = page.getByRole("dialog", { name: "Attachment ATTACHMENT-001", exact: true })
  await expect(modal).toContainText("MESSAGE-IN-001")
  await page.keyboard.press("Escape")
  const search = page.getByRole("textbox", { name: "Search messaging conversations", exact: true })
  await search.pressSequentially("gateway")
  await expect(search).toBeFocused()
  await page.evaluate(() => (window as any).oldAttachment())
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await search.fill("")
  await page.getByLabel("Messaging channel", { exact: true }).click()
  await page.getByLabel("Messaging channel", { exact: true }).selectOption("SMS")
  await expect(page.getByLabel("Messaging channel", { exact: true })).toBeFocused()
  await page.getByLabel("Messaging channel", { exact: true }).selectOption("all")
  await page.getByRole("button", { name: /Gateway review evidence/ }).click()
  await page.evaluate(() => (window as any).oldAttachment())
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await attachment.click()
  await modal.getByRole("button", { name: /Release oldest scripted outcome/ }).click()
  await expect(modal).toContainText("Held local inspection")
  await modal.getByRole("button", { name: /Release oldest scripted outcome/ }).click()
  await expect(modal).toContainText("Supplied messages and delivery unchanged")
})

test("390 dark native sheets detail transcript and attachment metadata tail footer remain readable and bounded", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 650 })
  await page.goto(entry.replace("p4-white", "p1-green-phosphor").replace("light", "dark"))
  await page.getByRole("button", { name: "Menu", exact: true }).click()
  const sheet = page.getByRole("dialog", { name: "Messaging navigation", exact: true })
  await expect.poll(() => sheet.evaluate((n) => getComputedStyle(n).opacity)).toBe("1")
  await page.screenshot({ path: info.outputPath("messaging-navigation-narrow.png") })
  await page.keyboard.press("Escape")
  await expect(page.getByRole("button", { name: "Menu", exact: true })).toBeFocused()
  await page.getByRole("button", { name: "Menu", exact: true }).click()
  await sheet.getByRole("link", { name: "Contacts", exact: true }).click()
  await expect(sheet).toHaveCount(0)
  await expect(page.getByRole("heading", { name: "Contacts", exact: true })).toBeFocused()
  await page.getByRole("button", { name: "Menu", exact: true }).click()
  await sheet.getByRole("link", { name: "Inbox", exact: true }).click()
  await expect(sheet).toHaveCount(0)
  await expect(page.getByRole("heading", { name: "Inbox", exact: true })).toBeFocused()
  await page.getByRole("button", { name: /Gateway review evidence/ }).click()
  await expect(
    page.getByRole("heading", { name: "Gateway review evidence", exact: true }).first(),
  ).toBeFocused()
  await page.screenshot({ path: info.outputPath("messaging-conversation-narrow.png") })
  const transcript = page.getByRole("region", {
    name: "Supplied conversation messages",
    exact: true,
  })
  await transcript.click({ position: { x: 5, y: 5 } })
  await transcript.press("Control+End")
  await expect
    .poll(() => transcript.evaluate((n) => n.scrollHeight - n.clientHeight - n.scrollTop))
    .toBeLessThan(2)
  await page.getByRole("button", { name: "Inspect run-001-evidence.txt", exact: true }).click()
  const modal = page.getByRole("dialog", { name: "Attachment ATTACHMENT-001", exact: true })
  await expect.poll(() => modal.evaluate((n) => getComputedStyle(n).opacity)).toBe("1")
  const body = modal.locator(".messaging-inspector")
  await body.hover()
  await page.mouse.wheel(0, -2000)
  await expect.poll(() => body.evaluate((n) => n.parentElement!.scrollTop)).toBe(0)
  await page.screenshot({ path: info.outputPath("messaging-attachment-top-narrow.png") })
  await body.hover()
  await page.mouse.wheel(0, 2000)
  await expect
    .poll(() =>
      body.evaluate(
        (n) =>
          n.parentElement!.scrollHeight -
          n.parentElement!.clientHeight -
          n.parentElement!.scrollTop,
      ),
    )
    .toBeLessThan(2)
  await expect(modal.getByRole("button", { name: /Release oldest scripted outcome/ })).toBeVisible()
  await page.screenshot({ path: info.outputPath("messaging-attachment-tail-narrow.png") })
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("button", { name: "Inspect run-001-evidence.txt", exact: true }),
  ).toBeFocused()
  await page.getByRole("button", { name: "Back to conversations", exact: true }).click()
  await expect(page.getByRole("heading", { name: "Inbox", exact: true })).toBeFocused()
  await page.setViewportSize({ width: 390, height: 500 })
  await page.getByRole("button", { name: /Gateway review evidence/ }).click()
  await expect(
    page.getByRole("combobox", { name: "Local messaging draft", exact: true }),
  ).toBeVisible()

  expect((await transcript.boundingBox())!.height).toBeGreaterThan(90)
  for (const region of [
    page.locator(".messaging-draft"),
    page.locator(".messaging-example-footer"),
  ]) {
    const bounds = (await region.boundingBox())!
    expect(bounds.y).toBeGreaterThanOrEqual(0)
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(500)
  }
  await page.screenshot({ path: info.outputPath("messaging-short-narrow.png") })
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})

test("long authored rendering and local reset retire drafts and preserve exact related chat snapshot", async ({
  page,
}, info) => {
  await page.goto(email + "&appearance=long")
  const transcript = page.getByRole("region", {
    name: "Supplied conversation messages",
    exact: true,
  })
  await expect(transcript).toContainText("Authored long-text rendering sample")
  await transcript.click({ position: { x: 5, y: 5 } })
  await transcript.press("Control+End")
  await expect
    .poll(() => transcript.evaluate((n) => n.scrollHeight - n.clientHeight - n.scrollTop))
    .toBeLessThan(2)
  await page.screenshot({ path: info.outputPath("messaging-long-desktop.png") })
  await page.getByRole("combobox", { name: "Local messaging draft", exact: true }).fill("retired")
  await page.getByRole("button", { name: "Review", exact: true }).click()
  await page.getByRole("button", { name: "Reset messaging context", exact: true }).click()
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(page.getByRole("heading", { name: "Inbox", exact: true })).toBeFocused()
  await page.getByRole("button", { name: /Gateway review evidence/ }).click()
  await expect(
    page.getByRole("combobox", { name: "Local messaging draft", exact: true }),
  ).toHaveValue("")
  await page.getByRole("link", { name: "Open related Chat snapshot", exact: true }).click()
  await expect(page).toHaveURL(/example=chat.*session=CHAT-001/)
})

test("shared fullscreen portable messaging states are API-free with known zero unknown and readonly source policy", async ({
  page,
}) => {
  const effects: string[] = []
  page.on("request", (r) => {
    if (r.method() !== "GET" || r.url().includes("/api/")) effects.push(r.url())
  })
  await page.setViewportSize({ width: 390, height: 650 })
  for (const story of [
    "inbox",
    "contacts",
    "email",
    "sms",
    "tether",
    "empty",
    "loading",
    "resource-error",
    "denied",
    "unknown",
    "locked",
    "long-content",
    "failed-appearance",
    "unknown-delivery",
    "retained-degraded",
  ]) {
    await page.goto(
      `http://127.0.0.1:18542/iframe.html?id=app-examples-messaging--${story}&viewMode=story`,
    )
    await expect(page.locator(".messaging-example")).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    if (story === "empty")
      await expect(page.locator(".messaging-inbox-list")).toContainText("0 matching conversations")
    if (["loading", "resource-error", "denied", "unknown"].includes(story))
      await expect(page.locator(".messaging-inbox-list")).toContainText(
        "Conversation count Unknown",
      )
    if (story === "locked") {
      const input = page.getByRole("combobox", { name: "Local messaging draft", exact: true })
      await expect(input).toBeDisabled()
      await input.evaluate((n) => {
        let f = (n as any)[Object.keys(n).find((k) => k.startsWith("__reactFiber$"))!]
        while (f && typeof f.memoizedProps?.onValueChange !== "function") f = f.return
        f.memoizedProps.onValueChange("refused")
      })
      await expect(input).toHaveValue("")
      await page.getByRole("button", { name: "Inspect run-001-evidence.txt", exact: true }).click()
      await expect(
        page.getByRole("dialog", { name: "Attachment ATTACHMENT-001", exact: true }),
      ).toContainText("RUN-001")
    }
    if (story === "unknown-delivery")
      await expect(page.locator(".messaging-transcript")).toContainText("future-delivery")
  }
  expect(effects).toEqual([])
})
