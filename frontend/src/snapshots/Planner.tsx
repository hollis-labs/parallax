import {
  Badge,
  Button,
  type ColumnDef,
  CopyableId,
  DetailDialog,
  DetailSection,
  EmptyState,
  Input,
  Textarea,
} from "@hollis-labs/design-components"
import {
  DataTable,
  FilterBar,
  FilterEntityCombobox,
  RecordSummary,
} from "@hollis-labs/kit-dashboard/data"
import {
  DashboardField,
  DashboardSearchToolbar,
  DashboardSection,
  DashboardToolbar,
  ListPageLayout,
  TabStrip,
} from "@hollis-labs/kit-dashboard/layout"
import { PageHeader, StatusBadge } from "@hollis-labs/kit-dashboard/ui"
import { Plus, RefreshCw } from "lucide-react"
import { useMemo, useState } from "react"
import {
  boardAge,
  boardStatus,
  facts,
  matches,
  type PlannerDb,
  type PlannerRecord,
  type PlannerSection,
  type PlannerSnapshot,
  type PlannerView,
  plannerDatabases,
  plannerLabels,
  plannerTone,
  plannerView,
  settled,
} from "./planner-model"

type Selection = { row: PlannerRecord; db?: PlannerDb; capturedAt: string }
const boardSections: PlannerSection[] = ["in_flight", "landed", "pre_flight", "holds"]
const curatedSections: PlannerSection[] = ["in_flight", "pre_flight", "landed", "holds"]
const sectionNames = {
  curated: {
    in_flight: "In motion",
    pre_flight: "Next up",
    landed: "Recently landed",
    holds: "Waiting on you",
  },
  all: {
    in_flight: "In flight",
    pre_flight: "Pre-flight",
    landed: "Recently landed",
    holds: "Holds",
  },
}

export function CapturedPlanner({ data, onReset }: { data: PlannerSnapshot; onReset: () => void }) {
  const [view, setView] = useState<PlannerView>(() =>
    plannerView(new URLSearchParams(location.search).get("planner")),
  )
  const [search, setSearch] = useState("")
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [showSettled, setShowSettled] = useState(false)
  const [selection, setSelection] = useState<Selection | null>(null)
  const [creating, setCreating] = useState(false)
  const [draftTitle, setDraftTitle] = useState("")
  const [draftSummary, setDraftSummary] = useState("")
  const [previewed, setPreviewed] = useState(false)
  const db = view === "board" || view === "activity" ? null : view
  const source = db ? data.lists[db] : null
  const scope = view === "activity" ? "all" : "curated"
  const board = data.boards[scope]
  const searching = search.trim().length >= 2
  const hits = useMemo(
    () =>
      plannerDatabases.flatMap((db) =>
        data.lists[db].items.filter((row) => matches(row, search)).map((row) => ({ ...row, db })),
      ),
    [data, search],
  )
  const visible = useMemo(
    () =>
      source?.items.filter(
        (row) =>
          (status ? row.status === status : showSettled || !settled(row.status)) &&
          matches(row, query),
      ) ?? [],
    [source, status, showSettled, query],
  )
  function change(next: PlannerView) {
    setView(next)
    setSearch("")
    setQuery("")
    setStatus(null)
    setShowSettled(false)
    setSelection(null)
    const url = new URL(location.href)
    url.searchParams.set("planner", next)
    history.pushState({}, "", url)
  }
  function clear() {
    setQuery("")
    setStatus(null)
    setShowSettled(false)
  }
  function open(row: PlannerRecord, db?: PlannerDb, capturedAt = data.capturedAt) {
    setSelection({ row, db, capturedAt })
  }
  function columns(context?: {
    section: PlannerSection
    clock: string
  }): ColumnDef<PlannerRecord>[] {
    return [
      {
        key: "title",
        header: "Item",
        width: "fill",
        className: "min-w-64",
        sortValue: (row) => row.title,
        cell: (row) => (
          <RecordSummary
            title={
              <span title={row.title}>
                {row.rank != null && <Badge variant="secondary">#{row.rank}</Badge>} {row.title}
              </span>
            }
            metadata={
              <span title={row.tldr}>
                {[row.id, facts(row.db ?? db ?? undefined, row), row.tldr]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            }
          />
        ),
      },
      {
        key: "status",
        header: "Status",
        sortValue: (row) => row.status ?? "",
        cell: (row) => {
          const state = context
            ? boardStatus(context.section, row)
            : { label: row.status ?? "unknown", tone: plannerTone(row.status) }
          return <StatusBadge status={state.label} tone={state.tone} />
        },
      },
      {
        key: "trailing",
        header: context ? "Age" : "Replies",
        align: "right",
        sortValue: (row) =>
          context ? Date.parse(row.updated ?? "") || 0 : (row.comment_count ?? -1),
        cell: (row) =>
          context ? (
            <span title={row.updated}>{boardAge(row.updated, context.clock)}</span>
          ) : (
            (row.comment_count ?? "Not captured")
          ),
      },
    ]
  }
  const capturedCount = plannerDatabases.reduce((n, db) => n + data.lists[db].items.length, 0)
  return (
    <>
      <ListPageLayout
        header={
          <PageHeader title="Planner">
            <Button
              variant="outline"
              onClick={() => {
                setCreating(true)
                setDraftTitle("")
                setDraftSummary("")
                setPreviewed(false)
              }}
            >
              <Plus size={14} />
              New item preview
            </Button>
            <Button variant="outline" aria-label="Reload captured Planner" onClick={onReset}>
              <RefreshCw size={14} />
            </Button>
          </PageHeader>
        }
        tabs={
          <>
            <DashboardSearchToolbar
              value={search}
              onChange={setSearch}
              label="Search all captured Planner lists"
              placeholder="Search the planner…"
            />
            <TabStrip
              value={view}
              onChange={change}
              tabs={(["board", "activity", ...plannerDatabases] as PlannerView[]).map((key) => ({
                key,
                label: plannerLabels[key],
                count: plannerDatabases.includes(key as PlannerDb)
                  ? data.lists[key as PlannerDb].items.length
                  : undefined,
              }))}
            />
          </>
        }
        filters={
          !searching &&
          source && (
            <FilterBar
              searchQuery={query}
              onSearchChange={setQuery}
              searchAriaLabel={`Filter ${plannerLabels[view]}`}
              searchPlaceholder={`Filter ${plannerLabels[view].toLowerCase()}…`}
              slashToFocus={false}
              activeFilterCount={Number(status !== null)}
              onClear={clear}
              searchMatchCount={visible.length}
            >
              <FilterEntityCombobox
                icon={null}
                ariaLabel="Filter Planner status"
                allLabel="All statuses"
                value={status}
                onChange={setStatus}
                items={[
                  ...new Set(source.items.map((row) => row.status).filter((s): s is string => !!s)),
                ].map((id) => ({
                  id,
                  name: id,
                  count: source.items.filter((row) => row.status === id).length,
                }))}
              />
              <Button
                variant="outline"
                aria-pressed={showSettled}
                disabled={status !== null}
                onClick={() => setShowSettled((value) => !value)}
              >
                {showSettled ? "Hide" : "Show"} settled (
                {source.items.filter((row) => settled(row.status)).length})
              </Button>
            </FilterBar>
          )
        }
        footer={
          <DashboardToolbar>
            <span className="dash-support text-fg-faint">
              Tachyon page reference · Torque data captured {data.capturedAt} · Counts and search
              cover this snapshot.
            </span>
          </DashboardToolbar>
        }
      >
        {searching ? (
          <>
            <DashboardToolbar>
              <span className="dash-support">
                {hits.length} matches across {capturedCount} captured items
              </span>
              <Button variant="outline" onClick={() => setSearch("")}>
                Clear Planner search
              </Button>
            </DashboardToolbar>
            <DataTable
              items={hits}
              columns={columns()}
              getRowId={(row) => `${row.db}/${row.id}`}
              pageSize={1000}
              guardedRows
              onRowOpen={(_, row) =>
                open(row, row.db, row.db ? data.lists[row.db].capturedAt : undefined)
              }
              rowAriaLabel={(row) => `Open ${row.id}: ${row.title}`}
              emptyState={
                <EmptyState
                  title="No matching Planner items"
                  description="Search matches every word against captured IDs, titles and summaries."
                  variant="empty"
                />
              }
            />
          </>
        ) : source && db ? (
          <>
            <DashboardToolbar>
              <span className="dash-support">
                {visible.length} shown · {source.items.length} captured · {source.sourceTotal} at
                source{source.truncated ? " · partial capture" : ""}
              </span>
            </DashboardToolbar>
            <DataTable
              items={visible}
              columns={columns()}
              getRowId={(row) => row.id}
              pageSize={100}
              guardedRows
              onRowOpen={(_, row) => open(row, db, source.capturedAt)}
              rowAriaLabel={(row) => `Open ${row.id}: ${row.title}`}
              emptyState={
                <EmptyState
                  title={
                    source.items.length
                      ? "Nothing matches"
                      : `No captured ${plannerLabels[db].toLowerCase()}`
                  }
                  description="Clear the filter or show settled items."
                  variant="empty"
                />
              }
            />
          </>
        ) : (
          <>
            {board.body.notices.map((notice) => (
              <p key={notice} role="status" className="dash-support">
                {notice}
              </p>
            ))}
            {(scope === "curated" ? curatedSections : boardSections).map((section) => (
              <DashboardSection
                key={section}
                title={sectionNames[scope][section]}
                summary={`${board.body.sections[section].length} captured / ${board.body.totals[section]} at source`}
              >
                <DataTable
                  items={board.body.sections[section]}
                  columns={columns({ section, clock: board.body.generated_at })}
                  getRowId={(row) => `${row.source}/${row.id}`}
                  pageSize={50}
                  guardedRows
                  onRowOpen={(_, row) => open(row, row.db, board.capturedAt)}
                  rowAriaLabel={(row) => `Open ${row.id}: ${row.title}`}
                  emptyState={
                    <EmptyState
                      title="No captured items in this section"
                      description="The source returned no items for this section at capture time."
                      variant="empty"
                    />
                  }
                />
              </DashboardSection>
            ))}
            <DashboardToolbar>
              <span className="dash-support text-fg-faint">
                Ages fixed at {board.body.generated_at} · Landed covers {board.body.recent_hours}h
                {scope === "all"
                  ? ` · Tasks quiet for ${board.body.active_hours}h count as preparing`
                  : " · Workstreams tagged board"}
              </span>
            </DashboardToolbar>
          </>
        )}
      </ListPageLayout>
      <DetailDialog
        open={selection !== null}
        onClose={() => setSelection(null)}
        title={selection?.row.title ?? "Planner item"}
        showFullscreenToggle
        badge={
          selection && (
            <StatusBadge
              status={selection.row.status ?? "unknown"}
              tone={plannerTone(selection.row.status)}
            />
          )
        }
        meta={selection && <CopyableId id={selection.row.id} label={selection.row.id} />}
        footer={
          <Button variant="outline" onClick={() => setSelection(null)}>
            Close item
          </Button>
        }
      >
        {selection && (
          <div className="dash-form-stack">
            <DetailSection title="Summary">
              <p className="dash-support whitespace-pre-wrap break-words">
                {selection.row.tldr || "No summary supplied in this capture."}
              </p>
            </DetailSection>
            <DetailSection title="Details">
              <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 dash-support">
                {Object.entries({
                  List: selection.db ? plannerLabels[selection.db] : selection.row.source,
                  Owner: selection.row.owner,
                  Phase: selection.row.phase,
                  Area: selection.row.area,
                  Horizon: selection.row.horizon,
                  Rank: selection.row.rank,
                  Priority: selection.row.priority,
                  Kind: selection.row.kind,
                  Severity: selection.row.severity,
                  Created: selection.row.created,
                  Updated: selection.row.updated,
                  "Next step": selection.row.next_step,
                })
                  .filter(([, v]) => v !== undefined && v !== "")
                  .map(([label, value]) => (
                    <div key={label} className="contents">
                      <dt className="text-fg-faint">{label}</dt>
                      <dd className="min-w-0 break-words">{value}</dd>
                    </div>
                  ))}
              </dl>
            </DetailSection>
            {!!selection.row.blockers?.length && (
              <DetailSection title="Blockers">
                <ul className="dash-support list-disc pl-4">
                  {selection.row.blockers.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </DetailSection>
            )}
            {!!selection.row.tags?.length && (
              <DetailSection title="Tags">
                <div className="flex flex-wrap gap-2">
                  {selection.row.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </DetailSection>
            )}
            {selection.row.task_counts && (
              <DetailSection title="Captured task counts">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selection.row.task_counts).map(([state, count]) => (
                    <span key={state}>
                      <StatusBadge status={state} /> {count}
                    </span>
                  ))}
                </div>
              </DetailSection>
            )}
            <DetailSection title="Snapshot coverage">
              <p className="dash-support text-fg-muted">
                Captured {selection.capturedAt}. Full descriptions, comment bodies, links and linked
                task details are not included.{" "}
                {selection.row.comment_count != null &&
                  `${selection.row.comment_count} replies recorded at capture.`}
              </p>
            </DetailSection>
          </div>
        )}
      </DetailDialog>
      <DetailDialog
        open={creating}
        onClose={() => setCreating(false)}
        title={`New ${db ? plannerLabels[db].toLowerCase() : "inbox"} item · local preview`}
        footer={
          <DashboardToolbar>
            <Button variant="outline" onClick={() => setCreating(false)}>
              Close preview
            </Button>
            <Button disabled={!draftTitle.trim()} onClick={() => setPreviewed(true)}>
              Preview item
            </Button>
          </DashboardToolbar>
        }
      >
        <DetailSection title="Draft">
          <div className="dash-form-stack">
            <DashboardField label="Title">
              <Input
                aria-label="Planner draft title"
                value={draftTitle}
                onChange={(e) => {
                  setDraftTitle(e.target.value)
                  setPreviewed(false)
                }}
              />
            </DashboardField>
            <DashboardField label="Summary">
              <Textarea
                aria-label="Planner draft summary"
                value={draftSummary}
                onChange={(e) => {
                  setDraftSummary(e.target.value)
                  setPreviewed(false)
                }}
              />
            </DashboardField>
            <p className="dash-support">
              Local design preview. Nothing is saved to Torque or Tachyon.
            </p>
            {previewed && (
              <div role="status">
                <RecordSummary title={draftTitle} metadata={draftSummary} />
                <p className="dash-support">Preview complete. The captured lists are unchanged.</p>
              </div>
            )}
          </div>
        </DetailSection>
      </DetailDialog>
    </>
  )
}
