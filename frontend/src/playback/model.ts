import observations from "../fixtures/observations.json" with { type: "json" }
import fixture from "../fixtures/operations.json" with { type: "json" }
import history from "../fixtures/operations-large.json" with { type: "json" }
export type FixtureDataset = typeof fixture
export const resourceOverrides = [
  "scenario",
  "loading",
  "error",
  "degraded",
  "unavailable",
] as const
export type ResourceOverride = (typeof resourceOverrides)[number]
export function sourceDataset(scenario: string): FixtureDataset {
  return scenario === "large" || scenario === "sparse" ? history : fixture
}
/** Finite, ordered evidence boundaries; all stamps are authored, never wall-clock values. */
export function timelineFrames(source: FixtureDataset) {
  const stamps = [
    ...source.runs.flatMap((r) => [r.started, ...(r.finished ? [r.finished] : [])]),
    ...source.toolCalls.flatMap((t) => [t.started, t.finished]),
    ...source.spans.flatMap((s) => [s.started, ...(s.finished ? [s.finished] : [])]),
    ...source.events.map((e) => e.time),
    ...source.messages.map((m) => m.time),
    ...source.logs.map((l) => l.time),
    ...source.usage.map((u) => u.time),
    ...observations.resources.map((r) => r.observedAt),
  ]
  const first = stamps.reduce((a, b) => (a < b ? a : b), source.clock)
  return [
    ...new Set([
      new Date(Date.parse(first) - 1000).toISOString().replace(".000Z", "Z"),
      ...stamps,
      source.clock,
    ]),
  ]
    .filter((t) => t <= source.clock)
    .sort()
}
/** Read-only projection of one existing graph, not a new wire/event schema. */
export function projectDataset(source: FixtureDataset, cutoff = source.clock) {
  const frames = timelineFrames(source)
  if (!Number.isFinite(Date.parse(cutoff)) || cutoff < frames[0] || cutoff > source.clock)
    throw new Error("Invalid bounded fixture cutoff")
  const runs = source.runs
    .filter((r) => r.started <= cutoff)
    .map((r) => ({
      ...r,
      status: r.finished && r.finished <= cutoff ? r.status : "running",
      finished: r.finished && r.finished <= cutoff ? r.finished : null,
      outcome: r.finished && r.finished <= cutoff ? r.outcome : null,
    }))
  const ids = new Set(runs.map((r) => r.id)),
    events = source.events.filter((e) => e.time <= cutoff && ids.has(e.runId)),
    usage = source.usage.filter((u) => u.time <= cutoff && ids.has(u.runId))
  return {
    ...source,
    clock: cutoff,
    tasks: source.tasks
      .filter((t) => ids.has(t.runId))
      .map((t) => {
        const event = events
            .filter((e) => e.taskId === t.id && e.type.startsWith("task."))
            .sort((a, b) => a.time.localeCompare(b.time) || a.id.localeCompare(b.id))
            .at(-1),
          receipt = usage.find((u) => u.runId === t.runId)
        return {
          ...t,
          status: event ? event.type.slice(5) : "running",
          narrative:
            event?.description ??
            "Fixture task review admitted; later task-state evidence is not visible yet.",
          tokens: receipt?.tokens ?? null,
          cost: receipt?.cost ?? null,
        }
      }),
    runs,
    sessions: source.sessions.filter((s) => ids.has(s.runId)),
    messages: source.messages.filter((m) => ids.has(m.runId) && m.time <= cutoff),
    toolCalls: source.toolCalls
      .filter((t) => ids.has(t.runId) && t.started <= cutoff)
      .map((t) => ({
        ...t,
        status: t.finished <= cutoff ? t.status : "running",
        finished: t.finished <= cutoff ? t.finished : null,
        output: t.finished <= cutoff ? t.output : null,
      })),
    traces: source.traces
      .filter((t) => ids.has(t.runId) && t.started <= cutoff)
      .map((t) => ({
        ...t,
        spanIds: t.spanIds.filter((id) =>
          source.spans.some((s) => s.id === id && s.started <= cutoff),
        ),
      })),
    spans: source.spans
      .filter(
        (s) =>
          source.traces.some((t) => t.id === s.traceId && ids.has(t.runId)) && s.started <= cutoff,
      )
      .map((s) => ({
        ...s,
        status: s.finished && s.finished <= cutoff ? s.status : "running",
        finished: s.finished && s.finished <= cutoff ? s.finished : null,
      })),
    logs: source.logs.filter((l) => ids.has(l.runId) && l.time <= cutoff),
    events,
    usage,
  }
}
