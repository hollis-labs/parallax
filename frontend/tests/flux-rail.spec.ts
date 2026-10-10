import { expect, test } from "@playwright/test"

const sourceBase = process.env.FLUX_RAIL_SOURCE_URL ?? "http://127.0.0.1:18545"
const themes = [
  "nanite-default",
  "dir-a",
  "dir-b",
  "dir-d",
  "dir-e",
  "dir-f",
  "sysop-p4-white",
  "sysop-green-phosphor",
  "sysop-amber-phosphor",
  "sysop-hi-contrast",
]
async function openRail(page: import("@playwright/test").Page) {
  if (await page.getByRole("button", { name: "Open Flux right rail", exact: true }).isVisible())
    await page.getByRole("button", { name: "Open Flux right rail", exact: true }).click()
}
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.clear())
})
test("rail is the public aside; tabs rove, plugin settings validate and collapses persist", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto("/?example=flux-rail")
  await expect(page.locator('[data-slot="app-shell-aside"]')).toBeVisible()
  await expect(page.getByRole("tab")).toHaveCount(5)
  const widgets = page.getByRole("tab", { name: "Widgets", exact: true })
  await widgets.focus()
  await page.keyboard.press("ArrowRight")
  await expect(page.getByRole("tab", { name: "Plan", exact: true })).toBeFocused()
  await expect(page.getByRole("tab", { name: "Plan", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  )
  await page.keyboard.press("End")
  await expect(page.getByRole("tab", { name: "Artifacts", exact: true })).toBeFocused()
  await page.keyboard.press("Home")
  await expect(widgets).toBeFocused()
  const agent = page.locator('[data-widget="agent"] button').first()
  await expect(agent).toHaveAttribute("aria-expanded", "true")
  await agent.click()
  await expect(agent).toHaveAttribute("aria-expanded", "false")
  await expect(page.locator('[data-widget="session"] button').first()).toHaveAttribute(
    "aria-expanded",
    "false",
  )
  await expect(page.locator('[data-widget="observability"] button').first()).toHaveAttribute(
    "aria-expanded",
    "false",
  )
  await page.getByRole("button", { name: "Rail settings", exact: true }).click()
  await page.getByLabel("Enable Plugin", { exact: true }).check()
  await page.getByRole("button", { name: "Move fixture-plugin up", exact: true }).click()
  await page.getByLabel("Default panel", { exact: true }).selectOption("fixture-plugin")
  await page.getByRole("button", { name: "Close inspection", exact: true }).click()
  await page.getByRole("tab", { name: "Plugin", exact: true }).click()
  await expect(page.getByText(/Render function pending/)).toBeVisible()
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("parallax-flux-rail-v1:fixture-session-1") ?? "{}"),
  )
  expect(stored.open.agent).toBe(false)
  expect(stored.enabled["fixture-plugin"]).toBe(true)
  // A second page in the same context preserves preferences without the init clear on reload.
  const restored = await page.context().newPage()
  await restored.goto("/?example=flux-rail")
  await expect(restored.getByRole("tab", { name: "Plugin", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  )
  await restored.getByRole("tab", { name: "Widgets", exact: true }).click()
  await expect(restored.locator('[data-widget="agent"] button').first()).toHaveAttribute(
    "aria-expanded",
    "false",
  )
  await restored.close()
  await page.getByLabel("Fixture session", { exact: true }).selectOption("fixture-session-2")
  await expect(page.getByRole("tab", { name: "Widgets", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  )
  await expect(page.locator('[data-widget="agent"] button').first()).toHaveAttribute(
    "aria-expanded",
    "true",
  )
})
test("unknown, partial and zero operands stay truthful; preferences reject payloads and malformed values", async ({
  page,
}) => {
  await page.goto("/?example=flux-rail&scenario=zero")
  await expect(page.getByRole("progressbar", { name: "Context window" })).toHaveAttribute(
    "value",
    "0",
  )
  await expect(page.locator('[data-widget="tokens"]')).toContainText("$0.00")
  await page.getByLabel("Evidence state", { exact: true }).selectOption("unknown")
  await expect(page.getByRole("progressbar")).toHaveCount(0)
  await expect(page.locator('[data-widget="tokens"]')).toContainText("Unknown")
  await expect(page.locator('[data-widget="tokens"]')).not.toContainText("$0.00")
  await page.getByLabel("Evidence state", { exact: true }).selectOption("partial")
  await expect(page.locator('[data-widget="context"]')).toContainText("Unknown / 32,000")
  await page.getByLabel("Evidence state", { exact: true }).selectOption("known-empty")
  await expect(page.locator('[data-widget="workers"]')).toContainText(
    "No active workers · known empty",
  )
  await page.goto(`${sourceBase}/?example=flux-rail`)
  const validated = await page.evaluate(async () => {
    const path = "/src/flux-rail/model.ts"
    const m = await import(path)
    return m.validatePreferences({
      enabled: { widgets: "false", work: false, stolen: true },
      order: ["inbox", "inbox", "stolen"],
      defaultPanel: "stolen",
      open: { agent: "false", session: true },
      customer: "never retain",
      draft: "never retain",
    })
  })
  expect(validated.enabled.widgets).toBe(true)
  expect(validated.enabled.work).toBe(false)
  expect(validated.order[0]).toBe("inbox")
  expect(new Set(validated.order).size).toBe(validated.order.length)
  expect(validated.open.agent).toBe(true)
  expect(validated.open.session).toBe(true)
  expect(validated.defaultPanel).toBe("widgets")
  expect(validated).not.toHaveProperty("customer")
  expect(validated).not.toHaveProperty("draft")
})
test("source panel_signal dismiss and user ownership remain local with no delivery", async ({
  page,
}) => {
  await page.goto("/?example=flux-rail")
  await page
    .getByRole("button", { name: "panel_signal open Plan · local specimen", exact: true })
    .click()
  await expect(page.getByRole("tab", { name: "Plan", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  )
  await page.getByRole("tab", { name: "Widgets", exact: true }).click()
  await page
    .getByRole("button", { name: "panel_signal open Plan · local specimen", exact: true })
    .click()
  await expect(page.getByRole("tab", { name: "Widgets", exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  )
  await page.getByRole("tab", { name: "Plan", exact: true }).click()
  await page
    .getByRole("button", { name: "panel_signal close Plan · local specimen", exact: true })
    .click()
  await expect(page.locator('[data-slot="app-shell-aside"]')).toBeVisible()
  await page.getByLabel("Work scope", { exact: true }).selectOption("project")
  await expect(page.getByText("Review candidate", { exact: false })).toBeVisible()
  await expect(page.getByText("Read fixture source", { exact: false })).toHaveCount(0)
  await page.getByRole("tab", { name: "Inbox", exact: true }).click()
  await page.getByRole("button", { name: /Fixture agent → You/ }).click()
  await page.getByRole("button", { name: "Reply preview", exact: true }).click()
  await page
    .getByRole("textbox", { name: "Local reply preview", exact: true })
    .fill("fictional draft")
  await expect(
    page.getByRole("button", { name: "Send · inert fixture", exact: true }),
  ).toBeDisabled()
  await page.getByRole("tab", { name: "Widgets", exact: true }).click()
  await page.getByRole("tab", { name: "Inbox", exact: true }).click()
  await expect(page.getByRole("textbox", { name: "Local reply preview", exact: true })).toHaveCount(
    0,
  )
  expect(await page.evaluate(() => Object.values(localStorage).join(" "))).not.toContain(
    "fictional draft",
  )
})
test("inspection admits focus return and nested menu/dialog own Escape before rail", async ({
  page,
}) => {
  await page.goto("/?example=flux-rail")
  const inspect = page.getByRole("button", { name: "Inspect context", exact: true })
  await inspect.click()
  const dialog = page.getByRole("dialog", { name: "Context inspection", exact: true })
  await expect(dialog).toBeVisible()
  await expect(page.getByRole("heading", { name: "Context inspection", exact: true })).toBeFocused()
  await page.keyboard.press("Control+/")
  await expect(page.locator('[data-slot="app-shell-aside"]')).toBeVisible()
  await page.getByRole("button", { name: "Usage breakdown", exact: true }).click()
  await expect(page.getByText("Fictional usage", { exact: true })).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(dialog).toBeVisible()
  await page.getByRole("button", { name: "Inspection menu", exact: true }).click()
  await expect(page.getByRole("menu")).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(dialog).toBeVisible()
  await expect(page.getByRole("button", { name: "Inspection menu", exact: true })).toBeFocused()
  await page.getByRole("button", { name: "Inspection menu", exact: true }).click()
  await page.getByRole("menuitem", { name: "Open nested source note", exact: true }).click()
  await expect(page.getByRole("dialog", { name: "Nested source note", exact: true })).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("dialog", { name: "Nested source note", exact: true }),
  ).not.toBeVisible()
  await expect(dialog).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(dialog).not.toBeVisible()
  await expect(inspect).toBeFocused()
  await inspect.click()
  // Disable the original return target while dialog owns custody; explicit heading fallback wins.
  await page
    .getByRole("button", { name: "Inspect context", exact: true, includeHidden: true })
    .evaluate((el) => {
      ;(el as HTMLButtonElement).disabled = true
    })
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("heading", { name: "Flux right rail candidate", exact: true }),
  ).toBeFocused()
})
test("current-positive and retained-negative actions across source, access, layer and effect retirement", async ({
  page,
}) => {
  await page.goto(`${sourceBase}/?example=flux-rail`)
  const save = async () =>
    page.evaluate(() => {
      const w = window as unknown as { fluxRail: { frames: unknown[] }; retained: unknown }
      w.retained = w.fluxRail.frames.at(-1)
    })
  const invoke = async () =>
    page.evaluate(() => {
      const w = window as unknown as {
        retained: {
          select: (id: string) => boolean
          collapse: (id: string, open: boolean) => boolean
          signal: (signal: object) => boolean
          shortcut: { trigger: (event: KeyboardEvent) => boolean }
        }
      }
      const f = w.retained
      return [
        f.select("work"),
        f.collapse("agent", false),
        f.signal({ action: "open", panel_id: "inbox" }),
        f.shortcut.trigger(new KeyboardEvent("keydown", { key: "/", ctrlKey: true })),
      ]
    })
  await save()
  await page.getByRole("button", { name: "Replace source", exact: true }).click()
  expect(await invoke()).toEqual([false, false, false, false])
  await save()
  await page.getByRole("checkbox", { name: "Access admitted", exact: true }).uncheck()
  expect(await invoke()).toEqual([false, false, false, false])
  await page.getByRole("checkbox", { name: "Access admitted", exact: true }).check()
  expect(await invoke()).toEqual([false, false, false, false])
  await save()
  await page.getByRole("checkbox", { name: "Layer active", exact: true }).uncheck()
  expect(await invoke()).toEqual([false, false, false, false])
  await page.getByRole("checkbox", { name: "Layer active", exact: true }).check()
  expect(await invoke()).toEqual([false, false, false, false])
  await save()
  expect((await invoke())[0]).toBe(true)
  const retirement = await page.evaluate(async () => {
    const path = "/tests/fixtures/rail-lifecycle.tsx"
    const h = await import(path)
    return h.exercise()
  })
  expect(retirement.positive).toBe(true)
  expect(retirement.hidden).toBe(false)
  expect(retirement.reactivated).toBe(false)
  expect(retirement.current).toBe(true)
  expect(retirement.unmounted).toBe(false)
})
test("exact modifiers, editable and IME guards suspend the current rail shortcut", async ({
  page,
}) => {
  await page.goto(`${sourceBase}/?example=flux-rail`)
  await page.getByRole("heading", { name: "Flux right rail candidate", exact: true }).focus()
  await page.keyboard.press("Control+Shift+/")
  await expect(page.locator('[data-slot="app-shell-aside"]')).toBeVisible()
  await page.getByLabel("Evidence state", { exact: true }).focus()
  await page.keyboard.press("Control+/")
  await expect(page.locator('[data-slot="app-shell-aside"]')).toBeVisible()
  await page.getByRole("heading", { name: "Flux right rail candidate", exact: true }).focus()
  await page.evaluate(() =>
    document.activeElement?.dispatchEvent(
      new KeyboardEvent("keydown", { key: "/", ctrlKey: true, isComposing: true, bubbles: true }),
    ),
  )
  await expect(page.locator('[data-slot="app-shell-aside"]')).toBeVisible()
  await page.keyboard.press("Control+/")
  await expect(page.locator('[data-slot="app-shell-aside"]')).not.toBeVisible()
})
for (const viewport of [
  { width: 1280, height: 800 },
  { width: 390, height: 420 },
]) {
  test(`all public theme/mode appearances bounded at ${viewport.width}x${viewport.height}, API-free`, async ({
    page,
  }, info) => {
    test.setTimeout(90000)
    const violations: string[] = [],
      errors: string[] = []
    await page.route("**/*", (route) => {
      const request = route.request()
      const url = new URL(request.url())
      if (
        !["127.0.0.1", "localhost"].includes(url.hostname) ||
        url.pathname.startsWith("/api") ||
        !["GET", "HEAD"].includes(request.method())
      ) {
        violations.push(request.url())
        return route.abort()
      }
      return route.continue()
    })
    page.on("pageerror", (e) => errors.push(e.message))
    await page.setViewportSize(viewport)
    for (const theme of themes)
      for (const mode of ["dark", "light"]) {
        await page.goto(`/?example=flux-rail&theme=${theme}&mode=${mode}&scenario=long-labels`)
        await openRail(page)
        await expect(page.getByRole("tab", { name: "Widgets", exact: true })).toBeVisible()
        await page.getByRole("button", { name: "Inspect context", exact: true }).click()
        const body = page.getByRole("region", { name: "Rail inspection body", exact: true })
        await expect(body).toBeVisible()
        const box = await body.boundingBox()
        expect(box?.height).toBeGreaterThan(20)
        expect(box?.y).toBeGreaterThanOrEqual(0)
        expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(viewport.height)
        await page.screenshot({
          path: info.outputPath(`${theme}-${mode}-inspect.png`),
          animations: "disabled",
        })
        await page.keyboard.press("Escape")
        await page.getByRole("tab", { name: "Widgets", exact: true }).click()
        const bounds = await page.evaluate(() => ({
          width: document.documentElement.scrollWidth,
          height: document.documentElement.scrollHeight,
          client: innerHeight,
        }))
        expect(bounds.width).toBeLessThanOrEqual(viewport.width)
        expect(bounds.height).toBeLessThanOrEqual(bounds.client)
        await page.screenshot({
          path: info.outputPath(`${theme}-${mode}-rail.png`),
          animations: "disabled",
        })
        if (viewport.width === 390) {
          await page.getByRole("button", { name: "Close rail", exact: true }).click()
          await expect(
            page.getByRole("button", { name: "Open Flux right rail", exact: true }),
          ).toBeFocused()
        }
      }
    expect(violations).toEqual([])
    expect(errors).toEqual([])
  })
}
test("Storybook uses the same candidate and known-empty operands", async ({ page }) => {
  await page.goto(
    `http://127.0.0.1:${process.env.STORYBOOK_PORT ?? "18542"}/iframe.html?id=candidates-flux-right-rail--known-empty&viewMode=story`,
  )
  await expect(
    page.getByRole("heading", { name: "Flux right rail candidate", exact: true }),
  ).toBeVisible()
  await expect(page.locator('[data-widget="workers"]')).toContainText(
    "No active workers · known empty",
  )
})

test("short desktop and narrow rail scroll, every panel, session details and disabled fallback", async ({
  page,
}, info) => {
  test.setTimeout(90000)
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 420 })
    await page.goto("/?example=flux-rail&scenario=long-labels")
    await openRail(page)
    await page.locator('[data-widget="session"] button').first().click()
    await page.getByRole("button", { name: "Session details", exact: true }).click()
    await expect(page.getByRole("dialog", { name: "Session details", exact: true })).toBeVisible()
    await expect(
      page.getByRole("region", { name: "Rail inspection body", exact: true }),
    ).toContainText("bounded-identity/")
    await expect(
      page.getByRole("button", { name: "Restart · inert fixture", exact: true }),
    ).toBeDisabled()
    await page.screenshot({
      path: info.outputPath(`session-${width}x420.png`),
      animations: "disabled",
    })
    await page.keyboard.press("Escape")
    await expect(page.getByRole("button", { name: "Session details", exact: true })).toBeFocused()
    await page.locator('[data-widget="observability"] button').first().click()
    await expect(page.locator('[data-widget="observability"]')).toContainText("Fictional sample")
    await page.locator('[data-widget="bookmarks"]').scrollIntoViewIfNeeded()
    await expect(page.locator('[data-widget="bookmarks"]')).toContainText("fictional context")
    await page.screenshot({
      path: info.outputPath(`widgets-bottom-${width}x420.png`),
      animations: "disabled",
    })
    await expect(page.getByRole("button", { name: "Rail settings", exact: true })).toBeVisible()
    for (const name of ["Plan", "Workflows", "Inbox", "Artifacts"]) {
      await page.getByRole("tab", { name, exact: true }).click()
      await expect(page.getByRole("tabpanel", { name, exact: true })).toBeVisible()
      await page.screenshot({
        path: info.outputPath(`${name}-${width}x420.png`),
        animations: "disabled",
      })
    }
    await page.getByRole("button", { name: "Rail settings", exact: true }).click()
    await page.getByLabel("Enable Plugin", { exact: true }).check()
    await page.getByRole("button", { name: "Close inspection", exact: true }).click()
    await page.getByRole("tab", { name: "Plugin", exact: true }).click()
    await expect(page.getByRole("tabpanel", { name: "Plugin", exact: true })).toContainText(
      "Render function pending",
    )
    await page.screenshot({
      path: info.outputPath(`Plugin-${width}x420.png`),
      animations: "disabled",
    })
    await page.getByRole("button", { name: "Rail settings", exact: true }).click()
    for (const name of ["Widgets", "Plan", "Workflows", "Inbox", "Artifacts", "Plugin"])
      await page.getByLabel(`Enable ${name}`, { exact: true }).uncheck()
    await page.getByRole("button", { name: "Close inspection", exact: true }).click()
    await expect(page.getByRole("tab")).toHaveCount(0)
    await expect(
      page.getByText("All panels disabled. Rail settings remain available.", { exact: true }),
    ).toBeVisible()
    await page.getByRole("button", { name: "Rail settings", exact: true }).click()
    await page.getByLabel("Enable Plan", { exact: true }).check()
    await page.getByRole("button", { name: "Close inspection", exact: true }).click()
    await expect(page.getByRole("tab", { name: "Plan", exact: true })).toHaveAttribute(
      "aria-selected",
      "true",
    )
    if (width === 390) {
      await page.getByRole("button", { name: "Close rail", exact: true }).click()
      await expect(
        page.getByRole("button", { name: "Open Flux right rail", exact: true }),
      ).toBeFocused()
    }
    await page.screenshot({
      path: info.outputPath(`short-final-${width}.png`),
      animations: "disabled",
    })
    const bounds = await page.evaluate(() => ({
      w: document.documentElement.scrollWidth,
      h: document.documentElement.scrollHeight,
    }))
    expect(bounds.w).toBeLessThanOrEqual(width)
    expect(bounds.h).toBeLessThanOrEqual(420)
  }
})

test("captured final focus and roving callbacks retire", async ({ page }) => {
  await page.goto(`${sourceBase}/?example=flux-rail`)
  await page.getByRole("button", { name: "Inspect context", exact: true }).click()
  await page.getByRole("button", { name: "Close inspection", exact: true }).click()
  const before = await page.evaluate(() => {
    const w = window as unknown as {
      fluxRail: { frames: { finalFocus: () => HTMLElement | false }[] }
      heldFinal: () => HTMLElement | false
    }
    const frame = w.fluxRail.frames.at(-1)
    if (!frame) throw new Error("Missing committed focus frame")
    w.heldFinal = frame.finalFocus
    return w.heldFinal() !== false
  })
  expect(before).toBe(true)
  const foregroundRefusal = await page.evaluate(() => {
    document.querySelector<HTMLSelectElement>("select")?.focus()
    return (window as unknown as { heldFinal: () => HTMLElement | false }).heldFinal() === false
  })
  expect(foregroundRefusal).toBe(true)
  await page.getByRole("button", { name: "Replace source", exact: true }).click()
  await expect(page.getByRole("dialog")).toHaveCount(0)
  const replaced = await page.evaluate(
    () => (window as unknown as { heldFinal: () => HTMLElement | false }).heldFinal() !== false,
  )
  const lifecycle = await page.evaluate(async () => {
    const path = "/tests/fixtures/rail-lifecycle.tsx"
    return (await import(path)).focusExercise()
  })
  console.log(JSON.stringify({ replaced, ...lifecycle }))
  expect({ replaced, ...lifecycle }).toEqual({
    replaced: false,
    positiveFocus: true,
    hiddenFocus: false,
    reactivatedFocus: false,
    freshFocus: true,
    positiveRove: true,
    beforeHideLive: true,
    staleRove: false,
    freshRove: true,
  })
})
