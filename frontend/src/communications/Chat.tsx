import { Button, DetailDialog, EmptyState } from "@hollis-labs/design-components"
import {
  ArtifactCard,
  CardBoundary,
  CardMiss,
  ChatInput,
  type ChatItem,
  ChatStream,
  type ChatStreamStatus,
  ConfirmationCard,
  classifyPriorResponse,
  InfoCard,
  Plan,
  PlanContent,
  PlanDescription,
  PlanHeader,
  PlanTitle,
  PromptCard,
  Queue,
  QueueItem,
  QueueItemContent,
  QueueItemDescription,
  QueueItemIndicator,
  QueueList,
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@hollis-labs/kit-chat"
import { Panel } from "@hollis-labs/kit-dashboard/widgets"
import { MessageSquare } from "lucide-react"
import { useState } from "react"
import { classifyCard } from "./bindings"
import { AttachmentInspector, FixtureAttachments, type Intent } from "./Messaging"
import {
  type ChatDetail,
  type ChatState,
  type CommunicationsModel,
  chatDetail,
  chatStates,
  priorFor,
} from "./model"

function ReviewSession({
  model,
  detail,
  state,
  onIntent,
}: {
  model: CommunicationsModel
  detail: ChatDetail
  state: ChatState
  onIntent: Intent
}) {
  const [draft, setDraft] = useState(""),
    [note, setNote] = useState(""),
    [step, setStep] = useState(0),
    [older, setOlder] = useState(false),
    [inspect, setInspect] = useState<string | null>(null),
    [attachmentId, setAttachmentId] = useState<string | null>(null)
  const prior = priorFor(state),
    classification = classifyPriorResponse(prior),
    card = detail.cards[0],
    wireKind = state === "unknown-wire" ? "future.review/v99" : (card?.kind ?? "missing-card"),
    resolution = classifyCard(wireKind)
  const respond = (outcome: unknown) =>
    onIntent(`Card response inspected (${JSON.stringify(outcome)})`, card?.id ?? "card-unavailable")
  const items: ChatItem[] = detail.messages
    .filter((_, i) => older || i > 0)
    .map((m) => ({
      id: m.id,
      kind: "message",
      role: m.role === "user" ? "user" : "assistant",
      author: m.role === "user" ? "Fixture reviewer" : "Recorded assistant outcome",
      timestamp: m.time.replace("T", " ").slice(0, 19) + " UTC",
      content: <p>{m.content}</p>,
    }))
  items.push({
    id: card?.id ?? "unknown-card",
    kind: "card",
    wireKind,
    content: (
      <CardBoundary key={`${detail.session.id}/${wireKind}`} wireKind={wireKind}>
        {!resolution.ok ? (
          <CardMiss
            code={resolution.code}
            wireKind={wireKind}
            reason={resolution.reason}
            payload={<p>{card?.body}</p>}
          />
        ) : (
          <ConfirmationCard
            title={card.title}
            description={card.body}
            actions={[
              { id: "review", label: "Inspect proposed handoff", primary: true },
              { id: "decline", label: "Inspect refusal", tone: "warning" },
            ]}
            onRespond={respond}
            priorStatus={prior}
          />
        )}
      </CardBoundary>
    ),
  })
  const prompt = detail.cards[1]
  const promptResolution = prompt ? classifyCard(prompt.kind) : null
  if (prompt)
    items.push({
      id: prompt.id,
      kind: "card",
      wireKind: prompt.kind,
      content: (
        <CardBoundary key={prompt.id} wireKind={prompt.kind}>
          {promptResolution && !promptResolution.ok ? (
            <CardMiss
              code={promptResolution.code}
              wireKind={prompt.kind}
              reason={promptResolution.reason}
              payload={<p>{prompt.body}</p>}
            />
          ) : (
            <PromptCard
              questionId={prompt.id}
              title={prompt.title}
              description={prompt.body}
              value={note}
              onValueChange={setNote}
              onRespond={(outcome) =>
                onIntent(`Card note response (${JSON.stringify(outcome)})`, prompt.id)
              }
              priorStatus={prior}
              inputLabel="Card evidence note"
              submitLabel="Inspect note response"
            />
          )}
        </CardBoundary>
      ),
    })
  const preview = model.dataset.streamChunks.slice(0, step).join(""),
    streaming = state === "streaming" && step < model.dataset.streamChunks.length
  if (state === "streaming" && step === model.dataset.streamChunks.length)
    items.push({
      id: `${detail.session.id}/local-preview`,
      kind: "message",
      role: "assistant",
      author: "Completed local scripted preview",
      content: <p>{preview}</p>,
    })
  const status: ChatStreamStatus = streaming
    ? {
        status: "streaming",
        role: "assistant",
        content: preview || "Ready for the first scripted chunk.",
      }
    : state === "error"
      ? {
          status: "error",
          message: "Authored response failure. No model request or continuation occurred.",
        }
      : { status: "idle" }
  return (
    <>
      <div className="example-body">
        <p className="eyebrow">
          {detail.session.id} · {detail.session.sessionId} · {detail.session.runId}
        </p>
        <h2>{detail.session.title}</h2>
        <p className="muted">
          Recorded run outcome: {detail.run?.status ?? "unavailable"} · contact {detail.contact?.id}
          . This review is local.
        </p>
        <p role="status" aria-label="Card response classification" className="muted">
          Card response classification: {classification.kind}
          {prior ? ` (${prior})` : ""}
        </p>
        <Button size="sm" variant="outline" onClick={() => setInspect(wireKind)}>
          Inspect card binding
        </Button>
        {state === "streaming" && (
          <div className="playback-controls">
            <Button
              disabled={!streaming}
              onClick={() => setStep((n) => Math.min(n + 1, model.dataset.streamChunks.length))}
            >
              Advance scripted stream
            </Button>
            <Button variant="ghost" onClick={() => setStep(0)}>
              Reset stream preview
            </Button>
            <span className="muted">
              {step}/{model.dataset.streamChunks.length} fixed chunks · transient preview
            </span>
          </div>
        )}
        <Reasoning duration={60} defaultOpen={false}>
          <ReasoningTrigger>Authored review rationale</ReasoningTrigger>
          <ReasoningContent>{detail.session.reasoning}</ReasoningContent>
        </Reasoning>
      </div>
      <ChatStream
        items={items}
        status={status}
        autoScroll={false}
        preserveScrollOnPrepend={false}
        viewportClassName="chat-flow-viewport"
        aria-label="Session transcript"
        history={{ hasOlder: !older, loading: false, onLoadOlder: () => setOlder(true) }}
        empty={
          <EmptyState
            variant="empty"
            title="No messages"
            description="No session transport is connected."
          />
        }
      />
      <div className="example-body">
        <h3>Related tool calls</h3>
        {detail.tools.map((tool) => (
          <Tool key={tool.id} defaultOpen={true}>
            <ToolHeader
              toolName={tool.name}
              title={`${tool.id} · ${tool.spanId}`}
              state={tool.status === "failed" ? "error" : "completed"}
            />
            <ToolContent>
              <p className="muted">
                Recorded {tool.started.replace("T", " ").slice(0, 19)} UTC · {tool.runId} /{" "}
                {tool.traceId}
              </p>
              <ToolInput input={tool.input} />
              <ToolOutput
                output={tool.output}
                errorText={tool.status === "failed" ? tool.output : undefined}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => onIntent("Tool invocation inspected", tool.id)}
              >
                Inspect tool invocation
              </Button>
            </ToolContent>
          </Tool>
        ))}
        <Plan defaultOpen={true}>
          <PlanHeader>
            <PlanTitle>Recorded review plan</PlanTitle>
            <PlanDescription>{detail.plan?.id ?? "Plan unavailable"}</PlanDescription>
          </PlanHeader>
          <PlanContent>
            <ol>
              {detail.plan?.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </PlanContent>
        </Plan>
        <Queue>
          <h3>Review queue · {detail.queue?.id}</h3>
          <QueueList>
            <QueueItem>
              <QueueItemIndicator completed={detail.queue?.status === "completed"} />
              <QueueItemContent completed={detail.queue?.status === "completed"}>
                {detail.queue?.title}
              </QueueItemContent>
              <QueueItemDescription>
                {detail.queue?.status} · Fixture task review only; not an executable queue.
              </QueueItemDescription>
            </QueueItem>
          </QueueList>
        </Queue>
        <Sources defaultOpen={true}>
          <SourcesTrigger count={1}>Bundled evidence citation</SourcesTrigger>
          <SourcesContent>
            <Source title={detail.attachment?.name}>
              {detail.attachment?.id} · {detail.session.runId} · read-only local text
            </Source>
          </SourcesContent>
        </Sources>
        {detail.attachment && (
          <>
            <ArtifactCard
              name={detail.attachment.name}
              meta={`${detail.attachment.id} / ${detail.attachment.runId} · text/plain fixture`}
            />
            <FixtureAttachments records={[detail.attachment]} onInspect={setAttachmentId} />
          </>
        )}
        <InfoCard
          title="Inspector-only interaction"
          body="Card answers, drafts and tool controls produce transient local intent text. They do not approve, send, execute or save."
        />
        <ChatInput
          value={draft}
          onValueChange={setDraft}
          aria-label="Chat draft"
          onSubmit={(value) => onIntent(`Chat message draft (${value})`, detail.session.id)}
          showSubmitButton={false}
          busy={streaming}
          placeholder="Draft an offline chat message…"
        />
        <Button
          disabled={!draft.trim() || streaming}
          onClick={() => onIntent(`Chat message draft (${draft})`, detail.session.id)}
        >
          Inspect chat send intent
        </Button>
      </div>
      <AttachmentInspector
        record={model.dataset.attachments.find((a) => a.id === attachmentId)}
        onClose={() => setAttachmentId(null)}
      />
      <DetailDialog
        open={!!inspect}
        onClose={() => setInspect(null)}
        title="Card binding inspection"
        meta={card?.id}
      >
        <div className="example-body">
          <p>{wireKind}</p>
          <p>
            {resolution.ok
              ? `available · ${resolution.binding.rendererId} · ${resolution.binding.trustClass} · ${resolution.binding.entry}`
              : `${resolution.code} · ${resolution.reason}`}
          </p>
          <p className="muted">
            Host-local fixture rows resolved through design-bindings0.1.0. No dynamic renderer
            imports or real server envelope claim.
          </p>
        </div>
      </DetailDialog>
    </>
  )
}
export function ChatView({
  model,
  selected,
  onSelect,
  onIntent,
  onReset,
  initialState = "normal",
}: {
  model: CommunicationsModel
  selected: string | null
  onSelect: (id: string) => void
  onIntent: Intent
  onReset: () => void
  initialState?: ChatState
}) {
  const [state, setState] = useState<ChatState>(initialState),
    detail = chatDetail(model, selected)
  return (
    <Panel
      title="Chat session review"
      icon={<MessageSquare className="size-4" />}
      meta="shared kit-chat / local fixture"
    >
      <div className="example-body">
        <div className="communication-controls">
          <label>
            Session
            <select
              aria-label="Chat session"
              value={selected ?? ""}
              onChange={(e) => {
                setState("normal")
                onReset()
                onSelect(e.target.value)
              }}
            >
              {model.chatSessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} · {s.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Card / stream state
            <select
              aria-label="Chat card state"
              value={state}
              onChange={(e) => {
                setState(e.target.value as ChatState)
                onReset()
              }}
            >
              {chatStates.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
      {detail ? (
        <ReviewSession
          key={`${detail.session.id}/${state}`}
          model={model}
          detail={detail}
          state={state}
          onIntent={onIntent}
        />
      ) : (
        <div className="example-body">
          <EmptyState
            variant="empty"
            title="No chat sessions"
            description="Fixture resource contains no conversation; no session was started."
          />
        </div>
      )}
    </Panel>
  )
}
