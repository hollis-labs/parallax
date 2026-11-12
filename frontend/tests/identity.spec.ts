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

  test("POST /api/setup is always refused on the real backend (403 setup_offline)", async ({
    request,
  }) => {
    const state = await request.get("/api/setup")
    expect(await state.json()).toMatchObject({ setup_required: false })
    const post = await request.post("/api/setup", {
      headers: { "X-Requested-With": "parallax-e2e" },
      data: { username: "intruder", display_name: "X", password: "correct-horse-battery-1" },
    })
    expect(post.status()).toBe(403)
    expect((await post.json()).code).toBe("setup_offline")
  })

  test("no owner yet and setup closed: a plain screen names the host command and has no form", async ({
    page,
  }) => {
    await page.route("**/api/setup", (route) =>
      route.fulfill({ json: { setup_required: true, setup_over_http: false } }),
    )
    await page.goto("/")
    await expect(page.getByRole("heading", { name: "No owner account yet" })).toBeVisible()
    await expect(page.getByText("parallax identity setup --username NAME")).toBeVisible()
    await expect(page.getByLabel("Password")).toHaveCount(0)
  })

  test("a 403 setup_offline from the owner form shows the same screen", async ({ page }) => {
    await page.route("**/api/setup", (route) =>
      route.request().method() === "GET"
        ? route.fulfill({ json: { setup_required: true, setup_over_http: true } })
        : route.fulfill({
            status: 403,
            json: { code: "setup_offline", message: "first-run setup over HTTP is disabled" },
          }),
    )
    await page.goto("/")
    await page.getByLabel("Display name").fill("Owner")
    await page.getByLabel("Username").fill("owner")
    await page.getByLabel("Password", { exact: true }).fill("correct-horse-battery-1")
    await page.getByLabel("Confirm password").fill("correct-horse-battery-1")
    await page.getByRole("button", { name: "Create account" }).click()
    await expect(page.getByRole("heading", { name: "No owner account yet" })).toBeVisible()
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

test.describe("sign out from the screen", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("the header shows who is signed in and Sign out lands on the sign-in screen", async ({
    page,
  }) => {
    await page.goto("/")
    await page.getByLabel("Username").fill("e2e")
    await page.getByLabel("Password").fill(password())
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page.getByText("E2E Owner", { exact: true })).toBeVisible()
    await page.getByRole("button", { name: "Sign out", exact: true }).click()
    await expect(page.getByRole("heading", { name: "Sign in to Parallax" })).toBeVisible()
    expect((await page.request.get("/api/scenario")).status()).toBe(401)
    await page.reload()
    await expect(page.getByRole("heading", { name: "Sign in to Parallax" })).toBeVisible()
  })
})
