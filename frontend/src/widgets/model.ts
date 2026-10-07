import type { DonutSegment } from "@hollis-labs/kit-dashboard/widgets"
import { dayObservation, type OperationsModel } from "../operations/model"
export const widgetStates = [
  "recorded",
  "empty",
  "observed-zero",
  "loading",
  "error",
  "denied",
  "gapped",
  "unknown",
  "long",
] as const
export type WidgetState = (typeof widgetStates)[number]
export function widgetModel(model: OperationsModel, state: WidgetState = "recorded") {
  const clock = Date.parse(model.referenceClock),
    cutoff = Date.parse(model.cutoff),
    first = clock - 20 * 60000,
    width = 150000
  const blocked = !model.accessible || ["loading", "error", "denied"].includes(state),
    unknown = state === "unknown",
    empty = state === "empty"
  const startEvents = new Map(
    model.dataset.events
      .filter((e) => e.type === "run.started" && Date.parse(e.time) <= cutoff)
      .map((e) => [e.runId, e.time]),
  )
  const from = state === "observed-zero" ? clock - 5 * 60000 : first
  const runs =
    blocked || empty
      ? []
      : model.runs.filter((r) => {
          const stamp = startEvents.get(r.id)
          return (
            stamp !== undefined &&
            Date.parse(stamp) >= from &&
            Date.parse(stamp) <= Math.min(clock, cutoff)
          )
        })
  const bins = empty
    ? []
    : Array.from({ length: 8 }, (_, i) => {
        const start = first + i * width,
          end = start + width,
          date = new Date(start).toISOString().slice(0, 10),
          coverage = dayObservation(model, date)
        const known =
          !blocked &&
          !unknown &&
          coverage.known &&
          coverage.from <= start &&
          start <= cutoff &&
          !(state === "gapped" && i === 2)
        const bucketRuns = runs.filter((r) => {
          const time = Date.parse(startEvents.get(r.id) ?? "invalid")
          return time >= start && (time < end || (i === 7 && time === end))
        })
        const finished = bucketRuns.filter(
          (r) => r.finished !== null && Date.parse(r.finished) <= cutoff,
        ).length
        return {
          index: i,
          from: new Date(start).toISOString(),
          until: new Date(end).toISOString(),
          through: new Date(Math.min(end, cutoff)).toISOString(),
          known,
          partial: known && cutoff < end,
          total: known ? bucketRuns.length : null,
          finished: known ? finished : null,
          noFinish: known ? bucketRuns.length - finished : null,
        }
      }).filter((b) => state !== "observed-zero" || b.index >= 6)
  // Retain original positions: only a leading covered prefix, never compress an interior gap.
  const numeric = bins.slice(
    0,
    bins.findIndex((b) => !b.known) === -1 ? bins.length : bins.findIndex((b) => !b.known),
  )
  const chartAllowed =
    !blocked &&
    !unknown &&
    (empty || numeric.length > 0) &&
    !bins.some((b, i) => !b.known && bins.slice(i + 1).some((next) => next.known))
  const totals = chartAllowed ? numeric.map((b) => b.total ?? 0) : [],
    primary = chartAllowed ? numeric.map((b) => b.finished ?? 0) : [],
    secondary = chartAllowed ? numeric.map((b) => b.noFinish ?? 0) : []
  const countKnown = !blocked && !unknown && (empty || cutoff >= from)
  const finishedRuns = runs.filter((r) => r.finished !== null && Date.parse(r.finished) <= cutoff)
  const seconds = finishedRuns.reduce(
    (sum, r) => sum + (Date.parse(r.finished ?? r.started) - Date.parse(r.started)) / 1000,
    0,
  )
  const statuses = [...new Set(runs.map((r) => r.status))].sort()
  const segments: DonutSegment[] = statuses.map((status) => ({
    key: status,
    label: status,
    color:
      status === "done"
        ? "var(--color-success)"
        : status === "failed"
          ? "var(--color-danger)"
          : status === "running"
            ? "var(--color-info)"
            : "var(--color-fg-secondary)",
    value: runs.filter((r) => r.status === status).length,
  }))
  const recent = [...runs]
    .sort((a, b) => b.started.localeCompare(a.started) || a.id.localeCompare(b.id))
    .slice(0, 5)
  return {
    state,
    blocked,
    unknown,
    empty,
    source: `${model.dataset.version}/${model.dataset.profile}/${model.scenario}/${model.referenceClock}`,
    cutoff: model.cutoff,
    from: new Date(from).toISOString(),
    until: model.referenceClock,
    bins,
    numeric,
    chartAllowed,
    totals,
    primary,
    secondary,
    count: countKnown ? runs.length : null,
    seconds: countKnown ? seconds : null,
    finishedCount: countKnown ? finishedRuns.length : null,
    segments: countKnown ? segments : [],
    recent,
    runs,
    peak: chartAllowed ? Math.max(0, ...totals) : null,
    scaleFloor: chartAllowed ? Math.max(1, ...totals) : null,
  }
}
export type WidgetModel = ReturnType<typeof widgetModel>
