import { Copy, Download, RotateCcw, Sparkles, X } from "lucide-react"
import type { CSSProperties } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useCommittedFrame } from "../committed-frame"
import {
  BUILTIN_THEMES,
  THEME_CONCRETE_AND_SIGNAL,
  type Theme,
  type ThemeMode,
  TOKEN_CATEGORIES,
  TOKEN_METAS,
  type TokenKey,
  type TokenValues,
} from "../model"
import { PanelHeader, SCard, SRow, SSelect, ThemeSeg } from "../primitives"

// Common color swatches dynamically derived from public builtin themes
const SNAP_SWATCHES = Array.from(
  new Set(
    BUILTIN_THEMES.flatMap((t) => [
      ...Object.values(t.tokens.dark),
      ...(t.tokens.light ? Object.values(t.tokens.light) : []),
    ]).filter((val) => typeof val === "string" && val.startsWith("#") && val.length === 7),
  ),
).slice(0, 20)

interface AppearanceSectionProps {
  theme: Theme
  mode: ThemeMode
  onThemeChange: (theme: Theme) => void
  onModeChange: (mode: ThemeMode) => void
  readOnly?: boolean
  isLive?: () => boolean
  fixtureOnly?: boolean
}

export function AppearanceSection({
  theme,
  mode,
  onThemeChange,
  onModeChange,
  readOnly = false,
  isLive,
  fixtureOnly = false,
}: AppearanceSectionProps) {
  const { frameToken, checkToken } = useCommittedFrame()
  const admitted = () => checkToken(frameToken) && (!isLive || isLive())
  const [exportNotice, setExportNotice] = useState("")
  const [draft, setDraft] = useState<Theme>(theme)
  const [activeTab, setActiveTab] = useState<"preview" | "tokens">("preview")
  const [openTokenKey, setOpenTokenKey] = useState<TokenKey | null>(null)
  const [colorInput, setColorInput] = useState<string>("")
  const [customThemes, setCustomThemes] = useState<Theme[]>([])

  useEffect(() => {
    setDraft(theme)
  }, [theme])

  const resolvedMode: "dark" | "light" = useMemo(() => {
    if (mode === "system") {
      if (fixtureOnly) return "dark"
      if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      }
      return "dark"
    }
    return mode
  }, [mode, fixtureOnly])

  const activeTokens: TokenValues = draft.tokens[resolvedMode]
  const isBuiltin = !!draft.builtin
  const isDirty = useMemo(
    () => JSON.stringify(draft.tokens) !== JSON.stringify(theme.tokens),
    [draft.tokens, theme.tokens],
  )

  const allThemes = useMemo(() => [...BUILTIN_THEMES, ...customThemes], [customThemes])

  const customThemeSeqRef = useRef(0)

  const handleSelectTheme = (id: string) => {
    if (readOnly || !admitted()) return
    const selected = allThemes.find((t) => t.id === id)
    if (selected) {
      onThemeChange(selected)
      setDraft(selected)
    }
  }

  const handleDuplicate = () => {
    if (readOnly || !admitted()) return
    customThemeSeqRef.current += 1
    const copyId = `custom-${draft.id}-4421-${customThemeSeqRef.current}`
    const copy: Theme = {
      ...draft,
      id: copyId,
      name: `${draft.name} (Custom)`,
      builtin: false,
      tokens: {
        dark: { ...draft.tokens.dark },
        light: { ...(draft.tokens.light ?? draft.tokens.dark) },
      },
    }
    setCustomThemes((prev) => [...prev, copy])
    onThemeChange(copy)
    setDraft(copy)
  }

  const handleReset = () => {
    if (readOnly || !admitted()) return
    setDraft(theme)
    onThemeChange(theme)
  }

  const handleResetToDefault = () => {
    if (readOnly || !admitted()) return
    setDraft(THEME_CONCRETE_AND_SIGNAL)
    onThemeChange(THEME_CONCRETE_AND_SIGNAL)
  }

  const handleTokenChange = (key: TokenKey, value: string) => {
    if (isBuiltin || readOnly || !admitted()) return
    const updated: Theme = {
      ...draft,
      tokens: {
        ...draft.tokens,
        [resolvedMode]: {
          ...draft.tokens[resolvedMode],
          [key]: value,
        },
      },
    }
    setDraft(updated)
  }

  const handleExport = () => {
    if (!admitted()) return
    if (fixtureOnly) {
      setExportNotice("Theme export preview retained locally; no file downloaded.")
      return
    }
    const json = JSON.stringify(draft, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${draft.id}-theme.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div
      className="space-y-6"
      data-section="appearance"
      style={
        fixtureOnly
          ? (Object.fromEntries(
              Object.entries(activeTokens).map(([key, value]) => [`--color-${key}`, value]),
            ) as CSSProperties)
          : undefined
      }
    >
      <PanelHeader
        title="Appearance"
        description="Theme palettes, live token specimen preview, and token-bound color editing."
        action={
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={readOnly}
              onClick={handleDuplicate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-medium border border-border-subtle bg-surface text-fg hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-fg-secondary" />
              Duplicate
            </button>
            <button
              type="button"
              disabled={!isDirty || readOnly}
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-medium border border-border-subtle bg-surface text-fg hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-fg-secondary" />
              Revert
            </button>
            <button
              type="button"
              disabled={(draft.id === THEME_CONCRETE_AND_SIGNAL.id && !isDirty) || readOnly}
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-medium border border-border-subtle bg-surface text-fg hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-fg-secondary" />
              Default
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-medium border border-border-subtle bg-surface text-fg hover:bg-surface-hover cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-fg-secondary" />
              Export
            </button>
          </div>
        }
      />

      {fixtureOnly && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!isDirty || readOnly}
            onClick={() => {
              if (
                !admitted() ||
                readOnly ||
                !isDirty ||
                Object.values(draft.tokens[resolvedMode]).some((v) => !CSS.supports("color", v))
              )
                return
              onThemeChange(draft)
              setExportNotice("Theme saved to this local fixture only.")
            }}
          >
            Save theme fixture
          </button>
          <p role="status">{exportNotice}</p>
        </div>
      )}
      {/* Theme Selection Card */}
      <SCard title="Active Theme" meta={isBuiltin ? "Built-in (Read-only)" : "Custom (Editable)"}>
        <SRow
          label="Theme Palette"
          description={draft.description ?? "Active semantic color scheme"}
        >
          <div className="flex items-center gap-3">
            <SSelect
              aria-label="Theme Palette"
              value={draft.id}
              options={allThemes.map((t) => ({ value: t.id, label: t.name }))}
              onChange={handleSelectTheme}
              disabled={readOnly}
              width="w-56"
            />
            {isDirty && (
              <span className="font-mono text-label text-warning bg-warning-muted px-2 py-0.5 rounded-sm">
                Unsaved edits
              </span>
            )}
          </div>
        </SRow>
        <SRow label="Color Mode" description="Light, Dark, or snap to Operating System preference">
          <ThemeSeg
            value={mode}
            onChange={(next) => {
              if (admitted() && !readOnly) onModeChange(next)
            }}
          />
        </SRow>
      </SCard>

      {/* Tab bar between Preview and Token Editor */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              if (admitted()) setActiveTab("preview")
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-control cursor-pointer transition-colors ${
              activeTab === "preview"
                ? "bg-surface text-fg shadow-xs"
                : "text-fg-muted hover:text-fg"
            }`}
          >
            Live Token Preview
          </button>
          <button
            type="button"
            onClick={() => {
              if (admitted()) setActiveTab("tokens")
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-control cursor-pointer transition-colors ${
              activeTab === "tokens"
                ? "bg-surface text-fg shadow-xs"
                : "text-fg-muted hover:text-fg"
            }`}
          >
            Token-Bound Editor ({TOKEN_METAS.length})
          </button>
        </div>

        {isBuiltin && (
          <div className="text-label text-fg-faint flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-brand" />
            Duplicate theme to enable direct color modification
          </div>
        )}
      </div>

      {/* Live Token Preview */}
      {activeTab === "preview" && (
        <div className="space-y-4">
          <SCard
            title="Visual Hierarchy Preview"
            description="Real tokens rendered in application structures"
          >
            <div className="p-4 space-y-5 bg-bg/50">
              {/* Typography */}
              <div>
                <div className="text-label font-mono uppercase tracking-wider text-fg-faint mb-2">
                  Typography Scale
                </div>
                <div className="space-y-1 rounded-lg p-3 border border-border-subtle bg-bg">
                  <div className="text-sm font-semibold text-fg">Primary Heading (text-fg)</div>
                  <div className="text-xs text-fg-secondary">
                    Secondary contextual label (text-fg-secondary)
                  </div>
                  <div className="text-xs text-fg-muted">
                    Muted explanatory description (text-fg-muted)
                  </div>
                  <div className="text-label text-fg-faint font-mono">
                    Faint timestamp or hash (text-fg-faint)
                  </div>
                </div>
              </div>

              {/* Surface Ladder */}
              <div>
                <div className="text-label font-mono uppercase tracking-wider text-fg-faint mb-2">
                  Surface Elevation Ladder
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-bg border border-border-subtle p-3 text-xs text-fg">
                    <span className="font-mono text-caption text-fg-muted block mb-1">bg</span>
                    App baseline
                  </div>
                  <div className="rounded-lg bg-bg-elevated border border-border-subtle p-3 text-xs text-fg shadow-xs">
                    <span className="font-mono text-caption text-fg-muted block mb-1">
                      bg-elevated
                    </span>
                    Cards & panels
                  </div>
                  <div className="rounded-lg bg-surface border border-border p-3 text-xs text-fg">
                    <span className="font-mono text-caption text-fg-muted block mb-1">surface</span>
                    Interactive controls
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div>
                <div className="text-label font-mono uppercase tracking-wider text-fg-faint mb-2">
                  Action Buttons
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-control text-xs font-medium bg-primary text-primary-fg hover:bg-primary-hover active:bg-primary-active cursor-pointer"
                  >
                    Primary Action
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-control text-xs font-medium bg-surface text-fg border border-border-subtle hover:bg-surface-hover cursor-pointer"
                  >
                    Secondary
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-control text-xs font-medium bg-brand text-brand-fg hover:bg-brand-hover active:bg-brand-active cursor-pointer"
                  >
                    Brand Signal
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-control text-xs font-medium bg-danger text-danger-fg hover:bg-danger-hover cursor-pointer"
                  >
                    Danger Delete
                  </button>
                </div>
              </div>

              {/* Status Badges */}
              <div>
                <div className="text-label font-mono uppercase tracking-wider text-fg-faint mb-2">
                  Status Signals
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-success" />
                    <span className="text-success font-medium">Ready / Passed</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-info" />
                    <span className="text-info font-medium">CLI Running</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-warning" />
                    <span className="text-warning font-medium">Approval Required</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-danger" />
                    <span className="text-danger font-medium">Execution Failed</span>
                  </span>
                </div>
              </div>

              {/* Scoped Dark Composer for Concrete & Signal (F1 from Spec) */}
              <div>
                <div className="text-label font-mono uppercase tracking-wider text-fg-faint mb-2">
                  Scoped Dark Composer (Concrete & Signal Signature)
                </div>
                <div
                  className="rounded-panel border border-border-subtle p-3 space-y-2"
                  style={{
                    backgroundColor: draft.tokens.dark["bg-elevated"] ?? "var(--color-bg-elevated)",
                    borderColor: draft.tokens.dark.border ?? "var(--color-border)",
                    color: draft.tokens.dark.fg ?? "var(--color-fg)",
                  }}
                >
                  <div className="text-xs font-mono text-fg-secondary flex items-center justify-between">
                    <span>Message composer preview</span>
                    <span className="text-caption text-brand font-sans bg-brand-muted px-1.5 py-0.5 rounded-sm">
                      Scoped Dark Reference
                    </span>
                  </div>
                  <div
                    className="rounded-control border border-border-subtle p-2 text-xs font-mono"
                    style={{
                      backgroundColor: draft.tokens.dark.bg ?? "var(--color-bg)",
                      color: draft.tokens.dark["fg-secondary"] ?? "var(--color-fg-secondary)",
                    }}
                  >
                    Ask a question or type / for commands…
                  </div>
                </div>
              </div>
            </div>
          </SCard>
        </div>
      )}

      {/* Token-Bound Color Editor */}
      {activeTab === "tokens" && (
        <div className="space-y-4">
          {TOKEN_CATEGORIES.map((cat) => {
            const tokens = TOKEN_METAS.filter((t) => t.category === cat.id)
            if (tokens.length === 0) return null
            return (
              <SCard key={cat.id} title={cat.label} description={cat.description}>
                <div className="divide-y divide-border-subtle">
                  {tokens.map((meta) => {
                    const value = activeTokens[meta.key] ?? ""
                    const isOpen = openTokenKey === meta.key
                    return (
                      <div
                        key={meta.key}
                        className="relative flex items-center gap-3 px-4 py-2.5 hover:bg-surface/20 transition-colors"
                      >
                        {/* Swatch Button */}
                        <button
                          type="button"
                          disabled={isBuiltin || readOnly}
                          onClick={() => {
                            if (!admitted() || readOnly || isBuiltin) return
                            if (isOpen) {
                              setOpenTokenKey(null)
                            } else {
                              setOpenTokenKey(meta.key)
                              setColorInput(value)
                            }
                          }}
                          className="w-7 h-7 rounded-control border border-border shrink-0 shadow-inner disabled:cursor-not-allowed cursor-pointer relative"
                          style={{ backgroundColor: value }}
                          title={
                            isBuiltin
                              ? "Theme is read-only (duplicate to edit)"
                              : "Click to edit token"
                          }
                        />

                        {/* Label & Description */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs font-medium text-fg">{meta.label}</span>
                            <code className="text-label font-mono text-fg-faint">
                              --c-{meta.key}
                            </code>
                          </div>
                          {meta.description && (
                            <div className="text-label text-fg-muted mt-0.5 truncate">
                              {meta.description}
                            </div>
                          )}
                        </div>

                        {/* Value Display */}
                        <code className="text-xs font-mono text-fg-secondary shrink-0 bg-surface px-2 py-1 rounded-sm border border-border-subtle">
                          {value}
                        </code>

                        {/* Interactive Color Picker Popover */}
                        {isOpen && !isBuiltin && !readOnly && (
                          <div className="absolute right-4 top-full mt-1 z-50 w-72 rounded-panel border border-border bg-bg-elevated p-3 shadow-xl space-y-3">
                            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                              <span className="text-xs font-medium text-fg">{meta.label}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (admitted()) setOpenTokenKey(null)
                                }}
                                className="text-fg-faint hover:text-fg cursor-pointer p-0.5 rounded-sm"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Native Kit Color Input + Hex Field */}
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={
                                  value.startsWith("#") && value.length === 7
                                    ? value
                                    : activeTokens.bg?.startsWith("#")
                                      ? activeTokens.bg
                                      : undefined
                                }
                                onChange={(e) => {
                                  if (!admitted() || readOnly) return
                                  setColorInput(e.target.value)
                                  handleTokenChange(meta.key, e.target.value)
                                }}
                                className="w-8 h-8 rounded-sm border border-border cursor-pointer p-0 bg-transparent"
                              />
                              <input
                                type="text"
                                value={colorInput}
                                onChange={(e) => {
                                  if (!admitted() || readOnly) return
                                  setColorInput(e.target.value)
                                  handleTokenChange(meta.key, e.target.value)
                                }}
                                placeholder="hex or rgb/rgba"
                                className="flex-1 bg-surface border border-border-subtle rounded-control px-2.5 py-1 text-xs font-mono text-fg focus:outline-hidden focus:ring-1 focus:ring-primary"
                              />
                            </div>

                            {/* Preset Snap Swatches */}
                            <div>
                              <div className="text-caption font-mono uppercase text-fg-faint mb-1.5">
                                Token Presets
                              </div>
                              <div className="grid grid-cols-10 gap-1">
                                {SNAP_SWATCHES.map((hex) => (
                                  <button
                                    key={hex}
                                    type="button"
                                    onClick={() => {
                                      if (!admitted() || readOnly) return
                                      setColorInput(hex)
                                      handleTokenChange(meta.key, hex)
                                    }}
                                    className="w-5 h-5 rounded-xs border border-border-subtle cursor-pointer hover:scale-110 transition-transform"
                                    style={{ backgroundColor: hex }}
                                    title={hex}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </SCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
