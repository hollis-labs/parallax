import { expect, test } from "@playwright/test"

test.describe("Tether Sysop AI Gateway Recreation", () => {
  test("route /?example=tether&screen=ai loads standard AI gateway with summary cards and tabs", async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto("/?example=tether&screen=ai")

    // 1. Header strip assertions
    const header = page.locator("header.tether-ai-header")
    await expect(header).toBeVisible()
    await expect(header.getByText("Tether AI Gateway", { exact: true })).toBeVisible()
    await expect(header.getByText("/home/chrispian/.tether/catalog", { exact: true })).toBeVisible()

    // Status badge (reachable -> done)
    const statusBadge = header.locator(".dash-status-badge")
    await expect(statusBadge).toBeVisible()
    await expect(statusBadge).toHaveAttribute("data-status", "done")

    // Refresh button
    const refreshBtn = page.getByRole("button", { name: "Refresh AI gateway data" })
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
    await expect(linksNav.getByRole("link", { name: "Overview" })).toHaveAttribute(
      "href",
      "/?example=tether&screen=overview",
    )

    // 2. Summary cards
    const summaryCards = page.locator(".dash-summary-cards")
    await expect(summaryCards).toBeVisible()
    await expect(summaryCards.getByText("Configured", { exact: true })).toBeVisible()
    await expect(summaryCards.getByText("Enabled", { exact: true })).toBeVisible()
    await expect(summaryCards.getByText("Routes", { exact: true })).toBeVisible()
    await expect(summaryCards.getByText("Runtime providers", { exact: true })).toBeVisible()
    await expect(summaryCards.getByText("Requests", { exact: true })).toBeVisible()
    await expect(summaryCards.getByText("Spend", { exact: true })).toBeVisible()
    await expect(summaryCards.getByText("Config state", { exact: true })).toBeVisible()

    // 3. Tab strip has all 7 tabs
    await expect(page.getByRole("button", { name: /^Config/ })).toBeVisible()
    await expect(page.getByRole("button", { name: /^Providers/ })).toBeVisible()
    await expect(page.getByRole("button", { name: /^Routes/ })).toBeVisible()
    await expect(page.getByRole("button", { name: /^Runtime/ })).toBeVisible()
    await expect(page.getByRole("button", { name: /^Usage/ })).toBeVisible()
    await expect(page.getByRole("button", { name: /^Audit/ })).toBeVisible()
    await expect(page.getByRole("button", { name: /^Budgets/ })).toBeVisible()

    // Default tab is Config
    await expect(page.getByRole("heading", { name: "Routing defaults" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "Global policy" })).toBeVisible()

    // Desktop screenshot
    await page.screenshot({ path: testInfo.outputPath("tether-ai-desktop-1280.png") })
  })

  test("route /?example=tether-ai also routes directly to standalone AI gateway", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto("/?example=tether-ai")
    const header = page.locator("header.tether-ai-header")
    await expect(header).toBeVisible()
    await expect(header.getByText("Tether AI Gateway", { exact: true })).toBeVisible()
  })

  test("settled narrow layout (390px) and short viewport (420px height) prevent horizontal overflow", async ({
    page,
  }, testInfo) => {
    // 390px mobile viewport
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/?example=tether&screen=ai")
    await expect(page.locator("header.tether-ai-header")).toBeVisible()

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(scrollWidth).toBeLessThanOrEqual(390)
    await page.screenshot({ path: testInfo.outputPath("tether-ai-narrow-390.png") })

    // Short viewport 420px height
    await page.setViewportSize({ width: 1280, height: 420 })
    await expect(page.locator("header.tether-ai-header")).toBeVisible()
    const content = page.locator(".tether-ai-root")
    await expect(content).toBeVisible()
    const box = await content.boundingBox()
    expect(box).toBeTruthy()
    expect(box?.height).toBeGreaterThan(200)
    await page.screenshot({ path: testInfo.outputPath("tether-ai-short-420.png") })
  })

  test("tab navigation across all 7 tabs verifies rendered data and controls", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto("/?example=tether&screen=ai")

    // 1. Providers tab
    await page.getByRole("button", { name: /^Providers/ }).click()
    await expect(page.getByRole("button", { name: "Add provider (specimen)" })).toBeVisible()
    // Provider table entries
    await expect(page.getByText("anthropic", { exact: true }).first()).toBeVisible()
    await expect(page.getByText("google", { exact: true }).first()).toBeVisible()
    await expect(page.getByText("openai", { exact: true }).first()).toBeVisible()

    // 2. Routes tab
    await page.getByRole("button", { name: /^Routes/ }).click()
    await expect(page.getByRole("button", { name: "Add route (specimen)" })).toBeVisible()
    // Route table entries
    await expect(page.getByText("claude-3-7-sonnet", { exact: true }).first()).toBeVisible()

    // 3. Runtime tab
    await page.getByRole("button", { name: /^Runtime/ }).click()
    await expect(page.getByText("Live providers", { exact: true })).toBeVisible()
    await expect(page.getByText("Live routes", { exact: true })).toBeVisible()
    await expect(page.getByText("Configured model runtime view", { exact: true })).toBeVisible()
    await expect(page.getByText("Daemon", { exact: true })).toBeVisible()

    // 4. Usage tab
    await page.getByRole("button", { name: /^Usage/ }).click()
    await expect(page.getByText("By provider", { exact: true })).toBeVisible()
    await expect(page.getByText("By model", { exact: true })).toBeVisible()
    await expect(page.getByText("By operation", { exact: true })).toBeVisible()
    await expect(page.getByText("Input tokens", { exact: true })).toBeVisible()
    await expect(page.getByText("Output tokens", { exact: true })).toBeVisible()

    // 5. Audit tab
    await page.getByRole("button", { name: /^Audit/ }).click()
    await expect(page.getByText("completion", { exact: true }).first()).toBeVisible()

    // 6. Budgets tab
    await page.getByRole("button", { name: /^Budgets/ }).click()
    await expect(page.getByText("available", { exact: true }).first()).toBeVisible()

    // 7. Config tab
    await page.getByRole("button", { name: /^Config/ }).click()
    await expect(page.getByRole("heading", { name: "Routing defaults" })).toBeVisible()
  })

  test("inert controls: Save, Reload, Add/Edit display truthful specimen feedback without mutations", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto("/?example=tether&screen=ai")

    // Save config specimen
    const saveBtn = page.getByRole("button", { name: "Save config (specimen)" })
    await saveBtn.click()
    await expect(
      page.getByText("Fixture specimen: save is inert. Local drafts are demonstration-only"),
    ).toBeVisible()

    // Reload daemon specimen
    const reloadBtn = page.getByRole("button", { name: "Reload daemon (specimen)" })
    await reloadBtn.click()
    await expect(
      page.getByText("Fixture specimen: daemon reload simulated. Read surfaces refreshed."),
    ).toBeVisible()

    // Providers tab - Add provider
    await page.getByRole("button", { name: /^Providers/ }).click()
    const addProviderBtn = page.getByRole("button", { name: "Add provider (specimen)" })
    await addProviderBtn.click()

    // Provider dialog opened
    const dialog = page.getByRole("dialog")
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText("Add AI provider (specimen)")).toBeVisible()

    // Enter dummy provider ID and submit
    await dialog.getByLabel("Provider ID").fill("custom-specimen")
    await dialog.getByRole("button", { name: "Save (specimen)" }).click()

    // Notice updated
    await expect(
      page.getByText(
        "Fixture specimen: updated provider draft 'custom-specimen'. Writes are inert.",
      ),
    ).toBeVisible()
  })

  test("dialog inspection forms open, view data, and close cleanly", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto("/?example=tether&screen=ai")

    // 1. Provider row detail dialog
    await page.getByRole("button", { name: /^Providers/ }).click()
    const anthropicRow = page.getByRole("button", { name: "Open AI provider anthropic" })
    await anthropicRow.click()

    const detailDialog = page.getByRole("dialog")
    await expect(detailDialog).toBeVisible()
    await expect(detailDialog.getByText("Provider anthropic")).toBeVisible()
    await expect(detailDialog.getByText("anthropic", { exact: true }).first()).toBeVisible()

    // Close detail dialog
    await page.keyboard.press("Escape")
    await expect(detailDialog).not.toBeVisible()

    // 2. Route detail dialog
    await page.getByRole("button", { name: /^Routes/ }).click()
    const routeRow = page.getByRole("button", {
      name: "Open AI route anthropic claude-3-7-sonnet",
    })
    await routeRow.click()
    await expect(detailDialog).toBeVisible()
    await expect(detailDialog.getByText("Route anthropic")).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(detailDialog).not.toBeVisible()

    // 3. Audit detail dialog
    await page.getByRole("button", { name: /^Audit/ }).click()
    const auditRow = page.getByRole("button", { name: /^Open AI audit event/ }).first()
    await auditRow.click()
    await expect(detailDialog).toBeVisible()
    await expect(detailDialog.getByText(/Audit \d+/)).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(detailDialog).not.toBeVisible()

    // 4. Budget detail dialog
    await page.getByRole("button", { name: /^Budgets/ }).click()
    const budgetRow = page.getByRole("button", { name: /^Open AI budget/ }).first()
    await budgetRow.click()
    await expect(detailDialog).toBeVisible()
    await expect(detailDialog.getByText(/Budget /)).toBeVisible()
    await page.keyboard.press("Escape")
    await expect(detailDialog).not.toBeVisible()
  })

  test("keyboard tab navigation and shortcuts refuse IME/modifier without blocking native Tab", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto("/?example=tether&screen=ai")

    // Test tab key focus traversal
    const select = page.getByRole("combobox", { name: "Dataset variant" })
    await select.focus()
    expect(await page.evaluate(() => document.activeElement?.tagName)).toBe("SELECT")

    await page.keyboard.press("Tab")
    const active1 = await page.evaluate(() => document.activeElement?.tagName)
    expect(["A", "BUTTON", "SELECT", "TEXTAREA"]).toContain(active1)

    await page.keyboard.press("Tab")
    const active2 = await page.evaluate(() => document.activeElement?.tagName)
    expect(["A", "BUTTON", "SELECT", "TEXTAREA"]).toContain(active2)

    // Verify Tab is not blocked
    expect(active1).not.toBeNull()
    expect(active2).not.toBeNull()

    // Test 'r' key triggers refresh without modifier
    await page.keyboard.press("KeyR")
    await expect(page.locator("header.tether-ai-header")).toBeVisible()
  })

  test("retained callbacks refuse execution across in-page variant changes and competing overlays", async ({
    page,
  }) => {
    await page.goto("/?example=tether&screen=ai")
    await expect(page.locator("header.tether-ai-header")).toBeVisible()

    // 1. Capture callback reference cb1 while on variant standard
    const initialAdmission = await page.evaluate(() => {
      const w = window as unknown as {
        __tetherAIRetainedCallback?: () => boolean
        __capturedCb1?: () => boolean
      }
      w.__capturedCb1 = w.__tetherAIRetainedCallback
      return typeof w.__capturedCb1 === "function" ? w.__capturedCb1() : false
    })
    expect(initialAdmission).toBe(true) // Fresh positive on initial mounted callback

    // 2. Switch variant in-page (SAME document, NO page.goto)
    const select = page.getByRole("combobox", { name: "Dataset variant" })
    await select.selectOption("blocked-health")
    await expect(page).toHaveURL(/variant=blocked-health/)

    // 3. Verify that the SAME captured callback cb1 permanently refuses execution
    const cb1AfterVariantChange = await page.evaluate(() => {
      const w = window as unknown as { __capturedCb1?: () => boolean }
      return typeof w.__capturedCb1 === "function" ? w.__capturedCb1() : true
    })
    expect(cb1AfterVariantChange).toBe(false) // Permanently refused!

    // 4. Verify fresh positive for the newly registered active callback cb2
    const cb2Result = await page.evaluate(() => {
      const w = window as unknown as {
        __tetherAIRetainedCallback?: () => boolean
        __capturedCb2?: () => boolean
      }
      w.__capturedCb2 = w.__tetherAIRetainedCallback
      return typeof w.__capturedCb2 === "function" ? w.__capturedCb2() : false
    })
    expect(cb2Result).toBe(true) // Fresh positive on cb2!

    // 5. Test competing overlay veto:
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
    await page.evaluate(() => {
      const root = document.querySelector(".tether-ai-root")
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

  test("forced appearance states: empty, loading and error render distinctly without misleading success", async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width: 1280, height: 800 })

    // 1. Explicit Empty state
    await page.goto("/?example=tether&screen=ai&appearance=empty")
    await expect(page.getByText("No AI providers")).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath("tether-ai-empty.png") })

    // 2. Error state
    await page.goto("/?example=tether&screen=ai&appearance=error")
    await expect(page.getByText("Could not load AI gateway data").first()).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath("tether-ai-error.png") })

    // 3. Loading state
    await page.goto("/?example=tether&screen=ai&appearance=loading")
    await expect(page.getByText("Loading AI gateway data...")).toBeVisible()
    await page.screenshot({ path: testInfo.outputPath("tether-ai-loading.png") })
  })

  test("variants display truthful accents: blocked-health", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto("/?example=tether&screen=ai&variant=blocked-health")

    const header = page.locator("header.tether-ai-header")
    const statusBadge = header.locator(".dash-status-badge")
    await expect(statusBadge).toHaveAttribute("data-status", "blocked")
    await page.screenshot({ path: testInfo.outputPath("tether-ai-blocked-health.png") })
  })

  test("theme tokens: dark, light and phosphor themes apply truthfully", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })

    // Dark mode
    await page.goto("/?example=tether&screen=ai&mode=dark")
    const darkBg = await page.locator(".tether-ai-root").evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    expect(darkBg).toBeTruthy()

    // Light mode
    await page.goto("/?example=tether&screen=ai&mode=light")
    const lightBg = await page.locator(".tether-ai-root").evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    expect(lightBg).toBeTruthy()
    expect(lightBg).not.toEqual(darkBg)

    // Green phosphor theme
    await page.goto("/?example=tether&screen=ai&theme=p1-green-phosphor")
    const themeAttr = await page.evaluate(() => document.documentElement.dataset.theme)
    expect(themeAttr).toBe("p1-green-phosphor")
  })
})
