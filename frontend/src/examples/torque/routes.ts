import { normalizeScenario, operationsModel } from "../../operations/model"
import { type ResourceOverride, resourceOverrides, timelineFrames } from "../../playback/model"
import { torqueDefinition } from "../contracts"
import { type TorqueProfile, torqueProfiles, torqueSource } from "./reference"
export const torqueRoutes = torqueDefinition.destinations.map((d) => d.id)
export type TorqueRoute = (typeof torqueRoutes)[number]
export type TorqueState = {
  route: TorqueRoute
  tab: "Activity" | "Mission Control" | "Usage"
  profile: TorqueProfile
  scenario: string
  cutoff: string
  query: string
  selected: string | null
  override: ResourceOverride
  theme: string
  mode: "light" | "dark"
}
export function initialTorqueState(params: URLSearchParams): TorqueState {
  const scenario = normalizeScenario(params.get("scenario") ?? "populated"),
    profile = torqueProfiles.find((p) => p === params.get("profile")) ?? "legacy",
    frames = timelineFrames(torqueSource(scenario, profile)),
    raw = params.get("cutoff")
  return admitTorqueState({
    tab:
      params.get("tab") === "Usage"
        ? "Usage"
        : params.get("tab") === "Mission Control"
          ? "Mission Control"
          : "Activity",
    route:
      torqueRoutes.find((r) => r === params.get("screen")) ?? torqueDefinition.defaultDestination,
    scenario,
    profile,
    cutoff: raw && frames.includes(raw) ? raw : frames[frames.length - 1],
    query: params.get("query") ?? "",
    selected: params.get("selected"),
    override: resourceOverrides.find((r) => r === params.get("resource")) ?? "scenario",
    theme:
      ["p4-white", "p1-green-phosphor", "p3-amber-phosphor", "hi-contrast"].find(
        (t) => t === params.get("theme"),
      ) ?? "p4-white",
    mode: params.get("mode") === "dark" ? "dark" : "light",
  })
}
export function torqueHref(state: TorqueState, patch: Partial<TorqueState> = {}) {
  const s = { ...state, ...patch },
    p = new URLSearchParams({
      [torqueDefinition.entry.parameter]: torqueDefinition.entry.value,
      screen: s.route,
      tab: s.tab,
      scenario: s.scenario,
      profile: s.profile,
      cutoff: s.cutoff,
      theme: s.theme,
      mode: s.mode,
    })
  if (s.query) p.set("query", s.query)
  if (s.selected) p.set("selected", s.selected)
  if (s.override !== "scenario") p.set("resource", s.override)
  return `/?${p}`
}

export function admitTorqueState(state: TorqueState): TorqueState {
  const model = operationsModel(state.scenario, state.query, {
    source: torqueSource(state.scenario, state.profile),
    cutoff: state.cutoff,
    override: state.override,
  })
  return model.tasks.some((t) => t.id === state.selected) ? state : { ...state, selected: null }
}
