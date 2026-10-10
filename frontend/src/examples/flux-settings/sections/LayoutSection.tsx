import { RotateCcw } from "lucide-react"
import { useMemo, useState } from "react"
import {
  BOTTOM_DRAWER_TAB_OPTIONS,
  DEFAULT_LAYOUT_PREFERENCES,
  DRAWER_RETENTION_OPTIONS,
  LAYOUT_PRESETS,
  type LayoutPreferences,
  type LayoutPresetKey,
  TOOL_DISPLAY_OPTIONS,
  type ToolCallDisplayMode,
  validateLayoutPreferences,
} from "../model"
import { PanelHeader, SCard, SRow, SSelect, SToggle } from "../primitives"

interface LayoutSectionProps {
  preferences: LayoutPreferences
  onChange: (prefs: LayoutPreferences) => void
  readOnly?: boolean
}

export function LayoutSection({ preferences, onChange, readOnly = false }: LayoutSectionProps) {
  const [_draft, setDraft] = useState<LayoutPreferences>(preferences)

  const isDefault = useMemo(
    () => JSON.stringify(preferences) === JSON.stringify(DEFAULT_LAYOUT_PREFERENCES),
    [preferences],
  )

  const update = (patch: Partial<LayoutPreferences>) => {
    if (readOnly) return
    const candidate = { ...preferences, ...patch }
    const validated = validateLayoutPreferences(candidate)
    if (!validated.valid) return
    setDraft(validated.value)
    onChange(validated.value)
  }

  const handleReset = () => {
    if (readOnly) return
    setDraft(DEFAULT_LAYOUT_PREFERENCES)
    onChange(DEFAULT_LAYOUT_PREFERENCES)
  }

  return (
    <div className="space-y-6" data-section="layout">
      <PanelHeader
        title="Layout"
        description="Configure display styles, drawer behaviors, and layout preset seams coordinated with session navigation."
        action={
          <button
            type="button"
            disabled={isDefault || readOnly}
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-medium border border-border-subtle bg-surface text-fg hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-fg-secondary" />
            Reset Defaults
          </button>
        }
      />

      {/* Workspace Presets Card */}
      <SCard
        title="Workspace Presets"
        description="High-level layout arrangements for sidebars, rails, and metadata chips"
        meta="Coordinated 0086 Seam"
      >
        <SRow
          label="Active Preset"
          description="Coordinates with the main app session navigation storage"
        >
          <SSelect
            aria-label="Active Preset"
            value={preferences.preset}
            options={Object.entries(LAYOUT_PRESETS).map(([key, p]) => ({
              value: key,
              label: p.label,
            }))}
            onChange={(val) => update({ preset: val as LayoutPresetKey })}
            disabled={readOnly}
            width="w-64"
          />
        </SRow>
        <SRow
          label="Header Metadata Chips"
          description="Display session tokens, model badge, and duration in the chat header"
        >
          <SToggle
            checked={preferences.headerChipsVisible}
            onChange={(checked) => update({ headerChipsVisible: checked })}
            disabled={readOnly}
            aria-label="Toggle Header Metadata Chips"
          />
        </SRow>
        <SRow
          label="Compact Companion"
          description="Condense companion controls on narrow displays and short windows"
        >
          <SToggle
            checked={preferences.compactCompanion}
            onChange={(checked) => update({ compactCompanion: checked })}
            disabled={readOnly}
            aria-label="Toggle Compact Companion"
          />
        </SRow>
      </SCard>

      {/* Tool Call Display & Stream Preferences */}
      <SCard
        title="Chat Stream & Tool Display"
        description="Control the default density and presentation of tool invocations"
      >
        <SRow
          label="Tool Call Style"
          description={
            TOOL_DISPLAY_OPTIONS.find((o) => o.value === preferences.toolCallDisplayMode)
              ?.description ?? "How tool invocations appear in the transcript"
          }
        >
          <SSelect
            aria-label="Tool Call Style"
            value={preferences.toolCallDisplayMode}
            options={TOOL_DISPLAY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            onChange={(val) => update({ toolCallDisplayMode: val as ToolCallDisplayMode })}
            disabled={readOnly}
            width="w-56"
          />
        </SRow>
        <SRow
          label="Drawer Retention"
          description="How long completed tool execution history remains in memory"
        >
          <SSelect
            aria-label="Drawer Retention"
            value={String(preferences.toolDrawerRetention)}
            options={DRAWER_RETENTION_OPTIONS}
            onChange={(val) => update({ toolDrawerRetention: Number(val) })}
            disabled={readOnly}
            width="w-56"
          />
        </SRow>
      </SCard>

      {/* Bottom Working Drawer Preferences */}
      <SCard
        title="Working Drawer"
        description="Default activation target for the resizable lower panel"
      >
        <SRow
          label="Default Tab"
          description="Initial tab selected when the working drawer opens without an explicit target"
        >
          <SSelect
            aria-label="Working Drawer Default Tab"
            value={preferences.defaultBottomDrawerTab}
            options={BOTTOM_DRAWER_TAB_OPTIONS}
            onChange={(val) => update({ defaultBottomDrawerTab: val })}
            disabled={readOnly}
            width="w-56"
          />
        </SRow>
      </SCard>

      {/* Summary provenance banner */}
      <div className="rounded-lg border border-border-subtle bg-bg-elevated p-3 text-xs text-fg-muted flex items-center justify-between">
        <span>
          Layout state:{" "}
          <strong className="text-fg font-medium">
            {isDefault ? "Standard Defaults" : "Customized"}
          </strong>{" "}
          (Seam key:{" "}
          <code className="font-mono text-label text-fg-secondary">
            parallax:flux-settings:layout:v1
          </code>
          )
        </span>
        <span className="font-mono text-label text-fg-faint">Version 1.0</span>
      </div>
    </div>
  )
}
