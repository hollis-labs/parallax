import { expect, type Page, test } from "@playwright/test"

const base = process.env.NIL_EXAMPLE_URL ?? "http://127.0.0.1:18545"
const proof = process.env.NIL_EXAMPLE_PROOF_URL ?? base
const rows = (page: Page) => page.locator("[data-ops-row-id]")
const rowId = async (page: Page, index = 0) =>
  (await rows(page).nth(index).getAttribute("data-ops-row-id")) as string
async function start(page: Page, harness = false) {
  await page.goto(`${harness ? proof : base}/${harness ? "nil-example.html" : "?example=nil"}`)
  await expect(page.getByRole("heading", { name: "Nil operations", exact: true })).toBeVisible()
  await expect(rows(page)).toHaveCount(24)
}
async function focusFirst(page: Page) {
  // Natural open/close establishes the documented row return before key navigation.
  await rows(page).first().click()
  await expect(page.getByLabel("Item title", { exact: true })).toBeFocused()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(rows(page).first()).toBeFocused()
}
async function nativeHold(page: Page, target = rows(page).first()) {
  const box = await target.boundingBox()
  expect(box).not.toBeNull()
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
  await page.mouse.down()
  // Observe the actual threshold completion; never sleep or force menu focus.
  await expect(page.getByRole("menu", { name: "Nil actions" })).toBeVisible()
  await page.mouse.up()
}

test("operations mode, sections, taxonomy, absence/zero and local capture", async ({ page }) => {
  await start(page)
  await expect(page.getByText("P0", { exact: true }).first()).toBeVisible()
  await expect(page.getByText("Absent", { exact: true }).first()).toBeVisible()
  const first = await rowId(page)
  await page.getByRole("button", { name: "now (6)", exact: true }).click()
  await expect(rows(page)).toHaveCount(18)
  await expect(page.locator(`[data-ops-row-id="${first}"]`)).toHaveCount(0)
  await page.getByRole("button", { name: "now (6)", exact: true }).click()
  await expect(rows(page)).toHaveCount(24)
  for (const name of ["now", "soon", "anytime", "done"])
    await page.getByRole("button", { name: `${name} (6)`, exact: true }).click()
  await expect(rows(page)).toHaveCount(0)
  await expect(page.getByText("No matching Nil items.", { exact: false })).toBeVisible()
  for (const name of ["now", "soon", "anytime", "done"])
    await page.getByRole("button", { name: `${name} (6)`, exact: true }).click()
  await page.getByRole("button", { name: /Switch view mode/ }).click()
  await expect(rows(page)).toHaveCount(12)
  await page.getByRole("button", { name: /Switch view mode/ }).click()
  await expect(rows(page)).toHaveCount(36)
  await page.getByLabel("Filter Nil items", { exact: true }).fill("+launch @desk")
  await expect(rows(page)).not.toHaveCount(0)
  const filtered = await rows(page).count()
  expect(filtered).toBeLessThan(36)
  await page.getByLabel("Filter Nil items", { exact: true }).fill("not-a-fixture-result")
  await expect(rows(page)).toHaveCount(0)
  await page.getByLabel("Filter Nil items", { exact: true }).press("Escape")
  await expect(rows(page)).toHaveCount(36)
  await page.getByRole("button", { name: "Search mode (switch to Quick Add)", exact: true }).click()
  const capture = page.getByLabel("Quick capture", { exact: true })
  await capture.fill("A fresh local capture")
  await capture.press("Enter")
  await expect(capture).toHaveValue("")
  await expect(rows(page)).toHaveCount(37)
  await expect(page.getByTestId("nil-notice")).toHaveText("Local quick capture added.")
})

test("row ownership, native list navigation and guarded inbox bulk mutations", async ({ page }) => {
  await start(page)
  await focusFirst(page)
  await page.keyboard.press("ArrowDown")
  await expect(rows(page).nth(1)).toBeFocused()
  await page.keyboard.press("Space")
  await expect(page.getByLabel("Item title", { exact: true })).toBeFocused()
  await page.keyboard.press("Escape")
  await expect(rows(page).nth(1)).toBeFocused()
  await page.getByRole("tab", { name: "Inbox (6)", exact: true }).click()
  await expect(rows(page)).toHaveCount(6)
  await page.getByLabel("Filter Nil items", { exact: true }).fill("pad")
  await expect(page.getByRole("tab", { name: "Inbox (6)", exact: true })).toBeVisible()
  await page.getByLabel("Filter Nil items", { exact: true }).fill("")
  await focusFirst(page)
  await page.keyboard.press("p")
  await expect(rows(page)).toHaveCount(5)
  await expect(page.getByRole("tab", { name: "Inbox (5)", exact: true })).toBeVisible()
  await rows(page).first().getByRole("checkbox").check()
  await rows(page).nth(1).getByRole("checkbox").check()
  await page.getByRole("button", { name: "Archive selected", exact: true }).click()
  await expect(rows(page)).toHaveCount(3)
  await page.getByRole("tab", { name: "Archive", exact: true }).click()
  await expect(rows(page)).toHaveCount(2)
  await page.getByRole("tab", { name: "Inbox (3)", exact: true }).click()
  await rows(page).first().getByRole("checkbox").check()
  await page.getByRole("button", { name: "Delete selected", exact: true }).click()
  await expect(page.getByRole("dialog", { name: "Delete local items?", exact: true })).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(rows(page)).toHaveCount(3)
  await page.getByRole("button", { name: "Delete selected", exact: true }).click()
  await page.getByRole("button", { name: "Delete locally", exact: true }).click()
  await expect(rows(page)).toHaveCount(2)
  await page.getByRole("tab", { name: "All", exact: true }).click()
  await expect(rows(page)).toHaveCount(25)
})

test("editor fullscreen caret, dirty nested Escape and Cmd+Enter save", async ({ page }) => {
  await start(page)
  await rows(page).first().click()
  const title = page.getByLabel("Item title", { exact: true })
  await expect(title).toBeFocused()
  await title.fill("Saved local title")
  await title.evaluate((node: HTMLInputElement) => {
    node.setSelectionRange(2, 6)
    ;(window as unknown as { titleNode: HTMLInputElement }).titleNode = node
  })
  await page.getByRole("button", { name: "Enter fullscreen", exact: true }).click()
  await expect(title).toBeFocused()
  expect(
    await title.evaluate(
      (node: HTMLInputElement) =>
        node === (window as unknown as { titleNode: HTMLInputElement }).titleNode &&
        node.selectionStart === 2 &&
        node.selectionEnd === 6,
    ),
  ).toBe(true)
  await expect(page.getByRole("dialog")).toHaveAttribute("data-fullscreen", "true")
  await title.press("Escape")
  const prompt = page.getByRole("dialog", { name: "Unsaved local changes", exact: true })
  await expect(prompt).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(prompt).toHaveCount(0)
  await expect(title).toBeFocused()
  await expect(title).toHaveValue("Saved local title")
  await title.press("Control+Enter")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(rows(page).first()).toBeFocused()
  await rows(page).first().click()
  await expect(title).toHaveValue("Saved local title")
  await expect(page.getByRole("button", { name: "Enter fullscreen", exact: true })).toBeVisible()
  await title.fill("Discard this")
  await page.getByRole("button", { name: "Close", exact: true }).click()
  await page.getByRole("button", { name: "Discard changes", exact: true }).click()
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await rows(page).first().click()
  await expect(title).toHaveValue("Saved local title")
})

test("synthetic composition updates editors while IME/229 shortcuts are vetoed", async ({
  page,
}) => {
  await start(page)
  await rows(page).first().click()
  const title = page.getByLabel("Item title", { exact: true })
  await title.dispatchEvent("compositionstart")
  await title.fill("Composing draft")
  await title.press("Control+Enter")
  await title.press("Escape")
  await expect(title).toHaveValue("Composing draft")
  await expect(page.getByRole("dialog")).toHaveCount(1)
  await title.dispatchEvent("keydown", { key: "Enter", ctrlKey: true, keyCode: 229 })
  await expect(page.getByRole("dialog")).toHaveCount(1)
  await title.dispatchEvent("compositionend")
  await title.press("Control+Shift+Enter")
  await expect(page.getByRole("dialog")).toHaveCount(1)
  await title.press("Control+Enter")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(rows(page).first()).toBeFocused()
  await page.keyboard.press("Control+k")
  const query = page.getByRole("combobox", { name: "Search query", exact: true })
  await expect(query).toBeFocused()
  await query.dispatchEvent("compositionstart")
  await query.fill("Review")
  const cursor = await query.getAttribute("aria-activedescendant")
  await query.press("ArrowDown")
  await query.press("Enter")
  await query.press("Escape")
  await expect(query).toHaveValue("Review")
  expect(await query.getAttribute("aria-activedescendant")).toBe(cursor)
  await query.dispatchEvent("compositionend")
  await query.press("ArrowDown")
  expect(await query.getAttribute("aria-activedescendant")).not.toBe(cursor)
})

test("palette input-owned cursor, static filter geometry, no matches and foreground handoff", async ({
  page,
}) => {
  await start(page)
  await page.getByLabel("Filter Nil items", { exact: true }).fill("+garden")
  await page.getByRole("button", { name: "Quick search", exact: true }).click()
  const query = page.getByRole("combobox", { name: "Search query", exact: true })
  await expect(query).toBeFocused()
  const filter = page.getByRole("radiogroup", { name: "Filter result types" }),
    before = await filter.boundingBox()
  const cursor = await query.getAttribute("aria-activedescendant")
  await query.press("ArrowDown")
  await expect(query).toBeFocused()
  expect(await query.getAttribute("aria-activedescendant")).not.toBe(cursor)
  expect(await filter.boundingBox()).toEqual(before)
  await query.press("Tab")
  await expect(page.getByRole("radio", { name: "All", exact: true })).toBeFocused()
  await page.keyboard.press("ArrowRight")
  await expect(page.getByRole("radio", { name: "Todos", exact: true })).toBeFocused()
  await page.keyboard.press("Shift+Tab")
  await expect(query).toBeFocused()
  await query.fill("no-matching-4421-record")
  await expect(page.getByText("No results", { exact: true })).toBeVisible()
  await query.press("Escape")
  await expect(query).toHaveValue("")
  await query.press("Escape")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(page.getByLabel("Filter Nil items", { exact: true })).toHaveValue("+garden")
  await page.getByRole("button", { name: "Quick search", exact: true }).click()
  await query.fill("Gather field notes")
  await query.press("Enter")
  await expect(page.getByLabel("Item title", { exact: true })).toBeFocused()
  await expect(page.getByRole("dialog")).toHaveCount(1)
})

test("Shift-Shift alias survives edit guard and layer ownership", async ({ page }) => {
  await start(page)
  const filter = page.getByLabel("Filter Nil items", { exact: true })
  await filter.click()
  await page.keyboard.press("Shift")
  await page.keyboard.press("Shift")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await focusFirst(page)
  await page.keyboard.press("Shift")
  await page.keyboard.press("Shift")
  await expect(page.getByRole("combobox", { name: "Search query", exact: true })).toBeFocused()
  await page.keyboard.press("Escape")
  await expect(rows(page).first()).toBeFocused()
  await page.keyboard.press("Shift+F10")
  await expect(page.getByRole("menu", { name: "Nil actions" })).toBeVisible()
  await page.keyboard.press("Control+k")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.keyboard.press("Escape")
  await expect(rows(page).first()).toBeFocused()
})

test("native row hold suppresses later compatibility click; fresh pointer/keyboard positives", async ({
  page,
}) => {
  await start(page)
  await nativeHold(page)
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.keyboard.press("Escape")
  await expect(rows(page).first()).toBeFocused()
  await rows(page).first().click()
  await expect(page.getByLabel("Item title", { exact: true })).toBeFocused()
  await page.keyboard.press("Escape")
  await expect(rows(page).first()).toBeFocused()
  await page.keyboard.press("Shift+F10")
  await expect(page.getByRole("menu", { name: "Nil actions" })).toBeVisible()
  await page.getByRole("menuitem", { name: "PIN", exact: true }).click()
  await expect(page.getByRole("menu")).toHaveCount(0)
  await expect(rows(page).first()).toBeFocused()
})

test("long-press movement and cancellation; mode secondary is outside dialogs", async ({
  page,
}) => {
  await start(page)
  const box = await rows(page).first().boundingBox()
  expect(box).not.toBeNull()
  await page.mouse.move(box!.x + 30, box!.y + 12)
  await page.mouse.down()
  await page.mouse.move(box!.x + 45, box!.y + 12)
  await page.mouse.up()
  await expect(page.getByRole("menu")).toHaveCount(0)
  // The later native tap is a positive, rather than a timed negative only.
  if (await page.getByRole("dialog").count()) await page.keyboard.press("Escape")
  await focusFirst(page)
  const mode = page.getByRole("button", { name: /Switch view mode/ })
  const modeBox = await mode.boundingBox()
  expect(modeBox).not.toBeNull()
  await page.mouse.move(modeBox!.x + modeBox!.width / 2, modeBox!.y + modeBox!.height / 2)
  await page.mouse.down()
  await expect(page.getByRole("dialog", { name: "Nil user tabs", exact: true })).toBeVisible()
  await page.mouse.up()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("button", { name: /current: Todos/ })).toBeFocused()
  await mode.click()
  await expect(rows(page)).toHaveCount(12)
  await rows(page).first().click()
  await expect(page.getByLabel("Item title", { exact: true })).toBeFocused()
  await page.keyboard.press("Escape")
})

for (const retirement of ["source", "access", "Activity", "root"]) {
  test(`once-working retained actions refuse ${retirement} retirement and fresh positives`, async ({
    page,
  }) => {
    await start(page, true)
    await page.getByRole("tab", { name: "Inbox (6)", exact: true }).click()
    const id = await rowId(page)
    // Publication is a useLayoutEffect receipt, observed before both positive and negative calls.
    await expect.poll(() => page.evaluate(() => Boolean(window.__nil.current?.live()))).toBe(true)
    await page.evaluate((id) => {
      const frame = window.__nil.current!
      window.__nil.held = frame
      frame.open(id)
    }, id)
    await expect(page.getByLabel("Item title", { exact: true })).toBeFocused()
    await page.keyboard.press("Escape")
    await expect.poll(() => page.evaluate(() => Boolean(window.__nil.current?.live()))).toBe(true)
    await page.evaluate((id) => {
      const frame = window.__nil.current!
      window.__nil.held = frame
      frame.process(id)
    }, id)
    await expect(page.getByRole("tab", { name: "Inbox (5)", exact: true })).toBeVisible()
    await expect.poll(() => page.evaluate(() => Boolean(window.__nil.current?.live()))).toBe(true)
    await page.evaluate(() => {
      window.__nil.held = window.__nil.current
    })
    await page
      .getByRole("button", {
        name: retirement === "source" ? "Replace Nil source" : `Toggle Nil ${retirement}`,
        exact: true,
      })
      .click()
    if (retirement === "source")
      await expect.poll(() => page.evaluate(() => window.__nil.source)).toBe(2)
    else
      await expect
        .poll(() =>
          page.evaluate(
            (key) =>
              !window.__nil[key as "accessible" | "mounted"] ||
              (key === "hidden" && window.__nil.hidden),
            retirement === "access" ? "accessible" : retirement === "root" ? "mounted" : "hidden",
          ),
        )
        .toBe(true)
    expect(
      await page.evaluate((id) => {
        const frame = window.__nil.held!
        const live = frame.live()
        frame.process(id)
        frame.open(id)
        frame.hold.cancel()
        return live
      }, id),
    ).toBe(false)
    await expect(page.getByRole("dialog")).toHaveCount(0)
    if (retirement !== "source")
      await page.getByRole("button", { name: `Toggle Nil ${retirement}`, exact: true }).click()
    await expect.poll(() => page.evaluate(() => Boolean(window.__nil.current?.live()))).toBe(true)
    if (retirement === "source" || retirement === "root")
      await page.getByRole("tab", { name: "Inbox (6)", exact: true }).click()
    const current = await rowId(page)
    await page.evaluate((id) => window.__nil.current!.open(id), current)
    await expect(page.getByLabel("Item title", { exact: true })).toBeFocused()
  })
}

test("inspection record arrows respect caret ownership and stop boundaries", async ({ page }) => {
  await start(page)
  const firstTitle = await rows(page).first().innerText()
  await rows(page).first().click()
  const title = page.getByLabel("Item title", { exact: true })
  const first = await title.inputValue()
  await title.press("ArrowRight")
  await expect(title).toHaveValue(first)
  await expect(page.getByRole("button", { name: "Previous", exact: true })).toBeDisabled()
  await title.press("Shift+Tab")
  await page.keyboard.press("Shift+Tab")
  await expect(page.getByRole("heading", { name: `Edit ${first}`, exact: true })).toBeFocused()
  await page.keyboard.press("ArrowLeft")
  await expect(title).toHaveValue(first)
  await page.keyboard.press("ArrowRight")
  await expect(title).toBeFocused()
  await expect(title).not.toHaveValue(first)
  await page.getByRole("button", { name: "Previous", exact: true }).click()
  await expect(title).toHaveValue(first)
  await title.fill("A navigated dirty draft")
  await page.getByRole("button", { name: "Next", exact: true }).click()
  await expect(
    page.getByRole("dialog", { name: "Unsaved local changes", exact: true }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Keep editing", exact: true }).click()
  await expect(title).toHaveValue("A navigated dirty draft")
  await page.getByRole("button", { name: "Next", exact: true }).click()
  await page.getByRole("button", { name: "Discard changes", exact: true }).click()
  await expect(title).not.toHaveValue("A navigated dirty draft")
  await page.keyboard.press("Escape")
  await expect(rows(page).first()).toContainText(firstTitle.split("\n")[0])
})

for (const viewport of [
  { width: 1280, height: 800 },
  { width: 1280, height: 420 },
  { width: 390, height: 844 },
  { width: 390, height: 420 },
]) {
  test(`complete native bounds and scroll ${viewport.width}x${viewport.height}`, async ({
    page,
  }, info) => {
    await page.setViewportSize(viewport)
    await start(page)
    await page.evaluate(() => document.fonts.ready)
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
      .toBe(true)
    const state = await page.getByTestId("nil-example").boundingBox()
    expect(state).not.toBeNull()
    expect(state!.height).toBeLessThanOrEqual(viewport.height + 1)
    const scrollers = await page
      .locator("div")
      .evaluateAll((nodes) =>
        nodes
          .filter(
            (n) => n.scrollHeight > n.clientHeight && getComputedStyle(n).overflowY === "auto",
          )
          .map((n) => ({ client: n.clientHeight, total: n.scrollHeight })),
      )
    expect(scrollers.some((s) => s.client > 0 && s.total > s.client)).toBe(true)
    await page.screenshot({
      path: info.outputPath(`nil-${viewport.width}x${viewport.height}-dark.png`),
      animations: "disabled",
    })
    await rows(page).first().click()
    const title = page.getByLabel("Item title", { exact: true })
    await expect(title).toBeFocused()
    const dialog = page.getByRole("dialog")
    await expect
      .poll(async () => {
        const b = await dialog.boundingBox()
        return Boolean(
          b &&
            b.x >= 0 &&
            b.y >= 0 &&
            b.x + b.width <= viewport.width + 1 &&
            b.y + b.height <= viewport.height + 1,
        )
      })
      .toBe(true)
    const body = page.locator('[data-slot="inspection-body"]')
    expect(await body.evaluate((n) => n.scrollHeight > n.clientHeight && n.clientHeight > 0)).toBe(
      true,
    )
    await body.hover({ position: { x: 8, y: 8 } })
    await page.mouse.wheel(0, 450)
    await expect.poll(() => body.evaluate((n) => n.scrollTop)).toBeGreaterThan(0)
    const action = page.getByRole("button", { name: "Save and close", exact: true })
    const actionBounds = await action.boundingBox()
    expect(actionBounds).not.toBeNull()
    expect(actionBounds!.y + actionBounds!.height).toBeLessThanOrEqual(viewport.height + 1)
    await page.screenshot({
      path: info.outputPath(`nil-editor-${viewport.width}x${viewport.height}.png`),
      animations: "disabled",
    })
    await page.keyboard.press("Escape")
    await page.getByRole("button", { name: "Switch to light mode", exact: true }).click()
    await expect(page.locator("html")).toHaveAttribute("data-mode", "light")
    await page.screenshot({
      path: info.outputPath(`nil-${viewport.width}x${viewport.height}-light.png`),
      animations: "disabled",
    })
    await page
      .getByRole("combobox", { name: "Theme", exact: true })
      .selectOption("sysop-green-phosphor")
    await expect(page.locator("html")).toHaveAttribute("data-theme", "sysop-green-phosphor")
    await page.screenshot({
      path: info.outputPath(`nil-${viewport.width}x${viewport.height}-sysop.png`),
      animations: "disabled",
    })
  })
}

test("collapse retires checked and open membership; retained collapse and layer actions refuse", async ({
  page,
}) => {
  await start(page, true)
  const id = await rowId(page)
  await rows(page).first().getByRole("checkbox").check()
  await expect.poll(() => page.evaluate(() => Boolean(window.__nil.current?.live()))).toBe(true)
  await page.evaluate(() => {
    window.__nil.held = window.__nil.current
  })
  await page.getByRole("button", { name: "now (6)", exact: true }).click()
  await expect(rows(page)).toHaveCount(18)
  await page.evaluate((id) => {
    window.__nil.held!.collapse("soon")
    window.__nil.held!.open(id)
    window.__nil.held!.process(id)
  }, id)
  await expect(rows(page)).toHaveCount(18)
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.getByRole("button", { name: "now (6)", exact: true }).click()
  await expect(rows(page)).toHaveCount(24)
  await expect(rows(page).first().getByRole("checkbox")).not.toBeChecked()
  await expect.poll(() => page.evaluate(() => Boolean(window.__nil.current?.live()))).toBe(true)
  await page.evaluate(() => {
    window.__nil.held = window.__nil.current
  })
  await rows(page).first().click()
  await expect(page.getByLabel("Item title", { exact: true })).toBeFocused()
  await page.evaluate((id) => {
    window.__nil.held!.collapse("now")
    window.__nil.held!.process(id)
  }, id)
  await expect(page.getByLabel("Item title", { exact: true })).toBeFocused()
  await page.keyboard.press("Escape")
  await expect(rows(page).first()).toBeFocused()
  await expect(rows(page)).toHaveCount(24)
})

for (const owner of ["plain", "dialog", "menu"]) {
  test(`once-working retained focus yields to newer ${owner} owner`, async ({ page }) => {
    await start(page, true)
    await focusFirst(page)
    await expect.poll(() => page.evaluate(() => Boolean(window.__nil.current?.live()))).toBe(true)
    expect(
      await page.evaluate(() => {
        window.__nil.held = window.__nil.current
        return window.__nil.held!.focus()
      }),
    ).toBe(true)
    if (owner === "plain") await page.getByLabel("Newer plain owner", { exact: true }).click()
    else await page.getByRole("button", { name: `Open newer ${owner}`, exact: true }).click()
    const target =
      owner === "plain"
        ? page.getByLabel("Newer plain owner", { exact: true })
        : owner === "dialog"
          ? page.getByLabel("Newer dialog input", { exact: true })
          : page.getByRole("menuitem", { name: "Keep", exact: true })
    if (owner === "dialog") await target.click()
    await expect(target).toBeFocused()
    expect(await page.evaluate(() => window.__nil.held!.focus())).toBe(false)
    await expect(target).toBeFocused()
    if (owner !== "plain") await page.keyboard.press("Escape")
    await focusFirst(page)
    await expect.poll(() => page.evaluate(() => Boolean(window.__nil.current?.live()))).toBe(true)
    expect(await page.evaluate(() => window.__nil.current!.focus())).toBe(true)
  })
}

test("CDP touch emulation completes hold and cancels without a hardware claim", async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await start(page)
  const cdp = await context.newCDPSession(page)
  const b = await rows(page).first().boundingBox()
  expect(b).not.toBeNull()
  const point = { x: b!.x + b!.width / 2, y: b!.y + b!.height / 2 }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] })
  await expect(page.getByRole("menu", { name: "Nil actions", exact: true })).toBeVisible()
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] })
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.keyboard.press("Escape")
  await expect(rows(page).first()).toBeFocused()
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] })
  await cdp.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] })
  await rows(page).first().click()
  await expect(page.getByLabel("Item title", { exact: true })).toBeFocused()
  await page.keyboard.press("Escape")
  await expect(rows(page).first()).toBeFocused()
  await page.keyboard.press("Shift+F10")
  await expect(page.getByRole("menu", { name: "Nil actions", exact: true })).toBeVisible()
  await cdp.detach()
})

for (const retirement of ["source", "access", "Activity", "root"]) {
  test(`once-working retained focus refuses ${retirement} retirement`, async ({ page }) => {
    await start(page, true)
    await focusFirst(page)
    await expect.poll(() => page.evaluate(() => Boolean(window.__nil.current?.live()))).toBe(true)
    expect(
      await page.evaluate(() => {
        window.__nil.held = window.__nil.current
        return window.__nil.held!.focus()
      }),
    ).toBe(true)
    await page
      .getByRole("button", {
        name: retirement === "source" ? "Replace Nil source" : `Toggle Nil ${retirement}`,
        exact: true,
      })
      .click()
    await expect.poll(() => page.evaluate(() => Boolean(window.__nil.held?.live()))).toBe(false)
    expect(await page.evaluate(() => window.__nil.held!.focus())).toBe(false)
    if (retirement !== "source")
      await page.getByRole("button", { name: `Toggle Nil ${retirement}`, exact: true }).click()
    await focusFirst(page)
    await expect.poll(() => page.evaluate(() => Boolean(window.__nil.current?.live()))).toBe(true)
    expect(await page.evaluate(() => window.__nil.current!.focus())).toBe(true)
  })
}

async function retainDOMAction(page: Page, selector: string, kind = "onClick") {
  await page
    .locator(selector)
    .first()
    .evaluate((node, kind) => {
      const key = Object.keys(node).find((k) => k.startsWith("__reactProps$"))!
      const props = (node as unknown as Record<string, Record<string, (event: unknown) => void>>)[
        key
      ]
      Object.assign(window, { __nilDOM: { node, action: props[kind] } })
    }, kind)
}
async function competingPopup(page: Page, role: string, nested = false) {
  await page.evaluate(
    ({ role, nested }) => {
      const popup = document.createElement("div")
      popup.id = "newer-nil-popup"
      popup.setAttribute("role", role)
      popup.setAttribute("aria-label", "Competing native owner")
      popup.style.cssText =
        "position:fixed;inset:20px;z-index:9999;background:var(--bg);color:var(--fg);padding:20px"
      const button = document.createElement("button")
      button.textContent = "Competing owner control"
      popup.append(button)
      const parent = nested ? document.querySelector('[data-nil-owner="dirty"]')! : document.body
      parent.append(popup)
    },
    { role, nested },
  )
  await page.getByRole("button", { name: "Competing owner control", exact: true }).click()
}
async function invokeDOMAction(page: Page) {
  await page.evaluate(() => {
    const held = (
      window as unknown as { __nilDOM: { node: HTMLElement; action(event: unknown): void } }
    ).__nilDOM
    held.action({
      target: held.node,
      currentTarget: held.node,
      nativeEvent: new MouseEvent("click"),
      preventDefault() {},
      stopPropagation() {},
    })
  })
}
async function removeCompetingPopup(page: Page) {
  await page.evaluate(() => document.getElementById("newer-nil-popup")?.remove())
}

for (const role of ["dialog", "menu", "listbox"]) {
  for (const action of ["Discard changes", "Save changes"]) {
    test(`current retained dirty prompt ${action} refuses newer ${role}; same callback works after removal`, async ({
      page,
    }) => {
      await start(page, true)
      await rows(page).first().click()
      await page.getByLabel("Item title", { exact: true }).fill("Popup guarded draft")
      await page.keyboard.press("Escape")
      const prompt = page.getByRole("dialog", { name: "Unsaved local changes", exact: true })
      await expect(prompt).toBeVisible()
      await retainDOMAction(page, `[data-nil-owner="dirty"] button:has-text("${action}")`)
      await competingPopup(page, role, role === "listbox")
      await expect.poll(() => page.evaluate(() => Boolean(window.__nil.current?.live()))).toBe(true)
      await invokeDOMAction(page)
      await expect(prompt).toBeVisible()
      await expect(
        page.getByRole("button", { name: "Competing owner control", exact: true }),
      ).toBeFocused()
      await removeCompetingPopup(page)
      if (role === "dialog") {
        await page
          .locator('[data-nil-owner="dirty"]')
          .evaluate((node) => node.setAttribute("data-closed", ""))
        await invokeDOMAction(page)
        await expect(page.locator('[data-nil-owner="dirty"]')).toBeAttached()
        await page
          .locator('[data-nil-owner="dirty"]')
          .evaluate((node) => node.removeAttribute("data-closed"))
      }
      await invokeDOMAction(page)
      await expect(page.getByRole("dialog")).toHaveCount(0)
      await expect(rows(page).first()).toBeFocused()
      await rows(page).first().click()
      if (action === "Save changes")
        await expect(page.getByLabel("Item title", { exact: true })).toHaveValue(
          "Popup guarded draft",
        )
      else
        await expect(page.getByLabel("Item title", { exact: true })).not.toHaveValue(
          "Popup guarded draft",
        )
    })
  }
}

test("current retained user-tab and delete callbacks refuse competing popups and admit fresh positives", async ({
  page,
}) => {
  await start(page, true)
  await page.getByRole("button", { name: /Switch view mode/ }).press("Shift+F10")
  const tabs = page.getByRole("dialog", { name: "Nil user tabs", exact: true })
  await expect(tabs).toBeVisible()
  await tabs.getByRole("checkbox", { name: "Desk", exact: true }).uncheck()
  await tabs.getByRole("checkbox", { name: "Desk", exact: true }).check()
  await retainDOMAction(page, '[data-nil-owner="tabs"] input', "onChange")
  await competingPopup(page, "listbox")
  await invokeDOMAction(page)
  await expect(tabs.getByRole("checkbox", { name: "Desk", exact: true })).toBeChecked()
  await removeCompetingPopup(page)
  await invokeDOMAction(page)
  await expect(tabs.getByRole("checkbox", { name: "Desk", exact: true })).not.toBeChecked()
  await page.keyboard.press("Escape")
  await page.getByRole("tab", { name: "Inbox (6)", exact: true }).click()
  await focusFirst(page)
  await page.keyboard.press("d")
  const deletion = page.getByRole("dialog", { name: "Delete local items?", exact: true })
  await expect(deletion).toBeVisible()
  await retainDOMAction(page, '[data-nil-owner="delete"] button:last-child')
  await competingPopup(page, "menu")
  await invokeDOMAction(page)
  await expect(deletion).toBeVisible()
  await removeCompetingPopup(page)
  await invokeDOMAction(page)
  await expect(deletion).toHaveCount(0)
  await expect(page.getByRole("tab", { name: "Inbox (5)", exact: true })).toBeVisible()
})

test("hidden and closed nested competitors do not block the exact dirty owner", async ({
  page,
}) => {
  await start(page)
  await rows(page).first().click()
  await page.getByLabel("Item title", { exact: true }).fill("Visible exact owner save")
  await page.keyboard.press("Escape")
  await page.evaluate(() => {
    const owner = document.querySelector('[data-nil-owner="dirty"]')!
    for (const attribute of ["hidden", "inert", "aria-hidden", "data-closed"]) {
      const wrapper = document.createElement("div")
      wrapper.setAttribute(attribute, attribute === "aria-hidden" ? "true" : "")
      const popup = document.createElement("div")
      popup.setAttribute("role", "menu")
      popup.textContent = "Retired competitor"
      wrapper.append(popup)
      owner.append(wrapper)
    }
  })
  await page.getByRole("button", { name: "Save changes", exact: true }).click()
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(rows(page).first()).toBeFocused()
  await expect(rows(page).first()).toContainText("Visible exact owner save")
})
