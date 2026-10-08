import { Button, Card, CardContent } from "@hollis-labs/design-components"
import { BarMeter, DonutChart } from "@hollis-labs/kit-dashboard/widgets"
import { useLayoutEffect, useRef, useState } from "react"
import type { OperationsModel } from "../../operations/model"
import { ResourceNotice } from "../../operations/Views"
import { costSegments, torqueMissionModel } from "./mission"

const colors = [
  "var(--color-success)",
  "var(--color-danger)",
  "var(--torque-series-input)",
  "var(--color-fg-secondary)",
]
const exact = (n: number | null) => (n === null ? "Unknown" : String(n))
const usd = (n: number | null) => (n === null ? "Unknown" : `${Number(n.toFixed(12))} USD`)
export function TorqueMission({
  model,
  onSelect,
  usage = false,
}: {
  model: OperationsModel
  onSelect: (id: string) => void
  usage?: boolean
}) {
  const data = torqueMissionModel(model),
    life = useRef({
      alive: false,
      source: JSON.stringify([data.source, model.scenario, usage]),
      lease: 0,
    }),
    [, fresh] = useState(0)
  life.current.source = JSON.stringify([data.source, model.scenario, usage])
  useLayoutEffect(() => {
    life.current.alive = true
    life.current.lease++
    fresh((n) => n + 1)
    return () => {
      life.current.alive = false
      life.current.lease++
    }
  }, [])
  const token = life.current.lease,
    source = JSON.stringify([data.source, model.scenario, usage])
  const choose = (runId: string) => {
    if (
      !life.current.alive ||
      life.current.source !== source ||
      life.current.lease !== token ||
      !data.available
    )
      return
    const task = model.tasks.find((t) => t.runId === runId)
    if (task && model.runs.some((r) => r.id === runId)) onSelect(task.id)
  }
  if (!model.accessible) return <ResourceNotice model={model} />
  if (!data.compatible) return <p>Reference charts unavailable for this source.</p>
  const maximum = Math.max(
      1,
      ...data.days.map((d) => (d.inputTokens ?? 0) + (d.outputTokens ?? 0)),
    ),
    volumeMax = Math.max(1, ...data.days.map((d) => d.runs ?? 0))
  const note = (
    <>
      <p>
        14 UTC run-start dates {data.days[0].date} → {data.days.at(-1)!.date}; original reference{" "}
        {model.referenceClock}. Receipt time admits evidence; run completion is not required.
      </p>
      {model.scenario === "sparse" && (
        <p>
          Authored sparse review mask: dates divisible by 3 are Unknown; supplied receipt totals
          remain independent of this display mask.
        </p>
      )}
      {model.resource === "degraded" && (
        <p role="status">
          Degraded fixture presentation; retained supplied evidence, no live collection.
        </p>
      )}
    </>
  )
  const companion = (
    <details>
      <summary>Exact {usage ? "Usage" : "Mission"} UTC evidence</summary>
      <section
        className="torque-chart-table"
        aria-label={`${usage ? "Usage" : "Mission"} UTC table`}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: Native keyboard scroll of exact evidence.
        tabIndex={0}
      >
        <table>
          <caption>
            Run-start date attribution · current admitted receipts · exact USD rounded only for
            floating sum representation
          </caption>
          <thead>
            <tr>
              <th>UTC date</th>
              <th>Runs / status</th>
              <th>Receipts</th>
              <th>Input</th>
              <th>Output</th>
              <th>USD</th>
              <th>Coverage / inspection</th>
            </tr>
          </thead>
          <tbody>
            {data.days.map((d) => (
              <tr key={d.date}>
                <td>{d.date}</td>
                <td>
                  {exact(d.runs)}
                  <br />
                  {d.statuses.map((s) => `${s.label}: ${exact(s.count)}`).join("; ")}
                </td>
                <td>
                  {exact(d.received)}; missing {exact(d.missing)}
                </td>
                <td>{exact(d.inputTokens)}</td>
                <td>{exact(d.outputTokens)}</td>
                <td>{usd(d.cost)}</td>
                <td>
                  {d.receiptCoverage};{" "}
                  {!d.known ? "Unknown date" : d.partial ? "Partial UTC day" : "Covered UTC day"}
                  {d.known &&
                    d.runIds.slice(0, 1).map((id) => (
                      <Button
                        key={id}
                        variant="ghost"
                        className="torque-chart-inspect"
                        onClick={() => choose(id)}
                      >
                        Inspect {id}
                      </Button>
                    ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </details>
  )
  const totals = (
    <div className="torque-chart-totals">
      <h3>Recorded receipt totals</h3>
      <p>
        All admitted matching sample: {exact(data.sample.runs)} runs / {exact(data.sample.receipts)}{" "}
        receipts; {exact(data.sample.tokens)} tokens; {usd(data.sample.cost)}. Missing receipts:{" "}
        {exact(data.sample.missing)}.
      </p>
      <p>
        14-day admitted sample: {exact(data.window.runs)} runs / {exact(data.window.receipts)}{" "}
        receipts; {exact(data.window.tokens)} tokens; {usd(data.window.cost)}. Missing receipts:{" "}
        {exact(data.window.missing)}.
      </p>
      <p>
        Totals are partial recorded amounts when receipts are missing; they are not complete
        consumption. Known empty is 0; absent receipt evidence is Unknown. Displayed sparse gaps
        never become zero.
      </p>
    </div>
  )
  return (
    <section
      className="torque-mission"
      aria-label={`Torque reference ${usage ? "Usage" : "Mission Control"}`}
    >
      {note}
      {usage ? (
        <>
          <Card size="sm">
            <CardContent>
              <h2>Cost per day — 14d</h2>
              <svg
                className="torque-cost"
                viewBox="0 0 580 160"
                preserveAspectRatio="none"
                role="img"
                aria-label="Nullable UTC daily USD area"
              >
                <defs>
                  <linearGradient id="torque-cost-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="var(--color-primary)" stopOpacity="0.55" />
                    <stop offset="1" stopColor="var(--color-primary)" stopOpacity="0.08" />
                  </linearGradient>
                </defs>
                {costSegments(data.days.map((d) => d.cost)).map((path) => (
                  <path
                    key={path}
                    d={path}
                    fill="url(#torque-cost-gradient)"
                    stroke="var(--color-primary)"
                    strokeWidth="2"
                  />
                ))}
                {data.days.map((d, i) =>
                  d.cost === null ? null : (
                    <circle
                      key={d.date}
                      data-date={d.date}
                      cx={20 + i * 40}
                      cy={
                        140 -
                        (Math.max(0, ...data.days.map((x) => x.cost ?? 0))
                          ? (d.cost / Math.max(...data.days.map((x) => x.cost ?? 0))) * 115
                          : 0)
                      }
                      r={3}
                      fill="var(--color-primary)"
                    />
                  ),
                )}
              </svg>
              <div className="torque-chart-axis">
                <span>{data.days[0].date}</span>
                <span>{data.days.at(-1)!.date}</span>
              </div>
              <p>
                Linear filled area; gaps split paths, no interpolated consumption. Unknown dates
                retain their x positions.{" "}
                {data.days.every((d) => d.cost === null)
                  ? "No available recorded amount."
                  : data.days.every((d) => d.cost === 0)
                    ? "No recorded amount · known 0 USD."
                    : "Exact recorded USD in the table below."}
              </p>
              {companion}
              {totals}
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent>
              <h2>Provider / model attribution</h2>
              <p>
                Coming soon in the pinned reference. This fixture has no supplied provider/model
                attribution; unavailable, not zero cost or fabricated categories.
              </p>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <div className="torque-mission-columns">
            <div className="torque-mission-main">
              <div className="torque-mission-top">
                <Card size="sm">
                  <CardContent>
                    <h2>Runs — 14d</h2>
                    <svg
                      className="torque-volume"
                      viewBox="0 0 580 180"
                      preserveAspectRatio="none"
                      role="img"
                      aria-label="14 UTC run-volume status bars"
                    >
                      {data.days.map((d, i) => {
                        let y = 155
                        return (
                          <g key={d.date} data-date={d.date}>
                            {d.statuses.map((s, j) => {
                              if (s.count === null) return null
                              const h = (s.count / volumeMax) * 130
                              y -= h
                              return (
                                <rect
                                  key={s.label}
                                  x={20 + i * 40}
                                  y={y}
                                  width={24}
                                  height={h}
                                  fill={colors[j]}
                                  data-status={s.label}
                                />
                              )
                            })}
                            {!d.known && (
                              <text x={20 + i * 40} y={140}>
                                ?
                              </text>
                            )}
                          </g>
                        )
                      })}
                    </svg>
                    <div className="torque-chart-axis">
                      <span>{data.days[0].date}</span>
                      <span>{data.days.at(-1)!.date}</span>
                    </div>
                    {data.days.every((d) => d.runs === 0) && (
                      <p>No runs in window · known count 0.</p>
                    )}
                    {data.days.every((d) => d.runs === null) && (
                      <p>Run window unavailable · Unknown count.</p>
                    )}
                    <p>
                      Success (success/done), Error (error/failed), reference running bucket (other
                      known aliases), Unknown. Raw unknown is never asserted running.
                    </p>
                  </CardContent>
                </Card>
                <Card size="sm">
                  <CardContent>
                    <DonutChart
                      title="Run distribution"
                      size={120}
                      centerLabel="admitted runs"
                      segments={data.distribution.map((s, i) => ({
                        key: s.label,
                        label: s.label,
                        value: s.value,
                        color: colors[i],
                      }))}
                    />
                    <p>
                      All {data.sample.runs} admitted matching runs. Completed → Success;
                      canceled/timeout → Error; queued → Active; unknown → Other. Rounded legend
                      percentages may not sum 100.
                    </p>
                  </CardContent>
                </Card>
              </div>
              <Card size="sm">
                <CardContent>
                  <h2>Token throughput — 14d</h2>
                  <div className="torque-chart-legend">
                    <span>Input tokens</span>
                    <span>Output tokens</span>
                  </div>
                  <svg
                    className="torque-token"
                    viewBox="0 0 580 180"
                    preserveAspectRatio="none"
                    role="img"
                    aria-label="Stacked UTC input and output recorded tokens"
                  >
                    {data.days.map((d, i) => {
                      const input = d.inputTokens === null ? null : (d.inputTokens / maximum) * 130,
                        output = d.outputTokens === null ? null : (d.outputTokens / maximum) * 130
                      return (
                        <g key={d.date} data-date={d.date}>
                          {input !== null && output !== null ? (
                            <>
                              <rect
                                data-part="input"
                                x={20 + i * 40}
                                y={155 - input}
                                width={24}
                                height={input}
                                fill={colors[2]}
                              />
                              <rect
                                data-part="output"
                                x={20 + i * 40}
                                y={155 - input - output}
                                width={24}
                                height={output}
                                fill="var(--color-success)"
                              />
                            </>
                          ) : (
                            <text x={20 + i * 40} y={140}>
                              ?
                            </text>
                          )}
                        </g>
                      )
                    })}
                  </svg>
                  <div className="torque-chart-axis">
                    <span>{data.days[0].date}</span>
                    <span>{data.days.at(-1)!.date}</span>
                  </div>
                  <p>
                    Actual stacked receipt parts, tokens per UTC run-start date; no rate or live
                    measurement. Null bins have no painted segments.
                  </p>
                  {companion}
                  {totals}
                </CardContent>
              </Card>
            </div>
            <Card size="sm">
              <CardContent>
                <BarMeter
                  title="Task pipeline"
                  rows={data.pipeline.map((p) => ({ ...p, color: "var(--color-primary)" }))}
                />
                <p>
                  Canonical reference rows only: {data.pipeline.reduce((n, p) => n + p.value, 0)} of{" "}
                  {model.tasks.length} tasks; {data.omitted.length} excluded (no
                  queued/running/failed coercion). Bar widths use largest included row, not all
                  tasks.
                </p>
                <ul>
                  {Array.from(new Set(model.tasks.map((t) => t.status))).map((status) => (
                    <li key={status}>
                      Raw {status}: {model.tasks.filter((t) => t.status === status).length}
                    </li>
                  ))}
                </ul>
                <p>Task lifecycle is independent of run outcome.</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </section>
  )
}
