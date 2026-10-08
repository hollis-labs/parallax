import type { OperationsModel } from "../operations/model"
export const specimens = ["recorded", "missing", "unknown", "long"] as const
export type Specimen = (typeof specimens)[number]
export type LedgerRow = {
  id: string
  origin: "event" | "log" | "authored"
  time: string | null
  runId: string | null
  taskId: string | null
  reference: string | null
  tag: string | null
  message: string | null
  raw: unknown
}
export function ledgerModel(operations: OperationsModel, specimen: Specimen = "recorded") {
  const runIds = new Set(operations.runs.map((r) => r.id)),
    accessible = operations.accessible
  const rows: LedgerRow[] =
    !accessible || operations.scenario === "empty"
      ? []
      : [
          ...operations.dataset.events
            .filter((e) => runIds.has(e.runId))
            .map((e) => ({
              id: e.id,
              origin: "event" as const,
              time: e.time,
              runId: e.runId,
              taskId: e.taskId,
              reference: e.taskId,
              tag: e.type,
              message: e.description,
              raw: e,
            })),
          ...operations.dataset.logs
            .filter((l) => runIds.has(l.runId))
            .map((l) => ({
              id: l.id,
              origin: "log" as const,
              time: l.time,
              runId: l.runId,
              taskId: operations.runs.find((r) => r.id === l.runId)?.taskId ?? null,
              reference: l.spanId,
              tag: l.level,
              message: l.message,
              raw: l,
            })),
        ]
  const recordedCount = rows.length
  if (accessible && specimen !== "recorded")
    rows.push({
      id: `AUTHORED-${specimen.toUpperCase()}`,
      origin: "authored",
      time: null,
      runId: null,
      taskId: null,
      reference: null,
      tag: specimen === "unknown" ? "external-observation" : null,
      message:
        specimen === "long"
          ? "Authored escaped <script>inert</script> https://example.invalid/metadata " +
            "bounded review text ".repeat(35)
          : null,
      raw:
        specimen === "missing"
          ? { count: 0, message: null }
          : specimen === "unknown"
            ? { status: "external-observation", reference: null }
            : {
                text: "<script>inert</script> https://example.invalid/metadata",
                annotation: "bounded review text ".repeat(35),
              },
    })
  return {
    rows,
    accessible,
    count: accessible ? recordedCount : null,
    authoredCount: rows.length - recordedCount,
    cutoff: operations.cutoff,
    resource: operations.resource,
    source: `${operations.dataset.version}/${operations.dataset.profile}/${operations.scenario}/${operations.resource}/${operations.cutoff}/${operations.runs.map((r) => r.id).join(",")}/${specimen}`,
  }
}
