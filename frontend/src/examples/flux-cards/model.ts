import operands from "./operands.json"

export const referenceTime = operands.reference_time
export const identities = operands.envelopes.map((entry) => entry.type)
export type WireEnvelope = {
  id?: string
  type: string
  data?: Record<string, unknown>
  prior_response?: { status: string; data?: Record<string, unknown> }
  cancel_token?: string
}
export const cardStates = [
  "complete",
  "partial",
  "empty",
  "long",
  "zero",
  "pending",
  "approved",
  "rejected",
  "handling",
  "failed",
  "future-resolution",
  "string",
  "declined",
  "canceled",
  "expired",
  "applied",
  "dismissed",
  "accepted",
  "unaddressed",
  "actions",
  "data-source",
] as const
export type CardState = (typeof cardStates)[number]
export const accessStates = [
  "ready",
  "loading",
  "unavailable",
  "denied",
  "locked",
  "unknown",
] as const
export type AccessState = (typeof accessStates)[number]
export const toolModes = ["indicator", "minimal", "compact", "full"] as const
export type ToolMode = (typeof toolModes)[number]
export const loopCodes = [
  "max_turns",
  "hard_ceiling",
  "runaway_tool_failures",
  "idle_timeout",
  "retry_budget_exhausted",
] as const
export const tools = operands.tool_calls
export const commands = [
  {
    id: "cmd-review",
    label: "/review",
    description: "Local review candidate",
    keywords: ["inspect"],
  },
  { id: "cmd-compact", label: "/compact", description: "Local compaction candidate" },
  { id: "cmd-plan", label: "/plan", description: "Local plan candidate · scope required" },
]
export const files = [
  { id: "file-17", label: "notes/", value: "notes/", description: "Fictional directory" },
  {
    id: "file-42",
    label: "notes/review.md",
    value: "notes/review.md",
    description: "128 B · fictional file",
  },
  {
    id: "file-103",
    label: "src/fixture.ts",
    value: "src/fixture.ts",
    description: "Size unavailable",
  },
]
export function envelopeFor(
  type: string,
  state: CardState,
  risk = "low",
  code = "max_turns",
): WireEnvelope {
  const entry = operands.envelopes.find((row) => row.type === type)
  if (!entry) return { type, data: {} }
  const base = structuredClone(state === "partial" ? entry.partial : entry.complete) as WireEnvelope
  const data = base.data ?? {}
  base.data = data
  if (state === "empty") {
    for (const key of Object.keys(data)) {
      if (Array.isArray(data[key])) data[key] = []
      else if (typeof data[key] === "string") data[key] = ""
      else if (typeof data[key] === "object") data[key] = {}
    }
  }
  if (state === "long") {
    const long = "Fictional_review_identifier_4421_".repeat(14)
    for (const key of [
      "title",
      "description",
      "message",
      "reason",
      "prompt",
      "content",
      "body",
      "summary",
      "name",
    ])
      if (typeof data[key] === "string") data[key] = `${data[key]}\n${long}`
    if (type === "proposal-card")
      data.payload = { title: long, description: long, count: 0, choice: "review" }
    if (type === "list-card")
      data.items = [
        { id: "item-17", label: long },
        { id: "item-42", label: "Second fictional item" },
      ]
    if (type === "table-card") data.rows = [{ name: long, state: "pending" }]
    if (type === "timeline-card")
      data.events = [{ timestamp: referenceTime, label: long, status: "active" }]
    if (type === "diff-card") {
      data.before = { label: "Before", content: long }
      data.after = { label: "After", content: long }
    }
  }
  if (type === "approval-card" || type === "subagent-spawn-approval") data.risk_level = risk
  if (type === "chat-loop-terminated" && state !== "partial") data.code = code
  if (state === "zero") {
    if (type === "metric-card") data.value = 0
    if (type === "progress-card") data.progress = 0
    if (type === "artifact-mini") data.size_bytes = 0
    if (type === "report-card")
      data.metrics = [{ label: "Fictional observed zero", value: "0", percent: 0 }]
  }
  if (type === "elicitation-prompt" && state === "string") data.schema_type = "string"
  if (type === "elicitation-prompt" && state === "expired") data.timeout_at = "2026-10-04T14:00:00Z"
  if (
    [
      "approved",
      "rejected",
      "declined",
      "canceled",
      "handling",
      "failed",
      "future-resolution",
    ].includes(state)
  ) {
    const status =
      state === "approved" || state === "rejected" || state === "declined" ? "submitted" : state
    base.prior_response = {
      status,
      data:
        state === "rejected"
          ? { approved: false }
          : state === "declined"
            ? { action: "decline" }
            : state === "canceled"
              ? { action: "cancel" }
              : { approved: true, action: "accept" },
    }
    if (type === "subagent-spawn-approval" && state === "rejected")
      base.prior_response = { status: "canceled", data: { reason: "Supplied fictional rejection" } }
  }
  if (state === "applied") base.prior_response = { status: "submitted" }
  if (state === "dismissed") base.prior_response = { status: "canceled" }
  if (state === "accepted")
    base.prior_response = {
      status: "submitted",
      data: { action: "accept", content: "Supplied fictional answer" },
    }
  if (state === "unaddressed") delete base.id
  if (state === "data-source" && type === "list-card") {
    delete data.items
    data.data_source = { kind: "todos", scope: "project", scope_id: "fixture-project" }
  }
  if (state === "actions" && type === "table-card") {
    data.actions = [{ id: "inspect-17", label: "Review row", style: "default" }]
    const columns = rows(data.columns)
    columns[0].actions = [{ id: "inspect-cell-42", label: "Review cell", style: "default" }]
    data.columns = columns
  }
  if (state === "actions" && type === "report-card") {
    data.actions = [{ label: "Review summary", action: "review", id: "report-42" }]
    data.session_link = { label: "Fictional session", url: "fixture:session-17" }
  }
  return base
}
export function text(value: unknown, fallback = "Unavailable"): string {
  return typeof value === "string"
    ? value || "Supplied empty"
    : typeof value === "number"
      ? String(value)
      : fallback
}
export function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}
export function rows(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(record) : []
}
