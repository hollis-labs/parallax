import type { Meta, StoryObj } from "@storybook/react-vite"
import { PortableFluxNavigation } from "./FluxNavigationExample"

const meta = {
  title: "Candidates/Flux Navigation",
  component: PortableFluxNavigation,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PortableFluxNavigation>
export default meta
export const PinnedAndRecent: StoryObj<typeof meta> = {}
export const Empty: StoryObj<typeof meta> = { args: { fixture: "empty" } }
export const Skeleton: StoryObj<typeof meta> = { args: { fixture: "loading" } }
export const Unavailable: StoryObj<typeof meta> = { args: { fixture: "unavailable" } }
export const Denied: StoryObj<typeof meta> = { args: { fixture: "denied" } }
export const Locked: StoryObj<typeof meta> = { args: { fixture: "locked" } }
