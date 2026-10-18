import { Button, CopyableId, DetailDialog, EmptyState } from "@hollis-labs/design-components"
import { DashboardField, DashboardToolbar } from "@hollis-labs/kit-dashboard/layout"
import { applyTheme, PageHeader } from "@hollis-labs/kit-dashboard/ui"
import { useEffect, useRef, useState } from "react"
import { TorqueOperationsBoard } from "../examples/torque/Operations"
import { initialTorqueState } from "../examples/torque/routes"
import { OverviewPage } from "../tether-sysop/OverviewPage"
import { CapturedAgents } from "./Agents"
import { CapturedBuilder } from "./Builder"
import { type Capture, capturedBoard } from "./model"
import { CapturedPlanner } from "./Planner"
import { CapturedSessions } from "./Sessions"
import { CapturedTaskDetails } from "./TaskDetails"
import "../examples/torque/operations.css"
import "./snapshots.css"

type View = "torque" | "tether" | "sessions" | "planner" | "agents" | "builder"
function capturedView(value: string | null): View {
  return value === "tether" ||
    value === "sessions" ||
    value === "planner" ||
    value === "agents" ||
    value === "builder"
    ? value
    : "torque"
}
export function SnapshotReview() {
  const [capture, setCapture] = useState<Capture | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>(() => {
    const value = new URLSearchParams(location.search).get("source")
    return capturedView(value)
  })
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const theme = params.get("theme") ?? "p4-white"
    applyTheme(theme as Parameters<typeof applyTheme>[0])
    const mode = params.get("mode") === "light" ? "light" : "dark"
    document.documentElement.dataset.mode = mode
    document.documentElement.classList.toggle("dark", mode === "dark")
    document.documentElement.classList.toggle("light", mode === "light")
    document.documentElement.style.colorScheme = mode
    const abort = new AbortController()
    fetch("/api/snapshots/current", { signal: abort.signal })
      .then(async (r) => {
        if (!r.ok) throw Error(`Snapshot load failed (${r.status})`)
        return r.json()
      })
      .then((data) => {
        if (abort.signal.aborted) return
        if (data.version !== "parallax-capture/v1") throw Error("Unsupported snapshot version")
        if (data.id && data.sources) setCapture(data)
      })
      .catch((e) => {
        if (!abort.signal.aborted) setError(e.message)
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false)
      })
    return () => abort.abort()
  }, [])
  useEffect(() => {
    const pop = () => {
      const source = new URLSearchParams(location.search).get("source")
      setView(capturedView(source))
      setRevision((n) => n + 1)
    }
    addEventListener("popstate", pop)
    return () => removeEventListener("popstate", pop)
  }, [])
  function change(next: View) {
    setView(next)
    setRevision((n) => n + 1)
    const url = new URL(location.href)
    url.searchParams.set("source", next)
    url.searchParams.delete("task")
    history.pushState({}, "", url)
  }
  function reset() {
    const url = new URL(location.href)
    url.searchParams.delete("task")
    history.replaceState({}, "", url)
    setRevision((n) => n + 1)
  }
  return (
    <main className="snapshot-review torque-example">
      <PageHeader title="App snapshots">
        <Button variant="outline" onClick={() => location.assign("/?view=Review+Workbench")}>
          Back to Parallax
        </Button>
      </PageHeader>
      <div className="dash-page-content dash-section-stack">
        <DashboardToolbar>
          <DashboardField label="Captured view">
            <select
              aria-label="Captured view"
              value={view}
              onChange={(e) => change(e.target.value as View)}
            >
              <option value="torque">Torque · task board</option>
              <option value="tether">Tether · overview</option>
              <option value="sessions">Tether · sessions</option>
              <option value="planner">Tachyon · Planner (Torque data)</option>
              <option value="agents">Tachyon · Agents</option>
              <option value="builder">Tachyon · Builder</option>
            </select>
          </DashboardField>
          <Button variant="outline" onClick={reset}>
            Reset review
          </Button>
          {(view === "torque" || view === "tether" || view === "sessions") && (
            <a href={view === "torque" ? "/?example=torque&screen=tasks" : "/?example=tether"}>
              Authored scenarios
            </a>
          )}
        </DashboardToolbar>
        {loading ? (
          <p role="status">Loading captured data…</p>
        ) : error ? (
          <p role="alert">{error}</p>
        ) : !capture ? (
          <EmptyState
            variant="empty"
            title="No captured data installed"
            description="Capture Torque and Tether responses, then rebuild this preview."
          />
        ) : (
          <>
            <p className="snapshot-provenance">
              {(view === "agents" || view === "builder") && capture.sources.console ? (
                <>
                  Captured console slice: {capture.sources.console.fleet.items.length} activity
                  identities, {capture.sources.console.agents.items.length} agent definitions,{" "}
                  {capture.sources.console.launches.items.length} launch profiles, and{" "}
                  {capture.sources.console.teams.items.length} saved team versions. Each source has
                  its own capture time.
                </>
              ) : (
                <>
                  Captured slice: {capture.sources.torque.tasks.items.length} Torque tasks and{" "}
                  {capture.sources.tether.sessions.items.length} Tether sessions. Board counts and
                  filters cover this slice; Tether overview retains its captured source totals.
                </>
              )}
            </p>
            <details className="snapshot-provenance">
              <summary>
                Snapshot {capture.id} · {capture.capturedAt} · read-only
              </summary>
              <p>{capture.projection}</p>
              <p>
                Torque: {capture.sources.torque.tasks.items.length} captured task rows.{" "}
                {capture.sources.torque.tasks.meta.has_more
                  ? "More source records exist; filters and counts apply only to this slice."
                  : "Counts and filters apply to captured rows."}
              </p>
              <p>
                Tether sessions: {capture.sources.tether.sessions.items.length} captured rows; the
                overview has its own source totals.
              </p>
              <ul>
                {[
                  capture.sources.torque.tasks,
                  capture.sources.tether.overview,
                  capture.sources.tether.sessions,
                  ...(capture.sources.console
                    ? [
                        capture.sources.console.agents,
                        capture.sources.console.launches,
                        capture.sources.console.teams,
                        capture.sources.console.fleet,
                        capture.sources.console.fleet.roster,
                      ]
                    : []),
                ].map((r) => (
                  <li key={r.path}>
                    {r.path} · {r.capturedAt}
                  </li>
                ))}
              </ul>
            </details>
            <section key={`${capture.id}/${view}/${revision}`} className="snapshot-content">
              {view === "torque" ? (
                <CapturedTorque capture={capture} />
              ) : view === "tether" ? (
                <OverviewPage
                  initialData={capture.sources.tether.overview.body}
                  api={{ getOverview: async () => capture.sources.tether.overview.body }}
                  showVariantSelector={false}
                  showIdentityLinks={false}
                />
              ) : view === "agents" || view === "builder" ? (
                capture.sources.console ? (
                  view === "agents" ? (
                    <CapturedAgents data={capture.sources.console} onReset={reset} />
                  ) : (
                    <CapturedBuilder data={capture.sources.console} onReset={reset} />
                  )
                ) : (
                  <EmptyState
                    title="No console capture installed"
                    description="Capture the current Agents and Builder inputs to review these pages."
                    variant="empty"
                  />
                )
              ) : view === "planner" ? (
                capture.sources.torque.planner ? (
                  <CapturedPlanner data={capture.sources.torque.planner} onReset={reset} />
                ) : (
                  <EmptyState
                    title="No Planner capture installed"
                    description="Extend this snapshot with the Planner capture script."
                    variant="empty"
                  />
                )
              ) : (
                <CapturedSessions capture={capture} onReset={reset} />
              )}
            </section>
          </>
        )}
      </div>
    </main>
  )
}
function CapturedTorque({ capture }: { capture: Capture }) {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string | null>(
    new URLSearchParams(location.search).get("task"),
  )
  const anchor = useRef<HTMLInputElement>(null)
  const rows = capturedBoard(capture).filter((r) =>
    `${r.task.id} ${r.task.title}`.toLowerCase().includes(query.toLowerCase()),
  )
  const task = capture.sources.torque.tasks.items.find((t) => t.id === selected)
  function select(id: string | null) {
    setSelected(id)
    const url = new URL(location.href)
    if (id) url.searchParams.set("task", id)
    else url.searchParams.delete("task")
    history.replaceState({}, "", url)
  }
  const state = {
    ...initialTorqueState(new URLSearchParams()),
    query,
    selected,
    cutoff: capture.sources.torque.tasks.capturedAt,
  }
  return (
    <>
      <TorqueOperationsBoard
        rows={rows}
        accessible
        state={state}
        onQuery={(value) => {
          setQuery(value)
          select(null)
        }}
        onSelect={select}
        onCursor={() => {}}
        anchorRef={anchor}
        captured
        sourceLabel="Captured Torque tasks"
        rowHref={(id) => `/?example=snapshots&source=torque&task=${encodeURIComponent(id)}`}
      />
      <DetailDialog
        open={!!task}
        onClose={() => select(null)}
        title={task?.title ?? "Captured task"}
        meta={task && <CopyableId id={task.id} label={task.id} />}
        showFullscreenToggle
        footer={
          <Button variant="outline" onClick={() => select(null)}>
            Close task
          </Button>
        }
      >
        {task && <CapturedTaskDetails task={task} capture={capture} />}
      </DetailDialog>
    </>
  )
}
