import { readFileSync } from "node:fs"
import { expect, test } from "@playwright/test"
import { destinations } from "../src/workbench/catalog"

const password = () => readFileSync(new URL("../../.scratch/e2e-password", import.meta.url), "utf8")
const write = { "X-Requested-With": "parallax-e2e" }

// One pass through the real backend in a real browser: sign in on the screen, open every surface,
// fetch the plugin registry and bundle under the auth guard, and sign out. A failed /api/ or
// /plugins/ response or a console error on any surface fails the test.
test.describe("browser pass", () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test("sign in, each surface, plugin delivery behind the guard, sign out", async ({ page }) => {
    const failures: string[] = []
    const errors: string[] = []
    page.on("response", (r) => {
      const path = new URL(r.url()).pathname
      if ((path.startsWith("/api/") || path.startsWith("/plugins/")) && r.status() >= 400)
        failures.push(`${r.status()} ${r.request().method()} ${path}`)
    })
    page.on("console", (m) => {
      // The sign-in probe's 401 is the contract for "signed out"; the browser logs it as a resource error.
      if (m.type() === "error" && !m.location().url.endsWith("/api/identity/profile"))
        errors.push(`${m.text()} @ ${m.location().url}`)
    })
    page.on("pageerror", (e) => errors.push(e.message))

    // Signed out: the guard refuses the data and the plugin routes.
    expect((await page.request.get("/api/scenario")).status()).toBe(401)
    expect((await page.request.get("/plugins/registry")).status()).toBe(401)

    await page.goto("/")
    await page.getByLabel("Username").fill("e2e")
    await page.getByLabel("Password").fill(password())
    await page.getByRole("button", { name: "Sign in" }).click()
    await expect(page.getByRole("heading", { name: "Sign in", exact: true })).toBeHidden()
    failures.length = 0 // the signed-out probes above are expected 401s

    // Each surface opens by its URL and shows its own title.
    for (const d of destinations) {
      if (d.id === "App Snapshots" || /Example$/.test(d.id)) continue // standalone pages, below
      await page.goto(`/?view=${encodeURIComponent(d.id)}`)
      await expect(page.getByRole("heading", { name: d.id, exact: true }).first()).toBeVisible()
    }
    for (const example of [
      "snapshots",
      "torque",
      "chat",
      "workspace",
      "administration",
      "messaging",
    ]) {
      await page.goto(`/?example=${example}`)
      await expect(page.locator("#root")).not.toBeEmpty()
    }

    // The plugin registry and its bundle come through the guard with the session.
    const registry = await page.request.get("/plugins/registry")
    expect(registry.status()).toBe(200)
    const dto = await registry.json()
    expect(dto.registry_version).toBe(2)
    expect(dto.plugins.ops.bundle_version).toMatch(/^sha256:/)
    expect((await page.request.get("/api/scenario")).status()).toBe(200)
    expect((await page.request.get("/api/snapshots/current")).status()).toBe(200)

    // Nothing failed or logged an error while signed in.
    expect(failures).toEqual([])
    expect(errors).toEqual([])

    // Sign out ends the session: the same calls are 401 and the page shows the sign-in screen.
    expect((await page.request.post("/api/logout", { headers: write })).status()).toBe(204)
    expect((await page.request.get("/api/scenario")).status()).toBe(401)
    expect((await page.request.get("/plugins/registry")).status()).toBe(401)
    await page.goto("/")
    await expect(page.getByRole("heading", { name: "Sign in", exact: true })).toBeVisible()
  })
})
