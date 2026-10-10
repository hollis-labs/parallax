import {
  AppShell,
  Button,
  DetailDialog,
  JsonViewer,
  OverlaySidebar,
} from "@hollis-labs/design-components"
import {
  acceptsInput,
  type CardOutcome,
  ChatInput,
  type ChatItem,
  ChatStream,
  type ChatStreamStatus,
  ConfirmationCard,
  classifyPriorResponse,
  PromptCard,
} from "@hollis-labs/kit-chat"
import { type ReactNode, useLayoutEffect, useRef, useState } from "react"
import { createAdminPresentationSession } from "../../chimera/admin-session"
import { chatPack, chatPackDetail, chatPackModel, chatPackStates } from "./model"
import { type ChatExampleState, chatExampleHref } from "./routes"
import "./chat.css"
export const defaultChatState: ChatExampleState = {
  session: "CHAT-001",
  query: "",
  appearance: "recorded",
  theme: "p4-white",
  mode: "light",
}
export type ChatChromeContext = {
  state: ChatExampleState
  accessible: boolean
  editable: boolean
  selectedId: string | null
}
/** Optional app-owned chrome; the default conversation and custody remain unchanged. */
export type ChatChrome = {
  navigation?: (context: ChatChromeContext) => ReactNode
  header?: (context: ChatChromeContext) => ReactNode
  className?: string
  layout?: string
}
export function ChatExample({
  state = defaultChatState,
  onChange,
  chrome,
}: {
  state?: ChatExampleState
  onChange?: (state: ChatExampleState) => void
  chrome?: ChatChrome
}) {
  const [local, setLocal] = useState(state),
    [revision, setRevision] = useState(0),
    [queued, setQueued] = useState(0)
  const queue = useRef<(() => void)[]>([])
  const supplied = onChange ? state : local
  const actual =
    supplied.appearance === "empty" ? { ...supplied, session: "CHAT-AUTHORED-EMPTY" } : supplied
  const source = JSON.stringify([{ ...actual, query: undefined }, revision])
  function change(next: ChatExampleState) {
    if (onChange) onChange(next)
    else setLocal(next)
  }
  function enqueue(producer: () => void) {
    queue.current.push(producer)
    setQueued(queue.current.length)
  }
  function release() {
    queue.current.shift()?.()
    setQueued(queue.current.length)
  }
  return (
    <ChatSurface
      key={source}
      chrome={chrome}
      state={actual}
      change={change}
      enqueue={enqueue}
      release={release}
      queued={queued}
      reset={() => {
        change({ ...actual, session: "CHAT-001", query: "", appearance: "recorded" })
        setRevision((n) => n + 1)
      }}
    />
  )
}
function ChatSurface({
  chrome,
  state,
  change,
  enqueue,
  release,
  queued,
  reset,
}: {
  chrome?: ChatChrome
  state: ChatExampleState
  change: (s: ChatExampleState) => void
  enqueue: (p: () => void) => void
  release: () => void
  queued: number
  reset: () => void
}) {
  const data = chatPackModel(state.appearance),
    detail =
      chatPackDetail(data, state.session) ??
      (data.sessions[0] ? chatPackDetail(data, data.sessions[0].id) : null)
  const [draft, setDraft] = useState(""),
    [note, setNote] = useState(""),
    [count, setCount] = useState(
      state.appearance === "long"
        ? (detail?.turns.length ?? 0)
        : (detail?.session.initialCount ?? 0),
    ),
    [step, setStep] = useState(0),
    [stopped, setStopped] = useState(false),
    [cardId, setCardId] = useState(detail?.session.cards[0]?.cardId ?? ""),
    [prior, setPrior] = useState(
      state.appearance === "pending-card"
        ? "handling"
        : state.appearance === "unknown-card"
          ? "future-resolution"
          : "supplied",
    ),
    [navOpen, setNavOpen] = useState(false),
    [evidenceOpen, setEvidenceOpen] = useState(false),
    [reviewOpen, setReviewOpen] = useState(false),
    [inspection, setInspection] = useState<{
      label: string
      value: unknown
      outcome: string
    } | null>(null),
    [lease, setLease] = useState(0)
  const current = useRef({ alive: false, lease: 0 }),
    session = useRef<ReturnType<typeof createAdminPresentationSession> | null>(null),
    origin = useRef<HTMLElement | null>(null),
    focusFrame = useRef<number | null>(null)
  const identity = JSON.stringify(state)
  const renderedIdentity = useRef(identity)
  renderedIdentity.current = identity
  const heading = useRef<HTMLHeadingElement | null>(null)
  useLayoutEffect(() => {
    heading.current?.focus()
  }, [])
  const token = lease
  useLayoutEffect(() => {
    const owned = createAdminPresentationSession(
      data.source,
      JSON.stringify([state.session, state.query]),
      ["inspect"],
    )
    session.current = owned
    setDraft("")
    setNote("")
    setInspection(null)
    current.current.alive = true
    current.current.lease++
    setLease(current.current.lease)
    return () => {
      current.current.alive = false
      current.current.lease++
      owned.dispose()
      if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current)
    }
  }, [data.source, state.session, state.query])
  const admitted = () =>
    current.current.alive &&
    current.current.lease === token &&
    renderedIdentity.current === identity
  function transition(action: () => void) {
    if (!admitted()) return
    if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current)
    session.current?.reset(data.source, `${data.source}:${++current.current.lease}`)
    setLease(current.current.lease)
    setInspection(null)
    action()
  }
  const annotation = detail?.session.cards.find((c) => c.cardId === cardId)
  const selectedCard = detail?.cards.find((card) => card.id === annotation?.cardId)
  const priorStatus =
    prior === "supplied" ? (annotation?.prior ?? null) : prior === "none" ? null : prior
  const busy =
    !stopped &&
    (step > 0 || state.appearance === "stalled-preview") &&
    step < (detail?.session.previewChunks.length ?? 0)
  function candidate(label: string, value: unknown, valid: () => boolean, readOnly = false) {
    if (!admitted() || (!data.editable && !readOnly) || !detail || !valid() || !session.current)
      return
    origin.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    transition(() =>
      setInspection({
        label,
        value,
        outcome: "Held local inspection; no message or card response committed.",
      }),
    )
    const stamp = current.current.lease,
      ticket = session.current.begin("inspect")
    enqueue(() => {
      if (
        !current.current.alive ||
        current.current.lease !== stamp ||
        renderedIdentity.current !== identity ||
        !valid()
      )
        return
      ticket.commit(() =>
        setInspection({
          label,
          value,
          outcome: "Local candidate inspected. Supplied transcript and card prior unchanged.",
        }),
      )
    })
  }
  function close() {
    if (!admitted() || !inspection) return
    const target = origin.current
    transition(() => setInspection(null))
    const stamp = current.current.lease
    focusFrame.current = requestAnimationFrame(() => {
      if (
        current.current.alive &&
        current.current.lease === stamp &&
        renderedIdentity.current === identity
      ) {
        if (
          target?.isConnected &&
          target.getClientRects().length &&
          getComputedStyle(target).visibility !== "hidden"
        )
          target.focus()
        else heading.current?.focus()
      }
    })
  }
  function respond(outcome: CardOutcome) {
    candidate("Card response candidate", { cardId, prior: priorStatus, outcome }, () => {
      if (!annotation || !acceptsInput(classifyPriorResponse(priorStatus))) return false
      if (outcome.status === "canceled") return Object.keys(outcome).length === 1
      if ("decisions" in outcome && !("questionId" in annotation)) {
        const decisions = outcome.decisions
        return (
          decisions?.length === 1 &&
          !outcome.answers &&
          !outcome.data &&
          Object.keys(outcome).every((key) => key === "status" || key === "decisions") &&
          decisions[0].itemId === decisions[0].action &&
          annotation.actionIds.includes(decisions[0].action) &&
          decisions[0].note === undefined
        )
      }
      if ("answers" in outcome && "questionId" in annotation) {
        const answers = outcome.answers
        return (
          answers?.length === 1 &&
          !outcome.decisions &&
          !outcome.data &&
          Object.keys(outcome).every((key) => key === "status" || key === "answers") &&
          answers[0].questionId === annotation.questionId &&
          answers[0].value === note.trim() &&
          !!note.trim() &&
          answers[0].note === undefined &&
          answers[0].acceptedSuggestion === undefined
        )
      }
      return false
    })
  }
  const items: ChatItem[] = detail
    ? detail.turns.slice(Math.max(0, detail.turns.length - count)).map((t) => ({
        id: t.id,
        kind: "message",
        role: t.role === "user" || t.role === "assistant" || t.role === "tool" ? t.role : "system",
        content: <p className="chat-turn-text">{t.text}</p>,
        author: t.role,
        timestamp: (
          <span className="chat-turn-meta">
            {t.time ? `${t.time} · Recorded message` : "Authored history · untimed"}
          </span>
        ),
      }))
    : []
  const status: ChatStreamStatus = busy
    ? {
        status: state.appearance === "stalled-preview" ? "stalled" : "streaming",
        role: "assistant",
        content: (
          <p className="chat-turn-text">
            Authored manual preview · uncommitted:{" "}
            {detail?.session.previewChunks.slice(0, step).join("") || "No preview text yet."}
          </p>
        ),
      }
    : { status: "idle" }
  const matches = data.sessions.filter((s) =>
    `${s.id} ${s.title}`.toLowerCase().includes(state.query.toLowerCase()),
  )
  const chromeContext: ChatChromeContext = {
    state,
    accessible: data.accessible,
    editable: data.editable,
    selectedId: detail?.session.id ?? null,
  }
  const nav = chrome?.navigation?.(chromeContext) ?? (
    <nav className="chat-session-list" aria-label="Chat sessions">
      <strong>Conversations</strong>
      <label>
        Search sessions
        <input
          aria-label="Search chat sessions"
          value={state.query}
          onChange={(e) => {
            if (admitted()) change({ ...state, query: e.target.value })
          }}
        />
      </label>
      {["recorded context with authored history", "authored empty"].map((kind) => (
        <section key={kind}>
          <h2>{kind === "authored empty" ? "Authored specimens" : "Bundled review sessions"}</h2>
          {matches
            .filter((s) => s.kind === kind)
            .map((s) => (
              <a
                key={s.id}
                href={chatExampleHref({ ...state, session: s.id })}
                aria-current={detail?.session.id === s.id ? "page" : undefined}
                onClick={(e) => {
                  e.preventDefault()
                  if (!admitted()) return
                  change({ ...state, session: s.id })
                }}
              >
                {s.title}
                <small>{s.id}</small>
              </a>
            ))}
        </section>
      ))}
      <p>{data.accessible ? `${matches.length} matching sessions` : "Session count Unknown"}</p>
      <a href="/?view=Review+Workbench">Back to review lab</a>
    </nav>
  )
  const evidence = (
    <section className="chat-evidence-content" aria-label="Conversation evidence">
      <h2>Evidence</h2>
      <p>
        Fixed snapshot · {chatPack.clock}. Recorded messages and untimed authored history are
        distinct.
      </p>
      {detail && (
        <>
          <p>
            {detail.recordedCount} recorded messages · {detail.authoredCount} authored history rows
          </p>
          <h3>Sources and tools</h3>
          {detail.sources.map((s) => (
            <Button
              key={s.id}
              variant="outline"
              onClick={() =>
                candidate(
                  `Source ${s.id}`,
                  { kind: s.kind, provenance: s.provenance, value: s.value },
                  () => detail.sources.some((row) => row.id === s.id),
                  true,
                )
              }
            >
              {s.kind} · {s.id}
            </Button>
          ))}
          <h3>Review card</h3>
          <select
            aria-label="Selected chat card"
            value={cardId}
            onChange={(e) =>
              transition(() => {
                setCardId(e.target.value)
                setDraft("")
                setStep(0)
                setStopped(true)
                setNote("")
                setPrior("supplied")
              })
            }
          >
            {detail.session.cards.map((c) => (
              <option key={c.cardId}>{c.cardId}</option>
            ))}
          </select>
          <p>
            Supplied annotation prior: {annotation?.prior ?? "none"}.{" "}
            {prior !== "supplied" ? `Authored overlay: ${prior}.` : "No overlay."} Responses inspect
            candidates only.
          </p>
          {data.editable && annotation ? (
            "questionId" in annotation ? (
              <PromptCard
                questionId={annotation.questionId ?? ""}
                title={selectedCard?.title ?? "Card metadata unavailable"}
                description={selectedCard?.body ?? "Local candidate only; no answer is recorded."}
                value={note}
                onValueChange={(v) => {
                  if (admitted() && acceptsInput(classifyPriorResponse(priorStatus)))
                    transition(() => setNote(v))
                }}
                priorStatus={priorStatus}
                inputLabel="Local card note"
                submitLabel="Inspect note candidate"
                cancelLabel="Inspect decline candidate"
                onRespond={respond}
              />
            ) : (
              <ConfirmationCard
                title={selectedCard?.title ?? "Card metadata unavailable"}
                description={
                  selectedCard?.body ??
                  "Inspect a finite local response; no approval or prior change."
                }
                actions={annotation.actionIds.map((id) => ({
                  id,
                  label: `Inspect ${id} candidate`,
                }))}
                priorStatus={priorStatus}
                cancelLabel="Inspect decline candidate"
                onRespond={respond}
              />
            )
          ) : (
            <p>Card input withheld by read-only policy.</p>
          )}
        </>
      )}
      {!detail && <p>{data.problem || "Known empty conversation."}</p>}
    </section>
  )
  const review = (
    <section className="chat-review-controls" aria-label="Chat review controls">
      <h2>Snapshot review</h2>
      <label>
        Appearance
        <select
          aria-label="Chat example appearance"
          value={state.appearance}
          onChange={(e) => {
            if (admitted())
              change({ ...state, appearance: e.target.value as ChatExampleState["appearance"] })
          }}
        >
          {chatPackStates.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <label>
        Authored card prior overlay
        <select
          aria-label="Chat card prior overlay"
          value={prior}
          onChange={(e) =>
            transition(() => {
              setPrior(e.target.value)
              setDraft("")
              setStep(0)
              setStopped(true)
              setNote("")
            })
          }
        >
          {[
            "supplied",
            "none",
            "partial",
            "handling",
            "submitted",
            "canceled",
            "cancelled",
            "failed",
            "future-resolution",
          ].map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </label>
      <Button
        disabled={!detail || !data.editable}
        onClick={() =>
          transition(() => {
            setStopped(false)
            setStep((n) => Math.min(n + 1, detail?.session.previewChunks.length ?? 0))
          })
        }
      >
        Step manual preview
      </Button>
      <p>
        Preview {step}/{detail?.session.previewChunks.length ?? 0} ·{" "}
        {stopped ? "stopped" : busy ? "uncommitted" : "idle"}. Never appended to the transcript.
      </p>
      <label>
        Theme
        <select
          aria-label="Chat example theme"
          value={state.theme}
          onChange={(e) => {
            if (admitted()) change({ ...state, theme: e.target.value as ChatExampleState["theme"] })
          }}
        >
          {["p4-white", "p1-green-phosphor", "p3-amber-phosphor", "hi-contrast"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label>
        Mode
        <select
          aria-label="Chat example mode"
          value={state.mode}
          onChange={(e) => {
            if (admitted()) change({ ...state, mode: e.target.value as "light" | "dark" })
          }}
        >
          <option>light</option>
          <option>dark</option>
        </select>
      </label>
      <Button
        onClick={() => {
          if (admitted()) reset()
        }}
      >
        Reset chat context
      </Button>
      <Button
        onClick={() => {
          if (admitted()) release()
        }}
      >
        Release oldest scripted outcome ({queued})
      </Button>
    </section>
  )
  return (
    <AppShell
      className={`chat-example ${chrome?.className ?? ""} ${chrome?.layout ? `flux-layout-${chrome.layout}` : ""}`}
      nav={<aside className="chat-example-sidebar">{nav}</aside>}
      header={
        <header className="chat-example-header">
          <div className="chat-mobile-only">
            <OverlaySidebar
              side="left"
              title="Chat session navigation"
              open={navOpen}
              onOpenChange={(v) => {
                if (v !== navOpen) transition(() => setNavOpen(v))
              }}
              trigger={
                <Button variant="outline" size="sm">
                  Sessions
                </Button>
              }
            >
              {nav}
            </OverlaySidebar>
          </div>
          <div className={chrome?.header ? "sr-only" : undefined}>
            <h1 ref={heading} tabIndex={-1}>
              {detail?.session.title ?? "Conversation unavailable"}
            </h1>
            <small>Snapshot · Review only</small>
          </div>
          {chrome?.header?.(chromeContext)}
          <div className="chat-mobile-only">
            <OverlaySidebar
              side="right"
              title="Chat evidence"
              open={evidenceOpen}
              onOpenChange={(v) => {
                if (v !== evidenceOpen) transition(() => setEvidenceOpen(v))
              }}
              trigger={
                <Button variant="outline" size="sm">
                  Evidence
                </Button>
              }
            >
              {evidence}
            </OverlaySidebar>
          </div>
          <OverlaySidebar
            side="right"
            title="Chat fixture review"
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
            {review}
          </OverlaySidebar>
        </header>
      }
    >
      <div className="chat-example-main">
        <section className="chat-conversation" aria-label="Current conversation">
          <ChatStream
            className="chat-transcript"
            aria-label="Chat example transcript"
            loading={state.appearance === "loading"}
            items={items}
            status={status}
            empty={<p>{data.problem || "Known empty conversation · 0 supplied turns."}</p>}
            history={
              detail
                ? {
                    hasOlder: count < detail.turns.length,
                    loading: false,
                    onLoadOlder: () =>
                      transition(() =>
                        setCount((n) =>
                          Math.min(n + detail.session.historyPageSize, detail.turns.length),
                        ),
                      ),
                  }
                : undefined
            }
            jumpLabel="Jump to latest supplied turn"
          />
          {step > 0 && !busy && !stopped && (
            <section className="chat-completed-preview" aria-label="Completed manual preview">
              <p>Complete authored preview · uncommitted</p>
              <p className="chat-turn-text">{detail?.session.previewChunks.join("")}</p>
            </section>
          )}
          <div className="chat-composer">
            <p>
              {count} revealed / {detail?.turns.length ?? (data.accessible ? 0 : "Unknown")}{" "}
              supplied turns. Draft inspection never sends or appends.
            </p>
            <ChatInput
              aria-label="Local chat draft"
              value={draft}
              onValueChange={(v) => {
                if (data.editable && detail) transition(() => setDraft(v))
              }}
              onSubmit={(value) =>
                candidate(
                  "Draft candidate",
                  { session: detail?.session.id, text: value },
                  () => !busy && !!draft.trim() && value === draft.trim(),
                )
              }
              busy={busy}
              disabled={!data.editable || !detail}
              onStop={() => transition(() => setStopped(true))}
              history={detail?.history}
              placeholder="Write a local review draft…"
            />
          </div>
        </section>
        <aside className="chat-evidence">{evidence}</aside>
      </div>
      <footer className="chat-example-footer">
        No transport · Immutable snapshot · {chatPack.clock}
      </footer>
      {inspection && (
        <DetailDialog
          title={inspection.label}
          meta={`${detail?.session.id} · Snapshot ${chatPack.clock}`}
          open
          onClose={close}
          footer={<Button onClick={close}>Close inspection</Button>}
        >
          <div className="chat-inspection-body">
            <p>Local candidate only. Nothing is sent, approved or saved.</p>
            <JsonViewer value={inspection.value} className="evidence-json" />
            <p role="status">{inspection.outcome}</p>
            <Button
              onClick={() => {
                if (admitted()) release()
              }}
            >
              Release oldest scripted outcome ({queued})
            </Button>
          </div>
        </DetailDialog>
      )}
    </AppShell>
  )
}
