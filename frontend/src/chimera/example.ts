import type {
  AppIsolationSnapshot,
  HostScope,
  PluginActionIntent,
  RegistryEntry,
  SlotCatalogDefinitions,
} from "@hollis-labs/plugin-host-ui"
import type { KindDescriptor, RegionDescriptor } from "@hollis-labs/plugin-registry"
import { version } from "react"
import { createPresentationComposition, memoryLayoutStorage } from "./composition"
import { createFixtureActions } from "./fixture-actions"
import { store } from "./store"

const intents: Readonly<Record<string, PluginActionIntent>> = {
  "navigate-usage": { type: "navigate", route: "usage", parameters: {} },
  "inspect-detail": {
    type: "modal",
    region: "operations.modal",
    entry: { owner_id: "ops", local_key: "modal" },
    props: {},
  },
  "simulate-review": { type: "command", command: "ops/review", arguments: {} },
}
const definitions = [
  {
    kind: "command",
    region: "operations.commands",
    representation: "handler" as const,
    role: "contribution" as const,
  },
  {
    kind: "widget",
    region: "operations.summary",
    representation: "component" as const,
    role: "widget" as const,
  },
  {
    kind: "panel",
    region: "operations.detail",
    representation: "component" as const,
    role: "contribution" as const,
  },
  {
    kind: "slot",
    region: "operations.toolbar",
    representation: "declarative" as const,
    role: "contribution" as const,
  },
]
const kinds: Record<string, KindDescriptor> = Object.fromEntries(
  definitions.map((d) => [
    d.kind,
    {
      schema_version: 1,
      metadata_schema: {},
      representations: [d.representation],
      regions: d.kind === "widget" ? [d.region, "operations.modal"] : [d.region],
      required_capabilities: [],
    },
  ]),
)
const regions: Record<string, RegionDescriptor> = Object.fromEntries(
  definitions.map((d) => [
    d.region,
    {
      kinds: [d.kind],
      representations: [d.representation],
      context_schema: {},
      ordering: "manifest",
    },
  ]),
)
regions["operations.modal"] = {
  kinds: ["widget"],
  representations: ["component"],
  context_schema: {},
  ordering: "manifest",
}
const metadata = (entry: RegistryEntry) =>
  !!entry.metadata &&
  typeof entry.metadata === "object" &&
  Object.keys(entry.metadata).length === 1 &&
  "label" in entry.metadata &&
  typeof entry.metadata.label === "string" &&
  entry.metadata.label.length > 0 &&
  entry.metadata.label.length <= 120
const catalog: SlotCatalogDefinitions = {
  kinds: definitions.map((d) => ({
    kind: d.kind,
    schemaVersion: 1,
    role: d.role,
    representations: [d.representation],
    regions: d.kind === "widget" ? [d.region, "operations.modal"] : [d.region],
    validate: (entry) =>
      metadata(entry) &&
      (d.kind !== "slot" || Object.hasOwn(intents, entry.local_key)) &&
      (d.kind !== "command" || entry.handler?.id === "fixture-simulation"),
    project: (entry) => ({
      label: (entry.metadata as { label: string }).label,
      region: entry.component?.region ?? d.region,
      manifestOrder: Object.keys(intents).indexOf(entry.local_key),
      action: intents[entry.local_key],
    }),
  })),
  regions: [
    ...definitions.map((d) => ({
      name: d.region,
      representation: d.representation,
      kinds: [d.kind],
      widgetKinds: d.role === "widget" ? [d.kind] : [],
      ordering: "manifest" as const,
      modal: false,
      actions:
        d.kind === "slot"
          ? {
              cardinality: "required" as const,
              allowedTags: ["navigate" as const, "modal" as const, "command" as const],
            }
          : undefined,
    })),
    {
      name: "operations.modal",
      representation: "component",
      kinds: ["widget"],
      widgetKinds: ["widget"],
      ordering: "manifest",
      modal: true,
    },
  ],
  reserved: (ref) => ref.owner === "host",
}
/** Parallax-owned policy built on the exact Chimera c6485d2 typed adapters. */
export function createOperationsExample(navigate: (route: string) => void) {
  const scope: HostScope = { appId: "parallax", environmentId: "offline-demo", clientId: "browser" }
  const context = store<Readonly<Record<string, unknown>>>({}),
    invocation = store<Readonly<Record<string, unknown>>>({ fixture: true }),
    liveScope = store<HostScope | undefined>(scope)
  const pending: (() => void)[] = []
  const actions = createFixtureActions({
    scope: liveScope,
    invocation,
    routes: ["activity", "usage"],
    modalRegions: ["operations.modal"],
    commands: {
      "ops/review": {
        validate: (intent) => Object.keys(intent.arguments).length === 0,
        outcome: "success",
      },
    },
    authorize: (ctx) => ctx.invocation.fixture === true,
    navigate: (intent) => navigate(intent.route),
    wait: () => new Promise((resolve) => pending.push(resolve)),
  })
  const app = createPresentationComposition({
    scope,
    registryOptions: { kinds, regions, runtimes: { react: version }, stylesheets: false },
    catalog,
    routes: [
      { id: "activity", label: "Activity", path: "/", region: "operations.summary" },
      { id: "usage", label: "Usage", path: "/usage", region: "operations.summary" },
    ],
    storage: memoryLayoutStorage(),
    isolation: store<AppIsolationSnapshot>({
      appId: scope.appId,
      effectiveMode: "main-origin",
      revision: "reviewed-offline-demo",
    }),
    renderContext: context,
    actions: actions.adapter,
  })
  actions.observe(app.runtime)
  return {
    ...app,
    context,
    actions,
    resetContext(value: Readonly<Record<string, unknown>>) {
      invocation.set({ fixture: true, ...value })
      context.set(value)
    },
    completeSimulation() {
      for (const resolve of pending.splice(0)) resolve()
    },
    async dispose() {
      actions.dispose()
      for (const resolve of pending.splice(0)) resolve()
      await app.dispose()
    },
  }
}
