import { expect, type Locator, type Page, test } from "@playwright/test"

const entry = "/?example=chat&navigation=flux"
const tree = (page: Page) => page.getByRole("tree", { name: "Pinned and recent sessions" })
const row = (page: Page, id: string) => tree(page).locator(`[data-row="${id}"]`)
const layoutMenu = (page: Page) => page.getByRole("dialog", { name: "Layout presets", exact: true })
async function hold(locator: Locator, key: string, prop = "onClick") {
  await locator.evaluate(
    (node, { name, prop }) => {
      // Find the authored callback in the current committed React tree, not a stale alternate.
      type Fiber = {
        memoizedProps?: Record<string, unknown>
        return?: Fiber
        child?: Fiber
        sibling?: Fiber
        stateNode?: unknown
      }
      const property = Object.keys(node).find((value) => value.startsWith("__reactFiber"))
      if (!property) throw Error("React fiber missing")
      let attached = (node as unknown as Record<string, Fiber>)[property]
      while (attached.return) attached = attached.return
      const current = (attached.stateNode as { current: Fiber }).current
      function find(fiber: Fiber, parents: Fiber[]): Fiber[] | null {
        const path = [...parents, fiber]
        if (fiber.stateNode === node) return path
        for (let child = fiber.child; child; child = child.sibling) {
          const result = find(child, path)
          if (result) return result
        }
        return null
      }
      const callback = find(current, [])
        ?.reverse()
        .find((fiber) => typeof fiber.memoizedProps?.[prop] === "function")?.memoizedProps?.[prop]
      if (!callback) throw Error("Authored callback missing")
      ;(window as unknown as Record<string, unknown>)[name] = callback
    },
    { name: key, prop },
  )
}
async function invoke(page: Page, key: string) {
  await page.evaluate((name) => (window as unknown as Record<string, () => void>)[name](), key)
}

test("native roving tree, child collapse, explicit companion selection, authored ages and archive reveal", async ({
  page,
}, info) => {
  await page.goto(entry)
  const gateway = row(page, "nav-gateway")
  await expect(gateway).toHaveAttribute("aria-level", "1")
  await expect(row(page, "nav-durable")).toHaveAttribute("aria-level", "3")
  await expect(row(page, "nav-cli")).toContainText("5m")
  await expect(row(page, "nav-durable")).toContainText("2h")
  await expect(row(page, "nav-pending")).toContainText("3d")
  await expect(row(page, "nav-failed")).toContainText("Sep 25")
  await expect(gateway).toContainText("now")
  await gateway.focus()
  await gateway.press("ArrowDown")
  await expect(row(page, "nav-cli")).toBeFocused()
  await expect(gateway).toHaveAttribute("aria-selected", "true")
  await page.keyboard.press("ArrowLeft")
  await expect(row(page, "nav-cli")).toHaveAttribute("aria-expanded", "false")
  await expect(row(page, "nav-durable")).toHaveCount(0)
  await page.keyboard.press("ArrowRight")
  await expect(row(page, "nav-durable")).toHaveCount(1)
  await page.keyboard.press("ArrowRight")
  await expect(row(page, "nav-durable")).toBeFocused()
  await page.keyboard.press("Home")
  await expect(gateway).toBeFocused()
  await gateway.press("End")
  await expect(row(page, "nav-stopped")).toBeFocused()
  await page.getByLabel("Show archived").check()
  await expect(row(page, "nav-archived")).toHaveAttribute("data-activity", "archived")
  await row(page, "nav-cli").click()
  await expect(page).toHaveURL(/session=CHAT-002.*navigation=flux/)
  await expect(row(page, "nav-cli")).toHaveAttribute("aria-selected", "true")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Build deterministic fixture contracts",
  )
  await page.screenshot({ path: info.outputPath("tree-desktop.png") })
  await page.reload()
  await expect(row(page, "nav-cli")).toHaveAttribute("aria-selected", "true")
  await row(page, "nav-failed").click()
  await expect(row(page, "nav-failed")).toHaveAttribute("aria-selected", "true")
  await page.goBack()
  await expect(row(page, "nav-cli")).toHaveAttribute("aria-selected", "true")
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Build deterministic fixture contracts",
  )
})

test("search and project scope preserve query and draft custody, filtered parents are truthful", async ({
  page,
}) => {
  await page.goto(entry)
  const draft = page.getByRole("combobox", { name: "Local chat draft", exact: true })
  await draft.fill("retained across navigation search")
  const search = page.getByRole("textbox", { name: "Search chat sessions", exact: true })
  await search.fill("halted")
  await expect(search).toBeFocused()
  await expect(draft).toHaveValue("retained across navigation search")
  await expect(row(page, "nav-halted")).toContainText("Parent unavailable")
  await expect(tree(page).getByRole("treeitem")).toHaveCount(1)
  await search.fill("no such authored row")
  await expect(page.getByText("No matching chats", { exact: true })).toBeVisible()
  await search.fill("")
  await page.getByRole("button", { name: "Project scope" }).click()
  await page.getByPlaceholder("Search projects…").fill("Fixture")
  await page.getByRole("option", { name: "Fixture lab" }).click()
  await expect(page.getByRole("button", { name: "Project scope" })).toContainText("Fixture lab")
  await expect(row(page, "nav-gateway")).toHaveCount(0)
  await expect(row(page, "nav-halted")).toBeVisible()
  await expect(search).toHaveValue("")
  await expect(draft).toHaveValue("") // scope replacement retires the conversation editor
})

test("hover rename, context menu and delete alert inspect intents without mutating or making requests", async ({
  page,
}, info) => {
  const forbidden: string[] = []
  page.on("request", (request) => {
    if (
      !["GET", "HEAD"].includes(request.method()) ||
      /\/api\/|https?:\/\/(?!127\.0\.0\.1)/.test(request.url())
    )
      forbidden.push(request.url())
  })
  await page.goto(entry)
  const gateway = row(page, "nav-gateway")
  await gateway.hover()
  await gateway.getByRole("button", { name: /^Rename/ }).click()
  const rename = page.getByRole("dialog", { name: "Rename · local specimen", exact: true })
  const title = rename.getByRole("textbox", { name: "Candidate title" })
  await expect(title).toBeFocused()
  await title.fill("Local candidate rename")
  await rename.getByRole("button", { name: "Inspect intent", exact: true }).click()
  await expect(rename).toContainText("Inspected Rename: Local candidate rename")
  await page.keyboard.press("Escape")
  await expect(gateway).toContainText("Review gateway permission boundaries")
  await gateway.click({ button: "right" })
  const menu = page.getByRole("menu")
  await expect(menu.getByRole("menuitem", { name: "Delete specimen", exact: true })).toBeVisible()
  await menu.getByRole("menuitem", { name: "Delete specimen", exact: true }).click()
  const alert = page.getByRole("alertdialog", { name: "Delete chat specimen?", exact: true })
  await expect(alert).toContainText("no chat or messages are removed")
  await expect(alert.getByRole("button", { name: "Cancel", exact: true })).toBeFocused()
  await page.screenshot({ path: info.outputPath("delete-alert.png") })
  await page.keyboard.press("Escape")
  await gateway.focus()
  await gateway.press("Shift+F10")
  await expect(menu).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(gateway).toBeFocused()
  await gateway.click({ button: "right" })
  await menu.getByRole("menuitem", { name: "Delete specimen", exact: true }).click()
  await alert.getByRole("button", { name: "Inspect delete intent", exact: true }).click()
  await expect(
    page.getByRole("dialog", { name: "Delete intent inspected · local specimen", exact: true }),
  ).toContainText("Delete intent inspected; supplied session unchanged")
  await page.keyboard.press("Escape")
  await expect(gateway).toBeVisible()
  expect(forbidden).toEqual([])
})

test("preset radio keyboard switching persists only validated local presentation preferences", async ({
  page,
}, info) => {
  await page.goto(entry)
  const draft = page.getByRole("combobox", { name: "Local chat draft", exact: true })
  await draft.fill("keep this draft across layouts")
  await page.getByRole("button", { name: "Layout presets", exact: true }).click()
  const menu = layoutMenu(page)
  await expect(menu.getByRole("radio", { name: "default", exact: true })).toBeFocused()
  await page.keyboard.press("ArrowRight")
  await expect(menu.getByRole("radio", { name: "workspace", exact: true })).toBeChecked()
  await expect(page.locator(".chat-example")).toHaveClass(/flux-layout-workspace/)
  await page.screenshot({ path: info.outputPath("layout-workspace.png") })
  await page.keyboard.press("Escape")
  await expect(page.getByRole("button", { name: "Layout presets", exact: true })).toBeFocused()
  await expect(draft).toHaveValue("keep this draft across layouts")
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("parallax:flux-navigation:layout:v1") ?? "null"),
    ),
  ).toEqual({ version: 1, preset: "workspace" })
  await page.reload()
  await expect(page.locator(".chat-example")).toHaveClass(/flux-layout-workspace/)
  await page.getByRole("button", { name: "Layout presets", exact: true }).click()
  await menu.getByRole("radio", { name: "focus", exact: true }).check()
  await page.keyboard.press("Escape")
  await expect(page.locator(".chat-example-sidebar")).toBeHidden()
  await expect(page.locator(".chat-evidence")).toBeHidden()
  await expect(page.locator(".flux-header-meta")).toHaveCount(0)
  await page.getByRole("button", { name: "Layout presets", exact: true }).click()
  await menu.getByRole("radio", { name: "reading", exact: true }).check()
  await page.keyboard.press("Escape")
  await expect(page.locator(".chat-example-sidebar")).toBeHidden()
  await expect(page.locator(".flux-header-meta")).toBeVisible()
})

test("malformed, unknown-version and denied storage degrade to usable presets", async ({
  page,
}) => {
  for (const raw of [
    "{broken",
    '{"version":1,"preset":"future"}',
    '{"version":2,"preset":"focus"}',
  ]) {
    await page.addInitScript(
      (value) => localStorage.setItem("parallax:flux-navigation:layout:v1", value),
      raw,
    )
    await page.goto(entry)
    await expect(page.locator(".chat-example")).toHaveClass(/flux-layout-default/)
  }
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("denied", "SecurityError")
      },
    })
  })
  await page.goto(entry)
  await page.getByRole("button", { name: "Layout presets", exact: true }).click()
  await layoutMenu(page).getByRole("radio", { name: "reading", exact: true }).check()
  await page.keyboard.press("Escape")
  await expect(page.locator(".chat-example")).toHaveClass(/flux-layout-reading/)
})

test("guarded shortcut positive control and editable, IME, exact modifier and overlay negative controls", async ({
  page,
}) => {
  await page.goto(entry)
  const trigger = page.getByRole("button", { name: "Layout presets", exact: true })
  await trigger.focus()
  await page.keyboard.press("Control+\\")
  await expect(layoutMenu(page)).toBeVisible()
  await page.keyboard.press("Escape")
  const draft = page.getByRole("combobox", { name: "Local chat draft", exact: true })
  await draft.fill("literal input custody")
  await draft.press("Control+\\")
  await expect(layoutMenu(page)).toHaveCount(0)
  await expect(draft).toBeFocused()
  await trigger.focus()
  await trigger.press("Control+Shift+\\")
  await expect(layoutMenu(page)).toHaveCount(0)
  await trigger.evaluate((node) =>
    node.dispatchEvent(
      new KeyboardEvent("keydown", { key: "\\", ctrlKey: true, isComposing: true, bubbles: true }),
    ),
  )
  await trigger.evaluate((node) =>
    node.dispatchEvent(
      new KeyboardEvent("keydown", { key: "\\", ctrlKey: true, keyCode: 229, bubbles: true }),
    ),
  )
  await expect(layoutMenu(page)).toHaveCount(0)
  await page.getByRole("button", { name: "New chat", exact: false }).click()
  const specimen = page.getByRole("dialog", { name: "New chat · local specimen", exact: true })
  await expect(specimen).toBeVisible()
  await page.keyboard.press("Control+\\")
  await expect(layoutMenu(page)).toHaveCount(0)
  await page.keyboard.press("Escape")
  await trigger.focus()
  await page.keyboard.press("Control+\\")
  await expect(layoutMenu(page)).toBeVisible()
})

test("retained authored callbacks retire across source, access, layers, effect revision and removed root", async ({
  page,
}) => {
  await page.goto(entry)
  const newChat = page.getByRole("button", { name: /New chat/ })
  await hold(newChat, "heldSource")
  await page.getByRole("button", { name: "Replace fixture source" }).click()
  await invoke(page, "heldSource")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await hold(newChat, "heldAccess")
  await page.getByLabel("Navigation fixture").selectOption("denied")
  await invoke(page, "heldAccess")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.getByLabel("Navigation fixture").selectOption("ready")
  await hold(newChat, "heldLayer")
  await page.getByRole("button", { name: "Layout presets", exact: true }).click()
  await invoke(page, "heldLayer")
  await expect(page.getByRole("dialog")).toHaveCount(1)
  await page.keyboard.press("Escape")
  await newChat.click()
  const specimen = page.getByRole("dialog", { name: "New chat · local specimen", exact: true })
  await hold(specimen.getByRole("button", { name: "Inspect intent", exact: true }), "heldEffect")
  await specimen.getByRole("button", { name: "Inspect intent", exact: true }).click()
  await expect(specimen).toContainText("Inspected New chat")
  await page.keyboard.press("Escape")
  await newChat.click()
  await invoke(page, "heldEffect")
  await expect(specimen).toContainText("No effect requested")
  await page.keyboard.press("Escape")
  await hold(newChat, "heldRoot")
  await page.locator(".flux-navigation-host").evaluate((node) => node.remove())
  await invoke(page, "heldRoot")
  await expect(page.getByRole("dialog")).toHaveCount(0)
})

test("resource specimens and inert header controls remain truthful", async ({ page }) => {
  await page.goto(entry)
  for (const fixture of ["empty", "loading", "unavailable", "denied", "locked"]) {
    await page.getByLabel("Navigation fixture").selectOption(fixture)
    if (fixture === "empty")
      await expect(page.getByText("No chats yet", { exact: true })).toBeVisible()
    else if (fixture === "locked")
      await expect(page.getByRole("button", { name: /New chat/ })).toBeDisabled()
    else {
      await expect(tree(page)).toHaveCount(0)
      await expect(page.locator(".flux-tree-scroll")).toContainText("count Unknown")
    }
  }
  await page.getByLabel("Navigation fixture").selectOption("ready")
  for (const action of ["Stop", "Resume", "Reboot", "Plugin action"]) {
    await page.getByRole("button", { name: "More session options" }).click()
    await page.getByRole("menuitem", { name: `${action} specimen`, exact: true }).click()
    const specimen = page.getByRole("dialog", { name: `${action} · local specimen`, exact: true })
    await expect(specimen).toContainText("Supplied records stay unchanged")
    await specimen.getByRole("button", { name: "Inspect intent", exact: true }).click()
    await expect(specimen).toContainText(`Inspected ${action}`)
    await page.keyboard.press("Escape")
  }
})

test("desktop and narrow short viewports keep one usable surface, scroll tree, local focus and all real themes", async ({
  page,
}, info) => {
  await page.goto(entry)
  for (const size of [
    { width: 1280, height: 900 },
    { width: 1280, height: 420 },
    { width: 390, height: 844 },
    { width: 390, height: 420 },
  ]) {
    await page.setViewportSize(size)
    for (const mode of ["dark", "light"]) {
      await page.getByLabel("Flux navigation mode").selectOption(mode)
      await expect(
        page.getByRole("combobox", { name: "Local chat draft", exact: true }),
      ).toBeVisible()
      const composer = await page.locator(".chat-composer").boundingBox()
      if (!composer) throw Error("Composer unavailable")
      expect(composer.y + composer.height).toBeLessThanOrEqual(size.height)
      await expect(page.locator("html")).toHaveAttribute("data-mode", mode)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
      await page.screenshot({
        path: info.outputPath(`chrome-${size.width}x${size.height}-${mode}.png`),
        animations: "disabled",
      })
    }
    if (size.width === 390) {
      await expect(page.locator(".chat-example-sidebar")).toBeHidden()
      await page.getByRole("button", { name: "Sessions", exact: true }).click()
      const navigation = page.getByRole("dialog", { name: "Chat session navigation", exact: true })
      await expect(navigation).toBeVisible()
      const scroll = navigation.locator(".flux-tree-scroll")
      expect(await scroll.evaluate((node) => node.clientHeight)).toBeGreaterThan(32)
      await navigation.getByLabel("Show archived").check()
      await navigation.locator('[data-row="nav-archived"]').focus()
      await expect(navigation.locator('[data-row="nav-archived"]')).toBeInViewport()
      await page.screenshot({
        path: info.outputPath(`navigation-${size.width}x${size.height}.png`),
        animations: "disabled",
      })
      const search = navigation.getByRole("textbox", { name: "Search chat sessions", exact: true })
      await search.fill("telemetry")
      await expect(navigation.getByRole("treeitem")).toHaveCount(1)
      await page.keyboard.press("Escape")
      await expect(navigation).toBeHidden()
      await expect(page.getByRole("button", { name: "Sessions", exact: true })).toBeFocused()
      await page.getByRole("button", { name: "Sessions", exact: true }).click()
      await search.fill("")
      await page.keyboard.press("Escape")
      await expect(navigation).toBeHidden()
    }
  }
  await page.setViewportSize({ width: 1280, height: 900 })
  const theme = page.getByLabel("Flux navigation theme")
  for (const value of await theme
    .locator("option")
    .evaluateAll((nodes) => nodes.map((node) => (node as HTMLOptionElement).value))) {
    await theme.selectOption(value)
    await expect(page.locator("html")).toHaveAttribute("data-theme", value)
    await expect(row(page, "nav-gateway")).toBeVisible()
    const colors = await row(page, "nav-gateway").evaluate((node) => ({
      fg: getComputedStyle(node).color,
      bg: getComputedStyle(node).backgroundColor,
    }))
    expect(colors.fg).not.toEqual(colors.bg)
  }
})

test("once-working action and focus callbacks never revive after Activity replay and respect outside focus", async ({
  page,
}) => {
  await page.goto(`${entry}&lifecycle=replay`)
  const searchButton = page.getByRole("button", { name: "Search chats", exact: true })
  const search = page.getByRole("textbox", { name: "Search chat sessions", exact: true })
  await hold(searchButton, "onceWorkingAction")
  await invoke(page, "onceWorkingAction")
  await expect(search).toBeFocused()
  const layout = page.getByRole("button", { name: "Layout presets", exact: true })
  await layout.click()
  await hold(layoutMenu(page), "onceWorkingFocus", "finalFocus")
  await page.keyboard.press("Escape")
  await expect(layoutMenu(page)).toBeHidden()
  const blur = () => page.evaluate(() => (document.activeElement as HTMLElement)?.blur())
  const focus = (key: string) =>
    page.evaluate((name) => {
      const result = (window as unknown as Record<string, () => HTMLElement | false>)[name]()
      if (result) result.focus()
    }, key)
  await blur()
  await focus("onceWorkingFocus")
  await expect(layout).toBeFocused()
  // Capture another action in the current unchanged frame and prove it before cleanup.
  await hold(searchButton, "replayAction")
  await invoke(page, "replayAction")
  await expect(search).toBeFocused()
  await page.getByRole("button", { name: "Hide candidate activation", exact: true }).click()
  await expect(search).toBeHidden()
  await page.getByRole("button", { name: "Show candidate activation", exact: true }).click()
  await expect(search).toBeVisible()
  await blur()
  await invoke(page, "replayAction")
  await expect(search).not.toBeFocused()
  await focus("onceWorkingFocus")
  await expect(layout).not.toBeFocused()
  await searchButton.click()
  await expect(search).toBeFocused()
  await layout.click()
  await hold(layoutMenu(page), "freshFocus", "finalFocus")
  await page.keyboard.press("Escape")
  await expect(layoutMenu(page)).toBeHidden()
  await blur()
  await focus("freshFocus")
  await expect(layout).toBeFocused()
  await layout.click()
  const currentRadio = layoutMenu(page).locator("input:checked")
  await expect(currentRadio).toBeFocused()
  await focus("freshFocus")
  await expect(currentRadio).toBeFocused()
  await hold(layoutMenu(page), "foregroundFocus", "finalFocus")
  await page.keyboard.press("Escape")
  await expect(layoutMenu(page)).toBeHidden()
  await blur()
  await focus("foregroundFocus")
  await expect(layout).toBeFocused()
  const outside = page.getByRole("button", { name: "External foreground focus owner", exact: true })
  await outside.focus()
  await focus("foregroundFocus")
  await expect(outside).toBeFocused()
  for (const role of ["dialog", "menu"]) {
    await page.evaluate((kind) => {
      const popup = document.createElement(kind === "dialog" ? "dialog" : "div")
      popup.setAttribute("role", kind)
      popup.setAttribute("aria-label", "Outside foreground popup")
      const control = document.createElement(kind === "dialog" ? "input" : "button")
      control.setAttribute("aria-label", "Outside popup focus owner")
      if (kind === "menu") control.setAttribute("role", "menuitem")
      popup.append(control)
      document.body.append(popup)
      if (popup instanceof HTMLDialogElement) popup.show()
      control.focus()
    }, role)
    const owner = page.getByLabel("Outside popup focus owner", { exact: true })
    await expect(owner).toBeFocused()
    await focus("foregroundFocus")
    await expect(owner).toBeFocused()
    await page
      .getByRole(role, { name: "Outside foreground popup", exact: true })
      .evaluate((node) => node.remove())
  }
})
