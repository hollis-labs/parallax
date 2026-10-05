import artifact from "../fixtures/administration.json" with { type: "json" }
export const administrationFixture = artifact
export const accountStates = [
  "identified",
  "unknown",
  "denied",
  "locked",
  "profile-draft",
  "error",
] as const
export type AccountState = (typeof accountStates)[number]
export function accountModel(state: AccountState) {
  const user = artifact.users.find((u) => u.id === artifact.currentUserId)!
  return {
    artifact,
    user,
    accessible: state !== "denied",
    readOnly: state === "locked" || state === "unknown" || state === "error",
    identity: state === "unknown" ? undefined : user,
  }
}
export function linkedRoles(userId: string) {
  const u = artifact.users.find((u) => u.id === userId)
  return artifact.roles.filter((r) => u?.roleIds.includes(r.id))
}
export function linkedPermissions(roleId: string) {
  const role = artifact.roles.find((r) => r.id === roleId)
  return artifact.permissions.filter((p) => role?.permissionIds.includes(p.id))
}
