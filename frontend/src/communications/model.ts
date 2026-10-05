import fixture from "../fixtures/communications.json" with { type: "json" }
import operations from "../fixtures/operations.json" with { type: "json" }
import { normalizeScenario, operationsModel } from "../operations/model"
export type Contact = (typeof fixture.contacts)[number]
export type Conversation = (typeof fixture.conversations)[number]
export type AttachmentRecord = (typeof fixture.attachments)[number]
export type ChatSession = (typeof fixture.chatSessions)[number]
export function communicationsModel(name: string) {
  const state = operationsModel(name),
    scenario = normalizeScenario(name)
  const contacts =
    state.accessible && scenario !== "empty"
      ? fixture.contacts.map((c) => ({
          ...c,
          name:
            scenario === "long-labels"
              ? `${c.name} — Regional operations and evidence review coordinator`
              : c.name,
          email: scenario === "missing-metadata" ? null : c.email,
        }))
      : []
  const contactIds = new Set(contacts.map((c) => c.id)),
    conversations = fixture.conversations.filter((c) => contactIds.has(c.contactId)),
    chatSessions = fixture.chatSessions.filter((s) => contactIds.has(s.contactId))
  return {
    scenario,
    resource: state.resource,
    accessible: state.accessible,
    dataset: fixture,
    operations,
    contacts,
    conversations,
    chatSessions,
  }
}
export type CommunicationsModel = ReturnType<typeof communicationsModel>
export function conversationDetail(model: CommunicationsModel, id: string | null) {
  const conversation = model.conversations.find((c) => c.id === id)
  if (!conversation) return null
  return {
    conversation,
    contact: model.contacts.find((c) => c.id === conversation.contactId),
    messages: model.dataset.messages.filter((m) => m.conversationId === id),
    attachments: model.dataset.attachments.filter((a) => a.runId === conversation.runId),
  }
}
export function chatDetail(model: CommunicationsModel, id: string | null) {
  const session = model.chatSessions.find((s) => s.id === id)
  if (!session) return null
  return {
    session,
    contact: model.contacts.find((c) => c.id === session.contactId),
    cards: model.dataset.cards.filter((c) => c.chatId === session.id),
    run: model.operations.runs.find((r) => r.id === session.runId),
    messages: model.operations.messages.filter((m) => m.sessionId === session.sessionId),
    tools: model.operations.toolCalls.filter((t) => t.runId === session.runId),
    plan: model.dataset.plans.find((p) => p.id === session.planId),
    queue: model.dataset.queues.find((q) => q.id === session.queueId),
    attachment: model.dataset.attachments.find((a) => a.id === session.attachmentId),
  }
}
export type ChatDetail = NonNullable<ReturnType<typeof chatDetail>>
export const chatStates = [
  "normal",
  "streaming",
  "pending",
  "refused",
  "error",
  "unknown-wire",
  "unknown-response",
] as const
export type ChatState = (typeof chatStates)[number]
export function priorFor(state: ChatState) {
  return state === "pending"
    ? "handling"
    : state === "refused"
      ? "canceled"
      : state === "error"
        ? "failed"
        : state === "unknown-response"
          ? "future-resolution"
          : null
}
