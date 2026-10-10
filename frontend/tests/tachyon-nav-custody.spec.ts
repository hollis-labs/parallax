import { expect, test } from "@playwright/test"
import type { diagnostics } from "../src/examples/tachyon-nav/TachyonNav"

declare global {
  interface Window {
    tachyonNav: typeof diagnostics
    heldNav?: () => boolean
  }
}
test.use({ baseURL: `http://127.0.0.1:${process.env.TACHYON_NAV_PORT ?? 18545}` })
for (const boundary of ["source", "access", "layer", "root", "Activity"] as const)
  test(`once-working retained menu refuses committed ${boundary} retirement with fresh positive`, async ({
    page,
  }) => {
    await page.goto("/tachyon-nav-lifecycle.html#/work")
    const trigger = page.getByRole("button", { name: "Header menu", exact: true })
    await trigger.click()
    await expect
      .poll(() => page.evaluate(() => window.tachyonNav.fresh["Header menu"]?.()))
      .toBe(true)
    await page.evaluate(() => {
      window.heldNav = window.tachyonNav.fresh["Header menu"]
    })
    if (boundary === "source")
      await page.getByRole("button", { name: "Replace fixture source", exact: true }).click()
    else await page.getByRole("button", { name: `Toggle fixture ${boundary}`, exact: true }).click()
    if (boundary === "access" || boundary === "layer")
      await expect(page.getByRole("alert").filter({ hasText: "retired" })).toBeVisible()
    if (boundary === "root" || boundary === "Activity")
      await expect(page.getByTestId("tachyon-nav")).toBeHidden()
    if (boundary === "source") await expect(page.getByRole("menu")).toHaveCount(0)
    expect(await page.evaluate(() => window.heldNav?.())).toBe(false)
    if (boundary !== "source")
      await page.getByRole("button", { name: `Toggle fixture ${boundary}`, exact: true }).click()
    await trigger.click()
    await expect
      .poll(() => page.evaluate(() => window.tachyonNav.fresh["Header menu"]?.()))
      .toBe(true)
    expect(await page.evaluate(() => window.heldNav?.())).toBe(false)
  })
for (const role of ["dialog", "menu", "listbox"])
  test(`exact popup yields to newer visible ${role} and plain focus`, async ({ page }) => {
    await page.goto("/tachyon-nav-lifecycle.html#/work")
    await page.getByRole("button", { name: "Header menu", exact: true }).click()
    await page.evaluate(() => {
      window.heldNav = window.tachyonNav.fresh["Header menu"]
    })
    const ready = await page.evaluate((role) => {
      const owner = document.createElement("div")
      owner.id = "new-owner"
      owner.setAttribute("role", role)
      const input = document.createElement("input")
      owner.append(input)
      document.body.prepend(owner)
      input.focus()
      return !!owner.getClientRects().length && document.activeElement === input
    }, role)
    expect(ready).toBe(true)
    expect(await page.evaluate(() => window.heldNav?.())).toBe(false)
    await page.locator("#new-owner").evaluate((el) => el.remove())
    const plain = page.getByRole("textbox", { name: "New plain foreground owner" })
    await plain.focus()
    expect(await page.evaluate(() => window.heldNav?.())).toBe(false)
    await expect(plain).toBeFocused()
    // Native focusout may close the popup; acquire an ordinary fresh opening.
    if (!(await page.getByRole("menu", { name: "Header menu", exact: true }).count()))
      await page.getByRole("button", { name: "Header menu", exact: true }).click()
    // Ordinary fresh click in the actual popup owns this action.
    await page
      .getByRole("menu", { name: "Header menu", exact: true })
      .getByRole("menuitem", { name: "Inspect fixture locally" })
      .click()
    await expect(
      page.getByRole("status").filter({ hasText: "Fixture inspected locally" }),
    ).toBeVisible()
  })
test("right-click context and synthetic CDP hold use public background hook", async ({ page }) => {
  await page.goto("/?example=tachyon-nav#/work")
  const trigger = page.getByRole("button", { name: "Row 4421-alpha", exact: true })
  await trigger.click({ button: "right" })
  await expect(page.getByRole("menu", { name: "Row 4421-alpha", exact: true })).toBeVisible()
  await page.keyboard.press("Escape")
  await expect(trigger).toBeFocused()
  await expect(page.getByRole("menu", { name: "Row 4421-alpha", exact: true })).toHaveCount(0)
  const box = await trigger.boundingBox()
  if (!box) throw new Error("Context trigger bounds missing")
  const cdp = await page.context().newCDPSession(page)
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: box.x + box.width / 2, y: box.y + box.height / 2 }],
  })
  await expect(page.getByRole("menu", { name: "Row 4421-alpha", exact: true })).toBeVisible()
  await expect(page.getByRole("menu", { name: "Row 4421-alpha", exact: true })).toHaveAttribute(
    "data-open",
    "",
  )
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] })
  await page.getByRole("menuitem", { name: "Inspect fixture locally" }).click()
  await expect(
    page.getByRole("status").filter({ hasText: "Fixture inspected locally" }),
  ).toBeVisible()
})
