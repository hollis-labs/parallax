import {
  Button,
  type ColumnDef,
  DetailDialog,
  EmptyState,
  type SortState,
} from "@hollis-labs/design-components"
import { StatusBadge } from "@hollis-labs/kit-dashboard"
import type { TableDensity } from "@hollis-labs/kit-dashboard/data"
import {
  FilterBar,
  FilterChipGroup,
  FilterCycleToggle,
  FilterEntityCombobox,
} from "@hollis-labs/kit-dashboard/data"
import { OperationsTablePage } from "@hollis-labs/kit-dashboard/layout"
import { Users } from "lucide-react"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { type OperationsModel, runDetail } from "../operations/model"
import { ResourceNotice, RunDetailBody } from "../operations/Views"
import {
  explorerProjection,
  explorerSource,
  type RunRow,
  runStatuses,
  type UsageFilter,
  usageFilters,
} from "./model"
export function RunExplorer({
  model,
  direct = false,
  epoch = 0,
  onInspectRecord,
}: {
  model: OperationsModel
  direct?: boolean
  epoch?: number
  onInspectRecord?: (id: string) => void
}) {
  return (
    <ExplorerFrame
      key={`${explorerSource(model)}/${epoch}`}
      model={model}
      direct={direct}
      onInspectRecord={onInspectRecord}
    />
  )
}
function ExplorerFrame({
  model,
  direct,
  onInspectRecord,
}: {
  model: OperationsModel
  direct: boolean
  onInspectRecord?: (id: string) => void
}) {
  const [query, setQuery] = useState(""),
    [statuses, setStatuses] = useState<string[]>([]),
    [owner, setOwner] = useState<string | null>(null),
    [usage, setUsage] = useState<UsageFilter>("all"),
    [density, setDensity] = useState<TableDensity>("compact"),
    [revision, setRevision] = useState(0)
  const stableModel = useRef(model).current
  const projection = useMemo(
    () => explorerProjection(stableModel, query, statuses, owner, usage),
    [stableModel, query, statuses, owner, usage],
  )
  const root = useRef<HTMLDivElement>(null)
  const focus = useRef<{
    label: string | null
    text: string | null
    start: number | null
    end: number | null
  } | null>(null)
  function rememberFocus() {
    const e = document.activeElement
    if (!(e instanceof HTMLElement) || !root.current?.contains(e)) return
    focus.current = {
      label: e.getAttribute("aria-label")?.split(", current:")[0] ?? null,
      text: e.textContent,
      start: e instanceof HTMLInputElement ? e.selectionStart : null,
      end: e instanceof HTMLInputElement ? e.selectionEnd : null,
    }
  }
  const scope = `${projection.source}/${query}/${statuses.join(",")}/${owner}/${usage}/${revision}`
  useLayoutEffect(() => {
    if (!scope) return
    const target = focus.current
    focus.current = null
    if (!target) return
    const node = [
      ...(root.current?.querySelectorAll<HTMLElement>("input, button, select") ?? []),
    ].find((e) =>
      target.label
        ? e.getAttribute("aria-label")?.split(", current:")[0] === target.label
        : e.textContent === target.text,
    )
    const destination =
      node ?? root.current?.querySelector<HTMLElement>('[aria-label="Search admitted runs"]')
    destination?.focus()
    if (node instanceof HTMLInputElement && target.start !== null)
      node.setSelectionRange(target.start, target.end)
  }, [scope])
  const reset = () => {
    rememberFocus()
    setQuery("")
    setStatuses([])
    setOwner(null)
    setUsage("all")
    setRevision((n) => n + 1)
  }
  return (
    <div ref={root} className="run-explorer-page">
      <ExplorerScope
        key={scope}
        model={stableModel}
        projection={projection}
        query={query}
        onQuery={(q) => {
          rememberFocus()
          setQuery(q)
        }}
        statuses={statuses}
        onStatuses={(s) => {
          rememberFocus()
          setStatuses(s)
        }}
        owner={owner}
        onOwner={(o) => {
          focus.current = { label: "Filter run owner", text: null, start: null, end: null }
          setOwner(o)
        }}
        usage={usage}
        onUsage={(u) => {
          rememberFocus()
          setUsage(u)
        }}
        density={density}
        onDensity={setDensity}
        reset={reset}
        direct={direct}
        onInspectRecord={onInspectRecord}
      />
    </div>
  )
}
type Projection = ReturnType<typeof explorerProjection>
function ExplorerScope({
  model,
  projection,
  query,
  onQuery,
  statuses,
  onStatuses,
  owner,
  onOwner,
  usage,
  onUsage,
  density,
  onDensity,
  reset,
  direct,
  onInspectRecord,
}: {
  model: OperationsModel
  projection: Projection
  query: string
  onQuery: (q: string) => void
  statuses: string[]
  onStatuses: (s: string[]) => void
  owner: string | null
  onOwner: (o: string | null) => void
  usage: UsageFilter
  onUsage: (u: UsageFilter) => void
  density: TableDensity
  onDensity: (d: TableDensity) => void
  reset: () => void
  direct: boolean
  onInspectRecord?: (id: string) => void
}) {
  const [selected, setSelected] = useState<string[]>([]),
    [revealed, setRevealed] = useState<string[]>([]),
    [opened, setOpened] = useState<string | null>(null),
    [intent, setIntent] = useState("")
  const current = useRef({ alive: false, lease: 0, opened: null as string | null }),
    origin = useRef<HTMLElement | null>(null),
    focusFrame = useRef<number | null>(null),
    [, refresh] = useState(0)
  useLayoutEffect(() => {
    current.current.alive = true
    current.current.lease++
    refresh((n) => n + 1)
    return () => {
      current.current.alive = false
      current.current.lease++
      if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current)
    }
  }, [])
  const lease = current.current.lease
  const admitted = () => current.current.alive && current.current.lease === lease
  const detail = opened ? runDetail(model, opened) : null
  useEffect(() => {
    if (!opened) return
    const preventBackgroundShortcut = (event: KeyboardEvent) => {
      const active = document.activeElement
      if (
        event.key === "/" &&
        active?.closest('[role="dialog"]') &&
        !active.matches('input, textarea, [contenteditable="true"]')
      )
        event.preventDefault()
    }
    window.addEventListener("keydown", preventBackgroundShortcut, true)
    return () => window.removeEventListener("keydown", preventBackgroundShortcut, true)
  }, [opened])
  function open(id: string) {
    if (!admitted() || !projection.matches.some((r) => r.id === id)) return
    if (onInspectRecord) {
      onInspectRecord(id)
      return
    }
    if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current)
    current.current.lease++
    current.current.opened = id
    origin.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setOpened(id)
    setIntent("")
  }
  function close() {
    if (!admitted() || !current.current.opened) return
    current.current.lease++
    current.current.opened = null
    setOpened(null)
    setIntent("")
    const stamp = current.current.lease,
      node = origin.current
    focusFrame.current = requestAnimationFrame(() => {
      if (
        current.current.alive &&
        current.current.lease === stamp &&
        !current.current.opened &&
        node?.isConnected
      )
        node.focus()
      focusFrame.current = null
    })
  }
  const columns: ColumnDef<RunRow>[] = [
    { key: "run", header: "Run", cell: (r) => r.run.id, sortValue: (r) => r.run.id },
    {
      key: "review",
      header: "Task review",
      width: "fill",
      cell: (r) => (
        <span className="explorer-title">
          {r.task.id} · {r.task.title}
        </span>
      ),
      sortValue: (r) => r.task.title,
    },
    {
      key: "status",
      header: "Run status",
      cell: (r) => <StatusBadge status={r.run.status} />,
      sortValue: (r) => r.run.status,
    },
    {
      key: "owner",
      header: "Owner",
      cell: (r) => r.task.owner ?? "Unavailable",
      sortValue: (r) => r.task.owner ?? "",
    },
    {
      key: "utc",
      header: "Started UTC",
      cell: (r) => r.run.started.replace("T", " ").replace("Z", ""),
      sortValue: (r) => r.run.started,
    },
    {
      key: "usage",
      header: "Recorded tokens",
      cell: (r) => (r.tokens === null ? "No receipt" : r.tokens.toLocaleString("en-US")),
      sortValue: (r) => r.tokens ?? -1,
    },
  ]
  const filters = (
    <>
      <FilterChipGroup
        label="Run status"
        chips={runStatuses.map((value) => ({ value }))}
        selected={statuses}
        onToggle={(value) => {
          if (admitted() && runStatuses.includes(value as (typeof runStatuses)[number]))
            onStatuses(
              statuses.includes(value) ? statuses.filter((s) => s !== value) : [...statuses, value],
            )
        }}
      />
      <FilterCycleToggle
        ariaLabel="Usage evidence"
        options={
          usageFilters.map((value) => ({
            value,
            label:
              value === "all"
                ? "All usage evidence"
                : value === "zero"
                  ? "Recorded zero"
                  : value === "recorded"
                    ? "Receipt observed"
                    : "No receipt observed",
          })) as [{ value: UsageFilter; label: string }, ...{ value: UsageFilter; label: string }[]]
        }
        value={usage}
        onChange={(next) => {
          if (admitted() && usageFilters.includes(next)) onUsage(next)
        }}
      />
      <FilterEntityCombobox
        icon={<Users aria-hidden="true" className="size-4" />}
        ariaLabel="Filter run owner"
        allLabel="All owners"
        items={projection.owners}
        value={owner}
        onChange={(id) => {
          if (admitted() && (id === null || projection.owners.some((o) => o.id === id))) onOwner(id)
        }}
      />
    </>
  )
  const actions = (
    <>
      <label>
        Row density{" "}
        <select
          aria-label="Row density"
          value={density}
          onChange={(e) => {
            if (admitted()) onDensity(e.target.value === "comfortable" ? "comfortable" : "compact")
          }}
        >
          <option>compact</option>
          <option>comfortable</option>
        </select>
      </label>
      <Button
        onClick={() => {
          if (admitted()) reset()
        }}
      >
        Reset explorer
      </Button>
    </>
  )
  const footer = (
    <div className="explorer-footer">
      <span>
        {model.accessible
          ? `${projection.admitted.length} admitted · ${projection.matches.length} matched · ${direct ? projection.matches.length : revealed.length} revealed · ${selected.length} locally checked`
          : "Evidence unavailable; counts withheld"}
      </span>
      <span>
        Recorded zero receipts: {model.accessible ? projection.zeroReceipts : "unavailable"} ·
        Missing receipts: {model.accessible ? projection.missingReceipts : "unavailable"}
      </span>
      <details>
        <summary>Frame and selection policy</summary>
        <span>
          Facet/frame/reset changes reset native selection, initial UTC descending sort and local
          reveal window. Header checkbox selects revealed rows only.
        </span>
        <span>Through {model.cutoff} · bounded local records, no fetching.</span>
      </details>
    </div>
  )
  const onOrder = useCallback((ids: string[]) => setRevealed(ids), [])
  const rowId = useCallback((r: RunRow) => r.id, [])
  const initialSort: SortState = { key: "utc", dir: "desc" }
  const unavailable = !model.accessible ? <ResourceNotice model={model} /> : undefined
  return (
    <div className="run-explorer-page">
      {direct ? (
        <>
          <FilterBar
            searchQuery={query}
            searchAriaLabel="Search admitted runs"
            onSearchChange={(q) => {
              if (admitted()) onQuery(q)
            }}
            activeFilterCount={projection.activeFilters}
            searchMatchCount={projection.matches.length}
            onClear={() => {
              if (admitted()) reset()
            }}
            actions={actions}
          >
            {filters}
          </FilterBar>
          <div className="explorer-direct-results">
            {projection.matches.map((r) => (
              <Button key={r.id} onClick={() => open(r.id)}>
                {r.run.id} · {r.task.title}
              </Button>
            ))}
          </div>
          {footer}
        </>
      ) : (
        <OperationsTablePage
          title="Run Explorer"
          items={projection.matches}
          columns={columns}
          getRowId={rowId}
          initialSort={initialSort}
          searchQuery={query}
          onSearchChange={(q) => {
            if (admitted()) onQuery(q)
          }}
          searchAriaLabel="Search admitted runs"
          activeFilterCount={projection.activeFilters}
          searchMatchCount={model.accessible ? projection.matches.length : undefined}
          filterControls={model.accessible ? filters : undefined}
          filterActions={actions}
          onClear={() => {
            if (admitted()) reset()
          }}
          density={density}
          selectable={model.accessible}
          onSelectionChange={(ids) => {
            if (admitted())
              setSelected(ids.filter((id) => projection.matches.some((r) => r.id === id)))
          }}
          onVisibleOrderChange={onOrder}
          onRowOpen={(id) => open(id)}
          rowAriaLabel={(r) => `Inspect ${r.run.id} ${r.task.title}`}
          pageSize={12}
          loading={model.resource === "loading"}
          errorState={unavailable}
          emptyState={
            <EmptyState
              variant="empty"
              title="No matching admitted runs"
              description="Clear filters or review another fixture frame; missing evidence is not an observed zero."
            />
          }
          footer={footer}
        />
      )}
      <DetailDialog
        open={!!detail}
        onClose={close}
        title={`Explorer ${detail?.task.id ?? ""} / ${detail?.run?.id ?? ""}`}
        meta={
          <>
            <Button size="sm" variant="ghost" onClick={close}>
              Close overview
            </Button>
            <span>{model.cutoff} · recorded prefix</span>
          </>
        }
        widthClassName="settings-plan-dialog"
        footer={
          <div className="settings-plan-footer">
            <Button onClick={close}>Close run inspection</Button>
          </div>
        }
      >
        <div className="settings-plan-body">
          {detail && (
            <RunDetailBody
              detail={detail}
              onIntent={(action, id) => {
                if (admitted() && current.current.opened === opened)
                  setIntent(`${action} → ${id}. Local inspection only; records unchanged.`)
              }}
            />
          )}
          {intent && <p role="status">{intent}</p>}
        </div>
      </DetailDialog>
    </div>
  )
}
