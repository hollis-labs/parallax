import type {
  AdminContentProps,
  AdminManifest,
  AdminSelection,
  AdminSettingsRead,
  AdminTarget,
} from "@hollis-labs/kit-admin"
import { adminManifestProblem, adminPages } from "@hollis-labs/kit-admin"
import administration from "../fixtures/administration.json" with { type: "json" }
import { observationReviewModel } from "../observation-review/model"
export const adminAppearances = [
  "recorded",
  "initial-loading",
  "initial-error",
  "retained-loading",
  "retained-error",
  "context-mismatch",
  "unsupported",
  "malformed",
  "contradictory",
  "duplicate",
  "empty",
  "unknown-group",
  "unknown-page",
  "missing-snapshot",
  "group-loading",
  "group-error",
  "retained-group-error",
  "missing-observation",
  "denied",
  "long",
] as const
export type AdminAppearance = (typeof adminAppearances)[number]
export function adminReviewModel(
  appearance: AdminAppearance = "recorded",
  context = "populated",
  copy = false,
) {
  const observation = observationReviewModel(),
    settings: Record<string, AdminSettingsRead> = {}
  const groups = [
    { id: "workspace", label: "Desired workspace", items: administration.settings.slice(0, 3) },
    { id: "appearance", label: "Desired appearance", items: administration.settings.slice(3) },
  ]
  const manifest: AdminManifest = {
    contract_version: appearance === "unsupported" ? 99 : 1,
    app: {
      id: "parallax-readonly",
      label:
        appearance === "long"
          ? "Parallax fixed administration / " + "review declaration ".repeat(8)
          : "Parallax read-only declaration",
    },
    revision: `${administration.version}/${copy ? "reviewed-copy" : "original"}`,
    settings: groups.map((g) => {
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
                editable: v.editable,
                has_override: v.source === "override",
                ...(!v.editable ? { read_only_reason: v.reason } : {}),
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
              { type: "string", title: v.label, ...(!v.editable ? { readOnly: true } : {}) },
            ]),
          ),
        },
        fields: Object.fromEntries(
          g.items.map((v) => [
            v.key,
            {
              editable: v.editable,
              secret: false,
              restart_required: v.pending,
              ...(v.pending ? { apply_target: "fixture-view" } : {}),
              ...(!v.editable ? { read_only_reason: v.reason } : {}),
            },
          ]),
        ),
        capabilities: { can_read: true, can_update: true, can_reset: true, can_validate: true },
      }
    }),
    health: [
      { id: "health", label: "Recorded fixture health", section: "status", stale_after_ms: 120000 },
    ],
    stats: [
      {
        id: "tokens",
        label: "Recorded token receipts",
        section: "status",
        stale_after_ms: 120000,
        unit: "count",
        kind: "counter",
      },
    ],
    series: [
      {
        id: "token-series",
        label: "Recorded token UTC samples",
        section: "diagnostics",
        stale_after_ms: 120000,
        unit: "count",
        kind: "counter",
        max_points: 16,
        max_window_seconds: 3600,
      },
    ],
    diagnostics: [
      {
        id: "diagnostics",
        label: "Declared diagnostic (no supplied observation)",
        section: "diagnostics",
        stale_after_ms: 120000,
        schema: { version: 1, fields: [] },
      },
    ],
  }
  // Controlled negative wire appearances; only kit guard branches receive them.
  const wire = structuredClone(manifest) as unknown as Record<string, unknown>
  if (appearance === "malformed") delete wire.stats
  if (appearance === "contradictory") wire.health = [{ ...manifest.health[0], section: "settings" }]
  if (appearance === "duplicate") wire.settings = [manifest.settings[0], manifest.settings[0]]
  if (appearance === "empty")
    for (const name of ["settings", "health", "stats", "series", "diagnostics"]) wire[name] = []
  const supplied = wire as unknown as AdminManifest
  if (appearance === "missing-snapshot") delete settings.workspace
  if (appearance === "group-loading") settings.workspace = { phase: "loading" }
  if (appearance === "group-error")
    settings.workspace = {
      phase: "error",
      error: "Authored group read failed; no successful snapshot.",
    }
  if (appearance === "retained-group-error")
    settings.workspace = {
      ...settings.workspace,
      phase: "error",
      error: "Authored group refresh failed.",
    }
  const accessible =
    appearance !== "denied" && !["denied", "permission-denied", "unavailable"].includes(context)
  const contextKey = `admin-review/${context}`
  const discovery: AdminContentProps["discovery"] = {
    contextKey: appearance === "context-mismatch" ? "retired-context" : contextKey,
    phase:
      appearance.includes("loading") && appearance !== "group-loading"
        ? "loading"
        : appearance.includes("error") && !appearance.includes("group-error")
          ? "error"
          : "ready",
    ...(!appearance.startsWith("initial-") ? { manifest: supplied } : {}),
    ...(appearance.includes("error")
      ? { error: "Authored discovery failure; no request performed." }
      : {}),
  }
  const problem =
    discovery.contextKey !== contextKey
      ? "Context mismatch"
      : discovery.manifest
        ? adminManifestProblem(discovery.manifest)
        : "No declaration"
  const source = [
    "admin-review/v1",
    administration.version,
    observation.fixture.version,
    observation.operations.version,
    administration.clock,
    contextKey,
    appearance,
    manifest.revision,
  ].join("/")
  return {
    appearance,
    copy,
    source,
    contextKey,
    accessible,
    problem,
    manifest: supplied,
    discovery,
    settings,
    nowMs: Date.parse(administration.clock),
    observations:
      appearance === "missing-observation"
        ? {}
        : {
            health: {
              health: {
                status: observation.health,
                checks: observation.checks,
                observation: observation.observations.health,
              },
            },
            stats: {
              tokens: {
                value: observation.stats[0].value,
                observation: observation.observations.stats,
              },
            },
            series: { "token-series": observation.series },
          },
    groups,
    administration,
    observation,
  }
}
export type AdminReviewModel = ReturnType<typeof adminReviewModel>
export function admittedTarget(data: AdminReviewModel, target: AdminTarget): boolean {
  if (!data.accessible || data.problem) return false
  if (!adminPages(data.manifest).includes(target.page)) return false
  return (
    target.groupId === undefined ||
    (target.page === "settings" && data.manifest.settings.some((g) => g.id === target.groupId))
  )
}
export function adminDestinationIntent(data: AdminReviewModel, target: AdminSelection) {
  if (!admittedTarget(data, target)) return null
  return {
    source: data.source,
    context: data.contextKey,
    revision: data.manifest.revision,
    page: target.page,
    group: target.groupId ?? null,
    fixedUtc: data.administration.clock,
    policy: "Read-only local destination inspection; no settings/setup/collection action.",
  }
}
