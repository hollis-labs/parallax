import type { Meta, StoryObj } from "@storybook/react-vite"
import { OperationsListProof } from "./Proof"

const meta = {
  title: "Operations/Generic list candidate",
  component: OperationsListProof,
  parameters: { layout: "fullscreen" },
  args: { consumer: "torque", scenario: "populated" },
} satisfies Meta<typeof OperationsListProof>
export default meta
type Story = StoryObj<typeof meta>
export const TorqueModal: Story = {}
export const RunEvidenceInline: Story = { args: { consumer: "runs" } }
export const Incremental: Story = { args: { scenario: "large" } }
export const Loading: Story = { args: { scenario: "loading" } }
export const Empty: Story = { args: { scenario: "empty" } }
export const SourceError: Story = { args: { scenario: "error" } }
export const Denied: Story = { args: { scenario: "permission-denied" } }
export const Sparse: Story = { args: { scenario: "sparse" } }
