import { Button } from "@hollis-labs/design-components"
import { useEffect, useRef, useState } from "react"
import { createAdminPresentationSession } from "../chimera/admin-session"
import type { ResourceOverride } from "../playback/model"
import { type InspectionState, inspectionModel, inspectionStates, timelineTimes } from "./model"
import { EvidenceViews, LogList, TraceInspection, UsageInspection } from "./Views"
export function ObservationLab({
  onInspect,
  onReset,
  initialState = "normal",
  initialView = "Evidence",
  externalReview,
}: {
  onInspect: (taskId: string) => void
  onReset: () => void
  initialState?: InspectionState
  initialView?: string
  externalReview?: {
    sourceProfile: string
    signal?: AbortSignal
    cutoff: string
    epoch: number
    override: ResourceOverride
    onSeek: (cutoff: string) => void
  }
}) {
  const [state, setState] = useState<InspectionState>(initialState),
    [view, setView] = useState(initialView),
    [query, setQuery] = useState(""),
    [level, setLevel] = useState("all"),
    [localPosition, setLocalPosition] = useState(timelineTimes.length - 1),
    [runId, setRun] = useState<string | null>(null),
    [spanId, setSpan] = useState<string | null>(null)
  const session = useRef<ReturnType<typeof createAdminPresentationSession> | null>(null),
    [held, setHeld] = useState<{ callback: () => void; epoch: number } | null>(null),
    epoch = useRef(0),
    [refreshNote, setRefreshNote] = useState(""),
    [resources, setResources] = useState<Record<string, InspectionState>>({})
  useEffect(() => {
    const active = createAdminPresentationSession("observations/v1", "fixture-snapshot", [
      "health",
      "stats",
      "token-series",
      "duration-series",
      "diagnostics",
    ])
    session.current = active
    return () => {
      active.dispose()
      session.current = null
    }
  }, [])
  function retire(next: InspectionState) {
    epoch.current++
    session.current?.reset("observations/v1", `${next}/${epoch.current}`)
    setState(next)
    setPosition(timelineTimes.length - 1)
    setRun(null)
    setSpan(null)
    setQuery("")
    setLevel("all")
    setRefreshNote("")
    setResources({})
    onReset()
  }
  function resetFilter() {
    setRun(null)
    setSpan(null)
    setPosition(timelineTimes.length - 1)
    epoch.current++
    session.current?.reset("observations/v1", `filter/${epoch.current}`)
    setRefreshNote("")
    setResources({})
    onReset()
  }
  const position = externalReview
    ? Math.max(
        0,
        timelineTimes.reduce((last, t, index) => (t <= externalReview.cutoff ? index : last), -1),
      )
    : localPosition
  function setPosition(next: number) {
    setLocalPosition(next)
    externalReview?.onSeek(timelineTimes[next])
  }
  const externalKey = externalReview
    ? `${externalReview.sourceProfile}/${externalReview.cutoff}/${externalReview.epoch}/${externalReview.override}`
    : "standalone"
  useEffect(() => {
    epoch.current++
    session.current?.reset("observations/v1", externalKey)
    setRun(null)
    setSpan(null)
    setRefreshNote("")
    setResources({})
  }, [externalKey])
  const effectiveState =
    externalReview?.override && externalReview.override !== "scenario"
      ? externalReview.override === "unavailable"
        ? "missing"
        : externalReview.override
      : state
  const retirementSignal = externalReview?.signal
  useEffect(() => {
    const cancel = () => {
      epoch.current++
      session.current?.reset("observations/v1", `retired/${epoch.current}`)
      setRefreshNote("")
      setResources({})
      setRun(null)
      setSpan(null)
    }
    retirementSignal?.addEventListener("abort", cancel, { once: true })
    return () => retirementSignal?.removeEventListener("abort", cancel)
  }, [retirementSignal])
  const model = inspectionModel(
    effectiveState,
    query,
    level,
    externalReview?.cutoff ?? timelineTimes[position],
    resources,
    !!externalReview,
    externalReview?.sourceProfile,
  )
  return (
    <section className="administration-lab observation-lab" aria-label="Observation fixture lab">
      <div className="communication-controls">
        <label>
          Inspection state
          <select
            aria-label="Inspection state"
            value={state}
            onChange={(e) => retire(e.target.value as InspectionState)}
          >
            {inspectionStates.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <span className="muted">
          {model.artifact.version} · generator {model.artifact.generator} · seed{" "}
          {model.artifact.seed} · snapshot clock {model.artifact.clock}
        </span>
      </div>
      {model.outOfCoverage && (
        <p role="status">
          Observation fixture unavailable for this source/cutoff: coverage {model.artifact.from}–
          {model.artifact.clock}; no historical receipt is synthesized.
        </p>
      )}
      {state === "stale" && (
        <p className="muted">
          Freshness review clock: {new Date(model.observations.health.nowMs).toISOString()} · fixed
          scripted +5 minutes; original receipts and samples remain unchanged
        </p>
      )}
      <fieldset className="communication-controls" aria-label="Inspection pages">
        {["Evidence", "Logs", "Traces", "Usage records"].map((v) => (
          <Button key={v} variant={view === v ? "default" : "outline"} onClick={() => setView(v)}>
            {v}
          </Button>
        ))}
      </fieldset>
      <fieldset className="communication-controls">
        <legend>Recorded timeline review · local cutoff, snapshot clock stays fixed</legend>
        <label>
          Timeline position
          <input
            aria-label="Timeline position"
            type="range"
            min={0}
            max={timelineTimes.length - 1}
            value={position}
            onChange={(e) => {
              resetFilter()
              setPosition(Number(e.target.value))
            }}
          />
        </label>
        <time dateTime={model.cutoff}>{model.cutoff}</time>
        <Button
          variant="outline"
          disabled={position === 0}
          onClick={() => {
            resetFilter()
            setPosition(0)
          }}
        >
          Start recorded timeline
        </Button>
        <Button
          variant="outline"
          disabled={position === timelineTimes.length - 1}
          onClick={() => {
            const next = position + 1
            resetFilter()
            setPosition(next)
          }}
        >
          Advance recorded timeline
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            resetFilter()
          }}
        >
          Show all recorded events
        </Button>
      </fieldset>
      <div className="communication-controls">
        <Button
          variant="outline"
          disabled={!model.accessible || held?.epoch === epoch.current}
          onClick={() => {
            const ticket = session.current?.begin("token-series")
            if (!ticket) return
            setResources({ "token-series": "refresh" })
            setRefreshNote("Held series refresh preview; original fixture receipt time retained")
            const capture = epoch.current
            setHeld({
              epoch: capture,
              callback: () => {
                ticket.commit(() => {
                  setResources({ "token-series": "refresh-error" })
                  setRefreshNote("Scripted series refresh failed; retained evidence unchanged")
                })
              },
            })
          }}
        >
          Preview held refresh failure
        </Button>
        {held && (
          <Button
            variant="outline"
            onClick={() => {
              held.callback()
              setHeld(null)
            }}
          >
            {held.epoch === epoch.current
              ? "Release refresh outcome"
              : "Release retired refresh outcome"}
          </Button>
        )}
      </div>
      {refreshNote && (
        <p role="status" className="notice">
          {refreshNote}
        </p>
      )}
      {view === "Evidence" ? (
        <EvidenceViews model={model} />
      ) : view === "Logs" ? (
        <>
          <div className="communication-controls">
            <label>
              Log search
              <input
                aria-label="Log search"
                value={query}
                onChange={(e) => {
                  resetFilter()
                  setQuery(e.target.value)
                }}
              />
            </label>
            <label>
              Log level
              <select
                aria-label="Log level"
                value={level}
                onChange={(e) => {
                  resetFilter()
                  setLevel(e.target.value)
                }}
              >
                <option value="all">All levels</option>
                <option value="info">Info</option>
                <option value="error">Error</option>
              </select>
            </label>
          </div>
          <LogList
            model={model}
            onSelect={(run, span) => {
              setRun(run)
              setSpan(span)
              setView("Traces")
            }}
          />
        </>
      ) : view === "Traces" ? (
        <TraceInspection
          model={model}
          runId={runId}
          spanId={spanId}
          onRun={(id) => {
            setRun(id)
            setSpan(null)
            onReset()
          }}
          onSpan={(id) => {
            setSpan(id)
            onReset()
          }}
          onInspect={onInspect}
        />
      ) : (
        <UsageInspection
          model={model}
          onSelect={(id) => {
            setRun(id)
            setSpan(null)
            setView("Traces")
          }}
        />
      )}
      <p className="muted">
        Logs/traces are app-owned compositions joining existing run/span/tool/usage IDs. Playback
        only reveals authored records through the selected UTC cutoff; it collects nothing.
      </p>
    </section>
  )
}
