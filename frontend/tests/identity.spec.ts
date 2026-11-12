import { readFileSync } from "node:fs"
import { expect, test } from "@playwright/test"

const password = () => readFileSync(new URL("../../.scratch/e2e-password", import.meta.url), "utf8")

test.describe("signed out", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("the sign-in screen shows first and nothing calls /api/ or /plugins/ before a session", async ({
    page,
  }) => {
    const calls: string[] = []
    page.on("request", (r) => {
      const path = new URL(r.url()).pathname
      if (path.startsWith("/api/") || path.startsWith("/plugins/"))
        calls.push(`${r.method()} ${path}`)
    })
    await page.goto("/")
    await expect(page.getByRole("heading", { name: "Sign in to Parallax" })).toBeVisible()
    expect(calls.every((c) => c === "GET /api/setup" || c === "GET /api/identity/profile")).toBe(
      true,
    )
    expect(calls.some((c) => c.includes("/plugins/") || c.includes("/api/scenario"))).toBe(false)
  })

  test("a wrong password stays on the sign-in screen and the right one opens the app", async ({
    page,
  }) => {
    await page.goto("/")
    await page.getByLabel("Username").fill("e2e")
    await page.getByLabel("Password").fill("not-the-password-1")
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page.getByRole("alert")).toBeVisible()
    await expect(page.getByRole("heading", { name: "Sign in to Parallax" })).toBeVisible()
    await page.getByLabel("Password").fill(password())
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page.getByRole("heading", { name: "Sign in to Parallax" })).toBeHidden()
    await expect(page.getByRole("alert")).toHaveCount(0)
  })

  test("a 429 on sign-in shows the Retry-After wait", async ({ page }) => {
    await page.route("**/api/login", (route) =>
      route.fulfill({
        status: 429,
        headers: { "Retry-After": "300" },
        json: { code: "rate_limited", message: "too many attempts; wait a few minutes" },
      }),
    )
    await page.goto("/")
    await page.getByLabel("Username").fill("e2e")
    await page.getByLabel("Password").fill("not-the-password-1")
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page.getByRole("alert")).toHaveText("Too many attempts. Try again in 5 minutes.")
  })

  test("the profile route is the who-am-I probe: 401 signed out, the flat error body", async ({
    request,
  }) => {
    expect((await request.get("/api/identity/profile")).status()).toBe(401)
  })

  test("a signed-out API call is 401 with the flat error body", async ({ request }) => {
    const response = await request.get("/api/scenario")
    expect(response.status()).toBe(401)
    expect(Object.keys(await response.json()).sort()).toEqual(["code", "message"])
  })
})

test("the signed-in profile route names the person", async ({ request }) => {
  const response = await request.get("/api/identity/profile")
  expect(response.status()).toBe(200)
  const me = await response.json()
  expect(me.username).toBe("e2e")
  expect(me.display_name).toBe("E2E Owner")
})
