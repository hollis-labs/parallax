import { AlertCircle, CheckCircle2, RotateCcw, Search, Shield } from "lucide-react"
import { useMemo, useState } from "react"
import {
  FIXTURE_TOOL_GRANTS,
  PERMISSION_MODE_OPTIONS,
  type PermissionMode,
  type ToolGrantItem,
} from "../model"
import { PanelHeader, SCard, SRow, SSelect, SToggle } from "../primitives"

interface PermissionsSectionProps {
  mode: PermissionMode
  tools: ToolGrantItem[]
  onModeChange: (mode: PermissionMode) => void
  onToolsChange: (tools: ToolGrantItem[]) => void
  readOnly?: boolean
}

export function PermissionsSection({
  mode,
  tools,
  onModeChange,
  onToolsChange,
  readOnly = false,
}: PermissionsSectionProps) {
  const [search, setSearch] = useState("")

  const activeModeOption = useMemo(
    () => PERMISSION_MODE_OPTIONS.find((o) => o.value === mode) ?? PERMISSION_MODE_OPTIONS[0],
    [mode],
  )

  const filteredTools = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return tools
    return tools.filter(
      (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q),
    )
  }, [tools, search])

  const grantedCount = useMemo(() => tools.filter((t) => t.allowed).length, [tools])
  const discoveredCount = tools.length
  const autoLoadCount = useMemo(() => tools.filter((t) => t.synced).length, [tools])

  const handleToggle = (id: string) => {
    if (readOnly) return
    const next = tools.map((t) => (t.id === id ? { ...t, allowed: !t.allowed } : t))
    onToolsChange(next)
  }

  const handleReset = () => {
    if (readOnly) return
    onModeChange("default")
    onToolsChange(FIXTURE_TOOL_GRANTS)
  }

  return (
    <div className="space-y-6" data-section="permissions">
      <PanelHeader
        title="Permissions & Tool Grants"
        description="Local preview specimen for tool execution permissions; changes remain local with zero transport effects."
        action={
          <button
            type="button"
            disabled={readOnly}
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-medium border border-border-subtle bg-surface text-fg hover:bg-surface-hover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-fg-secondary" />
            Reset Defaults
          </button>
        }
      />

      {/* Global Permission Mode Card */}
      <SCard
        title="Execution Permission Policy"
        description="Specifies local mock policy for simulated agent operations; changes remain local specimens with zero runtime transport effect."
      >
        <SRow
          label="Active Mode"
          description="Governs filesystem writes, terminal commands, and network fetches"
        >
          <SSelect
            aria-label="Active Mode"
            value={mode}
            options={PERMISSION_MODE_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
            onChange={(val) => onModeChange(val as PermissionMode)}
            disabled={readOnly}
            width="w-64"
          />
        </SRow>

        <div className="p-3 border-t border-border-subtle bg-surface/30">
          <div className="flex items-start gap-2.5 text-xs">
            {mode === "yolo" ? (
              <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
            ) : mode === "plan" ? (
              <Shield className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-info shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-semibold text-fg">{activeModeOption.label}: </span>
              <span className="text-fg-muted">{activeModeOption.description}</span>
            </div>
          </div>
        </div>
      </SCard>

      {/* Metrics Header */}
      <div className="grid grid-cols-3 gap-3">
        <div
          data-metric="granted"
          className="rounded-lg border border-border-subtle bg-bg-elevated p-3"
        >
          <div className="font-mono text-caption uppercase tracking-wider text-fg-faint">
            Granted
          </div>
          <div className="text-lg font-semibold text-fg mt-1">
            {grantedCount}{" "}
            <span className="text-xs text-fg-muted font-normal">/ {discoveredCount}</span>
          </div>
        </div>
        <div className="rounded-lg border border-border-subtle bg-bg-elevated p-3">
          <div className="font-mono text-caption uppercase tracking-wider text-fg-faint">
            Discovered Tools
          </div>
          <div className="text-lg font-semibold text-fg mt-1">{discoveredCount}</div>
        </div>
        <div className="rounded-lg border border-border-subtle bg-bg-elevated p-3">
          <div className="font-mono text-caption uppercase tracking-wider text-fg-faint">
            Auto-Loaded
          </div>
          <div className="text-lg font-semibold text-fg mt-1">{autoLoadCount}</div>
        </div>
      </div>

      {/* Tool Grants List */}
      <SCard
        title={`Tool Grants (${grantedCount}/${discoveredCount})`}
        description="Local preview specimen for tool execution permissions; toggling updates local inspection state with no live network or model transport effects."
        action={
          <div className="relative w-48">
            <Search className="w-3.5 h-3.5 text-fg-faint absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter tools…"
              className="w-full bg-surface border border-border-subtle rounded-control pl-8 pr-2.5 py-1 text-xs text-fg placeholder:text-fg-faint focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        }
      >
        <div className="divide-y divide-border-subtle">
          {filteredTools.length === 0 ? (
            <div className="p-6 text-center text-xs text-fg-muted">No tools match "{search}".</div>
          ) : (
            filteredTools.map((tool) => (
              <div
                key={tool.id}
                className="flex items-center justify-between gap-4 px-4 py-2.5 hover:bg-surface/30 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-medium text-fg">{tool.name}</span>
                    <span
                      className={`text-caption font-mono px-1.5 py-0.2 rounded-xs uppercase ${
                        tool.risk === "high"
                          ? "bg-danger-muted text-danger"
                          : tool.risk === "medium"
                            ? "bg-warning-muted text-warning"
                            : "bg-surface text-fg-faint"
                      }`}
                    >
                      {tool.risk}
                    </span>
                    {!tool.synced && (
                      <span className="text-caption font-mono px-1.5 py-0.2 rounded-xs bg-warning-muted text-warning">
                        needs restart
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-fg-muted mt-0.5">{tool.description}</p>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <span className="text-xs text-fg-muted font-mono">
                    {tool.allowed ? "Granted" : "Revoked"}
                  </span>
                  <SToggle
                    checked={tool.allowed}
                    onChange={() => handleToggle(tool.id)}
                    disabled={readOnly || !tool.synced}
                    aria-label={`Toggle ${tool.name} permission`}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </SCard>

      {/* Inert Backend Notice */}
      <div className="rounded-lg border border-border-subtle bg-bg-elevated p-3 text-xs text-fg-muted">
        <strong className="text-fg font-medium">Inert Local Fixture: </strong>
        Tool grants and permission modes update presentation state only; no wire API or remote
        daemon was invoked.
      </div>
    </div>
  )
}
