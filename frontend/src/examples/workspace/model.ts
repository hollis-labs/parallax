import fixture from "../../fixtures/developer.json" with { type: "json" }
import { operationsModel } from "../../operations/model"
export const workspacePanels = ["source", "diagnostics", "tool", "graph"] as const
export const workspaceAppearances = [
  "recorded",
  "empty",
  "loading",
  "error",
  "denied",
  "locked",
  "unknown",
  "long",
  "degraded",
] as const
export type WorkspaceState = {
  panel: (typeof workspacePanels)[number]
  file: string
  line: string
  query: string
  appearance: (typeof workspaceAppearances)[number]
  theme: "p4-white" | "p1-green-phosphor" | "p3-amber-phosphor" | "hi-contrast"
  mode: "light" | "dark"
}
export const defaultWorkspaceState: WorkspaceState = {
  panel: "source",
  file: "FILE-001",
  line: "1",
  query: "",
  appearance: "recorded",
  theme: "p4-white",
  mode: "light",
}
export function workspaceModel(state: WorkspaceState) {
  // This app owns an independent full snapshot. It never inherits the lab/Torque cutoff.
  const operations = operationsModel(
    state.appearance === "degraded" ? "degraded" : "populated",
    "",
    { cutoff: fixture.clock },
  )
  const accessible = !["loading", "error", "denied", "unknown"].includes(state.appearance)
  const files = accessible && state.appearance !== "empty" ? fixture.files : []
  const matches = files.filter((f) =>
    `${f.id} ${f.path}`.toLowerCase().includes(state.query.toLowerCase()),
  )
  const file = matches.find((f) => f.id === state.file)
  const run =
    accessible && files.length ? operations.runs.find((r) => r.id === file?.runId) : undefined
  const tool = run
    ? operations.dataset.toolCalls.find((t) => t.id === file?.toolId && t.runId === run.id)
    : undefined
  const span = tool
    ? operations.dataset.spans.find((s) => s.id === tool.spanId && s.traceId === run?.traceId)
    : undefined
  const usage = run
    ? operations.dataset.usage.find((u) => u.id === run.usageId && u.runId === run.id)
    : undefined
  return {
    fixture,
    accessible,
    files,
    matches,
    file,
    run,
    tool,
    span,
    usage,
    operations,
    source: JSON.stringify([
      fixture.version,
      fixture.generator,
      fixture.seed,
      fixture.clock,
      fixture.recordedAt,
      operations.dataset.version,
      operations.dataset.profile,
      state,
    ]),
  }
}
export function normalizeWorkspaceState(p: URLSearchParams): WorkspaceState {
  const state: WorkspaceState = {
    panel: workspacePanels.find((v) => v === p.get("panel")) ?? "source",
    file: p.get("file") ?? "FILE-001",
    line: p.get("line") ?? "1",
    query: p.get("query") ?? "",
    appearance: workspaceAppearances.find((v) => v === p.get("appearance")) ?? "recorded",
    theme:
      (["p4-white", "p1-green-phosphor", "p3-amber-phosphor", "hi-contrast"] as const).find(
        (v) => v === p.get("theme"),
      ) ?? "p4-white",
    mode: p.get("mode") === "dark" ? "dark" : "light",
  }
  const file = workspaceModel(state).file
  if (!file) {
    state.file = ""
    state.line = "1"
  } else {
    const line = Number(state.line),
      max = Math.max(
        file.before.trimEnd().split("\n").length,
        file.after.trimEnd().split("\n").length,
      )
    if (!Number.isInteger(line) || line < 1 || line > max) state.line = "1"
  }
  return state
}
export function workspaceHref(state: WorkspaceState) {
  return `/?${new URLSearchParams({ example: "workspace", ...state })}`
}
