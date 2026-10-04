import { Button, EmptyState } from "@hollis-labs/design-components"
import { StatusBadge } from "@hollis-labs/kit-dashboard"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { normalizeScenario, operationsModel, runDetail } from "./model"
import {
  ActivityView,
  MissionView,
  OperationsSummary,
  ResourceNotice,
  RunDetailBody,
  UsageView,
} from "./Views"

function OperationsState({
  scenario = "large",
  view = "Activity",
}: {
  scenario?: string
  view?: string
}) {
  const [selection, setSelection] = useState<string | null>(null),
    [query, setQuery] = useState(""),
    [intent, setIntent] = useState("")
  const model = operationsModel(scenario, query),
    detail = runDetail(model, selection)
  return (
    <div className="review-surface">
      <p className="eyebrow">
        Offline portable story · {model.dataset.version} · {normalizeScenario(scenario)}
      </p>
      <OperationsSummary model={model} />
      {!model.accessible ? (
        <ResourceNotice model={model} />
      ) : view === "Activity" ? (
        <ActivityView model={model} query={query} onQuery={setQuery} onSelect={setSelection} />
      ) : view === "Mission Control" ? (
        <MissionView model={model} onSelect={setSelection} />
      ) : (
        <UsageView model={model} query={query} onQuery={setQuery} onSelect={setSelection} />
      )}{" "}
      {detail && (
        <section aria-label="Story selected run">
          <Button onClick={() => setSelection(null)}>Clear story selection</Button>
          <RunDetailBody
            detail={detail}
            onIntent={(action, id) =>
              setIntent(`${action} → ${id}. Simulated locally; records unchanged.`)
            }
          />
        </section>
      )}
      {intent && <p role="status">{intent}</p>}
    </div>
  )
}
function OperationsStory({
  scenario = "large",
  view = "Activity",
}: {
  scenario?: string
  view?: string
}) {
  return <OperationsState key={normalizeScenario(scenario)} scenario={scenario} view={view} />
}
const meta = {
  title: "Operations/Controlled views",
  component: OperationsStory,
  args: { scenario: "large", view: "Activity" },
  argTypes: {
    scenario: {
      control: "select",
      options: [
        "populated",
        "large",
        "sparse",
        "empty",
        "loading",
        "error",
        "degraded",
        "unavailable",
        "permission-denied",
        "missing-metadata",
        "long-labels",
        "unknown-status",
      ],
    },
    view: { control: "select", options: ["Activity", "Mission Control", "Usage"] },
  },
} satisfies Meta<typeof OperationsStory>
export default meta
export const Activity: StoryObj<typeof meta> = {}
export const MissionControl: StoryObj<typeof meta> = { args: { view: "Mission Control" } }
export const Usage: StoryObj<typeof meta> = { args: { view: "Usage" } }
export const Sparse: StoryObj<typeof meta> = { args: { scenario: "sparse" } }
export const Unavailable: StoryObj<typeof meta> = { args: { scenario: "unavailable" } }
export const UnknownStatus: StoryObj<typeof meta> = {
  args: { scenario: "unknown-status", view: "Mission Control" },
}
export const MissingMetadata: StoryObj<typeof meta> = { args: { scenario: "missing-metadata" } }
export const LongLabels: StoryObj<typeof meta> = { args: { scenario: "long-labels" } }
export const Empty: StoryObj<typeof meta> = { args: { scenario: "empty" } }
export const Failure: StoryObj<typeof meta> = { args: { scenario: "error" } }
export function Primitives() {
  const [intent, setIntent] = useState("")
  return (
    <div className="example-body">
      <Button onClick={() => setIntent("Local story intent inspected")}>
        Inspect fixture intent
      </Button>
      <Button disabled>Unavailable fixture action</Button>
      <StatusBadge status="running" />
      <StatusBadge status="external-review" />
      <EmptyState
        variant="empty"
        title="No fixture observations"
        description="Unavailable observations are distinct from zero."
      />
      {intent && <p role="status">{intent}</p>}
    </div>
  )
}
