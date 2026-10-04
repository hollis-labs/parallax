import { AppShell, Button, DetailDialog, EmptyState } from "@hollis-labs/design-components"
import {
  applyTheme,
  NavRail,
  PageHeader,
  StatusBadge,
  SummaryCards,
} from "@hollis-labs/kit-dashboard"
import { Panel, Sparkbars } from "@hollis-labs/kit-dashboard/widgets"
import {
  PluginHostProvider,
  PluginPanelBody,
  usePluginSlots,
  WidgetRenderer,
} from "@hollis-labs/plugin-host-ui/react"
import { Activity, Compass, Gauge, Layers, Play, RotateCcw, X } from "lucide-react"
import { useEffect, useState } from "react"
import { createOperationsExample } from "./chimera/example"
import { FixedActivity } from "./FixedActivity"
import fixture from "./fixtures/operations.json"

type Task = (typeof fixture.tasks)[number]
const pluginHost = createOperationsExample(() => {})
function PluginContribution() {
  const widgets = usePluginSlots("operations.summary"),
    panels = usePluginSlots("operations.detail")
  const [open, setOpen] = useState(false)
  const [unloaded, setUnloaded] = useState(false)
  return (
    <div>
      <section aria-label="Plugin widget">
        {widgets.length ? (
          widgets.map((w) => <WidgetRenderer key={w.id} widget={w} />)
        ) : (
          <p className="p-4 text-sm text-fg-muted">
            {unloaded
              ? "Plugin unavailable after explicit unload."
              : "Loading reviewed contribution…"}
          </p>
        )}
      </section>
      <div className="p-4">
        <Button variant="outline" onClick={() => setOpen(true)} disabled={!panels.length}>
          Inspect plugin detail
        </Button>
      </div>
      <DetailDialog open={open} onClose={() => setOpen(false)} title="Plugin detail">
        {panels.map((p) => (
          <PluginPanelBody key={p.id} panel={p} />
        ))}
      </DetailDialog>
      <div className="p-4">
        <Button
          variant="ghost"
          disabled={unloaded}
          onClick={() => {
            setUnloaded(true)
            void pluginHost.registry.unload("ops")
          }}
        >
          Unload fixture plugin
        </Button>
      </div>
    </div>
  )
}
export function App() {
  useEffect(() => {
    const abort = new AbortController()
    void pluginHost.load(undefined, abort.signal).catch((err) => {
      if (!abort.signal.aborted) console.error(err)
    })
    return () => abort.abort()
  }, [])
  const [page, setPage] = useState(new URLSearchParams(location.search).get("view") ?? "Activity"),
    [scenario, setScenario] = useState(
      new URLSearchParams(location.search).get("scenario") ?? "populated",
    ),
    [theme, setTheme] = useState(new URLSearchParams(location.search).get("theme") ?? "p4-white"),
    [mode, setMode] = useState(new URLSearchParams(location.search).get("mode") ?? "dark"),
    [viewport, setViewport] = useState(
      new URLSearchParams(location.search).get("viewport") ?? "full",
    ),
    [tick, setTick] = useState(0),
    [playing, setPlaying] = useState(false),
    [selected, setSelected] = useState<Task | null>(null),
    [query, setQuery] = useState(""),
    [intent, setIntent] = useState(""),
    [draft, setDraft] = useState("")
  useEffect(() => {
    applyTheme(theme as Parameters<typeof applyTheme>[0])
    document.documentElement.setAttribute("data-mode", mode)
  }, [theme, mode])
  useEffect(() => {
    if (!playing) return
    const timer = setInterval(() => setTick((t) => Math.min(t + 1, 6)), 1000)
    return () => clearInterval(timer)
  }, [playing])
  useEffect(() => {
    if (tick === 6) setPlaying(false)
  }, [tick])
  useEffect(() => {
    setSelected(null)
    setIntent("")
    setDraft("")
    setQuery("")
    setTick(0)
    setPlaying(false)
  }, [])
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelected(null)
        setIntent("")
      }
    }
    window.addEventListener("keydown", close)
    return () => window.removeEventListener("keydown", close)
  }, [])
  useEffect(() => {
    const params = new URLSearchParams({ view: page, scenario, theme, mode, viewport })
    history.replaceState(null, "", `?${params}`)
  }, [page, scenario, theme, mode, viewport])
  const tasks = (
    scenario === "empty"
      ? []
      : scenario === "large"
        ? Array.from({ length: 80 }, (_, i) => ({
            ...fixture.tasks[i % 8],
            id: `TASK-${(i % 8) + 1}-projection-${i + 1}`,
          }))
        : fixture.tasks
  )
    .map((t, i) => ({
      ...t,
      owner: scenario === "missing-metadata" ? "Not provided" : t.owner,
      title:
        scenario === "long-labels"
          ? t.title +
            " across the distributed platform and all regional environments with extended descriptive context"
          : t.title,
      status: scenario === "unknown-status" && i === 0 ? "external-review" : t.status,
    }))
    .filter((t) => (t.title + t.id + t.owner).toLowerCase().includes(query.toLowerCase()))
  useEffect(() => {
    pluginHost.context.set({
      count: tasks.length,
      done: tasks.filter((t) => t.status === "done").length,
      scenario,
    })
  }, [scenario, tasks.length, tasks.filter])
  const session = fixture.sessions.find((r) => r.id === selected?.sessionId),
    trace = fixture.traces.find((r) => r.id === selected?.traceId),
    usage = fixture.usage.find((r) => r.id === selected?.usageId)
  const total = tasks.reduce((s, t) => s + t.tokens, 0),
    cost = tasks.reduce((s, t) => s + t.cost, 0),
    clock = new Date(Date.parse(fixture.clock) + tick * 60000).toISOString().slice(11, 19)
  const emit = (action: string, id: string) =>
    setIntent(
      `${action} → ${id}. ${scenario === "degraded" ? "Scripted refusal: capacity review required." : "Simulated intent captured; fixture records unchanged."} ${clock} UTC`,
    )
  return (
    <PluginHostProvider runtime={pluginHost.runtime}>
      <AppShell
        nav={
          <NavRail
            logo={<Layers className="size-5" />}
            logoLabel="Parallax"
            items={["Activity", "Mission Control", "Usage", "Examples"].map((name, i) => ({
              key: name,
              label: name,
              icon: [
                <Activity key="a" className="size-4" />,
                <Compass key="b" className="size-4" />,
                <Gauge key="c" className="size-4" />,
                <Layers key="d" className="size-4" />,
              ][i],
              active: page === name,
              onSelect: () => {
                setPage(name)
                setSelected(null)
              },
            }))}
          />
        }
        header={
          <div>
            <PageHeader title="Parallax" />
            <div className="review-controls">
              <label>
                Scenario
                <select
                  aria-label="Scenario"
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                >
                  {[
                    "populated",
                    "empty",
                    "loading",
                    "error",
                    "degraded",
                    "unavailable",
                    "permission-denied",
                    "missing-metadata",
                    "long-labels",
                    "large",
                    "sparse",
                    "unknown-status",
                  ].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </label>
              <label>
                Theme
                <select aria-label="Theme" value={theme} onChange={(e) => setTheme(e.target.value)}>
                  {["p4-white", "p1-green-phosphor", "p3-amber-phosphor", "hi-contrast"].map(
                    (v) => (
                      <option key={v}>{v}</option>
                    ),
                  )}
                </select>
              </label>
              <label>
                Mode
                <select aria-label="Mode" value={mode} onChange={(e) => setMode(e.target.value)}>
                  <option>dark</option>
                  <option>light</option>
                </select>
              </label>
              <label>
                Viewport
                <select
                  aria-label="Viewport"
                  value={viewport}
                  onChange={(e) => setViewport(e.target.value)}
                >
                  <option value="full">Fluid</option>
                  <option value="narrow">Narrow</option>
                  <option value="tablet">Tablet</option>
                </select>
              </label>
              <span className="clock">{clock} UTC</span>
              <Button
                size="sm"
                variant="ghost"
                aria-label="Preview clock"
                onClick={() => setPlaying(!playing)}
              >
                <Play className="size-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                aria-label="Reset clock"
                onClick={() => {
                  setTick(0)
                  setPlaying(false)
                }}
              >
                <RotateCcw className="size-4" />
              </Button>
            </div>
          </div>
        }
      >
        <div className="page-scroll" data-testid="page-scroll">
          <div className={`review-surface ${viewport}`}>
            <div className="page-title">
              <div>
                <p className="eyebrow">OPERATIONS / DESIGN LAB</p>
                <h1>{page}</h1>
                <p className="muted">October 4, 2026 · deterministic seed {fixture.seed}</p>
              </div>
              <span className="fixture-tag">FIXTURE ONLY</span>
            </div>
            {scenario === "degraded" && (
              <div role="status" className="notice">
                Telemetry delayed. Last known fixture observations remain available.
              </div>
            )}
            {["loading", "error", "unavailable", "permission-denied"].includes(scenario) ? (
              <EmptyState
                variant="empty"
                title={
                  scenario === "loading"
                    ? "Loading scenario…"
                    : scenario === "permission-denied"
                      ? "Access denied by fixture policy"
                      : scenario === "unavailable"
                        ? "Resource unavailable"
                        : "Could not load observations"
                }
                description="Authored state; no remote service is contacted."
              />
            ) : (
              <>
                <SummaryCards
                  cards={[
                    { label: "Tasks observed", value: tasks.length },
                    {
                      label: "Active runs",
                      value: tasks.filter((t) => t.status === "running").length,
                    },
                    { label: "Tokens consumed", value: total.toLocaleString() },
                    { label: "Estimated cost", value: `$${cost.toFixed(3)}` },
                  ]}
                />
                {page === "Activity" && <FixedActivity records={tasks} clock={fixture.clock} />}
                {page === "Mission Control" ? (
                  <div className="mission-grid">
                    {["running", "queued", "blocked", "done"].map((status) => (
                      <Panel key={status} title={status} icon={<Compass className="size-4" />}>
                        <div className="mission-cards">
                          {tasks
                            .filter((t) => t.status === status)
                            .map((t) => (
                              <button
                                type="button"
                                className="task-card"
                                key={t.id}
                                onClick={() => setSelected(t)}
                              >
                                <span className="eyebrow">
                                  {t.id} / {t.runId}
                                </span>
                                <strong>{t.title}</strong>
                                <span className="muted">{t.owner}</span>
                              </button>
                            ))}
                        </div>
                      </Panel>
                    ))}
                  </div>
                ) : page === "Examples" ? (
                  <Panel title="Transient message draft" icon={<Layers className="size-4" />}>
                    <div className="example-body">
                      <p className="muted">Fixture conversation with the operations review team.</p>
                      <label>
                        Draft
                        <textarea
                          aria-label="Message draft"
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          placeholder="Write a local review note…"
                        />
                      </label>
                      <Button
                        disabled={!draft.trim()}
                        onClick={() => emit("Send message", "conversation-fixture-01")}
                      >
                        Inspect send intent
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => emit("Save settings", "settings-fixture-01")}
                      >
                        Inspect save intent
                      </Button>
                    </div>
                  </Panel>
                ) : (
                  <div className="dashboard-grid">
                    <Panel
                      title={page === "Usage" ? "Run cost attribution" : "Recent activity"}
                      icon={<Activity className="size-4" />}
                      meta={`${tasks.length} records`}
                    >
                      <div className="table-toolbar">
                        <input
                          aria-label="Filter tasks"
                          placeholder="Filter tasks, owners, IDs…"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                        />
                      </div>
                      {tasks.length ? (
                        tasks.map((t) => (
                          <button
                            type="button"
                            className="activity-row"
                            key={t.id}
                            onClick={() => setSelected(t)}
                          >
                            <span className="status-dot" />
                            <span className="task-text">
                              <strong>{t.title}</strong>
                              <span>
                                {t.id} · {t.owner} · {t.started.slice(11, 16)} UTC
                              </span>
                            </span>
                            {page === "Usage" ? (
                              <span>${t.cost.toFixed(3)}</span>
                            ) : (
                              <StatusBadge status={t.status} />
                            )}
                          </button>
                        ))
                      ) : (
                        <EmptyState
                          variant="empty"
                          title="No activity to display"
                          description="Try another scenario or filter."
                        />
                      )}
                    </Panel>
                    <div className="side-panels">
                      <Panel
                        title="Tokens by correlated run"
                        icon={<Gauge className="size-4" />}
                        meta="fixture observations"
                      >
                        <div className="chart">
                          {scenario === "sparse" ? (
                            <p>Samples unavailable for part of this observation window.</p>
                          ) : (
                            <div className="spark-review">
                              <Sparkbars data={tasks.map((t) => t.tokens)} />
                            </div>
                          )}
                          <p className="muted">
                            {total.toLocaleString()} tokens across {tasks.length} runs
                          </p>
                        </div>
                      </Panel>
                      <Panel title="Chimera contribution" icon={<Layers className="size-4" />}>
                        <PluginContribution />
                      </Panel>
                    </div>
                  </div>
                )}
              </>
            )}
            <footer className="muted">
              {fixture.version} · {fixture.generator} · Fixed clock · Actions inspected locally
            </footer>
          </div>
        </div>
        {selected && (
          <DetailDialog
            open
            onClose={() => setSelected(null)}
            title="Run inspection"
            meta={`${selected.id} / ${selected.runId}`}
            badge={<StatusBadge status={selected.status} />}
            footer={
              <Button onClick={() => emit("Stop run", selected.runId)}>Inspect stop intent</Button>
            }
          >
            <div className="example-body">
              <h3>{selected.title}</h3>
              <dl>
                <dt>Session</dt>
                <dd>
                  {session ? `${session.id} · ${session.owner}` : "Generated large fixture session"}
                </dd>
                <dt>Trace</dt>
                <dd>{trace?.id ?? "Generated large fixture trace"}</dd>
                <dt>Usage ledger</dt>
                <dd>
                  {usage ? `${usage.id} · ${usage.tokens} tokens` : "Generated large fixture usage"}
                </dd>
                <dt>Owner</dt>
                <dd>{selected.owner}</dd>
                <dt>Started</dt>
                <dd>{selected.started}</dd>
                <dt>Tokens</dt>
                <dd>{selected.tokens.toLocaleString()}</dd>
                <dt>Cost</dt>
                <dd>${selected.cost.toFixed(3)}</dd>
              </dl>
              <h3>Trace spans</h3>
              {trace?.spans.map((span) => (
                <p className="log-line" key={span}>
                  {span}
                </p>
              ))}
              <h3>Correlated log</h3>
              {selected.logs.map((line, i) => (
                <p className="log-line" key={line}>
                  {i + 1} · {line}
                </p>
              ))}
            </div>
          </DetailDialog>
        )}
        {intent && (
          <div className="intent-panel" role="status">
            <div className="drawer-head">
              <strong>Business intent inspector</strong>
              <Button variant="ghost" aria-label="Close intent" onClick={() => setIntent("")}>
                <X className="size-4" />
              </Button>
            </div>
            <p>{intent}</p>
          </div>
        )}
      </AppShell>
    </PluginHostProvider>
  )
}
