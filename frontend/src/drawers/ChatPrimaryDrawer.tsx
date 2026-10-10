import { ClipboardList, FileText, GitCompare, Pin, PinOff, Trash2, Wrench } from "lucide-react"
import { useMemo } from "react"
import { type DrawerFixtureSet, getDrawerFixtures } from "./fixtures"
import { ResizableTabbedDrawer } from "./ResizableTabbedDrawer"
import type { ChatDrawerTab, DrawerPinnedCard } from "./types"

export interface ChatPrimaryDrawerProps {
  sessionId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  height: number
  onHeightChange: (height: number) => void
  activeTab: string
  onSelectTab: (tab: string) => void
  pinnedCards?: DrawerPinnedCard[]
  onUnpinCard?: (cardId: string) => void
  className?: string
  fixtures?: DrawerFixtureSet
}

export function ChatPrimaryDrawer({
  sessionId = "CHAT-001",
  open,
  onOpenChange,
  height,
  onHeightChange,
  activeTab = "documents",
  onSelectTab,
  pinnedCards = [],
  onUnpinCard,
  className = "",
  fixtures: overrideFixtures,
}: ChatPrimaryDrawerProps) {
  const fixtures = overrideFixtures ?? getDrawerFixtures(sessionId)

  const hasRunningTool = fixtures.toolCalls.some((tc) => tc.status === "running")

  const tabs: ChatDrawerTab[] = useMemo(() => {
    const defaultTabs: ChatDrawerTab[] = [
      {
        id: "documents",
        label: "Documents",
        active: activeTab === "documents",
        count: fixtures.documents.length,
        icon: <FileText className="size-3.5" />,
      },
      {
        id: "reports",
        label: "Reports",
        active: activeTab === "reports",
        count: fixtures.reports.length,
        icon: <ClipboardList className="size-3.5" />,
      },
      {
        id: "diffs",
        label: "Diffs",
        active: activeTab === "diffs",
        count: fixtures.diffs.length,
        icon: <GitCompare className="size-3.5" />,
      },
      {
        id: "tools",
        label: "Tools",
        active: activeTab === "tools",
        count: fixtures.toolCalls.length,
        runningPip: hasRunningTool,
        icon: <Wrench className="size-3.5" />,
      },
      {
        id: "pins",
        label: "Pins",
        active: activeTab === "pins",
        count: (fixtures.pinnedCards?.length ?? 0) + pinnedCards.length,
        icon: <Pin className="size-3.5" />,
      },
    ]

    const allPinned = [...(fixtures.pinnedCards ?? []), ...pinnedCards]
    const pinnedTabs: ChatDrawerTab[] = allPinned.map((card) => ({
      id: `pin:${card.id}`,
      label: card.title || `Pin ${card.id}`,
      active: activeTab === `pin:${card.id}`,
      pinnable: true,
      pinned: true,
      icon: <Pin className="size-3 text-primary" />,
    }))

    return [...defaultTabs, ...pinnedTabs]
  }, [activeTab, fixtures, hasRunningTool, pinnedCards])

  const handleTogglePin = (tabId: string) => {
    if (tabId.startsWith("pin:") && onUnpinCard) {
      onUnpinCard(tabId.slice(4))
    }
  }

  return (
    <ResizableTabbedDrawer
      placement="top"
      open={open}
      onOpenChange={onOpenChange}
      height={height}
      onHeightChange={onHeightChange}
      defaultHeight={240}
      minHeight={48}
      maxHeight={600}
      tabs={tabs}
      activeTab={activeTab}
      onSelectTab={onSelectTab}
      onTogglePinTab={handleTogglePin}
      tabStripVariant="card"
      title="Primary Drawer"
      className={className}
    >
      <div className="p-3 text-sm text-fg min-h-0 flex-1 flex flex-col">
        {activeTab === "documents" && <DocumentsPanel documents={fixtures.documents} />}
        {activeTab === "reports" && <ReportsPanel reports={fixtures.reports} />}
        {activeTab === "diffs" && <DiffsPanel diffs={fixtures.diffs} />}
        {activeTab === "tools" && <ToolsPanel toolCalls={fixtures.toolCalls} />}
        {activeTab === "pins" && (
          <PinsPanel
            pinnedCards={[...(fixtures.pinnedCards ?? []), ...pinnedCards]}
            onUnpin={onUnpinCard}
            onSelectTab={onSelectTab}
          />
        )}
        {activeTab.startsWith("pin:") && (
          <PinnedCardView
            card={[...(fixtures.pinnedCards ?? []), ...pinnedCards].find(
              (c) => `pin:${c.id}` === activeTab,
            )}
            onUnpin={onUnpinCard}
          />
        )}
      </div>
    </ResizableTabbedDrawer>
  )
}

function DocumentsPanel({ documents }: { documents: DrawerFixtureSet["documents"] }) {
  if (documents.length === 0) {
    return <p className="text-fg-muted text-sm py-4 text-center">No documents in this session.</p>
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-border">
        <span className="text-caption font-semibold uppercase tracking-wide text-fg-muted">
          Session Documents ({documents.length})
        </span>
        <span className="text-micro text-fg-muted">Excluded from agent context by default</span>
      </div>
      <div className="grid gap-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="p-2.5 rounded-control border border-border bg-surface/50 hover:bg-surface/80 transition-colors"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-mono text-caption font-semibold text-fg flex items-center gap-1.5">
                <FileText className="size-3.5 text-fg-muted" />
                {doc.name}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded-sm bg-bg text-micro text-fg-muted font-mono">
                  {doc.scope}
                </span>
                <span className="px-1.5 py-0.5 rounded-sm bg-bg text-micro text-fg-muted font-mono">
                  {Math.round(doc.sizeBytes / 1024)}KB
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded-sm text-micro font-medium ${
                    doc.included ? "bg-primary/20 text-primary" : "bg-surface text-fg-muted"
                  }`}
                >
                  {doc.included ? "Included" : "Withheld"}
                </span>
              </div>
            </div>
            <pre className="text-micro font-mono text-fg-muted bg-bg p-2 rounded-sm overflow-x-auto max-h-24">
              {doc.content}
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReportsPanel({ reports }: { reports: DrawerFixtureSet["reports"] }) {
  if (reports.length === 0) {
    return <p className="text-fg-muted text-sm py-4 text-center">No reports available.</p>
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-border">
        <span className="text-caption font-semibold uppercase tracking-wide text-fg-muted">
          Reports & Metrics ({reports.length})
        </span>
      </div>
      <div className="grid gap-2">
        {reports.map((rep) => (
          <div
            key={rep.id}
            className="p-2.5 rounded-control border border-border bg-surface/50 flex items-start justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-caption font-semibold text-fg">{rep.title}</span>
                <span className="px-1.5 py-0.2 rounded-sm bg-bg text-micro text-fg-muted font-mono">
                  {rep.category}
                </span>
              </div>
              <p className="text-caption text-fg-muted">{rep.summary}</p>
            </div>
            <div className="text-right shrink-0">
              <span className="font-mono text-sm font-semibold text-fg">{rep.metric}</span>
              <div className="mt-0.5">
                <span
                  className={`inline-block size-2 rounded-full ${
                    rep.status === "ok"
                      ? "bg-success"
                      : rep.status === "warn"
                        ? "bg-warning"
                        : "bg-danger"
                  }`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DiffsPanel({ diffs }: { diffs: DrawerFixtureSet["diffs"] }) {
  if (diffs.length === 0) {
    return (
      <p className="text-fg-muted text-sm py-4 text-center">No diffs recorded in this session.</p>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-border">
        <span className="text-caption font-semibold uppercase tracking-wide text-fg-muted">
          Active Diffs ({diffs.length})
        </span>
      </div>
      <div className="grid gap-2">
        {diffs.map((diff) => (
          <div key={diff.id} className="p-2.5 rounded-control border border-border bg-surface/50">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-mono text-caption font-medium text-fg flex items-center gap-1.5">
                <GitCompare className="size-3.5 text-fg-muted" />
                {diff.file}
              </span>
              <div className="flex items-center gap-1.5 font-mono text-micro">
                <span className="text-success">+{diff.additions}</span>
                <span className="text-danger">-{diff.deletions}</span>
              </div>
            </div>
            <pre className="text-micro font-mono text-fg bg-bg p-2 rounded-sm overflow-x-auto leading-relaxed">
              {diff.patch}
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}

function ToolsPanel({ toolCalls }: { toolCalls: DrawerFixtureSet["toolCalls"] }) {
  if (toolCalls.length === 0) {
    return <p className="text-fg-muted text-sm py-4 text-center">No tool calls recorded.</p>
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-border">
        <span className="text-caption font-semibold uppercase tracking-wide text-fg-muted">
          Tool Execution Log ({toolCalls.length})
        </span>
      </div>
      <div className="grid gap-2">
        {toolCalls.map((tc) => (
          <div key={tc.id} className="p-2.5 rounded-control border border-border bg-surface/50">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-mono text-caption font-semibold text-fg flex items-center gap-1.5">
                <Wrench className="size-3.5 text-fg-muted" />
                {tc.toolName}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-micro text-fg-muted">{tc.durationMs}ms</span>
                <span
                  className={`px-1.5 py-0.5 rounded-sm text-micro font-medium uppercase font-mono ${
                    tc.status === "done"
                      ? "bg-success/20 text-success"
                      : tc.status === "running"
                        ? "bg-warning/20 text-warning animate-pulse"
                        : "bg-danger/20 text-danger"
                  }`}
                >
                  {tc.status}
                </span>
              </div>
            </div>
            <div className="text-micro font-mono text-fg-muted bg-bg p-2 rounded-sm space-y-1">
              <div>
                <span className="text-fg-secondary">args:</span> {JSON.stringify(tc.args)}
              </div>
              {tc.result && (
                <div>
                  <span className="text-fg-secondary">result:</span> {tc.result}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PinsPanel({
  pinnedCards,
  onUnpin,
  onSelectTab,
}: {
  pinnedCards: DrawerPinnedCard[]
  onUnpin?: (id: string) => void
  onSelectTab: (tab: string) => void
}) {
  if (pinnedCards.length === 0) {
    return <p className="text-fg-muted text-sm py-4 text-center">No pinned cards or items.</p>
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-border">
        <span className="text-caption font-semibold uppercase tracking-wide text-fg-muted">
          Pinned Items ({pinnedCards.length})
        </span>
      </div>
      <div className="grid gap-2">
        {pinnedCards.map((card) => (
          <div
            key={card.id}
            className="p-2.5 rounded-control border border-border bg-surface/50 flex items-center justify-between gap-3"
          >
            <button
              type="button"
              onClick={() => onSelectTab(`pin:${card.id}`)}
              className="flex items-center gap-2 text-left min-w-0 flex-1 hover:text-primary transition-colors"
            >
              <Pin className="size-3.5 text-primary shrink-0" />
              <div className="min-w-0">
                <p className="text-caption font-semibold text-fg truncate">{card.title}</p>
                <p className="text-micro font-mono text-fg-muted">{card.card_type}</p>
              </div>
            </button>
            {onUnpin && (
              <button
                type="button"
                onClick={() => onUnpin(card.id)}
                className="p-1 rounded-sm text-fg-muted hover:text-danger hover:bg-surface transition-colors"
                aria-label={`Unpin ${card.title}`}
              >
                <Trash2 className="size-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function PinnedCardView({
  card,
  onUnpin,
}: {
  card?: DrawerPinnedCard
  onUnpin?: (id: string) => void
}) {
  if (!card) {
    return <p className="text-fg-muted text-sm py-4 text-center">Pinned card unavailable.</p>
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-border">
        <div className="flex items-center gap-2">
          <Pin className="size-4 text-primary" />
          <span className="text-caption font-semibold text-fg">{card.title}</span>
          <span className="px-1.5 py-0.5 rounded-sm bg-bg text-micro font-mono text-fg-muted">
            {card.card_type}
          </span>
        </div>
        {onUnpin && (
          <button
            type="button"
            onClick={() => onUnpin(card.id)}
            className="flex items-center gap-1 px-2 py-0.5 rounded-sm text-micro text-fg-muted hover:text-danger hover:bg-surface border border-border"
          >
            <PinOff className="size-3" />
            Unpin
          </button>
        )}
      </div>
      <div className="p-3 rounded-control border border-border bg-bg">
        <pre className="text-micro font-mono text-fg overflow-x-auto leading-relaxed">
          {card.payload}
        </pre>
      </div>
    </div>
  )
}
