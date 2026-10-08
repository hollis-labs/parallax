import { useState } from "react"
import { type ChatPackState, chatPackDetail, chatPackModel, chatPackStates } from "./model"
import "./pack.css"

/** Read-only companion inspection, not the whole-chat shell delivered in the next milestone. */
export function ChatPackReview({
  initialState = "recorded",
  initialSession = "CHAT-001",
}: {
  initialState?: ChatPackState
  initialSession?: string
}) {
  const [state, setState] = useState(initialState)
  const model = chatPackModel(state)
  return (
    <section className="chat-pack-review" aria-label="Full-snapshot chat fixture pack">
      <h2>Full-snapshot chat fixture pack</h2>
      <p>
        {model.pack.version} · {model.pack.generator} · seed {model.pack.seed} · snapshot UTC{" "}
        <time>{model.pack.clock}</time>
      </p>
      <p>
        This companion uses the original eight-record operations context. Operations playback does
        not change this snapshot. Authored history is untimed; previews are uncommitted.
      </p>
      <label>
        Pack appearance{" "}
        <select
          aria-label="Pack appearance"
          value={state}
          onChange={(e) => setState(e.currentTarget.value as ChatPackState)}
        >
          {chatPackStates.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      {!model.accessible ? (
        <p role="status">{model.problem}</p>
      ) : (
        <PackContents key={model.source} model={model} initialSession={initialSession} />
      )}
    </section>
  )
}
function PackContents({
  model,
  initialSession,
}: {
  model: ReturnType<typeof chatPackModel>
  initialSession: string
}) {
  const [selected, setSelected] = useState(
    model.sessions.find((s) => s.id === initialSession)?.id ?? model.sessions[0]?.id ?? "",
  )
  const [older, setOlder] = useState(model.state === "long" ? 64 : 0)
  const detail = chatPackDetail(model, selected)
  return (
    <>
      <label>
        Snapshot session{" "}
        <select
          aria-label="Snapshot session"
          value={selected}
          onChange={(e) => {
            setSelected(e.currentTarget.value)
            setOlder(0)
          }}
        >
          {model.sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title} · {s.id}
            </option>
          ))}
        </select>
      </label>
      {detail && (
        <div key={detail.session.id}>
          <h3>{detail.session.title}</h3>
          <p>
            {detail.session.kind} · {detail.session.group}
          </p>
          <dl>
            <dt>Original run / session</dt>
            <dd>
              {detail.run?.id ?? "None — authored empty"} / {detail.chat?.sessionId ?? "None"}
            </dd>
            <dt>Supplied rows</dt>
            <dd>
              {detail.turns.length} total · {detail.recordedCount} recorded references ·{" "}
              {detail.authoredCount} authored history
            </dd>
            <dt>Composer policy</dt>
            <dd>
              {model.editable
                ? "Future whole-chat composition may inspect local candidates only."
                : "Locked local presentation; no editable controls."}
            </dd>
          </dl>
          <p>
            Revealed {Math.min(detail.turns.length, detail.session.initialCount + older)} of{" "}
            {detail.turns.length} immutable rows. History is already bundled, not fetched.
          </p>
          <button
            type="button"
            disabled={detail.session.initialCount + older >= detail.turns.length}
            onClick={() =>
              setOlder((n) => Math.min(detail.turns.length, n + detail.session.historyPageSize))
            }
          >
            Reveal supplied older history
          </button>
          <section
            className="chat-pack-transcript"
            aria-label="Supplied snapshot transcript"
            // biome-ignore lint/a11y/noNoninteractiveTabindex: Native keyboard scrolling of bounded history.
            tabIndex={0}
          >
            {detail.turns.length === 0 ? (
              <p>Known empty transcript: 0 supplied rows.</p>
            ) : (
              detail.turns
                .slice(
                  detail.turns.length -
                    Math.min(detail.turns.length, detail.session.initialCount + older),
                )
                .map((t) => (
                  <article key={t.id}>
                    <h4>
                      {t.role} · {t.id}
                    </h4>
                    <p>
                      {t.provenance} {t.time ? <time>{t.time}</time> : "No recorded timestamp."}
                    </p>
                    <p className="chat-pack-text">{t.text}</p>
                  </article>
                ))
            )}
          </section>
          <details>
            <summary>Declared card appearances and composer history</summary>
            <p>
              {detail.history.length} finite supplied user texts; no browser persistence. Prior
              appearance: {detail.prior ?? "None supplied — open authored appearance"}.
            </p>
            <pre>{JSON.stringify(detail.session.cards, null, 2)}</pre>
          </details>
          <details>
            <summary>Local text sources and original tool evidence</summary>
            {detail.sources.map((s) => (
              <article key={s.id}>
                <h4>
                  {s.kind} · {s.id}
                </h4>
                <p>{s.provenance}</p>
                <pre>
                  {typeof s.value === "string" ? s.value : JSON.stringify(s.value, null, 2)}
                </pre>
              </article>
            ))}
          </details>
          <details>
            <summary>Separate uncommitted manual preview</summary>
            <p>
              {model.state === "stalled-preview"
                ? "Stalled authored preview appearance; no new recorded messages."
                : "Finite authored chunks; revealing them will never append to this transcript."}
            </p>
            <ol>
              {detail.session.previewChunks.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ol>
          </details>
        </div>
      )}
    </>
  )
}
