import {
  Button,
  Callout,
  DetailDialog,
  EmptyState,
  JsonViewer,
  MetaList,
} from "@hollis-labs/design-components"
import { HealthSummary, ObservationStatus, StatCollection } from "@hollis-labs/kit-observe"
import { SampleSeriesView } from "@hollis-labs/kit-observe/charts"
import { type MutableRefObject, useEffect, useRef, useState } from "react"
import {
  type AdminPresentationTicket,
  createAdminPresentationSession,
} from "../chimera/admin-session"
import {
  type HealthAppearance,
  healthAppearances,
  type ObservationAppearance,
  type ObservationReviewModel,
  observationAppearances,
  observationCandidate,
  observationReviewModel,
  type ReviewClock,
  type ReviewedResource,
  reviewClocks,
  reviewedResources,
} from "./model"
export function ObservationReview({
  context = "populated",
  initialState = "recorded",
  initialResource = "health",
  initialClock = "reference",
  initialHealth = "derived",
}: {
  context?: string
  initialState?: ObservationAppearance
  initialResource?: ReviewedResource
  initialClock?: ReviewClock
  initialHealth?: HealthAppearance
}) {
  const [state, setState] = useState(initialState),
    [resource, setResource] = useState(initialResource),
    [clock, setClock] = useState(initialClock),
    [health, setHealth] = useState(initialHealth),
    [copy, setCopy] = useState(false),
    [revision, setRevision] = useState(0),
    [queued, setQueued] = useState(0)
  const retire = useRef(() => {}),
    queue = useRef<(() => void)[]>([])
  const data = observationReviewModel(state, context, resource, clock, health, copy)
  function reset() {
    retire.current()
    setRevision((n) => n + 1)
  }
  function release() {
    queue.current.shift()?.()
    setQueued(queue.current.length)
  }
  return (
    <section className="observation-review" aria-label="Controlled observation review">
      <div className="gallery-controls">
        <label>
          Observation appearance{" "}
          <select
            aria-label="Observation appearance"
            value={state}
            onChange={(e) => {
              setState(e.target.value as ObservationAppearance)
              reset()
            }}
          >
            {observationAppearances.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Reviewed resource{" "}
          <select
            aria-label="Reviewed resource"
            value={resource}
            onChange={(e) => {
              setResource(e.target.value as ReviewedResource)
              reset()
            }}
          >
            {reviewedResources.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label>
          Review clock{" "}
          <select
            aria-label="Review clock"
            value={clock}
            onChange={(e) => {
              setClock(e.target.value as ReviewClock)
              reset()
            }}
          >
            {reviewClocks.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Health appearance{" "}
          <select
            aria-label="Health appearance"
            value={health}
            onChange={(e) => {
              setHealth(e.target.value as HealthAppearance)
              reset()
            }}
          >
            {healthAppearances.map((h) => (
              <option key={h}>{h}</option>
            ))}
          </select>
        </label>
        <label>
          Reviewed observation source{" "}
          <select
            aria-label="Reviewed observation source"
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
          Reset observation review
        </Button>
        <Button variant="outline" disabled={!queued} onClick={release}>
          Release oldest scripted inspection ({queued})
        </Button>
      </div>
      <Callout tone="info" title="Read-only evidence review">
        Retry only inspects a finite local candidate intent; no request, polling, telemetry, new
        receipt or successful outcome occurs. Review clock changes receipt freshness only. The
        record cutoff remains the fixed snapshot; health appearance and data withholding are
        explicitly controlled examples.
      </Callout>
      <p className="muted">
        Unfiltered full snapshot {data.fixture.version} + {data.operations.version} at record cutoff{" "}
        {data.operations.clock}; operations playback paused. Selected resource overrides do not
        retimestamp other receipts.
      </p>
      <Instance
        key={`${data.source}/${state}/${revision}`}
        data={data}
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
  retireRef,
  enqueue,
  release,
  reset,
}: {
  data: ObservationReviewModel
  retireRef: MutableRefObject<() => void>
  enqueue: (producer: () => void) => void
  release: () => void
  reset: () => void
}) {
  const [plan, setPlan] = useState<ReturnType<typeof observationCandidate>>(null),
    [result, setResult] = useState(""),
    [, rerender] = useState(0)
  const source = `${data.source}/${data.state}`,
    current = useRef({
      alive: false,
      lease: 0,
      source,
      plan: null as ReturnType<typeof observationCandidate>,
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
    const active = createAdminPresentationSession(
      source,
      source,
      reviewedResources.map((r) => `retry-${r}`),
    )
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
  function inspect(resourceId: string) {
    if (!admitted() || current.current.plan) return
    const candidate = observationCandidate(data, resourceId)
    if (!candidate) return
    cancelFocus()
    origin.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    current.current.lease++
    const lease = current.current.lease
    current.current.plan = candidate
    setPlan(candidate)
    setResult("Held local retry inspection. No fetch or new observation.")
    const active = session.current?.begin(`retry-${resourceId}`)
    if (!active) return
    ticket.current = active
    enqueue(() => {
      const fresh = observationCandidate(data, resourceId)
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
          "Retry candidate inspected locally. Successful receipt time, source values and availability unchanged.",
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
  const observe = (id: string) => ({
    ...data.observations[id],
    onRetry: data.editable ? () => inspect(id) : undefined,
  })
  const seriesId = data.resourceId === "duration-series" ? "duration-series" : "token-series"
  return (
    <>
      <p data-testid="observation-review-source" className="muted">
        Source: {data.source}. Fixture receipt anchor {data.selected.observedAt}; displayed
        successful receipt {data.observations[data.resourceId].observedAt ?? "none (withheld)"};
        review clock{" "}
        {Number.isFinite(data.observations[data.resourceId].nowMs)
          ? new Date(data.observations[data.resourceId].nowMs).toISOString()
          : "invalid controlled clock"}
        . Freshness threshold {data.observations[data.resourceId].staleAfterMs}ms; equality is
        fresh, greater age is stale.
      </p>
      {!data.accessible ? (
        <EmptyState
          variant="error"
          title="Observation evidence withheld"
          description="Denied policy; no observation payload, health/stat rows or chart mounted."
        />
      ) : (
        <>
          <ObservationStatus label="Selected receipt" observation={observe(data.resourceId)}>
            <MetaList
              items={[
                { label: "Resource", value: data.resourceId },
                { label: "Receipt source", value: data.selected.source },
                { label: "Record cutoff (separate)", value: data.operations.clock },
              ]}
            />
            <p data-testid="retained-observation">
              Retained supplied evidence is independent of refreshing/error/stale/invalid-clock
              presentation. No new success is fabricated.
            </p>
          </ObservationStatus>
          <div className="admin-columns">
            <HealthSummary
              label="Snapshot health appearance"
              status={data.health}
              checks={data.checks}
              observation={observe("health")}
            />
            <StatCollection
              label="Fixed receipt and missing samples"
              rows={data.stats.map((row) => ({ ...row, observation: observe("stats") }))}
            />
          </div>
          <p className="muted">
            Exact source UTC samples; cumulative counters are not rates. The shared x axis shows
            time-of-day; complete dates and nullable values appear in its accessible table. Gap
            appearance withholds one existing sample without changing the source; nonfinite
            appearance is confined to a labelled invalid stat, never fed to chart coordinates.
            Bounds are host-enforced; kit bounds text is metadata.
          </p>
          <SampleSeriesView {...data.series} observation={observe(seriesId)} />
          <p data-testid="sample-host-bounds" className="muted">
            Host admitted {data.series.points.length} ordered unique finite-timestamp samples inside{" "}
            {data.series.requested.from}–{data.series.requested.to}; limit{" "}
            {data.series.requested.limit}, max {data.series.bounds.maxPoints} points /{" "}
            {data.series.bounds.maxWindowSeconds}s. Source points and receipt timestamps remain
            unchanged.
          </p>
        </>
      )}
      <DetailDialog
        open={plan !== null}
        onClose={close}
        title="Local observation retry candidate"
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
              Reset observation review
            </Button>
          </div>
        }
      >
        <div className="settings-plan-body">
          <MetaList
            items={[
              { label: "Source", value: data.source },
              { label: "Fixed record cutoff", value: data.operations.clock },
              {
                label: "Resource/receipt",
                value: `${plan?.resourceId} / ${plan?.receipt ?? "no receipt"}`,
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
