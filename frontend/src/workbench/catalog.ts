import { Activity, Compass, Gauge, Layers, Mail, MessageSquare, Users } from "lucide-react"
export const groups = [
  "All",
  "Operations",
  "Communications",
  "Administration",
  "Evidence",
  "Developer",
  "Voice",
] as const
export type Group = (typeof groups)[number]
const icons = { Activity, Compass, Gauge, Layers, Mail, MessageSquare, Users }
type Definition = {
  id: string
  group: Exclude<Group, "All">
  icon: keyof typeof icons
  source: string
  scope: string
  gap: string
  story: string
  playback?: boolean
}
export const destinations: readonly Definition[] = [
  {
    id: "Ops Dashboard",
    group: "Operations",
    icon: "Gauge",
    source: "Recorded operations prefix",
    scope: "Unified Activity/Mission/Usage task summary and distinct exact metric companion.",
    gap: "Torque heatmap semantics and full chart fidelity remain partial; no live collection.",
    story: "operations-unified-dashboard--activity",
    playback: true,
  },
  {
    id: "Event Ledger",
    group: "Evidence",
    icon: "Activity",
    source: "Recorded operations event/log prefix",
    scope:
      "Admitted supplied UTC events/logs with native semantic table and bounded review scroll.",
    gap: "No live telemetry or inferred events; absent foreign references stay unknown.",
    story: "evidence-event-ledger--recorded",
    playback: true,
  },
  {
    id: "Directory Review",
    group: "Administration",
    icon: "Users",
    source: "Independent administration/v1 snapshot",
    scope:
      "Readonly fictional users, roles and permission metadata with profile tabs and provenance.",
    gap: "No identity assurance or authorization; unresolved references are unknown, not zero.",
    story: "administration-directory-review--recorded",
  },
  {
    id: "Activity",
    group: "Operations",
    icon: "Activity",
    source: "Recorded operations prefix",
    scope: "Fixed-clock run-start calendar, pulse and recent runs.",
    gap: "App calendar adaptation; full Torque reference fidelity remains partial.",
    story: "operations-fixed-activity--populated",
    playback: true,
  },
  {
    id: "Mission Control",
    group: "Operations",
    icon: "Compass",
    source: "Recorded operations prefix",
    scope: "Run volume, status distributions, task pipeline and admitted receipts.",
    gap: "Receipt totals may be partial; task lifecycle differs from run lifecycle.",
    story: "operations-controlled-views--mission-control",
    playback: true,
  },
  {
    id: "Usage",
    group: "Operations",
    icon: "Gauge",
    source: "Recorded operations prefix",
    scope: "UTC receipt-cost and input/output token rollups.",
    gap: "No provider/model cost allocation; absent receipts are unknown.",
    story: "operations-controlled-views--usage",
    playback: true,
  },
  {
    id: "Contacts",
    group: "Communications",
    icon: "Users",
    source: "Full communications/v1 snapshot",
    scope: "Fictional directory and related conversations.",
    gap: "App-owned directory; no contact edits or live transport.",
    story: "communications-controlled-views--contacts",
  },
  {
    id: "Messages",
    group: "Communications",
    icon: "Mail",
    source: "Full communications/v1 snapshot",
    scope: "Email/SMS/Tether-style messages and local draft intent inspection.",
    gap: "No send, delivery or attachment upload effects.",
    story: "communications-controlled-views--messages",
  },
  {
    id: "Chat",
    group: "Communications",
    icon: "MessageSquare",
    source: "Full communications/v1 snapshot",
    scope: "Session, tool and interactive-card overview with manual preview.",
    gap: "Uncommitted stream preview; no model/tool execution.",
    story: "communications-controlled-views--chat",
  },
  {
    id: "Conversation Review",
    group: "Communications",
    icon: "MessageSquare",
    source: "Full communications/v1 snapshot + authored preview",
    scope: "Native composer/history, prompt and confirmation candidate review.",
    gap: "Candidates never append messages or mutate prior card responses.",
    story: "conversation-controlled-conversation-review--transcript",
  },
  {
    id: "Administration",
    group: "Administration",
    icon: "Layers",
    source: "Full administration/v1 snapshot",
    scope: "Desired settings, provenance, setup intent and separate observations.",
    gap: "No saving, setup or restarts; broader fixture families remain partial.",
    story: "administration-controlled-review--admin",
  },
  {
    id: "Account",
    group: "Administration",
    icon: "Users",
    source: "Full administration/v1 snapshot",
    scope: "Fictional principal/profile plus user/role/permission joins.",
    gap: "No identity assurance, grants or auth evaluator.",
    story: "administration-controlled-review--account",
  },
  {
    id: "Settings Review",
    group: "Administration",
    icon: "Layers",
    source: "Authored local review-control settings",
    scope: "Four settings forms/provenance/wizard exports and candidate plans.",
    gap: "Separate from administration settings; no source mutation.",
    story: "settings-controlled-field-review--provenance",
  },
  {
    id: "Account Review",
    group: "Administration",
    icon: "Users",
    source: "Immutable principal + authored metadata",
    scope: "Profile/preferences and token/provider metadata candidate inspection.",
    gap: "No credentials or connection changes; disclosure unmounted.",
    story: "account-controlled-account-review--profile",
  },
  {
    id: "Observability",
    group: "Operations",
    icon: "Activity",
    source: "Recorded compatible operations/observations prefix",
    scope: "Logs, traces, health/usage samples and bounded review timeline.",
    gap: "Eight-record source only; receipt timestamps differ from derived event data.",
    story: "observability-controlled-inspection--evidence",
    playback: true,
  },
  {
    id: "Observation Review",
    group: "Evidence",
    icon: "Activity",
    source: "Fixed observations snapshot + authored clock",
    scope: "Availability/freshness, retained health/stat and exact UTC samples.",
    gap: "Retry only inspects; diagnostic Copy action remains unadopted.",
    story: "observation-controlled-observation-review--recorded",
  },
  {
    id: "Admin Review",
    group: "Administration",
    icon: "Layers",
    source: "Fixed declaration/snapshot projection",
    scope: "Read-only navigation/content and optional standalone AdminShell.",
    gap: "Portable destinations local only; valid diagnostics not mounted.",
    story: "admin-controlled-admin-review--recorded",
  },
  {
    id: "Developer",
    group: "Developer",
    icon: "Layers",
    source: "Full developer/v1 snapshot",
    scope: "Source/proposal/diff/output and immutable workflow overview.",
    gap: "No editor saving, execution or Shiki highlighting.",
    story: "developer-controlled-review--source",
  },
  {
    id: "Voice",
    group: "Voice",
    icon: "Layers",
    source: "Fixed voice/v1 snapshot + authored tone",
    scope: "Local audio controls, authored transcript timing and voice selection.",
    gap: "No capture/devices/provider; tone is not spoken transcript audio.",
    story: "voice-controlled-review--local-audio",
  },
  {
    id: "Examples",
    group: "Evidence",
    icon: "MessageSquare",
    source: "Recorded prefix + representative shared examples",
    scope: "Embedded fixture primitives and controlled plugin contribution.",
    gap: "Linked primitive story is representative, not the complete Examples page.",
    story: "primitives-controlled-gallery--recorded",
    playback: true,
  },
  {
    id: "Primitives",
    group: "Evidence",
    icon: "Layers",
    source: "Full operations snapshot + authored local states",
    scope: "Nine bounded primitive/form/dialog examples.",
    gap: "Independent prop coverage is limited to documented supported states.",
    story: "primitives-controlled-gallery--recorded",
  },
  {
    id: "Evidence",
    group: "Evidence",
    icon: "Layers",
    source: "Full operations snapshot + authored payload states",
    scope: "Structured payload, metadata, summary and native search.",
    gap: "JsonModal Copy action excluded; malformed raw source separately labelled.",
    story: "evidence-controlled-inspector--recorded",
  },
  {
    id: "Widgets",
    group: "Operations",
    icon: "Layers",
    source: "Recorded operations prefix + authored coverage",
    scope: "Six compact widgets with UTC buckets, denominators and accessible tables.",
    gap: "Numeric-only widgets withhold interior gaps; no ambient-date charts.",
    story: "widgets-recorded-review--recorded",
    playback: true,
  },
  {
    id: "Layouts",
    group: "Evidence",
    icon: "Layers",
    source: "Same recorded operations prefix",
    scope: "List/table/split/drawer and rail/header/drawer comparison.",
    gap: "Comparison layout owns its body scroll; selected current record remains local.",
    story: "layouts-controlled-comparison--split",
    playback: true,
  },
  {
    id: "Run Explorer",
    group: "Operations",
    icon: "Layers",
    source: "Recorded operations prefix",
    scope: "Native search/facets/sort/checkboxes and bounded 80-record reveal.",
    gap: "Offline reveal, not fetch; checks select only revealed rows.",
    story: "operations-run-explorer--recorded",
    playback: true,
  },
  {
    id: "Developer Evidence",
    group: "Developer",
    icon: "Layers",
    source: "Compatible eight-record developer boundary + operations prefix",
    scope: "Authored test ledger, original stack and fictional commit/file evidence.",
    gap: "Tests are supplied review fixtures, not executed CI.",
    story: "developer-independent-evidence--recorded",
    playback: true,
  },
  {
    id: "Workflow Review",
    group: "Developer",
    icon: "Layers",
    source: "Compatible eight-record graph boundary + authored specimens",
    scope: "Immutable node/relationship inspection and seven canvas names.",
    gap: "Decorative/temporary edges never imply runtime progress or graph edits.",
    story: "developer-workflow-review--recorded",
    playback: true,
  },
  {
    id: "Conversation Evidence",
    group: "Communications",
    icon: "MessageSquare",
    source: "Compatible eight-record operations prefix + snapshot metadata",
    scope: "Admitted tools/messages, authored explanation and static provenance.",
    gap: "Communication metadata withheld before snapshot clock; no retrieval.",
    story: "chat-conversation-evidence--recorded",
    playback: true,
  },
  {
    id: "Usage Evidence",
    group: "Evidence",
    icon: "Gauge",
    source: "Compatible eight-record receipt prefix + authored capacity specimens",
    scope: "Unknown context capacity, exact amounts and readonly receipt preview.",
    gap: "Receipt totals are not context occupancy; missing parts remain unknown.",
    story: "chat-usage-evidence--recorded",
    playback: true,
  },
]
export const workbenchEntry = { id: "Review Workbench", icon: "Layers" as const }
export function normalizeView(value: string | null) {
  return value === workbenchEntry.id || destinations.some((d) => d.id === value)
    ? (value as string)
    : "Activity"
}
export function viewIcon(name: keyof typeof icons) {
  return icons[name]
}
export function storyDestination(host: string, story: string) {
  if (!destinations.some((d) => d.story === story)) return null
  let origin: string | null = null
  if (
    [
      "parallax.nanite.cloud",
      "parallax.os.nanite.cloud",
      "parallax-stories.nanite.cloud",
      "192.168.1.195",
      "100.112.71.40",
    ].includes(host.split(":")[0])
  )
    origin = "https://parallax-stories.nanite.cloud"
  else if (
    [
      "127.0.0.1:18541",
      "localhost:18541",
      "127.0.0.1:18545",
      "localhost:18545",
      "127.0.0.1:18542",
      "localhost:18542",
    ].includes(host)
  )
    origin = "http://127.0.0.1:18542"
  else if (
    [
      "localhost:18441",
      "127.0.0.1:18441",
      "localhost:5173",
      "127.0.0.1:5173",
      "localhost:18442",
      "127.0.0.1:18442",
    ].includes(host)
  )
    origin = "http://localhost:18442"
  return origin
    ? `${origin}/iframe.html?${new URLSearchParams({ id: story, viewMode: "story" })}`
    : null
}
export function matchDestinations(query: string, group: Group) {
  const q = query.trim().toLowerCase()
  return destinations.filter(
    (d) =>
      (group === "All" || d.group === group) &&
      `${d.id} ${d.source} ${d.scope} ${d.gap}`.toLowerCase().includes(q),
  )
}
