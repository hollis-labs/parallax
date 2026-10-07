import {
  Button,
  Callout,
  CollapsibleSection,
  Combobox,
  ConfirmDialog,
  DetailSection,
  FormDialog,
  OverflowMenu,
  Pill,
  ProgressBar,
} from "@hollis-labs/design-components"
import { Panel } from "@hollis-labs/kit-dashboard/widgets"
import { Layers } from "lucide-react"
import { type MutableRefObject, useEffect, useId, useRef, useState } from "react"
import { createAdminPresentationSession } from "../chimera/admin-session"
import { type OperationsModel, runDetail } from "../operations/model"
import { type GalleryState, galleryModel, galleryStates } from "./model"

type Producer = () => boolean
export function PrimitiveGallery({
  model,
  initialState = "normal",
  onInspect = () => {},
  onIntent = () => {},
  onReset = () => {},
}: {
  model: OperationsModel
  initialState?: GalleryState
  onInspect?: (id: string) => void
  onIntent?: (text: string) => void
  onReset?: () => void
}) {
  const [state, setState] = useState(initialState),
    [revision, setRevision] = useState(0),
    [held, setHeld] = useState(0),
    [producerStatus, setProducerStatus] = useState("")
  const producers = useRef<Producer[]>([]),
    retirement = useRef<() => void>(() => {}),
    controls = useRef<HTMLSelectElement>(null)
  const data = galleryModel(model, state)
  function reset() {
    retirement.current()
    setRevision((n) => n + 1)
    setProducerStatus("")
    onReset()
    controls.current?.focus()
  }
  function release() {
    const producer = producers.current.shift()
    if (!producer) return
    const accepted = producer()
    setHeld(producers.current.length)
    setProducerStatus(
      accepted
        ? "Current scripted outcome inspected."
        : "Retired producer ignored; current presentation unchanged.",
    )
  }
  useEffect(
    () => () => {
      producers.current = []
    },
    [],
  )
  return (
    <section className="primitive-gallery" aria-label="Controlled primitive gallery">
      <div className="gallery-controls">
        <label>
          Gallery state{" "}
          <select
            ref={controls}
            aria-label="Gallery state"
            value={state}
            onChange={(e) => {
              setState(e.target.value as GalleryState)
              reset()
            }}
          >
            {galleryStates.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <Button variant="outline" onClick={reset}>
          Reset gallery
        </Button>
        <Button variant="ghost" disabled={!held} onClick={release}>
          Release oldest producer ({held})
        </Button>
      </div>
      <p className="muted">
        primitive-gallery/v1 · {model.dataset.version} · full snapshot {data.clock}. No operation
        playback, save or external request.
      </p>
      {producerStatus && <p role="status">{producerStatus}</p>}
      <GalleryInstance
        key={`${data.source}/${state}/${revision}`}
        model={model}
        data={data}
        retirement={retirement}
        enqueue={(producer) => {
          producers.current.push(producer)
          setHeld(producers.current.length)
        }}
        release={release}
        reset={reset}
        onInspect={onInspect}
        onIntent={onIntent}
        onReset={onReset}
      />
    </section>
  )
}
function GalleryInstance({
  model,
  data,
  enqueue,
  release,
  reset,
  onInspect,
  onIntent,
  onReset,
  retirement,
}: {
  model: OperationsModel
  retirement: MutableRefObject<() => void>
  data: ReturnType<typeof galleryModel>
  enqueue: (producer: Producer) => void
  release: () => void
  reset: () => void
  onInspect: (id: string) => void
  onIntent: (text: string) => void
  onReset: () => void
}) {
  const [selection, setSelection] = useState<string | null>(null),
    [draft, setDraft] = useState(""),
    [formOpen, setFormOpen] = useState(false),
    [confirmOpen, setConfirmOpen] = useState(false),
    [outcome, setOutcome] = useState("inspect"),
    [result, setResult] = useState(""),
    [busy, setBusy] = useState({ form: false, confirm: false })
  const session = useRef<ReturnType<typeof createAdminPresentationSession> | null>(null),
    alive = useRef(false),
    sequence = useRef(0),
    currentBusy = useRef(busy),
    current = useRef({
      lease: 0,
      selection: null as string | null,
      draft: "",
      form: false,
      confirm: false,
    }),
    returnTarget = useRef<HTMLElement | null>(null),
    focusFrame = useRef<number | null>(null),
    menuRoot = useRef<HTMLDivElement>(null),
    noteId = useId(),
    onResetRef = useRef(onReset)
  const detail = runDetail(model, selection),
    capturedLease = current.current.lease
  useEffect(() => {
    onResetRef.current = onReset
  }, [onReset])
  useEffect(() => {
    alive.current = true
    const presentation = createAdminPresentationSession(data.state, data.source, [
      "form",
      "confirm",
    ])
    session.current = presentation
    const stop = () => {
      alive.current = false
      if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current)
      focusFrame.current = null
      presentation.dispose()
      if (session.current === presentation) session.current = null
    }
    retirement.current = stop
    return () => {
      alive.current = false
      if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current)
      focusFrame.current = null
      presentation.dispose()
      if (session.current === presentation) session.current = null
      onResetRef.current()
      if (retirement.current === stop) retirement.current = () => {}
    }
  }, [data.source, data.state, retirement])
  function retire() {
    if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current)
    focusFrame.current = null
    current.current.lease++
    session.current?.reset(`${data.state}/${++sequence.current}`, data.source)
    currentBusy.current = { form: false, confirm: false }
    setBusy(currentBusy.current)
    setResult("")
    onReset()
  }
  function choose(id: string | null) {
    if (
      !alive.current ||
      capturedLease !== current.current.lease ||
      !data.readable ||
      (id !== null && !data.items.some((item) => item.value === id))
    )
      return
    retire()
    current.current = { ...current.current, selection: id, draft: "", form: false, confirm: false }
    setSelection(id)
    setDraft("")
    setFormOpen(false)
    setConfirmOpen(false)
  }
  function restoreFocus() {
    const target = returnTarget.current,
      lease = current.current.lease
    if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current)
    focusFrame.current = requestAnimationFrame(() => {
      focusFrame.current = null
      if (
        alive.current &&
        current.current.lease === lease &&
        returnTarget.current === target &&
        !current.current.form &&
        !current.current.confirm &&
        target?.isConnected
      )
        target.focus()
    })
  }
  function admitted() {
    return (
      alive.current &&
      capturedLease === current.current.lease &&
      !!detail &&
      current.current.selection === detail.task.id
    )
  }
  function open(kind: "form" | "confirm", fromMenu = false) {
    if (!admitted() || !data.editable) return
    returnTarget.current = fromMenu
      ? (menuRoot.current?.querySelector<HTMLButtonElement>("button") ?? null)
      : document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    retire()
    current.current.form = kind === "form"
    current.current.confirm = kind === "confirm"
    setFormOpen(kind === "form")
    setConfirmOpen(kind === "confirm")
  }
  function close(kind: "form" | "confirm") {
    if (!admitted() || !current.current[kind]) return
    retire()
    current.current[kind] = false
    if (kind === "form") {
      current.current.draft = ""
      setFormOpen(false)
      setDraft("")
    } else setConfirmOpen(false)
    restoreFocus()
  }
  function request(kind: "form" | "confirm") {
    if (
      !alive.current ||
      capturedLease !== current.current.lease ||
      !current.current[kind] ||
      current.current.selection !== detail?.task.id ||
      current.current.draft !== draft ||
      !session.current ||
      !data.editable ||
      !detail ||
      currentBusy.current[kind] ||
      (kind === "form" && !draft.trim())
    )
      return
    const ticket = session.current.begin(kind),
      captured = `${kind === "form" ? `Inspect note “${draft.trim()}”` : "Inspect archive intent"} for ${detail.task.id}/${detail.run.id} at ${data.clock}. No record changed.`,
      refused = outcome === "refuse"
    currentBusy.current = { ...currentBusy.current, [kind]: true }
    setBusy(currentBusy.current)
    setResult("")
    const requestLease = current.current.lease
    enqueue(() => {
      if (!alive.current || requestLease !== current.current.lease || !current.current[kind]) {
        ticket.cancel()
        return false
      }
      return ticket.commit(() => {
        currentBusy.current = { ...currentBusy.current, [kind]: false }
        setBusy(currentBusy.current)
        setResult(
          refused ? "Scripted refusal: local intent not admitted; draft retained." : captured,
        )
        onIntent(refused ? "Scripted refusal; no effect" : captured)
        if (!refused) {
          current.current.lease++
          current.current[kind] = false
          if (kind === "form") {
            current.current.draft = ""
            setFormOpen(false)
            setDraft("")
          } else setConfirmOpen(false)
          restoreFocus()
        }
      })
    })
  }
  return (
    <>
      <div className="gallery-policy" role={data.state === "error" ? "alert" : "status"}>
        <Callout tone={data.calloutTone} title="Presentation policy">
          {data.message}
        </Callout>
      </div>
      <div className="gallery-grid">
        <Panel title="Pill, Callout and ProgressBar" icon={<Layers className="size-4" />}>
          <div className="example-body">
            <fieldset className="gallery-pills" aria-label="Supported pill tones">
              {(["neutral", "info", "success", "warning", "danger"] as const).map((tone) => (
                <Pill key={tone} tone={tone} dot>
                  {tone}
                </Pill>
              ))}
            </fieldset>
            <p>
              <Pill tone={data.tone} dot>
                {data.state === "unknown" ? "Unknown · future-review-phase" : data.state}
              </Pill>
            </p>
            <section aria-label="Recorded task completion">
              <p>
                {data.progress === null
                  ? "Completion unavailable"
                  : `${data.completed} / ${data.total} recorded tasks done · ${Math.round(data.progress)}%`}
              </p>
              {data.state === "loading" ? (
                <ProgressBar indeterminate />
              ) : data.progress !== null ? (
                <div
                  role="progressbar"
                  aria-label="Recorded task completion"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={data.progress}
                >
                  <ProgressBar value={data.progress} />
                </div>
              ) : (
                <p className="muted">No numeric progress; missing observations are not zero.</p>
              )}
            </section>
            <details>
              <summary>Progress clamp review vectors</summary>
              <p className="muted">Review inputs only; these are not fixture completion values.</p>
              <div
                role="progressbar"
                aria-label="Lower clamp"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={0}
              >
                <ProgressBar value={-25} />
              </div>
              <p>−25 input → 0%</p>
              <div
                role="progressbar"
                aria-label="Upper clamp"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={100}
              >
                <ProgressBar value={125} />
              </div>
              <p>125 input → 100%</p>
            </details>
            <p className="muted">
              Task-event completion, not run completion. Indeterminate appearance uses published
              keyframes; no background collection.
            </p>
          </div>
        </Panel>
        <Panel title="Combobox and OverflowMenu" icon={<Layers className="size-4" />}>
          <div className="example-body">
            {data.readable || data.state === "empty" ? (
              <Combobox
                items={data.items}
                value={selection}
                onChange={choose}
                ariaLabel="Gallery recorded task"
                placeholder="Select a recorded task"
                searchPlaceholder="Find fixture task…"
                emptyText="No matching recorded tasks"
                clearable
                clearLabel="Clear recorded task"
              />
            ) : (
              <p>Record selector withheld by fixture presentation policy.</p>
            )}
            <p className="muted">{selection ?? "No local record selected"}</p>
            <div className="gallery-action-row" ref={menuRoot}>
              <span>Recorded row presentation</span>
              <OverflowMenu
                ariaLabel="Recorded row inspection actions"
                actions={[
                  {
                    label: "Inspect linked run",
                    disabled: !detail,
                    onSelect: () => {
                      if (admitted() && detail) onInspect(detail.task.id)
                    },
                  },
                  {
                    label: "Review local note",
                    disabled: !detail || !data.editable,
                    onSelect: () => open("form", true),
                  },
                  {
                    label: "Review archive intent",
                    destructive: true,
                    disabled: !detail || !data.editable,
                    onSelect: () => open("confirm", true),
                  },
                ]}
              />
            </div>
            <p className="muted">
              Menu callbacks inspect only. Disabled actions never imply permission evaluation; no
              fixture is archived.
            </p>
          </div>
        </Panel>
      </div>
      <Panel title="CollapsibleSection and DetailSection" icon={<Layers className="size-4" />}>
        <div className="example-body">
          <CollapsibleSection
            key={selection ?? "none"}
            label="Fixture relationships"
            accent={
              data.state === "error" ? "danger" : data.state === "locked" ? "warning" : "info"
            }
            summary={selection ?? "No selection"}
          >
            <DetailSection title="Recorded identity">
              {detail ? (
                <dl>
                  <dt>Task</dt>
                  <dd>
                    {detail.task.id} · {detail.task.title}
                  </dd>
                  <dt>Run</dt>
                  <dd>
                    {detail.run.id} · {detail.run.status}
                  </dd>
                  <dt>Session</dt>
                  <dd>{detail.session?.id ?? "Unavailable"}</dd>
                  <dt>Trace</dt>
                  <dd>{detail.trace?.id ?? "Unavailable"}</dd>
                  <dt>Recorded scope</dt>
                  <dd>{data.clock}</dd>
                </dl>
              ) : (
                <p>No record content; select an admitted fixture task.</p>
              )}
            </DetailSection>
          </CollapsibleSection>
          <div className="gallery-controls">
            <Button
              variant="outline"
              disabled={!detail || !data.editable}
              onClick={() => open("form")}
            >
              Review note form
            </Button>
            <Button
              variant="outline"
              disabled={!detail || !data.editable}
              onClick={() => open("confirm")}
            >
              Review confirmation
            </Button>
            <label>
              Scripted outcome{" "}
              <select
                aria-label="Gallery scripted outcome"
                value={outcome}
                onChange={(e) => {
                  retire()
                  setOutcome(e.target.value)
                }}
              >
                <option value="inspect">inspect only</option>
                <option value="refuse">refuse locally</option>
              </select>
            </label>
          </div>
          {result && (
            <Callout
              tone={result.startsWith("Scripted refusal") ? "danger" : "info"}
              title="Local inspection result"
            >
              <p role="status">{result}</p>
            </Callout>
          )}
        </div>
      </Panel>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open) close("confirm")
        }}
        title="Review archive intent"
        description={
          <span>
            {detail?.task.id ?? "Unavailable"} · presentation only, no archive.{" "}
            {busy.confirm
              ? "Held scripted outcome; Escape cancels this presentation."
              : "Confirmation inspects a local intent."}
            <span className="gallery-dialog-controls">
              <Button type="button" variant="outline" disabled={!busy.confirm} onClick={release}>
                Release oldest scripted outcome
              </Button>
              <Button type="button" variant="ghost" onClick={reset}>
                Reset gallery context
              </Button>
            </span>
            {result && <span role="status">{result}</span>}
          </span>
        }
        onConfirm={() => request("confirm")}
        confirmLabel="Inspect archive intent"
        destructive
        busy={busy.confirm}
      />
      <FormDialog
        open={formOpen}
        onClose={() => close("form")}
        title="Review local note"
        description={`${detail?.task.id ?? "Unavailable"} · transient draft, never saved`}
        onSubmit={() => request("form")}
        submitLabel="Inspect note intent"
        submitDisabled={!data.editable || !detail || !draft.trim()}
        submitting={busy.form}
      >
        <DetailSection title="Local draft">
          <label htmlFor={noteId}>Review note</label>
          <textarea
            id={noteId}
            aria-label="Primitive review note"
            value={draft}
            maxLength={2000}
            onChange={(e) => {
              retire()
              current.current.draft = e.target.value
              setDraft(e.target.value)
            }}
            placeholder="Write a transient fixture note…"
          />
          <p className="muted">
            Editing retires a held previous outcome. Native submit is guarded even when
            disabled/busy.
          </p>
        </DetailSection>
        {busy.form && <p role="status">Held note inspection; no network request.</p>}
        {result && (
          <Callout tone="danger" title="Inspection result">
            <p role="status">{result}</p>
          </Callout>
        )}
        <div className="gallery-controls">
          <Button type="button" variant="outline" disabled={!busy.form} onClick={release}>
            Release oldest scripted outcome
          </Button>
          <Button type="button" variant="ghost" onClick={reset}>
            Reset gallery context
          </Button>
        </div>
      </FormDialog>
    </>
  )
}
