import type { Meta, StoryObj } from "@storybook/react-vite"
import { DirectoryReview } from "./Review"

const meta = {
  title: "Administration/Directory Review",
  component: DirectoryReview,
  args: { context: "populated", initialState: "recorded", sourceCopy: 0 },
  decorators: [
    (Story) => (
      <div className="storybook-lab">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DirectoryReview>
export default meta
type Story = StoryObj<typeof meta>
export const Recorded: Story = {}
export const Empty: Story = { args: { initialState: "empty" } }
export const Loading: Story = { args: { initialState: "loading" } }
export const Failed: Story = { args: { initialState: "error" } }
export const Denied: Story = { args: { initialState: "denied" } }
export const Unknown: Story = { args: { initialState: "unknown" } }
export const MissingRelationship: Story = { args: { initialState: "missing" } }
export const Locked: Story = { args: { initialState: "locked" } }
export const Long: Story = { args: { initialState: "long" } }
export const Replacement: Story = { args: { sourceCopy: 1 } }

export const Unassigned: Story = { args: { initialState: "unassigned" } }
