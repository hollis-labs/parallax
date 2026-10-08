import { expect, type Locator, type Page, test } from "@playwright/test"
import {
  accountAppearances,
  accountCandidate,
  accountReviewModel,
} from "../src/account-review/model"

test("account candidates preserve fictional principal and metadata and refuse invalid access drafts", () => {
  const data = accountReviewModel(),
    original = JSON.stringify(data.fixture),
    preferences = { density: "comfortable", annotations: false }
  for (const state of accountAppearances) {
    expect(JSON.stringify(accountReviewModel(state).fixture)).toBe(original)
    expect(JSON.stringify(accountReviewModel(state))).toBe(
      JSON.stringify(accountReviewModel(state)),
    )
  }
  expect(
    accountCandidate(
      data,
      "profile",
      { displayName: "Alias", email: "invalid" },
      preferences,
      data.draft,
      "",
    ),
  ).toBeNull()
  expect(
    accountCandidate(
      data,
      "create",
      data.profile,
      preferences,
      { name: "Local", scopes: ["unknown"] },
      "",
    ),
  ).toBeNull()
  expect(
    accountCandidate(data, "revoke", data.profile, preferences, data.draft, "TOKEN-UNKNOWN"),
  ).toBeNull()
  expect(
    accountCandidate(data, "connect", data.profile, preferences, data.draft, "PROVIDER-UNKNOWN"),
  ).toBeNull()
  expect(
    accountCandidate(
      accountReviewModel("recorded", "populated", "USER-003"),
      "profile",
      data.profile,
      preferences,
      data.draft,
      "",
    ),
  ).toBeNull()
  expect(
    accountCandidate(data, "preferences", data.profile, preferences, data.draft, "")?.value,
  ).toEqual(preferences)
  expect(accountReviewModel("recorded", "populated", "USER-002").principal.id).toBe("USER-002")
  expect(Object.keys(data.tokens[0])).toEqual([
    "id",
    "name",
    "scopes",
    "status",
    "canRevoke",
    "detail",
  ])
})
async function capture(locator: Locator, key: string) {
  await locator.evaluate((n, k) => {
    const prop = Object.keys(n).find((k) => k.startsWith("__reactProps$"))
    if (!prop) throw Error("missing props")
    ;(window as unknown as Record<string, unknown>)[k] = (
      n as unknown as Record<string, { onClick?: () => void }>
    )[prop].onClick
  }, key)
}
async function invoke(page: Page, key: string) {
  await page.evaluate((k) => {
    const f = (window as unknown as Record<string, unknown>)[k]
    if (typeof f !== "function") throw Error("missing callback")
    f()
  }, key)
}
test("actual profile preferences native validity and fixed identity permit only local candidate inspection", async ({
  page,
}, info) => {
  const writes: string[] = [],
    external: string[] = []
  page.on("request", (r) => {
    if (r.method() !== "GET") writes.push(r.url())
    if (!r.url().startsWith("http://127.0.0.1:")) external.push(r.url())
  })
  await page.goto("/?view=Account%20Review&theme=p4-white&mode=light")
  const name = page.getByLabel("Display name", { exact: true }),
    email = page.getByLabel("Email (optional)", { exact: true })
  await expect(name).toHaveValue("Adaline Rivera")
  await name.fill("Local unsaved alias")
  await email.fill("invalid")
  await expect(page.getByRole("button", { name: "Save profile", exact: true })).toBeDisabled()
  await email.press("Enter")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  expect(await email.evaluate((n) => (n as HTMLInputElement).validity.typeMismatch)).toBe(true)
  await email.fill("a@b")
  await name.press("Enter")
  await expect(page.getByRole("dialog")).toBeVisible()
  await expect(page.locator(".evidence-json")).toContainText("Local unsaved alias")
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Release oldest scripted inspection", exact: true })
    .click()
  await expect(page.getByRole("dialog")).toContainText(
    "Supplied principal, metadata, permissions and status unchanged",
  )
  await page.screenshot({ path: info.outputPath("account-plan-desktop.png") })
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(page.getByLabel("Current identity")).toContainText("Adaline Rivera")
  await expect(page.getByLabel("Current identity")).toContainText("Local")
  await page.getByLabel("Review density").selectOption("compact")
  await page.getByLabel("Show authored annotations").check()
  await page.getByRole("button", { name: "Save preferences", exact: true }).click()
  await expect(page.locator(".evidence-json")).toContainText("compact")
  await expect(page.locator(".evidence-json")).toContainText("true")
  await page.keyboard.press("Escape")
  await expect(page.locator(".settings-plan-dialog")).toHaveCount(0)
  await page.getByRole("heading", { name: "Profile", exact: true }).scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath("account-profile-desktop.png") })
  const paint = await name.evaluate((n) => ({
    bg: getComputedStyle(n).backgroundColor,
    fg: getComputedStyle(n).color,
    border: getComputedStyle(n).borderTopColor,
    width: n.getBoundingClientRect().width,
  }))
  expect(paint.bg).not.toBe(paint.fg)
  expect(paint.border).not.toBe("rgba(0, 0, 0, 0)")
  expect(paint.width).toBeGreaterThan(100)
  expect(writes).toEqual([])
  expect(external).toEqual([])
})
test("token scope create revoke confirmation and provider callbacks preserve immutable metadata and retire captured targets", async ({
  page,
}, info) => {
  await page.goto("/?view=Account%20Review")
  await page.getByLabel("Account composition").selectOption("metadata")
  await page.getByLabel("Token name", { exact: true }).fill("Local scope proposal")
  await expect(page.getByRole("button", { name: "Create token", exact: true })).toBeDisabled()
  await page.getByRole("checkbox", { name: "Inspect fixture records", exact: true }).check()
  await page.getByRole("button", { name: "Create token", exact: true }).click()
  await expect(page.locator(".evidence-json")).toContainText("records.read")
  await page.keyboard.press("Escape")
  const trigger = page.getByRole("button", { name: "Revoke Authored review token", exact: true })
  await trigger.click()
  await expect(page.getByRole("dialog")).toContainText("This token will stop granting access")
  await capture(page.getByRole("button", { name: "Revoke token", exact: true }), "oldConfirm")
  await page.keyboard.press("Escape")
  await trigger.click()
  await invoke(page, "oldConfirm")
  await expect(page.getByRole("dialog")).toContainText("Revoke API token?")
  await page.getByRole("button", { name: "Revoke token", exact: true }).click()
  await expect(page.getByRole("dialog")).toHaveCount(1)
  await expect(page.getByRole("dialog")).toContainText("Local account candidate intent")
  await expect(page.locator(".evidence-json")).toContainText("TOKEN-REVIEW")
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Release oldest scripted inspection", exact: true })
    .click()
  await expect(page.getByRole("dialog")).not.toContainText("Candidate intent inspected locally")
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Release oldest scripted inspection", exact: true })
    .click()
  await expect(page.getByRole("dialog")).toContainText("Candidate intent inspected locally")
  await page.keyboard.press("Escape")
  await expect(trigger).toBeEnabled()
  await page.getByRole("button", { name: "Connect Fictional inbox", exact: true }).click()
  await expect(page.locator(".evidence-json")).toContainText("disconnected")
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: "Disconnect Fictional archive", exact: true }).click()
  await expect(page.locator(".evidence-json")).toContainText("connected")
  await page.keyboard.press("Escape")
  await expect(page.getByText("future-status", { exact: true })).toHaveCount(2)
  await expect(page.locator(".settings-plan-dialog")).toHaveCount(0)
  await page.getByRole("heading", { name: "API tokens", exact: true }).scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath("account-metadata-desktop.png") })
  await page.getByLabel("Account appearance").selectOption("unavailable-scope")
  await expect(
    page.getByRole("alert").filter({ hasText: "Some selected scopes are unavailable" }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Clear unavailable scopes" }).click()
  await expect(page.getByRole("button", { name: "Create token", exact: true })).toBeDisabled()
})
test("source principal draft reset unmount and StrictMode fence held inspections and stale native callbacks", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:18545/?view=Account%20Review")
  await page.getByRole("button", { name: "Save profile", exact: true }).click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Release oldest scripted inspection", exact: true })
    .click()
  await expect(page.getByRole("dialog")).toContainText("Candidate intent inspected locally")
  await capture(page.getByRole("button", { name: "Close inspection", exact: true }), "oldClose")
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: "Save profile", exact: true }).click()
  await invoke(page, "oldClose")
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.keyboard.press("Escape")
  await page.getByLabel("Display name", { exact: true }).fill("Fresh alias draft")
  await page
    .getByTestId("page-scroll")
    .getByRole("button", { name: /Release oldest scripted inspection/ })
    .click()
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.getByRole("button", { name: "Save profile", exact: true }).click()
  await capture(
    page.getByRole("button", { name: "Close inspection", exact: true }),
    "beforeUnmount",
  )
  await page.keyboard.press("Escape")
  await page.getByLabel("Reviewed account source").selectOption("copy")
  await page
    .getByTestId("page-scroll")
    .getByRole("button", { name: /Release oldest scripted inspection/ })
    .click()
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.getByRole("button", { name: "Save profile", exact: true }).click()
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Reset account review", exact: true })
    .click()
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(page.getByLabel("Display name", { exact: true })).toHaveValue("Adaline Rivera")
  await page.getByLabel("Fixture principal").selectOption("USER-003")
  await expect(page.getByLabel("Display name", { exact: true })).toHaveAttribute("readonly", "")
  await expect(page.getByRole("button", { name: "Save profile", exact: true })).toHaveCount(0)
  await page.getByLabel("Account appearance").selectOption("unknown-identity")
  await expect(page.getByLabel("Display name", { exact: true })).toHaveCount(0)
  await expect(page.getByLabel("Current identity")).toContainText("Identity unavailable")
  await page.getByLabel("Account appearance").selectOption("denied")
  await expect(page.getByText("Account evidence withheld")).toBeVisible()
  await page.getByRole("button", { name: "Activity", exact: true }).click()
  await invoke(page, "beforeUnmount")
  await expect(page.getByRole("dialog")).toHaveCount(0)
})
test("narrow dark account metadata dialog and portable supported states are readable and API free", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/?view=Account%20Review&theme=p1-green-phosphor&mode=dark")
  await page.getByRole("heading", { name: "Profile", exact: true }).scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath("account-profile-narrow.png") })
  await page.getByLabel("Account composition").selectOption("metadata")
  await page.getByLabel("Account appearance").selectOption("long")
  await page.getByRole("heading", { name: "API tokens", exact: true }).scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath("account-metadata-narrow.png") })
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await page.getByRole("button", { name: "Connect Fictional inbox", exact: true }).click()
  await expect(page.getByRole("dialog")).toBeVisible()
  for (let i = 0; i < 7; i++) {
    await page.keyboard.press("Tab")
    await expect
      .poll(() => page.evaluate(() => !!document.activeElement?.closest("[role=dialog]")))
      .toBe(true)
  }
  await page.locator(".evidence-json").scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath("account-plan-narrow.png") })
  await page.keyboard.press("Escape")
  const requests: string[] = []
  page.on("request", (r) => {
    if (/\/api\/|\/plugins\//.test(r.url())) requests.push(r.url())
  })
  for (const state of [
    "empty",
    "loading-identity",
    "identity-error",
    "denied",
    "read-only",
    "busy-metadata",
    "metadata-loading",
    "metadata-error",
  ]) {
    await page.goto(
      `http://127.0.0.1:18542/iframe.html?id=account-controlled-account-review--${state}&viewMode=story`,
    )
    await expect(page.getByLabel("Controlled account review")).toBeVisible()
  }
  expect(requests).toEqual([])
})
