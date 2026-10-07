import type { Meta, StoryObj } from "@storybook/react-vite"
import { operationsModel } from "../operations/model"
import { PrimitiveGallery } from "./Gallery"
import { type GalleryState, galleryStates } from "./model"

function GalleryStory({
  state = "normal",
  scenario = "populated",
}: {
  state?: GalleryState
  scenario?: string
}) {
  return (
    <div className="review-surface">
      <PrimitiveGallery
        key={`${state}/${scenario}`}
        model={operationsModel(scenario)}
        initialState={state}
      />
    </div>
  )
}
const meta = {
  title: "Primitives/Controlled gallery",
  component: GalleryStory,
  args: { state: "normal", scenario: "populated" },
  argTypes: {
    state: { control: "select", options: galleryStates },
    scenario: {
      control: "select",
      options: ["populated", "empty", "long-labels", "missing-metadata"],
    },
  },
} satisfies Meta<typeof GalleryStory>
export default meta
export const Recorded: StoryObj<typeof meta> = {}
export const Empty: StoryObj<typeof meta> = { args: { state: "empty" } }
export const Loading: StoryObj<typeof meta> = { args: { state: "loading" } }
export const ReadFailure: StoryObj<typeof meta> = { args: { state: "error" } }
export const Denied: StoryObj<typeof meta> = { args: { state: "denied" } }
export const Locked: StoryObj<typeof meta> = { args: { state: "locked" } }
export const LongContent: StoryObj<typeof meta> = { args: { state: "long" } }
export const Unknown: StoryObj<typeof meta> = { args: { state: "unknown" } }
