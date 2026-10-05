import { Button, DetailDialog, EmptyState } from "@hollis-labs/design-components"
import { StatusBadge, SummaryCards } from "@hollis-labs/kit-dashboard"
import { BarList, BarMeter, CompositionBars, Panel } from "@hollis-labs/kit-dashboard/widgets"
import { Activity, Compass, Gauge, Layers } from "lucide-react"
import { FixedActivity } from "../FixedActivity"
import type { OperationsModel, RunDetail } from "./model"
import { calendarSeries, daySeries } from "./model"

export function ResourceNotice({ model }: { model: OperationsModel }) {
  return (
    <EmptyState
      variant={model.resource === "error" ? "error" : "empty"}
      title={
        model.resource === "loading"
          ? "Loading scenario…"
          : model.resource === "permission-denied"
            ? "Access denied by fixture policy"
            : model.resource === "unavailable"
              ? "Resource unavailable"
              : "Could not load observations"
      }
      description="Controlled presentation state; fixture counts are unavailable, not healthy zero."
    />
  )
}
export function OperationsSummary({ model }: { model: OperationsModel }) {
  const s = model.stats
  return (
    <SummaryCards
      cards={[
        { label: "Tasks observed", value: s.count ?? "Unavailable" },
        { label: "Active runs", value: s.active ?? "Unavailable" },
        { label: "Recorded receipt tokens", value: s.tokens?.toLocaleString() ?? "Unavailable" },
        {
          label: "Recorded receipt cost",
          value: s.cost === null ? "Unavailable" : `$${s.cost.toFixed(3)}`,
        },
      ]}
    />
  )
}
export function RunList({
  model,
  onSelect,
  query,
  onQuery,
}: {
  model: OperationsModel
  onSelect: (id: string) => void
  query: string
  onQuery: (value: string) => void
}) {
  return (
    <Panel
      title="Recent runs"
      icon={<Activity className="size-4" />}
      meta={`${model.tasks.length} linked records`}
    >
      <div className="table-toolbar">
        <input
          aria-label="Filter tasks"
          placeholder="Filter tasks, owners, IDs…"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
        />
      </div>
      {model.tasks.length ? (
        [...model.tasks]
          .sort((a, b) => b.started.localeCompare(a.started))
          .map((t) => {
            const r = model.runs.find((r) => r.id === t.runId)
            return (
              <button
                type="button"
                className="activity-row"
                key={t.id}
                onClick={() => onSelect(t.id)}
              >
                <span className="status-dot" />
                <span className="task-text">
                  <strong>{t.title}</strong>
                  <span>
                    {t.id} · {t.owner ?? "Not provided"} · {t.started.slice(0, 10)}{" "}
                    {t.started.slice(11, 16)} UTC
                  </span>
                </span>
                <StatusBadge status={r?.status ?? "unavailable"} />
              </button>
            )
          })
      ) : (
        <EmptyState
          variant="empty"
          title="No activity to display"
          description="Try another scenario or filter."
        />
      )}
    </Panel>
  )
}
export function ActivityCalendar({ model }: { model: OperationsModel }) {
  const cells = calendarSeries(model),
    maximum = Math.max(1, ...cells.map((c) => c.count ?? 0)),
    weeks = Array.from({ length: 16 }, (_, w) => cells.slice(w * 7, w * 7 + 7))
  return (
    <Panel
      title="16-week activity calendar"
      icon={<Activity className="size-4" />}
      meta="fixed UTC clock"
    >
      <div className="example-body">
        <div
          className="calendar-weeks"
          role="img"
          aria-label="16-week run-start intensity with explicit coverage gaps"
        >
          {weeks.map((week) => (
            <div className="calendar-week" key={week[0].day}>
              {week.map((c) => (
                <div
                  className={
                    c.count === null
                      ? "calendar-cell heatmap-cell heatmap-gap"
                      : c.count
                        ? "calendar-cell heatmap-cell observed calendar-intensity"
                        : "calendar-cell heatmap-cell"
                  }
                  style={
                    c.count
                      ? ({
                          "--activity-weight": `${Math.round(20 + (c.count / maximum) * 65)}%`,
                        } as React.CSSProperties)
                      : undefined
                  }
                  data-count={c.count ?? "unavailable"}
                  data-partial={c.partial}
                  key={c.day}
                  title={`${c.day}: ${c.count === null ? "unavailable day coverage" : `${c.count} recorded run starts${c.partial ? " · partial day" : ""}`}`}
                >
                  <span className="sr-only">
                    {c.day}:{" "}
                    {c.count === null
                      ? "unavailable"
                      : `${c.count} recorded starts${c.partial ? ", partial day" : ""}`}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="calendar-legend">
          <span>
            <i className="heatmap-cell heatmap-gap" /> Unavailable
          </span>
          <span>
            <i className="heatmap-cell" /> Observed zero
          </span>
          <span>
            <i className="heatmap-cell calendar-intensity" /> Recorded starts · lighter → fewer
          </span>
        </div>
        <details>
          <summary>Exact calendar dates, counts and coverage</summary>
          <table className="receipt-breakdown">
            <caption>Run-start evidence at the selected fixed UTC cutoff</caption>
            <thead>
              <tr>
                <th scope="col">UTC date</th>
                <th scope="col">Starts</th>
                <th scope="col">Coverage</th>
              </tr>
            </thead>
            <tbody>
              {cells.map((c) => (
                <tr key={c.day}>
                  <th scope="row">{c.day}</th>
                  <td>{c.count === null ? "Unavailable" : `${c.count}${c.partial ? "*" : ""}`}</td>
                  <td>
                    {c.count === null ? "Unavailable" : c.partial ? "Partial day" : "Full day"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
        <p className="muted">
          Run starts only · intensity normalized to visible covered dates (maximum {maximum}). * =
          partial UTC day within {model.dataset.observedSince} → {model.cutoff}. — = unavailable; ·
          = observed zero. Future dates have no evidence.
          {model.scenario === "sparse" && " Sparse masks every third daily rollup."}
        </p>
      </div>
    </Panel>
  )
}
export function ActivityView({
  model,
  onSelect,
  query,
  onQuery,
  plugin,
}: {
  model: OperationsModel
  onSelect: (id: string) => void
  query: string
  onQuery: (value: string) => void
  plugin?: React.ReactNode
}) {
  return (
    <>
      <ActivityCalendar model={model} />
      <div className="activity-pair">
        <FixedActivity
          records={model.runs.map((r) => ({ ...r, tokens: 0 }))}
          clock={model.dataset.clock}
          observedSince={model.dataset.observedSince}
          showCalendar={false}
        />
        <RunList model={model} onSelect={onSelect} query={query} onQuery={onQuery} />
      </div>
      {plugin && (
        <Panel title="Chimera contribution" icon={<Layers className="size-4" />}>
          {plugin}
        </Panel>
      )}
    </>
  )
}
export function MissionView({
  model,
  onSelect,
}: {
  model: OperationsModel
  onSelect: (id: string) => void
}) {
  const series = daySeries(model),
    states = [...new Set(model.runs.map((r) => r.status))],
    items = states.map((label) => ({
      label,
      value: model.runs.filter((r) => r.status === label).length,
    }))
  return (
    <>
      <div className="dashboard-grid">
        <div className="side-panels">
          <SeriesPanel title="14-day run volume" field="count" model={model} />
          <Panel
            title="Run status distribution"
            icon={<Compass className="size-4" />}
            meta={`${model.runs.length} admitted runs · entire filtered graph`}
          >
            <div className="example-body">
              <CompositionBars items={items} />
              <BarList items={items} />
            </div>
          </Panel>
          <Panel
            title="Token throughput"
            icon={<Gauge className="size-4" />}
            meta={`${model.usage.length} recorded receipts`}
          >
            <div className="example-body">
              <BarMeter
                rows={series
                  .filter((d) => d.tokens !== null)
                  .map((d) => ({ key: d.date, label: d.date, value: d.tokens ?? 0 }))}
                title="Recorded receipt tokens by UTC day"
              />
              <table className="receipt-breakdown">
                <caption>
                  Input / output tokens from admitted usage receipts · UTC receipt date
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Input</th>
                    <th scope="col">Output</th>
                  </tr>
                </thead>
                <tbody>
                  {series.map((d) => (
                    <tr key={d.date}>
                      <th scope="row">
                        {d.date}
                        {d.partial ? "*" : ""}
                      </th>
                      <td>{d.inputTokens?.toLocaleString() ?? "—"}</td>
                      <td>{d.outputTokens?.toLocaleString() ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="muted">
                Recorded receipts only, not complete consumption or a per-second rate. * partial
                day; — no admitted receipt or unavailable coverage.
              </p>
              {series.some((d) => d.tokens === null) && (
                <p className="muted">
                  Unobserved days omitted from numeric bars; gaps are shown in the run window.
                </p>
              )}
            </div>
          </Panel>
        </div>
        <Panel title="Task pipeline" icon={<Layers className="size-4" />}>
          <div className="mission-cards">
            {[...new Set(model.tasks.map((t) => t.status))].map((status) => (
              <section key={status}>
                <h3 className="eyebrow">
                  {status} · {model.tasks.filter((t) => t.status === status).length}
                </h3>
                {model.tasks
                  .filter((t) => t.status === status)
                  .map((t) => (
                    <button
                      type="button"
                      className="task-card"
                      key={t.id}
                      onClick={() => onSelect(t.id)}
                    >
                      <strong>{t.title}</strong>
                      <span className="muted">
                        {t.id} / {t.runId}
                      </span>
                    </button>
                  ))}
              </section>
            ))}
          </div>
        </Panel>
      </div>
    </>
  )
}
export function SeriesPanel({
  title,
  field,
  model,
}: {
  title: string
  field: "count" | "tokens" | "cost"
  model: OperationsModel
}) {
  const series = daySeries(model),
    maximum = Math.max(1e-6, ...series.map((day) => day[field] ?? 0))
  return (
    <Panel title={title} icon={<Gauge className="size-4" />} meta="14 UTC dates">
      <div className="example-body">
        <svg
          className="series-chart"
          viewBox="0 0 420 100"
          role="img"
          aria-label={`${title} with coverage gaps`}
        >
          <title>{title}: fourteen fixed UTC dates; unavailable days have no numeric bar</title>
          <line x1="0" x2="420" y1="88" y2="88" className="chart-baseline" />
          {series.map((day, index) => {
            const value = day[field],
              height = value === null ? 0 : (value / maximum) * 72
            return (
              <g key={day.date}>
                <title>
                  {day.date}: {value === null ? "unavailable" : `${value} ${field}`}
                </title>
                {value === null ? (
                  <text className="chart-gap" x={index * 30 + 10} y="80">
                    —
                  </text>
                ) : (
                  <rect
                    className="chart-bar"
                    x={index * 30 + 8}
                    y={88 - height}
                    width="14"
                    height={height}
                  />
                )}
              </g>
            )
          })}
        </svg>
        <div className="day-series">
          {series.map((d) => (
            <div className={d[field] === null ? "day-cell missing" : "day-cell"} key={d.date}>
              <span className="muted">
                {d.date.slice(5)}
                {d.partial ? "*" : ""}
              </span>
              <strong>
                {d[field] === null
                  ? "—"
                  : field === "cost"
                    ? `$${d[field]?.toFixed(3)}`
                    : d[field]?.toLocaleString()}
              </strong>
            </div>
          ))}
        </div>
        <p className="muted">
          Window ending {model.dataset.clock.slice(0, 10)}. — = unavailable; totals include only
          admitted fixture records. * = partial UTC day. Token/cost values are recorded receipt
          totals, not complete consumption.
        </p>
      </div>
    </Panel>
  )
}
export function UsageView({
  model,
  onSelect,
  query,
  onQuery,
}: {
  model: OperationsModel
  onSelect: (id: string) => void
  query: string
  onQuery: (value: string) => void
}) {
  return (
    <>
      <SeriesPanel title="14-day cost" field="cost" model={model} />
      <div className="dashboard-grid">
        <Panel title="Usage by correlated run" icon={<Gauge className="size-4" />}>
          <div className="example-body">
            <BarMeter
              rows={model.usage.map((u) => ({
                key: u.id,
                label: `${u.runId} · $${u.cost.toFixed(3)}`,
                value: u.tokens,
              }))}
              title="Recorded receipt tokens / cost"
            />
          </div>
        </Panel>
        <Panel title="Provider / model attribution" icon={<Layers className="size-4" />}>
          <div className="example-body">
            <p className="muted">
              Unavailable in this fixture contract. No provider or model service is connected; this
              is not zero usage.
            </p>
          </div>
        </Panel>
      </div>
      <RunList model={model} onSelect={onSelect} query={query} onQuery={onQuery} />
    </>
  )
}
export function RunDetailBody({
  detail,
  onIntent,
}: {
  detail: RunDetail
  onIntent: (action: string, id: string) => void
}) {
  return (
    <div className="example-body">
      <p className="muted">Evidence through {detail.cutoff} · fixed recorded frame</p>
      <h3>{detail.task.title}</h3>
      <p>{detail.task.narrative}</p>
      <dl>
        <dt>Task</dt>
        <dd>
          {detail.task.id} · {detail.task.status}
        </dd>
        <dt>Run</dt>
        <dd>
          {detail.run.id} · {detail.run.status}
        </dd>
        <dt>Started</dt>
        <dd>{detail.run.started}</dd>
        <dt>Finished</dt>
        <dd>{detail.run.finished ?? "Active / no completion recorded"}</dd>
        <dt>Session</dt>
        <dd>
          {detail.session?.id ?? "Unavailable"} · {detail.task.owner ?? "Not provided"}
        </dd>
        <dt>Usage</dt>
        <dd>
          {detail.usage
            ? `${detail.usage.id} · ${detail.usage.tokens.toLocaleString()} tokens · $${detail.usage.cost.toFixed(3)}`
            : "Usage not observed through this cutoff"}
        </dd>
      </dl>
      <h3>Session messages</h3>
      {detail.messages.map((m) => (
        <section key={m.id}>
          <p className="eyebrow">
            {m.id} · {m.role} · {m.time.slice(11, 19)} UTC
          </p>
          <p>{m.content}</p>
        </section>
      ))}
      <h3>Tool calls</h3>
      {detail.toolCalls.map((t) => (
        <section key={t.id} className="tool-record">
          <strong>
            {t.id} · {t.name}
          </strong>
          <StatusBadge status={t.status} />
          <p className="muted">
            {t.started.slice(11, 19)}–{t.finished?.slice(11, 19) ?? "not observed"} UTC · {t.spanId}
          </p>
          <p>Input: {t.input}</p>
          <p>Fixture output: {t.output ?? "Not observed through this cutoff"}</p>
          <Button variant="outline" onClick={() => onIntent("Run tool", t.id)}>
            Inspect tool intent
          </Button>
        </section>
      ))}
      <h3>Trace {detail.trace?.id ?? "unavailable"}</h3>
      {detail.spans.map((s) => (
        <p className="log-line" key={s.id}>
          {s.id} · {s.name} · {s.status} · {s.started.slice(11, 19)} →{" "}
          {s.finished?.slice(11, 19) ?? "active"}
        </p>
      ))}
      <h3>Correlated logs</h3>
      {detail.logs.map((l) => (
        <p className="log-line" key={l.id}>
          {l.id} · {l.time.slice(11, 19)} · {l.level.toUpperCase()} · {l.message}
        </p>
      ))}
      <h3>Lifecycle events</h3>
      {detail.events.map((e) => (
        <p key={e.id} className="log-line">
          {e.id} · {e.time.slice(11, 19)} · {e.type} · {e.description}
        </p>
      ))}
    </div>
  )
}
export function RunInspection({
  detail,
  open,
  onClose,
  onIntent,
}: {
  detail: RunDetail | null
  open: boolean
  onClose: () => void
  onIntent: (action: string, id: string) => void
}) {
  return (
    <DetailDialog
      open={!!detail && open}
      onClose={onClose}
      title="Run inspection"
      meta={detail ? `${detail.task.id} / ${detail.run.id}` : ""}
      badge={detail && <StatusBadge status={detail.run.status} />}
      footer={
        detail && (
          <Button onClick={() => onIntent("Stop run", detail.run.id)}>Inspect stop intent</Button>
        )
      }
    >
      {detail && <RunDetailBody detail={detail} onIntent={onIntent} />}
    </DetailDialog>
  )
}
