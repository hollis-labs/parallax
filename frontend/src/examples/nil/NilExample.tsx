import {
  Button,
  type ColumnDef,
  ConfirmDialog,
  CycleModeToggle,
  hasActiveModalOverlay,
  InspectionDialog,
  isComposingEvent,
  ModeToggle,
  RadialMenu,
  type RadialMenuItem,
  restoreAdmittedFocus,
  SearchAddToggle,
  SearchPalette,
  ThemePicker,
  useLongPress,
  useQuickSearchShortcut,
  useShortcut,
} from "@hollis-labs/design-components"
import { OperationsListPage } from "@hollis-labs/kit-dashboard/layout"
import { CheckSquare, FileText, Layers, Pin } from "lucide-react"
import { useLayoutEffect, useMemo, useRef, useState } from "react"
import { themes } from "../ops-shell/model"
import { NilEditor } from "./Editor"
import "./nil.css"
import {
  fixture,
  label,
  matches,
  type NilRecord,
  reference,
  type Section,
  sections,
  taxonomy,
} from "./model"
import { ownsPopup, popupOwner } from "./ownership"

export interface NilProofFrame {
  live(): boolean
  process(id: string): void
  open(id: string): void
  collapse(section: Section): void
  hold: ReturnType<typeof useLongPress>
  focus: () => boolean
}
export const nilProof: { current?: NilProofFrame; retained: NilProofFrame[] } = { retained: [] }
const modes = [
  { id: "todos", label: "Todos", icon: <CheckSquare /> },
  { id: "notes", label: "Notes", icon: <FileText /> },
  { id: "all", label: "All", icon: <Layers /> },
]
const todoActions: RadialMenuItem[] = [
  { id: "now", label: "NOW", angle: 0 },
  { id: "soon", label: "SOON", angle: 45 },
  { id: "anytime", label: "ANY", angle: 90 },
  { id: "delete", label: "DEL", angle: 135 },
  { id: "edit", label: "EDIT", angle: 180 },
  { id: "done", label: "DONE", angle: 225 },
  {
    id: "more",
    label: "MORE",
    angle: 270,
    children: [
      { id: "archive", label: "ARCH", angle: 90 },
      { id: "clone", label: "COPY", angle: 150 },
      { id: "meta", label: "META", angle: 210 },
      { id: "convert", label: "→NOTE", angle: 270 },
    ],
  },
  { id: "pin", label: "PIN", angle: 315 },
]
const noteActions: RadialMenuItem[] = [
  { id: "edit", label: "EDIT", angle: 0 },
  { id: "convert", label: "→TODO", angle: 60 },
  { id: "delete", label: "DEL", angle: 120 },
  { id: "pin", label: "PIN", angle: 180 },
  { id: "clone", label: "COPY", angle: 270 },
]
export function NilExample({
  scenario = "populated",
  source = 1,
  accessible = true,
  onProof,
}: {
  scenario?: string
  source?: number
  accessible?: boolean
  onProof?: (frame: NilProofFrame) => void
}) {
  const [records, setRecords] = useState(() => (scenario === "empty" ? [] : fixture()))
  const [mode, setMode] = useState("todos"),
    [inputMode, setInputMode] = useState<"search" | "add">("search")
  const [query, setQuery] = useState(""),
    [capture, setCapture] = useState("")
  const [tab, setTab] = useState("All"),
    [selected, setSelected] = useState<string[]>([])
  const [collapsed, setCollapsed] = useState<Section[]>([])
  const [context, setContext] = useState<string | null>(null),
    [project, setProject] = useState<string | null>(null),
    [tag, setTag] = useState<string | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<string | null>(null),
    [palette, setPalette] = useState(false)
  const [paletteQuery, setPaletteQuery] = useState(""),
    [paletteFilter, setPaletteFilter] = useState("all")
  const [tabsOpen, setTabsOpen] = useState(false),
    [userTabs, setUserTabs] = useState(["Desk", "Studio"])
  const [deleteIds, setDeleteIds] = useState<string[]>([]),
    [notice, setNotice] = useState("All mutations stay in local fixture state.")
  const [theme, setTheme] = useState("nanite-default"),
    [appearance, setAppearance] = useState<"light" | "dark" | "system">("dark")
  const [menu, setMenu] = useState<{
    id: string
    target: HTMLElement
    x: number
    y: number
  } | null>(null)
  const root = useRef<HTMLDivElement>(null),
    origin = useRef<HTMLElement | null>(null),
    sequence = useRef(0)
  const pointerRow = useRef<HTMLElement | null>(null),
    composing = useRef(false)
  const generation = `${source}/${scenario}`
  const frame = useShortcut({
    key: "",
    enabled: false,
    sourceGeneration: generation,
    onTrigger: () => {},
  })
  const live = () =>
    frame.isLive() &&
    accessible &&
    scenario !== "denied" &&
    Boolean(root.current?.isConnected && root.current.getClientRects().length)
  const background = () =>
    live() &&
    !composing.current &&
    !editorOpen &&
    !palette &&
    !tabsOpen &&
    !deleteIds.length &&
    !menu &&
    !hasActiveModalOverlay()
  useLayoutEffect(() => {
    const node = document.documentElement,
      oldTheme = node.dataset.theme,
      oldMode = node.dataset.mode
    node.dataset.theme = theme
    node.dataset.mode =
      appearance === "system"
        ? matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : appearance
    return () => {
      if (oldTheme === undefined) delete node.dataset.theme
      else node.dataset.theme = oldTheme
      if (oldMode === undefined) delete node.dataset.mode
      else node.dataset.mode = oldMode
    }
  }, [theme, appearance])
  const priorSource = useRef(generation)
  useLayoutEffect(() => {
    if (priorSource.current === generation) return
    priorSource.current = generation
    setEditing(null)
    setEditorOpen(false)
    setPalette(false)
    setTabsOpen(false)
    setMenu(null)
    setDeleteIds([])
    setSelected([])
    setRecords(scenario === "empty" ? [] : fixture())
    setCapture("")
  }, [generation, scenario])
  useLayoutEffect(() => {
    if (!accessible || scenario === "denied") {
      setEditing(null)
      setEditorOpen(false)
      setPalette(false)
      setTabsOpen(false)
      setMenu(null)
      setDeleteIds([])
      setSelected([])
    }
  }, [accessible, scenario])
  const admitted = useMemo(
    () =>
      accessible && scenario !== "denied"
        ? records.filter((r) =>
            tab === "Inbox"
              ? r.inbox && !r.archived
              : tab === "Archive"
                ? r.archived
                : !r.inbox && !r.archived,
          )
        : [],
    [records, tab, accessible, scenario],
  )
  const matching = useMemo(
    () =>
      admitted.filter(
        (r) =>
          (tab === "Inbox" ||
            tab === "Archive" ||
            mode === "all" ||
            (mode === "todos" ? r.kind === "todo" : r.kind === "note")) &&
          (tab !== "Desk" || r.contexts.includes("desk")) &&
          (tab !== "Studio" || r.contexts.includes("studio")) &&
          matches(r, query) &&
          (!context || r.contexts.includes(context)) &&
          (!project || r.projects.includes(project)) &&
          (!tag || r.tags.includes(tag)),
      ),
    [admitted, mode, tab, query, context, project, tag],
  )
  const visible = useMemo(
    () =>
      matching
        .filter((r) => !collapsed.includes(r.section))
        .sort((a, b) => sections.indexOf(a.section) - sections.indexOf(b.section)),
    [matching, collapsed],
  )
  const ids = useMemo(() => visible.map((r) => r.id), [visible])
  useLayoutEffect(() => {
    const members = new Set(ids)
    setSelected((current) =>
      current.every((id) => members.has(id)) ? current : current.filter((id) => members.has(id)),
    )
    if (editing !== null && !members.has(editing)) setEditorOpen(false)
    if (menu && !members.has(menu.id)) setMenu(null)
  }, [ids, editing, menu])
  function collapse(section: Section) {
    if (!background()) return
    setCollapsed((current) =>
      current.includes(section) ? current.filter((v) => v !== section) : [...current, section],
    )
  }
  function row(id: string) {
    return (
      Array.from(root.current?.querySelectorAll<HTMLElement>("[data-ops-row-id]") ?? []).find(
        (n) => n.getAttribute("data-ops-row-id") === id,
      ) ?? null
    )
  }
  function actionAllowed(owner: "background" | "radial") {
    return owner === "background"
      ? background()
      : live() &&
          Boolean(menu) &&
          ownsPopup(document.querySelector<HTMLElement>('[role="menu"][aria-label="Nil actions"]'))
  }
  function open(id: string, owner: "background" | "radial" = "background") {
    if (!actionAllowed(owner) || !records.some((r) => r.id === id) || !ids.includes(id)) return
    origin.current =
      row(id) ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null)
    setEditing(id)
    setEditorOpen(true)
  }
  function mutate(
    idsToChange: string[],
    action: string,
    owner: "background" | "radial" = "background",
  ) {
    if (!actionAllowed(owner)) return
    const admittedIds = idsToChange.filter((id) => ids.includes(id))
    if (!admittedIds.length) return
    if (action === "delete") {
      setDeleteIds(admittedIds)
      return
    }
    setRecords((current) =>
      current.map((r) =>
        !admittedIds.includes(r.id)
          ? r
          : action === "process"
            ? { ...r, inbox: false, kind: r.kind === "scratch" ? "todo" : r.kind, section: "now" }
            : action === "archive"
              ? { ...r, archived: true, inbox: false }
              : action === "pin"
                ? { ...r, pinned: !r.pinned }
                : action === "convert"
                  ? { ...r, kind: r.kind === "todo" ? "note" : "todo" }
                  : sections.includes(action as Section)
                    ? { ...r, section: action as Section }
                    : r,
      ),
    )
    if (action === "clone") {
      const found = records.find((r) => r.id === admittedIds[0])
      if (found)
        setRecords((current) => [
          ...current,
          { ...found, id: `local-copy:4421/${++sequence.current}`, inbox: false },
        ])
    }
    setSelected([])
    setNotice(`Local ${action}: ${admittedIds.length} item(s).`)
  }
  const hold = useLongPress({
    sourceGeneration: generation,
    activationGeneration: `${tab}/${mode}`,
    accessible,
    isAdmitted: () =>
      background() &&
      Boolean(
        pointerRow.current &&
          ids.includes(pointerRow.current.getAttribute("data-ops-row-id") ?? ""),
      ),
    onLongPress: (gesture) => {
      const target = pointerRow.current
      const id = target?.getAttribute("data-ops-row-id")
      if (target && id && background())
        setMenu({ id, target, x: gesture.clientX, y: gesture.clientY })
    },
  })
  const modeHold = useLongPress({
    sourceGeneration: generation,
    activationGeneration: "mode",
    accessible,
    isAdmitted: background,
    onLongPress: () => setTabsOpen(true),
  })
  const quick = useQuickSearchShortcut({
    sourceGeneration: generation,
    enabled: accessible && !palette,
    isAdmitted: background,
    onOpen: () => {
      origin.current = document.activeElement as HTMLElement
      setPalette(true)
    },
  })
  useLayoutEffect(() => {
    const published = {
      live,
      process: (id: string) => {
        if (background() && ids.includes(id)) mutate([id], "process")
      },
      open: (id: string) => {
        if (background()) open(id)
      },
      collapse,
      hold,
      focus: () => {
        const target = origin.current
        const active = document.activeElement
        if (
          !background() ||
          !target ||
          (active !== document.body && active !== root.current && active !== target)
        )
          return false
        return restoreAdmittedFocus({
          trigger: target,
          isAdmitted: () => background(),
          fallbackTarget: root.current,
          isFallbackAdmitted: () => background(),
        })
      },
    }
    nilProof.current = published
    onProof?.(published)
  })
  const columns: ColumnDef<NilRecord>[] = [
    {
      key: "title",
      header: "Item",
      width: "fill",
      className: "whitespace-normal",
      cell: (r) => (
        <div className="min-w-0 py-1">
          <span className="block text-sm [overflow-wrap:anywhere]">
            {r.pinned && <Pin className="mr-1 inline size-3" aria-label="Pinned" />}
            {label(r)}
          </span>
          <span className="block text-caption text-fg-muted">
            {r.kind} · {r.contexts.map((v) => `@${v}`).join(" ")}{" "}
            {r.projects.map((v) => `+${v}`).join(" ")} {r.tags.map((v) => `#${v}`).join(" ")}
          </span>
          <span className="block text-caption text-fg-muted md:hidden">
            {r.section} ·{" "}
            {r.priority === undefined
              ? "Priority absent"
              : r.priority === null
                ? "Priority unknown"
                : `P${r.priority}`}{" "}
            · {r.due ?? "No known due date"} {r.recurrence && `↻ ${r.recurrence}`}
          </span>
        </div>
      ),
    },
    {
      key: "section",
      header: "Section",
      className: "hidden md:table-cell",
      cell: (r) => r.section,
    },
    {
      key: "priority",
      header: "Priority",
      className: "hidden md:table-cell",
      cell: (r) =>
        r.priority === undefined ? "Absent" : r.priority === null ? "Unknown" : `P${r.priority}`,
    },
    {
      key: "due",
      header: "Due / repeat",
      className: "hidden md:table-cell",
      cell: (r) => (
        <span>
          {r.due ?? (r.due === null ? "Unknown" : "Absent")} {r.recurrence && `↻ ${r.recurrence}`}
        </span>
      ),
    },
  ]
  const editRecord = records.find((r) => r.id === editing),
    menuRecord = records.find((r) => r.id === menu?.id)
  return (
    <div
      ref={root}
      tabIndex={-1}
      className="nil-example flex h-dvh min-h-0 min-w-0 flex-col bg-bg text-fg"
      data-testid="nil-example"
      role="application"
      aria-label="Nil operations example"
      {...hold.bindings}
      onPointerDownCapture={(event) => {
        pointerRow.current =
          event.target instanceof Element
            ? event.target.closest<HTMLElement>("[data-ops-row-id]")
            : null
      }}
      onCompositionStartCapture={() => {
        composing.current = true
      }}
      onCompositionEndCapture={() => {
        composing.current = false
      }}
      onKeyDownCapture={(event) => {
        if (
          !background() ||
          event.defaultPrevented ||
          composing.current ||
          isComposingEvent(event.nativeEvent) ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey
        )
          return
        const target = event.target as HTMLElement
        if (inputMode === "add" && target.matches("input[type=search]") && event.key === "Enter") {
          event.preventDefault()
          event.stopPropagation()
          if (capture.trim()) {
            const id = `local-add:4421/${++sequence.current}`
            setRecords((current) => [
              ...current,
              {
                id,
                title: capture.trim(),
                body: "Local quick capture",
                kind: mode === "notes" ? "note" : "todo",
                section: "now",
                projects: [],
                contexts: [],
                tags: [],
                pinned: false,
                inbox: false,
                archived: false,
              },
            ])
            setCapture("")
            setNotice("Local quick capture added.")
          }
          return
        }
        if (event.key === "Escape" && !target.matches("input,textarea,select")) {
          if (selected.length) {
            event.preventDefault()
            setSelected([])
          }
          return
        }
        const owner = target.closest<HTMLElement>("[data-ops-row-id]")
        if (!owner || target !== owner) return
        const id = owner.getAttribute("data-ops-row-id")
        if (!id || !ids.includes(id)) return
        if (event.key === "ContextMenu" || event.key === "m") {
          event.preventDefault()
          event.stopPropagation()
          const rect = owner.getBoundingClientRect()
          setMenu({ id, target: owner, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 })
        }
        if (tab === "Inbox" && ["p", "a", "d"].includes(event.key)) {
          event.preventDefault()
          event.stopPropagation()
          mutate(
            selected.length && selected.includes(id) ? selected : [id],
            event.key === "p" ? "process" : event.key === "a" ? "archive" : "delete",
          )
        }
      }}
      onKeyDown={(event) => {
        if (
          event.key !== "F10" ||
          !event.shiftKey ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.defaultPrevented ||
          composing.current ||
          isComposingEvent(event.nativeEvent) ||
          !background()
        )
          return
        const target = event.target as HTMLElement
        if (!target.matches("[data-ops-row-id]")) return
        event.preventDefault()
        const id = target.getAttribute("data-ops-row-id")
        const rect = target.getBoundingClientRect()
        if (id) setMenu({ id, target, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 })
      }}
    >
      <OperationsListPage
        title="Nil operations"
        admittedItems={admitted}
        matchedItems={visible}
        sourceGeneration={generation}
        accessible={accessible && scenario !== "denied"}
        headerActions={
          <div className="flex flex-wrap items-center gap-2">
            <ThemePicker
              theme={theme}
              themes={themes.map((id) => ({ id, name: id }))}
              onThemeChange={setTheme}
            />
            <ModeToggle
              mode={appearance}
              resolvedMode={appearance === "system" ? "dark" : appearance}
              onModeChange={setAppearance}
            />
          </div>
        }
        tabs={
          <div className="border-b border-border">
            <div role="tablist" aria-label="Nil views" className="flex flex-wrap gap-1 px-3 py-2">
              {["All", ...userTabs, "Inbox", "Archive"].map((value) => (
                <button
                  type="button"
                  role="tab"
                  key={value}
                  aria-selected={tab === value}
                  className="rounded-md px-3 py-1 text-sm aria-selected:bg-surface-hover"
                  onClick={() => {
                    if (background()) {
                      setTab(value)
                      setSelected([])
                    }
                  }}
                >
                  {value}
                  {value === "Inbox" &&
                    ` (${records.filter((r) => r.inbox && !r.archived).length})`}
                </button>
              ))}
            </div>
            <fieldset aria-label="Collapsible sections" className="flex flex-wrap gap-2 px-3 pb-2">
              {sections.map((section) => (
                <button
                  type="button"
                  key={section}
                  aria-expanded={!collapsed.includes(section)}
                  aria-controls="nil-section-list"
                  className="rounded border border-border px-2 py-1 text-caption"
                  onClick={() => {
                    collapse(section)
                  }}
                >
                  {section} ({matching.filter((r) => r.section === section).length})
                </button>
              ))}
            </fieldset>
          </div>
        }
        searchQuery={inputMode === "add" ? capture : query}
        onSearchChange={(value) => {
          if (live()) {
            if (inputMode === "add") setCapture(value)
            else setQuery(value)
          }
        }}
        searchAriaLabel={inputMode === "add" ? "Quick capture" : "Filter Nil items"}
        searchPlaceholder={
          inputMode === "add" ? "Capture locally · Enter to add" : "Search · +project @context #tag"
        }
        filterActions={
          <div className="flex flex-wrap gap-2">
            <CycleModeToggle
              value={mode}
              modes={modes}
              {...modeHold.bindings}
              onValueChange={(value) => {
                if (background()) setMode(value)
              }}
              onSecondaryAction={() => {
                if (background()) setTabsOpen(true)
              }}
            />
            <SearchAddToggle
              value={inputMode}
              onValueChange={(value) => {
                if (background()) setInputMode(value)
              }}
            />
            <Button
              variant="outline"
              onClick={() => {
                if (quick.isLive() && background()) {
                  origin.current = document.activeElement as HTMLElement
                  setPalette(true)
                }
              }}
            >
              Quick search
            </Button>
          </div>
        }
        facets={(["contexts", "projects", "tags"] as const).map((key, index) => ({
          id: key,
          kind: "entity",
          label: key,
          allLabel: `All ${key}`,
          options: taxonomy[key].map((id) => ({
            id,
            name: `${index === 0 ? "@" : index === 1 ? "+" : "#"}${id}`,
          })),
          value: index === 0 ? context : index === 1 ? project : tag,
          onChange: index === 0 ? setContext : index === 1 ? setProject : setTag,
        }))}
        columns={columns}
        getRowId={(r) => r.id}
        rowAriaLabel={(r) => `${label(r)} · ${r.id}`}
        density="compact"
        pageSize={50}
        selectable
        selectedIds={selected}
        onSelectionChange={setSelected}
        inspector={{
          mode: "modal",
          selectedId: null,
          onSelect: (id) => {
            if (id !== null) open(id)
          },
          title: label,
          renderBody: () => null,
        }}
        emptyState={
          <p className="p-4">No matching Nil items. Clear filters or add a local capture.</p>
        }
        footer={
          <div
            id="nil-section-list"
            className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-caption"
          >
            <span>Seed 4421 · {reference} · local fixture</span>
            <span role="status" data-testid="nil-notice">
              {notice}
            </span>
            {tab === "Inbox" && (
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={!selected.length}
                  onClick={() => {
                    if (background()) mutate(selected, "process")
                  }}
                >
                  Process selected
                </Button>
                <Button
                  disabled={!selected.length}
                  onClick={() => {
                    if (background()) mutate(selected, "archive")
                  }}
                >
                  Archive selected
                </Button>
                <Button
                  disabled={!selected.length}
                  onClick={() => {
                    if (background()) mutate(selected, "delete")
                  }}
                >
                  Delete selected
                </Button>
              </div>
            )}
          </div>
        }
      />
      {editRecord && accessible && scenario !== "denied" && (
        <NilEditor
          key={`${generation}/${editRecord.id}`}
          open={editorOpen && ids.includes(editRecord.id)}
          record={editRecord}
          ids={ids}
          generation={generation}
          admitted={() => live() && ids.includes(editRecord.id)}
          origin={origin.current}
          fallback={() => row(editRecord.id) ?? root.current}
          onSave={(value) => {
            if (live()) {
              setRecords((current) => current.map((r) => (r.id === value.id ? value : r)))
              setNotice("Local draft saved.")
            }
          }}
          onClose={() => {
            if (live()) setEditorOpen(false)
          }}
          onRecord={(id) => {
            if (live() && ids.includes(id)) {
              setEditing(id)
              setEditorOpen(true)
            }
          }}
        />
      )}
      <SearchPalette
        open={palette}
        onOpenChange={setPalette}
        title="Search Nil"
        query={paletteQuery}
        onQueryChange={setPaletteQuery}
        sourceGeneration={generation}
        accessible={accessible}
        isAdmitted={live}
        showFullscreenToggle
        options={records
          .filter(
            (r) =>
              !r.archived &&
              matches(r, paletteQuery) &&
              (paletteFilter === "all" || r.kind === paletteFilter),
          )
          .map((r) => ({ id: r.id, label: `${label(r)} · ${r.kind}` }))}
        filters={[
          { id: "all", label: "All" },
          { id: "todo", label: "Todos" },
          { id: "note", label: "Notes" },
          { id: "scratch", label: "Scratch" },
        ]}
        filterId={paletteFilter}
        onFilterChange={setPaletteFilter}
        onSelect={(id) => {
          if (live()) {
            const r = records.find((r) => r.id === id)
            if (!r) return
            setTab(r.inbox ? "Inbox" : "All")
            setMode("all")
            setQuery("")
            setContext(null)
            setProject(null)
            setTag(null)
            setCollapsed([])
            setPalette(false)
            setEditing(id)
            setEditorOpen(true)
          }
        }}
        returnFocus={{
          trigger: () => origin.current,
          isAdmitted: live,
          fallbackTarget: () => root.current,
        }}
      />
      <ConfirmDialog
        open={deleteIds.length > 0}
        onOpenChange={(value) => {
          if (!value && live() && deleteIds.length > 0 && ownsPopup(popupOwner("delete")))
            setDeleteIds([])
        }}
        data-nil-owner="delete"
        title="Delete local items?"
        description={`${deleteIds.length} local fixture item(s) will be removed. No backend is connected.`}
        confirmLabel="Delete locally"
        showFullscreenToggle
        onConfirm={() => {
          if (live() && deleteIds.length > 0 && ownsPopup(popupOwner("delete"))) {
            setRecords((current) => current.filter((r) => !deleteIds.includes(r.id)))
            setNotice(`Local delete: ${deleteIds.length} item(s).`)
            setSelected([])
            setDeleteIds([])
          }
        }}
      />
      <InspectionDialog
        open={tabsOpen}
        onOpenChange={(value) => {
          if (live() && tabsOpen && ownsPopup(popupOwner("tabs"))) setTabsOpen(value)
        }}
        data-nil-owner="tabs"
        title="Nil user tabs"
        showFullscreenToggle
      >
        <div className="space-y-3 p-4">
          <p>Local view tabs use shared context filters.</p>
          {["Desk", "Studio"].map((value) => (
            <label key={value} className="block">
              <input
                type="checkbox"
                checked={userTabs.includes(value)}
                onChange={() => {
                  if (live() && tabsOpen && ownsPopup(popupOwner("tabs")))
                    setUserTabs((current) =>
                      current.includes(value)
                        ? current.filter((v) => v !== value)
                        : [...current, value],
                    )
                }}
              />{" "}
              {value}
            </label>
          ))}
        </div>
      </InspectionDialog>
      {menu && menuRecord && (
        <RadialMenu
          open
          label="Nil actions"
          items={menuRecord.kind === "todo" ? todoActions : noteActions}
          position={{ x: menu.x, y: menu.y }}
          sourceGeneration={generation}
          activationGeneration={menu.id}
          accessible={accessible}
          isAdmitted={() => accessible && scenario !== "denied" && ids.includes(menu.id)}
          focusReturn={{
            trigger: menu.target,
            isAdmitted: () => live() && ids.includes(menu.id),
            fallbackTarget: () => root.current,
          }}
          onOpenChange={(value) => {
            if (!value) setMenu(null)
          }}
          onAction={(action) => {
            if (!live()) return
            if (action === "edit" || action === "meta") open(menu.id, "radial")
            else mutate([menu.id], action, "radial")
            setMenu(null)
          }}
        />
      )}
    </div>
  )
}
