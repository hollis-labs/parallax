import {
  Button,
  type ColumnDef,
  CopyableId,
  DetailDialog,
  DetailSection,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  Input,
} from "@hollis-labs/design-components"
import { FilterEntityCombobox, RecordSummary } from "@hollis-labs/kit-dashboard/data"
import {
  DashboardField,
  DashboardToolbar,
  OperationsTablePage,
  TabStrip,
} from "@hollis-labs/kit-dashboard/layout"
import { StatusBadge } from "@hollis-labs/kit-dashboard/ui"
import { Activity, MoreHorizontal, RefreshCw, Square } from "lucide-react"
import { useMemo, useState } from "react"
import type { Capture, CapturedSession } from "./model"

// Tether owns lifecycle semantics; the kit owns their presentation.
// Source: tether/apps/sysop/frontend/src/components/session-detail-dialog.tsx.
const live = (state: string) => ["ready", "launching", "running"].includes(state)
const terminal = (state: string) => ["completed", "failed", "killed"].includes(state)
function lifecycle(state: string) {
  if (state === "created") return "Created only"
  if (state === "ready" || state === "launching") return "Launching"
  if (state === "running") return "Live runtime"
  if (state === "detached") return "Daemon disconnected"
  if (state === "orphaned") return "Resumable"
  return terminal(state) ? "Ended" : "Unknown lifecycle"
}
function timestamp(value?: string) {
  if (!value) return "Not supplied"
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date
        .toISOString()
        .replace("T", " ")
        .replace(/\.\d{3}Z$/, " UTC")
}
function options(rows: CapturedSession[], field: "state" | "provider_id") {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const value = row[field]
    if (value) counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return [...counts]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, count]) => ({ id, name: id, count }))
}

export function CapturedSessions({ capture, onReset }: { capture: Capture; onReset: () => void }) {
  const source = capture.sources.tether.sessions
  const [query, setQuery] = useState("")
  const [state, setState] = useState<string | null>(null)
  const [provider, setProvider] = useState<string | null>(null)
  const [selected, setSelected] = useState<CapturedSession | null>(null)
  const [stop, setStop] = useState<CapturedSession | null>(null)
  const [typed, setTyped] = useState("")
  const [previewed, setPreviewed] = useState(false)
  const [copyNotice, setCopyNotice] = useState("")
  const rows = useMemo(
    () =>
      source.items.filter(
        (row) =>
          (!state || row.state === state) &&
          (!provider || row.provider_id === provider) &&
          [
            row.id,
            row.launch_id,
            row.project_id,
            row.logical_agent_id,
            row.provider_id,
            row.provider_kind,
            row.state,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
      ),
    [source.items, state, provider, query],
  )
  function resetFilters() {
    setQuery("")
    setState(null)
    setProvider(null)
  }
  function previewStop(row: CapturedSession) {
    if (!live(row.state)) return
    setTyped("")
    setPreviewed(false)
    setStop(row)
  }
  async function copyId(id: string) {
    try {
      await navigator.clipboard.writeText(id)
      setCopyNotice("Session ID copied.")
    } catch {
      setCopyNotice("Could not copy the session ID. Open details to select it.")
    }
  }
  const columns: ColumnDef<CapturedSession>[] = [
    {
      key: "id",
      header: "Session",
      width: "fill",
      sortValue: (s) => s.id,
      cell: (s) => (
        <RecordSummary
          title={<span title={s.id}>{s.id}</span>}
          metadata={s.logical_agent_id || "Agent not supplied"}
        />
      ),
    },
    {
      key: "state",
      header: "State",
      sortValue: (s) => s.state,
      cell: (s) => (
        <RecordSummary title={<StatusBadge status={s.state} />} metadata={lifecycle(s.state)} />
      ),
    },
    {
      key: "launch",
      header: "Launch",
      sortValue: (s) => s.launch_id ?? "",
      cell: (s) => (s.launch_id === undefined ? "Not captured" : s.launch_id || "manual"),
    },
    {
      key: "provider",
      header: "Provider",
      sortValue: (s) => s.provider_id ?? "",
      cell: (s) => (
        <RecordSummary title={s.provider_id || "Not supplied"} metadata={s.provider_kind} />
      ),
    },
    {
      key: "updated",
      header: "Updated",
      sortValue: (s) => Date.parse(s.updated_at ?? "") || 0,
      cell: (s) => (
        <time dateTime={s.updated_at} className="whitespace-nowrap dash-record-date">
          {timestamp(s.updated_at)}
        </time>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      cell: (s) => (
        <DropdownMenu>
          <DropdownMenuTrigger aria-label={`Session actions ${s.id}`}>
            <MoreHorizontal size={14} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelected(s)}>View session</DropdownMenuItem>
            <DropdownMenuItem onClick={() => void copyId(s.id)}>Copy session ID</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={!live(s.state)} onClick={() => previewStop(s)}>
              Preview Stop Live
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
  return (
    <>
      <OperationsTablePage
        title="Tether operations"
        headerActions={
          <Button variant="outline" onClick={onReset} aria-label="Reload captured sessions">
            <RefreshCw size={14} />
            Refresh snapshot
          </Button>
        }
        tabs={
          <TabStrip
            tabs={[
              {
                key: "sessions",
                label: "Sessions",
                icon: <Activity size={14} />,
                count: source.items.length,
              },
            ]}
            value="sessions"
            onChange={() => {}}
          />
        }
        summaryCards={[
          { label: "Captured sessions", value: source.items.length },
          { label: "Pre-launch", value: source.items.filter((s) => s.state === "created").length },
          {
            label: "Live at capture",
            value: source.items.filter((s) => live(s.state)).length,
            accentColor: "var(--color-status-doing)",
          },
          {
            label: "Ended",
            value: source.items.filter((s) => terminal(s.state)).length,
            accentColor: "var(--color-status-done)",
          },
        ]}
        searchQuery={query}
        onSearchChange={setQuery}
        searchAriaLabel="Search captured sessions"
        searchPlaceholder="Search sessions, agents, launches, providers…"
        slashToFocus={false}
        activeFilterCount={Number(state !== null) + Number(provider !== null)}
        searchMatchCount={rows.length}
        onClear={resetFilters}
        filterControls={
          <>
            <FilterEntityCombobox
              icon={null}
              ariaLabel="Filter sessions by state"
              allLabel="All states"
              items={options(source.items, "state")}
              value={state}
              onChange={setState}
            />
            <FilterEntityCombobox
              icon={null}
              ariaLabel="Filter sessions by provider"
              allLabel="All providers"
              items={options(source.items, "provider_id")}
              value={provider}
              onChange={setProvider}
            />
          </>
        }
        items={rows}
        columns={columns}
        getRowId={(s) => s.id}
        initialSort={{ key: "updated", dir: "desc" }}
        pageSize={25}
        guardedRows
        revealControls
        onRowOpen={(_, session) => setSelected(session)}
        rowAriaLabel={(s) => `Open session ${s.id}`}
        emptyState={
          <EmptyState
            variant="empty"
            title={source.items.length ? "No matching sessions" : "No captured sessions"}
            description={
              source.items.length
                ? "Clear the search or filters to see the captured sessions."
                : "The captured response contains no session rows."
            }
          />
        }
        footer={
          <DashboardToolbar>
            <span className="dash-support text-fg-faint">
              {rows.length} matching / {source.items.length} captured ·{" "}
              {source.sourceTotal ?? "Unknown"} total at source · {timestamp(source.capturedAt)}
            </span>
            <span role="status" className="dash-support">
              {copyNotice}
            </span>
          </DashboardToolbar>
        }
      />
      <DetailDialog
        open={selected !== null}
        onClose={() => setSelected(null)}
        title="Session details"
        badge={selected && <StatusBadge status={selected.state} />}
        meta={selected && <CopyableId id={selected.id} label={selected.id} />}
        footer={
          selected && (
            <DashboardToolbar>
              <Button
                variant="outline"
                disabled={!live(selected.state)}
                onClick={() => previewStop(selected)}
              >
                <Square size={14} />
                Preview Stop Live
              </Button>
              <Button variant="outline" onClick={() => setSelected(null)}>
                Close
              </Button>
            </DashboardToolbar>
          )
        }
      >
        {selected && (
          <div className="dash-form-stack">
            <DetailSection title="Captured identity">
              <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 dash-support">
                {[
                  ["Session", selected.id],
                  ["Lifecycle", lifecycle(selected.state)],
                  ["Logical agent", selected.logical_agent_id],
                  ["Project", selected.project_id],
                  [
                    "Launch",
                    selected.launch_id === undefined
                      ? "Not captured"
                      : selected.launch_id || "manual",
                  ],
                  ["Provider", selected.provider_id],
                  ["Provider kind", selected.provider_kind],
                  ["Created", timestamp(selected.created_at)],
                  ["Updated", timestamp(selected.updated_at)],
                  ["Ended", timestamp(selected.ended_at)],
                ].map(([label, value]) => (
                  <div key={label} className="contents">
                    <dt className="text-fg-faint">{label}</dt>
                    <dd className="break-all">{value || "Not supplied"}</dd>
                  </div>
                ))}
              </dl>
            </DetailSection>
            <DetailSection title="Snapshot coverage">
              <p className="dash-support text-fg-muted">
                State recorded at {timestamp(source.capturedAt)}. This is not live runtime status.
                Transcripts, attachments, launch configuration, and checkpoints are not included in
                this capture.
              </p>
            </DetailSection>
          </div>
        )}
      </DetailDialog>
      <DetailDialog
        open={stop !== null}
        onClose={() => setStop(null)}
        title="Stop session · local preview"
        footer={
          <DashboardToolbar>
            <Button variant="outline" onClick={() => setStop(null)}>
              {previewed ? "Close preview" : "Cancel preview"}
            </Button>
            <Button
              disabled={!stop || typed.trim() !== stop.id.slice(0, 12) || previewed}
              onClick={() => setPreviewed(true)}
            >
              Confirm stop preview
            </Button>
          </DashboardToolbar>
        }
      >
        {stop && (
          <div className="dash-form-stack">
            <p className="dash-support">
              This previews Tether’s stop confirmation for {stop.id}. No command is sent and the
              captured session stays unchanged.
            </p>
            <DashboardField label={`Type ${stop.id.slice(0, 12)} to confirm`}>
              <Input
                aria-label="Confirm session ID"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
              />
            </DashboardField>
            <p role="status" className="dash-support">
              {previewed
                ? "Preview complete. No runtime was stopped; captured data is unchanged."
                : "In the live application, this action stops the runtime and ends live input."}
            </p>
          </div>
        )}
      </DetailDialog>
    </>
  )
}
