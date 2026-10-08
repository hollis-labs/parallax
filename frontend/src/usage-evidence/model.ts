import type { OperationsModel } from "../operations/model"
export const usageStates = [
  "recorded",
  "empty",
  "loading",
  "error",
  "denied",
  "locked",
  "long-content",
] as const
export type UsageState = (typeof usageStates)[number]
export const capacityModes = [
  "unknown",
  "zero",
  "normal",
  "overbudget",
  "negative",
  "nan",
  "infinity",
  "zero-max",
] as const
export type CapacityMode = (typeof capacityModes)[number]
export function capacitySample(mode: CapacityMode) {
  switch (mode) {
    case "zero":
      return { usedTokens: 0, maxTokens: 1000 }
    case "normal":
      return { usedTokens: 250, maxTokens: 1000 }
    case "overbudget":
      return { usedTokens: 1500, maxTokens: 1000 }
    case "negative":
      return { usedTokens: -1, maxTokens: 1000 }
    case "nan":
      return { usedTokens: Number.NaN, maxTokens: 1000 }
    case "infinity":
      return { usedTokens: Number.POSITIVE_INFINITY, maxTokens: 1000 }
    case "zero-max":
      return { usedTokens: 0, maxTokens: 0 }
    default:
      return { usedTokens: undefined, maxTokens: undefined }
  }
}
export function usageEvidenceModel(operations: OperationsModel, state: UsageState = "recorded") {
  const compatible = operations.dataset.profile === "records-8"
  const available =
    operations.accessible && compatible && !["loading", "error", "denied"].includes(state)
  const runs = available && state !== "empty" ? operations.runs : []
  return {
    operations,
    state,
    compatible,
    available,
    runs,
    source: [
      operations.dataset.version,
      operations.referenceClock,
      operations.dataset.profile,
      operations.scenario,
      operations.resource,
      operations.cutoff,
      state,
    ].join("/"),
    cutoff: operations.cutoff,
  }
}
export type UsageEvidenceModel = ReturnType<typeof usageEvidenceModel>
export function usageEvidence(data: UsageEvidenceModel, id: string) {
  const run = data.available ? data.runs.find((r) => r.id === id) : undefined
  if (!run) return null
  const receipt = data.operations.usage.find(
    (u) => u.id === run.usageId && u.runId === run.id && u.time <= data.cutoff,
  )
  const task = data.operations.tasks.find((t) => t.id === run.taskId)
  return { run, task, receipt }
}
export function finiteAmount(value: number | undefined) {
  return value !== undefined && Number.isFinite(value) && value >= 0 ? String(value) : "Unknown"
}
