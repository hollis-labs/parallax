import type { OperationsModel, TaskView } from "../operations/model"
export const usageFilters = ["all", "recorded", "missing", "zero"] as const
export type UsageFilter = (typeof usageFilters)[number]
export const runStatuses = ["running", "done", "failed", "unknown"] as const
export interface RunRow {
  id: string
  task: TaskView
  run: OperationsModel["runs"][number]
  tokens: number | null
  evidence: "recorded" | "missing"
  ownerId: string
}
export function explorerSource(model: OperationsModel) {
  return [
    model.dataset.version,
    model.dataset.profile,
    model.referenceClock,
    model.cutoff,
    model.scenario,
    model.resource,
  ].join("/")
}
export function explorerProjection(
  model: OperationsModel,
  query = "",
  statuses: readonly string[] = [],
  owner: string | null = null,
  usage: UsageFilter = "all",
) {
  const admitted: RunRow[] =
    model.accessible && model.scenario !== "empty"
      ? model.tasks.flatMap((task) => {
          const run = model.runs.find((r) => r.id === task.runId)
          if (!run) return []
          const receipt = model.usage.find((u) => u.id === run.usageId && u.runId === run.id)
          return [
            {
              id: task.id,
              task,
              run,
              tokens: receipt?.tokens ?? null,
              evidence: receipt ? ("recorded" as const) : ("missing" as const),
              ownerId: task.owner ?? "missing-owner",
            },
          ]
        })
      : []
  const owners = [...new Set(admitted.map((r) => r.ownerId))].map((id) => ({
    id,
    name: id === "missing-owner" ? "Owner unavailable" : id,
    count: admitted.filter((r) => r.ownerId === id).length,
  }))
  const knownOwner = owner === null || owners.some((o) => o.id === owner)
  const matches = admitted.filter((r) => {
    const state = runStatuses.includes(r.run.status as (typeof runStatuses)[number])
      ? r.run.status
      : "unknown"
    return (
      knownOwner &&
      (!statuses.length || statuses.includes(state)) &&
      (owner === null || r.ownerId === owner) &&
      (usage === "all" || usage === "zero"
        ? usage === "all" || r.tokens === 0
        : r.evidence === usage) &&
      [r.id, r.task.title, r.run.id, r.task.owner ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase())
    )
  })
  return {
    source: explorerSource(model),
    admitted,
    owners,
    matches,
    knownOwner,
    zeroReceipts: admitted.filter((r) => r.tokens === 0).length,
    missingReceipts: admitted.filter((r) => r.tokens === null).length,
    activeFilters: statuses.length + (owner === null ? 0 : 1) + (usage === "all" ? 0 : 1),
  }
}
