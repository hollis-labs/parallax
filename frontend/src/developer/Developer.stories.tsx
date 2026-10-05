import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { DeveloperLab } from "./Lab"
import type { DeveloperState } from "./model"

function Review({ state, view }: { state: DeveloperState; view: string }) {
  const [result, setResult] = useState("")
  return (
    <div className="storybook-lab">
      <h1>Developer controlled review</h1>
      <DeveloperLab
        initialState={state}
        initialView={view}
        onInspect={(id) => setResult(`Selected related fixture ${id}`)}
        onIntent={setResult}
      />
      <p role="status">{result || "No review intent"}</p>
    </div>
  )
}
function Story(props: { state: DeveloperState; view: string }) {
  return <Review key={JSON.stringify(props)} {...props} />
}
const meta = {
  title: "Developer/Controlled review",
  component: Story,
  args: { state: "normal", view: "Source" },
} satisfies Meta<typeof Story>
export default meta
type S = StoryObj<typeof meta>
export const Source: S = {}
export const Diff: S = { args: { view: "Diff" } }
export const Records: S = { args: { view: "Records" } }
export const Output: S = { args: { view: "Output" } }
export const Workflow: S = { args: { view: "Workflow" } }
export const Empty: S = { args: { state: "empty" } }
export const Loading: S = { args: { state: "loading" } }
export const ReadFailure: S = { args: { state: "error" } }
export const Denied: S = { args: { state: "denied" } }
export const Locked: S = { args: { state: "locked" } }
export const LongContent: S = { args: { state: "long-content" } }
export const Unknown: S = { args: { state: "unknown", view: "Workflow" } }
