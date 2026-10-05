import { Button, EmptyState } from "@hollis-labs/design-components"
import { StatusBadge } from "@hollis-labs/kit-dashboard"
import { Panel } from "@hollis-labs/kit-dashboard/widgets"
import {
  DiagnosticPanel,
  HealthSummary,
  ObservationStatus,
  StatCollection,
} from "@hollis-labs/kit-observe"
import { SampleSeriesView } from "@hollis-labs/kit-observe/charts"
import { type InspectionModel, traceDetail } from "./model"

const diagnosticSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    fixture: { type: "boolean" },
    operationsVersion: { type: "string" },
    failedRunIds: { type: "array", maxItems: 8, items: { type: "string" } },
  },
}
export function EvidenceViews({ model }: { model: InspectionModel }) {
  const observe = (id: string) => model.observations[id]
  if (model.outOfCoverage)
    return (
      <EmptyState
        variant="empty"
        title="Observation coverage unavailable"
        description="Selected cutoff lies outside this fixture observation window. No chart or health receipt is available."
      />
    )
  return (
    <>
      <p className="muted">
        Resource timestamps are last successful authored fixture receipts. Refresh does not change
        them. At earlier cutoffs, series and counts are retrospective projections of recorded
        evidence; future health/diagnostic receipts are withheld. Source: operations/v2 records; no
        live telemetry or provider probing.
      </p>
      <div className="admin-columns">
        <HealthSummary
          label="Fixture review outcomes"
          status={model.health}
          checks={
            model.empty
              ? []
              : [
                  {
                    id: "runs",
                    label: "Recorded review outcomes",
                    status: model.health,
                    message:
                      model.state === "unknown"
                        ? "Unfamiliar fixture status is normalized to unknown"
                        : `${model.runs.filter((r) => r.status === "failed").length} scripted failed runs in the visible recorded timeline; not service health`,
                  },
                ]
          }
          observation={observe("health")}
        />
        <StatCollection
          label="Fixture usage counts"
          rows={[
            {
              id: "tokens",
              label: "Recorded token total",
              value: model.tokens,
              unit: "count",
              kind: "counter",
              observation: model.projections.stats,
            },
            {
              id: "runs",
              label: "Recorded runs",
              value: model.accessible ? model.runs.length : null,
              unit: "count",
              kind: "gauge",
              observation: model.projections.stats,
            },
          ]}
        />
      </div>
      <SampleSeriesView
        label="Exact cumulative token samples"
        points={model.series}
        unit="count"
        kind="counter"
        requested={{ from: model.artifact.from, to: model.cutoff, limit: 16 }}
        bounds={{ maxPoints: 16, maxWindowSeconds: 86400 }}
        truncated={model.state === "truncated"}
        observation={model.projections.token}
      />
      <SampleSeriesView
        label="Recorded run durations"
        points={model.duration}
        unit="seconds"
        kind="gauge"
        requested={{ from: model.artifact.from, to: model.cutoff, limit: 16 }}
        bounds={{ maxPoints: 16, maxWindowSeconds: 86400 }}
        truncated={false}
        observation={model.projections.duration}
      />
      <DiagnosticPanel
        label="Bounded failure diagnostics"
        schema={diagnosticSchema}
        data={model.diagnostic}
        validation={model.validation}
        observation={observe("diagnostics")}
      />
    </>
  )
}
export function LogList({
  model,
  onSelect,
}: {
  model: InspectionModel
  onSelect: (runId: string, spanId: string) => void
}) {
  return (
    <ObservationStatus label="Recorded log search" observation={model.projections.logs}>
      {model.logs.length ? (
        <div className="inspection-records">
          {model.logs.map((log) => (
            <button
              type="button"
              className="inspection-record"
              key={log.id}
              onClick={() => onSelect(log.runId, log.spanId)}
            >
              <span>
                {log.id} · {log.level.toUpperCase()}
              </span>
              <time dateTime={log.time}>{log.time.replace("T", " ").replace("Z", " UTC")}</time>
              <strong>{log.message}</strong>
              <span className="muted">
                {log.runId} · {log.traceId} · {log.spanId}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          variant="empty"
          title="No matching recorded logs"
          description="The successful fixture window/filter has no rows."
        />
      )}
    </ObservationStatus>
  )
}
export function TraceInspection({
  model,
  runId,
  spanId,
  onRun,
  onSpan,
  onInspect,
}: {
  model: InspectionModel
  runId: string | null
  spanId: string | null
  onRun: (id: string) => void
  onSpan: (id: string) => void
  onInspect: (taskId: string) => void
}) {
  const detail = traceDetail(model, runId, spanId)
  return (
    <ObservationStatus label="Recorded trace inspection" observation={model.projections.runs}>
      <label>
        Trace run
        <select aria-label="Trace run" value={runId ?? ""} onChange={(e) => onRun(e.target.value)}>
          <option value="">Select recorded run</option>
          {model.runs.map((r) => (
            <option key={r.id}>{r.id}</option>
          ))}
        </select>
      </label>
      {detail ? (
        <>
          <div className="selection-band">
            <strong>
              {detail.trace?.id} · {detail.run.id} · {detail.session?.id}
            </strong>
            <Button onClick={() => onInspect(detail.run.taskId)}>
              {model.cutoff === model.artifact.clock
                ? "Inspect related run (full snapshot)"
                : "Inspect related run (current cutoff)"}
            </Button>
          </div>
          <div className="admin-columns">
            <Panel icon={null} title="Recorded spans">
              <div className="example-body">
                {detail.spans.map((span) => (
                  <button
                    type="button"
                    className="inspection-record"
                    key={span.id}
                    aria-pressed={detail.selected?.id === span.id}
                    onClick={() => onSpan(span.id)}
                  >
                    <strong>
                      {span.id} · {span.name}
                    </strong>
                    <StatusBadge status={span.status} />
                    <span>{span.parentId ? `Parent ${span.parentId}` : "Root span"}</span>
                    <time>{span.started.replace("T", " ").replace("Z", " UTC")}</time>
                    <span>
                      {span.finished
                        ? `${(Date.parse(span.finished) - Date.parse(span.started)) / 1000} seconds`
                        : "Unfinished or beyond selected timeline; no duration sample"}
                    </span>
                  </button>
                ))}
              </div>
            </Panel>
            <Panel icon={null} title="Span detail">
              <div className="example-body">
                <h3>{detail.selected?.id}</h3>
                <p>{detail.selected?.parentId ?? "No parent (root span)"}</p>
                <h4>Related tool calls</h4>
                {detail.tools.length ? (
                  detail.tools.map((t) => (
                    <article key={t.id}>
                      <strong>
                        {t.id} · {t.name}
                      </strong>
                      <StatusBadge status={t.status} />
                      <p>
                        Started {t.started} · {t.finished ?? "Finish not yet visible"}
                      </p>
                      <p>Input: {t.input}</p>
                      <p>Output: {t.output ?? "Not observed in this timeline position"}</p>
                    </article>
                  ))
                ) : (
                  <p className="muted">No tool call belongs to this span.</p>
                )}
                <h4>Related logs</h4>
                {detail.logs.map((l) => (
                  <p key={l.id}>
                    {l.id} · {l.message}
                  </p>
                ))}
                <h4>Related usage</h4>
                {detail.usage ? (
                  <p>
                    {detail.usage.id} · {detail.usage.inputTokens} input +{" "}
                    {detail.usage.outputTokens} output = {detail.usage.tokens} tokens · authored USD
                    estimate ${detail.usage.cost.toFixed(6)}
                  </p>
                ) : (
                  <p className="muted">Usage not observed in this timeline position.</p>
                )}
              </div>
            </Panel>
          </div>
        </>
      ) : (
        <EmptyState
          variant="empty"
          title="No recorded trace selected"
          description="Select a visible run; unavailable evidence is not a blank healthy trace."
        />
      )}
    </ObservationStatus>
  )
}
export function UsageInspection({
  model,
  onSelect,
}: {
  model: InspectionModel
  onSelect: (runId: string) => void
}) {
  return (
    <ObservationStatus label="Recorded usage inspection" observation={model.projections.usage}>
      <div className="notice">
        Cost is an authored USD fixture estimate from the same usage records. Provider/model
        attribution is unavailable; this is not billed usage. Tokens are counts, not throughput.
      </div>
      <p>Total USD estimate: {model.cost === null ? "Unavailable" : `$${model.cost.toFixed(6)}`}</p>
      <div className="inspection-records">
        {model.usage.map((u) => (
          <button
            type="button"
            className="inspection-record"
            key={u.id}
            onClick={() => onSelect(u.runId)}
          >
            <strong>
              {u.id} · {u.runId}
            </strong>
            <time>{u.time.replace("T", " ").replace("Z", " UTC")}</time>
            <span>
              {u.inputTokens} input + {u.outputTokens} output = {u.tokens} tokens
            </span>
            <span>USD estimate ${u.cost.toFixed(6)}</span>
          </button>
        ))}
      </div>
      {!model.usage.length && (
        <EmptyState
          variant="empty"
          title="No recorded usage"
          description="No usage samples occur in this successful selected timeline."
        />
      )}
    </ObservationStatus>
  )
}
