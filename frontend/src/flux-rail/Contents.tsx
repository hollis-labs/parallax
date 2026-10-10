import { Button } from "@hollis-labs/design-components"
import {
  Plan,
  PlanContent,
  PlanDescription,
  PlanHeader,
  PlanTitle,
  PlanTrigger,
  Queue,
  QueueItem,
  QueueItemContent,
  QueueItemIndicator,
  QueueList,
  QueueSection,
  QueueSectionContent,
  QueueSectionLabel,
  QueueSectionTrigger,
} from "@hollis-labs/kit-chat"
import { Kpi, KpiGrid, MiniTrend, Panel } from "@hollis-labs/kit-dashboard/widgets"
import { Activity, Bookmark, Bot, Coins, Cpu, Gauge, Info, Wrench } from "lucide-react"
import { useState } from "react"
import { costLabel, metric, operand, type Preferences, type Scenario, type WidgetId } from "./model"
import { Widget, WidgetRow } from "./Widget"

export function WidgetsContent({
  scenario,
  prefs,
  collapse,
  inspect,
}: {
  scenario: Scenario
  prefs: Preferences
  collapse: (id: WidgetId, open: boolean) => void
  inspect: (kind: "context" | "session", trigger: HTMLElement) => void
}) {
  const data = operand(scenario)
  const contextPct =
    data.total !== null && data.ceiling !== null && data.ceiling > 0
      ? Math.min(100, (data.total / data.ceiling) * 100)
      : null
  function stateText(value: unknown[] | null, empty: string) {
    return value === null
      ? `${scenario === "loading" ? "Loading" : scenario === "unavailable" ? "Unavailable" : "Unknown"} · count withheld`
      : value.length
        ? null
        : empty
  }
  return (
    <div className="space-y-3 p-3" data-testid="rail-widgets">
      <Widget id="agent" title="Agent" icon={Bot} open={prefs.open.agent} onOpenChange={collapse}>
        <WidgetRow label="Status">{data.withheld ? "Unknown" : "Idle · fixture"}</WidgetRow>
        <WidgetRow label="Model">{data.model ?? "Unknown"}</WidgetRow>
      </Widget>
      <Widget
        id="session"
        title="Session"
        icon={Info}
        open={prefs.open.session}
        onOpenChange={collapse}
      >
        <WidgetRow label="Title">{data.name}</WidgetRow>
        <WidgetRow label="Short code">#F4421</WidgetRow>
        <WidgetRow label="Provider">Fictional provider</WidgetRow>
        <WidgetRow label="Model">{data.model ?? "Unknown"}</WidgetRow>
        <WidgetRow label="Messages">{metric(data.messages)}</WidgetRow>
        <WidgetRow label="Last activity">10m before reference</WidgetRow>
        <Button size="sm" variant="outline" onClick={(e) => inspect("session", e.currentTarget)}>
          Session details
        </Button>
      </Widget>
      <Widget
        id="context"
        title="Context"
        icon={Gauge}
        meta={contextPct === null ? "Unknown" : `${contextPct}%`}
        open={prefs.open.context}
        onOpenChange={collapse}
      >
        <WidgetRow label="Window">
          {metric(data.total)} / {metric(data.ceiling)}
        </WidgetRow>
        {contextPct !== null && (
          <progress
            className="my-2 h-1 w-full accent-success"
            aria-label="Context window"
            value={contextPct}
            max={100}
          />
        )}
        <WidgetRow label="Tokens used">
          {metric(data.total)} · {costLabel(data.cost)}
        </WidgetRow>
        <WidgetRow label="Input">{metric(data.input)}</WidgetRow>
        <WidgetRow label="Output">{metric(data.output)}</WidgetRow>
        <WidgetRow label="Messages">{metric(data.messages)}</WidgetRow>
        <Button
          size="sm"
          variant="outline"
          className="mt-2"
          onClick={(e) => inspect("context", e.currentTarget)}
        >
          Inspect context
        </Button>
      </Widget>
      <Widget
        id="tokens"
        title="Token Usage"
        icon={Coins}
        open={prefs.open.tokens}
        onOpenChange={collapse}
      >
        <WidgetRow label="Input">{metric(data.input)}</WidgetRow>
        <WidgetRow label="Output">{metric(data.output)}</WidgetRow>
        <WidgetRow label="Total">{metric(data.total)}</WidgetRow>
        <WidgetRow label="Cost">{costLabel(data.cost)}</WidgetRow>
        <WidgetRow label="Messages">{metric(data.messages)}</WidgetRow>
      </Widget>
      <Widget
        id="tools"
        title="Tools"
        icon={Wrench}
        open={prefs.open.tools}
        onOpenChange={collapse}
      >
        {stateText(data.tools, "No tools available · known empty") ?? (
          <>
            <WidgetRow label="Tools available">{data.tools?.length}</WidgetRow>
            <WidgetRow label="MCP servers">0 / 1 · fixture disconnected</WidgetRow>
            <p className="text-xs text-fg-muted">fixture.read</p>
          </>
        )}
        <Button size="sm" variant="outline" disabled className="mt-2">
          Refresh · inert fixture
        </Button>
      </Widget>
      <Widget
        id="workers"
        title="Workers"
        icon={Cpu}
        open={prefs.open.workers}
        onOpenChange={collapse}
      >
        <p className="text-xs text-fg-muted">
          {stateText(data.workers, "No active workers · known empty") ?? data.workers?.[0]}
        </p>
        {!data.empty && !data.withheld && (
          <Button size="sm" variant="ghost" disabled>
            Stop · inert fixture
          </Button>
        )}
      </Widget>
      <Widget
        id="observability"
        title="Observability"
        icon={Activity}
        open={prefs.open.observability}
        onOpenChange={collapse}
      >
        {stateText(data.executions, "No executions yet · known empty") ?? (
          <>
            <KpiGrid cols="grid-cols-2">
              <Kpi label="Executions" value={data.executions?.length} sub="Fictional sample" />
              <Kpi label="Cost" value="$0.00" sub="Known fixture zero" />
            </KpiGrid>
            <MiniTrend label="Duration ms" value="270 mean" data={data.executions ?? []} />
          </>
        )}
        <a href="/?view=Observability" className="text-xs underline">
          Existing observability specimens
        </a>
      </Widget>
      <Widget
        id="bookmarks"
        title="Bookmarks"
        icon={Bookmark}
        open={prefs.open.bookmarks}
        onOpenChange={collapse}
      >
        <p className="text-xs text-fg-muted">
          {stateText(data.bookmarks, "No bookmarks yet · known empty") ?? data.bookmarks?.[0]}
        </p>
        <a href="/?example=chat" className="text-xs underline">
          Existing Chat specimen
        </a>
      </Widget>
    </div>
  )
}
export function WorkContent({ scenario }: { scenario: Scenario }) {
  const [scope, setScope] = useState("all")
  const [planOpen, setPlanOpen] = useState(true)
  if (["unknown", "unavailable", "loading", "known-empty"].includes(scenario))
    return (
      <p className="p-3 text-xs text-fg-muted">
        {scenario === "known-empty"
          ? "No work items · known empty"
          : `${scenario} · work counts withheld`}
      </p>
    )
  return (
    <div className="space-y-3 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <strong className="text-sm">Work</strong>
        <label className="text-xs">
          Scope{" "}
          <select
            aria-label="Work scope"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="rounded-control border border-border bg-surface p-1"
          >
            <option value="all">All</option>
            <option value="session">Session</option>
            <option value="project">Project</option>
          </select>
        </label>
      </div>
      <Queue>
        <QueueSection defaultOpen>
          <QueueSectionTrigger>
            <QueueSectionLabel label="Todos" count={scope === "all" ? 2 : 1} />
          </QueueSectionTrigger>
          <QueueSectionContent>
            <QueueList>
              {scope !== "project" && (
                <QueueItem>
                  <QueueItemIndicator completed />
                  <QueueItemContent completed>
                    Read fixture source{" "}
                    <span className="rounded-control bg-surface px-1 text-caption">Session</span>
                  </QueueItemContent>
                </QueueItem>
              )}
              {scope !== "session" && (
                <QueueItem>
                  <QueueItemIndicator />
                  <QueueItemContent>
                    Review candidate{" "}
                    <span className="rounded-control bg-surface px-1 text-caption">Project</span>
                  </QueueItemContent>
                </QueueItem>
              )}
            </QueueList>
          </QueueSectionContent>
        </QueueSection>
        <QueueSection defaultOpen>
          <QueueSectionTrigger>
            <QueueSectionLabel label="Reminders" count={scope === "project" ? 0 : 1} />
          </QueueSectionTrigger>
          <QueueSectionContent>
            <p className="p-2 text-xs text-fg-muted">
              {scope === "project"
                ? "No project reminders · known empty"
                : "Session · Review at 2026-10-04T15:00:00Z · inert reminder"}
            </p>
          </QueueSectionContent>
        </QueueSection>
      </Queue>
      {scope !== "project" && (
        <Plan open={planOpen} onOpenChange={setPlanOpen}>
          <PlanHeader>
            <div>
              <PlanTitle>Fictional review plan</PlanTitle>
              <PlanDescription>Session · proposed fixture · 1/2 steps</PlanDescription>
            </div>
            <PlanTrigger className="relative" />
          </PlanHeader>
          <PlanContent>
            <QueueList>
              <QueueItem>
                <QueueItemIndicator completed />
                <QueueItemContent completed>Inspect primary source</QueueItemContent>
              </QueueItem>
              <QueueItem>
                <QueueItemIndicator />
                <QueueItemContent>Review visual adaptation</QueueItemContent>
              </QueueItem>
            </QueueList>
          </PlanContent>
        </Plan>
      )}
      <Button size="sm" variant="outline" disabled>
        Send Changes · inert fixture
      </Button>
    </div>
  )
}
export function InboxContent({ scenario }: { scenario: Scenario }) {
  const [owner, setOwner] = useState("user"),
    [filter, setFilter] = useState("all"),
    [expanded, setExpanded] = useState(false),
    [thread, setThread] = useState(false),
    [reply, setReply] = useState(false),
    [draft, setDraft] = useState("")
  const reset = () => {
    setExpanded(false)
    setThread(false)
    setReply(false)
    setDraft("")
  }
  const hasMessage =
    !["known-empty", "unknown", "unavailable", "loading"].includes(scenario) &&
    filter !== "read" &&
    filter !== "resolved"
  return (
    <section className="space-y-3 p-3" aria-label="Fictional inbox">
      <fieldset className="flex gap-2" aria-label="Inbox owner">
        {["user", "agent"].map((id) => (
          <Button
            key={id}
            size="sm"
            variant={owner === id ? "secondary" : "ghost"}
            aria-pressed={owner === id}
            onClick={() => {
              setOwner(id)
              setFilter("all")
              reset()
            }}
          >
            {id === "user" ? "My Inbox" : "Agent Inbox"}
          </Button>
        ))}
      </fieldset>
      <label className="text-xs">
        Status{" "}
        <select
          aria-label="Inbox status"
          className="rounded-control border border-border bg-surface p-1"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value)
            reset()
          }}
        >
          {["all", "unread", "read", "resolved"].map((id) => (
            <option key={id}>{id}</option>
          ))}
        </select>
      </label>
      {hasMessage ? (
        <article className="space-y-2 rounded-panel border border-border bg-bg-elevated p-3">
          {thread && (
            <Button size="sm" variant="ghost" onClick={() => setThread(false)}>
              Back to inbox
            </Button>
          )}
          <button
            type="button"
            className="w-full text-left text-sm"
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
          >
            Fixture agent → {owner === "user" ? "You" : "Fixture agent"}
            <span className="block text-label text-fg-muted">
              Handoff · unread fixture · 10m before reference
            </span>
            <strong className="block">Review context boundary</strong>
          </button>
          <p className="text-xs text-fg-secondary">
            Fictional message; opening does not acknowledge delivery.
          </p>
          {expanded && (
            <>
              <div className="flex flex-wrap gap-1">
                <Button size="sm" variant="ghost" onClick={() => setReply(!reply)}>
                  Reply preview
                </Button>
                <Button size="sm" variant="ghost" disabled>
                  Resolve · inert fixture
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setThread(true)}>
                  Thread preview
                </Button>
              </div>
              {reply && (
                <>
                  <label className="block text-xs">
                    Local reply preview
                    <textarea
                      aria-label="Local reply preview"
                      className="mt-1 w-full rounded-control border border-border bg-surface p-2"
                      rows={3}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                    />
                  </label>
                  <Button size="sm" disabled>
                    Send · inert fixture
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setReply(false)
                      setDraft("")
                    }}
                  >
                    Cancel preview
                  </Button>
                </>
              )}
            </>
          )}
        </article>
      ) : (
        <p className="text-xs text-fg-muted">
          {["unknown", "unavailable", "loading"].includes(scenario)
            ? `${scenario} · inbox counts withheld`
            : "No messages · known empty projection"}
        </p>
      )}
      <a className="text-xs underline" href="/?example=messaging">
        Existing Messaging example
      </a>
    </section>
  )
}
export function StaticPanel({
  kind,
  scenario,
}: {
  kind: "workflows" | "artifacts" | "fixture-plugin"
  scenario: Scenario
}) {
  if (kind === "fixture-plugin")
    return (
      <p className="p-3 text-xs text-fg-muted">
        Plugin panel <code>fixture-plugin</code> declared. Render function pending; no remote bundle
        loaded.
      </p>
    )
  const data = operand(scenario)
  return (
    <div className="p-3">
      <Panel
        title={kind === "workflows" ? "Workflows" : "Artifacts"}
        icon={<Info className="size-3" />}
        meta="Fixture"
      >
        <div className="space-y-2 p-3 text-xs">
          <p>
            {data.withheld
              ? `${scenario} · counts withheld`
              : data.empty
                ? `No ${kind} · known empty`
                : kind === "workflows"
                  ? "Fictional context review · proposed · 2 steps"
                  : "fixture-notes.md · fictional markdown · size unknown"}
          </p>
          {!data.withheld && !data.empty && (
            <Button size="sm" disabled>
              {kind === "workflows" ? "Resume · inert fixture" : "Open artifact · inert fixture"}
            </Button>
          )}
          <a
            className="block underline"
            href={kind === "workflows" ? "/?view=Workflow" : "/?example=workspace"}
          >
            {kind === "workflows" ? "Existing Workflow specimens" : "Existing Workspace example"}
          </a>
        </div>
      </Panel>
    </div>
  )
}
