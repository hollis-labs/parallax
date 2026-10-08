import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { operationsModel } from "../operations/model"
import { type Appearance, AppearanceReview, type Mode } from "./Review"

function Portable({
  theme = "p4-white",
  mode = "light",
  scenario = "populated",
  appearance = "recorded",
}: {
  theme?: string
  mode?: Mode
  scenario?: string
  appearance?: Appearance
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
      <AppearanceReview
        operations={operationsModel(scenario, query)}
        operationsQuery={query}
        initialTheme={theme}
        initialMode={mode}
        appearance={appearance}
      />
    </div>
  )
}
const meta = {
  title: "Review/Appearance",
  component: Portable,
  decorators: [(Story) => <Story />],
} satisfies Meta<typeof Portable>
export default meta
type Story = StoryObj<typeof meta>
export const Light: Story = {}
export const Dark: Story = { args: { mode: "dark" } }
export const System: Story = { args: { mode: "system" } }
export const Phosphor: Story = { args: { theme: "p1-green-phosphor", mode: "dark" } }
export const Amber: Story = { args: { theme: "p3-amber-phosphor", mode: "dark" } }
export const HighContrast: Story = { args: { theme: "hi-contrast", mode: "dark" } }
export const UnknownPalette: Story = { args: { appearance: "unknown-palette" } }
export const Unavailable: Story = { args: { scenario: "unavailable" } }
export const Denied: Story = { args: { scenario: "permission-denied" } }
export const LongLabel: Story = { args: { appearance: "long-label" } }
