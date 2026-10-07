import type { Meta, StoryObj } from "@storybook/react-vite"
import { operationsModel } from "../operations/model"
import { WidgetGallery } from "./Gallery"
import { type WidgetState, widgetStates } from "./model"

function Story({
  state = "recorded",
  cutoff = "2026-10-04T14:30:00Z",
  scenario = "populated",
}: {
  state?: WidgetState
  cutoff?: string
  scenario?: string
}) {
  return (
    <div className="review-surface">
      <WidgetGallery
        key={`${state}/${scenario}`}
        model={operationsModel(scenario, "", { cutoff })}
        initialState={state}
      />
    </div>
  )
}
const meta = {
  title: "Widgets/Recorded review",
  component: Story,
  args: { state: "recorded", cutoff: "2026-10-04T14:30:00Z", scenario: "populated" },
  argTypes: {
    state: { control: "select", options: widgetStates },
    cutoff: {
      control: "select",
      options: [
        "2026-10-04T14:09:59Z",
        "2026-10-04T14:14:15Z",
        "2026-10-04T14:15:30Z",
        "2026-10-04T14:30:00Z",
      ],
    },
    scenario: { control: "select", options: ["populated", "large", "empty", "permission-denied"] },
  },
} satisfies Meta<typeof Story>
export default meta
type S = StoryObj<typeof meta>
export const Recorded: S = {}
export const Empty: S = { args: { state: "empty" } }
export const ObservedZero: S = { args: { state: "observed-zero" } }
export const Loading: S = { args: { state: "loading" } }
export const ReadFailure: S = { args: { state: "error" } }
export const Denied: S = { args: { state: "denied" } }
export const Gapped: S = { args: { state: "gapped" } }
export const Unknown: S = { args: { state: "unknown" } }
export const LongContent: S = { args: { state: "long" } }
export const PartialPrefix: S = { args: { cutoff: "2026-10-04T14:14:15Z" } }
export const BeforeWindow: S = { args: { cutoff: "2026-10-04T14:09:59Z" } }
