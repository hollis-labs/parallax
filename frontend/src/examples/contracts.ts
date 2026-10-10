import manifest from "../fixtures/family-contracts.json" with { type: "json" }

export const fixtureContracts = manifest
export type FamilyId =
  | "operations"
  | "communications"
  | "administration"
  | "observations"
  | "developer"
  | "voice"
  | "tether-sysop"
export type ExampleDefinition = {
  id: string
  entry: { parameter: string; value: string }
  defaultDestination: string
  destinations: readonly { id: string; label: string }[]
  primaryFamily: FamilyId
  projection: "prefix" | "snapshot"
  selectionPolicy: string
  reset: { query: ""; selected: null; override: "scenario" }
  scrollOwners: Readonly<Record<string, string>>
}

export const torqueDefinition = {
  id: "torque",
  entry: { parameter: "example", value: "torque" },
  defaultDestination: "tasks",
  destinations: [
    { id: "tasks", label: "Operations" },
    { id: "dashboard", label: "Observability" },
    { id: "runs", label: "Runs" },
    { id: "task", label: "Task and run" },
    { id: "about", label: "About" },
  ],
  primaryFamily: "operations",
  projection: "prefix",
  selectionPolicy:
    "Only a currently admitted task/run survives ordinary navigation; source/query/resource/reset clears excluded selection and local intents.",
  reset: { query: "", selected: null, override: "scenario" },
  scrollOwners: {
    ordinary: ".torque-page",
    runs: "OperationsTablePage body",
    navigation: "bounded sidebar / OverlaySidebar",
    inspection: "DetailDialog body",
  },
} as const satisfies ExampleDefinition

type ArtifactIdentity = {
  version: string
  generator: string
  seed: number
  clock: string
  profile?: string
}
/** Bounded metadata admission for an existing complete example, not a universal router. */
export function exampleContext(
  definition: ExampleDefinition,
  artifact: ArtifactIdentity,
  cutoff: string,
  boundaries: readonly string[],
) {
  const family = manifest.families.find((f) => f.id === definition.primaryFamily)
  const profile = family?.profiles.find((p) =>
    p.labelKind === "artifact profile" ? p.label === artifact.profile : !artifact.profile,
  )
  const compatible =
    !!family &&
    !!profile &&
    (profile && "version" in profile ? profile.version : family.version) === artifact.version &&
    (profile && "generator" in profile ? profile.generator : family.generator) ===
      artifact.generator &&
    family.seed === artifact.seed &&
    family.referenceClock === artifact.clock
  const projectionSupported = family?.projections.includes(definition.projection) ?? false
  const admitted =
    compatible &&
    projectionSupported &&
    (definition.projection === "snapshot" || boundaries.includes(cutoff))
  return {
    available: admitted,
    problem: !compatible
      ? "Unsupported supplied artifact identity/profile/reference clock."
      : !projectionSupported
        ? "Unsupported projection for this supplied family."
        : !admitted
          ? "Unknown recorded review boundary."
          : "",
    family: family?.id ?? "unknown",
    profile: compatible ? (profile?.label ?? null) : null,
    profileKind: compatible ? (profile?.labelKind ?? null) : null,
    referenceClock: compatible ? artifact.clock : null,
    reviewCutoff: admitted && definition.projection === "prefix" ? cutoff : null,
    source: JSON.stringify([
      definition.id,
      artifact.version,
      artifact.generator,
      artifact.seed,
      artifact.profile ?? null,
      artifact.clock,
      definition.projection,
      admitted && definition.projection === "prefix" ? cutoff : null,
    ]),
  }
}
