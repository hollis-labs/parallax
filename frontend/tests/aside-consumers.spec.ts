import { expect, test } from "@playwright/test"

const storybook = `http://127.0.0.1:${process.env.STORYBOOK_PORT ?? "18542"}/iframe.html`
const story = (idiom: string, extra = "") =>
  `${storybook}?id=layouts-aside-consumers--${idiom}&viewMode=story${extra}`

for (const idiom of ["messaging-companion", "administration-inspector"]) {
  test(`${idiom}: actual consumer collapse and current/stale controls`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 600 })
    await page.goto(story(idiom))
    const aside = page.locator('[data-slot="app-shell-aside"]')
    await expect(aside).toBeVisible()
    const owner = page.locator('[data-slot="app-shell-aside-body"]')
    expect(await owner.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true)
    const footer = page.locator('[data-slot="app-shell-aside-footer"]')
    const beforeFooter = await footer.boundingBox()
    await owner.evaluate((el) => {
      el.scrollTop = 200
    })
    expect(await owner.evaluate((el) => el.scrollTop)).toBe(200)
    expect((await footer.boundingBox())?.y).toBe(beforeFooter?.y)
    await page.getByRole("button", { name: "Capture current callbacks" }).click()
    await page.getByRole("button", { name: "Replace source" }).click()
    await page.getByRole("button", { name: "Replay held callbacks" }).click()
    await expect(aside).toHaveAttribute("data-width", "regular")
    await expect(page.getByRole("button", { name: "Replay held callbacks" })).toBeFocused()
    await page.getByRole("button", { name: "Collapse companion", exact: true }).click()
    await expect(aside).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Toggle companion" })).toBeFocused()
    await page.getByRole("button", { name: "Toggle companion" }).click()
    await expect(aside).toBeVisible()
    // A connected trigger can still lose source/access admission.
    await page.getByRole("button", { name: "Capture current callbacks" }).click()
    await page.getByRole("button", { name: "Revoke access" }).click()
    await page.getByRole("button", { name: "Replay held callbacks" }).click()
    await expect(aside).toHaveAttribute("data-width", "regular")
  })

  test(`${idiom}: 390x420 modal, nested Escape and composer ownership`, async ({ page }, info) => {
    await page.setViewportSize({ width: 390, height: 420 })
    await page.goto(story(idiom))
    const trigger = page.getByRole("button", { name: "Open companion", exact: true })
    await trigger.click()
    const overlay = page.getByRole("dialog", { name: /companion/ })
    await expect(overlay).toBeVisible()
    const owner = overlay.locator('[data-slot="overlay-sidebar-body"]')
    expect(await owner.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true)
    await owner.evaluate((el) => {
      el.scrollTop = el.scrollHeight
    })
    const footer = overlay.locator('[data-slot="overlay-sidebar-footer"]')
    await expect(footer).toBeVisible()
    const footerBox = await footer.boundingBox()
    expect(footerBox).not.toBeNull()
    if (!footerBox) throw new Error("Missing footer geometry")
    expect(footerBox.y + footerBox.height).toBeLessThanOrEqual(420)
    if (idiom === "messaging-companion") {
      const input = page.getByRole("textbox", { name: "Companion draft" })
      await input.fill("fixture")
      await input.press("/")
      await input.press("ArrowLeft")
      await input.press("Shift+Enter")
      await expect(input).toHaveValue("fixture\n/")
      await expect(input).toBeFocused()
      await input.evaluate((el) => {
        el.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }))
        el.dispatchEvent(
          new KeyboardEvent("keydown", { key: "/", isComposing: true, bubbles: true }),
        )
        el.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }))
        el.dispatchEvent(new KeyboardEvent("keydown", { key: "/", ctrlKey: true, bubbles: true }))
      })
      await expect(input).toBeFocused()
    }
    await page.getByRole("button", { name: "Inspect specimen" }).click()
    await expect(page.getByRole("dialog", { name: "Nested specimen" })).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page.getByRole("dialog", { name: "Nested specimen" })).toHaveCount(0)
    await expect(overlay).toBeVisible()
    await page.screenshot({ path: info.outputPath(`${idiom}-390x420.png`), animations: "disabled" })
    await page.keyboard.press("Escape")
    await expect(overlay).toHaveCount(0)
    await expect(trigger).toBeFocused()
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <= innerWidth &&
          document.documentElement.scrollHeight <= innerHeight,
      ),
    ).toBe(true)
  })
}

test("empty adoption starts collapsed and expands a truly empty region", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 600 })
  await page.goto(story("empty-adoption"))
  await expect(page.locator('[data-slot="app-shell-aside"]')).toHaveCount(0)
  await page.getByRole("button", { name: "Toggle companion" }).click()
  await expect(page.locator('[data-slot="app-shell-aside-body"]')).toBeEmpty()
  await expect(page.getByRole("textbox", { name: "Companion draft" })).toHaveCount(0)
})

test("both actual idioms: ten public themes, light/dark, desktop and narrow evidence", async ({
  page,
}, info) => {
  test.setTimeout(180000)
  const themes = [
    "nanite-default",
    "dir-a",
    "dir-b",
    "dir-d",
    "dir-e",
    "dir-f",
    "sysop-p4-white",
    "sysop-green-phosphor",
    "sysop-amber-phosphor",
    "sysop-hi-contrast",
  ]
  for (const idiom of ["messaging-companion", "administration-inspector"]) {
    for (const theme of themes) {
      for (const mode of ["dark", "light"]) {
        for (const width of [1280, 390]) {
          await page.setViewportSize({ width, height: 600 })
          await page.goto(story(idiom, `&theme=${theme}&mode=${mode}`))
          await expect(page.locator("html")).toHaveAttribute("data-theme", theme)
          await expect(page.locator("html")).toHaveAttribute("data-mode", mode)
          if (width === 390) {
            await page.getByRole("button", { name: "Open companion", exact: true }).click()
            await expect(page.getByRole("dialog", { name: /companion/ })).toBeVisible()
          } else {
            await expect(page.locator('[data-slot="app-shell-aside"]')).toBeVisible()
          }
          expect(
            await page.evaluate(
              () =>
                document.documentElement.scrollWidth <= innerWidth &&
                document.documentElement.scrollHeight <= innerHeight,
            ),
          ).toBe(true)
          await page.screenshot({
            path: info.outputPath(`${idiom}-${theme}-${mode}-${width}.png`),
            animations: "disabled",
          })
        }
      }
    }
  }
})
