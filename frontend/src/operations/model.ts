import { projectDataset, type ResourceOverride, sourceDataset } from "../playback/model"
export type Dataset = ReturnType<typeof projectDataset>
export type Task = Dataset["tasks"][number]
export type TaskView = Omit<Task, "owner"> & { owner: string | null }
export const scenarios = [
  "populated",
  "empty",
  "loading",
  "error",
  "degraded",
  "unavailable",
  "permission-denied",
  "missing-metadata",
  "long-labels",
  "large",
  "sparse",
  "unknown-status",
] as const
export type ScenarioName = (typeof scenarios)[number]
export type ResourceState =
  | "ready"
  | "empty"
  | "loading"
  | "error"
  | "degraded"
  | "unavailable"
  | "permission-denied"
export function normalizeScenario(value: string): ScenarioName {
  return scenarios.find((s) => s === value) ?? "populated"
}
export function operationsModel(
  name: string,
  query = "",
  review: { cutoff?: string; override?: ResourceOverride } = {},
) {
  const scenario = normalizeScenario(name),
    source = sourceDataset(scenario),
    dataset: Dataset = projectDataset(source, review.cutoff ?? source.clock)
  const resource: ResourceState =
    review.override && review.override !== "scenario"
      ? review.override
      : ["loading", "error", "unavailable", "permission-denied", "degraded", "empty"].includes(
            scenario,
          )
        ? (scenario as ResourceState)
        : "ready"
  const allTasks: TaskView[] = dataset.tasks.map((t, i) => ({
    ...t,
    owner: scenario === "missing-metadata" ? null : t.owner,
    title:
      scenario === "long-labels"
        ? t.title +
          " across distributed regional environments with exceptionally descriptive review context"
        : t.title,
    status: scenario === "unknown-status" && i === 0 ? "external-review" : t.status,
  }))
  const accessible = !["loading", "error", "unavailable", "permission-denied"].includes(resource)
  const tasks =
    accessible && scenario !== "empty"
      ? allTasks.filter((t) =>
          (t.title + t.id + (t.owner ?? "")).toLowerCase().includes(query.toLowerCase()),
        )
      : []
  const runIds = new Set(tasks.map((t) => t.runId)),
    runs = dataset.runs.filter((r) => runIds.has(r.id)),
    usage = dataset.usage.filter((u) => runIds.has(u.runId))
  return {
    scenario,
    dataset,
    referenceClock: source.clock,
    cutoff: dataset.clock,
    resource,
    accessible,
    allTasks,
    tasks,
    runs,
    usage,
    stats: {
      count: accessible ? tasks.length : null,
      done: accessible ? tasks.filter((t) => t.status === "done").length : null,
      active: accessible ? runs.filter((r) => r.status === "running").length : null,
      tokens:
        accessible && (!runs.length || usage.length)
          ? usage.reduce((s, u) => s + u.tokens, 0)
          : null,
      cost:
        accessible && (!runs.length || usage.length) ? usage.reduce((s, u) => s + u.cost, 0) : null,
    },
  }
}
export type OperationsModel = ReturnType<typeof operationsModel>
export function runDetail(model: OperationsModel, taskId: string | null) {
  const task = model.allTasks.find((t) => t.id === taskId)
  if (!task || !model.accessible || model.scenario === "empty") return null
  const d = model.dataset,
    run = d.runs.find((r) => r.id === task.runId)
  if (!run) return null
  return {
    cutoff: model.cutoff,
    task,
    run,
    session: d.sessions.find((s) => s.id === run.sessionId),
    messages: d.messages.filter((m) => m.sessionId === run.sessionId),
    toolCalls: d.toolCalls.filter((t) => t.runId === run.id),
    trace: d.traces.find((t) => t.id === run.traceId),
    spans: d.spans.filter((s) => s.traceId === run.traceId),
    logs: d.logs.filter((l) => l.runId === run.id),
    events: d.events.filter((e) => e.runId === run.id),
    usage: d.usage.find((u) => u.id === run.usageId),
  }
}
export type RunDetail = NonNullable<ReturnType<typeof runDetail>>
/** Full UTC-day coverage only. Current day is covered through the fixed clock;
 * partial first day and scripted sparse telemetry are unavailable, never zero. */
export function dayCoverage(model: OperationsModel, date: string) {
  const start = Date.parse(`${date}T00:00:00Z`),
    clock = Date.parse(model.dataset.clock),
    since = Date.parse(model.dataset.observedSince)
  const sparseGap = model.scenario === "sparse" && new Date(start).getUTCDate() % 3 === 0
  return model.accessible && start >= since && start <= clock && !sparseGap
}
export function daySeries(model: OperationsModel) {
  const clock = Date.parse(model.dataset.clock)
  return Array.from({ length: 14 }, (_, i) => {
    const date = new Date(clock - (13 - i) * 86400000).toISOString().slice(0, 10),
      coverage = dayObservation(model, date),
      known = coverage.known
    const runs = model.runs.filter(
        (r) =>
          r.started.startsWith(date) &&
          Date.parse(r.started) >= coverage.from &&
          Date.parse(r.started) <= clock,
      ),
      usage = model.usage.filter(
        (u) =>
          u.time.startsWith(date) &&
          Date.parse(u.time) >= coverage.from &&
          Date.parse(u.time) <= clock,
      )
    return {
      date,
      partial: coverage.partial,
      count: known ? runs.length : null,
      tokens:
        known && (!model.runs.length || model.usage.length)
          ? usage.reduce((s, u) => s + u.tokens, 0)
          : null,
      inputTokens:
        known && (!model.runs.length || model.usage.length)
          ? usage.reduce((s, u) => s + u.inputTokens, 0)
          : null,
      outputTokens:
        known && (!model.runs.length || model.usage.length)
          ? usage.reduce((s, u) => s + u.outputTokens, 0)
          : null,
      cost:
        known && (!model.runs.length || model.usage.length)
          ? usage.reduce((s, u) => s + u.cost, 0)
          : null,
    }
  })
}

/** Intersect the authored coverage interval, never invent whole-day observation.
 * First/current days are explicitly partial; sparse rollups remain unknown. */
export function dayObservation(model: OperationsModel, date: string) {
  const start = Date.parse(`${date}T00:00:00Z`),
    end = start + 86400000,
    since = Date.parse(model.dataset.observedSince),
    clock = Date.parse(model.cutoff),
    from = Math.max(start, since),
    through = Math.min(end, clock),
    sparse = model.scenario === "sparse" && new Date(start).getUTCDate() % 3 === 0,
    known = model.accessible && from <= through && start <= clock && end > since && !sparse
  return { known, partial: known && (from > start || through < end), from, through }
}
export function calendarSeries(model: OperationsModel) {
  const now = Date.parse(model.cutoff),
    date = new Date(now),
    sunday =
      Date.parse(`${date.toISOString().slice(0, 10)}T00:00:00Z`) - date.getUTCDay() * 86400000
  return Array.from({ length: 112 }, (_, i) => {
    const day = new Date(sunday - 105 * 86400000 + i * 86400000).toISOString().slice(0, 10),
      coverage = dayObservation(model, day),
      count = coverage.known
        ? model.runs.filter(
            (r) =>
              r.started.startsWith(day) &&
              Date.parse(r.started) >= coverage.from &&
              Date.parse(r.started) <= coverage.through,
          ).length
        : null
    return { day, count, ...coverage }
  })
}
