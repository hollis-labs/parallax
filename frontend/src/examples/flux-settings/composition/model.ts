import type { SettingsGroup, SettingsProvenanceState } from "@hollis-labs/kit-settings"

export const compositionIdentity = "flux-settings-composition/4421/2026-10-04T14:30:00Z"
export const navigation = [
  {
    label: "You",
    items: ["profile", "preferences", "appearance", "layout", "shortcuts", "permissions"],
  },
  { label: "AI", items: ["providers", "agents"] },
  { label: "Extensions", items: ["plugins"] },
  { label: "System", items: ["observability"] },
] as const
export const sections = navigation.flatMap((g) => [...g.items])
export type Section = (typeof sections)[number] | "system-prompts" | "inspector"
export const titles: Record<Section, string> = {
  profile: "Profile",
  preferences: "Preferences",
  appearance: "Appearance",
  shortcuts: "Shortcuts",
  layout: "Layout",
  permissions: "Permissions",
  providers: "Providers",
  agents: "Agents",
  plugins: "Plugins",
  observability: "Observability",
  "system-prompts": "System Prompts",
  inspector: "Inspector",
}
export const scenarios = [
  "populated",
  "read-only",
  "empty",
  "loading",
  "error",
  "access-denied",
  "malformed-preferences",
] as const
export type Scenario = (typeof scenarios)[number]
export function sectionFromHash(developer: boolean): Section {
  const id = typeof location === "undefined" ? "" : location.hash.slice(1)
  return sections.includes(id as (typeof sections)[number]) ||
    (developer && (id === "system-prompts" || id === "inspector"))
    ? (id as Section)
    : "appearance"
}

// Opaque keys, including zero-like and punctuation-rich IDs, are never derived from labels.
export const providers = [
  {
    id: "0",
    name: "Local Studio",
    type: "local",
    enabled: true,
    status: "Ready (fixture)",
    credential: "not required",
    models: 2,
  },
  {
    id: "provider:cloud/a?4421",
    name: "Cloud Atlas",
    type: "cloud",
    enabled: true,
    status: "Configured (fixture)",
    credential: "present (metadata only)",
    models: 3,
  },
  {
    id: "provider:disabled",
    name: "Archive CLI",
    type: "cli",
    enabled: false,
    status: "Disabled",
    credential: "absent",
    models: 0,
  },
] as const
export const agents = [
  {
    id: "0",
    name: "Researcher",
    status: "enabled",
    source: "managed",
    description: "Review evidence and report uncertainty.",
    model: "atlas-small",
    skills: ["Research", "Summarize"],
    prompt: "Use supplied fictional evidence and cite its source.",
  },
  {
    id: "agent:/writer?4421",
    name: "Writer",
    status: "enabled",
    source: "fixture file",
    description: "Draft clear, focused documents.",
    model: "local-text",
    skills: ["Write", "Edit"],
    prompt: "Draft concise prose from the supplied local material.",
  },
  {
    id: "agent:disabled",
    name: "Retired Reviewer",
    status: "disabled",
    source: "managed",
    description: "Disabled fixture specimen.",
    model: "",
    skills: [],
    prompt: "",
  },
] as const
export const plugins = [
  {
    id: "0",
    name: "Notebook",
    version: "1.2.0-fixture",
    status: "active",
    description: "Local note cards and a read-only shortcut specimen.",
    tools: 2,
    config: true,
  },
  {
    id: "plugin:/inspector?4421",
    name: "Inspector",
    version: "0.4.0-fixture",
    status: "disabled",
    description: "An inactive extension specimen.",
    tools: 0,
    config: false,
  },
] as const
export const executions = [
  { id: "exec:0", time: "14:26", provider: "Local Studio", duration: 0, cost: 0, error: "" },
  { id: "exec:1", time: "14:27", provider: "Cloud Atlas", duration: 1240, cost: 0.002, error: "" },
  {
    id: "exec:2",
    time: "14:28",
    provider: "Local Studio",
    duration: 810,
    cost: 0,
    error: "Fixture timeout",
  },
  { id: "exec:3", time: "14:29", provider: "Cloud Atlas", duration: 2140, cost: 0.004, error: "" },
] as const
export const workers = [
  {
    id: "0",
    agent: "Researcher",
    type: "full",
    status: "running",
    age: "2m ago",
    session: "session:/4421",
    path: undefined,
  },
  {
    id: "worker:/draft?4421",
    agent: "Writer",
    type: "light",
    status: "completed",
    age: "4m ago",
    session: "0",
    path: "",
  },
] as const
export const defaultChain = [providers[0].id, providers[1].id]
export function validatedChain(value: unknown): { chain: string[]; problem: string | null } {
  const valid =
    Array.isArray(value) &&
    value.every(
      (id) => typeof id === "string" && providers.some((p) => p.id === id && p.enabled),
    ) &&
    new Set(value).size === value.length
  return valid
    ? { chain: [...value], problem: null }
    : {
        chain: [...defaultChain],
        problem: "Malformed fixture preference rejected; using authored fallback order.",
      }
}

type Scalar = string | number | boolean
export function formFixture(
  id: string,
  label: string,
  fields: Record<
    string,
    {
      title: string
      value?: Scalar
      options?: readonly string[]
      readOnly?: boolean
      secret?: boolean
    }
  >,
  editable: boolean,
) {
  const group: SettingsGroup = {
    id,
    label,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: Object.fromEntries(
        Object.entries(fields).map(([key, f]) => [
          key,
          {
            type:
              typeof f.value === "number"
                ? "integer"
                : typeof f.value === "boolean"
                  ? "boolean"
                  : "string",
            title: f.title,
            ...(f.options ? { enum: [...f.options] } : {}),
            ...(f.readOnly || !editable ? { readOnly: true } : {}),
            ...(f.secret ? { writeOnly: true } : {}),
          },
        ]),
      ),
    },
    fields: Object.fromEntries(
      Object.entries(fields).map(([key, f]) => [
        key,
        {
          editable: editable && !f.readOnly && !f.secret,
          secret: f.secret ?? false,
          restart_required: false,
          ...(!editable || f.readOnly || f.secret
            ? {
                read_only_reason: f.secret
                  ? "Presence metadata only; no credential input"
                  : "Read-only fixture",
              }
            : {}),
        },
      ]),
    ),
    capabilities: { can_read: true, can_update: editable, can_validate: true, can_reset: editable },
  }
  const state: SettingsProvenanceState = {
    values: Object.fromEntries(
      Object.entries(fields).map(([key, f]) => [
        key,
        {
          present: f.value !== undefined,
          ...(f.secret
            ? { secret_present: false }
            : f.value !== undefined
              ? { value: f.value }
              : {}),
          editable: editable && !f.readOnly && !f.secret,
          has_override: false,
          ...(f.value !== undefined
            ? { source: { kind: "default", label: "Authored Flux specimen / seed 4421" } }
            : {}),
          apply_state: "active",
          ...(!editable || f.readOnly || f.secret
            ? { read_only_reason: "Read-only fixture metadata" }
            : {}),
        },
      ]),
    ),
    draft: {},
    apply: { restartRequired: false, applyTargets: [] },
  }
  return { group, state }
}
