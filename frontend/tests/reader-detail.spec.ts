import { expect, test } from "@playwright/test"

test.describe("Reader Detail Page and Renderers", () => {
  test("canonicalizes route, handles missing/invalid scope, and preserves detail parameters", async ({
    page,
  }) => {
    // Missing scope canonicalizes to inbox
    await page.goto("/?example=reader&fragmentId=FRAG-001")
    await expect(page).toHaveURL(/\/\?example=reader&fragmentId=FRAG-001&scope=inbox/)

    // Invalid scope canonicalizes to inbox
    await page.goto("/?example=reader&fragmentId=FRAG-001&scope=invalid_scope")
    await expect(page).toHaveURL(/\/\?example=reader&fragmentId=FRAG-001&scope=inbox/)

    // Header elements
    await expect(page.getByRole("button", { name: "Back to Reader inbox" })).toBeVisible()
    await expect(page.getByRole("button", { name: "Refresh", exact: true })).toBeVisible()
    await expect(page.getByRole("button", { name: "Copy link", exact: true })).toBeVisible()

    // Title and revision pin
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "How Durable Content Memory Reshapes Knowledge Tools",
    )
    await expect(page.locator("[data-reader-revision-pin]")).toHaveAttribute(
      "data-fragment-id",
      "FRAG-001",
    )
  })

  test("handles invalid revision with dedicated error and without URL rewrite", async ({
    page,
  }) => {
    // Empty revision_id parameter
    await page.goto("/?example=reader&fragmentId=FRAG-001&revision_id=")
    await expect(page.getByText("The revision link is invalid.")).toBeVisible()
    expect(page.url()).toContain("revision_id=")

    // Repeated revision_id parameter
    await page.goto("/?example=reader&fragmentId=FRAG-001&revision_id=rev1&revision_id=rev2")
    await expect(page.getByText("The revision link is invalid.")).toBeVisible()
    expect(page.url()).toContain("revision_id=rev1")
  })

  test("handles unknown fragment with not-found state and back navigation", async ({ page }) => {
    await page.goto("/?example=reader&fragmentId=FRAG-999&scope=inbox")
    await expect(page.getByText("The Reader item could not be loaded.")).toBeVisible()

    // Back to Reader button navigates back to list view
    const backBtn = page.getByRole("button", { name: "Back to Reader", exact: true })
    await expect(backBtn).toBeVisible()
    await backBtn.click()
    await expect(page).toHaveURL(/\/\?example=reader&scope=inbox$/)
    await expect(page.getByRole("heading", { name: "Reader", exact: true })).toBeVisible()
  })

  test("renders all 8 renderers in detail mode faithfully", async ({ page }, info) => {
    // 1. Article (FRAG-001)
    await page.goto("/?example=reader&fragmentId=FRAG-001&scope=inbox")
    const articleStage = page.locator(
      '[data-reader-renderer="article"][data-reader-presentation="detail"]',
    )
    await expect(articleStage).toBeVisible()
    await expect(articleStage).toContainText("Full article available (reading preview displayed).")
    await page.screenshot({ path: info.outputPath("reader-detail-article.png") })

    // 2. Image (FRAG-002)
    await page.goto("/?example=reader&fragmentId=FRAG-002&scope=inbox")
    const imageStage = page.locator(
      '[data-reader-renderer="image"][data-reader-presentation="detail"]',
    )
    await expect(imageStage).toBeVisible()
    const viewLargerBtn = imageStage.getByRole("button", { name: /View larger image/i })
    await expect(viewLargerBtn).toBeVisible()
    await viewLargerBtn.click()
    const imageDialog = page.getByRole("dialog")
    await expect(imageDialog).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(imageDialog).toHaveCount(0)
    await page.screenshot({ path: info.outputPath("reader-detail-image.png") })

    // 3. Gallery (FRAG-003) - with 4 items covering mixed acquisition states
    await page.goto("/?example=reader&fragmentId=FRAG-003&scope=inbox")
    const galleryStage = page.locator(
      '[data-reader-renderer="gallery"][data-reader-presentation="detail"]',
    )
    await expect(galleryStage).toBeVisible()

    // Item 1 (available)
    await expect(page.locator("p[aria-live='polite']")).toContainText("1 of 4")

    // Item 2 (pending)
    await page.getByRole("button", { name: /Select item 2 of 4/i }).click()
    await expect(page.locator("p[aria-live='polite']")).toContainText("2 of 4")
    await expect(galleryStage.getByText("Image 2 is preparing media")).toBeVisible()

    // Item 3 (reference_only)
    await page.getByRole("button", { name: /Select item 3 of 4/i }).click()
    await expect(page.locator("p[aria-live='polite']")).toContainText("3 of 4")
    await expect(galleryStage.getByText("Image 3 is source reference only")).toBeVisible()

    // Item 4 (failed)
    await page.getByRole("button", { name: /Select item 4 of 4/i }).click()
    await expect(page.locator("p[aria-live='polite']")).toContainText("4 of 4")
    await expect(galleryStage.getByText("Image 4 is media unavailable")).toBeVisible()

    // Return to item 1 and open gallery dialog
    await page.getByRole("button", { name: /Select item 1 of 4/i }).click()
    await page.getByRole("button", { name: /Open gallery at item 1 of 4/i }).click()
    const galleryDialog = page.getByRole("dialog")
    await expect(galleryDialog).toBeVisible()

    // Keyboard navigation inside gallery dialog: ArrowRight, ArrowLeft, End, Home
    await galleryDialog.press("ArrowRight")
    await expect(galleryDialog.locator("[aria-live='polite']")).toContainText("2 of 4")
    await galleryDialog.press("ArrowRight")
    await expect(galleryDialog.locator("[aria-live='polite']")).toContainText("3 of 4")
    await galleryDialog.press("End")
    await expect(galleryDialog.locator("[aria-live='polite']")).toContainText("4 of 4")
    await galleryDialog.press("Home")
    await expect(galleryDialog.locator("[aria-live='polite']")).toContainText("1 of 4")
    await page.keyboard.press("Escape")
    await expect(galleryDialog).toHaveCount(0)
    await page.screenshot({ path: info.outputPath("reader-detail-gallery.png") })

    // 4. Video (FRAG-004) - inert video preview
    await page.goto("/?example=reader&fragmentId=FRAG-004&scope=inbox")
    const videoStage = page.locator(
      '[data-reader-renderer="video"][data-reader-presentation="detail"]',
    )
    await expect(videoStage).toBeVisible()
    await expect(
      videoStage.getByText(/Inert video preview · No network\/third-party embeds/i),
    ).toBeVisible()
    await expect(videoStage.locator("aside[aria-label='Transcript status']")).toBeVisible()
    const expandVideoBtn = videoStage.getByRole("button", { name: "Expand video", exact: true })
    await expect(expandVideoBtn).toBeVisible()
    await expandVideoBtn.click()
    const videoDialog = page.getByRole("dialog")
    await expect(videoDialog).toBeVisible()
    await expect(
      videoDialog.getByText(/External YouTube\/provider network playback is disabled/i),
    ).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(videoDialog).toHaveCount(0)
    await page.screenshot({ path: info.outputPath("reader-detail-video.png") })

    // 5. Audio (FRAG-005) - extension point
    await page.goto("/?example=reader&fragmentId=FRAG-005&scope=inbox")
    const audioStage = page.locator(
      '[data-reader-renderer="audio"][data-reader-presentation="detail"]',
    )
    await expect(audioStage).toBeVisible()
    await expect(audioStage.getByText(/Inline audio playback is an extension point/i)).toBeVisible()
    await page.screenshot({ path: info.outputPath("reader-detail-audio.png") })

    // 6. Document (FRAG-006) - extension point
    await page.goto("/?example=reader&fragmentId=FRAG-006&scope=inbox")
    const docStage = page.locator(
      '[data-reader-renderer="document"][data-reader-presentation="detail"]',
    )
    await expect(docStage).toBeVisible()
    await expect(docStage.getByText(/Inline page rendering is an extension point/i)).toBeVisible()
    await page.screenshot({ path: info.outputPath("reader-detail-document.png") })

    // 7. Text (FRAG-007) - library scope
    await page.goto("/?example=reader&fragmentId=FRAG-007&scope=library")
    const textStage = page.locator(
      '[data-reader-renderer="article"][data-reader-presentation="detail"]',
    )
    await expect(textStage).toBeVisible()
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Raw Terminal Session Transcript",
    )
    await page.screenshot({ path: info.outputPath("reader-detail-text.png") })

    // 8. Unknown (FRAG-008) - fallback
    await page.goto("/?example=reader&fragmentId=FRAG-008&scope=library")
    const unknownStage = page.locator(
      '[data-reader-renderer="unknown"][data-reader-presentation="detail"]',
    )
    await expect(unknownStage).toBeVisible()
    await expect(
      unknownStage.getByRole("heading", { name: "Readable text", exact: true }),
    ).toBeVisible()
    await page.screenshot({ path: info.outputPath("reader-detail-unknown.png") })
  })

  test("guarded record navigation contract with stop bounds, keyboard shortcuts, and vetoes", async ({
    page,
  }) => {
    // Inbox contains 6 items: FRAG-001 to FRAG-006
    await page.goto("/?example=reader&fragmentId=FRAG-001&scope=inbox")
    const prevBtn = page.getByRole("button", { name: "Previous inbox item", exact: true })
    const nextBtn = page.getByRole("button", { name: "Next inbox item", exact: true })

    // Boundary 1: At start of admitted list, previous is disabled and ArrowLeft stops
    await expect(prevBtn).toBeDisabled()
    await expect(nextBtn).toBeEnabled()
    await page.keyboard.press("ArrowLeft")
    await expect(page).toHaveURL(/fragmentId=FRAG-001/)

    // Advance with ArrowRight to item 2 (FRAG-002)
    await page.keyboard.press("ArrowRight")
    await expect(page).toHaveURL(/fragmentId=FRAG-002/)
    await expect(prevBtn).toBeEnabled()

    // Advance with Next button to item 3 (FRAG-003)
    await nextBtn.click()
    await expect(page).toHaveURL(/fragmentId=FRAG-003/)

    // Modifier keys are vetoed: Shift+ArrowRight, Control+ArrowRight, Alt+ArrowRight, Meta+ArrowRight
    for (const mod of ["Shift", "Control", "Alt", "Meta"]) {
      await page.keyboard.press(`${mod}+ArrowRight`)
      await expect(page).toHaveURL(/fragmentId=FRAG-003/)
    }

    // Editable element veto: focus inside textarea, ArrowRight does not navigate
    const noteArea = page.getByRole("textbox", { name: "Curated note" })
    await expect(noteArea).toBeVisible()
    await noteArea.focus()
    await page.keyboard.press("ArrowRight")
    await expect(page).toHaveURL(/fragmentId=FRAG-003/)

    // Navigate to last item (FRAG-006)
    await page.goto("/?example=reader&fragmentId=FRAG-006&scope=inbox")
    await expect(prevBtn).toBeEnabled()
    await expect(nextBtn).toBeDisabled()

    // Boundary 2: At end of admitted list, next is disabled and ArrowRight stops
    await page.keyboard.press("ArrowRight")
    await expect(page).toHaveURL(/fragmentId=FRAG-006/)
  })

  test("transitions from list card popup dialog to full detail page", async ({ page }) => {
    await page.goto("/?example=reader&scope=inbox")
    const firstCard = page.locator('[data-testid="reader-card"]').first()
    await firstCard.click()

    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()

    const fullDetailLink = dialog.getByRole("link", {
      name: "Open full detail page →",
      exact: true,
    })
    await expect(fullDetailLink).toBeVisible()
    await fullDetailLink.click()

    await expect(page).toHaveURL(/\/\?example=reader&fragmentId=FRAG-001&scope=inbox/)
    await expect(page.locator("[data-reader-revision-pin]")).toHaveAttribute(
      "data-fragment-id",
      "FRAG-001",
    )

    // Clicking "Reader" back button returns to list
    const backBtn = page.getByRole("button", { name: "Back to Reader inbox", exact: true })
    await backBtn.click()
    await expect(page).toHaveURL(/\/\?example=reader&scope=inbox$/)
  })

  test("copy link action provides feedback and manual refresh preserves detail", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"])
    await page.goto("/?example=reader&fragmentId=FRAG-001&scope=inbox")

    const copyBtn = page.getByRole("button", { name: "Copy link", exact: true })
    await copyBtn.click()
    await expect(page.getByRole("status").filter({ hasText: "Link copied" })).toBeVisible()

    // Manual refresh preserves current detail view
    const refreshBtn = page.getByRole("button", { name: "Refresh", exact: true })
    await refreshBtn.click()
    await expect(page).toHaveURL(/\/\?example=reader&fragmentId=FRAG-001&scope=inbox/)
    await expect(page.locator("[data-reader-revision-pin]")).toHaveAttribute(
      "data-fragment-id",
      "FRAG-001",
    )
  })

  test("detail view renders cleanly across viewports, themes, and light/dark modes", async ({
    page,
  }) => {
    const viewports = [
      { width: 1440, height: 900, label: "desktop" },
      { width: 390, height: 844, label: "mobile" },
      { width: 1440, height: 420, label: "short-desktop" },
      { width: 390, height: 420, label: "short-mobile" },
    ]

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto("/?example=reader&fragmentId=FRAG-003&scope=inbox")
      const root = page.locator(".reader-example")
      await expect(root).toBeVisible()
    }

    // Reset viewport
    await page.setViewportSize({ width: 1440, height: 900 })

    // Test themes and modes computed styles
    const themes = ["sysop-p4-white", "nanite-default", "sysop-green-phosphor"] as const
    for (const theme of themes) {
      for (const mode of ["dark", "light"] as const) {
        await page.goto(`/?example=reader&fragmentId=FRAG-001&theme=${theme}&mode=${mode}`)
        const root = page.locator(".reader-example")
        await expect(root).toBeVisible()
        await expect(root).toHaveAttribute("data-theme", theme)
        await expect(root).toHaveAttribute("data-mode", mode)

        const styles = await root.evaluate((el) => {
          const cs = window.getComputedStyle(el)
          return { color: cs.color, backgroundColor: cs.backgroundColor }
        })
        expect(styles.color).toMatch(/^rgba?\(/)
        expect(styles.backgroundColor).toMatch(/^rgba?\(/)
      }
    }
  })
})
