import { Card, CardContent } from "@hollis-labs/design-components"
import { StatusBadge } from "@hollis-labs/kit-dashboard"
import { RecentList } from "@hollis-labs/kit-dashboard/widgets"
import { useLayoutEffect, useRef, useState } from "react"
import type { OperationsModel } from "../../operations/model"
import { ResourceNotice } from "../../operations/Views"
import { activityLevel, torqueActivityModel } from "./activity"

export function TorqueActivity({
  model,
  onSelect,
}: {
  model: OperationsModel
  onSelect: (id: string) => void
}) {
  const data = torqueActivityModel(model)
  const life = useRef({ alive: false, source: data.source, lease: 0 }),
    [, fresh] = useState(0)
  life.current.source = data.source
  useLayoutEffect(() => {
    life.current.alive = true
    life.current.lease++
    fresh((n) => n + 1)
    return () => {
      life.current.alive = false
      life.current.lease++
    }
  }, [])
  const source = data.source,
    lease = life.current.lease
  const choose = (runId: string) => {
    if (
      !life.current.alive ||
      life.current.source !== source ||
      life.current.lease !== lease ||
      !data.available
    )
      return
    const task = model.tasks.find((t) => t.runId === runId)
    if (task && data.recent.some((r) => r.id === runId)) onSelect(task.id)
  }
  if (!model.accessible) return <ResourceNotice model={model} />
  if (!data.compatible)
    return (
      <p>Torque reference operands unavailable for this source. Choose Torque 16-week reference.</p>
    )
  const weeks = Array.from({ length: 16 }, (_, i) => data.calendar.slice(i * 7, i * 7 + 7))
  return (
    <section className="torque-activity" aria-label="Torque reference Activity">
      {model.scenario === "sparse" && (
        <p>
          Authored sparse review mask: UTC dates divisible by 3 are shown Unknown; recorded source
          coverage is unchanged.
        </p>
      )}
      {model.resource === "degraded" && (
        <p role="status">
          Degraded fixture presentation: supplied evidence remains visible; no live connection or
          refresh.
        </p>
      )}
      <Card size="sm">
        <CardContent>
          <div className="torque-activity-title">
            <h2>Activity — 16w</h2>
            <span>tasks · runs</span>
          </div>
          <div
            className="torque-calendar"
            role="img"
            aria-label="16-week latest task update and run-start calendar"
          >
            <div className="torque-calendar-months" aria-hidden="true">
              {weeks.map((w, i) => (
                <span key={w[0].date}>
                  {i === 0 || w[0].date.slice(0, 7) !== weeks[i - 1][0].date.slice(0, 7)
                    ? new Date(`${w[0].date}T12:00:00Z`).toLocaleString("en", {
                        month: "short",
                        timeZone: "UTC",
                      })
                    : ""}
                </span>
              ))}
            </div>
            <div className="torque-calendar-grid">
              <div className="torque-weekdays" aria-hidden="true">
                {["", "M", "", "W", "", "F", ""].map((d, i) => (
                  <span key={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][i]}>{d}</span>
                ))}
              </div>
              {weeks.map((w) => (
                <div className="torque-calendar-week" key={w[0].date}>
                  {w.map((c) => (
                    <span
                      key={c.date}
                      className="torque-calendar-cell"
                      data-level={activityLevel(c.count, data.maximum)}
                      data-count={c.count ?? "unknown"}
                      data-date={c.date}
                      data-partial={c.partial}
                      title={`${c.date}: ${c.count ?? "Unknown"}${c.partial ? " · partial day" : ""}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="torque-calendar-legend">
            <span>
              {data.calendarTotal ?? "Unknown"} visible covered events · peak{" "}
              {data.calendarTotal === null ? "Unknown" : data.maximum}
            </span>
            <span>
              Less{" "}
              {["0", "1", "2", "3", "4"].map((l) => (
                <i key={l} className="torque-calendar-cell" data-level={l} />
              ))}{" "}
              More
            </span>
            <span>
              <i className="torque-calendar-cell" data-level="unknown" /> Unknown / future
            </span>
          </div>
          <p>
            One latest admitted task update plus each admitted run start. Fixed UTC weeks;{" "}
            {data.unknownDays} dates unknown. Partial day counts end at cutoff. Intensity normalizes
            visible covered counts.
          </p>
          <details>
            <summary>Exact Activity calendar evidence</summary>
            <section
              className="torque-activity-table"
              aria-label="Activity calendar UTC table"
              // biome-ignore lint/a11y/noNoninteractiveTabindex: Native keyboard scrolling for bounded exact evidence.
              tabIndex={0}
            >
              <table>
                <caption>112 UTC dates · latest updates + run starts</caption>
                <thead>
                  <tr>
                    <th>UTC date</th>
                    <th>Events</th>
                    <th>Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {data.calendar.map((c) => (
                    <tr key={c.date}>
                      <td>{c.date}</td>
                      <td>{c.count ?? "Unknown"}</td>
                      <td>{!c.known ? "Unknown" : c.partial ? "Partial day" : "Covered day"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </details>
        </CardContent>
      </Card>
      <div className="torque-activity-pair">
        <Card size="sm">
          <CardContent>
            <div className="torque-activity-title">
              <h2>24h pulse — recorded</h2>
              <span>
                {data.pulseTotal ?? "Unknown"} visible starts · peak{" "}
                {data.pulseTotal === null ? "Unknown" : data.pulseMaximum}
              </span>
            </div>
            <div
              className="torque-pulse"
              role="img"
              aria-label="24 fixed UTC recorded start intervals"
            >
              {data.pulse.map((b) => (
                <div
                  key={b.from}
                  className="torque-pulse-bin"
                  data-count={b.count ?? "unknown"}
                  data-partial={b.partial}
                  title={`${b.from} → ${b.to}: ${b.count ?? "Unknown"}`}
                >
                  <i
                    style={{
                      height:
                        b.count === null
                          ? "100%"
                          : `${b.count ? Math.max(8, (b.count / Math.max(1, data.pulseMaximum)) * 100) : 0}%`,
                      opacity:
                        b.count === null
                          ? 1
                          : b.count / Math.max(1, data.pulseMaximum) > 0.66
                            ? 1
                            : b.count / Math.max(1, data.pulseMaximum) > 0.33
                              ? 0.75
                              : 0.4,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="torque-pulse-labels">
              <span>−24h</span>
              <span>−12h</span>
              <span>Reference UTC</span>
            </div>
            <p>
              {data.starts.length} admitted supplied buffer entries; {data.pulseTotal ?? "Unknown"}{" "}
              visible starts in reference age bins (from, to]. Exact left endpoint excluded; right
              included. {data.unknownHours} intervals unknown; current interval may be partial.
            </p>
            <details>
              <summary>Exact recorded pulse intervals</summary>
              <section
                className="torque-activity-table"
                aria-label="Activity pulse UTC table"
                // biome-ignore lint/a11y/noNoninteractiveTabindex: Native keyboard scrolling for bounded exact evidence.
                tabIndex={0}
              >
                <table>
                  <caption>Fixed original UTC window · left exclusive, right inclusive</caption>
                  <thead>
                    <tr>
                      <th>UTC interval</th>
                      <th>Starts</th>
                      <th>Coverage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.pulse.map((b) => (
                      <tr key={b.from}>
                        <td>
                          {b.from.slice(0, 16)}Z → {b.to.slice(0, 16)}Z
                        </td>
                        <td>{b.count ?? "Unknown"}</td>
                        <td>
                          {!b.known
                            ? "Unknown"
                            : b.partial
                              ? "Partial interval"
                              : "Covered interval"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </details>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent>
            <RecentList
              items={data.recent}
              getKey={(r) => r.id}
              title="Recent runs — recorded"
              limit={12}
              emptyLabel="No admitted matching runs · known count 0"
              onSelect={(r) => choose(r.id)}
              className="torque-recent"
              renderItem={(r) => {
                const task = model.tasks.find((t) => t.runId === r.id),
                  receipt = model.usage.find((u) => u.id === r.usageId && u.runId === r.id)
                return (
                  <span className="torque-recent-row">
                    <strong>{task?.title ?? "Task unavailable"}</strong>
                    <span>
                      {task?.id} / {r.id} · {r.started.replace("T", " ").replace("Z", " UTC")}
                    </span>
                    <span>
                      <StatusBadge status={r.status} /> · task {task?.status ?? "Unknown"} · receipt
                      tokens {receipt ? receipt.tokens : "Unknown"}
                    </span>
                  </span>
                )
              }}
            />
            <p>
              Newest admitted run starts, limit 12. Absolute UTC and current joined receipt; no
              missing amount is converted to zero.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
