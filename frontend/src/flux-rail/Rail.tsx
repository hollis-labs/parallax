import { Button } from "@hollis-labs/design-components"
import { GitBranch, Layers, LayoutGrid, ListTodo, Mail, Package, Settings } from "lucide-react"
import { useId, useRef } from "react"
import { InboxContent, StaticPanel, WidgetsContent, WorkContent } from "./Contents"
import {
  type PanelId,
  type Preferences,
  panels,
  type Scenario,
  visiblePanels,
  type WidgetId,
} from "./model"

const icons = [LayoutGrid, ListTodo, GitBranch, Mail, Package, Layers]
/** Host content only: AppShell alone owns the aside and narrow overlay. */
export function RailHeader({
  source,
  prefs,
  active,
  select,
  settings,
  close,
}: {
  source: string
  prefs: Preferences
  active: PanelId | null
  select: (id: PanelId) => void
  settings: (trigger: HTMLElement) => void
  close: () => void
}) {
  const tabs = visiblePanels(prefs)
  const refs = useRef(new Map<PanelId, HTMLButtonElement>())
  const baseId = useId()
  return (
    <div className="bg-bg" data-flux-rail-source={source}>
      <div className="flex min-h-12 items-center justify-between gap-2 px-3">
        <h2 className="text-sm font-semibold">
          {panels.find((p) => p.id === active)?.label ?? "No enabled panels"}
        </h2>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            aria-label="Rail settings"
            onClick={(e) => settings(e.currentTarget)}
          >
            <Settings className="size-3.5" />
          </Button>
          <Button size="sm" variant="ghost" aria-label="Close rail" onClick={close}>
            Close
          </Button>
        </div>
      </div>
      <div
        role="tablist"
        aria-label="Right rail panels"
        className="flex overflow-x-auto border-t border-border-subtle"
      >
        {tabs.map((id) => {
          const index = panels.findIndex((p) => p.id === id)
          const Icon = icons[index]
          const selected = active === id
          return (
            <button
              key={id}
              ref={(el) => {
                if (el) refs.current.set(id, el)
                else refs.current.delete(id)
              }}
              type="button"
              role="tab"
              id={`${baseId}-${id}`}
              aria-controls={`flux-panel-${id}`}
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-xs focus-visible:outline focus-visible:outline-ring ${selected ? "border-primary text-fg" : "border-transparent text-fg-muted hover:bg-surface"}`}
              onClick={() => select(id)}
              onKeyDown={(e) => {
                if (e.nativeEvent.isComposing || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey)
                  return
                const n = tabs.indexOf(id)
                const target =
                  e.key === "ArrowRight"
                    ? tabs[(n + 1) % tabs.length]
                    : e.key === "ArrowLeft"
                      ? tabs[(n - 1 + tabs.length) % tabs.length]
                      : e.key === "Home"
                        ? tabs[0]
                        : e.key === "End"
                          ? tabs.at(-1)
                          : null
                if (!target) return
                e.preventDefault()
                select(target)
                refs.current.get(target)?.focus()
                refs.current.get(target)?.scrollIntoView({ block: "nearest", inline: "nearest" })
              }}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {panels[index].label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
export function Rail({
  source,
  prefs,
  active,
  scenario,
  collapse,
  inspect,
}: {
  source: string
  prefs: Preferences
  active: PanelId | null
  scenario: Scenario
  collapse: (id: WidgetId, open: boolean) => void
  inspect: (kind: "context" | "session", trigger: HTMLElement) => void
}) {
  return (
    <div
      role="tabpanel"
      id={`flux-panel-${active}`}
      aria-label={panels.find((p) => p.id === active)?.label ?? "No enabled panels"}
      className="min-h-0 min-w-0 [overflow-wrap:anywhere]"
      data-testid="flux-rail-panel"
      data-flux-rail-source={source}
    >
      {active === "widgets" ? (
        <WidgetsContent scenario={scenario} prefs={prefs} collapse={collapse} inspect={inspect} />
      ) : active === "work" ? (
        <WorkContent scenario={scenario} />
      ) : active === "inbox" ? (
        <InboxContent scenario={scenario} />
      ) : active ? (
        <StaticPanel kind={active} scenario={scenario} />
      ) : (
        <p className="p-3 text-xs text-fg-muted">
          All panels disabled. Rail settings remain available.
        </p>
      )}
    </div>
  )
}
