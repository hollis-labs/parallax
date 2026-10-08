import type { Meta, StoryObj } from "@storybook/react-vite"
import { operationsModel } from "../operations/model"
import type { EvidenceState } from "./model"
import { DeveloperEvidence } from "./Review"

function Portable({
  state = "recorded",
  cutoff,
  scenario = "populated",
}: {
  state?: EvidenceState
  cutoff?: string
  scenario?: string
}) {
  return (
    <div className="storybook-lab">
      <h1>Portable developer evidence</h1>
      <DeveloperEvidence
        operations={operationsModel(scenario, "", { cutoff })}
        initialState={state}
      />
    </div>
  )
}
const meta = {
  title: "Developer/Independent evidence",
  component: Portable,
  args: { state: "recorded", scenario: "populated" },
} satisfies Meta<typeof Portable>
export default meta
type Story = StoryObj<typeof meta>
export const Recorded: Story = {}
export const Empty: Story = { args: { state: "empty" } }
export const Loading: Story = { args: { state: "loading" } }
export const ReadFailure: Story = { args: { state: "error" } }
export const Denied: Story = { args: { state: "denied" } }
export const Locked: Story = { args: { state: "locked" } }
export const LongContent: Story = { args: { state: "long-content" } }
export const UnknownRawFrame: Story = { args: { state: "unknown" } }
export const PassiveRunning: Story = { args: { state: "running" } }
export const MissingDuration: Story = { args: { state: "missing-duration" } }
export const BeforeEvidence: Story = { args: { cutoff: "2026-10-04T14:14:15Z" } }
export const EvidenceBeforeRunFinish: Story = { args: { cutoff: "2026-10-04T14:15:15Z" } }
export const IncompatibleSource: Story = { args: { scenario: "large" } }
