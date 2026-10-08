import fixture from "../fixtures/developer.json" with { type: "json" }
import type { OperationsModel } from "../operations/model"
export const evidenceStates = [
  "recorded",
  "empty",
  "loading",
  "error",
  "denied",
  "locked",
  "long-content",
  "unknown",
  "running",
  "missing-duration",
] as const
export type EvidenceState = (typeof evidenceStates)[number]
export type CaseStatus = "passed" | "failed" | "skipped" | "running"
export interface ReviewCase {
  id: string
  name: string
  status: CaseStatus
  duration?: number
  fileId: string
  error?: string
}
export function developerEvidenceModel(
  operations: OperationsModel,
  state: EvidenceState = "recorded",
) {
  const compatible = operations.dataset.profile === "records-8"
  const available =
    operations.accessible &&
    compatible &&
    operations.cutoff >= fixture.recordedAt &&
    !["loading", "error", "denied"].includes(state)
  const files = available && state !== "empty" ? fixture.files : []
  const cases: ReviewCase[] = files.length
    ? [
        {
          id: "CASE-REVIEW-001",
          name: "Authored source-format example",
          status: "passed",
          duration: 0,
          fileId: "FILE-001",
        },
        {
          id: "CASE-REVIEW-002",
          name: "Authored refusal appearance",
          status: state === "running" ? "running" : "failed",
          ...(state === "running" || state === "missing-duration" ? {} : { duration: 1250 }),
          fileId: "FILE-002",
          ...(state === "running" ? {} : { error: fixture.stack.split("\n")[0] }),
        },
        {
          id: "CASE-REVIEW-003",
          name: "Authored unexecuted provider example",
          status: "skipped",
          fileId: "FILE-003",
        },
      ]
    : []
  const summary = {
    passed: cases.filter((c) => c.status === "passed").length,
    failed: cases.filter((c) => c.status === "failed").length,
    skipped: cases.filter((c) => c.status === "skipped").length,
    total: cases.length,
    ...(cases.length && cases.every((c) => c.duration !== undefined)
      ? { duration: cases.reduce((n, c) => n + (c.duration ?? 0), 0) }
      : {}),
  }
  const run = available ? operations.runs.find((r) => r.id === fixture.files[0].runId) : undefined
  const tool = available
    ? operations.dataset.toolCalls.find(
        (t) => t.id === fixture.files[0].toolId && t.runId === run?.id,
      )
    : undefined
  const usage = available
    ? operations.usage.find((u) => u.id === run?.usageId && u.runId === run.id)
    : undefined
  const source = [
    fixture.version,
    fixture.recordedAt,
    operations.dataset.version,
    operations.referenceClock,
    fixture.clock,
    operations.dataset.profile,
    operations.scenario,
    operations.cutoff,
    operations.resource,
    state,
  ].join("/")
  return {
    fixture,
    state,
    source,
    available,
    compatible,
    cutoff: operations.cutoff,
    files,
    cases,
    summary,
    run,
    tool,
    usage,
    trace:
      (available && state !== "empty" ? fixture.stack : "") +
      (available && state === "unknown"
        ? "\nAuthored unknown frame: no file path classified\n    at authoredUnknown (not-supplied.ts:99:1)"
        : ""),
    blockedReason: !operations.accessible
      ? "Operations evidence unavailable"
      : !compatible
        ? "Developer evidence unavailable for this source profile"
        : operations.cutoff < fixture.recordedAt
          ? "Developer evidence not observed through this cutoff"
          : state === "loading"
            ? "Developer evidence loading appearance"
            : state === "error"
              ? "Developer evidence failure appearance"
              : state === "denied"
                ? "Developer evidence denied by review policy"
                : "",
  }
}
export type EvidenceModel = ReturnType<typeof developerEvidenceModel>
export function admittedFile(data: EvidenceModel, id: string, line = 1, column = 1) {
  const f = data.available ? data.files.find((f) => f.id === id) : undefined
  if (
    !f ||
    !Number.isSafeInteger(line) ||
    line < 1 ||
    line > f.after.trimEnd().split("\n").length ||
    !Number.isSafeInteger(column) ||
    column < 1 ||
    column > f.after.trimEnd().split("\n")[line - 1].length + 1
  )
    return null
  return { file: f, line, column }
}
