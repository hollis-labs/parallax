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
  type TetherSysopApi,
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

// Monotonic activation lease sequence counter and sets of active/retired leases across lifecycle and variant transitions
let globalActivationLeaseSeq = 0
export const activeLeases = new Set<number>()
export const retiredLeases = new Set<number>()

export function isElementVisibleAndActive(el: HTMLElement): boolean {
  if (el.hasAttribute("hidden") || el.closest("[hidden]")) return false
  if (el.getAttribute("aria-hidden") === "true" || el.closest('[aria-hidden="true"]')) return false
  if (el.hasAttribute("inert") || el.closest("[inert]")) return false
  if (el.closest("details:not([open])")) return false

  if (el.hasAttribute("data-closed") || el.closest("[data-closed]")) return false
  if (el.hasAttribute("data-ending") || el.closest("[data-ending]")) return false
  if (el.getAttribute("data-state") === "closed" || el.closest('[data-state="closed"]')) {
    return false
  }

  if (typeof window !== "undefined") {
    let curr: HTMLElement | null = el
    while (curr) {
      if (
        curr.style.display === "none" ||
        curr.style.visibility === "hidden" ||
        curr.style.opacity === "0"
      ) {
        return false
      }
      if (typeof window.getComputedStyle === "function") {
        const style = window.getComputedStyle(curr)
        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          style.visibility === "collapse" ||
          style.opacity === "0"
        ) {
          return false
        }
      }
      curr = curr.parentElement
    }
  }

  const rect = el.getBoundingClientRect()
  if (rect.width === 0 && rect.height === 0) {
    return false
  }

  return true
}

export function hasCompetingOverlay(): boolean {
  if (typeof document === "undefined") return false
  const overlays = document.querySelectorAll<HTMLElement>(
    '[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"]',
  )
  for (const el of Array.from(overlays)) {
    if (isElementVisibleAndActive(el)) {
      return true
    }
  }
  return false
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
  api?: TetherSysopApi
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
  api: customApi,
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

  // Track activation lease per mount and variant lifecycle; allocate ONLY in committed effect lifecycle
  const [activationLease, setActivationLease] = useState(0)
  const currentLeaseRef = useRef(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const requestSeqRef = useRef(0)
  const currentVariantRef = useRef(currentVariant)
  currentVariantRef.current = currentVariant

  // Advance lease on variant transition and mount lifecycle; permanently retire previous lease
  useLayoutEffect(() => {
    void currentVariant
    const lease = ++globalActivationLeaseSeq
    activeLeases.add(lease)
    currentLeaseRef.current = lease
    setActivationLease(lease)
    setLoading(false)

    return () => {
      activeLeases.delete(lease)
      retiredLeases.add(lease)
      if (currentLeaseRef.current === lease) {
        currentLeaseRef.current = 0
      }
      setLoading(false)
    }
  }, [currentVariant])

  const isAdmitted = useCallback((leaseToVerify: number): boolean => {
    if (
      leaseToVerify === 0 ||
      !activeLeases.has(leaseToVerify) ||
      retiredLeases.has(leaseToVerify) ||
      leaseToVerify !== currentLeaseRef.current
    ) {
      return false
    }
    if (!rootRef.current || !rootRef.current.isConnected || !document.contains(rootRef.current)) {
      return false
    }
    if (hasCompetingOverlay()) {
      return false
    }
    return true
  }, [])

  const isRequestValid = useCallback(
    (capturedLease: number, requestLease: number, capturedVariant: OverviewVariantKey): boolean => {
      if (
        capturedLease === 0 ||
        !activeLeases.has(capturedLease) ||
        retiredLeases.has(capturedLease) ||
        capturedLease !== currentLeaseRef.current
      ) {
        return false
      }
      if (requestLease !== requestSeqRef.current || capturedVariant !== currentVariantRef.current) {
        return false
      }
      if (!rootRef.current || !rootRef.current.isConnected || !document.contains(rootRef.current)) {
        return false
      }
      return true
    },
    [],
  )

  const defaultApi = useMemo(() => createTetherSysopMockApi(currentVariant), [currentVariant])
  const api = customApi ?? defaultApi

  const load = useCallback((): boolean => {
    const capturedLease = activationLease
    if (!isAdmitted(capturedLease)) {
      return false
    }

    const capturedVariant = currentVariant
    const requestLease = ++requestSeqRef.current

    if (typeof window !== "undefined") {
      const w = window as unknown as { __tetherOverviewRequestCount?: number }
      w.__tetherOverviewRequestCount = (w.__tetherOverviewRequestCount ?? 0) + 1
    }

    setLoading(true)
    api
      .getOverview()
      .then((info) => {
        // Promise completion must match the captured request, active lease, and variant (independent of transient overlay)
        if (!isRequestValid(capturedLease, requestLease, capturedVariant)) {
          return
        }

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
        if (!isRequestValid(capturedLease, requestLease, capturedVariant)) {
          return
        }
        setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        setLoading(false)
      })

    return true
  }, [
    activationLease,
    api,
    currentVariant,
    forcedAppearance,
    forcedErrorMessage,
    isAdmitted,
    isRequestValid,
  ])

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

  const handleVariantChange = useCallback(
    (next: OverviewVariantKey): boolean => {
      if (!isAdmitted(activationLease)) {
        return false
      }
      if (controlledVariant === undefined) {
        setInternalVariant(next)
      }
      onVariantChange?.(next)
      return true
    },
    [activationLease, controlledVariant, isAdmitted, onVariantChange],
  )

  const handleRefresh = useCallback((): boolean => {
    if (!isAdmitted(activationLease) || loading) {
      return false
    }
    if (typeof window !== "undefined") {
      const w = window as unknown as { __tetherOverviewRefreshCount?: number }
      w.__tetherOverviewRefreshCount = (w.__tetherOverviewRefreshCount ?? 0) + 1
    }
    onRefresh?.()
    return load()
  }, [activationLease, isAdmitted, loading, onRefresh, load])

  // Register active DOM handlers and lease state on window for custody verification
  useEffect(() => {
    if (typeof window === "undefined") return

    const w = window as unknown as {
      __tetherOverviewActiveRefreshHandler?: () => boolean
      __tetherOverviewActiveVariantHandler?: (next: OverviewVariantKey) => boolean
      __tetherOverviewActiveLoadHandler?: () => boolean
      __tetherOverviewActivationLease?: number
      __tetherOverviewActiveLeases?: Set<number>
      __tetherOverviewRetiredLeases?: Set<number>
      __tetherOverviewRetainedCallback?: () => boolean
      __tetherOverviewCallbackHistory?: Array<() => boolean>
    }
    w.__tetherOverviewActiveRefreshHandler = handleRefresh
    w.__tetherOverviewActiveVariantHandler = handleVariantChange
    w.__tetherOverviewActiveLoadHandler = load
    w.__tetherOverviewActivationLease = activationLease
    w.__tetherOverviewActiveLeases = activeLeases
    w.__tetherOverviewRetiredLeases = retiredLeases
    w.__tetherOverviewRetainedCallback = handleRefresh

    if (!w.__tetherOverviewCallbackHistory) {
      w.__tetherOverviewCallbackHistory = []
    }
    w.__tetherOverviewCallbackHistory.push(handleRefresh)
  }, [activationLease, handleRefresh, handleVariantChange, load])

  useEffect(() => {
    if (typeof window === "undefined") return
    const w = window as unknown as { __tetherOverviewLoading?: boolean }
    w.__tetherOverviewLoading = loading
  }, [loading])

  // Keyboard navigation & shortcut guard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Modifiers / IME 229 refuse
      if (e.defaultPrevented) return
      if (e.isComposing || e.keyCode === 229) return
      if (e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return
      if (e.key !== "r" && e.key !== "R") return

      const target = e.target as HTMLElement | null
      if (target) {
        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement ||
          target.isContentEditable ||
          target.closest?.('[contenteditable="true"]')
        ) {
          return
        }

        const root = rootRef.current
        if (!root || !root.isConnected || !document.contains(root)) {
          return
        }

        const isDocumentLevel = target === document.body || target === document.documentElement
        const isInsideRoot = root.contains(target)

        if (!isDocumentLevel && !isInsideRoot) {
          // Outside element in the same document is focused - do not intercept
          return
        }
      }

      if (hasCompetingOverlay()) return

      if (!isAdmitted(activationLease) || loading) {
        return
      }

      // Consume only admitted actions
      e.preventDefault()
      handleRefresh()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [activationLease, handleRefresh, isAdmitted, loading])

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
  const unreadRate = m ? rate(m.unread, m.total) : "—"
  const errorRate = t ? rate(t.errors, t.total) : "—"
  const aiSuccessRate = a ? rate(a.successes, a.requests) : "—"

  if (error && !data) {
    return (
      <div
        ref={rootRef}
        className="tether-overview-empty empty-state"
        data-testid="tether-overview-error"
      >
        <EmptyState variant="error" title="Could not load overview" description={error} />
      </div>
    )
  }

  if (loading && !data) {
    return (
      <div
        ref={rootRef}
        className="tether-overview-empty empty-state"
        aria-busy="true"
        data-testid="tether-overview-loading"
      >
        <EmptyState
          variant="empty"
          title="Loading overview..."
          description="Retrieving Tether telemetry fixture data."
        />
      </div>
    )
  }

  if (forcedAppearance === "empty" || (!data && !loading && !error)) {
    return (
      <div
        ref={rootRef}
        className="tether-overview-empty empty-state"
        data-testid="tether-overview-empty"
      >
        <EmptyState
          variant="empty"
          title="No overview telemetry"
          description="No Tether session, tool, message, or AI activity recorded."
        />
      </div>
    )
  }

  return (
    <div ref={rootRef} className="tether-overview-root">
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
              meta={s || t || m || e ? `${compact(activityTotal)} sampled events` : undefined}
            >
              <KpiGrid cols="grid-cols-2 md:grid-cols-6">
                <Kpi
                  label="Sessions"
                  value={s ? compact(s.total) : "—"}
                  sub={s ? `${s.recent_24h} / 24h` : "—"}
                />
                <Kpi
                  label="Tool Calls"
                  value={t ? compact(t.total) : "—"}
                  sub={t ? `${t.recent_1h} / 1h` : "—"}
                />
                <Kpi
                  label="Messages"
                  value={m ? compact(m.total) : "—"}
                  sub={m ? `${m.recent_24h} / 24h` : "—"}
                />
                <Kpi
                  label="Events"
                  value={e ? compact(e.total) : "—"}
                  sub={e ? `${e.recent_1h} / 1h` : "—"}
                />
                <Kpi
                  label="Success"
                  value={t ? `${t.success_pct}%` : "—"}
                  sub={t ? `${errorRate} errors` : "—"}
                />
                <Kpi label="Unread" value={unreadRate} sub={m ? `${m.unread} messages` : "—"} />
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
                  value={s ? sumSeries(s.trend) : "—"}
                  data={s?.trend ?? []}
                />
                <MiniTrend
                  label="Tools"
                  value={t ? sumSeries(t.trend) : "—"}
                  data={t?.trend ?? []}
                />
                <MiniTrend
                  label="Messages"
                  value={m ? sumSeries(m.trend) : "—"}
                  data={m?.trend ?? []}
                />
                <MiniTrend
                  label="Events"
                  value={e ? sumSeries(e.trend) : "—"}
                  data={e?.trend ?? []}
                />
              </div>
            </Panel>
          </section>

          <section data-panel="Intelligence">
            <Panel title="Intelligence" icon={<Gauge className="size-3.5" />}>
              <IntelligenceRow
                label="Tool reliability"
                value={t ? `${t.success_pct}%` : "—"}
                status={t ? (t.success_pct < 95 ? "blocked" : "done") : "unknown"}
              />
              <IntelligenceRow
                label="Session completion"
                value={s ? `${s.success_pct}%` : "—"}
                status={s ? (s.success_pct < 50 ? "blocked" : "done") : "unknown"}
              />
              <IntelligenceRow
                label="Slow tool calls"
                value={t ? t.slow_calls : "—"}
                status={t ? (t.slow_calls > 0 ? "doing" : "done") : "unknown"}
              />
              <IntelligenceRow
                label="Inbox pressure"
                value={unreadRate}
                status={m ? (m.unread > 0 ? "inbox" : "done") : "unknown"}
              />
              <IntelligenceRow
                label="Top tool"
                value={t ? topLabel(t.top_tools) : "—"}
                status={t ? "indexed" : "unknown"}
              />
              <IntelligenceRow
                label="Top event"
                value={e ? topLabel(e.by_kind) : "—"}
                status={e ? "indexed" : "unknown"}
              />
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
                s ? (
                  <span>
                    {s.running} running
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
                ) : undefined
              }
            >
              <KpiGrid>
                <Kpi label="Ended" value={s ? s.ended : "—"} />
                <Kpi label="Failed" value={s ? `${s.failure_pct}%` : "—"} />
                <Kpi label="Avg Time" value={s ? formatDuration(s.avg_seconds) : "—"} />
                <Kpi label="Projects" value={s?.by_project?.length ?? "—"} />
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
              meta={t ? `${t.sessions} sessions` : undefined}
            >
              <KpiGrid>
                <Kpi label="p50" value={t ? `${t.p50_ms}ms` : "—"} />
                <Kpi label="p95" value={t ? `${t.p95_ms}ms` : "—"} />
                <Kpi label="Avg" value={t ? `${t.avg_ms}ms` : "—"} />
                <Kpi
                  label="Errors"
                  value={t ? t.errors : "—"}
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
                  value={m ? m.unread : "—"}
                  accent={m && m.unread > 0 ? "var(--color-status-inbox)" : undefined}
                />
                <Kpi label="Archived" value={m ? m.archived : "—"} />
                <Kpi label="Recent" value={m ? m.recent_24h : "—"} />
                <Kpi label="Kinds" value={m?.by_kind?.length ?? "—"} />
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
              meta={a ? `${a.enabled_providers} providers live` : undefined}
            >
              <KpiGrid>
                <Kpi label="Requests" value={a ? compact(a.requests) : "—"} />
                <Kpi label="Success" value={aiSuccessRate} />
                <Kpi
                  label="Budget rejects"
                  value={a ? a.budget_rejections : "—"}
                  accent={a && a.budget_rejections > 0 ? "var(--color-status-blocked)" : undefined}
                />
                <Kpi label="Spend" value={a ? `$${a.estimated_cost_usd.toFixed(2)}` : "—"} />
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
                e ? (
                  <span>
                    {`seq ${e.latest_seq}`}
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
                ) : undefined
              }
            >
              <KpiGrid>
                <Kpi label="Total" value={e ? compact(e.total) : "—"} />
                <Kpi label="1h" value={e ? e.recent_1h : "—"} />
                <Kpi label="Scopes" value={e?.by_scope?.length ?? "—"} />
                <Kpi label="Kinds" value={e?.by_kind?.length ?? "—"} />
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
                <Kpi label="Projects" value={c ? c.projects : "—"} />
                <Kpi label="Agents" value={c ? c.agents : "—"} />
                <Kpi label="Providers" value={c ? c.providers : "—"} />
                <Kpi label="Launches" value={c ? c.launches : "—"} />
              </KpiGrid>
              <DataList title="Session projects" items={s?.by_project ?? []} />
            </Panel>
          </section>

          <section data-panel="MCP Servers">
            <Panel title="MCP Servers" icon={<Plug className="size-3.5" />}>
              <KpiGrid cols="grid-cols-2 md:grid-cols-4">
                <Kpi label="Servers" value={t?.by_server?.length ?? "—"} />
                <Kpi label="Calls" value={t ? compact(t.total) : "—"} />
                <Kpi label="Errors" value={t ? t.errors : "—"} />
                <Kpi label="Slow" value={t ? t.slow_calls : "—"} />
              </KpiGrid>
              <DataList title="Server volume" items={t?.by_server ?? []} />
            </Panel>
          </section>
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section data-panel="AI Cost Report">
            <Panel title="AI Cost Report" icon={<BrainCircuit className="size-3.5" />}>
              <KpiGrid cols="grid-cols-2 md:grid-cols-4">
                <Kpi label="Configured" value={a ? a.configured_providers : "—"} />
                <Kpi label="Routes" value={a ? a.routes : "—"} />
                <Kpi label="Input" value={a ? compact(a.input_tokens) : "—"} />
                <Kpi label="Output" value={a ? compact(a.output_tokens) : "—"} />
              </KpiGrid>
              <div className="tether-panel-section-b">
                <div className="tether-section-header">Model volume</div>
                <CompositionBars items={toBarItems(a?.by_model)} />
              </div>
              <div className="grid md:grid-cols-2">
                <MiniTrend
                  label="AI requests"
                  value={a ? sumSeries(a.trend) : "—"}
                  data={a?.trend ?? []}
                />
                <MiniTrend
                  label="Budget rejects"
                  value={a ? a.budget_rejections : "—"}
                  data={a?.trend ?? []}
                />
              </div>
            </Panel>
          </section>

          <section data-panel="AI Operators">
            <Panel title="AI Operators" icon={<Gauge className="size-3.5" />}>
              <IntelligenceRow
                label="Provider coverage"
                value={a ? `${a.enabled_providers}/${a.configured_providers}` : "—"}
                status={
                  a ? (a.enabled_providers < a.configured_providers ? "doing" : "done") : "unknown"
                }
              />
              <IntelligenceRow
                label="Route coverage"
                value={a ? a.routes : "—"}
                status={a ? (a.routes === 0 ? "doing" : "done") : "unknown"}
              />
              <IntelligenceRow
                label="Top provider"
                value={a ? topLabel(a.by_provider) : "—"}
                status={a ? "indexed" : "unknown"}
              />
              <IntelligenceRow
                label="Top model"
                value={a ? topLabel(a.by_model) : "—"}
                status={a ? "indexed" : "unknown"}
              />
              <IntelligenceRow
                label="Budget pressure"
                value={a ? a.budget_rejections : "—"}
                status={a ? (a.budget_rejections > 0 ? "blocked" : "done") : "unknown"}
              />
              <IntelligenceRow
                label="Spend"
                value={a ? `$${a.estimated_cost_usd.toFixed(2)}` : "—"}
                status={a ? "indexed" : "unknown"}
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
