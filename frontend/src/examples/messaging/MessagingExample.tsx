import {
  AppShell,
  Button,
  DetailDialog,
  JsonViewer,
  OverlaySidebar,
} from "@hollis-labs/design-components"
import { ChatInput } from "@hollis-labs/kit-chat"
import { StatusBadge } from "@hollis-labs/kit-dashboard"
import { useLayoutEffect, useRef, useState } from "react"
import { createAdminPresentationSession } from "../../chimera/admin-session"
import { FixtureAttachments } from "../../communications/Messaging"
import {
  admittedAttachment,
  defaultMessagingState,
  type MessagingState,
  messagingAppearances,
  messagingHref,
  messagingModel,
  normalizeMessagingState,
} from "./model"
import "./messaging.css"
export function MessagingExample({
  state: provided = defaultMessagingState,
  onChange,
}: {
  state?: MessagingState
  onChange?: (state: MessagingState) => void
}) {
  const [local, setLocal] = useState(provided),
    [revision, setRevision] = useState(0),
    [queued, setQueued] = useState(0)
  const state = onChange ? provided : local,
    data = messagingModel(state),
    identity = JSON.stringify([data.source, revision])
  const [draft, setDraft] = useState(""),
    [navOpen, setNavOpen] = useState(false),
    [reviewOpen, setReviewOpen] = useState(false),
    [inspection, setInspection] = useState<{
      title: string
      value: unknown
      outcome: string
    } | null>(null),
    [lease, setLease] = useState(0)
  const life = useRef({ alive: false, lease: 0 }),
    rendered = useRef(identity),
    session = useRef<ReturnType<typeof createAdminPresentationSession> | null>(null),
    queue = useRef<(() => void)[]>([]),
    heading = useRef<HTMLHeadingElement | null>(null),
    origin = useRef<HTMLElement | null>(null),
    raf = useRef<number | null>(null),
    navigation = useRef(false)
  rendered.current = identity
  const token = lease
  useLayoutEffect(() => {
    heading.current?.focus()
  }, [])
  useLayoutEffect(() => {
    const owned = createAdminPresentationSession(identity, identity, ["inspect"])
    session.current = owned
    life.current.alive = true
    life.current.lease++
    setLease(life.current.lease)
    setDraft("")
    setInspection(null)
    setNavOpen(false)
    setReviewOpen(false)
    if (navigation.current || document.activeElement === document.body) {
      navigation.current = false
      heading.current?.focus()
    }
    return () => {
      life.current.alive = false
      life.current.lease++
      owned.dispose()
      if (raf.current !== null) cancelAnimationFrame(raf.current)
    }
  }, [identity])
  const admitted = () =>
    life.current.alive && life.current.lease === token && rendered.current === identity
  function transition(fn: () => void) {
    if (!admitted()) return
    if (raf.current !== null) cancelAnimationFrame(raf.current)
    session.current?.reset(identity, `${identity}:${++life.current.lease}`)
    setLease(life.current.lease)
    setInspection(null)
    fn()
  }
  function change(patch: Partial<MessagingState>, focus = false) {
    if (!admitted()) return
    const next = normalizeMessagingState(new URLSearchParams({ ...state, ...patch }))
    navigation.current = focus
    if (onChange) onChange(next)
    else setLocal(next)
  }
  function inspect(title: string, value: unknown, valid: () => boolean) {
    if (!admitted() || !valid() || !session.current) return
    origin.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    transition(() =>
      setInspection({
        title,
        value,
        outcome: "Held local inspection; no send, save or delivery change.",
      }),
    )
    const stamp = life.current.lease,
      ticket = session.current.begin("inspect")
    queue.current.push(() => {
      if (
        !life.current.alive ||
        life.current.lease !== stamp ||
        rendered.current !== identity ||
        !valid()
      )
        return
      ticket.commit(() =>
        setInspection({
          title,
          value,
          outcome: "Local candidate inspected. Supplied messages and delivery unchanged.",
        }),
      )
    })
    setQueued(queue.current.length)
  }
  function release() {
    if (!admitted()) return
    queue.current.shift()?.()
    setQueued(queue.current.length)
  }
  function close() {
    if (!admitted() || !inspection) return
    const target = origin.current
    transition(() => setInspection(null))
    const stamp = life.current.lease
    raf.current = requestAnimationFrame(() => {
      if (!life.current.alive || life.current.lease !== stamp || rendered.current !== identity)
        return
      if (
        target?.isConnected &&
        target.getClientRects().length &&
        getComputedStyle(target).visibility !== "hidden"
      )
        target.focus()
      else heading.current?.focus()
    })
  }
  function attachment(messageId: string, id: string) {
    const record = admittedAttachment(data, messageId, id)
    if (!record) return
    inspect(
      `Attachment ${id}`,
      { messageId, conversation: data.conversation?.id, ...record },
      () => !!admittedAttachment(data, messageId, id),
    )
  }
  function submit(value: string) {
    inspect(
      "Message draft candidate",
      { conversation: data.conversation?.id, channel: data.conversation?.channel, text: value },
      () => data.editable && !!data.conversation && !!draft.trim() && value === draft.trim(),
    )
  }
  const contacts = data.contacts.filter((c) =>
    `${c.name} ${c.role} ${c.id}`.toLowerCase().includes(state.query.toLowerCase()),
  )
  const title = state.screen === "contacts" ? "Contacts" : (data.conversation?.subject ?? "Inbox")
  const nav = (
    <nav className="messaging-navigation" aria-label="Messaging application navigation">
      <strong>Messages</strong>
      {(["inbox", "contacts"] as const).map((screen) => (
        <a
          key={screen}
          href={messagingHref({ ...state, screen, query: "", contact: "", conversation: "" })}
          aria-current={state.screen === screen ? "page" : undefined}
          onClick={(e) => {
            e.preventDefault()
            change({ screen, query: "", contact: "", conversation: "" }, true)
          }}
        >
          {screen === "inbox" ? "Inbox" : "Contacts"}
        </a>
      ))}
      <a href="/?view=Review+Workbench">Back to review lab</a>
      <p>Fictional contacts · Snapshot review</p>
    </nav>
  )
  const controls = (
    <section className="messaging-review-controls" aria-label="Messaging review controls">
      <h2>Fixture review</h2>
      <p>
        {data.model.dataset.version} · {data.clock}. Independent snapshot; no operations cutoff.
      </p>
      <label>
        Appearance
        <select
          aria-label="Messaging appearance"
          value={state.appearance}
          onChange={(e) =>
            change({ appearance: e.target.value as MessagingState["appearance"] }, true)
          }
        >
          {messagingAppearances.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label>
        Theme
        <select
          aria-label="Messaging theme"
          value={state.theme}
          onChange={(e) => change({ theme: e.target.value as MessagingState["theme"] }, true)}
        >
          {["p4-white", "p1-green-phosphor", "p3-amber-phosphor", "hi-contrast"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label>
        Mode
        <select
          aria-label="Messaging mode"
          value={state.mode}
          onChange={(e) => change({ mode: e.target.value as MessagingState["mode"] }, true)}
        >
          <option>light</option>
          <option>dark</option>
        </select>
      </label>
      <Button
        onClick={() => {
          if (!admitted()) return
          navigation.current = true
          change({ ...defaultMessagingState, theme: state.theme, mode: state.mode }, true)
          setRevision((n) => n + 1)
        }}
      >
        Reset messaging context
      </Button>
      <Button onClick={release}>Release oldest scripted outcome ({queued})</Button>
    </section>
  )
  const refused = !data.accessible
    ? `${state.appearance}: supplied records withheld; count Unknown.`
    : state.appearance === "empty"
      ? "Known empty snapshot · 0 supplied conversations."
      : "Select a conversation to inspect supplied messages."
  return (
    <AppShell
      className="messaging-example"
      nav={<aside className="messaging-sidebar">{nav}</aside>}
      header={
        <header className="messaging-header">
          <div className="messaging-mobile">
            <OverlaySidebar
              side="left"
              title="Messaging navigation"
              open={navOpen}
              onOpenChange={(v) => {
                if (v !== navOpen) transition(() => setNavOpen(v))
              }}
              trigger={
                <Button variant="outline" size="sm">
                  Menu
                </Button>
              }
            >
              {nav}
            </OverlaySidebar>
          </div>
          <div>
            <h1 tabIndex={-1} ref={heading}>
              {title}
            </h1>
            <small>Snapshot · Review only</small>
          </div>
          <OverlaySidebar
            side="right"
            title="Messaging fixture review"
            open={reviewOpen}
            onOpenChange={(v) => {
              if (v !== reviewOpen) transition(() => setReviewOpen(v))
            }}
            trigger={
              <Button variant="outline" size="sm">
                Review
              </Button>
            }
          >
            {controls}
          </OverlaySidebar>
        </header>
      }
    >
      <main className="messaging-main">
        {state.screen === "contacts" ? (
          <section className="messaging-page" aria-label="Contact directory page">
            <div className="messaging-contact-grid">
              <section className="messaging-contact-list" aria-label="Contact directory">
                <h2>Contact directory</h2>
                <label>
                  Find contacts
                  <input
                    aria-label="Find messaging contacts"
                    value={state.query}
                    onChange={(e) => change({ query: e.target.value })}
                  />
                </label>
                <p>
                  {data.accessible
                    ? `${contacts.length} matching / ${data.contacts.length} supplied contacts`
                    : "Contact count Unknown"}
                </p>
                {contacts.map((c) => (
                  <button
                    className="messaging-row"
                    type="button"
                    key={c.id}
                    aria-current={state.contact === c.id}
                    onClick={() => change({ contact: c.id }, true)}
                  >
                    <strong>{c.name}</strong>
                    <small>
                      {c.role} · {c.id}
                    </small>
                  </button>
                ))}
              </section>
              <section className="messaging-contact-detail" aria-label="Selected contact">
                {data.contact ? (
                  <>
                    <h2>{data.contact.name}</h2>
                    <p>
                      {data.contact.id} · {data.contact.role}
                    </p>
                    <dl>
                      <dt>Email metadata</dt>
                      <dd>{data.contact.email ?? "Unknown"}</dd>
                      <dt>Phone metadata</dt>
                      <dd>{data.contact.phone ?? "Unknown"}</dd>
                    </dl>
                    <p>{data.contact.notes}</p>
                    <h3>Related conversations</h3>
                    {data.model.conversations
                      .filter((c) => c.contactId === data.contact?.id)
                      .map((c) => (
                        <Button
                          key={c.id}
                          onClick={() =>
                            change(
                              {
                                screen: "inbox",
                                conversation: c.id,
                                contact: c.contactId,
                                channel: c.channel as MessagingState["channel"],
                                query: "",
                              },
                              true,
                            )
                          }
                        >
                          Open {c.channel} conversation · {c.id}
                        </Button>
                      ))}
                  </>
                ) : (
                  <p>
                    {data.accessible
                      ? "Select a fictional contact; this is directory metadata, not identity assurance."
                      : refused}
                  </p>
                )}
              </section>
            </div>
          </section>
        ) : (
          <section
            className="messaging-inbox"
            data-selected={!!data.conversation}
            aria-label="Messaging inbox"
          >
            <section className="messaging-inbox-list" aria-label="Conversation inbox list">
              <label>
                Channel
                <select
                  aria-label="Messaging channel"
                  value={state.channel}
                  onChange={(e) => change({ channel: e.target.value as MessagingState["channel"] })}
                >
                  {["all", "email", "SMS", "Tether"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                Search conversations
                <input
                  aria-label="Search messaging conversations"
                  value={state.query}
                  onChange={(e) => change({ query: e.target.value })}
                />
              </label>
              {state.contact && (
                <Button
                  className="messaging-filter-action"
                  variant="ghost"
                  onClick={() => change({ contact: "", query: "" })}
                >
                  Show all contacts
                </Button>
              )}
              <p>
                {data.accessible
                  ? `${data.conversations.length} matching conversations`
                  : "Conversation count Unknown"}
              </p>
              {data.conversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="messaging-row"
                  aria-current={state.conversation === c.id}
                  onClick={() => change({ conversation: c.id }, true)}
                >
                  <strong>{c.subject}</strong>
                  <small>
                    {c.channel} · {c.id}
                  </small>
                  <small>
                    {data.contacts.find((contact) => contact.id === c.contactId)?.name} · latest
                    supplied message{" "}
                    {data.model.dataset.messages
                      .filter((m) => m.conversationId === c.id)
                      .map((m) => m.time)
                      .sort()
                      .at(-1) ?? "Unknown"}
                  </small>
                </button>
              ))}
              {!data.conversations.length && (
                <p>{data.accessible ? "Known no matches · 0 displayed conversations." : refused}</p>
              )}
            </section>
            <section className="messaging-detail" aria-label="Current message conversation">
              {data.conversation ? (
                <>
                  <header className="messaging-detail-heading">
                    <div className="messaging-mobile">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => change({ conversation: "" }, true)}
                      >
                        Back to conversations
                      </Button>
                    </div>
                    <h2>{data.conversation.subject}</h2>
                    <p className="messaging-meta">
                      {data.conversation.id} · {data.conversation.runId} ·{" "}
                      {data.conversation.contactId} · {data.conversation.channel}
                    </p>
                    {data.relatedChat && (
                      <a
                        href={`/?${new URLSearchParams({ example: "chat", session: data.relatedChat.id, theme: state.theme, mode: state.mode })}`}
                      >
                        Open related Chat snapshot
                      </a>
                    )}
                    {state.appearance === "degraded" && (
                      <p>
                        Retained degraded review appearance; original snapshot content unchanged.
                      </p>
                    )}
                  </header>
                  <section
                    className="messaging-transcript"
                    aria-label="Supplied conversation messages"
                    // biome-ignore lint/a11y/noNoninteractiveTabindex: Native keyboard scrolling of the bounded supplied transcript.
                    tabIndex={0}
                  >
                    {data.messages.map((m) => (
                      <article key={m.id} data-message-id={m.id}>
                        <header>
                          <strong>
                            {m.direction === "inbound"
                              ? data.contacts.find((c) => c.id === m.contactId)?.name
                              : "You · fixture author"}
                          </strong>
                          <span className="messaging-meta">
                            {m.id} · {m.time} · supplied {m.delivery}
                          </span>
                        </header>
                        {state.appearance === "long" && (
                          <p className="messaging-meta">
                            Authored long-text rendering sample; original message unchanged.
                          </p>
                        )}
                        <p>
                          {state.appearance === "long"
                            ? `${m.body}\n\n${m.body.repeat(12)}`
                            : m.body}
                        </p>
                        {state.appearance === "unknown-delivery" && m.direction === "outbound" ? (
                          <p>
                            Authored unsupported delivery: future-delivery · actual {m.delivery}
                          </p>
                        ) : (
                          <StatusBadge
                            status={
                              state.appearance === "failed" && m.direction === "outbound"
                                ? "failed"
                                : m.delivery
                            }
                          />
                        )}{" "}
                        {state.appearance === "failed" && m.direction === "outbound" && (
                          <p>
                            Authored failed appearance; no delivery attempted. Supplied status
                            remains {m.delivery}.
                          </p>
                        )}
                        <div className="messaging-attachment-actions">
                          <FixtureAttachments
                            records={data.sources.filter((a) => m.attachmentIds.includes(a.id))}
                            onInspect={(id) => attachment(m.id, id)}
                          />
                        </div>
                      </article>
                    ))}
                  </section>
                  <div className="messaging-draft">
                    <p>Local draft only · inspection never appends or sends.</p>
                    <ChatInput
                      aria-label="Local messaging draft"
                      value={draft}
                      onValueChange={(v) => {
                        if (data.editable && data.conversation) transition(() => setDraft(v))
                      }}
                      onSubmit={submit}
                      disabled={!data.editable}
                      showSubmitButton={false}
                      placeholder="Draft a local reply…"
                    />
                    <Button
                      disabled={!data.editable || !draft.trim()}
                      onClick={() => submit(draft.trim())}
                    >
                      Inspect draft candidate
                    </Button>
                  </div>
                </>
              ) : (
                <div className="messaging-page">
                  <p>{refused}</p>
                </div>
              )}
            </section>
          </section>
        )}
      </main>
      <footer className="messaging-example-footer">
        Immutable communications snapshot · {data.clock} · No message transport
      </footer>
      {inspection && (
        <DetailDialog
          title={inspection.title}
          meta={`${data.conversation?.id ?? ""} · ${data.clock}`}
          open
          onClose={close}
          footer={<Button onClick={close}>Close inspection</Button>}
        >
          <div className="messaging-inspector">
            <p>Read-only local inspection; no delivery, download or remote source.</p>
            <JsonViewer value={inspection.value} className="evidence-json" />
            <p role="status">{inspection.outcome}</p>
            <Button onClick={release}>Release oldest scripted outcome ({queued})</Button>
          </div>
        </DetailDialog>
      )}
    </AppShell>
  )
}
