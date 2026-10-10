import type { Meta, StoryObj } from "@storybook/react-vite"
import { NilRadialSpecimen } from "./Specimen"

const meta = { title: "Behaviors/Nil/Radial", component: NilRadialSpecimen } satisfies Meta<
  typeof NilRadialSpecimen
>
export default meta
export const Nil: StoryObj<typeof meta> = {}
export const Message: StoryObj<typeof meta> = { args: { idiom: "message" } }
