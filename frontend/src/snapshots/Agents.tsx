import { Button, EmptyState } from "@hollis-labs/design-components"
import {
  ActivityActionButton,
  ActivityBars,
  ActivityDialog,
  ActivityFacts,
  ActivityGroup,
  ActivityMetric,
  ActivityRecord,
  ActivitySection,
  ActivityStatus,
  ActivityTimeline,
  AdminFacts,
  IdentityAvatar,
} from "@hollis-labs/kit-admin"
import { DashboardToolbar, ListPageLayout } from "@hollis-labs/kit-dashboard/layout"
import { PageHeader } from "@hollis-labs/kit-dashboard/ui"
import { Crown, Mail, MessageSquare, Zap } from "lucide-react"
import { useState } from "react"
import { activityDuration, observedActivity } from "./activity-model"
import { CaptureReceipt } from "./ConsoleParts"
import {
  type ConsoleSnapshot,
  elapsed,
  type FleetRecord,
  fleetGroups,
  fleetScore,
  stateLabels,
} from "./console-model"

const activityTones = {
  busy: "positive",
  waiting: "attention",
  idle: "neutral",
  unknown: "muted",
} as const

function AgentStatus({ agent }: { agent: FleetRecord }) {
  return (
    <ActivityStatus
      label={stateLabels[agent.state]}
      detail={agent.confidence}
      tone={activityTones[agent.state]}
    />
  )
}

function AgentMail({ agent }: { agent: FleetRecord }) {
  if (agent.kind === "chat")
    return <MessageSquare className="size-4 text-success" aria-label="Tether chat identity" />
  const count = agent.messages
  const label = count === undefined ? "Messages not reported" : `${count} unread messages`
  return (
    <span className={`relative inline-flex ${count ? "text-info" : "text-fg-faint"}`} title={label}>
      <Mail className="size-4" aria-label={label} />
      {!!count && (
        <span className="absolute -right-2 -top-1.5 dash-shortcut font-mono">{count}</span>
      )}
    </span>
  )
}

function CapturedTimeline({
  activity,
  compact = false,
}: {
  activity: NonNullable<ReturnType<typeof observedActivity>>
  compact?: boolean
}) {
  return (
    <ActivityTimeline
      label={`Captured state over ${activityDuration(activity.windowMs)}`}
      size={compact ? "compact" : "default"}
      segments={activity.segments.flatMap((segment) =>
        segment.state === null
          ? []
          : [
              {
                from: (segment.from - activity.start) / activity.windowMs,
                to: (segment.to - activity.start) / activity.windowMs,
                label: `${stateLabels[segment.state]} · ${activityDuration(segment.to - segment.from)}`,
                tone: activityTones[segment.state],
              },
            ],
      )}
    />
  )
}

function uptime(agent: FleetRecord, clock: string) {
  return agent.startedAt ? elapsed(agent.startedAt, clock) : "—"
}

export function CapturedAgents({ data, onReset }: { data: ConsoleSnapshot; onReset: () => void }) {
  const [selected, setSelected] = useState<FleetRecord | null>(null)
  const source = data.fleet,
    clock = source.capturedAt,
    groups = fleetGroups(source.items, clock)
  const leader = groups
    .flatMap((g) => g.rows)
    .filter((a) => a.state !== "unknown")
    .sort((a, b) => b.score - a.score)[0]?.id
  const counts = Object.fromEntries(
    (["waiting", "busy", "idle", "unknown"] as const).map((state) => [
      state,
      source.items.filter((a) => a.state === state).length,
    ]),
  )
  const selectedGroup = groups.find((g) => g.rows.some((a) => a.id === selected?.id))
  const selectedRank = selectedGroup
    ? selectedGroup.rows.findIndex((a) => a.id === selected?.id) + 1
    : 0
  const selectedActivity = selected ? observedActivity(selected, clock) : null
  return (
    <>
      <ListPageLayout
        header={
          <PageHeader title="Agents">
            <Button variant="outline" onClick={onReset}>
              Reset snapshot
            </Button>
          </PageHeader>
        }
        summary={
          <p className="border-b border-border px-4 py-2 text-fg-muted">
            Agents, processes, and activity at capture.
          </p>
        }
        footer={
          <>
            <p className="dash-support text-fg-faint px-4 pt-3">
              Provisional scores use captured uptime and recency, plus observed working share when
              available.
              {source.observation
                ? " Activity is frozen from the source page at capture."
                : " Working share and activity history were not captured."}{" "}
              {source.items.length} merged identities from {source.sourceTotal} process records and{" "}
              {source.rosterTotal} chat roster entries
              {source.truncated ? " · partial capture" : ""}.
            </p>
            <CaptureReceipt receipt={source} label="Torque activity + Tether chat roster" />
          </>
        }
      >
        <DashboardToolbar className="px-4 py-3">
          <p className="text-fg-muted">
            Who is doing what, grouped by workstream and ranked on a provisional score.
          </p>
          <span className="ml-auto inline-flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-caption uppercase tracking-widest text-fg-faint">
            <span className={counts.waiting ? "text-warning" : undefined}>
              {counts.waiting} waiting
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="size-3 text-success" aria-hidden />
              {counts.busy}/{source.items.length} working
            </span>
            <span>{counts.idle} idle</span>
            <span>{counts.unknown} unknown</span>
            <span>◌ Captured · read only</span>
          </span>
        </DashboardToolbar>
        {!groups.length && (
          <EmptyState
            title="No captured agents"
            description="The source returned no agents in this slice."
            variant="empty"
          />
        )}
        {groups.map((g) => (
          <ActivityGroup
            key={g.key}
            title={g.name}
            metadata={
              <>
                {g.workstreamId && (
                  <span className="mr-3" title="Workstream id">
                    {g.workstreamId}
                  </span>
                )}
                <span className="uppercase">
                  {g.rows.length} {g.rows.length === 1 ? "agent" : "agents"}
                </span>
              </>
            }
            summary={
              <span title="Group provisional score">
                {String(g.score).padStart(5, "0")}
                <span className="sr-only"> provisional score</span>
              </span>
            }
          >
            <ul aria-label={`${g.name} agents`}>
              {g.rows.map((a, i) => {
                const activity = observedActivity(a, clock)
                return (
                  <ActivityRecord
                    key={a.id}
                    label={`Inspect ${a.name}: ${a.id}`}
                    onSelect={() => setSelected(a)}
                    rank={
                      a.id === leader ? (
                        <Crown
                          className="mx-auto size-4 text-warning"
                          aria-label="Top provisional score"
                        />
                      ) : (
                        `#${i + 1}`
                      )
                    }
                    avatar={<IdentityAvatar identity={a.id} />}
                    name={a.name}
                    metadata={
                      <>
                        {a.kind === "chat" ? "chat · tether" : `process · ${a.provider}`}
                        {a.model && <span className="normal-case text-fg-muted"> · {a.model}</span>}
                      </>
                    }
                    description={
                      <>
                        {a.lastActivity
                          ? `Active ${elapsed(a.lastActivity, clock)} ago`
                          : "No activity timestamp reported"}
                        <span className="text-fg-faint"> · {a.group}</span>
                      </>
                    }
                    status={<AgentStatus agent={a} />}
                    metrics={
                      <>
                        <span className="w-13">
                          <ActivityMetric
                            label="up"
                            value={uptime(a, clock)}
                            title={a.startedAt ?? "Uptime not reported"}
                          />
                        </span>
                        <span className="w-13">
                          <ActivityMetric
                            label="working"
                            value={
                              activity?.workingShare == null ? "—" : `${activity.workingShare}%`
                            }
                            title={
                              activity
                                ? "Share of the captured observation window spent working"
                                : "Working share not captured"
                            }
                          />
                        </span>
                      </>
                    }
                    history={
                      activity ? (
                        <span className="flex flex-col gap-1">
                          <ActivityBars
                            label="Captured working activity"
                            values={activity.series}
                            tone={activityTones[a.state]}
                          />
                          <CapturedTimeline activity={activity} compact />
                        </span>
                      ) : (
                        <span
                          className="block border-y border-dashed border-border py-1 text-center dash-record-metadata text-fg-faint"
                          title="No activity series was captured"
                        >
                          History not captured
                        </span>
                      )
                    }
                    accessory={<AgentMail agent={a} />}
                    score={
                      <ActivityMetric
                        label="score"
                        value={String(a.score).padStart(5, "0")}
                        title="Provisional score from captured uptime, recency and available observed working share"
                        highlight
                      />
                    }
                    muted={a.state === "unknown"}
                    attention={a.state === "waiting"}
                  />
                )
              })}
            </ul>
          </ActivityGroup>
        ))}
      </ListPageLayout>
      <ActivityDialog
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? "Agent"}
        avatar={selected && <IdentityAvatar identity={selected.id} size="detail" />}
        description={
          selected && (
            <>
              {selected.provider}
              {selected.model ? ` · ${selected.model}` : ""} · {selected.group}
            </>
          )
        }
        metadata={
          selected && (
            <>
              {selected.workstreamId ?? "No workstream captured"} · rank #{selectedRank}
            </>
          )
        }
        status={selected && <AgentStatus agent={selected} />}
        accessory={selected && <AgentMail agent={selected} />}
        score={
          selected && (
            <ActivityMetric
              label="score"
              value={String(fleetScore(selected, clock)).padStart(5, "0")}
              title="Provisional score from captured uptime, recency and available observed working share"
              highlight
              size="prominent"
            />
          )
        }
      >
        {selected && (
          <>
            {selected.state === "waiting" && (
              <p className="my-3 border border-warning/40 bg-warning-muted px-3 py-2 text-control text-warning">
                Waiting on you at capture. The blocking reason was not captured.
              </p>
            )}
            <ActivityFacts
              items={[
                {
                  label: "up for",
                  value: uptime(selected, clock),
                  title: selected.startedAt ?? "Uptime not reported",
                },
                {
                  label: "last activity",
                  value: selected.lastActivity
                    ? `${elapsed(selected.lastActivity, clock)} ago`
                    : "—",
                  title: selected.lastActivity ?? "Last activity not reported",
                },
                {
                  label: "working (observed)",
                  value:
                    selectedActivity?.workingShare == null
                      ? "—"
                      : `${selectedActivity.workingShare}%`,
                  title: selectedActivity
                    ? "Share of captured observation time spent working"
                    : "Working share not captured",
                },
                {
                  label: "state changes seen",
                  value: selectedActivity?.changes ?? "—",
                  title: "State changes observed by the source page",
                },
                { label: "pid", value: selected.pid || "—" },
                {
                  label: "session",
                  value: selected.sessionId ?? "—",
                  title: selected.sessionId ?? "Session not reported",
                },
                { label: "agent id", value: selected.id, title: selected.id },
                {
                  label: "observed for",
                  value: selectedActivity ? activityDuration(selectedActivity.observedMs) : "—",
                  title: "Observed portion of the captured timeline",
                },
              ]}
            />
            <ActivitySection title="Message">
              <div className="flex flex-wrap items-center gap-2">
                {(selected.kind === "chat" ? ["Chat"] : ["Nudge", "Request update", "Email"]).map(
                  (action) => (
                    <ActivityActionButton
                      key={action}
                      disabled
                      title="Messaging is available in the live source application"
                    >
                      {action}
                    </ActivityActionButton>
                  ),
                )}
                <span className="text-label text-fg-faint">Unavailable in this captured view.</span>
              </div>
            </ActivitySection>
            <ActivitySection title="Observed state timeline" spacing="tight">
              {selectedActivity ? (
                <>
                  <CapturedTimeline activity={selectedActivity} />
                  <p className="mt-1 text-label text-fg-muted">
                    Last {activityDuration(selectedActivity.windowMs)} watched · frozen at{" "}
                    {new Date(clock).toISOString().slice(11, 19)} UTC. Only what the source page
                    observed; blank time was not observed.
                  </p>
                </>
              ) : (
                <>
                  <div className="flex h-7 items-center justify-center border border-dashed border-border text-label text-fg-faint">
                    Timeline not captured
                  </div>
                  <p className="mt-1 text-label text-fg-muted">
                    Working share and observation duration were not captured.
                  </p>
                </>
              )}
            </ActivitySection>
            <ActivitySection title="Changes seen">
              <ul className="max-h-48 overflow-auto border border-border">
                {selectedActivity ? (
                  selectedActivity.entries.map((entry) => (
                    <li
                      key={`${entry.at}-${entry.kind}-${entry.state}`}
                      className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border px-3 py-1.5 last:border-b-0"
                    >
                      <span className="w-20 shrink-0 font-mono text-caption uppercase tracking-wider text-fg-faint">
                        {{ seen: "First seen", started: "Appeared", state: "Changed" }[entry.kind]}
                      </span>
                      <ActivityStatus
                        label={stateLabels[entry.state]}
                        tone={activityTones[entry.state]}
                      />
                      <time
                        dateTime={entry.at}
                        title={entry.at}
                        className="ml-auto font-mono text-caption text-fg-faint"
                      >
                        {activityDuration(Date.parse(clock) - Date.parse(entry.at))} ago
                      </time>
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-2 text-control text-fg-muted">
                    This snapshot has no recorded series or state changes.
                  </li>
                )}
              </ul>
            </ActivitySection>
            <ActivitySection title="Source confidence">
              <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-label text-fg-muted">
                {selected.confidence ? (
                  <span>
                    state{" "}
                    <span
                      className={
                        selected.confidence === "exact"
                          ? "text-success"
                          : selected.confidence === "derived"
                            ? "text-info"
                            : "text-warning"
                      }
                    >
                      {selected.confidence}
                    </span>
                  </span>
                ) : (
                  <span>Not reported</span>
                )}
              </div>
            </ActivitySection>
            <details className="mt-3 text-label text-fg-faint">
              <summary className="cursor-pointer font-mono uppercase tracking-widest focus-visible:bg-panel-2 focus-visible:outline-none">
                Captured identity
              </summary>
              <div className="pt-3">
                <AdminFacts
                  items={Object.entries({
                    Provider: selected.provider,
                    Model: selected.model,
                    Kind: selected.kind,
                    Process: selected.pid || undefined,
                    Session: selected.sessionId,
                    Agent: selected.id,
                    Launch: selected.launchId,
                    Workstream: selected.workstreamId,
                    Group: selected.group,
                    Started: selected.startedAt,
                    "Last activity": selected.lastActivity,
                    "Unread messages": selected.messages,
                    "Captured at": clock,
                  }).map(([label, value]) => ({ label, value }))}
                />
              </div>
            </details>
          </>
        )}
      </ActivityDialog>
    </>
  )
}
