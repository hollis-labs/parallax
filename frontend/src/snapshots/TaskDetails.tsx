import { Badge, CopyableId, DetailSection } from "@hollis-labs/design-components"
import { PriorityBadge, StatusBadge } from "@hollis-labs/kit-dashboard/ui"
import type { ReactNode } from "react"
import type { Capture, CapturedTask } from "./model"

function Fields({ entries }: { entries: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 dash-support">
      {entries.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="text-fg-faint">{label}</dt>
          <dd className="min-w-0 break-words">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
function utc(value: string) {
  return <time dateTime={value}>{value.replace("T", " ").replace(/Z$/, " UTC")}</time>
}
export function CapturedTaskDetails({ task, capture }: { task: CapturedTask; capture: Capture }) {
  const scope = (kind: string, id: string | null) => {
    if (!id) return "None assigned"
    const name = capture.sources.torque.scopes.find((s) => s.kind === kind && s.id === id)?.name
    return (
      <span>
        {name && <span className="block">{name}</span>}
        <CopyableId id={id} label={id} />
      </span>
    )
  }
  return (
    <div className="dash-form-stack">
      <DetailSection title="Task">
        <Fields
          entries={[
            ["Status", <StatusBadge key="status" status={task.status} />],
            [
              "Priority",
              task.priority >= 1 && task.priority <= 3 ? (
                <PriorityBadge key="priority" priority={task.priority} />
              ) : (
                `P${task.priority}`
              ),
            ],
            ["Execution", task.manual ? "Manual" : "Automatic"],
            ["Executor", task.executor || "Not supplied"],
            ["Kind", task.kind || "Not supplied"],
          ]}
        />
      </DetailSection>
      <DetailSection title="Organization">
        <Fields
          entries={[
            ["Project", scope("project", task.project_id)],
            ["Epic", scope("epic", task.epic_id)],
            ["Sprint", scope("sprint", task.sprint_id)],
            [
              "Parent task",
              task.parent_id ? (
                <CopyableId key="parent" id={task.parent_id} label={task.parent_id} />
              ) : (
                "None assigned"
              ),
            ],
            [
              "Collection",
              task.collection_name ||
                task.collection_id ||
                (task.added_to_collections_at ? "Inbox" : "None assigned"),
            ],
            [
              "Tags",
              task.tags.length ? (
                <div key="tags" className="flex flex-wrap gap-2">
                  {task.tags.map((tag) => (
                    <Badge key={tag.slug} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                "No tags"
              ),
            ],
          ]}
        />
      </DetailSection>
      {task.metadata.tether_workstream_id && (
        <DetailSection title="Workstream">
          <Fields
            entries={[
              [
                "ID",
                <CopyableId
                  key="workstream"
                  id={task.metadata.tether_workstream_id}
                  label={task.metadata.tether_workstream_id}
                />,
              ],
              ["Status", task.metadata.tether_workstream_status || "Not supplied"],
            ]}
          />
        </DetailSection>
      )}
      <DetailSection title="History">
        <Fields
          entries={[
            ["Created", utc(task.created_at)],
            ["Updated", utc(task.updated_at)],
            ["Captured", utc(capture.sources.torque.tasks.capturedAt)],
          ]}
        />
      </DetailSection>
      <DetailSection title="Description and activity">
        <p className="dash-support text-fg-muted">
          This snapshot contains task board fields. The task body and run details were not captured.
        </p>
      </DetailSection>
    </div>
  )
}
