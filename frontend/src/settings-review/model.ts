import {
  evaluateSettings,
  inspectSettingsGroup,
  type SettingsDraft,
  type SettingsGroup,
  type SettingsProvenanceState,
  settingsMetadataProblem,
  snapshotProblem,
} from "@hollis-labs/kit-settings"
import { administrationFixture as fixture } from "../administration/model"
export const fieldStates = [
  "recorded",
  "empty",
  "loading",
  "read-failure",
  "denied",
  "locked",
  "long",
  "unknown-metadata",
  "unsupported-schema",
  "unknown-field",
  "invalid",
  "busy",
  "not-set",
] as const
export type FieldState = (typeof fieldStates)[number]
export const fieldModes = ["group form", "grouped", "provenance", "wizard"] as const
export type FieldMode = (typeof fieldModes)[number]
export type ReviewStates = Record<string, SettingsProvenanceState | undefined>
export function settingsReviewModel(
  state: FieldState = "recorded",
  context = "populated",
  reviewedCopy = false,
) {
  const denied = state === "denied" || context === "permission-denied",
    locked = state === "locked" || state === "read-failure" || state === "unknown-metadata"
  const groups: SettingsGroup[] = [],
    states: ReviewStates = {}
  for (const [id, label, items] of [
    ["workspace", "Desired workspace", fixture.settings.slice(0, 3)],
    ["appearance", "Desired appearance", fixture.settings.slice(3)],
  ] as const) {
    const fields = Object.fromEntries(
      items.map((v) => [
        v.key,
        {
          editable: v.editable && !locked && !denied,
          secret: false,
          restart_required: v.pending,
          ...(v.pending ? { apply_target: "fixture-view" } : {}),
          ...(!v.editable || locked || denied
            ? {
                read_only_reason: locked
                  ? "Read-only review appearance"
                  : denied
                    ? "Fixture access denied"
                    : v.reason,
              }
            : {}),
        },
      ]),
    )
    const properties = Object.fromEntries(
      items.map((v) => [
        v.key,
        {
          type: "string",
          title: v.label,
          description:
            state === "long"
              ? "Authored presentation annotation: " +
                "this bounded label reviews wrapping without changing the source value. ".repeat(5)
              : `Unchanged ${fixture.version} desired value.`,
          ...(v.key === "workspace_label" ? { minLength: 3, maxLength: 80 } : {}),
          ...(v.key === "density" ? { enum: ["comfortable", "compact"] } : {}),
          ...(v.key === "review_window" ? { enum: ["14 days", "28 days"] } : {}),
          ...(!v.editable || locked || denied ? { readOnly: true } : {}),
        },
      ]),
    )
    groups.push({
      id,
      label,
      schema: {
        type: "object",
        additionalProperties: false,
        properties,
        required: id === "workspace" ? ["workspace_label"] : [],
      },
      fields,
      capabilities: {
        can_read: !denied,
        can_update: !locked && !denied,
        can_validate: !denied,
        can_reset: !locked && !denied,
      },
    })
    states[id] = {
      values: Object.fromEntries(
        items.map((v) => [
          v.key,
          {
            present: true,
            value: v.value,
            editable: v.editable && !locked && !denied,
            has_override: v.source === "override",
            ...(!v.editable || locked || denied
              ? {
                  read_only_reason: locked
                    ? "Read-only review appearance"
                    : denied
                      ? "Fixture access denied"
                      : v.reason,
                }
              : {}),
            source: { kind: v.source, label: v.sourceLabel },
            apply_state: v.pending ? "pending_restart" : "active",
          },
        ]),
      ),
      draft: {},
      apply: {
        restartRequired: items.some((v) => v.pending),
        applyTargets: items.some((v) => v.pending) ? ["fixture-view"] : [],
      },
    }
  }
  const editable = !locked && !denied
  groups.push({
    id: "review-controls",
    label: "Authored Review controls",
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        row_limit: {
          type: "integer",
          title: "Review row limit",
          minimum: 0,
          maximum: 8,
          ...(!editable ? { readOnly: true } : {}),
        },
        annotations: {
          type: "boolean",
          title: "Include review annotations",
          ...(!editable ? { readOnly: true } : {}),
        },
        presence: {
          type: "string",
          title: "Review secret presence",
          writeOnly: true,
          readOnly: true,
        },
      },
      required: ["row_limit"],
    },
    fields: {
      row_limit: {
        editable,
        secret: false,
        restart_required: false,
        ...(!editable ? { read_only_reason: "Review context is read only" } : {}),
      },
      annotations: {
        editable,
        secret: false,
        restart_required: false,
        ...(!editable ? { read_only_reason: "Review context is read only" } : {}),
      },
      presence: {
        editable: false,
        secret: true,
        restart_required: false,
        read_only_reason: "Presence metadata only; no secret collection or replacement",
      },
    },
    capabilities: {
      can_read: !denied,
      can_update: editable,
      can_validate: !denied,
      can_reset: editable,
    },
  })
  states["review-controls"] = {
    values: {
      row_limit: {
        present: true,
        value: 0,
        editable,
        has_override: false,
        ...(!editable ? { read_only_reason: "Review context is read only" } : {}),
        source: { kind: "default", label: "Authored form-only scalar example" },
        apply_state: "active",
      },
      annotations: {
        present: true,
        value: false,
        editable,
        has_override: false,
        ...(!editable ? { read_only_reason: "Review context is read only" } : {}),
        source: { kind: "default", label: "Authored form-only boolean example" },
        apply_state: "active",
      },
      presence: {
        present: true,
        secret_present: true,
        editable: false,
        has_override: false,
        read_only_reason: "Presence metadata only; no secret collection or replacement",
        source: { kind: "env", label: "Authored presence-only metadata" },
        apply_state: "unknown",
      },
    },
    draft: {},
    apply: { restartRequired: false, applyTargets: [] },
  }
  if (state === "unknown-metadata" && states.workspace)
    states.workspace = {
      ...states.workspace,
      values: {
        ...states.workspace.values,
        workspace_label: {
          ...states.workspace.values.workspace_label,
          source: {
            kind: "unrecognized-fixture-source",
            label: "Authored unknown metadata appearance",
          },
        },
      },
    }
  if (state === "unsupported-schema")
    groups[0] = {
      ...groups[0],
      schema: {
        type: "object",
        additionalProperties: false,
        properties: { nested: { type: "object", properties: {} } },
      },
      fields: { nested: { editable: true, secret: false, restart_required: false } },
    }
  if (state === "unknown-field" && states.workspace)
    states.workspace = {
      ...states.workspace,
      draft: { unrecognized_field: { kind: "value", value: "Authored invalid draft key" } },
    }
  if (state === "invalid" && states["review-controls"])
    states["review-controls"] = {
      ...states["review-controls"],
      draft: { row_limit: { kind: "text", text: "-" } },
    }
  if (state === "not-set" && states.appearance)
    states.appearance = {
      ...states.appearance,
      values: {
        density: {
          present: false,
          editable,
          has_override: false,
          ...(!editable ? { read_only_reason: "Review context is read only" } : {}),
          apply_state: "unknown",
        },
      },
      apply: { restartRequired: false, applyTargets: [] },
    }
  if (state === "loading") for (const key of Object.keys(states)) states[key] = undefined
  if (state === "read-failure")
    for (const key of Object.keys(states))
      states[key] = states[key]
        ? {
            ...states[key],
            error: "Authored read-error appearance; retained full-snapshot values only.",
          }
        : undefined
  if (state === "busy")
    for (const key of Object.keys(states))
      states[key] = states[key] ? { ...states[key], busy: true } : undefined
  const selectedGroups = state === "empty" ? [] : groups
  return {
    version: "settings-review/v1",
    fixture,
    groups: selectedGroups,
    states,
    denied,
    locked,
    source: `settings-review/v1/${fixture.version}/${fixture.clock}/${context}/${reviewedCopy ? "reviewed-copy" : "original"}`,
    state,
    editable:
      !denied &&
      !locked &&
      !["loading", "busy", "read-failure", "unknown-metadata", "unsupported-schema"].includes(
        state,
      ),
    reviewedCopy,
  }
}
export function groupEvaluation(
  group: SettingsGroup,
  state: SettingsProvenanceState | undefined,
  provenance = false,
) {
  const profile = inspectSettingsGroup(group)
  const problem =
    typeof profile === "string"
      ? profile
      : !profile.canRead
        ? "Reading this group is unavailable."
        : !state
          ? "Waiting for a settings snapshot."
          : snapshotProblem(profile, state.values) ||
            (provenance ? settingsMetadataProblem(group, state) : undefined)
  return {
    problem,
    evaluated:
      typeof profile !== "string" && state && !problem
        ? evaluateSettings(profile, state.values, state.draft)
        : undefined,
  }
}
export function replaceDraft(
  states: ReviewStates,
  groupId: string,
  draft: SettingsDraft,
): ReviewStates {
  const state = states[groupId]
  return state
    ? { ...states, [groupId]: { ...state, draft, validation: undefined, notice: undefined } }
    : states
}
