import { PanelHeader, SCard } from "../primitives"
import { executions, providers, workers } from "./model"

export function Observability({
  empty,
  live,
  readOnly: _readOnly,
  onNotice,
}: {
  empty: boolean
  live: () => boolean
  readOnly: boolean
  onNotice: (value: string) => void
}) {
  const readOnly = true
  const data = empty ? [] : executions
  const total = data.length,
    duration = total ? data.reduce((n, v) => n + v.duration, 0) / total : 0,
    cost = data.reduce((n, v) => n + v.cost, 0),
    errors = data.filter((v) => v.error !== "").length
  return (
    <section data-section="observability">
      <PanelHeader
        title="Observability"
        description="Recorded fictional activity at 2026-10-04 14:30 UTC; no live metrics or provider calls."
      />
      <div className="flux-kpis">
        {[
          ["Executions", total],
          ["Avg Duration", `${duration.toFixed(0)}ms`],
          ["Total Cost", `$${cost.toFixed(3)}`],
          ["Error Rate", `${total ? ((errors / total) * 100).toFixed(1) : "0"}%`],
        ].map(([title, value]) => (
          <SCard key={title} title={String(title)}>
            <strong className="flux-kpi-value">{value}</strong>
          </SCard>
        ))}
      </div>
      <div className="flux-charts">
        <SCard title="Duration Timeline">
          <div
            className="flux-duration"
            role="img"
            aria-label={
              data.length
                ? `Execution durations: ${data.map((e) => `${e.time} ${e.duration}ms`).join(", ")}`
                : "Known empty duration timeline"
            }
          >
            {data.map((e) => (
              <div key={e.id}>
                <span>{e.time}</span>
                <progress max={2500} value={e.duration} />
                <span>{e.duration}ms</span>
              </div>
            ))}
            {!data.length && <p>No recorded executions.</p>}
          </div>
        </SCard>
        <SCard title="Provider Distribution">
          <div className="flux-distribution">
            {providers
              .filter((p) => p.enabled)
              .map((p) => {
                const count = data.filter((e) => e.provider === p.name).length
                return (
                  <div key={p.id}>
                    <span>{p.name}</span>
                    <progress max={Math.max(total, 1)} value={count} />
                    <span>{count} executions</span>
                  </div>
                )
              })}
          </div>
        </SCard>
      </div>
      <SCard title="Worker Status">
        <div className="flux-table-scroll">
          <table>
            <caption>Recorded workers</caption>
            <thead>
              <tr>
                {["Agent", "Type", "Status", "Session", "Age", "Worktree", "Action"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(empty ? [] : workers).map((w) => (
                <tr key={w.id}>
                  <td>{w.agent}</td>
                  <td>{w.type}</td>
                  <td>{w.status}</td>
                  <td>{w.session}</td>
                  <td>{w.age}</td>
                  <td>{w.path === undefined ? "Not supplied" : "Explicitly empty"}</td>
                  <td>
                    <button
                      type="button"
                      disabled={readOnly || w.status !== "running"}
                      onClick={() => {
                        if (live() && !readOnly && w.status === "running")
                          onNotice(`Cancel preview for worker ${w.id}; no worker action sent.`)
                      }}
                    >
                      Preview cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {empty && <p>No recorded workers.</p>}
        </div>
      </SCard>
      <SCard title="Recent Executions">
        <div className="flux-table-scroll">
          <table>
            <caption>Fictional execution records</caption>
            <thead>
              <tr>
                <th>Time</th>
                <th>Provider</th>
                <th>Duration</th>
                <th>Cost</th>
                <th>Error</th>
              </tr>
            </thead>
            <tbody>
              {data.map((e) => (
                <tr key={e.id}>
                  <td>{e.time}</td>
                  <td>{e.provider}</td>
                  <td>{e.duration}ms</td>
                  <td>${e.cost.toFixed(3)}</td>
                  <td>{e.error || "None recorded"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SCard>
    </section>
  )
}
