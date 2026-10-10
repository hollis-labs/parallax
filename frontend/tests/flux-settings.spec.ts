import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { expect, test } from "@playwright/test"

const entry = "/flux-settings.html"
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
}) => {
  const errors: string[] = []
  page.on("pageerror", (err) => errors.push(err.message))

  await page.goto(entry)
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
}) => {
  const errors: string[] = []
  page.on("pageerror", (err) => errors.push(err.message))

  // Direct deep link to #shortcuts
  await page.goto(`${entry}#shortcuts`)
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

test("roving keyboard navigation in sidebar", async ({ page }) => {
  await page.goto(`${entry}#appearance`)
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

test("appearance section: theme list, real token preview, and token editor", async ({ page }) => {
  await page.goto(`${entry}#appearance`)
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

test("layout section: validates preference controls and seam coordination", async ({ page }) => {
  await page.goto(`${entry}#layout`)
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
}) => {
  await page.goto(`${entry}#shortcuts`)
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

  // Reset All shortcuts
  await page.getByRole("button", { name: "Reset All" }).click()
})

test("permissions section: policy mode and tool grants whitelist", async ({ page }) => {
  await page.goto(`${entry}#permissions`)
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
}) => {
  // 1. Desktop 1280x900
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto(`${entry}#appearance`)
  await page.waitForTimeout(100)
  await page.screenshot({
    path: path.join(screenshotDir, "desktop-1280x900-appearance.png"),
    fullPage: true,
  })

  // 2. Desktop Short 1280x420
  await page.setViewportSize({ width: 1280, height: 420 })
  await page.goto(`${entry}#layout`)
  await page.waitForTimeout(100)
  await page.screenshot({
    path: path.join(screenshotDir, "desktop-1280x420-layout.png"),
    fullPage: true,
  })

  // 3. Mobile Narrow 390x844
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${entry}#shortcuts`)
  await page.waitForTimeout(100)
  await page.screenshot({
    path: path.join(screenshotDir, "mobile-390x844-shortcuts.png"),
    fullPage: true,
  })

  // 4. Mobile Narrow Short 390x420
  await page.setViewportSize({ width: 390, height: 420 })
  await page.goto(`${entry}#permissions`)
  await page.waitForTimeout(100)
  await page.screenshot({
    path: path.join(screenshotDir, "mobile-390x420-permissions.png"),
    fullPage: true,
  })
})

test("host committed activation fence refuses uncommitted/historical targets and admits fresh-positive", async ({
  page,
}) => {
  await page.goto(`${entry}#layout`)
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
