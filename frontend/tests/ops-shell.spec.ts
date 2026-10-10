import type { OperationsActionScope } from "@hollis-labs/kit-dashboard/layout"
import { expect, test } from "@playwright/test"
import { themes } from "../src/examples/ops-shell/model"
import type { OpsShellDiagnostics } from "../src/examples/ops-shell/OpsShellExample"

declare global {
  interface Window {
    opsShell: OpsShellDiagnostics
    heldOpsScope?: OperationsActionScope
    heldAside?: OpsShellDiagnostics["asideHandles"][number]
    heldDraft?: (value: string) => void
  }
}
const entry = "/?example=ops-shell"
const rows = "[data-ops-row-id]"
const list = '[data-ops-scroll="list"]'
test.use({ baseURL: `http://127.0.0.1:${process.env.OPS_SHELL_PORT ?? 18545}` })

test("one shell, independent list/transcript scroll, pinned composer and collapse", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 700 })
  const network: string[] = [],
    errors: string[] = []
  page.on("request", (r) => {
    if (/\/api\/|\/events|\/sse/.test(r.url())) network.push(r.url())
  })
  page.on("pageerror", (e) => errors.push(e.message))
  await page.goto(entry)
  await expect(page.locator('[data-slot="app-shell"]')).toHaveCount(1)
  await expect(page.locator(rows).first()).toBeVisible()
  const body = page.locator(list),
    aside = page.locator('[data-slot="app-shell-aside-body"]'),
    footer = page.locator('[data-slot="app-shell-aside-footer"]')
  const before = await footer.boundingBox()
  await body.evaluate((el) => {
    el.scrollTop = 200
  })
  expect(await body.evaluate((el) => el.scrollTop)).toBe(200)
  expect(await aside.evaluate((el) => el.scrollTop)).toBe(0)
  await aside.evaluate((el) => {
    el.scrollTop = 200
  })
  expect(await aside.evaluate((el) => el.scrollTop)).toBe(200)
  expect(await body.evaluate((el) => el.scrollTop)).toBe(200)
  expect((await footer.boundingBox())?.y).toBe(before?.y)
  await page.getByRole("button", { name: "Collapse assistant", exact: true }).click()
  await expect(page.locator('[data-slot="app-shell-aside"]')).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Toggle assistant" })).toBeFocused()
  await page.getByRole("button", { name: "Toggle assistant" }).click()
  await expect(page.locator('[data-slot="app-shell-aside"]')).toBeVisible()
  await page.reload()
  await expect(page.locator('[data-slot="app-shell-aside"]')).toBeVisible()
  expect(network).toEqual([])
  expect(errors).toEqual([])
})

test("pane slash, editable custody, synthetic IME and edited search during composition", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 700 })
  await page.goto(entry)
  const row = page.locator(rows).first(),
    search = page.getByRole("searchbox"),
    draft = page.getByRole("combobox", { name: "Assistant draft" })
  await row.focus()
  await page.keyboard.press("/")
  await expect(search).toBeFocused()
  await search.evaluate((el) =>
    el.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })),
  )
  await search.fill("workflow")
  await expect(search).toHaveValue("workflow")
  await search.evaluate((el) =>
    el.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true })),
  )
  await search.press("Escape")
  await expect(search).toHaveValue("")
  await expect(search).toBeFocused()
  await draft.fill("fixture")
  await draft.press("/")
  await draft.press("ArrowLeft")
  await draft.press("Shift+Enter")
  await expect(draft).toHaveValue("fixture\n/")
  await expect(search).not.toBeFocused()
  await row.focus()
  for (const options of [
    { isComposing: true },
    { keyCode: 229 },
    { ctrlKey: true },
    { altKey: true },
    { metaKey: true },
    { shiftKey: true },
  ]) {
    await row.evaluate(
      (el, props) =>
        el.dispatchEvent(new KeyboardEvent("keydown", { key: "/", bubbles: true, ...props })),
      options,
    )
    await expect(search).not.toBeFocused()
  }
  await row.evaluate((el) => {
    el.addEventListener("keydown", (event) => event.preventDefault(), { once: true })
    el.dispatchEvent(new KeyboardEvent("keydown", { key: "/", bubbles: true, cancelable: true }))
  })
  await expect(search).not.toBeFocused()
})

for (const mode of ["inline", "modal"] as const) {
  test(`${mode}: ordered inspector, editor/nested custody and admitted return`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 700 })
    await page.goto(`${entry}&inspector=${mode}`)
    const row = page.locator(rows).first()
    await row.focus()
    await row.press("Enter")
    const inspector =
      mode === "modal"
        ? page.getByRole("dialog").first()
        : page.getByRole("region", { name: "Record inspector" })
    await expect(inspector).toBeVisible()
    const initial = await inspector.innerText()
    await inspector.getByRole("button", { name: "Next", exact: true }).click()
    await expect(inspector).not.toHaveText(initial)
    const editor = inspector.getByRole("textbox", { name: "Local evidence note" })
    await editor.fill("/")
    await editor.press("ArrowRight")
    await expect(editor).toBeFocused()
    await inspector.getByRole("button", { name: "Open nested evidence" }).click()
    const nested = page.getByRole("dialog", { name: "Nested evidence" })
    await expect(nested).toBeVisible()
    await nested.getByRole("textbox", { name: "Nested evidence editor" }).fill("/")
    await page.keyboard.press("Escape")
    await expect(nested).toHaveCount(0)
    await expect(inspector).toBeVisible()
    const close =
      mode === "modal"
        ? inspector.getByRole("button", { name: "Close", exact: true })
        : inspector.getByRole("button", { name: "Back to list" })
    await close.click()
    await expect(inspector).toHaveCount(0)
    await expect(row).toBeFocused()
  })
}

test("reveal/selection reset, density preservation and sparse opaque IDs", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 700 })
  await page.goto(`${entry}&scenario=sparse`)
  await expect(page.locator('[data-ops-count="admitted"]')).toHaveText("80 admitted")
  await expect(page.locator(rows).first()).toHaveAttribute("data-ops-row-id", /specimen:\d+\/Ω/)
  const count = await page.locator(rows).count()
  expect(count).toBe(50)
  await page.getByRole("checkbox", { name: "Select all revealed rows" }).check()
  await expect(page.locator('[data-ops-count="selected"]')).toHaveText("50 selected")
  await page.getByRole("combobox", { name: "Row density" }).selectOption("comfortable")
  await expect(page.locator('[data-ops-count="selected"]')).toHaveText("50 selected")
  await page.getByRole("searchbox").fill("workflow")
  await expect(page.locator('[data-ops-count="selected"]')).toHaveText("0 selected")
  await page.getByRole("searchbox").fill("")
  await page.getByRole("button", { name: "Show more" }).focus()
  await page.keyboard.press("Enter")
  await expect(page.locator(rows)).toHaveCount(80)
})

for (const boundary of ["replace", "access", "layer", "remount"] as const) {
  test(`retained current-positive / ${boundary}-negative action and aside callbacks under StrictMode`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 700 })
    await page.goto(entry)
    await page.locator(rows).first().press("Enter")
    await page.getByRole("button", { name: "Inspect current evidence" }).click()
    expect(await page.evaluate(() => window.opsShell.actions.length)).toBe(1)
    await page.evaluate(() => {
      window.heldOpsScope = window.opsShell.scopes.at(-1)
      window.heldAside = window.opsShell.asideHandles.at(-1)
      window.heldDraft = window.opsShell.drafts.at(-1)
    })
    expect(
      await page.evaluate(() =>
        window.heldOpsScope?.run(() => window.opsShell.actions.push("positive")),
      ),
    ).toBe(true)
    await page.evaluate((key) => window.opsShell[key]?.(), boundary)
    expect(
      await page.evaluate(() =>
        window.heldOpsScope?.run(() => window.opsShell.actions.push("retired")),
      ),
    ).toBe(false)
    await page.evaluate(() => {
      window.heldDraft?.("retired draft")
      window.heldAside?.setWidth("wide")
      window.heldAside?.setCollapsed(true)
      window.heldAside?.setOverlayOpen(true)
    })
    await expect(page.locator('[data-slot="app-shell"]')).toHaveAttribute(
      "data-aside-width",
      "regular",
    )
    await expect(page.locator('[data-slot="app-shell-aside"]')).toBeVisible()
    await expect(page.getByRole("combobox", { name: "Assistant draft" })).toHaveValue("")
    expect(await page.evaluate(() => window.opsShell.actions)).toEqual([
      expect.any(String),
      "positive",
    ])
    if (boundary === "replace" || boundary === "remount") {
      await page.locator(rows).first().press("Enter")
      await page.getByRole("button", { name: "Inspect current evidence" }).click()
      expect(await page.evaluate(() => window.opsShell.actions.length)).toBe(3)
    }
  })
}

for (const height of [844, 420]) {
  test(`390x${height}: reachable list/detail and chat overlay, one composer`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 390, height })
    await page.goto(entry)
    await expect(page.locator(rows).first()).toBeVisible()
    expect((await page.locator(list).boundingBox())?.height).toBeGreaterThan(60)
    await page.locator(rows).first().click()
    const inspector = page.getByRole("region", { name: "Record inspector" })
    await expect(inspector).toBeVisible()
    await inspector.getByRole("button", { name: "Back to list" }).click()
    await page.getByRole("button", { name: "Open assistant", exact: true }).click()
    const dialog = page.getByRole("dialog", { name: "Assistant region" })
    await expect(dialog).toBeVisible()
    await expect(page.getByRole("combobox", { name: "Assistant draft" })).toHaveCount(1)
    const body = dialog.locator('[data-slot="overlay-sidebar-body"]'),
      footer = dialog.locator('[data-slot="overlay-sidebar-footer"]')
    await body.evaluate((el) => {
      el.scrollTop = el.scrollHeight
    })
    const box = await footer.boundingBox()
    expect(box).not.toBeNull()
    if (!box) throw new Error("Missing composer footer")
    expect(box.y + box.height).toBeLessThanOrEqual(height)
    await page.screenshot({ path: info.outputPath(`chat-${height}.png`) })
    await page.keyboard.press("Escape")
    await expect(dialog).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Open assistant", exact: true })).toBeFocused()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    await page.screenshot({ path: info.outputPath(`main-${height}.png`) })
  })
}

for (const scenario of [
  "empty",
  "loading",
  "error",
  "permission-denied",
  "unavailable",
  "missing-metadata",
]) {
  test(`${scenario}: evidence truth and portable fixture access`, async ({ page }) => {
    await page.goto(`${entry}&scenario=${scenario}`)
    if (scenario === "empty")
      await expect(page.locator('[data-ops-count="admitted"]')).toHaveText("0 admitted")
    else if (scenario === "missing-metadata")
      await expect(page.locator(rows).first()).toContainText("Unspecified")
    else {
      await expect(page.locator(rows)).toHaveCount(0)
      await expect(
        page.getByRole("status", { name: "" }).filter({ hasText: "Counts unavailable" }),
      ).toBeVisible()
    }
  })
}
for (const width of [1280, 390])
  for (const theme of themes)
    for (const mode of ["light", "dark"]) {
      test(`visible ${theme}/${mode} at ${width}`, async ({ page }, info) => {
        await page.setViewportSize({ width, height: 700 })
        await page.goto(`${entry}&theme=${theme}&mode=${mode}`)
        await expect(page.locator(rows).first()).toBeVisible()
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme)
        await expect(page.locator("html")).toHaveAttribute("data-mode", mode)
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
          width,
        )
        if (width === 390)
          await page.getByRole("button", { name: "Open assistant", exact: true }).click()
        await expect(page.getByRole("combobox", { name: "Assistant draft" })).toBeVisible()
        if (width === 390) {
          const popup = page.getByRole("dialog", { name: "Assistant region" })
          await expect
            .poll(() => popup.evaluate((node) => getComputedStyle(node).opacity))
            .toBe("1")
        }
        await page.screenshot({
          path: info.outputPath(`${theme}-${mode}-${width}.png`),
          animations: "disabled",
        })
      })
    }
test("portable Storybook story has no API dependency", async ({ page }) => {
  const requests: string[] = []
  page.on("request", (r) => {
    if (/\/api\/|\/events|\/sse/.test(r.url())) requests.push(r.url())
  })
  await page.goto(
    `http://127.0.0.1:${process.env.STORYBOOK_PORT ?? 18542}/iframe.html?id=templates-operations-shell--run-explorer-inline&viewMode=story`,
  )
  await expect(page.locator('[data-slot="app-shell"]')).toHaveCount(1)
  await expect(page.locator(rows).first()).toBeVisible()
  expect(requests).toEqual([])
})

test("keyboard cursor uses visible order and zero/missing receipts remain distinct", async ({
  page,
}) => {
  await page.goto(entry)
  const row = page.locator(rows).first(),
    second = page.locator(rows).nth(1)
  await row.focus()
  await row.press("ArrowDown")
  await expect(second).toBeFocused()
  await second.press("ArrowUp")
  await expect(row).toBeFocused()
  const usage = page.getByRole("button", { name: "Usage evidence, current: all" })
  await usage.click()
  await page.getByRole("button", { name: "Usage evidence, current: recorded" }).click()
  await expect(page.locator(rows)).toHaveCount(1)
  await expect(page.locator(rows).first()).toContainText("No receipt")
  await page.getByRole("button", { name: "Usage evidence, current: missing" }).click()
  await expect(page.locator(rows)).toHaveCount(1)
  await expect(page.locator(rows).first()).toContainText("0 recorded tokens")
})
test("duplicate identifiers reject admission and do not invent counts", async ({ page }) => {
  await page.goto(`${entry}&scenario=duplicate-id`)
  await expect(page.locator(rows)).toHaveCount(0)
  await expect(page.getByRole("alert")).toContainText("identifiers")
  await expect(page.locator('[data-ops-count-state="withheld"]')).toHaveText("Counts unavailable")
})
for (const storage of ["corrupt", "denied"]) {
  test(`${storage} preferences use bounded defaults`, async ({ page }) => {
    await page.addInitScript((kind) => {
      if (kind === "corrupt")
        localStorage.setItem("parallax-example:ops-shell:aside:v1", "not valid JSON")
      else
        Object.defineProperty(Storage.prototype, "getItem", {
          value() {
            throw new Error("Authored denied storage")
          },
        })
    }, storage)
    await page.goto(entry)
    await expect(page.locator('[data-slot="app-shell"]')).toHaveAttribute(
      "data-aside-width",
      "regular",
    )
    await expect(page.locator('[data-slot="app-shell-aside"]')).toBeVisible()
  })
}
test("resize retires temporary overlay and preserves one draft and desktop preference", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 700 })
  await page.goto(entry)
  await page.getByRole("combobox", { name: "Assistant draft" }).fill("local draft")
  await page.setViewportSize({ width: 390, height: 700 })
  await expect(page.getByRole("combobox", { name: "Assistant draft" })).toHaveCount(0)
  await page.getByRole("button", { name: "Open assistant", exact: true }).click()
  await expect(page.getByRole("combobox", { name: "Assistant draft" })).toHaveValue("local draft")
  await page.setViewportSize({ width: 1280, height: 700 })
  await expect(page.getByRole("dialog", { name: "Assistant region" })).toHaveCount(0)
  await expect(page.getByRole("combobox", { name: "Assistant draft" })).toHaveCount(1)
  await expect(page.getByRole("combobox", { name: "Assistant draft" })).toHaveValue("local draft")
  await expect(page.getByRole("button", { name: "Toggle assistant" })).toBeFocused()
})

for (const boundary of ["source", "access", "layer", "competing"] as const) {
  test(`same-commit controlled resize rejects ${boundary} return`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 700 })
    await page.goto(entry)
    await page.getByRole("button", { name: "Open assistant", exact: true }).click()
    await page.getByRole("combobox", { name: "Assistant draft" }).focus()
    await page.evaluate((kind) => window.opsShell.resizeBoundary?.(kind), boundary)
    await expect(page.getByRole("dialog", { name: "Assistant region" })).toHaveCount(0)
    await expect(
      page.getByRole("button", { name: "Toggle assistant", includeHidden: true }),
    ).not.toBeFocused()
    await expect(
      page.getByRole("heading", { name: "Operations shell", includeHidden: true }),
    ).not.toBeFocused()
    if (boundary === "competing") {
      const other = page.getByRole("dialog", { name: "Competing review layer" })
      await expect(other).toBeVisible()
      await expect(other.getByRole("textbox", { name: "Competing layer editor" })).toBeFocused()
    }
  })
}

test("focus outside the popup before native resize retains that admitted owner", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 700 })
  await page.goto(entry)
  await page.getByRole("button", { name: "Open assistant", exact: true }).click()
  await page.getByRole("combobox", { name: "Assistant draft" }).focus()
  await page.evaluate(() => window.opsShell.openCompeting?.())
  const editor = page.getByRole("textbox", { name: "Competing layer editor" })
  await expect(editor).toBeFocused()
  await page.setViewportSize({ width: 1280, height: 700 })
  await expect(page.getByRole("dialog", { name: "Assistant region" })).toHaveCount(0)
  await expect(editor).toBeFocused()
  await expect(
    page.getByRole("button", { name: "Toggle assistant", includeHidden: true }),
  ).not.toBeFocused()
})

test("ordinary explicit blur of a connected popup child relinquishes resize ownership", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 700 })
  await page.goto(entry)
  await page.getByRole("button", { name: "Open assistant", exact: true }).click()
  const draft = page.getByRole("combobox", { name: "Assistant draft" })
  await draft.focus()
  await draft.evaluate((node) => {
    node.blur()
    if (!node.isConnected) throw Error("Blur control must remain connected")
  })
  await expect(draft).not.toBeFocused()
  await page.setViewportSize({ width: 1280, height: 700 })
  await expect(page.getByRole("dialog", { name: "Assistant region" })).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Toggle assistant" })).not.toBeFocused()
})
