// Domain vocabulary follows Tachyon's current Planner plugin, not Torque's retired UI.
export const plannerDatabases = [
  "priorities",
  "workstreams",
  "roadmap",
  "ideas",
  "decisions",
  "risks",
  "inbox",
] as const
export type PlannerDb = (typeof plannerDatabases)[number]
export type PlannerView = "board" | "activity" | PlannerDb
export type PlannerSection = "in_flight" | "pre_flight" | "landed" | "holds"
export const plannerLabels: Record<PlannerView, string> = {
  board: "Board",
  activity: "Activity",
  priorities: "Priorities",
  workstreams: "Workstreams",
  roadmap: "Roadmap",
  ideas: "Ideas",
  decisions: "Decisions",
  risks: "Risks",
  inbox: "Inbox",
}
export interface PlannerRecord {
  id: string
  title: string
  status?: string
  tldr?: string
  created?: string
  updated?: string
  rank?: number
  order?: number
  priority?: number
  comment_count?: number
  owner?: string
  phase?: string
  area?: string
  horizon?: string
  mvp?: boolean
  kind?: string
  severity?: string
  discuss_in?: string
  date?: string
  next_step?: string
  workstream?: string
  source?: string
  db?: PlannerDb
  blockers?: string[]
  tags?: string[]
  task_counts?: Record<string, number>
}
interface Receipt {
  path: string
  capturedAt: string
}
export interface PlannerSnapshot {
  origin: string
  capturedAt: string
  lists: Record<
    PlannerDb,
    Receipt & { items: PlannerRecord[]; sourceTotal: number; truncated: boolean }
  >
  boards: Record<
    "curated" | "all",
    Receipt & {
      body: {
        scope: "curated" | "all"
        generated_at: string
        recent_hours: number
        active_hours: number
        limit: number
        sections: Record<PlannerSection, PlannerRecord[]>
        totals: Record<PlannerSection, number>
        notices: string[]
      }
    }
  >
}
export function plannerView(raw: string | null): PlannerView {
  return raw === "board" || raw === "activity" || plannerDatabases.includes(raw as PlannerDb)
    ? (raw as PlannerView)
    : "board"
}
export function settled(status?: string) {
  return [
    "decided",
    "done",
    "landed",
    "promoted",
    "accepted",
    "dropped",
    "dismissed",
    "closed",
    "superseded",
    "reversed",
  ].includes((status ?? "").toLowerCase())
}
export function matches(row: PlannerRecord, query: string) {
  const hay = `${row.id}\n${row.title}\n${row.tldr ?? ""}`.toLowerCase()
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .every((word) => hay.includes(word))
}
export type PlannerTone =
  | "backlog"
  | "todo"
  | "queued"
  | "doing"
  | "review"
  | "done"
  | "blocked"
  | "paused"
  | "archived"
export function plannerTone(status?: string): PlannerTone | undefined {
  const tones: Record<string, PlannerTone> = {
    new: "todo",
    open: "todo",
    "needs-decision": "todo",
    planned: "backlog",
    idea: "backlog",
    queued: "queued",
    unreviewed: "backlog",
    triaged: "queued",
    active: "doing",
    "in-progress": "doing",
    discussing: "review",
    exploring: "review",
    mitigating: "review",
    adopting: "review",
    decided: "done",
    done: "done",
    landed: "done",
    promoted: "done",
    accepted: "done",
    deferred: "paused",
    parked: "paused",
    paused: "paused",
    blocked: "blocked",
    dropped: "archived",
    dismissed: "archived",
    closed: "archived",
    superseded: "archived",
    reversed: "archived",
  }
  return tones[(status ?? "").toLowerCase()]
}
export function boardStatus(
  section: PlannerSection,
  row: PlannerRecord,
): { label: string; tone?: PlannerTone } {
  if (section === "holds" && row.source === "workstream")
    return { label: "BLOCKED", tone: "blocked" }
  if (row.source === "workstream") {
    const ws: Record<string, { label: string; tone: PlannerTone }> = {
      active: { label: "ACTIVE", tone: "doing" },
      planned: { label: "PLANNED", tone: "queued" },
      paused: { label: "PAUSED", tone: "paused" },
      done: { label: "LANDED", tone: "done" },
    }
    return ws[row.status ?? ""] ?? { label: row.status ?? "unknown", tone: plannerTone(row.status) }
  }
  if (section === "holds")
    return {
      label:
        ({ decision: "DECIDE", inbox: "TRIAGE", risk: "RISK" } as Record<string, string>)[
          row.source ?? ""
        ] ?? "HOLD",
      tone: row.source === "risk" ? "blocked" : "todo",
    }
  if (section === "pre_flight" && row.status === "doing")
    return { label: "PREPARING", tone: "paused" }
  const words: Record<string, { label: string; tone: PlannerTone }> = {
    doing: { label: "IN FLIGHT", tone: "doing" },
    "in-progress": { label: "IN FLIGHT", tone: "doing" },
    review: { label: "ARRIVING", tone: "review" },
    done: { label: "LANDED", tone: "done" },
    landed: { label: "LANDED", tone: "done" },
    decided: { label: "LANDED", tone: "done" },
    queued: { label: "QUEUED", tone: "queued" },
    planned: { label: "QUEUED", tone: "queued" },
    adopting: { label: "BOARDING", tone: "review" },
  }
  return (
    words[row.status ?? ""] ?? { label: row.status ?? "unknown", tone: plannerTone(row.status) }
  )
}
export function boardAge(iso: string | undefined, clock: string) {
  if (!iso || !Number.isFinite(Date.parse(iso))) return "Unknown"
  const minutes = Math.max(0, Math.round((Date.parse(clock) - Date.parse(iso)) / 60000))
  return minutes < 60
    ? `${minutes}m`
    : minutes < 2880
      ? `${Math.round(minutes / 60)}h`
      : `${Math.round(minutes / 1440)}d`
}
export function facts(db: PlannerDb | undefined, row: PlannerRecord) {
  const byDb = {
    priorities: row.rank == null ? [] : [`#${row.rank}`],
    workstreams: [row.phase, row.owner],
    roadmap: [row.area, row.horizon, row.mvp ? "MVP" : ""],
    ideas: [row.kind, row.discuss_in],
    decisions: [row.area, row.date],
    risks: [row.kind, row.severity],
    inbox: [row.kind],
  }
  return db
    ? byDb[db].filter(Boolean).join(" · ")
    : [row.workstream, row.owner, row.phase].filter(Boolean).join(" · ")
}
