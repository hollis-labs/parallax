import { writeFileSync } from "node:fs"
import { expect, test } from "@playwright/test"
import { sourceDataset, timelineFrames } from "../src/playback/model"
import { destinations } from "../src/workbench/catalog"

test("actual inline native Command groups separator options list scrolling and keyboard navigation retain finite current routes", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto("/?view=Review+Workbench&mode=light")
  await page.getByRole("button", { name: "Show keyboard view switcher", exact: true }).click()
  await page
    .getByRole("listbox", { name: "Declared review views" })
    .getByRole("option", { name: /Ops Dashboard/ })
    .click()
  await expect(page.getByRole("heading", { name: "Ops Dashboard", exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Open Review Workbench", exact: true }).click()
  await page.getByRole("button", { name: "Show keyboard view switcher", exact: true }).click()
  await page.getByRole("combobox", { name: "Find review view", exact: true }).focus()
  await expect(page.locator('[cmdk-item][aria-selected="true"]')).toContainText("Ops Dashboard")
  const initialRelation = await page
    .getByRole("combobox", { name: "Find review view", exact: true })
    .getAttribute("aria-activedescendant")
  writeFileSync(
    info.outputPath("initial-active-relation.json"),
    JSON.stringify({ initialRelation }),
  )
  await info.attach("initial-active-relation", {
    body: JSON.stringify({ initialRelation }),
    contentType: "application/json",
  })
  await page.keyboard.press("Enter")
  await expect(page.getByRole("heading", { name: "Ops Dashboard", exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Open Review Workbench", exact: true }).click()
  await page.getByRole("button", { name: "Show keyboard view switcher", exact: true }).click()
  const input = page.getByRole("combobox", { name: "Find review view", exact: true }),
    list = page.getByRole("listbox", { name: "Declared review views", exact: true })
  await input.focus()
  await expect(list.getByRole("option")).toHaveCount(destinations.length)
  await expect(list.getByRole("group", { name: "Operations", exact: true })).toBeVisible()
  await expect(list.getByRole("separator")).toHaveCount(
    new Set(destinations.map((d) => d.group)).size - 1,
  )
  await page.keyboard.press("End")
  const last = await input.getAttribute("aria-activedescendant")
  expect(last).toBeTruthy()
  await expect(page.locator(`[id="${last}"]`)).toContainText("Voice")
  expect(await list.evaluate((e) => e.scrollTop)).toBeGreaterThan(0)
  await page.keyboard.press("Home")
  await expect(
    page.locator(`[id="${await input.getAttribute("aria-activedescendant")}"]`),
  ).toContainText("Torque Example")
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("ArrowUp")
  await expect(
    page.locator(`[id="${await input.getAttribute("aria-activedescendant")}"]`),
  ).toContainText("Torque Example")
  await input.pressSequentially("voice")
  await expect(input).toHaveValue("voice")
  await expect(input).toBeFocused()
  await expect(list.getByRole("option")).toHaveCount(1)
  await page.locator(".keyboard-switcher").evaluate((e) => {
    const owner = document.querySelector(".page-scroll")!
    owner.scrollTop += e.getBoundingClientRect().top - owner.getBoundingClientRect().top - 12
  })
  await page.screenshot({
    path: info.outputPath("switcher-query-desktop.png"),
    animations: "disabled",
  })
  await page.keyboard.press("Enter")
  await expect(page.getByRole("heading", { name: "Voice", exact: true })).toBeVisible()
})
test("native composing and229 Enter refuse navigation while ordinary Enter follows the current admitted option", async ({
  page,
}) => {
  await page.goto("/?view=Review+Workbench")
  await page.getByRole("button", { name: "Show keyboard view switcher", exact: true }).click()
  const input = page.getByRole("combobox", { name: "Find review view", exact: true })
  await input.fill("Ops Dashboard")
  await expect(
    page.getByRole("listbox", { name: "Declared review views" }).getByRole("option"),
  ).toHaveCount(1)
  await input.evaluate((e) => {
    e.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", isComposing: true, bubbles: true }),
    )
    e.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", keyCode: 229, bubbles: true }))
  })
  await expect(page.getByRole("heading", { name: "Review Workbench", exact: true })).toBeVisible()
  await input.press("Enter")
  await expect(page.getByRole("heading", { name: "Ops Dashboard", exact: true })).toBeVisible()
})
test("actual successful no-match Empty differs unavailable and disabled authored options cannot select by native keyboard", async ({
  page,
}, info) => {
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=workbench-keyboard-switcher--withdrawn&viewMode=story",
  )
  const input = page.getByRole("combobox", { name: "Find review view", exact: true })
  await input.focus()
  await page.keyboard.press("End")
  await expect(
    page.locator(`[id="${await input.getAttribute("aria-activedescendant")}"]`),
  ).toContainText("Voice")
  const withdrawn = page.getByRole("option", { name: /Withdrawn review specimen/ })
  await expect(withdrawn).toHaveAttribute("aria-disabled", "true")
  await input.fill("withdrawn")
  await expect(withdrawn).toBeVisible()
  await input.press("Enter")
  await expect(page.getByRole("status")).toContainText("inspection: None")
  await page.screenshot({
    path: info.outputPath("switcher-withdrawn-desktop.png"),
    animations: "disabled",
  })
  await input.fill("no-supplied-destination")
  await expect(
    page.getByText("No matching review views. Clear the query.", { exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole("listbox", { name: "Declared review views" }).getByRole("option"),
  ).toHaveCount(0)
  await page.screenshot({
    path: info.outputPath("switcher-empty-desktop.png"),
    animations: "disabled",
  })
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=workbench-keyboard-switcher--unavailable&viewMode=story",
  )
  await expect(
    page.getByText("Authored unavailable catalogue appearance.", { exact: false }),
  ).toBeVisible()
  await expect(page.getByRole("combobox")).toHaveCount(0)
})
test("current prefix selected record is retained on local command navigation and old query source hidden consumer callbacks refuse", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:18545/")
  await page.getByRole("button", { name: /Review gateway permission/ }).click()
  await page.keyboard.press("Escape")
  await page.getByText("Fixture timeline review", { exact: true }).click()
  const index = timelineFrames(sourceDataset("populated")).indexOf("2026-10-04T14:15:15Z")
  await page.getByLabel("Playback position").fill(String(index))
  await page.getByRole("button", { name: "Open Review Workbench", exact: true }).click()
  await page.getByRole("button", { name: "Show keyboard view switcher", exact: true }).click()
  await page.getByRole("combobox", { name: "Find review view", exact: true }).fill("Activity")
  // The reference app also mentions Activity: choose the declared lab destination explicitly.
  await page.getByRole("combobox", { name: "Find review view", exact: true }).press("End")
  await expect(
    page.getByRole("option").filter({ has: page.getByText("Activity", { exact: true }) }),
  ).toHaveAttribute("aria-selected", "true")
  await page.getByRole("combobox", { name: "Find review view", exact: true }).press("Enter")
  await expect(page.getByRole("region", { name: "Selected run" })).toContainText(
    "TASK-001 / RUN-001",
  )
  await expect(page.getByLabel("Playback position")).toHaveValue(String(index))
  await page.getByRole("button", { name: "Open Review Workbench", exact: true }).click()
  await page.getByRole("button", { name: "Show keyboard view switcher", exact: true }).click()
  const input = page.getByRole("combobox", { name: "Find review view", exact: true })
  await input.fill("Voice")
  const option = page
    .getByRole("listbox", { name: "Declared review views" })
    .getByRole("option", { name: /Voice/ })
  await option.evaluate((e) => {
    const key = Object.keys(e).find((k) => k.startsWith("__reactFiber$"))!
    let fiber = (
      e as unknown as Record<
        string,
        { return: unknown; memoizedProps: { value?: string; onSelect?: (v: string) => void } }
      >
    )[key] as {
      return: typeof fiber
      memoizedProps: { value?: string; onSelect?: (v: string) => void }
    }
    while (fiber) {
      if (fiber.memoizedProps.value === "Voice" && fiber.memoizedProps.onSelect) {
        ;(window as unknown as { oldOption: (v: string) => void }).oldOption =
          fiber.memoizedProps.onSelect
        break
      }
      fiber = fiber.return
    }
  })
  await input.fill("Usage Evidence")
  await page.evaluate(() => {
    ;(window as unknown as { oldOption: (v: string) => void }).oldOption("Voice")
  })
  await expect(page.getByRole("heading", { name: "Review Workbench", exact: true })).toBeVisible()
  await page.getByLabel("Scenario", { exact: true }).selectOption("empty")
  await page.evaluate(() => {
    ;(window as unknown as { oldOption: (v: string) => void }).oldOption("Voice")
  })
  await expect(page.getByRole("heading", { name: "Review Workbench", exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Show keyboard view switcher", exact: true }).click()
  await page.getByRole("combobox", { name: "Find review view", exact: true }).fill("Ops Dashboard")
  await page.getByRole("button", { name: "Hide keyboard view switcher", exact: true }).click()
  await page.evaluate(() => {
    ;(window as unknown as { oldOption: (v: string) => void }).oldOption("Voice")
  })
  await expect(page.getByRole("heading", { name: "Review Workbench", exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Open Activity", exact: true }).click()
  await page.evaluate(() => {
    ;(window as unknown as { oldOption: (v: string) => void }).oldOption("Voice")
  })
  await expect(page.getByRole("heading", { name: "Activity", exact: true })).toBeVisible()
})
test("390 dark native list scroll selected paint and escaped long literal remain bounded with usable input", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/?view=Review+Workbench&theme=p1-green-phosphor&mode=dark")
  await page.getByRole("button", { name: "Show keyboard view switcher", exact: true }).click()
  const switcher = page.getByLabel("Inline keyboard review switcher", { exact: true })
  await switcher.evaluate((e) => {
    const owner = document.querySelector(".page-scroll")!
    owner.scrollTop += e.getBoundingClientRect().top - owner.getBoundingClientRect().top - 12
  })
  const input = page.getByRole("combobox", { name: "Find review view", exact: true }),
    list = page.getByRole("listbox", { name: "Declared review views", exact: true })
  await input.focus()
  await page.keyboard.press("End")
  await expect(page.locator("html")).toHaveAttribute("data-theme", "p1-green-phosphor")
  await expect(page.locator("html")).toHaveAttribute("data-mode", "dark")
  const paints = await list.evaluate((e) => {
    const selected = e.querySelector('[cmdk-item][aria-selected="true"]')!,
      other = e.querySelector('[cmdk-item][aria-selected="false"]')!
    return {
      selected: getComputedStyle(selected).backgroundColor,
      other: getComputedStyle(other).backgroundColor,
    }
  })
  expect(paints.selected).not.toBe("rgba(0, 0, 0, 0)")
  expect(paints.selected).not.toBe(paints.other)
  await page.screenshot({
    path: info.outputPath("switcher-list-narrow.png"),
    animations: "disabled",
  })
  const inputBounds = await input.boundingBox(),
    listBounds = await list.boundingBox()
  expect(inputBounds!.height).toBeGreaterThan(10)
  expect(listBounds!.y).toBeGreaterThanOrEqual(inputBounds!.y + inputBounds!.height)
  expect(await switcher.evaluate((e) => e.getBoundingClientRect().right)).toBeLessThanOrEqual(391)
  expect(await list.evaluate((e) => e.clientHeight > 0 && e.scrollHeight > e.clientHeight)).toBe(
    true,
  )
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
  await input.fill("Directory")
  await page.screenshot({
    path: info.outputPath("switcher-query-narrow.png"),
    animations: "disabled",
  })
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=workbench-keyboard-switcher--long-literal&viewMode=story",
  )
  await page.getByRole("combobox", { name: "Find review view", exact: true }).fill("Voice")
  await expect(page.locator(".keyboard-switcher script")).toHaveCount(0)
  await expect(page.getByText("<script>inert</script>", { exact: false })).toBeVisible()
  await page.screenshot({
    path: info.outputPath("switcher-long-narrow.png"),
    animations: "disabled",
  })
})
test("portable current switcher Enter only reports local navigation and noAPI requests or external writes", async ({
  page,
}) => {
  const calls: string[] = []
  page.on("request", (r) => {
    if (/\/api\/|\/plugins\//.test(r.url()) || r.method() !== "GET") calls.push(r.url())
  })
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=workbench-keyboard-switcher--recorded&viewMode=story",
  )
  const input = page.getByRole("combobox", { name: "Find review view", exact: true })
  await input.fill("Directory Review")
  await input.press("Enter")
  await expect(page.getByRole("status")).toContainText("inspection: Directory Review")
  expect(calls).toEqual([])
})
