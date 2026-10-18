import assert from "node:assert/strict"
import test from "node:test"
import { observedActivity } from "./activity-model.ts"
import type { FleetRecord } from "./console-model.ts"

const agent: FleetRecord = {
  id: "review",
  name: "Review",
  provider: "codex",
  group: "Review",
  state: "idle",
  kind: "process",
}
const clock = "2026-10-18T16:00:00Z"
test("working share excludes unwatched lead-in and freezes at the capture clock", () => {
  const result = observedActivity(
    {
      ...agent,
      history: [
        { at: "2026-10-18T15:59:30Z", kind: "seen", state: "busy" },
        { at: "2026-10-18T15:59:50Z", kind: "state", state: "idle" },
      ],
    },
    clock,
  )
  assert.ok(result)
  assert.equal(result.workingShare, 67)
  assert.equal(result.observedMs, 30000)
  assert.equal(result.segments[0].state, null)
  assert.equal(result.series[0], null)
  assert.equal(result.series.at(-1), 0)
  assert.equal(result.end, Date.parse(clock))
})
test("the bounded window clips old states without fabricating missing history", () => {
  const result = observedActivity(
    {
      ...agent,
      history: [
        { at: "2026-10-18T14:00:00Z", kind: "seen", state: "busy" },
        { at: "2026-10-18T15:45:00Z", kind: "state", state: "idle" },
      ],
    },
    clock,
  )
  assert.ok(result)
  assert.equal(result.workingShare, 50)
  assert.equal(result.start, Date.parse("2026-10-18T15:30:00Z"))
  assert.equal(observedActivity(agent, clock), null)
  const justSeen = observedActivity(
    { ...agent, history: [{ at: clock, kind: "seen", state: "idle" }] },
    clock,
  )
  assert.equal(justSeen?.workingShare, null)
})
