import {
  Button,
  Callout,
  DetailDialog,
  EmptyState,
  JsonViewer,
  MetaList,
} from "@hollis-labs/design-components"
import {
  acceptsInput,
  type CardOutcome,
  ChatInput,
  type ChatItem,
  ChatStream,
  type ChatStreamStatus,
  ConfirmationCard,
  PromptCard,
} from "@hollis-labs/kit-chat"
import { type MutableRefObject, useEffect, useRef, useState } from "react"
import {
  type AdminPresentationTicket,
  createAdminPresentationSession,
} from "../chimera/admin-session"
import {
  type ConversationIntent,
  type ConversationMode,
  type ConversationReviewModel,
  type ConversationState,
  conversationCandidate,
  conversationModes,
  conversationReviewModel,
  conversationStates,
  type PriorAppearance,
  previewChunks,
  priorAppearances,
} from "./model"
export function ConversationReview({
  context = "populated",
  initialState = "recorded",
  initialMode = "transcript",
  initialPrior = "none",
  initialCard = "confirmation",
}: {
  context?: string
  initialState?: ConversationState
  initialMode?: ConversationMode
  initialPrior?: PriorAppearance
  initialCard?: "confirmation" | "prompt"
}) {
  const [state, setState] = useState(initialState),
    [mode, setMode] = useState(initialMode),
    [prior, setPrior] = useState(initialPrior),
    [card, setCard] = useState(initialCard),
    [sessionId, setSessionId] = useState("CHAT-001"),
    [copy, setCopy] = useState(false),
    [revision, setRevision] = useState(0),
    [queued, setQueued] = useState(0)
  const retire = useRef(() => {}),
    queue = useRef<(() => void)[]>([])
  const data = conversationReviewModel(state, context, sessionId, prior, card, copy)
  function reset() {
    retire.current()
    setRevision((n) => n + 1)
  }
  function release() {
    queue.current.shift()?.()
    setQueued(queue.current.length)
  }
  return (
    <section className="conversation-review" aria-label="Controlled conversation review">
      <div className="gallery-controls">
        <label>
          Conversation appearance{" "}
          <select
            aria-label="Conversation appearance"
            value={state}
            onChange={(e) => {
              setState(e.target.value as ConversationState)
              reset()
            }}
          >
            {conversationStates.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Conversation composition{" "}
          <select
            aria-label="Conversation composition"
            value={mode}
            onChange={(e) => {
              setMode(e.target.value as ConversationMode)
              reset()
            }}
          >
            {conversationModes.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Fixture session{" "}
          <select
            aria-label="Fixture session"
            value={sessionId}
            onChange={(e) => {
              setSessionId(e.target.value)
              reset()
            }}
          >
            {data.fixture.chatSessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} · {s.sessionId}
              </option>
            ))}
          </select>
        </label>
        <label>
          Reviewed card{" "}
          <select
            aria-label="Reviewed card"
            value={card}
            onChange={(e) => {
              setCard(e.target.value as "confirmation" | "prompt")
              reset()
            }}
          >
            <option>confirmation</option>
            <option>prompt</option>
          </select>
        </label>
        <label>
          Authored prior appearance{" "}
          <select
            aria-label="Authored prior appearance"
            value={prior}
            onChange={(e) => {
              setPrior(e.target.value as PriorAppearance)
              reset()
            }}
          >
            {priorAppearances.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label>
          Reviewed conversation source{" "}
          <select
            aria-label="Reviewed conversation source"
            value={copy ? "copy" : "original"}
            onChange={(e) => {
              setCopy(e.target.value === "copy")
              reset()
            }}
          >
            <option value="original">Original fixture</option>
            <option value="copy">Reviewed copy (same records)</option>
          </select>
        </label>
        <Button variant="outline" onClick={reset}>
          Reset conversation review
        </Button>
        <Button variant="outline" disabled={!queued} onClick={release}>
          Release oldest scripted inspection ({queued})
        </Button>
      </div>
      <Callout tone="info" title="No sending or card approval">
        Send/Submit/action labels only inspect a local candidate intent. No supplied message, card
        prior, session, approval or transport changes. The finite manual stream preview is authored
        text outside committed messages. Responses return void; the host holds a separate inspection
        rather than the card's internal async state.
      </Callout>
      <p className="muted">
        Unfiltered full snapshot {data.fixture.version} + {data.operations.version} at{" "}
        {data.fixture.clock}; operations playback paused. No prior response is recorded on these
        fixture cards; the prior selector is a separately authored appearance. Raw “open” and
        “pending” are unknown locked values in the pinned classifier, not canonical states.
      </p>
      <Instance
        key={`${data.source}/${state}/${mode}/${prior}/${card}/${revision}`}
        data={data}
        mode={mode}
        retireRef={retire}
        enqueue={(producer) => {
          queue.current.push(producer)
          setQueued(queue.current.length)
        }}
        release={release}
        reset={reset}
      />
    </section>
  )
}
function Instance({
  data,
  mode,
  retireRef,
  enqueue,
  release,
  reset,
}: {
  data: ConversationReviewModel
  mode: ConversationMode
  retireRef: MutableRefObject<() => void>
  enqueue: (producer: () => void) => void
  release: () => void
  reset: () => void
}) {
  const [draft, setDraft] = useState(""),
    [prompt, setPrompt] = useState(
      data.prior === "submitted"
        ? "Authored prior answer appearance; no recorded fixture response"
        : "",
    ),
    [older, setOlder] = useState(false),
    [step, setStep] = useState(0),
    [stopped, setStopped] = useState(false),
    [plan, setPlan] = useState<ConversationIntent | null>(null),
    [result, setResult] = useState(""),
    [, rerender] = useState(0)
  const source = `${data.source}/${data.state}/${mode}/${data.card?.id}/${data.prior}`,
    current = useRef({
      alive: false,
      lease: 0,
      source,
      draft: "",
      prompt:
        data.prior === "submitted"
          ? "Authored prior answer appearance; no recorded fixture response"
          : "",
      plan: null as ConversationIntent | null,
      step: 0,
      stopped: false,
    }),
    session = useRef<ReturnType<typeof createAdminPresentationSession> | null>(null),
    ticket = useRef<AdminPresentationTicket | null>(null),
    origin = useRef<HTMLElement | null>(null),
    raf = useRef<number | null>(null)
  current.current.source = source
  const captured = current.current.lease
  const admitted = () =>
    current.current.alive && current.current.source === source && current.current.lease === captured
  function cancelFocus() {
    if (raf.current !== null) cancelAnimationFrame(raf.current)
    raf.current = null
  }
  function retire() {
    current.current.lease++
    current.current.plan = null
    ticket.current?.cancel()
    ticket.current = null
    session.current?.reset(source, `${source}/${current.current.lease}`)
    cancelFocus()
    setPlan(null)
    setResult("")
  }
  useEffect(() => {
    const active = createAdminPresentationSession(source, source, ["inspect"])
    session.current = active
    current.current.alive = true
    current.current.lease++
    rerender((n) => n + 1)
    const stop = () => {
      current.current.alive = false
      current.current.lease++
      current.current.plan = null
      ticket.current?.cancel()
      active.dispose()
      if (raf.current !== null) cancelAnimationFrame(raf.current)
      raf.current = null
    }
    retireRef.current = stop
    return () => {
      stop()
      if (retireRef.current === stop) retireRef.current = () => {}
    }
  }, [source, retireRef])
  function edit(kind: "composer" | "prompt", value: string) {
    if (!admitted() || !data.editable || (kind === "prompt" && !acceptsInput(data.classification)))
      return
    retire()
    if (kind === "composer") {
      current.current.draft = value
      setDraft(value)
    } else {
      current.current.prompt = value
      setPrompt(value)
    }
  }
  function inspect(kind: ConversationIntent["kind"], payload: string | CardOutcome) {
    if (!admitted() || current.current.plan) return
    const candidate = conversationCandidate(
      data,
      kind,
      payload,
      current.current.draft,
      current.current.prompt,
      current.current.stopped,
    )
    if (!candidate) return
    cancelFocus()
    origin.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    current.current.lease++
    const lease = current.current.lease
    current.current.plan = candidate
    setPlan(candidate)
    setResult("Held local candidate inspection; no submission or transcript mutation.")
    const active = session.current?.begin("inspect")
    if (!active) return
    ticket.current = active
    enqueue(() => {
      const fresh = conversationCandidate(
        data,
        kind,
        payload,
        current.current.draft,
        current.current.prompt,
        current.current.stopped,
      )
      if (
        !current.current.alive ||
        current.current.source !== source ||
        current.current.lease !== lease ||
        current.current.plan !== candidate ||
        !fresh ||
        JSON.stringify(fresh) !== JSON.stringify(candidate)
      ) {
        active.cancel()
        return
      }
      active.commit(() =>
        setResult(
          "Candidate response inspected locally. Transcript and supplied prior unchanged; nothing sent or approved.",
        ),
      )
    })
  }
  function close() {
    if (!admitted() || !current.current.plan) return
    retire()
    const lease = current.current.lease,
      target = origin.current
    raf.current = requestAnimationFrame(() => {
      raf.current = null
      if (
        current.current.alive &&
        current.current.source === source &&
        current.current.lease === lease &&
        !current.current.plan &&
        target === origin.current &&
        target?.isConnected
      )
        target.focus()
    })
  }
  function advance() {
    if (
      !admitted() ||
      !data.busy ||
      current.current.stopped ||
      current.current.step >= previewChunks.length
    )
      return
    retire()
    current.current.step++
    setStep(current.current.step)
    setDraft("")
    setPrompt("")
    current.current.draft = ""
    current.current.prompt = ""
  }
  function stop() {
    if (!admitted() || !data.busy) return
    retire()
    current.current.stopped = true
    setStopped(true)
    current.current.draft = ""
    current.current.prompt = ""
    setDraft("")
    setPrompt("")
  }
  function history() {
    if (!admitted() || !data.accessible || data.state === "history-loading" || older) return
    retire()
    setOlder(true)
  }
  const messages =
    data.state === "empty" || data.state === "loading"
      ? []
      : data.messages.filter((_, i) => older || i > 0)
  const items: ChatItem[] = messages.map((m) => ({
    id: m.id,
    kind: "message",
    role: m.role === "user" ? "user" : "assistant",
    author: `Recorded ${m.id} · ${m.role}`,
    timestamp: m.time.replace("T", " "),
    content: (
      <>
        <p>{m.content}</p>
        {data.state === "long" && (
          <p className="conversation-long">
            Authored wrapping annotation (not a message):{" "}
            {"Bounded long contextual text for scroll and reading review. ".repeat(24)}
          </p>
        )}
      </>
    ),
  }))
  if (data.card && data.state !== "empty" && data.state !== "loading" && data.editable) {
    items.push({
      id: data.card.id,
      kind: "card",
      wireKind: data.card.kind,
      author: `Fixture card ${data.card.id} · authored prior ${data.prior ?? "none"}`,
      content:
        data.cardKind === "confirmation" ? (
          <ConfirmationCard
            title={data.card.title}
            description={data.card.body}
            actions={[
              { id: "inspect-handoff", label: "Inspect handoff candidate", primary: true },
              { id: "inspect-refusal", label: "Inspect refusal candidate", tone: "warning" },
            ]}
            cancelLabel="Inspect decline candidate"
            priorStatus={data.prior}
            priorActionId={data.prior === "submitted" ? "inspect-handoff" : undefined}
            onRespond={(outcome) => inspect("confirmation", outcome)}
          />
        ) : (
          <PromptCard
            questionId={data.card.id}
            title={data.card.title}
            description={data.card.body}
            inputLabel="Local prompt draft"
            value={prompt}
            onValueChange={(value) => edit("prompt", value)}
            priorStatus={data.prior}
            submitLabel="Inspect prompt candidate"
            cancelLabel="Inspect prompt decline"
            onRespond={(outcome) => inspect("prompt", outcome)}
          />
        ),
    })
  }
  const status: ChatStreamStatus =
    data.state === "error"
      ? {
          status: "error",
          message: (
            <p>Authored presentation failure; no request was made. Supplied snapshot remains.</p>
          ),
        }
      : data.busy && !stopped
        ? {
            status: data.state === "stalled" ? "stalled" : "streaming",
            role: "assistant",
            content: (
              <p>{previewChunks.slice(0, step).join("") || "Manual preview has not advanced."}</p>
            ),
          }
        : { status: "idle" }
  return (
    <>
      <p data-testid="conversation-review-source" className="muted">
        Source: {data.source}; session {data.session.sessionId}, run {data.session.runId}. Prior raw{" "}
        {data.prior ?? "none"} → {data.classification.kind}. Underlying fixture contains{" "}
        {data.messages.length} messages; selected appearance may withhold them. Preview is never
        committed.
      </p>
      {!data.accessible ? (
        <EmptyState
          variant="error"
          title="Conversation evidence withheld"
          description="Denied presentation policy; transcript, drafts and card content unmounted."
        />
      ) : (
        <>
          <div className="gallery-controls">
            <span data-testid="conversation-count">
              {messages.length} visible / {data.state === "empty" ? 0 : data.messages.length}{" "}
              supplied messages
            </span>
            {data.busy && (
              <>
                <Button
                  variant="outline"
                  disabled={stopped || step >= previewChunks.length}
                  onClick={advance}
                >
                  Advance manual preview
                </Button>
                <span>
                  {step}/{previewChunks.length} authored chunks ·{" "}
                  {stopped ? "stopped" : "partial preview"}
                </span>
              </>
            )}
          </div>
          {data.state === "locked" && (
            <p className="notice">
              Locked host policy: response cards withheld and composer disabled; supplied transcript
              remains read-only. No fake prior status is used.
            </p>
          )}
          <ChatStream
            items={mode === "cards" ? items.filter((i) => i.kind === "card") : items}
            status={status}
            loading={data.state === "loading"}
            autoScroll={false}
            preserveScrollOnPrepend={true}
            className="conversation-stream"
            viewportClassName="conversation-viewport"
            aria-label="Bounded review transcript"
            history={
              mode === "transcript" && data.state !== "empty" && data.state !== "loading"
                ? {
                    hasOlder: !older,
                    loading: data.state === "history-loading",
                    error:
                      data.state === "history-error" && !older
                        ? "Authored finite history failure; Retry only reveals supplied older row"
                        : undefined,
                    onLoadOlder: history,
                  }
                : undefined
            }
            empty={<p>Known empty transcript; no supplied messages or card.</p>}
            jumpLabel="Jump to supplied latest"
          />
          <p className="muted">
            Transcript viewport owns only its bounded internal scrolling; the app page remains the
            outer scroll owner. Loading older reveals at most one already-supplied row, without
            transport or persistence.
          </p>
          <ChatInput
            aria-label="Local composer draft"
            value={draft}
            onValueChange={(value) => edit("composer", value)}
            onSubmit={(value) => inspect("composer", value)}
            busy={data.busy && !stopped}
            disabled={!data.editable}
            onStop={data.busy && !stopped ? stop : undefined}
            history={data.messages.filter((m) => m.role === "user").map((m) => m.content)}
            placeholder="Draft locally; Enter inspects, Shift+Enter adds a line"
            toolbarStart={<span className="muted">No sending · finite supplied history</span>}
          />
        </>
      )}
      <DetailDialog
        open={plan !== null}
        onClose={close}
        title="Local conversation candidate intent"
        widthClassName="settings-plan-dialog"
        footer={
          <div className="gallery-controls settings-plan-footer">
            <Button variant="outline" onClick={release}>
              Release oldest scripted inspection
            </Button>
            <Button variant="outline" onClick={close}>
              Close inspection
            </Button>
            <Button variant="outline" onClick={reset}>
              Reset conversation review
            </Button>
          </div>
        }
      >
        <div className="settings-plan-body">
          <MetaList
            items={[
              { label: "Source", value: data.source },
              { label: "Fixed UTC", value: data.fixture.clock },
              {
                label: "Session/card",
                value: `${data.session.id} / ${plan?.cardId ?? "composer"}`,
              },
            ]}
          />
          <p role="status">{result}</p>
          <JsonViewer value={plan} className="evidence-json" />
        </div>
      </DetailDialog>
    </>
  )
}
