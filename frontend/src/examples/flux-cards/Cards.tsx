import { Button, JsonViewer, Pill, ProgressBar } from "@hollis-labs/design-components"
import {
  ArtifactCard,
  ConfirmationCard,
  DiffCard,
  DocumentCard,
  Envelope,
  EnvelopeBody,
  EnvelopeFooter,
  EnvelopeHeader,
  EnvelopeSection,
  InfoCard,
  ListCard,
  MetricCard,
  ProgressCard,
  PromptCard,
  TableCard,
  TimelineCard,
} from "@hollis-labs/kit-chat"
import { AlertTriangle, BarChart3, HelpCircle, ShieldAlert } from "lucide-react"
import { useId, useState } from "react"
import { record, referenceTime, rows, text, type WireEnvelope } from "./model"

type Inspect = (label: string, value: unknown) => void
export type CardProps = { envelope: WireEnvelope; editable: boolean; inspect: Inspect }
function missing(data: Record<string, unknown>, fields: string[]) {
  return fields.filter((field) => data[field] === undefined || data[field] === null)
}
const risks = { low: "success", medium: "warning", high: "danger" } as const
function receipt(envelope: WireEnvelope) {
  const prior = envelope.prior_response
  if (!prior) return "pending"
  if (envelope.type === "elicitation-prompt") {
    if (prior.status !== "submitted" && prior.status !== "canceled") return prior.status
    return prior.data?.action === "decline"
      ? "declined"
      : prior.data?.action === "cancel"
        ? "canceled"
        : prior.data?.action === "accept"
          ? "accepted"
          : "unavailable decision"
  }
  if (prior.status === "canceled" || prior.status === "cancelled")
    return envelope.type === "proposal-card" ? "dismissed" : "rejected"
  if (prior.status !== "submitted") return prior.status
  if (envelope.type === "proposal-card") return "applied"
  return prior.data?.approved === false
    ? "rejected"
    : prior.data?.approved === true || envelope.type === "subagent-spawn-approval"
      ? "approved"
      : "unavailable decision"
}
function Approval({ envelope, editable, inspect }: CardProps) {
  const data = envelope.data ?? {},
    subagent = envelope.type === "subagent-spawn-approval"
  const decision = receipt(envelope),
    [reason, setReason] = useState("")
  const risk = data.risk_level === undefined ? "low" : text(data.risk_level)
  const tone = risks[risk as keyof typeof risks] ?? "neutral"
  const title = subagent ? "Subagent spawn approval" : "Approval required"
  return (
    <Envelope accent={tone} muted={decision !== "pending"}>
      <EnvelopeHeader
        icon={ShieldAlert}
        label={title}
        tone={tone}
        meta={subagent ? text(data.run_id) : undefined}
        action={<Pill tone={tone}>{risk} risk</Pill>}
      />
      <EnvelopeBody
        title={subagent ? text(data.role) : text(data.description)}
        description={subagent ? undefined : text(data.details, "No details supplied")}
      >
        <p>
          Supplied decision: {decision}.{" "}
          {envelope.prior_response ? "Recorded fixture receipt." : "No receipt supplied."}
        </p>
        {subagent && (
          <>
            <p>
              Mode: {text(data.mode)} · Timeout: {text(data.timeout_seconds, "not supplied")}
            </p>
            <EnvelopeSection label="Prompt">
              <pre>{text(data.prompt)}</pre>
            </EnvelopeSection>
            {(data.parent_agent_id !== undefined || data.inputs_json !== undefined) && (
              <details>
                <summary>Advanced</summary>
                <p>Parent: {text(data.parent_agent_id)}</p>
                <pre>{text(data.inputs_json)}</pre>
              </details>
            )}
            {decision === "pending" && (
              <label>
                Local rejection reason
                <textarea
                  aria-label="Local rejection reason"
                  value={reason}
                  disabled={!editable}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>
            )}
          </>
        )}
      </EnvelopeBody>
      {decision === "pending" && (
        <EnvelopeFooter className="flex-wrap">
          <Button
            disabled={!editable || !envelope.id}
            onClick={() =>
              inspect(
                "Approval candidate",
                subagent
                  ? { status: "submitted" }
                  : {
                      status: "submitted",
                      data: { approved: true, description: data.description },
                    },
              )
            }
          >
            Inspect approve candidate
          </Button>
          <Button
            variant="outline"
            disabled={!editable || !envelope.id}
            onClick={() =>
              inspect(
                "Rejection candidate",
                subagent
                  ? { status: "canceled", data: { reason } }
                  : {
                      status: "submitted",
                      data: { approved: false, description: data.description },
                    },
              )
            }
          >
            Inspect reject candidate
          </Button>
        </EnvelopeFooter>
      )}
    </Envelope>
  )
}
function Proposal({ envelope, editable, inspect }: CardProps) {
  const data = envelope.data ?? {},
    decision = receipt(envelope)
  const formId = useId()
  const [fields, setFields] = useState(record(data.payload)),
    schema = record(data.schema)
  return (
    <Envelope
      accent={decision === "applied" ? "success" : undefined}
      muted={decision !== "pending"}
    >
      <EnvelopeHeader
        label="Proposal"
        meta={text(data.type)}
        action={<Pill>Supplied {decision}</Pill>}
      />
      <EnvelopeBody>
        {Object.keys(fields).length === 0 && <p>Supplied empty payload · no fields.</p>}
        {Object.entries(fields).map(([key, value]) => {
          const field = record(schema[key]),
            label = text(field.label, key),
            type = text(field.type, "text")
          return (
            <label key={key} htmlFor={`${formId}-${key}`}>
              {label}
              {field.required === true ? " (required)" : ""}
              {type === "select" && Array.isArray(field.options) ? (
                <select
                  id={`${formId}-${key}`}
                  aria-label={label}
                  value={String(value ?? "")}
                  disabled={!editable || decision !== "pending"}
                  onChange={(e) => setFields({ ...fields, [key]: e.target.value })}
                >
                  {field.options.map((option) => (
                    <option key={String(option)}>{String(option)}</option>
                  ))}
                </select>
              ) : type === "textarea" ? (
                <textarea
                  id={`${formId}-${key}`}
                  aria-label={label}
                  value={String(value ?? "")}
                  disabled={!editable || decision !== "pending"}
                  onChange={(e) => setFields({ ...fields, [key]: e.target.value })}
                />
              ) : (
                <input
                  id={`${formId}-${key}`}
                  aria-label={label}
                  type={type === "number" ? "number" : "text"}
                  value={typeof value === "object" ? JSON.stringify(value) : String(value ?? "")}
                  disabled={!editable || decision !== "pending"}
                  onChange={(e) => setFields({ ...fields, [key]: e.target.value })}
                />
              )}
            </label>
          )
        })}
      </EnvelopeBody>
      {decision === "pending" && (
        <EnvelopeFooter className="flex-wrap">
          <Button
            disabled={!editable}
            onClick={() => inspect("Proposal candidate", { type: data.type, payload: fields })}
          >
            Inspect apply candidate
          </Button>
          <Button
            variant="outline"
            disabled={!editable}
            onClick={() => inspect("Dismiss proposal candidate", { type: data.type })}
          >
            Inspect dismiss candidate
          </Button>
        </EnvelopeFooter>
      )}
    </Envelope>
  )
}
function Elicitation({ envelope, editable, inspect }: CardProps) {
  const data = envelope.data ?? {},
    state = receipt(envelope)
  const [value, setValue] = useState(
    typeof envelope.prior_response?.data?.content === "string"
      ? envelope.prior_response.data.content
      : "",
  )
  const expired = typeof data.timeout_at === "string" && data.timeout_at <= referenceTime
  const candidate = (action: string, content?: string) =>
    inspect("Elicitation candidate", {
      status: "submitted",
      data: {
        action,
        elicitation_id: data.elicitation_id,
        ...(content !== undefined ? { content } : {}),
      },
    })
  if (state !== "pending" || expired)
    return (
      <Envelope muted accent="neutral">
        <EnvelopeBody
          title={`Supplied ${expired && state === "pending" ? "expired" : state}`}
          description={text(data.message)}
        >
          <p>Answer: {value || "No text answer supplied"}</p>
        </EnvelopeBody>
      </Envelope>
    )
  if (!editable)
    return <InfoCard title={text(data.message)} body="Input withheld by access policy." />
  if (data.schema_type === "string")
    return (
      <PromptCard
        questionId={text(data.elicitation_id)}
        title={text(data.schema_title, text(data.message))}
        description={text(
          data.schema_description,
          `Origin: ${text(data.origin)} · fixed timeout ${text(data.timeout_at)}`,
        )}
        value={value}
        onValueChange={setValue}
        inputLabel="Local elicitation answer"
        submitLabel="Inspect answer candidate"
        cancelLabel="Inspect decline candidate"
        onRespond={(outcome) =>
          candidate(
            outcome.status === "canceled" ? "decline" : "accept",
            outcome.status === "canceled" ? undefined : value.trim(),
          )
        }
      />
    )
  return (
    <Envelope accent="info">
      <EnvelopeHeader
        label={`${data.origin === "client" ? "External tool" : "Tool"} is asking`}
        icon={HelpCircle}
        tone="info"
      />
      <EnvelopeBody
        title={text(data.message)}
        description={`Fixed timeout: ${text(data.timeout_at)}`}
      />
      <EnvelopeFooter className="flex-wrap">
        <Button onClick={() => candidate("accept")}>Inspect accept candidate</Button>
        <Button variant="outline" onClick={() => candidate("decline")}>
          Inspect decline candidate
        </Button>
        <Button variant="ghost" onClick={() => candidate("cancel")}>
          Inspect cancel candidate
        </Button>
      </EnvelopeFooter>
    </Envelope>
  )
}
const termination = {
  max_turns: ["Turn limit reached", "Ask to continue or split the request."],
  hard_ceiling: ["Hard ceiling reached", "The safety cap ended this generation."],
  runaway_tool_failures: ["Runaway tool failures", "Tool failure circuit breaker tripped."],
  idle_timeout: ["Idle timeout", "No output arrived before the supplied timeout."],
  retry_budget_exhausted: [
    "Retry budget exhausted",
    "All supplied provider recovery attempts were used.",
  ],
} as const
export function FluxCard(props: CardProps) {
  const { envelope, editable, inspect } = props,
    data = envelope.data ?? {}
  const required = (
    {
      "approval-card": ["description"],
      "subagent-spawn-approval": ["run_id", "role", "prompt", "mode"],
      "proposal-card": ["type", "payload"],
      "elicitation-prompt": ["elicitation_id", "message", "schema_type", "origin", "timeout_at"],
    } as Record<string, string[]>
  )[envelope.type]
  if (required && missing(data, required).length)
    return (
      <InfoCard
        tone="warning"
        title="Incomplete card"
        body={`Missing required operands: ${missing(data, required).join(", ")}. Input withheld.`}
      />
    )
  switch (envelope.type) {
    case "approval-card":
    case "subagent-spawn-approval":
      return <Approval {...props} />
    case "proposal-card":
      return <Proposal {...props} />
    case "elicitation-prompt":
      return <Elicitation {...props} />
    case "artifact-mini":
      return (
        <ArtifactCard
          name={text(data.name)}
          meta={
            <span>
              {text(data.artifact_id)} · {text(data.mime_type)} ·{" "}
              {data.size_bytes === undefined ? "Size unavailable" : `${text(data.size_bytes)} B`} ·{" "}
              {text(data.origin)}
            </span>
          }
        />
      )
    case "document-viewer":
      return (
        <DocumentCard title={text(data.title)} meta={text(data.format)}>
          <pre>{text(data.content)}</pre>
          {Array.isArray(data.sections) && <p>Sections: {data.sections.join(" · ")}</p>}
        </DocumentCard>
      )
    case "info-card":
      return (
        <InfoCard
          title={text(data.title)}
          body={text(data.body)}
          tone={
            data.variant === "success" || data.variant === "warning" || data.variant === "danger"
              ? data.variant
              : "info"
          }
        />
      )
    case "metric-card":
      return (
        <MetricCard
          label={text(data.label)}
          value={text(data.value)}
          unit={text(data.unit, "")}
          previous={data.previous === undefined ? undefined : text(data.previous)}
          trend={
            data.trend === "up" || data.trend === "down" || data.trend === "flat"
              ? data.trend
              : undefined
          }
          description={text(data.description, "")}
        />
      )
    case "progress-card":
      return typeof data.progress !== "number" ? (
        <InfoCard title={text(data.title)} body="Progress unavailable; no percentage inferred." />
      ) : (
        <ProgressCard
          title={text(data.title)}
          percent={data.progress}
          status={text(data.status)}
          steps={rows(data.steps).map((step) => ({
            label: text(step.label),
            done: step.done === true,
          }))}
        />
      )
    case "list-card":
      return data.items === undefined ? (
        <InfoCard
          title={text(data.title)}
          body="Items unavailable; no successful empty list inferred."
        />
      ) : (
        <ListCard
          title={text(data.title)}
          description={
            Array.isArray(data.items) && data.items.length === 0
              ? "Known empty list · 0 supplied items"
              : undefined
          }
          items={rows(data.items).map((item, index) => ({
            id: typeof item.id === "string" ? item.id : `local-position-${index}`,
            label: text(item.label),
            description: text(item.description, ""),
            status: text(item.status, ""),
          }))}
        />
      )
    case "table-card":
      return data.columns === undefined || data.rows === undefined ? (
        <InfoCard title={text(data.title)} body="Table operands unavailable." />
      ) : (
        <TableCard
          title={text(data.title)}
          caption={text(
            data.caption,
            rows(data.rows).length === 0
              ? "Known empty table · 0 supplied rows"
              : "Read-only supplied rows; local position identity where wire has none.",
          )}
          columns={[
            ...rows(data.columns).map((column) => ({
              key: text(column.key),
              header: text(column.label),
              sortable: column.sortable === true,
              render: (row: Record<string, unknown>) => (
                <>
                  <span>{text(row[text(column.key)], "Cell unavailable")}</span>
                  {envelope.id &&
                    rows(column.actions).map((action) => (
                      <Button
                        key={text(action.id)}
                        size="sm"
                        disabled={!editable || !!envelope.prior_response}
                        onClick={() =>
                          inspect("Table cell action candidate", {
                            action_id: action.id,
                            row_index: rows(data.rows).findIndex(
                              (candidate) => JSON.stringify(candidate) === JSON.stringify(row),
                            ),
                            column_key: column.key,
                          })
                        }
                      >
                        Inspect {text(action.label)} candidate
                      </Button>
                    ))}
                </>
              ),
            })),
            ...(envelope.id && rows(data.actions).length
              ? [
                  {
                    key: "local-actions",
                    header: "Local inert row actions",
                    render: (row: Record<string, unknown>) => (
                      <>
                        {rows(data.actions).map((action) => (
                          <Button
                            key={text(action.id)}
                            size="sm"
                            disabled={!editable || !!envelope.prior_response}
                            onClick={() =>
                              inspect("Table row action candidate", {
                                action_id: action.id,
                                row_index: rows(data.rows).findIndex(
                                  (candidate) => JSON.stringify(candidate) === JSON.stringify(row),
                                ),
                              })
                            }
                          >
                            Inspect {text(action.label)} candidate
                          </Button>
                        ))}
                      </>
                    ),
                  },
                ]
              : []),
          ]}
          rows={rows(data.rows)}
          rowId={(row) =>
            typeof row.id === "string"
              ? row.id
              : `local-position-${rows(data.rows).findIndex((candidate) => JSON.stringify(candidate) === JSON.stringify(row))}`
          }
        />
      )
    case "timeline-card":
      return data.events === undefined ? (
        <InfoCard title={text(data.title)} body="Events unavailable." />
      ) : (
        <TimelineCard
          title={text(data.title, rows(data.events).length ? "Timeline" : "Known empty timeline")}
          events={rows(data.events).map((event) => ({
            timestamp: text(event.timestamp),
            label: text(event.label),
            description: text(event.description, ""),
            status:
              event.status === "completed" ||
              event.status === "active" ||
              event.status === "pending"
                ? event.status
                : undefined,
          }))}
        />
      )
    case "diff-card":
      return !data.before || !data.after ? (
        <InfoCard title={text(data.title)} body="Diff pair unavailable." />
      ) : (
        <DiffCard
          title={text(data.title)}
          before={{
            label: text(record(data.before).label),
            content: <pre>{text(record(data.before).content)}</pre>,
          }}
          after={{
            label: text(record(data.after).label),
            content: <pre>{text(record(data.after).content)}</pre>,
          }}
          format={data.format === "code" ? "code" : "text"}
        />
      )
    case "confirmation-card":
      return !editable || !data.title || !data.message ? (
        <InfoCard
          title={text(data.title)}
          body={text(data.message, "Incomplete confirmation; input withheld.")}
        />
      ) : (
        <ConfirmationCard
          title={text(data.title)}
          description={text(data.message)}
          actions={[{ id: "confirm", label: "Inspect confirm candidate" }]}
          cancelLabel="Inspect cancel candidate"
          priorStatus={envelope.prior_response?.status}
          onRespond={(outcome) => inspect("Confirmation candidate", outcome)}
        />
      )
    case "report-card":
      return (
        <Envelope>
          <EnvelopeHeader
            label={text(data.title)}
            icon={BarChart3}
            meta={
              data.generated_at === undefined
                ? "Generated time unavailable"
                : text(data.generated_at)
            }
          />
          <EnvelopeBody>
            {data.metrics === undefined ? (
              <p>Metrics unavailable.</p>
            ) : rows(data.metrics).length === 0 ? (
              <p>Known empty metrics · 0 supplied.</p>
            ) : (
              <div className="flux-metrics">
                {rows(data.metrics).map((metric) => (
                  <MetricCard
                    key={text(metric.label)}
                    label={text(metric.label)}
                    value={text(metric.value)}
                    description={
                      typeof metric.percent === "number" ? (
                        <ProgressBar value={metric.percent} />
                      ) : undefined
                    }
                  />
                ))}
              </div>
            )}
            <p>{text(data.summary, "No summary supplied")}</p>
            {data.session_link !== undefined && (
              <p>
                Session reference: {text(record(data.session_link).label)} ·{" "}
                {text(record(data.session_link).url)}
              </p>
            )}
          </EnvelopeBody>
          {rows(data.actions).length > 0 && (
            <EnvelopeFooter className="flex-wrap">
              {rows(data.actions).map((action) => (
                <Button
                  key={`${text(action.action)}-${text(action.id)}`}
                  disabled={!editable}
                  onClick={() => inspect("Report action candidate", action)}
                >
                  Inspect {text(action.label)} candidate
                </Button>
              ))}
            </EnvelopeFooter>
          )}
        </Envelope>
      )
    case "error-report":
      return (
        <Envelope
          accent={data.code === "rate_limit" || data.code === "tool_error" ? "warning" : "danger"}
        >
          <EnvelopeHeader
            label={text(data.code, "Error code unavailable")}
            icon={AlertTriangle}
            tone="danger"
            meta={text(data.timestamp)}
          />
          <EnvelopeBody title={text(data.message)}>
            <pre>
              {data.details === undefined
                ? "Details unavailable"
                : JSON.stringify(data.details, null, 2)}
            </pre>
            <p>Local static error · no external media.</p>
          </EnvelopeBody>
          <EnvelopeFooter className="flex-wrap">
            <Button onClick={() => inspect("Error details", data)}>Inspect error details</Button>
          </EnvelopeFooter>
        </Envelope>
      )
    case "chat-loop-terminated": {
      const code = text(data.code),
        info = termination[code as keyof typeof termination]
      return (
        <Envelope accent={code === "max_turns" || code === "idle_timeout" ? "warning" : "danger"}>
          <EnvelopeHeader
            label="Loop terminated"
            icon={AlertTriangle}
            meta={text(data.timestamp)}
            action={<Pill>{info?.[0] ?? code}</Pill>}
          />
          <EnvelopeBody
            title={text(data.reason)}
            description={info?.[1] ?? "No natural final reply was supplied."}
          >
            <p>
              Iteration: {text(data.iteration)} · Consecutive failures:{" "}
              {text(data.consecutive_failures)}
            </p>
            {data.last_tool !== undefined && <p>Last tool: {text(data.last_tool)}</p>}
            {data.last_error !== undefined && <pre>{text(data.last_error)}</pre>}
          </EnvelopeBody>
          {(code === "max_turns" || code === "hard_ceiling") && (
            <EnvelopeFooter className="flex-wrap">
              {code === "max_turns" && (
                <Button
                  disabled={!editable}
                  onClick={() =>
                    inspect("Continue candidate", "Please continue from where you left off.")
                  }
                >
                  Inspect continue candidate
                </Button>
              )}
              <Button
                disabled={!editable}
                variant="outline"
                onClick={() => inspect("Scoped retry candidate", "Retry with narrower scope")}
              >
                Inspect scoped retry candidate
              </Button>
            </EnvelopeFooter>
          )}
        </Envelope>
      )
    }
    default:
      return (
        <Envelope muted>
          <EnvelopeHeader label="Unsupported envelope" meta={envelope.type} />
          <EnvelopeBody
            title="No visual binding"
            description="Payload preserved; no successful renderer inferred."
          >
            <JsonViewer value={data} />
          </EnvelopeBody>
        </Envelope>
      )
  }
}
