import { expect, test } from "@playwright/test"

test("embedded admin preserves provenance and fences edited or retired scripted outcomes", async ({
  page,
}, info) => {
  const writes: string[] = []
  page.on("request", (r) => {
    if (!["GET", "HEAD"].includes(r.method())) writes.push(r.url())
  })
  await page.goto("/?view=Administration&mode=light")
  await page
    .getByRole("group", { name: "Canonical admin pages" })
    .getByRole("button", { name: "Settings", exact: true })
    .click()
  const label = page.getByRole("textbox", { name: "Workspace label", exact: true })
  await expect(label).toHaveValue("Fixture review lab")
  await expect(page.getByRole("textbox", { name: "Message transport", exact: true })).toBeDisabled()
  await expect(page.getByText("Bundled default", { exact: false })).toBeVisible()
  await label.fill("First local draft")
  await page.getByRole("button", { name: "Save changes", exact: true }).click()
  await page.getByRole("button", { name: "Close intent" }).click()
  await label.fill("Replacement draft")
  await page.getByRole("button", { name: "Release scripted outcomes" }).click()
  await expect(label).toHaveValue("Replacement draft")
  await expect(page.getByText(/Scripted update refusal/)).toHaveCount(0)
  await expect(
    page.getByText("Scripted outcome reviewed; no business effects", { exact: true }),
  ).toHaveCount(0)
  await page.getByRole("button", { name: "Save changes", exact: true }).click()
  await page.getByRole("button", { name: "Close intent" }).click()
  await page.getByRole("button", { name: "Release scripted outcomes" }).click()
  await expect(
    page.getByText("Scripted update refusal; draft retained, nothing saved"),
  ).toBeVisible()
  await label.fill("Later draft")
  await page.getByRole("button", { name: "Save changes", exact: true }).click()
  await page.getByLabel("Admin state").selectOption("read-only")
  await page.getByRole("button", { name: "Release retired outcomes" }).click()
  await expect(page.getByText(/Scripted update refusal/)).toHaveCount(0)
  await page
    .getByRole("group", { name: "Canonical admin pages" })
    .getByRole("button", { name: "Settings", exact: true })
    .click()
  await expect(page.getByRole("textbox", { name: "Workspace label", exact: true })).toBeDisabled()
  await expect(page.getByRole("button", { name: "Save changes", exact: true })).toHaveCount(0)
  await page.getByLabel("Admin state").selectOption("ready")
  await page
    .getByRole("group", { name: "Canonical admin pages" })
    .getByRole("button", { name: "Settings", exact: true })
    .click()
  await page.screenshot({
    animations: "disabled",
    path: info.outputPath("admin-settings-desktop.png"),
  })
  await page.getByRole("button", { name: "Desired appearance", exact: true }).click()
  await expect(
    page.getByText("Source: override — Authored local override", { exact: true }),
  ).toBeVisible()
  await expect(page.getByText("Apply state: Pending restart", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Apply / restart", exact: true }).click()
  await page.getByRole("button", { name: "Close intent" }).click()
  await page.getByRole("button", { name: "Release scripted outcomes" }).click()
  await expect(
    page.getByText("Scripted restart refusal; pending application remains", { exact: true }),
  ).toBeVisible()
  await expect(page.getByText("Apply state: Pending restart", { exact: true })).toBeVisible()
  await page.screenshot({
    animations: "disabled",
    path: info.outputPath("admin-pending-restart-desktop.png"),
  })
  expect(writes).toEqual([])
})
test("admin setup independent checks and canonical failures stay truthful", async ({
  page,
}, info) => {
  await page.goto("/?view=Administration")
  await page.getByLabel("Admin state").selectOption("setup")
  await page.getByRole("button", { name: "Inspect all prerequisite checks" }).click()
  await page.getByRole("button", { name: "Close intent" }).click()
  await page.getByRole("button", { name: "Release scripted outcomes" }).click()
  await expect(
    page.getByText("Scripted fixture check only; no connectivity tested", { exact: true }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Next", exact: true }).click()
  await expect(
    page.getByText("Scripted fixture check only; no connectivity tested", { exact: true }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Next", exact: true }).click()
  await expect(page.getByText("Connectivity check: OK", { exact: true })).toHaveCount(2)
  await page.screenshot({
    animations: "disabled",
    path: info.outputPath("admin-setup-desktop.png"),
  })
  await page.getByRole("button", { name: "Submit setup", exact: true }).click()
  await page.getByRole("button", { name: "Close intent" }).click()
  await page.getByRole("button", { name: "Release scripted outcomes" }).click()
  await expect(page.getByText("Save result: Failed", { exact: true })).toHaveCount(2)
  await page.getByLabel("Admin state").selectOption("ready")
  await page
    .getByRole("group", { name: "Canonical admin pages" })
    .getByRole("button", { name: "Status", exact: true })
    .click()
  await expect(page.getByText("Observed fixture runtime", { exact: true })).toBeVisible()
  await expect(page.getByRole("textbox", { name: "Workspace label", exact: true })).toHaveCount(0)
  await page.screenshot({
    animations: "disabled",
    path: info.outputPath("admin-status-desktop.png"),
  })
  await page
    .getByRole("group", { name: "Canonical admin pages" })
    .getByRole("button", { name: "Diagnostics", exact: true })
    .click()
  await expect(page.getByText("Observed fixture diagnostics", { exact: true })).toBeVisible()
  await page.getByLabel("Admin state").selectOption("stale")
  await page
    .getByRole("group", { name: "Canonical admin pages" })
    .getByRole("button", { name: "Status", exact: true })
    .click()
  await expect(page.getByText("Stale", { exact: true })).toHaveCount(2)
  await page.getByLabel("Admin state").selectOption("missing")
  await page
    .getByRole("group", { name: "Canonical admin pages" })
    .getByRole("button", { name: "Status", exact: true })
    .click()
  await expect(page.getByText("Observation unavailable", { exact: true })).toHaveCount(2)
  await page.getByLabel("Admin state").selectOption("initial-error")
  await expect(page.getByText(/Scripted discovery failure/)).toBeVisible()
  await page.getByLabel("Admin state").selectOption("group-error")
  await page
    .getByRole("group", { name: "Canonical admin pages" })
    .getByRole("button", { name: "Settings", exact: true })
    .click()
  await expect(page.getByText(/Scripted workspace read failure/)).toBeVisible()
  await page.getByLabel("Admin state").selectOption("refresh-error")
  await page
    .getByRole("group", { name: "Canonical admin pages" })
    .getByRole("button", { name: "Settings", exact: true })
    .click()
  await expect(page.getByRole("button", { name: "Save changes", exact: true })).toHaveCount(0)
  await page.getByLabel("Admin state").selectOption("denied")
  await expect(page.getByRole("textbox", { name: "Workspace label", exact: true })).toHaveCount(0)
})
test("account candidate drafts and related directories stay local with fail-closed identity", async ({
  page,
}, info) => {
  const writes: string[] = []
  page.on("request", (r) => {
    if (!["GET", "HEAD"].includes(r.method())) writes.push(r.url())
  })
  await page.goto("/?view=Account&mode=light")
  const identity = page.getByLabel("Current identity"),
    initial = await identity.textContent()
  await page.getByLabel("Display name", { exact: true }).fill("Unsaved alias")
  await expect(identity).toHaveText(initial ?? "")
  await page.getByRole("button", { name: "Save profile", exact: true }).click()
  await expect(page.getByText(/Profile intent inspected/)).toBeVisible()
  await page.getByRole("button", { name: "Close intent" }).click()
  await page.screenshot({
    animations: "disabled",
    path: info.outputPath("account-profile-desktop.png"),
  })
  await page.getByRole("button", { name: "Users", exact: true }).click()
  await page.getByRole("button", { name: /USER-003/ }).click()
  await expect(page.getByText(/USER-003 · CONTACT-003 · locked/)).toBeVisible()
  await page.getByRole("button", { name: /ROLE-OBSERVER/ }).click()
  await expect(page.getByRole("heading", { name: "Fixture observer", exact: true })).toBeVisible()
  await expect(page.getByText(/PERMISSION-READ · Inspect records/)).toBeVisible()
  await page.screenshot({
    animations: "disabled",
    path: info.outputPath("account-roles-desktop.png"),
  })
  for (const state of ["unknown", "error", "locked"]) {
    await page.getByLabel("Account state").selectOption(state)
    await expect(page.getByRole("button", { name: "Save profile", exact: true })).toHaveCount(0)
    await page.getByRole("button", { name: "Access metadata", exact: true }).click()
    await expect(page.getByRole("button", { name: "Create token", exact: true })).toHaveCount(0)
  }
  await page.getByLabel("Account state").selectOption("denied")
  await expect(page.getByText("Account access denied", { exact: true })).toBeVisible()
  await expect(page.getByLabel("Display name", { exact: true })).toHaveCount(0)
  expect(writes).toEqual([])
})
test("admin and account portable stories use no API and keep one narrow scroll owner", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/?view=Account&theme=p3-amber-phosphor&mode=dark")
  await page.screenshot({ animations: "disabled", path: info.outputPath("account-narrow.png") })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  const owners = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("main *")]
      .filter(
        (e) =>
          e.scrollHeight > e.clientHeight + 1 &&
          ["auto", "scroll"].includes(getComputedStyle(e).overflowY),
      )
      .map((e) => e.dataset.testid ?? e.className),
  )
  expect(owners).toEqual(["page-scroll"])
  await page.getByRole("button", { name: "Administration", exact: true }).click()
  await page
    .getByRole("group", { name: "Canonical admin pages" })
    .getByRole("button", { name: "Settings", exact: true })
    .click()
  await page.screenshot({
    animations: "disabled",
    path: info.outputPath("admin-settings-narrow.png"),
  })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy()
  const requests: string[] = []
  page.on("request", (r) => {
    if (/\/(api|plugins)\//.test(r.url())) requests.push(r.url())
  })
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=administration-controlled-review--profile-draft&viewMode=story",
  )
  await expect(page.getByLabel("Display name", { exact: true })).toHaveValue(
    "Unsaved fixture alias",
  )
  expect(requests).toEqual([])
})
