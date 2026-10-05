import fixture from "../fixtures/developer.json" with { type: "json" }
import operations from "../fixtures/operations.json" with { type: "json" }
export const developerFixture = fixture
export const developerStates = [
  "normal",
  "empty",
  "loading",
  "error",
  "denied",
  "locked",
  "long-content",
  "unknown",
] as const
export type DeveloperState = (typeof developerStates)[number]
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Bundled developer relationship missing")
  return value
}
export function developerModel(state: DeveloperState) {
  const accessible = !["loading", "error", "denied"].includes(state)
  const files =
    accessible && state !== "empty"
      ? fixture.files.map((f) => ({
          ...f,
          after:
            state === "long-content"
              ? `${f.after}${"// Authored long line remains review text. ".repeat(80)}\n`
              : f.after,
        }))
      : []
  const nodes =
    accessible && state !== "empty"
      ? fixture.nodes.map((n, i) => ({
          ...n,
          kind: state === "unknown" && i === 2 ? "unrecognized-fixture-step" : n.kind,
        }))
      : []
  const edges = nodes.length ? fixture.edges : []
  return {
    state,
    accessible,
    editable: accessible && state !== "locked" && state !== "unknown",
    files,
    nodes,
    edges,
    fixture,
    run: required(operations.runs.find((r) => r.id === fixture.files[0].runId)),
    tool: required(operations.toolCalls.find((t) => t.id === fixture.files[0].toolId)),
    usage: required(operations.usage.find((u) => u.runId === fixture.files[0].runId)),
  }
}
export type DeveloperModel = ReturnType<typeof developerModel>
