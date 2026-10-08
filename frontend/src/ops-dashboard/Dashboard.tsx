import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from "@hollis-labs/design-components"
import { PageHeader, SummaryCards } from "@hollis-labs/kit-dashboard"
import { IntelligenceRow, Kpi, KpiGrid } from "@hollis-labs/kit-dashboard/widgets"
import { useLayoutEffect, useRef, useState } from "react"
import type { OperationsModel } from "../operations/model"
import { ActivityView, MissionView, ResourceNotice, UsageView } from "../operations/Views"
import { dashboardMetrics } from "./model"
import "./dashboard.css"
export const dashboardTabs = ["Activity", "Mission Control", "Usage"] as const
export type DashboardTab = (typeof dashboardTabs)[number]
export function OpsDashboard({
  model,
  query,
  onQuery,
  onSelect,
  onTabChange = () => {},
  initialTab = "Activity",
  onTabSelect,
  controlledTab,
  longHeader = false,
}: {
  model: OperationsModel
  query: string
  onQuery: (q: string) => void
  onSelect: (id: string) => void
  onTabChange?: () => void
  onTabSelect?: (tab: DashboardTab) => void
  controlledTab?: DashboardTab
  initialTab?: DashboardTab
  longHeader?: boolean
}) {
  const [localTab, setTab] = useState<DashboardTab>(initialTab),
    [, freshLifetime] = useState(0)
  const tab = controlledTab ?? localTab
  const m = dashboardMetrics(model),
    scope = useRef(m.source),
    lease = useRef(0)
  scope.current = m.source
  const captured = m.source,
    token = lease.current
  const admitted = () => scope.current === captured && token === lease.current
  const choose = (id: string) => {
    if (admitted() && model.accessible && model.tasks.some((t) => t.id === id)) onSelect(id)
  }
  useLayoutEffect(() => {
    lease.current++
    freshLifetime((n) => n + 1)
    return () => {
      lease.current++
    }
  }, [])
  const change = (value: unknown) => {
    if (!admitted() || !dashboardTabs.includes(value as DashboardTab) || value === tab) return
    lease.current++
    setTab(value as DashboardTab)
    onTabChange()
    onTabSelect?.(value as DashboardTab)
  }
  const display = (value: number | null) => (value === null ? "Unavailable" : value)
  return (
    <section className="ops-dashboard" aria-label="Unified Ops Dashboard">
      <div className="ops-recorded-header">
        <PageHeader
          title={
            longHeader
              ? "Recorded operations review · supplied long fixture scope <script>inert</script>"
              : "Recorded operations review"
          }
        >
          <Button
            variant="outline"
            onClick={() => {
              if (admitted()) onQuery("")
            }}
          >
            Clear dashboard filter
          </Button>
        </PageHeader>
      </div>
      <p>
        Fixed UTC cutoff {model.cutoff} · {model.dataset.profile} · Filter: {query || "None"}.
        Recorded review, not live collection.
      </p>
      <SummaryCards
        cards={[
          { label: "Total", value: display(m.total) },
          { label: "Active tasks", value: display(m.activeTasks) },
          { label: "Done", value: display(m.done) },
        ]}
      />
      <p>
        Total is the supplied admitted matching task count. Active tasks means task status is
        neither archived nor done, including raw unknown statuses; this is not active run count.
        Done uses task lifecycle evidence.
      </p>
      <Tabs value={tab} onValueChange={change}>
        <TabsList aria-label="Ops Dashboard views">
          <TabsTrigger value="Activity">Activity</TabsTrigger>
          <TabsTrigger value="Mission Control">Mission Control</TabsTrigger>
          <TabsTrigger value="Usage">Usage</TabsTrigger>
        </TabsList>
        <TabsContent value="Activity">
          {model.accessible ? (
            <ActivityView
              model={model}
              query={query}
              onQuery={(q) => {
                if (admitted()) onQuery(q)
              }}
              onSelect={choose}
            />
          ) : (
            <ResourceNotice model={model} />
          )}
        </TabsContent>
        <TabsContent value="Mission Control">
          {model.accessible ? (
            <MissionView model={model} onSelect={choose} />
          ) : (
            <ResourceNotice model={model} />
          )}
        </TabsContent>
        <TabsContent value="Usage">
          {model.accessible ? (
            <UsageView
              model={model}
              query={query}
              onQuery={(q) => {
                if (admitted()) onQuery(q)
              }}
              onSelect={choose}
            />
          ) : (
            <ResourceNotice model={model} />
          )}
        </TabsContent>
      </Tabs>
      <Metrics key={`${m.source}/${tab}`} model={model} onSelect={choose} />
    </section>
  )
}
function Metrics({ model, onSelect }: { model: OperationsModel; onSelect: (id: string) => void }) {
  const [selected, setSelected] = useState(model.tasks[0]?.id ?? ""),
    [inspection, setInspection] = useState(""),
    [, freshLifetime] = useState(0)
  const m = dashboardMetrics(model),
    task = model.tasks.find((t) => t.id === selected),
    run = model.runs.find((r) => r.id === task?.runId),
    life = useRef({ alive: true, lease: 0 })
  useLayoutEffect(() => {
    life.current.alive = true
    life.current.lease++
    freshLifetime((n) => n + 1)
    return () => {
      life.current.alive = false
      life.current.lease++
    }
  }, [])
  const token = life.current.lease,
    current = () => life.current.alive && token === life.current.lease
  const val = (n: number | null) => (n === null ? "Unknown" : String(n))
  return (
    <section className="ops-metric-companion" aria-label="App-owned metric companion">
      <h2>App-owned metric companion</h2>
      <p>
        Recorded admitted evidence, separate from Torque reference tab content. Receipt sums may be
        partial; no receipt is Unknown, not zero. Exact original values are listed below.
      </p>
      <p>
        Receipt coverage{" "}
        {m.receipts === null ? "Unknown" : `${m.receipts} receipts across ${m.runs} admitted runs`};
        missing receipt evidence remains Unknown.
      </p>
      <KpiGrid>
        <Kpi label="Admitted runs" value={val(m.runs)} sub="Current matching prefix" />
        <Kpi
          label="Recorded receipts"
          value={val(m.receipts)}
          sub="Joined run.usageId / receipt.runId"
        />
        <Kpi label="Receipt tokens" value={val(m.tokens)} sub="Recorded receipt total only" />
        <Kpi
          label="Receipt USD"
          value={m.cost === null ? "Unknown" : `$${m.cost.toFixed(3)}`}
          sub="Rounded display; exact USD below"
        />
      </KpiGrid>
      <table className="ops-metric-raw">
        <caption>Exact raw current-prefix metric amounts</caption>
        <thead>
          <tr>
            <th>Metric</th>
            <th>Exact value</th>
            <th>Unit / evidence</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Admitted runs", m.runs, "count"],
            ["Recorded receipts", m.receipts, "count"],
            ["Receipt tokens", m.tokens, "tokens"],
            ["Receipt USD", m.cost, "USD"],
          ].map(([label, n, unit]) => (
            <tr key={String(label)}>
              <th>{label}</th>
              <td>{n === null ? "Unknown" : String(n)}</td>
              <td>{unit}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <label>
        Metric record
        <select
          aria-label="Metric record"
          value={selected}
          disabled={!model.tasks.length}
          onChange={(e) => {
            if (
              current() &&
              model.tasks.some((t) => t.id === e.target.value) &&
              e.target.value !== selected
            ) {
              life.current.lease++
              setSelected(e.target.value)
              setInspection("")
            }
          }}
        >
          {!model.tasks.length && <option value="">No admitted records</option>}
          {model.tasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.id} · {t.title}
            </option>
          ))}
        </select>
      </label>
      <div className="ops-status-digest">
        <IntelligenceRow
          label="Supplied task status"
          value={task?.id ?? "Unknown"}
          status={task?.status ?? "unavailable"}
        />
        <IntelligenceRow
          label="Supplied run status"
          value={run?.id ?? "Unknown"}
          status={run?.status ?? "unavailable"}
        />
      </div>
      <p>
        Raw supplied task status: {task?.status ?? "Unknown"}; raw supplied run status:{" "}
        {run?.status ?? "Unknown"}. Status labels do not evaluate health or infer completion.
      </p>
      <div className="ops-metric-actions">
        <Button
          disabled={!task}
          onClick={() => {
            if (current() && task)
              setInspection(
                `Inspected ${task.id} / ${run?.id ?? "Unknown"} at ${model.cutoff}; records unchanged.`,
              )
          }}
        >
          Inspect metric metadata
        </Button>
        <Button
          variant="outline"
          disabled={!task}
          onClick={() => {
            if (current() && task) onSelect(task.id)
          }}
        >
          Inspect related current run
        </Button>
      </div>
      {inspection && <p role="status">{inspection}</p>}
    </section>
  )
}
