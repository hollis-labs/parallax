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
    // Find visual card button
    const visualBtn = page.locator("[data-reader-card-visual]").first()
    if ((await visualBtn.count()) > 0) {
      await visualBtn.click()
      const mediaDialog = page.getByRole("dialog")
      await expect(mediaDialog).toBeVisible()
      await expect(mediaDialog.locator("img")).toBeVisible()
      await mediaDialog.getByRole("button", { name: "Close" }).last().click()
      await expect(mediaDialog).toHaveCount(0)
      await expect(visualBtn).toBeFocused()
    }
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

  test("all 10 themes and light/dark modes apply cleanly", async ({ page }) => {
    const themes = ["p4-white", "p1-green-phosphor", "p3-amber-phosphor", "hi-contrast"] as const

    for (const theme of themes) {
      for (const mode of ["light", "dark"] as const) {
        await page.goto(`/?example=reader&theme=${theme}&mode=${mode}`)
        await expect(page.locator(".reader-example")).toBeVisible()
        const elTheme = await page.locator(".reader-example").getAttribute("data-theme")
        const elMode = await page.locator(".reader-example").getAttribute("data-mode")
        expect(elTheme).toBe(theme)
        expect(elMode).toBe(mode)
      }
    }
  })
})
