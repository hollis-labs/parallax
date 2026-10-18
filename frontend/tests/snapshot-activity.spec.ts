import { expect, test } from "@playwright/test"

test("captured observation renders real states, metrics and frozen change times without commands", async ({
  page,
}) => {
  const effects: string[] = []
  page.on("request", (request) => {
    if (
      request.method() !== "GET" ||
      /tachyon\.nanite|torque\.nanite|tether\.nanite/.test(request.url())
    )
      effects.push(request.url())
  })
  await page.clock.install({ time: new Date("2026-10-19T12:00:00Z") })
  await page.route("**/api/snapshots/current", async (route) => {
    const data = await (await route.fetch()).json()
    data.sources.console.fleet.capturedAt = "2026-10-18T16:00:00Z"
    data.sources.console.fleet.observation = {
      method: "tachyon-page",
      endedAt: "2026-10-18T16:00:00Z",
    }
    data.sources.console.fleet.items = [
      {
        id: "observed-review",
        name: "Observed review agent",
        group: "Review",
        provider: "codex",
        state: "idle",
        kind: "process",
        confidence: "exact",
        history: [
          { at: "2026-10-18T15:59:00Z", kind: "seen", state: "busy" },
          { at: "2026-10-18T15:59:30Z", kind: "state", state: "idle" },
        ],
      },
    ]
    await route.fulfill({ json: data })
  })
  await page.goto("/?example=snapshots&source=agents")
  const opener = page.getByRole("button", { name: /^Inspect Observed review agent:/ })
  await expect(opener).toContainText("50%")
  await expect(opener.getByRole("img", { name: "Captured working activity" })).toBeVisible()
  await opener.click()
  const dialog = page.getByRole("dialog")
  await expect(dialog.getByRole("group", { name: "Activity facts" })).toContainText("50%")
  await expect(dialog.getByRole("group", { name: "Activity facts" })).toContainText("1m 00s")
  await expect(
    dialog.getByRole("region", { name: "Observed state timeline" }).getByRole("img"),
  ).toBeVisible()
  const changes = dialog.getByRole("region", { name: "Changes seen" })
  await expect(changes).toContainText("First seen")
  await expect(changes).toContainText("Changed")
  await expect(changes).toContainText("30s ago")
  await page.clock.fastForward(120000)
  await expect(changes).toContainText("30s ago")
  for (const action of await dialog
    .getByRole("region", { name: "Message", exact: true })
    .getByRole("button")
    .all())
    await expect(action).toBeDisabled()
  await page.keyboard.press("Escape")
  await expect(opener).toBeFocused()
  expect(effects).toEqual([])
})
