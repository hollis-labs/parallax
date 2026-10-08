import { expect, type Locator, type Page, test } from "@playwright/test"
import {
  adminAppearances,
  adminDestinationIntent,
  adminReviewModel,
  admittedTarget,
} from "../src/admin-review/model"

const nav = (page: Page) => page.locator(".admin-inner-navigation")
async function capture(locator: Locator, key: string) {
  await locator.evaluate((node, name) => {
    const prop = Object.keys(node).find((p) => p.startsWith("__reactProps$"))
    if (!prop) throw Error("No React callback")
    ;(window as unknown as Record<string, unknown>)[name] = (
      node as unknown as Record<string, { onClick?: () => void }>
    )[prop].onClick
  }, key)
}
async function invoke(page: Page, key: string) {
  await page.evaluate((name) => {
    const fn = (window as unknown as Record<string, unknown>)[name]
    if (typeof fn !== "function") throw Error("Missing captured callback")
    fn()
  }, key)
}
test("fixed declaration validation gates canonical targets without mutating supplied evidence", () => {
  const original = adminReviewModel(),
    encoded = JSON.stringify([original.administration, original.observation.fixture])
  for (const appearance of adminAppearances) {
    const model = adminReviewModel(appearance)
    if (model.problem || !model.accessible)
      expect(adminDestinationIntent(model, { page: "dashboard" })).toBeNull()
    else expect(admittedTarget(model, { page: "dashboard" })).toBe(true)
    expect(JSON.stringify([model.administration, model.observation.fixture])).toBe(encoded)
  }
  expect(
    adminDestinationIntent(adminReviewModel("recorded", "permission-denied"), {
      page: "dashboard",
    }),
  ).toBeNull()
  expect(admittedTarget(original, { page: "settings", groupId: "unlisted" })).toBe(false)
  expect(admittedTarget(original, { page: "status", groupId: "workspace" })).toBe(false)
  expect(original.observations.diagnostics).toBeUndefined()
})
test("actual navigation and content show discovery and manifest guards with retained navigation recovery", async ({
  page,
}) => {
  await page.goto("/?view=Admin%20Review")
  const appearance = page.getByLabel("Admin appearance")
  await expect(nav(page).getByRole("button", { name: "Dashboard", exact: true })).toHaveAttribute(
    "aria-current",
    "page",
  )
  const states: [string, string][] = [
    ["initial-loading", "Loading admin declarations."],
    ["initial-error", "Admin unavailable"],
    ["context-mismatch", "Admin context unavailable"],
    ["unsupported", "Unsupported admin contract version."],
    ["malformed", "missing stats array"],
    ["contradictory", "Contradictory health section"],
    ["duplicate", "Malformed settings resource identity."],
    ["empty", "No admin resources declared"],
  ]
  for (const [state, text] of states) {
    await appearance.selectOption(state)
    await expect(page.locator(".admin-inner-body")).toContainText(text)
    if (state === "empty")
      await expect(
        page.getByRole("button", { name: "Inspect selected destination", exact: true }),
      ).toBeEnabled()
    else
      await expect(
        page.getByRole("button", { name: "Inspect selected destination", exact: true }),
      ).toBeDisabled()
  }
  for (const state of ["retained-loading", "retained-error"]) {
    await appearance.selectOption(state)
    await expect(page.getByText("Previous declarations retained", { exact: true })).toBeVisible()
    await nav(page).getByRole("button", { name: "Status", exact: true }).click()
    await expect(nav(page).getByRole("button", { name: "Status", exact: true })).toHaveAttribute(
      "aria-current",
      "page",
    )
    await expect(
      page.getByRole("heading", { name: "Recorded fixture health", exact: true }),
    ).toBeVisible()
  }
  for (const state of ["unknown-group", "unknown-page"]) {
    await appearance.selectOption(state)
    await expect(
      page.getByText(
        state === "unknown-group" ? "Settings group unavailable" : "Admin page unavailable",
        { exact: true },
      ),
    ).toBeVisible()
    await nav(page).getByRole("button", { name: "Dashboard", exact: true }).click()
    await expect(appearance).toHaveValue("recorded")
    await expect(page.getByRole("region", { name: "Admin directory" })).toBeVisible()
  }
})
test("read-only groups and optional series preserve supplied provenance and unavailable diagnostic path", async ({
  page,
}, info) => {
  await page.goto("/?view=Admin%20Review&theme=p4-white&mode=light")
  await page.getByLabel("Selected settings group").selectOption("workspace")
  await expect(page.getByRole("region", { name: "Admin Settings" })).toContainText(
    "This view has no editing actions.",
  )
  await expect(page.locator(".admin-inner-body input, .admin-inner-body textarea")).toHaveCount(0)
  await expect(page.getByRole("region", { name: "Admin Settings" })).toContainText(
    "Fixture review lab",
  )
  await expect(page.getByRole("region", { name: "Admin Settings" })).toContainText(
    "Locked by the fixture environment",
  )
  await expect(
    page
      .locator(".admin-inner-body")
      .getByRole("button", { name: /Save|Apply|Validate|Reset|Submit setup/ }),
  ).toHaveCount(0)
  await page.screenshot({ path: info.outputPath("admin-settings-desktop.png") })
  for (const [state, text] of [
    ["group-loading", "Waiting for a settings snapshot."],
    ["group-error", "No successful snapshot is available."],
    ["retained-group-error", "Previous snapshot retained; writes suspended."],
  ] as const) {
    await page.getByLabel("Admin appearance").selectOption(state)
    await expect(page.locator(".admin-inner-body")).toContainText(text)
  }
  await page.getByLabel("Admin appearance").selectOption("recorded")
  await nav(page).getByRole("button", { name: "Diagnostics", exact: true }).click()
  await expect(page.getByText("Series renderer unavailable", { exact: true })).toBeVisible()
  await page.getByLabel("Series renderer").selectOption("present")
  await expect(page.getByRole("figure")).toContainText("count, cumulative counter")
  await expect(page.getByRole("row").filter({ hasText: "2026-10-04T14:10:00Z" })).toContainText("0")
  await expect(
    page.locator(".admin-inner-body").getByRole("button", { name: /Copy|Download/ }),
  ).toHaveCount(0)
  await expect(
    page
      .getByRole("heading", { name: "Declared diagnostic (no supplied observation)", exact: true })
      .locator(".."),
  ).toContainText("Unavailable")
  await page.screenshot({ path: info.outputPath("admin-series-desktop.png") })
})
test("same-origin declared href navigation preserves flags and one standalone shell", async ({
  page,
}, info) => {
  await page.goto("/?view=Admin%20Review&theme=p1-green-phosphor&mode=dark")
  await page.getByLabel("Admin source").selectOption("copy")
  await page.getByLabel("Destination mode").selectOption("href")
  const status = nav(page).getByRole("link", { name: "Status", exact: true })
  expect(new URL((await status.getAttribute("href")) ?? "", page.url()).origin).toBe(
    new URL(page.url()).origin,
  )
  await status.focus()
  await page.keyboard.press("Enter")
  await expect(page.getByLabel("Admin page")).toHaveValue("status")
  await expect(page.getByLabel("Admin source")).toHaveValue("copy")
  await expect(page.getByLabel("Destination mode")).toHaveValue("href")
  await page.getByRole("link", { name: "Open standalone AdminShell", exact: true }).click()
  await expect(page.locator("main")).toHaveCount(1)
  await expect(page.locator(".page-scroll")).toHaveCount(0)
  await expect(
    page.getByRole("heading", { name: /Parallax read-only declaration \/ Status/ }),
  ).toBeVisible()
  await page.screenshot({ path: info.outputPath("admin-shell-desktop.png") })
  await page.reload()
  await expect(page.locator("main")).toHaveCount(1)
  await page.getByRole("link", { name: "Return to Admin Review", exact: true }).click()
  await expect(page.getByLabel("Admin page")).toHaveValue("status")
})
test("native local destination held inspection and captured navigation close retire in actual StrictMode", async ({
  page,
}, info) => {
  const writes: string[] = [],
    errors: string[] = []
  page.on("request", (r) => {
    if (!["GET", "HEAD"].includes(r.method())) writes.push(r.url())
  })
  page.on("pageerror", (e) => errors.push(e.message))
  await page.goto("http://127.0.0.1:18545/?view=Admin%20Review")
  const inspect = page.getByRole("button", { name: "Inspect selected destination", exact: true })
  await inspect.focus()
  await page.keyboard.press("Enter")
  const dialog = page.getByRole("dialog", { name: "Admin destination inspection" })
  await expect(dialog).toContainText('"page": "dashboard"')
  await dialog
    .getByRole("button", { name: "Release oldest destination inspection", exact: true })
    .click()
  await expect(dialog).toContainText("Locally inspected only.")
  await capture(dialog.getByRole("button", { name: "Close inspection", exact: true }), "oldClose")
  await page.screenshot({ path: info.outputPath("admin-destination-desktop.png") })
  await page.keyboard.press("Escape")
  await expect(inspect).toBeFocused()
  await capture(nav(page).getByRole("button", { name: "Status", exact: true }), "oldNav")
  await inspect.click()
  await invoke(page, "oldClose")
  await expect(dialog).toBeVisible()
  await dialog.getByRole("button", { name: "Close inspection", exact: true }).click()
  await page.getByLabel("Admin source").selectOption("copy")
  await invoke(page, "oldNav")
  await expect(page.getByLabel("Admin page")).toHaveValue("dashboard")
  await inspect.click()
  await page.keyboard.press("Escape")
  await page.getByLabel("Admin appearance").selectOption("initial-error")
  await page.getByRole("button", { name: /Release oldest destination inspection/ }).click()
  await expect(page.getByText("Locally inspected only.", { exact: false })).toHaveCount(0)
  await page.getByRole("button", { name: "Activity", exact: true }).click()
  await invoke(page, "oldNav")
  await expect(page.getByRole("heading", { name: "Activity", exact: true })).toBeVisible()
  expect(writes).toEqual([])
  expect(errors).toEqual([])
})
test("390 dark standalone viewport ownership keyboard modal and API-free portable shell remain bounded", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(
    "/?adminShellReview=1&adminPage=diagnostics&adminSeries=1&theme=p1-green-phosphor&mode=dark",
  )
  await expect(page.locator("html")).toHaveAttribute("data-theme", "p1-green-phosphor")
  await expect(page.locator("main")).toHaveCount(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  expect(
    await page.locator(".admin-shell-body").evaluate((n) => n.getBoundingClientRect().height),
  ).toBeGreaterThan(450)
  await expect(page.getByRole("figure")).toBeVisible()
  await page.screenshot({ path: info.outputPath("admin-shell-narrow.png") })
  await page.getByRole("button", { name: "Inspect selected destination", exact: true }).click()
  const dialog = page.getByRole("dialog", { name: "Admin destination inspection" })
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press("Tab")
    await expect.poll(() => dialog.evaluate((n) => n.contains(document.activeElement))).toBe(true)
  }
  for (const b of await dialog.getByRole("button").all()) {
    const box = await b.boundingBox()
    expect(box?.x).toBeGreaterThanOrEqual(0)
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(390)
  }
  await page.screenshot({ path: info.outputPath("admin-destination-narrow.png") })
  await dialog
    .getByRole("button", { name: "Release oldest destination inspection", exact: true })
    .click()
  await dialog.locator(".overflow-y-auto").evaluate((n) => {
    n.scrollTop = n.scrollHeight
  })
  await expect(dialog.getByText(/Locally inspected only/)).toBeVisible()
  const payloadGeometry = await dialog.locator("pre.evidence-json").evaluate((n) => {
    const pre = n.getBoundingClientRect(),
      code = n.querySelector("code")?.getBoundingClientRect()
    const spans = Array.from(n.querySelectorAll("span"))
    const source = spans.find((s) => s.textContent?.includes("admin-review/v1"))
    return {
      width: n.clientWidth,
      scroll: n.scrollWidth,
      wrap: getComputedStyle(n).whiteSpace,
      preWidth: pre.width,
      codeWidth: code?.width ?? 0,
      sourceLines: source?.getClientRects().length ?? 0,
      bounded: spans.every((s) =>
        Array.from(s.getClientRects()).every(
          (r) => r.width > 0 && r.left >= pre.left && r.right <= pre.right,
        ),
      ),
    }
  })
  expect(payloadGeometry.wrap).toBe("pre-wrap")
  expect(payloadGeometry.preWidth).toBeGreaterThan(200)
  expect(payloadGeometry.codeWidth).toBeGreaterThan(100)
  expect(payloadGeometry.codeWidth).toBeLessThanOrEqual(payloadGeometry.preWidth)
  expect(payloadGeometry.sourceLines).toBeGreaterThan(1)
  expect(payloadGeometry.bounded).toBe(true)
  expect(payloadGeometry.scroll).toBeLessThanOrEqual(payloadGeometry.width)
  await page.screenshot({ path: info.outputPath("admin-destination-narrow-payload.png") })
  await page.keyboard.press("Escape")
  const requests: string[] = []
  page.on("request", (r) => {
    if (r.url().includes("/api/") || r.url().includes("/plugins/")) requests.push(r.url())
  })
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=admin-controlled-admin-review--standalone-series&viewMode=story",
  )
  await expect(page.locator("main")).toHaveCount(1)
  await expect(page.getByRole("figure")).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  for (const id of [
    "recorded",
    "initial-loading",
    "retained-error",
    "context-mismatch",
    "unsupported",
    "empty",
    "unknown-group",
    "denied",
    "series-absent",
    "series-present",
  ]) {
    await page.goto(
      `http://127.0.0.1:18542/iframe.html?id=admin-controlled-admin-review--${id}&viewMode=story`,
    )
    await expect(page.locator("#storybook-root")).not.toBeEmpty()
  }
  await expect(page.getByLabel("Destination mode")).toHaveCount(0)
  await expect(page.getByRole("link", { name: "Open standalone AdminShell" })).toHaveCount(0)
  await page.goto(
    "http://127.0.0.1:18542/iframe.html?id=admin-controlled-admin-review--read-only-settings&viewMode=story",
  )
  await expect(page.getByRole("region", { name: "Admin Settings" })).toContainText(
    "Fixture review lab",
  )
  await expect(page.locator(".admin-inner-body input")).toHaveCount(0)
  expect(requests).toEqual([])
})
