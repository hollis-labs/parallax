import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { expect, test } from "@playwright/test"
import {
  MALFORMED_FIXTURE_PREFERENCES,
  parseLayoutPreferences,
} from "../src/examples/flux-settings/model"

function getEntry(baseURL: string | undefined, suffix = ""): string {
  if (process.env.FLUX_SETTINGS_BASE_URL) {
    return `${process.env.FLUX_SETTINGS_BASE_URL}/flux-settings.html${suffix}`
  }
  if (!baseURL || baseURL.includes(":18541")) {
    return `http://127.0.0.1:18545/flux-settings.html${suffix}`
  }
  return `/flux-settings.html${suffix}`
}
const repo = fileURLToPath(new URL("../../", import.meta.url))
const screenshotDir = path.join(repo, ".scratch/flux-settings/screenshots")

test.beforeAll(() => {
  fs.mkdirSync(screenshotDir, { recursive: true })
})

test.beforeEach(async ({ page }) => {
  // Guard network: only local traffic allowed (no external API/telemetry)
  await page.route("**/*", async (route) => {
    try {
      const url = new URL(route.request().url())
      if (
        (url.protocol === "http:" || url.protocol === "https:") &&
        url.hostname !== "127.0.0.1" &&
        url.hostname !== "localhost"
      ) {
        return route.abort()
      }
    } catch {
      // Allow relative or non-URL data/blob requests
    }
    return route.continue()
  })
})

test("four representative sections render with grouped navigation and breadcrumbs", async ({
  page,
  baseURL,
}) => {
  const errors: string[] = []
  page.on("pageerror", (err) => errors.push(err.message))

  await page.goto(getEntry(baseURL))
  await expect(page.locator('[data-flux-settings-shell="true"]')).toBeVisible()

  // Default section is appearance
  await expect(page.locator('[data-section="appearance"]')).toBeVisible()
  const nav = page.getByRole("navigation", { name: "Settings navigation" })
  await expect(nav.getByText("You", { exact: true })).toBeVisible()
  await expect(nav.getByText("System", { exact: true })).toBeVisible()
  await expect(page.getByRole("tab", { name: "Appearance" })).toHaveAttribute(
    "aria-selected",
    "true",
  )

  // Breadcrumb shows You > Appearance
  await expect(page.locator("main")).toContainText("You")
  await expect(page.locator("main")).toContainText("Appearance")

  // Navigate to Layout
  await page.getByRole("tab", { name: "Layout" }).click()
  await expect(page.locator('[data-section="layout"]')).toBeVisible()
  await expect(page.locator("main")).toContainText("Layout")

  // Navigate to Shortcuts
  await page.getByRole("tab", { name: "Shortcuts" }).click()
  await expect(page.locator('[data-section="shortcuts"]')).toBeVisible()
  await expect(page.locator("main")).toContainText("Shortcuts")

  // Navigate to Permissions
  await page.getByRole("tab", { name: "Permissions" }).click()
  await expect(page.locator('[data-section="permissions"]')).toBeVisible()
  await expect(page.locator("main")).toContainText("Permissions")

  expect(errors).toEqual([])
})

test("deep hash linking, native back/forward, and deep reload preserve active section", async ({
  page,
  baseURL,
}) => {
  const errors: string[] = []
  page.on("pageerror", (err) => errors.push(err.message))

  // Direct deep link to #shortcuts
  await page.goto(getEntry(baseURL, "#shortcuts"))
  await expect(page.locator('[data-section="shortcuts"]')).toBeVisible()
  await expect(page.getByRole("tab", { name: "Shortcuts" })).toHaveAttribute(
    "aria-selected",
    "true",
  )

  // Click Layout tab
  await page.getByRole("tab", { name: "Layout" }).click()
  await expect(page.locator('[data-section="layout"]')).toBeVisible()
  expect(page.url()).toContain("#layout")

  // Browser Back button
  await page.goBack()
  await expect(page.locator('[data-section="shortcuts"]')).toBeVisible()
  expect(page.url()).toContain("#shortcuts")

  // Browser Forward button
  await page.goForward()
  await expect(page.locator('[data-section="layout"]')).toBeVisible()
  expect(page.url()).toContain("#layout")

  // Deep reload on active hash
  await page.reload()
  await expect(page.locator('[data-section="layout"]')).toBeVisible()
  expect(page.url()).toContain("#layout")

  expect(errors).toEqual([])
})

test("roving keyboard navigation in sidebar", async ({ page, baseURL }) => {
  await page.goto(getEntry(baseURL, "#appearance"))
  const appearanceTab = page.getByRole("tab", { name: "Appearance" })
  await appearanceTab.focus()

  // Press ArrowDown -> moves to Layout
  await page.keyboard.press("ArrowDown")
  await expect(page.locator('[data-section="layout"]')).toBeVisible()

  // Press ArrowDown -> moves to Shortcuts
  await page.keyboard.press("ArrowDown")
  await expect(page.locator('[data-section="shortcuts"]')).toBeVisible()

  // Press ArrowDown -> moves to Permissions
  await page.keyboard.press("ArrowDown")
  await expect(page.locator('[data-section="permissions"]')).toBeVisible()

  // Press ArrowUp -> returns to Shortcuts
  await page.keyboard.press("ArrowUp")
  await expect(page.locator('[data-section="shortcuts"]')).toBeVisible()

  // Press Home -> moves to top (Appearance)
  await page.keyboard.press("Home")
  await expect(page.locator('[data-section="appearance"]')).toBeVisible()
})

test("appearance section: theme list, real token preview, and token editor", async ({
  page,
  baseURL,
}) => {
  await page.goto(getEntry(baseURL, "#appearance"))
  await expect(page.locator('[data-section="appearance"]')).toBeVisible()

  // Verify theme select contains Concrete & Signal (default)
  const themeSelect = page.getByLabel("Theme Palette", { exact: false })
  await expect(themeSelect).toHaveValue("nanite-default")

  // Live Token Preview is active by default
  await expect(page.getByText("Visual Hierarchy Preview")).toBeVisible()
  await expect(page.getByText("Scoped Dark Composer")).toBeVisible()

  // Switch to Token-Bound Editor tab
  await page.getByRole("button", { name: /Token-Bound Editor/ }).click()
  await expect(page.getByText("--c-brand", { exact: true })).toBeVisible()
  await expect(page.getByText("--c-bg", { exact: true })).toBeVisible()

  // Duplicate theme to create an editable custom theme
  await page.getByRole("button", { name: "Duplicate", exact: true }).click()
  await expect(page.getByText("Custom (Editable)")).toBeVisible()
  const themeId1 = await page.evaluate(
    () => (window as unknown as { fluxSettings: { activeTheme: string } }).fluxSettings.activeTheme,
  )
  expect(themeId1).toBe("custom-nanite-default-4421-1")

  // Duplicate again to verify sequence counter increments across renders
  await page.getByRole("button", { name: "Duplicate", exact: true }).click()
  const themeId2 = await page.evaluate(
    () => (window as unknown as { fluxSettings: { activeTheme: string } }).fluxSettings.activeTheme,
  )
  expect(themeId2).toBe("custom-custom-nanite-default-4421-1-4421-2")

  // Open token editor popover for brand
  const brandRow = page
    .locator("div")
    .filter({ hasText: /^Brand Signal--c-brand/ })
    .first()
  await brandRow.locator('button[type="button"]').first().click()

  // Verify color popover appeared
  await expect(page.getByText("Token Presets")).toBeVisible()

  // Click preset color swatch
  const firstPreset = page.locator("button[title='#cfd4d8']").first()
  await firstPreset.click()

  // Verify dirty state
  await expect(page.getByText("Unsaved edits")).toBeVisible()

  // Revert changes
  await page.getByRole("button", { name: "Revert" }).click()
  await expect(page.getByText("Unsaved edits")).toHaveCount(0)
})

test("layout section: validates preference controls and seam coordination", async ({
  page,
  baseURL,
}) => {
  await page.goto(getEntry(baseURL, "#layout"))
  await expect(page.locator('[data-section="layout"]')).toBeVisible()

  // Preset selector
  const presetSelect = page.getByLabel("Active Preset", { exact: false })
  await expect(presetSelect).toHaveValue("default")
  await presetSelect.selectOption("workspace")
  await expect(presetSelect).toHaveValue("workspace")

  // Header metadata chips toggle
  const chipsToggle = page.getByRole("switch", { name: "Toggle Header Metadata Chips" })
  await expect(chipsToggle).toHaveAttribute("aria-checked", "true")
  await chipsToggle.click()
  await expect(chipsToggle).toHaveAttribute("aria-checked", "false")

  // Compact companion toggle
  const companionToggle = page.getByRole("switch", { name: "Toggle Compact Companion" })
  await expect(companionToggle).toHaveAttribute("aria-checked", "false")
  await companionToggle.click()
  await expect(companionToggle).toHaveAttribute("aria-checked", "true")

  // Tool Call Style
  const toolStyleSelect = page.getByLabel("Tool Call Style", { exact: false })
  await expect(toolStyleSelect).toHaveValue("minimal")
  await toolStyleSelect.selectOption("full")
  await expect(toolStyleSelect).toHaveValue("full")

  // Bottom working drawer default tab
  const drawerTabSelect = page.getByLabel("Default Tab", { exact: false })
  await expect(drawerTabSelect).toHaveValue("scratchpad")
  await drawerTabSelect.selectOption("terminal-1")
  await expect(drawerTabSelect).toHaveValue("terminal-1")

  // Reset defaults button
  await page.getByRole("button", { name: "Reset Defaults" }).click()
  await expect(presetSelect).toHaveValue("default")
  await expect(chipsToggle).toHaveAttribute("aria-checked", "true")
  await expect(companionToggle).toHaveAttribute("aria-checked", "false")
  await expect(toolStyleSelect).toHaveValue("minimal")
  await expect(drawerTabSelect).toHaveValue("scratchpad")
})

test("shortcuts section: guarded key capture, modifier lifecycle, and Escape cancellation", async ({
  page,
  baseURL,
}) => {
  await page.goto(getEntry(baseURL, "#shortcuts"))
  await expect(page.locator('[data-section="shortcuts"]')).toBeVisible()

  // Find Toggle Sidebar shortcut row
  const sidebarRow = page.locator('[data-shortcut-key="toggle_left_sidebar"]')
  await sidebarRow.click()

  // Should enter capture mode ("Press keys…")
  await expect(page.getByText("Press keys…")).toBeVisible()

  // Press modifier alone (Shift) -> should NOT commit
  await page.keyboard.down("Shift")
  await expect(page.getByText("Press keys…")).toBeVisible()
  await page.keyboard.up("Shift")

  // Press key combination: Control + Shift + P
  await page.keyboard.press("Control+Shift+P")
  await expect(page.getByText("Press keys…")).toHaveCount(0)

  // Press Escape to cancel capture
  await page.keyboard.press("Escape")
  await expect(page.getByText("Press keys…")).toHaveCount(0)

  // Re-enter and save key
  await sidebarRow.click()
  await page.keyboard.press("Control+Shift+P")
  await page.getByRole("button", { name: "Save Toggle Sidebar shortcut" }).click()

  // Enter capture mode again to verify focusable editing surface, outside negatives, and retained retirement
  await sidebarRow.click()
  const captureBox = sidebarRow.getByRole("button", {
    name: "Recording shortcut for Toggle Sidebar",
  })
  await expect(captureBox).toBeVisible()
  await expect(captureBox).toBeFocused()
  await expect(page.getByText("Press keys…")).toBeVisible()

  // Probe Tab reachability to Save button and native Enter activation
  await page.keyboard.press("Control+Shift+P")
  const saveBtn = sidebarRow.getByRole("button", { name: "Save Toggle Sidebar shortcut" })
  await expect(saveBtn).toBeVisible()
  await page.keyboard.press("Tab")
  await expect(saveBtn).toBeFocused()
  await page.keyboard.press("Enter")
  await expect(saveBtn).toHaveCount(0)

  // Probe Tab reachability to Cancel button and native Space activation
  await sidebarRow.click()
  await expect(captureBox).toBeFocused()
  await page.keyboard.press("Control+Shift+K")
  await expect(saveBtn).toBeVisible()
  const cancelBtn = sidebarRow.getByRole("button", { name: "Cancel editing Toggle Sidebar" })
  await expect(cancelBtn).toBeVisible()
  await page.keyboard.press("Tab")
  await expect(saveBtn).toBeFocused()
  await page.keyboard.press("Tab")
  await expect(cancelBtn).toBeFocused()
  await page.keyboard.press("Space")
  await expect(cancelBtn).toHaveCount(0)

  // Probe Escape cancellation from Save button (Escape allowed from admitted action buttons)
  await sidebarRow.click()
  await expect(captureBox).toBeFocused()
  await page.keyboard.press("Control+Shift+J")
  await expect(saveBtn).toBeVisible()
  await page.keyboard.press("Tab")
  await expect(saveBtn).toBeFocused()
  await page.keyboard.press("Escape")
  await expect(saveBtn).toHaveCount(0)
  await expect(page.getByText("Press keys…")).toHaveCount(0)

  // Probe IME composing Escape negative: composition does NOT cancel capture
  await sidebarRow.click()
  await expect(captureBox).toBeFocused()
  await page.evaluate(() => {
    const box = document.querySelector('button[aria-label^="Recording shortcut"]')
    if (!box) throw new Error("Missing capture box")
    const event = new KeyboardEvent("keydown", {
      key: "Escape",
      keyCode: 229,
      bubbles: true,
      cancelable: true,
    })
    Object.defineProperty(event, "isComposing", { value: true })
    box.dispatchEvent(event)
  })
  // Capture mode remains active
  await expect(page.getByText("Press keys…")).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(page.getByText("Press keys…")).toHaveCount(0)

  // Probe competing overlay negative: key events are NOT consumed when competing overlay is active
  await sidebarRow.click()
  await expect(captureBox).toBeFocused()
  await page.evaluate(() => {
    const overlay = document.createElement("div")
    overlay.id = "competing-overlay-shortcut"
    overlay.setAttribute("role", "dialog")
    document.body.append(overlay)
  })
  // Dispatch Escape and key chords while competing overlay is present
  await page.keyboard.press("Escape")
  // Still in capture mode because competing overlay suppressed admission!
  await expect(page.getByText("Press keys…")).toBeVisible()
  await page.evaluate(() => document.getElementById("competing-overlay-shortcut")?.remove())
  // After overlay removal, Escape cancels cleanly
  await page.keyboard.press("Escape")
  await expect(page.getByText("Press keys…")).toHaveCount(0)

  // Re-enter capture mode for isolation negatives and retained retirement probes
  await sidebarRow.click()
  await expect(captureBox).toBeFocused()
  await expect(page.getByText("Press keys…")).toBeVisible()

  // 1. Outside plain button negative: key events are NOT consumed
  await page.evaluate(() => {
    const btn = document.createElement("button")
    btn.id = "test-outside-btn"
    btn.textContent = "Outside Button"
    document.body.append(btn)
    btn.focus()
  })
  await page.keyboard.press("Control+Shift+B")
  await expect(page.getByText("Press keys…")).toBeVisible()
  await page.evaluate(() => document.getElementById("test-outside-btn")?.remove())

  // 2. Outside editor negative: key events type normally and are NOT consumed
  await page.evaluate(() => {
    const input = document.createElement("input")
    input.id = "test-unrelated-editor"
    document.body.append(input)
    input.focus()
  })
  await page.keyboard.type("safe-typing")
  const inputVal = await page.evaluate(
    () => (document.getElementById("test-unrelated-editor") as HTMLInputElement)?.value,
  )
  expect(inputVal).toBe("safe-typing")
  await expect(page.getByText("Press keys…")).toBeVisible()
  await page.evaluate(() => document.getElementById("test-unrelated-editor")?.remove())

  // 3. Outside popup negative: key events in dialog are NOT consumed
  await page.evaluate(() => {
    const popup = document.createElement("div")
    popup.id = "test-outside-popup"
    popup.setAttribute("role", "dialog")
    const btn = document.createElement("button")
    btn.id = "test-popup-btn"
    popup.append(btn)
    document.body.append(popup)
    btn.focus()
  })
  await page.keyboard.press("Control+Shift+M")
  await expect(page.getByText("Press keys…")).toBeVisible()
  await page.evaluate(() => document.getElementById("test-outside-popup")?.remove())

  // 4. Exact row-owned event positive: focus captureBox and record chord
  await captureBox.focus()
  await page.keyboard.press("Control+Shift+P")
  await expect(page.getByText("Press keys…")).toHaveCount(0)

  // 5. Retained capture retirement: capture session retires on loss of admission
  const captureLive = await page.evaluate(() => {
    const w = window as any
    w.heldCapture = w.fluxSettings.currentCapture
    return w.heldCapture?.isLive()
  })
  expect(captureLive).toBe(true)

  // Replace source -> held capture retires
  await page.getByRole("button", { name: "Replace source", exact: true }).click()
  const captureRetired = await page.evaluate(() => {
    const w = window as any
    return {
      isLive: w.heldCapture?.isLive(),
      saveResult: w.heldCapture?.save(),
      cancelResult: w.heldCapture?.cancel(),
    }
  })
  expect(captureRetired.isLive).toBe(false)
  expect(captureRetired.saveResult).toBe(false)
  expect(captureRetired.cancelResult).toBe(false)

  // Proves retained once-working cancel refuses and cannot cancel the current active edit in the fresh frame
  const retainedProbeCancelBtn = sidebarRow.getByRole("button", {
    name: "Cancel editing Toggle Sidebar",
  })
  await expect(retainedProbeCancelBtn).toBeVisible()
  const retainedCancelRefusal = await page.evaluate(() => {
    const w = window as any
    return w.heldCapture?.cancel()
  })
  expect(retainedCancelRefusal).toBe(false)
  // Edit mode remains active in fresh frame because retained cancel was refused
  await expect(retainedProbeCancelBtn).toBeVisible()

  // Fresh cancel positive on active edit returns true and clears edit mode
  const freshCancelPositive = await page.evaluate(() => {
    const w = window as any
    return w.fluxSettings.currentCapture?.cancel()
  })
  expect(freshCancelPositive).toBe(true)
  await expect(retainedProbeCancelBtn).toHaveCount(0)

  // Re-enter and save key in fresh frame
  await sidebarRow.click()
  await captureBox.focus()
  await expect(page.getByText("Press keys…")).toBeVisible()
  await page.keyboard.press("Control+Shift+P")
  await page.getByRole("button", { name: "Save Toggle Sidebar shortcut" }).click()
  await expect(page.getByText("Press keys…")).toHaveCount(0)

  // Reset All shortcuts
  await page.getByRole("button", { name: "Reset All" }).click()
})

test("permissions section: policy mode and tool grants whitelist", async ({ page, baseURL }) => {
  await page.goto(getEntry(baseURL, "#permissions"))
  await expect(page.locator('[data-section="permissions"]')).toBeVisible()

  // Change permission policy mode
  const modeSelect = page.getByLabel("Active Mode", { exact: false })
  await expect(modeSelect).toHaveValue("default")
  await modeSelect.selectOption("plan")
  await expect(page.getByText("Plan (Read-Only):")).toBeVisible()

  // Search filter
  const searchInput = page.getByPlaceholder("Filter tools…")
  await searchInput.fill("write")
  await expect(page.getByText("write_file", { exact: true })).toBeVisible()
  await expect(page.getByText("run_command", { exact: true })).toHaveCount(0)

  // Clear search
  await searchInput.fill("")
  await expect(page.getByText("run_command", { exact: true })).toBeVisible()

  // Toggle run_command grant
  const runCommandSwitch = page.getByRole("switch", { name: "Toggle run_command permission" })
  await expect(runCommandSwitch).toHaveAttribute("aria-checked", "false")
  await runCommandSwitch.click()
  await expect(runCommandSwitch).toHaveAttribute("aria-checked", "true")

  // Metrics reflect updated grant count
  await expect(page.locator('[data-metric="granted"]')).toContainText("6 / 8")

  // Empty search state
  await searchInput.fill("nonexistent_tool_xyz")
  await expect(page.getByText('No tools match "nonexistent_tool_xyz".')).toBeVisible()
})

test("responsive layout across viewports including narrow 390px and short 420px", async ({
  page,
  baseURL,
}) => {
  // 1. Desktop 1280x900
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto(getEntry(baseURL, "#appearance"))
  await page.waitForTimeout(100)
  await page.screenshot({
    path: path.join(screenshotDir, "desktop-1280x900-appearance.png"),
    fullPage: true,
  })

  // 2. Desktop Short 1280x420
  await page.setViewportSize({ width: 1280, height: 420 })
  await page.goto(getEntry(baseURL, "#layout"))
  await page.waitForTimeout(100)
  await page.screenshot({
    path: path.join(screenshotDir, "desktop-1280x420-layout.png"),
    fullPage: true,
  })

  // 3. Mobile Narrow 390x844
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(getEntry(baseURL, "#shortcuts"))
  await page.waitForTimeout(100)
  await page.screenshot({
    path: path.join(screenshotDir, "mobile-390x844-shortcuts.png"),
    fullPage: true,
  })

  // 4. Mobile Narrow Short 390x420
  await page.setViewportSize({ width: 390, height: 420 })
  await page.goto(getEntry(baseURL, "#permissions"))
  await page.waitForTimeout(100)
  await page.screenshot({
    path: path.join(screenshotDir, "mobile-390x420-permissions.png"),
    fullPage: true,
  })
})

test("host committed activation fence refuses uncommitted/historical targets and admits fresh-positive", async ({
  page,
  baseURL,
}) => {
  await page.goto(getEntry(baseURL, "#layout"))
  await expect(page.locator('[data-section="layout"]')).toBeVisible()

  // Attempt to activate historical/superseded sections (profile, wizard, agents, providers)
  const refusedProfile = await page.evaluate(() => {
    return (
      window as unknown as { fluxSettings: { activateSection: (s: string) => boolean } }
    ).fluxSettings.activateSection("profile")
  })
  expect(refusedProfile).toBe(false)
  // Section remains committed to layout
  await expect(page.locator('[data-section="layout"]')).toBeVisible()

  const refusedWizard = await page.evaluate(() => {
    return (
      window as unknown as { fluxSettings: { activateSection: (s: string) => boolean } }
    ).fluxSettings.activateSection("wizard")
  })
  expect(refusedWizard).toBe(false)
  await expect(page.locator('[data-section="layout"]')).toBeVisible()

  // Verify refusal diagnostic tracking
  const stats = await page.evaluate(
    () =>
      (
        window as unknown as {
          fluxSettings: { fenceStats: { refusals: number; lastRefused: string } }
        }
      ).fluxSettings.fenceStats,
  )
  expect(stats.refusals).toBe(2)
  expect(stats.lastRefused).toBe("wizard")

  // Fresh-positive activation recovers cleanly
  const admitted = await page.evaluate(() => {
    return (
      window as unknown as { fluxSettings: { activateSection: (s: string) => boolean } }
    ).fluxSettings.activateSection("permissions")
  })
  expect(admitted).toBe(true)
  await expect(page.locator('[data-section="permissions"]')).toBeVisible()
})

test("layout section: rejects malformed persisted preferences with fallback to safe defaults", async ({
  page,
  baseURL,
}) => {
  // Test direct parsing rejection
  const corrupted = parseLayoutPreferences(MALFORMED_FIXTURE_PREFERENCES)
  const badVersion = parseLayoutPreferences({ version: 99, toolCallDisplayMode: "minimal" })
  const badMode = parseLayoutPreferences({
    version: 1,
    toolCallDisplayMode: "invalid_mode" as any,
    toolDrawerRetention: 15,
    defaultBottomDrawerTab: "scratchpad",
    preset: "default",
    headerChipsVisible: true,
    compactCompanion: false,
  })
  const negativeRetention = parseLayoutPreferences({
    version: 1,
    toolCallDisplayMode: "minimal",
    toolDrawerRetention: -5,
    defaultBottomDrawerTab: "scratchpad",
    preset: "default",
    headerChipsVisible: true,
    compactCompanion: false,
  })

  expect({
    corrupted: corrupted === null,
    badVersion: badVersion === null,
    badMode: badMode === null,
    negativeRetention: negativeRetention === null,
  }).toEqual({
    corrupted: true,
    badVersion: true,
    badMode: true,
    negativeRetention: true,
  })

  // Load standalone in malformed-fallback scenario
  await page.goto(getEntry(baseURL, "?scenario=malformed-fallback#layout"))
  await expect(page.locator('[data-section="layout"]')).toBeVisible()

  // Malformed rejection notice is visible in the DOM
  await expect(page.locator('[data-testid="malformed-fallback-notice"]')).toBeVisible()
  const diag = await page.evaluate(
    () =>
      (
        window as unknown as {
          fluxSettings: { diagnostics: { malformedRejected: boolean } }
        }
      ).fluxSettings.diagnostics,
  )
  expect(diag.malformedRejected).toBe(true)

  // Default layout preferences are preserved safely
  const presetSelect = page.getByLabel("Active Preset", { exact: false })
  await expect(presetSelect).toHaveValue("default")
})

test("captured activation callback and roving navigation retire across source, access, and React Activity lifecycle", async ({
  page,
  baseURL,
}) => {
  await page.goto(getEntry(baseURL, "#appearance"))
  await expect(page.locator('[data-section="appearance"]')).toBeVisible()

  // Capture callback from current live frame
  const initialFramePositive = await page.evaluate(() => {
    const w = window as unknown as {
      fluxSettings: {
        currentFrame: { activateSection: (s: string) => boolean }
      }
      heldActivate?: (s: string) => boolean
    }
    w.heldActivate = w.fluxSettings.currentFrame.activateSection
    return w.heldActivate("layout")
  })
  expect(initialFramePositive).toBe(true)
  await expect(page.locator('[data-section="layout"]')).toBeVisible()

  // Click "Replace source" in host header controls
  await page.getByRole("button", { name: "Replace source", exact: true }).click()

  // Retained callback refuses invocation after retirement
  const retainedRefusal = await page.evaluate(() => {
    return (
      window as unknown as {
        heldActivate: (s: string) => boolean
      }
    ).heldActivate("shortcuts")
  })
  expect(retainedRefusal).toBe(false)
  // Section did not change to shortcuts
  await expect(page.locator('[data-section="shortcuts"]')).toHaveCount(0)

  // Fresh frame recovers and admits target
  const freshAdmitted = await page.evaluate(() => {
    return (
      window as unknown as {
        fluxSettings: {
          currentFrame: { activateSection: (s: string) => boolean }
        }
      }
    ).fluxSettings.currentFrame.activateSection("shortcuts")
  })
  expect(freshAdmitted).toBe(true)
  await expect(page.locator('[data-section="shortcuts"]')).toBeVisible()

  // Access denial disables activation
  const accessCheckbox = page.getByRole("checkbox", { name: "Access admitted" })
  await accessCheckbox.uncheck()
  const accessDenied = await page.evaluate(() => {
    return (
      window as unknown as {
        fluxSettings: {
          currentFrame: { activateSection: (s: string) => boolean }
        }
      }
    ).fluxSettings.currentFrame.activateSection("appearance")
  })
  expect(accessDenied).toBe(false)

  // Re-admit access
  await accessCheckbox.check()
  const reAdmitted = await page.evaluate(() => {
    return (
      window as unknown as {
        fluxSettings: {
          currentFrame: { activateSection: (s: string) => boolean }
        }
      }
    ).fluxSettings.currentFrame.activateSection("appearance")
  })
  expect(reAdmitted).toBe(true)

  // Competing popup in document refutes liveness and ignores roving
  await page.evaluate(() => {
    const popup = document.createElement("div")
    popup.id = "competing-test-dialog"
    popup.setAttribute("role", "dialog")
    document.body.append(popup)
  })
  const rovingPopupRefused = await page.evaluate(() => {
    const w = window as any
    const btn = document.querySelector('button[data-section-id="appearance"]')
    return w.fluxSettings.currentFrame.handleSidebarKeyDown(
      { key: "ArrowDown", currentTarget: btn, target: btn, nativeEvent: { isComposing: false } },
      0,
    )
  })
  expect(rovingPopupRefused).toBe(false)
  await page.evaluate(() => document.getElementById("competing-test-dialog")?.remove())

  // Competing menu in document refutes liveness and ignores roving
  await page.evaluate(() => {
    const menu = document.createElement("div")
    menu.id = "competing-test-menu"
    menu.setAttribute("role", "menu")
    document.body.append(menu)
  })
  const rovingMenuRefused = await page.evaluate(() => {
    const w = window as any
    const btn = document.querySelector('button[data-section-id="appearance"]')
    return w.fluxSettings.currentFrame.handleSidebarKeyDown(
      { key: "ArrowDown", currentTarget: btn, target: btn, nativeEvent: { isComposing: false } },
      0,
    )
  })
  expect(rovingMenuRefused).toBe(false)
  await page.evaluate(() => document.getElementById("competing-test-menu")?.remove())

  // Hidden/closed dialog with empty marker does NOT refute liveness (current-positive)
  await page.evaluate(() => {
    const closed = document.createElement("div")
    closed.id = "closed-test-dialog"
    closed.setAttribute("role", "dialog")
    closed.setAttribute("data-closed", "")
    document.body.append(closed)
  })
  const rovingClosedAdmitted = await page.evaluate(() => {
    const w = window as any
    const btn = document.querySelector('button[data-section-id="appearance"]')
    return w.fluxSettings.currentFrame.handleSidebarKeyDown(
      { key: "ArrowDown", currentTarget: btn, target: btn, nativeEvent: { isComposing: false } },
      0,
    )
  })
  expect(rovingClosedAdmitted).toBe(true)
  await page.evaluate(() => document.getElementById("closed-test-dialog")?.remove())

  // Descendant in closed ancestor with empty marker does NOT refute liveness (current-positive)
  await page.evaluate(() => {
    const ancestor = document.createElement("div")
    ancestor.id = "closed-ancestor-test"
    ancestor.setAttribute("data-closed", "")
    const nested = document.createElement("div")
    nested.setAttribute("role", "dialog")
    ancestor.append(nested)
    document.body.append(ancestor)
  })
  const rovingAncestorAdmitted = await page.evaluate(() => {
    const w = window as any
    const btn = document.querySelector('button[data-section-id="appearance"]')
    return w.fluxSettings.currentFrame.handleSidebarKeyDown(
      { key: "ArrowDown", currentTarget: btn, target: btn, nativeEvent: { isComposing: false } },
      0,
    )
  })
  expect(rovingAncestorAdmitted).toBe(true)
  await page.evaluate(() => document.getElementById("closed-ancestor-test")?.remove())

  // Fresh roving recovery after popup removal
  const rovingRecovered = await page.evaluate(() => {
    const w = window as any
    const btn = document.querySelector('button[data-section-id="appearance"]')
    return w.fluxSettings.currentFrame.handleSidebarKeyDown(
      { key: "ArrowDown", currentTarget: btn, target: btn, nativeEvent: { isComposing: false } },
      0,
    )
  })
  expect(rovingRecovered).toBe(true)
  await expect(page.locator('[data-section="layout"]')).toBeVisible()

  // Retained roving handler across source replacement
  const heldRoving = await page.evaluate(() => {
    const w = window as any
    w.heldRoving = w.fluxSettings.currentFrame.handleSidebarKeyDown
    return true
  })
  expect(heldRoving).toBe(true)
  await page.getByRole("button", { name: "Replace source", exact: true }).click()
  const rovingRetired = await page.evaluate(() => {
    const w = window as any
    const btn = document.querySelector('button[data-section-id="layout"]')
    return w.heldRoving(
      { key: "ArrowDown", currentTarget: btn, target: btn, nativeEvent: { isComposing: false } },
      1,
    )
  })
  expect(rovingRetired).toBe(false)

  // Exercise React Activity lifecycle fixture
  const lifecycle = await page.evaluate(async () => {
    const path = "/tests/fixtures/settings-lifecycle.tsx"
    return (await import(path)).settingsLifecycleExercise()
  })
  expect(lifecycle).toEqual({
    positiveInitial: true,
    refusedWhileHidden: true,
    retainedRemainsRetired: true,
    freshRecovery: true,
    refusedAfterSourceReplace: true,
    freshAfterSourceReplace: true,
    cancelRefusedWhileHidden: true,
    cancelRemainsRetired: true,
    cancelRefusedAfterSourceReplace: true,
    cancelRefusedWhenAccessDenied: true,
    freshCancelPositive: true,
    refusedWhenAccessDenied: true,
    imeIgnored: true,
    modifierIgnored: true,
    accessDeniedIgnored: true,
    competingPopupIgnored: true,
    competingMenuIgnored: true,
    hiddenDialogAdmitted: true,
    emptyMarkerDescendantAdmitted: true,
    competingPopupRecovered: true,
    retainedRovingRetired: true,
    rootDetachedIgnored: true,
  })
})
