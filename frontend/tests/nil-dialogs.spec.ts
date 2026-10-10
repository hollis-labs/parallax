import { expect, test } from "@playwright/test"

const server = process.env.NIL_STORYBOOK_URL ?? "http://127.0.0.1:18542"
const story = `${server}/iframe.html?id=primitives-nil-dialog-behavior--nil-keyboard&viewMode=story`
const variants = [
  "detail",
  "form",
  "confirm",
  "inspection",
  "command",
  "dialog",
  "alert",
  "json",
  "sheet",
  "sidebar",
]

for (const variant of variants) {
  test(`${variant}: fullscreen preserves native focus and current return`, async ({ page }) => {
    await page.goto(story)
    await page.getByLabel("Variant", { exact: true }).selectOption(variant)
    const origin = page.getByRole("button", { name: "Open dialog", exact: true })
    await origin.click()
    const modal = page.getByRole(variant === "alert" ? "alertdialog" : "dialog")
    await expect(modal).toBeVisible()
    const field = page.getByRole("textbox", { name: "Draft", exact: true })
    if (variant !== "json") {
      await expect(field).toBeFocused()
      await field.fill("Dirty specimen")
      await field.evaluate((input: HTMLInputElement) => {
        input.setSelectionRange(2, 6)
        ;(window as unknown as { nilField: HTMLInputElement }).nilField = input
      })
    }
    await page.getByRole("button", { name: "Enter fullscreen", exact: true }).click()
    await expect(modal).toHaveAttribute("data-fullscreen", "true")
    if (variant !== "json") {
      await expect(field).toBeFocused()
      expect(
        await field.evaluate(
          (input: HTMLInputElement) =>
            input === (window as unknown as { nilField: HTMLInputElement }).nilField &&
            input.selectionStart === 2 &&
            input.selectionEnd === 6,
        ),
      ).toBe(true)
      await expect(field).toHaveValue("Dirty specimen")
    }
    await expect
      .poll(async () => {
        const rect = await modal.boundingBox()
        const viewport = page.viewportSize() ?? { width: 1280, height: 720 }
        return (
          rect &&
          Math.abs(rect.width - viewport.width) < 2 &&
          Math.abs(rect.height - viewport.height) < 2 &&
          Math.abs(rect.x) < 2 &&
          Math.abs(rect.y) < 2
        )
      })
      .toBe(true)
    await modal
      .getByRole("button", { name: variant === "alert" ? "Close alert" : "Close", exact: true })
      .click()
    await expect(modal).not.toBeVisible()
    await expect(origin).toBeFocused()
    await origin.click()
    await expect(page.getByRole("button", { name: "Enter fullscreen", exact: true })).toBeVisible()
  })
}

test("palette: input caret, static filters, IME clear/close and activation", async ({ page }) => {
  await page.goto(story)
  await page.getByRole("button", { name: "Quick search", exact: true }).click()
  const input = page.getByRole("combobox")
  await expect(input).toBeFocused()
  const first = await input.getAttribute("aria-activedescendant")
  await input.press("ArrowDown")
  expect(await input.getAttribute("aria-activedescendant")).not.toBe(first)
  await expect(input).toBeFocused()
  await input.fill("Notes")
  await input.dispatchEvent("compositionstart")
  await input.fill("Notes from")
  await input.press("Escape")
  await expect(input).toHaveValue("Notes from")
  await expect(page.getByRole("dialog")).toBeVisible()
  await input.press("Enter")
  await expect(input).toBeFocused()
  await input.dispatchEvent("compositionend")
  await input.press("Escape")
  await expect(input).toHaveValue("")
  await expect(page.getByRole("dialog")).toBeVisible()
  const filters = page.getByRole("radiogroup")
  const before = await filters.boundingBox()
  await input.press("ArrowDown")
  expect(await filters.boundingBox()).toEqual(before)
  await input.press("Tab")
  await expect(page.getByRole("radio", { name: "All", exact: true })).toBeFocused()
  await page.keyboard.press("ArrowLeft")
  await expect(page.getByRole("radio", { name: "Notes", exact: true })).toBeFocused()
  await input.focus()
  await input.press("Enter")
  await expect(page.getByRole("textbox", { name: "Draft", exact: true })).toBeFocused()
  await expect(page.getByRole("dialog")).toContainText("nil-4422")
})

test("nested ownership, retired opener fallback and inspection axes", async ({ page }) => {
  await page.goto(story)
  await page.getByRole("button", { name: "Open dialog", exact: true }).click()
  await page.getByRole("textbox", { name: "Draft", exact: true }).focus()
  await page.keyboard.press("ArrowRight")
  await expect(page.getByRole("dialog")).toContainText("nil-4421")
  await page.getByRole("button", { name: "Open nested confirmation" }).click()
  const nested = page.getByRole("dialog", { name: "Nested confirmation", exact: true })
  await expect(nested).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(nested).not.toBeVisible()
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.getByRole("button", { name: "Retire opener" }).click()
  await page.getByRole("button", { name: "Close", exact: true }).click()
  await expect(page.getByRole("button", { name: "Admitted fallback" })).toBeFocused()
})

for (const viewport of [
  { width: 1280, height: 800 },
  { width: 390, height: 844 },
  { width: 390, height: 420 },
]) {
  test(`settled viewport ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto(story)
    await page
      .getByLabel("Theme", { exact: true })
      .selectOption(
        viewport.height === 420
          ? "sysop-hi-contrast"
          : viewport.width === 390
            ? "sysop-green-phosphor"
            : "nanite-default",
      )
    if (viewport.height === 420)
      await page.getByRole("button", { name: "Switch to light mode", exact: true }).click()
    await page.getByRole("button", { name: "Quick search", exact: true }).click()
    await expect(page.getByRole("combobox")).toBeFocused()
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({
      path: `${process.env.NIL_SCREEN_DIR ?? "../.scratch/nil-dialogs/screens"}/palette-${viewport.width}-${viewport.height}.png`,
    })
    await page.getByRole("button", { name: "Enter fullscreen", exact: true }).click()
    await page.screenshot({
      path: `${process.env.NIL_SCREEN_DIR ?? "../.scratch/nil-dialogs/screens"}/palette-full-${viewport.width}-${viewport.height}.png`,
    })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}

test("registered lower menu permits only a current newer dialog; unrelated/retired veto", async ({
  page,
}) => {
  await page.goto(
    `${server}/iframe.html?id=primitives-nil-dialog-behavior--registered-layers&viewMode=story`,
  )
  await page.getByRole("menuitem", { name: "Open upper dialog" }).click()
  const upper = page.getByRole("dialog", { name: "Registered upper dialog" })
  await expect(upper).toBeVisible()
  await page.getByRole("button", { name: "Retire lower registration" }).click()
  await page.keyboard.press("Escape")
  await expect(upper).toBeVisible()
  await page.getByRole("button", { name: "Admit lower registration" }).click()
  await page.evaluate(() => {
    const unrelated = document.createElement("div")
    unrelated.id = "unrelated-popup"
    unrelated.setAttribute("role", "listbox")
    unrelated.textContent = "Unrelated popup"
    document.body.append(unrelated)
  })
  await page.keyboard.press("Escape")
  await expect(upper).toBeVisible()
  await page.evaluate(() => document.getElementById("unrelated-popup")?.remove())
  await page.keyboard.press("Escape")
  await expect(upper).not.toBeVisible()
  await expect(page.getByRole("menu", { name: "Registered lower menu" })).toBeVisible()
  await page.getByRole("menuitem", { name: "Open upper dialog" }).focus()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("menu", { name: "Registered lower menu" })).not.toBeVisible()
})

test("Torque second source admits search, title focus and horizontal navigation", async ({
  page,
}) => {
  await page.goto(
    `${server}/iframe.html?id=primitives-nil-dialog-behavior--torque-inspection&viewMode=story`,
  )
  await page.getByRole("button", { name: "Search Torque projection" }).click()
  const input = page.getByRole("combobox")
  await expect(input).toBeFocused()
  await input.press("Enter")
  const heading = page.getByRole("dialog").getByRole("heading")
  await expect(heading).toBeFocused()
  // The outgoing palette owns keys until its native exit portal is removed.
  await expect(page.getByRole("listbox")).toHaveCount(0)
  await expect(page.locator('[role="dialog"]')).toHaveCount(1)
  const before = await heading.textContent()
  await page.keyboard.press("ArrowRight")
  await expect(heading).not.toHaveText(before ?? "")
  await page.keyboard.press("Escape")
  await expect(page.getByRole("button", { name: "Search Torque projection" })).toBeFocused()
})

test("palette nested popup veto, synthetic key diagnostics and denied storage", async ({
  page,
}) => {
  await page.goto(story)
  await page.getByRole("button", { name: "Quick search", exact: true }).click()
  const input = page.getByRole("combobox")
  await expect(input).toBeFocused()
  await input.fill("Notes")
  const before = await input.getAttribute("aria-activedescendant")
  await input.dispatchEvent("keydown", { key: "ArrowDown", isComposing: true })
  await input.dispatchEvent("keydown", { key: "Enter", keyCode: 229 })
  expect(await input.getAttribute("aria-activedescendant")).toBe(before)
  await page.evaluate(() => {
    const menu = document.createElement("div")
    menu.id = "palette-unrelated-menu"
    menu.setAttribute("role", "menu")
    menu.textContent = "Unrelated menu"
    document.body.append(menu)
  })
  await input.dispatchEvent("keydown", { key: "Enter" })
  await input.dispatchEvent("keydown", { key: "Escape" })
  await expect(input).toHaveValue("Notes")
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.evaluate(() => document.getElementById("palette-unrelated-menu")?.remove())
  await input.press("Escape")
  await expect(input).toHaveValue("")
  await input.press("Escape")
  await expect(page.getByRole("dialog")).not.toBeVisible()
  await page.getByRole("checkbox", { name: "Session fullscreen" }).check()
  await page.evaluate(() => {
    Storage.prototype.getItem = () => {
      throw new Error("denied")
    }
    Storage.prototype.setItem = () => {
      throw new Error("denied")
    }
  })
  await page.getByRole("button", { name: "Open dialog", exact: true }).click()
  await page.getByRole("button", { name: "Enter fullscreen", exact: true }).click()
  await expect(page.getByRole("button", { name: "Exit fullscreen", exact: true })).toBeVisible()
})

for (const side of ["top", "right", "bottom", "left"]) {
  test(`Sheet ${side}: same node/focus and bounded reset`, async ({ page }) => {
    await page.goto(story)
    await page.getByLabel("Variant", { exact: true }).selectOption("sheet")
    await page.getByLabel("Sheet side", { exact: true }).selectOption(side)
    await page.getByRole("button", { name: "Open dialog", exact: true }).click()
    const field = page.getByRole("textbox", { name: "Draft", exact: true })
    await expect(field).toBeFocused()
    await page.getByRole("button", { name: "Enter fullscreen", exact: true }).click()
    await expect(field).toBeFocused()
    await expect(page.getByRole("dialog")).toHaveAttribute("data-fullscreen", "true")
    await page.getByRole("button", { name: "Close", exact: true }).click()
    await expect(page.getByRole("button", { name: "Open dialog", exact: true })).toBeFocused()
    await page.getByRole("button", { name: "Open dialog", exact: true }).click()
    await expect(page.getByRole("button", { name: "Enter fullscreen", exact: true })).toBeVisible()
  })
}

test("list vertical and board 2D axes yield to an inspection", async ({ page }) => {
  await page.goto(story)
  const list = page.getByRole("region", { name: "List navigation" })
  const rows = list.getByRole("button")
  await rows.nth(0).focus()
  await page.keyboard.press("ArrowDown")
  await expect(rows.nth(1)).toBeFocused()
  const board = page.getByRole("region", { name: "Board navigation" })
  const first = board.getByRole("button", { name: "Board Review +design @desk", exact: true })
  const below = board.getByRole("button", { name: "Board Plan the next specimen", exact: true })
  const right = board.getByRole("button", { name: "Board Notes from the studio", exact: true })
  await first.focus()
  await page.keyboard.press("ArrowDown")
  await expect(below).toBeFocused()
  await page.keyboard.press("ArrowRight")
  await expect(right).toBeFocused()
  await page.keyboard.press("Enter")
  await expect(page.getByRole("textbox", { name: "Draft", exact: true })).toBeFocused()
  await page.keyboard.press("ArrowLeft")
  await expect(page.getByRole("dialog")).toContainText("nil-4422")
})

test("legacy OverlaySidebar keeps admitted return and retired fallback without new options", async ({
  page,
}) => {
  await page.goto(story)
  await page.getByLabel("Variant", { exact: true }).selectOption("legacy-sidebar")
  const trigger = page.getByRole("button", { name: "Legacy sidebar opener", exact: true })
  await trigger.click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await expect(page.getByRole("button", { name: "Enter fullscreen" })).toHaveCount(0)
  await page.getByRole("button", { name: "Close", exact: true }).click()
  await expect(trigger).toBeFocused()
  await trigger.click()
  await page.getByRole("button", { name: "Retire opener", exact: true }).click()
  await page.getByRole("button", { name: "Close", exact: true }).click()
  await expect(page.getByRole("button", { name: "Admitted fallback" })).toBeFocused()
})
