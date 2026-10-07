import { Button } from "@hollis-labs/design-components"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { operationsModel } from "../operations/model"
import { EvidenceInspector } from "./Inspector"
import { type EvidenceState, evidenceStates } from "./model"

function Story({
  state = "recorded",
  scenario = "populated",
}: {
  state?: EvidenceState
  scenario?: string
}) {
  return (
    <div className="review-surface">
      <EvidenceInspector
        key={`${state}/${scenario}`}
        model={operationsModel(scenario)}
        initialState={state}
      />
    </div>
  )
}
const meta = {
  title: "Evidence/Controlled inspector",
  component: Story,
  args: { state: "recorded", scenario: "populated" },
  argTypes: {
    state: { control: "select", options: evidenceStates },
    scenario: { control: "select", options: ["populated", "large", "empty", "permission-denied"] },
  },
} satisfies Meta<typeof Story>
export default meta
type S = StoryObj<typeof meta>
export const Recorded: S = {}
export const Nested: S = { args: { state: "nested" } }
export const LongContent: S = { args: { state: "long" } }
export const Empty: S = { args: { state: "empty" } }
export const Loading: S = { args: { state: "loading" } }
export const Denied: S = { args: { state: "denied" } }
export const ReadFailure: S = { args: { state: "error" } }
export const Unknown: S = { args: { state: "unknown" } }
export const MalformedRaw: S = { args: { state: "malformed" } }

function ReplacementStory() {
  const [copy, setCopy] = useState(false)
  const base = operationsModel("populated")
  const model = copy
    ? { ...base, dataset: { ...base.dataset, version: `${base.dataset.version}/reviewed-copy` } }
    : base
  return (
    <div className="review-surface">
      <p>
        Source replacement review: the same authored records, distinct reviewed-copy source
        identity; no new telemetry.
      </p>
      <Button variant="outline" onClick={() => setCopy((n) => !n)}>
        Replace reviewed source copy
      </Button>
      <EvidenceInspector model={model} />
    </div>
  )
}
export const SameScenarioReplacement: S = { render: () => <ReplacementStory /> }
