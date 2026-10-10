import type { Meta, StoryObj } from "@storybook/react-vite"
import { FluxSettingsComposition } from "./Composition"

const meta = {
  title: "Templates/Flux Settings Composition",
  component: FluxSettingsComposition,
  parameters: { layout: "fullscreen" },
  args: { portable: true },
} satisfies Meta<typeof FluxSettingsComposition>
export default meta
type Story = StoryObj<typeof meta>
export const Profile: Story = { args: { initialSection: "profile" } }
export const Preferences: Story = { args: { initialSection: "preferences" } }
export const Appearance: Story = { args: { initialSection: "appearance" } }
export const Layout: Story = { args: { initialSection: "layout" } }
export const Permissions: Story = { args: { initialSection: "permissions" } }
export const Shortcuts: Story = { args: { initialSection: "shortcuts" } }
export const Providers: Story = { args: { initialSection: "providers" } }
export const Agents: Story = { args: { initialSection: "agents" } }
export const Plugins: Story = { args: { initialSection: "plugins" } }
export const Observability: Story = { args: { initialSection: "observability" } }
export const ReadOnly: Story = { args: { initialSection: "plugins", initialScenario: "read-only" } }
export const Empty: Story = { args: { initialSection: "agents", initialScenario: "empty" } }
export const Loading: Story = { args: { initialScenario: "loading" } }
export const ReadFailure: Story = { args: { initialScenario: "error" } }
export const AccessDenied: Story = { args: { initialScenario: "access-denied" } }
export const MalformedPreferences: Story = {
  args: { initialSection: "preferences", initialScenario: "malformed-preferences" },
}
export const Light: Story = { args: { initialSection: "appearance", initialMode: "light" } }
