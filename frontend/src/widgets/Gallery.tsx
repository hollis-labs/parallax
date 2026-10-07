import {
  Button,
  Callout,
  DetailDialog,
  JsonViewer,
  MetaList,
  Metric,
} from "@hollis-labs/design-components"
import {
  DonutChart,
  MiniTrend,
  Panel,
  RecentList,
  SignalBars,
  Sparkbars,
} from "@hollis-labs/kit-dashboard/widgets"
import { type CSSProperties, type MutableRefObject, useEffect, useRef, useState } from "react"
import type { OperationsModel } from "../operations/model"
import { type WidgetState, widgetModel, widgetStates } from "./model"
export function WidgetGallery({
  model,
  initialState = "recorded",
}: {
  model: OperationsModel
  initialState?: WidgetState
}) {
  const [state, setState] = useState(initialState),
    [layout, setLayout] = useState("grid"),
    [revision, setRevision] = useState(0)
  const controls = useRef<HTMLSelectElement>(null),
    retire = useRef<() => void>(() => {})
  const source = `${model.dataset.version}/${model.dataset.profile}/${model.scenario}/${model.referenceClock}`
  function reset() {
    retire.current()
    setRevision((n) => n + 1)
    controls.current?.focus()
  }
  return (
    <section className="widget-gallery" aria-label="Controlled widgets gallery">
      <div className="gallery-controls">
        <label>
          Widget state{" "}
          <select
            ref={controls}
            aria-label="Widget state"
            value={state}
            onChange={(e) => {
              setState(e.target.value as WidgetState)
              reset()
            }}
          >
            {widgetStates.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Widget layout{" "}
          <select
            aria-label="Widget layout"
            value={layout}
            onChange={(e) => setLayout(e.target.value)}
          >
            <option>grid</option>
            <option>stack</option>
          </select>
        </label>
        <Button variant="outline" onClick={reset}>
          Reset widget inspection
        </Button>
      </div>
      <GalleryInstance
        key={`${source}/${model.cutoff}/${state}/${revision}`}
        model={model}
        state={state}
        layout={layout}
        retireRef={retire}
        reset={reset}
      />
    </section>
  )
}
function GalleryInstance({
  model,
  state,
  layout,
  retireRef,
  reset,
}: {
  model: OperationsModel
  state: WidgetState
  layout: string
  retireRef: MutableRefObject<() => void>
  reset: () => void
}) {
  const data = widgetModel(model, state),
    [selection, setSelection] = useState<string | null>(null),
    [open, setOpen] = useState(false)
  const context = `${data.source}/${data.cutoff}/${state}`,
    current = useRef({ alive: false, context, open: false, lease: 0 }),
    origin = useRef<HTMLButtonElement | null>(null),
    focusFrame = useRef<number | null>(null)
  current.current.context = context
  const row = data.runs.find((r) => r.id === selection),
    captured = context,
    capturedLease = current.current.lease
  function cancelFocus() {
    if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current)
    focusFrame.current = null
  }
  useEffect(() => {
    current.current.alive = true
    const stop = () => {
      current.current.alive = false
      current.current.lease++
      current.current.open = false
      if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current)
      focusFrame.current = null
    }
    retireRef.current = stop
    return () => {
      stop()
      if (retireRef.current === stop) retireRef.current = () => {}
    }
  }, [retireRef])
  useEffect(() => {
    if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current)
    focusFrame.current = null
    if (!row) {
      current.current.open = false
      setOpen(false)
      setSelection(null)
    }
  }, [row])
  function select(id: string) {
    if (
      !current.current.alive ||
      current.current.context !== captured ||
      current.current.lease !== capturedLease ||
      !data.runs.some((r) => r.id === id)
    )
      return
    cancelFocus()
    current.current.lease++
    origin.current =
      document.activeElement instanceof HTMLButtonElement ? document.activeElement : null
    current.current.open = true
    setSelection(id)
    setOpen(true)
  }
  function close() {
    if (
      !current.current.alive ||
      current.current.context !== captured ||
      current.current.lease !== capturedLease ||
      !current.current.open
    )
      return
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
        current.current.context === captured &&
        current.current.lease === lease &&
        !current.current.open &&
        origin.current === target &&
        target?.isConnected
      )
        target.focus()
    })
  }
  const geometry = { "--widget-bucket-count": Math.max(1, data.totals.length) } as CSSProperties
  return (
    <>
      <p className="muted">
        Unfiltered {model.dataset.version}/{model.dataset.profile} evidence prefix through{" "}
        <span data-testid="widget-cutoff">{data.cutoff}</span>. Run-start receipts in fixed UTC
        window {data.from}–{data.until};150s buckets. No live collection or complete-consumption
        claim.
      </p>
      <div role={state === "error" ? "alert" : "status"}>
        <Callout
          title="Widget evidence policy"
          tone={
            data.blocked
              ? state === "error"
                ? "danger"
                : "warning"
              : data.unknown
                ? "neutral"
                : "info"
          }
        >
          {data.blocked
            ? "Observation unavailable; previous counts, charts and selected records withheld."
            : data.unknown
              ? "Unknown authored presentation classification; series/distribution unavailable, recorded recent identities remain inspectable."
              : data.empty
                ? "Empty supplied index/API appearance: zero supplied records, no supplied series; not a claim about source collection coverage."
                : state === "observed-zero"
                  ? "Real last-five-minute source interval with zero admitted run starts when covered; future interval remains unavailable."
                  : state === "gapped"
                    ? "Authored missing-observation appearance at bucket3; numeric-only widgets withheld rather than compressing an interior gap."
                    : "Only admitted run-start/finish evidence is counted. Task completion is a separate event; no finish observed does not mean running."}
        </Callout>
      </div>
      <div className="widget-metrics">
        <Metric
          label="Admitted window run starts"
          value={data.count ?? "Unavailable"}
          hint={`${data.from}–${data.until}; prefix only`}
          accent="info"
        />
        <Metric
          label="Recorded finished-run elapsed"
          value={data.seconds === null ? "Unavailable" : `${data.seconds} s`}
          hint={`${data.finishedCount ?? "Unavailable"} runs with observed finish; active/unobserved elapsed excluded`}
          accent="success"
        />
      </div>
      <div className={`widgets-grid ${layout === "stack" ? "widgets-stack" : ""}`}>
        <Panel title="Sparkbars and MiniTrend" icon={null}>
          <div className="example-body">
            <p>
              Run-start count per admitted UTC bucket. Six normalized decorative rows; exact values
              below.
            </p>
            {data.chartAllowed ? (
              <>
                <div className="widgets-spark-host" style={geometry} data-testid="widget-spark">
                  <Sparkbars data={data.totals} />
                </div>
                <div className="widgets-mini-host" style={geometry} data-testid="widget-mini">
                  <MiniTrend
                    label="Recorded starts"
                    value={`${data.totals.reduce((s, n) => s + n, 0)} starts / ${data.totals.length} buckets`}
                    data={data.totals}
                  />
                </div>
              </>
            ) : (
              <p>Numeric series unavailable; no missing observation is filled with zero.</p>
            )}
            <p className="muted">
              Token-constrained host width preserves square-cell row geometry; upstream source
              unchanged.
            </p>
          </div>
        </Panel>
        <Panel title="SignalBars" icon={null}>
          <div className="example-body">
            <p>
              Same-unit disjoint run-start classes: finish observed / no finish observed. Two
              decorative columns per bucket; never double event counts.
            </p>
            <p>
              Actual observed peak:{" "}
              <strong data-testid="widget-actual-peak">{data.peak ?? "Unavailable"}</strong> starts.
              Shared scale floor: {data.scaleFloor ?? "Unavailable"}; built-in “peak” uses minimum1
              even when actual peak0.
            </p>
            {data.chartAllowed ? (
              <div className="widgets-signal-host" style={geometry} data-testid="widget-signal">
                <SignalBars
                  data={data.primary}
                  secondaryData={data.secondary}
                  primaryLabel="Finish observed"
                  secondaryLabel="No finish observed"
                />
              </div>
            ) : (
              <p>Aligned numeric series unavailable.</p>
            )}
          </div>
        </Panel>
        <Panel title="DonutChart" icon={null}>
          <div className="example-body">
            <p>
              Admitted window run status distribution. Denominator: {data.count ?? "Unavailable"}{" "}
              recorded run starts; run state differs from task state. Individual rounded percentages
              may not total100.
            </p>
            {data.count !== null ? (
              <DonutChart
                segments={data.segments}
                title="Recorded run status"
                centerLabel="admitted runs"
                size={120}
              />
            ) : (
              <p>Distribution unavailable; missing is not zero.</p>
            )}
            {data.count === 0 && (
              <p>
                Known zero supplied/admitted runs; shared “No data recorded” is an empty appearance,
                not unavailable telemetry.
              </p>
            )}
          </div>
        </Panel>
        <Panel title="RecentList" icon={null}>
          <div className="example-body">
            <p>
              Caller-sorted start UTC descending, stable ID tie-break; at most5 rows. Keyboard
              selection opens read-only admitted record.
            </p>
            <RecentList
              items={data.recent}
              getKey={(r) => r.id}
              title="Latest admitted window runs"
              limit={5}
              emptyLabel={data.blocked ? "Recent records unavailable" : "No admitted window runs"}
              onSelect={(r) => select(r.id)}
              renderItem={(r) => (
                <span className="widget-recent-row">
                  <strong>
                    {r.id} · {r.status}
                  </strong>
                  <span>
                    {r.started} · {r.taskId}
                  </span>
                  {state === "long" && (
                    <span>
                      Authored display annotation:{" "}
                      {"bounded contextual review of the same immutable run record across regional environments. ".repeat(
                        4,
                      )}
                    </span>
                  )}
                </span>
              )}
            />
          </div>
        </Panel>
      </div>
      <details className="widget-bucket-evidence" open>
        <summary>Exact UTC bucket evidence and accessibility equivalent</summary>
        <p>
          Left-closed/right-open buckets; final reference-clock boundary included. Partial means
          evidence only through cutoff; unavailable cells remain unavailable. No bucket positions
          are compressed.
        </p>
        <div className="widget-table-scroll">
          <table>
            <caption>Recorded run-start bucket counts (unit: runs)</caption>
            <thead>
              <tr>
                <th scope="col">UTC interval</th>
                <th scope="col">Coverage</th>
                <th scope="col">Starts</th>
                <th scope="col">Finish observed</th>
                <th scope="col">No finish observed</th>
              </tr>
            </thead>
            <tbody>
              {data.bins.map((b) => (
                <tr key={b.index}>
                  <th scope="row">
                    {b.index + 1}: {b.from}–{b.until}
                  </th>
                  <td>
                    {!b.known
                      ? "Unavailable"
                      : b.partial
                        ? `Partial through ${data.cutoff}`
                        : "Covered"}
                  </td>
                  <td>{b.total ?? "Unavailable"}</td>
                  <td>{b.finished ?? "Unavailable"}</td>
                  <td>{b.noFinish ?? "Unavailable"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!data.bins.length && <p>No supplied bucket samples.</p>}
      </details>
      <DetailDialog
        open={open && !!row}
        onClose={close}
        title={`Widget run inspection ${row?.id ?? "unavailable"}`}
        meta={<span>{data.cutoff} · recorded prefix, no execution</span>}
        footer={
          <div className="gallery-controls">
            <Button variant="outline" onClick={close}>
              Close widget record
            </Button>
            <Button variant="ghost" onClick={reset}>
              Reset widget context
            </Button>
          </div>
        }
      >
        <div className="example-body">
          {row && (
            <>
              <MetaList
                columns={1}
                items={[
                  { label: "Related task", value: row.taskId },
                  { label: "Trace", value: row.traceId },
                  { label: "Start UTC", value: row.started },
                  { label: "Finish UTC", value: row.finished ?? "Not observed through cutoff" },
                ]}
              />
              <JsonViewer value={row} className="evidence-json" />
            </>
          )}
        </div>
      </DetailDialog>
    </>
  )
}
