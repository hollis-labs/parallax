import type { LucideIcon } from "lucide-react"
import { ChevronRight, Keyboard, Menu, Palette, Shield, SlidersHorizontal, X } from "lucide-react"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import {
  DEFAULT_LAYOUT_PREFERENCES,
  FIXTURE_TOOL_GRANTS,
  type LayoutPreferences,
  MALFORMED_FIXTURE_PREFERENCES,
  type PermissionMode,
  referenceClock,
  SHORTCUT_DEFS,
  settingsIdentity,
  THEME_CONCRETE_AND_SIGNAL,
  type Theme,
  type ThemeMode,
  type ToolGrantItem,
  validateLayoutPreferences,
} from "./model"
import { AppearanceSection } from "./sections/AppearanceSection"
import { LayoutSection } from "./sections/LayoutSection"
import { PermissionsSection } from "./sections/PermissionsSection"
import { ShortcutsSection } from "./sections/ShortcutsSection"

export type SettingsSectionId = "appearance" | "layout" | "shortcuts" | "permissions"

export interface NavItem {
  id: SettingsSectionId
  label: string
  icon: LucideIcon
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: readonly NavGroup[] = [
  {
    label: "You",
    items: [
      { id: "appearance", label: "Appearance", icon: Palette },
      { id: "layout", label: "Layout", icon: SlidersHorizontal },
      { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
    ],
  },
  {
    label: "System",
    items: [{ id: "permissions", label: "Permissions", icon: Shield }],
  },
]

export function getSectionFromHash(): SettingsSectionId {
  if (typeof window === "undefined") return "appearance"
  const hash = window.location.hash.replace(/^#/, "").toLowerCase()
  if (
    hash === "appearance" ||
    hash === "layout" ||
    hash === "shortcuts" ||
    hash === "permissions"
  ) {
    return hash
  }
  return "appearance"
}

export function useCommittedFrame(): {
  isCommittedLive: () => boolean
  frameToken: object
  checkToken: (t: object) => boolean
} {
  const [store] = useState(() => {
    let currentToken: object | null = null
    return {
      snapshot: () => currentToken,
      subscribe: (notify: () => void) => {
        const token = {}
        currentToken = token
        notify()
        return () => {
          if (currentToken === token) currentToken = null
        }
      },
    }
  })
  const committedToken = useSyncExternalStore(store.subscribe, store.snapshot, () => null)
  const currentRenderToken = {}
  const layoutTokenRef = useRef<object | null>(null)
  useLayoutEffect(() => {
    layoutTokenRef.current = currentRenderToken
    return () => {
      layoutTokenRef.current = null
    }
  })
  return {
    isCommittedLive: () => committedToken !== null && store.snapshot() === committedToken,
    frameToken: currentRenderToken,
    checkToken: (t: object) =>
      committedToken !== null &&
      store.snapshot() === committedToken &&
      layoutTokenRef.current === t,
  }
}

export interface FluxSettingsFrame {
  source: string
  access: boolean
  layer: boolean
  isLive: () => boolean
  activateSection: (target: string) => boolean
  handleSidebarKeyDown: (e: React.KeyboardEvent | KeyboardEvent, index: number) => boolean
}

export interface FluxSettingsDiagnostics {
  identity: string
  referenceClock: string
  activeSection: SettingsSectionId
  activeTheme: string
  activeMode: ThemeMode
  activePreset: string
  permissionMode: PermissionMode
  grantedToolCount: number
  shortcutCount: number
  navItems: string[]
  activateSection: (section: string) => boolean
  setSection: (section: string) => boolean
  handleSidebarKeyDown: (e: React.KeyboardEvent | KeyboardEvent, index: number) => boolean
  fenceStats: {
    activations: number
    refusals: number
    lastRefused: string | null
  }
  source: string
  access: boolean
  layer: boolean
  isLive: () => boolean
  frames: FluxSettingsFrame[]
  currentFrame?: FluxSettingsFrame
  currentCapture?: {
    key: string
    isLive: () => boolean
    captured: string | null
    save: () => boolean
    cancel: () => void
  }
  diagnostics: {
    malformedRejected: boolean
    malformedNotice: string | null
    shortcutsCount: number
    toolsCount: number
    readOnly: boolean
  }
}

declare global {
  interface Window {
    fluxSettings?: FluxSettingsDiagnostics
  }
}

export interface FluxSettingsShellProps {
  initialSection?: SettingsSectionId
  initialTheme?: Theme
  initialMode?: ThemeMode
  initialScenario?: "populated" | "read-only" | "empty-search" | "malformed-fallback"
  portable?: boolean
  source?: string
  access?: boolean
  layer?: boolean
  nested?: boolean
  competing?: boolean
}

export function hasVisibleCompetingOverlay(): boolean {
  if (typeof document === "undefined") return false

  const candidates = document.querySelectorAll<HTMLElement>(
    "[role='dialog'], [role='alertdialog'], [role='menu'], [role='listbox'], [data-competing-popup='true'], [data-competing-layer='true']",
  )

  for (const el of candidates) {
    // 1. If explicitly hidden by standard attribute
    if (el.hasAttribute("hidden")) continue
    if (el.getAttribute("aria-hidden") === "true") continue

    // 2. If data attributes indicate closed or ending state
    if (el.getAttribute("data-closed") === "true" || el.getAttribute("data-closed") === "") continue
    if (el.getAttribute("data-state") === "closed") continue
    if (el.getAttribute("data-ending") === "true" || el.getAttribute("data-ending") === "") continue

    // 3. Ancestor hidden or closed check
    if (el.closest("[hidden], [aria-hidden='true'], [data-closed='true'], [data-state='closed']")) {
      continue
    }

    // 4. Style checks (inline or computed: display: none, visibility: hidden, opacity: 0)
    if (
      el.style.display === "none" ||
      el.style.visibility === "hidden" ||
      el.style.opacity === "0"
    ) {
      continue
    }
    if (typeof window !== "undefined" && typeof window.getComputedStyle === "function") {
      const style = window.getComputedStyle(el)
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
        continue
      }
    }

    // Found an actual visible competing overlay
    return true
  }

  return false
}

export function FluxSettingsShell({
  initialSection,
  initialTheme = THEME_CONCRETE_AND_SIGNAL,
  initialMode = "dark",
  initialScenario = "populated",
  portable = false,
  source: sourceProp,
  access: accessProp,
  layer: layerProp,
  nested = false,
  competing = false,
}: FluxSettingsShellProps) {
  const [sourceEpoch, setEpoch] = useState(0)
  const [accessState, setAccess] = useState(accessProp ?? true)
  const [layerState, setLayer] = useState(layerProp ?? true)

  const effectiveAccess = accessProp !== undefined ? accessProp : accessState
  const effectiveLayer = layerProp !== undefined ? layerProp : layerState
  const currentSource = sourceProp ?? `flux-settings-src-${sourceEpoch}`

  const { frameToken: thisFrameToken, checkToken } = useCommittedFrame()

  const hostLiveRef = useRef({
    source: currentSource,
    access: effectiveAccess,
    layer: effectiveLayer,
  })
  hostLiveRef.current = {
    source: currentSource,
    access: effectiveAccess,
    layer: effectiveLayer,
  }

  const frameSource = currentSource

  const navRef = useRef<HTMLElement>(null)
  const framesRef = useRef<FluxSettingsFrame[]>([])

  const [activeSection, setActiveSection] = useState<SettingsSectionId>(() => {
    return initialSection ?? getSectionFromHash()
  })
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [mode, setMode] = useState<ThemeMode>(initialMode)

  const [malformedNotice, setMalformedNotice] = useState<string | null>(null)
  const [layoutPrefs, setLayoutPrefs] = useState<LayoutPreferences>(() => {
    if (initialScenario === "malformed-fallback") {
      const validated = validateLayoutPreferences(MALFORMED_FIXTURE_PREFERENCES)
      if (!validated.valid) {
        return validated.value
      }
    }
    return DEFAULT_LAYOUT_PREFERENCES
  })

  useEffect(() => {
    if (initialScenario === "malformed-fallback") {
      const validated = validateLayoutPreferences(MALFORMED_FIXTURE_PREFERENCES)
      if (!validated.valid) {
        setMalformedNotice(validated.error ?? "Malformed layout preference rejected")
      }
    }
  }, [initialScenario])

  const [shortcuts, setShortcuts] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    for (const def of SHORTCUT_DEFS) map[def.key] = def.default
    return map
  })
  const [permMode, setPermMode] = useState<PermissionMode>("default")
  const [tools, setTools] = useState<ToolGrantItem[]>(() => {
    if (initialScenario === "empty-search") return []
    return FIXTURE_TOOL_GRANTS
  })
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const isReadOnly = initialScenario === "read-only"

  const [fenceStats, setFenceStats] = useState({
    activations: 1,
    refusals: 0,
    lastRefused: null as string | null,
  })

  const isLive = useCallback(() => {
    // 1. Guard against actual visible competing overlays (dialogs, menus, listboxes)
    if (hasVisibleCompetingOverlay()) return false

    return (
      checkToken(thisFrameToken) &&
      hostLiveRef.current.source === frameSource &&
      hostLiveRef.current.access &&
      hostLiveRef.current.layer &&
      !nested &&
      !competing
    )
  }, [checkToken, thisFrameToken, frameSource, nested, competing])

  const activateSection = useCallback(
    (target: string): boolean => {
      if (!isLive()) {
        // Retained-old refusal: callback called after retirement or loss of access/layer
        setFenceStats((prev) => ({
          ...prev,
          refusals: prev.refusals + 1,
          lastRefused: `retired:${target}`,
        }))
        return false
      }

      const validSections: SettingsSectionId[] = [
        "appearance",
        "layout",
        "shortcuts",
        "permissions",
      ]
      if (!validSections.includes(target as SettingsSectionId)) {
        // Retained-old refusal: refuse uncommitted target, retain current section
        setFenceStats((prev) => ({
          ...prev,
          refusals: prev.refusals + 1,
          lastRefused: target,
        }))
        return false
      }

      const admitted = target as SettingsSectionId
      setActiveSection(admitted)
      if (typeof window !== "undefined") {
        window.location.hash = admitted
      }
      setMobileNavOpen(false)
      setFenceStats((prev) => ({
        ...prev,
        activations: prev.activations + 1,
      }))
      return true
    },
    [isLive],
  )

  // Listen to hash changes for deep linking and back/forward
  useEffect(() => {
    const handleHashChange = () => {
      const fromHash = getSectionFromHash()
      activateSection(fromHash)
    }
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [activateSection])

  // Find active group and item for breadcrumb
  const activeMatch = useMemo(() => {
    for (const group of NAV_GROUPS) {
      const item = group.items.find((i) => i.id === activeSection)
      if (item) return { group, item }
    }
    return { group: NAV_GROUPS[0], item: NAV_GROUPS[0].items[0] }
  }, [activeSection])

  // Roving keyboard navigation in sidebar
  const allNavItems = useMemo(() => NAV_GROUPS.flatMap((g) => g.items), [])

  const handleSidebarKeyDown = useCallback(
    (e: React.KeyboardEvent | KeyboardEvent, index: number): boolean => {
      // 1. Guard admission and live state
      if (!isLive()) return false
      // 2. Guard IME composition and modifiers
      const native = "nativeEvent" in e ? (e as React.KeyboardEvent).nativeEvent : e
      if (native.isComposing || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return false
      // 3. Current-root guard: ensure target is within navRef and navRef is connected
      if (!navRef.current?.isConnected) return false
      const targetNode = (
        "currentTarget" in e && e.currentTarget ? e.currentTarget : e.target
      ) as Node | null
      if (!targetNode || !navRef.current.contains(targetNode)) return false

      let nextIdx = -1
      if (e.key === "ArrowDown") {
        nextIdx = (index + 1) % allNavItems.length
      } else if (e.key === "ArrowUp") {
        nextIdx = (index - 1 + allNavItems.length) % allNavItems.length
      } else if (e.key === "Home") {
        nextIdx = 0
      } else if (e.key === "End") {
        nextIdx = allNavItems.length - 1
      }

      if (nextIdx >= 0) {
        e.preventDefault?.()
        e.stopPropagation?.()
        const target = allNavItems[nextIdx]
        activateSection(target.id)
        const btn = navRef.current?.querySelector<HTMLButtonElement>(
          `button[data-section-id="${target.id}"]`,
        )
        btn?.focus()
        return true
      }
      return false
    },
    [isLive, allNavItems, activateSection],
  )

  // Diagnostics for Playwright testing
  useLayoutEffect(() => {
    const frame: FluxSettingsFrame = {
      source: currentSource,
      access: accessState,
      layer: layerState,
      isLive,
      activateSection,
      handleSidebarKeyDown,
    }
    framesRef.current.push(frame)

    window.fluxSettings = {
      identity: settingsIdentity,
      referenceClock,
      activeSection,
      activeTheme: theme.id,
      activeMode: mode,
      activePreset: layoutPrefs.preset,
      permissionMode: permMode,
      grantedToolCount: tools.filter((t) => t.allowed).length,
      shortcutCount: Object.keys(shortcuts).length,
      navItems: allNavItems.map((i) => i.id),
      activateSection,
      setSection: activateSection,
      handleSidebarKeyDown,
      fenceStats,
      source: currentSource,
      access: accessState,
      layer: layerState,
      isLive,
      frames: framesRef.current,
      currentFrame: frame,
      diagnostics: {
        malformedRejected: malformedNotice !== null,
        malformedNotice,
        shortcutsCount: Object.keys(shortcuts).length,
        toolsCount: tools.length,
        readOnly: isReadOnly,
      },
    }
  })

  return (
    <div
      className="flex flex-col h-full bg-bg text-fg min-h-screen"
      data-flux-settings-shell="true"
      data-active-section={activeSection}
      data-theme={theme.id}
      data-mode={mode}
      data-source={currentSource}
      data-access={accessState ? "admitted" : "denied"}
      data-layer={layerState ? "active" : "inactive"}
      data-portable={portable ? "true" : undefined}
    >
      {/* Top Inspection & Status Bar */}
      <header className="h-10 px-4 border-b border-border-subtle bg-bg-elevated flex items-center justify-between shrink-0 text-xs">
        <div className="flex items-center gap-2">
          {/* Mobile hamburger menu button */}
          <button
            type="button"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="md:hidden p-1 rounded hover:bg-surface text-fg-secondary cursor-pointer"
          >
            {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
          <span className="font-semibold text-fg tracking-tight">Parallax Settings</span>
          <span className="font-mono text-caption text-fg-faint hidden sm:inline">
            (Candidate Flux Recreation)
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Host source/access/layer controls */}
          <div className="flex items-center gap-2 text-xs font-mono text-fg-muted border-r border-border-subtle pr-3">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={accessState}
                onChange={(e) => setAccess(e.target.checked)}
                aria-label="Access admitted"
                className="cursor-pointer"
              />
              <span className="hidden sm:inline">Access</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={layerState}
                onChange={(e) => setLayer(e.target.checked)}
                aria-label="Layer active"
                className="cursor-pointer"
              />
              <span className="hidden sm:inline">Layer</span>
            </label>
            <button
              type="button"
              onClick={() => setEpoch((n) => n + 1)}
              className="px-1.5 py-0.5 rounded-xs bg-surface hover:bg-surface-hover text-fg text-label border border-border-subtle cursor-pointer"
              aria-label="Replace source"
            >
              Replace source
            </button>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-label text-fg-faint">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            <span>Seed 4421</span>
          </div>
          <span className="text-fg-faint">·</span>
          <span className="font-mono text-label text-fg-muted hidden md:inline">
            {referenceClock}
          </span>
        </div>
      </header>

      {/* Main Shell Container */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Navigation Sidebar */}
        <nav
          ref={navRef}
          aria-label="Settings navigation"
          className={`${
            mobileNavOpen
              ? "absolute inset-y-0 left-0 z-40 bg-bg w-64 shadow-xl border-r border-border"
              : "hidden md:flex"
          } md:relative md:w-56 shrink-0 border-r border-border flex flex-col bg-bg-elevated/40`}
        >
          <div className="h-12 px-4 flex items-center border-b border-border-subtle shrink-0">
            <span className="text-control font-semibold text-fg">Settings</span>
          </div>

          <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
            {NAV_GROUPS.map((group) => (
              <div key={group.label} className="space-y-0.5">
                <div className="font-mono text-caption font-semibold uppercase tracking-wider text-fg-secondary px-2.5 py-1">
                  {group.label}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.id
                  const globalIdx = allNavItems.findIndex((i) => i.id === item.id)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      data-section-id={item.id}
                      tabIndex={isActive ? 0 : -1}
                      aria-selected={isActive}
                      onClick={() => activateSection(item.id)}
                      onKeyDown={(e) => handleSidebarKeyDown(e, globalIdx)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-control text-control transition-colors cursor-pointer text-left ${
                        isActive
                          ? "bg-surface text-fg font-medium shadow-xs"
                          : "text-fg-secondary hover:text-fg hover:bg-surface/50"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? "text-brand" : "text-fg-faint"
                        }`}
                      />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </nav>

        {/* Content Area with Breadcrumb Header */}
        <main className="flex-1 flex flex-col min-w-0 bg-bg">
          {/* Malformed layout preference rejection notice */}
          {malformedNotice && (
            <div
              data-testid="malformed-fallback-notice"
              role="alert"
              className="bg-warning-muted border-b border-warning/30 px-6 py-2.5 text-xs text-warning flex items-center justify-between"
            >
              <span>{malformedNotice}</span>
              <span className="font-mono text-caption uppercase">Default layout restored</span>
            </div>
          )}

          {/* Breadcrumb Header */}
          <div className="h-12 px-6 flex items-center gap-1.5 border-b border-border-subtle shrink-0">
            <span className="font-mono text-label text-fg-faint uppercase tracking-wider">
              {activeMatch.group.label}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-fg-faint shrink-0" />
            <span className="text-control text-fg font-medium">{activeMatch.item.label}</span>
          </div>

          {/* Section Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6 pb-20 max-w-4xl w-full mx-auto">
            {activeSection === "appearance" && (
              <AppearanceSection
                theme={theme}
                mode={mode}
                onThemeChange={setTheme}
                onModeChange={setMode}
                readOnly={isReadOnly}
              />
            )}
            {activeSection === "layout" && (
              <LayoutSection
                preferences={layoutPrefs}
                onChange={setLayoutPrefs}
                readOnly={isReadOnly}
              />
            )}
            {activeSection === "shortcuts" && (
              <ShortcutsSection
                shortcuts={shortcuts}
                onChange={setShortcuts}
                readOnly={isReadOnly}
                isLive={isLive}
              />
            )}
            {activeSection === "permissions" && (
              <PermissionsSection
                mode={permMode}
                tools={tools}
                onModeChange={setPermMode}
                onToolsChange={setTools}
                readOnly={isReadOnly}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
