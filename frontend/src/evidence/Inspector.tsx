import {
  Button,
  Callout,
  DetailDialog,
  DetailSection,
  JsonViewer,
  MetaList,
  PayloadSummary,
  SearchInput,
} from "@hollis-labs/design-components"
import { Panel } from "@hollis-labs/kit-dashboard/widgets"
import { useEffect, useRef, useState } from "react"
import type { OperationsModel } from "../operations/model"
import {
  type EvidenceKind,
  type EvidenceState,
  evidenceKinds,
  evidenceModel,
  evidenceStates,
  inspectedPayload,
} from "./model"

export function EvidenceInspector({
  model,
  initialState = "recorded",
}: {
  model: OperationsModel
  initialState?: EvidenceState
}) {
  const [state, setState] = useState(initialState),
    [revision, setRevision] = useState(0)
  const controls = useRef<HTMLSelectElement>(null),
    retire = useRef<() => void>(() => {})
  function reset() {
    retire.current()
    setRevision((n) => n + 1)
    controls.current?.focus()
  }
  return (
    <section className="evidence-lab" aria-label="Controlled evidence inspector">
      <div className="gallery-controls">
        <label>
          Evidence state{" "}
          <select
            ref={controls}
            aria-label="Evidence state"
            value={state}
            onChange={(e) => {
              setState(e.target.value as EvidenceState)
              reset()
            }}
          >
            {evidenceStates.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <Button variant="outline" onClick={reset}>
          Reset evidence
        </Button>
      </div>
      <p className="muted">
        Existing {model.dataset.version} / {model.dataset.profile} · unfiltered full snapshot{" "}
        {model.referenceClock}. Local inspection only; no clipboard, download or request.
      </p>
      <InspectorInstance
        key={`${model.dataset.version}/${model.dataset.profile}/${model.scenario}/${model.referenceClock}/${state}/${revision}`}
        model={model}
        state={state}
        retireRef={retire}
        reset={reset}
      />
    </section>
  )
}
function InspectorInstance({
  model,
  state,
  retireRef,
  reset,
}: {
  model: OperationsModel
  state: EvidenceState
  retireRef: React.MutableRefObject<() => void>
  reset: () => void
}) {
  const [query, setQuery] = useState(""),
    [kind, setKind] = useState<EvidenceKind>("all"),
    [selected, setSelected] = useState<string | null>(null),
    [open, setOpen] = useState(false),
    [searchRevision, setSearchRevision] = useState(0),
    [offset, setOffset] = useState(0)
  const current = useRef({ alive: false, lease: 0, selected: null as string | null, open: false }),
    focusFrame = useRef<number | null>(null),
    origin = useRef<HTMLButtonElement | null>(null)
  const data = evidenceModel(model, state, query, kind),
    row = data.rows.find((r) => `${r.kind}/${r.id}` === selected),
    payload = row ? inspectedPayload(row, data.malformed) : null,
    captured = current.current.lease
  function cancelFocus() {
    if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current)
    focusFrame.current = null
  }
  useEffect(() => {
    current.current.alive = true
    const stop = () => {
      current.current.alive = false
      current.current.lease++
      if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current)
      focusFrame.current = null
    }
    retireRef.current = stop
    return () => {
      stop()
      if (retireRef.current === stop) retireRef.current = () => {}
    }
  }, [retireRef])
  function admitted() {
    return current.current.alive && current.current.lease === captured
  }
  function changeQuery(next: string) {
    if (!admitted()) return
    cancelFocus()
    current.current.lease++
    current.current.selected = null
    current.current.open = false
    setSelected(null)
    setOpen(false)
    setQuery(next)
    setOffset(0)
  }
  function choose(id: string) {
    if (!admitted() || !data.rows.some((r) => `${r.kind}/${r.id}` === id)) return
    cancelFocus()
    current.current.lease++
    current.current.selected = id
    current.current.open = false
    setSelected(id)
    setOpen(false)
    setSearchRevision((n) => n + 1)
  }
  function show(target: HTMLButtonElement) {
    if (!admitted() || !row || current.current.selected !== selected) return
    cancelFocus()
    origin.current = target
    current.current.lease++
    setSearchRevision((n) => n + 1)
    current.current.open = true
    setOpen(true)
  }
  function close() {
    if (!admitted() || !current.current.open) return
    current.current.open = false
    current.current.lease++
    setOpen(false)
    const lease = current.current.lease,
      target = origin.current
    cancelFocus()
    focusFrame.current = requestAnimationFrame(() => {
      focusFrame.current = null
      if (
        current.current.alive &&
        current.current.lease === lease &&
        !current.current.open &&
        origin.current === target &&
        target?.isConnected
      )
        target.focus()
    })
  }
  const blocked = !model.accessible || ["loading", "denied", "error"].includes(state)
  return (
    <>
      <div role={state === "error" ? "alert" : "status"}>
        <Callout
          tone={
            blocked
              ? state === "error"
                ? "danger"
                : "warning"
              : state === "unknown"
                ? "neutral"
                : "info"
          }
          title="Evidence scope"
        >
          {blocked
            ? `Record content withheld: ${!model.accessible ? data.resource : state}. No retained payload.`
            : state === "unknown"
              ? "Unknown presentation classification future-evidence-v7; original record fields remain unchanged."
              : state === "empty" || model.scenario === "empty"
                ? "Known empty evidence index; no record selected."
                : "Fixed recorded task/run/trace/log/tool relationships. Filter matches record content and identifiers."}
        </Callout>
      </div>
      {!blocked && (
        <div className="evidence-filters">
          <SearchInput
            key={searchRevision}
            value={query}
            onChange={changeQuery}
            ariaLabel="Search evidence"
            placeholder="Find ID, message or payload…"
            debounceMs={150}
            slashToFocus={!open}
          />
          <label>
            Record kind{" "}
            <select
              aria-label="Evidence kind"
              value={kind}
              onChange={(e) => {
                if (!admitted()) return
                cancelFocus()
                current.current.lease++
                current.current.selected = null
                current.current.open = false
                setSearchRevision((n) => n + 1)
                setOffset(0)
                setKind(e.target.value as EvidenceKind)
                setSelected(null)
                setOpen(false)
              }}
            >
              {evidenceKinds.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </label>
        </div>
      )}
      <p className="muted" role="status">
        {blocked
          ? "Record count unavailable"
          : `${data.rows.length} of ${data.total} indexed records`}
      </p>
      <div className="evidence-grid">
        <Panel title="Recorded evidence index" icon={null}>
          <p className="muted evidence-index-caption">
            Each row previews its first three projected metadata entries; selected pane summarizes
            actual payload.
          </p>
          <div className="evidence-records">
            {data.rows.slice(offset, offset + 12).map((r) => (
              <div key={`${r.kind}/${r.id}`} className="evidence-row">
                <Button
                  variant={selected === `${r.kind}/${r.id}` ? "default" : "ghost"}
                  aria-pressed={selected === `${r.kind}/${r.id}`}
                  onClick={() => choose(`${r.kind}/${r.id}`)}
                >
                  Inspect {r.kind} {r.id}
                </Button>
                <div className="evidence-summary">
                  <PayloadSummary raw={r.summary} maxEntries={3} />
                </div>
              </div>
            ))}
            {data.rows.length > 12 && (
              <div className="gallery-controls">
                <span>
                  Rows {offset + 1}–{Math.min(offset + 12, data.rows.length)} of {data.rows.length}
                </span>
                <Button
                  variant="outline"
                  disabled={offset === 0}
                  onClick={() => {
                    if (admitted()) setOffset(Math.max(0, offset - 12))
                  }}
                >
                  Previous evidence page
                </Button>
                <Button
                  variant="outline"
                  disabled={offset + 12 >= data.rows.length}
                  onClick={() => {
                    if (admitted()) setOffset(offset + 12)
                  }}
                >
                  Next evidence page
                </Button>
              </div>
            )}
            {!data.rows.length && (
              <p>{blocked ? "Evidence withheld" : "No matching evidence records"}</p>
            )}
          </div>
        </Panel>
        <Panel title="Selected metadata and payload" icon={null}>
          <div className="example-body">
            {row && payload ? (
              <>
                <MetaList
                  columns={2}
                  className="evidence-metadata"
                  items={[
                    { label: "Record", value: row.id },
                    { label: "Kind", value: row.kind },
                    { label: "Related task", value: row.taskId },
                    { label: "Related run", value: row.runId },
                    { label: "Recorded at UTC", value: row.time },
                    { label: "Source", value: `${model.dataset.version} / ${data.profile}` },
                  ]}
                />
                <p>{payload.classification}</p>
                <p className="muted">
                  Payload preview: first four top-level entries; nested values serialized and
                  bounded by the released summary.
                </p>
                <div className="evidence-selected-summary">
                  <PayloadSummary raw={payload.raw} maxEntries={4} />
                </div>
                <Button variant="outline" onClick={(e) => show(e.currentTarget)}>
                  Open structured payload
                </Button>
                <DetailSection title="Read-only payload">
                  <JsonViewer value={payload.value} className="evidence-json" />
                </DetailSection>
                <details>
                  <summary>Exact raw payload text</summary>
                  <pre className="evidence-raw">{payload.raw}</pre>
                </details>
              </>
            ) : (
              <p>No evidence selected; metadata and payload are unavailable.</p>
            )}
          </div>
        </Panel>
      </div>
      <DetailDialog
        open={open && !!row}
        onClose={close}
        title={`Evidence payload ${row?.id ?? "unavailable"}`}
        meta={<span>{data.clock} · full-snapshot local inspection</span>}
        footer={
          <div className="gallery-controls">
            <Button variant="outline" onClick={close}>
              Close payload
            </Button>
            <Button variant="ghost" onClick={reset}>
              Reset evidence context
            </Button>
          </div>
        }
      >
        <div className="example-body">
          {row && payload && (
            <>
              <DetailSection title="Payload classification">
                <p>{payload.classification}</p>
                <MetaList
                  columns={1}
                  items={[
                    { label: "Related run", value: row.runId },
                    { label: "Recorded at UTC", value: row.time },
                  ]}
                />
              </DetailSection>
              <JsonViewer value={payload.value} className="evidence-json" />
            </>
          )}
        </div>
      </DetailDialog>
    </>
  )
}
