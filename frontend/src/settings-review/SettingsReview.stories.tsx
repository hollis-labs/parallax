import type { Meta, StoryObj } from "@storybook/react-vite"
import { type FieldMode, type FieldState, fieldModes, fieldStates } from "./model"
import { SettingsReview } from "./Review"

function Story({
  state = "recorded",
  mode = "provenance",
  context = "populated",
}: {
  state?: FieldState
  mode?: FieldMode
  context?: string
}) {
  return (
    <div className="review-surface">
      <SettingsReview
        key={`${state}/${mode}/${context}`}
        context={context}
        initialState={state}
        initialMode={mode}
      />
    </div>
  )
}
const meta = {
  title: "Settings/Controlled field review",
  component: Story,
  args: { state: "recorded", mode: "provenance", context: "populated" },
  argTypes: {
    state: { control: "select", options: fieldStates },
    mode: { control: "select", options: fieldModes },
    context: { control: "select", options: ["populated", "permission-denied"] },
  },
} satisfies Meta<typeof Story>
export default meta
type S = StoryObj<typeof meta>
export const Provenance: S = {}
export const SingleGroup: S = { args: { mode: "group form" } }
export const Grouped: S = { args: { mode: "grouped" } }
export const Wizard: S = { args: { mode: "wizard" } }
export const Empty: S = { args: { state: "empty" } }
export const Loading: S = { args: { state: "loading" } }
export const ReadFailure: S = { args: { state: "read-failure" } }
export const Denied: S = { args: { state: "denied" } }
export const Locked: S = { args: { state: "locked" } }
export const LongContent: S = { args: { state: "long" } }
export const UnknownMetadata: S = { args: { state: "unknown-metadata" } }
export const UnsupportedSchema: S = { args: { state: "unsupported-schema" } }
export const UnknownField: S = { args: { state: "unknown-field" } }
export const InvalidNumber: S = { args: { state: "invalid" } }
export const Busy: S = { args: { state: "busy" } }
export const NotSet: S = { args: { state: "not-set" } }
