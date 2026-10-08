import type { Meta, StoryObj } from "@storybook/react-vite"
import { operationsModel } from "../operations/model"
import type { CapacityMode, UsageState } from "./model"
import { UsageEvidence } from "./Review"

function Portable({
  state = "recorded",
  capacity = "unknown",
  cutoff,
  scenario = "populated",
}: {
  state?: UsageState
  capacity?: CapacityMode
  cutoff?: string
  scenario?: string
}) {
  return (
    <div className="storybook-lab">
      <h1>Portable usage evidence</h1>
      <UsageEvidence
        operations={operationsModel(scenario, "", { cutoff })}
        initialState={state}
        initialCapacity={capacity}
      />
    </div>
  )
}
const meta = {
  title: "Chat/Usage evidence",
  component: Portable,
  args: { state: "recorded", capacity: "unknown", scenario: "populated" },
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
export const BeforeReceipt: Story = { args: { cutoff: "2026-10-04T14:10:15Z" } }
export const AtReceipt: Story = { args: { cutoff: "2026-10-04T14:11:15Z" } }
export const IncompatibleSource: Story = { args: { scenario: "large" } }
export const ZeroCapacityUse: Story = { args: { capacity: "zero" } }
export const FiniteCapacity: Story = { args: { capacity: "normal" } }
export const OverBudget: Story = { args: { capacity: "overbudget" } }
export const Negative: Story = { args: { capacity: "negative" } }
export const NotFinite: Story = { args: { capacity: "nan" } }
export const InfiniteValue: Story = { args: { capacity: "infinity" } }
export const ZeroMax: Story = { args: { capacity: "zero-max" } }

export const GlobalReadFailure: Story = { args: { scenario: "error" } }
export const GlobalLoading: Story = { args: { scenario: "loading" } }
export const GlobalDenied: Story = { args: { scenario: "permission-denied" } }
