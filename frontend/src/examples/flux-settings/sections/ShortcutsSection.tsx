import { Check, Keyboard, Lock, RotateCcw, X } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  FIXTURE_PLUGIN_SHORTCUTS,
  formatKeyBinding,
  isMac,
  parseKeyEvent,
  SHORTCUT_DEFS,
  type ShortcutDefinition,
} from "../model"
import { Kbd, KbdGroup, PanelHeader, SCard, SRow } from "../primitives"

const SHORTCUT_GROUPS = [
  { id: "navigation", label: "Navigation" },
  { id: "sessions", label: "Sessions" },
  { id: "actions", label: "Actions" },
] as const

interface ShortcutRowProps {
  def: ShortcutDefinition
  binding: string
  isEditing: boolean
  readOnly?: boolean
  conflict?: string
  onEdit: () => void
  onSave: (binding: string) => void
  onCancel: () => void
}

function renderKeyBadges(binding: string, prefix: string, active = false) {
  const tokens = formatKeyBinding(binding)
  const counts: Record<string, number> = {}
  return tokens.map((k) => {
    counts[k] = (counts[k] || 0) + 1
    return (
      <Kbd key={`${prefix}-${k}-${counts[k]}`} active={active}>
        {k}
      </Kbd>
    )
  })
}

function ShortcutRow({
  def,
  binding,
  isEditing,
  readOnly = false,
  conflict,
  onEdit,
  onSave,
  onCancel,
}: ShortcutRowProps) {
  const [captured, setCaptured] = useState<string | null>(null)
  const rowRef = useRef<HTMLDivElement>(null)
  const captureBoxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isEditing) {
      setCaptured(null)
      return
    }

    captureBoxRef.current?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      // Lease guard: if row is disconnected, ignore
      if (!rowRef.current?.isConnected) return

      // Scoped guard: if event originates from an unrelated input, textarea, editor,
      // or inside a popup/layer outside this editing row, do NOT intercept or consume
      const target = e.target as HTMLElement | null
      if (target && !rowRef.current.contains(target)) {
        if (
          target.matches("input, textarea, select, [contenteditable='true']") ||
          target.closest("[role='dialog'], [role='menu'], [data-nested-layer]")
        ) {
          return
        }
      }

      const parsed = parseKeyEvent(e)
      if (parsed === undefined) {
        // Modifier-only or active IME composition: do not consume, allow natural event flow
        return
      }

      // Key event is admitted (or Escape cancellation): consume and handle
      e.preventDefault()
      e.stopPropagation()

      if (parsed === null) {
        // Escape cancels capture
        onCancel()
        return
      }

      setCaptured(parsed)
    }

    window.addEventListener("keydown", handleKeyDown, true)
    return () => window.removeEventListener("keydown", handleKeyDown, true)
  }, [isEditing, onCancel])

  return (
    <div ref={rowRef} data-shortcut-row={def.key} className="w-full">
      <SRow
        data-shortcut-key={def.key}
        label={def.label}
        description={def.description}
        className={`transition-colors ${
          isEditing
            ? "bg-primary-muted ring-1 ring-primary/40 ring-inset"
            : readOnly
              ? "opacity-80"
              : "cursor-pointer hover:bg-surface/60"
        }`}
        onClick={isEditing || readOnly ? undefined : onEdit}
      >
        {isEditing ? (
          <div
            ref={captureBoxRef}
            title={`Recording shortcut for ${def.label}`}
            className="flex items-center gap-2 outline-none"
          >
            {captured ? (
              <>
                <KbdGroup>{renderKeyBadges(captured, "cap", true)}</KbdGroup>
                <button
                  type="button"
                  aria-label={`Save ${def.label} shortcut`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSave(captured)
                  }}
                  className="inline-flex items-center justify-center w-6 h-6 rounded-sm bg-success-muted text-success hover:bg-success hover:text-success-fg cursor-pointer transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <span className="text-xs text-fg-muted font-mono italic animate-pulse">
                Press keys…
              </span>
            )}
            <button
              type="button"
              aria-label={`Cancel editing ${def.label}`}
              onClick={(e) => {
                e.stopPropagation()
                onCancel()
              }}
              className="inline-flex items-center justify-center w-6 h-6 rounded-sm bg-surface text-fg-muted hover:text-fg cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {conflict && (
              <span
                className="text-caption font-mono text-warning bg-warning-muted px-1.5 py-0.5 rounded-xs"
                title={`Conflicts with: ${conflict}`}
              >
                Conflict
              </span>
            )}
            <KbdGroup>{renderKeyBadges(binding, def.key, false)}</KbdGroup>
          </div>
        )}
      </SRow>
    </div>
  )
}

interface ShortcutsSectionProps {
  shortcuts: Record<string, string>
  onChange: (shortcuts: Record<string, string>) => void
  readOnly?: boolean
}

export function ShortcutsSection({ shortcuts, onChange, readOnly = false }: ShortcutsSectionProps) {
  const [editingKey, setEditingKey] = useState<string | null>(null)

  const getBinding = useCallback(
    (key: string, defaultValue: string) => shortcuts[key] ?? defaultValue,
    [shortcuts],
  )

  const handleSave = useCallback(
    (key: string, newBinding: string) => {
      onChange({ ...shortcuts, [key]: newBinding })
      setEditingKey(null)
    },
    [shortcuts, onChange],
  )

  const handleResetAll = useCallback(() => {
    const defaults: Record<string, string> = {}
    for (const def of SHORTCUT_DEFS) defaults[def.key] = def.default
    onChange(defaults)
    setEditingKey(null)
  }, [onChange])

  // Conflict detection
  const conflicts = useMemo(() => {
    const map = new Map<string, string>()
    const detected: Record<string, string> = {}
    for (const def of SHORTCUT_DEFS) {
      const binding = shortcuts[def.key] ?? def.default
      const existing = map.get(binding)
      if (existing) {
        detected[def.key] = existing
      } else {
        map.set(binding, def.label)
      }
    }
    return detected
  }, [shortcuts])

  return (
    <div className="space-y-6" data-section="shortcuts">
      <PanelHeader
        title="Shortcuts"
        description="Keyboard shortcuts for fast navigation, session switching, and action dispatch."
        action={
          <button
            type="button"
            disabled={readOnly}
            onClick={handleResetAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-medium border border-border-subtle bg-surface text-fg hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-fg-secondary" />
            Reset All
          </button>
        }
      />

      {/* Shortcut Groups */}
      {SHORTCUT_GROUPS.map((group) => {
        const groupDefs = SHORTCUT_DEFS.filter((d) => d.group === group.id)
        return (
          <SCard key={group.id} title={group.label}>
            {groupDefs.map((def) => (
              <ShortcutRow
                key={def.key}
                def={def}
                binding={getBinding(def.key, def.default)}
                isEditing={editingKey === def.key}
                readOnly={readOnly}
                conflict={conflicts[def.key]}
                onEdit={() => setEditingKey(def.key)}
                onSave={(b) => handleSave(def.key, b)}
                onCancel={() => setEditingKey(null)}
              />
            ))}
          </SCard>
        )
      })}

      {/* Read-Only Plugin Shortcuts */}
      <SCard title="Plugin Shortcuts" meta="Read-only">
        {FIXTURE_PLUGIN_SHORTCUTS.map((ps) => (
          <SRow key={ps.id} label={ps.label} description={ps.description} className="opacity-75">
            <div className="flex items-center gap-2">
              <Lock className="w-3 h-3 text-fg-faint" />
              <KbdGroup>{renderKeyBadges(ps.key, ps.id, false)}</KbdGroup>
            </div>
          </SRow>
        ))}
      </SCard>

      {/* Shortcut Legend & Help */}
      <div className="rounded-lg border border-dashed border-border p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-fg-muted bg-surface/30">
        <div className="flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-brand" />
          <span>
            {isMac
              ? "⌘ = Command · ⌥ = Option · ⇧ = Shift"
              : "Ctrl = Control · Alt = Alt · Shift = Shift"}{" "}
            · Click any row to rebind keys
          </span>
        </div>
        <div className="text-label font-mono text-fg-faint">
          Escape cancels capture · Modifiers alone ignored
        </div>
      </div>
    </div>
  )
}
