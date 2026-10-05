import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { ObservationLab } from "./Lab"
import type { InspectionState } from "./model"

function Review({ state, view }: { state: InspectionState; view: string }) {
  const [selection, setSelection] = useState("")
  return (
    <div className="storybook-lab">
      <h1>Observability controlled review</h1>
      <ObservationLab
        initialState={state}
        initialView={view}
        onInspect={setSelection}
        onReset={() => setSelection("")}
      />
      <p role="status">
        {selection ? `Related fixture task selected: ${selection}` : "No related task selected"}
      </p>
    </div>
  )
}
function Story(props: { state: InspectionState; view: string }) {
  return <Review key={JSON.stringify(props)} {...props} />
}
const meta = {
  title: "Observability/Controlled inspection",
  component: Story,
  args: { state: "normal", view: "Evidence" },
} satisfies Meta<typeof Story>
export default meta
type S = StoryObj<typeof meta>
export const Evidence: S = {}
export const Logs: S = { args: { view: "Logs" } }
export const Traces: S = { args: { view: "Traces" } }
export const UsageRecords: S = { args: { view: "Usage records" } }
export const Empty: S = { args: { state: "empty" } }
export const Loading: S = { args: { state: "loading" } }
export const ReadFailure: S = { args: { state: "error" } }
export const Refresh: S = { args: { state: "refresh" } }
export const RefreshFailure: S = { args: { state: "refresh-error" } }
export const Stale: S = { args: { state: "stale" } }
export const Degraded: S = { args: { state: "degraded" } }
export const Missing: S = { args: { state: "missing" } }
export const Denied: S = { args: { state: "denied" } }
export const Unknown: S = { args: { state: "unknown" } }
export const Sparse: S = { args: { state: "sparse" } }
export const Truncated: S = { args: { state: "truncated" } }
export const InvalidDiagnostic: S = { args: { state: "invalid-diagnostic" } }
