import { expect, test } from "@playwright/test"

declare global {
  interface Window {
    readerDetail?: {
      handleBack: () => boolean
      handleRefresh: () => boolean
      handlePrevious: () => boolean
      handleNext: () => boolean
      isAdmitted: (targetPopup?: HTMLElement | null) => boolean
      fresh: {
        Back: () => boolean
        Refresh: () => boolean
        Previous: () => boolean
        Next: () => boolean
      }
    }
    heldAction?: () => boolean
  }
}

test.use({ baseURL: `http://127.0.0.1:${process.env.READER_PORT ?? 18545}` })

test.describe("Reader Detail Custody and Lifecycle Leases", () => {
  test("once-working retained action refuses committed source retirement and does not revive on A -> B -> A", async ({
    page,
  }) => {
    await page.goto("/reader-lifecycle.html")
    await expect(page.getByTestId("reader-detail-page")).toBeVisible()
    await expect(page.getByTestId("current-fragment-id")).toHaveText("FRAG-002")

    // 1. Initial fresh positive on source A (FRAG-002)
    await expect
      .poll(() => page.evaluate(() => window.readerDetail?.handleBack() ?? false))
      .toBe(true)

    // 2. Retain the DOM action callback from frame A
    await page.evaluate(() => {
      window.heldAction = window.readerDetail?.handleBack
    })
    expect(await page.evaluate(() => window.heldAction?.())).toBe(true)

    // 3. Switch to source B (FRAG-003)
    await page.getByRole("button", { name: "Toggle fixture source" }).click()
    await expect(page.getByTestId("current-fragment-id")).toHaveText("FRAG-003")

    // 4. Stale callback from A must refuse in frame B
    expect(await page.evaluate(() => window.heldAction?.())).toBe(false)

    // Fresh callback in frame B works
    await expect
      .poll(() => page.evaluate(() => window.readerDetail?.handleBack() ?? false))
      .toBe(true)

    // 5. Switch back to source A (FRAG-002)
    await page.getByRole("button", { name: "Toggle fixture source" }).click()
    await expect(page.getByTestId("current-fragment-id")).toHaveText("FRAG-002")

    // 6. Non-revival: The callback from the FIRST activation of A MUST STILL RETURN FALSE
    expect(await page.evaluate(() => window.heldAction?.())).toBe(false)

    // 7. Fresh action in the second activation of A works
    await expect
      .poll(() => page.evaluate(() => window.readerDetail?.handleBack() ?? false))
      .toBe(true)

    // 8. Actual DOM button click in frame A works
    await page.getByRole("button", { name: "Back to Reader inbox" }).click()
  })

  test("once-working retained action refuses committed React Activity retirement with fresh positive", async ({
    page,
  }) => {
    await page.goto("/reader-lifecycle.html")
    await expect(page.getByTestId("reader-detail-page")).toBeVisible()

    await expect
      .poll(() => page.evaluate(() => window.readerDetail?.handleBack() ?? false))
      .toBe(true)

    await page.evaluate(() => {
      window.heldAction = window.readerDetail?.handleBack
    })
    expect(await page.evaluate(() => window.heldAction?.())).toBe(true)

    // Toggle Activity to hidden
    await page.getByRole("button", { name: "Toggle fixture Activity" }).click()
    await expect(page.getByTestId("reader-detail-page")).toBeHidden()

    // Action refuses while Activity is hidden
    expect(await page.evaluate(() => window.heldAction?.())).toBe(false)

    // Toggle Activity back to visible
    await page.getByRole("button", { name: "Toggle fixture Activity" }).click()
    await expect(page.getByTestId("reader-detail-page")).toBeVisible()

    // Fresh action in visible activity works
    await expect
      .poll(() => page.evaluate(() => window.readerDetail?.handleBack() ?? false))
      .toBe(true)
    await page.getByRole("button", { name: "Back to Reader inbox" }).click()
  })

  test("once-working retained action refuses committed root unmount retirement with fresh positive", async ({
    page,
  }) => {
    await page.goto("/reader-lifecycle.html")
    await expect(page.getByTestId("reader-detail-page")).toBeVisible()

    await expect
      .poll(() => page.evaluate(() => window.readerDetail?.handleBack() ?? false))
      .toBe(true)

    await page.evaluate(() => {
      window.heldAction = window.readerDetail?.handleBack
    })
    expect(await page.evaluate(() => window.heldAction?.())).toBe(true)

    // Toggle root: unmount
    await page.getByRole("button", { name: "Toggle fixture root" }).click()
    await expect(page.getByTestId("reader-detail-page")).toHaveCount(0)

    // Unmounted action refuses
    expect(await page.evaluate(() => window.heldAction?.())).toBe(false)

    // Toggle root: remount
    await page.getByRole("button", { name: "Toggle fixture root" }).click()
    await expect(page.getByTestId("reader-detail-page")).toBeVisible()

    // Non-revival: Held action from prior root mount remains permanently dead
    expect(await page.evaluate(() => window.heldAction?.())).toBe(false)

    // Fresh action in remounted root works
    await expect
      .poll(() => page.evaluate(() => window.readerDetail?.handleBack() ?? false))
      .toBe(true)
    await page.getByRole("button", { name: "Back to Reader inbox" }).click()
  })

  for (const role of ["dialog", "menu", "listbox"] as const) {
    test(`detail action callbacks yield to newer visible ${role} and plain foreground focus`, async ({
      page,
    }) => {
      await page.goto("/reader-lifecycle.html")
      await expect(page.getByTestId("reader-detail-page")).toBeVisible()

      await page.evaluate(() => {
        window.heldAction = window.readerDetail?.handleBack
      })
      expect(await page.evaluate(() => window.heldAction?.())).toBe(true)

      // Inject competing layer with specified role
      const ready = await page.evaluate((r) => {
        const owner = document.createElement("div")
        owner.id = "competing-owner"
        owner.setAttribute("role", r)
        owner.style.width = "200px"
        owner.style.height = "100px"
        owner.style.position = "fixed"
        owner.style.top = "10px"
        owner.style.left = "10px"
        owner.style.zIndex = "9999"
        const input = document.createElement("input")
        owner.append(input)
        document.body.prepend(owner)
        input.focus()
        return !!owner.getClientRects().length && document.activeElement === input
      }, role)
      expect(ready).toBe(true)

      // Must yield to competing layer
      expect(await page.evaluate(() => window.heldAction?.())).toBe(false)

      // Remove competing layer
      await page.locator("#competing-owner").evaluate((el) => el.remove())

      // Focus plain foreground owner outside Reader root
      const plain = page.getByRole("textbox", { name: "New plain foreground owner" })
      await plain.focus()
      await expect(plain).toBeFocused()

      // Must yield to plain foreground focus outside reader root
      expect(await page.evaluate(() => window.heldAction?.())).toBe(false)

      // Focus returns to reader detail root
      await page.getByTestId("reader-detail-page").click()
      await expect
        .poll(() => page.evaluate(() => window.readerDetail?.handleBack() ?? false))
        .toBe(true)
    })
  }

  test("MediaDialog finalFocus honors source generation and refuses steal when plain foreground owner is active", async ({
    page,
  }) => {
    await page.goto("/?example=reader&fragmentId=FRAG-002&scope=inbox")
    await expect(page.getByTestId("reader-detail-page")).toBeVisible()

    // 1. Open image preview dialog
    const zoomTrigger = page.getByRole("button", { name: /^View larger image/ })
    await zoomTrigger.click()
    const dialog = page.locator("[data-reader-dialog]")
    await expect(dialog).toBeVisible()

    // 2. Normal close restores focus to opener
    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    await expect(zoomTrigger).toBeFocused()

    // 3. Open dialog again, then focus a newer plain foreground owner
    await zoomTrigger.click()
    await expect(dialog).toBeVisible()

    await page.evaluate(() => {
      const ext = document.createElement("input")
      ext.id = "plain-ext-owner"
      ext.setAttribute("aria-label", "External active input")
      document.body.appendChild(ext)
      ext.focus()
    })
    const extInput = page.locator("#plain-ext-owner")
    await expect(extInput).toBeFocused()

    // 4. Close dialog while plain foreground owner is active
    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()

    // FinalFocus refusal: Focus must NOT be stolen back to zoomTrigger; remains on extInput
    await expect(extInput).toBeFocused()
    await extInput.evaluate((el) => el.remove())
  })

  test("PM inert notes, tags, and state controls preserve read-only write boundary", async ({
    page,
  }) => {
    // Collect network requests to verify NO unauthorized mutation requests
    const mutations: string[] = []
    page.on("request", (req) => {
      if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method())) {
        mutations.push(`${req.method()} ${req.url()}`)
      }
    })

    await page.goto("/?example=reader&fragmentId=FRAG-001&scope=inbox")
    await expect(page.getByTestId("reader-detail-page")).toBeVisible()

    // Verify read-only badges / controls are visible
    await expect(page.getByText("Read-only specimen").first()).toBeVisible()
    await expect(page.getByText("Read-only tags")).toBeVisible()

    // Click refresh button in header
    await page.getByRole("button", { name: "Refresh" }).click()

    // Confirm strictly zero mutations occurred
    expect(mutations).toHaveLength(0)
  })
})
