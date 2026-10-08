import { expect, test } from "@playwright/test"

const view = "/?view=Appearance+Review&theme=p4-white&mode=light"
const regionName = "Local appearance controls"
test("native palette selection proves all four scoped light/dark semantic roles without host recoloring", async ({
  page,
}) => {
  await page.goto(view)
  const controls = page.getByRole("region", { name: regionName, exact: true }),
    sample = page.getByRole("region", { name: "Readonly semantic specimen", exact: true })
  const host = await page.locator("html").evaluate((e) => ({
    theme: e.getAttribute("data-theme"),
    mode: e.getAttribute("data-mode"),
    fg: getComputedStyle(e).getPropertyValue("--color-fg"),
    bg: getComputedStyle(e).getPropertyValue("--color-bg"),
  }))
  const picker = controls.getByLabel("Theme", { exact: true })
  await picker.focus()
  await page.keyboard.press("Home")
  await page.keyboard.press("ArrowDown")
  await page.keyboard.press("Enter")
  await expect(sample).toHaveAttribute("data-theme", "p1-green-phosphor")
  for (const palette of ["p4-white", "p1-green-phosphor", "p3-amber-phosphor", "hi-contrast"]) {
    await picker.selectOption(palette)
    const paints = []
    for (const mode of ["light", "dark"]) {
      if ((await sample.getAttribute("data-mode")) !== mode)
        await controls.getByRole("button", { name: `Switch to ${mode} mode`, exact: true }).click()
      await expect(sample).toHaveAttribute("data-mode", mode)
      const paint = await sample.evaluate((e) => {
        const c = getComputedStyle(e)
        return {
          fg: c.color,
          bg: c.backgroundColor,
          border: c.borderColor,
          hl: c.getPropertyValue("--hl-fg").trim(),
        }
      })
      expect(paint.hl.length).toBeGreaterThan(0)
      expect(paint.bg).not.toBe("rgba(0, 0, 0, 0)")
      expect(paint.fg).not.toBe(paint.bg)
      paints.push(paint.fg + paint.bg)
    }
    expect(paints[0]).not.toBe(paints[1])
  }
  expect(
    await page.locator("html").evaluate((e) => ({
      theme: e.getAttribute("data-theme"),
      mode: e.getAttribute("data-mode"),
      fg: getComputedStyle(e).getPropertyValue("--color-fg"),
      bg: getComputedStyle(e).getPropertyValue("--color-bg"),
    })),
  ).toEqual(host)
  await sample.getByRole("button", { name: "Inspect specimen focus", exact: true }).focus()
  await page.keyboard.press("Shift+Tab")
  await page.keyboard.press("Tab")
  await expect(
    sample.getByRole("button", { name: "Inspect specimen focus", exact: true }),
  ).toBeFocused()
  expect(
    await sample
      .getByRole("button", { name: "Inspect specimen focus", exact: true })
      .evaluate((e) => getComputedStyle(e).outlineStyle),
  ).toBe("solid")
})
test("actual checkbox and default switch native Space paint purposefully change annotations and density", async ({
  page,
}) => {
  await page.goto(view)
  const controls = page.getByRole("region", { name: regionName, exact: true }),
    sample = page.getByRole("region", { name: "Readonly semantic specimen", exact: true })
  const checkbox = controls.getByRole("checkbox", { name: "Show annotations", exact: true }),
    toggle = controls.getByRole("switch", { name: "Dense preview", exact: true })
  await expect(checkbox).toBeChecked()
  await expect(checkbox.locator('[data-slot="checkbox-indicator"]')).toBeVisible()
  await expect(sample.locator(".appearance-annotations")).toBeVisible()
  const checked = await checkbox.evaluate((e) => getComputedStyle(e).backgroundColor)
  await checkbox.focus()
  await page.keyboard.press("Space")
  await expect(checkbox).not.toBeChecked()
  await expect(checkbox.locator('[data-slot="checkbox-indicator"]')).toBeHidden()
  await expect(sample.locator(".appearance-annotations")).toHaveCount(0)
  await expect
    .poll(() => checkbox.evaluate((e) => getComputedStyle(e).backgroundColor))
    .not.toBe(checked)
  await expect(
    page.getByRole("region", { name: "Exact appearance companion", exact: true }),
  ).toContainText("--hl-fg")
  const padding = await sample.evaluate((e) => parseFloat(getComputedStyle(e).paddingTop)),
    thumb = toggle.locator('[data-slot="switch-thumb"]')
  const before = await thumb.evaluate((e) => e.getBoundingClientRect().x)
  const uncheckedPaint = await toggle.evaluate((e) => getComputedStyle(e).backgroundColor)
  await toggle.focus()
  await page.keyboard.press("Space")
  await expect(toggle).toBeChecked()
  await expect
    .poll(() => toggle.evaluate((e) => getComputedStyle(e).backgroundColor))
    .not.toBe(uncheckedPaint)
  await expect(toggle).toHaveAttribute("data-size", "default")
  await expect
    .poll(() => sample.evaluate((e) => parseFloat(getComputedStyle(e).paddingTop)))
    .toBe(padding / 2)
  await expect
    .poll(() => thumb.evaluate((e) => e.getBoundingClientRect().x))
    .toBeGreaterThan(before)
  await checkbox.focus()
  await page.keyboard.press("Space")
  await expect(sample.locator(".appearance-annotations")).toBeVisible()
})
test("StrictMode fresh system listener survives ordinary controls and obsolete listener/control callbacks refuse", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = window.matchMedia.bind(window)
    const records: Array<{ callback: EventListenerOrEventListenerObject; removed: boolean }> = []
    Object.assign(window, { appearanceMediaRecords: records })
    window.matchMedia = (query) => {
      const m = original(query),
        add = m.addEventListener.bind(m),
        remove = m.removeEventListener.bind(m)
      if (query !== "(prefers-color-scheme: dark)") return m
      m.addEventListener = ((
        type: string,
        callback: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
      ) => {
        if (type === "change") records.push({ callback, removed: false })
        add(type, callback, options)
      }) as typeof m.addEventListener
      m.removeEventListener = ((
        type: string,
        callback: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions,
      ) => {
        const r = records.find((r) => r.callback === callback && !r.removed)
        if (r) r.removed = true
        remove(type, callback, options)
      }) as typeof m.removeEventListener
      return m
    }
  })
  await page.emulateMedia({ colorScheme: "light" })
  await page.goto(`http://127.0.0.1:18545${view}`)
  const controls = page.getByRole("region", { name: regionName, exact: true }),
    sample = page.getByRole("region", { name: "Readonly semantic specimen", exact: true })
  await controls.getByLabel("Theme", { exact: true }).selectOption("p3-amber-phosphor")
  await controls.getByRole("checkbox", { name: "Show annotations", exact: true }).click()
  await controls.getByRole("switch", { name: "Dense preview", exact: true }).click()
  await expect(controls.getByRole("button", { name: "Use system", exact: true })).toBeDisabled()
  await page.emulateMedia({ colorScheme: "dark" })
  await expect(sample).toHaveAttribute("data-mode", "dark")
  await page.emulateMedia({ colorScheme: "light" })
  await expect(sample).toHaveAttribute("data-mode", "light")
  await controls.getByLabel("Theme", { exact: true }).evaluate((e) => {
    const key = Object.keys(e).find((k) => k.startsWith("__reactProps"))!
    Object.assign(window, {
      oldAppearanceSelect: (
        e as unknown as Record<string, { onChange: (e: { target: { value: string } }) => void }>
      )[key].onChange,
    })
  })
  await controls.getByLabel("Theme", { exact: true }).selectOption("p1-green-phosphor")
  await page.evaluate(() => {
    ;(
      window as unknown as { oldAppearanceSelect: (e: { target: { value: string } }) => void }
    ).oldAppearanceSelect({ target: { value: "hi-contrast" } })
  })
  await expect(sample).toHaveAttribute("data-theme", "p1-green-phosphor")
  await page.getByLabel("Scenario", { exact: true }).selectOption("empty")
  await expect(sample).toHaveAttribute("data-theme", "p4-white")
  await page.evaluate(() => {
    const r = (
      window as unknown as {
        appearanceMediaRecords: Array<{ callback: () => void; removed: boolean }>
      }
    ).appearanceMediaRecords
    r.filter((x) => x.removed).forEach((x) => {
      x.callback()
    })
  })
  await expect(sample).toHaveAttribute("data-theme", "p4-white")
  const removed = await page.evaluate(
    () =>
      (
        window as unknown as { appearanceMediaRecords: Array<{ removed: boolean }> }
      ).appearanceMediaRecords.filter((r) => r.removed).length,
  )
  expect(removed).toBeGreaterThan(0)
  await page.getByRole("button", { name: "Review Workbench", exact: true }).click()
  const count = await page.evaluate(
    () =>
      (
        window as unknown as { appearanceMediaRecords: Array<{ removed: boolean }> }
      ).appearanceMediaRecords.filter((r) => !r.removed).length,
  )
  expect(count).toBe(0)
})
test("current playback frame and resource replacements retire prior local controls", async ({
  page,
}) => {
  await page.goto("/?view=Appearance+Review")
  const sample = page.getByRole("region", { name: "Readonly semantic specimen", exact: true }),
    controls = page.getByRole("region", { name: regionName, exact: true })
  await controls.getByLabel("Theme", { exact: true }).selectOption("hi-contrast")
  await controls.getByRole("button", { name: "Switch to dark mode", exact: true }).evaluate((e) => {
    const key = Object.keys(e).find((k) => k.startsWith("__reactProps"))!
    Object.assign(window, {
      oldAppearanceMode: (e as unknown as Record<string, { onClick: () => void }>)[key].onClick,
    })
  })
  await page.getByText("Fixture timeline review", { exact: true }).click()
  await page.getByLabel("Playback position", { exact: true }).fill("1")
  await expect(sample).toHaveAttribute("data-theme", "p4-white")
  await page.evaluate(() => {
    ;(window as unknown as { oldAppearanceMode: () => void }).oldAppearanceMode()
  })
  await expect(sample).toHaveAttribute("data-mode", "light")
  await page.getByRole("button", { name: "Review Workbench", exact: true }).click()
  await page.getByRole("button", { name: "Open Appearance Review", exact: true }).click()
  await expect(sample).toHaveAttribute("data-theme", "p4-white")
  await page.getByLabel("Scenario", { exact: true }).selectOption("permission-denied")
  await expect(controls).toHaveCount(0)
  await expect(sample).toHaveCount(0)
  await expect(page.getByRole("region", { name: "Appearance Review", exact: true })).toContainText(
    "permission-denied",
  )
})
test("complete desktop and dark narrow controls semantic sample exact companion stay bounded", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(view)
  await page.screenshot({ path: info.outputPath("appearance-desktop.png"), animations: "disabled" })
  await page
    .getByRole("region", { name: "Exact appearance companion", exact: true })
    .scrollIntoViewIfNeeded()
  await page.screenshot({
    path: info.outputPath("appearance-companion-desktop.png"),
    animations: "disabled",
  })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto("/?view=Appearance+Review&theme=p1-green-phosphor&mode=dark")
  const sample = page.getByRole("region", { name: "Readonly semantic specimen", exact: true })
  await page.getByRole("region", { name: regionName, exact: true }).evaluate((e) => {
    const p = document.querySelector(".page-scroll")!
    p.scrollTop += e.getBoundingClientRect().top - p.getBoundingClientRect().top - 12
  })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({
    path: info.outputPath("appearance-controls-narrow.png"),
    animations: "disabled",
  })
  await sample.evaluate((e) => {
    const p = document.querySelector(".page-scroll")!
    p.scrollTop += e.getBoundingClientRect().top - p.getBoundingClientRect().top - 12
  })
  const light = await sample.evaluate((e) => getComputedStyle(e).backgroundColor)
  expect(light).toBe("rgb(250, 250, 250)")
  await page.screenshot({
    path: info.outputPath("appearance-specimen-narrow.png"),
    animations: "disabled",
  })
  await page
    .getByRole("region", { name: "Exact appearance companion", exact: true })
    .evaluate((e) => {
      const p = document.querySelector(".page-scroll")!
      p.scrollTop += e.getBoundingClientRect().top - p.getBoundingClientRect().top - 12
    })
  await page.screenshot({
    path: info.outputPath("appearance-companion-narrow.png"),
    animations: "disabled",
  })
})
test("portable unsupported resources literal labels and same-result context retirement are API-free", async ({
  page,
}) => {
  const requests: string[] = []
  page.on("request", (r) => {
    if (/\/api\/|\/plugins\//.test(r.url()) || r.method() !== "GET") requests.push(r.url())
  })
  for (const id of ["unknown-palette", "unavailable", "denied"]) {
    await page.goto(`http://127.0.0.1:18542/iframe.html?id=review-appearance--${id}&viewMode=story`)
    await expect(page.getByRole("region", { name: regionName, exact: true })).toHaveCount(0)
    await expect(
      page.getByRole("region", { name: "Appearance Review", exact: true }),
    ).toContainText("Controls withheld")
  }
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=review-appearance--long-label&viewMode=story",
  )
  await expect(
    page
      .getByRole("region", { name: regionName, exact: true })
      .getByLabel("Theme", { exact: true }),
  ).toContainText("<script>inert</script>")
  await expect(page.locator(".appearance-review a,.appearance-review script")).toHaveCount(0)
  await page.getByLabel("Authored context query", { exact: true }).fill("gateway")
  await page
    .getByRole("region", { name: regionName, exact: true })
    .getByLabel("Theme", { exact: true })
    .selectOption("hi-contrast")
  await page.getByLabel("Authored context query", { exact: true }).fill("gateway permission")
  await expect(
    page.getByRole("region", { name: "Readonly semantic specimen", exact: true }),
  ).toHaveAttribute("data-theme", "p4-white")
  expect(requests).toEqual([])
})
