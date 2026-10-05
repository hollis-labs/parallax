import { Button, EmptyState } from "@hollis-labs/design-components"
import { useState } from "react"
import { ChatView } from "./Chat"
import { ContactsView, type Intent, MessagesView } from "./Messaging"
import { type ChatState, communicationsModel } from "./model"
export function CommunicationLab({
  view,
  scenario,
  onViewChange,
  onIntent,
  onReset,
  initialChatState = "normal",
  initialDelivery = "normal",
  initialChatId = "CHAT-001",
}: {
  view: string
  scenario: string
  onViewChange: (view: string) => void
  onIntent: Intent
  onReset: () => void
  initialDelivery?: string
  initialChatId?: string
  initialChatState?: ChatState
}) {
  const model = communicationsModel(scenario),
    [contactId, setContactId] = useState<string | null>(null),
    [conversationId, setConversationId] = useState<string | null>(
      model.conversations[0]?.id ?? null,
    ),
    [chatId, setChatId] = useState<string | null>(
      model.chatSessions.find((s) => s.id === initialChatId)?.id ??
        model.chatSessions[0]?.id ??
        null,
    )
  const selectContact = (id: string) => {
    onReset()
    setContactId(id)
    setConversationId(model.conversations.find((c) => c.contactId === id)?.id ?? null)
    setChatId(model.chatSessions.find((s) => s.contactId === id)?.id ?? null)
  }
  return (
    <>
      <div className="communication-heading">
        <p className="muted">
          {model.dataset.version} · {model.dataset.generator} · fixed clock {model.dataset.clock} ·
          fictitious presentation identities
        </p>
        {view !== "Contacts" && (
          <Button size="sm" variant="ghost" onClick={() => onViewChange("Contacts")}>
            Review related contacts
          </Button>
        )}
      </div>
      {!model.accessible ? (
        <EmptyState
          variant="empty"
          title="Communication resource unavailable"
          description="Fixture access state; no transport or authentication is connected."
        />
      ) : view === "Contacts" ? (
        <ContactsView
          model={model}
          selected={contactId}
          onSelect={selectContact}
          onConversation={(id) => {
            onReset()
            setConversationId(id)
            onViewChange("Messages")
          }}
        />
      ) : view === "Messages" ? (
        <MessagesView
          initialDelivery={initialDelivery}
          model={model}
          contactId={contactId}
          selected={conversationId}
          onSelect={setConversationId}
          onClearContact={() => {
            onReset()
            setContactId(null)
          }}
          onIntent={onIntent}
          onReset={onReset}
        />
      ) : (
        <ChatView
          model={model}
          selected={chatId}
          onSelect={setChatId}
          onIntent={onIntent}
          onReset={onReset}
          initialState={initialChatState}
        />
      )}
    </>
  )
}
