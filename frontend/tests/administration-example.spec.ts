import { expect, test } from "@playwright/test"

const entry = "/?example=administration&theme=p4-white&mode=light"
test("administration directory typing routes native profile roles permissions and current principal remain distinct", async ({
  page,
}, info) => {
  await page.goto(entry)
  const search = page.getByRole("textbox", { name: "Search administration directory", exact: true })
  await search.pressSequentially("Adaline")
  await expect(search).toBeFocused()
  expect(await search.evaluate((n: any) => n.selectionStart)).toBe(7)
  await expect(search).toHaveValue("Adaline")
  await page.screenshot({ path: info.outputPath("administration-directory-desktop.png") })
  await page.getByRole("button", { name: /Adaline Rivera.*USER-001/ }).click()
  await expect(page).toHaveURL(/page=profile.*user=USER-001/)
  const tabs = page.getByRole("tablist", { name: "Directory profile sections", exact: true })
  await tabs.getByRole("tab", { name: "Profile", exact: true }).click()
  await page.keyboard.press("ArrowRight")
  await expect(tabs.getByRole("tab", { name: "Roles", exact: true })).toBeFocused()
  await expect(page.getByRole("tab", { name: "Profile", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  )
  await page.keyboard.press("Enter")
  await expect(page).toHaveURL(/page=roles/)
  await expect(page.locator(".directory-embedded")).toContainText("ROLE-REVIEWER")
  await page.getByRole("tab", { name: "Permissions", exact: true }).click()
  await expect(page.locator(".directory-embedded")).toContainText("PERMISSION-DRAFT")
  await page.screenshot({ path: info.outputPath("administration-permissions-desktop.png") })
  await page.reload()
  await expect(page.locator(".directory-embedded")).toContainText("PERMISSION-REVIEW")
  await page.getByRole("link", { name: "Directory", exact: true }).click()
  await page.getByRole("textbox", { name: "Search administration directory", exact: true }).fill("")
  await page.getByRole("button", { name: /Della Rivera.*USER-003/ }).click()
  await page.getByRole("link", { name: "Current Account", exact: true }).click()
  await expect(page.locator(".administration-page")).toContainText("Current principal · USER-001")
  await expect(page.getByLabel("Display name", { exact: true })).toHaveValue("Adaline Rivera")
  await expect(page.locator(".administration-page")).toContainText(
    "selected directory user USER-003",
  )
  await expect.poll(() => page.locator(".administration-page").evaluate((n) => n.scrollTop)).toBe(0)
  await page.screenshot({ path: info.outputPath("administration-current-account-desktop.png") })
  const preferences = page.getByLabel("Show authored annotations", { exact: true })
  expect((await preferences.boundingBox())!.width).toBeLessThan(30)

  await page.goBack()
  await expect(page.getByLabel("Selected administration user", { exact: true })).toHaveValue(
    "USER-003",
  )
  await page.goto(entry + "&page=profile&user=USER-ABSENT")
  await expect(page.locator(".administration-page")).toContainText("No admitted profile selected")
})
test("desired settings native readonly provenance preserves source locks restart values and setup remains unreported", async ({
  page,
}, info) => {
  await page.goto(entry + "&page=settings")
  const settings = page.getByRole("region", { name: "Desired settings provenance", exact: true })
  await expect(settings.locator("input,textarea,select")).toHaveCount(0)
  await expect(
    settings.getByRole("button", { name: /Save|Reset|Apply|Check|Remove override/ }),
  ).toHaveCount(0)
  for (const value of [
    "Fixture review lab",
    "disabled",
    "14 days",
    "comfortable",
    "Pending restart",
  ])
    await expect(settings).toContainText(value)
  await expect(settings).toContainText("Locked by the fixture environment")
  await page.screenshot({ path: info.outputPath("administration-settings-desktop.png") })
  await page.getByRole("link", { name: "Setup Preview", exact: true }).click()
  await expect(
    page.getByRole("region", { name: "Read-only setup plan preview", exact: true }),
  ).toContainText("Check result: Unreported")
  await expect(page.locator(".administration-setup-list li")).toHaveCount(4)
  await expect(page.getByRole("button", { name: /Submit setup|Complete|Check/ })).toHaveCount(0)
  await page.screenshot({ path: info.outputPath("administration-setup-desktop.png") })
})
test("StrictMode local account draft inspection releases without changing principal and page retirement refuses old producers", async ({
  page,
}, info) => {
  await page.goto("http://127.0.0.1:18545" + entry + "&page=account&user=USER-003")
  await page.getByLabel("Display name", { exact: true }).fill("Local alias candidate")
  const save = page.getByRole("button", { name: "Save profile", exact: true })
  await save.click()
  const modal = page.getByRole("dialog", { name: "Local account candidate intent", exact: true })
  await expect(modal).toContainText("USER-001")
  await expect.poll(() => modal.evaluate((n) => getComputedStyle(n).opacity)).toBe("1")
  const release = modal.getByRole("button", {
    name: "Release oldest scripted inspection",
    exact: true,
  })
  await release.evaluate((n) => {
    const k = Object.keys(n).find((k) => k.startsWith("__reactProps$"))!
    ;(window as any).oldRelease = (n as any)[k].onClick
  })
  await page.screenshot({ path: info.outputPath("administration-account-intent-desktop.png") })
  await page.keyboard.press("Escape")
  await page.getByRole("link", { name: "Desired Settings", exact: true }).click()
  await page.getByRole("link", { name: "Current Account", exact: true }).click()
  await page.evaluate(() => (window as any).oldRelease())
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(page.getByLabel("Display name", { exact: true })).toHaveValue("Adaline Rivera")
  await save.click()
  await release.click()
  await expect(modal).toContainText("Candidate intent inspected locally")
  await expect(page.getByLabel("Current identity")).toContainText("Adaline Rivera")
})
test("directory popup current source query page and held callback retirement retain fresh native inspection", async ({
  page,
}) => {
  await page.goto(entry + "&page=profile&user=USER-001")
  await page.getByRole("button", { name: "Inspect provenance", exact: true }).click()
  const popup = page.getByRole("dialog", { name: "Directory provenance", exact: true })
  await popup.getByRole("button", { name: "Inspect current metadata", exact: true }).click()
  const release = popup.getByRole("button", { name: /Release oldest metadata inspection/ })
  await release.evaluate((n) => {
    const k = Object.keys(n).find((k) => k.startsWith("__reactProps$"))!
    ;(window as any).oldMetadataRelease = (n as any)[k].onClick
  })
  await page.keyboard.press("Escape")
  await expect(page.getByRole("button", { name: "Inspect provenance", exact: true })).toBeFocused()
  await page.getByRole("link", { name: "Directory", exact: true }).click()
  await page
    .getByRole("textbox", { name: "Search administration directory", exact: true })
    .fill("Adaline")
  await page.getByRole("button", { name: /Adaline Rivera.*USER-001/ }).click()
  await page.evaluate(() => (window as any).oldMetadataRelease())
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.getByRole("button", { name: "Inspect provenance", exact: true }).click()
  await popup.getByRole("button", { name: "Inspect current metadata", exact: true }).click()
  await popup.getByRole("button", { name: /Release oldest metadata inspection/ }).click()
  await expect(popup).toContainText("Inspected USER-001 supplied relationship metadata only")
})
test("390 dark and short administration navigation settings native scroll setup tail and account dialog stay bounded", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 650 })
  await page.goto(entry.replace("p4-white", "p1-green-phosphor").replace("light", "dark"))
  await page.getByRole("button", { name: "Menu", exact: true }).click()
  const nav = page.getByRole("dialog", { name: "Administration navigation", exact: true })
  await expect.poll(() => nav.evaluate((n) => getComputedStyle(n).opacity)).toBe("1")
  await page.screenshot({ path: info.outputPath("administration-navigation-narrow.png") })
  await nav.getByRole("link", { name: "Desired Settings", exact: true }).click()
  await expect(nav).toHaveCount(0)
  await expect(page.getByRole("heading", { name: "Desired Settings", exact: true })).toBeFocused()
  await page.screenshot({ path: info.outputPath("administration-settings-top-narrow.png") })
  const body = page.getByRole("main", { name: "Administration page", exact: true })
  await body.hover()
  await page.mouse.wheel(0, 2200)
  await expect
    .poll(() => body.evaluate((n) => n.scrollHeight - n.clientHeight - n.scrollTop))
    .toBeLessThan(2)
  await page.screenshot({ path: info.outputPath("administration-settings-tail-narrow.png") })
  const raw = page.getByRole("region", { name: "Supplied settings metadata", exact: true })
  await raw.click({ position: { x: 3, y: 3 } })
  await expect(raw).toBeFocused()
  await raw.press("Control+End")
  await expect
    .poll(() => raw.evaluate((n) => n.scrollHeight - n.clientHeight - n.scrollTop))
    .toBeLessThan(2)
  const last = raw.locator("tbody tr").last()
  await expect
    .poll(async () => {
      const r = (await last.boundingBox())!,
        v = (await raw.boundingBox())!
      return r.y >= v.y && r.y + r.height <= v.y + v.height && r.y + r.height <= 650
    })
    .toBe(true)
  await expect(last).toContainText("Authored local override")
  await page.screenshot({ path: info.outputPath("administration-settings-raw-end-narrow.png") })

  await page.getByRole("button", { name: "Menu", exact: true }).click()
  await nav.getByRole("link", { name: "Setup Preview", exact: true }).click()
  await body.hover()
  await page.mouse.wheel(0, 2200)
  await expect
    .poll(() => body.evaluate((n) => n.scrollHeight - n.clientHeight - n.scrollTop))
    .toBeLessThan(2)
  await page.screenshot({ path: info.outputPath("administration-setup-tail-narrow.png") })
  await page.setViewportSize({ width: 390, height: 500 })
  for (const region of [
    page.locator(".administration-header"),
    page.locator(".administration-example-footer"),
  ]) {
    const r = (await region.boundingBox())!
    expect(r.y).toBeGreaterThanOrEqual(0)
    expect(r.y + r.height).toBeLessThanOrEqual(500)
  }
  expect((await body.boundingBox())!.height).toBeGreaterThan(250)
  await page.screenshot({ path: info.outputPath("administration-short-narrow.png") })
  await page.getByRole("button", { name: "Menu", exact: true }).click()
  await nav.getByRole("link", { name: "Current Account", exact: true }).click()
  await page.getByLabel("Display name", { exact: true }).fill("Narrow local alias")
  await page.getByRole("button", { name: "Save profile", exact: true }).click()
  const modal = page.getByRole("dialog", { name: "Local account candidate intent", exact: true })
  await expect.poll(() => modal.evaluate((n) => getComputedStyle(n).opacity)).toBe("1")
  const modalBody = modal.locator(".settings-plan-body")
  await modalBody.hover()
  await page.mouse.wheel(0, -2000)
  await expect.poll(() => modalBody.evaluate((n) => n.parentElement!.scrollTop)).toBe(0)
  await page.screenshot({ path: info.outputPath("administration-account-top-narrow.png") })
  await modalBody.hover()
  await page.mouse.wheel(0, 2000)
  await expect
    .poll(() =>
      modalBody.evaluate(
        (n) =>
          n.parentElement!.scrollHeight -
          n.parentElement!.clientHeight -
          n.parentElement!.scrollTop,
      ),
    )
    .toBeLessThan(2)
  const footer = modal.locator(".settings-plan-footer")
  for (const label of [
    "Release oldest scripted inspection",
    "Close inspection",
    "Reset account review",
  ]) {
    const button = modal.getByRole("button", { name: label, exact: true })
    const r = (await button.boundingBox())!,
      f = (await footer.boundingBox())!
    expect(r.x).toBeGreaterThanOrEqual(0)
    expect(r.x + r.width).toBeLessThanOrEqual(390)
    expect(r.y).toBeGreaterThanOrEqual(f.y)
    expect(r.y + r.height).toBeLessThanOrEqual(500)
  }
  await modal
    .getByRole("button", { name: "Release oldest scripted inspection", exact: true })
    .click()
  await expect(modal).toContainText("Candidate intent inspected locally")
  await page.screenshot({ path: info.outputPath("administration-account-tail-narrow.png") })
  await page.keyboard.press("Escape")
  await expect(page.getByRole("button", { name: "Save profile", exact: true })).toBeFocused()
  await page.getByRole("button", { name: "Save profile", exact: true }).click()
  await modal.getByRole("button", { name: "Reset account review", exact: true }).click()
  await expect(modal).toHaveCount(0)
  await expect(page.getByRole("heading", { name: "Current Account", exact: true })).toBeFocused()
  await expect(page.getByLabel("Display name", { exact: true })).toHaveValue("Adaline Rivera")

  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})
test("all fullscreen administration stories remain API-free with honest blocked empty locked and escaped metadata", async ({
  page,
}) => {
  const effects: string[] = []
  page.on("request", (r) => {
    if (r.method() !== "GET" || r.url().includes("/api/")) effects.push(r.url())
  })
  await page.setViewportSize({ width: 390, height: 650 })
  for (const story of [
    "directory",
    "profile",
    "roles",
    "permissions",
    "current-account",
    "desired-settings",
    "setup-preview",
    "empty",
    "loading",
    "resource-error",
    "denied",
    "unknown",
    "locked",
    "long-profile",
    "missing-relationship",
    "retained-degraded",
  ]) {
    await page.goto(
      `http://127.0.0.1:18542/iframe.html?id=app-examples-administration--${story}&viewMode=story`,
    )
    await expect(page.locator(".administration-example")).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    if (["loading", "resource-error", "denied", "unknown"].includes(story)) {
      await expect(page.locator(".administration-page")).toContainText("count Unknown")
      await expect(page.locator(".administration-page input")).toHaveCount(0)
    }
    if (story === "empty")
      await expect(page.locator(".administration-page")).toContainText("0 supplied users/settings")
    if (story === "locked") {
      await expect(page.getByLabel("Display name", { exact: true })).toHaveAttribute("readonly", "")
      await expect(page.getByRole("button", { name: "Save profile", exact: true })).toHaveCount(0)
    }
    if (story === "missing-relationship")
      await expect(page.locator(".directory-embedded")).toContainText("Unknown permission count")
    if (story === "long-profile") {
      await expect(page.locator(".directory-embedded")).toContainText("<script>alert(1)</script>")
      await expect(page.locator(".administration-page script")).toHaveCount(0)
    }
  }
  expect(effects).toEqual([])
})
