import type { ChatItem } from "@hollis-labs/kit-chat"
import { operationsModel } from "../../operations/model"
import { sourceDataset } from "../../playback/model"
export const reference = "2026-10-04T14:30:00Z"
export const seed = 4421
export const themes = [
  "nanite-default",
  "dir-a",
  "dir-b",
  "dir-d",
  "dir-e",
  "dir-f",
  "sysop-p4-white",
  "sysop-green-phosphor",
  "sysop-amber-phosphor",
  "sysop-hi-contrast",
] as const
export const appearances = [
  "populated",
  "empty",
  "loading",
  "error",
  "permission-denied",
  "unavailable",
  "missing-metadata",
  "long-labels",
  "sparse",
  "unknown-status",
  "duplicate-id",
] as const
/** Reuse the authored generic Run Explorer graph; no Torque board metadata. */
export function shellModel(scenario: string) {
  const base = sourceDataset("large")
  const source = {
    ...base,
    clock: reference,
    seed,
    runs: base.runs.map((r) => ({
      ...r,
      taskId: `specimen:${base.tasks.findIndex((t) => t.id === r.taskId) * 37 + 11}/Ω`,
    })),
    usage: base.usage
      .filter((_, i) => i !== 1)
      .map((u, i) => (i === 0 ? { ...u, tokens: 0, inputTokens: 0, outputTokens: 0, cost: 0 } : u)),
    events: base.events.map((e) => ({
      ...e,
      taskId: `specimen:${base.tasks.findIndex((t) => t.id === e.taskId) * 37 + 11}/Ω`,
    })),
    tasks: base.tasks.map((t, i) => ({
      ...t,
      id: `specimen:${scenario === "duplicate-id" && i === 1 ? 11 : i * 37 + 11}/Ω`,
      title: i === 0 ? `Unicode review Ω — ${"bounded-context".repeat(8)}` : t.title,
    })),
  }
  return operationsModel(scenario, "", { source })
}
export const messages: ChatItem[] = Array.from({ length: 32 }, (_, i) => ({
  kind: "message",
  id: `chat:4421:${i * 19 + 7}`,
  role: i % 2 ? "assistant" : "user",
  content: `Fictional review turn ${i + 1}. This assistant rail is independent of the selected run. Fixed reference ${reference}; no transport.`,
}))
