import type { Meta, StoryObj } from "@storybook/react-vite"
import { FluxChat } from "./FluxChat"
import { fluxState } from "./model"

const meta = {
  title: "Examples/Flux Chat",
  component: FluxChat,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof FluxChat>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
export const Workspace: Story = {
  args: { state: fluxState(new URLSearchParams("layout=workspace")) },
}
export const Focus: Story = { args: { state: fluxState(new URLSearchParams("layout=focus")) } }
export const Reading: Story = { args: { state: fluxState(new URLSearchParams("layout=reading")) } }
export const Welcome: Story = { args: { state: fluxState(new URLSearchParams("welcome=true")) } }
export const Loading: Story = {
  args: { state: fluxState(new URLSearchParams("appearance=loading")) },
}
export const Empty: Story = { args: { state: fluxState(new URLSearchParams("appearance=empty")) } }
export const Unavailable: Story = {
  args: { state: fluxState(new URLSearchParams("appearance=error")) },
}
export const Denied: Story = {
  args: { state: fluxState(new URLSearchParams("appearance=denied")) },
}
export const Locked: Story = {
  args: { state: fluxState(new URLSearchParams("appearance=locked")) },
}
export const Partial: Story = {
  args: { state: fluxState(new URLSearchParams("card=partial&rail=partial")) },
}
