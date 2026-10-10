import { createScopedStorage, type ScopedStorage } from "@hollis-labs/design-app-runtime"
import { chatPack } from "../chat/model"

export const navigationIdentity = "flux-navigation/v1:4421:2026-10-04T14:30:00Z"
export const reference = "2026-10-04T14:30:00Z"
export type Activity =
  | "idle"
  | "online"
  | "working"
  | "pending_action"
  | "failed"
  | "halted"
  | "stopped"
  | "archived"
export type SessionRow = {
  id: string
  title: string
  kind: "api" | "cli" | "durable"
  activity: Activity
  parent: string | null
  pinned: boolean
  project: "boundary" | "fixture"
  time: string
  companion: string | null
}
/** Explicit authored presentation operands. IDs never imply a metadata join. */
export const sessions: readonly SessionRow[] = [
  {
    id: "nav-gateway",
    title: chatPack.sessions[0].title,
    kind: "api",
    activity: "idle",
    parent: null,
    pinned: true,
    project: "boundary",
    time: reference,
    companion: "CHAT-001",
  },
  {
    id: "nav-cli",
    title: chatPack.sessions[1].title,
    kind: "cli",
    activity: "online",
    parent: "nav-gateway",
    pinned: false,
    project: "boundary",
    time: "2026-10-04T14:25:00Z",
    companion: "CHAT-002",
  },
  {
    id: "nav-durable",
    title: "Review child worker boundaries",
    kind: "durable",
    activity: "working",
    parent: "nav-cli",
    pinned: false,
    project: "boundary",
    time: "2026-10-04T12:30:00Z",
    companion: null,
  },
  {
    id: "nav-pending",
    title: "Await local approval specimen",
    kind: "api",
    activity: "pending_action",
    parent: null,
    pinned: false,
    project: "fixture",
    time: "2026-10-01T14:30:00Z",
    companion: null,
  },
  {
    id: "nav-failed",
    title: chatPack.sessions[2].title,
    kind: "cli",
    activity: "failed",
    parent: null,
    pinned: false,
    project: "fixture",
    time: "2026-09-25T14:30:00Z",
    companion: "CHAT-003",
  },
  {
    id: "nav-halted",
    title: "Halted handoff · parent unavailable",
    kind: "durable",
    activity: "halted",
    parent: "absent-parent",
    pinned: false,
    project: "fixture",
    time: "2026-10-04T14:15:00Z",
    companion: null,
  },
  {
    id: "nav-stopped",
    title: "Stopped review session with a deliberately long title for wrapping and truncation",
    kind: "cli",
    activity: "stopped",
    parent: null,
    pinned: false,
    project: "fixture",
    time: "2026-10-04T14:14:00Z",
    companion: "CHAT-AUTHORED-EMPTY",
  },
  {
    id: "nav-archived",
    title: "Archived local review",
    kind: "durable",
    activity: "archived",
    parent: null,
    pinned: false,
    project: "fixture",
    time: "2026-10-04T14:13:00Z",
    companion: null,
  },
]

export function relativeTime(value: string) {
  const minutes = Math.floor((Date.parse(reference) - Date.parse(value)) / 60000)
  if (!Number.isFinite(minutes)) return "Unknown"
  if (minutes < 1) return "now"
  if (minutes < 60) return `${minutes}m`
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h`
  if (minutes < 10080) return `${Math.floor(minutes / 1440)}d`
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value))
}

export function treeSections(rows: readonly SessionRow[]) {
  const byId = new Map(rows.map((row) => [row.id, row]))
  const seen = new Set<string>()
  const result: { row: SessionRow; depth: number; pinned: boolean; missingParent: boolean }[] = []
  function append(row: SessionRow, depth: number, pinned: boolean) {
    if (seen.has(row.id)) return
    seen.add(row.id)
    const inherited = pinned || row.pinned
    result.push({
      row,
      depth: Math.min(depth, 2),
      pinned: inherited,
      missingParent: !!row.parent && !byId.has(row.parent),
    })
    for (const child of rows.filter((item) => item.parent === row.id && item.id !== row.id))
      append(child, depth + 1, inherited)
  }
  for (const row of rows)
    if (!row.parent || !byId.has(row.parent) || row.parent === row.id) append(row, 0, false)
  // Cycles are admitted once as roots; source operands are still visible for inspection.
  for (const row of rows) append(row, 0, false)
  return [result.filter((item) => item.pinned), result.filter((item) => !item.pinned)] as const
}

export const presets = {
  focus: { left: false, right: false, chips: false },
  default: { left: true, right: false, chips: true },
  workspace: { left: true, right: true, chips: true },
  reading: { left: false, right: false, chips: true },
} as const
export type Preset = keyof typeof presets
export type LayoutPreference = { version: 1; preset: Preset }
export const layoutKey = "parallax:flux-navigation:layout:v1"
export function parseLayout(raw: unknown): LayoutPreference | null {
  if (!raw || typeof raw !== "object") return null
  const value = raw as Partial<LayoutPreference>
  return value.version === 1 &&
    typeof value.preset === "string" &&
    Object.hasOwn(presets, value.preset)
    ? { version: 1, preset: value.preset }
    : null
}
export function layoutStorage(): ScopedStorage<LayoutPreference> {
  return createScopedStorage(layoutKey, { parse: parseLayout })
}
