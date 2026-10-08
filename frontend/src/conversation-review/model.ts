import { acceptsInput, type CardOutcome, classifyPriorResponse } from "@hollis-labs/kit-chat"
import fixture from "../fixtures/communications.json" with { type: "json" }
import operations from "../fixtures/operations.json" with { type: "json" }
export const conversationStates = [
  "recorded",
  "empty",
  "loading",
  "streaming",
  "stalled",
  "error",
  "denied",
  "locked",
  "long",
  "history-error",
  "history-loading",
] as const
export type ConversationState = (typeof conversationStates)[number]
export const priorAppearances = [
  "none",
  "partial",
  "handling",
  "submitted",
  "canceled",
  "cancelled",
  "failed",
  "error",
  "open",
  "pending",
  "future-response",
] as const
export type PriorAppearance = (typeof priorAppearances)[number]
export const conversationModes = ["transcript", "cards"] as const
export type ConversationMode = (typeof conversationModes)[number]
export const previewChunks = [
  "Authored manual preview: reading supplied context. ",
  "This partial text is outside committed messages. ",
  "End of finite preview; no reply was sent or recorded.",
] as const
export function conversationReviewModel(
  state: ConversationState = "recorded",
  context = "populated",
  sessionId = "CHAT-001",
  priorAppearance: PriorAppearance = "none",
  cardKind: "confirmation" | "prompt" = "confirmation",
  copy = false,
) {
  const session = fixture.chatSessions.find((s) => s.id === sessionId) ?? fixture.chatSessions[0]
  const messages = operations.messages
    .filter((m) => m.sessionId === session.sessionId)
    .sort((a, b) => a.time.localeCompare(b.time))
  const cards = fixture.cards.filter((c) => c.chatId === session.id)
  const card = cards.find((c) => c.kind === `parallax.${cardKind}/v1`)
  const denied = state === "denied" || context === "permission-denied"
  const accessible = !denied
  const prior = priorAppearance === "none" ? null : priorAppearance
  const classification = classifyPriorResponse(prior)
  const editable = accessible && !["locked", "loading", "history-loading"].includes(state)
  const busy = state === "streaming" || state === "stalled"
  return {
    fixture,
    operations,
    session,
    messages,
    cards,
    card,
    cardKind,
    prior,
    classification,
    editable,
    accessible,
    busy,
    state,
    source: `conversation-review/v1/${fixture.version}/${operations.version}/${fixture.clock}/${context}/${session.id}/${copy ? "reviewed-copy" : "original"}`,
  }
}
export type ConversationReviewModel = ReturnType<typeof conversationReviewModel>
export type ConversationIntent = {
  kind: "composer" | "confirmation" | "prompt"
  sessionId: string
  cardId: string | null
  prior: string | null
  value: string | CardOutcome
}
export function conversationCandidate(
  data: ConversationReviewModel,
  kind: ConversationIntent["kind"],
  payload: unknown,
  draft: string,
  prompt: string,
  previewStopped = false,
): ConversationIntent | null {
  if (!data.editable) return null
  if (kind === "composer") {
    if ((data.busy && !previewStopped) || !draft.trim() || payload !== draft.trim()) return null
    return { kind, sessionId: data.session.id, cardId: null, prior: null, value: draft.trim() }
  }
  if (
    !data.card ||
    data.cardKind !== kind ||
    !acceptsInput(data.classification) ||
    !payload ||
    typeof payload !== "object"
  )
    return null
  const outcome = payload as CardOutcome
  let expected: CardOutcome
  if (outcome.status === "canceled") expected = { status: "canceled" }
  else if (outcome.status === "submitted" && kind === "prompt" && prompt.trim())
    expected = {
      status: "submitted",
      answers: [{ questionId: data.card.id, value: prompt.trim() }],
    }
  else if (outcome.status === "submitted" && kind === "confirmation") {
    const action = outcome.decisions?.[0]?.action
    if (action !== "inspect-handoff" && action !== "inspect-refusal") return null
    expected = { status: "submitted", decisions: [{ itemId: action, action }] }
  } else return null
  if (JSON.stringify(outcome) !== JSON.stringify(expected)) return null
  return {
    kind,
    sessionId: data.session.id,
    cardId: data.card.id,
    prior: data.prior,
    value: expected,
  }
}
