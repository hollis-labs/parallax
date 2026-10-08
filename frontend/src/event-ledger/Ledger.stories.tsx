import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { operationsModel } from "../operations/model"
import { EventLedger } from "./Ledger"
import type { Specimen } from "./model"

function Portable({
  scenario = "populated",
  cutoff,
  specimen = "recorded",
}: {
  scenario?: string
  cutoff?: string
  specimen?: Specimen
}) {
  const [selected, setSelected] = useState("None"),
    [query, setQuery] = useState("")
  return (
    <div className="storybook-lab">
      <label>
        Authored operations matching filter
        <input
          aria-label="Authored operations matching filter"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSelected("None")
          }}
        />
      </label>
      <EventLedger
        operations={operationsModel(scenario, query, { cutoff })}
        operationsQuery={query}
        initialSpecimen={specimen}
        onInspectRun={setSelected}
      />
      <p role="status">Local admitted run selection: {selected}</p>
    </div>
  )
}
const meta = {
  title: "Evidence/Event Ledger",
  component: Portable,
  args: { scenario: "populated", specimen: "recorded" },
} satisfies Meta<typeof Portable>
export default meta
type Story = StoryObj<typeof meta>
export const Recorded: Story = {}
export const Historical: Story = { args: { scenario: "large" } }
export const EarlierPrefix: Story = { args: { cutoff: "2026-10-04T14:10:00Z" } }
export const Empty: Story = { args: { scenario: "empty" } }
export const Loading: Story = { args: { scenario: "loading" } }
export const ReadFailure: Story = { args: { scenario: "error" } }
export const Denied: Story = { args: { scenario: "permission-denied" } }
export const Missing: Story = { args: { specimen: "missing" } }
export const Unknown: Story = { args: { specimen: "unknown" } }
export const LongLiteral: Story = { args: { specimen: "long" } }
