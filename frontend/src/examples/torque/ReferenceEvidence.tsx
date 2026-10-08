import { Button } from "@hollis-labs/design-components"
import type { OperationsModel } from "../../operations/model"
import { torqueReferenceModel } from "./reference"

export function TorqueReferenceEvidence({
  model,
  onSelect,
}: {
  model: OperationsModel
  onSelect: (id: string) => void
}) {
  const r = torqueReferenceModel(model)
  if (!r.compatible)
    return (
      <p>
        Legacy review profile. Choose Torque 16-week reference in Review fixtures to inspect its
        separate recorded evidence pack.
      </p>
    )
  const shown = (n: number | null) => (n === null ? "Unknown" : String(n))
  return (
    <section aria-label="Torque reference evidence" className="torque-reference-evidence">
      <h2>Torque reference evidence pack</h2>
      <p>
        {r.reference.version} / {r.reference.generator} · {model.dataset.profile} · Original UTC{" "}
        {r.reference.clock} · Current cutoff {model.cutoff}.
      </p>
      <p>
        Recorded fixture evidence; no live event subscription. Current filter:{" "}
        {model.query || "None"}. Calendar counts one effective latest task update plus each run
        start. Pulse counts only the distinct finite recorded start buffer.
      </p>
      <p>
        {!r.available
          ? `Evidence unavailable: ${model.resource}.`
          : `${model.runs.length} admitted matching runs · ${r.effectiveUpdates.length} effective task updates · ${r.starts.length} admitted buffer starts.`}
      </p>
      {model.scenario === "sparse" && (
        <p>
          Authored sparse appearance: UTC bins beginning on dates divisible by 3 are unavailable.
          The recorded pack and its declared coverage are unchanged.
        </p>
      )}
      <dl>
        <dt>Calendar coverage UTC</dt>
        <dd>
          {r.reference.calendar.from} → {r.reference.calendar.to}
        </dd>
        <dt>Pulse coverage UTC</dt>
        <dd>
          {r.reference.pulse.from} → {r.reference.pulse.to}
        </dd>
        <dt>14-day chart coverage UTC</dt>
        <dd>
          {r.reference.charts.from} → {r.reference.charts.to}
        </dd>
        <dt>Recorded buffer / recent limit</dt>
        <dd>
          {r.reference.recordedStarts.length} supplied starts; cap {r.reference.startBufferLimit} ·
          recent {r.reference.recentLimit}
        </dd>
        <dt>Attribution</dt>
        <dd>{r.attribution}</dd>
      </dl>
      <p>
        Calendar/pulse Unknown cells lack coverage; 0 means a covered empty interval. Partial bins
        end at the current cutoff. Receipt amounts are admitted recorded totals, not complete
        consumption when receipts are missing. No provider/model attribution is inferred.
      </p>
      <details>
        <summary>112 calendar UTC dates and effective update evidence</summary>
        <section
          className="torque-evidence-table"
          // biome-ignore lint/a11y/noNoninteractiveTabindex: Native keyboard scrolling of bounded evidence.
          tabIndex={0}
          aria-label="Calendar evidence table"
        >
          <table>
            <caption>16-week UTC calendar · latest task updates plus run starts</caption>
            <thead>
              <tr>
                <th>Date</th>
                <th>Count</th>
                <th>Coverage</th>
              </tr>
            </thead>
            <tbody>
              {r.calendar.map((d) => (
                <tr key={d.date}>
                  <td>{d.date}</td>
                  <td>{shown(d.count)}</td>
                  <td>{!d.known ? "Unknown" : d.partial ? "Partial" : "Covered"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <ul aria-label="Effective task update receipts">
          {r.effectiveUpdates.map((u) => (
            <li key={u.taskId}>
              {u.taskId} / {u.runId}: {u.time} · {u.status} · {u.eventId}
            </li>
          ))}
        </ul>
      </details>
      <details>
        <summary>24 recorded pulse intervals</summary>
        <section
          className="torque-evidence-table"
          // biome-ignore lint/a11y/noNoninteractiveTabindex: Native keyboard scrolling of bounded evidence.
          tabIndex={0}
          aria-label="Pulse evidence table"
        >
          <table>
            <caption>24 supplied UTC hourly intervals · finite recorded start buffer only</caption>
            <thead>
              <tr>
                <th>Start UTC</th>
                <th>Count</th>
                <th>Coverage</th>
              </tr>
            </thead>
            <tbody>
              {r.pulse.map((d) => (
                <tr key={d.from}>
                  <td>{d.from}</td>
                  <td>{shown(d.count)}</td>
                  <td>{!d.known ? "Unknown" : d.partial ? "Partial" : "Covered"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </details>
      <details>
        <summary>14 dated run/receipt totals</summary>
        <p>
          UTC run-start dates; receipt timestamp gates input/output tokens and exact USD amount.
          This bounded table scrolls vertically and horizontally: Tab into its labelled region, then
          use arrows to reach every column.
        </p>
        <section
          className="torque-evidence-table torque-receipt-table"
          // biome-ignore lint/a11y/noNoninteractiveTabindex: Native keyboard scrolling of bounded evidence.
          tabIndex={0}
          aria-label="Run receipt evidence table"
        >
          <table>
            <caption>14 UTC receipt dates</caption>
            <colgroup>
              {["date", "runs", "receipts", "input", "output", "usd", "coverage"].map((name) => (
                <col key={name} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th>Date</th>
                <th>Runs</th>
                <th>Receipts / missing</th>
                <th>Input tokens</th>
                <th>Output tokens</th>
                <th>USD</th>
                <th>Coverage</th>
              </tr>
            </thead>
            <tbody>
              {r.days.map((d) => (
                <tr key={d.date}>
                  <td>{d.date}</td>
                  <td>{shown(d.runs)}</td>
                  <td>
                    {shown(d.received)} / {shown(d.missing)}
                  </td>
                  <td>{shown(d.inputTokens)}</td>
                  <td>{shown(d.outputTokens)}</td>
                  <td>{shown(d.cost)}</td>
                  <td>
                    {d.receiptCoverage}
                    {d.partial ? " · Partial time interval" : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </details>
      <h3>Recent admitted runs · maximum 12</h3>
      <ul aria-label="Reference recent runs">
        {r.recent.map((run) => (
          <li key={run.id}>
            <Button variant="ghost" onClick={() => onSelect(run.taskId)}>
              {run.id} · {run.started} · {run.status}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  )
}
