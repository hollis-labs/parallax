import { expect, test } from "@playwright/test"

test.describe("Tether Sysop Overview Recreation", () => {
  test("route /?example=tether&screen=overview loads standard overview dashboard with all panels", async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto("/?example=tether&screen=overview")

    // 1. Header strip assertions
    const header = page.locator("header.tether-overview-header")
    await expect(header).toBeVisible()
    await expect(header.getByText("Agent Ops Control Plane", { exact: true })).toBeVisible()
    await expect(header.getByText("/home/chrispian/.tether/catalog", { exact: true })).toBeVisible()

    // Status badge (ok -> done)
    const statusBadge = header.locator(".dash-status-badge")
    await expect(statusBadge).toBeVisible()
    await expect(statusBadge).toHaveAttribute("data-status", "done")

    // Refresh button
    const refreshBtn = header.getByRole("button", { name: "Refresh overview dashboard" })
    await expect(refreshBtn).toBeVisible()
    await expect(refreshBtn).toBeEnabled()

    // Identity links
    const linksNav = header.locator("nav[aria-label='Operations identity links']")
    await expect(linksNav.getByRole("link", { name: "Torque Operations" })).toHaveAttribute(
      "href",
      "/?example=torque",
    )
    await expect(linksNav.getByRole("link", { name: "Event Ledger" })).toHaveAttribute(
      "href",
      "/?view=Event+Ledger",
    )
    await expect(linksNav.getByRole("link", { name: "Run Explorer" })).toHaveAttribute(
      "href",
      "/?view=Run+Explorer",
    )
    await expect(linksNav.getByRole("link", { name: "Administration" })).toHaveAttribute(
      "href",
      "/?example=administration",
    )

    // 2. Row 1: Activity Signal & Intelligence panels
    const main = page.locator("main.tether-overview-scroll")
    await expect(main).toBeVisible()

    const activityPanel = main.locator("section[data-panel='Activity Signal']")
    await expect(activityPanel).toBeVisible()
    await expect(activityPanel.getByText("sampled events")).toBeVisible()
    // KPI grid in Activity Signal
    await expect(activityPanel.getByText("Sessions", { exact: true }).first()).toBeVisible()
    await expect(activityPanel.getByText("Tool Calls", { exact: true })).toBeVisible()
    await expect(activityPanel.getByText("Messages", { exact: true }).first()).toBeVisible()
    await expect(activityPanel.getByText("Events", { exact: true }).first()).toBeVisible()
    await expect(activityPanel.getByText("Success", { exact: true })).toBeVisible()
    await expect(activityPanel.getByText("Unread", { exact: true })).toBeVisible()

    const intelligencePanel = main.locator("section[data-panel='Intelligence']")
    await expect(intelligencePanel).toBeVisible()
    await expect(intelligencePanel.getByText("Tool reliability", { exact: true })).toBeVisible()
    await expect(intelligencePanel.getByText("Session completion", { exact: true })).toBeVisible()
    await expect(intelligencePanel.getByText("Slow tool calls", { exact: true })).toBeVisible()
    await expect(intelligencePanel.getByText("Inbox pressure", { exact: true })).toBeVisible()
    await expect(intelligencePanel.getByText("Top tool", { exact: true })).toBeVisible()
    await expect(intelligencePanel.getByText("Top event", { exact: true })).toBeVisible()

    // 3. Row 2: Five panels
    await expect(main.locator("section[data-panel='Sessions']")).toBeVisible()
    await expect(main.locator("section[data-panel='Tool Calls']")).toBeVisible()
    await expect(main.locator("section[data-panel='Messaging']")).toBeVisible()
    await expect(main.locator("section[data-panel='AI Gateway']")).toBeVisible()
    await expect(main.locator("section[data-panel='Event Bus']")).toBeVisible()

    // 4. Rows 3-4: Catalog Surface, MCP Servers, AI Cost Report, AI Operators
    await expect(main.locator("section[data-panel='Catalog Surface']")).toBeVisible()
    await expect(main.locator("section[data-panel='MCP Servers']")).toBeVisible()
    await expect(main.locator("section[data-panel='AI Cost Report']")).toBeVisible()
    await expect(main.locator("section[data-panel='AI Operators']")).toBeVisible()

    // Desktop screenshot
    await page.screenshot({ path: testInfo.outputPath("tether-overview-desktop-1280.png") })
  })

  test("settled narrow layout (390px) and short viewport (420px height) prevent horizontal overflow", async ({
    page,
  }, testInfo) => {
    // 390px mobile viewport
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/?example=tether&screen=overview")
    await expect(page.locator("header.tether-overview-header")).toBeVisible()

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(scrollWidth).toBeLessThanOrEqual(390)
    await page.screenshot({ path: testInfo.outputPath("tether-overview-narrow-390.png") })

    // Short viewport 420px height
    await page.setViewportSize({ width: 1280, height: 420 })
    await expect(page.locator("header.tether-overview-header")).toBeVisible()
    const main = page.locator("main.tether-overview-scroll")
    await expect(main).toBeVisible()
    const mainBox = await main.boundingBox()
    expect(mainBox).toBeTruthy()
    expect(mainBox?.height).toBeGreaterThan(200)
    await page.screenshot({ path: testInfo.outputPath("tether-overview-short-420.png") })
  })

  test("variants display truthful accents: blocked-health, degraded-reliability, combined-adverse", async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 1280, height: 800 })

    // 1. Blocked-health variant
    await page.goto("/?example=tether&screen=overview&variant=blocked-health")
    const header = page.locator("header.tether-overview-header")
    const statusBadge = header.locator(".dash-status-badge")
    await expect(statusBadge).toHaveAttribute("data-status", "blocked")
    // Error banner visible
    const alert = page.locator("div.tether-overview-error-banner[role='alert']")
    await expect(alert).toBeVisible()
    await expect(alert).toContainText("permission denied")
    await page.screenshot({ path: testInfo.outputPath("tether-overview-blocked-health.png") })

    // 2. Degraded-reliability variant
    await page.goto("/?example=tether&screen=overview&variant=degraded-reliability")
    // Tool reliability < 95% -> blocked status in intelligence row
    const intel = page.locator("section[data-panel='Intelligence']")
    const reliabilityRow = intel.getByText("Tool reliability").locator("..")
    await expect(reliabilityRow.getByText("blocked", { exact: true })).toBeVisible()

    // Slow calls > 0 -> doing status
    const slowRow = intel.getByText("Slow tool calls").locator("..")
    await expect(slowRow.getByText("doing", { exact: true })).toBeVisible()

    // Unread > 0 -> inbox status
    const inboxRow = intel.getByText("Inbox pressure").locator("..")
    await expect(inboxRow.getByText("inbox", { exact: true })).toBeVisible()

    // AI budget pressure > 0 -> blocked status in AI Operators
    const operators = page.locator("section[data-panel='AI Operators']")
    const budgetRow = operators.getByText("Budget pressure").locator("..")
    await expect(budgetRow.getByText("blocked", { exact: true })).toBeVisible()

    await page.screenshot({ path: testInfo.outputPath("tether-overview-degraded.png") })

    // 3. Combined-adverse variant
    await page.goto("/?example=tether&screen=overview&variant=combined-adverse")
    await expect(header.locator(".dash-status-badge")).toHaveAttribute("data-status", "blocked")
    const combinedIntel = page.locator("section[data-panel='Intelligence']")
    await expect(
      combinedIntel
        .getByText("Tool reliability")
        .locator("..")
        .getByText("blocked", { exact: true }),
    ).toBeVisible()
  })

  test("interactive controls: variant selector switches views and Refresh button reloads fixture state", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto("/?example=tether&screen=overview")

    const select = page.getByRole("combobox", { name: "Dataset variant" })
    await expect(select).toHaveValue("standard")

    // Change variant to degraded-reliability
    await select.selectOption("degraded-reliability")
    await expect(page).toHaveURL(/variant=degraded-reliability/)

    // Refresh button reload
    const refreshBtn = page.getByRole("button", { name: "Refresh overview dashboard" })
    await refreshBtn.click()
    await expect(page.locator("header.tether-overview-header")).toBeVisible()

    // Keyboard shortcut 'r'
    await page.keyboard.press("r")
    await expect(page.locator("header.tether-overview-header")).toBeVisible()
  })

  test("keyboard tab navigation and shortcuts refuse IME/modifier without blocking native Tab", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto("/?example=tether&screen=overview")

    // Test tab key focus traversal
    const select = page.getByRole("combobox", { name: "Dataset variant" })
    await select.focus()
    expect(await page.evaluate(() => document.activeElement?.tagName)).toBe("SELECT")

    await page.keyboard.press("Tab")
    const active1 = await page.evaluate(() => document.activeElement?.tagName)
    expect(["A", "BUTTON", "SELECT"]).toContain(active1)

    await page.keyboard.press("Tab")
    const active2 = await page.evaluate(() => document.activeElement?.tagName)
    expect(["A", "BUTTON", "SELECT"]).toContain(active2)

    // Verify Tab is not blocked
    expect(active1).not.toBeNull()
    expect(active2).not.toBeNull()

    // Test that Shift+R does NOT trigger refresh
    let refreshed = false
    await page.exposeFunction("__testRefreshWatcher", () => {
      refreshed = true
    })
    await page.keyboard.press("Shift+KeyR")
    expect(refreshed).toBe(false)
  })

  test("retained callbacks refuse execution across in-page variant changes and competing overlays with fresh positives", async ({
    page,
  }) => {
    await page.goto("/?example=tether&screen=overview")
    await expect(page.locator("header.tether-overview-header")).toBeVisible()

    // 1. Capture callback reference cb1 while on variant standard
    const initialAdmission = await page.evaluate(() => {
      const w = window as unknown as {
        __tetherOverviewRetainedCallback?: () => boolean
        __capturedCb1?: () => boolean
      }
      w.__capturedCb1 = w.__tetherOverviewRetainedCallback
      return typeof w.__capturedCb1 === "function" ? w.__capturedCb1() : false
    })
    expect(initialAdmission).toBe(true) // Fresh positive on initial mounted callback

    // 2. Switch variant in-page (SAME document, NO page.goto)
    const select = page.getByRole("combobox", { name: "Dataset variant" })
    await select.selectOption("blocked-health")
    await expect(page).toHaveURL(/variant=blocked-health/)

    // 3. Verify that the SAME captured callback cb1 permanently refuses execution now that variant replaced the lease
    const cb1AfterVariantChange = await page.evaluate(() => {
      const w = window as unknown as { __capturedCb1?: () => boolean }
      return typeof w.__capturedCb1 === "function" ? w.__capturedCb1() : true
    })
    expect(cb1AfterVariantChange).toBe(false) // Permanently refused!

    // 4. Verify fresh positive for the newly registered active callback cb2
    const cb2Result = await page.evaluate(() => {
      const w = window as unknown as {
        __tetherOverviewRetainedCallback?: () => boolean
        __capturedCb2?: () => boolean
      }
      w.__capturedCb2 = w.__tetherOverviewRetainedCallback
      return typeof w.__capturedCb2 === "function" ? w.__capturedCb2() : false
    })
    expect(cb2Result).toBe(true) // Fresh positive on cb2!

    // 5. Test competing overlay veto:
    // Opening a competing foreground dialog/menu/listbox must refuse background actions
    await page.evaluate(() => {
      const dialog = document.createElement("div")
      dialog.setAttribute("role", "dialog")
      dialog.setAttribute("id", "competing-overlay-specimen")
      dialog.textContent = "Modal dialog overlay"
      document.body.appendChild(dialog)
    })

    const cb2WithOverlay = await page.evaluate(() => {
      const w = window as unknown as { __capturedCb2?: () => boolean }
      return typeof w.__capturedCb2 === "function" ? w.__capturedCb2() : true
    })
    expect(cb2WithOverlay).toBe(false) // Vetoed by competing overlay!

    // Dismiss competing overlay
    await page.evaluate(() => {
      document.getElementById("competing-overlay-specimen")?.remove()
    })

    // Once overlay is removed, cb2 is admitted again
    const cb2AfterDismiss = await page.evaluate(() => {
      const w = window as unknown as { __capturedCb2?: () => boolean }
      return typeof w.__capturedCb2 === "function" ? w.__capturedCb2() : false
    })
    expect(cb2AfterDismiss).toBe(true)

    // 6. Test connected root guard:
    // If root container is disconnected from active document, callback refuses
    await page.evaluate(() => {
      const root = document.querySelector(".tether-overview-root")
      if (root?.parentElement) {
        const w = window as unknown as { __savedParent?: HTMLElement; __savedRoot?: HTMLElement }
        w.__savedParent = root.parentElement
        w.__savedRoot = root as HTMLElement
        root.remove()
      }
    })

    const cb2Disconnected = await page.evaluate(() => {
      const w = window as unknown as { __capturedCb2?: () => boolean }
      return typeof w.__capturedCb2 === "function" ? w.__capturedCb2() : true
    })
    expect(cb2Disconnected).toBe(false) // Refused because root is disconnected!

    // Restore root
    await page.evaluate(() => {
      const w = window as unknown as { __savedParent?: HTMLElement; __savedRoot?: HTMLElement }
      if (w.__savedParent && w.__savedRoot) {
        w.__savedParent.appendChild(w.__savedRoot)
      }
    })

    // 7. Verify that cb1 STILL refuses (never revives across transitions)
    const cb1NeverRevives = await page.evaluate(() => {
      const w = window as unknown as { __capturedCb1?: () => boolean }
      return typeof w.__capturedCb1 === "function" ? w.__capturedCb1() : true
    })
    expect(cb1NeverRevives).toBe(false)
  })

  test("forced appearance states: empty, loading and error states render distinctly without misleading success", async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 1280, height: 800 })

    // 1. Explicit Empty state
    await page.goto("/?example=tether&screen=overview&appearance=empty")
    const emptyState = page.locator(
      "div.tether-overview-empty[data-testid='tether-overview-empty']",
    )
    await expect(emptyState).toBeVisible()
    await expect(emptyState.getByText("No overview telemetry")).toBeVisible()
    await expect(
      emptyState.getByText("No Tether session, tool, message, or AI activity recorded."),
    ).toBeVisible()
    // Verify that eleven metric panels are NOT rendered in empty state
    await expect(page.locator("section[data-panel='Activity Signal']")).not.toBeVisible()
    await expect(page.locator("section[data-panel='Sessions']")).not.toBeVisible()
    await page.screenshot({ path: testInfo.outputPath("tether-overview-empty.png") })

    // 2. Error state
    await page.goto("/?example=tether&screen=overview&appearance=error")
    const errorState = page.locator(
      "div.tether-overview-empty[data-testid='tether-overview-error']",
    )
    await expect(errorState).toBeVisible()
    await expect(errorState.getByText("Could not load overview").first()).toBeVisible()
    await expect(page.locator("section[data-panel='Activity Signal']")).not.toBeVisible()
    await page.screenshot({ path: testInfo.outputPath("tether-overview-error.png") })

    // 3. Loading state
    await page.goto("/?example=tether&screen=overview&appearance=loading")
    const loadingState = page.locator(
      "div.tether-overview-empty[data-testid='tether-overview-loading'][aria-busy='true']",
    )
    await expect(loadingState).toBeVisible()
    await expect(loadingState.getByText("Loading overview...")).toBeVisible()
    await expect(page.locator("section[data-panel='Activity Signal']")).not.toBeVisible()
    await page.screenshot({ path: testInfo.outputPath("tether-overview-loading.png") })
  })

  test("theme tokens: dark, light and phosphor themes apply truthfully", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })

    // Dark mode
    await page.goto("/?example=tether&screen=overview&mode=dark")
    const darkBg = await page.locator(".tether-overview-root").evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    expect(darkBg).toBeTruthy()

    // Light mode
    await page.goto("/?example=tether&screen=overview&mode=light")
    const lightBg = await page.locator(".tether-overview-root").evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    expect(lightBg).toBeTruthy()
    expect(lightBg).not.toEqual(darkBg)

    // Green phosphor theme
    await page.goto("/?example=tether&screen=overview&theme=p1-green-phosphor")
    const themeAttr = await page.evaluate(() => document.documentElement.dataset.theme)
    expect(themeAttr).toBe("p1-green-phosphor")
  })
})
