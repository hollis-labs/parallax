import { AppShell } from "@hollis-labs/design-components"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { operationsModel } from "../operations/model"
import { RunExplorer } from "./Explorer"

function Portable({
  scenario = "populated",
  cutoff,
  direct = false,
}: {
  scenario?: string
  cutoff?: string
  direct?: boolean
}) {
  return (
    <AppShell
      header={
        <p className="comparison-heading">
          Portable Run Explorer · fixed recorded evidence · local filters and inspection
        </p>
      }
    >
      <RunExplorer model={operationsModel(scenario, "", { cutoff })} direct={direct} />
    </AppShell>
  )
}
const meta = {
  title: "Operations/Run Explorer",
  component: Portable,
  parameters: { layout: "fullscreen" },
  args: { scenario: "populated", direct: false },
} satisfies Meta<typeof Portable>
export default meta
type Story = StoryObj<typeof meta>
export const Recorded: Story = {}
export const IncrementalEighty: Story = { args: { scenario: "large" } }
export const BeforeReceipt: Story = { args: { cutoff: "2026-10-04T14:10:00Z" } }
export const Empty: Story = { args: { scenario: "empty" } }
export const Loading: Story = { args: { scenario: "loading" } }
export const ResourceError: Story = { args: { scenario: "error" } }
export const Denied: Story = { args: { scenario: "permission-denied" } }
export const Unavailable: Story = { args: { scenario: "unavailable" } }
export const LongLabels: Story = { args: { scenario: "long-labels" } }
export const OwnerUnavailable: Story = { args: { scenario: "missing-metadata" } }
export const DirectFilterBar: Story = { args: { direct: true } }
export const DirectFilterBarEmpty: Story = { args: { direct: true, scenario: "empty" } }
