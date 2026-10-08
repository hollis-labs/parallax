import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { operationsModel } from "../operations/model"
import { type Appearance, EvidenceStates } from "./Review"

function Portable({
  scenario = "populated",
  appearance = "recorded",
  cutoff,
}: {
  scenario?: string
  appearance?: Appearance
  cutoff?: string
}) {
  const [query, setQuery] = useState("")
  return (
    <div className="storybook-lab">
      <label>
        Authored context query
        <input
          aria-label="Authored context query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <EvidenceStates
        operations={operationsModel(scenario, query, { cutoff })}
        operationsQuery={query}
        initialAppearance={appearance}
      />
    </div>
  )
}
const meta = { title: "Review/Evidence States", component: Portable } satisfies Meta<
  typeof Portable
>
export default meta
type Story = StoryObj<typeof meta>
export const Ready: Story = {}
export const Prefix: Story = { args: { cutoff: "2026-10-04T14:10:00Z" } }
export const Empty: Story = { args: { scenario: "empty" } }
export const Loading: Story = { args: { scenario: "loading" } }
export const Failure: Story = { args: { scenario: "error" } }
export const Denied: Story = { args: { scenario: "permission-denied" } }
export const Unknown: Story = { args: { appearance: "unknown" } }
export const Long: Story = { args: { appearance: "long" } }
export const ReducedMotion: Story = {
  args: { scenario: "loading" },
  parameters: { backgrounds: { default: "light" } },
}
