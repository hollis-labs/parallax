import { readFileSync, writeFileSync } from "node:fs"
import { expect, test } from "@playwright/test"
import { destinations } from "../src/workbench/catalog"

async function settledPaint(page: import("@playwright/test").Page) {
  await expect(page.locator("html")).toHaveAttribute("data-theme", "p4-white")
  await expect(page.locator("html")).toHaveAttribute("data-mode", "light")
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document
            .getAnimations()
            .filter(
              (a) => a.playState === "running" && a.effect?.getTiming().iterations !== Infinity,
            ).length,
      ),
    )
    .toBe(0)
}

const examples = [
  {
    id: "Torque Example",
    route: "torque",
    root: ".torque-example",
    footer: ".torque-page-footer",
    story: "app-examples-torque--dashboard",
  },
  {
    id: "Chat Example",
    route: "chat",
    root: ".chat-example",
    footer: ".chat-example-footer",
    story: "app-examples-chat--conversation",
  },
  {
    id: "Messaging Example",
    route: "messaging",
    root: ".messaging-example",
    footer: ".messaging-example-footer",
    story: "app-examples-messaging--inbox",
  },
  {
    id: "Administration Example",
    route: "administration",
    root: ".administration-example",
    footer: ".administration-example-footer",
    story: "app-examples-administration--directory",
  },
  {
    id: "Workspace Example",
    route: "workspace",
    root: ".workspace-example",
    footer: ".workspace-footer",
    story: "app-examples-workspace--source",
  },
]

test("native Workbench admits all five complete shells with current routes and explicit source boundaries", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  for (const app of examples) {
    await page.goto("/?view=Review+Workbench&theme=p4-white&mode=light")
    await page.getByLabel("Review group", { exact: true }).selectOption("App Examples")
    await expect(page.locator(".workbench-grid article")).toHaveCount(5)
    const card = page.getByRole("article", { name: `${app.id} review destination`, exact: true })
    await expect(card).toContainText(app.story)
    await expect(
      card.getByRole("link", { name: `Portable ${app.id} story`, exact: true }),
    ).toHaveAttribute("href", new RegExp(app.story))
    if (app.route === "torque") {
      await settledPaint(page)
      await page.screenshot({ path: info.outputPath("all-apps-workbench-desktop.png") })
      await page
        .getByRole("article", { name: "Workspace Example review destination", exact: true })
        .scrollIntoViewIfNeeded()
      await page.screenshot({ path: info.outputPath("all-apps-workbench-bottom-desktop.png") })
    }
    await card.getByRole("button", { name: `Open ${app.id}`, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`example=${app.route}`))
    await expect(page.locator(app.root)).toHaveCount(1)
    await expect(page.locator(".workbench")).toHaveCount(0)
    await expect(page.locator(app.root).getByRole("heading", { level: 1 }).first()).toBeVisible()
    await page.reload()
    await expect(page.locator(app.root)).toBeVisible()
    if (app.route === "torque") {
      await page.getByRole("link", { name: "About", exact: true }).click()
      await expect(page.locator(".torque-about")).toContainText("2026-10-04T14:30:00Z")
      await expect(page.locator(".torque-about")).toContainText("Legacy records-8/80")
    } else await expect(page.locator(app.footer)).toContainText("2026-10-04T14:30:00Z")
    await settledPaint(page)
    const paint = JSON.stringify(
      await page.locator(app.root).evaluate((n) => ({
        theme: document.documentElement.dataset.theme,
        mode: document.documentElement.dataset.mode,
        backgrounds: [...n.querySelectorAll("button, [data-slot=chat-input]")].map((el) => ({
          label: el.textContent,
          color: getComputedStyle(el).color,
          background: getComputedStyle(el).backgroundColor,
        })),
      })),
      null,
      2,
    )
    writeFileSync(info.outputPath(`all-apps-${app.route}-settled-paint.json`), paint)
    await info.attach(`${app.route}-settled-paint`, {
      body: paint,
      contentType: "application/json",
    })
    await page.screenshot({ path: info.outputPath(`all-apps-${app.route}-desktop.png`) })
    await page.goBack()
    if (app.route === "torque") await page.goBack()
    await expect(page.locator(".workbench")).toBeVisible()
  }
})

test("all five representative fullscreen stories share App Examples group and bounded native narrow short-height owners without API effects", async ({
  page,
}, info) => {
  const index = JSON.parse(
    readFileSync(new URL("../../.scratch/storybook/index.json", import.meta.url), "utf8"),
  ).entries
  expect(
    destinations
      .filter((d) => d.group === "App Examples")
      .map((d) => d.id)
      .sort(),
  ).toEqual(examples.map((d) => d.id).sort())
  const forbidden: string[] = []
  page.on("request", (r) => {
    if (/\/api\/|\/plugins\//.test(r.url())) forbidden.push(r.url())
  })
  await page.setViewportSize({ width: 390, height: 500 })
  for (const app of examples) {
    expect(index[app.story].title).toBe(
      `App Examples/${app.route === "workspace" ? "Workspace" : app.route[0].toUpperCase() + app.route.slice(1)}`,
    )
    await page.goto(`http://127.0.0.1:18542/iframe.html?id=${app.story}&viewMode=story`)
    const root = page.locator(app.root)
    await expect(root).toBeVisible()
    await expect(root.getByRole("heading", { level: 1 }).first()).toBeVisible()
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      .toBe(true)
    const menuName =
      app.route === "torque"
        ? "Open app navigation"
        : app.route === "chat"
          ? "Sessions"
          : app.route === "workspace"
            ? "Files"
            : "Menu"
    const menu = page.getByRole("button", { name: menuName, exact: true })
    await menu.click()
    const dialog = page.getByRole("dialog").first()
    await expect.poll(() => dialog.evaluate((n) => getComputedStyle(n).opacity)).toBe("1")
    await expect(dialog).toContainText("Back to review lab")
    await page.keyboard.press("Escape")
    await expect(menu).toBeFocused()
    const footer = page.locator(app.footer)
    await footer.scrollIntoViewIfNeeded()
    await expect(footer).toBeVisible()
    const rect = await footer.boundingBox()
    expect(rect).not.toBeNull()
    if (!rect) throw new Error("Missing visible app footer")
    expect(rect.y).toBeGreaterThanOrEqual(0)
    expect(rect.y + rect.height).toBeLessThanOrEqual(501)
    await page.screenshot({ path: info.outputPath(`all-apps-${app.route}-narrow-short.png`) })
  }
  expect(forbidden).toEqual([])
})
