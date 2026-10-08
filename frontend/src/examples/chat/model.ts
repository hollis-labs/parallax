import pack from "../../fixtures/chat-example.json" with { type: "json" }
import communications from "../../fixtures/communications.json" with { type: "json" }
import operations from "../../fixtures/operations.json" with { type: "json" }

export const chatPack = pack
export type ChatPack = typeof pack
export const chatPackStates = [
  "recorded",
  "empty",
  "loading",
  "error",
  "denied",
  "unknown",
  "locked",
  "long",
  "pending-card",
  "unknown-card",
  "stalled-preview",
] as const
export type ChatPackState = (typeof chatPackStates)[number]
/** Metadata admission only. Go validates complete records, order and cross-family joins. */
export function chatPackCompatible(p: ChatPack) {
  return (
    p.version === "chat-example/v1" &&
    p.generator === "parallax/v9" &&
    p.seed === 4421 &&
    p.clock === "2026-10-04T14:30:00Z" &&
    p.projection === "snapshot" &&
    p.operations.version === operations.version &&
    p.operations.generator === operations.generator &&
    p.operations.profile === "records-8" &&
    p.operations.seed === operations.seed &&
    p.operations.clock === operations.clock &&
    p.communications.version === communications.version &&
    p.communications.generator === communications.generator &&
    p.communications.seed === communications.seed &&
    p.communications.clock === communications.clock
  )
}
export function chatPackModel(state: ChatPackState = "recorded", supplied: ChatPack = pack) {
  const compatible = chatPackCompatible(supplied)
  const accessible = compatible && !["loading", "error", "denied", "unknown"].includes(state)
  return {
    pack: supplied,
    state,
    compatible,
    accessible,
    editable: accessible && state !== "locked",
    source: JSON.stringify([
      supplied.version,
      supplied.generator,
      supplied.seed,
      supplied.clock,
      supplied.operations,
      supplied.communications,
      state,
    ]),
    problem: !compatible
      ? "Unsupported chat companion identity; records withheld."
      : accessible
        ? ""
        : `${state}: snapshot records withheld; count Unknown.`,
    sessions: accessible
      ? supplied.sessions.filter((s) => state !== "empty" || s.kind === "authored empty")
      : [],
  }
}
export type ChatPackModel = ReturnType<typeof chatPackModel>
export function chatPackDetail(model: ChatPackModel, id: string) {
  const session = model.sessions.find((s) => s.id === id)
  if (!session) return null
  const chat = communications.chatSessions.find((c) => c.id === session.chatId)
  const run = chat
    ? operations.runs.find((r) => r.id === chat.runId && r.sessionId === chat.sessionId)
    : undefined
  const turns = session.turns.map((t) => {
    const recorded =
      t.kind === "recorded reference"
        ? operations.messages.find(
            (m) => m.id === t.messageId && m.runId === run?.id && m.sessionId === chat?.sessionId,
          )
        : undefined
    return {
      id: t.id,
      order: t.order,
      kind: t.kind,
      role: recorded?.role ?? ("role" in t ? t.role : undefined),
      text: recorded?.content ?? ("text" in t ? t.text : undefined) ?? "Unavailable reference",
      time: recorded?.time ?? null,
      provenance: t.provenance,
    }
  })
  const sources = session.sourceIds.flatMap((id) => {
    const source = model.pack.sources.find((s) => s.id === id)
    if (!source) return []
    const ref = "referenceId" in source ? source.referenceId : undefined
    const attachment = communications.attachments.find((a) => a.id === ref && a.runId === run?.id)
    const tool = operations.toolCalls.find((t) => t.id === ref && t.runId === run?.id)
    const trace = operations.traces.find((t) => t.id === ref && t.runId === run?.id)
    const plan = communications.plans.find((p) => p.id === ref && p.runId === run?.id)
    const queue = communications.queues.find((q) => q.id === ref && q.runId === run?.id)
    return [
      {
        ...source,
        value:
          attachment?.content ??
          tool ??
          trace ??
          plan ??
          queue ??
          ("text" in source ? source.text : undefined) ??
          null,
      },
    ]
  })
  const history = turns.filter((t) => t.role === "user").map((t) => t.text)
  return {
    session,
    cards: communications.cards.filter(
      (card) =>
        card.chatId === chat?.id &&
        session.cards.some((annotation) => annotation.cardId === card.id),
    ),
    chat,
    run,
    turns,
    sources,
    history,
    recordedCount: turns.filter((t) => t.kind === "recorded reference").length,
    authoredCount: turns.filter((t) => t.kind === "authored").length,
    prior:
      model.state === "pending-card"
        ? "handling"
        : model.state === "unknown-card"
          ? "future-resolution"
          : null,
  }
}
