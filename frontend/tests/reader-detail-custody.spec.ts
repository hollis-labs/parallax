import { expect, test } from "@playwright/test"

declare global {
  interface Window {
    readerDetail?: {
      fresh: {
        Back?: () => boolean
        Refresh?: () => boolean
        Previous?: () => boolean
        Next?: () => boolean
      }
      lifecycle?: {
        alive: boolean
        lease: number
        generation: string
        access: boolean
        layer: boolean
        activity: boolean
      }
      retire?: (boundary: "source" | "access" | "layer" | "root" | "Activity") => void
      restore?: (boundary: "source" | "access" | "layer" | "root" | "Activity") => void
    }
    heldCallback?: () => boolean
  }
}

test.describe("Reader Detail Custody and Lifecycle Leases", () => {
  for (const boundary of ["source", "access", "layer", "root", "Activity"] as const) {
    test(`once-working retained callbacks refuse committed ${boundary} retirement with fresh positive`, async ({
      page,
    }) => {
      await page.goto("/?example=reader&fragmentId=FRAG-002&scope=inbox")
      await expect(page.locator("[data-testid='reader-detail-page']")).toBeVisible()

      // 1. Initial fresh positive
      await expect
        .poll(() =>
          page.evaluate(() => {
            const fresh = window.readerDetail?.fresh
            return !!fresh?.Back?.() && !!fresh?.Refresh?.() && !!fresh?.Previous?.()
          }),
        )
        .toBe(true)

      // 2. Retain the callback
      await page.evaluate(() => {
        window.heldCallback = window.readerDetail?.fresh?.Back
      })
      expect(await page.evaluate(() => window.heldCallback?.())).toBe(true)

      // 3. Retire the boundary
      await page.evaluate((b) => {
        window.readerDetail?.retire?.(b)
      }, boundary)

      // 4. Stale callback must refuse (old-negative)
      expect(await page.evaluate(() => window.heldCallback?.())).toBe(false)

      // 5. Restore the boundary to obtain fresh positive
      await page.evaluate((b) => {
        window.readerDetail?.restore?.(b)
      }, boundary)

      // Fresh callback is now admitted (fresh-positive)
      await expect.poll(() => page.evaluate(() => window.readerDetail?.fresh?.Back?.())).toBe(true)

      // The old retained callback STILL returns false (non-reviving)
      expect(await page.evaluate(() => window.heldCallback?.())).toBe(false)
    })
  }

  for (const role of ["dialog", "menu", "listbox"] as const) {
    test(`detail action callbacks yield to newer visible ${role} and plain foreground focus`, async ({
      page,
    }) => {
      await page.goto("/?example=reader&fragmentId=FRAG-002&scope=inbox")
      await expect(page.locator("[data-testid='reader-detail-page']")).toBeVisible()

      await page.evaluate(() => {
        window.heldCallback = window.readerDetail?.fresh?.Back
      })
      expect(await page.evaluate(() => window.heldCallback?.())).toBe(true)

      // Inject a competing layer with specified role into document.body
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

      // Retained callback must yield to competing layer
      expect(await page.evaluate(() => window.heldCallback?.())).toBe(false)

      // Remove competing layer
      await page.locator("#competing-owner").evaluate((el) => el.remove())

      // Action works again when competing layer is gone
      await expect.poll(() => page.evaluate(() => window.readerDetail?.fresh?.Back?.())).toBe(true)
    })
  }

  test("window navigation requires owned root focus, IME/modifier guards, and visible current-layer admission", async ({
    page,
  }) => {
    await page.goto("/?example=reader&fragmentId=FRAG-002&scope=inbox")
    await expect(page.locator("[data-testid='reader-detail-page']")).toBeVisible()

    // 1. Focus outside root: navigation is vetoed
    await page.evaluate(() => {
      const outside = document.createElement("button")
      outside.id = "outside-button"
      outside.textContent = "Outside element"
      document.body.appendChild(outside)
      outside.focus()
    })
    await expect(page.locator("#outside-button")).toBeFocused()
    await page.keyboard.press("ArrowRight")
    await expect(page).toHaveURL(/fragmentId=FRAG-002/)

    // Clean up outside element
    await page.locator("#outside-button").evaluate((el) => el.remove())

    // 2. Focus inside root: Arrow navigation works
    await page.getByRole("button", { name: "Back to Reader inbox" }).focus()
    await page.keyboard.press("ArrowRight")
    await expect(page).toHaveURL(/fragmentId=FRAG-003/)

    // 3. Modifier keys veto navigation
    await page.keyboard.press("Shift+ArrowLeft")
    await expect(page).toHaveURL(/fragmentId=FRAG-003/)
    await page.keyboard.press("Control+ArrowLeft")
    await expect(page).toHaveURL(/fragmentId=FRAG-003/)
    await page.keyboard.press("Alt+ArrowLeft")
    await expect(page).toHaveURL(/fragmentId=FRAG-003/)

    // 4. IME composition (229) vetoes navigation
    await page.evaluate(() => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "ArrowLeft",
          keyCode: 229,
          bubbles: true,
          cancelable: true,
        }),
      )
    })
    await expect(page).toHaveURL(/fragmentId=FRAG-003/)

    // 5. Open dialog vetoes navigation
    await page.getByRole("button", { name: /Open gallery|View larger image/ }).click()
    await expect(page.getByRole("dialog")).toBeVisible()
    await page.keyboard.press("ArrowLeft")
    // Still on FRAG-003 because dialog was open
    await expect(page).toHaveURL(/fragmentId=FRAG-003/)
  })

  test("proves PM inert notes, tags, reading controls, and acquisition write boundary", async ({
    page,
  }) => {
    await page.goto("/?example=reader&fragmentId=FRAG-001&scope=inbox")
    await expect(page.locator("[data-testid='reader-detail-page']")).toBeVisible()

    // 1. Notes textarea is readOnly and labeled as read-only specimen
    const notesArea = page.getByRole("textbox", { name: /read-only specimen/i })
    await expect(notesArea).toBeVisible()
    await expect(notesArea).toHaveAttribute("readonly", "")
    await expect(
      page.getByText("Read-only fictional specimen; mutations are inert and not saved."),
    ).toBeVisible()

    // 2. Tags are read-only specimen without mutation buttons
    await expect(page.getByText("Read-only tags")).toBeVisible()
    await expect(page.getByRole("button", { name: "Add tag" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: /Remove tag/ })).toHaveCount(0)

    // 3. Reading state is read-only specimen
    await expect(page.locator("[data-reader-reading-controls]")).toContainText("Read-only specimen")
    await expect(page.getByRole("button", { name: "Mark as read" })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Mark as unread" })).toHaveCount(0)

    // 4. Verify no fake "Saved locally" or "Note added" text exists
    await expect(page.getByText("Saved locally")).toHaveCount(0)
    await expect(page.getByText("Note added")).toHaveCount(0)
  })
})
