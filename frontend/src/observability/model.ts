import type {
  DiagnosticValidation,
  DiagnosticValue,
  HealthStatus,
  ObservationState,
} from "@hollis-labs/kit-observe"
import artifact from "../fixtures/observations.json" with { type: "json" }
import operations from "../fixtures/operations.json" with { type: "json" }
import { projectDataset } from "../playback/model"
export const observationFixture = artifact
export const inspectionStates = [
  "normal",
  "empty",
  "loading",
  "error",
  "refresh",
  "refresh-error",
  "stale",
  "degraded",
  "missing",
  "denied",
  "unknown",
  "sparse",
  "truncated",
  "invalid-diagnostic",
] as const
export type InspectionState = (typeof inspectionStates)[number]
export const timelineTimes = [
  ...new Set([
    operations.runs[0].started,
    ...operations.logs.map((l) => l.time),
    ...operations.events.map((e) => e.time),
    ...operations.spans.flatMap((s) => [s.started, ...(s.finished ? [s.finished] : [])]),
    artifact.clock,
  ]),
].sort()
export function resourceObservation(
  id: string,
  state: InspectionState,
  cutoff = artifact.clock,
): ObservationState {
  const evidence = artifact.resources.find((r) => r.id === id)
  if (!evidence) throw new Error("Undeclared fixture resource")
  const noEvidence =
    ["loading", "error", "missing", "denied"].includes(state) || evidence.observedAt > cutoff
  return {
    phase:
      state === "loading" || state === "refresh"
        ? "loading"
        : state === "error" || state === "refresh-error"
          ? "error"
          : "ready",
    observedAt: noEvidence ? undefined : evidence.observedAt,
    nowMs: Date.parse(cutoff) + (state === "stale" ? 300000 : 0),
    staleAfterMs: evidence.staleAfterMs,
    ...(state === "error" || state === "refresh-error"
      ? { error: "Scripted observation read failure; no request was made" }
      : {}),
    supported: state !== "denied",
  }
}
export function validateDiagnostic(value: unknown): DiagnosticValidation {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { state: "invalid", messages: ["Expected bounded fixture object"] }
  const data = value as Record<string, unknown>,
    keys = Object.keys(data)
  if (
    keys.length !== 3 ||
    !keys.every((k) => ["fixture", "operationsVersion", "failedRunIds"].includes(k)) ||
    data.fixture !== true ||
    data.operationsVersion !== operations.version ||
    !Array.isArray(data.failedRunIds) ||
    data.failedRunIds.length > 8 ||
    new Set(data.failedRunIds).size !== data.failedRunIds.length ||
    !data.failedRunIds.every(
      (id) =>
        typeof id === "string" && operations.runs.some((r) => r.id === id && r.status === "failed"),
    )
  )
    return {
      state: "invalid",
      messages: ["Diagnostic keys, bounds or failed-run relationships are invalid"],
    }
  return { state: "valid" }
}
export function inspectionModel(
  state: InspectionState,
  query = "",
  level = "all",
  cutoff = artifact.clock,
  overrides: Record<string, InspectionState> = {},
  allowOutsideCoverage = false,
  sourceProfile = operations.profile,
) {
  const sourceCompatible = sourceProfile === operations.profile
  const outOfCoverage = !sourceCompatible || cutoff < artifact.from || cutoff > artifact.clock
  const accessible = !outOfCoverage && !["loading", "error", "missing", "denied"].includes(state),
    empty = state === "empty"
  const time = Date.parse(cutoff)
  if (!Number.isFinite(time) || (!allowOutsideCoverage && outOfCoverage))
    throw new Error("Invalid bounded review cutoff")
  const projected = accessible ? projectDataset(operations, cutoff) : null
  const runs = !empty ? (projected?.runs ?? []) : []
  const runIds = new Set(runs.map((r) => r.id)),
    usage =
      accessible && !empty
        ? operations.usage.filter((u) => runIds.has(u.runId) && u.time <= cutoff)
        : []
  const logs =
    accessible && !empty
      ? operations.logs
          .filter(
            (l) =>
              l.time <= cutoff &&
              (level === "all" || l.level === level) &&
              (l.id + l.message + l.runId + l.traceId + l.spanId)
                .toLowerCase()
                .includes(query.toLowerCase()),
          )
          .sort((a, b) => b.time.localeCompare(a.time) || a.id.localeCompare(b.id))
      : []
  const series =
      empty || !accessible
        ? []
        : artifact.tokenSamples
            .filter((p) => p.at <= cutoff)
            .map((p, i) => ({ ...p, value: state === "sparse" && i === 3 ? null : p.value })),
    duration =
      empty || !accessible
        ? []
        : artifact.durationSamples
            .filter((p) => p.at <= cutoff)
            .map((p) => {
              const end = operations.runs.find((r) => r.started === p.at)?.finished
              return { ...p, value: end && end <= cutoff ? p.value : null }
            })
  const data: DiagnosticValue =
    state === "invalid-diagnostic"
      ? { fixture: true, operationsVersion: operations.version, failedRunIds: ["RUN-NOT-FOUND"] }
      : !accessible || artifact.resources.find((r) => r.id === "diagnostics")!.observedAt > cutoff
        ? null
        : {
            fixture: true,
            operationsVersion: operations.version,
            failedRunIds: runs.filter((r) => r.status === "failed").map((r) => r.id),
          }
  const health: HealthStatus =
    !accessible ||
    state === "unknown" ||
    empty ||
    artifact.resources.find((r) => r.id === "health")!.observedAt > cutoff
      ? "unknown"
      : state === "degraded" || runs.some((r) => r.status === "failed")
        ? "degraded"
        : "healthy"
  const derived = (at: string | undefined, resource: string): ObservationState => {
    const receipt = resourceObservation(
      resource,
      outOfCoverage ? "missing" : (overrides[resource] ?? state),
      cutoff,
    )
    if (cutoff === artifact.clock) return receipt
    return { ...receipt, observedAt: accessible ? at : undefined }
  }
  const visibleLogs = operations.logs.filter((l) => l.time <= cutoff)
  const projections = {
    logs: derived(
      visibleLogs
        .map((l) => l.time)
        .sort()
        .at(-1),
      "diagnostics",
    ),
    runs: derived(
      runs
        .map((r) => r.started)
        .sort()
        .at(-1),
      "diagnostics",
    ),
    usage: derived(usage.at(-1)?.time, "stats"),
    stats: derived(
      [...runs.map((r) => r.started), ...usage.map((u) => u.time)].sort().at(-1),
      "stats",
    ),
    token: derived(series.at(-1)?.at, "token-series"),
    duration: derived(
      runs
        .map((r) => r.finished)
        .filter((t): t is string => !!t)
        .sort()
        .at(-1),
      "duration-series",
    ),
  }
  return {
    projections,
    observations: Object.fromEntries(
      artifact.resources.map((r) => [
        r.id,
        resourceObservation(r.id, outOfCoverage ? "missing" : (overrides[r.id] ?? state), cutoff),
      ]),
    ),
    state,
    outOfCoverage,
    sourceCompatible,
    accessible,
    empty,
    cutoff,
    runs,
    usage,
    logs,
    series: state === "truncated" ? series.slice(0, 4) : series,
    duration,
    health,
    diagnostic: data,
    validation:
      data === null
        ? {
            state: "unsupported" as const,
            messages: ["Diagnostic receipt not observed through this cutoff"],
          }
        : validateDiagnostic(data),
    tokens: accessible ? usage.reduce((s, u) => s + u.tokens, 0) : null,
    cost: accessible ? usage.reduce((s, u) => s + u.cost, 0) : null,
    dataset: operations,
    artifact,
  }
}
export type InspectionModel = ReturnType<typeof inspectionModel>
export function traceDetail(model: InspectionModel, runId: string | null, spanId?: string | null) {
  const run = model.runs.find((r) => r.id === runId)
  if (!run || !model.accessible) return null
  const trace = operations.traces.find((t) => t.id === run.traceId),
    spans = operations.spans
      .filter((s) => s.traceId === run.traceId && s.started <= model.cutoff)
      .map((s) => ({
        ...s,
        status:
          !s.finished || s.finished > model.cutoff
            ? "running"
            : model.state === "unknown"
              ? "future-review"
              : s.status,
        finished: s.finished && s.finished <= model.cutoff ? s.finished : null,
      }))
  const selected = spans.find((s) => s.id === spanId) ?? spans[0],
    tools = operations.toolCalls.filter(
      (t) =>
        t.runId === run.id && t.started <= model.cutoff && (!selected || t.spanId === selected.id),
    )
  return {
    run,
    trace,
    spans,
    selected,
    tools: tools.map((t) => ({
      ...t,
      status: t.finished <= model.cutoff ? t.status : "running",
      finished: t.finished <= model.cutoff ? t.finished : null,
      output: t.finished <= model.cutoff ? t.output : null,
    })),
    logs: operations.logs.filter(
      (l) =>
        l.time <= model.cutoff && l.runId === run.id && (!selected || l.spanId === selected.id),
    ),
    usage: model.usage.find((u) => u.runId === run.id),
    session: operations.sessions.find((s) => s.id === run.sessionId),
  }
}
