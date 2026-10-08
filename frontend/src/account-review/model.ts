import type {
  AccountIdentity,
  AccountProfileValue,
  ApiTokenDraft,
  ApiTokenRecord,
  ApiTokenScope,
  ConnectedAccount,
} from "@hollis-labs/kit-account"
import fixture from "../fixtures/administration.json" with { type: "json" }
export const accountAppearances = [
  "recorded",
  "empty",
  "loading",
  "error",
  "denied",
  "read-only",
  "long",
  "unknown-identity",
  "unknown-status",
  "busy",
  "invalid-profile",
  "unavailable-scope",
  "metadata-loading",
  "metadata-error",
] as const
export type AccountAppearance = (typeof accountAppearances)[number]
export const accountModes = ["profile", "metadata"] as const
export type AccountMode = (typeof accountModes)[number]
export function accountReviewModel(
  state: AccountAppearance = "recorded",
  context = "populated",
  principalId = fixture.currentUserId,
  copy = false,
) {
  const principal = fixture.users.find((u) => u.id === principalId) ?? fixture.users[0]
  const denied = state === "denied" || context === "permission-denied"
  const identified = !denied && !["loading", "error", "unknown-identity"].includes(state)
  const busy = state === "busy"
  const editable =
    identified &&
    !busy &&
    !["read-only", "metadata-loading", "metadata-error"].includes(state) &&
    principal.state !== "locked"
  const identity: AccountIdentity =
    denied || state === "unknown-identity"
      ? { state: "unknown" }
      : state === "loading"
        ? { state: "loading" }
        : state === "error"
          ? { state: "error", message: "Authored identity read failure; no request made" }
          : {
              state: "identified",
              displayName: principal.name,
              assurance: "local",
              source: `${fixture.version} fictional principal ${principal.id}; no authentication`,
            }
  const profile: AccountProfileValue = {
    displayName: identified
      ? state === "long"
        ? principal.name + " · ".repeat(2) + "Long local presentation alias ".repeat(8)
        : principal.name
      : "",
    email: identified ? (state === "invalid-profile" ? "invalid-address" : principal.email) : "",
  }
  const scopes: readonly ApiTokenScope[] = [
    {
      id: "records.read",
      label: "Inspect fixture records",
      description: "Authored draft label; does not grant access",
    },
    {
      id: "intents.review",
      label: "Review local intent",
      description: "Metadata-only scope choice; no evaluator",
    },
  ]
  const tokens: readonly ApiTokenRecord[] =
    !identified || state === "empty"
      ? []
      : [
          {
            id: "TOKEN-REVIEW",
            name:
              state === "long"
                ? "Long authored metadata record ".repeat(12)
                : "Authored review token",
            scopes: ["records.read"],
            status: "active",
            canRevoke: editable,
            detail: `Author annotation linked to ${principal.id}; no credential value, prefix or hash exists`,
          },
          {
            id: "TOKEN-UNKNOWN",
            name: "Unclassified authored token",
            scopes: [],
            status: "future-status",
            canRevoke: false,
            detail: "Unknown status is neutral; no revoke action",
          },
        ]
  const providers: readonly ConnectedAccount[] =
    !identified || state === "empty"
      ? []
      : [
          {
            id: "PROVIDER-LOCAL",
            provider: "Fictional inbox",
            status: "disconnected",
            canConnect: editable,
            canDisconnect: false,
            accountLabel: principal.id,
            detail: "Authored provider metadata; no configured transport",
          },
          {
            id: "PROVIDER-ARCHIVE",
            provider: "Fictional archive",
            status: "connected",
            canConnect: false,
            canDisconnect: editable,
            detail: "Authored connected appearance, not evidence of a connection",
          },
          {
            id: "PROVIDER-UNKNOWN",
            provider:
              state === "long" ? "Long unknown provider ".repeat(10) : "Unclassified provider",
            status: "future-status",
            canConnect: false,
            canDisconnect: false,
            detail: "Unknown status never implies healthy connection",
          },
        ]
  const draft: ApiTokenDraft = {
    name: state === "unavailable-scope" ? "Scope review" : "",
    scopes: state === "unavailable-scope" ? ["retired.scope"] : [],
  }
  return {
    fixture,
    principal,
    identity,
    profile,
    scopes,
    tokens,
    providers,
    draft,
    identified,
    editable,
    busy,
    denied,
    state,
    source: `account-review/v1/${fixture.version}/${fixture.clock}/${context}/${principal.id}/${copy ? "reviewed-copy" : "original"}`,
  }
}
export type AccountReviewModel = ReturnType<typeof accountReviewModel>
export type CandidateIntent = {
  kind: "profile" | "preferences" | "create" | "revoke" | "connect" | "disconnect"
  principalId: string
  target: string
  value: unknown
}
export function accountCandidate(
  data: AccountReviewModel,
  kind: CandidateIntent["kind"],
  profile: AccountProfileValue,
  preferences: { density: string; annotations: boolean },
  draft: ApiTokenDraft,
  target: string,
): CandidateIntent | null {
  if (!data.editable) return null
  let value: unknown
  if (kind === "profile") {
    if (
      !profile.displayName.trim() ||
      (profile.email !== "" &&
        !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/.test(
          profile.email,
        ))
    )
      return null
    value = profile
  } else if (kind === "preferences") {
    if (!["comfortable", "compact"].includes(preferences.density)) return null
    value = preferences
  } else if (kind === "create") {
    if (
      !draft.name.trim() ||
      !draft.scopes.length ||
      new Set(draft.scopes).size !== draft.scopes.length ||
      draft.scopes.some((s) => !data.scopes.some((o) => o.id === s))
    )
      return null
    value = draft
  } else if (kind === "revoke") {
    if (!data.tokens.some((t) => t.id === target && t.status === "active" && t.canRevoke))
      return null
    value = { id: target }
  } else {
    const p = data.providers.find((p) => p.id === target)
    if (
      !p ||
      !(kind === "connect"
        ? p.canConnect && ["disconnected", "error"].includes(p.status)
        : p.canDisconnect && ["connected", "error"].includes(p.status))
    )
      return null
    value = { id: target, status: p.status }
  }
  return { kind, principalId: data.principal.id, target, value }
}
