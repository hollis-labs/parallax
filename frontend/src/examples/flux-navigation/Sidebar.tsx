import { ContextMenu } from "@base-ui/react/context-menu"
import {
  Button,
  Combobox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  isComposingEvent,
  matchExactModifiers,
  resolveAdmittedFocusTarget,
} from "@hollis-labs/design-components"
import {
  Archive,
  Bot,
  ChevronDown,
  ChevronRight,
  Clock3,
  MessageSquare,
  Pencil,
  Pin,
  Plus,
  Puzzle,
  Search,
  Settings,
  SquareTerminal,
  User,
} from "lucide-react"
import { type KeyboardEvent, useRef, useState } from "react"
import { relativeTime, type SessionRow, treeSections } from "./model"

export type SidebarProps = {
  rows: readonly SessionRow[]
  selected: string
  query: string
  scope: string | null
  showArchived: boolean
  status: "ready" | "empty" | "loading" | "unavailable" | "denied"
  editable: boolean
  admitted: () => boolean
  onQuery: (query: string) => void
  onScope: (scope: string | null) => void
  onSelect: (row: SessionRow) => void
  onArchiveVisibility: () => void
  onIntent: (action: string, row?: SessionRow) => void
  onLayer: (open: boolean) => void
}
export function FluxSidebar(props: SidebarProps) {
  const { rows, selected, query, scope, status, editable, admitted, onIntent } = props
  const root = useRef<HTMLElement>(null)
  const search = useRef<HTMLInputElement>(null)
  const [active, setActive] = useState(selected)
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set())
  const [menu, setMenu] = useState<string | null>(null)
  const sections = treeSections(rows)
  const byId = new Map(rows.map((row) => [row.id, row]))
  const visible = sections.flat().filter(({ row }) => {
    const seen = new Set([row.id])
    let parent = row.parent
    while (parent && !seen.has(parent)) {
      if (collapsed.has(parent)) return false
      seen.add(parent)
      parent = byId.get(parent)?.parent ?? null
    }
    return true
  })
  const tabStop = visible.some((item) => item.row.id === active) ? active : visible[0]?.row.id
  function focus(id: string | undefined) {
    if (!id || !admitted()) return
    setActive(id)
    root.current?.querySelector<HTMLElement>(`[data-row="${id}"]`)?.focus()
  }
  function collapse(id: string, value: boolean) {
    if (!admitted()) return
    setCollapsed((previous) => {
      const next = new Set(previous)
      if (value) next.add(id)
      else next.delete(id)
      return next
    })
  }
  function keyboard(event: KeyboardEvent<HTMLElement>, row: SessionRow) {
    if (
      event.target !== event.currentTarget ||
      event.defaultPrevented ||
      isComposingEvent(event) ||
      !matchExactModifiers(event.nativeEvent) ||
      !admitted()
    )
      return
    const index = visible.findIndex((item) => item.row.id === row.id)
    const child = visible.find((item) => item.row.parent === row.id)
    const hasChildren = rows.some((item) => item.parent === row.id)
    switch (event.key) {
      case "ArrowDown":
        focus(visible[Math.min(index + 1, visible.length - 1)]?.row.id)
        break
      case "ArrowUp":
        focus(visible[Math.max(index - 1, 0)]?.row.id)
        break
      case "Home":
        focus(visible[0]?.row.id)
        break
      case "End":
        focus(visible.at(-1)?.row.id)
        break
      case "ArrowRight":
        if (hasChildren && collapsed.has(row.id)) collapse(row.id, false)
        else focus(child?.row.id)
        break
      case "ArrowLeft":
        if (hasChildren && !collapsed.has(row.id)) collapse(row.id, true)
        else focus(row.parent ?? undefined)
        break
      case "Enter":
      case " ":
        props.onSelect(row)
        break
      case "F2":
        if (editable) onIntent("Rename", row)
        break
      default:
        return
    }
    event.preventDefault()
    event.stopPropagation()
  }
  function action(label: string, row?: SessionRow) {
    if (!admitted() || !editable) return
    onIntent(label, row)
  }
  return (
    <nav ref={root} className="flux-left-rail" aria-label="Flux session navigation">
      <div className="flux-scope">
        <Combobox
          ariaLabel="Project scope"
          value={scope}
          onChange={(value) => {
            if (admitted()) props.onScope(value)
          }}
          clearable
          clearLabel="All Chats"
          placeholder="All Chats"
          searchPlaceholder="Search projects…"
          items={[
            { value: "boundary", label: "Boundary review" },
            { value: "fixture", label: "Fixture lab" },
          ]}
        />
      </div>
      <div className="flux-rail-actions">
        <Button size="sm" disabled={!editable} onClick={() => action("New chat")}>
          <Plus className="size-3.5" />
          New chat <kbd>Mod N</kbd>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            if (admitted()) search.current?.focus()
          }}
        >
          <Search className="size-3.5" />
          Search chats
        </Button>
        <Button size="sm" variant="ghost" onClick={() => action("Workspace")} disabled={!editable}>
          Workspace specimen
        </Button>
        <label className="text-caption text-fg-muted">
          Search sessions
          <input
            ref={search}
            aria-label="Search chat sessions"
            value={query}
            disabled={status === "denied"}
            onChange={(event) => {
              if (admitted()) props.onQuery(event.target.value)
            }}
            className="mt-1 w-full text-xs"
          />
        </label>
      </div>
      <div className="flux-tree-scroll">
        {status === "loading" ? (
          <div role="status" className="space-y-3 p-3">
            Loading session tree · count Unknown
            {["a", "b", "c", "d"].map((key) => (
              <div key={key} className="h-4 rounded-sm bg-surface" />
            ))}
          </div>
        ) : status === "unavailable" || status === "denied" ? (
          <p role="status" className="p-4">
            {status}: session records withheld · count Unknown
          </p>
        ) : !rows.length ? (
          <div className="p-4 text-xs">
            <MessageSquare className="mb-3 size-5 text-fg-muted" />
            <strong>{query || scope ? "No matching chats" : "No chats yet"}</strong>
            <p className="mt-2 text-fg-muted">
              {query || scope
                ? "Clear search or change project scope."
                : "New chat opens a local specimen only."}
            </p>
          </div>
        ) : (
          <div role="tree" aria-label="Pinned and recent sessions">
            {sections.map((section, sectionIndex) => (
              // biome-ignore lint/a11y/useSemanticElements: ARIA tree group is not a form fieldset.
              <div
                key={sectionIndex === 0 ? "pinned" : "recent"}
                role="group"
                aria-label={sectionIndex === 0 ? "Pinned" : "Recent"}
              >
                {section.length > 0 && (
                  <div className="flux-section-title">
                    {sectionIndex === 0 ? (
                      <Pin className="size-3" />
                    ) : (
                      <Clock3 className="size-3" />
                    )}
                    {sectionIndex === 0 ? "Pinned" : "Recent"}
                    <span>{section.length}</span>
                  </div>
                )}
                {section
                  .filter((item) => visible.includes(item))
                  .map(({ row, depth, missingParent }) => {
                    const Icon =
                      row.kind === "api" ? MessageSquare : row.kind === "cli" ? SquareTerminal : Bot
                    const children = rows.some((item) => item.parent === row.id)
                    const actions = [
                      "Rename",
                      row.pinned ? "Unpin" : "Pin",
                      row.activity === "archived" ? "Unarchive" : "Archive",
                      "Hide",
                      "Delete",
                      "Plugin action",
                    ]
                    return (
                      <ContextMenu.Root
                        key={row.id}
                        open={menu === row.id}
                        onOpenChange={(open) => {
                          if (!admitted()) return
                          setMenu(open ? row.id : null)
                          props.onLayer(open)
                        }}
                      >
                        <ContextMenu.Trigger
                          role="treeitem"
                          aria-label={`${row.title} · ${row.kind} · ${row.activity} · ${relativeTime(row.time)}`}
                          aria-selected={selected === row.id}
                          aria-level={depth + 1}
                          aria-expanded={children ? !collapsed.has(row.id) : undefined}
                          tabIndex={tabStop === row.id ? 0 : -1}
                          data-row={row.id}
                          data-depth={depth}
                          data-activity={row.activity}
                          className="flux-session-row group"
                          onFocus={() => {
                            if (admitted()) setActive(row.id)
                          }}
                          onKeyDown={(event) => keyboard(event, row)}
                          onClick={(event) => {
                            if (event.target instanceof Element && event.target.closest("button"))
                              return
                            if (admitted()) props.onSelect(row)
                          }}
                        >
                          <span className="flux-row-kind">
                            <span
                              className={`flux-activity flux-activity-${row.activity}`}
                              title={row.activity}
                            />
                            <Icon className="size-3.5" />
                          </span>
                          {children && (
                            <button
                              type="button"
                              tabIndex={-1}
                              className="flux-expander"
                              aria-label={`${collapsed.has(row.id) ? "Expand" : "Collapse"} ${row.title}`}
                              onClick={() => collapse(row.id, !collapsed.has(row.id))}
                            >
                              {collapsed.has(row.id) ? (
                                <ChevronRight className="size-3" />
                              ) : (
                                <ChevronDown className="size-3" />
                              )}
                            </button>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flux-row-title">{row.title}</div>
                            <div className="flux-row-meta">
                              {row.kind} ·{" "}
                              {missingParent
                                ? "Parent unavailable"
                                : depth
                                  ? "Child session"
                                  : "Local fixture"}
                            </div>
                          </div>
                          <time dateTime={row.time} className="flux-row-time">
                            {relativeTime(row.time)}
                          </time>
                          <span className="flux-hover-actions">
                            {[
                              { label: "Rename", Icon: Pencil },
                              { label: row.pinned ? "Unpin" : "Pin", Icon: Pin },
                              {
                                label: row.activity === "archived" ? "Unarchive" : "Archive",
                                Icon: Archive,
                              },
                            ].map(({ label, Icon: ActionIcon }) => (
                              <button
                                key={label}
                                type="button"
                                aria-label={`${label} ${row.title}`}
                                disabled={!editable}
                                onClick={() => action(label, row)}
                              >
                                <ActionIcon className="size-3" />
                              </button>
                            ))}
                          </span>
                        </ContextMenu.Trigger>
                        <ContextMenu.Portal>
                          <ContextMenu.Positioner className="z-50" sideOffset={4}>
                            <ContextMenu.Popup
                              className="flux-context-menu"
                              finalFocus={() =>
                                resolveAdmittedFocusTarget({
                                  trigger: root.current?.querySelector<HTMLElement>(
                                    `[data-row="${row.id}"]`,
                                  ),
                                  isAdmitted: () => admitted(),
                                  fallbackTarget: search.current,
                                })
                              }
                            >
                              {actions.map((label) => (
                                <ContextMenu.Item
                                  key={label}
                                  disabled={!editable}
                                  className={`flux-menu-item ${label === "Delete" ? "text-danger" : ""}`}
                                  onClick={() => action(label, row)}
                                >
                                  {label} specimen
                                </ContextMenu.Item>
                              ))}
                            </ContextMenu.Popup>
                          </ContextMenu.Positioner>
                        </ContextMenu.Portal>
                      </ContextMenu.Root>
                    )
                  })}
              </div>
            ))}
          </div>
        )}
      </div>
      <footer className="flux-rail-footer">
        <DropdownMenu onOpenChange={props.onLayer}>
          <DropdownMenuTrigger disabled={!editable} render={<Button variant="ghost" size="sm" />}>
            <User className="size-4" />
            Alex · fictional
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {["Profile", "Switch account", "Sign out"].map((label) => (
              <DropdownMenuItem key={label} onClick={() => action(label)}>
                {label} specimen
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Settings specimen"
          disabled={!editable}
          onClick={() => action("Settings")}
        >
          <Settings className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-label="Footer plugin specimen"
          disabled={!editable}
          onClick={() => action("Footer plugin action")}
        >
          <Puzzle className="size-4" />
        </Button>
        <label className="col-span-3 flex items-center gap-2 text-caption">
          <input
            type="checkbox"
            checked={props.showArchived}
            onChange={() => {
              if (admitted()) props.onArchiveVisibility()
            }}
          />
          Show archived
        </label>
      </footer>
    </nav>
  )
}
