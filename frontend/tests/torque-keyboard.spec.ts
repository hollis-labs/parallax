import { expect, type Locator, type Page, test } from "@playwright/test"

const entry = "/?example=torque&screen=tasks&profile=torque-16w"
const portable = "http://127.0.0.1:18542/iframe.html?id=app-examples-torque--tasks&viewMode=story"
const inspection = (page: Page) =>
  page.getByRole("dialog", { name: "Task and run inspection", exact: true })
const title = (page: Page) =>
  inspection(page).getByRole("heading", { name: "Task and run inspection", exact: true })
const record = (page: Page) => inspection(page).locator('[data-slot="inspection-header"] p')
const rows = (page: Page) => page.locator("tbody tr[data-task-id]")

// Hold the authored callback, rather than a Base UI handler that reads a live ref.
async function holdNavigation(button: Locator) {
  await button.evaluate((node) => {
    const key = Object.keys(node).find((k) => k.startsWith("__reactFiber"))
    if (!key) throw Error("Missing React fiber")
    type Fiber = {
      memoizedProps?: { "aria-keyshortcuts"?: string; onClick?: () => void }
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
      if (fiber.memoizedProps?.["aria-keyshortcuts"] === "ArrowRight")
        callback = fiber.memoizedProps.onClick
    }
    if (!callback) throw Error("Missing authored navigation callback")
    ;(window as any).heldNavigation = callback
  })
}

for (const surface of ["standalone", "portable"]) {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
    { width: 1440, height: 420 },
    { width: 390, height: 420 },
  ]) {
    test(`${surface} native record keys, wrap, context and return ${viewport.width}x${viewport.height}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport)
      await page.goto(surface === "standalone" ? entry : portable)
      const outer = page.url()
      const reviewTrigger = page.getByRole("button", { name: "Review fixtures", exact: true })
      await reviewTrigger.click()
      const review = page.getByRole("dialog", { name: "Torque fixture review", exact: true })
      await expect(review.getByLabel("Torque fixture profile")).toBeFocused()
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press(i < 5 ? "Tab" : "Shift+Tab")
        await expect
          .poll(() => review.evaluate((node) => node.contains(document.activeElement)))
          .toBe(true)
      }
      await page.keyboard.press("Escape")
      await expect(review).toHaveCount(0)
      await expect(reviewTrigger).toBeFocused()
      if (viewport.width < 760) {
        const trigger = page.getByRole("button", { name: "Open app navigation", exact: true })
        await trigger.click()
        const navigation = page.getByRole("dialog", { name: "Torque navigation", exact: true })
        await expect(navigation.getByRole("link").first()).toBeFocused()
        await page.keyboard.press("Escape")
        await expect(navigation).toHaveCount(0)
        await expect(trigger).toBeFocused()
      }
      const searchEntry = page.getByLabel("Example task filter", { exact: true })
      await searchEntry.focus()
      await searchEntry.pressSequentially("typing")
      await page.keyboard.press("ArrowLeft")
      expect(await searchEntry.evaluate((node: HTMLInputElement) => node.selectionStart)).toBe(5)
      await page.keyboard.press("Escape")
      await expect(searchEntry).toHaveValue("")
      await expect(searchEntry).toBeFocused()
      if (viewport.width < 760) await page.getByLabel("Toggle Operations filters").click()
      await page.getByRole("button", { name: "P1", exact: true }).click()
      if (viewport.width < 760) await page.getByLabel("Toggle Operations filters").click()
      await page.locator("thead button").filter({ hasText: "Task" }).click()
      const first = rows(page).first()
      const firstId = (await first.getAttribute("data-task-id"))!
      const lastId = (await rows(page).last().getAttribute("data-task-id"))!
      const actions = first.getByRole("button", { name: `Task actions ${firstId}`, exact: true })
      await actions.focus()
      await page.keyboard.press("Enter")
      await expect(page.getByRole("menu")).toBeVisible()
      await page.keyboard.press("Home")
      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("ArrowDown")
      await page.keyboard.press("Enter")
      const preview = page.getByRole("dialog", { name: "Local action preview", exact: true })
      await expect(
        preview.getByRole("heading", { name: "Local action preview", exact: true }),
      ).toBeFocused()
      await page.keyboard.press("ArrowRight")
      await expect(preview).toBeVisible()
      await expect(inspection(page)).toHaveCount(0)
      await page.keyboard.press("Escape")
      await expect(preview).toHaveCount(0)
      await expect(actions).toBeFocused()
      await first.locator("input").check()
      await first.focus()
      const table = page.locator(".torque-ops-table-region")
      const top = await table.evaluate((node) => node.scrollTop)
      await page.keyboard.press("Space")
      await expect(title(page)).toBeFocused()
      await expect(inspection(page)).toContainText("wraps · ← previous / → next")
      await page.keyboard.press("ArrowLeft")
      await expect(record(page)).toContainText(lastId)
      await expect(title(page)).toBeFocused()
      await page.keyboard.press("ArrowRight")
      await expect(record(page)).toContainText(firstId)
      const next = inspection(page).getByRole("button", { name: "Next task", exact: true })
      await expect(next).toHaveAttribute("aria-keyshortcuts", "ArrowRight")
      await next.focus()
      await page.keyboard.press("ArrowRight")
      await expect(record(page)).toContainText(firstId)
      await page.keyboard.press("Enter")
      await expect(record(page)).not.toContainText(firstId)
      await expect(next).toBeFocused()
      for (let i = 0; i < 14; i++) {
        await page.keyboard.press(i < 7 ? "Tab" : "Shift+Tab")
        await expect
          .poll(() => inspection(page).evaluate((node) => node.contains(document.activeElement)))
          .toBe(true)
      }
      await page.keyboard.press("Escape")
      await expect(inspection(page)).toHaveCount(0)
      await expect(first).toBeFocused()
      await expect(first.locator("input")).toBeChecked()
      expect(await table.evaluate((node) => node.scrollTop)).toBe(top)
      await expect(page.locator('th[aria-sort="ascending"]')).toContainText("Task")
      await first.locator(".torque-ops-status").click()
      await expect(title(page)).toBeFocused()
      await inspection(page)
        .getByRole("button", { name: "Close record inspection", exact: true })
        .click()
      await expect(inspection(page)).toHaveCount(0)
      await expect(first).toBeFocused()
      const search = page.getByLabel("Example task filter", { exact: true })
      await search.fill(firstId)
      await expect(rows(page)).toHaveCount(1)
      await rows(page).first().locator("a").click()
      await expect(title(page)).toBeFocused()
      await expect(next).toBeDisabled()
      await page.keyboard.press("ArrowRight")
      await expect(record(page)).toContainText(firstId)
      await page.keyboard.press("Escape")
      await expect(inspection(page)).toHaveCount(0)
      await expect(rows(page).first().locator("a")).toBeFocused()
      await rows(page).first().locator("a").click()
      await expect(title(page)).toBeFocused()
      await rows(page)
        .first()
        .locator("a")
        .evaluate((node) => node.remove())
      await page.keyboard.press("Escape")
      await expect(inspection(page)).toHaveCount(0)
      await expect(search).toBeFocused()
      if (surface === "portable") expect(page.url()).toBe(outer)
    })
  }
}

test("inspection respects native editing/control keys and diagnostic composition/consumption/child ownership", async ({
  page,
}) => {
  await page.goto(`http://127.0.0.1:18545${entry}`)
  await rows(page).first().locator("a").click()
  await expect(title(page)).toBeFocused()
  const before = await record(page).textContent()
  for (const key of [
    "Control+ArrowRight",
    "Meta+ArrowRight",
    "Alt+ArrowRight",
    "Shift+ArrowRight",
  ]) {
    await page.keyboard.press(key)
    await expect(record(page)).toHaveText(before!)
  }
  // Test-only descendants exercise the controller's contract without adding
  // fictional editing dialogs to the read-only product composition.
  await inspection(page).evaluate((root) => {
    const probe = document.createElement("div")
    probe.id = "keyboard-probe"
    probe.innerHTML =
      '<input aria-label="Probe text" value="typing"><textarea aria-label="Probe textarea">typing</textarea><select aria-label="Probe select"><option>One</option><option>Two</option></select><input aria-label="Probe range" type="range" value="50"><div contenteditable="plaintext-only" aria-label="Probe editable">typing</div><div role="tablist"><button role="tab" id="probe-tab">Probe tab</button></div>'
    root.querySelector(".torque-inspection-body")!.prepend(probe)
  })
  const input = page.getByLabel("Probe text", { exact: true })
  await input.focus()
  await input.evaluate((node: HTMLInputElement) => node.setSelectionRange(6, 6))
  await page.keyboard.press("ArrowLeft")
  expect(await input.evaluate((node: HTMLInputElement) => node.selectionStart)).toBe(5)
  await input.pressSequentially("X")
  await expect(input).toHaveValue("typinXg")
  for (const label of ["Probe textarea", "Probe select", "Probe range", "Probe editable"]) {
    await page.getByLabel(label, { exact: true }).focus()
    await page.keyboard.press("ArrowRight")
    await expect(record(page)).toHaveText(before!)
  }
  await expect(page.getByLabel("Probe range")).toHaveValue("51")
  await page.getByRole("tab", { name: "Probe tab" }).focus()
  await page.keyboard.press("ArrowRight")
  await expect(record(page)).toHaveText(before!)
  await title(page).focus()
  const prevented = await title(page).evaluate((node) => {
    const composition = new KeyboardEvent("keydown", {
      key: "ArrowRight",
      isComposing: true,
      bubbles: true,
      cancelable: true,
    })
    node.dispatchEvent(composition)
    const legacy = new KeyboardEvent("keydown", {
      key: "ArrowRight",
      keyCode: 229,
      bubbles: true,
      cancelable: true,
    })
    node.dispatchEvent(legacy)
    return [composition.defaultPrevented, legacy.defaultPrevented]
  })
  expect(prevented).toEqual([false, false])
  await expect(record(page)).toHaveText(before!)
  await title(page).dispatchEvent("compositionstart")
  await page.keyboard.press("ArrowRight")
  await expect(record(page)).toHaveText(before!)
  await title(page).dispatchEvent("compositionend")
  await title(page).evaluate((node) => {
    node.addEventListener("keydown", (event) => event.preventDefault(), { once: true })
  })
  await page.keyboard.press("ArrowRight")
  await expect(record(page)).toHaveText(before!)
  await inspection(page).evaluate((root) => {
    const child = document.createElement("div")
    child.id = "probe-child"
    child.setAttribute("role", "dialog")
    child.setAttribute("aria-label", "Probe child overlay")
    child.tabIndex = 0
    child.textContent = "Child owns keys"
    child.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.stopPropagation()
        child.remove()
        root.querySelector<HTMLElement>("h2")!.focus()
      }
    })
    root.append(child)
    child.focus()
  })
  await page.keyboard.press("ArrowRight")
  await expect(record(page)).toHaveText(before!)
  await title(page).focus()
  await page.keyboard.press("ArrowRight")
  await expect(record(page)).toHaveText(before!)
  await page.getByRole("dialog", { name: "Probe child overlay" }).focus()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog", { name: "Probe child overlay" })).toHaveCount(0)
  await expect(inspection(page)).toBeVisible()
  await page.locator("#keyboard-probe").evaluate((node) => node.remove())
  await page.keyboard.press("ArrowRight")
  await expect(record(page)).not.toHaveText(before!)
})

test("held navigation retires after order, selection and source changes; return excludes connected stale opener", async ({
  page,
}) => {
  // Vite preserves authored React handlers for explicit retained-callback proof.
  await page.goto(`http://127.0.0.1:18545${entry}`)
  const first = rows(page).first()
  const originalId = (await first.getAttribute("data-task-id"))!
  await first.locator("a").click()
  await expect(title(page)).toBeFocused()
  await holdNavigation(inspection(page).getByRole("button", { name: "Next task", exact: true }))
  // Positive control: this exact retained authored callback is live before retirement.
  await page.evaluate(() => (window as any).heldNavigation())
  await expect(record(page)).not.toContainText(originalId)
  const positive = await record(page).textContent()
  await page.evaluate(() => (window as any).heldNavigation())
  await expect(record(page)).toHaveText(positive!)
  await holdNavigation(inspection(page).getByRole("button", { name: "Next task", exact: true }))
  await page.keyboard.press("ArrowRight")
  await expect(record(page)).not.toContainText(originalId)
  const fresh = await record(page).textContent()
  await page.evaluate(() => (window as any).heldNavigation())
  await expect(record(page)).toHaveText(fresh!)
  await holdNavigation(inspection(page).getByRole("button", { name: "Next task", exact: true }))
  await page
    .locator("thead button")
    .filter({ hasText: "Task" })
    .evaluate((node) => {
      const key = Object.keys(node).find((k) => k.startsWith("__reactProps"))
      if (!key) throw Error("Missing current sort callback")
      ;(node as any)[key].onClick()
    })
  await expect(page.locator('th[aria-sort="ascending"]')).toContainText("Task")
  await page.evaluate(() => (window as any).heldNavigation())
  await expect(record(page)).toHaveText(fresh!)
  await page.keyboard.press("Escape")
  await expect(inspection(page)).toHaveCount(0)
  await page.locator("thead button").filter({ hasText: "Task" }).click()
  await rows(page).first().locator("a").click()
  await expect(title(page)).toBeFocused()
  const sorted = await record(page).textContent()
  await page.evaluate(() => (window as any).heldNavigation())
  await expect(record(page)).toHaveText(sorted!)
  // Invoke the current controlled context adapter while a modal is open, as
  // an external source update would; the connected board is genuinely rerendered.
  await title(page).evaluate(async (node) => {
    const key = Object.keys(node).find((k) => k.startsWith("__reactFiber"))
    if (!key) throw Error("Missing source controller")
    let fiber = (node as any)[key]
    while (fiber && fiber.type?.name !== "TorqueExample") fiber = fiber.return
    if (!fiber) throw Error("Missing TorqueExample controller")
    const modulePath = "/src/examples/torque/reference.ts"
    const { torqueSource } = await import(modulePath)
    fiber.memoizedProps.onChange(
      { profile: "legacy", cutoff: torqueSource("populated", "legacy").clock, selected: null },
      true,
    )
  })
  await expect(record(page)).toHaveText("No admitted selection")
  await page.evaluate(() => (window as any).heldNavigation())
  await expect(record(page)).toHaveText("No admitted selection")
  // A cold/external route has no marked board entry to pop back to.
  await page.evaluate(() => history.replaceState({}, "", location.href))
  await page.keyboard.press("Escape")
  await expect(inspection(page)).toHaveCount(0)
  await expect(page.getByLabel("Example task filter", { exact: true })).toBeFocused()
  await expect(page.locator(`tr[data-task-id="${originalId}"]`)).toBeAttached()
})
