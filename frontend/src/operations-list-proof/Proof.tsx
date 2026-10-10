import { createListCursor } from "@hollis-labs/design-app-runtime"
import { Button, type ColumnDef, InspectionDialog } from "@hollis-labs/design-components"
import {
  type OperationsActionScope,
  type OperationsFacet,
  OperationsListPage,
} from "@hollis-labs/kit-dashboard/layout"
import { useLayoutEffect, useMemo, useState } from "react"
import { operationsMetadata } from "../examples/torque/operations-metadata"
import { torqueSource } from "../examples/torque/reference"
import { operationsModel, runDetail, type TaskView } from "../operations/model"
import { RunDetailBody } from "../operations/Views"
import {
  explorerProjection,
  type RunRow,
  type UsageFilter,
  usageFilters,
} from "../run-explorer/model"

export interface OperationsProofDiagnostics {
  scopes: OperationsActionScope[]
  calls: string[]
  refresh?: () => void
}
export const diagnostics: OperationsProofDiagnostics = { scopes: [], calls: [] }
function EvidenceBody({
  id,
  model,
  scope,
}: {
  id: string
  model: ReturnType<typeof operationsModel>
  scope: OperationsActionScope
}) {
  const detail = runDetail(model, id)
  diagnostics.scopes.push(scope)
  const [intent, setIntent] = useState(""),
    [nested, setNested] = useState(false)
  return (
    <div className="min-w-0 p-4 [overflow-wrap:anywhere]">
      <p>Read-only supplied evidence; no transport or business mutation.</p>
      <label>
        Local evidence note
        <textarea aria-label="Local evidence note" />
      </label>
      <Button
        onClick={() =>
          scope.run(() => {
            diagnostics.calls.push(id)
            setIntent(`Inspected ${id}`)
          })
        }
      >
        Inspect current evidence
      </Button>
      <Button onClick={() => setNested(true)}>Open nested evidence</Button>
      <InspectionDialog open={nested} onOpenChange={setNested} title="Nested evidence">
        <input aria-label="Nested evidence editor" />
      </InspectionDialog>
      <p role="status">{intent}</p>
      {detail && (
        <RunDetailBody
          detail={detail}
          onIntent={(action, record) =>
            scope.run(() => {
              diagnostics.calls.push(record)
              setIntent(`${action}: ${record}`)
            })
          }
        />
      )}
    </div>
  )
}

/** Actual Torque records + authored board metadata; proposed isolated kit consumption. */
export function TorqueModalProof({
  scenario = "populated",
  epoch = 0,
  active = true,
}: {
  scenario?: string
  epoch?: number
  active?: boolean
}) {
  const model = useMemo(
    () =>
      operationsModel(scenario, "", {
        source: torqueSource(scenario, scenario === "large" ? "legacy" : "torque-16w"),
      }),
    [scenario],
  )
  const [query, setQuery] = useState(""),
    [statuses, setStatuses] = useState<readonly string[]>([]),
    [mode, setMode] = useState("all"),
    [project, setProject] = useState<string | null>(null)
  const [checked, setChecked] = useState<string[]>([]),
    [opened, setOpened] = useState<string | null>(null),
    [density, setDensity] = useState<"compact" | "comfortable">("compact")
  const generation = `${scenario}/${epoch}/${model.cutoff}/${model.resource}`
  const projection = useMemo(() => {
    const items = [...model.tasks].reverse()
    const status = (t: TaskView) => operationsMetadata[t.id]?.status ?? t.status
    const matches = (t: TaskView, exclude = "") =>
      [t.id, t.title, t.owner ?? ""].join(" ").toLowerCase().includes(query.toLowerCase()) &&
      (exclude === "status" || !statuses.length || statuses.includes(status(t))) &&
      (exclude === "mode" ||
        mode === "all" ||
        Boolean(operationsMetadata[t.id]?.manual) === (mode === "manual")) &&
      (exclude === "project" ||
        project === null ||
        (operationsMetadata[t.id]?.project ?? "Unspecified") === project)
    return {
      items,
      matches: items.filter((t) => matches(t)),
      status,
      statuses: [...new Set(items.map(status))].map((value) => ({
        value,
        label: value,
        count: items.filter((t) => matches(t, "status") && status(t) === value).length,
      })),
      projects: [
        ...new Set(items.map((t) => operationsMetadata[t.id]?.project ?? "Unspecified")),
      ].map((id) => ({
        id,
        name: id,
        count: items.filter(
          (t) =>
            matches(t, "project") && (operationsMetadata[t.id]?.project ?? "Unspecified") === id,
        ).length,
      })),
    }
  }, [model, query, statuses, mode, project])
  const columns: ColumnDef<TaskView>[] = [
    {
      key: "title",
      header: "Task",
      width: "fill",
      cell: (t) => (
        <span className="[overflow-wrap:anywhere]">
          {t.title}
          <small className="block">
            {t.id} · {t.owner ?? "Unspecified"}
          </small>
        </span>
      ),
      sortValue: (t) => t.title,
    },
    {
      key: "status",
      header: "Status",
      cell: (t) => projection.status(t),
      sortValue: (t) => projection.status(t),
    },
    {
      key: "utc",
      header: "Started UTC",
      cell: (t) => t.started.slice(0, 10),
      sortValue: (t) => t.started,
    },
  ]
  const facets: OperationsFacet[] = [
    {
      id: "status",
      kind: "chips",
      label: "Task status",
      options: projection.statuses,
      value: statuses,
      onChange: setStatuses,
    },
    {
      id: "mode",
      kind: "cycle",
      label: "Execution mode",
      options: [
        { value: "all", label: "All modes" },
        { value: "manual", label: "Manual" },
        { value: "auto", label: "Auto" },
      ],
      value: mode,
      onChange: setMode,
    },
    {
      id: "project",
      kind: "entity",
      label: "Task project",
      allLabel: "All projects",
      options: projection.projects,
      value: project,
      onChange: setProject,
    },
  ]
  const cursor = useMemo(
    () => createListCursor<{ query: string }>("operations-list-proof:torque"),
    [],
  )
  useLayoutEffect(() => {
    if (generation) cursor.clear()
  }, [generation, cursor])
  return (
    <OperationsListPage
      title="Torque operations · local candidate"
      admittedItems={projection.items}
      matchedItems={projection.matches}
      sourceGeneration={generation}
      accessible={model.accessible}
      active={active}
      searchQuery={query}
      onSearchChange={setQuery}
      searchAriaLabel="Search Torque tasks"
      columns={columns}
      getRowId={(t) => t.id}
      rowAriaLabel={(t) => t.title}
      facets={facets}
      activeFilterCount={statuses.length + (project ? 1 : 0) + (mode === "all" ? 0 : 1)}
      selectedIds={checked}
      onSelectionChange={setChecked}
      selectable
      pageSize={8}
      initialSort={{ key: "utc", dir: "desc" }}
      density={density}
      filterActions={
        <label>
          Density
          <select
            aria-label="Density"
            value={density}
            onChange={(e) =>
              setDensity(e.target.value === "comfortable" ? "comfortable" : "compact")
            }
          >
            <option>compact</option>
            <option>comfortable</option>
          </select>
        </label>
      }
      onVisibleOrderChange={(ids) => cursor.save(ids, { query })}
      onClear={() => {
        setQuery("")
        setStatuses([])
        setMode("all")
        setProject(null)
      }}
      loading={model.resource === "loading"}
      errorState={model.resource === "error" ? <p role="alert">Torque source error</p> : undefined}
      emptyState={<p>No matching Torque tasks</p>}
      inspector={{
        mode: "modal",
        selectedId: opened,
        onSelect: setOpened,
        boundaryPolicy: "wrap",
        title: (t) => `Task ${t.id}`,
        meta: (t) => `${projection.status(t)} · ${model.cutoff}`,
        renderBody: (t, scope) => (
          <EvidenceBody key={`${generation}/${t.id}`} id={t.id} model={model} scope={scope} />
        ),
      }}
      footer={
        <p className="px-4 text-caption">
          Seed 4421 · {model.referenceClock} · counts and facet options from current admission;
          facet option counts omit their own facet.
        </p>
      }
    />
  )
}

/** Existing Run Explorer projection, proposed inline list/evidence idiom (baseline is modal). */
export function RunInlineProof({
  scenario = "populated",
  epoch = 0,
  active = true,
}: {
  scenario?: string
  epoch?: number
  active?: boolean
}) {
  const model = useMemo(() => operationsModel(scenario), [scenario])
  const [query, setQuery] = useState(""),
    [statuses, setStatuses] = useState<readonly string[]>([]),
    [owner, setOwner] = useState<string | null>(null),
    [usage, setUsage] = useState<UsageFilter>("all")
  const [checked, setChecked] = useState<string[]>([]),
    [opened, setOpened] = useState<string | null>(null)
  const projection = useMemo(
    () => explorerProjection(model, query, statuses, owner, usage),
    [model, query, statuses, owner, usage],
  )
  const ownerOptions = useMemo(
    () =>
      explorerProjection(model, query, statuses, null, usage).owners.map((o) => ({
        ...o,
        count: explorerProjection(model, query, statuses, o.id, usage).matches.length,
      })),
    [model, query, statuses, usage],
  )
  const statusOptions = useMemo(
    () =>
      [...new Set(projection.admitted.map((r) => r.run.status))].map((value) => ({
        value,
        label: value,
        count: explorerProjection(model, query, [value], owner, usage).matches.length,
      })),
    [model, query, owner, usage, projection.admitted],
  )
  const columns: ColumnDef<RunRow>[] = [
    {
      key: "run",
      header: "Run",
      width: "fill",
      cell: (r) => (
        <span>
          {r.run.id}
          <small className="block [overflow-wrap:anywhere]">{r.task.title}</small>
        </span>
      ),
      sortValue: (r) => r.run.id,
    },
    {
      key: "tokens",
      header: "Recorded tokens",
      cell: (r) => (r.tokens === null ? "No receipt" : r.tokens),
      sortValue: (r) => r.tokens ?? -1,
    },
  ]
  return (
    <OperationsListPage
      title="Run Explorer · proposed inline candidate"
      admittedItems={projection.admitted}
      matchedItems={projection.matches}
      sourceGeneration={`${projection.source}/${epoch}`}
      accessible={model.accessible}
      active={active}
      searchQuery={query}
      onSearchChange={setQuery}
      searchAriaLabel="Search admitted runs"
      columns={columns}
      getRowId={(r) => r.id}
      rowAriaLabel={(r) => r.run.id}
      selectedIds={checked}
      onSelectionChange={setChecked}
      selectable
      pageSize={8}
      facets={[
        {
          id: "status",
          kind: "chips",
          label: "Run status",
          options: statusOptions,
          value: statuses,
          onChange: setStatuses,
        },
        {
          id: "usage",
          kind: "cycle",
          label: "Usage evidence",
          options: usageFilters.map((value) => ({ value, label: value })) as [
            { value: string; label: string },
            ...{ value: string; label: string }[],
          ],
          value: usage,
          onChange: (value) => setUsage(value as UsageFilter),
        },
        {
          id: "owner",
          kind: "entity",
          label: "Run owner",
          allLabel: "All owners",
          options: ownerOptions,
          value: owner,
          onChange: setOwner,
        },
      ]}
      loading={model.resource === "loading"}
      errorState={model.resource === "error" ? <p role="alert">Run source error</p> : undefined}
      emptyState={<p>No matching run evidence</p>}
      inspector={{
        mode: "inline",
        selectedId: opened,
        onSelect: setOpened,
        title: (r) => `Run ${r.run.id}`,
        meta: (r) => `${r.task.id} · ${r.evidence}`,
        renderBody: (r, scope) => (
          <EvidenceBody key={`${epoch}/${r.id}`} id={r.id} model={model} scope={scope} />
        ),
        footer: (r) => (
          <p>
            Recorded tokens: {r.tokens ?? "No receipt"} · {model.cutoff}
          </p>
        ),
      }}
    />
  )
}
export function OperationsListProof({
  consumer = "torque",
  scenario = "populated",
}: {
  consumer?: "torque" | "runs"
  scenario?: string
}) {
  const [epoch, setEpoch] = useState(0),
    [active, setActive] = useState(true)
  useLayoutEffect(() => {
    diagnostics.refresh = () => setEpoch((n) => n + 1)
    return () => {
      diagnostics.refresh = undefined
    }
  }, [])
  return (
    <div className="flex h-dvh min-h-0 flex-col bg-bg text-text">
      <header className="flex shrink-0 flex-wrap gap-2 border-b border-border p-2">
        <Button onClick={() => setEpoch((n) => n + 1)}>Refresh source</Button>
        <Button onClick={() => setActive((v) => !v)}>Toggle layer admission</Button>
        <label>
          Independent editable pane
          <input aria-label="Independent editable pane" />
        </label>
      </header>
      <main className="min-h-0 min-w-0 flex-1">
        {consumer === "torque" ? (
          <TorqueModalProof scenario={scenario} epoch={epoch} active={active} />
        ) : (
          <RunInlineProof scenario={scenario} epoch={epoch} active={active} />
        )}
      </main>
    </div>
  )
}
