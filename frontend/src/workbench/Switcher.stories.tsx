import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import type { Group } from "./catalog"
import { KeyboardSwitcher } from "./Switcher"

function Portable({
  group = "All",
  query = "",
  withdrawn = false,
  long = false,
  unavailable = false,
  source = "recorded-prefix/14:30:00Z",
}: {
  group?: Group
  query?: string
  withdrawn?: boolean
  long?: boolean
  unavailable?: boolean
  source?: string
}) {
  const [destination, setDestination] = useState("None")
  return (
    <div className="storybook-lab">
      <KeyboardSwitcher
        source={source}
        group={group}
        initialQuery={query}
        onNavigate={setDestination}
        withdrawn={withdrawn}
        long={long}
        unavailable={unavailable}
      />
      <p role="status">
        Local destination inspection: {destination}. This composition does not mount App or plugin
        host.
      </p>
    </div>
  )
}
const meta = {
  title: "Workbench/Keyboard Switcher",
  component: Portable,
  args: { group: "All", query: "" },
} satisfies Meta<typeof Portable>
export default meta
type Story = StoryObj<typeof meta>
export const Recorded: Story = {}
export const Operations: Story = { args: { group: "Operations" } }
export const Administration: Story = { args: { group: "Administration" } }
export const NoMatch: Story = { args: { query: "no-supplied-destination" } }
export const Withdrawn: Story = { args: { withdrawn: true } }
export const LongLiteral: Story = { args: { long: true } }
export const Unavailable: Story = { args: { unavailable: true } }
export const EarlierPrefix: Story = { args: { source: "recorded-prefix/14:10:00Z" } }
