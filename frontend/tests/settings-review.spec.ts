import {
  evaluateSettings,
  inspectSettingsGroup,
  settingsWizardEvaluation,
  settingsWizardGroups,
} from "@hollis-labs/kit-settings"
import { expect, test } from "@playwright/test"
import {
  fieldStates,
  groupEvaluation,
  replaceDraft,
  settingsReviewModel,
} from "../src/settings-review/model"

test("settings projections keep original desired values and fail closed without losing scalar meaning", () => {
  const original = JSON.stringify(settingsReviewModel().fixture)
  for (const state of fieldStates) {
    const a = settingsReviewModel(state),
      b = settingsReviewModel(state)
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
    for (const group of a.groups) {
      const profile = inspectSettingsGroup(group)
      if (state !== "unsupported-schema") expect(typeof profile).not.toBe("string")
    }
    expect(JSON.stringify(a.fixture)).toBe(original)
  }
  const model = settingsReviewModel(),
    group = model.groups.find((g) => g.id === "review-controls")!,
    state = model.states[group.id]!,
    profile = inspectSettingsGroup(group)
  if (typeof profile === "string") throw Error(profile)
  expect(state.values.row_limit.value).toBe(0)
  expect(state.values.annotations.value).toBe(false)
  expect(state.values.presence.secret_present).toBe(true)
  expect("value" in state.values.presence).toBe(false)
  expect(
    evaluateSettings(profile, state.values, { row_limit: { kind: "text", text: "-" } }).errors,
  ).toContainEqual(
    expect.objectContaining({ path: "/row_limit", message: "Enter a complete number." }),
  )
  expect(
    evaluateSettings(profile, state.values, { row_limit: { kind: "text", text: "9" } }).errors
      .length,
  ).toBe(1)
  expect(
    evaluateSettings(profile, state.values, {
      annotations: { kind: "value", value: true },
      row_limit: { kind: "text", text: "0" },
    }).changes.set,
  ).toEqual({ annotations: true })
  expect(
    evaluateSettings(profile, state.values, { presence: { kind: "value", value: "refused" } })
      .errors.length,
  ).toBe(1)
  expect(
    groupEvaluation(
      settingsReviewModel("unknown-metadata").groups[0],
      settingsReviewModel("unknown-metadata").states.workspace,
      true,
    ).problem,
  ).toContain("provenance")
  expect(
    groupEvaluation(settingsReviewModel("unsupported-schema").groups[0], model.states.workspace)
      .problem,
  ).toContain("Unsupported")
  expect(
    groupEvaluation(model.groups[0], settingsReviewModel("unknown-field").states.workspace)
      .evaluated?.errors,
  ).toContainEqual(expect.objectContaining({ message: "Unknown settings field." }))
  const absent = settingsReviewModel("not-set").states.appearance!.values.density
  expect(absent.present).toBe(false)
  expect("value" in absent).toBe(false)
  expect("source" in absent).toBe(false)
  const ordered = settingsWizardGroups(model.groups)
  expect(ordered.map((g) => g.id)).toEqual(["workspace", "review-controls", "appearance"])
  const changed = replaceDraft(model.states, "workspace", {
    workspace_label: { kind: "value", value: "Reviewed candidate" },
  })
  expect(settingsWizardEvaluation(ordered, changed).plan).toEqual([
    {
      groupId: "workspace",
      changes: { set: { workspace_label: "Reviewed candidate" }, unset: [] },
    },
  ])
  expect(model.states.workspace!.values.workspace_label.value).toBe("Fixture review lab")
  expect(settingsReviewModel("recorded", "populated", true).source).not.toBe(model.source)
})
async function nativeCallback(
  page: import("@playwright/test").Page,
  locator: import("@playwright/test").Locator,
  key: string,
) {
  await locator.evaluate((n, name) => {
    const prop = Object.keys(n).find((k) => k.startsWith("__reactProps$"))
    const props = prop
      ? (n as unknown as Record<string, { onClick?: () => void }>)[prop]
      : undefined
    ;(window as unknown as Record<string, unknown>)[name] = props?.onClick
  }, key)
}
async function invoke(page: import("@playwright/test").Page, key: string) {
  await page.evaluate((name) => {
    const fn = (window as unknown as Record<string, unknown>)[name]
    if (typeof fn !== "function") throw Error("Current native callback missing")
    fn()
  }, key)
}
test("actual four settings exports provide scalar schema ARIA provenance and local intent only", async ({
  page,
}, info) => {
  const writes: string[] = [],
    external: string[] = [],
    errors: string[] = []
  page.on("request", (r) => {
    if (r.method() !== "GET") writes.push(r.url())
    if (!r.url().startsWith("http://127.0.0.1:")) external.push(r.url())
  })
  page.on("pageerror", (e) => errors.push(e.message))
  await page.goto("/?view=Settings%20Review&theme=p4-white&mode=light")
  await expect(page.getByText("Source: default — Bundled default", { exact: true })).toBeVisible()
  await expect(
    page.getByText("Source: env — Fixture environment declaration", { exact: true }),
  ).toBeVisible()
  await expect(page.getByText("Source: file — Bundled review.toml", { exact: true })).toBeVisible()
  await expect(
    page.getByText("Source: override — Authored local override", { exact: true }),
  ).toBeVisible()
  await expect(page.getByText("Apply state: Pending restart", { exact: true })).toBeVisible()
  await expect(
    page.getByText("The app has not provided an apply action.", { exact: true }),
  ).toBeVisible()
  await expect(page.getByLabel("Review row limit (required)", { exact: true })).toHaveValue("0")
  await expect(page.getByLabel("Include review annotations", { exact: true })).not.toBeChecked()
  await expect(page.getByText("Secret is set", { exact: true })).toBeVisible()
  await expect(page.locator('.settings-review input[type="password"]')).toHaveCount(0)
  for (const name of [
    "Save changes",
    "Apply / restart",
    "Validate changes",
    "Remove staged overrides",
    "Request connectivity check",
  ])
    await expect(page.getByRole("button", { name, exact: true })).toHaveCount(0)
  await page
    .getByRole("button", { name: "Remove override for Directory density", exact: true })
    .click()
  await expect(page.getByLabel("Directory density", { exact: true })).toBeDisabled()
  await page.getByRole("button", { name: "Inspect draft for appearance", exact: true }).click()
  const removal = page.getByRole("dialog", {
    name: "Settings candidate-plan inspection",
    exact: true,
  })
  await expect(removal).toContainText('"unset"')
  await expect(removal).toContainText('"density"')
  await removal.getByRole("button", { name: /Release oldest scripted inspection/ }).click()
  await page.keyboard.press("Escape")
  await expect(page.getByText("Apply state: Pending restart", { exact: true })).toBeVisible()
  await expect(
    page.getByText("Source: override — Authored local override", { exact: true }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Undo removal of Directory density", exact: true }).click()
  await expect(page.getByLabel("Directory density", { exact: true })).toHaveValue("0")
  const limit = page.getByLabel("Review row limit (required)", { exact: true })
  await limit.fill("-")
  await expect(limit).toHaveAttribute("type", "text")
  await expect(limit).toHaveAttribute("aria-invalid", "true")
  await expect(limit).toHaveAttribute("aria-required", "true")
  await expect(limit).not.toHaveAttribute("min", /.+/)
  await expect(page.getByText("Enter a complete number.", { exact: true })).toBeVisible()
  const paint = await limit.evaluate((n) => ({
    fg: getComputedStyle(n).color,
    bg: getComputedStyle(n).backgroundColor,
    border: getComputedStyle(n).borderStyle,
    width: n.getBoundingClientRect().width,
  }))
  expect(paint.bg).not.toBe("rgba(0, 0, 0, 0)")
  expect(paint.border).toBe("solid")
  expect(paint.width).toBeGreaterThan(150)
  expect(
    await page
      .getByText("Enter a complete number.", { exact: true })
      .evaluate((n) => getComputedStyle(n).color),
  ).not.toBe(paint.fg)
  await limit.fill("0")
  await expect(limit).not.toHaveAttribute("aria-invalid", "true")
  await page.getByLabel("Include review annotations", { exact: true }).check()
  await page.getByRole("button", { name: "Inspect draft for review-controls", exact: true }).click()
  const dialog = page.getByRole("dialog", {
    name: "Settings candidate-plan inspection",
    exact: true,
  })
  await expect(dialog).toContainText('"annotations": true')
  await expect(dialog).not.toContainText('"presence"')
  await expect(dialog).not.toContainText('"row_limit"')
  await dialog.getByRole("button", { name: /Release oldest scripted inspection/ }).click()
  await expect(dialog).toContainText("Candidate plan inspected locally")
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("button", { name: "Inspect draft for review-controls", exact: true }),
  ).toBeFocused()
  await page.getByTestId("page-scroll").evaluate((n) => (n.scrollTop = 0))
  await page.screenshot({
    path: info.outputPath("settings-provenance-desktop.png"),
    animations: "disabled",
  })
  await page
    .getByRole("heading", { name: "Authored Review controls", exact: true })
    .scrollIntoViewIfNeeded()
  await page.screenshot({
    path: info.outputPath("settings-scalars-desktop.png"),
    animations: "disabled",
  })
  await page.getByLabel("Settings composition").selectOption("group form")
  await page.getByLabel("Reviewed group").selectOption("review-controls")
  await expect(page.getByLabel("Review row limit (required)", { exact: true })).toHaveValue("0")
  await page.getByLabel("Review row limit (required)", { exact: true }).fill("4")
  await page.getByLabel("Review row limit (required)", { exact: true }).press("Enter")
  await expect(dialog).not.toBeVisible()
  await expect(page.getByRole("button", { name: "Save changes", exact: true })).toHaveCount(0)
  await page.getByLabel("Settings composition").selectOption("grouped")
  await expect(page.locator(".settings-review form")).toHaveCount(3)
  expect(writes).toEqual([])
  expect(external).toEqual([])
  expect(errors).toEqual([])
})
test("wizard native guarded plan review and stale review callback cannot bypass Back or edit", async ({
  page,
}, info) => {
  await page.goto("/?view=Settings%20Review")
  await page.getByLabel("Settings composition").selectOption("wizard")
  await page.getByLabel("Workspace label (required)", { exact: true }).fill("Reviewed candidate")
  await page.getByRole("button", { name: "Next", exact: true }).click()
  await expect(
    page.getByText("Step 2 of 4: Authored Review controls", { exact: true }),
  ).toBeVisible()
  await page.getByLabel("Review row limit (required)", { exact: true }).fill("-")
  await expect(page.getByRole("button", { name: "Next", exact: true })).toBeDisabled()
  await page.getByLabel("Review row limit (required)", { exact: true }).fill("8")
  await page.getByLabel("Include review annotations", { exact: true }).check()
  await page.getByRole("button", { name: "Next", exact: true }).click()
  await page.getByLabel("Directory density", { exact: true }).selectOption("1")
  await page.getByRole("button", { name: "Next", exact: true }).click()
  const submit = page.getByRole("button", { name: "Submit setup", exact: true })
  await nativeCallback(page, submit, "oldSettingsSubmit")
  await page.getByRole("button", { name: "Back", exact: true }).click()
  await invoke(page, "oldSettingsSubmit")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.getByLabel("Directory density", { exact: true }).selectOption("0")
  await invoke(page, "oldSettingsSubmit")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.getByRole("button", { name: "Next", exact: true }).click()
  await submit.focus()
  await page.keyboard.press("Enter")
  const dialog = page.getByRole("dialog", {
    name: "Settings candidate-plan inspection",
    exact: true,
  })
  await expect(dialog).toContainText("Reviewed candidate")
  await expect(dialog).toContainText('"row_limit": 8')
  await expect(dialog).not.toContainText('"density"')
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab")
    await expect.poll(() => dialog.evaluate((n) => n.contains(document.activeElement))).toBe(true)
  }
  const dialogBounds = await dialog.boundingBox()
  for (const button of await dialog.getByRole("button").all()) {
    const box = await button.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.x).toBeGreaterThanOrEqual(dialogBounds!.x)
    expect(box!.x + box!.width).toBeLessThanOrEqual(dialogBounds!.x + dialogBounds!.width)
    expect(box!.y + box!.height).toBeLessThanOrEqual(dialogBounds!.y + dialogBounds!.height)
  }
  const utc = dialog.locator("dl > div").filter({ hasText: "Fixed UTC" })
  expect((await utc.boundingBox())!.width).toBeGreaterThan(300)
  await page.screenshot({
    path: info.outputPath("settings-plan-desktop.png"),
    animations: "disabled",
  })
  await page.keyboard.press("Escape")
  await expect(submit).toBeFocused()
  await page
    .getByTestId("page-scroll")
    .getByRole("button", { name: /Release oldest scripted inspection/ })
    .click()
  await expect(page.getByText("Candidate plan inspected locally", { exact: false })).toHaveCount(0)
  await page.getByTestId("page-scroll").evaluate((n) => (n.scrollTop = 0))
  await page.screenshot({
    path: info.outputPath("settings-wizard-desktop.png"),
    animations: "disabled",
  })
})
test("settings source state selection reset and unmount retire held inspections and callbacks", async ({
  page,
}) => {
  await page.goto("/?view=Settings%20Review")
  await page.getByLabel("Settings composition").selectOption("group form")
  await page.getByLabel("Workspace label (required)", { exact: true }).fill("Held label")
  const inspect = page.getByRole("button", { name: "Inspect draft for workspace", exact: true })
  await nativeCallback(page, inspect, "oldSettingsInspect")
  await inspect.click()
  const dialog = page.getByRole("dialog", {
    name: "Settings candidate-plan inspection",
    exact: true,
  })
  await nativeCallback(
    page,
    dialog.getByRole("button", { name: "Close plan inspection", exact: true }),
    "oldSettingsClose",
  )
  await page.keyboard.press("Escape")
  await page.getByLabel("Workspace label (required)", { exact: true }).fill("New label")
  await invoke(page, "oldSettingsInspect")
  await expect(dialog).not.toBeVisible()
  await inspect.click()
  await invoke(page, "oldSettingsClose")
  await expect(dialog).toBeVisible()
  await dialog.getByRole("button", { name: /Release oldest scripted inspection/ }).click()
  await expect(dialog).toContainText("Held local inspection")
  await dialog.getByRole("button", { name: /Release oldest scripted inspection/ }).click()
  await expect(dialog).toContainText("Candidate plan inspected locally")
  await dialog.getByRole("button", { name: "Reset settings context", exact: true }).click()
  await expect(dialog).not.toBeVisible()
  await expect(page.getByLabel("Workspace label (required)", { exact: true })).toHaveValue(
    "Fixture review lab",
  )
  await invoke(page, "oldSettingsInspect")
  await expect(dialog).not.toBeVisible()
  await inspect.click()
  await page.keyboard.press("Escape")
  await page.getByLabel("Reviewed settings source").selectOption("copy")
  await page
    .getByTestId("page-scroll")
    .getByRole("button", { name: /Release oldest scripted inspection/ })
    .click()
  await expect(dialog).not.toBeVisible()
  await expect(page.getByTestId("settings-source")).toContainText("reviewed-copy")
  await page.getByLabel("Settings appearance").selectOption("locked")
  await expect(page.locator(".settings-review form input")).toHaveCount(0)
  await invoke(page, "oldSettingsInspect")
  await expect(dialog).not.toBeVisible()
  await page.getByLabel("Settings appearance").selectOption("unknown-metadata")
  await page.getByLabel("Settings composition").selectOption("provenance")
  await expect(
    page.getByText("Settings provenance is missing or unsupported. This group cannot be changed.", {
      exact: true,
    }),
  ).toBeVisible()
  await page.getByLabel("Settings appearance").selectOption("unsupported-schema")
  await expect(
    page.getByText("Unsupported field schema: only flat scalars and enums are available.", {
      exact: true,
    }),
  ).toBeVisible()
  await page.getByLabel("Settings appearance").selectOption("unknown-field")
  await expect(page.getByText("Unknown settings field.", { exact: true })).toBeVisible()
  await page.getByLabel("Settings appearance").selectOption("denied")
  await expect(page.locator(".settings-review form input")).toHaveCount(0)
  await expect(page.getByText("Fixture review lab", { exact: true })).toHaveCount(0)
  await page.getByRole("button", { name: "Activity", exact: true }).click()
  await invoke(page, "oldSettingsInspect")
  await expect(dialog).not.toBeVisible()
})
test("narrow dark portable settings show locked not-set error busy and empty states without APIs", async ({
  page,
}, info) => {
  await page.goto("/?view=Settings%20Review&theme=p1-green-phosphor&mode=dark")
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByLabel("Settings appearance").selectOption("long")
  await expect(page.getByLabel("Theme")).toHaveValue("p1-green-phosphor")
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true)
  await page
    .getByRole("heading", { name: "Desired workspace", exact: true })
    .scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath("settings-narrow.png"), animations: "disabled" })
  await page
    .getByRole("heading", { name: "Authored Review controls", exact: true })
    .scrollIntoViewIfNeeded()
  await page.screenshot({
    path: info.outputPath("settings-scalars-narrow.png"),
    animations: "disabled",
  })
  await page.getByLabel("Workspace label (required)", { exact: true }).fill("Narrow candidate")
  await page.getByRole("button", { name: "Inspect draft for workspace", exact: true }).click()
  const dialog = page.getByRole("dialog", {
    name: "Settings candidate-plan inspection",
    exact: true,
  })
  await expect(
    dialog.getByRole("button", { name: "Reset settings context", exact: true }),
  ).toBeInViewport()
  await page.screenshot({
    path: info.outputPath("settings-plan-narrow.png"),
    animations: "disabled",
  })
  await dialog.locator(".evidence-json").scrollIntoViewIfNeeded()
  await expect(dialog.locator(".evidence-json")).toContainText("Narrow candidate")
  await expect(
    dialog.getByRole("button", { name: "Reset settings context", exact: true }),
  ).toBeInViewport()
  await page.screenshot({
    path: info.outputPath("settings-plan-payload-narrow.png"),
    animations: "disabled",
  })
  await page.keyboard.press("Escape")
  const api: string[] = []
  page.on("request", (r) => {
    if (/\/(api|plugins)\//.test(r.url())) api.push(r.url())
  })
  for (const [story, text] of [
    ["empty", "Known empty settings manifest"],
    ["loading", "Waiting for a settings snapshot."],
    ["read-failure", "Authored read-error appearance"],
    ["not-set", "Not set. Defaults are resolved by the host."],
    ["busy", "Working…"],
  ]) {
    await page.goto(
      `http://127.0.0.1:18542/iframe.html?id=settings-controlled-field-review--${story}&viewMode=story`,
    )
    await expect(page.getByText(text, { exact: false }).first()).toBeVisible()
    if (story === "busy")
      await expect(page.getByLabel("Workspace label (required)", { exact: true })).toBeDisabled()
    if (story === "not-set")
      await expect(page.getByLabel("Directory density", { exact: true })).toHaveValue("")
  }
  expect(api).toEqual([])
})
test("development StrictMode creates fresh session after replay and retires earlier source callbacks", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (e) => errors.push(e.message))
  await page.goto("http://127.0.0.1:18545/?view=Settings%20Review")
  await page
    .getByLabel("Workspace label (required)", { exact: true })
    .fill("Strict lifecycle candidate")
  const inspect = page.getByRole("button", { name: "Inspect draft for workspace", exact: true })
  await nativeCallback(page, inspect, "strictOldInspect")
  await inspect.click()
  const dialog = page.getByRole("dialog", {
    name: "Settings candidate-plan inspection",
    exact: true,
  })
  await expect(dialog).toBeVisible()
  await dialog.getByRole("button", { name: /Release oldest scripted inspection/ }).click()
  await expect(dialog).toContainText("Candidate plan inspected locally")
  await page.keyboard.press("Escape")
  await page.getByLabel("Reviewed settings source").selectOption("copy")
  await invoke(page, "strictOldInspect")
  await expect(dialog).not.toBeVisible()
  await expect(page.getByLabel("Workspace label (required)", { exact: true })).toHaveValue(
    "Fixture review lab",
  )
  await inspect.click()
  await dialog.getByRole("button", { name: /Release oldest scripted inspection/ }).click()
  await expect(dialog).toContainText("Candidate plan inspected locally")
  expect(errors).toEqual([])
})
