import { AppShell, Button, DetailDialog } from "@hollis-labs/design-components"
import { applyTheme, PageHeader } from "@hollis-labs/kit-dashboard"
import { Panel } from "@hollis-labs/kit-dashboard/widgets"
import {
  PluginHostProvider,
  PluginPanelBody,
  usePluginAction,
  usePluginSlots,
  WidgetRenderer,
} from "@hollis-labs/plugin-host-ui/react"
import { Activity, Compass, Gauge, Layers, Mail, MessageSquare, Users, X } from "lucide-react"
import { lazy, Suspense, useEffect, useRef, useState, useSyncExternalStore } from "react"
import { AccountReview } from "./account-review/Review"
import { adminAppearances } from "./admin-review/model"
import { AdminReview } from "./admin-review/Review"
import { AccountLab } from "./administration/Account"
import { AdminLab } from "./administration/Admin"
import { createOperationsExample } from "./chimera/example"
import { CommunicationLab } from "./communications/CommunicationLab"
import { ConversationReview } from "./conversation-review/Review"
import { EvidenceInspector } from "./evidence/Inspector"
import { Comparison, type Layout, layouts } from "./layouts/Comparison"
import { Navigation, type NavigationMode } from "./layouts/Navigation"
import { ObservationLab } from "./observability/Lab"
import { ObservationReview } from "./observation-review/Review"
import { normalizeScenario, operationsModel, runDetail } from "./operations/model"
import {
  ActivityView,
  MissionView,
  OperationsSummary,
  ResourceNotice,
  RunInspection,
  UsageView,
} from "./operations/Views"
import { PlaybackControls } from "./playback/Controls"
import { usePlayback } from "./playback/usePlayback"
import { PrimitiveGallery } from "./primitives/Gallery"
import { SettingsReview } from "./settings-review/Review"
import { WidgetGallery } from "./widgets/Gallery"

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
  const initialAdminQuery = useRef(
    Object.fromEntries(
      [...params].filter(([key, value]) =>
        key === "adminAppearance"
          ? adminAppearances.some((s) => s === value)
          : key === "adminPage"
            ? ["dashboard", "settings", "status", "diagnostics"].includes(value)
            : key === "adminGroup"
              ? ["workspace", "appearance"].includes(value)
              : ["adminCopy", "adminSeries", "adminHref"].includes(key) && value === "1",
      ),
    ),
  )

  const [page, setPage] = useState(params.get("view") ?? "Activity"),
    [layout, setLayout] = useState<Layout>(
      layouts.find((x) => x === params.get("layout")) ?? "list",
    ),
    [navigation, setNavigation] = useState<NavigationMode>(
      params.get("navigation") === "header"
        ? "header"
        : params.get("navigation") === "drawer"
          ? "drawer"
          : "rail",
    ),
    [scenario, setScenario] = useState(normalizeScenario(params.get("scenario") ?? "populated")),
    [theme, setTheme] = useState(params.get("theme") ?? "p4-white"),
    [mode, setMode] = useState(params.get("mode") ?? "dark"),
    [viewport, setViewport] = useState(params.get("viewport") ?? "full"),
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
  const isWidgets = page === "Widgets"
  const isEvidence = page === "Evidence"
  const isPrimitives = page === "Primitives"
  const isVoice = page === "Voice"
  const isDeveloper = page === "Developer"
  const isObservationReview = page === "Observation Review"
  const isObservation = page === "Observability" || isObservationReview
  const isAccountReview = page === "Account Review"
  const isSettingsReview = page === "Settings Review"
  const isAdminReview = page === "Admin Review"
  const isAdministration =
    page === "Administration" ||
    page === "Account" ||
    isSettingsReview ||
    isAccountReview ||
    isAdminReview
  const isConversationReview = page === "Conversation Review"
  const isCommunication = ["Contacts", "Messages", "Chat", "Conversation Review"].includes(page)
  const review = usePlayback(scenario, undefined, () => {
    pluginHost?.resetContext({ ...pluginHost.context.getSnapshot(), retiredFrame: true })
    setIntent("")
    setDraft("")
  })
  const isPlaybackView = [
    "Activity",
    "Mission Control",
    "Usage",
    "Examples",
    "Layouts",
    "Observability",
    "Widgets",
  ].includes(page)
  const model = operationsModel(
      scenario,
      query,
      isPlaybackView ? { cutoff: review.cutoff, override: review.override } : {},
    ),
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
      cutoff: model.cutoff,
      playbackEpoch: review.epoch,
      contextId: `${model.dataset.version}/${model.dataset.profile}/${scenario}/${model.cutoff}/${review.override}`,
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
    model.cutoff,
    review.epoch,
    review.override,
  ])
  const changeScenario = (value: string) => {
    setScenario(normalizeScenario(value))
    setSelectedId(null)
    setDetailOpen(false)
    setIntent("")
    setDraft("")
    setQuery("")
    review.snapshot()
  }
  useEffect(() => {
    history.replaceState(
      null,
      "",
      `?${new URLSearchParams({ view: page, scenario, theme, mode, viewport, layout, navigation, ...(page === "Admin Review" ? initialAdminQuery.current : {}) })}`,
    )
  }, [page, scenario, theme, mode, viewport, layout, navigation])
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
  const selectionVisible =
    !!selectedId && model.allTasks.some((t) => t.id === selectedId) && model.accessible
  const playbackContext = `${model.cutoff}/${review.epoch}/${review.override}`
  const retiredContext = useRef("")
  useEffect(() => {
    if (!selectionVisible) {
      setSelectedId(null)
      setDetailOpen(false)
    }
    if (retiredContext.current !== playbackContext) {
      retiredContext.current = playbackContext
      setIntent("")
      setDraft("")
    }
  }, [playbackContext, selectionVisible])
  useEffect(() => {
    if (!isPlaybackView && review.playing) review.seek(review.index)
  }, [isPlaybackView, review.playing, review.seek, review.index])
  const clock = model.dataset.clock.slice(11, 19)
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
  const navigationItems = [
    "Activity",
    "Mission Control",
    "Usage",
    "Contacts",
    "Messages",
    "Chat",
    "Conversation Review",
    "Administration",
    "Account",
    "Settings Review",
    "Account Review",
    "Observability",
    "Observation Review",
    "Admin Review",
    "Developer",
    "Voice",
    "Examples",
    "Primitives",
    "Evidence",
    "Widgets",
    "Layouts",
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
      <MessageSquare key="conversation-review" className="size-4" />,
      <Layers key="g" className="size-4" />,
      <Users key="h" className="size-4" />,
      <Layers key="settings-review" className="size-4" />,
      <Users key="account-review" className="size-4" />,
      <Activity key="i" className="size-4" />,
      <Activity key="observation-review" className="size-4" />,
      <Layers key="admin-review" className="size-4" />,
      <Layers key="j" className="size-4" />,
      <Layers key="k" className="size-4" />,
      <MessageSquare key="l" className="size-4" />,
      <Layers key="m" className="size-4" />,
      <Layers key="n" className="size-4" />,
      <Layers key="o" className="size-4" />,
      <Layers key="p" className="size-4" />,
    ][i],
    active: page === name,
    onSelect: () => {
      setPage(name)
      setDetailOpen(false)
    },
  }))
  const shell = (
    <AppShell
      nav={navigation === "rail" ? <Navigation mode="rail" items={navigationItems} /> : undefined}
      header={
        <div>
          <PageHeader title="Parallax" />
          {navigation !== "rail" && <Navigation mode={navigation} items={navigationItems} />}
          <div className="review-controls">
            {page === "Layouts" && (
              <label>
                Navigation
                <select
                  aria-label="Navigation variant"
                  value={navigation}
                  onChange={(e) => setNavigation(e.target.value as NavigationMode)}
                >
                  <option>rail</option>
                  <option>header</option>
                  <option>drawer</option>
                </select>
              </label>
            )}
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
            {isPlaybackView ? (
              <details className="playback-review">
                <summary>Fixture timeline review</summary>
                <PlaybackControls
                  review={{
                    ...review,
                    reset: () => {
                      review.reset()
                      setSelectedId(null)
                      setQuery("")
                      setDetailOpen(false)
                    },
                  }}
                />
              </details>
            ) : (
              <p className="snapshot-scope">
                Full-snapshot review · {model.referenceClock}; other families are not reconstructed
                by operation playback.
              </p>
            )}
          </div>
        </div>
      }
    >
      {page === "Layouts" ? (
        <Comparison
          model={model}
          selection={selectedId}
          onSelect={setSelectedId}
          query={query}
          onQuery={setQuery}
          layout={layout}
          onLayout={setLayout}
          scrollRef={pageScroll}
          contribution={plugin}
          viewport={viewport}
        />
      ) : (
        <div ref={pageScroll} className="page-scroll" data-testid="page-scroll">
          <div className={`review-surface ${viewport}`}>
            <div className="page-title">
              <div>
                <p className="eyebrow">
                  {isAdministration ||
                  isObservation ||
                  isDeveloper ||
                  isVoice ||
                  isPrimitives ||
                  isEvidence
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
                  !isVoice &&
                  !isPrimitives &&
                  !isEvidence &&
                  !isWidgets && <OperationsSummary model={model} />}
                {isAdminReview ? (
                  <AdminReview key={scenario} context={scenario} />
                ) : isObservationReview ? (
                  <ObservationReview key={scenario} context={scenario} />
                ) : isConversationReview ? (
                  <ConversationReview key={scenario} context={scenario} />
                ) : isAccountReview ? (
                  <AccountReview key={scenario} context={scenario} />
                ) : isSettingsReview ? (
                  <SettingsReview key={scenario} context={scenario} />
                ) : isWidgets ? (
                  <WidgetGallery
                    key={scenario}
                    model={operationsModel(scenario, "", {
                      cutoff: review.cutoff,
                      override: review.override,
                    })}
                  />
                ) : isEvidence ? (
                  <EvidenceInspector key={scenario} model={operationsModel(scenario)} />
                ) : isPrimitives ? (
                  <PrimitiveGallery
                    key={scenario}
                    model={operationsModel(scenario)}
                    onInspect={select}
                    onIntent={setIntent}
                    onReset={() => setIntent("")}
                  />
                ) : isVoice ? (
                  <Suspense fallback={<p role="status">Loading voice presentation…</p>}>
                    <VoiceLab key={scenario} onInspect={select} onIntent={setIntent} />
                  </Suspense>
                ) : isDeveloper ? (
                  <Suspense fallback={<p role="status">Loading developer presentation…</p>}>
                    <DeveloperLab key={scenario} onInspect={select} onIntent={setIntent} />
                  </Suspense>
                ) : page === "Observability" ? (
                  <ObservationLab
                    key={scenario}
                    onInspect={select}
                    onReset={() => setIntent("")}
                    externalReview={{
                      sourceProfile: review.source.profile,
                      signal: review.signal,
                      cutoff: review.cutoff,
                      epoch: review.epoch,
                      override: review.override,
                      onSeek: (cutoff) => review.seek(review.frames.indexOf(cutoff)),
                    }}
                  />
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
      )}
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
