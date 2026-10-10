import { fileURLToPath } from "node:url"
import { expect, test } from "@playwright/test"
import type { controls as specimenControls } from "../src/nil-radial/Specimen"

declare global {
  interface Window {
    nilRadial: typeof specimenControls
  }
}
test.use({
  baseURL: `http://127.0.0.1:${process.env.NIL_PORT ?? 18545}`,
  launchOptions: { executablePath: process.env.NIL_CHROMIUM, args: ["--no-sandbox"] },
})
const screenshotRoot = fileURLToPath(new URL("../../.scratch/nil-radial/", import.meta.url))
const rowId = "nil-demo-4421-101"
test.beforeEach(async ({ page }) => {
  await page.goto("/nil-radial.html")
})
test("native pointer hold, release custody and independent click", async ({ page }) => {
  const row = page.getByTestId(rowId),
    box = await row.boundingBox()
  await page.mouse.move(box!.x + 30, box!.y + 20)
  await page.mouse.down()
  await expect(page.getByRole("menu")).toBeVisible({ timeout: 2000 })
  await page.mouse.up()
  await expect(page.getByRole("menu")).toBeVisible()
  await expect(page.getByTestId("inspections")).toHaveText("0")
  await page.getByRole("menuitem", { name: "Close menu" }).click()
  await row.click()
  await expect(page.getByTestId("inspections")).toHaveText("1")
  await page.getByTestId("unrelated").click()
  await expect(page.getByTestId("other-clicks")).toHaveText("1")
})
test("native short hold, movement, leave and scroll cancellation", async ({ page }) => {
  const row = page.getByTestId(rowId),
    box = await row.boundingBox()
  await row.click()
  await expect(page.getByTestId("inspections")).toHaveText("1")
  for (const cancel of ["move", "leave", "scroll"]) {
    await page.mouse.move(box!.x + 20, box!.y + 20)
    await page.mouse.down()
    if (cancel === "move") await page.mouse.move(box!.x + 29, box!.y + 20)
    if (cancel === "leave") await page.mouse.move(1, 1)
    if (cancel === "scroll") await page.evaluate(() => document.dispatchEvent(new Event("scroll")))
    await page.waitForTimeout(1100)
    await expect(page.getByRole("menu")).toHaveCount(0)
    await page.mouse.up()
  }
})
test("keyboard fixed actions, disabled action, more/back, nested Escape and focus return", async ({
  page,
}) => {
  const row = page.getByTestId(rowId)
  await row.focus()
  await page.keyboard.press("Shift+F10")
  await expect(page.getByRole("menu")).toBeVisible()
  await expect(page.getByRole("menuitem", { name: "NOW", exact: true })).toBeDisabled()
  await expect(page.getByRole("menuitem", { name: "SOON", exact: true })).toBeFocused()
  await page.keyboard.press("ArrowRight")
  await expect(page.getByRole("menuitem", { name: "ANY", exact: true })).toBeFocused()
  await page.getByRole("menuitem", { name: "MORE", exact: true }).click()
  await expect(page.getByRole("menuitem", { name: "ARCH", exact: true })).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("menuitem", { name: "MORE", exact: true })).toBeFocused()
  // Synthetic fixture setup opens a sibling popup; Escape below is native.
  await page
    .getByRole("button", { name: "Nested popup" })
    .evaluate((button: HTMLButtonElement) => button.click())
  await page.keyboard.press("Escape")
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(page.getByRole("menu")).toBeVisible()
  await row.focus()
  await page.keyboard.press("Escape")
  await expect(page.getByRole("menu")).toHaveCount(0)
  await expect(row).toBeFocused()
  await expect(page.getByRole("textbox", { name: "Background query" })).toHaveValue("+tutorial")
})
for (const viewport of [
  { width: 1280, height: 800 },
  { width: 390, height: 420 },
]) {
  test(`viewport clamp at both edges ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    for (const edge of ["Top left edge", "Bottom right edge"]) {
      await page.getByRole("button", { name: edge }).click()
      await expect(page.getByRole("menu")).toBeVisible()
      const buttons = await page.getByRole("menuitem").all()
      for (const button of buttons) {
        const box = await button.boundingBox()
        expect(box!.x).toBeGreaterThanOrEqual(0)
        expect(box!.y).toBeGreaterThanOrEqual(0)
        expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width)
        expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height)
      }
      await page.screenshot({
        path: `${screenshotRoot}edge-${viewport.width}-${edge.startsWith("Top") ? "top" : "bottom"}.png`,
      })
      await page.keyboard.press("Escape")
    }
  })
}
test("source replacement retires retained hook lease without reviving cancel", async ({ page }) => {
  await page.getByRole("button", { name: "Replace source" }).click()
  const result = await page.evaluate(() => {
    const controls = window.nilRadial
    return { old: controls.retained.at(-1)?.isLive(), current: controls.current?.isLive() }
  })
  expect(result).toEqual({ old: false, current: true })
})
test("Chromium touch emulation hold and native touchmove cancellation (no hardware claim)", async ({
  page,
}) => {
  const cdp = await page.context().newCDPSession(page)
  await cdp.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 })
  const row = page.getByTestId(rowId),
    box = await row.boundingBox()
  const x = box!.x + 25,
    y = box!.y + 20
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] })
  await expect(page.getByRole("menu")).toBeVisible({ timeout: 2500 })
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] })
  await expect(page.getByTestId("inspections")).toHaveText("0")
  await page.keyboard.press("Escape")
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] })
  await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y + 20 }] })
  await page.waitForTimeout(1100)
  await expect(page.getByRole("menu")).toHaveCount(0)
  await cdp.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] })
  // The standalone button leaves the target exposed after firing, so an
  // overlay cannot account for the release-click negative.
  const secondary = await page.getByTestId("secondary-hold").boundingBox()
  if (!secondary) throw new Error("Secondary hold missing")
  const secondaryPoint = {
    x: secondary.x + secondary.width / 2,
    y: secondary.y + secondary.height / 2,
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [secondaryPoint] })
  await expect(page.getByTestId("secondary-holds")).toHaveText("1", { timeout: 2500 })
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] })
  await expect(page.getByTestId("secondary-clicks")).toHaveText("0")
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [secondaryPoint] })
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] })
  await expect(page.getByTestId("secondary-clicks")).toHaveText("1")
})
test("second message idiom, opaque center-like ID, long label, tab and disabled controls", async ({
  page,
}) => {
  await page.goto("/nil-radial.html?idiom=message")
  await page.getByTestId(rowId).focus()
  await page.keyboard.press("Shift+F10")
  await expect(
    page.getByRole("menuitem", { name: "Reply to this unusually long message label" }),
  ).toBeFocused()
  await page.keyboard.press("Tab")
  await expect(page.getByRole("menuitem", { name: "Copy", exact: true })).toBeFocused()
  await page.keyboard.press("Tab")
  await expect(page.getByRole("menuitem", { name: "Close menu" })).toBeFocused()
  await page.keyboard.press("Shift+Tab")
  await page.keyboard.press("Enter")
  await expect(page.getByTestId("actions")).toContainText("__center")
  await expect(page.getByRole("menu")).toHaveCount(0)
})
test("synthetic composition lifetime and editable custody retain native keys", async ({ page }) => {
  const row = page.getByTestId(rowId)
  await row.focus()
  await row.dispatchEvent("compositionstart", { data: "x" })
  await page.keyboard.press("Shift+F10")
  await expect(page.getByRole("menu")).toHaveCount(0)
  await row.dispatchEvent("compositionend", { data: "x" })
  await page.keyboard.press("Shift+F10")
  await expect(page.getByRole("menu")).toBeVisible()
  await page
    .getByRole("menuitem", { name: "SOON", exact: true })
    .dispatchEvent("compositionstart", { data: "x" })
  await page.keyboard.press("Enter")
  await expect(page.getByTestId("actions")).toHaveText("")
  await page
    .getByRole("menuitem", { name: "SOON", exact: true })
    .dispatchEvent("compositionend", { data: "x" })
  await page.keyboard.press("Escape")
  await page.getByRole("textbox", { name: "Background query" }).focus()
  await page.keyboard.press("Shift+F10")
  await expect(page.getByRole("menu")).toHaveCount(0)
})

test("native postfire click suppression on a button without an overlay; later pointer and keyboard clicks work", async ({
  page,
}) => {
  const button = page.getByTestId("secondary-hold")
  const box = await button.boundingBox()
  if (!box) throw new Error("Secondary hold missing")
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await expect(page.getByTestId("secondary-holds")).toHaveText("1", { timeout: 2500 })
  await page.mouse.up()
  await expect(page.getByTestId("secondary-clicks")).toHaveText("0")
  await button.click()
  await expect(page.getByTestId("secondary-clicks")).toHaveText("1")
  await button.focus()
  await page.keyboard.press("Enter")
  await expect(page.getByTestId("secondary-clicks")).toHaveText("2")
})

test("plain outside input retains explicit focus across committed position and native viewport changes", async ({
  page,
}) => {
  const row = page.getByTestId(rowId)
  await row.focus()
  await page.keyboard.press("Shift+F10")
  await expect(page.getByRole("menuitem", { name: "SOON", exact: true })).toBeFocused()
  await page.keyboard.press("ArrowRight")
  await expect(page.getByRole("menuitem", { name: "ANY", exact: true })).toBeFocused()
  // Explicit host focus setup; subsequent viewport and keyboard input are native.
  const query = page.getByRole("textbox", { name: "Background query" })
  await query.focus()
  // Synthetic host position change guarantees a menu commit; a viewport
  // change alone can leave the already-clamped center unchanged.
  await page.getByTestId("reposition-menu").evaluate((button: HTMLButtonElement) => button.click())
  await page.setViewportSize({ width: 390, height: 420 })
  await expect(page.getByRole("menuitem", { name: "ANY", exact: true })).toBeInViewport()
  await expect(query).toBeFocused()
  await page.keyboard.press("End")
  await page.keyboard.type("x")
  await expect(query).toHaveValue("+tutorialx")
  await page.keyboard.press("Escape")
  await expect(query).toBeFocused()
  await expect(query).toHaveValue("+tutorialx")
  await expect(page.getByRole("menu")).toBeVisible()
  await page.getByRole("menuitem", { name: "ANY", exact: true }).focus()
  await page.keyboard.press("ArrowRight")
  await expect(page.getByRole("menuitem", { name: "DEL", exact: true })).toBeFocused()
  await page.keyboard.press("Escape")
  await expect(row).toBeFocused()
})

test("retired backdrop press cannot dismiss replacement source; a fresh press can", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  const row = page.getByTestId(rowId)
  await row.focus()
  await page.keyboard.press("Shift+F10")
  await expect(page.getByRole("menuitem", { name: "SOON", exact: true })).toBeFocused()
  await page.mouse.move(1200, 760)
  await page.mouse.down()
  // Synthetic host-source replacement keeps this menu's activation/root while
  // committing a new source. The old press and release are native mouse events.
  await page
    .getByTestId("replace-menu-source")
    .evaluate((button: HTMLButtonElement) => button.click())
  await expect(page.getByRole("menu")).toBeVisible()
  await page.mouse.up()
  await expect(page.getByRole("menu")).toBeVisible()
  await page.mouse.click(1200, 760)
  await expect(page.getByRole("menu")).toHaveCount(0)
  await expect(row).toBeFocused()
})

test("prevented and competing backdrop releases preserve menu; fresh admitted press closes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 })
  const row = page.getByTestId(rowId)
  await row.focus()
  await page.keyboard.press("Shift+F10")
  await expect(page.getByRole("menuitem", { name: "SOON", exact: true })).toBeFocused()
  // Labelled host capture prevention; the initiating press and click are native.
  await page.getByRole("menu").evaluate((menu) =>
    menu.parentElement!.addEventListener("click", (event) => event.preventDefault(), {
      capture: true,
      once: true,
    }),
  )
  await page.mouse.click(1200, 760)
  await expect(page.getByRole("menu")).toBeVisible()
  await page.mouse.move(1200, 760)
  await page.mouse.down()
  // Labelled synthetic fixture setup creates a newer registered foreground owner.
  await page
    .getByRole("button", { name: "Nested popup" })
    .evaluate((button: HTMLButtonElement) => button.click())
  await page.mouse.up()
  await expect(page.getByRole("dialog")).toBeVisible()
  await expect(page.getByRole("menu")).toBeVisible()
  await page.getByRole("button", { name: "Close nested" }).click()
  await page.mouse.move(1200, 760)
  await page.mouse.down()
  // Labelled host root removal/reattachment; the release remains native.
  await page.getByRole("menu").evaluate((menu) => {
    const backdrop = menu.parentElement!
    const parent = backdrop.parentElement!
    backdrop.remove()
    parent.append(backdrop)
  })
  await page.mouse.up()
  await expect(page.getByRole("menu")).toBeVisible()
  await page.mouse.click(1200, 760)
  await expect(page.getByRole("menu")).toHaveCount(0)
  await expect(row).toBeFocused()
})
