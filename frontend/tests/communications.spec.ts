import { expect, test } from "@playwright/test"

test("contact identities link conversations, attachments and transient send intent", async ({
  page,
}, testInfo) => {
  const writes: string[] = []
  page.on("request", (r) => {
    if (!["GET", "HEAD"].includes(r.method())) writes.push(r.url())
  })
  await page.goto("/?view=Contacts&mode=light")
  await page.getByRole("button", { name: /CONTACT-001/ }).focus()
  await page.keyboard.press("Enter")
  await expect(page.getByText("reviewer1@example.invalid", { exact: true })).toBeVisible()
  await page.getByTestId("page-scroll").evaluate((el) => {
    el.scrollTop = 0
  })
  await page.screenshot({
    animations: "disabled",
    path: testInfo.outputPath("contacts-desktop.png"),
  })
  await page.getByRole("button", { name: "Open email conversation · CONVERSATION-001" }).click()
  await expect(page.getByRole("heading", { name: "Messages", exact: true })).toBeVisible()
  await expect(page.getByText("Conversation with", { exact: false })).toContainText("CONTACT-001")
  await page.getByRole("button", { name: "Inspect run-001-evidence.txt" }).click()
  await expect(page.getByRole("dialog")).toContainText("ATTACHMENT-001 / RUN-001")
  await expect
    .poll(() => page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')))
    .toBeTruthy()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("button", { name: "Inspect run-001-evidence.txt" })).toBeFocused()
  await page.getByLabel("Conversation draft").fill("Local review note")
  const messages = page.locator(".correspondence")
  expect(await messages.count()).toBe(2)
  await page.getByRole("button", { name: "Inspect send intent", exact: true }).click()
  await expect(page.getByText(/Send email draft \(Local review note\)/)).toBeVisible()
  expect(await messages.count()).toBe(2)
  expect(writes).toEqual([])
  await page.getByRole("button", { name: "Close intent" }).click()
  await page.getByTestId("page-scroll").evaluate((el) => {
    el.scrollTop = 0
  })
  await page.screenshot({
    animations: "disabled",
    path: testInfo.outputPath("messages-desktop.png"),
  })
  await page.getByRole("button", { name: "Show all conversations" }).click()
  await page.getByLabel("Message channel").selectOption("SMS")
  await page.getByRole("button", { name: /Fixture contract handoff/ }).click()
  await expect(page.getByLabel("Conversation draft")).toHaveValue("")
  await expect(page.getByText(/Scripted delivery failure/)).toBeVisible()
  await page.getByLabel("Delivery scenario").selectOption("denied")
  await expect(page.getByLabel("Conversation draft")).toBeDisabled()
  await expect(
    page.getByRole("button", { name: "Inspect send intent", exact: true }),
  ).toBeDisabled()
  await expect(page.getByText(/Sending denied by fixture policy/)).toBeVisible()
  await page.getByLabel("Scenario", { exact: true }).selectOption("empty")
  await expect(page.getByText("No conversations in this inbox")).toBeVisible()
  await expect(page.getByRole("dialog")).toHaveCount(0)
})
test("chat uses related operations tools and shared card classification; context resets preview", async ({
  page,
}, testInfo) => {
  const writes: string[] = []
  page.on("request", (r) => {
    if (!["GET", "HEAD"].includes(r.method())) writes.push(r.url())
  })
  await page.goto("/?view=Chat&mode=light")
  await expect(page.getByText("CHAT-001 · SESSION-001 · RUN-001", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Load older messages" }).click()
  await expect(page.getByText("Fixture reviewer", { exact: true })).toBeVisible()
  await expect(page.getByRole("button", { name: /TOOL-001 · SPAN-TOOL-001/ })).toBeVisible()
  await page.getByRole("button", { name: "Inspect proposed handoff", exact: true }).click()
  await expect(page.getByText(/Card response inspected/)).toBeVisible()
  await page.getByRole("button", { name: "Close intent" }).click()
  await page.getByTestId("page-scroll").evaluate((el) => {
    el.scrollTop = 0
  })
  await page.screenshot({ animations: "disabled", path: testInfo.outputPath("chat-desktop.png") })
  await page
    .getByRole("button", { name: "Inspect proposed handoff", exact: true })
    .scrollIntoViewIfNeeded()
  await page.screenshot({
    animations: "disabled",
    path: testInfo.outputPath("chat-cards-desktop.png"),
  })
  await page.getByRole("heading", { name: "Related tool calls" }).scrollIntoViewIfNeeded()
  await page.screenshot({
    animations: "disabled",
    path: testInfo.outputPath("chat-tools-desktop.png"),
  })
  await page.getByRole("button", { name: "Inspect card binding" }).click()
  await expect(page.getByRole("dialog")).toContainText(
    "available · fixture-confirmation · core-trusted",
  )
  await page.keyboard.press("Escape")
  for (const [state, classification] of [
    ["pending", "pending"],
    ["refused", "canceled"],
    ["error", "failed"],
    ["unknown-response", "unrecognized"],
  ]) {
    await page.getByLabel("Chat card state").selectOption(state)
    await expect(page.getByLabel("Card response classification")).toContainText(classification)
    if (state === "refused") await expect(page.getByLabel("Card evidence note")).toHaveCount(0)
    else await expect(page.getByLabel("Card evidence note")).toBeDisabled()
  }
  await page.getByLabel("Chat card state").selectOption("unknown-wire")
  await expect(page.getByText("future.review/v99", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Inspect card binding" }).click()
  await expect(page.getByRole("dialog")).toContainText("unclassified")
  await page.keyboard.press("Escape")
  await page.getByLabel("Chat card state").selectOption("normal")
  await page.getByLabel("Chat draft").fill("Unsaved prior context")
  await page.getByLabel("Card evidence note").fill("Local card note")
  await page.getByLabel("Chat card state").selectOption("streaming")
  await expect(page.getByLabel("Chat draft")).toHaveValue("")
  await page.getByRole("button", { name: "Advance scripted stream" }).click()
  await expect(page.getByText("Reviewing the bundled context.", { exact: true })).toBeVisible()
  await page.getByLabel("Chat session").selectOption("CHAT-003")
  await expect(page.getByLabel("Chat card state")).toHaveValue("normal")
  await expect(page.getByRole("button", { name: "Advance scripted stream" })).toHaveCount(0)
  await expect(page.getByLabel("Chat draft")).toHaveValue("")
  await expect(page.getByText(/Card response inspected/)).toHaveCount(0)
  await expect(page.getByRole("button", { name: /TOOL-003 · SPAN-TOOL-003/ })).toBeVisible()
  await page.getByLabel("Scenario", { exact: true }).selectOption("permission-denied")
  await expect(page.getByLabel("Session transcript")).toHaveCount(0)
  await expect(page.getByRole("dialog")).toHaveCount(0)
  expect(writes).toEqual([])
})
test("chat flow has one page scroll owner and themed narrow cards", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/?view=Chat&mode=dark&theme=p3-amber-phosphor")
  await expect(page.getByLabel("Chat card state")).toBeVisible()
  const transcript = page.getByLabel("Session transcript")
  expect(await transcript.evaluate((el) => getComputedStyle(el).overflowY)).toBe("visible")
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  const owners = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("main *")]
      .filter(
        (el) =>
          el.scrollHeight > el.clientHeight + 1 &&
          ["auto", "scroll"].includes(getComputedStyle(el).overflowY),
      )
      .map((el) => el.dataset.testid ?? el.className),
  )
  expect(owners).toEqual(["page-scroll"])
  await page.getByTestId("page-scroll").evaluate((el) => {
    el.scrollTop = 0
  })
  await page.screenshot({ animations: "disabled", path: testInfo.outputPath("chat-narrow.png") })
  await page
    .getByRole("button", { name: "Inspect proposed handoff", exact: true })
    .scrollIntoViewIfNeeded()
  await page.screenshot({
    animations: "disabled",
    path: testInfo.outputPath("chat-cards-narrow.png"),
  })
  await page.getByLabel("Scenario", { exact: true }).selectOption("long-labels")
  await page.getByRole("button", { name: "Messages", exact: true }).click()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  await page.screenshot({
    animations: "disabled",
    path: testInfo.outputPath("messages-narrow.png"),
  })
})
test("communication model and portable stories preserve related records without APIs", async ({
  page,
}) => {
  const { communicationsModel, conversationDetail, chatDetail } = await import(
    "../src/communications/model"
  )
  const model = communicationsModel("populated"),
    chat = chatDetail(model, "CHAT-001"),
    conversation = conversationDetail(model, "CONVERSATION-001")
  expect(chat?.session.contactId).toBe(conversation?.conversation.contactId)
  expect(chat?.tools[0].runId).toBe(conversation?.conversation.runId)
  expect(chat?.attachment?.id).toBe(conversation?.attachments[0].id)
  expect(communicationsModel("permission-denied").contacts).toEqual([])
  const businessRequests: string[] = []
  page.on("request", (r) => {
    if (r.url().includes("/api/") || r.url().includes("/plugins/")) businessRequests.push(r.url())
  })
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=communications-controlled-views--unknown-wire&viewMode=story",
  )
  await expect(page.getByText("future.review/v99", { exact: true })).toBeVisible()
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=communications-controlled-views--denied-send&viewMode=story",
  )
  await expect(page.getByLabel("Conversation draft")).toBeDisabled()
  expect(businessRequests).toEqual([])
})
