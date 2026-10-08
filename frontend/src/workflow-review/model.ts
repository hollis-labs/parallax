import fixture from "../fixtures/developer.json" with { type: "json" }
import type { OperationsModel } from "../operations/model"
export const workflowStates = [
  "recorded",
  "empty",
  "loading",
  "error",
  "denied",
  "locked",
  "long-content",
  "unknown",
] as const
export type WorkflowState = (typeof workflowStates)[number]
export function workflowModel(operations: OperationsModel, state: WorkflowState = "recorded") {
  const compatible = operations.dataset.profile === "records-8"
  const available =
    operations.accessible &&
    compatible &&
    operations.cutoff >= fixture.recordedAt &&
    !["loading", "error", "denied"].includes(state)
  const nodes =
    available && state !== "empty"
      ? fixture.nodes.map((n, i) => ({
          ...n,
          label:
            n.label +
            (state === "long-content"
              ? " — authored long descriptive inspection context, not a processing stage"
              : ""),
          kind: state === "unknown" && i === 2 ? "unrecognized-fixture-step" : n.kind,
        }))
      : []
  const edges = nodes.length ? fixture.edges : []
  const run = available ? operations.runs.find((r) => r.id === fixture.files[0].runId) : undefined
  const tool = available
    ? operations.dataset.toolCalls.find(
        (t) => t.id === fixture.files[0].toolId && t.runId === run?.id,
      )
    : undefined
  const spans = available
    ? operations.dataset.spans.filter(
        (s) => nodes.some((n) => n.spanId === s.id) && s.traceId === run?.traceId,
      )
    : []
  const usage = available
    ? operations.usage.find((u) => u.id === run?.usageId && u.runId === run.id)
    : undefined
  return {
    state,
    available,
    compatible,
    nodes,
    edges,
    run,
    tool,
    spans,
    usage,
    fixture,
    cutoff: operations.cutoff,
    source: [
      fixture.version,
      fixture.recordedAt,
      fixture.clock,
      operations.dataset.version,
      operations.referenceClock,
      operations.dataset.profile,
      operations.scenario,
      operations.resource,
      operations.cutoff,
      state,
    ].join("/"),
    blockedReason: !operations.accessible
      ? "Operations evidence unavailable"
      : !compatible
        ? "Workflow unavailable for this source profile"
        : operations.cutoff < fixture.recordedAt
          ? "Workflow not observed through this cutoff"
          : state === "loading"
            ? "Workflow loading appearance"
            : state === "error"
              ? "Workflow failure appearance"
              : state === "denied"
                ? "Workflow denied by review policy"
                : "",
  }
}
export type WorkflowModel = ReturnType<typeof workflowModel>
export function workflowTarget(data: WorkflowModel, id: string) {
  if (!data.available) return null
  const node = data.nodes.find((n) => n.id === id)
  const edge = data.edges.find((e) => e.id === id)
  if (node) return { node, edge: null }
  if (
    edge &&
    data.nodes.some((n) => n.id === edge.source) &&
    data.nodes.some((n) => n.id === edge.target)
  )
    return { node: null, edge }
  return null
}
