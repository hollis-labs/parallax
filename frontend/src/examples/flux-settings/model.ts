import { createScopedStorage, type ScopedStorage } from "@hollis-labs/design-app-runtime"
import { BUILTIN_THEMES as PUBLIC_BUILTIN_THEMES } from "@hollis-labs/design-tokens"

export const settingsIdentity = "flux-settings/v1:4421:2026-10-04T14:30:00Z"
export const referenceClock = "2026-10-04T14:30:00Z"
export const settingsSeed = 4421

// --- Theme and Token Types ---

export type TokenKey =
  // Surfaces
  | "bg"
  | "bg-elevated"
  | "surface"
  | "surface-hover"
  | "surface-active"
  | "border"
  | "border-subtle"
  // Text
  | "fg"
  | "fg-secondary"
  | "fg-muted"
  | "fg-faint"
  // Brand
  | "brand"
  | "brand-hover"
  | "brand-active"
  | "brand-muted"
  | "brand-fg"
  // Primary
  | "primary"
  | "primary-hover"
  | "primary-active"
  | "primary-muted"
  | "primary-fg"
  // Danger
  | "danger"
  | "danger-hover"
  | "danger-muted"
  | "danger-fg"
  // Info
  | "info"
  | "info-muted"
  // Success
  | "success"
  | "success-muted"
  | "success-fg"
  // Warning
  | "warning"
  | "warning-muted"
  // Selection
  | "selection"
  // Modes
  | "mode-default"
  | "mode-architect"
  | "mode-planner"
  | "mode-writer"
  // Status
  | "status-ok"
  | "status-warn"
  | "status-danger"

export type TokenValues = Record<TokenKey, string>

export interface Theme {
  id: string
  name: string
  description?: string
  author?: string
  version?: string
  builtin?: boolean
  tokens: {
    dark: TokenValues
    light: TokenValues
  }
}

export type ThemeMode = "dark" | "light" | "system"

export interface TokenCategory {
  id: string
  label: string
  description?: string
}

export const TOKEN_CATEGORIES: TokenCategory[] = [
  { id: "surfaces", label: "Surfaces", description: "Backgrounds, panels, and borders" },
  { id: "text", label: "Text", description: "Foreground text hierarchy" },
  { id: "brand", label: "Brand", description: "Brand accent and contrast foreground" },
  { id: "primary", label: "Primary", description: "Standard interactive foreground and accents" },
  { id: "danger", label: "Danger", description: "Destructive actions and critical errors" },
  { id: "warning", label: "Warning", description: "Cautions and rate-limit states" },
  { id: "success", label: "Success", description: "Completion and verified states" },
  { id: "info", label: "Info", description: "Informational callouts and indicators" },
  { id: "selection", label: "Selection", description: "Active and hover item fills" },
  { id: "modes", label: "Agent Modes", description: "Distinct agent discipline colors" },
  { id: "status", label: "Status", description: "Service and worker health indicators" },
]

export interface TokenMeta {
  key: TokenKey
  label: string
  description?: string
  category: string
  allowsAlpha?: boolean
}

export const TOKEN_METAS: TokenMeta[] = [
  { key: "bg", label: "Background", description: "Root app background", category: "surfaces" },
  {
    key: "bg-elevated",
    label: "Elevated Background",
    description: "Cards, modals, popovers",
    category: "surfaces",
  },
  {
    key: "surface",
    label: "Surface",
    description: "Input and secondary card fill",
    category: "surfaces",
  },
  {
    key: "surface-hover",
    label: "Surface Hover",
    description: "Interactive row hover fill",
    category: "surfaces",
  },
  {
    key: "surface-active",
    label: "Surface Active",
    description: "Pressed interactive fill",
    category: "surfaces",
  },
  {
    key: "border",
    label: "Border",
    description: "Primary structural dividers",
    category: "surfaces",
  },
  {
    key: "border-subtle",
    label: "Subtle Border",
    description: "Inner card dividers and table lines",
    category: "surfaces",
  },

  { key: "fg", label: "Foreground", description: "High-contrast reading text", category: "text" },
  {
    key: "fg-secondary",
    label: "Secondary Text",
    description: "Subheadings and navigation labels",
    category: "text",
  },
  { key: "fg-muted", label: "Muted Text", description: "Captions and metadata", category: "text" },
  {
    key: "fg-faint",
    label: "Faint Text",
    description: "Timestamps and subtle hints",
    category: "text",
  },

  {
    key: "brand",
    label: "Brand Signal",
    description: "Signature red signal color",
    category: "brand",
  },
  {
    key: "brand-hover",
    label: "Brand Hover",
    description: "Brand button hover",
    category: "brand",
  },
  {
    key: "brand-active",
    label: "Brand Active",
    description: "Brand button pressed",
    category: "brand",
  },
  {
    key: "brand-muted",
    label: "Brand Muted",
    description: "Subtle brand tint fill",
    category: "brand",
    allowsAlpha: true,
  },
  {
    key: "brand-fg",
    label: "Brand Text",
    description: "Contrast text on brand fill",
    category: "brand",
  },

  {
    key: "primary",
    label: "Primary",
    description: "Active selection and action ink",
    category: "primary",
  },
  {
    key: "primary-hover",
    label: "Primary Hover",
    description: "Primary action hover",
    category: "primary",
  },
  {
    key: "primary-active",
    label: "Primary Active",
    description: "Primary action pressed",
    category: "primary",
  },
  {
    key: "primary-muted",
    label: "Primary Muted",
    description: "Subtle primary tint",
    category: "primary",
    allowsAlpha: true,
  },
  {
    key: "primary-fg",
    label: "Primary Text",
    description: "Contrast text on primary fill",
    category: "primary",
  },

  {
    key: "danger",
    label: "Danger",
    description: "Critical errors and delete actions",
    category: "danger",
  },
  {
    key: "danger-hover",
    label: "Danger Hover",
    description: "Danger action hover",
    category: "danger",
  },
  {
    key: "danger-muted",
    label: "Danger Muted",
    description: "Danger callout fill",
    category: "danger",
    allowsAlpha: true,
  },
  {
    key: "danger-fg",
    label: "Danger Text",
    description: "Contrast text on danger fill",
    category: "danger",
  },

  {
    key: "warning",
    label: "Warning",
    description: "Cautionary alerts and badges",
    category: "warning",
  },
  {
    key: "warning-muted",
    label: "Warning Muted",
    description: "Warning callout fill",
    category: "warning",
    allowsAlpha: true,
  },

  {
    key: "success",
    label: "Success",
    description: "Completed states and checkmarks",
    category: "success",
  },
  {
    key: "success-muted",
    label: "Success Muted",
    description: "Success callout fill",
    category: "success",
    allowsAlpha: true,
  },
  {
    key: "success-fg",
    label: "Success Text",
    description: "Contrast text on success fill",
    category: "success",
  },

  {
    key: "info",
    label: "Info",
    description: "Informational badges and indicators",
    category: "info",
  },
  {
    key: "info-muted",
    label: "Info Muted",
    description: "Info callout fill",
    category: "info",
    allowsAlpha: true,
  },

  {
    key: "selection",
    label: "Selection",
    description: "Hover and selection tint",
    category: "selection",
    allowsAlpha: true,
  },

  {
    key: "mode-default",
    label: "Default Agent",
    description: "Standard assistant badge",
    category: "modes",
  },
  {
    key: "mode-architect",
    label: "Architect Mode",
    description: "System architect badge",
    category: "modes",
  },
  {
    key: "mode-planner",
    label: "Planner Mode",
    description: "Workstream planner badge",
    category: "modes",
  },
  {
    key: "mode-writer",
    label: "Writer Mode",
    description: "Documentation writer badge",
    category: "modes",
  },

  {
    key: "status-ok",
    label: "Status Healthy",
    description: "Service operational green",
    category: "status",
  },
  {
    key: "status-warn",
    label: "Status Warning",
    description: "Service degraded yellow",
    category: "status",
  },
  {
    key: "status-danger",
    label: "Status Error",
    description: "Service outage red",
    category: "status",
  },
]

// Built-in theme definitions sourced directly from @hollis-labs/design-tokens
export const THEME_CONCRETE_AND_SIGNAL: Theme = (PUBLIC_BUILTIN_THEMES.find(
  (t) => t.id === "nanite-default",
) ?? PUBLIC_BUILTIN_THEMES[0]) as unknown as Theme

export const BUILTIN_THEMES: Theme[] = PUBLIC_BUILTIN_THEMES as unknown as Theme[]

// --- Layout Preference Types ---

export type ToolCallDisplayMode = "indicator" | "minimal" | "compact" | "full"

export const TOOL_DISPLAY_OPTIONS: {
  value: ToolCallDisplayMode
  label: string
  description: string
}[] = [
  { value: "indicator", label: "Indicator", description: "Minimal inline status pill only" },
  { value: "minimal", label: "Minimal", description: "Compact single line with name and state" },
  { value: "compact", label: "Compact", description: "Structured card with inputs collapsed" },
  { value: "full", label: "Full", description: "Detailed parameter view and expanded output" },
]

export const DRAWER_RETENTION_OPTIONS = [
  { value: "5", label: "5 minutes" },
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 hour" },
  { value: "-1", label: "Until refresh" },
]

export const BOTTOM_DRAWER_TAB_OPTIONS = [
  { value: "scratchpad", label: "Scratchpad" },
  { value: "terminal-1", label: "Terminal 1" },
  { value: "artifacts", label: "Artifacts" },
  { value: "session-context", label: "Session Context" },
]

export const LAYOUT_PRESETS = {
  focus: { left: false, right: false, chips: false, label: "Focus (zen)" },
  default: { left: true, right: false, chips: true, label: "Default (standard)" },
  workspace: { left: true, right: true, chips: true, label: "Workspace (two rails)" },
  reading: { left: false, right: false, chips: true, label: "Reading (content only)" },
} as const

export type LayoutPresetKey = keyof typeof LAYOUT_PRESETS

export interface LayoutPreferences {
  version: 1
  toolCallDisplayMode: ToolCallDisplayMode
  toolDrawerRetention: number
  defaultBottomDrawerTab: string
  preset: LayoutPresetKey
  headerChipsVisible: boolean
  compactCompanion: boolean
}

export const DEFAULT_LAYOUT_PREFERENCES: LayoutPreferences = {
  version: 1,
  toolCallDisplayMode: "minimal",
  toolDrawerRetention: 15,
  defaultBottomDrawerTab: "scratchpad",
  preset: "default",
  headerChipsVisible: true,
  compactCompanion: false,
}

export const layoutStorageKey = "parallax:flux-settings:layout:v1"

export function parseLayoutPreferences(raw: unknown): LayoutPreferences | null {
  if (!raw || typeof raw !== "object") return null
  const v = raw as Partial<LayoutPreferences>
  if (v.version !== 1) return null
  const validModes: ToolCallDisplayMode[] = ["indicator", "minimal", "compact", "full"]
  const mode = validModes.includes(v.toolCallDisplayMode as ToolCallDisplayMode)
    ? (v.toolCallDisplayMode as ToolCallDisplayMode)
    : "minimal"
  const retention = typeof v.toolDrawerRetention === "number" ? v.toolDrawerRetention : 15
  const tab = typeof v.defaultBottomDrawerTab === "string" ? v.defaultBottomDrawerTab : "scratchpad"
  const preset: LayoutPresetKey =
    typeof v.preset === "string" && Object.hasOwn(LAYOUT_PRESETS, v.preset)
      ? (v.preset as LayoutPresetKey)
      : "default"
  return {
    version: 1,
    toolCallDisplayMode: mode,
    toolDrawerRetention: retention,
    defaultBottomDrawerTab: tab,
    preset,
    headerChipsVisible: v.headerChipsVisible ?? true,
    compactCompanion: v.compactCompanion ?? false,
  }
}

export function layoutPreferencesStorage(): ScopedStorage<LayoutPreferences> {
  return createScopedStorage(layoutStorageKey, { parse: parseLayoutPreferences })
}

// --- Shortcuts Types ---

export interface ShortcutDefinition {
  key: string
  group: "navigation" | "sessions" | "actions"
  label: string
  description: string
  default: string
}

export const SHORTCUT_DEFS: readonly ShortcutDefinition[] = [
  {
    key: "toggle_left_sidebar",
    group: "navigation",
    label: "Toggle Sidebar",
    description: "Show or hide the sessions panel",
    default: "mod+b",
  },
  {
    key: "toggle_right_rail",
    group: "navigation",
    label: "Toggle Widgets",
    description: "Show or hide the widgets panel",
    default: "mod+/",
  },
  {
    key: "next_session",
    group: "navigation",
    label: "Next Session",
    description: "Switch to the next session in the list",
    default: "mod+]",
  },
  {
    key: "prev_session",
    group: "navigation",
    label: "Previous Session",
    description: "Switch to the previous session in the list",
    default: "mod+[",
  },
  {
    key: "toggle_artifacts",
    group: "navigation",
    label: "Toggle Artifacts",
    description: "Show or hide the artifacts drawer",
    default: "mod+.",
  },
  {
    key: "new_session",
    group: "sessions",
    label: "New Chat",
    description: "Create a new chat session",
    default: "mod+n",
  },
  {
    key: "search",
    group: "sessions",
    label: "Search Chats",
    description: "Quick search for chats (double-tap Shift)",
    default: "shift+shift",
  },
  {
    key: "command_palette",
    group: "sessions",
    label: "Command Palette",
    description: "Open the unified command palette",
    default: "mod+k",
  },
  {
    key: "focus_composer",
    group: "actions",
    label: "Focus Composer",
    description: "Jump directly to the message input",
    default: "mod+l",
  },
  {
    key: "bookmark_last",
    group: "actions",
    label: "Bookmark Last",
    description: "Save the last assistant message",
    default: "mod+d",
  },
] as const

export interface PluginShortcut {
  id: string
  label: string
  key: string
  description?: string
}

export const FIXTURE_PLUGIN_SHORTCUTS: PluginShortcut[] = [
  {
    id: "git-review",
    label: "Git Review",
    key: "mod+shift+g",
    description: "Open Git inspection diff drawer",
  },
  {
    id: "terminal-toggle",
    label: "Toggle Dev Terminal",
    key: "mod+`",
    description: "Toggle bottom developer terminal",
  },
]

export const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent)

export function formatKeyBinding(binding: string): string[] {
  if (binding === "shift+shift") {
    return [isMac ? "⇧" : "Shift", isMac ? "⇧" : "Shift"]
  }
  return binding.split("+").map((part) => {
    if (part === "mod") return isMac ? "⌘" : "Ctrl"
    if (part === "shift") return isMac ? "⇧" : "Shift"
    if (part === "alt") return isMac ? "⌥" : "Alt"
    if (part === "space") return "Space"
    return part.toUpperCase()
  })
}

export function parseKeyEvent(e: KeyboardEvent): string | null | undefined {
  // Ignore modifier-only keydowns
  if (["Meta", "Control", "Shift", "Alt"].includes(e.key)) return undefined
  // Ignore IME composition events
  if (e.isComposing || e.keyCode === 229) return undefined

  if (e.key === "Escape") return null // Signal cancel

  const parts: string[] = []
  if (e.metaKey || e.ctrlKey) parts.push("mod")
  if (e.shiftKey) parts.push("shift")
  if (e.altKey) parts.push("alt")

  let key = e.key.toLowerCase()
  if (key === " ") key = "space"
  parts.push(key)

  return parts.join("+")
}

// --- Permissions and Tool Grants Types ---

export type PermissionMode = "default" | "accept-edits" | "plan" | "yolo"

export interface PermissionModeOption {
  value: PermissionMode
  label: string
  description: string
  tone: "neutral" | "info" | "warning" | "danger"
}

export const PERMISSION_MODE_OPTIONS: PermissionModeOption[] = [
  {
    value: "default",
    label: "Default",
    description: "Prompt for destructive and write operations; file reads auto-granted",
    tone: "neutral",
  },
  {
    value: "accept-edits",
    label: "Accept Edits",
    description: "Auto-accept filesystem edits; prompt before running shell commands",
    tone: "info",
  },
  {
    value: "plan",
    label: "Plan (Read-Only)",
    description: "Disallow all filesystem writes, shell executions, and modifications",
    tone: "warning",
  },
  {
    value: "yolo",
    label: "Yolo (Unrestricted)",
    description: "Bypass all execution confirmations; run all tools immediately",
    tone: "danger",
  },
]

export interface ToolGrantItem {
  id: string
  name: string
  description: string
  category: "fs" | "execution" | "network" | "discovery"
  allowed: boolean
  synced: boolean
  risk: "low" | "medium" | "high"
}

export const FIXTURE_TOOL_GRANTS: ToolGrantItem[] = [
  {
    id: "tool-read-file",
    name: "read_file",
    description: "Inspect file contents from the workspace tree",
    category: "fs",
    allowed: true,
    synced: true,
    risk: "low",
  },
  {
    id: "tool-write-file",
    name: "write_file",
    description: "Create or replace files in workspace boundaries",
    category: "fs",
    allowed: true,
    synced: true,
    risk: "medium",
  },
  {
    id: "tool-patch-file",
    name: "patch_file",
    description: "Apply targeted unified diff chunks to workspace files",
    category: "fs",
    allowed: true,
    synced: true,
    risk: "medium",
  },
  {
    id: "tool-run-command",
    name: "run_command",
    description: "Execute bash commands in the workspace environment",
    category: "execution",
    allowed: false,
    synced: true,
    risk: "high",
  },
  {
    id: "tool-git-commit",
    name: "git_commit",
    description: "Create commits on the active branch with message",
    category: "execution",
    allowed: true,
    synced: true,
    risk: "medium",
  },
  {
    id: "tool-web-search",
    name: "web_search",
    description: "Query search indices for public references",
    category: "network",
    allowed: true,
    synced: true,
    risk: "low",
  },
  {
    id: "tool-fetch-url",
    name: "fetch_url",
    description: "Download public documentation via HTTP GET",
    category: "network",
    allowed: false,
    synced: true,
    risk: "medium",
  },
  {
    id: "tool-mcp-gateway",
    name: "mcp_gateway",
    description: "Proxy requests to registered Model Context Protocol sidecars",
    category: "discovery",
    allowed: false,
    synced: false,
    risk: "high",
  },
]

// --- Settings Provenance & Form Admission ---

export type ProvenanceKind = "inherited" | "default" | "explicit" | "custom"

export interface SettingsFieldAdmission<T> {
  value: T
  initialValue: T
  provenance: ProvenanceKind
  isDirty: boolean
  isReadOnly: boolean
  isDisabled: boolean
  error?: string
}

export function createFieldAdmission<T>(
  value: T,
  initialValue: T,
  provenance: ProvenanceKind = "default",
  isReadOnly = false,
  isDisabled = false,
): SettingsFieldAdmission<T> {
  return {
    value,
    initialValue,
    provenance,
    isDirty: JSON.stringify(value) !== JSON.stringify(initialValue),
    isReadOnly,
    isDisabled,
  }
}
