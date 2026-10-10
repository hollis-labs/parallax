import type { Meta, StoryObj } from "@storybook/react-vite"
import { TachyonNav } from "./TachyonNav"

const meta = {
  title: "Examples/Tachyon Navigation",
  component: TachyonNav,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof TachyonNav>
export default meta
type Story = StoryObj<typeof meta>
export const Grouped: Story = {}
export const LeftSubRail: Story = { args: { initialVariant: "left" } }
export const HiddenRoutes: Story = { args: { initialScenario: "hidden" } }
export const Orphaned: Story = { args: { initialScenario: "orphan" } }
export const Retired: Story = { args: { initialScenario: "retired" } }
export const Empty: Story = { args: { initialScenario: "empty" } }
export const Denied: Story = { args: { initialScenario: "denied" } }
export const Unavailable: Story = { args: { initialScenario: "unavailable" } }
export const Degraded: Story = { args: { initialScenario: "degraded" } }
