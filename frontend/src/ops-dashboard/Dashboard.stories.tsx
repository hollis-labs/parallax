import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { operationsModel } from "../operations/model"
import { type DashboardTab, OpsDashboard } from "./Dashboard"

function Portable({
  scenario = "populated",
  cutoff,
  tab = "Activity",
  longHeader = false,
}: {
  scenario?: string
  cutoff?: string
  tab?: DashboardTab
  longHeader?: boolean
}) {
  const [query, setQuery] = useState(""),
    [selected, setSelected] = useState("")
  const model = operationsModel(scenario, query, { cutoff })
  return (
    <div className="storybook-lab">
      <OpsDashboard
        model={model}
        query={query}
        onQuery={setQuery}
        onSelect={setSelected}
        initialTab={tab}
        longHeader={longHeader}
      />
      <p role="status">
        Current readonly selection: {model.tasks.some((t) => t.id === selected) ? selected : "None"}
      </p>
    </div>
  )
}
const meta = {
  title: "Operations/Unified Dashboard",
  component: Portable,
  args: { scenario: "populated", tab: "Activity" },
  decorators: [(Story) => <Story />],
} satisfies Meta<typeof Portable>
export default meta
type Story = StoryObj<typeof meta>
export const Activity: Story = {}
export const MissionControl: Story = { args: { tab: "Mission Control" } }
export const Usage: Story = { args: { tab: "Usage" } }
export const Empty: Story = { args: { scenario: "empty" } }
export const Loading: Story = { args: { scenario: "loading" } }
export const ReadFailure: Story = { args: { scenario: "error" } }
export const Denied: Story = { args: { scenario: "permission-denied" } }
export const UnknownStatus: Story = { args: { scenario: "unknown-status" } }
export const LongHeader: Story = { args: { scenario: "long-labels", longHeader: true } }
export const BeforeReceipt: Story = { args: { cutoff: "2026-10-04T14:10:00Z" } }
export const AtReceipt: Story = { args: { cutoff: "2026-10-04T14:11:15Z" } }
export const Historical: Story = { args: { scenario: "large" } }
