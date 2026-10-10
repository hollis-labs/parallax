import type { Meta, StoryObj } from "@storybook/react-vite"
import { NilExample } from "./NilExample"

const meta = {
  title: "App Examples/Nil",
  component: NilExample,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof NilExample>
export default meta
type Story = StoryObj<typeof meta>
export const Operations: Story = {}
export const Empty: Story = { args: { scenario: "empty" } }
export const Denied: Story = { args: { scenario: "denied", accessible: false } }
