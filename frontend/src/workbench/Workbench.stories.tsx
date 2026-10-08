import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import type { Group } from "./catalog"
import { ReviewWorkbench } from "./Workbench"

function Portable({
  query = "",
  group = "All",
  cutoff = "2026-10-04T14:30:00Z",
  selected = null,
  host = location.host,
}: {
  query?: string
  group?: Group
  cutoff?: string
  selected?: string | null
  host?: string
}) {
  const [destination, setDestination] = useState("None")
  return (
    <div className="storybook-lab">
      <h1>Portable review workbench</h1>
      <p role="status">
        Controlled local destination: {destination}. This composition does not mount an app or
        plugin host.
      </p>
      <ReviewWorkbench
        cutoff={cutoff}
        selected={selected}
        source={`${cutoff}/${host}`}
        host={host}
        initialQuery={query}
        initialGroup={group}
        onNavigate={setDestination}
      />
    </div>
  )
}
const meta = {
  title: "Workbench/Review catalogue",
  component: Portable,
  args: { query: "", group: "All", cutoff: "2026-10-04T14:30:00Z" },
} satisfies Meta<typeof Portable>
export default meta
type Story = StoryObj<typeof meta>
export const AllViews: Story = {}
export const Operations: Story = { args: { group: "Operations" } }
export const Communications: Story = { args: { group: "Communications" } }
export const Administration: Story = { args: { group: "Administration" } }
export const Evidence: Story = { args: { group: "Evidence" } }
export const Developer: Story = { args: { group: "Developer" } }
export const Voice: Story = { args: { group: "Voice" } }
export const NoMatch: Story = { args: { query: "not-a-declared-review-view" } }
export const CurrentPrefix: Story = {
  args: { cutoff: "2026-10-04T14:15:15Z", selected: "TASK-003 / RUN-003" },
}
export const UnknownHost: Story = { args: { host: "unknown.example.invalid" } }
