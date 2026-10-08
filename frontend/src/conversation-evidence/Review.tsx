import { Button, EmptyState } from "@hollis-labs/design-components"
import {
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
import { useLayoutEffect, useRef, useState } from "react"
import type { OperationsModel } from "../operations/model"
import {
  conversationEvidenceModel,
  conversationEvidenceStates,
  type EvidenceModel,
  type EvidenceState,
  type OutcomeKind,
  outcomeKinds,
  recordedToolState,
  sessionEvidence,
  specimenOutcome,
  type ToolPhase,
  toolPhases,
} from "./model"
import "./review.css"
export function ConversationEvidence({
  operations,
  initialState = "recorded",
  initialPhase = "completed",
  initialOutcome = "null",
  epoch = 0,
}: {
  operations: OperationsModel
  initialState?: EvidenceState
  initialPhase?: ToolPhase
  initialOutcome?: OutcomeKind
  epoch?: number
}) {
  return (
    <Frame
      key={`${conversationEvidenceModel(operations, initialState).source}/${initialPhase}/${initialOutcome}/${epoch}`}
      operations={operations}
      initialState={initialState}
      initialPhase={initialPhase}
      initialOutcome={initialOutcome}
    />
  )
}
function Frame({
  operations,
  initialState,
  initialPhase,
  initialOutcome,
}: {
  operations: OperationsModel
  initialState: EvidenceState
  initialPhase: ToolPhase
  initialOutcome: OutcomeKind
}) {
  const [state, setState] = useState(initialState),
    [copy, setCopy] = useState(0)
  const data = conversationEvidenceModel(operations, state)
  return (
    <section className="conversation-evidence">
      <div className="conversation-evidence-controls">
        <label>
          Evidence appearance{" "}
          <select
            aria-label="Conversation evidence appearance"
            value={state}
            onChange={(e) => {
              if (conversationEvidenceStates.includes(e.target.value as EvidenceState))
                setState(e.target.value as EvidenceState)
            }}
          >
            {conversationEvidenceStates.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <Button onClick={() => setCopy((n) => n + 1)}>Reset conversation evidence</Button>
        <Button onClick={() => setCopy((n) => n + 1)}>Replace conversation evidence source</Button>
      </div>
      <p className="muted">
        Recorded operations prefix through {data.cutoff}. Communications metadata is a separate
        fixed snapshot at {data.communications.clock}; earlier metadata is unknown. Authored
        explanation and tool specimens are presentation examples, not hidden thoughts or execution.
      </p>
      {state === "locked" && (
        <p role="status">
          Locked evidence is read-only; local navigation and disclosures remain available.
        </p>
      )}
      <Instance
        key={`${data.source}/${copy}`}
        data={data}
        initialPhase={initialPhase}
        initialOutcome={initialOutcome}
      />
    </section>
  )
}
function Instance({
  data,
  initialPhase,
  initialOutcome,
}: {
  data: EvidenceModel
  initialPhase: ToolPhase
  initialOutcome: OutcomeKind
}) {
  const [session, setSession] = useState(data.sessions[0]?.id ?? ""),
    [inspection, setInspection] = useState("")
  const [toolOpen, setToolOpen] = useState(true),
    [reasonOpen, setReasonOpen] = useState(true),
    [sourcesOpen, setSourcesOpen] = useState(true),
    [specimenOpen, setSpecimenOpen] = useState(true)
  const [phase, setPhase] = useState(initialPhase),
    [outcome, setOutcome] = useState(initialOutcome),
    [duration, setDuration] = useState<"missing" | "zero">("missing")
  const current = useRef({ alive: false, lease: 0 }),
    [, refresh] = useState(0)
  useLayoutEffect(() => {
    current.current.alive = true
    current.current.lease++
    refresh((n) => n + 1)
    return () => {
      current.current.alive = false
      current.current.lease++
    }
  }, [])
  const lease = current.current.lease,
    admitted = () => current.current.alive && current.current.lease === lease && data.available
  const details = sessionEvidence(data, session)
  function retire() {
    current.current.lease++
    setInspection("")
  }
  function select(id: string) {
    if (!admitted() || !sessionEvidence(data, id) || session === id) return
    retire()
    setSession(id)
    setToolOpen(true)
    setReasonOpen(true)
    setSourcesOpen(true)
  }
  function disclose(next: boolean, value: boolean, set: (v: boolean) => void) {
    if (!admitted() || next === value) return
    retire()
    set(next)
  }
  function inspect(id: string) {
    if (!admitted() || !details?.tools.some((t) => t.id === id) || inspection === id) return
    current.current.lease++
    setInspection(id)
  }
  if (!data.available)
    return (
      <EmptyState
        variant={data.state === "loading" ? "empty" : "error"}
        title={data.blockedReason}
        description="No session, transcript, result or metadata is admitted here; this appearance does not fetch evidence."
      />
    )
  if (!details)
    return (
      <EmptyState
        variant="empty"
        title="Observed empty conversation evidence"
        description="0 admitted sessions. No message, tool result or authored specimen is mounted."
      />
    )
  const inspected = details.tools.find((t) => t.id === inspection)
  const long = data.state === "long-content"
  const sampleOutput = specimenOutcome(outcome)
  const reasoningDuration = duration === "zero" ? 0 : undefined
  return (
    <>
      <section aria-label="Admitted conversation sessions">
        <h2>Recorded session evidence</h2>
        <div className="conversation-evidence-controls">
          {data.sessions.map((s) => (
            <Button key={s.id} aria-pressed={session === s.id} onClick={() => select(s.id)}>
              {s.id} · {s.runId}
            </Button>
          ))}
        </div>
        <p>
          {details.session.id} · {details.run.id} · run {details.run.status}.{" "}
          {details.metadata
            ? `${details.metadata.id} · ${details.contact?.name ?? "Contact unavailable"}`
            : !details.metadataAvailable
              ? "Communication metadata unavailable through this cutoff"
              : "Communication metadata not supplied for this session"}
          .
        </p>
      </section>
      <div className="conversation-evidence-grid">
        <section aria-label="Recorded messages and tools">
          <h2>Admitted transcript and tool evidence</h2>
          <ol className="conversation-recorded-messages">
            {details.messages.map((m) => (
              <li key={m.id}>
                <p>
                  <strong>{m.role}</strong> · {m.id} · <time dateTime={m.time}>{m.time}</time>
                </p>
                <p>{m.content}</p>
              </li>
            ))}
          </ol>
          {!details.messages.length && <p>No message observed through this cutoff.</p>}
          {details.tools.map((t) => {
            const state = recordedToolState(t.status)
            return (
              <article key={t.id} aria-label={`Recorded ${t.id}`}>
                <p className="muted">
                  {t.id} · {t.started} ·{" "}
                  {t.finished ? `finished ${t.finished}` : "No finish observed; output unavailable"}{" "}
                  · {t.traceId} / {t.spanId}
                </p>
                {state ? (
                  <Tool open={toolOpen} onOpenChange={(v) => disclose(v, toolOpen, setToolOpen)}>
                    <ToolHeader
                      toolName={t.name}
                      title={`Recorded ${t.id}: ${t.name}`}
                      state={state}
                    />
                    <ToolContent>
                      <ToolInput input={t.input} />
                      {t.finished ? (
                        <ToolOutput output={t.output} />
                      ) : (
                        <p>No recorded outcome admitted through this cutoff.</p>
                      )}
                      <Button onClick={() => inspect(t.id)}>Inspect recorded {t.id}</Button>
                    </ToolContent>
                  </Tool>
                ) : (
                  <p>Unsupported raw tool status: {t.status}. ToolHeader withheld.</p>
                )}
              </article>
            )
          })}
          {!details.tools.length && <p>No tool call observed through this cutoff.</p>}
        </section>
        <section aria-label="Authored explanation and supplied provenance">
          <h2>Explanation and provenance</h2>
          <label>
            Authored duration sample{" "}
            <select
              aria-label="Explanation duration specimen"
              value={duration}
              onChange={(e) => {
                if (
                  !admitted() ||
                  !["missing", "zero"].includes(e.target.value) ||
                  e.target.value === duration
                )
                  return
                retire()
                setDuration(e.target.value as "missing" | "zero")
              }}
            >
              <option>missing</option>
              <option>zero</option>
            </select>
          </label>
          <Reasoning
            open={reasonOpen}
            onOpenChange={(v) => disclose(v, reasonOpen, setReasonOpen)}
            isStreaming={false}
            duration={reasoningDuration}
          >
            <ReasoningTrigger
              getThinkingMessage={(_, seconds) =>
                seconds === undefined
                  ? "Authored explanation · duration unavailable"
                  : `Authored explanation · supplied duration sample ${seconds}s`
              }
            />
            <ReasoningContent>
              <p>
                {details.metadata?.reasoning ??
                  (details.metadataAvailable
                    ? "No authored explanation supplied for this session."
                    : "Authored explanation metadata unavailable before the communications snapshot clock.")}
              </p>
              {long && details.metadata && (
                <p>
                  {"Authored long explanation display sample; no additional model reasoning is claimed. ".repeat(
                    35,
                  )}
                </p>
              )}
            </ReasoningContent>
          </Reasoning>
          <Sources
            open={sourcesOpen}
            onOpenChange={(v) => disclose(v, sourcesOpen, setSourcesOpen)}
          >
            <SourcesTrigger count={details.provenance.length}>
              {details.provenance.length} supplied provenance records
            </SourcesTrigger>
            <SourcesContent>
              {details.provenance.map((p) => (
                <Source key={p.id} title={p.id}>
                  {p.label}
                </Source>
              ))}
            </SourcesContent>
          </Sources>
          <p className="muted">
            Static provenance text without links. Nothing is retrieved or navigated.
          </p>
        </section>
      </div>
      <section aria-label="Recorded tool inspector" className="conversation-evidence-inspector">
        <h2>
          {inspected
            ? `${inspected.id}: read-only recorded evidence`
            : "No tool evidence inspected"}
        </h2>
        {inspected ? (
          <>
            <p>
              {details.session.id} · {inspected.runId} · status {inspected.status} · cutoff{" "}
              {data.cutoff}
            </p>
            <p>Input: {inspected.input}</p>
            <p>
              {inspected.finished
                ? `Recorded result: ${inspected.output}`
                : "Output unavailable: no admitted finish"}
            </p>
            <Button
              onClick={() => {
                if (!admitted() || !inspection) return
                retire()
              }}
            >
              Clear recorded inspection
            </Button>
          </>
        ) : (
          <p>Use a recorded tool's local inspection button.</p>
        )}
      </section>
      <section aria-label="Authored tool state specimen">
        <h2>Authored tool presentation specimen</h2>
        <p className="muted">
          Separate finite component example. State, output and parameters below are authored display
          inputs, never recorded execution or approval outcomes.
        </p>
        <div className="conversation-evidence-controls">
          <label>
            State{" "}
            <select
              aria-label="Authored tool specimen phase"
              value={phase}
              onChange={(e) => {
                if (
                  !admitted() ||
                  !toolPhases.includes(e.target.value as ToolPhase) ||
                  e.target.value === phase
                )
                  return
                retire()
                setPhase(e.target.value as ToolPhase)
              }}
            >
              {toolPhases.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Outcome{" "}
            <select
              aria-label="Authored tool specimen outcome"
              value={outcome}
              onChange={(e) => {
                if (
                  !admitted() ||
                  !outcomeKinds.includes(e.target.value as OutcomeKind) ||
                  e.target.value === outcome
                )
                  return
                retire()
                setOutcome(e.target.value as OutcomeKind)
              }}
            >
              {outcomeKinds.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
        {phase === "unknown" ? (
          <p role="status">
            Unsupported raw specimen status: future-tool-resolution. ToolHeader withheld; no
            fallback approval or success is inferred.
          </p>
        ) : (
          <Tool
            open={specimenOpen}
            onOpenChange={(v) => disclose(v, specimenOpen, setSpecimenOpen)}
          >
            <ToolHeader
              toolName="authored.presentation"
              title="Authored specimen · no execution"
              state={phase}
            />
            <ToolContent>
              <ToolInput input={{ authored: true, count: 0, missing: null }} />
              <ToolOutput
                output={sampleOutput}
                errorText={
                  phase === "error"
                    ? "Authored error appearance; no provider failed here"
                    : undefined
                }
              />
              {outcome === "absent" && phase !== "error" && (
                <p>No specimen outcome supplied (undefined); Result component is absent.</p>
              )}
              {long && (
                <p>{"Long authored output annotation, not a recorded result. ".repeat(50)}</p>
              )}
            </ToolContent>
          </Tool>
        )}
      </section>
    </>
  )
}
export default ConversationEvidence
