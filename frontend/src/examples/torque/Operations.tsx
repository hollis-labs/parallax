import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  ROW_INTERACTIVE_SELECTOR,
  rowInteractiveProps,
  useQuickSearchShortcut,
  useShortcut,
} from "@hollis-labs/design-components"
import {
  BookOpen,
  Calendar,
  Folder,
  Hash,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
} from "lucide-react"
import { type RefObject, useEffect, useLayoutEffect, useRef, useState } from "react"
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
        (!scope.tag || scope.tag === r.tag),
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
    accessible: model.accessible,
  })
  returnAdmission.current = {
    identity,
    ids: visible.map((r) => r.task.id),
    accessible: model.accessible,
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
    accessible: model.accessible,
    isAdmitted: admitted,
  })
  useQuickSearchShortcut({
    onOpen: () => anchorRef.current?.focus(),
    sourceGeneration: identity,
    accessible: model.accessible,
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
        {summaries.map(([label, value, color]) => (
          <div key={label}>
            <span>{label}</span>
            <strong data-status={color}>{model.accessible ? value : "Unknown"}</strong>
          </div>
        ))}
      </div>
      <div className="torque-ops-filters">
        <div className="torque-ops-search">
          <button
            type="button"
            className="torque-eligible"
            aria-disabled="true"
            title="Eligibility unavailable: these fixtures have no scheduler eligibility evidence. Auto is only an authored mode."
            onClick={() =>
              setNotice(
                "Eligibility unavailable: no scheduler eligibility evidence is supplied. Auto is an authored task mode, not eligibility.",
              )
            }
          >
            ϟ Eligible
          </button>
          <Search size={14} />
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
          <button
            type="button"
            className="torque-filter-count torque-filter-toggle"
            aria-controls="torque-operation-facets"
            aria-label="Toggle Operations filters"
            aria-expanded={filtersOpen}
            onClick={() => edit(() => setFiltersOpen(!filtersOpen))}
          >
            <SlidersHorizontal size={13} />
            {filters}
          </button>
          <span className="torque-filter-count torque-filter-desktop">
            <SlidersHorizontal size={13} />
            {filters}
          </span>
          {(filters > 0 || state.query || sort.key !== "date" || !sort.desc) && (
            <>
              <span>{model.accessible ? `${matching.length} matches` : "Matches unknown"}</span>
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
          <div>
            <span>Status:</span>
            {statuses.map((status) => (
              <button
                type="button"
                key={status}
                data-status={status}
                aria-pressed={active.includes(status)}
                onClick={() =>
                  edit(() =>
                    setActive((v) =>
                      v.includes(status) ? v.filter((s) => s !== status) : [...v, status],
                    ),
                  )
                }
              >
                {status}
              </button>
            ))}
          </div>
          <div>
            <span>Priority:</span>
            {[1, 2, 3].map((p) => (
              <button
                type="button"
                key={p}
                aria-pressed={priority.includes(p)}
                onClick={() =>
                  edit(() =>
                    setPriority((v) => (v.includes(p) ? v.filter((n) => n !== p) : [...v, p])),
                  )
                }
              >
                P{p}
              </button>
            ))}
          </div>
          <div>
            {["Manual", "Auto"].map((value) => (
              <button
                type="button"
                key={value}
                aria-pressed={manual === "Both" || manual === value}
                onClick={() =>
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
              >
                {value}
              </button>
            ))}
          </div>
          <div>
            <span>System:</span>
            <button
              type="button"
              aria-pressed={system}
              onClick={() => edit(() => setSystem(!system))}
            >
              {system ? "Shown" : "Hidden"}
            </button>
          </div>
          <div className="torque-ops-scopes">
            {(
              [
                ["project", projects, Folder],
                ["epic", epics, BookOpen],
                ["sprint", ["Review sprint 1", "Review sprint 2"], Calendar],
                ["tag", tags, Hash],
              ] as const
            ).map(([key, values, Icon]) => (
              <label key={key}>
                <Icon size={13} />
                <select
                  aria-label={`Filter by ${key}`}
                  value={scope[key]}
                  onChange={(e) =>
                    edit(() =>
                      setScope((v) => ({
                        ...v,
                        [key]: e.target.value,
                        ...(key === "project"
                          ? { epic: "", sprint: "" }
                          : key === "epic"
                            ? { sprint: "" }
                            : {}),
                      })),
                    )
                  }
                >
                  <option value="">All {key}s</option>
                  {values
                    .filter((value) => {
                      if (key === "epic" || key === "sprint")
                        return Object.values(operationsMetadata).some(
                          (m) =>
                            m[key] === value &&
                            (!scope.project || m.project === scope.project) &&
                            (key !== "sprint" || !scope.epic || m.epic === scope.epic),
                        )
                      return true
                    })
                    .map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                </select>
              </label>
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
      {!model.accessible ? (
        <ResourceNotice model={model} />
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
                <th>
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
                  <td>
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
                  </td>
                  <td className="torque-ops-task">
                    <a
                      {...rowInteractiveProps(true)}
                      href={torqueHref(state, { route: "task", selected: r.task.id })}
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
                    <div>
                      <span>{r.executor}</span>
                      <span>
                        id: <code>{r.task.id}</code>
                      </span>
                      <span>
                        {r.project} / {r.epic}
                      </span>
                      <span>
                        tags: <em>{r.tag}</em>
                      </span>
                      {r.manual && <span>manual</span>}
                    </div>
                  </td>
                  <td>
                    <span className="torque-ops-status" data-status={r.status}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <span className="torque-ops-priority" data-priority={r.priority}>
                      {r.priority == null ? "Unknown" : `P${r.priority}`}
                    </span>
                  </td>
                  <td className="torque-ops-usage">
                    {r.receipt ? (
                      <>
                        <span>
                          {r.receipt.cost == null ? "USD unknown" : `$${r.receipt.cost.toFixed(4)}`}
                        </span>
                        <small>
                          {r.receipt.tokens == null
                            ? "Tokens unknown"
                            : `${r.receipt.tokens.toLocaleString("en-US")} tokens`}
                        </small>
                      </>
                    ) : (
                      <span>Unknown</span>
                    )}
                  </td>
                  <td className="torque-ops-date">
                    <time dateTime={r.update}>
                      {r.update
                        ? new Date(r.update).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            timeZone: "UTC",
                          })
                        : "Unknown"}
                    </time>
                    <small>{r.update ? relativeUpdate(r.update, state.cutoff) : "Unknown"}</small>
                  </td>
                  <td>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        {...rowInteractiveProps(true)}
                        aria-label={`Task actions ${r.task.id}`}
                      >
                        <MoreHorizontal size={14} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" {...rowInteractiveProps(true)}>
                        <DropdownMenuItem
                          onClick={() => {
                            if (admitted()) {
                              document
                                .querySelector<HTMLElement>(
                                  `[aria-label="Task actions ${r.task.id}"]`,
                                )
                                ?.focus()
                              onSelect(r.task.id)
                            }
                          }}
                        >
                          Inspect task {r.task.id}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            edit(() =>
                              setSelected((ids) =>
                                ids.includes(r.task.id)
                                  ? ids.filter((id) => id !== r.task.id)
                                  : [...ids, r.task.id],
                              ),
                            )
                          }
                        >
                          {selected.includes(r.task.id) ? "Deselect task" : "Select task"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={
                            ![
                              "review",
                              "doing",
                              "todo",
                              "queued",
                              "blocked",
                              "paused",
                              "backlog",
                              "done",
                            ].includes(r.status)
                          }
                          onClick={() => {
                            if (admitted())
                              setIntent({
                                id: r.task.id,
                                identity,
                                action:
                                  r.status === "review"
                                    ? "Approve"
                                    : r.status === "done"
                                      ? "Reopen"
                                      : "Mark done",
                                outcome:
                                  r.status === "done"
                                    ? "refusal"
                                    : r.status === "blocked"
                                      ? "error"
                                      : "preview",
                                returnTarget: document.querySelector<HTMLElement>(
                                  `[aria-label="Task actions ${r.task.id}"]`,
                                ),
                              })
                          }}
                        >
                          {![
                            "review",
                            "doing",
                            "todo",
                            "queued",
                            "blocked",
                            "paused",
                            "backlog",
                            "done",
                          ].includes(r.status)
                            ? "Preview unavailable · unsupported board status"
                            : r.status === "review"
                              ? "Preview approval"
                              : r.status === "done"
                                ? "Preview reopening · refusal"
                                : r.status === "blocked"
                                  ? "Preview completion · error"
                                  : "Preview completion"}
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>
                          Execution unavailable · read-only fixture
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
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
        {model.accessible
          ? `${matching.length} tasks · ${matching.filter((r) => selected.includes(r.task.id)).length} selected`
          : "Records unavailable"}
        <span>
          Fictional tasks ·{" "}
          {state.selected &&
            `${state.selected} / ${model.tasks.find((t) => t.id === state.selected)?.runId} · `}
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
