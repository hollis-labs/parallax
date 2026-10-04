import fixture from "../fixtures/operations.json" with { type: "json" }
import history from "../fixtures/operations-large.json" with { type: "json" }
export type Dataset = typeof fixture
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
export function operationsModel(name: string, query = "") {
  const scenario = normalizeScenario(name),
    dataset: Dataset = scenario === "large" || scenario === "sparse" ? history : fixture
  const resource: ResourceState = [
    "loading",
    "error",
    "unavailable",
    "permission-denied",
    "degraded",
    "empty",
  ].includes(scenario)
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
      tokens: accessible ? usage.reduce((s, u) => s + u.tokens, 0) : null,
      cost: accessible ? usage.reduce((s, u) => s + u.cost, 0) : null,
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
      known = dayCoverage(model, date)
    const runs = model.runs.filter(
        (r) => r.started.startsWith(date) && Date.parse(r.started) <= clock,
      ),
      usage = model.usage.filter((u) => u.time.startsWith(date) && Date.parse(u.time) <= clock)
    return {
      date,
      count: known ? runs.length : null,
      tokens: known ? usage.reduce((s, u) => s + u.tokens, 0) : null,
      cost: known ? usage.reduce((s, u) => s + u.cost, 0) : null,
    }
  })
}
