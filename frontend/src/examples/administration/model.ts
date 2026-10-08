import { administrationFixture as fixture } from "../../administration/model"
export const adminPages = [
  "directory",
  "profile",
  "roles",
  "permissions",
  "account",
  "settings",
  "setup",
] as const
export const adminAppearances = [
  "recorded",
  "empty",
  "loading",
  "error",
  "denied",
  "locked",
  "unknown",
  "long",
  "missing",
  "degraded",
] as const
export type AdministrationState = {
  page: (typeof adminPages)[number]
  user: string
  query: string
  appearance: (typeof adminAppearances)[number]
  theme: "p4-white" | "p1-green-phosphor" | "p3-amber-phosphor" | "hi-contrast"
  mode: "light" | "dark"
}
export const defaultAdministrationState: AdministrationState = {
  page: "directory",
  user: "",
  query: "",
  appearance: "recorded",
  theme: "p4-white",
  mode: "light",
}
export function administrationModel(state: AdministrationState) {
  const accessible = !["loading", "error", "denied", "unknown"].includes(state.appearance)
  const users =
    accessible && state.appearance !== "empty"
      ? fixture.users.map((u) => ({
          ...u,
          name:
            state.appearance === "long"
              ? `${u.name} · Authored long name <script>neverExecute()</script> ${"Review metadata ".repeat(8)}`
              : u.name,
        }))
      : []
  const matches = users.filter((u) =>
    `${u.name} ${u.email} ${u.id}`.toLowerCase().includes(state.query.toLowerCase()),
  )
  const user = matches.find((u) => u.id === state.user)
  return {
    fixture,
    accessible,
    users,
    matches,
    user,
    source: JSON.stringify([
      fixture.version,
      fixture.generator,
      fixture.seed,
      fixture.clock,
      state,
    ]),
  }
}
export function normalizeAdministrationState(params: URLSearchParams): AdministrationState {
  const s = {
    ...defaultAdministrationState,
    page: params.get("page") ?? "directory",
    user: params.get("user") ?? "",
    query: params.get("query") ?? "",
    appearance: params.get("appearance") ?? "recorded",
    theme: params.get("theme") ?? "p4-white",
    mode: params.get("mode") === "dark" ? "dark" : "light",
  } as AdministrationState
  if (!adminPages.includes(s.page)) s.page = "directory"
  if (!adminAppearances.includes(s.appearance)) s.appearance = "recorded"
  if (!["p4-white", "p1-green-phosphor", "p3-amber-phosphor", "hi-contrast"].includes(s.theme))
    s.theme = "p4-white"
  if (!administrationModel(s).user) s.user = ""
  return s
}
export function administrationHref(s: AdministrationState) {
  return `/?${new URLSearchParams({ example: "administration", ...s })}`
}
