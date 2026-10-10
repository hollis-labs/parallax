import type { Page } from "@playwright/test"
import { expect, test } from "@playwright/test"
import type { CompositionFrame } from "../src/examples/flux-settings/composition/Composition"

declare global {
  interface Window {
    retainedComposition?: CompositionFrame
    retainedForm?: NonNullable<CompositionFrame["form"]>
    retainedReorder?: NonNullable<CompositionFrame["reorder"]>
    retainedCapture?: NonNullable<CompositionFrame["capture"]>
    retainedFocus?: () => boolean
  }
}
async function settled(page: Page) {
  await expect.poll(() => page.evaluate(() => !!window.fluxSettingsComposition?.live())).toBe(true)
}
async function open(page: Page, section = "profile", query = "") {
  await page.goto(`/?example=flux-settings${query}#${section}`)
  await settled(page)
  await page.getByText("Fixture review controls", { exact: true }).click()
}

test.beforeEach(async ({ page, baseURL }) => {
  await page.route("**/*", (route) => {
    const url = new URL(route.request().url())
    return url.origin === new URL(baseURL ?? "http://127.0.0.1:18975").origin &&
      ["GET", "HEAD"].includes(route.request().method()) &&
      !url.pathname.startsWith("/api")
      ? route.continue()
      : route.abort()
  })
})
test("representative navigation, hash reload/back-forward and developer gating", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (e) => errors.push(e.message))
  await open(page, "providers")
  const nav = page.getByRole("navigation", { name: "Grouped Flux settings navigation" })
  await nav.getByRole("link", { name: "Agents", exact: true }).click()
  await expect(page.getByRole("heading", { name: "Agents", exact: true }).first()).toBeVisible()
  await page.reload()
  await settled(page)
  await expect(page).toHaveURL(/#agents$/)
  await page.goBack()
  await expect(page).toHaveURL(/#providers$/)
  await expect(page.getByRole("heading", { name: "Providers", exact: true }).first()).toBeVisible()
  await page.goForward()
  await expect(page).toHaveURL(/#agents$/)
  await nav.getByRole("link", { name: "Profile", exact: true }).focus()
  await page.keyboard.press("ArrowDown")
  await expect(page).toHaveURL(/#preferences$/)
  await expect(nav.getByRole("link", { name: "Inspector", exact: true })).toHaveCount(0)
  await page.getByLabel("Developer mode (local)").check()
  await nav.getByRole("link", { name: "Inspector", exact: true }).click()
  await expect(page.locator("main pre")).toContainText('"seed": 4421')
  await page.getByLabel("Developer mode (local)").uncheck()
  await expect(page).toHaveURL(/#profile$/)
  expect(errors).toEqual([])
})
test("scalar draft save/cancel and public presentation modes retain source custody", async ({
  page,
}) => {
  await open(page)
  await page.getByLabel("Display Name", { exact: true }).fill("Local reviewer")
  await expect(page.getByText("Unsaved local draft", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Cancel draft", exact: true }).click()
  await expect(page.getByLabel("Display Name", { exact: true })).toHaveValue("Morgan Fixture")
  await page.getByLabel("Display Name", { exact: true }).fill("Fixture writer")
  await page.getByRole("button", { name: "Save fixture", exact: true }).click()
  await expect(page.getByText("Saved to this local fixture only.", { exact: true })).toBeVisible()
  await page.getByLabel("Field presentation").selectOption("provenance")
  await expect(page.locator("main")).toContainText("Local fixture specimen")
  await page.getByLabel("Field presentation").selectOption("grouped")
  await expect(page.getByLabel("Display Name", { exact: true })).toHaveValue("Fixture writer")
  await page.getByLabel("Field presentation").selectOption("wizard")
  await expect(
    page.getByText(
      "Submit setup inspects a local plan; it does not install or configure a service.",
    ),
  ).toBeVisible()
})
test("provider fallback supports keyboard and pointer drag plus malformed persistence", async ({
  page,
}) => {
  await open(page, "preferences")
  const move = page.getByRole("button", { name: "Move Local Studio", exact: true })
  await move.focus()
  await move.press("ArrowDown")
  await expect(page.locator(".flux-reorder li").first()).toContainText("Cloud Atlas")
  await page
    .locator('[data-provider-id="0"]')
    .dragTo(page.locator('[data-provider-id="provider:cloud/a?4421"]'))
  await expect(page.locator(".flux-reorder li").first()).toContainText("Local Studio")
  await page.getByRole("button", { name: "Save fixture order", exact: true }).click()
  await page.reload()
  await settled(page)
  await expect(page.locator(".flux-reorder li").first()).toContainText("Local Studio")
  await page.evaluate(() =>
    localStorage.setItem("parallax:flux-settings:4421:provider-chain", '{"invalid":true}'),
  )
  await page.reload()
  await settled(page)
  await expect(
    page.getByText("Malformed fixture preference rejected; using authored fallback order.", {
      exact: true,
    }),
  ).toBeVisible()
})
test("master-detail keyboard keeps opaque IDs and inert plugin config zero/absent values", async ({
  page,
}) => {
  await open(page, "agents")
  const records = page.getByRole("group", { name: "agents records" })
  await records.getByRole("button", { name: /Researcher/ }).focus()
  await page.keyboard.press("ArrowDown")
  await expect(page.getByRole("region", { name: "agents detail" })).toContainText(
    "agent:/writer?4421",
  )
  await page.keyboard.press("End")
  await expect(page.getByRole("region", { name: "agents detail" })).toContainText(
    "Explicitly unset",
  )
  await page.getByRole("navigation").getByRole("link", { name: "Plugins", exact: true }).click()
  await expect(page.getByLabel("Row limit", { exact: true })).toHaveValue("0")
  await expect(page.getByLabel("Show annotations", { exact: true })).not.toBeChecked()
  await expect(page.locator("main")).toContainText("Not set")
  await page.getByRole("button", { name: "Preview install fixture", exact: true }).click()
  await expect(
    page.getByText("Install/reload preview recorded locally; no plugin was loaded."),
  ).toBeVisible()
  await page.getByLabel("Row limit", { exact: true }).fill("3")
  await page.getByLabel("Notebook title", { exact: true }).fill("Local config")
  await page.getByRole("button", { name: "Save fixture", exact: true }).click()
  await expect(page.getByText("Saved to this local fixture only.")).toBeVisible()
  await expect(page.getByLabel("Row limit", { exact: true })).toHaveValue("3")
})
test("once-working callbacks retire after source replacement and Activity hide-show, fresh positives recover", async ({
  page,
}) => {
  await open(page)
  expect(
    await page.evaluate(() =>
      window.fluxSettingsComposition?.form?.edit({
        display_name: { kind: "value", value: "First admitted draft" },
      }),
    ),
  ).toBe(true)
  await expect(page.getByLabel("Display Name", { exact: true })).toHaveValue("First admitted draft")
  await page.evaluate(() => {
    window.retainedComposition = window.fluxSettingsComposition
    window.retainedForm = window.fluxSettingsComposition?.form
  })
  await page.getByRole("button", { name: "Replace fixture source" }).click()
  await settled(page)
  expect(
    await page.evaluate(() => [
      window.retainedComposition?.navigate("plugins"),
      window.retainedForm?.save(),
      window.retainedForm?.cancel(),
      window.retainedForm?.edit({ display_name: { kind: "value", value: "Retired" } }),
    ]),
  ).toEqual([false, false, false, false])
  await expect(page.getByLabel("Display Name", { exact: true })).toHaveValue("Morgan Fixture")
  expect(
    await page.evaluate(() =>
      window.fluxSettingsComposition?.form?.edit({
        display_name: { kind: "value", value: "Fresh admitted draft" },
      }),
    ),
  ).toBe(true)
  await expect(page.getByLabel("Display Name", { exact: true })).toHaveValue("Fresh admitted draft")
  await page.evaluate(() => {
    window.retainedForm = window.fluxSettingsComposition?.form
    window.retainedComposition = window.fluxSettingsComposition
  })
  await page.getByRole("button", { name: "Hide settings activity" }).click()
  await page.getByRole("button", { name: "Show settings activity" }).click()
  await settled(page)
  expect(
    await page.evaluate(() => [
      window.retainedForm?.cancel(),
      window.retainedComposition?.navigate("plugins"),
    ]),
  ).toEqual([false, false])
  expect(await page.evaluate(() => window.fluxSettingsComposition?.form?.cancel())).toBe(true)
})
test("capture records only its exact button, preserves native action keys, IME and actual overlay vetoes", async ({
  page,
}) => {
  await open(page, "shortcuts")
  await page.locator('[data-shortcut-key="new_session"]').click()
  const recording = page.getByRole("button", { name: /Recording shortcut/ })
  await expect(recording).toBeFocused()
  await recording.press("Control+Shift+J")
  await expect(page.getByRole("button", { name: /Save .* shortcut/ })).toBeVisible()
  await page.evaluate(() => {
    window.retainedCapture = window.fluxSettingsComposition?.capture
  })
  const ime = await recording.evaluate((el) => {
    const e = new KeyboardEvent("keydown", {
      key: "Escape",
      keyCode: 229,
      isComposing: true,
      bubbles: true,
      cancelable: true,
    })
    el.dispatchEvent(e)
    return e.defaultPrevented
  })
  expect(ime).toBe(false)
  await expect(recording).toBeVisible()
  await recording.press("Tab")
  await expect(page.getByRole("button", { name: /Save .* shortcut/ })).toBeFocused()
  await page.keyboard.press("Enter")
  await expect(recording).toHaveCount(0)
  await page.locator('[data-shortcut-key="new_session"]').click()
  await expect(recording).toBeFocused()
  await page.getByRole("button", { name: /Cancel editing/ }).focus()
  await page.keyboard.press("Space")
  await expect(recording).toHaveCount(0)
  await page.locator('[data-shortcut-key="new_session"]').click()
  await expect(recording).toBeFocused()
  for (const role of ["dialog", "menu", "listbox"]) {
    await page.evaluate((role) => {
      const e = document.createElement("div")
      e.id = "competing"
      e.setAttribute("role", role)
      e.textContent = "Competing layer"
      document.body.append(e)
    }, role)
    expect(
      await recording.evaluate((el) => {
        const e = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })
        el.dispatchEvent(e)
        return e.defaultPrevented
      }),
    ).toBe(false)
    await expect(recording).toBeVisible()
    await page.evaluate(() => document.getElementById("competing")?.remove())
  }
  await page.evaluate(() => {
    const ancestor = document.createElement("div")
    ancestor.id = "closed-popup"
    ancestor.setAttribute("data-closed", "")
    const dialog = document.createElement("div")
    dialog.setAttribute("role", "dialog")
    dialog.textContent = "Closed competitor"
    ancestor.append(dialog)
    document.body.append(ancestor)
  })
  await recording.press("Control+K")
  await expect(page.getByRole("button", { name: /Save .* shortcut/ })).toBeVisible()
  await page.evaluate(() => document.getElementById("closed-popup")?.remove())
  await page.getByRole("button", { name: "Replace fixture source" }).click()
  await settled(page)
  expect(
    await page.evaluate(() => [window.retainedCapture?.save(), window.retainedCapture?.cancel()]),
  ).toEqual([false, false])
})
test("read-only, empty, loading, error and access views disclose their source", async ({
  page,
}) => {
  await open(page, "plugins", "&scenario=read-only")
  await expect(page.getByRole("button", { name: "Preview install fixture" })).toBeDisabled()
  await page.getByLabel("Fixture scenario").selectOption("empty")
  await expect(page.getByText("No plugins match this fixture view.")).toBeVisible()
  await page.getByLabel("Fixture scenario").selectOption("loading")
  await expect(
    page.getByText("Loading fictional settings snapshot; no read request is pending."),
  ).toBeVisible()
  await page.getByLabel("Fixture scenario").selectOption("error")
  await expect(page.getByRole("alert")).toContainText("Fixture read failure")
  await page.getByLabel("Fixture scenario").selectOption("access-denied")
  await expect(page.locator("main")).toContainText("Fixture access denied")
  await page.getByLabel("Fixture scenario").selectOption("populated")
  await settled(page)
  await expect(page.getByRole("button", { name: "Preview install fixture" })).toBeEnabled()
})
test("delayed navigation focus obeys current publication and newer plain or portal foreground", async ({
  page,
}) => {
  await open(page)
  expect(await page.evaluate(() => window.fluxSettingsComposition?.focusSection("agents"))).toBe(
    true,
  )
  await expect(page.locator("main h1")).toBeFocused()
  expect(
    await page.evaluate(() => {
      window.retainedFocus = window.fluxSettingsComposition?.delayedFocus
      return window.retainedFocus?.()
    }),
  ).toBe(true)
  await page.getByRole("button", { name: "Replace fixture source" }).click()
  await settled(page)
  expect(await page.evaluate(() => window.retainedFocus?.())).toBe(false)
  for (const portal of [false, true]) {
    await page.evaluate((portal) => {
      window.fluxSettingsComposition?.focusSection(portal ? "plugins" : "providers")
      const container = document.createElement("div")
      container.id = "foreground"
      if (portal) {
        container.setAttribute("data-portal", "true")
        container.setAttribute("role", "dialog")
      }
      const button = document.createElement("button")
      button.textContent = "New foreground"
      container.append(button)
      document.body.append(container)
      button.focus()
    }, portal)
    await expect(page.getByRole("button", { name: "New foreground" })).toBeFocused()
    await page.evaluate(() => document.getElementById("foreground")?.remove())
  }
})

test("retained capture cannot cancel a fresh recording after source replacement or Activity revival", async ({
  page,
}) => {
  await open(page, "shortcuts")
  await page.locator('[data-shortcut-key="new_session"]').click()
  await page.getByRole("button", { name: /Recording shortcut/ }).press("Control+Shift+J")
  expect(await page.evaluate(() => window.fluxSettingsComposition?.capture?.save())).toBe(true)
  await expect(page.getByRole("button", { name: /Recording shortcut/ })).toHaveCount(0)
  for (const boundary of ["source", "activity"]) {
    await page.locator('[data-shortcut-key="new_session"]').click()
    await expect(page.getByRole("button", { name: /Recording shortcut/ })).toBeFocused()
    await page.evaluate(() => {
      window.retainedCapture = window.fluxSettingsComposition?.capture
    })
    if (boundary === "source")
      await page.getByRole("button", { name: "Replace fixture source" }).click()
    else {
      await page.getByRole("button", { name: "Hide settings activity" }).click()
      await page.getByRole("button", { name: "Show settings activity" }).click()
    }
    await settled(page)
    if (boundary === "source") await page.locator('[data-shortcut-key="new_session"]').click()
    await expect(page.getByRole("button", { name: /Recording shortcut/ })).toBeVisible()
    await expect
      .poll(() => page.evaluate(() => !!window.fluxSettingsComposition?.capture?.isLive()))
      .toBe(true)
    expect(
      await page.evaluate(() => [window.retainedCapture?.save(), window.retainedCapture?.cancel()]),
    ).toEqual([false, false])
    await expect(page.getByRole("button", { name: /Recording shortcut/ })).toBeVisible()
    expect(await page.evaluate(() => window.fluxSettingsComposition?.capture?.cancel())).toBe(true)
    await expect(page.getByRole("button", { name: /Recording shortcut/ })).toHaveCount(0)
  }
})

test("theme tokens save locally and composing form edits remain editable", async ({ page }) => {
  await open(page, "appearance")
  await page.getByRole("button", { name: "Duplicate", exact: true }).click()
  await page.getByRole("button", { name: /Token-Bound Editor/ }).click()
  await page.getByRole("button", { name: "Click to edit token", exact: true }).first().click()
  const color = page.getByPlaceholder("hex or rgb/rgba")
  const current = await color.inputValue()
  const preset = (
    await page
      .locator('[data-section="appearance"] button[title^="#"]')
      .evaluateAll((els) => els.map((el) => el.getAttribute("title")))
  ).find((value) => value !== current)
  await color.fill(preset ?? "")
  await page.getByRole("button", { name: "Save theme fixture", exact: true }).click()
  await expect(page.getByText("Theme saved to this local fixture only.")).toBeVisible()
  await open(page)
  const field = page.getByLabel("Display Name", { exact: true })
  await field.focus()
  expect(
    await field.evaluate((el) => {
      const e = new KeyboardEvent("keydown", {
        key: "Process",
        keyCode: 229,
        isComposing: true,
        bubbles: true,
        cancelable: true,
      })
      el.dispatchEvent(e)
      return e.defaultPrevented
    }),
  ).toBe(false)
  await field.fill("Composing fixture text")
  await expect(field).toHaveValue("Composing fixture text")
})

test("reorder and form callbacks retire on access/layer and active-root loss", async ({ page }) => {
  await open(page, "preferences")
  expect(await page.evaluate(() => window.fluxSettingsComposition?.reorder?.reorder("0", 1))).toBe(
    true,
  )
  await expect(page.locator(".flux-reorder li").first()).toContainText("Cloud Atlas")
  await page.evaluate(() => {
    window.retainedReorder = window.fluxSettingsComposition?.reorder
  })
  await page.getByRole("button", { name: "Pause fixture layer" }).click()
  expect(await page.evaluate(() => window.retainedReorder?.reorder("0", 0))).toBe(false)
  await page.getByRole("button", { name: "Resume fixture layer" }).click()
  await settled(page)
  expect(await page.evaluate(() => window.retainedReorder?.reorder("0", 0))).toBe(false)
  expect(await page.evaluate(() => window.fluxSettingsComposition?.reorder?.reorder("0", 1))).toBe(
    true,
  )
  await open(page)
  await page.evaluate(() => {
    window.retainedForm = window.fluxSettingsComposition?.form
  })
  await page.getByRole("button", { name: "Revoke fixture access" }).click()
  expect(
    await page.evaluate(() =>
      window.retainedForm?.edit({ display_name: { kind: "value", value: "Forbidden" } }),
    ),
  ).toBe(false)
  await page.getByRole("button", { name: "Restore fixture access" }).click()
  await settled(page)
  expect(
    await page.evaluate(() => {
      const root = document.querySelector(".flux-settings-composition")
      root?.setAttribute("data-closed", "")
      const result = window.fluxSettingsComposition?.form?.cancel()
      root?.removeAttribute("data-closed")
      return result
    }),
  ).toBe(false)
  expect(
    await page.evaluate(() =>
      window.fluxSettingsComposition?.form?.edit({
        display_name: { kind: "value", value: "Fresh positive" },
      }),
    ),
  ).toBe(true)
})

for (const geometry of [
  { width: 1280, height: 900 },
  { width: 390, height: 844 },
  { width: 390, height: 420 },
])
  test(`settled token specimens at ${geometry.width}x${geometry.height}`, async ({
    page,
  }, info) => {
    await page.setViewportSize(geometry)
    for (const section of [
      "profile",
      "preferences",
      "appearance",
      "shortcuts",
      "agents",
      "plugins",
      "observability",
    ]) {
      await open(page, section, section === "appearance" ? "&mode=light" : "")
      await page.getByText("Fixture review controls", { exact: true }).click()
      await page.locator("main h1").scrollIntoViewIfNeeded()
      await page.evaluate(async () => {
        await document.fonts.ready
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        )
      })
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
      const heading = page
        .getByRole("heading", {
          name:
            section === "observability"
              ? "Observability"
              : section[0].toUpperCase() + section.slice(1),
          exact: true,
        })
        .first()
      await expect(heading).toBeVisible()
      await page.screenshot({
        path: info.outputPath(`${section}-${geometry.width}x${geometry.height}.png`),
        fullPage: true,
      })
      await page
        .locator(".flux-section-content")
        .evaluate((el) => el.scrollIntoView({ block: "start" }))
      await page.screenshot({
        path: info.outputPath(`${section}-content-${geometry.width}x${geometry.height}.png`),
        fullPage: true,
      })
      if (section === "plugins" || section === "agents") {
        await page
          .locator(".flux-record-detail")
          .evaluate((el) => el.scrollIntoView({ block: "start" }))
        await page.screenshot({
          path: info.outputPath(`${section}-detail-${geometry.width}x${geometry.height}.png`),
          fullPage: true,
        })
      }
    }
  })
