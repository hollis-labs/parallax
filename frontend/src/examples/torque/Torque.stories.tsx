import { applyTheme } from "@hollis-labs/kit-dashboard"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useEffect, useState } from "react"
import type { TorqueProfile } from "./reference"
import { admitTorqueState, initialTorqueState, type TorqueRoute } from "./routes"
import { TorqueExample } from "./TorqueExample"

function Portable({
  screen = "dashboard",
  profile = "legacy",
  scenario = "populated",
  cutoff,
  selected,
}: {
  screen?: TorqueRoute
  profile?: TorqueProfile
  scenario?: string
  cutoff?: string
  selected?: string
}) {
  const [state, setState] = useState(() =>
    initialTorqueState(
      new URLSearchParams({
        screen,
        profile,
        scenario,
        ...(cutoff ? { cutoff } : {}),
        ...(selected ? { selected } : {}),
      }),
    ),
  )
  useEffect(() => {
    const root = document.documentElement
    const oldTheme = root.dataset.theme,
      oldMode = root.dataset.mode
    applyTheme(state.theme as Parameters<typeof applyTheme>[0])
    root.dataset.mode = state.mode
    return () => {
      if (oldTheme) root.dataset.theme = oldTheme
      else delete root.dataset.theme
      if (oldMode) root.dataset.mode = oldMode
      else delete root.dataset.mode
    }
  }, [state.theme, state.mode])
  return (
    <TorqueExample
      state={state}
      onChange={(patch) => setState((s) => admitTorqueState({ ...s, ...patch }))}
    />
  )
}
const meta = {
  title: "App Examples/Torque",
  component: Portable,
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <Story />],
} satisfies Meta<typeof Portable>
export default meta
type Story = StoryObj<typeof meta>
export const Dashboard: Story = {}
export const Tasks: Story = { args: { screen: "tasks" } }
export const Runs: Story = { args: { screen: "runs" } }
export const Record: Story = { args: { screen: "task", selected: "TASK-003" } }
export const About: Story = { args: { screen: "about" } }
export const Empty: Story = { args: { scenario: "empty" } }
export const Loading: Story = { args: { scenario: "loading" } }
export const Denied: Story = { args: { scenario: "permission-denied" } }
export const Prefix: Story = { args: { cutoff: "2026-10-04T14:15:15Z", selected: "TASK-003" } }
export const LongTasks: Story = { args: { screen: "tasks", scenario: "long-labels" } }
export const ReferenceProfile: Story = { args: { screen: "about", profile: "torque-16w" } }
export const ReferencePrefix: Story = {
  args: { screen: "about", profile: "torque-16w", cutoff: "2026-10-04T13:00:00Z" },
}
export const ReferenceEmpty: Story = {
  args: { screen: "about", profile: "torque-16w", scenario: "empty" },
}
export const ReferenceSparse: Story = {
  args: { screen: "about", profile: "torque-16w", scenario: "sparse" },
}

export const ActivityReference: Story = { args: { profile: "torque-16w" } }
export const ActivityEmpty: Story = { args: { profile: "torque-16w", scenario: "empty" } }
export const ActivityLoading: Story = { args: { profile: "torque-16w", scenario: "loading" } }
export const ActivityDegraded: Story = { args: { profile: "torque-16w", scenario: "degraded" } }
export const ActivitySparse: Story = { args: { profile: "torque-16w", scenario: "sparse" } }
export const ActivityUnknown: Story = {
  args: { profile: "torque-16w", scenario: "unknown-status" },
}
export const ActivityPrefix: Story = {
  args: { profile: "torque-16w", cutoff: "2026-10-04T14:15:15Z" },
}

export const ActivityError: Story = { args: { profile: "torque-16w", scenario: "error" } }
export const ActivityDenied: Story = {
  args: { profile: "torque-16w", scenario: "permission-denied" },
}
export const ActivityLong: Story = { args: { profile: "torque-16w", scenario: "long-labels" } }
