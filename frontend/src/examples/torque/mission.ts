import type { OperationsModel } from "../../operations/model"
import { torqueReferenceModel } from "./reference"
export function volumeStatus(raw: string) {
  if (["success", "done"].includes(raw)) return "Success"
  if (["error", "failed"].includes(raw)) return "Error"
  if (
    [
      "running",
      "doing",
      "started",
      "pending",
      "queued",
      "completed",
      "canceled",
      "cancelled",
      "timeout",
    ].includes(raw)
  )
    return "Reference running bucket"
  return "Unknown"
}
export function distributionStatus(raw: string) {
  if (["success", "done", "completed"].includes(raw)) return "Success"
  if (["error", "failed", "canceled", "cancelled", "timeout"].includes(raw)) return "Error"
  if (["running", "doing", "started", "pending", "queued"].includes(raw)) return "Active"
  return "Other / unknown"
}
export function torqueMissionModel(model: OperationsModel) {
  const ref = torqueReferenceModel(model)
  const joined = model.runs.flatMap((r) =>
    model.usage.filter((u) => u.id === r.usageId && u.runId === r.id && u.time <= model.cutoff),
  )
  const summary = (runs: number, receipts: typeof joined, known: boolean) => ({
    runs: known ? runs : null,
    receipts: known ? receipts.length : null,
    missing: known ? runs - receipts.length : null,
    tokens:
      known && (runs === 0 || receipts.length > 0)
        ? receipts.reduce((n, u) => n + u.tokens, 0)
        : null,
    cost:
      known && (runs === 0 || receipts.length > 0)
        ? receipts.reduce((n, u) => n + u.cost, 0)
        : null,
  })
  const days = ref.days.map((day) => {
    const runs = model.runs.filter((r) => r.started.slice(0, 10) === day.date)
    return {
      ...day,
      statuses: ["Success", "Error", "Reference running bucket", "Unknown"].map((label) => ({
        label,
        count: day.known ? runs.filter((r) => volumeStatus(r.status) === label).length : null,
      })),
      runIds: runs.map((r) => r.id),
    }
  })
  const windowRuns = model.runs.filter(
    (r) => r.started >= ref.reference.charts.from && r.started <= model.cutoff,
  )
  const windowIds = new Set(windowRuns.map((r) => r.id))
  const distribution = ["Success", "Error", "Active", "Other / unknown"].map((label) => ({
    label,
    value: model.runs.filter((r) => distributionStatus(r.status) === label).length,
  }))
  const pipeline = ["todo", "doing", "blocked", "done"].map((status) => ({
    key: status,
    label: status,
    value: model.tasks.filter((t) => t.status === status).length,
  }))
  const omitted = model.tasks.filter((t) => !pipeline.some((p) => p.key === t.status))
  return {
    ...ref,
    days,
    distribution,
    pipeline,
    omitted,
    sample: summary(model.runs.length, joined, ref.available),
    window: summary(
      windowRuns.length,
      joined.filter((u) => windowIds.has(u.runId)),
      ref.available && days.some((d) => d.known),
    ),
  }
}
/** Linear area segments stop at every absent bucket; never interpolate across null evidence. */
export function costSegments(values: readonly (number | null)[]) {
  const max = Math.max(0, ...values.flatMap((v) => (v === null ? [] : [v]))),
    parts: string[] = []
  let points: string[] = []
  const close = () => {
    if (points.length) {
      parts.push(
        `M${points[0].split(",")[0]},140 L${points.join(" L")} L${points.at(-1)!.split(",")[0]},140 Z`,
      )
      points = []
    }
  }
  values.forEach((value, i) => {
    if (value === null) close()
    else points.push(`${20 + i * 40},${140 - (max ? (value / max) * 115 : 0)}`)
  })
  close()
  return parts
}
