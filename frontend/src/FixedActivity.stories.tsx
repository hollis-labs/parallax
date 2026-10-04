import type { Meta, StoryObj } from "@storybook/react-vite"
import { FixedActivity } from "./FixedActivity"
import fixture from "./fixtures/operations.json"

const meta = {
  title: "Operations/Fixed activity",
  component: FixedActivity,
  args: { records: fixture.tasks, clock: fixture.clock },
} satisfies Meta<typeof FixedActivity>
export default meta
export const Populated: StoryObj<typeof meta> = {}
export const Empty: StoryObj<typeof meta> = { args: { records: [] } }
