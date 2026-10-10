import {
  Activity,
  AlertTriangle,
  Code,
  FileCode,
  Layers,
  Pin,
  PinOff,
  RefreshCw,
  Terminal,
  X,
} from "lucide-react"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react"
import { type DrawerFixtureSet, getDrawerFixtures } from "./fixtures"
import { DRAWER_GEOMETRY } from "./geometry"
import { ResizableTabbedDrawer } from "./ResizableTabbedDrawer"
import type { ChatDrawerTab, DynamicCardTab } from "./types"

const FIXED_TABS: { id: string; label: string; devOnly?: boolean }[] = [
  { id: "scratchpad", label: "Scratchpad" },
  { id: "terminal-1", label: "Terminal 1" },
  { id: "terminal-2", label: "Terminal 2", devOnly: true },
  { id: "artifacts", label: "Artifacts" },
  { id: "runtime", label: "Runtime" },
  { id: "session-context", label: "Session Context" },
]

export interface ChatWorkingDrawerProps {
  sessionId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  height: number
  onHeightChange: (height: number) => void
  activeTab: string
  onSelectTab: (tab: string) => void
  cardTabs?: DynamicCardTab[]
  onRemoveCardTab?: (tabId: string) => void
  onTogglePinCardTab?: (tabId: string) => void
  developerMode?: boolean
  sessionTakeover?: boolean
  circuitOpen?: boolean
  interruptedTurn?: boolean
  onRetryAlert?: () => void
  onDismissAlert?: () => void
  className?: string
  fixtures?: DrawerFixtureSet
}

export function ChatWorkingDrawer({
  sessionId = "CHAT-001",
  open,
  onOpenChange,
  height,
  onHeightChange,
  activeTab: requestedActiveTab = "scratchpad",
  onSelectTab,
  cardTabs = [],
  onRemoveCardTab,
  onTogglePinCardTab,
  developerMode = false,
  sessionTakeover = false,
  circuitOpen = false,
  interruptedTurn = false,
  onRetryAlert,
  onDismissAlert,
  className = "",
  fixtures: overrideFixtures,
}: ChatWorkingDrawerProps) {
  const fixtures = overrideFixtures ?? getDrawerFixtures(sessionId)
  const isAlertActive = sessionTakeover || circuitOpen || interruptedTurn
  const wasOpenBeforeAlert = useRef<boolean | null>(null)

  // Auto-open on alert, restore on dismiss
  useEffect(() => {
    if (isAlertActive && wasOpenBeforeAlert.current === null) {
      wasOpenBeforeAlert.current = open
      if (!open) onOpenChange(true)
    } else if (!isAlertActive && wasOpenBeforeAlert.current !== null) {
      const prior = wasOpenBeforeAlert.current
      wasOpenBeforeAlert.current = null
      if (!prior) onOpenChange(false)
    }
  }, [isAlertActive, open, onOpenChange])

  const visibleFixedTabs = useMemo(() => {
    return developerMode ? FIXED_TABS : FIXED_TABS.filter((t) => !t.devOnly)
  }, [developerMode])

  const activeTab =
    visibleFixedTabs.some((t) => t.id === requestedActiveTab) ||
    cardTabs.some((t) => t.id === requestedActiveTab)
      ? requestedActiveTab
      : "scratchpad"

  const allTabs: ChatDrawerTab[] = useMemo(() => {
    const fixed: ChatDrawerTab[] = visibleFixedTabs.map((t) => ({
      id: t.id,
      label: t.label,
      active: activeTab === t.id,
    }))

    const dynamic: ChatDrawerTab[] = cardTabs.map((c) => ({
      id: c.id,
      label: c.label,
      active: activeTab === c.id,
      closeable: !c.pinned,
      pinnable: true,
      pinned: c.pinned,
    }))

    return [...fixed, ...dynamic]
  }, [visibleFixedTabs, cardTabs, activeTab])

  const alertDismissButtonRef = useRef<HTMLButtonElement>(null)
  const wasAlertActiveRef = useRef(isAlertActive)

  const alertContent = isAlertActive ? (
    <div
      className="p-4 rounded-panel border border-warning/40 bg-surface shadow-lg text-fg focus:outline-none"
      role="alertdialog"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-desc"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="size-5 text-warning shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 id="alert-dialog-title" className="text-sm font-semibold text-fg">
            {sessionTakeover
              ? "This session is now active in another tab"
              : circuitOpen
                ? "Provider rate limited after multiple retries"
                : "Session interrupted (service restarted)"}
          </h3>
          <p id="alert-dialog-desc" className="text-caption text-fg-muted mt-1 leading-normal">
            {sessionTakeover
              ? "The streaming connection moved to a newer tab. Reconnect here to resume."
              : circuitOpen
                ? "The API provider returned rate limit errors. Retry, or dismiss to continue."
                : "The agent generating this turn was stopped when the service restarted mid-turn."}
          </p>
          <div className="flex items-center gap-2 mt-3">
            {circuitOpen && onRetryAlert && (
              <button
                type="button"
                onClick={onRetryAlert}
                className="flex items-center gap-1.5 px-3 py-1 rounded-control bg-primary text-bg font-medium text-caption hover:opacity-90 transition-opacity focus-visible:ring-1 focus-visible:ring-primary"
              >
                <RefreshCw className="size-3" />
                Retry
              </button>
            )}
            {onDismissAlert && (
              <button
                ref={alertDismissButtonRef}
                type="button"
                onClick={onDismissAlert}
                className="px-3 py-1 rounded-control border border-border text-fg text-caption hover:bg-surface transition-colors focus-visible:ring-1 focus-visible:ring-primary"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : null

  useEffect(() => {
    if (isAlertActive && open) {
      alertDismissButtonRef.current?.focus()
    } else if (wasAlertActiveRef.current && !isAlertActive) {
      sidebarButtonRefs.current.get(activeTab)?.focus()
    }
    wasAlertActiveRef.current = isAlertActive
  }, [isAlertActive, activeTab, open])

  const sidebarButtonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())
  const pendingSidebarFocusTabIdRef = useRef<string | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      pendingSidebarFocusTabIdRef.current = null
    }
  }, [])

  useLayoutEffect(() => {
    if (!isMountedRef.current) return
    void allTabs
    const targetId = pendingSidebarFocusTabIdRef.current
    if (!targetId) return
    const btn = sidebarButtonRefs.current.get(targetId)
    if (btn) {
      pendingSidebarFocusTabIdRef.current = null
      btn.focus()
    }
  }, [allTabs])

  const handleCloseTab = useCallback(
    (tabId: string) => {
      if (!onRemoveCardTab) return
      const removingIndex = allTabs.findIndex((t) => t.id === tabId)
      const wasActive = activeTab === tabId
      let nextFocusId: string | null = null

      if (wasActive) {
        const prevTab = allTabs[removingIndex - 1] ?? allTabs[removingIndex + 1]
        nextFocusId = prevTab?.id || "scratchpad"
        onSelectTab(nextFocusId)
      } else {
        const nextTab = allTabs[removingIndex + 1] ?? allTabs[removingIndex - 1]
        nextFocusId = activeTab || nextTab?.id || "scratchpad"
      }

      pendingSidebarFocusTabIdRef.current = nextFocusId
      onRemoveCardTab(tabId)
    },
    [onRemoveCardTab, activeTab, onSelectTab, allTabs],
  )

  const handleSidebarKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isAlertActive) return
    if (e.defaultPrevented || e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
    const target = e.target as HTMLElement | null
    if (target?.getAttribute("role") !== "tab") return

    const activeIndex = allTabs.findIndex((t) => t.active)
    let nextIndex = -1

    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault()
      nextIndex = activeIndex < allTabs.length - 1 ? activeIndex + 1 : 0
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault()
      nextIndex = activeIndex > 0 ? activeIndex - 1 : allTabs.length - 1
    } else if (e.key === "Home") {
      e.preventDefault()
      nextIndex = 0
    } else if (e.key === "End") {
      e.preventDefault()
      nextIndex = allTabs.length - 1
    }

    if (nextIndex >= 0 && nextIndex < allTabs.length) {
      const nextTab = allTabs[nextIndex]
      onSelectTab(nextTab.id)
      const btn = sidebarButtonRefs.current.get(nextTab.id)
      btn?.focus()
    }
  }

  // 2-column sidebar element
  const sidebarElement = (
    <div
      className="flex flex-col gap-0.5 p-1.5"
      role="tablist"
      aria-orientation="vertical"
      aria-label="Working drawer tabs"
      onKeyDown={handleSidebarKeyDown}
    >
      {allTabs.map((t) => (
        <div
          key={t.id}
          className={`group relative flex items-center justify-between gap-1 px-2 py-1 rounded-control font-mono text-caption tracking-wide transition-colors ${
            t.active
              ? "bg-bg-elevated text-fg shadow-sm font-semibold"
              : "text-fg-muted hover:bg-bg-elevated/60 hover:text-fg-secondary"
          }`}
        >
          <button
            ref={(el) => {
              if (el) sidebarButtonRefs.current.set(t.id, el)
              else sidebarButtonRefs.current.delete(t.id)
            }}
            type="button"
            role="tab"
            id={`tab-working-${t.id}`}
            aria-controls={`panel-working-${t.id}`}
            aria-selected={t.active}
            tabIndex={isAlertActive ? -1 : t.active ? 0 : -1}
            disabled={isAlertActive}
            aria-disabled={isAlertActive ? true : undefined}
            onClick={() => {
              if (isAlertActive) return
              onSelectTab(t.id)
            }}
            onKeyDown={(e) => {
              if (isAlertActive) {
                e.preventDefault()
              }
            }}
            title={t.label}
            className="flex-1 min-w-0 flex items-center gap-1.5 outline-none text-left truncate focus-visible:ring-1 focus-visible:ring-primary rounded-sm"
          >
            <span className="truncate">{t.label}</span>
            {t.runningPip && (
              <span className="size-1.5 rounded-full bg-warning animate-pulse shrink-0" />
            )}
          </button>

          {t.pinnable && onTogglePinCardTab && (
            <button
              type="button"
              disabled={isAlertActive}
              onClick={() => onTogglePinCardTab(t.id)}
              className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity p-0.5 text-fg-muted hover:text-fg rounded-sm shrink-0"
              aria-label={t.pinned ? `Unpin ${t.label}` : `Pin ${t.label}`}
            >
              {t.pinned ? <PinOff className="size-3" /> : <Pin className="size-3" />}
            </button>
          )}

          {t.closeable && (
            <button
              type="button"
              disabled={isAlertActive}
              onClick={() => handleCloseTab(t.id)}
              className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity p-0.5 text-fg-muted hover:text-fg rounded-sm shrink-0"
              aria-label={`Close tab ${t.label}`}
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <ResizableTabbedDrawer
      placement="bottom"
      open={open}
      onOpenChange={onOpenChange}
      height={height}
      onHeightChange={onHeightChange}
      defaultHeight={DRAWER_GEOMETRY.workingDefault}
      minHeight={DRAWER_GEOMETRY.minimum}
      maxHeight={DRAWER_GEOMETRY.maximum}
      tabs={allTabs}
      activeTab={activeTab}
      onSelectTab={onSelectTab}
      onCloseTab={handleCloseTab}
      onTogglePinTab={onTogglePinCardTab}
      tabStripVariant="inline"
      showTabStrip={false}
      sidebar={sidebarElement}
      alert={alertContent}
      isAlertActive={isAlertActive}
      title="Working Drawer"
      className={className}
    >
      <div
        role="tabpanel"
        id={`panel-working-${activeTab}`}
        aria-labelledby={`tab-working-${activeTab}`}
        className="p-3 text-sm text-fg min-h-0 flex-1 flex flex-col h-full overflow-y-auto"
      >
        {fixtures.availability === "unavailable" ? (
          <p role="status" className="text-caption text-fg-muted">
            Session data unavailable for {sessionId}.
          </p>
        ) : (
          <>
            {activeTab === "scratchpad" && <ScratchpadPanel content={fixtures.scratchpadContent} />}
            {activeTab === "terminal-1" && (
              <TerminalPanel title="Terminal 1" output={fixtures.terminal1Output} />
            )}
            {activeTab === "terminal-2" && (
              <TerminalPanel
                title="Terminal 2 (Developer Mode)"
                output={fixtures.terminal2Output}
              />
            )}
            {activeTab === "artifacts" && <ArtifactsPanel artifacts={fixtures.artifacts} />}
            {activeTab === "runtime" && <RuntimePanel feed={fixtures.runtimeFeed} />}
            {activeTab === "session-context" && (
              <SessionContextPanel
                usage={fixtures.tokenUsage}
                slots={fixtures.contextSlots}
                sessionId={sessionId}
              />
            )}
            {activeTab.startsWith("card:") && (
              <DynamicCardPanelView card={cardTabs.find((c) => c.id === activeTab)} />
            )}
          </>
        )}
      </div>
    </ResizableTabbedDrawer>
  )
}

function ScratchpadPanel({ content }: { content: string }) {
  return (
    <div className="space-y-2 flex-1 flex flex-col">
      <div className="flex items-center justify-between pb-1 border-b border-border">
        <span className="text-caption font-semibold uppercase tracking-wide text-fg-muted flex items-center gap-1.5">
          <FileCode className="size-3.5" />
          Session Scratchpad
        </span>
        <span className="text-micro font-mono text-fg-muted">Markdown enabled</span>
      </div>
      <div className="flex-1 min-h-0 p-2.5 rounded-control border border-border bg-bg font-mono text-caption text-fg overflow-y-auto whitespace-pre-wrap leading-relaxed">
        {content}
      </div>
    </div>
  )
}

function TerminalPanel({ title, output }: { title: string; output: string[] }) {
  return (
    <div className="space-y-2 flex-1 flex flex-col">
      <div className="flex items-center justify-between pb-1 border-b border-border">
        <span className="text-caption font-semibold uppercase tracking-wide text-fg-muted flex items-center gap-1.5">
          <Terminal className="size-3.5" />
          {title}
        </span>
        <span className="text-micro font-mono text-fg-muted">interactive shell</span>
      </div>
      <div className="flex-1 min-h-0 p-2.5 rounded-control border border-border bg-bg font-mono text-micro text-fg overflow-y-auto space-y-1">
        {output.map((line, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: terminal buffer lines are ordered output stream
          <div key={`${line}-${i}`} className="leading-snug">
            {line.startsWith("$") ? (
              <span className="text-primary font-semibold">{line}</span>
            ) : line.startsWith("[error]") ? (
              <span className="text-danger">{line}</span>
            ) : line.startsWith("[debug]") ? (
              <span className="text-fg-secondary">{line}</span>
            ) : (
              <span>{line}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ArtifactsPanel({ artifacts }: { artifacts: DrawerFixtureSet["artifacts"] }) {
  if (artifacts.length === 0) {
    return <p className="text-fg-muted text-sm py-4 text-center">No artifacts in this session.</p>
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between pb-1 border-b border-border">
        <span className="text-caption font-semibold uppercase tracking-wide text-fg-muted flex items-center gap-1.5">
          <Layers className="size-3.5" />
          Artifacts & Assets ({artifacts.length})
        </span>
      </div>
      <div className="grid gap-2">
        {artifacts.map((art) => (
          <div
            key={art.id}
            className="p-2.5 rounded-control border border-border bg-surface/50 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <span className="font-mono text-caption font-semibold text-fg flex items-center gap-1.5">
                <FileCode className="size-3.5 text-fg-muted" />
                {art.name}
              </span>
              <p className="text-micro font-mono text-fg-muted truncate">{art.hash}</p>
            </div>
            <div className="flex items-center gap-2 font-mono text-micro text-fg-muted shrink-0">
              <span>{Math.round(art.sizeBytes / 1024)}KB</span>
              <span>{art.createdTime.slice(11, 16)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RuntimePanel({ feed }: { feed: DrawerFixtureSet["runtimeFeed"] }) {
  if (feed.length === 0) {
    return <p className="text-fg-muted text-sm py-4 text-center">No runtime activity recorded.</p>
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between pb-1 border-b border-border">
        <span className="text-caption font-semibold uppercase tracking-wide text-fg-muted flex items-center gap-1.5">
          <Activity className="size-3.5" />
          Runtime Activity Feed ({feed.length})
        </span>
        <span className="text-micro font-mono text-fg-muted">live stream</span>
      </div>
      <div className="space-y-1.5">
        {feed.map((item) => (
          <div
            key={item.id}
            className="p-2 rounded-control border border-border bg-surface/40 flex items-start justify-between gap-2"
          >
            <div className="min-w-0 flex items-start gap-2">
              <span
                className={`size-2 rounded-full mt-1 shrink-0 ${
                  item.level === "info"
                    ? "bg-info"
                    : item.level === "warn"
                      ? "bg-warning"
                      : "bg-danger"
                }`}
              />
              <span className="text-caption text-fg">{item.message}</span>
            </div>
            <span className="font-mono text-micro text-fg-muted shrink-0">
              {item.timestamp.slice(11, 19)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SessionContextPanel({
  usage,
  slots,
  sessionId,
}: {
  usage: DrawerFixtureSet["tokenUsage"]
  slots: DrawerFixtureSet["contextSlots"]
  sessionId: string
}) {
  const pct = Math.round((usage.used / usage.ceiling) * 100)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-border">
        <span className="text-caption font-semibold uppercase tracking-wide text-fg-muted flex items-center gap-1.5">
          <Code className="size-3.5" />
          Session Context & Budget
        </span>
        <span className="text-micro font-mono text-fg-muted">session={sessionId}</span>
      </div>

      <div className="p-3 rounded-control border border-border bg-surface/50 space-y-2">
        <div className="flex items-center justify-between text-caption font-mono">
          <span className="text-fg-muted">Tokens:</span>
          <span className="font-semibold text-fg">
            {usage.used.toLocaleString()} / {usage.ceiling.toLocaleString()} ({pct}%)
          </span>
        </div>
        <div className="w-full h-1.5 bg-bg rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex items-center justify-between text-micro text-fg-muted">
          <span>Estimated cost: {usage.estimatedCost}</span>
          <span>Budget ceiling: {usage.ceiling.toLocaleString()}</span>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-micro font-semibold uppercase tracking-wide text-fg-muted">
          Prompt Slots
        </span>
        <div className="grid gap-1.5">
          {slots.map((slot) => (
            <div
              key={slot.name}
              className="p-2 rounded-control border border-border bg-bg flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <span className="font-mono text-caption font-semibold text-fg flex items-center gap-1.5">
                  {slot.name}
                  {slot.compactable ? (
                    <span className="px-1 rounded-sm bg-surface text-micro font-normal text-fg-muted">
                      compactable
                    </span>
                  ) : (
                    <span className="px-1 rounded-sm bg-primary/20 text-micro font-normal text-primary">
                      pinned slot
                    </span>
                  )}
                </span>
                <p className="text-micro text-fg-muted">{slot.description}</p>
              </div>
              <span className="font-mono text-caption font-medium text-fg shrink-0">
                {slot.tokens} tok
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DynamicCardPanelView({ card }: { card?: DynamicCardTab }) {
  if (!card) {
    return <p className="text-fg-muted text-sm py-4 text-center">Card tab content unavailable.</p>
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-border">
        <span className="text-caption font-semibold text-fg flex items-center gap-1.5">
          <Pin className="size-3.5 text-primary" />
          {card.label}
        </span>
        <span className="text-micro font-mono text-fg-muted">{card.id}</span>
      </div>
      <div className="p-3 rounded-control border border-border bg-bg">
        <pre className="text-micro font-mono text-fg overflow-x-auto leading-relaxed">
          {JSON.stringify(card.payload, null, 2)}
        </pre>
      </div>
    </div>
  )
}
