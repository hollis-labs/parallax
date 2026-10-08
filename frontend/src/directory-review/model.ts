import { administrationFixture as fixture } from "../administration/model"
export const appearances = [
  "recorded",
  "empty",
  "loading",
  "error",
  "denied",
  "unknown",
  "missing",
  "unassigned",
  "locked",
  "long",
] as const
export type Appearance = (typeof appearances)[number]
export function directoryModel(state: Appearance, context = "populated", sourceCopy = 0) {
  const blocked = ["loading", "error", "denied"].includes(state) || context === "permission-denied"
  const users =
    blocked || state === "empty"
      ? []
      : fixture.users.map((u, i) => ({
          ...u,
          roleIds:
            state === "missing" && i === 0
              ? ["ROLE-ABSENT"]
              : state === "unassigned" && i === 0
                ? []
                : u.roleIds,
          state:
            state === "unknown"
              ? "unclassified-fixture-state"
              : state === "locked"
                ? "locked"
                : u.state,
          name:
            state === "long" && i === 0
              ? `${u.name} · ${"Authored long directory label <script>alert(1)</script> ".repeat(8)}`
              : u.name,
        }))
  return {
    fixture,
    state,
    users,
    blocked,
    source: `${fixture.version}/${fixture.clock}/${context}/${state}/${sourceCopy}`,
    authored: state !== "recorded",
  }
}
export function relationships(data: ReturnType<typeof directoryModel>, userId: string) {
  const user = data.users.find((u) => u.id === userId)
  if (!user) return null
  const roles = user.roleIds.map((id) => ({
    id,
    record: data.fixture.roles.find((r) => r.id === id),
  }))
  const ids = [...new Set(roles.flatMap((r) => r.record?.permissionIds ?? []))]
  const permissions = ids.map((id) => ({
    id,
    record: data.fixture.permissions.find((p) => p.id === id),
  }))
  return {
    user,
    roles,
    permissions,
    complete: roles.every((r) => !!r.record) && permissions.every((p) => !!p.record),
  }
}
