import type { Meta, StoryObj } from "@storybook/react-vite"
import { operationsModel } from "../operations/model"
import type { EvidenceState, OutcomeKind, ToolPhase } from "./model"
import { ConversationEvidence } from "./Review"

function Portable({
  state = "recorded",
  phase = "completed",
  outcome = "null",
  cutoff,
  scenario = "populated",
}: {
  state?: EvidenceState
  phase?: ToolPhase
  outcome?: OutcomeKind
  cutoff?: string
  scenario?: string
}) {
  return (
    <div className="storybook-lab">
      <h1>Portable conversation evidence</h1>
      <ConversationEvidence
        operations={operationsModel(scenario, "", { cutoff })}
        initialState={state}
        initialPhase={phase}
        initialOutcome={outcome}
      />
    </div>
  )
}
const meta = {
  title: "Chat/Conversation evidence",
  component: Portable,
  args: { state: "recorded", phase: "completed", outcome: "null", scenario: "populated" },
} satisfies Meta<typeof Portable>
export default meta
type Story = StoryObj<typeof meta>
export const Recorded: Story = {}
export const Empty: Story = { args: { state: "empty" } }
export const Loading: Story = { args: { state: "loading" } }
export const ReadFailure: Story = { args: { state: "error" } }
export const Denied: Story = { args: { state: "denied" } }
export const Locked: Story = { args: { state: "locked" } }
export const LongContent: Story = { args: { state: "long-content", outcome: "inert-text" } }
export const UnknownToolState: Story = { args: { phase: "unknown" } }
export const Pending: Story = { args: { phase: "pending", outcome: "absent" } }
export const Running: Story = { args: { phase: "running", outcome: "absent" } }
export const AwaitingConfirmation: Story = { args: { phase: "awaiting-confirmation" } }
export const Confirmed: Story = { args: { phase: "confirmed" } }
export const DeniedTool: Story = { args: { phase: "denied" } }
export const ErrorTool: Story = { args: { phase: "error" } }
export const ZeroOutcome: Story = { args: { outcome: "zero" } }
export const NoOutcome: Story = { args: { outcome: "absent" } }
export const BeforeToolFinish: Story = { args: { cutoff: "2026-10-04T14:10:30Z" } }
export const BeforeMetadataSnapshot: Story = { args: { cutoff: "2026-10-04T14:11:15Z" } }
export const IncompatibleSource: Story = { args: { scenario: "large" } }
