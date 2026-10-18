import {
  Badge,
  Button,
  CopyableId,
  DetailDialog,
  DetailSection,
  EmptyState,
} from "@hollis-labs/design-components"
import { AdminFacts, IdentityAvatar } from "@hollis-labs/kit-admin"
import { RecordSummary } from "@hollis-labs/kit-dashboard/data"
import {
  DashboardSection,
  DashboardToolbar,
  ListPageLayout,
} from "@hollis-labs/kit-dashboard/layout"
import { PageHeader, StatusBadge } from "@hollis-labs/kit-dashboard/ui"
import { Crown, Mail } from "lucide-react"
import { useState } from "react"
import { CaptureReceipt } from "./ConsoleParts"
import {
  type ConsoleSnapshot,
  elapsed,
  type FleetRecord,
  fleetGroups,
  stateLabels,
  stateTones,
} from "./console-model"

export function CapturedAgents({ data, onReset }: { data: ConsoleSnapshot; onReset: () => void }) {
  const [selected, setSelected] = useState<FleetRecord | null>(null)
  const source = data.fleet,
    clock = source.capturedAt,
    groups = fleetGroups(source.items, clock)
  const leader = groups
    .flatMap((g) => g.rows)
    .filter((a) => a.state !== "unknown")
    .sort((a, b) => b.score - a.score)[0]?.id
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
          <DashboardToolbar className="border-b border-border px-4 py-3">
            <p className="dash-support text-fg-muted">
              Agents, processes, and activity at capture.
            </p>
            <span className="ml-auto flex flex-wrap gap-3">
              {(["waiting", "busy", "idle", "unknown"] as const).map((state) => (
                <span className="dash-support" key={state}>
                  {source.items.filter((a) => a.state === state).length}{" "}
                  {stateLabels[state].toLowerCase()}
                </span>
              ))}
              <Badge variant="secondary">Captured · read only</Badge>
            </span>
          </DashboardToolbar>
        }
        footer={<CaptureReceipt receipt={source} label="Torque activity + Tether chat roster" />}
      >
        <DashboardToolbar className="px-4 py-3">
          <p className="dash-support text-fg-faint">
            Grouped by workstream or project. Provisional scores use captured uptime and recency;
            working share and activity history were not captured.
          </p>
        </DashboardToolbar>
        {!groups.length && (
          <EmptyState
            title="No captured agents"
            description="The source returned no agents in this slice."
            variant="empty"
          />
        )}
        {groups.map((g) => (
          <DashboardSection
            key={g.key}
            title={g.name}
            summary={
              <>
                {g.rows.length} agents · {g.score} provisional score
                {g.workstreamId && <> · {g.workstreamId}</>}
              </>
            }
          >
            <ul aria-label={`${g.name} agents`}>
              {g.rows.map((a, i) => (
                <li key={a.id} className="border-b border-border">
                  <button
                    type="button"
                    onClick={() => setSelected(a)}
                    aria-label={`Inspect ${a.name}: ${a.id}`}
                    className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-left hover:bg-panel-2 focus-visible:bg-panel-2 focus-visible:outline-none"
                  >
                    <span className="w-6 shrink-0 dash-support text-fg-faint">
                      {a.id === leader ? (
                        <Crown
                          className="size-4 text-status-review"
                          aria-label="Top provisional score"
                        />
                      ) : (
                        `#${i + 1}`
                      )}
                    </span>
                    <IdentityAvatar identity={a.id} />
                    <span className="min-w-0 flex-1 basis-48">
                      <RecordSummary
                        title={
                          <span className="uppercase">
                            {a.name}{" "}
                            <span className="dash-support text-fg-faint">
                              {a.kind} · {a.provider}
                            </span>
                          </span>
                        }
                        metadata={
                          a.lastActivity
                            ? `Active ${elapsed(a.lastActivity, clock)} ago`
                            : "No activity timestamp reported"
                        }
                      />
                      <span className="flex flex-wrap items-center gap-2 pt-1">
                        <StatusBadge status={stateLabels[a.state]} tone={stateTones[a.state]} />
                        {a.confidence && (
                          <span className="dash-support text-fg-faint">{a.confidence}</span>
                        )}
                      </span>
                    </span>
                    <span className="dash-support">
                      <span className="block text-fg-faint">Up</span>
                      {elapsed(a.startedAt, clock)}
                    </span>
                    <span className="dash-support text-fg-faint">
                      <span className="block">Working share</span>Not captured
                    </span>
                    <span className="flex items-center gap-1 dash-support text-fg-faint">
                      <Mail className="size-4" aria-hidden />
                      {a.messages ?? "—"}
                      <span className="sr-only">unread messages; dash means not reported</span>
                    </span>
                    <span className="min-w-16 text-right dash-record-title text-status-review">
                      {String(a.score).padStart(5, "0")}
                      <span className="block dash-support text-fg-faint">score</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </DashboardSection>
        ))}
        <p className="dash-support text-fg-faint px-4 py-3">
          {source.items.length} merged identities from {source.sourceTotal} process records and{" "}
          {source.rosterTotal} chat roster entries{source.truncated ? " · partial capture" : ""}. No
          live stream or commands are connected.
        </p>
      </ListPageLayout>
      <DetailDialog
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? "Agent"}
        meta={selected && <CopyableId id={selected.id} label={selected.id} />}
        showFullscreenToggle
        footer={
          <Button variant="outline" onClick={() => setSelected(null)}>
            Close agent
          </Button>
        }
      >
        {selected && (
          <div className="dash-form-stack">
            <DashboardToolbar>
              <IdentityAvatar identity={selected.id} size="large" />
              <StatusBadge status={stateLabels[selected.state]} tone={stateTones[selected.state]} />
            </DashboardToolbar>
            <DetailSection title="Captured identity">
              <AdminFacts
                items={Object.entries({
                  Provider: selected.provider,
                  Model: selected.model,
                  Kind: selected.kind,
                  Process: selected.pid || undefined,
                  Session: selected.sessionId,
                  Launch: selected.launchId,
                  Workstream: selected.workstreamId,
                  Group: selected.group,
                  Confidence: selected.confidence,
                  Started: selected.startedAt,
                  "Last activity": selected.lastActivity,
                  "Unread messages": selected.messages,
                }).map(([label, value]) => ({ label, value }))}
              />
            </DetailSection>
            <DetailSection title="Activity history">
              <p className="dash-support text-fg-muted">
                The source page collects history while it is open. This snapshot has no recorded
                series, working-share history or message content.
              </p>
            </DetailSection>
            <DetailSection title="Actions">
              <p className="dash-support text-fg-muted">
                Messaging, launching and process control remain in the source application. This
                reference does not send commands.
              </p>
            </DetailSection>
          </div>
        )}
      </DetailDialog>
    </>
  )
}
