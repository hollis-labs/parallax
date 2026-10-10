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
    readerDialog?: {
      finalFocus: () => HTMLElement | false
      activeTicket: () => number | null
    }
    heldFinalFocus?: () => HTMLElement | false
  }
}

test.use({ baseURL: `http://127.0.0.1:${process.env.READER_PORT ?? 18545}` })

test.describe("Reader Detail Custody and Lifecycle Leases", () => {
  test("once-working retained action refuses committed source retirement and does not revive on A -> B -> A", async ({
    page,
  }) => {
    await page.goto("/reader-lifecycle.html")
    await expect(page.getByTestId("reader-detail-page")).toBeVisible()

    // 1. Initial state: FRAG-002 with revision REV-FRAG-002-01
    await expect(page.getByTestId("current-fragment-id")).toHaveText("FRAG-002")
    await expect(page.getByTestId("current-fragment-revision")).toHaveText("REV-FRAG-002-01")

    await expect
      .poll(() => page.evaluate(() => window.readerDetail?.handleBack() ?? false))
      .toBe(true)

    // 2. Retain the action callback from frame A
    await page.evaluate(() => {
      window.heldAction = window.readerDetail?.handleBack
    })
    expect(await page.evaluate(() => window.heldAction?.())).toBe(true)

    // 3. Switch to source B (FRAG-003, revision REV-FRAG-003-01)
    await page.getByRole("button", { name: "Toggle fixture source" }).click()
    await expect(page.getByTestId("current-fragment-id")).toHaveText("FRAG-003")
    await expect(page.getByTestId("current-fragment-revision")).toHaveText("REV-FRAG-003-01")

    // 4. Stale callback from A must refuse in frame B
    expect(await page.evaluate(() => window.heldAction?.())).toBe(false)

    // Fresh callback in frame B works
    await expect
      .poll(() => page.evaluate(() => window.readerDetail?.handleBack() ?? false))
      .toBe(true)

    // 5. Switch back to source A (FRAG-002)
    await page.getByRole("button", { name: "Toggle fixture source" }).click()
    await expect(page.getByTestId("current-fragment-id")).toHaveText("FRAG-002")
    await expect(page.getByTestId("current-fragment-revision")).toHaveText("REV-FRAG-002-01")

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

    // Assert SAME once-working held action captured before Activity retirement REMAINS FALSE after show
    expect(await page.evaluate(() => window.heldAction?.())).toBe(false)
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

    // Fresh action in remounted root works
    await expect
      .poll(() => page.evaluate(() => window.readerDetail?.handleBack() ?? false))
      .toBe(true)
    await page.getByRole("button", { name: "Back to Reader inbox" }).click()

    // Assert SAME once-working held action from prior mount remains permanently dead
    expect(await page.evaluate(() => window.heldAction?.())).toBe(false)
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

  test("MediaDialog finalFocus binds to opening activation, refuses reopen revival, and yields to foreground/competing layers", async ({
    page,
  }) => {
    await page.goto("/?example=reader&fragmentId=FRAG-002&scope=inbox")
    await expect(page.getByTestId("reader-detail-page")).toBeVisible()

    const zoomTrigger = page.getByRole("button", { name: /^View larger image/ })

    // 1. Open dialog (opening 1)
    await zoomTrigger.click()
    const dialog = page.locator("[data-reader-dialog]")
    await expect(dialog).toBeVisible()

    // Retain once-working finalFocus resolver from opening 1
    await page.evaluate(() => {
      window.heldFinalFocus = window.readerDialog?.finalFocus
    })
    expect(await page.evaluate(() => typeof window.heldFinalFocus === "function")).toBe(true)

    // Normal close restores focus to opener and fulfills opening 1
    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    await expect(zoomTrigger).toBeFocused()

    // Assert once-fulfilled opening 1 resolver is permanently dead (returns false)
    expect(await page.evaluate(() => window.heldFinalFocus?.())).toBe(false)

    // 2. Reopen dialog on same source (opening 2, C)
    await zoomTrigger.click()
    await expect(dialog).toBeVisible()
    const opening2Ticket = await page.evaluate(() => window.readerDialog?.activeTicket())
    expect(opening2Ticket).toBeTruthy()

    // Assert held resolver from opening 1 STILL returns false and does NOT revive on same-source reopen
    expect(await page.evaluate(() => window.heldFinalFocus?.())).toBe(false)

    // Assert C remains live and was NOT cancelled by invoking the stale resolver
    expect(await page.evaluate(() => window.readerDialog?.activeTicket())).toBe(opening2Ticket)

    // Fresh ordinary close of C still restores focus
    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    await expect(zoomTrigger).toBeFocused()

    // 3. Newer plain foreground owner active during close
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

    // Close dialog while plain foreground owner is active
    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()

    // Refusal: focus is NOT stolen back to zoomTrigger; remains on extInput
    await expect(extInput).toBeFocused()
    await extInput.evaluate((el) => el.remove())

    // 4. Competing layer check: external competing modal prevents finalFocus return
    await zoomTrigger.click()
    await expect(dialog).toBeVisible()

    await page.evaluate(() => {
      const competing = document.createElement("div")
      competing.id = "competing-modal"
      competing.setAttribute("role", "dialog")
      competing.style.position = "fixed"
      competing.style.top = "0"
      competing.style.left = "0"
      competing.style.width = "100px"
      competing.style.height = "100px"
      document.body.appendChild(competing)
    })

    // Resolver refuses focus return when another dialog is open
    expect(await page.evaluate(() => window.readerDialog?.finalFocus() ?? false)).toBe(false)
    await page.locator("#competing-modal").evaluate((el) => el.remove())
    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
  })

  test("MediaDialog retires across source transition and React Activity hide/show, refuses revival, and supports fresh native-close positive", async ({
    page,
  }) => {
    await page.goto("/reader-lifecycle.html")
    await expect(page.getByTestId("reader-detail-page")).toBeVisible()
    await expect(page.getByTestId("current-fragment-id")).toHaveText("FRAG-002")

    const zoomTrigger2 = page.getByRole("button", { name: /^View larger image/ })
    const dialog = page.locator("[data-reader-dialog]")

    // 1. Source transition: Open on FRAG-002
    await zoomTrigger2.click()
    await expect(dialog).toBeVisible()

    await page.evaluate(() => {
      window.heldSourceResolver = window.readerDialog?.finalFocus
    })

    // Switch source while dialog was opened
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.textContent?.includes("Toggle fixture source"),
      )
      btn?.click()
    })
    await expect(page.getByTestId("current-fragment-id")).toHaveText("FRAG-003")

    // Stale resolver from FRAG-002 must refuse on FRAG-003
    expect(await page.evaluate(() => window.heldSourceResolver?.())).toBe(false)

    // Open fresh dialog on FRAG-003 (gallery renderer)
    const zoomTrigger3 = page.getByRole("button", { name: /View gallery|Open gallery/ })
    await zoomTrigger3.click()
    await expect(dialog).toBeVisible()
    const frag3Ticket = await page.evaluate(() => window.readerDialog?.activeTicket())
    expect(frag3Ticket).toBeTruthy()

    // Old FRAG-002 resolver still refuses and does NOT cancel FRAG-003
    expect(await page.evaluate(() => window.heldSourceResolver?.())).toBe(false)
    expect(await page.evaluate(() => window.readerDialog?.activeTicket())).toBe(frag3Ticket)

    // Fresh native close on FRAG-003 restores focus
    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    await expect(zoomTrigger3).toBeFocused()

    // Switch back to FRAG-002
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.textContent?.includes("Toggle fixture source"),
      )
      btn?.click()
    })
    await expect(page.getByTestId("current-fragment-id")).toHaveText("FRAG-002")

    // 2. React Activity hide/show: Open on FRAG-002
    await zoomTrigger2.click()
    await expect(dialog).toBeVisible()

    await page.evaluate(() => {
      window.heldActivityResolver = window.readerDialog?.finalFocus
    })

    // Toggle Activity to hidden
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.textContent?.includes("Toggle fixture Activity"),
      )
      btn?.click()
    })

    // Stale resolver while Activity is hidden must refuse
    expect(await page.evaluate(() => window.heldActivityResolver?.())).toBe(false)

    // Toggle Activity back to visible
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) =>
        b.textContent?.includes("Toggle fixture Activity"),
      )
      btn?.click()
    })

    // Non-revival: Stale resolver still returns false after show
    expect(await page.evaluate(() => window.heldActivityResolver?.())).toBe(false)

    // Close the retired dialog that was open prior to Activity hide
    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()

    // Fresh dialog opening on restored Activity works
    await zoomTrigger2.click()
    await expect(dialog).toBeVisible()

    // Fresh native close restores focus
    await page.keyboard.press("Escape")
    await expect(dialog).toBeHidden()
    await expect(zoomTrigger2).toBeFocused()
  })

  test("window ArrowLeft/ArrowRight record navigation enforces bounds, IME, modifiers, and editable target vetoes", async ({
    page,
  }) => {
    await page.goto("/?example=reader&fragmentId=FRAG-002&scope=inbox")
    await expect(page.getByTestId("reader-detail-page")).toBeVisible()

    // Click inside reader page to ensure container focus
    await page.getByRole("heading", { level: 1 }).click()

    // 1. Arrow navigation works outside editable fields
    await page.keyboard.press("ArrowRight")
    await expect(page.getByText("REV-FRAG-003-01")).toBeVisible()

    await page.keyboard.press("ArrowLeft")
    await expect(page.getByText("REV-FRAG-002-01")).toBeVisible()

    // 2. Modifier keys veto navigation
    for (const mod of ["Shift", "Control", "Alt", "Meta"] as const) {
      await page.keyboard.down(mod)
      await page.keyboard.press("ArrowRight")
      await page.keyboard.up(mod)
      // Must stay on FRAG-002
      await expect(page.getByText("REV-FRAG-002-01")).toBeVisible()
    }

    // 3. IME composition veto (isComposing or keyCode 229)
    await page.evaluate(() => {
      const imeEvent = new KeyboardEvent("keydown", {
        key: "ArrowRight",
        keyCode: 229,
        bubbles: true,
        cancelable: true,
      })
      window.dispatchEvent(imeEvent)
    })
    await expect(page.getByText("REV-FRAG-002-01")).toBeVisible()

    // 4. Editable targets veto navigation
    await page.evaluate(() => {
      const input = document.createElement("input")
      input.id = "test-editable-input"
      document.body.appendChild(input)
      input.focus()
    })
    await page.keyboard.press("ArrowRight")
    await expect(page.getByText("REV-FRAG-002-01")).toBeVisible()
    await page.locator("#test-editable-input").evaluate((el) => el.remove())
  })

  test("PM inert notes, tags, and state controls preserve read-only write boundary", async ({
    page,
  }) => {
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

    // Verify notes textarea is read-only and no save button exists
    const notesTextarea = page.locator("[data-reader-notes] textarea")
    if ((await notesTextarea.count()) > 0) {
      await expect(notesTextarea).toHaveAttribute("readonly", "")
      await expect(page.getByRole("button", { name: /Save note|Add note/i })).toHaveCount(0)
    }

    // Verify no mutation announcements
    await expect(page.getByText(/Saved locally|Note added/i)).toHaveCount(0)

    // Click refresh button in header
    await page.getByRole("button", { name: "Refresh" }).click()

    // Confirm strictly zero mutations occurred
    expect(mutations).toHaveLength(0)
  })
})
