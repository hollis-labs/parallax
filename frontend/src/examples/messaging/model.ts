import { communicationsModel } from "../../communications/model"
export const messagingAppearances = [
  "recorded",
  "empty",
  "loading",
  "error",
  "denied",
  "locked",
  "long",
  "degraded",
  "failed",
  "unknown-delivery",
  "unknown",
] as const
export type MessagingAppearance = (typeof messagingAppearances)[number]
export type MessagingState = {
  screen: "contacts" | "inbox"
  contact: string
  conversation: string
  channel: "all" | "email" | "SMS" | "Tether"
  query: string
  appearance: MessagingAppearance
  theme: "p4-white" | "p1-green-phosphor" | "p3-amber-phosphor" | "hi-contrast"
  mode: "light" | "dark"
}
export const defaultMessagingState: MessagingState = {
  screen: "inbox",
  contact: "",
  conversation: "",
  channel: "all",
  query: "",
  appearance: "recorded",
  theme: "p4-white",
  mode: "light",
}
export function messagingModel(state: MessagingState) {
  const scenario =
    state.appearance === "denied"
      ? "permission-denied"
      : state.appearance === "long"
        ? "long-labels"
        : ["empty", "loading", "error", "degraded"].includes(state.appearance)
          ? state.appearance
          : "populated"
  const model = communicationsModel(scenario),
    accessible = model.accessible && state.appearance !== "unknown"
  const contacts = accessible ? model.contacts : [],
    contact = contacts.find((c) => c.id === state.contact)
  const conversations = accessible
    ? model.conversations
        .filter(
          (c) =>
            (!state.contact || c.contactId === contact?.id) &&
            (state.channel === "all" || c.channel === state.channel) &&
            `${c.subject} ${c.id} ${contacts.find((contact) => contact.id === c.contactId)?.name ?? ""}`
              .toLowerCase()
              .includes(state.query.toLowerCase()),
        )
        .sort((a, b) => {
          const latest = (id: string) =>
            model.dataset.messages
              .filter((m) => m.conversationId === id)
              .map((m) => m.time)
              .sort()
              .at(-1) ?? ""
          return latest(b.id).localeCompare(latest(a.id)) || a.id.localeCompare(b.id)
        })
    : []
  const conversation = conversations.find((c) => c.id === state.conversation)
  const messages = conversation
    ? model.dataset.messages.filter(
        (m) => m.conversationId === conversation.id && m.contactId === conversation.contactId,
      )
    : []
  const sources = conversation
    ? model.dataset.attachments.filter((a) => a.runId === conversation.runId)
    : []
  const relatedChat = conversation
    ? model.chatSessions.find(
        (s) => s.runId === conversation.runId && s.contactId === conversation.contactId,
      )
    : undefined
  return {
    model,
    accessible,
    editable: accessible && state.appearance !== "locked",
    contacts,
    contact,
    conversations,
    conversation,
    messages,
    sources,
    relatedChat,
    source: JSON.stringify([
      model.dataset.version,
      model.dataset.generator,
      model.dataset.seed,
      model.dataset.clock,
      state,
    ]),
    clock: model.dataset.clock,
  }
}
export function admittedAttachment(
  data: ReturnType<typeof messagingModel>,
  messageId: string,
  id: string,
) {
  if (!data.accessible || !data.conversation) return null
  const message = data.messages.find(
    (m) =>
      m.id === messageId &&
      m.conversationId === data.conversation?.id &&
      m.contactId === data.conversation.contactId,
  )
  if (!message?.attachmentIds.includes(id)) return null
  return data.sources.find((a) => a.id === id && a.runId === data.conversation?.runId) ?? null
}
export function normalizeMessagingState(params: URLSearchParams): MessagingState {
  const raw = {
    ...defaultMessagingState,
    screen: params.get("screen") === "contacts" ? "contacts" : "inbox",
    contact: params.get("contact") ?? "",
    conversation: params.get("conversation") ?? "",
    channel: params.get("channel") ?? "all",
    query: params.get("query") ?? "",
    appearance: params.get("appearance") ?? "recorded",
    theme: params.get("theme") ?? "p4-white",
    mode: params.get("mode") === "dark" ? "dark" : "light",
  } as MessagingState
  if (!messagingAppearances.includes(raw.appearance)) raw.appearance = "recorded"
  if (!["all", "email", "SMS", "Tether"].includes(raw.channel)) raw.channel = "all"
  if (!["p4-white", "p1-green-phosphor", "p3-amber-phosphor", "hi-contrast"].includes(raw.theme))
    raw.theme = "p4-white"
  let data = messagingModel(raw)
  if (
    !data.contacts.some(
      (c) =>
        c.id === raw.contact &&
        (raw.screen !== "contacts" ||
          `${c.name} ${c.role} ${c.id}`.toLowerCase().includes(raw.query.toLowerCase())),
    )
  )
    raw.contact = ""
  data = messagingModel(raw)
  if (!data.conversations.some((c) => c.id === raw.conversation)) raw.conversation = ""
  return raw
}
export function messagingHref(state: MessagingState) {
  return `/?${new URLSearchParams({ example: "messaging", ...state })}`
}
