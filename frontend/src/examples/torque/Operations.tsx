import {
  Badge,
  Button,
  CopyableId,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  ROW_INTERACTIVE_SELECTOR,
  rowInteractiveProps,
  useQuickSearchShortcut,
  useShortcut,
} from "@hollis-labs/design-components"
import {
  DataTableCell,
  FilterChipGroup,
  FilterEntityCombobox,
  RecordSummary,
} from "@hollis-labs/kit-dashboard/data"
import {
  PriorityBadge,
  StatusBadge,
  SummaryCards,
  statusTone,
  useDashboardTypography,
} from "@hollis-labs/kit-dashboard/ui"
import {
  BookOpen,
  Calendar,
  Folder,
  FolderPlus,
  Hash,
  Inbox,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  Zap,
} from "lucide-react"
import { type ReactNode, type RefObject, useEffect, useLayoutEffect, useRef, useState } from "react"
import type { OperationsModel } from "../../operations/model"
import { ResourceNotice } from "../../operations/Views"
import { BoardIntent, type BoardIntentRequest } from "./BoardIntent"
import { operationsMetadata } from "./operations-metadata"
import { torqueReferenceModel } from "./reference"
import { type TorqueState, torqueHref } from "./routes"

const statuses = [
  "backlog",
  "todo",
  "queued",
  "doing",
  "review",
  "done",
  "blocked",
  "paused",
  "archived",
  "abandoned",
  "cancelled",
]
const projects = ["Gateway", "Evidence pipeline", "Client workspace"]
const epics = ["Permission boundaries", "Receipt integrity", "Review experience"]
const tags = ["security", "fixtures", "observability", "interface"]
export function TorqueOperations({
  model,
  state,
  onQuery,
  onSelect,
  onCursor,
  anchorRef,
}: {
  model: OperationsModel
  state: TorqueState
  onQuery: (query: string) => void
  onSelect: (id: string) => void
  onCursor: (cursor: { identity: string; ids: string[] }) => void
  anchorRef: RefObject<HTMLInputElement | null>
}) {
  const reference = torqueReferenceModel(model)
  const rows = model.tasks.map((t) => {
    const metadata = operationsMetadata[t.id]
    const receipt = model.dataset.usage.find((u) => u.id === t.usageId && u.runId === t.runId)
    const update = reference.compatible
      ? reference.effectiveUpdates.find((e) => e.taskId === t.id)?.time
      : model.dataset.events.filter((e) => e.taskId === t.id && e.type.startsWith("task.")).at(-1)
          ?.time
    return {
      task: t,
      receipt,
      update,
      ...metadata,
      status:
        model.scenario === "unknown-status"
          ? t.status
          : (metadata?.status ?? (t.status === "running" ? "doing" : t.status)),
    }
  })
  return (
    <TorqueOperationsBoard
      rows={rows}
      accessible={model.accessible}
      unavailable={<ResourceNotice model={model} />}
      state={state}
      onQuery={onQuery}
      onSelect={onSelect}
      onCursor={onCursor}
      anchorRef={anchorRef}
    />
  )
}

export interface TorqueBoardRow {
  task: { id: string; title: string }
  receipt?: { cost: number | null; tokens: number | null }
  update?: string
  status: string
  priority: number
  manual: boolean
  system: boolean
  project: string
  epic: string
  sprint: string
  tag: string
  tags?: string[]
  executor: string
  collection?: string
  inInbox?: boolean
}

export function TorqueOperationsBoard({
  rows,
  accessible,
  unavailable,
  state,
  onQuery,
  onSelect,
  onCursor,
  anchorRef,
  sourceLabel = "Fictional tasks",
  rowHref = (id) => torqueHref(state, { route: "task", selected: id }),
  captured = false,
}: {
  rows: TorqueBoardRow[]
  accessible: boolean
  unavailable?: ReactNode
  state: TorqueState
  onQuery: (query: string) => void
  onSelect: (id: string) => void
  onCursor: (cursor: { identity: string; ids: string[] }) => void
  anchorRef: RefObject<HTMLInputElement | null>
  sourceLabel?: string
  rowHref?: (id: string) => string
  captured?: boolean
}) {
  const typography = useDashboardTypography()
  const [active, setActive] = useState(
    statuses.filter((s) => !["archived", "abandoned", "cancelled"].includes(s)),
  )
  const [priority, setPriority] = useState<number[]>([])
  const [manual, setManual] = useState("Both")
  const [system, setSystem] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [scope, setScope] = useState({ project: "", epic: "", sprint: "", tag: "" })
  const [sort, setSort] = useState({ key: "date", desc: true })
  const [notice, setNotice] = useState("")
  const [intent, setIntent] = useState<BoardIntentRequest | null>(null)
  const intentFrame = JSON.stringify([
    state.profile,
    state.scenario,
    state.cutoff,
    state.override,
    state.query,
  ])
  const lastIntentFrame = useRef(intentFrame)
  useLayoutEffect(() => {
    if (lastIntentFrame.current !== intentFrame) {
      lastIntentFrame.current = intentFrame
      setIntent(null)
    }
  }, [intentFrame])
  const [selected, setSelected] = useState<string[]>([])
  const [visibleCount, setVisibleCount] = useState(50)
  const selectAll = useRef<HTMLInputElement>(null)
  const tableRoot = useRef<HTMLDivElement>(null),
    sentinel = useRef<HTMLTableRowElement>(null)
  const identity = JSON.stringify([
    state.profile,
    state.scenario,
    state.cutoff,
    state.override,
    state.query,
  ])
  const current = useRef(identity)
  current.current = identity
  const lifetime = useRef({ alive: false, lease: 0 })
  const [, refresh] = useState(0)
  useLayoutEffect(() => {
    const own = { alive: true, lease: 0 }
    lifetime.current = own
    refresh((x) => x + 1)
    return () => {
      own.alive = false
      own.lease++
    }
  }, [])
  const retiredIdentity = useRef(identity)
  useLayoutEffect(() => {
    if (retiredIdentity.current === identity) return
    retiredIdentity.current = identity
    lifetime.current.lease++
    setSelected([])
    refresh((x) => x + 1)
  }, [identity])
  const fixtureFrame = JSON.stringify([state.profile, state.scenario, state.override]),
    previousFixture = useRef(fixtureFrame)
  useLayoutEffect(() => {
    if (previousFixture.current === fixtureFrame) return
    previousFixture.current = fixtureFrame
    setActive(statuses.filter((s) => !["archived", "abandoned", "cancelled"].includes(s)))
    setPriority([])
    setManual("Both")
    setSystem(false)
    setScope({ project: "", epic: "", sprint: "", tag: "" })
  }, [fixtureFrame])
  const own = lifetime.current,
    lease = own.lease
  const admitted = () =>
    own.alive && lifetime.current === own && own.lease === lease && current.current === identity
  function edit(action: () => void) {
    if (admitted()) {
      own.lease++
      action()
      refresh((x) => x + 1)
    }
  }
  const matching = rows
    .filter(
      (r) =>
        (active.includes(r.status) ||
          (!statuses.includes(r.status) &&
            active.length === 8 &&
            statuses
              .filter((s) => !["archived", "abandoned", "cancelled"].includes(s))
              .every((s) => active.includes(s)))) &&
        (!priority.length || priority.includes(r.priority)) &&
        (manual === "Both" || (manual === "Manual") === r.manual) &&
        (system || !r.system) &&
        (!scope.project || scope.project === r.project) &&
        (!scope.epic || scope.epic === r.epic) &&
        (!scope.sprint || scope.sprint === r.sprint) &&
        (!scope.tag || (r.tags ?? [r.tag]).includes(scope.tag)),
    )
    .sort((a, b) => {
      const av =
        sort.key === "title"
          ? a.task.title
          : sort.key === "status"
            ? a.status
            : sort.key === "priority"
              ? a.priority
              : (a.update ?? "")
      const bv =
        sort.key === "title"
          ? b.task.title
          : sort.key === "status"
            ? b.status
            : sort.key === "priority"
              ? b.priority
              : (b.update ?? "")
      return (
        (av < bv ? -1 : av > bv ? 1 : a.task.id.localeCompare(b.task.id)) * (sort.desc ? -1 : 1)
      )
    })
  const filterFrame = JSON.stringify([identity, active, priority, manual, system, scope, sort])
  const matchingIds = JSON.stringify(matching.map((r) => r.task.id))
  const previousFilter = useRef(filterFrame)
  useLayoutEffect(() => {
    if (previousFilter.current === filterFrame) return
    previousFilter.current = filterFrame
    setSelected((ids) => ids.filter((id) => (JSON.parse(matchingIds) as string[]).includes(id)))
    setVisibleCount(50)
    if (tableRoot.current) tableRoot.current.scrollTop = 0
  }, [filterFrame, matchingIds])
  const visible = matching.slice(0, visibleCount)
  const returnAdmission = useRef({
    identity,
    ids: visible.map((r) => r.task.id),
    accessible: accessible,
  })
  returnAdmission.current = {
    identity,
    ids: visible.map((r) => r.task.id),
    accessible: accessible,
  }
  function resolveReturnTarget(request: BoardIntentRequest | null) {
    const current = returnAdmission.current
    return request?.returnTarget?.isConnected &&
      request.identity === current.identity &&
      current.accessible &&
      current.ids.includes(request.id) &&
      !request.returnTarget.matches(":disabled")
      ? request.returnTarget
      : anchorRef.current
  }
  useLayoutEffect(() => {
    if (selectAll.current)
      selectAll.current.indeterminate =
        visible.some((r) => selected.includes(r.task.id)) &&
        !visible.every((r) => selected.includes(r.task.id))
  })
  useShortcut({
    key: "/",
    onTrigger: () => anchorRef.current?.focus(),
    allowInInteractive: false,
    sourceGeneration: identity,
    accessible: accessible,
    isAdmitted: admitted,
  })
  useQuickSearchShortcut({
    onOpen: () => anchorRef.current?.focus(),
    sourceGeneration: identity,
    accessible: accessible,
    isAdmitted: admitted,
  })
  const cursorIds = JSON.stringify(visible.map((r) => r.task.id))
  useLayoutEffect(() => {
    onCursor({ identity, ids: JSON.parse(cursorIds) })
  }, [identity, cursorIds, onCursor])
  const currentFilter = useRef(filterFrame)
  currentFilter.current = filterFrame
  useEffect(() => {
    if (visibleCount >= matching.length || !sentinel.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (currentFilter.current === filterFrame && entries.some((e) => e.isIntersecting))
          setVisibleCount((v) => Math.min(v + 50, matching.length))
      },
      { root: tableRoot.current, rootMargin: "200px 0px" },
    )
    observer.observe(sentinel.current)
    return () => observer.disconnect()
  }, [visibleCount, matching.length, filterFrame])
  function previewAction(id: string, action: string, status: string) {
    if (!admitted()) return
    if (!statuses.includes(status)) {
      setNotice("Action previews are unavailable for an unrecognized task status.")
      return
    }
    const terminalTransition =
      ["done", "archived"].includes(status) &&
      (action.startsWith("Move") || action.startsWith("Transition"))
    setIntent({
      id,
      identity,
      action,
      outcome: terminalTransition ? "refusal" : status === "blocked" ? "error" : "preview",
      returnTarget: document.querySelector<HTMLElement>(`[aria-label="Task actions ${id}"]`),
    })
  }
  const filters =
    Number(
      active.length !== 8 ||
        !statuses
          .filter((s) => !["archived", "abandoned", "cancelled"].includes(s))
          .every((s) => active.includes(s)),
    ) +
    Number(priority.length > 0) +
    Number(manual !== "Both") +
    Number(system) +
    Object.values(scope).filter(Boolean).length
  const summaries = [
    [
      "Open Tasks",
      matching.filter((r) => ["backlog", "todo", "queued"].includes(r.status)).length,
      "open",
    ],
    ["In Progress", matching.filter((r) => r.status === "doing").length, "doing"],
    ["In Review", matching.filter((r) => r.status === "review").length, "review"],
    ["Blocked", matching.filter((r) => r.status === "blocked").length, "blocked"],
  ]
  return (
    <section className="torque-operations" aria-label="Operations board">
      <div className="torque-ops-title">
        <strong>Operations</strong>
        <span>Fictional workspace · read only</span>
      </div>
      <div className="torque-ops-summary">
        <SummaryCards
          cards={summaries.map(([label, value, status]) => ({
            label: String(label),
            value: accessible ? value : "Unknown",
            accentColor:
              status === "open" ? "var(--color-fg-faint)" : `var(--torque-summary-${status})`,
          }))}
        />
      </div>
      <div className="torque-ops-filters">
        <div className="torque-ops-search dash-filter-caption">
          <button
            type="button"
            className="torque-eligible"
            aria-label="ϟ Eligible"
            aria-disabled="true"
            title="Eligibility unavailable: these fixtures have no scheduler eligibility evidence. Auto describes the task mode."
            onClick={() =>
              setNotice(
                "Eligibility unavailable: no scheduler eligibility evidence is supplied. Auto is a task mode, not eligibility.",
              )
            }
          >
            <Zap className="size-3.5" /> Eligible
          </button>
          <label className="dash-search-field torque-search-field">
            <Search className="size-3.5" />
            <input
              ref={anchorRef}
              aria-label="Example task filter"
              placeholder="Search…"
              value={state.query}
              onChange={(e) => {
                if (admitted()) onQuery(e.target.value)
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "Escape" &&
                  !e.nativeEvent.isComposing &&
                  e.nativeEvent.keyCode !== 229
                ) {
                  e.preventDefault()
                  e.stopPropagation()
                  if (typeof e.nativeEvent?.stopImmediatePropagation === "function") {
                    e.nativeEvent.stopImmediatePropagation()
                  }
                  if (state.query !== "" && admitted()) {
                    onQuery("")
                  }
                }
              }}
            />
            <kbd className="dash-shortcut">/</kbd>
          </label>
          <button
            type="button"
            className="torque-filter-count torque-filter-toggle"
            aria-controls="torque-operation-facets"
            aria-label="Toggle Operations filters"
            aria-expanded={filtersOpen}
            onClick={() => edit(() => setFiltersOpen(!filtersOpen))}
          >
            <SlidersHorizontal className="size-3.5" />
            {filters}
          </button>
          <span className="torque-filter-count torque-filter-desktop">
            <SlidersHorizontal className="size-3.5" />
            {filters}
          </span>
          {(filters > 0 || state.query || sort.key !== "date" || !sort.desc) && (
            <>
              <span>{accessible ? `${matching.length} matches` : "Matches unknown"}</span>
              <button
                type="button"
                onClick={() =>
                  edit(() => {
                    setActive(
                      statuses.filter((s) => !["archived", "abandoned", "cancelled"].includes(s)),
                    )
                    setPriority([])
                    setManual("Both")
                    setSystem(false)
                    setScope({ project: "", epic: "", sprint: "", tag: "" })
                    setNotice("")
                    setSort({ key: "date", desc: true })
                    setSelected([])
                    onQuery("")
                    anchorRef.current?.focus()
                  })
                }
              >
                Clear
              </button>
            </>
          )}
        </div>
        <div id="torque-operation-facets" className="torque-ops-chips" data-open={filtersOpen}>
          <FilterChipGroup
            label="Status:"
            chips={statuses.map((value) => {
              const tone = statusTone(value)
              return { value, activeClassName: `${tone.border} ${tone.bg} ${tone.text}` }
            })}
            selected={active}
            onToggle={(status) =>
              edit(() =>
                setActive((v) =>
                  v.includes(status) ? v.filter((s) => s !== status) : [...v, status],
                ),
              )
            }
          />
          <FilterChipGroup
            label="Priority:"
            chips={[1, 2, 3].map((p) => ({ value: String(p), label: `P${p}` }))}
            selected={priority.map(String)}
            onToggle={(value) =>
              edit(() => {
                const p = Number(value)
                setPriority((v) => (v.includes(p) ? v.filter((n) => n !== p) : [...v, p]))
              })
            }
          />
          <FilterChipGroup
            chips={["Manual", "Auto"].map((value) => {
              const tone = statusTone("doing")
              return { value, activeClassName: `${tone.border} ${tone.bg} ${tone.text}` }
            })}
            selected={manual === "Both" ? ["Manual", "Auto"] : [manual]}
            onToggle={(value) =>
              edit(() =>
                setManual(
                  manual === "Both"
                    ? value === "Manual"
                      ? "Auto"
                      : "Manual"
                    : manual === value
                      ? "Both"
                      : value,
                ),
              )
            }
          />
          <FilterChipGroup
            label="System:"
            chips={[{ value: "system", label: system ? "Shown" : "Hidden" }]}
            selected={system ? ["system"] : []}
            onToggle={() => edit(() => setSystem(!system))}
          />
          <div className="torque-ops-scopes">
            {(
              [
                [
                  "project",
                  captured ? [...new Set(rows.map((r) => r.project).filter(Boolean))] : projects,
                  Folder,
                ],
                [
                  "epic",
                  captured ? [...new Set(rows.map((r) => r.epic).filter(Boolean))] : epics,
                  BookOpen,
                ],
                [
                  "sprint",
                  captured
                    ? [...new Set(rows.map((r) => r.sprint).filter(Boolean))]
                    : ["Review sprint 1", "Review sprint 2"],
                  Calendar,
                ],
                [
                  "tag",
                  captured
                    ? [...new Set(rows.flatMap((r) => r.tags ?? [r.tag]).filter(Boolean))]
                    : tags,
                  Hash,
                ],
              ] as const
            ).map(([key, values]) => (
              <div key={key} className="torque-scope-control">
                <FilterEntityCombobox
                  key={fixtureFrame}
                  icon={key === "tag" ? <Hash className="size-3.5" /> : null}
                  triggerClassName={
                    key === "tag"
                      ? "text-xs tracking-normal font-sans"
                      : "w-40 justify-between text-xs tracking-normal font-medium font-sans rounded-lg px-2.5"
                  }
                  ariaLabel={`Filter by ${key}`}
                  allLabel={key === "tag" ? "All tags" : `${key[0].toUpperCase()}${key.slice(1)}s`}
                  value={scope[key] || null}
                  items={values
                    .filter((value) => {
                      if (key === "epic" || key === "sprint")
                        return (captured ? rows : Object.values(operationsMetadata)).some(
                          (m) =>
                            m[key] === value &&
                            (!scope.project || m.project === scope.project) &&
                            (key !== "sprint" || !scope.epic || m.epic === scope.epic),
                        )
                      return true
                    })
                    .map((value) => ({ id: value, name: value }))}
                  onChange={(value) =>
                    edit(() =>
                      setScope((v) => ({
                        ...v,
                        [key]: value ?? "",
                        ...(key === "project"
                          ? { epic: "", sprint: "" }
                          : key === "epic"
                            ? { sprint: "" }
                            : {}),
                      })),
                    )
                  }
                />
                {key !== "tag" && (
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label={`Create ${key} preview`}
                    onClick={() =>
                      setNotice(`Create ${key} is unavailable in this read-only fixture.`)
                    }
                  >
                    <Plus />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {notice && (
        <p role="status" className="torque-ops-notice">
          {notice}{" "}
          <button type="button" onClick={() => setNotice("")}>
            Dismiss explanation
          </button>
        </p>
      )}
      {!accessible ? (
        unavailable
      ) : (
        <section
          className="torque-ops-table-region"
          ref={tableRoot}
          aria-label="Operations task table"
          // biome-ignore lint/a11y/noNoninteractiveTabindex: Named overflow region must receive native keyboard scrolling.
          tabIndex={0}
        >
          <table>
            <thead>
              <tr>
                <th className="dash-table-heading">
                  <input
                    ref={selectAll}
                    type="checkbox"
                    aria-label="Select all tasks"
                    disabled={!visible.length}
                    checked={
                      matching.length > 0 && visible.every((r) => selected.includes(r.task.id))
                    }
                    onChange={(e) =>
                      edit(() =>
                        setSelected((ids) =>
                          e.target.checked
                            ? [...new Set([...ids, ...visible.map((r) => r.task.id)])]
                            : ids.filter((id) => !visible.some((r) => r.task.id === id)),
                        ),
                      )
                    }
                  />
                </th>
                {[
                  ["title", "Task"],
                  ["status", "Status"],
                  ["priority", "Pri"],
                  ["usage", "Usage"],
                  ["date", "Date"],
                ].map(([key, label]) => (
                  <th
                    className="dash-table-heading"
                    key={key}
                    aria-sort={
                      key === "usage"
                        ? undefined
                        : sort.key === key
                          ? sort.desc
                            ? "descending"
                            : "ascending"
                          : "none"
                    }
                  >
                    {key === "usage" ? (
                      label
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          edit(() =>
                            setSort((v) => ({ key, desc: v.key === key ? !v.desc : false })),
                          )
                        }
                      >
                        {label} <span>{sort.key === key ? (sort.desc ? "↓" : "↑") : "⇕"}</span>
                      </button>
                    )}
                  </th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr
                  key={r.task.id}
                  data-task-id={r.task.id}
                  data-selected={selected.includes(r.task.id)}
                  tabIndex={0}
                  onClick={(e) => {
                    if (
                      admitted() &&
                      e.button === 0 &&
                      !e.ctrlKey &&
                      !e.metaKey &&
                      !e.shiftKey &&
                      !e.altKey &&
                      !(e.target instanceof Element && e.target.closest(ROW_INTERACTIVE_SELECTOR))
                    ) {
                      e.currentTarget.focus({ preventScroll: true })
                      onSelect(r.task.id)
                    }
                  }}
                  onKeyDown={(e) => {
                    if (
                      admitted() &&
                      e.target === e.currentTarget &&
                      !e.defaultPrevented &&
                      !e.nativeEvent.isComposing &&
                      e.nativeEvent.keyCode !== 229 &&
                      !e.ctrlKey &&
                      !e.metaKey &&
                      !e.shiftKey &&
                      !e.altKey &&
                      (e.key === "Enter" || e.key === " ")
                    ) {
                      e.preventDefault()
                      onSelect(r.task.id)
                    }
                  }}
                >
                  <DataTableCell kind="selection">
                    <input
                      type="checkbox"
                      {...rowInteractiveProps(true)}
                      aria-label={`Select task ${r.task.title}`}
                      checked={selected.includes(r.task.id)}
                      onChange={(e) =>
                        edit(() =>
                          setSelected((v) =>
                            e.target.checked
                              ? [...v, r.task.id]
                              : v.filter((id) => id !== r.task.id),
                          ),
                        )
                      }
                    />
                  </DataTableCell>
                  <DataTableCell className="torque-ops-task w-full max-w-0 text-left">
                    <RecordSummary
                      title={
                        <a
                          {...rowInteractiveProps(true)}
                          href={rowHref(r.task.id)}
                          onClick={(e) => {
                            if (
                              admitted() &&
                              e.button === 0 &&
                              !e.ctrlKey &&
                              !e.metaKey &&
                              !e.shiftKey &&
                              !e.altKey
                            ) {
                              e.preventDefault()
                              e.currentTarget.focus({ preventScroll: true })
                              onSelect(r.task.id)
                            }
                          }}
                          title={r.task.title}
                        >
                          {r.task.title}
                        </a>
                      }
                      metadata={
                        <>
                          <span>{r.executor}</span>
                          <span>id:</span>
                          <code>
                            <CopyableId id={r.task.id} />
                          </code>
                          <span
                            className="inline-flex items-center gap-0.5"
                            {...rowInteractiveProps(true)}
                          >
                            {r.collection ? (
                              <Badge
                                variant="outline"
                                className="gap-1 rounded border-border-subtle bg-surface/60 px-1.5 py-px dash-record-metadata text-fg-secondary"
                              >
                                <Folder className="size-3" />
                                {r.collection}
                              </Badge>
                            ) : r.inInbox ? (
                              <Badge
                                variant="outline"
                                className="gap-1 rounded border-border-subtle bg-surface/60 px-1.5 py-px dash-record-metadata uppercase tracking-dash-record-date text-fg-muted"
                              >
                                <Inbox className="size-3" />
                                Inbox
                              </Badge>
                            ) : (
                              <Button
                                {...rowInteractiveProps(true)}
                                variant="outline"
                                size="icon-xs"
                                className="size-5 rounded border-border bg-surface/60 p-0 text-fg-faint hover:bg-surface"
                                aria-label={`Preview send ${r.task.id} to inbox`}
                                onClick={() =>
                                  setNotice(
                                    `Send ${r.task.id} to inbox is unavailable in this read-only fixture.`,
                                  )
                                }
                              >
                                <Inbox className="size-3" />
                              </Button>
                            )}
                            {!r.collection && (
                              <Button
                                {...rowInteractiveProps(true)}
                                variant="outline"
                                size="icon-xs"
                                className="size-5 rounded border-border bg-surface/60 p-0 text-fg-faint hover:bg-surface"
                                aria-label={`Preview add ${r.task.id} to collection`}
                                onClick={() =>
                                  setNotice(
                                    `Add ${r.task.id} to collection is unavailable in this read-only fixture.`,
                                  )
                                }
                              >
                                <FolderPlus className="size-3" />
                              </Button>
                            )}
                          </span>
                          <span>tags:</span>
                          <span className="text-fg-muted">{r.tag}</span>
                          {r.manual && <span>manual</span>}
                        </>
                      }
                    />
                  </DataTableCell>
                  <DataTableCell className="whitespace-nowrap px-1.5">
                    <span className="torque-ops-status" data-status={r.status}>
                      <StatusBadge status={r.status} className="dash-record-status" />
                    </span>
                  </DataTableCell>
                  <DataTableCell className="whitespace-nowrap px-1.5">
                    {r.priority == null ? (
                      "Unknown"
                    ) : (
                      <PriorityBadge priority={r.priority} className="dash-record-priority" />
                    )}
                  </DataTableCell>
                  <DataTableCell className="torque-ops-usage dash-record-number whitespace-nowrap px-1.5">
                    {r.receipt ? (
                      <>
                        <span>
                          {r.receipt.cost == null ? "USD unknown" : `$${r.receipt.cost.toFixed(4)}`}
                        </span>
                        <small className="dash-record-metadata">
                          {r.receipt.tokens == null
                            ? "Tokens unknown"
                            : `${r.receipt.tokens.toLocaleString("en-US")} tokens`}
                        </small>
                      </>
                    ) : (
                      <span>Unknown</span>
                    )}
                  </DataTableCell>
                  <DataTableCell className="torque-ops-date dash-record-date whitespace-nowrap px-1.5">
                    <time dateTime={r.update}>
                      {r.update
                        ? new Date(r.update).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            timeZone: "UTC",
                          })
                        : "Unknown"}
                    </time>
                    <small className="dash-record-date">
                      {r.update ? relativeUpdate(r.update, state.cutoff) : "Unknown"}
                    </small>
                  </DataTableCell>
                  <DataTableCell className="whitespace-nowrap px-1.5">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        {...rowInteractiveProps(true)}
                        aria-label={`Task actions ${r.task.id}`}
                      >
                        <MoreHorizontal size={14} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="dash-menu min-w-44"
                        {...typography}
                        align="end"
                        {...rowInteractiveProps(true)}
                      >
                        {r.status === "review" && (
                          <DropdownMenuItem
                            onClick={() => previewAction(r.task.id, "Approve", r.status)}
                          >
                            Approve
                          </DropdownMenuItem>
                        )}
                        {!["done", "archived"].includes(r.status) && (
                          <DropdownMenuItem
                            onClick={() => previewAction(r.task.id, "Mark done", r.status)}
                          >
                            Mark done
                          </DropdownMenuItem>
                        )}
                        {r.status !== "todo" && (
                          <DropdownMenuItem
                            onClick={() => previewAction(r.task.id, "Move to todo", r.status)}
                          >
                            Move to todo
                          </DropdownMenuItem>
                        )}
                        {!["done", "archived"].includes(r.status) &&
                          !(r.status === "todo" && r.manual) && (
                            <DropdownMenuItem
                              onClick={() => previewAction(r.task.id, "Move to backlog", r.status)}
                            >
                              Move to backlog
                            </DropdownMenuItem>
                          )}
                        {!["done", "archived", "paused"].includes(r.status) && (
                          <DropdownMenuItem
                            onClick={() => previewAction(r.task.id, "Pause", r.status)}
                          >
                            Pause
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => previewAction(r.task.id, "Add to collection", r.status)}
                        >
                          Add to collection…
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>Transition to…</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent
                            className="dash-menu min-w-44"
                            {...typography}
                            {...rowInteractiveProps(true)}
                          >
                            {statuses
                              .filter((status) => status !== r.status)
                              .map((status) => (
                                <DropdownMenuItem
                                  key={status}
                                  onClick={() =>
                                    previewAction(r.task.id, `Transition to ${status}`, r.status)
                                  }
                                >
                                  {status[0].toUpperCase() + status.slice(1)}
                                </DropdownMenuItem>
                              ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => previewAction(r.task.id, "Delete", r.status)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </DataTableCell>
                </tr>
              ))}
              {visible.length < matching.length && (
                <tr ref={sentinel}>
                  <td colSpan={7} className="torque-ops-more">
                    Showing {visible.length} of {matching.length} matching tasks
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {!matching.length && (
            <p className="torque-ops-empty">
              No results found. Try adjusting your filters or search query.
            </p>
          )}
        </section>
      )}
      <BoardIntent
        request={intent}
        onClose={() => setIntent(null)}
        resolveReturnTarget={resolveReturnTarget}
      />
      <footer className="torque-ops-footer">
        {accessible
          ? `${matching.length} tasks · ${matching.filter((r) => selected.includes(r.task.id)).length} selected`
          : "Records unavailable"}
        <span>
          {sourceLabel} · {state.selected && `${state.selected} · `}
          Snapshot {state.cutoff.slice(0, 10)} · {state.cutoff.slice(11, 16)} UTC
        </span>
      </footer>
    </section>
  )
}

function relativeUpdate(stamp: string, clock: string) {
  const minutes = Math.max(0, Math.floor((Date.parse(clock) - Date.parse(stamp)) / 60000))
  return minutes < 60
    ? `${minutes}m ago`
    : minutes < 1440
      ? `${Math.floor(minutes / 60)}h ago`
      : `${Math.floor(minutes / 1440)}d ago`
}
