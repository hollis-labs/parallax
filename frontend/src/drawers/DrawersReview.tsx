import {
  applyTheme,
  getBuiltinTheme,
  setMode as setTokensMode,
  setTheme as setTokensTheme,
} from "@hollis-labs/design-tokens"
import { Plus, RotateCcw, Shield, Terminal as TerminalIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { ChatPrimaryDrawer } from "./ChatPrimaryDrawer"
import { ChatWorkingDrawer } from "./ChatWorkingDrawer"
import { DRAWER_FIXTURES, FIXTURE_CLOCK_MS } from "./fixtures"
import type { DynamicCardTab } from "./types"
import { useDrawerSession } from "./useDrawerSessionStore"

export const DRAWER_THEMES = [
  { id: "nanite-default", name: "Concrete & Signal" },
  { id: "dir-a", name: "Graphite & Ink" },
  { id: "dir-b", name: "Warm Stone & Steel" },
  { id: "dir-d", name: "Synthwave" },
  { id: "dir-e", name: "Hacker / Terminal" },
  { id: "dir-f", name: "Flat / Mono" },
  { id: "sysop-p4-white", name: "Sysop — P4 White" },
  { id: "sysop-green-phosphor", name: "Sysop — Green Phosphor" },
  { id: "sysop-amber-phosphor", name: "Sysop — Amber Phosphor" },
  { id: "sysop-hi-contrast", name: "Sysop — High Contrast" },
] as const

export interface DrawersReviewProps {
  initialSessionId?: string
  initialTheme?: string
  initialMode?: "light" | "dark"
  developerModeDefault?: boolean
}

export function DrawersReview({
  initialSessionId = "CHAT-001",
  initialTheme = "nanite-default",
  initialMode = "dark",
  developerModeDefault = false,
}: DrawersReviewProps) {
  const [sessionId, setSessionId] = useState(initialSessionId)
  const [theme, setTheme] = useState(initialTheme)
  const [mode, setMode] = useState<"light" | "dark">(initialMode)
  const [developerMode, setDeveloperMode] = useState(developerModeDefault)

  // Alert simulation states
  const [sessionTakeover, setSessionTakeover] = useState(false)
  const [circuitOpen, setCircuitOpen] = useState(false)
  const [interruptedTurn, setInterruptedTurn] = useState(false)

  // Card tab creation counter for deterministic IDs
  const [cardCounter, setCardCounter] = useState(1)

  useEffect(() => {
    const builtin = getBuiltinTheme(theme)
    if (builtin) {
      applyTheme(builtin, mode)
    }
    setTokensTheme(theme)
    setTokensMode(mode)
  }, [theme, mode])

  const session = useDrawerSession(sessionId)

  const handleAddDynamicCard = () => {
    const existingNums = session.workingDrawer.cardTabs
      .map((t) => {
        const m = t.label.match(/Specimen (\d+)/)
        return m ? Number.parseInt(m[1], 10) : 0
      })
      .filter((n) => !Number.isNaN(n))
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : cardCounter

    const id = `card:dynamic-specimen-${nextNum}`
    const newTab: DynamicCardTab = {
      id,
      label: `Specimen ${nextNum}`,
      payload: {
        specimenId: id,
        createdAt: "2026-10-04T14:30:00Z",
        status: "active",
        details: `Dynamic card tab payload for ${sessionId}`,
      },
      focused: true,
      pinned: false,
      createdAt: FIXTURE_CLOCK_MS + nextNum * 1000,
    }
    session.appendCardTab(newTab)
    setCardCounter(nextNum + 1)
  }

  return (
    <div
      className="drawers-review min-h-screen bg-bg text-fg flex flex-col"
      data-testid="drawers-review"
    >
      {/* Controls Bar */}
      <header className="review-controls border-b border-border bg-bg-elevated p-3 flex flex-wrap items-center gap-3 text-caption">
        <label className="flex items-center gap-2 font-semibold text-fg">
          Session:
          <select
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="px-2 py-1 rounded-control bg-bg border border-border text-fg font-mono text-caption"
            aria-label="Active session for drawer persistence"
          >
            {Object.keys(DRAWER_FIXTURES).map((id) => (
              <option key={id} value={id}>
                {id} ({DRAWER_FIXTURES[id].sessionTitle})
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 font-semibold text-fg">
          Theme:
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="px-2 py-1 rounded-control bg-bg border border-border text-fg text-caption"
            aria-label="Preview theme"
          >
            {DRAWER_THEMES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 font-semibold text-fg">
          Mode:
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "light" | "dark")}
            className="px-2 py-1 rounded-control bg-bg border border-border text-fg text-caption"
            aria-label="Theme mode"
          >
            <option value="dark">dark</option>
            <option value="light">light</option>
          </select>
        </label>

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={() => session.setPrimaryDrawer({ open: !session.primaryDrawer.open })}
            className={`px-2.5 py-1 rounded-control border text-caption transition-colors ${
              session.primaryDrawer.open
                ? "bg-primary text-bg border-primary font-medium"
                : "border-border text-fg hover:bg-surface"
            }`}
            aria-label="Toggle primary drawer"
          >
            Top Primary ({session.primaryDrawer.open ? "Open" : "Closed"})
          </button>

          <button
            type="button"
            onClick={() => session.setWorkingDrawer({ open: !session.workingDrawer.open })}
            className={`px-2.5 py-1 rounded-control border text-caption transition-colors ${
              session.workingDrawer.open
                ? "bg-primary text-bg border-primary font-medium"
                : "border-border text-fg hover:bg-surface"
            }`}
            aria-label="Toggle working drawer"
          >
            Bottom Working ({session.workingDrawer.open ? "Open" : "Closed"})
          </button>

          <button
            type="button"
            onClick={handleAddDynamicCard}
            className="flex items-center gap-1 px-2.5 py-1 rounded-control border border-border text-caption hover:bg-surface text-fg"
            aria-label="Add dynamic card tab"
          >
            <Plus className="size-3.5" />
            Add Card Tab
          </button>

          <button
            type="button"
            onClick={() => setDeveloperMode(!developerMode)}
            className={`flex items-center gap-1 px-2 py-1 rounded-control border text-caption ${
              developerMode
                ? "bg-surface text-fg border-border"
                : "border-border text-fg-muted hover:text-fg"
            }`}
            aria-label="Toggle developer mode"
          >
            <TerminalIcon className="size-3.5" />
            Dev Mode
          </button>

          <button
            type="button"
            onClick={session.resetSession}
            className="p-1 text-fg-muted hover:text-fg rounded-control"
            title="Reset this session's drawers"
            aria-label="Reset session drawers"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      </header>

      {/* Alert Simulation Sub-bar */}
      <div className="bg-surface/40 border-b border-border px-3 py-1.5 flex items-center gap-3 text-micro text-fg-muted">
        <span className="font-semibold text-fg flex items-center gap-1">
          <Shield className="size-3" />
          Simulate Alerts:
        </span>
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={sessionTakeover}
            onChange={(e) => setSessionTakeover(e.target.checked)}
            aria-label="Simulate session takeover alert"
          />
          Session Takeover
        </label>
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={circuitOpen}
            onChange={(e) => setCircuitOpen(e.target.checked)}
            aria-label="Simulate circuit open alert"
          />
          Circuit Open (Rate Limit)
        </label>
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={interruptedTurn}
            onChange={(e) => setInterruptedTurn(e.target.checked)}
            aria-label="Simulate interrupted turn alert"
          />
          Interrupted Turn
        </label>
      </div>

      {/* Main Canvas Area */}
      <main className="flex-1 flex flex-col justify-between max-w-3xl w-full mx-auto p-4 min-h-0 relative">
        {/* Top Drawer: ChatPrimaryDrawer */}
        <ChatPrimaryDrawer
          sessionId={sessionId}
          open={session.primaryDrawer.open}
          onOpenChange={(open) => session.setPrimaryDrawer({ open })}
          height={session.primaryDrawer.height}
          onHeightChange={(height) => session.setPrimaryDrawer({ height })}
          activeTab={session.primaryDrawer.activeTab}
          onSelectTab={(tab) => session.setPrimaryDrawer({ activeTab: tab })}
          pinnedCards={session.primaryDrawer.pinnedCards}
          onUnpinCard={session.unpinPrimaryCard}
        />

        {/* Central Mock Transcript Area */}
        <section
          className="flex-1 my-3 p-4 rounded-panel border border-border/60 bg-surface/20 min-h-24 overflow-y-auto flex flex-col justify-between"
          aria-label="Conversation column preview"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-caption text-fg-muted border-b border-border/40 pb-2">
              <span className="font-mono">{sessionId} Transcript</span>
              <span className="text-micro font-mono">14:30:00Z</span>
            </div>

            <div className="p-3 rounded-control bg-bg border border-border/60 max-w-lg">
              <p className="text-caption text-fg">
                Reviewing candidate top/bottom resizable tabbed drawers for project Parallax.
              </p>
            </div>

            <div className="p-3 rounded-control bg-bg-elevated border border-border/60 max-w-lg ml-auto">
              <p className="text-caption text-fg">
                Top primary drawer has Documents, Reports, Diffs, Tools, and Pins. Bottom working
                drawer has Scratchpad, Terminals, Artifacts, Runtime, Context, and dynamic card
                tabs.
              </p>
            </div>
          </div>

          <div
            data-testid="chat-composer-tail"
            className="text-center text-micro text-fg-muted font-mono pt-4"
          >
            Per-session layout persistence active · Session: {sessionId} · Primary:{" "}
            {session.primaryDrawer.open
              ? `${Math.round(session.primaryDrawer.height)}px`
              : "closed"}{" "}
            · Working:{" "}
            {session.workingDrawer.open
              ? `${Math.round(session.workingDrawer.height)}px`
              : "closed"}
          </div>
        </section>

        {/* Bottom Drawer: ChatWorkingDrawer */}
        <ChatWorkingDrawer
          sessionId={sessionId}
          open={session.workingDrawer.open}
          onOpenChange={(open) => session.setWorkingDrawer({ open })}
          height={session.workingDrawer.height}
          onHeightChange={(height) => session.setWorkingDrawer({ height })}
          activeTab={session.workingDrawer.activeTab}
          onSelectTab={(tab) => session.setWorkingDrawer({ activeTab: tab })}
          cardTabs={session.workingDrawer.cardTabs}
          onRemoveCardTab={session.removeCardTab}
          onTogglePinCardTab={session.togglePinCardTab}
          developerMode={developerMode}
          sessionTakeover={sessionTakeover}
          circuitOpen={circuitOpen}
          interruptedTurn={interruptedTurn}
          onRetryAlert={() => setCircuitOpen(false)}
          onDismissAlert={() => {
            setSessionTakeover(false)
            setCircuitOpen(false)
            setInterruptedTurn(false)
          }}
        />

        {/* Mock Composer */}
        <footer className="mt-2 p-2 rounded-control border border-border bg-bg flex items-center justify-between text-caption text-fg-muted">
          <span>Mock chat composer (input ready)</span>
          <span className="font-mono text-micro">Mod+L</span>
        </footer>
      </main>
    </div>
  )
}
