import { expect, type Locator, type Page, test } from "@playwright/test"

const entry = "/?example=torque&screen=tasks&profile=torque-16w"
const messagingEntry = "/?example=messaging&theme=p4-white&mode=light&conversation=CONVERSATION-001"
const inspection = (page: Page) =>
  page.getByRole("dialog", { name: "Task and run inspection", exact: true })
const rows = (page: Page) => page.locator("tbody tr[data-task-id]")

// Retain an authored handler to verify committed frame fencing.
async function holdTaskInspectionClose(button: Locator) {
  await button.evaluate((node) => {
    const key = Object.keys(node).find((k) => k.startsWith("__reactFiber"))
    if (!key) throw Error("Missing React fiber")
    type Fiber = {
      memoizedProps?: { onClick?: () => void }
      return?: Fiber
      child?: Fiber
      sibling?: Fiber
      stateNode?: unknown
    }
    let attached = (node as unknown as Record<string, Fiber>)[key]
    while (attached.return) attached = attached.return
    const current = (attached.stateNode as { current: Fiber }).current
    function pathToNode(fiber: Fiber, parents: Fiber[]): Fiber[] | null {
      const path = [...parents, fiber]
      if (fiber.stateNode === node) return path
      for (let child = fiber.child; child; child = child.sibling) {
        const found = pathToNode(child, path)
        if (found) return found
      }
      return null
    }
    const path = pathToNode(current, [])
    if (!path) throw Error("Node absent from committed React tree")
    let callback: (() => void) | undefined
    for (const fiber of path.reverse()) {
      if (typeof fiber.memoizedProps?.onClick === "function") {
        callback = fiber.memoizedProps.onClick
        break
      }
    }
    if (!callback) throw Error("Missing authored callback")
    ;(window as unknown as { heldCloseAction: () => void }).heldCloseAction = callback
  })
}

test.describe("Nil Shortcut Registry & Layered Escape Ownership (CW-20261010-0090)", () => {
  test("Torque: / and Mod+K and Shift-Shift shortcuts focus search input with guards", async ({
    page,
  }) => {
    await page.goto(entry)
    const searchInput = page.getByLabel("Example task filter", { exact: true })
    await expect(searchInput).toBeVisible()

    // 1. '/' shortcut focuses search input when outside editable target
    await page.keyboard.press("/")
    await expect(searchInput).toBeFocused()

    // Empty search: Escape retains focus on the search input
    await page.keyboard.press("Escape")
    await expect(searchInput).toBeFocused()

    // Blur explicitly to verify next shortcut
    await searchInput.blur()
    await expect(searchInput).not.toBeFocused()

    // 2. Mod+K (Cmd+K / Ctrl+K) focuses search input
    const isMac = await page.evaluate(() =>
      /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent),
    )
    await page.keyboard.press(isMac ? "Meta+k" : "Control+k")
    await expect(searchInput).toBeFocused()

    // Blur explicitly to verify next shortcut
    await searchInput.blur()
    await expect(searchInput).not.toBeFocused()

    // 3. Consecutive Shift-Shift taps within 300ms threshold focus search input
    await page.keyboard.press("Shift")
    await page.keyboard.press("Shift")
    await expect(searchInput).toBeFocused()

    // Blur
    await searchInput.blur()
    await expect(searchInput).not.toBeFocused()

    // 4. Shift taps separated by >300ms do NOT trigger search focus
    await page.keyboard.press("Shift")
    await page.waitForTimeout(400) // exceed 300ms window
    await page.keyboard.press("Shift")
    await expect(searchInput).not.toBeFocused()

    // 5. Shift-Shift while inside an editable target does not hijack typing
    await searchInput.focus()
    await searchInput.pressSequentially("hello")
    await page.keyboard.press("Shift")
    await page.keyboard.press("Shift")
    await expect(searchInput).toHaveValue("hello")
  })

  test("Torque: Layered Escape Stack enforces input-clearing before closing and preserves background query", async ({
    page,
  }) => {
    await page.goto(entry)
    const searchInput = page.getByLabel("Example task filter", { exact: true })

    // Set background query
    await searchInput.focus()
    await searchInput.pressSequentially("TASK")
    await expect(searchInput).toHaveValue("TASK")

    // Open task inspection modal via menu
    const first = rows(page).first()
    const firstId = (await first.getAttribute("data-task-id"))!
    const trigger = first.getByRole("button", { name: `Task actions ${firstId}`, exact: true })
    await trigger.click()
    await page.getByRole("menuitem", { name: new RegExp(`Inspect task ${firstId}`) }).click()

    const modal = inspection(page)
    await expect(modal).toBeVisible()

    // Verify background query is retained while inspection modal is open
    await expect(searchInput).toHaveValue("TASK")

    // Pressing Escape closes the innermost overlay (inspection modal)
    await page.keyboard.press("Escape")
    await expect(modal).toHaveCount(0)

    // Background query MUST be preserved after closing overlay
    await expect(searchInput).toHaveValue("TASK")

    // Focus restored to admitted opener trigger
    await expect(trigger).toBeFocused()

    // Escape while focused on search input clears the input first, retaining focus
    await searchInput.focus()
    await page.keyboard.press("Escape")
    await expect(searchInput).toHaveValue("")
    await expect(searchInput).toBeFocused()
  })

  test("Torque: a native child search clears before the shared stack closes its popup", async ({
    page,
  }) => {
    await page.goto(entry)
    const first = rows(page).first()
    await first.locator("a").click()
    const modal = inspection(page)
    await expect(modal).toBeVisible()
    // Fixture-independent child control: a real native Escape must settle at
    // the target before the single window bubble coordinator receives it.
    await modal.evaluate((root) => {
      const input = document.createElement("input")
      input.type = "search"
      input.setAttribute("aria-label", "Native child search")
      input.value = "local filter"
      input.addEventListener("keydown", (event) => {
        if (event.key !== "Escape" || input.value === "") return
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
        input.value = ""
      })
      root.append(input)
      input.focus()
    })
    const child = page.getByLabel("Native child search", { exact: true })
    await page.keyboard.press("Escape")
    await expect(child).toHaveValue("")
    await expect(child).toBeFocused()
    await expect(modal).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(modal).toHaveCount(0)
    await expect(first.locator("a")).toBeFocused()
  })

  test("Messaging: Layered Escape Stack handles search-clear and inspector dismissal independently", async ({
    page,
  }) => {
    await page.goto(messagingEntry)

    // Search query in conversations (searching 'Gateway' preserves CONVERSATION-001 match)
    const searchInput = page.getByLabel("Search messaging conversations", { exact: true })
    await searchInput.focus()
    await searchInput.pressSequentially("Gateway")
    await expect(searchInput).toHaveValue("Gateway")

    // Escape clears search query first
    await page.keyboard.press("Escape")
    await expect(searchInput).toHaveValue("")

    // Select CONVERSATION-001
    const convBtn = page.getByRole("button", { name: /CONVERSATION-001/ })
    await convBtn.click()

    // Enter draft reply to enable inspect candidate button
    const chatInput = page.getByRole("combobox", { name: "Local messaging draft", exact: true })
    await expect(chatInput).toBeVisible()
    await chatInput.fill("sample draft response")
    const inspectBtn = page.getByRole("button", { name: "Inspect draft candidate", exact: true })
    await inspectBtn.click()

    const inspectDialog = page.getByRole("dialog", {
      name: "Message draft candidate",
      exact: true,
    })
    await expect(inspectDialog).toBeVisible()

    // Retain authored action from first inspector for frame fence proof
    await holdTaskInspectionClose(
      inspectDialog.getByRole("button", { name: "Close inspection", exact: true }),
    )

    // Positive control: live close handler invocation succeeds
    await page.evaluate(() => {
      ;(window as unknown as { heldCloseAction: () => void }).heldCloseAction()
    })
    await expect(inspectDialog).toHaveCount(0)

    // Reopen inspection dialog (second / replacement inspector)
    await chatInput.fill("sample draft response")
    await inspectBtn.click()
    await expect(inspectDialog).toBeVisible()

    // Retired negative control: invoking held action from first inspector while replacement
    // inspector is OPEN cannot close or affect the active replacement inspector
    await page.evaluate(() => {
      ;(window as unknown as { heldCloseAction: () => void }).heldCloseAction()
    })
    await expect(inspectDialog).toBeVisible()

    // Current positive control: Escape closes active replacement inspector and restores focus to trigger
    await page.keyboard.press("Escape")
    await expect(inspectDialog).toHaveCount(0)
    await expect(inspectBtn).toBeFocused()
  })
})
