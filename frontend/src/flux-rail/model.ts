/** Finite authored operands, never a provider/session/customer record adapter. */
export const reference = "2026-10-04T14:30:00Z"
export const seed = 4421
export const panels = [
  { id: "widgets", label: "Widgets", builtin: true },
  { id: "work", label: "Plan", builtin: true },
  { id: "workflows", label: "Workflows", builtin: true },
  { id: "inbox", label: "Inbox", builtin: true },
  { id: "artifacts", label: "Artifacts", builtin: true },
  { id: "fixture-plugin", label: "Plugin", builtin: false },
] as const
export type PanelId = (typeof panels)[number]["id"]
export const widgets = [
  "agent",
  "session",
  "context",
  "tokens",
  "tools",
  "workers",
  "observability",
  "bookmarks",
] as const
export type WidgetId = (typeof widgets)[number]
export const scenarios = [
  "populated",
  "zero",
  "known-empty",
  "unknown",
  "unavailable",
  "partial",
  "loading",
  "long-labels",
] as const
export type Scenario = (typeof scenarios)[number]
export const sessions = ["fixture-session-1", "fixture-session-2"] as const
export type FixtureSession = (typeof sessions)[number]
export interface Preferences {
  enabled: Record<PanelId, boolean>
  order: PanelId[]
  defaultPanel: PanelId
  open: Record<WidgetId, boolean>
}
export function defaults(): Preferences {
  return {
    enabled: Object.fromEntries(panels.map((p) => [p.id, p.builtin])) as Preferences["enabled"],
    order: panels.map((p) => p.id),
    defaultPanel: "widgets",
    open: Object.fromEntries(
      widgets.map((id) => [id, id !== "session" && id !== "observability"]),
    ) as Preferences["open"],
  }
}
export function visiblePanels(p: Preferences) {
  return p.order.filter((id) => p.enabled[id])
}
export function resolvePanel(p: Preferences, requested: PanelId): PanelId | null {
  const visible = visiblePanels(p)
  return visible.includes(requested)
    ? requested
    : visible.includes(p.defaultPanel)
      ? p.defaultPanel
      : (visible[0] ?? null)
}
export const preferenceKey = (session: FixtureSession) => `parallax-flux-rail-v1:${session}`
/** Allowlist layout data only. Bad types, duplicates and arbitrary IDs never enter state. */
export function validatePreferences(raw: unknown): Preferences {
  const p = defaults()
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return p
  const r = raw as Record<string, unknown>
  if (r.enabled && typeof r.enabled === "object" && !Array.isArray(r.enabled)) {
    for (const { id } of panels) {
      const value = (r.enabled as Record<string, unknown>)[id]
      if (typeof value === "boolean") p.enabled[id] = value
    }
  }
  if (Array.isArray(r.order)) {
    const admitted = panels.map((p) => p.id)
    const order = [
      ...new Set(r.order.filter((id): id is PanelId => admitted.includes(id as PanelId))),
    ]
    p.order = [...order, ...admitted.filter((id) => !order.includes(id))]
  }
  if (panels.some((p) => p.id === r.defaultPanel)) p.defaultPanel = r.defaultPanel as PanelId
  if (r.open && typeof r.open === "object" && !Array.isArray(r.open)) {
    for (const id of widgets) {
      const value = (r.open as Record<string, unknown>)[id]
      if (typeof value === "boolean") p.open[id] = value
    }
  }
  return p
}
export function readPreferences(session: FixtureSession): Preferences {
  try {
    return validatePreferences(JSON.parse(localStorage.getItem(preferenceKey(session)) ?? "null"))
  } catch {
    return defaults()
  }
}
export function writePreferences(session: FixtureSession, preferences: Preferences) {
  try {
    localStorage.setItem(preferenceKey(session), JSON.stringify(validatePreferences(preferences)))
  } catch {
    /* memory remains usable */
  }
}
export type PanelSource = "agent" | "user"
export interface SignalState {
  active: PanelId
  collapsed: boolean
  dismissed: Partial<Record<PanelId, boolean>>
  sources: Partial<Record<PanelId, PanelSource>>
}
export interface PanelSignal {
  action: "open" | "close" | "mode"
  panel_id?: string
  mode?: string
  source?: PanelSource
}
export function applySignal(
  state: SignalState,
  prefs: Preferences,
  signal: PanelSignal,
): SignalState {
  if (signal.action === "mode") {
    if (signal.mode !== "planning") return state
    return ["work", "workflows"].reduce(
      (s, id) => applySignal(s, prefs, { action: "open", panel_id: id, source: signal.source }),
      state,
    )
  }
  const id = panels.find((p) => p.id === signal.panel_id)?.id
  if (!id || !prefs.enabled[id]) return state
  const source = signal.source ?? "agent"
  if (signal.action === "open") {
    if (source === "agent" && state.dismissed[id]) return state
    return {
      ...state,
      active: id,
      collapsed: false,
      dismissed: { ...state.dismissed, ...(source === "user" ? { [id]: false } : {}) },
      sources: { ...state.sources, [id]: state.sources[id] === "user" ? "user" : source },
    }
  }
  if (signal.action !== "close" || (source === "agent" && state.sources[id] === "user"))
    return state
  return {
    ...state,
    collapsed: state.active === id ? true : state.collapsed,
    dismissed: { ...state.dismissed, ...(source === "user" ? { [id]: true } : {}) },
    sources: { ...state.sources, [id]: undefined },
  }
}
export function operand(scenario: Scenario) {
  const withheld = ["unknown", "unavailable", "loading"].includes(scenario)
  const empty = scenario === "known-empty"
  const zero = empty || scenario === "zero"
  return {
    scenario,
    withheld,
    empty,
    total: withheld || scenario === "partial" ? null : zero ? 0 : 8000,
    ceiling: withheld ? null : 32000,
    input: withheld ? null : zero ? 0 : 6000,
    output: withheld || scenario === "partial" ? null : zero ? 0 : 2000,
    cost: withheld || scenario === "partial" ? null : 0,
    messages: withheld ? null : zero ? 0 : 4,
    model: withheld || scenario === "partial" ? null : "Fixture model",
    name:
      scenario === "long-labels"
        ? `Fictional inspection ${"bounded-identity/".repeat(12)}`
        : "Fictional inspection",
    tools: withheld ? null : empty ? [] : ["fixture.read"],
    workers: withheld ? null : empty ? [] : ["Fixture worker · running · light"],
    bookmarks: withheld ? null : empty ? [] : ["Review the fictional context boundary"],
    executions: withheld || scenario === "partial" ? null : empty ? [] : [240, 280, 260, 300],
  }
}
export const metric = (n: number | null, suffix = "") =>
  n === null ? "Unknown" : `${n.toLocaleString("en-US")}${suffix}`
export const costLabel = (n: number | null) => (n === null ? "Unknown" : `$${n.toFixed(2)}`)
