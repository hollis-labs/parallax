import { type OperationsModel, runDetail } from "../operations/model"

export const evidenceStates = [
  "recorded",
  "nested",
  "long",
  "empty",
  "loading",
  "denied",
  "error",
  "unknown",
  "malformed",
] as const
export type EvidenceState = (typeof evidenceStates)[number]
export const evidenceKinds = ["all", "task", "run", "trace", "log", "tool"] as const
export type EvidenceKind = (typeof evidenceKinds)[number]
export type EvidenceRow = {
  id: string
  kind: Exclude<EvidenceKind, "all">
  taskId: string
  runId: string
  time: string
  value: unknown
  summary: string
}
/** App-owned read-only index of existing graph records, not a new telemetry wire. */
export function evidenceModel(
  model: OperationsModel,
  state: EvidenceState = "recorded",
  query = "",
  kind: EvidenceKind = "all",
) {
  const rows: EvidenceRow[] = []
  const readable =
    model.accessible &&
    !["empty", "loading", "denied", "error"].includes(state) &&
    model.scenario !== "empty"
  if (readable)
    for (const task of model.tasks) {
      const detail = runDetail(model, task.id)
      if (!detail) continue
      const records: Array<{
        kind: EvidenceRow["kind"]
        id: string
        time: string
        value: unknown
      }> = [
        { kind: "task", id: task.id, time: task.started, value: detail.task },
        { kind: "run", id: detail.run.id, time: detail.run.started, value: detail.run },
        ...(detail.trace
          ? [
              {
                kind: "trace" as const,
                id: detail.trace.id,
                time: detail.trace.started,
                value: detail.trace,
              },
            ]
          : []),
        ...detail.logs.map((log) => ({
          kind: "log" as const,
          id: log.id,
          time: log.time,
          value: log,
        })),
        ...detail.toolCalls.map((tool) => ({
          kind: "tool" as const,
          id: tool.id,
          time: tool.started,
          value: tool,
        })),
      ]
      for (const record of records) {
        const summary = JSON.stringify({
          id: record.id,
          kind: record.kind,
          runId: detail.run.id,
          time: record.time,
          taskId: task.id,
        })
        const value =
          state === "nested"
            ? {
                record: record.value,
                related: {
                  task: detail.task,
                  run: detail.run,
                  trace: detail.trace ?? null,
                  spans: detail.spans,
                  tools: detail.toolCalls,
                  logs: detail.logs,
                  usage: detail.usage ?? null,
                },
              }
            : state === "long"
              ? {
                  record: record.value,
                  presentationAnnotation: {
                    source:
                      "authored local long-content review annotation; recorded evidence unchanged",
                    text: "Review the existing linked record and its bounded metadata without copying, saving or executing its content. ".repeat(
                      24,
                    ),
                  },
                }
              : state === "unknown"
                ? {
                    record: record.value,
                    presentationClassification: "future-evidence-v7",
                    recognized: false,
                  }
                : record.value
        rows.push({ ...record, value, taskId: task.id, runId: detail.run.id, summary })
      }
    }
  const normalized = query.trim().toLowerCase()
  return {
    state,
    readable,
    source: `${model.dataset.version}/${model.dataset.profile}/${model.scenario}/${model.referenceClock}`,
    clock: model.referenceClock,
    profile: model.dataset.profile,
    rows: rows.filter(
      (r) =>
        (kind === "all" || kind === r.kind) &&
        `${r.id} ${r.kind} ${r.taskId} ${r.runId} ${JSON.stringify(r.value)}`
          .toLowerCase()
          .includes(normalized),
    ),
    total: rows.length,
    resource: model.resource,
    malformed: state === "malformed" ? '{"authoredDiagnostic":true,"record":' : null,
  }
}
export function inspectedPayload(row: EvidenceRow, malformed: string | null) {
  if (malformed !== null)
    return {
      raw: malformed,
      value: malformed,
      classification: "Malformed authored raw diagnostic; displayed as text, not parsed evidence",
    }
  return {
    raw: JSON.stringify(row.value, null, 2),
    value: row.value,
    classification:
      "JSON-serializable recorded evidence with labelled local presentation annotations where selected",
  }
}
