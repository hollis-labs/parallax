import type { Meta, StoryObj } from "@storybook/react-vite"
import { FluxRailReview } from "./Review"

const meta = {
  title: "Candidates/Flux Right Rail",
  component: FluxRailReview,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof FluxRailReview>
export default meta
type Story = StoryObj<typeof meta>
export const Populated: Story = {}
export const KnownZero: Story = { args: { initialScenario: "zero" } }
export const KnownEmpty: Story = { args: { initialScenario: "known-empty" } }
export const Unknown: Story = { args: { initialScenario: "unknown" } }
export const Unavailable: Story = { args: { initialScenario: "unavailable" } }
export const Partial: Story = { args: { initialScenario: "partial" } }
export const Loading: Story = { args: { initialScenario: "loading" } }
export const LongLabels: Story = { args: { initialScenario: "long-labels" } }
