import { expect, test } from "@playwright/test"
import { legacyViewRedirect, routeFor, slug, viewForPath } from "../src/shell/routes"
import { destinations } from "../src/workbench/catalog"

test("the old /?view=Name URL becomes a route and keeps every other query parameter in order", () => {
  expect(legacyViewRedirect("/", "?view=Primitives&theme=p1-green-phosphor&mode=light")).toBe(
    "/primitives?theme=p1-green-phosphor&mode=light",
  )
  expect(legacyViewRedirect("/", "?scenario=empty&view=Review+Workbench&mode=dark")).toBe(
    "/review-workbench?scenario=empty&mode=dark",
  )
  expect(legacyViewRedirect("/", "?view=Settings%20Review")).toBe("/settings-review")
  expect(legacyViewRedirect("/", "?view=Activity&theme=hi-contrast")).toBe("/?theme=hi-contrast")
})

test("an unknown view lands on Activity and keeps view so the page can say what was asked", () => {
  expect(legacyViewRedirect("/", "?view=bogus&theme=p4-white")).toBe("/?view=bogus&theme=p4-white")
})

test("a URL that is not the old form is left alone", () => {
  expect(legacyViewRedirect("/", "")).toBeNull()
  expect(legacyViewRedirect("/", "?theme=p4-white")).toBeNull()
  expect(legacyViewRedirect("/primitives", "?view=Usage")).toBeNull()
})

test("every workbench destination has a route that resolves back to it", () => {
  for (const d of destinations) {
    expect(viewForPath(routeFor(d.id))).toBe(d.id)
    expect(routeFor(d.id) === "/" || routeFor(d.id) === `/${slug(d.id)}`).toBe(true)
  }
})

test("/?view=Name reaches the route, keeps the other parameters and shows that view", async ({
  page,
}) => {
  await page.goto("/?view=Primitives&theme=p1-green-phosphor&mode=light")
  await expect(page).toHaveURL(/\/primitives\?/)
  const url = new URL(page.url())
  expect(url.searchParams.has("view")).toBe(false)
  expect(url.searchParams.get("theme")).toBe("p1-green-phosphor")
  expect(url.searchParams.get("mode")).toBe("light")
  await expect(page.getByRole("heading", { name: "Primitives", level: 2 })).toBeVisible()
})

test("an unknown view says what was requested and shows Activity", async ({ page }) => {
  await page.goto("/?view=bogus")
  await expect(page.getByText("Unknown requested view bogus; showing Activity.")).toBeVisible()
  await expect(page.getByRole("heading", { name: "Activity", level: 2, exact: true })).toBeVisible()
})

test("navigating by the shell keeps the lab's theme and the browser back button works", async ({
  page,
}) => {
  await page.goto("/")
  await page.getByLabel("Theme", { exact: true }).selectOption("hi-contrast")
  await page.getByRole("link", { name: "Primitives", exact: true }).click()
  await expect(page).toHaveURL(/\/primitives/)
  await expect(page.getByLabel("Theme", { exact: true })).toHaveValue("hi-contrast")
  await page.goBack()
  await expect(page.getByRole("heading", { name: "Activity", level: 2, exact: true })).toBeVisible()
})

test("the nav lists every group with its destinations and the sign-out footer", async ({
  page,
}) => {
  await page.goto("/")
  const nav = page.getByRole("navigation", { name: "Primary" })
  for (const d of destinations.slice(0, 5))
    await expect(nav.getByRole("link", { name: d.id, exact: true })).toBeVisible()
  await expect(nav.getByRole("link", { name: "Review Workbench", exact: true })).toBeVisible()
  await nav.getByRole("link", { name: "Sign out", exact: true }).click()
  await expect(page.getByRole("button", { name: "Sign out", exact: true })).toBeVisible()
})

test("an unknown path shows the shell's Page not found state", async ({ page }) => {
  await page.goto("/not-a-page")
  await expect(page.getByText("Page not found", { exact: true })).toBeVisible()
  await expect(page.getByText("/not-a-page", { exact: true })).toBeVisible()
})
