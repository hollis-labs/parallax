import { expect, test } from "@playwright/test"

test("drawer dispatchers never revive after session retirement or Activity reactivation", async ({
  page,
}) => {
  await page.goto(`${process.env.DRAWER_SOURCE_URL || "http://127.0.0.1:18545"}/?example=drawers`)
  const result = await page.evaluate(async () => {
    const modulePath = "/tests/fixtures/drawer-lifecycle.tsx"
    const harness = await import(modulePath)
    return { sessions: harness.exerciseRetirement(), activation: harness.exerciseReactivation() }
  })
  expect(result.sessions.admittedHeight).toBe(400)
  expect(result.activation.onceWorking).toBe(320)
  expect(result.activation.currentWorking).toBe(400)
  expect(result.activation.afterOld).toBe(400)
  for (const actions of [
    result.sessions.switchActions,
    result.sessions.returnActions,
    result.sessions.unmountActions,
    result.activation.hiddenActions,
    result.activation.reactivatedActions,
    result.activation.unmountActions,
  ]) {
    for (const action of actions) expect(action.after, action.action).toBe(action.before)
  }
})
