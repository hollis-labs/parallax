import { Button, cn, EmptyState } from "@hollis-labs/design-components"
import { StatusBadge } from "@hollis-labs/kit-dashboard"
import {
  BarList,
  CompositionBars,
  IntelligenceRow,
  Kpi,
  KpiGrid,
  MiniTrend,
  Panel,
  SignalBars,
} from "@hollis-labs/kit-dashboard/widgets"
import {
  Activity,
  BrainCircuit,
  Database,
  ExternalLink,
  Gauge,
  Mail,
  Plug,
  RefreshCw,
  TerminalSquare,
} from "lucide-react"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import {
  createTetherSysopMockApi,
  type NameCount,
  type OverviewInfo,
  type OverviewVariantKey,
  overviewModel,
} from "./model"
import "./tether-sysop.css"

function formatDuration(s: number): string {
  if (s <= 0) return "0s"
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h) return `${h}h ${m}m`
  if (m) return `${m}m ${sec}s`
  return `${sec}s`
}

function compact(n: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n)
}

function rate(part: number, total: number): string {
  if (!total) return "0%"
  return `${Math.round((part / total) * 100)}%`
}

function sumSeries(series: number[]): number {
  return series.reduce((sum, n) => sum + n, 0)
}

function mergeSeries(...series: number[][]): number[] {
  const n = Math.max(0, ...series.map((s) => s.length))
  return Array.from({ length: n }, (_, i) => series.reduce((sum, s) => sum + (s[i] ?? 0), 0))
}

function topLabel(items?: NameCount[]): string {
  return items && items.length > 0 ? items[0].name : "none"
}

function toBarItems(items?: NameCount[]) {
  return (items ?? []).map((item) => ({ label: item.name, value: item.count }))
}

function DataList({ title, items }: { title: string; items: NameCount[] }) {
  return (
    <div className="tether-data-list">
      <div className="tether-section-header">{title}</div>
      <BarList items={toBarItems(items)} />
    </div>
  )
}

export interface OverviewPageProps {
  initialVariant?: OverviewVariantKey
  variant?: OverviewVariantKey
  onVariantChange?: (variant: OverviewVariantKey) => void
  onRefresh?: () => void
  showIdentityLinks?: boolean
  showVariantSelector?: boolean
  forcedAppearance?: "ready" | "loading" | "error" | "empty"
  forcedErrorMessage?: string
}

export function OverviewPage({
  initialVariant = "standard",
  variant: controlledVariant,
  onVariantChange,
  onRefresh,
  showIdentityLinks = true,
  showVariantSelector = true,
  forcedAppearance = "ready",
  forcedErrorMessage,
}: OverviewPageProps) {
  const [internalVariant, setInternalVariant] = useState<OverviewVariantKey>(initialVariant)
  const currentVariant = controlledVariant ?? internalVariant

  const [data, setData] = useState<OverviewInfo | null>(() => {
    if (
      forcedAppearance === "loading" ||
      forcedAppearance === "empty" ||
      forcedAppearance === "error"
    )
      return null
    return overviewModel(currentVariant)
  })
  const [error, setError] = useState<string | null>(() => {
    if (forcedAppearance === "error") {
      return forcedErrorMessage ?? "Could not load overview"
    }
    const initial = overviewModel(currentVariant)
    return initial.error ?? initial.health?.error ?? null
  })
  const [loading, setLoading] = useState(forcedAppearance === "loading")

  // Monotonic lease & committed retirement guard to refuse retired callbacks
  const leaseRef = useRef(0)
  const retiredRef = useRef(false)
  const instanceLeaseRef = useRef(0)

  useLayoutEffect(() => {
    retiredRef.current = false
    const lease = ++leaseRef.current
    instanceLeaseRef.current = lease
    return () => {
      retiredRef.current = true
      instanceLeaseRef.current = 0
    }
  }, [])

  const isAdmitted = useCallback(
    () =>
      !retiredRef.current &&
      instanceLeaseRef.current !== 0 &&
      instanceLeaseRef.current === leaseRef.current,
    [],
  )

  const api = useMemo(() => createTetherSysopMockApi(currentVariant), [currentVariant])

  const load = useCallback(() => {
    if (!isAdmitted()) return
    setLoading(true)
    api
      .getOverview()
      .then((info) => {
        if (!isAdmitted()) return
        if (forcedAppearance === "empty") {
          setData(null)
          setError(null)
        } else if (forcedAppearance === "error") {
          setData(null)
          setError(forcedErrorMessage ?? "Simulated overview loading error")
        } else {
          setData(info)
          setError(info.error ?? info.health?.error ?? null)
        }
      })
      .catch((err: unknown) => {
        if (!isAdmitted()) return
        setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (!isAdmitted()) return
        setLoading(false)
      })
  }, [api, isAdmitted, forcedAppearance, forcedErrorMessage])

  useEffect(() => {
    if (forcedAppearance === "error") {
      setData(null)
      setError(forcedErrorMessage ?? "Could not load overview")
      setLoading(false)
      return
    }
    if (forcedAppearance === "loading") {
      setData(null)
      setLoading(true)
      return
    }
    if (forcedAppearance === "empty") {
      setData(null)
      setError(null)
      setLoading(false)
      return
    }
    load()
  }, [load, forcedAppearance, forcedErrorMessage])

  // Retain callback for verification testing
  useEffect(() => {
    if (typeof window !== "undefined") {
      ;(
        window as unknown as { __tetherOverviewRetainedCallback?: () => void }
      ).__tetherOverviewRetainedCallback = () => {
        if (!isAdmitted()) {
          return false
        }
        load()
        return true
      }
    }
  }, [isAdmitted, load])

  const handleVariantChange = useCallback(
    (next: OverviewVariantKey) => {
      if (!isAdmitted()) return
      if (controlledVariant === undefined) {
        setInternalVariant(next)
      }
      onVariantChange?.(next)
    },
    [controlledVariant, isAdmitted, onVariantChange],
  )

  const handleRefresh = useCallback(() => {
    if (!isAdmitted() || loading) return
    onRefresh?.()
    load()
  }, [isAdmitted, loading, onRefresh, load])

  // Keyboard navigation & shortcut guard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Shortcuts / IME 229 / modifier branches refuse without blocking native Tab
      if (e.isComposing || e.keyCode === 229) return
      const target = e.target as HTMLElement
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return
      }
      if ((e.key === "r" || e.key === "R") && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        handleRefresh()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [handleRefresh])

  const s = data?.sessions
  const t = data?.tool_calls
  const m = data?.messages
  const e = data?.events
  const a = data?.ai
  const c = data?.catalog
  const h = data?.health

  const activitySeries = useMemo(
    () => mergeSeries(s?.trend ?? [], t?.trend ?? [], m?.trend ?? [], e?.trend ?? []),
    [s?.trend, t?.trend, m?.trend, e?.trend],
  )
  const runtimeSeries = useMemo(
    () => mergeSeries(s?.trend ?? [], e?.trend ?? []),
    [s?.trend, e?.trend],
  )
  const interactionSeries = useMemo(
    () => mergeSeries(t?.trend ?? [], m?.trend ?? []),
    [t?.trend, m?.trend],
  )
  const activityTotal = sumSeries(activitySeries)
  const unreadRate = m ? rate(m.unread, m.total) : "0%"
  const errorRate = t ? rate(t.errors, t.total) : "0%"
  const aiSuccessRate = a ? rate(a.successes, a.requests) : "0%"

  if (error && !data) {
    return (
      <div className="tether-overview-empty empty-state">
        <EmptyState variant="error" title="Could not load overview" description={error} />
      </div>
    )
  }

  if (loading && !data) {
    return (
      <div className="tether-overview-empty empty-state" aria-busy="true">
        <EmptyState
          variant="empty"
          title="Loading overview..."
          description="Retrieving Tether telemetry fixture data."
        />
      </div>
    )
  }

  return (
    <div className="tether-overview-root">
      {/* Header strip: caption, catalog root in mono, status badge, Refresh, variant and identity links */}
      <header className="tether-overview-header">
        <div className="tether-overview-header-left">
          <p className="tether-overview-caption">Agent Ops Control Plane</p>
          <p className="tether-overview-catalog-root">{h?.catalog_root ?? "Loading catalog..."}</p>
        </div>

        {showIdentityLinks && (
          <nav className="tether-overview-links" aria-label="Operations identity links">
            <a
              href="/?example=torque"
              className="tether-id-link"
              title="Navigate to Torque Operations"
            >
              Torque Operations <ExternalLink className="size-3" />
            </a>
            <a
              href="/?view=Event+Ledger"
              className="tether-id-link"
              title="Navigate to Event Ledger"
            >
              Event Ledger <ExternalLink className="size-3" />
            </a>
            <a
              href="/?view=Run+Explorer"
              className="tether-id-link"
              title="Navigate to Run Explorer"
            >
              Run Explorer <ExternalLink className="size-3" />
            </a>
            <a
              href="/?example=administration"
              className="tether-id-link"
              title="Navigate to Administration"
            >
              Administration <ExternalLink className="size-3" />
            </a>
          </nav>
        )}

        <div className="tether-overview-header-right">
          {showVariantSelector && (
            <label className="tether-overview-variant-label">
              Variant
              <select
                aria-label="Dataset variant"
                className="tether-overview-variant-select"
                value={currentVariant}
                onChange={(e) => handleVariantChange(e.target.value as OverviewVariantKey)}
              >
                <option value="standard">standard</option>
                <option value="blocked-health">blocked-health</option>
                <option value="degraded-reliability">degraded-reliability</option>
                <option value="combined-adverse">combined-adverse</option>
              </select>
            </label>
          )}

          {h?.status && (
            <span
              className="dash-status-badge shrink-0"
              data-status={h.status === "ok" ? "done" : "blocked"}
            >
              <StatusBadge status={h.status === "ok" ? "done" : "blocked"} />
            </span>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            aria-label="Refresh overview dashboard"
          >
            <RefreshCw className={cn("size-3.5", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </header>

      {/* Main dashboard scroll container */}
      <main className="tether-overview-scroll" aria-label="Agent Ops overview panels">
        {/* Row 1: Activity Signal (2fr) beside Intelligence (0.85fr) */}
        <div className="grid gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(20rem,0.85fr)]">
          <section data-panel="Activity Signal">
            <Panel
              title="Activity Signal"
              icon={<Activity className="size-3.5" />}
              meta={`${compact(activityTotal)} sampled events`}
            >
              <KpiGrid cols="grid-cols-2 md:grid-cols-6">
                <Kpi
                  label="Sessions"
                  value={compact(s?.total ?? 0)}
                  sub={`${s?.recent_24h ?? 0} / 24h`}
                />
                <Kpi
                  label="Tool Calls"
                  value={compact(t?.total ?? 0)}
                  sub={`${t?.recent_1h ?? 0} / 1h`}
                />
                <Kpi
                  label="Messages"
                  value={compact(m?.total ?? 0)}
                  sub={`${m?.recent_24h ?? 0} / 24h`}
                />
                <Kpi
                  label="Events"
                  value={compact(e?.total ?? 0)}
                  sub={`${e?.recent_1h ?? 0} / 1h`}
                />
                <Kpi
                  label="Success"
                  value={t ? `${t.success_pct}%` : "..."}
                  sub={`${errorRate} errors`}
                />
                <Kpi label="Unread" value={unreadRate} sub={`${m?.unread ?? 0} messages`} />
              </KpiGrid>
              <SignalBars
                data={runtimeSeries}
                secondaryData={interactionSeries}
                heightClassName="h-56"
                primaryLabel="Runtime"
                secondaryLabel="Interaction"
              />
              <div className="grid md:grid-cols-4">
                <MiniTrend
                  label="Sessions"
                  value={sumSeries(s?.trend ?? [])}
                  data={s?.trend ?? []}
                />
                <MiniTrend label="Tools" value={sumSeries(t?.trend ?? [])} data={t?.trend ?? []} />
                <MiniTrend
                  label="Messages"
                  value={sumSeries(m?.trend ?? [])}
                  data={m?.trend ?? []}
                />
                <MiniTrend label="Events" value={sumSeries(e?.trend ?? [])} data={e?.trend ?? []} />
              </div>
            </Panel>
          </section>

          <section data-panel="Intelligence">
            <Panel title="Intelligence" icon={<Gauge className="size-3.5" />}>
              <IntelligenceRow
                label="Tool reliability"
                value={t ? `${t.success_pct}%` : "..."}
                status={t && t.success_pct < 95 ? "blocked" : "done"}
              />
              <IntelligenceRow
                label="Session completion"
                value={s ? `${s.success_pct}%` : "..."}
                status={s && s.success_pct < 50 ? "blocked" : "done"}
              />
              <IntelligenceRow
                label="Slow tool calls"
                value={t?.slow_calls ?? "..."}
                status={t && t.slow_calls > 0 ? "doing" : "done"}
              />
              <IntelligenceRow
                label="Inbox pressure"
                value={unreadRate}
                status={m && m.unread > 0 ? "inbox" : "done"}
              />
              <IntelligenceRow label="Top tool" value={topLabel(t?.top_tools)} status="indexed" />
              <IntelligenceRow label="Top event" value={topLabel(e?.by_kind)} status="indexed" />
            </Panel>
          </section>
        </div>

        {/* Row 2: Five panels (Sessions, Tool Calls, Messaging, AI Gateway, Event Bus) */}
        <div className="mt-3 grid gap-3 xl:grid-cols-5">
          <section data-panel="Sessions">
            <Panel
              title="Sessions"
              icon={<TerminalSquare className="size-3.5" />}
              meta={
                <span>
                  {s?.running ?? 0} running
                  {showIdentityLinks && (
                    <a
                      href="/?view=Run+Explorer"
                      className="tether-panel-action"
                      title="View sessions in Run Explorer"
                    >
                      Explorer
                    </a>
                  )}
                </span>
              }
            >
              <KpiGrid>
                <Kpi label="Ended" value={s?.ended ?? 0} />
                <Kpi label="Failed" value={s ? `${s.failure_pct}%` : "..."} />
                <Kpi label="Avg Time" value={s ? formatDuration(s.avg_seconds) : "..."} />
                <Kpi label="Projects" value={s?.by_project?.length ?? 0} />
              </KpiGrid>
              <div className="grid md:grid-cols-2 xl:grid-cols-1">
                <div className="tether-panel-section-b">
                  <div className="tether-section-header">State mix</div>
                  <CompositionBars items={toBarItems(s?.by_state)} />
                </div>
                <DataList title="Providers" items={s?.by_provider ?? []} />
              </div>
            </Panel>
          </section>

          <section data-panel="Tool Calls">
            <Panel
              title="Tool Calls"
              icon={<Plug className="size-3.5" />}
              meta={`${t?.sessions ?? 0} sessions`}
            >
              <KpiGrid>
                <Kpi label="p50" value={t ? `${t.p50_ms}ms` : "..."} />
                <Kpi label="p95" value={t ? `${t.p95_ms}ms` : "..."} />
                <Kpi label="Avg" value={t ? `${t.avg_ms}ms` : "..."} />
                <Kpi
                  label="Errors"
                  value={t?.errors ?? 0}
                  accent={t && t.errors > 0 ? "var(--color-status-blocked)" : undefined}
                />
              </KpiGrid>
              <DataList title="Top tools" items={t?.top_tools ?? []} />
              <div className="tether-panel-section-t">
                <div className="tether-section-header">Latency bands</div>
                <CompositionBars items={toBarItems(t?.latency)} />
              </div>
            </Panel>
          </section>

          <section data-panel="Messaging">
            <Panel title="Messaging" icon={<Mail className="size-3.5" />}>
              <KpiGrid>
                <Kpi
                  label="Unread"
                  value={m?.unread ?? 0}
                  accent={m && m.unread > 0 ? "var(--color-status-inbox)" : undefined}
                />
                <Kpi label="Archived" value={m?.archived ?? 0} />
                <Kpi label="Recent" value={m?.recent_24h ?? 0} />
                <Kpi label="Kinds" value={m?.by_kind?.length ?? 0} />
              </KpiGrid>
              <div className="tether-panel-section-b">
                <div className="tether-section-header">Scope mix</div>
                <CompositionBars items={toBarItems(m?.by_scope)} />
              </div>
              <DataList title="Message kinds" items={m?.by_kind ?? []} />
            </Panel>
          </section>

          <section data-panel="AI Gateway">
            <Panel
              title="AI Gateway"
              icon={<BrainCircuit className="size-3.5" />}
              meta={`${a?.enabled_providers ?? 0} providers live`}
            >
              <KpiGrid>
                <Kpi label="Requests" value={compact(a?.requests ?? 0)} />
                <Kpi label="Success" value={aiSuccessRate} />
                <Kpi
                  label="Budget rejects"
                  value={a?.budget_rejections ?? 0}
                  accent={a && a.budget_rejections > 0 ? "var(--color-status-blocked)" : undefined}
                />
                <Kpi label="Spend" value={a ? `$${a.estimated_cost_usd.toFixed(2)}` : "..."} />
              </KpiGrid>
              <div className="tether-panel-section-b">
                <div className="tether-section-header">AI activity</div>
                <SignalBars data={a?.trend ?? []} heightClassName="h-28" primaryLabel="AI events" />
              </div>
              <div className="grid md:grid-cols-2 xl:grid-cols-1">
                <DataList title="By provider" items={a?.by_provider ?? []} />
                <DataList title="Event types" items={a?.by_event_type ?? []} />
              </div>
            </Panel>
          </section>

          <section data-panel="Event Bus">
            <Panel
              title="Event Bus"
              icon={<Database className="size-3.5" />}
              meta={
                <span>
                  {e ? `seq ${e.latest_seq}` : undefined}
                  {showIdentityLinks && (
                    <a
                      href="/?view=Event+Ledger"
                      className="tether-panel-action"
                      title="View events in Event Ledger"
                    >
                      Ledger
                    </a>
                  )}
                </span>
              }
            >
              <KpiGrid>
                <Kpi label="Total" value={compact(e?.total ?? 0)} />
                <Kpi label="1h" value={e?.recent_1h ?? 0} />
                <Kpi label="Scopes" value={e?.by_scope?.length ?? 0} />
                <Kpi label="Kinds" value={e?.by_kind?.length ?? 0} />
              </KpiGrid>
              <div className="tether-panel-section-b">
                <div className="tether-section-header">Scope mix</div>
                <CompositionBars items={toBarItems(e?.by_scope)} />
              </div>
              <DataList title="Event kinds" items={e?.by_kind ?? []} />
            </Panel>
          </section>
        </div>

        {/* Rows 3-4: Catalog Surface, MCP Servers, AI Cost Report, AI Operators */}
        <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section data-panel="Catalog Surface">
            <Panel
              title="Catalog Surface"
              icon={<Database className="size-3.5" />}
              meta={
                showIdentityLinks && (
                  <a
                    href="/?example=administration"
                    className="tether-panel-action"
                    title="View administration catalog"
                  >
                    Administration
                  </a>
                )
              }
            >
              <KpiGrid cols="grid-cols-2 md:grid-cols-4">
                <Kpi label="Projects" value={c?.projects ?? "..."} />
                <Kpi label="Agents" value={c?.agents ?? "..."} />
                <Kpi label="Providers" value={c?.providers ?? "..."} />
                <Kpi label="Launches" value={c?.launches ?? "..."} />
              </KpiGrid>
              <DataList title="Session projects" items={s?.by_project ?? []} />
            </Panel>
          </section>

          <section data-panel="MCP Servers">
            <Panel title="MCP Servers" icon={<Plug className="size-3.5" />}>
              <KpiGrid cols="grid-cols-2 md:grid-cols-4">
                <Kpi label="Servers" value={t?.by_server?.length ?? 0} />
                <Kpi label="Calls" value={compact(t?.total ?? 0)} />
                <Kpi label="Errors" value={t?.errors ?? 0} />
                <Kpi label="Slow" value={t?.slow_calls ?? 0} />
              </KpiGrid>
              <DataList title="Server volume" items={t?.by_server ?? []} />
            </Panel>
          </section>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section data-panel="AI Cost Report">
            <Panel title="AI Cost Report" icon={<BrainCircuit className="size-3.5" />}>
              <KpiGrid cols="grid-cols-2 md:grid-cols-4">
                <Kpi label="Configured" value={a?.configured_providers ?? 0} />
                <Kpi label="Routes" value={a?.routes ?? 0} />
                <Kpi label="Input" value={compact(a?.input_tokens ?? 0)} />
                <Kpi label="Output" value={compact(a?.output_tokens ?? 0)} />
              </KpiGrid>
              <div className="tether-panel-section-b">
                <div className="tether-section-header">Model volume</div>
                <CompositionBars items={toBarItems(a?.by_model)} />
              </div>
              <div className="grid md:grid-cols-2">
                <MiniTrend
                  label="AI requests"
                  value={sumSeries(a?.trend ?? [])}
                  data={a?.trend ?? []}
                />
                <MiniTrend
                  label="Budget rejects"
                  value={a?.budget_rejections ?? 0}
                  data={a?.trend ?? []}
                />
              </div>
            </Panel>
          </section>

          <section data-panel="AI Operators">
            <Panel title="AI Operators" icon={<Gauge className="size-3.5" />}>
              <IntelligenceRow
                label="Provider coverage"
                value={`${a?.enabled_providers ?? 0}/${a?.configured_providers ?? 0}`}
                status={a && a.enabled_providers < a.configured_providers ? "doing" : "done"}
              />
              <IntelligenceRow
                label="Route coverage"
                value={a?.routes ?? 0}
                status={a && a.routes === 0 ? "doing" : "done"}
              />
              <IntelligenceRow
                label="Top provider"
                value={topLabel(a?.by_provider)}
                status="indexed"
              />
              <IntelligenceRow label="Top model" value={topLabel(a?.by_model)} status="indexed" />
              <IntelligenceRow
                label="Budget pressure"
                value={a?.budget_rejections ?? 0}
                status={a && a.budget_rejections > 0 ? "blocked" : "done"}
              />
              <IntelligenceRow
                label="Spend"
                value={a ? `$${a.estimated_cost_usd.toFixed(2)}` : "..."}
                status="indexed"
              />
            </Panel>
          </section>
        </div>

        {/* Inline error notice banner if present */}
        {error && (
          <div className="tether-overview-error-banner" role="alert">
            {error}
          </div>
        )}
      </main>
    </div>
  )
}
