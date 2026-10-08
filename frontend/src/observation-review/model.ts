import type {
  HealthCheck,
  HealthStatus,
  ObservationState,
  StatObservation,
} from "@hollis-labs/kit-observe"
import type { SampleSeriesViewProps } from "@hollis-labs/kit-observe/charts"
import fixture from "../fixtures/observations.json" with { type: "json" }
import operations from "../fixtures/operations.json" with { type: "json" }
export const observationAppearances = [
  "recorded",
  "idle",
  "initial-loading",
  "initial-error",
  "refresh-loading",
  "refresh-error",
  "paused",
  "unsupported",
  "empty",
  "long",
  "gap",
  "truncated",
  "nonfinite",
  "denied",
  "locked",
  "invalid-receipt",
  "bounded-window",
] as const
export type ObservationAppearance = (typeof observationAppearances)[number]
export const reviewClocks = [
  "reference",
  "at-threshold",
  "after-threshold",
  "future-age",
  "invalid-clock",
  "invalid-threshold",
] as const
export type ReviewClock = (typeof reviewClocks)[number]
export const reviewedResources = ["health", "stats", "token-series", "duration-series"] as const
export type ReviewedResource = (typeof reviewedResources)[number]
export const healthAppearances = ["derived", "healthy", "degraded", "unhealthy", "unknown"] as const
export type HealthAppearance = (typeof healthAppearances)[number]
export function observationReviewModel(
  state: ObservationAppearance = "recorded",
  context = "populated",
  resourceId: ReviewedResource = "health",
  clock: ReviewClock = "reference",
  healthAppearance: HealthAppearance = "derived",
  copy = false,
) {
  const selected = fixture.resources.find((r) => r.id === resourceId)!
  const nowMs =
    clock === "invalid-clock"
      ? Number.NaN
      : clock === "at-threshold"
        ? Date.parse(selected.observedAt) + selected.staleAfterMs
        : clock === "after-threshold"
          ? Date.parse(selected.observedAt) + selected.staleAfterMs + 1
          : clock === "future-age"
            ? Date.parse(selected.observedAt) - 1
            : Date.parse(fixture.clock)
  const accessible = state !== "denied" && context !== "permission-denied"
  const editable = accessible && state !== "locked"
  const observations: Record<string, ObservationState> = Object.fromEntries(
    fixture.resources
      .filter((r) => r.id !== "diagnostics")
      .map((r) => {
        const active = r.id === resourceId
        const withheld = active && ["idle", "initial-loading", "initial-error"].includes(state)
        return [
          r.id,
          {
            phase: active
              ? state === "idle"
                ? "idle"
                : state === "initial-loading" || state === "refresh-loading"
                  ? "loading"
                  : state === "initial-error" || state === "refresh-error" || state === "locked"
                    ? "error"
                    : "ready"
              : "ready",
            observedAt: withheld
              ? undefined
              : active && state === "invalid-receipt"
                ? "invalid-authored-time"
                : r.observedAt,
            nowMs,
            staleAfterMs: clock === "invalid-threshold" ? 0 : r.staleAfterMs,
            supported: !(active && state === "unsupported"),
            paused: active && state === "paused",
            error:
              active &&
              (state === "initial-error" || state === "refresh-error" || state === "locked")
                ? "Authored read failure appearance; no request made"
                : undefined,
          } satisfies ObservationState,
        ]
      }),
  )
  const failed = operations.runs.filter((r) => r.status === "failed")
  const health: HealthStatus =
    healthAppearance === "derived" ? (failed.length ? "degraded" : "healthy") : healthAppearance
  const checks: readonly HealthCheck[] =
    state === "empty"
      ? []
      : [
          {
            id: "recorded-outcomes",
            label: "Recorded scripted outcomes",
            status: healthAppearance === "derived" ? health : "unknown",
            message: `${failed.length} failed of ${operations.runs.length} supplied runs at record cutoff ${operations.clock}; this is a snapshot projection, not live service health`,
          },
          {
            id: "authored-appearance",
            label: "Controlled health appearance",
            status: health,
            message:
              healthAppearance === "derived"
                ? "Summary derived from fixed run outcomes"
                : "Separately authored supported status; not a newly observed health result",
          },
        ]
  const tokens = operations.usage.reduce((s, u) => s + u.tokens, 0)
  const long = state === "long" ? " · Authored long label ".repeat(9) : ""
  const stats: readonly StatObservation[] =
    state === "empty"
      ? []
      : [
          {
            id: "tokens",
            label: "Recorded token receipt total" + long,
            value: tokens,
            unit: "count",
            kind: "counter",
            observation: observations.stats,
          },
          {
            id: "first-zero",
            label: "First supplied cumulative sample",
            value: fixture.tokenSamples[0].value,
            unit: "count",
            kind: "counter",
            observation: observations.stats,
          },
          {
            id: "missing",
            label: "First supplied duration sample",
            value: fixture.durationSamples[0].value,
            unit: "seconds",
            kind: "gauge",
            observation: observations.stats,
          },
          {
            id: "duration",
            label: "Last supplied run duration",
            value: fixture.durationSamples.at(-1)!.value,
            unit: "seconds",
            kind: "gauge",
            observation: observations.stats,
          },
          ...(state === "nonfinite"
            ? [
                {
                  id: "invalid",
                  label: "Authored invalid numeric appearance",
                  value: Number.NaN,
                  unit: "milliseconds" as const,
                  kind: "gauge" as const,
                  observation: observations.stats,
                },
              ]
            : []),
        ]
  const seriesId = resourceId === "duration-series" ? "duration-series" : "token-series"
  const sourcePoints =
    seriesId === "duration-series" ? fixture.durationSamples : fixture.tokenSamples
  const from = state === "bounded-window" ? "2026-10-04T14:28:00Z" : fixture.from,
    to = fixture.to,
    limit = state === "truncated" ? 4 : 16
  const points =
    state === "empty"
      ? []
      : sourcePoints
          .filter((p) => p.at >= from && p.at <= to)
          .slice(0, limit)
          .map((p, i) => ({ at: p.at, value: state === "gap" && i === 2 ? null : p.value }))
  const series: SampleSeriesViewProps = {
    label:
      seriesId === "token-series"
        ? "Exact supplied cumulative samples"
        : "Exact supplied duration samples",
    points,
    unit: seriesId === "token-series" ? "count" : "seconds",
    kind: seriesId === "token-series" ? "counter" : "gauge",
    requested: { from, to, limit },
    bounds: { maxPoints: 16, maxWindowSeconds: 3600 },
    truncated: state === "truncated" && sourcePoints.length > points.length,
    observation: observations[seriesId],
  }
  if (
    !Number.isFinite(Date.parse(from)) ||
    !Number.isFinite(Date.parse(to)) ||
    Date.parse(to) < Date.parse(from) ||
    (Date.parse(to) - Date.parse(from)) / 1000 > series.bounds.maxWindowSeconds ||
    points.length > limit ||
    points.length > series.bounds.maxPoints ||
    points.some(
      (p, i) =>
        !Number.isFinite(Date.parse(p.at)) ||
        (p.value !== null && !Number.isFinite(p.value)) ||
        (i > 0 && p.at <= points[i - 1].at),
    )
  )
    throw Error("Host sample bounds must be satisfied before rendering")
  return {
    fixture,
    operations,
    selected,
    resourceId,
    clock,
    healthAppearance,
    state,
    accessible,
    editable,
    observations,
    health,
    checks,
    stats,
    series,
    source: `observation-review/v1/${fixture.version}/${operations.version}/${fixture.clock}/${context}/${resourceId}/${clock}/${healthAppearance}/${copy ? "reviewed-copy" : "original"}`,
  }
}
export type ObservationReviewModel = ReturnType<typeof observationReviewModel>
export function observationCandidate(data: ObservationReviewModel, resourceId: string) {
  const receipt = data.fixture.resources.find((r) => r.id === resourceId)
  const state = data.observations[resourceId]
  if (
    !data.editable ||
    !receipt ||
    !state ||
    state.supported === false ||
    !["error", "idle"].includes(state.phase)
  )
    return null
  return {
    kind: "retry-inspection",
    resourceId,
    receipt: state.observedAt ?? null,
    phase: state.phase,
    clock: data.clock,
    now: Number.isFinite(state.nowMs)
      ? new Date(state.nowMs).toISOString()
      : "invalid controlled clock",
    staleAfterMs: state.staleAfterMs,
    source: data.source,
    note: "Local candidate only; no request, new receipt, retimestamping or successful outcome",
  }
}
