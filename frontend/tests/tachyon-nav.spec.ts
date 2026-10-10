import { expect, test } from "@playwright/test"

const entry = "/?example=tachyon-nav"
test.use({ baseURL: `http://127.0.0.1:${process.env.TACHYON_NAV_PORT ?? 18545}` })
test("real groups, parent paths, collapse, footer and icon flyout", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 700 })
  await page.goto(`${entry}#/work`)
  await expect(page.locator('[data-slot="app-shell"]')).toHaveCount(1)
  const nav = page.getByRole("navigation", { name: "Module navigation" }).first()
  for (const name of [
    "Agents",
    "Execution",
    "Sessions",
    "Observability",
    "Work",
    "Services",
    "Source Control",
    "Settings",
  ])
    await expect(nav.getByRole("button", { name, exact: true })).toBeVisible()
  const work = nav.getByRole("button", { name: "Work", exact: true })
  await work.click()
  await expect(work).toHaveAttribute("aria-expanded", "false")
  await expect(nav.getByRole("button", { name: "Board", exact: true })).toHaveCount(0)
  await work.click()
  await nav.getByRole("button", { name: "Board", exact: true }).click()
  await expect(page).toHaveURL(/#\/work\/board$/)
  await expect(nav.getByRole("button", { name: "Board", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  )
  await page.getByRole("button", { name: "Toggle icon rail" }).click()
  await nav.getByRole("button", { name: "Work", exact: true }).click()
  const flyout = page.getByRole("menu", { name: "Work", exact: true })
  await expect(flyout).toBeVisible()
  await flyout.getByRole("menuitem", { name: "Tasks", exact: true }).click()
  await expect(page).toHaveURL(/#\/work$/)
  await expect(nav.getByRole("button", { name: "Work", exact: true })).toBeFocused()
})
test("hash tabs, native history, breadcrumbs, encoded opaque IDs and hidden admission", async ({
  page,
}) => {
  await page.goto(`${entry}#/work`)
  const sub = page.getByRole("navigation", { name: "Page sub-navigation" })
  await sub.getByRole("tab", { name: "Board" }).click()
  await expect(page).toHaveURL(/#\/work\/board$/)
  await page.goBack()
  await expect(page).toHaveURL(/#\/work$/)
  await page.getByLabel("Sub-nav variant").selectOption("left")
  await sub.getByRole("tab", { name: "Board" }).click()
  await expect(page.getByRole("navigation", { name: "Breadcrumbs" })).toContainText("Board")
  await page.getByRole("button", { name: "Inspect opaque/id ? # %", exact: true }).click()
  await expect(page.getByRole("heading", { name: "Task opaque/id ? # %" })).toBeVisible()
  await expect(page).toHaveURL(/#\/work\/%6Fpaque%2Fid%20%3F%20%23%20%25$/)
  await page.goto(`${entry}&scenario=hidden#/work/board`)
  await expect(page.getByRole("heading", { name: "Board", exact: true })).toBeVisible()
  await expect(page.locator('[data-nav-id="work_board"]')).toHaveCount(0)
  await page.goto(`${entry}#/work/%62oard`)
  await expect(page.getByRole("heading", { name: "Task board", exact: true })).toBeVisible()
  await page.goto(`${entry}#/work/%00`)
  await expect(page.getByRole("alert")).toContainText("Invalid route")
})
test("empty, denied, discovery failures and diagnostic admissions remain distinct", async ({
  page,
}) => {
  for (const [scenario, expected] of [
    ["empty", "Empty successful discovery"],
    ["denied", "Access denied"],
    ["unavailable", "Discovery unavailable"],
    ["degraded", "Discovery degraded"],
    ["duplicate", "Duplicate id/route dropped"],
    ["reserved", "Reserved route claim refused"],
    ["missing-parent", "Missing parent"],
  ]) {
    await page.goto(`${entry}&scenario=${scenario}#/work`)
    await expect(page.locator('[data-testid="tachyon-nav"]')).toContainText(expected)
  }
  await page.goto(`${entry}&scenario=orphan#/fixture-orphan`)
  await expect(page.getByRole("heading", { name: "Orphan inspection" })).toBeVisible()
  await expect(page.getByRole("navigation", { name: "Breadcrumbs" })).toContainText("More")
  await page.goto(`${entry}&scenario=retired#/sessions`)
  await expect(page.getByRole("alert")).toContainText("Plugin retired")
  await expect(page.locator('[data-nav-id="session_list"]')).toBeDisabled()
})
test("menu slots deliver local typed command/navigation/modal and nested Escape", async ({
  page,
}) => {
  await page.goto(`${entry}#/work`)
  await page.getByRole("button", { name: "Header menu", exact: true }).click()
  await page.getByRole("menuitem", { name: "Inspect fixture locally" }).click()
  await expect(
    page.getByRole("status").filter({ hasText: "Fixture inspected locally" }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Hamburger menu", exact: true }).click()
  await page.getByRole("menuitem", { name: "Navigate to Board" }).click()
  await expect(page).toHaveURL(/#\/work\/board$/)
  await page.getByRole("button", { name: "Page toolbar", exact: true }).click()
  await page.getByRole("menuitem", { name: "Open fixture details" }).click()
  const dialog = page.getByRole("dialog", { name: "Fixture details", exact: true })
  await expect(dialog).toBeVisible()
  await dialog.getByRole("button", { name: "Open nested fixture" }).click()
  await expect(page.getByRole("dialog", { name: "Nested fixture", exact: true })).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog", { name: "Nested fixture", exact: true })).toHaveCount(0)
  await expect(dialog).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(dialog).toHaveCount(0)
})
test("nav roving and IME shortcut veto preserve editable composition", async ({ page }) => {
  await page.goto(`${entry}#/work`)
  const nav = page.getByRole("navigation", { name: "Module navigation" }).first()
  const first = nav.getByRole("button", { name: "Agents", exact: true })
  await first.focus()
  await first.press("ArrowDown")
  await expect(nav.getByRole("button", { name: "Agent Ops", exact: true })).toBeFocused()
  await page.keyboard.press("/")
  const note = page.getByRole("textbox", { name: "Local navigation note" })
  await expect(note).toBeFocused()
  await note.evaluate((el) =>
    el.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })),
  )
  await note.fill("編集中")
  await note.evaluate((el) =>
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "/", keyCode: 229, bubbles: true })),
  )
  await expect(note).toHaveValue("編集中")
  await note.evaluate((el) =>
    el.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true })),
  )
})
for (const width of [1280, 390])
  for (const height of [700, 420])
    test(`settled ${width}x${height} bounds, drawer/footer and action captures`, async ({
      page,
    }, info) => {
      await page.setViewportSize({ width, height })
      await page.goto(`${entry}#/work`)
      if (width === 390) {
        await page.getByRole("button", { name: "Modules", exact: true }).click()
        const drawer = page.getByRole("dialog", { name: "Module drawer" })
        await expect(drawer).toBeVisible()
        const settings = drawer.getByRole("button", { name: "Settings", exact: true })
        await settings.scrollIntoViewIfNeeded()
        await expect(settings).toBeInViewport()
        await expect(drawer).toHaveCSS("opacity", "1")
        await page.screenshot({ path: info.outputPath(`drawer-${width}-${height}.png`) })
        await drawer.getByRole("button", { name: "Configuration", exact: true }).click()
        await expect(page).toHaveURL(/#\/settings$/)
        await expect(drawer).toHaveCount(0)
        await expect(page.getByRole("button", { name: "Modules", exact: true })).toBeFocused()
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
      const toolbar = page.getByRole("button", { name: "Page toolbar", exact: true })
      await toolbar.scrollIntoViewIfNeeded()
      await expect(toolbar).toBeInViewport()
      await expect
        .poll(
          async () =>
            await toolbar.evaluate((el) => {
              const rect = el.getBoundingClientRect()
              return rect.bottom <= innerHeight && rect.right <= innerWidth
            }),
        )
        .toBe(true)
      await page.screenshot({ path: info.outputPath(`shell-${width}-${height}.png`) })
    })

test("owner metadata wins and top/left tab arrow navigation is addressable", async ({ page }) => {
  await page.goto(`${entry}&scenario=owner-conflict#/work`)
  await expect(page.locator('[data-owner="work-ops"][aria-label="Work group"]')).toBeVisible()
  await expect(page.locator('[data-testid="tachyon-nav"]')).toContainText(
    "Group metadata owner work-ops wins",
  )
  const sub = page.getByRole("navigation", { name: "Page sub-navigation" })
  await sub.getByRole("tab", { name: "Tasks", exact: true }).focus()
  await page.keyboard.press("ArrowRight")
  await expect(page).toHaveURL(/#\/work\/board$/)
  await expect(sub.getByRole("tab", { name: "Board", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  )
  await expect(sub.getByRole("tab", { name: "Board", exact: true })).toBeFocused()
  await page.getByLabel("Sub-nav variant").selectOption("left")
  await sub.getByRole("tab", { name: "Board", exact: true }).focus()
  await page.keyboard.press("ArrowUp")
  await expect(page).toHaveURL(/#\/work$/)
})
async function settle(
  page: import("@playwright/test").Page,
  locator: import("@playwright/test").Locator,
) {
  await page.evaluate(() => document.fonts.ready)
  await expect(locator).toBeVisible()
  await expect
    .poll(() =>
      locator.evaluate((node) =>
        node
          .getAnimations({ subtree: true })
          .every((animation) => animation.playState !== "running"),
      ),
    )
    .toBe(true)
  await expect
    .poll(() =>
      locator.evaluate(
        (node) =>
          new Promise<boolean>((done) => {
            const first = node.getBoundingClientRect()
            requestAnimationFrame(() =>
              requestAnimationFrame(() => {
                const next = node.getBoundingClientRect()
                done(
                  first.x === next.x &&
                    first.y === next.y &&
                    first.width === next.width &&
                    first.height === next.height,
                )
              }),
            )
          }),
      ),
    )
    .toBe(true)
}
for (const width of [1280, 390])
  for (const mode of ["dark", "light"])
    test(`settled route/action compositions ${width} ${mode}`, async ({ page }, info) => {
      await page.setViewportSize({ width, height: 700 })
      for (const [route, variant] of [
        ["/work", "top"],
        ["/observe", "left"],
        ["/services/health", "top"],
      ]) {
        await page.goto(`${entry}&mode=${mode}&variant=${variant}#${route}`)
        const pane = page.getByRole("region", { name: "Routed fixture page" })
        await settle(page, pane)
        await page.screenshot({
          path: info.outputPath(`${route.replaceAll("/", "-")}-${variant}.png`),
        })
      }
      const toolbar = page.getByRole("button", { name: "Page toolbar", exact: true })
      await toolbar.click()
      const menu = page.getByRole("menu", { name: "Page toolbar", exact: true })
      await settle(page, menu)
      await page.screenshot({ path: info.outputPath("page-menu.png") })
      await menu.getByRole("menuitem", { name: "Open fixture details" }).click()
      const dialog = page.getByRole("dialog", { name: "Fixture details", exact: true })
      await settle(page, dialog)
      await page.screenshot({ path: info.outputPath("details-dialog.png") })
      await page.keyboard.press("Escape")
      await expect(dialog).toHaveCount(0)
    })
test("portable stories use the same composition and no backend requests", async ({ page }) => {
  const calls: string[] = []
  page.on("request", (request) => {
    if (/\/api\/|\/events|\/sse/.test(request.url())) calls.push(request.url())
  })
  for (const story of [
    "grouped",
    "left-sub-rail",
    "hidden-routes",
    "orphaned",
    "retired",
    "empty",
    "denied",
    "unavailable",
    "degraded",
  ]) {
    await page.goto(
      `http://127.0.0.1:18542/iframe.html?id=examples-tachyon-navigation--${story}&viewMode=story`,
    )
    await expect(page.getByTestId("tachyon-nav")).toBeVisible()
  }
  expect(calls).toEqual([])
})

test("subnav refuses IME/229/modifier and competing owner while editable composition updates", async ({
  page,
}) => {
  await page.goto(`${entry}#/work`)
  const tasks = page.getByRole("tab", { name: "Tasks", exact: true })
  await tasks.focus()
  for (const detail of [
    { isComposing: true },
    { keyCode: 229 },
    { ctrlKey: true },
    { altKey: true },
    { metaKey: true },
    { shiftKey: true },
  ]) {
    await tasks.evaluate(
      (el, detail) =>
        el.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: "ArrowRight",
            bubbles: true,
            cancelable: true,
            ...detail,
          }),
        ),
      detail,
    )
    await expect(page).toHaveURL(/#\/work$/)
    await expect(tasks).toBeFocused()
  }
  await page.evaluate(() => {
    const owner = document.createElement("div")
    owner.id = "tab-owner"
    owner.setAttribute("role", "dialog")
    owner.textContent = "New owner"
    document.body.append(owner)
  })
  await tasks.press("ArrowRight")
  await expect(page).toHaveURL(/#\/work$/)
  await page.locator("#tab-owner").evaluate((el) => el.remove())
  await tasks.press("ArrowRight")
  await expect(page).toHaveURL(/#\/work\/board$/)
})

test("narrow module drawer owns roving arrows and yields to newer popup", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 420 })
  await page.goto(`${entry}#/work`)
  await page.getByRole("button", { name: "Modules", exact: true }).click()
  const drawer = page.getByRole("dialog", { name: "Module drawer", exact: true })
  const agents = drawer.getByRole("button", { name: "Agents", exact: true })
  await agents.focus()
  await page.keyboard.press("ArrowDown")
  await expect(drawer.getByRole("button", { name: "Agent Ops", exact: true })).toBeFocused()
  await page.evaluate(() => {
    const newer = document.createElement("div")
    newer.id = "drawer-newer"
    newer.setAttribute("role", "listbox")
    newer.textContent = "New layer"
    document.body.append(newer)
  })
  await page.keyboard.press("ArrowDown")
  await expect(drawer.getByRole("button", { name: "Agent Ops", exact: true })).toBeFocused()
  await page.locator("#drawer-newer").evaluate((el) => el.remove())
  await page.keyboard.press("Escape")
  await expect(drawer).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Modules", exact: true })).toBeFocused()
})
