import { readFileSync } from "node:fs"
import { expect, type Locator, type Page, test } from "@playwright/test"

const identities: string[] = JSON.parse(
  readFileSync(new URL("../src/examples/flux-cards/operands.json", import.meta.url), "utf8"),
).envelopes.map((row: { type: string }) => row.type)
const entry = "/?example=flux-chat"
type Handle = {
  source: string
  run: (job: () => void) => boolean
  focus: () => HTMLElement | false
  inspect: (label: string, value: unknown) => boolean
}
type ProbeWindow = Window & {
  fluxChat: { frames: Handle[]; effects: string[] }
  held: Handle
  writes: number
}
async function settle(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    )
  })
}
async function settlePopup(popup: Locator) {
  await expect(popup).toBeVisible()
  await expect(popup).toHaveCSS("opacity", "1")
  await popup.evaluate(async (node) => {
    const animations = node
      .getAnimations({ subtree: true })
      .filter(
        (animation) =>
          animation.effect?.getComputedTiming().iterations !== Number.POSITIVE_INFINITY,
      )
    await Promise.all(animations.map((animation) => animation.finished.catch(() => {})))
  })
  let previous = ""
  let stable = 0
  await expect
    .poll(async () => {
      const current = JSON.stringify(await popup.boundingBox())
      stable = current === previous && current !== "null" ? stable + 1 : 0
      previous = current
      return stable
    })
    .toBeGreaterThanOrEqual(3)
}
function lifecycleEntry() {
  const base = new URL(String(test.info().project.use.baseURL))
  if (base.port === "18541") base.port = "18545"
  if (base.port === "18951") base.port = "18955"
  return new URL("/flux-chat-lifecycle.html", base).href
}
test.beforeEach(async ({ page }) => {
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url())
    return url.hostname === "127.0.0.1" && route.request().method() === "GET"
      ? route.continue()
      : route.abort()
  })
})
test("one composed shell/editor, all 18 identities and tool modes, strict wide/narrow/short bounds", async ({
  page,
}, info) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  for (const [width, height] of [
    [1280, 900],
    [390, 844],
    [1280, 420],
    [390, 420],
  ]) {
    await page.setViewportSize({ width, height })
    await page.goto(entry)
    await page.evaluate(() => localStorage.removeItem("parallax_drawers_layout_v1"))
    await page.reload()
    await expect(page.getByLabel("Flux local draft")).toBeVisible()
    await expect(page.locator(".chat-example")).toHaveCount(1)
    await expect(page.getByLabel("Flux local draft")).toHaveCount(1)
    for (const type of identities)
      await expect(page.locator(`[data-wire-kind="${type}"]`)).toHaveCount(1)
    await settle(page)
    const editor = await page.getByLabel("Flux local draft").boundingBox()
    const footer = await page.locator(".chat-example-footer").boundingBox()
    if (!editor || !footer) throw new Error("Composer or footer bounds unavailable")
    expect(editor.y).toBeGreaterThanOrEqual(0)
    expect(editor.y + editor.height).toBeLessThanOrEqual(height)
    expect(footer.y + footer.height).toBeLessThanOrEqual(height)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    )
    await page.getByRole("button", { name: "Top drawer", exact: true }).click()
    await page.getByRole("button", { name: "Bottom drawer", exact: true }).click()
    await expect(page.getByTestId("drawer-body-top")).toBeVisible()
    await expect(page.getByTestId("drawer-body-bottom")).toBeAttached()
    await settle(page)
    const composer = await page.getByLabel("Flux local draft").boundingBox()
    if (!composer) throw new Error("Composer bounds unavailable with drawers open")
    expect(composer.y).toBeGreaterThanOrEqual(0)
    expect(composer.y + composer.height).toBeLessThanOrEqual(height)
    await page.screenshot({ path: info.outputPath(`composed-drawers-${width}-${height}.png`) })
  }
  expect(errors).toEqual([])
})
test("all four actual composed tool modes retain their supplied calls", async ({ page }) => {
  for (const tools of ["indicator", "minimal", "compact", "full"]) {
    await page.goto(`${entry}&tools=${tools}`)
    await expect(
      page.getByRole("region", { name: `Tool calls ${tools}`, exact: true }),
    ).toBeAttached()
  }
})
test("palette/search/layout own native focus; editor changes under IME while shortcuts/229 are suppressed", async ({
  page,
}) => {
  await page.goto(entry)
  const commands = page.getByRole("button", { name: "Command palette", exact: true })
  await commands.focus()
  await page.keyboard.press("Control+k")
  const palette = page.getByRole("dialog", { name: "Command palette", exact: true })
  await expect(palette).toBeVisible()
  await expect(page.getByLabel("Filter commands")).toBeFocused()
  await page.keyboard.press("ArrowDown")
  await expect(palette.getByRole("button", { name: "Focus composer", exact: true })).toBeFocused()
  await page.keyboard.press("Escape")
  await expect(palette).toBeHidden()
  await expect(commands).toBeFocused()
  await page.keyboard.press("Shift")
  await page.keyboard.press("Shift")
  await expect(page.getByRole("dialog", { name: "Search chats", exact: true })).toBeVisible()
  await page.getByLabel("Search chat fixtures").fill("gateway")
  await expect(
    page.getByRole("toolbar", { name: "Filtered local results" }).getByRole("button"),
  ).toHaveCount(1)
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog", { name: "Search chats", exact: true })).toBeHidden()
  await page.getByRole("button", { name: "Layout presets", exact: true }).focus()
  await page.keyboard.press("Control+\\")
  await expect(page.getByRole("dialog", { name: "Layout presets", exact: true })).toBeVisible()
  await page.getByRole("radio", { name: "workspace", exact: true }).check()
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("complementary", { name: "Flux right rail", exact: true }),
  ).toBeVisible()
  const draft = page.getByLabel("Flux local draft")
  await commands.focus()
  await page.keyboard.press("Control+l")
  await expect(draft).toBeFocused()
  await draft.fill("draft before composition")
  await draft.dispatchEvent("compositionstart")
  await draft.fill("draft 日本")
  await expect(draft).toHaveValue("draft 日本")
  await draft.dispatchEvent("keydown", { key: "k", ctrlKey: true, isComposing: true })
  await draft.dispatchEvent("keydown", { key: "k", ctrlKey: true, keyCode: 229 })
  await expect(palette).toBeHidden()
  await draft.dispatchEvent("compositionend")
  await page.keyboard.press("Control+k")
  await expect(palette).toBeHidden() // public editable-owner guard
  await page.keyboard.press("Escape")
  await commands.focus()
  await page.keyboard.press("Control+k")
  await expect(palette).toBeVisible()
})
test("native slash/reference/inspector controls inspect locally without losing the draft or stealing a newer owner", async ({
  page,
}) => {
  await page.goto(entry)
  const draft = page.getByLabel("Flux local draft")
  await draft.fill("/")
  await expect(page.getByRole("listbox")).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("listbox")).toBeHidden()
  await expect(draft).toBeFocused()
  await draft.fill("@src")
  await expect(page.getByRole("listbox")).toBeVisible()
  await page.keyboard.press("Enter")
  await expect(draft).toHaveValue(/src\/fixture.ts/)
  await draft.fill("local inert draft")
  await page.getByRole("button", { name: "Inspect send candidate", exact: true }).click()
  await expect(page.getByRole("dialog", { name: "Draft candidate", exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Close inspection", exact: true }).click()
  await expect(draft).toHaveValue("local inert draft")
  await expect(
    page.getByRole("button", { name: "Inspect send candidate", exact: true }),
  ).toBeFocused()
  await page.getByRole("button", { name: "Resume local preview", exact: true }).click()
  await expect(
    page.getByRole("status").filter({ hasText: "Thinking · static authored preview" }),
  ).toBeVisible()
  await page.getByRole("button", { name: "Stop local preview", exact: true }).click()
  await expect(draft).toHaveValue("local inert draft")
})
test("resource and welcome states withhold payloads, unknown opaque IDs never substitute a known session", async ({
  page,
}, info) => {
  for (const appearance of ["loading", "empty", "error", "denied", "unknown", "locked"]) {
    await page.goto(`${entry}&appearance=${appearance}`)
    const draft = page.getByLabel("Flux local draft")
    if (appearance === "empty") await expect(draft).toBeEnabled()
    else await expect(draft).toBeDisabled()
    if (appearance !== "locked")
      await expect(page.locator('[data-wire-kind="approval-card"]')).toHaveCount(0)
    await settle(page)
    await page.screenshot({ path: info.outputPath(`composed-${appearance}.png`) })
  }
  await page.goto(`${entry}&session=opaque%2Fabsent%3F4421`)
  await expect(
    page.getByText("Session unavailable: opaque/absent?4421. No transcript relation supplied."),
  ).toBeVisible()
  await expect(page.getByLabel("Flux local draft")).toBeDisabled()
  await page.goto(`${entry}&welcome=true`)
  await expect(page.getByRole("heading", { name: "Welcome to Flux" })).toBeVisible()
  await page.getByRole("button", { name: "Inspect supplied conversation", exact: true }).click()
  await expect(page.locator('[data-wire-kind="approval-card"]')).toHaveCount(1)
  await page.getByRole("button", { name: "Search chats", exact: true }).last().click()
  await page.getByLabel("Search chat fixtures").fill("telemetry")
  await page.getByRole("toolbar", { name: "Filtered local results" }).getByRole("button").click()
  await expect(page).toHaveURL(/session=CHAT-003/)
  await page.goBack()
  await expect(page).toHaveURL(/session=CHAT-001/)
})
test("once-working actions permanently retire across Activity, source, access, layout, layer and unmount; fresh controls still work", async ({
  page,
}) => {
  await page.goto(lifecycleEntry())
  async function capture() {
    await expect
      .poll(() =>
        page.evaluate(() => {
          const w = window as unknown as ProbeWindow
          const live = w.fluxChat.frames.findLast((frame) => frame.run(() => {}))
          if (!live) return false
          w.held = live
          w.writes = 0
          return live.run(() => w.writes++) && w.writes === 1
        }),
      )
      .toBe(true)
  }
  async function retired() {
    expect(
      await page.evaluate(() => {
        const w = window as unknown as ProbeWindow
        return {
          ran: w.held.run(() => w.writes++),
          inspected: w.held.inspect("Old candidate", {}),
          focus: w.held.focus() !== false,
          writes: w.writes,
        }
      }),
    ).toEqual({ ran: false, inspected: false, focus: false, writes: 1 })
  }
  await capture()
  await page.getByRole("button", { name: "Toggle composed Activity", exact: true }).click()
  await retired()
  await page.getByRole("button", { name: "Toggle composed Activity", exact: true }).click()
  await expect(page.getByLabel("Flux local draft")).toBeVisible()
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as unknown as ProbeWindow).fluxChat.frames.some((frame) => frame.run(() => {})),
      ),
    )
    .toBe(true)
  await retired()
  for (const name of [
    "Replace composed source",
    "Toggle composed access",
    "Toggle composed root",
  ]) {
    await capture()
    await page.getByRole("button", { name, exact: true }).click()
    await retired()
    if (name !== "Replace composed source")
      await page.getByRole("button", { name, exact: true }).click()
    await expect(page.getByLabel("Flux local draft")).toBeEnabled()
  }
  await capture()
  await page.getByRole("button", { name: "Command palette", exact: true }).click()
  await expect(page.getByLabel("Filter commands")).toBeFocused()
  await retired()
  await page.keyboard.press("Escape")
  await capture()
  await page.getByRole("button", { name: "Layout presets", exact: true }).click()
  await page.getByRole("radio", { name: "reading", exact: true }).check()
  await page.keyboard.press("Escape")
  await retired()
  await capture()
})
test("old focus handle yields to newer plain, dialog and menu foreground owners after normal inspection close", async ({
  page,
}) => {
  await page.goto(lifecycleEntry())
  const draft = page.getByLabel("Flux local draft")
  for (const kind of ["plain", "dialog", "menu"]) {
    await draft.fill("held draft")
    await page.getByRole("button", { name: "Inspect send candidate", exact: true }).click()
    const dialog = page.getByRole("dialog", { name: "Draft candidate", exact: true })
    await expect(dialog).toBeVisible()
    await page.getByRole("button", { name: "Close inspection", exact: true }).focus()
    await page.getByRole("button", { name: "Close inspection", exact: true }).click()
    await expect(dialog).toBeHidden()
    await expect(
      page.getByRole("button", { name: "Inspect send candidate", exact: true }),
    ).toBeFocused()
    // Capture a once-working committed focus-return handle after normal close.
    await expect
      .poll(() =>
        page.evaluate(() => {
          const w = window as unknown as ProbeWindow
          const frame = w.fluxChat.frames.findLast((candidate) => candidate.focus() !== false)
          if (!frame) return false
          w.held = frame
          return true
        }),
      )
      .toBe(true)
    if (kind === "plain") await page.locator("#foreground-owner").focus()
    else {
      await page.getByRole("button", { name: "Open newer foreground dialog", exact: true }).click()
      await expect(
        page.getByRole("dialog", { name: "Newer foreground dialog", exact: true }),
      ).toBeVisible()
      if (kind === "dialog") await page.getByLabel("Newer foreground input").focus()
      else {
        await page.getByRole("button", { name: "Newer foreground menu", exact: true }).click()
        await page.keyboard.press("ArrowDown")
        await expect(page.getByRole("menuitem", { name: "Newer menu item" })).toBeFocused()
      }
    }
    expect(await page.evaluate(() => (window as unknown as ProbeWindow).held.focus())).toBe(false)
    if (kind === "plain") await expect(page.locator("#foreground-owner")).toBeFocused()
    else if (kind === "dialog")
      await expect(page.getByLabel("Newer foreground input")).toBeFocused()
    else await expect(page.getByRole("menuitem", { name: "Newer menu item" })).toBeFocused()
    if (kind === "menu") await page.keyboard.press("Escape")
    if (kind !== "plain") await page.keyboard.press("Escape")
  }
})
test("palette executes admitted commands, header intents and narrow widgets/drawer persistence use one owner", async ({
  page,
}) => {
  await page.goto(entry)
  await page.getByRole("button", { name: "Command palette", exact: true }).click()
  await page.getByRole("button", { name: "Focus composer", exact: true }).click()
  await expect(page.getByLabel("Flux local draft")).toBeFocused()
  await page.getByRole("button", { name: "Command palette", exact: true }).click()
  await page.getByRole("button", { name: "Top drawer", exact: true }).last().click()
  await expect(page.getByTestId("drawer-body-top")).toBeVisible()
  const handle = page.getByRole("separator", { name: /Primary Drawer resize handle/ })
  await handle.focus()
  const before = await page.getByTestId("drawer-body-top").boundingBox()
  await page.keyboard.press("ArrowDown")
  const after = await page.getByTestId("drawer-body-top").boundingBox()
  expect(after?.height).toBeGreaterThan(before?.height ?? 0)
  await page.getByRole("tab", { name: /Reports/ }).click()
  await page.reload()
  await expect(page.getByRole("tab", { name: /Reports/ })).toHaveAttribute("aria-selected", "true")
  await page.getByRole("button", { name: "Open card in working drawer", exact: true }).click()
  await expect(page.getByTestId("drawer-body-bottom")).toBeVisible()
  await page.getByRole("button", { name: "Pin Info specimen", exact: true }).click()
  await expect(
    page.getByRole("button", { name: "Close tab Info specimen", exact: true }),
  ).toHaveCount(0)
  await page.getByRole("button", { name: "Unpin Info specimen", exact: true }).click()
  await page.getByRole("button", { name: "Close tab Info specimen", exact: true }).click()
  await expect(
    page.getByRole("button", { name: "Close tab Info specimen", exact: true }),
  ).toHaveCount(0)
  await page.getByRole("button", { name: "More session options", exact: true }).click()
  await page.getByRole("menuitem", { name: "Stop specimen", exact: true }).click()
  await expect(
    page.getByRole("dialog", { name: "Stop · local specimen", exact: true }),
  ).toBeVisible()
  await page.keyboard.press("Escape")
  await page.setViewportSize({ width: 390, height: 420 })
  await page.getByRole("button", { name: "Widgets", exact: true }).click()
  const aside = page.getByRole("dialog", { name: "Flux right rail", exact: true })
  await expect(aside).toBeVisible()
  await expect(page.getByTestId("flux-rail-panel")).toHaveCount(1)
  await page.getByRole("tab", { name: "Plan", exact: true }).click()
  await expect(page.getByTestId("flux-rail-panel")).toHaveAttribute("aria-label", "Plan")
  await page.getByRole("tab", { name: "Widgets", exact: true }).click()
  await page.getByRole("button", { name: "Inspect context", exact: true }).click()
  await expect(page.getByRole("dialog", { name: "context inspection", exact: true })).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(aside).toBeVisible()
  await expect(page.getByRole("button", { name: "Inspect context", exact: true })).toBeFocused()
  await page.keyboard.press("Escape")
  await expect(aside).toBeHidden()
  await expect(page.getByLabel("Flux local draft")).toBeVisible()
})
for (const mode of ["dark", "light"]) {
  test(`scoped composed ${mode} themes and popup leave document theme untouched`, async ({
    page,
  }, info) => {
    test.setTimeout(60000)
    await page.goto(entry)
    const documentTheme = await page.evaluate(() => ({
      theme: document.documentElement.getAttribute("data-theme"),
      mode: document.documentElement.getAttribute("data-mode"),
      style: document.documentElement.getAttribute("style"),
    }))
    await page.getByRole("button", { name: "Review fixture", exact: true }).click()
    const themes = await page
      .getByLabel("Composed theme")
      .locator("option")
      .evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value))
    await page.keyboard.press("Escape")
    for (const theme of themes) {
      await page.goto(`${entry}&theme=${theme}&mode=${mode}`)
      await expect(page.locator(".flux-composed-host")).toHaveAttribute("data-theme", theme)
      await expect(page.locator(".flux-composed-host")).toHaveAttribute("data-mode", mode)
      await expect(page.getByLabel("Flux local draft")).toBeEnabled()
      await settle(page)
      await page.screenshot({ path: info.outputPath(`theme-${theme}-${mode}.png`) })
      await page.getByRole("button", { name: "Command palette", exact: true }).click()
      const popup = page.getByRole("dialog", { name: "Command palette", exact: true })
      await expect(popup).toHaveAttribute("data-theme", theme)
      await expect(popup).toHaveAttribute("data-mode", mode)
      await expect(page.getByLabel("Filter commands")).toBeFocused()
      await settlePopup(popup)
      await page.screenshot({
        path: info.outputPath(`popup-${theme}-${mode}.png`),
        animations: "disabled",
      })
      await page.keyboard.press("Escape")
      await expect(popup).toBeHidden()
      if (theme === "nanite-default") {
        await page.setViewportSize({ width: 390, height: 420 })
        await page.getByRole("button", { name: "Widgets", exact: true }).click()
        const rail = page.getByRole("dialog", { name: "Flux right rail", exact: true })
        await expect(rail).toHaveAttribute("data-theme", theme)
        await expect(rail).toHaveAttribute("data-mode", mode)
        await settlePopup(rail)
        await page.screenshot({
          path: info.outputPath(`rail-${theme}-${mode}-390.png`),
          animations: "disabled",
        })
        await page.keyboard.press("Escape")
        await expect(rail).toBeHidden()
        await page.setViewportSize({ width: 1280, height: 900 })
      }
      expect(
        await page.evaluate(() => ({
          theme: document.documentElement.getAttribute("data-theme"),
          mode: document.documentElement.getAttribute("data-mode"),
          style: document.documentElement.getAttribute("style"),
        })),
      ).toEqual(documentTheme)
    }
  })
}
for (const width of [1280, 390]) {
  test(`settled ${width} composed card identities and four layout surfaces`, async ({
    page,
  }, info) => {
    test.setTimeout(60000)
    await page.setViewportSize({ width, height: 900 })
    await page.goto(entry)
    for (const type of identities) {
      const card = page.locator(`[data-wire-kind="${type}"]`)
      await card.scrollIntoViewIfNeeded()
      await expect(card).toBeVisible()
      await settle(page)
      await card.screenshot({ path: info.outputPath(`card-${type}-${width}.png`) })
    }
    for (const layout of ["focus", "default", "workspace", "reading"]) {
      await page.goto(`${entry}&layout=${layout}`)
      await expect(page.getByLabel("Flux local draft")).toBeVisible()
      await expect(page.locator(".chat-example")).toHaveCount(1)
      await settle(page)
      await page.screenshot({ path: info.outputPath(`layout-${layout}-${width}.png`) })
    }
  })
}
test("portable composed stories are API-free and keep the single editor boundary", async ({
  page,
}, info) => {
  test.setTimeout(60000)
  const base = new URL(String(info.project.use.baseURL))
  base.port = base.port === "18541" ? "18542" : "18952"
  for (const story of [
    "default",
    "workspace",
    "focus",
    "reading",
    "welcome",
    "loading",
    "empty",
    "unavailable",
    "denied",
    "locked",
    "partial",
  ]) {
    await page.goto(
      new URL(`/iframe.html?id=examples-flux-chat--${story}&viewMode=story`, base).href,
    )
    await expect(page.locator(".chat-example")).toHaveCount(1)
    await expect(page.getByLabel("Flux local draft")).toHaveCount(1)
    if (["loading", "unavailable", "denied", "locked"].includes(story))
      await expect(page.getByLabel("Flux local draft")).toBeDisabled()
    else await expect(page.getByLabel("Flux local draft")).toBeEnabled()
    if (story === "welcome")
      await expect(
        page.getByRole("button", { name: "Inspect supplied conversation", exact: true }),
      ).toBeVisible()
    await settle(page)
    await page.screenshot({ path: info.outputPath(`portable-${story}.png`) })
  }
})
