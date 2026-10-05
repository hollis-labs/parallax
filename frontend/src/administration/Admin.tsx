import { Button } from "@hollis-labs/design-components"
import {
  AdminContent,
  type AdminContentProps,
  type AdminManifest,
  type AdminPage,
  type AdminSettingsRead,
} from "@hollis-labs/kit-admin"
import type {
  SettingsDraft,
  SettingsWizardCheck,
  SettingsWizardResult,
} from "@hollis-labs/kit-settings"
import { useEffect, useRef, useState } from "react"
import { createAdminPresentationSession } from "../chimera/admin-session"
import { administrationFixture as fixture } from "./model"
export const adminStates = [
  "ready",
  "read-only",
  "initial-error",
  "refresh-error",
  "group-error",
  "setup",
  "setup-error",
  "stale",
  "missing",
  "denied",
  "unsupported",
] as const
export type AdminState = (typeof adminStates)[number]
function projections(state: AdminState) {
  const readOnly = state === "read-only",
    groups = [
      { id: "workspace", label: "Desired workspace", items: fixture.settings.slice(0, 3) },
      { id: "appearance", label: "Desired appearance", items: fixture.settings.slice(3) },
    ]
  const settings: Record<string, AdminSettingsRead> = {}
  const manifest: AdminManifest = {
    contract_version: state === "unsupported" ? 99 : 1,
    app: { id: "parallax-fixture", label: "Parallax fixture administration" },
    revision: fixture.version,
    settings: groups.map((g) => {
      const fields = Object.fromEntries(
        g.items.map((v) => [
          v.key,
          {
            editable: v.editable && !readOnly,
            secret: false,
            restart_required: v.pending,
            ...(v.pending ? { apply_target: "fixture-view" } : {}),
            ...(!v.editable || readOnly
              ? { read_only_reason: readOnly ? "Read-only presentation scenario" : v.reason }
              : {}),
          },
        ]),
      )
      settings[g.id] = {
        phase: "ready",
        state: {
          draft: {},
          values: Object.fromEntries(
            g.items.map((v) => [
              v.key,
              {
                present: true,
                value: v.value,
                editable: v.editable && !readOnly,
                has_override: v.source === "override",
                ...(!v.editable || readOnly
                  ? { read_only_reason: readOnly ? "Read-only presentation scenario" : v.reason }
                  : {}),
                source: { kind: v.source, label: v.sourceLabel },
                apply_state: v.pending ? "pending_restart" : "active",
              },
            ]),
          ),
          apply: {
            restartRequired: g.items.some((v) => v.pending),
            applyTargets: g.items.some((v) => v.pending) ? ["fixture-view"] : [],
          },
        },
      }
      return {
        id: g.id,
        label: g.label,
        section: "settings",
        scope: { kind: "app", id: "parallax-fixture" },
        schema: {
          type: "object",
          additionalProperties: false,
          properties: Object.fromEntries(
            g.items.map((v) => [
              v.key,
              {
                type: "string",
                title: v.label,
                ...(!v.editable || readOnly ? { readOnly: true } : {}),
              },
            ]),
          ),
        },
        fields,
        capabilities: {
          can_read: true,
          can_update: !readOnly,
          can_validate: !readOnly,
          can_reset: !readOnly,
        },
      }
    }),
    health: [
      {
        id: "runtime",
        label: "Observed fixture runtime",
        section: "status",
        stale_after_ms: 120000,
      },
    ],
    stats: [
      {
        id: "records",
        label: "Bundled user records",
        section: "status",
        unit: "count",
        kind: "gauge",
        stale_after_ms: 120000,
      },
    ],
    series: [],
    diagnostics: [
      {
        id: "fixture",
        label: "Observed fixture diagnostics",
        section: "diagnostics",
        stale_after_ms: 120000,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            version: { type: "string" },
            transport_connected: { type: "boolean" },
            user_ids: { type: "array", items: { type: "string" } },
          },
        },
      },
    ],
  }
  return { manifest, settings }
}
export function AdminLab({
  onIntent,
  onReset,
  initialState = "ready",
  initialPage = "dashboard",
}: {
  onIntent: (action: string, id: string) => void
  onReset: () => void
  initialState?: AdminState
  initialPage?: AdminPage
}) {
  const [state, setState] = useState<AdminState>(initialState),
    [release, setRelease] = useState<{ callback: () => void; source: number }[]>([])
  const epoch = useRef(0)
  return (
    <section className="administration-lab" aria-label="Administration fixture lab">
      <div className="communication-controls">
        <label>
          Admin state
          <select
            aria-label="Admin state"
            value={state}
            onChange={(e) => {
              epoch.current++
              setState(e.target.value as AdminState)
              onReset()
            }}
          >
            {adminStates.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <span className="muted">
          {fixture.version} · {fixture.clock} · desired configuration is not observed status
        </span>
        {release.length > 0 && (
          <Button
            variant="outline"
            onClick={() => {
              for (const item of release) item.callback()
              setRelease([])
            }}
          >
            {release.every((item) => item.source === epoch.current)
              ? "Release scripted outcomes"
              : "Release retired outcomes"}
          </Button>
        )}
      </div>
      <AdminPresentation
        key={state}
        state={state}
        initialPage={initialPage}
        onIntent={onIntent}
        onHold={(callback) =>
          setRelease((current) => [...current, { callback, source: epoch.current }])
        }
        onReset={onReset}
      />
    </section>
  )
}
function AdminPresentation({
  state,
  initialPage,
  onIntent,
  onHold,
  onReset,
}: {
  state: AdminState
  initialPage: AdminPage
  onIntent: (action: string, id: string) => void
  onHold: (callback: () => void) => void
  onReset: () => void
}) {
  const [{ manifest, settings: initial }] = useState(() => projections(state)),
    [settings, setSettings] = useState(initial),
    [selection, setSelection] = useState<AdminContentProps["selection"]>({
      page: state.startsWith("setup") ? "settings" : initialPage,
      groupId: "workspace",
      mode: state.startsWith("setup") ? "setup" : "edit",
    })
  const [step, setStep] = useState(0),
    [checks, setChecks] = useState<Record<string, SettingsWizardCheck>>({}),
    [results, setResults] = useState<Record<string, SettingsWizardResult>>({}),
    [message, setMessage] = useState("")
  const session = useRef<ReturnType<typeof createAdminPresentationSession> | null>(null)
  useEffect(() => {
    const active = createAdminPresentationSession("parallax-fixture", state, [
      "settings/workspace",
      "settings/appearance",
      "setup",
      "check/workspace",
      "check/appearance",
    ])
    session.current = active
    return () => {
      active.dispose()
      session.current = null
    }
  }, [state])
  const draftChange = (id: string, draft: SettingsDraft) => {
    session.current?.begin(`settings/${id}`).cancel()
    session.current?.begin(`check/${id}`).cancel()
    session.current?.begin("setup").cancel()
    setChecks((c) => ({
      ...c,
      [id]: { status: "idle", blocking: true, message: "Draft changed; scripted check retired" },
    }))
    setResults({})
    setMessage("")
    onReset()
    setSettings((current) => ({
      ...current,
      [id]: { ...current[id], state: { ...current[id].state!, draft } },
    }))
  }
  const mutable = ![
    "read-only",
    "refresh-error",
    "initial-error",
    "denied",
    "unsupported",
  ].includes(state)
  function hold(channel: string, action: string, payload: unknown, commit: () => void) {
    if (!mutable || (state === "group-error" && channel.endsWith("/workspace"))) return
    const ticket = session.current?.begin(channel)
    if (!ticket) return
    setMessage("Pending scripted outcome; fixture records remain unchanged")
    onIntent(action, JSON.stringify(payload))
    onHold(() => {
      ticket.commit(() => {
        commit()
        setMessage("Scripted outcome reviewed; no business effects")
      })
    })
  }
  const nowMs = Date.parse(fixture.clock),
    observedAt = new Date(nowMs - (state === "stale" ? 86400000 : 30000)).toISOString(),
    observation = { phase: "ready" as const, nowMs, staleAfterMs: 120000, observedAt }
  const discovery: AdminContentProps["discovery"] = {
    contextKey: state === "denied" ? "retired-context" : "parallax-fixture",
    phase: state === "initial-error" || state === "refresh-error" ? "error" : "ready",
    manifest: state === "initial-error" ? undefined : manifest,
    error: state.endsWith("error") ? "Scripted discovery failure; no remote request" : undefined,
  }
  const props: AdminContentProps = {
    contextKey: "parallax-fixture",
    discovery,
    selection,
    destination: (target) => ({
      onSelect: () =>
        setSelection({
          ...target,
          groupId: target.page === "settings" ? (target.groupId ?? "workspace") : undefined,
          mode: "edit",
        }),
    }),
    settings:
      state === "group-error"
        ? {
            ...settings,
            workspace: {
              phase: "error",
              error: "Scripted workspace read failure; appearance remains available",
            },
          }
        : settings,
    nowMs,
    settingsActions: {
      onDraftChange: draftChange,
      onSave: (id, changes) =>
        hold(`settings/${id}`, "Settings update intent inspected", { id, changes }, () =>
          setSettings((s) => ({
            ...s,
            [id]: {
              ...s[id],
              state: {
                ...s[id].state!,
                error: "Scripted update refusal; draft retained, nothing saved",
              },
            },
          })),
        ),
      onReset: (id, keys) =>
        hold(`settings/${id}`, "Override removal intent inspected", { id, keys }, () =>
          setMessage("Scripted removal refused; inherited values unchanged"),
        ),
      onValidate: (id, changes) =>
        hold(`settings/${id}`, "Validation intent inspected", { id, changes }, () =>
          setMessage("Scripted validation review only; no backend validation"),
        ),
      onApply: (id, targets) =>
        hold(`settings/${id}`, "Apply restart intent inspected", { id, targets }, () =>
          setSettings((s) => ({
            ...s,
            [id]: {
              ...s[id],
              state: {
                ...s[id].state!,
                applyError: "Scripted restart refusal; pending application remains",
              },
            },
          })),
        ),
    },
    setup: {
      step,
      onStepChange: setStep,
      checks,
      results,
      onCheck: (id) => {
        setChecks((c) => ({
          ...c,
          [id]: { status: "running", blocking: true, message: "Scripted check pending" },
        }))
        hold(`check/${id}`, "Setup check intent inspected", id, () =>
          setChecks((c) => ({
            ...c,
            [id]: {
              status: state === "setup-error" ? "failed" : "ok",
              blocking: true,
              message:
                state === "setup-error"
                  ? "Scripted prerequisite failure"
                  : "Scripted fixture check only; no connectivity tested",
            },
          })),
        )
      },
      onComplete: (plan) =>
        hold("setup", "Setup completion intent inspected", plan, () =>
          setResults(
            Object.fromEntries(
              manifest.settings.map((g) => [
                g.id,
                { status: "failed", message: "Scripted setup refusal; no settings applied" },
              ]),
            ),
          ),
        ),
    },
    setupContext: (
      <p className="muted">
        Setup edits the same local drafts. Checks/results are explicit scripted outcomes; they imply
        no readiness, save or restart.
      </p>
    ),
    observations:
      state === "missing"
        ? {}
        : {
            health: {
              runtime: {
                status: "unknown",
                checks: [
                  {
                    id: "transport",
                    label: "Message transport observation",
                    status: "unknown",
                    message: "No live transport configured; fixture only",
                  },
                ],
                observation,
              },
            },
            stats: { records: { value: fixture.users.length, observation } },
            diagnostics: {
              fixture: {
                data: {
                  version: fixture.version,
                  transport_connected: false,
                  user_ids: fixture.users.map((u) => u.id),
                },
                validation: { state: "valid" },
                observation,
              },
            },
          },
  }
  return (
    <>
      <fieldset className="communication-controls" aria-label="Canonical admin pages">
        {(["dashboard", "settings", "status", "diagnostics"] as const).map((p) => (
          <Button
            variant={selection.page === p ? "default" : "outline"}
            key={p}
            onClick={() =>
              setSelection({
                page: p,
                groupId: p === "settings" ? "workspace" : undefined,
                mode: "edit",
              })
            }
          >
            {p[0].toUpperCase() + p.slice(1)}
          </Button>
        ))}
        {selection.mode === "setup" && (
          <Button
            variant="outline"
            disabled={!mutable || state === "group-error"}
            onClick={() => {
              for (const g of manifest.settings) props.setup?.onCheck?.(g.id)
            }}
          >
            Inspect all prerequisite checks
          </Button>
        )}
        <Button
          variant="outline"
          disabled={!mutable}
          onClick={() => setSelection({ page: "settings", mode: "setup" })}
        >
          Open setup
        </Button>
      </fieldset>
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      <AdminContent {...props} />
      <p className="muted">
        Embedded AdminContent, one host shell/page scroll. Manifest and snapshots are bounded
        presentation projections, not a wire schema or authorization evaluator.
      </p>
    </>
  )
}
