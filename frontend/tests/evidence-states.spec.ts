import { expect, test } from "@playwright/test"

const view = "/?view=Evidence+States&theme=p4-white&mode=light"
test("native supplemental help has actual description, Escape and current visible evidence", async ({
  page,
}) => {
  await page.goto(view)
  const trigger = page.getByRole("button", { name: "Source help", exact: true })
  await trigger.focus()
  await page.keyboard.press("Shift+Tab")
  await page.keyboard.press("Tab")
  await expect(page.getByRole("tooltip")).toBeVisible()
  await expect(trigger).toHaveAttribute(
    "aria-describedby",
    (await page.getByRole("tooltip").getAttribute("id")) as string,
  )
  await expect(page.getByRole("tooltip")).toContainText("Admitted matching runs 8")
  await trigger.evaluate((e) => {
    const key = Object.keys(e).find((k) => k.startsWith("__reactFiber"))
    let fiber = key ? (e as unknown as Record<string, any>)[key] : null
    while (fiber) {
      if (fiber.memoizedProps?.onOpenChange && typeof fiber.memoizedProps.open === "boolean") {
        ;(window as any).oldHelp = fiber.memoizedProps.onOpenChange
        break
      }
      fiber = fiber.return
    }
  })
  await page.keyboard.press("Escape")
  await expect(page.getByRole("tooltip")).toHaveCount(0)
  await page.evaluate(() => {
    ;(window as any).oldHelp(true)
  })
  await expect(page.getByRole("tooltip")).toHaveCount(0)
  await expect(trigger).toBeFocused()
  await page.keyboard.press("Tab")
  await trigger.focus()
  await page.keyboard.press("Shift+Tab")
  await page.keyboard.press("Tab")
  await expect(page.getByRole("tooltip")).toBeVisible()
  const line = page.getByRole("separator")
  const b = await line.boundingBox()
  expect(b?.width).toBeGreaterThan(100)
  expect(b?.height).toBeGreaterThan(0)
  expect(b?.height).toBeLessThan(4)
})
test("delayed native hover and captured source callbacks retire on context and appearance", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:18545" + view)
  const trigger = page.getByRole("button", { name: "Source help", exact: true })
  await trigger.hover()
  await expect(page.getByRole("tooltip")).toHaveCount(0)
  await page.getByLabel("Scenario", { exact: true }).selectOption("empty")
  await page.waitForTimeout(400)
  await expect(page.getByRole("tooltip")).toHaveCount(0)
  await expect(
    page.getByRole("region", { name: "Current evidence companion", exact: true }),
  ).toContainText("Admitted matching runs 0")
  await page.getByLabel("Evidence appearance", { exact: true }).selectOption("unknown")
  await expect(page.getByRole("status").filter({ hasText: "Evidence unavailable" })).toContainText(
    "Unknown",
  )
  await trigger.focus()
  await page.keyboard.press("Shift+Tab")
  await page.keyboard.press("Tab")
  await expect(page.getByRole("tooltip")).toContainText("authored unknown resource")
  await page.getByRole("button", { name: "Open Review Workbench", exact: true }).click()
  await expect(page.getByRole("tooltip")).toHaveCount(0)
})
test("declared loading alone has passive pulse and actual reduced motion; blocked phases never retain counts", async ({
  page,
}) => {
  await page.goto(view + "&scenario=loading")
  const loading = page.getByRole("region", { name: "Loading evidence appearance", exact: true })
  await expect(loading).toHaveAttribute("aria-busy", "true")
  await expect(loading.locator("[aria-hidden=true]")).toBeVisible()
  expect(
    await page
      .locator(".evidence-skeleton")
      .first()
      .evaluate((e) => getComputedStyle(e).animationName),
  ).not.toBe("none")
  await page.emulateMedia({ reducedMotion: "reduce" })
  expect(
    await page
      .locator(".evidence-skeleton")
      .first()
      .evaluate((e) => getComputedStyle(e).animationName),
  ).toBe("none")
  for (const phase of ["error", "permission-denied", "unavailable"]) {
    await page.getByLabel("Scenario", { exact: true }).selectOption(phase)
    await expect(loading).toHaveCount(0)
    await expect(
      page.getByRole("region", { name: "Current evidence companion", exact: true }),
    ).toContainText("Admitted matching runs Unknown")
  }
})
test("actual complete desktop and dark narrow source-help portal are bounded inert and contrasted", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(view)
  await page.screenshot({ path: info.outputPath("evidence-states-desktop.png") })
  await page.getByLabel("Evidence appearance", { exact: true }).selectOption("long")
  await page.getByRole("button", { name: "Source help", exact: true }).focus()
  await page.keyboard.press("Shift+Tab")
  await page.keyboard.press("Tab")
  await expect(page.getByRole("tooltip")).toBeVisible()
  await page.screenshot({ path: info.outputPath("evidence-states-help-desktop.png") })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(view.replace("p4-white&mode=light", "p1-green-phosphor&mode=dark"))
  await page.getByLabel("Evidence appearance", { exact: true }).selectOption("long")
  await page.getByRole("button", { name: "Source help", exact: true }).focus()
  await page.keyboard.press("Shift+Tab")
  await page.keyboard.press("Tab")
  const tip = page.getByRole("tooltip")
  await expect(tip).toBeVisible()
  await expect(tip).toContainText("<script>")
  const b = await tip.boundingBox()
  expect(b?.x).toBeGreaterThanOrEqual(0)
  expect((b?.x ?? 0) + (b?.width ?? 0)).toBeLessThanOrEqual(390)
  const paint = await tip.evaluate((e) => ({
    fg: getComputedStyle(e).color,
    bg: getComputedStyle(e).backgroundColor,
  }))
  expect(paint.fg).not.toBe(paint.bg)
  expect(paint.bg).not.toBe("rgba(0, 0, 0, 0)")
  await expect(tip.locator("script,a")).toHaveCount(0)
  await page.screenshot({ path: info.outputPath("evidence-states-help-narrow.png") })
  await page.keyboard.press("Escape")
  await page.goto(view + "&scenario=loading")
  await page
    .getByRole("region", { name: "Loading evidence appearance", exact: true })
    .evaluate((e) => {
      const p = document.querySelector(".page-scroll")!
      p.scrollTop += e.getBoundingClientRect().top - p.getBoundingClientRect().top - 12
    })
  await page.screenshot({ path: info.outputPath("evidence-states-loading-narrow.png") })
})
test("portable current query and native phase states remain API-free", async ({ page }) => {
  const forbidden: string[] = []
  page.on("request", (r) => {
    if (/\/(api|plugins)\//.test(r.url()) || r.method() !== "GET") forbidden.push(r.url())
  })
  for (const state of [
    "ready",
    "prefix",
    "empty",
    "loading",
    "failure",
    "denied",
    "unknown",
    "long",
  ]) {
    await page.goto(
      `http://127.0.0.1:18542/iframe.html?id=review-evidence-states--${state}&viewMode=story`,
    )
    await expect(page.getByRole("region", { name: "Evidence States", exact: true })).toBeVisible()
  }
  await page
    .getByLabel("Authored context query", { exact: true })
    .fill("no matching supplied record")
  await expect(
    page.getByRole("region", { name: "Current evidence companion", exact: true }),
  ).toContainText("Admitted matching runs 0")
  expect(forbidden).toEqual([])
})
