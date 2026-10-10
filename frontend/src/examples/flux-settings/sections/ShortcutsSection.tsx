import { isComposingEvent } from "@hollis-labs/design-components"
import { Check, Keyboard, Lock, RotateCcw, X } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useCommittedFrame } from "../committed-frame"
import {
  FIXTURE_PLUGIN_SHORTCUTS,
  formatKeyBinding,
  isMac,
  parseKeyEvent,
  SHORTCUT_DEFS,
  type ShortcutDefinition,
} from "../model"
import { Kbd, KbdGroup, PanelHeader, SCard, SRow } from "../primitives"

export interface CaptureDiagnostics {
  key: string
  isLive: () => boolean
  captured: string | null
  save: () => boolean
  cancel: () => boolean
}

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
  isLive?: () => boolean
  conflict?: string
  onEdit: () => void
  onSave: (binding: string) => boolean | undefined
  onCancel: () => boolean
  onCapture?: (frame: CaptureDiagnostics | undefined) => void
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
  isLive,
  conflict,
  onEdit,
  onSave,
  onCancel,
  onCapture,
}: ShortcutRowProps) {
  const { frameToken, checkToken } = useCommittedFrame()
  const admitted = useCallback(
    () => checkToken(frameToken) && !!rowRef.current?.isConnected && (!isLive || isLive()),
    [checkToken, frameToken, isLive],
  )
  const [captured, setCaptured] = useState<string | null>(null)
  const rowRef = useRef<HTMLDivElement>(null)
  const captureBoxRef = useRef<HTMLButtonElement>(null)
  const focusStarted = useRef(false)

  const handleCommitSave = useCallback(() => {
    if (readOnly || !admitted()) return false
    if (captured) {
      return onSave(captured) === true
    }
    return false
  }, [readOnly, captured, onSave, admitted])

  const handleGuardedCancel = useCallback((): boolean => {
    if (readOnly || !admitted()) return false
    return onCancel()
  }, [readOnly, onCancel, admitted])

  useEffect(() => {
    if (!isEditing) {
      setCaptured(null)
      focusStarted.current = false
      return
    }

    if (admitted() && !focusStarted.current) {
      captureBoxRef.current?.focus()
      focusStarted.current = true
    }

    function handleKeyDown(e: KeyboardEvent) {
      // 1. Root / lease guard: if row is disconnected, ignore
      if (!rowRef.current?.isConnected) return

      // 2. Exact row-owned event target requirement:
      // The event target MUST originate within this exact shortcut row.
      const target = e.target as HTMLElement | null
      if (!target || !rowRef.current.contains(target)) {
        return
      }

      // 3. Current host / row admission lease:
      // If row is readOnly or host frame admission/lease is false or retired, refuse to consume/cancel
      if (readOnly || !admitted()) {
        return
      }

      // 4. Composition guard: active IME composition or keyCode 229 suppresses consume/cancel
      if (isComposingEvent(e)) {
        return
      }

      // 5. Escape key cancels capture from anywhere within this admitted shortcut row
      if (e.key === "Escape") {
        e.preventDefault()
        e.stopPropagation()
        handleGuardedCancel()
        return
      }

      // 6. Exact capture-box surface requirement:
      // Keystroke recording is strictly scoped to the exact capture surface (captureBoxRef)!
      // If target is the Save button, Cancel button, outside plain buttons, body, or outside inputs:
      // DO NOT intercept or consume! This allows native Enter, Space, and Tab on the action buttons.
      if (target !== captureBoxRef.current) {
        return
      }

      // Allow Tab key to naturally navigate focus from captureBox to Save / Cancel buttons!
      if (e.key === "Tab") {
        return
      }

      const parsed = parseKeyEvent(e)
      if (parsed === undefined) {
        // Modifier-only or active IME composition: do not consume, allow natural event flow
        return
      }

      // Exact admitted capture event: consume and record
      e.preventDefault()
      e.stopPropagation()
      setCaptured(parsed)
    }

    window.addEventListener("keydown", handleKeyDown, true)
    return () => window.removeEventListener("keydown", handleKeyDown, true)
  }, [isEditing, readOnly, handleGuardedCancel, admitted])

  useEffect(() => {
    if (!isEditing) return
    onCapture?.({
      key: def.key,
      isLive: admitted,
      captured,
      save: handleCommitSave,
      cancel: handleGuardedCancel,
    })
    return () => onCapture?.(undefined)
  }, [isEditing, def.key, captured, handleCommitSave, handleGuardedCancel, onCapture, admitted])

  // Publish active capture lease to window diagnostics when editing
  useEffect(() => {
    if (!isEditing) return
    if (typeof window !== "undefined" && window.fluxSettings) {
      window.fluxSettings.currentCapture = {
        key: def.key,
        isLive: () => !readOnly && admitted(),
        captured,
        save: handleCommitSave,
        cancel: handleGuardedCancel,
      }
    }
    return () => {
      if (typeof window !== "undefined" && window.fluxSettings) {
        window.fluxSettings.currentCapture = undefined
      }
    }
  }, [isEditing, def.key, readOnly, captured, handleCommitSave, handleGuardedCancel, admitted])

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
          <div className="flex items-center gap-2">
            <button
              ref={captureBoxRef}
              type="button"
              aria-label={`Recording shortcut for ${def.label}`}
              title={`Recording shortcut for ${def.label}`}
              className="flex items-center gap-2 outline-none focus:ring-1 focus:ring-primary/60 rounded px-1.5 py-0.5 border border-primary/30 bg-primary-muted/50 text-xs font-mono cursor-default"
            >
              {captured ? (
                <KbdGroup>{renderKeyBadges(captured, "cap", true)}</KbdGroup>
              ) : (
                <span className="text-xs text-fg-muted font-mono italic animate-pulse">
                  Press keys…
                </span>
              )}
            </button>
            {captured && (
              <button
                type="button"
                aria-label={`Save ${def.label} shortcut`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleCommitSave()
                }}
                className="inline-flex items-center justify-center w-6 h-6 rounded-sm bg-success-muted text-success hover:bg-success hover:text-success-fg cursor-pointer transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              aria-label={`Cancel editing ${def.label}`}
              onClick={(e) => {
                e.stopPropagation()
                handleGuardedCancel()
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

export interface ShortcutsSectionProps {
  shortcuts: Record<string, string>
  onCapture?: (frame: CaptureDiagnostics | undefined) => void
  onChange: (shortcuts: Record<string, string>) => void
  readOnly?: boolean
  isLive?: () => boolean
}

export function ShortcutsSection({
  shortcuts,
  onCapture,
  onChange,
  readOnly = false,
  isLive,
}: ShortcutsSectionProps) {
  const { frameToken, checkToken } = useCommittedFrame()
  const admitted = useCallback(
    () => checkToken(frameToken) && (!isLive || isLive()),
    [checkToken, frameToken, isLive],
  )
  const [editingKey, setEditingKey] = useState<string | null>(null)

  const getBinding = useCallback(
    (key: string, defaultValue: string) => shortcuts[key] ?? defaultValue,
    [shortcuts],
  )

  const handleSave = useCallback(
    (key: string, newBinding: string): boolean => {
      if (readOnly || !admitted()) return false
      onChange({ ...shortcuts, [key]: newBinding })
      setEditingKey(null)
      return true
    },
    [shortcuts, onChange, readOnly, admitted],
  )

  const handleCancel = useCallback(
    (key: string): boolean => {
      if (readOnly || !admitted()) return false
      setEditingKey((current) => (current === key ? null : current))
      return true
    },
    [readOnly, admitted],
  )

  const handleResetAll = useCallback((): boolean => {
    if (readOnly || !admitted()) return false
    const defaults: Record<string, string> = {}
    for (const def of SHORTCUT_DEFS) defaults[def.key] = def.default
    onChange(defaults)
    setEditingKey(null)
    return true
  }, [onChange, readOnly, admitted])

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
                isLive={admitted}
                onCapture={onCapture}
                conflict={conflicts[def.key]}
                onEdit={() => {
                  if (admitted() && !readOnly) setEditingKey(def.key)
                }}
                onSave={(b) => handleSave(def.key, b)}
                onCancel={() => handleCancel(def.key)}
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
