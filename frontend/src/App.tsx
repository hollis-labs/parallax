import { AppShell, Button, DetailDialog } from "@hollis-labs/design-components"
import { applyTheme, NavRail, PageHeader } from "@hollis-labs/kit-dashboard"
import { Panel } from "@hollis-labs/kit-dashboard/widgets"
import {
  PluginHostProvider,
  PluginPanelBody,
  usePluginAction,
  usePluginSlots,
  WidgetRenderer,
} from "@hollis-labs/plugin-host-ui/react"
import {
  Activity,
  Compass,
  Gauge,
  Layers,
  Mail,
  MessageSquare,
  Play,
  RotateCcw,
  Users,
  X,
} from "lucide-react"
import { lazy, Suspense, useEffect, useRef, useState, useSyncExternalStore } from "react"
import { AccountLab } from "./administration/Account"
import { AdminLab } from "./administration/Admin"
import { createOperationsExample } from "./chimera/example"
import { CommunicationLab } from "./communications/CommunicationLab"
import { ObservationLab } from "./observability/Lab"
import { normalizeScenario, operationsModel, runDetail } from "./operations/model"
import {
  ActivityView,
  MissionView,
  OperationsSummary,
  ResourceNotice,
  RunInspection,
  UsageView,
} from "./operations/Views"

const VoiceLab = lazy(() => import("./voice/Lab"))
const DeveloperLab = lazy(() => import("./developer/Lab"))

type Host = ReturnType<typeof createOperationsExample>
type PluginStatus = "loading" | "ready" | "error" | "unloaded"
function Contributions({
  host,
  status,
  onUnload,
}: {
  host: Host
  status: PluginStatus
  onUnload: () => void
}) {
  const widgets = usePluginSlots("operations.summary"),
    panels = usePluginSlots("operations.detail"),
    modalWidgets = usePluginSlots("operations.modal"),
    toolbar = usePluginSlots("operations.toolbar"),
    dispatch = usePluginAction()
  const modal = useSyncExternalStore(host.actions.modal.subscribe, host.actions.modal.getSnapshot),
    receipts = useSyncExternalStore(
      host.actions.receipts.subscribe,
      host.actions.receipts.getSnapshot,
    )
  const [result, setResult] = useState("")
  const alive = useRef(false)
  useEffect(() => {
    alive.current = true
    const release = host.context.subscribe(() => setResult(""))
    return () => {
      alive.current = false
      release()
    }
  }, [host])
  const target = modal
    ? modalWidgets.find(
        (p) =>
          p.ref.owner === modal.target.owner &&
          p.ref.key === modal.target.key &&
          p.ref.generation === modal.target.generation,
      )
    : undefined
  return (
    <>
      <section aria-label="Plugin widget">
        {status === "error" ? (
          <p className="p-4 text-sm text-fg-muted">
            Plugin unavailable: reviewed contribution could not load.
          </p>
        ) : status === "unloaded" ? (
          <p className="p-4 text-sm text-fg-muted">Plugin unavailable after explicit unload.</p>
        ) : widgets.length ? (
          widgets.map((w) => <WidgetRenderer key={w.id} widget={w} />)
        ) : (
          <p className="p-4 text-sm text-fg-muted">
            {status === "ready"
              ? "Plugin unavailable: no admitted contribution."
              : "Loading reviewed contribution…"}
          </p>
        )}
      </section>
      {status === "ready" && (
        <section aria-label="Plugin panel">
          {panels.map((panel) => (
            <PluginPanelBody key={panel.id} panel={panel} />
          ))}
        </section>
      )}
      <fieldset className="example-body">
        <legend>Plugin presentation actions</legend>
        {toolbar.map((view) => (
          <Button
            key={view.id}
            variant="outline"
            disabled={status !== "ready"}
            onClick={() => {
              const context = host.context.getSnapshot()
              void dispatch(view).then((r) => {
                if (
                  alive.current &&
                  context === host.context.getSnapshot() &&
                  host.runtime.isCurrent(view)
                )
                  setResult(
                    r.status === "success"
                      ? "Accepted local presentation action"
                      : `Refused: ${r.reason}`,
                  )
              })
            }}
          >
            {view.label}
          </Button>
        ))}
        <Button
          variant="ghost"
          disabled={status !== "ready"}
          onClick={() => {
            host.actions.reset()
            setResult("")
            onUnload()
            void host.registry.unload("ops")
          }}
        >
          Unload fixture plugin
        </Button>
        {result && (
          <p role="status" aria-label="Plugin action result">
            {result}
          </p>
        )}
        {receipts.length > 0 && (
          <section aria-label="Plugin simulation receipts">
            <p className="muted">Transient fixture receipts; records unchanged.</p>
            {receipts.map((r) => (
              <p key={r.id}>
                {r.command} · {r.status}
                {r.outcome ? ` · ${r.outcome}` : ""}
              </p>
            ))}
          </section>
        )}
        <Button variant="ghost" onClick={() => host.completeSimulation()}>
          Complete scripted outcome
        </Button>
      </fieldset>
      <DetailDialog
        open={!!target && status === "ready"}
        onClose={() => host.actions.closeModal()}
        title="Plugin detail"
      >
        {target && <WidgetRenderer widget={target} />}
      </DetailDialog>
    </>
  )
}
export function App() {
  const params = new URLSearchParams(location.search)
  const pageScroll = useRef<HTMLDivElement>(null)

  const [page, setPage] = useState(params.get("view") ?? "Activity"),
    [scenario, setScenario] = useState(normalizeScenario(params.get("scenario") ?? "populated")),
    [theme, setTheme] = useState(params.get("theme") ?? "p4-white"),
    [mode, setMode] = useState(params.get("mode") ?? "dark"),
    [viewport, setViewport] = useState(params.get("viewport") ?? "full"),
    [tick, setTick] = useState(0),
    [playing, setPlaying] = useState(false),
    [selectedId, setSelectedId] = useState<string | null>(null),
    [detailOpen, setDetailOpen] = useState(false),
    [query, setQuery] = useState(""),
    [intent, setIntent] = useState(""),
    [draft, setDraft] = useState(""),
    [pluginHost, setPluginHost] = useState<Host | null>(null),
    [pluginStatus, setPluginStatus] = useState<PluginStatus>("loading")
  useEffect(() => {
    const node = pageScroll.current
    if (node) {
      node.dataset.view = page
      node.scrollTo({ top: 0 })
    }
  }, [page])
  useEffect(() => {
    const abort = new AbortController()
    const host = createOperationsExample((route) =>
      setPage(route === "usage" ? "Usage" : "Activity"),
    )
    setPluginHost(host)
    setPluginStatus("loading")
    void host
      .load(undefined, abort.signal)
      .then((result) => {
        if (!abort.signal.aborted) setPluginStatus(result.planning.accepted ? "ready" : "error")
      })
      .catch(() => {
        if (!abort.signal.aborted) setPluginStatus("error")
      })
    return () => {
      abort.abort()
      void host.dispose()
    }
  }, [])
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
  const isVoice = page === "Voice"
  const isDeveloper = page === "Developer"
  const isObservation = page === "Observability"
  const isAdministration = page === "Administration" || page === "Account"
  const isCommunication = ["Contacts", "Messages", "Chat"].includes(page)
  const model = operationsModel(scenario, query),
    detail = runDetail(model, selectedId)
  const count = model.stats.count,
    done = model.stats.done
  useEffect(() => {
    pluginHost?.resetContext({
      count,
      done,
      scenario,
      query,
      resource: model.resource,
      contextId: `${model.dataset.version}/${model.dataset.profile}/${scenario}`,
    })
  }, [
    pluginHost,
    count,
    done,
    scenario,
    query,
    model.resource,
    model.dataset.version,
    model.dataset.profile,
  ])
  const changeScenario = (value: string) => {
    setScenario(normalizeScenario(value))
    setSelectedId(null)
    setDetailOpen(false)
    setIntent("")
    setDraft("")
    setQuery("")
    setTick(0)
    setPlaying(false)
  }
  useEffect(() => {
    history.replaceState(
      null,
      "",
      `?${new URLSearchParams({ view: page, scenario, theme, mode, viewport })}`,
    )
  }, [page, scenario, theme, mode, viewport])
  useEffect(() => {
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDetailOpen(false)
        setIntent("")
      }
    }
    window.addEventListener("keydown", close)
    return () => window.removeEventListener("keydown", close)
  }, [])
  const clock = new Date(Date.parse(model.dataset.clock) + tick * 60000).toISOString().slice(11, 19)
  const emit = (action: string, id: string) =>
    setIntent(
      `${action} → ${id}. ${scenario === "degraded" ? "Scripted refusal: capacity review required." : "Simulated intent captured; fixture records unchanged."} ${clock} UTC`,
    )
  const select = (id: string) => {
    setSelectedId(id)
    setDetailOpen(true)
  }
  const plugin = pluginHost ? (
    <Contributions
      host={pluginHost}
      status={pluginStatus}
      onUnload={() => setPluginStatus("unloaded")}
    />
  ) : (
    <p className="p-4 text-sm text-fg-muted">Loading reviewed contribution…</p>
  )
  const shell = (
    <AppShell
      nav={
        <NavRail
          logo={<Layers className="size-5" />}
          logoLabel="Parallax"
          items={[
            "Activity",
            "Mission Control",
            "Usage",
            "Contacts",
            "Messages",
            "Chat",
            "Administration",
            "Account",
            "Observability",
            "Developer",
            "Voice",
            "Examples",
          ].map((name, i) => ({
            key: name,
            label: name,
            icon: [
              <Activity key="a" className="size-4" />,
              <Compass key="b" className="size-4" />,
              <Gauge key="c" className="size-4" />,
              <Users key="d" className="size-4" />,
              <Mail key="e" className="size-4" />,
              <MessageSquare key="f" className="size-4" />,
              <Layers key="g" className="size-4" />,
              <Users key="h" className="size-4" />,
              <Activity key="i" className="size-4" />,
              <Layers key="j" className="size-4" />,
              <Layers key="k" className="size-4" />,
              <MessageSquare key="l" className="size-4" />,
            ][i],
            active: page === name,
            onSelect: () => {
              setPage(name)
              setDetailOpen(false)
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
                onChange={(e) => changeScenario(e.target.value)}
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
                {["p4-white", "p1-green-phosphor", "p3-amber-phosphor", "hi-contrast"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
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
      <div ref={pageScroll} className="page-scroll" data-testid="page-scroll">
        <div className={`review-surface ${viewport}`}>
          <div className="page-title">
            <div>
              <p className="eyebrow">
                {isAdministration || isObservation || isDeveloper || isVoice
                  ? page.toUpperCase()
                  : isCommunication
                    ? "COMMUNICATIONS"
                    : "OPERATIONS"}{" "}
                / DESIGN LAB
              </p>
              <h1>{page}</h1>
              <p className="muted">
                October 4, 2026 · deterministic seed {model.dataset.seed} ·{" "}
                {isVoice
                  ? "bundled original voice/media fixture"
                  : isDeveloper
                    ? "bundled developer/workflow fixture"
                    : isObservation
                      ? "bundled observation fixture"
                      : isAdministration
                        ? "bundled administration/account fixture"
                        : isCommunication
                          ? "bundled communications fixture"
                          : model.dataset.profile}
              </p>
            </div>
            <span className="fixture-tag">FIXTURE ONLY</span>
          </div>
          {detail && (
            <section className="selection-band" aria-label="Selected run">
              <strong>
                {detail.task.id} / {detail.run.id}
              </strong>
              <span className="muted">Selection stays across views</span>
              <Button size="sm" onClick={() => setDetailOpen(true)}>
                Inspect selected run
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSelectedId(null)
                  setDetailOpen(false)
                }}
              >
                Clear selection
              </Button>
            </section>
          )}
          {model.resource === "degraded" && (
            <div role="status" className="notice">
              Telemetry delayed. Last known fixture observations remain available.
            </div>
          )}
          {!model.accessible ? (
            <ResourceNotice model={model} />
          ) : (
            <>
              {!isCommunication &&
                !isAdministration &&
                !isObservation &&
                !isDeveloper &&
                !isVoice && <OperationsSummary model={model} />}
              {isVoice ? (
                <Suspense fallback={<p role="status">Loading voice presentation…</p>}>
                  <VoiceLab key={scenario} onInspect={select} onIntent={setIntent} />
                </Suspense>
              ) : isDeveloper ? (
                <Suspense fallback={<p role="status">Loading developer presentation…</p>}>
                  <DeveloperLab key={scenario} onInspect={select} onIntent={setIntent} />
                </Suspense>
              ) : page === "Observability" ? (
                <ObservationLab key={scenario} onInspect={select} onReset={() => setIntent("")} />
              ) : page === "Administration" ? (
                <AdminLab key={scenario} onIntent={emit} onReset={() => setIntent("")} />
              ) : page === "Account" ? (
                <AccountLab key={scenario} onIntent={emit} onReset={() => setIntent("")} />
              ) : isCommunication ? (
                <CommunicationLab
                  key={scenario}
                  view={page}
                  scenario={scenario}
                  onViewChange={setPage}
                  onIntent={emit}
                  onReset={() => setIntent("")}
                />
              ) : page === "Activity" ? (
                <ActivityView
                  model={model}
                  onSelect={select}
                  query={query}
                  onQuery={setQuery}
                  plugin={plugin}
                />
              ) : page === "Mission Control" ? (
                <MissionView model={model} onSelect={select} />
              ) : page === "Usage" ? (
                <UsageView model={model} onSelect={select} query={query} onQuery={setQuery} />
              ) : (
                <Panel title="Transient message draft" icon={<Layers className="size-4" />}>
                  <div className="example-body">
                    <p className="muted">Fixture conversation with the operations review team.</p>
                    <Button onClick={() => emit("Run fixture", "plan-fixture-01")}>
                      Inspect run intent
                    </Button>
                    <Button onClick={() => emit("Approve review", "review-fixture-01")}>
                      Inspect approve intent
                    </Button>
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
              )}
            </>
          )}
          <footer className="muted">
            {model.dataset.version} · {model.dataset.generator} · Fixed clock · Actions inspected
            locally
          </footer>
        </div>
      </div>
      <RunInspection
        detail={detail}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onIntent={emit}
      />
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
  )
  return pluginHost ? (
    <PluginHostProvider runtime={pluginHost.runtime}>{shell}</PluginHostProvider>
  ) : (
    shell
  )
}
