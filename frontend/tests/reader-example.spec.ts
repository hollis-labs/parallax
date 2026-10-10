import { expect, test } from "@playwright/test"

const entry = "/?example=reader&scope=inbox"

test.describe("Reader Example Standalone", () => {
  test("canonicalizes missing, invalid, or repeated scope to inbox via replaceState", async ({
    page,
  }) => {
    // Missing scope
    await page.goto("/?example=reader")
    await expect(page).toHaveURL(/\/\?example=reader&scope=inbox/)

    // Invalid scope
    await page.goto("/?example=reader&scope=invalid_scope")
    await expect(page).toHaveURL(/\/\?example=reader&scope=inbox/)

    // Repeated scope
    await page.goto("/?example=reader&scope=inbox&scope=library")
    await expect(page).toHaveURL(/\/\?example=reader&scope=inbox/)
  })

  test("renders header, refresh button, scope tabs, and count line", async ({ page }, info) => {
    await page.goto(entry)
    await expect(page.locator(".reader-example")).toBeVisible()

    // Header & manual refresh
    await expect(page.getByRole("heading", { name: "Reader", exact: true })).toBeVisible()
    const refreshBtn = page.getByRole("button", { name: "Refresh fragments", exact: true })
    await expect(refreshBtn).toBeVisible()

    // Scope tabs
    const nav = page.getByRole("tablist", { name: "Reader scope" })
    await expect(nav).toBeVisible()
    const inboxTab = page.getByRole("tab", { name: "Inbox", exact: true })
    const libraryTab = page.getByRole("tab", { name: "Library", exact: true })
    const allTab = page.getByRole("tab", { name: "All", exact: true })

    await expect(inboxTab).toHaveAttribute("aria-selected", "true")
    await expect(libraryTab).toHaveAttribute("aria-selected", "false")
    await expect(allTab).toHaveAttribute("aria-selected", "false")

    // Count line
    await expect(page.locator("main")).toContainText("6 fragments")
    await page.screenshot({ path: info.outputPath("reader-inbox-desktop.png") })

    // Switch to Library tab
    await libraryTab.click()
    await expect(page).toHaveURL(/scope=library/)
    await expect(libraryTab).toHaveAttribute("aria-selected", "true")
    await expect(page.locator("main")).toContainText("8 fragments")

    // Switch to All tab
    await allTab.click()
    await expect(page).toHaveURL(/scope=all/)
    await expect(allTab).toHaveAttribute("aria-selected", "true")
  })

  test("card activation with Enter, Space, and Click opens inspection dialog with focus return", async ({
    page,
  }) => {
    await page.goto(entry)
    const card = page.locator('[data-testid="reader-card"]').first()
    await expect(card).toBeVisible()
    await expect(card).toHaveAttribute("role", "button")
    await expect(card).toHaveAttribute("aria-haspopup", "dialog")
    await expect(card).toHaveAttribute("tabindex", "0")

    // Guarded negative: modifier keys (Shift, Control, Alt, Meta) must NOT trigger activation
    await card.focus()
    for (const mod of ["Shift", "Control", "Alt", "Meta"]) {
      await page.keyboard.press(`${mod}+Enter`)
      await expect(page.getByRole("dialog")).toHaveCount(0)
    }

    // Guarded negative: text selection inside card must NOT trigger activation
    await page.evaluate(() => {
      const heading = document.querySelector('[data-testid="reader-card"] h2')
      if (heading && heading.firstChild) {
        const range = document.createRange()
        range.selectNodeContents(heading)
        const sel = window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(range)
      }
    })
    await card.focus()
    await page.keyboard.press("Enter")
    await expect(page.getByRole("dialog")).toHaveCount(0)
    await page.keyboard.press("Space")
    await expect(page.getByRole("dialog")).toHaveCount(0)
    await page.evaluate(() => window.getSelection()?.removeAllRanges())

    // Guarded negative: defaultPrevented synthetic event must NOT trigger activation
    await card.evaluate((el) => {
      const ev = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })
      ev.preventDefault()
      el.dispatchEvent(ev)
    })
    await expect(page.getByRole("dialog")).toHaveCount(0)

    // Guarded negative: composition / native 229 diagnostic must NOT trigger activation
    await card.evaluate((el) => {
      const ev = new KeyboardEvent("keydown", { key: "Enter", keyCode: 229, bubbles: true, cancelable: true })
      el.dispatchEvent(ev)
    })
    await expect(page.getByRole("dialog")).toHaveCount(0)

    // Click card opens detail dialog
    await card.click()
    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()
    await expect(dialog).toContainText("Summary")
    await expect(dialog).toContainText("Triage")

    // Close dialog returns focus to the card
    const closeBtn = dialog.getByRole("button", { name: "Close" }).last()
    await closeBtn.click()
    await expect(dialog).toHaveCount(0)
    await expect(card).toBeFocused()

    // Keyboard activation with Enter
    await card.focus()
    await page.keyboard.press("Enter")
    await expect(page.getByRole("dialog")).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(page.getByRole("dialog")).toHaveCount(0)
    await expect(card).toBeFocused()

    // Keyboard activation with Space
    await page.keyboard.press("Space")
    await expect(page.getByRole("dialog")).toBeVisible()
    await page.getByRole("dialog").getByRole("button", { name: "Close" }).last().click()
    await expect(card).toBeFocused()
  })

  test("interactive descendants and excluded elements do not trigger card navigation", async ({
    page,
  }) => {
    await page.goto(entry)
    const card = page.locator('[data-testid="reader-card"]').first()

    // Click reading controls toggle
    const toggleReadBtn = card.getByRole("button", { name: /Mark as/i })
    await toggleReadBtn.click()
    // Should NOT open dialog
    await expect(page.getByRole("dialog")).toHaveCount(0)

    // Click tablist inside card
    const curatedTab = card.getByRole("tab", { name: "Curated note", exact: true })
    await curatedTab.click()
    await expect(page.getByRole("dialog")).toHaveCount(0)
    await expect(card.getByRole("textbox", { name: "Curated note" })).toBeVisible()

    // Return to content tab to expose action pills
    const contentTab = card.getByRole("tab", { name: "Content", exact: true })
    await contentTab.click()

    // Click action pill (e.g. Route)
    const routePill = card.getByRole("button", { name: "Route fragment", exact: true })
    await routePill.click()
    await expect(page.locator('[aria-label^="Fragment detail:"]')).toHaveCount(0)
    await expect(page.locator('[data-reader-inline-action="route"]')).toBeVisible()
    await page.keyboard.press("Escape")
  })

  test("local reading state and tag mutations update fictional local state", async ({ page }) => {
    await page.goto(entry)
    const card = page.locator('[data-testid="reader-card"]').first()

    // Toggle read
    const readBtn = card.locator("[data-reader-reading-controls] button").first()
    const initialText = await readBtn.innerText()
    await readBtn.click()
    const nextText = await readBtn.innerText()
    expect(nextText).not.toEqual(initialText)

    // Add tag
    const addTagBtn = card.getByRole("button", { name: "Add tag", exact: true })
    await addTagBtn.click()
    const tagInput = card.getByRole("textbox", { name: "New tag", exact: true })
    await tagInput.fill("custom-tag")
    await card.getByRole("button", { name: "Save tag", exact: true }).click()
    await expect(card.locator("[data-reader-tags]")).toContainText("custom-tag")

    // Remove the added user tag
    const removeBtn = card.getByRole("button", { name: "Remove tag custom-tag", exact: true })
    await removeBtn.click()
    await expect(card.locator("[data-reader-tags]")).not.toContainText("custom-tag")
  })

  test("loading, empty, and initial error states with retry", async ({ page }, info) => {
    // 5 Skeletons loading state
    await page.goto("/?example=reader&appearance=loading")
    const skeletons = page.locator('[role="status"][aria-label="Loading Reader"] .rounded-sm')
    await expect(skeletons).toHaveCount(5)
    await page.screenshot({ path: info.outputPath("reader-loading-desktop.png") })

    // Empty state
    await page.goto("/?example=reader&appearance=empty&scope=inbox")
    await expect(page.locator("main")).toContainText("No fragments in inbox")
    await page.screenshot({ path: info.outputPath("reader-empty-desktop.png") })

    // Error state with retry
    await page.goto("/?example=reader&appearance=error")
    await expect(page.locator("main")).toContainText("Reader could not load")
    const retryBtn = page.getByRole("button", { name: "Try again", exact: true })
    await expect(retryBtn).toBeVisible()
    await retryBtn.click()
    // Retrying restores recorded appearance
    await expect(page.locator("main")).toContainText("6 fragments")
  })

  test("deterministic two-page cursor pagination with load-more and ID deduplication", async ({
    page,
  }) => {
    await page.goto("/?example=reader&scope=library")
    await expect(page.locator("main")).toContainText("8 fragments")

    const loadMoreBtn = page.getByRole("button", { name: "Load more", exact: true })
    await expect(loadMoreBtn).toBeVisible()
    await loadMoreBtn.click()

    // Page 2 loaded -> 14 fragments, load more disappears
    await expect(page.locator("main")).toContainText("14 fragments")
    await expect(page.getByRole("button", { name: "Load more", exact: true })).toHaveCount(0)
  })

  test("inline page error and retry on pagination", async ({ page }) => {
    await page.goto("/?example=reader&scope=library&appearance=inline-error")
    await expect(page.locator("main")).toContainText("8 fragments")

    // Error message is displayed
    await expect(page.locator("main")).toContainText("Failed to load additional fragments")
    const tryAgainBtn = page.getByRole("button", { name: "Try again", exact: true })
    await expect(tryAgainBtn).toBeVisible()

    await tryAgainBtn.click()
    await expect(page.locator("main")).toContainText("14 fragments")
  })

  test("media visual preview and modal focus return", async ({ page }) => {
    await page.goto(entry)
    const visualBtn = page.locator("[data-reader-card-visual]").first()
    await expect(visualBtn).toBeVisible()
    await visualBtn.click()
    const mediaDialog = page.getByRole("dialog")
    await expect(mediaDialog).toBeVisible()
    await expect(mediaDialog.locator("img")).toBeVisible()
    await mediaDialog.getByRole("button", { name: "Close" }).last().click()
    await expect(mediaDialog).toHaveCount(0)
    await expect(visualBtn).toBeFocused()
  })

  test("responsive viewport checks and token-only layout", async ({ page }, info) => {
    // 1440x900 (Desktop)
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(entry)
    await expect(page.locator(".reader-example")).toBeVisible()
    await page.screenshot({ path: info.outputPath("reader-viewport-1440x900.png") })

    // 390x844 (Mobile portrait)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(entry)
    await expect(page.locator(".reader-example")).toBeVisible()
    await page.screenshot({ path: info.outputPath("reader-viewport-390x844.png") })

    // 1440x420 (Short desktop)
    await page.setViewportSize({ width: 1440, height: 420 })
    await page.goto(entry)
    await expect(page.locator(".reader-example")).toBeVisible()
    await page.screenshot({ path: info.outputPath("reader-viewport-1440x420.png") })

    // 390x420 (Short mobile)
    await page.setViewportSize({ width: 390, height: 420 })
    await page.goto(entry)
    await expect(page.locator(".reader-example")).toBeVisible()
    await page.screenshot({ path: info.outputPath("reader-viewport-390x420.png") })
  })

  test("all 10 public themes and light/dark modes apply cleanly with resolved computed tokens", async ({
    page,
  }) => {
    const publicThemes = [
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
    ] as const

    for (const theme of publicThemes) {
      for (const mode of ["dark", "light"] as const) {
        await page.goto(`/?example=reader&theme=${theme}&mode=${mode}`)
        const root = page.locator(".reader-example")
        await expect(root).toBeVisible()
        await expect(root).toHaveAttribute("data-theme", theme)
        await expect(root).toHaveAttribute("data-mode", mode)
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme)
        await expect(page.locator("html")).toHaveAttribute("data-mode", mode)

        const styles = await root.evaluate((el) => {
          const cs = window.getComputedStyle(el)
          return {
            color: cs.color,
            backgroundColor: cs.backgroundColor,
            fontFamily: cs.fontFamily,
          }
        })
        expect(styles.color).toMatch(/^rgba?\(/)
        expect(styles.backgroundColor).toMatch(/^rgba?\(/)
        expect(styles.fontFamily.length).toBeGreaterThan(0)
      }
    }

    // Verify legacy alias normalization to public sysop themes
    const aliases: Record<string, string> = {
      "p4-white": "sysop-p4-white",
      "p1-green-phosphor": "sysop-green-phosphor",
      "p3-amber-phosphor": "sysop-amber-phosphor",
      "hi-contrast": "sysop-hi-contrast",
    }
    for (const [alias, canonical] of Object.entries(aliases)) {
      await page.goto(`/?example=reader&theme=${alias}&mode=dark`)
      const root = page.locator(".reader-example")
      await expect(root).toBeVisible()
      await expect(root).toHaveAttribute("data-theme", canonical)
    }

    // Verify theme-specific resolved color differences (Sysop Green Phosphor vs Nanite Default)
    await page.goto("/?example=reader&theme=sysop-green-phosphor&mode=dark")
    const greenColor = await page.locator(".reader-example").evaluate((el) => window.getComputedStyle(el).color)
    await page.goto("/?example=reader&theme=nanite-default&mode=dark")
    const naniteColor = await page.locator(".reader-example").evaluate((el) => window.getComputedStyle(el).color)
    expect(greenColor).not.toEqual(naniteColor)

    // Verify mode differences (Dark vs Light background on Nanite Default)
    const naniteDarkBg = await page.locator(".reader-example").evaluate((el) => window.getComputedStyle(el).backgroundColor)
    await page.goto("/?example=reader&theme=nanite-default&mode=light")
    const naniteLightBg = await page.locator(".reader-example").evaluate((el) => window.getComputedStyle(el).backgroundColor)
    expect(naniteDarkBg).not.toEqual(naniteLightBg)
  })
})
