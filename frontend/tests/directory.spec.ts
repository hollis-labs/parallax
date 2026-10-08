import { expect, test } from "@playwright/test"
import { directoryModel, relationships } from "../src/directory-review/model"

test("directory supplied joins distinguish missing metadata from successful empty and deny personal records", () => {
  const d = directoryModel("recorded")
  expect(d.fixture.clock).toBe("2026-10-04T14:30:00Z")
  expect(relationships(d, "USER-001")?.permissions).toHaveLength(3)
  expect(relationships(d, "USER-003")?.permissions).toHaveLength(1)
  expect(relationships(directoryModel("missing"), "USER-001")?.complete).toBe(false)
  expect(directoryModel("empty").users).toHaveLength(0)
  expect(directoryModel("recorded", "permission-denied").users).toHaveLength(0)
  expect(relationships(d, "absent")).toBeNull()
})
test("native readonly Card slots Badge and Tabs retain exact profile relationships and keyboard activation", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto("/?view=Directory+Review")
  await expect(page.getByRole("heading", { name: "Adaline Rivera", exact: true })).toBeVisible()
  const card = page.getByTestId("directory-card")
  for (const slot of [
    "card-header",
    "card-title",
    "card-description",
    "card-action",
    "card-content",
    "card-footer",
  ])
    await expect(card.locator(`[data-slot=${slot}]`)).toBeVisible()
  await expect(card.locator("[data-slot=badge]").first()).not.toHaveAttribute("role", "button")
  const profile = page.getByRole("tab", { name: "Profile", exact: true })
  await profile.focus()
  await page.keyboard.press("ArrowRight")
  await expect(page.getByRole("tab", { name: "Roles", exact: true })).toBeFocused()
  await expect(profile).toHaveAttribute("aria-selected", "true")
  await page.keyboard.press("Enter")
  await expect(page.getByRole("heading", { name: "Supplied roles" })).toBeVisible()
  await page.keyboard.press("End")
  await page.keyboard.press("Space")
  await expect(page.getByRole("heading", { name: "Supplied permissions" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Inspect records" })).toBeVisible()
  await page.keyboard.press("Home")
  await page.keyboard.press("Enter")
  await expect(page.getByRole("heading", { name: "Readonly profile" })).toBeVisible()
  await page.screenshot({ path: info.outputPath("directory-desktop.png"), animations: "disabled" })
})
test("native provenance popup current Escape focus and selected source retirement never restore old payload", async ({
  page,
}, info) => {
  await page.goto("/?view=Directory+Review")
  const trigger = page.getByRole("button", { name: "Inspect provenance", exact: true })
  await trigger.focus()
  await page.keyboard.press("Enter")
  await expect(page.getByRole("heading", { name: "Supplied provenance" })).toBeVisible()
  await page.getByRole("button", { name: "Inspect current metadata" }).click()
  await page.getByRole("button", { name: /Release oldest metadata inspection/ }).click()
  await expect(page.getByRole("status").filter({ hasText: "Inspected USER-001" })).toBeVisible()
  await page.screenshot({
    path: info.outputPath("directory-provenance-desktop.png"),
    animations: "disabled",
  })
  await page.keyboard.press("Escape")
  await expect(trigger).toBeFocused()
  await page.getByRole("button", { name: /USER-002 ·/ }).click()
  await trigger.click()
  await expect(page.getByText("Selected USER-002;", { exact: false })).toBeVisible()
  await expect(page.getByText("Inspected USER-001", { exact: false })).toHaveCount(0)
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: "Reset directory review" }).click()
  await expect(page.getByRole("heading", { name: "Adaline Rivera", exact: true })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Supplied provenance" })).toHaveCount(0)
})
test("authored unknown missing locked and denied states are metadata only and escaped long content fits390 dark", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/?view=Directory+Review&theme=p1-green-phosphor&mode=dark")
  const state = page.getByLabel("Directory appearance", { exact: true })
  await state.selectOption("unassigned")
  await expect(page.getByText("0 distinct permission references", { exact: false })).toBeVisible()
  await page.getByRole("tab", { name: "Roles", exact: true }).click()
  await expect(page.getByText("0 role references supplied.", { exact: true })).toBeVisible()
  await state.selectOption("missing")
  await page.getByRole("tab", { name: "Permissions", exact: true }).click()
  await expect(page.getByText("Permission set unavailable:", { exact: false })).toBeVisible()
  await state.selectOption("unknown")
  await expect(
    page.locator("[data-slot=badge]").filter({ hasText: "unclassified-fixture-state" }),
  ).toBeVisible()
  await state.selectOption("locked")
  await expect(page.getByText("Locked fixture remains readable", { exact: false })).toBeVisible()
  await state.selectOption("long")
  await expect(page.locator(".directory-review script")).toHaveCount(0)
  const card = page.getByTestId("directory-card")
  await card.scrollIntoViewIfNeeded()
  await page.screenshot({ path: info.outputPath("directory-narrow.png"), animations: "disabled" })
  expect(await card.evaluate((e) => e.getBoundingClientRect().right)).toBeLessThanOrEqual(391)
  await state.selectOption("recorded")
  await page.getByTestId("directory-card").scrollIntoViewIfNeeded()
  await page.screenshot({
    path: info.outputPath("directory-recorded-narrow.png"),
    animations: "disabled",
  })
  await page.getByTestId("directory-card").evaluate((e) => {
    const owner = document.querySelector(".page-scroll")!
    owner.scrollTop += e.getBoundingClientRect().top - owner.getBoundingClientRect().top - 12
  })
  await page.screenshot({
    path: info.outputPath("directory-header-narrow.png"),
    animations: "disabled",
  })
  await page.getByRole("button", { name: "Inspect provenance", exact: true }).click()
  await page.screenshot({
    path: info.outputPath("directory-provenance-narrow.png"),
    animations: "disabled",
  })
  const popup = page.locator("[data-slot=popover-content]")
  expect(await popup.evaluate((e) => e.getBoundingClientRect().right)).toBeLessThanOrEqual(391)
  await page.keyboard.press("Escape")
  await state.selectOption("denied")
  await expect(
    page.getByText("Personal details and relationship destinations", { exact: false }),
  ).toBeVisible()
  await expect(page.getByText("reviewer1@example.invalid", { exact: true })).toHaveCount(0)
})
test("StrictMode captured callbacks cannot select or inspect after source state selection and unmount retirement", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:18545/?view=Directory+Review")
  await page.getByRole("button", { name: "Inspect provenance", exact: true }).click()
  await page.getByRole("button", { name: "Inspect current metadata" }).evaluate((e) => {
    const key = Object.keys(e).find((k) => k.startsWith("__reactProps$"))!
    ;(window as unknown as { oldInspect: () => void }).oldInspect = (
      e as unknown as Record<string, { onClick: () => void }>
    )[key].onClick
  })
  await page.getByRole("button", { name: "Inspect current metadata" }).click()
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: /USER-002 ·/ }).click()
  await page.evaluate(() => {
    ;(window as unknown as { oldInspect: () => void }).oldInspect()
  })
  await expect(page.getByText("Inspected USER-001", { exact: false })).toHaveCount(0)
  await page.getByRole("button", { name: "Inspect provenance", exact: true }).click()
  await page.getByRole("button", { name: /Release oldest metadata inspection/ }).click()
  await expect(page.getByText("Inspected USER-001", { exact: false })).toHaveCount(0)
  await page.getByRole("button", { name: "Inspect current metadata" }).click()
  await page.getByRole("button", { name: /Release oldest metadata inspection/ }).click()
  await expect(page.getByRole("status").filter({ hasText: "Inspected USER-002" })).toBeVisible()
  await page.getByRole("button", { name: "Inspect current metadata" }).click()
  await page.getByRole("button", { name: /Release oldest metadata inspection/ }).evaluate((e) => {
    const key = Object.keys(e).find((k) => k.startsWith("__reactProps$"))!
    ;(window as unknown as { oldRelease: () => void }).oldRelease = (
      e as unknown as Record<string, { onClick: () => void }>
    )[key].onClick
  })
  await page.keyboard.press("Escape")
  await page.getByLabel("Directory appearance", { exact: true }).selectOption("error")
  await page.evaluate(() => {
    ;(window as unknown as { oldInspect: () => void }).oldInspect()
  })
  await page.evaluate(() => {
    ;(window as unknown as { oldRelease: () => void }).oldRelease()
  })
  await expect(page.getByText("Directory error", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Open Review Workbench", exact: true }).click()
  await page.evaluate(() => {
    ;(window as unknown as { oldInspect: () => void }).oldInspect()
  })
  await expect(page.getByRole("heading", { name: "Review Workbench", exact: true })).toBeVisible()
})
test("portable Directory native selected profile stays API free and snapshot independent of operations prefix", async ({
  page,
}) => {
  const calls: string[] = []
  page.on("request", (r) => {
    if (/\/api\/|\/plugins\//.test(r.url()) || r.method() !== "GET") calls.push(r.url())
  })
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=administration-directory-review--recorded&viewMode=story",
  )
  await page.getByRole("button", { name: /USER-003 ·/ }).click()
  await expect(page.getByRole("heading", { name: "Della Rivera", exact: true })).toBeVisible()
  await expect(page.getByText("2026-10-04T14:30:00Z", { exact: false }).first()).toBeVisible()
  await page.getByRole("tab", { name: "Roles", exact: true }).click()
  await expect(page.getByRole("heading", { name: "Fixture observer" })).toBeVisible()
  expect(calls).toEqual([])
})
