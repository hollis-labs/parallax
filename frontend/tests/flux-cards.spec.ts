import { readFileSync } from "node:fs"
import { getBuiltinTheme } from "@hollis-labs/design-tokens"
import { expect, type Page, test } from "@playwright/test"

const identities: string[] = JSON.parse(
  readFileSync(new URL("../src/examples/flux-cards/operands.json", import.meta.url), "utf8"),
).envelopes.map((entry: { type: string }) => entry.type)

const entry = "/?example=flux-cards"
async function paletteColor(page: Page, value: string | undefined) {
  if (!value) throw new Error("Palette token unavailable")
  // Compare actual browser colors across equivalent minified hex/rgb forms.
  return page.evaluate((color) => {
    if (!CSS.supports("color", color)) throw new Error("Invalid palette color")
    const probe = document.createElement("span")
    probe.style.color = color
    document.body.append(probe)
    const canonical = getComputedStyle(probe).color
    probe.remove()
    return canonical
  }, value)
}
function lifecycleEntry() {
  const base = new URL(String(test.info().project.use.baseURL))
  // This isolated development HTML is served by the configured Vite listener.
  if (base.port === "18541") base.port = "18545"
  return new URL("/flux-cards-lifecycle.html", base).href
}
test.beforeEach(async ({ page }) => {
  await page.route("**/*", async (route) => {
    const url = new URL(route.request().url())
    if (url.hostname !== "127.0.0.1" || route.request().method() !== "GET") return route.abort()
    return route.continue()
  })
})
test("all manifest card identities preserve complete, missing, empty and long operands", async ({
  page,
}, info) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto(entry)
  test.setTimeout(120000)
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 420 : 900 })
    for (const type of identities) {
      await page.getByLabel("Envelope identity").selectOption(type)
      for (const state of ["complete", "partial", "empty", "long"]) {
        await page.getByLabel("Card state", { exact: true }).selectOption(state)
        await expect(page.getByRole("region", { name: "Flux candidate transcript" })).toBeVisible()
        await expect(page.locator('[data-slot="chat-stream-item"]')).toHaveCount(2)
        if (type === "session-task")
          await expect(page.getByText("No visual binding", { exact: true })).toBeVisible()
        if (type === "progress-card" && state === "partial")
          await expect(
            page.getByText("Progress unavailable; no percentage inferred."),
          ).toBeVisible()
        if (type === "metric-card" && state === "partial")
          await expect(page.getByText("Unavailable", { exact: true })).toBeVisible()
        await page
          .getByRole("region", { name: "Flux candidate transcript" })
          .evaluate((node) => node.scrollIntoView({ block: "start" }))
        const bounds = await page
          .getByRole("region", { name: "Flux candidate transcript" })
          .boundingBox()
        expect(bounds?.y).toBeGreaterThanOrEqual(0)
        expect(bounds?.y).toBeLessThan(width === 390 ? 420 : 900)
        for (const button of await page
          .getByRole("region", { name: "Flux candidate transcript" })
          .getByRole("button")
          .all()) {
          const action = await button.boundingBox()
          if (action) {
            expect(action.x).toBeGreaterThanOrEqual(0)
            expect(action.x + action.width).toBeLessThanOrEqual(width)
          }
        }
        await page.screenshot({
          path: info.outputPath(`${type}-${state}-${width}.png`),
          fullPage: true,
        })
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
          width,
        )
      }
    }
  }
  expect(errors).toEqual([])
  await page.screenshot({ path: info.outputPath("all-card-states-desktop.png"), fullPage: true })
})
test("approval flavors risk and receipt controls never commit decisions; loop reasons remain distinct", async ({
  page,
}) => {
  await page.goto(entry)
  for (const type of ["approval-card", "subagent-spawn-approval"]) {
    await page.getByLabel("Envelope identity").selectOption(type)
    for (const risk of ["low", "medium", "high"]) {
      await page.getByLabel("Approval risk").selectOption(risk)
      await expect(page.getByText(`${risk} risk`, { exact: true })).toBeVisible()
      await page.getByRole("button", { name: "Inspect approve candidate", exact: true }).click()
      await expect(page.getByRole("dialog")).toContainText("Nothing sent, approved")
      await page.keyboard.press("Escape")
      await expect(page.getByText(/Supplied decision: pending/)).toBeVisible()
      for (const state of ["approved", "rejected", "handling", "failed", "future-resolution"]) {
        await page.getByLabel("Card state", { exact: true }).selectOption(state)
        await expect(page.getByText(`Supplied decision: ${state}.`, { exact: false })).toBeVisible()
        await expect(
          page.getByRole("button", { name: "Inspect approve candidate", exact: true }),
        ).toHaveCount(0)
      }
      await page.getByLabel("Card state", { exact: true }).selectOption("complete")
    }
  }
  await page.getByLabel("Envelope identity").selectOption("chat-loop-terminated")
  for (const code of [
    "max_turns",
    "hard_ceiling",
    "runaway_tool_failures",
    "idle_timeout",
    "retry_budget_exhausted",
  ]) {
    await page.getByLabel("Loop code").selectOption(code)
    await expect(page.getByText("Loop terminated", { exact: true })).toBeVisible()
    await expect(
      page.getByRole("button", { name: "Inspect continue candidate", exact: true }),
    ).toHaveCount(code === "max_turns" ? 1 : 0)
  }
})
test("native slash and reference menus own focus, IME, insertion and editable busy draft", async ({
  page,
}, info) => {
  await page.goto(entry)
  const input = page.getByRole("combobox", { name: "Flux local draft", exact: true })
  await input.fill("/rev")
  await expect(page.getByRole("option", { name: /\/review/ })).toBeVisible()
  await expect(input).toBeFocused()
  await input.evaluate((node) =>
    node.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true, isComposing: true }),
    ),
  )
  await input.evaluate((node) =>
    node.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, keyCode: 229 })),
  )
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await input.press("Enter")
  await expect(
    page.getByRole("dialog", { name: "Slash command candidate", exact: true }),
  ).toBeVisible()
  await expect
    .poll(() =>
      page
        .getByRole("dialog", { name: "Slash command candidate", exact: true })
        .evaluate((node) => node.contains(document.activeElement)),
    )
    .toBe(true)
  await page.keyboard.press("Escape")
  await expect(input).toBeFocused()
  await input.fill("prefix @rev suffix")
  await input.evaluate((node: HTMLTextAreaElement) => {
    node.setSelectionRange(11, 11)
    node.click()
  })
  await input.press("Enter")
  await expect(input).toHaveValue("prefix @notes/review.md  suffix")
  await page.getByRole("button", { name: "Start busy preview", exact: true }).click()
  await input.fill("busy IME draft")
  await input.press("Enter")
  await expect(input).toHaveValue("busy IME draft")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.getByRole("button", { name: "Stop local preview", exact: true }).click()
  await input.fill("/nomatch")
  await expect(page.getByText("No matching local commands", { exact: true })).toBeVisible()
  await input.press("Escape")
  await expect(input).toBeFocused()
  await expect(input).toHaveAttribute("aria-expanded", "false")
  await input.fill("@notes")
  await page.screenshot({ path: info.outputPath("native-reference-menu.png") })
})
test("elicitation boolean/string/timeout and proposal drafts are finite local candidates", async ({
  page,
}) => {
  await page.goto(entry)
  await page.getByLabel("Envelope identity").selectOption("elicitation-prompt")
  await page.getByRole("button", { name: "Inspect accept candidate", exact: true }).click()
  await expect(page.getByRole("dialog")).toContainText("elicitation_id")
  await page.keyboard.press("Escape")
  await page.getByLabel("Card state", { exact: true }).selectOption("string")
  await page
    .getByRole("textbox", { name: "Local elicitation answer", exact: true })
    .fill("fictional answer")
  await page.getByRole("button", { name: "Inspect answer candidate", exact: true }).click()
  await expect(page.getByRole("dialog")).toContainText("fictional answer")
  await page.keyboard.press("Escape")
  await page.getByLabel("Card state", { exact: true }).selectOption("expired")
  await expect(page.getByText("Supplied expired", { exact: true })).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Inspect accept candidate", exact: true }),
  ).toHaveCount(0)
  await page.getByLabel("Envelope identity").selectOption("proposal-card")
  await page.getByLabel("Card state", { exact: true }).selectOption("complete")
  await page.getByRole("textbox", { name: "Title", exact: true }).fill("local edited title")
  await page.getByRole("button", { name: "Inspect apply candidate", exact: true }).click()
  await expect(page.getByRole("dialog")).toContainText("local edited title")
  await page.keyboard.press("Escape")
  await expect(page.getByText("Supplied pending", { exact: true })).toBeVisible()
})
test("source/access retirement rejects captured callbacks and restores modal origin focus", async ({
  page,
}) => {
  await page.goto(entry)
  const approve = page.getByRole("button", { name: "Inspect approve candidate", exact: true })
  await approve.evaluate((node) => {
    const key = Object.keys(node).find((name) => name.startsWith("__reactProps$"))!
    ;(window as any).retiredApprove = (node as any)[key].onClick
  })
  await page.getByRole("button", { name: "Replace fixture source", exact: true }).click()
  await page.evaluate(() => (window as any).retiredApprove())
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.getByRole("button", { name: "Inspect approve candidate", exact: true }).click()
  await page.keyboard.press("Escape")
  await expect(
    page.getByRole("button", { name: "Inspect approve candidate", exact: true }),
  ).toBeFocused()
  for (const access of ["loading", "unavailable", "denied", "locked", "unknown"]) {
    await page.getByLabel("Fixture access").selectOption(access)
    await expect(
      page.getByRole("combobox", { name: "Flux local draft", exact: true }),
    ).toBeDisabled()
    await page.evaluate(() => (window as any).retiredApprove())
    await expect(page.getByRole("dialog")).toHaveCount(0)
  }
})
test("all tool modes and actual theme palettes remain readable at 1280 and 390 with 420 height", async ({
  page,
}, info) => {
  await page.goto(entry)
  for (const mode of ["indicator", "minimal", "compact", "full"]) {
    await page.getByLabel("Tool display mode").selectOption(mode)
    if (mode === "indicator") await page.getByRole("button", { name: /Using 3 tools/ }).click()
    for (const status of ["running", "done", "error"])
      await expect(page.getByText(`fixture_read · ${status}`, { exact: true })).toBeVisible()
  }
  const themes = await page
    .getByLabel("Flux theme")
    .locator("option")
    .evaluateAll((nodes) => nodes.map((node) => (node as HTMLOptionElement).value))
  for (const theme of themes)
    for (const mode of ["light", "dark"]) {
      await page.getByLabel("Flux theme").selectOption(theme)
      await page.getByLabel("Flux palette").selectOption(mode)
      expect(await page.locator("html").getAttribute("data-theme")).toBe(theme)
      expect(await page.locator("html").getAttribute("data-mode")).toBe(mode)
      const paint = await page.locator(".flux-cards-gallery").evaluate((node) => ({
        bg: getComputedStyle(node).backgroundColor,
        fg: getComputedStyle(node).color,
      }))
      expect(paint.bg).not.toBe(paint.fg)
      const values = getBuiltinTheme(theme)?.tokens[mode as "light" | "dark"]
      if (!values) throw Error("Built-in palette unavailable")
      expect(
        await paletteColor(
          page,
          await page
            .locator("html")
            .evaluate((node) => getComputedStyle(node).getPropertyValue("--hl-bg").trim()),
        ),
      ).toBe(await paletteColor(page, values.bg))
      expect(paint.bg).toBe(await paletteColor(page, values.bg))
      const composerMode = theme === "nanite-default" ? "dark" : mode
      const expectedComposer = getBuiltinTheme(theme)?.tokens[composerMode as "light" | "dark"]
      expect(
        await paletteColor(
          page,
          await page
            .locator(".flux-composer-scope")
            .evaluate((node) => getComputedStyle(node).getPropertyValue("--hl-bg-elevated").trim()),
        ),
      ).toBe(await paletteColor(page, expectedComposer?.["bg-elevated"]))
      await page.screenshot({
        path: info.outputPath(`palette-${theme}-${mode}-1280.png`),
        fullPage: true,
      })
    }
  await page.setViewportSize({ width: 390, height: 420 })
  await page.getByLabel("Card state", { exact: true }).selectOption("long")
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  await page.screenshot({ path: info.outputPath("narrow-420-long.png"), fullPage: true })
  await page.getByRole("combobox", { name: "Flux local draft", exact: true }).fill("@")
  await page.screenshot({ path: info.outputPath("narrow-420-menu.png"), fullPage: true })
})

test("table action original-index candidates, unaddressed controls and nested popover custody", async ({
  page,
}) => {
  await page.goto(entry)
  await page.getByLabel("Envelope identity").selectOption("table-card")
  await page.getByLabel("Card state", { exact: true }).selectOption("actions")
  await page.getByRole("button", { name: /Name/ }).click()
  await page
    .getByRole("button", { name: "Inspect Review row candidate", exact: true })
    .nth(1)
    .click()
  await expect(page.getByRole("dialog")).toContainText('"row_index"')
  await expect(page.getByRole("dialog")).toContainText("1")
  await page.getByRole("button", { name: "Inspect nested local detail", exact: true }).click()
  await expect(page.getByText("Nested local inspection only.", { exact: true })).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(page.getByText("Nested local inspection only.", { exact: true })).toHaveCount(0)
  await expect(page.getByRole("dialog")).toHaveCount(1)
  await page.keyboard.press("Escape")
  await page.getByLabel("Envelope identity").selectOption("approval-card")
  await page.getByLabel("Card state", { exact: true }).selectOption("unaddressed")
  await expect(
    page.getByRole("button", { name: "Inspect approve candidate", exact: true }),
  ).toBeDisabled()
  await page.getByLabel("Envelope identity").selectOption("list-card")
  await page.getByLabel("Card state", { exact: true }).selectOption("data-source")
  await expect(
    page.getByText("Items unavailable; no successful empty list inferred."),
  ).toBeVisible()
})

test("captured send and recovery effect callbacks retire with source while positive controls still work", async ({
  page,
}) => {
  await page.goto(entry)
  await page
    .getByRole("combobox", { name: "Flux local draft", exact: true })
    .fill("local current draft")
  for (const [name, key] of [
    ["Inspect send candidate", "oldSend"],
    ["Inspect cancel retry candidate", "oldRetry"],
  ]) {
    await page.getByRole("button", { name, exact: true }).evaluate((node, key) => {
      const propsKey = Object.keys(node).find((name) => name.startsWith("__reactProps$"))
      if (!propsKey) throw Error("React props missing")
      ;(window as any)[key] = (node as any)[propsKey].onClick
    }, key)
  }
  await page.getByRole("button", { name: "Inspect send candidate", exact: true }).click()
  await expect(page.getByRole("dialog", { name: "Draft candidate", exact: true })).toContainText(
    "local current draft",
  )
  await page.keyboard.press("Escape")
  await page.getByRole("button", { name: "Replace fixture source", exact: true }).click()
  await page.evaluate(() => {
    ;(window as any).oldSend()
    ;(window as any).oldRetry()
  })
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.getByRole("button", { name: "Inspect cancel retry candidate", exact: true }).click()
  await expect(
    page.getByRole("dialog", { name: "Cancel retry candidate", exact: true }),
  ).toContainText("fixture-recovery-17")
})

test("same-identity Activity replay retires once-working callbacks permanently", async ({
  page,
}) => {
  await page.goto(lifecycleEntry())
  const approve = page.getByRole("button", { name: "Inspect approve candidate", exact: true })
  await approve.evaluate((node) => {
    const key = Object.keys(node).find((name) => name.startsWith("__reactProps$"))!
    ;(window as any).activityApprove = (node as any)[key].onClick
  })
  await page.evaluate(() => (window as any).activityApprove())
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await page.getByRole("button", { name: "Toggle candidate activity" }).click()
  await page.getByRole("button", { name: "Toggle candidate activity" }).click()
  await page.evaluate(() => (window as any).activityApprove())
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await approve.click()
  await expect(page.getByRole("dialog")).toBeVisible()
})

test("queued return yields to replacement activation, layer and foreground focus", async ({
  page,
}) => {
  for (const boundary of ["source", "access", "layer", "foreground", "activity"]) {
    await page.goto(lifecycleEntry())
    const approve = page.getByRole("button", { name: "Inspect approve candidate", exact: true })
    await approve.click()
    await page
      .getByRole("button", { name: "Close candidate inspection", exact: true })
      .evaluate((node) => {
        const key = Object.keys(node).find((name) => name.startsWith("__reactProps$"))!
        const win = window as any
        win.retainedClose = (node as any)[key].onClick
        const original = window.requestAnimationFrame
        const frames: FrameRequestCallback[] = []
        window.requestAnimationFrame = (callback) => {
          frames.push(callback)
          return 1
        }
        win.retainedClose()
        window.requestAnimationFrame = original
        win.returnFrame = frames.find((callback) => callback.toString().includes("competingFocus"))
        if (!win.returnFrame) throw new Error("author return frame not captured")
      })
    await expect(page.getByRole("dialog")).toHaveCount(0)
    if (boundary === "source")
      await page.getByRole("button", { name: "Replace fixture source", exact: true }).click()
    if (boundary === "access") await page.getByLabel("Fixture access").selectOption("denied")
    if (boundary === "activity") {
      await page.getByRole("button", { name: "Toggle candidate activity" }).click()
      await page.getByRole("button", { name: "Toggle candidate activity" }).click()
    }
    if (boundary === "layer") {
      await approve.click()
      await page.evaluate(() => (window as any).retainedClose())
      await expect(page.getByRole("dialog")).toBeVisible()
      await page.evaluate(() => {
        ;(window as any).layerFocus = document.activeElement
      })
      await page.evaluate(() => (window as any).returnFrame(performance.now()))
      await expect(page.getByRole("dialog")).toBeVisible()
      expect(await page.evaluate(() => document.activeElement === (window as any).layerFocus)).toBe(
        true,
      )
      expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(
        true,
      )
    } else {
      await page.getByRole("button", { name: "New foreground owner" }).focus()
      await page.evaluate(() => (window as any).returnFrame(performance.now()))
      await expect(page.getByRole("button", { name: "New foreground owner" })).toBeFocused()
    }
    if (boundary === "access") await page.getByLabel("Fixture access").selectOption("ready")
    if (boundary === "layer") await page.keyboard.press("Escape")
    await approve.click()
    await expect(page.getByRole("dialog")).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(approve).toBeFocused()
  }
})

test("queued own return yields to actual outside native dialog and menu owners", async ({
  page,
}) => {
  for (const owner of ["dialog", "menu"]) {
    await page.goto(lifecycleEntry())
    await page.getByRole("button", { name: "Open outside native dialog", exact: true }).click()
    await expect(
      page.getByRole("dialog", { name: "Outside native dialog", exact: true }),
    ).toBeVisible()
    await page
      .getByRole("button", { name: "Inspect approve candidate", exact: true })
      .evaluate((node) => {
        const key = Object.keys(node).find((name) => name.startsWith("__reactProps$"))!
        ;(node as any)[key].onClick()
      })
    await page
      .getByRole("button", { name: "Close candidate inspection", exact: true })
      .evaluate((node) => {
        const win = window as any
        const key = Object.keys(node).find((name) => name.startsWith("__reactProps$"))!
        const original = window.requestAnimationFrame
        const frames: FrameRequestCallback[] = []
        window.requestAnimationFrame = (callback) => {
          frames.push(callback)
          return 1
        }
        ;(node as any)[key].onClick()
        window.requestAnimationFrame = original
        win.outsideReturn = frames.find((callback) =>
          callback.toString().includes("competingFocus"),
        )
        if (!win.outsideReturn) throw new Error("author return frame not captured")
      })
    await expect(page.getByRole("dialog", { name: "Approval candidate", exact: true })).toHaveCount(
      0,
    )
    if (owner === "dialog")
      await page.getByRole("textbox", { name: "Outside foreground draft", exact: true }).focus()
    else {
      await page.getByRole("button", { name: "Open outside native menu", exact: true }).click()
      await page
        .getByRole("menuitem", { name: "Outside foreground menu item", exact: true })
        .focus()
    }
    await page.evaluate(() => {
      ;(window as any).outsideFocused = document.activeElement
      ;(window as any).outsideReturn(performance.now())
    })
    expect(
      await page.evaluate(() => document.activeElement === (window as any).outsideFocused),
    ).toBe(true)
    if (owner === "dialog")
      await expect(
        page.getByRole("textbox", { name: "Outside foreground draft", exact: true }),
      ).toBeFocused()
    else
      await expect(
        page.getByRole("menuitem", { name: "Outside foreground menu item", exact: true }),
      ).toBeFocused()
  }
})
