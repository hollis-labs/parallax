import { expect, test } from "@playwright/test"
import { operationsModel } from "../src/operations/model"
import { galleryModel, galleryStates } from "../src/primitives/model"

async function choose(page: import("@playwright/test").Page, task = "TASK-003") {
  await page.getByRole("button", { name: "Gallery recorded task", exact: true }).click()
  await page.getByPlaceholder("Find fixture task…").fill(task)
  await page.getByRole("option", { name: new RegExp(task) }).click()
}
test("primitive projection keeps empty zero withheld resources and real graph identities", () => {
  const data = operationsModel("populated")
  for (const state of galleryStates) {
    const gallery = galleryModel(data, state)
    expect(gallery.clock).toBe(data.referenceClock)
    expect(
      gallery.items.every((item) => data.tasks.some((task) => task.id === item.value)),
    ).toBeTruthy()
    if (["loading", "error", "denied"].includes(state)) {
      expect(gallery.progress).toBeNull()
      expect(gallery.items).toEqual([])
    }
    if (state === "empty") {
      expect(gallery.progress).toBe(0)
      expect(gallery.total).toBe(0)
      expect(gallery.items).toEqual([])
    }
    if (state === "unknown") expect(gallery.tone).toBe("neutral")
    if (state === "locked") expect(gallery.editable).toBe(false)
  }
})
test("actual selector menu sections dialogs and held draft outcomes are controlled", async ({
  page,
}, info) => {
  const writes: string[] = [],
    errors: string[] = []
  page.on("request", (request) => {
    if (request.method() !== "GET") writes.push(request.url())
  })
  page.on("pageerror", (e) => errors.push(e.message))
  await page.goto("/?view=Primitives&mode=light")
  await expect(page.getByRole("heading", { name: "Primitives", exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Gallery recorded task", exact: true }).focus()
  await page.keyboard.press("Enter")
  await page.getByPlaceholder("Find fixture task…").fill("not-an-authored-task")
  await expect(page.getByText("No matching recorded tasks", { exact: true })).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("button", { name: "Gallery recorded task", exact: true }),
  ).toBeFocused()
  await choose(page)
  await page.getByRole("button", { name: "Gallery recorded task", exact: true }).click()
  await page.getByPlaceholder("Find fixture task…").fill("")
  await page.getByRole("option", { name: "Clear recorded task", exact: true }).click()
  await expect(page.getByText("No local record selected", { exact: true })).toBeVisible()
  await choose(page)
  const disclosure = page.getByRole("button", { name: "Fixture relationships", exact: false })
  await disclosure.focus()
  await page.keyboard.press("Enter")
  await expect(disclosure).toHaveAttribute("aria-expanded", "true")
  await expect(page.getByText("TRACE-003", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Recorded row inspection actions" }).focus()
  await page.keyboard.press("Enter")
  await page.getByRole("menuitem", { name: "Review local note", exact: true }).click()
  const form = page.getByRole("dialog", { name: "Review local note", exact: true })
  await expect(form).toBeVisible()
  await expect.poll(() => form.evaluate((n) => n.contains(document.activeElement))).toBe(true)
  for (let i = 0; i < 9; i++) {
    await page.keyboard.press("Tab")
    await expect.poll(() => form.evaluate((n) => n.contains(document.activeElement))).toBe(true)
  }
  const nativeForm = form.locator("form")
  await nativeForm.evaluate((n) =>
    n.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  )
  await expect(
    page.locator("button").filter({ hasText: /^Release oldest producer \(0\)$/ }),
  ).toBeDisabled()
  await form.getByLabel("Primitive review note").fill("prior-draft")
  await form.getByRole("button", { name: "Inspect note intent", exact: true }).click()
  await expect(
    form.getByRole("button", { name: "Inspect note intent", exact: true }),
  ).toBeDisabled()
  await nativeForm.evaluate((n) =>
    n.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  )
  await expect(
    page.locator("button").filter({ hasText: /^Release oldest producer \(1\)$/ }),
  ).toHaveCount(1)
  await form.getByLabel("Primitive review note").fill("current-draft")
  await expect(form.getByRole("button", { name: "Inspect note intent", exact: true })).toBeEnabled()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("button", { name: "Recorded row inspection actions" })).toBeFocused()
  await page
    .locator("button")
    .filter({ hasText: /^Release oldest producer \(1\)$/ })
    .click()
  await expect(
    page.getByText("Retired producer ignored; current presentation unchanged."),
  ).toBeVisible()
  await expect(page.getByText(/Inspect note “prior-draft”/)).toHaveCount(0)
  await page.getByRole("button", { name: "Review note form", exact: true }).click()
  await form.getByLabel("Primitive review note").fill("authored local note")
  await form.getByRole("button", { name: "Inspect note intent", exact: true }).focus()
  await page.keyboard.press("Enter")
  await form.getByRole("button", { name: "Release oldest scripted outcome", exact: true }).click()
  await expect(form).not.toBeVisible()
  await expect(page.getByRole("button", { name: "Review note form", exact: true })).toBeFocused()
  await expect(page.getByText(/Inspect note “authored local note”/).first()).toBeVisible()
  await page.getByRole("button", { name: "Review confirmation", exact: true }).click()
  const confirm = page.getByRole("dialog", { name: "Review archive intent", exact: true })
  await confirm.getByRole("button", { name: "Inspect archive intent", exact: true }).click()
  await expect(confirm.getByRole("button", { name: "Cancel", exact: true })).toBeDisabled()
  await page.keyboard.press("Escape")
  await expect(confirm).not.toBeVisible()
  await expect(page.getByRole("button", { name: "Review confirmation", exact: true })).toBeFocused()
  await page
    .locator("button")
    .filter({ hasText: /^Release oldest producer \(1\)$/ })
    .click()
  await expect(
    page.getByText("Retired producer ignored; current presentation unchanged."),
  ).toBeVisible()
  await page.getByLabel("Gallery scripted outcome").selectOption("refuse")
  await page.getByRole("button", { name: "Review note form", exact: true }).click()
  await form.getByLabel("Primitive review note").fill("refused-note")
  await form.getByRole("button", { name: "Inspect note intent", exact: true }).click()
  await form.getByRole("button", { name: "Release oldest scripted outcome", exact: true }).click()
  await expect(form).toBeVisible()
  await expect(form.getByLabel("Primitive review note")).toHaveValue("refused-note")
  await expect(form.getByRole("status")).toContainText("Scripted refusal")
  await page.screenshot({ path: info.outputPath("form-refusal.png"), animations: "disabled" })
  await form.getByRole("button", { name: "Reset gallery context" }).click()
  await expect(form).not.toBeVisible()
  await expect(page.getByLabel("Gallery state")).toBeFocused()
  await expect(page.getByText("No local record selected", { exact: true })).toBeVisible()
  expect(writes).toEqual([])
  expect(errors).toEqual([])
})
test("context policy retirement and actual keyframes preserve narrow theme and portable gallery", async ({
  page,
}, info) => {
  await page.goto("/?view=Primitives&theme=p1-green-phosphor&mode=dark")
  await choose(page, "TASK-001")
  await page.getByRole("button", { name: "Review note form", exact: true }).click()
  const form = page.getByRole("dialog", { name: "Review local note", exact: true })
  await form.getByLabel("Primitive review note").fill("retired-context-note")
  await form.getByRole("button", { name: "Inspect note intent", exact: true }).click()
  await form.getByRole("button", { name: "Reset gallery context" }).click()
  await page.getByLabel("Gallery state").selectOption("denied")
  await page
    .locator("button")
    .filter({ hasText: /^Release oldest producer \(1\)$/ })
    .click()
  await expect(page.getByText(/retired-context-note/)).toHaveCount(0)
  await expect(
    page.getByRole("button", { name: "Gallery recorded task", exact: true }),
  ).toHaveCount(0)
  await expect(page.getByRole("progressbar")).toHaveCount(0)
  await page.getByLabel("Gallery state").selectOption("loading")
  const progress = page.getByRole("progressbar")
  await expect(progress).toHaveAttribute("aria-busy", "true")
  expect(await progress.locator("div").evaluate((n) => getComputedStyle(n).animationName)).toBe(
    "hl-progress-indeterminate",
  )
  await page.emulateMedia({ reducedMotion: "reduce" })
  expect(await progress.locator("div").evaluate((n) => getComputedStyle(n).animationName)).toBe(
    "none",
  )
  await page.getByLabel("Gallery state").selectOption("locked")
  await choose(page)
  await expect(page.getByRole("button", { name: "Review note form", exact: true })).toBeDisabled()
  await page.getByLabel("Gallery state").selectOption("unknown")
  await expect(page.getByText("Unknown · future-review-phase", { exact: true })).toBeVisible()
  await page.getByLabel("Gallery state").selectOption("long")
  await choose(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(page.getByLabel("Theme")).toHaveValue("p1-green-phosphor")
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true)
  await page.getByTestId("page-scroll").evaluate((n) => {
    n.scrollTop = 0
  })
  await page.screenshot({ path: info.outputPath("gallery-narrow.png"), animations: "disabled" })
  await page
    .getByRole("button", { name: "Recorded row inspection actions" })
    .scrollIntoViewIfNeeded()
  await page.screenshot({
    path: info.outputPath("gallery-narrow-components.png"),
    animations: "disabled",
  })
  await page.getByRole("button", { name: "Review note form", exact: true }).click()
  await form.getByLabel("Primitive review note").fill("narrow recorded draft")
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true)
  await page.screenshot({ path: info.outputPath("form-narrow.png"), animations: "disabled" })
  await form.getByRole("button", { name: "Reset gallery context" }).scrollIntoViewIfNeeded()
  await expect(form.getByRole("button", { name: "Reset gallery context" })).toBeInViewport()
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: "Activity", exact: true }).click()
  await page.getByRole("button", { name: "Primitives", exact: true }).click()
  await expect(page.getByText("No local record selected", { exact: true })).toBeVisible()
  const requests: string[] = []
  page.on("request", (request) => {
    if (/\/(api|plugins)\//.test(request.url())) requests.push(request.url())
  })
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=primitives-controlled-gallery--recorded&viewMode=story",
  )
  await choose(page)
  await page.getByRole("button", { name: "Review note form", exact: true }).click()
  await form.getByLabel("Primitive review note").fill("portable inspection")
  await page.screenshot({ path: info.outputPath("form-portable.png"), animations: "disabled" })
  await form.getByRole("button", { name: "Reset gallery context" }).click()
  await expect(page.getByText("No local record selected", { exact: true })).toBeVisible()
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=primitives-controlled-gallery--empty&viewMode=story",
  )
  await expect(
    page.getByText("No records in this controlled gallery state.", { exact: true }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Gallery recorded task", exact: true }).click()
  await page.getByPlaceholder("Find fixture task…").fill("not-authored")
  await expect(page.getByText("No matching recorded tasks", { exact: true })).toBeVisible()
  await page.keyboard.press("Escape")
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=primitives-controlled-gallery--recorded&viewMode=story",
  )
  await expect(page.getByText("No local record selected", { exact: true })).toBeVisible()
  expect(requests).toEqual([])
})

test("rendered tone and clamp contracts use actual library paint and dimensions", async ({
  page,
}, info) => {
  await page.goto("/?view=Primitives&theme=p4-white&mode=light")
  const pills = page.getByRole("group", { name: "Supported pill tones" })
  const paint = await pills.locator("span").evaluateAll((nodes) =>
    nodes
      .filter((n) =>
        ["neutral", "info", "success", "warning", "danger"].includes(n.textContent?.trim() ?? ""),
      )
      .map((n) => ({
        tone: n.textContent,
        color: getComputedStyle(n).color,
        background: getComputedStyle(n).backgroundColor,
      })),
  )
  expect(paint).toHaveLength(5)
  expect(new Set(paint.map((p) => p.background))).toHaveProperty("size", 5)
  const colors = new Set<string>()
  for (const state of ["normal", "error", "denied", "unknown"]) {
    await page.getByLabel("Gallery state").selectOption(state)
    colors.add(
      await page
        .locator(".gallery-policy > div")
        .evaluate((n) => getComputedStyle(n).backgroundColor),
    )
  }
  expect(colors.size).toBe(4)
  await page.getByLabel("Gallery state").selectOption("normal")
  await page.getByText("Progress clamp review vectors", { exact: true }).click()
  const lower = page.getByRole("progressbar", { name: "Lower clamp" })
  const upper = page.getByRole("progressbar", { name: "Upper clamp" })
  expect(
    await lower
      .locator("div")
      .last()
      .evaluate((n) => n.getBoundingClientRect().width),
  ).toBe(0)
  const bounds = await upper
    .locator("div")
    .last()
    .evaluate((n) => ({
      fill: n.getBoundingClientRect().width,
      track: n.parentElement?.getBoundingClientRect().width,
    }))
  expect(bounds.fill).toBeGreaterThan(0)
  expect(bounds.fill).toBe(bounds.track)
  await page.getByText("Progress clamp review vectors", { exact: true }).click()
  await page.getByTestId("page-scroll").evaluate((n) => (n.scrollTop = 0))
  await page.screenshot({ path: info.outputPath("gallery-desktop.png"), animations: "disabled" })
})

test("gallery entry ignores operations filter and retires focus and held outcomes on source replacement", async ({
  page,
}) => {
  await page.goto("/?view=Activity")
  await page.getByText("Fixture timeline review", { exact: true }).click()
  await page.getByLabel("Playback position").fill("0")
  await page.getByLabel("Filter tasks", { exact: true }).fill("TASK-003")
  await page.getByRole("button", { name: "Play recorded events", exact: true }).click()
  await page.getByRole("button", { name: "Primitives", exact: true }).click()
  await expect(page.getByText(/Full-snapshot review/)).toBeVisible()
  await page.getByRole("button", { name: "Activity", exact: true }).click()
  await page.getByText("Fixture timeline review", { exact: true }).click()
  await expect(
    page.getByRole("button", { name: "Play recorded events", exact: true }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Primitives", exact: true }).click()
  await choose(page, "TASK-001")
  await page.getByRole("button", { name: "Review note form", exact: true }).click()
  const form = page.getByRole("dialog", { name: "Review local note", exact: true })
  await form.getByLabel("Primitive review note").fill("source-retired-note")
  await form.getByRole("button", { name: "Inspect note intent", exact: true }).click()
  await page.keyboard.press("Escape")
  await choose(page, "TASK-003")
  await page.getByRole("button", { name: "Release oldest producer (1)" }).click()
  await expect(page.getByText(/source-retired-note/)).toHaveCount(0)
  await page.getByRole("button", { name: "Review note form", exact: true }).click()
  await form.getByLabel("Primitive review note").fill("source-replacement-note")
  await form.getByRole("button", { name: "Inspect note intent", exact: true }).click()
  await page.keyboard.press("Escape")
  await page.getByLabel("Scenario", { exact: true }).selectOption("empty")
  await expect(page.getByRole("button", { name: "Release oldest producer (0)" })).toBeDisabled()
  await expect(page.getByText(/source-replacement-note/)).toHaveCount(0)
  await page.getByLabel("Scenario", { exact: true }).selectOption("populated")
  await choose(page, "TASK-001")
  await page.getByRole("button", { name: "Review note form", exact: true }).click()
  await expect(form).toBeVisible()
  await page.evaluate(async () => {
    const close = [...document.querySelectorAll<HTMLButtonElement>('[role="dialog"] button')].find(
      (n) => n.textContent?.trim() === "Cancel",
    )
    close?.click()
    await Promise.resolve()
    const next = [...document.querySelectorAll<HTMLButtonElement>("button")].find(
      (n) => n.textContent?.trim() === "Review confirmation",
    )
    next?.focus()
    next?.click()
  })
  const confirm = page.getByRole("dialog", { name: "Review archive intent", exact: true })
  await expect(confirm).toBeVisible()
  await expect.poll(() => confirm.evaluate((n) => n.contains(document.activeElement))).toBe(true)
  await page.waitForTimeout(50)
  await expect.poll(() => confirm.evaluate((n) => n.contains(document.activeElement))).toBe(true)
  await page.keyboard.press("Escape")
  await expect(page.getByRole("button", { name: "Review confirmation", exact: true })).toBeFocused()
})
