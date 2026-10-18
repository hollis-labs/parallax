import type { TorqueBoardRow } from "../examples/torque/Operations"
import type { OverviewInfo } from "../tether-sysop/model"
import type { ConsoleSnapshot } from "./console-model"
import type { PlannerSnapshot } from "./planner-model"

export interface CapturedTask {
  id: string
  title: string
  status: string
  priority: number
  manual: boolean
  kind: string
  executor: string
  project_id: string | null
  epic_id: string | null
  sprint_id: string | null
  parent_id: string | null
  collection_id: string | null
  collection_name: string | null
  added_to_collections_at: string | null
  created_at: string
  updated_at: string
  tags: { name: string; slug: string; color: string }[]
  metadata: { tether_workstream_id?: string; tether_workstream_status?: string }
}
interface Receipt {
  path: string
  capturedAt: string
}
export interface CapturedSession {
  id: string
  launch_id?: string
  project_id?: string
  logical_agent_id?: string
  provider_id?: string
  provider_kind?: string
  state: string
  created_at?: string
  updated_at?: string
  ended_at?: string
}
export interface Capture {
  version: "parallax-capture/v1"
  id: string
  capturedAt: string
  projection: string
  sources: {
    console?: ConsoleSnapshot
    torque: {
      origin: string
      tasks: Receipt & { items: CapturedTask[]; meta: { has_more?: boolean; total?: number } }
      scopes: { kind: string; id: string; name: string }[]
      planner?: PlannerSnapshot
    }
    tether: {
      origin: string
      overview: Receipt & { body: OverviewInfo }
      sessions: Receipt & {
        items: CapturedSession[]
        returned: number
        sourceTotal: number | null
        truncated: boolean | null
      }
    }
  }
}
export function capturedBoard(capture: Capture): TorqueBoardRow[] {
  const source = capture.sources.torque
  const label = (kind: string, id: string | null) =>
    id ? (source.scopes.find((s) => s.kind === kind && s.id === id)?.name ?? id) : ""
  return source.tasks.items.map((task) => ({
    task: { id: task.id, title: task.title },
    status: task.status,
    priority: task.priority,
    manual: task.manual,
    system: task.kind === "internal",
    project: label("project", task.project_id),
    epic: label("epic", task.epic_id),
    sprint: label("sprint", task.sprint_id),
    tag: task.tags.map((t) => t.name).join(", "),
    tags: task.tags.map((t) => t.name),
    executor: task.executor,
    collection: task.collection_name ?? undefined,
    inInbox: !task.collection_id && !!task.added_to_collections_at,
    update: task.updated_at,
  }))
}
