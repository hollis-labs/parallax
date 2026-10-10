import { expect, test } from "@playwright/test"

const app = "http://127.0.0.1:18545"
const portable =
  "http://127.0.0.1:18542/iframe.html?id=app-examples-administration--directory&viewMode=story"

for (const surface of ["app", "portable"]) {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
    { width: 1440, height: 420 },
    { width: 390, height: 420 },
  ]) {
    test(`Administration exact candidate inline stop ${surface} ${viewport.width}x${viewport.height}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport)
      await page.goto(surface === "app" ? `${app}/?example=administration` : portable)
      const entries = page.locator(".administration-user-list button")
      await expect(entries.first()).toBeVisible()
      const ids = await entries.evaluateAll((nodes) =>
        nodes.map((node) => {
          const text = node.querySelector("span")?.textContent
          if (!text) throw Error("Missing supplied directory identity")
          return text.split(" · ")[0].trim()
        }),
      )
      expect(ids.length).toBeGreaterThan(1)
      await entries.first().click()
      const select = page.getByLabel("Selected administration user", { exact: true })
      const previous = page.getByRole("button", { name: "Previous directory user", exact: true })
      const next = page.getByRole("button", { name: "Next directory user", exact: true })
      await expect(select).toHaveValue(ids[0])
      await expect(previous).toBeDisabled()
      await expect(next).toBeEnabled()
      await next.focus()
      await page.keyboard.press("ArrowRight")
      await expect(select).toHaveValue(ids[0])
      // Retain the authored callback; current invocation is the positive control.
      await next.evaluate((node) => {
        const key = Object.keys(node).find((k) => k.startsWith("__reactFiber"))
        if (!key) throw Error("Missing React fiber")
        type Fiber = {
          memoizedProps?: { children?: unknown; onClick?: () => void }
          return?: Fiber
          child?: Fiber
          sibling?: Fiber
          stateNode?: unknown
        }
        let attached = (node as unknown as Record<string, Fiber>)[key]
        while (attached.return) attached = attached.return
        const current = (attached.stateNode as { current: Fiber }).current
        function pathToNode(fiber: Fiber, parents: Fiber[]): Fiber[] | null {
          const path = [...parents, fiber]
          if (fiber.stateNode === node) return path
          for (let child = fiber.child; child; child = child.sibling) {
            const found = pathToNode(child, path)
            if (found) return found
          }
          return null
        }
        const path = pathToNode(current, [])
        if (!path) throw Error("Node absent from committed React tree")
        let callback: (() => void) | undefined
        for (const fiber of path.reverse()) {
          if (fiber.memoizedProps?.children === "Next directory user")
            callback = fiber.memoizedProps.onClick
        }
        if (!callback) throw Error("No authored inline navigation callback")
        ;(window as unknown as { heldDirectoryNavigation: () => void }).heldDirectoryNavigation =
          callback
      })
      await page.evaluate(() =>
        (window as unknown as { heldDirectoryNavigation: () => void }).heldDirectoryNavigation(),
      )
      await expect(select).toHaveValue(ids[1])
      await page.evaluate(() =>
        (window as unknown as { heldDirectoryNavigation: () => void }).heldDirectoryNavigation(),
      )
      await expect(select).toHaveValue(ids[1])
      for (let i = 2; i < ids.length; i++) {
        await next.click()
        await expect(select).toHaveValue(ids[i])
      }
      await expect(next).toBeDisabled()
      await expect(previous).toBeEnabled()
      await previous.focus()
      await page.keyboard.press("Enter")
      await expect(select).toHaveValue(ids[ids.length - 2])
      await page.getByRole("button", { name: "Back to directory", exact: true }).click()
      const query = page.getByLabel("Search administration directory", { exact: true })
      await query.fill(ids[0])
      await expect(entries).toHaveCount(1)
      await entries.first().click()
      await expect(previous).toBeDisabled()
      await expect(next).toBeDisabled()
      await expect(page.locator(".administration-selection")).toContainText(
        "1 of 1 matching users · stops at ends",
      )
      await page.evaluate(() =>
        (window as unknown as { heldDirectoryNavigation: () => void }).heldDirectoryNavigation(),
      )
      await expect(select).toHaveValue(ids[0])
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        viewport.width,
      )
    })
  }
}

test("Administration inaccessible and missing selections cannot admit record navigation", async ({
  page,
}) => {
  for (const appearance of ["loading", "denied", "error", "unknown", "empty"]) {
    await page.goto(
      `${app}/?example=administration&page=profile&user=missing&appearance=${appearance}`,
    )
    await expect(
      page.getByRole("button", { name: "Next directory user", exact: true }),
    ).toHaveCount(0)
    await expect(page.locator(".administration-page")).toContainText(
      appearance === "empty" ? "Known empty" : "records withheld",
    )
  }
  await page.goto(`${app}/?example=administration&page=profile&user=missing`)
  await expect(page.getByText("No admitted profile selected", { exact: true })).toBeVisible()
  await expect(page.getByRole("button", { name: "Next directory user", exact: true })).toHaveCount(
    0,
  )
})
