import graph from "../../fixtures/operations-torque.json" with { type: "json" }
import reference from "../../fixtures/torque-reference.json" with { type: "json" }
import type { OperationsModel } from "../../operations/model"
import { type FixtureDataset, sourceDataset } from "../../playback/model"
export const torqueProfiles = ["legacy", "torque-16w"] as const
export type TorqueProfile = (typeof torqueProfiles)[number]
export function torqueSource(scenario: string, profile: TorqueProfile): FixtureDataset {
  return profile === "torque-16w" ? graph : sourceDataset(scenario)
}
const canonical = (s: string) =>
  Number.isFinite(Date.parse(s)) && new Date(s).toISOString().replace(".000Z", "Z") === s
/** Explicit source identity and fixed coverage; record chronology is validated by the Go fixture suite. */
export function referenceCompatible(model: OperationsModel, ref = reference) {
  return (
    ref.version === "torque-reference/v1" &&
    ref.generator === "parallax/v8" &&
    ref.profile === "torque-16w" &&
    ref.seed === 4421 &&
    ref.clock === "2026-10-04T14:30:00Z" &&
    ref.operationsVersion === "operations/v2" &&
    ref.operationsGenerator === "parallax/v8" &&
    ref.calendar.from === model.dataset.observedSince &&
    model.dataset.version === ref.operationsVersion &&
    model.dataset.generator === ref.operationsGenerator &&
    model.dataset.profile === ref.profile &&
    model.dataset.seed === ref.seed &&
    model.referenceClock === ref.clock &&
    [ref.calendar, ref.pulse, ref.charts].every(
      (w) =>
        canonical(w.from) &&
        canonical(w.to) &&
        w.from <= w.to &&
        w.from >= ref.calendar.from &&
        w.to === ref.clock,
    ) &&
    ref.pulse.from ===
      new Date(Date.parse(ref.clock) - 86400000).toISOString().replace(".000Z", "Z") &&
    ref.charts.from ===
      new Date(Date.parse(ref.clock.slice(0, 10) + "T00:00:00Z") - 13 * 86400000)
        .toISOString()
        .replace(".000Z", "Z") &&
    ref.startBufferLimit === 500 &&
    ref.recentLimit === 12
  )
}
export function torqueReferenceModel(model: OperationsModel, ref = reference) {
  const compatible = referenceCompatible(model, ref),
    available = compatible && model.accessible
  const ids = new Set(model.runs.map((r) => r.id)),
    taskIds = new Set(model.tasks.map((t) => t.id))
  const updates = available
    ? ref.taskUpdates.filter(
        (u) => u.time <= model.cutoff && ids.has(u.runId) && taskIds.has(u.taskId),
      )
    : []
  const latest = new Map<string, (typeof ref.taskUpdates)[number]>()
  for (const u of updates) {
    const old = latest.get(u.taskId)
    if (!old || u.time > old.time || (u.time === old.time && u.eventId > old.eventId))
      latest.set(u.taskId, u)
  }
  const effectiveUpdates = Array.from(latest.values())
  const starts = available
    ? ref.recordedStarts.filter((e) => e.time <= model.cutoff && ids.has(e.runId))
    : []
  const bucket = (
    start: number,
    end: number,
    window: typeof ref.calendar,
    items: readonly { time: string }[],
  ) => {
    const cutoff = Date.parse(model.cutoff),
      from = Date.parse(window.from),
      to = Date.parse(window.to),
      until = Math.min(end, cutoff, to)
    const authoredGap = model.scenario === "sparse" && new Date(start).getUTCDate() % 3 === 0
    const known = available && !authoredGap && start >= from && start <= cutoff && start < to
    return {
      known,
      partial: known && until < end,
      count: known
        ? items.filter(
            (e) =>
              Date.parse(e.time) >= start &&
              Date.parse(e.time) < end &&
              Date.parse(e.time) <= cutoff &&
              Date.parse(e.time) <= to,
          ).length
        : null,
      from: new Date(start).toISOString(),
      to: new Date(end).toISOString(),
    }
  }
  const dayEnd = Date.parse(model.referenceClock.slice(0, 10) + "T00:00:00Z")
  const calendar = Array.from({ length: 112 }, (_, i) => {
    const start = dayEnd - new Date(dayEnd).getUTCDay() * 86400000 - 105 * 86400000 + i * 86400000
    return {
      date: new Date(start).toISOString().slice(0, 10),
      ...bucket(start, start + 86400000, ref.calendar, [
        ...model.runs.map((r) => ({ time: r.started })),
        ...effectiveUpdates,
      ]),
    }
  })
  // Exact 24 hour review intervals, anchored to supplied UTC clock (not an ambient/local day).
  const pulse = Array.from({ length: 24 }, (_, i) => {
    const start = Date.parse(ref.pulse.from) + i * 3600000
    return bucket(start, start + 3600000, ref.pulse, starts)
  })
  const days = Array.from({ length: 14 }, (_, i) => {
    const start = Date.parse(ref.charts.from) + i * 86400000,
      end = start + 86400000,
      coverage = bucket(start, end, ref.charts, [])
    const runs = model.runs.filter(
      (r) =>
        Date.parse(r.started) >= start && Date.parse(r.started) < end && r.started <= model.cutoff,
    )
    const receipts = runs.flatMap((r) =>
      model.usage.filter((u) => u.id === r.usageId && u.runId === r.id && u.time <= model.cutoff),
    )
    const known = coverage.known,
      received = receipts.length
    const totalsKnown = known && (runs.length === 0 || received > 0)
    return {
      ...coverage,
      date: new Date(start).toISOString().slice(0, 10),
      runs: known ? runs.length : null,
      received: known ? received : null,
      missing: known ? runs.length - received : null,
      inputTokens: totalsKnown ? receipts.reduce((n, u) => n + u.inputTokens, 0) : null,
      outputTokens: totalsKnown ? receipts.reduce((n, u) => n + u.outputTokens, 0) : null,
      cost: totalsKnown ? receipts.reduce((n, u) => n + u.cost, 0) : null,
      receiptCoverage: !known
        ? "Unknown"
        : received < runs.length
          ? "Partial recorded receipts"
          : "Complete supplied receipts",
    }
  })
  const recent = available
    ? [...model.runs]
        .sort((a, b) => b.started.localeCompare(a.started) || a.id.localeCompare(b.id))
        .slice(0, ref.recentLimit)
    : []
  return {
    available,
    compatible,
    reference: ref,
    effectiveUpdates,
    starts,
    calendar,
    pulse,
    days,
    recent,
    attribution: ref.attribution,
    source: JSON.stringify([
      ref.version,
      ref.generator,
      ref.profile,
      ref.seed,
      ref.clock,
      model.dataset.version,
      model.dataset.generator,
      model.dataset.profile,
      model.cutoff,
      model.resource,
      model.query,
      model.tasks.map((t) => t.id),
    ]),
  }
}
