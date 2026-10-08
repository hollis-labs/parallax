import communications from "../fixtures/communications.json" with { type: "json" }
import type { OperationsModel } from "../operations/model"
export const conversationEvidenceStates = [
  "recorded",
  "empty",
  "loading",
  "error",
  "denied",
  "locked",
  "long-content",
] as const
export type EvidenceState = (typeof conversationEvidenceStates)[number]
export const toolPhases = [
  "pending",
  "running",
  "awaiting-confirmation",
  "confirmed",
  "completed",
  "denied",
  "error",
  "unknown",
] as const
export type ToolPhase = (typeof toolPhases)[number]
export const outcomeKinds = ["absent", "null", "zero", "inert-text"] as const
export type OutcomeKind = (typeof outcomeKinds)[number]
export function conversationEvidenceModel(
  operations: OperationsModel,
  state: EvidenceState = "recorded",
) {
  const compatible = operations.dataset.profile === "records-8"
  const available =
    operations.accessible && compatible && !["loading", "error", "denied"].includes(state)
  const ids = new Set(operations.runs.map((r) => r.id))
  const sessions =
    available && state !== "empty"
      ? operations.dataset.sessions.filter((s) => ids.has(s.runId))
      : []
  const source = [
    operations.dataset.version,
    operations.referenceClock,
    operations.dataset.profile,
    operations.scenario,
    operations.resource,
    operations.cutoff,
    communications.version,
    communications.clock,
    state,
  ].join("/")
  return {
    operations,
    state,
    available,
    compatible,
    sessions,
    source,
    cutoff: operations.cutoff,
    communications,
    blockedReason: !operations.accessible
      ? "Operations evidence unavailable"
      : !compatible
        ? "Conversation evidence unavailable for this source profile"
        : state === "loading"
          ? "Conversation evidence loading appearance"
          : state === "error"
            ? "Conversation evidence failure appearance"
            : state === "denied"
              ? "Conversation evidence denied by review policy"
              : "",
  }
}
export type EvidenceModel = ReturnType<typeof conversationEvidenceModel>
export function sessionEvidence(data: EvidenceModel, id: string) {
  const session = data.available ? data.sessions.find((s) => s.id === id) : undefined
  if (!session) return null
  const run = data.operations.runs.find((r) => r.id === session.runId)
  if (!run) return null
  const tools = data.operations.dataset.toolCalls.filter((t) => t.runId === run.id)
  const messages = data.operations.dataset.messages.filter(
    (m) => m.sessionId === session.id && m.runId === run.id,
  )
  const metadataAvailable = data.cutoff >= data.communications.clock && data.compatible
  const metadata = metadataAvailable
    ? data.communications.chatSessions.find((s) => s.sessionId === session.id && s.runId === run.id)
    : undefined
  const contact = metadata
    ? data.communications.contacts.find((c) => c.id === metadata.contactId)
    : undefined
  const receipt = data.operations.usage.find((u) => u.id === run.usageId && u.runId === run.id)
  const provenance = [
    {
      id: "operations",
      label: `${data.operations.dataset.version} · immutable recorded source · review cutoff ${data.cutoff}`,
    },
  ]
  if (metadata)
    provenance.push({
      id: "communications",
      label: `${data.communications.version} · supplied metadata snapshot ${data.communications.clock}`,
    })
  if (receipt)
    provenance.push({
      id: receipt.id,
      label: `${receipt.id} · ${receipt.time} · ${receipt.tokens} recorded tokens`,
    })
  return {
    session,
    run,
    tools,
    messages,
    metadataAvailable,
    metadata,
    contact,
    receipt,
    provenance,
  }
}
export function recordedToolState(status: string) {
  return status === "done"
    ? "completed"
    : status === "failed"
      ? "error"
      : status === "running"
        ? "running"
        : null
}
export function specimenOutcome(kind: OutcomeKind): unknown {
  return kind === "absent"
    ? undefined
    : kind === "null"
      ? null
      : kind === "zero"
        ? 0
        : "<script>inert authored example</script>\nhttps://example.invalid/not-a-link"
}
