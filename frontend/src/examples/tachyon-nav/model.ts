import manifests from "./manifests.json"
import { matchRoute, parseLocation, validPattern } from "./route-grammar"
export const reference = "2026-10-04T14:30:00Z"
export const seed = 4421
export const scenarios = [
  "populated",
  "empty",
  "denied",
  "unavailable",
  "degraded",
  "duplicate",
  "reserved",
  "missing-parent",
  "orphan",
  "retired",
  "hidden",
  "owner-conflict",
] as const
export type Scenario = (typeof scenarios)[number]
export interface Group {
  id: string
  label: string
  icon: string
  priority: number
  owner: string
  explicitOwner: boolean
  footer?: boolean
}
export interface Item {
  id: string
  label: string
  group: string
  route: string
  owner: string
  parent?: string
  hidden?: boolean
  reason?: string
}
export interface Refusal {
  id: string
  reason: string
}
export interface Fixture {
  groups: Group[]
  items: Item[]
  refusals: Refusal[]
  status: string
  accessible: boolean
}
export const subnav = {
  work: [
    { label: "Tasks", route: "/work" },
    { label: "Board", route: "/work/board" },
  ],
  observability: [
    { label: "Events", route: "/observe" },
    { label: "Runs", route: "/observe/logs" },
    { label: "Metrics", route: "/observe/metrics" },
  ],
  services: [
    { label: "Overview", route: "/services" },
    { label: "Health", route: "/services/health" },
  ],
}
// Fixture aliases Events/Runs map to current Activity/Logs; never claim new Tachyon pages.
export function fixture(scenario: Scenario): Fixture {
  const groups: Group[] = manifests.flatMap((m) =>
    m.groups.map((g) => ({
      ...g,
      owner: m.owner,
      explicitOwner: true,
      footer: g.id === "settings",
    })),
  )
  const items: Item[] = manifests.flatMap((m) =>
    m.items.map((i) => ({
      id: i.id,
      label: i.label,
      route: i.route,
      group: i.group,
      owner: m.owner,
    })),
  )
  for (const item of items) {
    const parent = items.find(
      (i) =>
        i.group === item.group && i.route !== item.route && item.route.startsWith(`${i.route}/`),
    )
    if (parent) item.parent = parent.id
  }
  const refusals: Refusal[] = []
  if (scenario === "hidden")
    for (const item of items.filter((i) => i.id === "work_board")) item.hidden = true
  if (scenario === "orphan" || scenario === "degraded")
    items.push({
      id: "cross-plugin",
      label: "Orphan inspection",
      group: "absent-plugin",
      route: "/fixture-orphan",
      owner: "fixture-plugin",
    })
  if (scenario === "retired")
    for (const item of items.filter((i) => i.owner === "session-ops"))
      item.reason = "Plugin retired: fixture crash budget exhausted"
  if (scenario === "duplicate")
    items.push({ ...(items.find((i) => i.id === "work_list") as Item), owner: "zz-fixture-plugin" })
  if (scenario === "reserved")
    for (const route of ["/dashboard", "/plugin-recovery", "/settings", "/:root"])
      items.push({
        id: `claim-${route}`,
        label: "Forbidden claim",
        route,
        group: "work",
        owner: "zz-fixture-plugin",
      })
  if (scenario === "missing-parent")
    items.push({
      id: "fixture-child",
      label: "Dropped child",
      group: "work",
      route: "/fixture-child",
      owner: "fixture-plugin",
      parent: "absent-parent",
    })
  if (scenario === "owner-conflict")
    groups.push({
      id: "work",
      label: "Wrong alphabetical winner",
      icon: "activity",
      priority: 1,
      owner: "a-fixture-plugin",
      explicitOwner: false,
    })
  const admitted = admitFixture(groups, items)
  refusals.push(...admitted.refusals)
  if (scenario === "empty")
    return {
      groups: [],
      items: [],
      refusals,
      status: "Empty successful discovery",
      accessible: true,
    }
  return {
    groups: admitted.groups,
    items: admitted.items,
    refusals,
    status:
      scenario === "unavailable"
        ? "Discovery unavailable; admission withheld"
        : scenario === "denied"
          ? "Access denied; admission withheld"
          : scenario === "degraded"
            ? "Discovery degraded; admitted subset available"
            : "Discovery successful",
    accessible: !["unavailable", "denied"].includes(scenario),
  }
}
export function resolve(hash: string, model: Fixture) {
  const location = parseLocation(hash)
  if (!location.valid) return { reason: "Invalid route encoding or syntax" }
  if (!model.accessible) return { reason: model.status }
  const item = model.items.find((i) => matchRoute(i.route, location.path) !== null)
  if (item) return { item, reason: item.reason }
  const detail = matchRoute("/work/:id", location.path)
  const work = model.items.find((i) => i.route === "/work")
  if (detail && work) return { item: work, detail: detail.id }
  return { reason: "Unknown route: no admitted declaration" }
}
export function admittedPattern(route: string, owner: string) {
  if (!validPattern(route) || route.split("/")[1].startsWith(":")) return false
  if (/^\/(dashboard|plugin-recovery)(\/|$)/.test(route)) return false
  return !/^\/settings(\/|$)/.test(route) || owner === "config-ops"
}
/** Bounded local fixture admission; not a registry-v2 parser or production projector. */
export function admitFixture(groups: Group[], candidates: Item[]) {
  const items: Item[] = [],
    refusals: Refusal[] = []
  const winners = new Map<string, Group>()
  for (const group of [...groups].sort((a, b) => a.owner.localeCompare(b.owner))) {
    const prior = winners.get(group.id)
    if (!prior || (group.explicitOwner && !prior.explicitOwner)) winners.set(group.id, group)
    if (prior)
      refusals.push({
        id: group.id,
        reason: `Group metadata owner ${winners.get(group.id)?.owner} wins`,
      })
  }
  groups = [...winners.values()].sort((a, b) => a.priority - b.priority)
  for (const item of [...candidates].sort((a, b) => a.owner.localeCompare(b.owner))) {
    if (!admittedPattern(item.route, item.owner)) {
      refusals.push({ id: item.id, reason: "Reserved route claim refused or invalid pattern" })
      continue
    }
    if (items.some((i) => i.id === item.id || i.route === item.route)) {
      refusals.push({ id: item.id, reason: "Duplicate id/route dropped; original owner retained" })
      continue
    }
    if (item.parent && !candidates.some((i) => i.id === item.parent)) {
      refusals.push({ id: item.id, reason: "Missing parent: fixture child dropped" })
      continue
    }
    if (!groups.some((g) => g.id === item.group)) {
      if (!groups.some((g) => g.id === "more"))
        groups.push({
          id: "more",
          label: "More",
          icon: "activity",
          priority: 800,
          owner: "core",
          explicitOwner: false,
        })
      refusals.push({ id: item.id, reason: "Missing plugin group; placed in More" })
      items.push({ ...item, group: "more" })
    } else items.push(item)
  }
  return { groups, items, refusals }
}
export type Action =
  | { kind: "command"; command: "inspect" }
  | { kind: "navigate"; route: string }
  | { kind: "modal"; modal: "details" }
export interface Contribution {
  id: string
  label: string
  action: Action
}
export const contributions: Contribution[] = [
  {
    id: "inspect",
    label: "Inspect fixture locally",
    action: { kind: "command", command: "inspect" },
  },
  { id: "board", label: "Navigate to Board", action: { kind: "navigate", route: "/work/board" } },
  { id: "details", label: "Open fixture details", action: { kind: "modal", modal: "details" } },
]
