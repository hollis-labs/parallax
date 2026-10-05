import { Button, DetailDialog, EmptyState } from "@hollis-labs/design-components"
import { Attachment, AttachmentInfo, Attachments, ChatInput } from "@hollis-labs/kit-chat"
import { StatusBadge } from "@hollis-labs/kit-dashboard"
import { Panel } from "@hollis-labs/kit-dashboard/widgets"
import { Mail, MessageSquare, Users } from "lucide-react"
import { useState } from "react"
import { type AttachmentRecord, type CommunicationsModel, conversationDetail } from "./model"
export type Intent = (action: string, id: string) => void
export function FixtureAttachments({
  records,
  onInspect,
}: {
  records: AttachmentRecord[]
  onInspect: (id: string) => void
}) {
  return (
    <Attachments variant="list">
      {records.map((a) => (
        <Attachment
          key={a.id}
          data={{ type: "source-document", id: a.id, title: a.name, mediaType: a.mediaType }}
        >
          <AttachmentInfo showMediaType />
          <Button size="sm" variant="ghost" onClick={() => onInspect(a.id)}>
            Inspect {a.name}
          </Button>
        </Attachment>
      ))}
    </Attachments>
  )
}
export function AttachmentInspector({
  record,
  onClose,
}: {
  record: AttachmentRecord | undefined
  onClose: () => void
}) {
  return (
    <DetailDialog
      open={!!record}
      onClose={onClose}
      title="Bundled attachment"
      meta={record ? `${record.id} / ${record.runId}` : ""}
    >
      <div className="example-body">
        <h3>{record?.name}</h3>
        <p className="muted">Read-only fixture content; no download or remote source.</p>
        <pre className="fixture-text">{record?.content}</pre>
      </div>
    </DetailDialog>
  )
}
export function ContactsView({
  model,
  selected,
  onSelect,
  onConversation,
}: {
  model: CommunicationsModel
  selected: string | null
  onSelect: (id: string) => void
  onConversation: (id: string) => void
}) {
  const [query, setQuery] = useState(""),
    contact = model.contacts.find((c) => c.id === selected),
    contacts = model.contacts.filter((c) =>
      (c.name + c.role + c.id).toLowerCase().includes(query.toLowerCase()),
    )
  return (
    <div className="communication-grid">
      <Panel
        title="Contact directory"
        icon={<Users className="size-4" />}
        meta={`${contacts.length} fictional contacts`}
      >
        <div className="example-body">
          <label>
            Find a contact
            <input
              aria-label="Find contacts"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, role or ID…"
            />
          </label>
          {contacts.length ? (
            contacts.map((c) => (
              <button
                type="button"
                key={c.id}
                className="contact-row"
                aria-pressed={selected === c.id}
                onClick={() => onSelect(c.id)}
              >
                <span className="contact-initials">
                  {c.name
                    .split(" ")
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")}
                </span>
                <span>
                  <strong>{c.name}</strong>
                  <span className="muted">
                    {c.role} · {c.id}
                  </span>
                </span>
              </button>
            ))
          ) : (
            <EmptyState
              variant="empty"
              title="No contacts in this view"
              description="Try another filter or fixture scenario."
            />
          )}
        </div>
      </Panel>
      <Panel title="Contact detail" icon={<Users className="size-4" />}>
        <div className="example-body">
          {contact ? (
            <>
              <h2>{contact.name}</h2>
              <p className="muted">
                {contact.id} · {contact.role}
              </p>
              <dl>
                <dt>Email</dt>
                <dd>{contact.email ?? "Not provided"}</dd>
                <dt>Phone</dt>
                <dd>{contact.phone}</dd>
              </dl>
              <p>{contact.notes}</p>
              <h3>Related conversations</h3>
              {model.conversations
                .filter((c) => c.contactId === contact.id)
                .map((c) => (
                  <Button key={c.id} variant="outline" onClick={() => onConversation(c.id)}>
                    Open {c.channel} conversation · {c.id}
                  </Button>
                ))}
            </>
          ) : (
            <EmptyState
              variant="empty"
              title="Select a contact"
              description="Related conversations use the same fixture contact identity."
            />
          )}
        </div>
      </Panel>
    </div>
  )
}
function ConversationBody({
  model,
  id,
  delivery,
  onIntent,
}: {
  model: CommunicationsModel
  id: string
  delivery: string
  onIntent: Intent
}) {
  const detail = conversationDetail(model, id),
    [draft, setDraft] = useState(""),
    [attachmentId, setAttachmentId] = useState<string | null>(null)
  if (!detail) return null
  const { conversation, contact, messages, attachments } = detail,
    denied = delivery === "denied"
  return (
    <>
      <div className="example-body">
        <p className="eyebrow">
          {conversation.channel} · {conversation.id} · {conversation.runId}
        </p>
        <h2>{conversation.subject}</h2>
        <p className="muted">
          Conversation with {contact?.name ?? "Contact unavailable"} · {contact?.id}
        </p>
        {messages.map((m) => (
          <article className="correspondence" key={m.id}>
            <header>
              <strong>{m.direction === "inbound" ? contact?.name : "You · fixture author"}</strong>
              <span className="muted">
                {m.time.replace("T", " ").slice(0, 19)} UTC · {m.id}
              </span>
            </header>
            <p>{model.scenario === "long-labels" ? `${m.body}\n\n${m.body.repeat(5)}` : m.body}</p>
            <StatusBadge
              status={m.direction === "outbound" && delivery === "failed" ? "failed" : m.delivery}
            />
            {m.direction === "outbound" && (m.delivery === "failed" || delivery === "failed") && (
              <p className="delivery-note">
                Scripted delivery failure: no message transport was contacted.
              </p>
            )}
            <FixtureAttachments
              records={attachments.filter((a) => m.attachmentIds.includes(a.id))}
              onInspect={setAttachmentId}
            />
          </article>
        ))}
        {denied && (
          <p role="status" className="notice">
            Sending denied by fixture policy. This is presentation permission, not authentication.
          </p>
        )}
        <ChatInput
          aria-label="Conversation draft"
          value={draft}
          onValueChange={setDraft}
          onSubmit={(value) =>
            onIntent(`Send ${conversation.channel} draft (${value})`, conversation.id)
          }
          showSubmitButton={false}
          disabled={denied}
          placeholder="Draft a local reply…"
        />
        <Button
          disabled={denied || !draft.trim()}
          onClick={() =>
            onIntent(
              `Send ${conversation.channel} draft (${draft})${delivery === "failed" ? " · scripted failure" : ""}`,
              conversation.id,
            )
          }
        >
          Inspect send intent
        </Button>
        <p className="muted">
          Draft stays in memory; inspection does not append a message or change delivery.
        </p>
      </div>
      <AttachmentInspector
        record={model.dataset.attachments.find((a) => a.id === attachmentId)}
        onClose={() => setAttachmentId(null)}
      />
    </>
  )
}
export function MessagesView({
  initialDelivery = "normal",
  model,
  contactId,
  selected,
  onSelect,
  onClearContact,
  onIntent,
  onReset,
}: {
  initialDelivery?: string
  model: CommunicationsModel
  contactId: string | null
  selected: string | null
  onSelect: (id: string) => void
  onClearContact: () => void
  onIntent: Intent
  onReset: () => void
}) {
  const [channel, setChannel] = useState("all"),
    [query, setQuery] = useState(""),
    [delivery, setDelivery] = useState(initialDelivery)
  const conversations = model.conversations.filter(
      (c) =>
        (!contactId || c.contactId === contactId) &&
        (channel === "all" || c.channel === channel) &&
        (c.subject + c.id).toLowerCase().includes(query.toLowerCase()),
    ),
    visible = conversations.find((c) => c.id === selected)
  return (
    <div className="communication-grid">
      <Panel
        title="Conversation inbox"
        icon={<Mail className="size-4" />}
        meta={`${conversations.length} linked conversations`}
      >
        <div className="example-body">
          <label>
            Channel
            <select
              aria-label="Message channel"
              value={channel}
              onChange={(e) => {
                setChannel(e.target.value)
                onReset()
              }}
            >
              {["all", "email", "SMS", "Tether"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label>
            Search
            <input
              aria-label="Filter conversations"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                onReset()
              }}
            />
          </label>
          {contactId && (
            <Button variant="ghost" onClick={onClearContact}>
              Show all conversations
            </Button>
          )}
          {conversations.length ? (
            conversations.map((c) => (
              <button
                type="button"
                className="task-card"
                key={c.id}
                aria-pressed={c.id === selected}
                onClick={() => {
                  onReset()
                  onSelect(c.id)
                }}
              >
                <strong>{c.subject}</strong>
                <span className="muted">
                  {c.channel} · {c.id} · {c.contactId}
                </span>
              </button>
            ))
          ) : (
            <EmptyState
              variant="empty"
              title="No conversations in this inbox"
              description="No missing resource is reported as delivered."
            />
          )}
        </div>
      </Panel>
      <Panel title="Message review" icon={<MessageSquare className="size-4" />}>
        <div className="example-body">
          <label>
            Delivery scenario
            <select
              aria-label="Delivery scenario"
              value={delivery}
              onChange={(e) => {
                setDelivery(e.target.value)
                onReset()
              }}
            >
              {["normal", "failed", "denied"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
        {visible ? (
          <ConversationBody
            key={`${visible.id}/${delivery}/${channel}`}
            model={model}
            id={visible.id}
            delivery={delivery}
            onIntent={onIntent}
          />
        ) : (
          <div className="example-body">
            <EmptyState
              variant="empty"
              title="Select a conversation"
              description="Selection clears from the displayed detail when a channel/filter excludes it."
            />
          </div>
        )}
      </Panel>
    </div>
  )
}
