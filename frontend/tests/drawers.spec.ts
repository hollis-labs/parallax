import { expect, test } from "@playwright/test"

const entry = "/?example=drawers&session=CHAT-001&theme=nanite-default&mode=dark"

test.describe("Parallax Flux Drawers Candidate Suite", () => {
  test("renders top and bottom drawers with semantic tab strips, running pip, and fixtures", async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(entry)

    // Verify top and bottom drawers exist
    const topDrawer = page.locator('[data-testid="drawer-top"]')
    const bottomDrawer = page.locator('[data-testid="drawer-bottom"]')
    await expect(topDrawer).toBeVisible()
    await expect(bottomDrawer).toBeVisible()

    // Verify top drawer tabs
    const docTab = topDrawer.getByRole("tab", { name: /^Documents/ })
    const reportTab = topDrawer.getByRole("tab", { name: /^Reports/ })
    const diffTab = topDrawer.getByRole("tab", { name: /^Diffs/ })
    const toolTab = topDrawer.getByRole("tab", { name: /^Tools/ })
    const pinTab = topDrawer.getByRole("tab", { name: /^Pins/ })

    await expect(docTab).toBeVisible()
    await expect(reportTab).toBeVisible()
    await expect(diffTab).toBeVisible()
    await expect(toolTab).toBeVisible()
    await expect(pinTab).toBeVisible()

    // Verify running pip indicator on Tools tab
    const runningPip = toolTab.locator('[role="status"]')
    await expect(runningPip).toBeVisible()

    // Verify bottom drawer tabs
    const scratchpadTab = bottomDrawer.getByRole("tab", { name: /^Scratchpad/ })
    const terminalTab = bottomDrawer.getByRole("tab", { name: /^Terminal 1/ })
    const artifactsTab = bottomDrawer.getByRole("tab", { name: /^Artifacts/ })
    const runtimeTab = bottomDrawer.getByRole("tab", { name: /^Runtime/ })
    const contextTab = bottomDrawer.getByRole("tab", { name: /^Session Context/ })

    await expect(scratchpadTab).toBeVisible()
    await expect(terminalTab).toBeVisible()
    await expect(artifactsTab).toBeVisible()
    await expect(runtimeTab).toBeVisible()
    await expect(contextTab).toBeVisible()

    // Switch tab in top drawer to Tools
    await toolTab.click()
    await expect(toolTab).toHaveAttribute("aria-selected", "true")
    await expect(topDrawer.locator('[data-testid="drawer-body-top"]')).toContainText("fetch_system_metrics")

    await page.screenshot({ path: info.outputPath("drawers-desktop-overview.png") })
  })

  test("pointer drag resizing top and bottom drawers with bounds and auto-close", async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(entry)

    const topHandle = page.locator('[data-testid="drawer-handle-top"]')
    const topBody = page.locator('[data-testid="drawer-body-top"]')

    await expect(topHandle).toBeVisible()
    await expect(topBody).toBeVisible()

    const initialTopBox = await topBody.boundingBox()
    expect(initialTopBox).not.toBeNull()
    const initialHeight = initialTopBox?.height

    // Drag top handle down by 80px
    const handleBox = (await topHandle.boundingBox())!
    await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(
      handleBox.x + handleBox.width / 2,
      handleBox.y + handleBox.height / 2 + 80,
    )
    await page.mouse.up()

    const newTopBox = (await topBody.boundingBox())!
    expect(newTopBox.height).toBeGreaterThan(initialHeight + 40)

    // Drag top handle way up to trigger auto-close (< 24px)
    const currentHandleBox = (await topHandle.boundingBox())!
    await page.mouse.move(
      currentHandleBox.x + currentHandleBox.width / 2,
      currentHandleBox.y + currentHandleBox.height / 2,
    )
    await page.mouse.down()
    await page.mouse.move(
      currentHandleBox.x + currentHandleBox.width / 2,
      currentHandleBox.y + currentHandleBox.height / 2 - 400,
    )
    await page.mouse.up()

    // Top drawer body should now be closed / unmounted
    await expect(topBody).toHaveCount(0)

    // Reopen top drawer via header toggle button
    await page.getByRole("button", { name: "Toggle primary drawer" }).click()
    await expect(page.locator('[data-testid="drawer-body-top"]')).toBeVisible()

    // Test bottom drawer drag resizing
    const bottomHandle = page.locator('[data-testid="drawer-handle-bottom"]')
    const bottomBody = page.locator('[data-testid="drawer-body-bottom"]')
    const initialBottomBox = (await bottomBody.boundingBox())!

    const bHandleBox = (await bottomHandle.boundingBox())!
    // For bottom drawer, dragging UP increases height
    await page.mouse.move(bHandleBox.x + bHandleBox.width / 2, bHandleBox.y + bHandleBox.height / 2)
    await page.mouse.down()
    await page.mouse.move(
      bHandleBox.x + bHandleBox.width / 2,
      bHandleBox.y + bHandleBox.height / 2 - 60,
    )
    await page.mouse.up()

    const resizedBottomBox = (await bottomBody.boundingBox())!
    expect(resizedBottomBox.height).toBeGreaterThan(initialBottomBox.height + 30)

    await page.screenshot({ path: info.outputPath("drawers-drag-resized.png") })
  })

  test("keyboard resizing with arrow keys, page up/down, home/end, and space toggle", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(entry)

    const topHandle = page.locator('[data-testid="drawer-handle-top"]')
    await topHandle.focus()
    await expect(topHandle).toBeFocused()

    // Space toggles closed
    await page.keyboard.press("Space")
    await expect(page.locator('[data-testid="drawer-body-top"]')).toHaveCount(0)

    // Space toggles open again
    await page.keyboard.press("Space")
    const topBody = page.locator('[data-testid="drawer-body-top"]')
    await expect(topBody).toBeVisible()

    const startHeight = (await topBody.boundingBox())?.height

    // ArrowDown increases top drawer height
    await page.keyboard.press("ArrowDown")
    let currentHeight = (await topBody.boundingBox())?.height
    expect(currentHeight).toBeGreaterThanOrEqual(startHeight + 15)

    // ArrowUp decreases top drawer height
    await page.keyboard.press("ArrowUp")
    currentHeight = (await topBody.boundingBox())?.height
    expect(currentHeight).toBeLessThanOrEqual(startHeight + 5)

    // PageDown increases by larger step (~48px)
    await page.keyboard.press("PageDown")
    currentHeight = (await topBody.boundingBox())?.height
    expect(currentHeight).toBeGreaterThanOrEqual(startHeight + 40)

    // End expands to maximum height (600px)
    await page.keyboard.press("End")
    currentHeight = (await topBody.boundingBox())?.height
    expect(currentHeight).toBe(600)

    // Home collapses to minimum height (48px)
    await page.keyboard.press("Home")
    currentHeight = (await topBody.boundingBox())?.height
    expect(currentHeight).toBe(48)

    // Double click on handle toggles closed
    await topHandle.dblclick()
    await expect(page.locator('[data-testid="drawer-body-top"]')).toHaveCount(0)

    // Double click again restores previous height
    await topHandle.dblclick()
    await expect(page.locator('[data-testid="drawer-body-top"]')).toBeVisible()
  })

  test("dynamic card tabs creation, keyboard navigation, close, and pin actions", async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(entry)

    // Add a dynamic card tab
    const addCardBtn = page.getByRole("button", { name: "Add dynamic card tab" })
    await addCardBtn.click()

    const bottomDrawer = page.locator('[data-testid="drawer-bottom"]')
    const dynamicTab = bottomDrawer.getByRole("tab", { name: /^Specimen 1/ })
    await expect(dynamicTab).toBeVisible()
    await expect(dynamicTab).toHaveAttribute("aria-selected", "true")

    // Dynamic card content is visible
    await expect(page.locator('[data-testid="drawer-body-bottom"]')).toContainText(
      "card:dynamic-specimen-1",
    )

    // Keyboard navigation across tabs
    await dynamicTab.focus()
    await page.keyboard.press("ArrowLeft")
    const contextTab = bottomDrawer.getByRole("tab", { name: /^Session Context/ })
    await expect(contextTab).toBeFocused()

    await page.keyboard.press("ArrowRight")
    await expect(dynamicTab).toBeFocused()

    // Test Pinning: click pin button inside dynamic tab
    const dynamicTabItem = dynamicTab.locator("..")
    await dynamicTabItem.hover()
    const pinBtn = dynamicTabItem.locator('button[aria-label*="Pin"]')
    await pinBtn.click()

    // Verify pinned indicator on tab
    await expect(dynamicTabItem.locator('button[aria-label*="Unpin"]')).toBeVisible()

    // Switch to top drawer Pins tab to see pinned cards
    const topPinsTab = page
      .locator('[data-testid="drawer-top"]')
      .getByRole("tab", { name: /^Pins/ })
    await topPinsTab.click()
    await expect(page.locator('[data-testid="drawer-body-top"]')).toContainText("Specimen 1")

    // Unpin dynamic tab before closing
    await dynamicTabItem.hover()
    const unpinBtn = dynamicTabItem.locator('button[aria-label*="Unpin"]')
    await unpinBtn.click()
    await expect(dynamicTabItem.locator('button[aria-label*="Pin"]')).toBeVisible()

    // Test Closing: click close button on dynamic tab
    await dynamicTabItem.hover()
    const closeBtn = dynamicTabItem.locator('button[aria-label*="Close tab"]')
    await closeBtn.click()

    // Tab is removed from bottom drawer
    await expect(dynamicTab).toHaveCount(0)

    await page.screenshot({ path: info.outputPath("drawers-dynamic-tabs.png") })
  })

  test("per-session persistence and layout isolation across CHAT-001 and CHAT-002", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(entry)

    // Set top drawer height in CHAT-001 to 600px via keyboard End
    const topHandle = page.locator('[data-testid="drawer-handle-top"]')
    await topHandle.focus()
    await page.keyboard.press("End") // 600px
    const chat001Height = (await page.locator('[data-testid="drawer-body-top"]').boundingBox())
      ?.height
    expect(chat001Height).toBe(600)

    // Add a dynamic card tab to CHAT-001
    await page.getByRole("button", { name: "Add dynamic card tab" }).click()
    const bottomDrawer = page.locator('[data-testid="drawer-bottom"]')
    await expect(bottomDrawer.getByRole("tab", { name: /^Specimen 1/ })).toBeVisible()

    // Switch session to CHAT-002
    const sessionSelect = page.getByRole("combobox", {
      name: "Active session for drawer persistence",
    })
    await sessionSelect.selectOption("CHAT-002")

    // Verify CHAT-002 top drawer has its own default height (240px), NOT 600px
    const chat002Height = (await page.locator('[data-testid="drawer-body-top"]').boundingBox())
      ?.height
    expect(chat002Height).toBeLessThan(500)

    // Verify CHAT-002 does NOT have CHAT-001's dynamic card tab
    await expect(bottomDrawer.getByRole("tab", { name: /^Specimen 1/ })).toHaveCount(0)

    // Switch back to CHAT-001
    await sessionSelect.selectOption("CHAT-001")

    // Verify CHAT-001 restored its 600px height and dynamic card tab
    const restoredHeight = (await page.locator('[data-testid="drawer-body-top"]').boundingBox())
      ?.height
    expect(restoredHeight).toBe(600)
    await expect(bottomDrawer.getByRole("tab", { name: /^Specimen 1/ })).toBeVisible()

    // Reload page to verify persistence in localStorage
    await page.reload()
    await expect(page.locator('[data-testid="drawer-body-top"]')).toBeVisible()
    const reloadedHeight = (await page.locator('[data-testid="drawer-body-top"]').boundingBox())
      ?.height
    expect(reloadedHeight).toBe(600)
  })

  test("alert simulation displays banner, dims content, and can be dismissed", async ({
    page,
  }, info) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(entry)

    // Trigger Session Takeover alert
    const takeoverCheck = page.getByRole("checkbox", {
      name: "Simulate session takeover alert",
    })
    await takeoverCheck.check()

    // Verify alert banner is visible
    const alertBanner = page.locator('[role="alert"]')
    await expect(alertBanner).toBeVisible()
    await expect(alertBanner).toContainText("This session is now active in another tab")

    // Verify drawer body content is dimmed
    const dimmedBody = page.locator('[data-testid="drawer-body-bottom"] .opacity-30')
    await expect(dimmedBody).toBeVisible()

    await page.screenshot({ path: info.outputPath("drawers-alert-takeover.png") })

    // Click dismiss button in alert
    const dismissBtn = alertBanner.getByRole("button", { name: "Dismiss" })
    await dismissBtn.click()

    // Alert should be gone
    await expect(alertBanner).toHaveCount(0)
    await expect(dimmedBody).toHaveCount(0)
  })

  test("responsive layout containment across four standard viewports (1440x900, 1440x420, 390x844, 390x420)", async ({
    page,
  }, info) => {
    const viewports = [
      { width: 1440, height: 900, name: "desktop-standard" },
      { width: 1440, height: 420, name: "desktop-short" },
      { width: 390, height: 844, name: "mobile-portrait" },
      { width: 390, height: 420, name: "mobile-short" },
    ]

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto(entry)

      // Ensure no horizontal scroll leakage beyond viewport width
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      expect(scrollWidth).toBeLessThanOrEqual(vp.width)

      // Top and bottom handles should both be visible and interactable
      await expect(page.locator('[data-testid="drawer-handle-top"]')).toBeVisible()
      await expect(page.locator('[data-testid="drawer-handle-bottom"]')).toBeVisible()

      await page.screenshot({ path: info.outputPath(`drawers-viewport-${vp.name}.png`) })
    }
  })

  test("all 10 built-in themes and modes apply without error", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(entry)

    const themeSelect = page.getByRole("combobox", { name: "Preview theme" })
    const modeSelect = page.getByRole("combobox", { name: "Theme mode" })

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

    for (const theme of themes) {
      await themeSelect.selectOption(theme)
      await modeSelect.selectOption("dark")
      await expect(page.locator('[data-testid="drawers-review"]')).toBeVisible()

      await modeSelect.selectOption("light")
      await expect(page.locator('[data-testid="drawers-review"]')).toBeVisible()
    }
  })
})
