import { expect, test } from "@playwright/test"

const storybookPort = process.env.STORYBOOK_PORT ?? "18542"
const storybookBase = `http://127.0.0.1:${storybookPort}`

test("desktop aside width presets and collapsed sliver-free reservation", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto("/?view=Layouts&aside=1&asideWidth=regular")

  // Verify desktop aside is visible
  const aside = page.locator('[data-slot="app-shell-aside"]')
  await expect(aside).toBeVisible()

  // Verify regular width preset (384px / 24rem)
  const regularBox = await aside.boundingBox()
  expect(regularBox).not.toBeNull()
  expect(Math.round(regularBox?.width)).toBe(384)

  // Switch to compact width preset (320px / 20rem)
  const widthSelect = page.getByLabel("Aside width", { exact: true })
  await widthSelect.selectOption("compact")
  await expect(aside).toHaveClass(/w-80/)
  const compactBox = await aside.boundingBox()
  expect(compactBox).not.toBeNull()
  expect(Math.round(compactBox?.width)).toBe(320)

  // Switch to wide width preset (448px / 28rem)
  await widthSelect.selectOption("wide")
  await expect(aside).toHaveClass(/w-112/)
  const wideBox = await aside.boundingBox()
  expect(wideBox).not.toBeNull()
  expect(Math.round(wideBox?.width)).toBe(448)

  // Collapse aside: verify zero space/sliver reserved
  const collapseCheckbox = page.getByRole("checkbox", { name: /Collapse aside|Aside collapsed/ })
  await collapseCheckbox.check()

  // In desktop collapsed state, aside element is unmounted or has 0 width
  await expect(aside).not.toBeVisible()

  // Verify expand button appears and restores aside
  const expandBtn = page.getByRole("button", { name: "Expand aside companion" })
  await expect(expandBtn).toBeVisible()
  await expandBtn.click()
  await expect(aside).toBeVisible()
  expect(Math.round((await aside.boundingBox())?.width)).toBe(448)

  await page.screenshot({
    path: info.outputPath("app-shell-aside-desktop-wide.png"),
    animations: "disabled",
  })
})

test("independent aside and body scroll ownership with pinned header and footer", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 600 })
  await page.goto("/?view=Layouts&aside=1&scenario=large")

  const bodyScroll = page.getByTestId("layout-scroll")
  const asideScroll = page.locator('[data-slot="app-shell-aside-body"]')

  await expect(bodyScroll).toBeVisible()
  await expect(asideScroll).toBeVisible()

  // Both containers have overflow
  const bodyHasOverflow = await bodyScroll.evaluate((el) => el.scrollHeight > el.clientHeight)
  const asideHasOverflow = await asideScroll.evaluate((el) => el.scrollHeight > el.clientHeight)
  expect(bodyHasOverflow).toBe(true)
  expect(asideHasOverflow).toBe(true)

  // Initial scroll positions are 0
  expect(await bodyScroll.evaluate((el) => el.scrollTop)).toBe(0)
  expect(await asideScroll.evaluate((el) => el.scrollTop)).toBe(0)

  // Scroll body: aside scrollTop remains 0
  await bodyScroll.evaluate((el) => {
    el.scrollTop = 150
  })
  expect(await bodyScroll.evaluate((el) => el.scrollTop)).toBe(150)
  expect(await asideScroll.evaluate((el) => el.scrollTop)).toBe(0)

  // Scroll aside: body scrollTop remains unchanged
  await asideScroll.evaluate((el) => {
    el.scrollTop = 200
  })
  expect(await asideScroll.evaluate((el) => el.scrollTop)).toBe(200)
  expect(await bodyScroll.evaluate((el) => el.scrollTop)).toBe(150)

  // Verify pinned header bounds (y = 0)
  const header = page.locator(".workbench-header-entry")
  const headerBox = await header.boundingBox()
  expect(headerBox).not.toBeNull()
  expect(headerBox?.y).toBeLessThanOrEqual(5)

  // Document itself does not scroll vertically
  const docScrolls = await page.evaluate(() => document.documentElement.scrollHeight > innerHeight)
  expect(docScrolls).toBe(false)
})

test("narrow 390px fallback to OverlaySidebar with admitted focus return", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/?view=Layouts&aside=1")

  // On narrow view, desktop aside element is not visible
  const desktopAside = page.locator('[data-slot="app-shell-aside"]')
  await expect(desktopAside).not.toBeVisible()

  // Default OverlaySidebar trigger is rendered
  const trigger = page.locator('[data-slot="app-shell-aside-trigger"]')
  await expect(trigger).toBeVisible()

  // Open the drawer
  await trigger.click()
  const drawer = page.getByRole("dialog")
  await expect(drawer).toBeVisible()
  await expect(drawer).toContainText("Operations aside slot")
  await expect(page.getByTestId("aside-companion")).toBeVisible()

  // Document does not overflow 390px horizontally
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)

  await page.screenshot({
    path: info.outputPath("app-shell-aside-narrow-drawer.png"),
    animations: "disabled",
  })

  // Close with Escape: focus returns to trigger
  await page.keyboard.press("Escape")
  await expect(drawer).not.toBeVisible()
  await expect(trigger).toBeFocused()
})

test("narrow-short 390x420 viewport preserves geometry and usability", async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 420 })
  await page.goto("/?view=Layouts&aside=1&navigation=drawer")

  const trigger = page.locator('[data-slot="app-shell-aside-trigger"]')
  await expect(trigger).toBeVisible()

  // Shell main preserves geometry
  const main = page.locator("main")
  await expect(main).toBeVisible()
  expect(await main.evaluate((el) => el.clientHeight)).toBeGreaterThan(100)

  // Open overlay sidebar
  await trigger.click()
  const drawer = page.getByRole("dialog")
  await expect(drawer).toBeVisible()
  await expect(page.getByTestId("aside-companion")).toBeVisible()

  // No horizontal document overflow
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)

  await page.screenshot({
    path: info.outputPath("app-shell-aside-narrow-short.png"),
    animations: "disabled",
  })

  await page.keyboard.press("Escape")
  await expect(drawer).not.toBeVisible()
  await expect(trigger).toBeFocused()
})

test("desktop preference preservation across breakpoint resize", async ({ page }) => {
  // Start on desktop with wide preset
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto("/?view=Layouts&aside=1&asideWidth=wide")

  const aside = page.locator('[data-slot="app-shell-aside"]')
  await expect(aside).toBeVisible()
  expect(Math.round((await aside.boundingBox())?.width)).toBe(448)

  // Resize to narrow (390px)
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(aside).not.toBeVisible()
  const trigger = page.locator('[data-slot="app-shell-aside-trigger"]')
  await expect(trigger).toBeVisible()

  // Resize back to desktop (1280px)
  await page.setViewportSize({ width: 1280, height: 800 })
  await expect(aside).toBeVisible()
  // Wide width preset is preserved!
  expect(Math.round((await aside.boundingBox())?.width)).toBe(448)
})

test("Storybook stories: AppShell aside isolated variants", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 })

  // 1. Regular width story
  await page.goto(
    `${storybookBase}/iframe.html?id=layouts-appshell-aside--regular-width&viewMode=story`,
  )
  const regularAside = page.locator('[data-slot="app-shell-aside"]')
  await expect(regularAside).toBeVisible()
  expect(Math.round((await regularAside.boundingBox())?.width)).toBe(384)

  // 2. Compact width story
  await page.goto(
    `${storybookBase}/iframe.html?id=layouts-appshell-aside--compact-width&viewMode=story`,
  )
  const compactAside = page.locator('[data-slot="app-shell-aside"]')
  await expect(compactAside).toBeVisible()
  expect(Math.round((await compactAside.boundingBox())?.width)).toBe(320)

  // 3. Wide width story
  await page.goto(
    `${storybookBase}/iframe.html?id=layouts-appshell-aside--wide-width&viewMode=story`,
  )
  const wideAside = page.locator('[data-slot="app-shell-aside"]')
  await expect(wideAside).toBeVisible()
  expect(Math.round((await wideAside.boundingBox())?.width)).toBe(448)

  // 4. Collapsed aside (0 width)
  await page.goto(
    `${storybookBase}/iframe.html?id=layouts-appshell-aside--collapsed-aside-no-sliver&viewMode=story`,
  )
  await expect(page.locator('[data-slot="app-shell-aside"]')).not.toBeVisible()
  const expandBtn = page.getByRole("button", { name: /Expand aside companion|Open aside/ }).first()
  await expect(expandBtn).toBeVisible()

  // 5. Empty aside adoption
  await page.goto(
    `${storybookBase}/iframe.html?id=layouts-appshell-aside--empty-aside-adoption&viewMode=story`,
  )
  await expect(page.getByTestId("empty-aside")).toBeVisible()

  // 6. Hook interactive demo
  await page.goto(
    `${storybookBase}/iframe.html?id=layouts-appshell-aside--with-aside-hook&viewMode=story`,
  )
  const hookAside = page.getByLabel("Hook-driven aside slot")
  await expect(hookAside).toBeVisible()
  // Initial compact
  expect(Math.round((await hookAside.boundingBox())?.width)).toBe(320)
  // Switch to wide
  await page.getByLabel("Aside width selector").selectOption("wide")
  expect(Math.round((await hookAside.boundingBox())?.width)).toBe(448)
})

test("All 10 public themes and both modes visual evidence capture", async ({ page }, info) => {
  await page.setViewportSize({ width: 1280, height: 720 })

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
  const modes = ["dark", "light"]

  for (const theme of themes) {
    for (const mode of modes) {
      await page.goto(`/?view=Layouts&aside=1&theme=${theme}&mode=${mode}`)
      const aside = page.locator('[data-slot="app-shell-aside"]')
      await expect(aside).toBeVisible()

      // Confirm root attributes
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme)
      await expect(page.locator("html")).toHaveAttribute("data-mode", mode)

      await page.screenshot({
        path: info.outputPath(`theme-${theme}-${mode}.png`),
        animations: "disabled",
      })
    }
  }
})

test("zero breaking changes: standard AppShell without aside remains unchanged", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  await page.goto("/?view=Layouts")

  // No aside elements rendered
  await expect(page.locator('[data-slot="app-shell-aside"]')).toHaveCount(0)
  await expect(page.locator('[data-slot="app-shell-aside-trigger"]')).toHaveCount(0)

  // Navigation and body intact
  await expect(page.getByRole("heading", { name: "Layouts", exact: true })).toBeVisible()
  await expect(page.getByTestId("layout-scroll")).toBeVisible()
})
