import { observedActivity } from "./activity-model"
export interface ConsoleReceipt {
  origin: string
  path: string
  capturedAt: string
  cache?: string
  sourceUpdatedAt?: string
}
interface Slice<T> extends ConsoleReceipt {
  items: T[]
  sourceTotal: number
  truncated: boolean
}
export interface AgentDefinition {
  id: string
  name: string
  urn?: string
  enabled: boolean
  roles: string[]
  summary?: string
  skills: string[]
  scopes: string[]
  tools: string[]
  permissionMode?: string
  sandbox?: string
  network?: boolean
}
export interface LaunchDefinition {
  id: string
  agent: string
  provider?: string
  project?: string
  enabled?: boolean
}
export interface TeamDefinition {
  id: string
  name: string
  version: number
  slots: {
    name: string
    role?: string
    required?: boolean
    min?: number
    max?: number
    activation?: string
    resolution?: string
    definition?: { id: string; revision: string; digest?: string }
  }[]
  coordinator?: string
  authority?: string
  history?: string
}
export interface FleetTransition {
  at: string
  kind: "seen" | "started" | "state"
  state: "busy" | "waiting" | "idle" | "unknown"
}
export interface FleetRecord {
  id: string
  name: string
  provider: string
  pid?: number
  sessionId?: string
  launchId?: string
  group: string
  workstreamId?: string
  state: "busy" | "waiting" | "idle" | "unknown"
  confidence?: string
  model?: string
  startedAt?: string
  lastActivity?: string
  messages?: number
  kind: "process" | "chat"
  history?: FleetTransition[]
}
export interface ConsoleSnapshot {
  version: "console-capture/v1"
  capturedAt: string
  agents: Slice<AgentDefinition>
  launches: Slice<LaunchDefinition>
  teams: Slice<TeamDefinition> & { importedAt: string }
  fleet: Slice<FleetRecord> & {
    rosterTotal: number
    roster: ConsoleReceipt
    observation?: { method: "tachyon-page"; endedAt: string }
  }
}
export const stateLabels = {
  busy: "Working",
  waiting: "Waiting on you",
  idle: "Idle",
  unknown: "Unknown",
}
export const stateTones = {
  busy: "doing",
  waiting: "blocked",
  idle: "paused",
  unknown: "archived",
} as const
export function elapsed(iso: string | undefined, clock: string) {
  if (!iso || !Number.isFinite(Date.parse(iso))) return "Not reported"
  const m = Math.max(0, Math.floor((Date.parse(clock) - Date.parse(iso)) / 60000))
  return m < 60
    ? `${m}m`
    : m < 2880
      ? `${Math.floor(m / 60)}h ${m % 60}m`
      : `${Math.floor(m / 1440)}d`
}
// Tachyon's provisional score; observed share contributes only when captured.
export function fleetScore(a: FleetRecord, clock: string) {
  const now = Date.parse(clock),
    start = Date.parse(a.startedAt ?? ""),
    last = Date.parse(a.lastActivity ?? "")
  const up = Number.isFinite(start) ? Math.min(12, Math.max(0, (now - start) / 3600000)) : 0
  const idle = Number.isFinite(last) ? Math.max(0, (now - last) / 60000) : 60
  return Math.max(
    0,
    Math.round(
      (observedActivity(a, clock)?.workingShare ?? 0) * 5 +
        up * 10 +
        Math.max(0, 20 - idle / 3) -
        (a.state === "unknown" ? 20 : a.state === "waiting" ? 5 : 0),
    ),
  )
}
export function fleetGroups(items: FleetRecord[], clock: string) {
  const map = new Map<
    string,
    {
      key: string
      name: string
      workstreamId?: string
      rows: (FleetRecord & { score: number })[]
      score: number
    }
  >()
  for (const a of items) {
    const key = a.workstreamId ? `ws:${a.workstreamId}` : `dir:${a.group}`
    const group = map.get(key) ?? {
      key,
      name: a.group,
      workstreamId: a.workstreamId,
      rows: [],
      score: 0,
    }
    const score = fleetScore(a, clock)
    group.rows.push({ ...a, score })
    group.score += score
    map.set(key, group)
  }
  return [...map.values()]
    .map((g) => ({
      ...g,
      rows: g.rows.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)),
    }))
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
}
export function privileged(a: AgentDefinition) {
  return (
    a.permissionMode === "bypassPermissions" ||
    a.permissionMode === "full-access" ||
    a.scopes.some((s) => s === "*" || s.endsWith(".write"))
  )
}
