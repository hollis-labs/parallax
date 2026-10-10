import type { CSSProperties } from "react"
import { Activity, useEffect, useLayoutEffect, useRef, useState } from "react"
import type { PermissionMode } from "../model"
import {
  BUILTIN_THEMES,
  DEFAULT_LAYOUT_PREFERENCES,
  FIXTURE_TOOL_GRANTS,
  referenceClock,
  SHORTCUT_DEFS,
  type Theme,
  type ThemeMode,
} from "../model"
import { AppearanceSection } from "../sections/AppearanceSection"
import { LayoutSection } from "../sections/LayoutSection"
import { PermissionsSection } from "../sections/PermissionsSection"
import { type CaptureDiagnostics, ShortcutsSection } from "../sections/ShortcutsSection"
import { plainKey, useAdmission } from "./admission"
import { Manager, type ManagerDiagnostics } from "./Managers"
import {
  compositionIdentity,
  formFixture,
  navigation,
  type Scenario,
  type Section,
  scenarios,
  sectionFromHash,
  sections,
  titles,
} from "./model"
import { Observability } from "./Observability"
import { Preferences, type ReorderDiagnostics } from "./Preferences"
import { type FormDiagnostics, ScalarForm } from "./ScalarForm"
import "./composition.css"

export interface CompositionFrame {
  source: string
  section: Section
  live: () => boolean
  navigate: (section: string) => boolean
  focusSection: (section: string) => boolean
  delayedFocus?: () => boolean
  form?: FormDiagnostics
  manager?: ManagerDiagnostics
  reorder?: ReorderDiagnostics
  capture?: CaptureDiagnostics
}
declare global {
  interface Window {
    fluxSettingsComposition?: CompositionFrame & {
      frames: CompositionFrame[]
      referenceClock: string
      ownerVisualApproved: false
    }
  }
}

export function FluxSettingsComposition({
  initialSection,
  initialScenario = "populated",
  initialTheme = BUILTIN_THEMES[0],
  initialMode = "dark",
  portable = false,
}: {
  initialSection?: Section
  initialScenario?: Scenario
  initialTheme?: Theme
  initialMode?: ThemeMode
  portable?: boolean
}) {
  const [section, setSection] = useState<Section>(() => initialSection ?? sectionFromHash(false))
  const [scenario, setScenario] = useState(initialScenario)
  const [developer, setDeveloper] = useState(false)
  const [epoch, setEpoch] = useState(0)
  const [access, setAccess] = useState(true)
  const [layer, setLayer] = useState(true)
  const [navOpen, setNavOpen] = useState(false)
  const [theme, setTheme] = useState(initialTheme)
  const [mode, setMode] = useState<ThemeMode>(initialMode)
  const [layout, setLayout] = useState(DEFAULT_LAYOUT_PREFERENCES)
  const [permissionMode, setPermissionMode] = useState<PermissionMode>("default")
  const [tools, setTools] = useState([...FIXTURE_TOOL_GRANTS])
  const [notice, setNotice] = useState("")
  const [shortcuts, setShortcuts] = useState<Record<string, string>>(() =>
    Object.fromEntries(SHORTCUT_DEFS.map((s) => [s.key, s.default])),
  )
  const source = `${compositionIdentity}/source-${epoch}/${scenario}`
  const readOnly = scenario === "read-only"
  const { root, live: frameLive } = useAdmission()
  const live = () => frameLive() && access && layer && scenario !== "access-denied"
  const controlsLive = () => frameLive()
  const frames = useRef<CompositionFrame[]>([])
  const details = useRef<Pick<CompositionFrame, "form" | "manager" | "reorder" | "capture">>({})
  const pendingFocus = useRef<{ source: string; section: Section; origin: Element | null } | null>(
    null,
  )
  const delayedFocus = useRef<(() => boolean) | undefined>(undefined)
  const heading = useRef<HTMLHeadingElement>(null)
  const nav = useRef<HTMLElement>(null)
  const available: Section[] = developer
    ? [...sections, "system-prompts", "inspector"]
    : [...sections]
  function navigate(id: string, writeHash = true, focus = false) {
    if (!live() || !available.includes(id as Section)) return false
    if (focus)
      pendingFocus.current = { source, section: id as Section, origin: document.activeElement }
    setSection(id as Section)
    setNavOpen(false)
    setNotice("")
    if (!portable && writeHash && location.hash !== `#${id}`) location.hash = id
    return true
  }
  useEffect(() => {
    if (portable) return
    const changed = () => navigate(sectionFromHash(developer), false)
    window.addEventListener("hashchange", changed)
    return () => window.removeEventListener("hashchange", changed)
  })
  useLayoutEffect(() => {
    const ticket = pendingFocus.current
    if (!ticket || ticket.source !== source || ticket.section !== section) return
    let active = true
    const returnFocus = () => {
      if (!active || !live() || !heading.current?.isConnected) return false
      const foreground = document.activeElement
      // New plain or portaled foreground focus wins. No ancestor-wide popup exemption.
      if (
        foreground !== document.body &&
        foreground !== ticket.origin &&
        foreground !== heading.current
      )
        return false
      heading.current.focus()
      return true
    }
    delayedFocus.current = returnFocus
    const handle = requestAnimationFrame(() => {
      returnFocus()
      pendingFocus.current = null
    })
    return () => {
      active = false
      cancelAnimationFrame(handle)
    }
  })
  useLayoutEffect(() => {
    const published: CompositionFrame = {
      source,
      section,
      live,
      navigate,
      focusSection: (id) => navigate(id, true, true),
      delayedFocus: delayedFocus.current,
      ...details.current,
    }
    frames.current.push(published)
    window.fluxSettingsComposition = {
      ...published,
      frames: frames.current,
      referenceClock,
      ownerVisualApproved: false,
    }
  })
  const publish = <K extends keyof typeof details.current>(
    key: K,
    value: (typeof details.current)[K],
  ) => {
    details.current[key] = value
    if (
      window.fluxSettingsComposition?.source === source &&
      window.fluxSettingsComposition.section === section
    )
      Object.assign(window.fluxSettingsComposition, { [key]: value })
  }
  const tokens = theme.tokens[mode === "light" ? "light" : "dark"]
  const styles = Object.fromEntries(
    Object.entries(tokens).map(([key, value]) => [`--color-${key}`, value]),
  ) as CSSProperties
  const profile = formFixture(
    "profile",
    "Identity and personal preferences",
    {
      display_name: { title: "Display Name", value: "Morgan Fixture" },
      email: { title: "Email", value: "morgan@example.invalid" },
      timezone: {
        title: "Timezone",
        value: "UTC",
        options: ["UTC", "Europe/Berlin", "America/New_York"],
      },
      language: { title: "Language", value: "en", options: ["en", "de", "es"] },
      theme_preference: {
        title: "Theme preference",
        value: "system",
        options: ["system", "light", "dark"],
      },
      reduce_motion: { title: "Reduce Motion", value: false },
      user_context: { title: "User Context", value: "Fictional review workspace" },
      avatar_url: { title: "Avatar", readOnly: true },
    },
    false,
  )
  const unavailable =
    scenario === "loading" ||
    scenario === "error" ||
    scenario === "access-denied" ||
    !access ||
    !layer
  const contentKey = `${source}/${section}/${access}/${layer}`
  return (
    <section
      ref={root}
      className="flux-settings-composition bg-bg text-fg"
      style={styles}
      data-theme={theme.id}
      data-mode={mode}
      aria-label="Flux settings fixture example"
    >
      <header className="flux-composition-top">
        <strong>Flux / Settings</strong>
        <span>Fixture specimen · seed 4421</span>
        <a href="/?example=administration&page=settings">Administration</a>
        <a href="/?view=Review+Workbench">Review lab</a>
        <a href="/flux-settings.html#appearance">Four-section candidate</a>
      </header>
      <details className="flux-review-disclosure">
        <summary>Fixture review controls</summary>
        <section className="flux-review-controls" aria-label="Settings fixture controls">
          <label>
            Appearance{" "}
            <select
              aria-label="Fixture scenario"
              value={scenario}
              onChange={(e) => {
                if (controlsLive()) {
                  setScenario(e.target.value as Scenario)
                  setNotice("Source replaced; prior drafts retired.")
                }
              }}
            >
              {scenarios.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            <input
              type="checkbox"
              checked={developer}
              onChange={(e) => {
                if (!controlsLive()) return
                setDeveloper(e.target.checked)
                if (
                  !e.target.checked &&
                  (section === "system-prompts" || section === "inspector")
                ) {
                  setSection("profile")
                  if (!portable) location.hash = "profile"
                }
              }}
            />
            Developer mode (local)
          </label>
          <button
            type="button"
            onClick={() => {
              if (controlsLive()) {
                setEpoch(epoch + 1)
                setNotice("Reviewed source replaced; prior drafts retired.")
              }
            }}
          >
            Replace fixture source
          </button>
          <button
            type="button"
            aria-pressed={!access}
            onClick={() => {
              if (controlsLive()) setAccess(!access)
            }}
          >
            {access ? "Revoke fixture access" : "Restore fixture access"}
          </button>
          <button
            type="button"
            aria-pressed={!layer}
            onClick={() => {
              if (controlsLive()) setLayer(!layer)
            }}
          >
            {layer ? "Pause fixture layer" : "Resume fixture layer"}
          </button>
        </section>
      </details>
      <p className="flux-specimen-notice">
        Local fixture effects only. No APIs, credentials or plugin execution. Owner review pending.
      </p>
      <div className="flux-composition-layout">
        <div className="flux-navigation-wrap">
          <button
            className="flux-mobile-navigation"
            type="button"
            aria-expanded={navOpen}
            onClick={() => {
              if (live()) setNavOpen(!navOpen)
            }}
          >
            Settings navigation
          </button>
          <nav
            ref={nav}
            className="flux-composition-nav"
            data-open={navOpen}
            aria-label="Grouped Flux settings navigation"
          >
            {navigation.map((group) => (
              <div key={group.label}>
                <h2>{group.label}</h2>
                {[
                  ...group.items,
                  ...(developer && group.label === "AI" ? ["system-prompts" as const] : []),
                  ...(developer && group.label === "System" ? ["inspector" as const] : []),
                ].map((id) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    aria-current={section === id ? "page" : undefined}
                    onClick={(e) => {
                      e.preventDefault()
                      navigate(id, true, true)
                    }}
                    onKeyDown={(e) => {
                      if (!live() || !plainKey(e) || e.target !== e.currentTarget) return
                      const anchors = Array.from(
                          nav.current?.querySelectorAll<HTMLAnchorElement>("a") ?? [],
                        ),
                        i = anchors.indexOf(e.currentTarget),
                        next =
                          e.key === "ArrowDown"
                            ? Math.min(i + 1, anchors.length - 1)
                            : e.key === "ArrowUp"
                              ? Math.max(i - 1, 0)
                              : e.key === "Home"
                                ? 0
                                : e.key === "End"
                                  ? anchors.length - 1
                                  : -1
                      if (next < 0 || !anchors[next]) return
                      e.preventDefault()
                      e.stopPropagation()
                      if (navigate(anchors[next].hash.slice(1))) anchors[next].focus()
                    }}
                  >
                    {titles[id]}
                  </a>
                ))}
              </div>
            ))}
          </nav>
        </div>
        <main className="flux-composition-main">
          <p className="flux-breadcrumb">
            Settings ›{" "}
            {section === "inspector"
              ? "System"
              : section === "system-prompts"
                ? "AI"
                : navigation.find((g) => g.items.some((id) => id === section))?.label}{" "}
            › {titles[section]}
          </p>
          <h1 ref={heading} tabIndex={-1}>
            {titles[section]}
          </h1>
          <p className="flux-source-label">
            Source: {source} · {referenceClock}
          </p>
          <p className="flux-source-label">
            Appearance, Layout, Shortcuts and Permissions are local fixture previews. Other pages
            are inert fictional specimens; editing, reorder, install and configuration actions are
            unavailable.
          </p>
          {unavailable ? (
            <p role={scenario === "error" ? "alert" : "status"}>
              {scenario === "loading"
                ? "Loading fictional settings snapshot; no read request is pending."
                : scenario === "error"
                  ? "Fixture read failure; no successful empty result inferred."
                  : !layer
                    ? "Fixture layer paused. Prior callbacks are retired."
                    : "Fixture access denied. No editable values exposed."}
            </p>
          ) : (
            <div key={contentKey} className="flux-section-content">
              {section === "profile" && (
                <>
                  <p>
                    Identity, locale and agent context. Avatar is absence metadata; no upload or
                    personal file read.
                  </p>
                  <ScalarForm
                    fixture={profile}
                    live={live}
                    readOnly
                    publish={(f) => publish("form", f)}
                  />
                </>
              )}
              {section === "preferences" && (
                <Preferences
                  live={live}
                  readOnly
                  malformed={scenario === "malformed-preferences"}
                  publish={(f) => publish("reorder", f)}
                  publishForm={(f) => publish("form", f)}
                />
              )}
              {section === "appearance" && (
                <AppearanceSection
                  theme={theme}
                  mode={mode}
                  readOnly={readOnly}
                  isLive={live}
                  fixtureOnly
                  onThemeChange={(next) => {
                    if (live() && !readOnly) setTheme(next)
                  }}
                  onModeChange={(next) => {
                    if (live() && !readOnly) setMode(next)
                  }}
                />
              )}
              {section === "layout" && (
                <LayoutSection
                  preferences={layout}
                  readOnly={readOnly}
                  isLive={live}
                  onChange={(next) => {
                    if (live() && !readOnly) setLayout(next)
                  }}
                />
              )}
              {section === "permissions" && (
                <PermissionsSection
                  mode={permissionMode}
                  tools={tools}
                  readOnly={readOnly}
                  isLive={live}
                  onModeChange={(next) => {
                    if (live() && !readOnly) setPermissionMode(next)
                  }}
                  onToolsChange={(next) => {
                    if (live() && !readOnly) setTools(next)
                  }}
                />
              )}
              {section === "shortcuts" && (
                <ShortcutsSection
                  shortcuts={shortcuts}
                  readOnly={readOnly}
                  isLive={live}
                  onChange={(next) => {
                    if (live() && !readOnly) setShortcuts(next)
                  }}
                  onCapture={(f) => publish("capture", f)}
                />
              )}
              {(section === "providers" || section === "agents" || section === "plugins") && (
                <Manager
                  kind={section}
                  live={live}
                  readOnly
                  empty={scenario === "empty"}
                  publish={(f) => publish("manager", f)}
                  publishForm={(f) => publish("form", f)}
                />
              )}
              {section === "observability" && (
                <Observability
                  empty={scenario === "empty"}
                  live={live}
                  readOnly
                  onNotice={(next) => {
                    if (live()) setNotice(next)
                  }}
                />
              )}
              {developer && section === "system-prompts" && (
                <p>
                  Read-only developer specimen: “Use fictional evidence and report uncertainty.” No
                  system prompt mutation.
                </p>
              )}
              {developer && section === "inspector" && (
                <pre>
                  {JSON.stringify(
                    { source, section, access, layer, seed: 4421, referenceClock },
                    null,
                    2,
                  )}
                </pre>
              )}
            </div>
          )}
          <p role="status">{notice}</p>
        </main>
      </div>
    </section>
  )
}

export function StandaloneFluxSettingsComposition() {
  const params = new URLSearchParams(location.search)
  const [visible, setVisible] = useState(true)
  const scenario = scenarios.find((s) => s === params.get("scenario")) ?? "populated"
  const theme = BUILTIN_THEMES.find((t) => t.id === params.get("theme")) ?? BUILTIN_THEMES[0]
  const mode: ThemeMode = params.get("mode") === "light" ? "light" : "dark"
  return (
    <div className="flux-standalone-page">
      <button type="button" className="flux-activity-control" onClick={() => setVisible(!visible)}>
        {visible ? "Hide settings activity" : "Show settings activity"}
      </button>
      <Activity mode={visible ? "visible" : "hidden"}>
        <FluxSettingsComposition
          initialScenario={scenario}
          initialTheme={theme}
          initialMode={mode}
        />
      </Activity>
    </div>
  )
}
