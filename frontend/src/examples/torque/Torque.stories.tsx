import { applyTheme } from "@hollis-labs/kit-dashboard"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useEffect, useState } from "react"
import type { TorqueProfile } from "./reference"
import { admitTorqueState, initialTorqueState, type TorqueRoute } from "./routes"
import { TorqueExample } from "./TorqueExample"

function Portable({
  screen = "tasks",
  profile = "torque-16w",
  scenario = "populated",
  cutoff,
  selected,
  tab = "Activity",
}: {
  screen?: TorqueRoute
  profile?: TorqueProfile
  scenario?: string
  cutoff?: string
  selected?: string
  tab?: "Activity" | "Mission Control" | "Usage"
}) {
  const [state, setState] = useState(() =>
    initialTorqueState(
      new URLSearchParams({
        screen,
        tab,
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
export const Dashboard: Story = { name: "Observability", args: { screen: "dashboard" } }
export const Tasks: Story = { name: "Operations", args: { screen: "tasks" } }
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

export const ActivityReference: Story = { args: { screen: "dashboard", profile: "torque-16w" } }
export const ActivityEmpty: Story = {
  args: { screen: "dashboard", profile: "torque-16w", scenario: "empty" },
}
export const ActivityLoading: Story = {
  args: { screen: "dashboard", profile: "torque-16w", scenario: "loading" },
}
export const ActivityDegraded: Story = {
  args: { screen: "dashboard", profile: "torque-16w", scenario: "degraded" },
}
export const ActivitySparse: Story = {
  args: { screen: "dashboard", profile: "torque-16w", scenario: "sparse" },
}
export const ActivityUnknown: Story = {
  args: { screen: "dashboard", profile: "torque-16w", scenario: "unknown-status" },
}
export const ActivityPrefix: Story = {
  args: { screen: "dashboard", profile: "torque-16w", cutoff: "2026-10-04T14:15:15Z" },
}

export const ActivityError: Story = {
  args: { screen: "dashboard", profile: "torque-16w", scenario: "error" },
}
export const ActivityDenied: Story = {
  args: { screen: "dashboard", profile: "torque-16w", scenario: "permission-denied" },
}
export const ActivityLong: Story = {
  args: { screen: "dashboard", profile: "torque-16w", scenario: "long-labels" },
}

export const MissionReference: Story = {
  args: { screen: "dashboard", profile: "torque-16w", tab: "Mission Control" },
}
export const MissionEmpty: Story = {
  args: { screen: "dashboard", profile: "torque-16w", tab: "Mission Control", scenario: "empty" },
}
export const MissionLoading: Story = {
  args: { screen: "dashboard", profile: "torque-16w", tab: "Mission Control", scenario: "loading" },
}
export const MissionDegraded: Story = {
  args: {
    screen: "dashboard",
    profile: "torque-16w",
    tab: "Mission Control",
    scenario: "degraded",
  },
}
export const MissionSparse: Story = {
  args: { screen: "dashboard", profile: "torque-16w", tab: "Mission Control", scenario: "sparse" },
}
export const MissionUnknown: Story = {
  args: {
    screen: "dashboard",
    profile: "torque-16w",
    tab: "Mission Control",
    scenario: "unknown-status",
  },
}
export const MissionDenied: Story = {
  args: {
    screen: "dashboard",
    profile: "torque-16w",
    tab: "Mission Control",
    scenario: "permission-denied",
  },
}
export const UsageReference: Story = {
  args: { screen: "dashboard", profile: "torque-16w", tab: "Usage" },
}
export const UsageEmpty: Story = {
  args: { screen: "dashboard", profile: "torque-16w", tab: "Usage", scenario: "empty" },
}
export const UsageLoading: Story = {
  args: { screen: "dashboard", profile: "torque-16w", tab: "Usage", scenario: "loading" },
}
export const UsageDegraded: Story = {
  args: { screen: "dashboard", profile: "torque-16w", tab: "Usage", scenario: "degraded" },
}
export const UsageSparse: Story = {
  args: { screen: "dashboard", profile: "torque-16w", tab: "Usage", scenario: "sparse" },
}
export const UsageUnknown: Story = {
  args: { screen: "dashboard", profile: "torque-16w", tab: "Usage", scenario: "unknown-status" },
}
export const UsageDenied: Story = {
  args: { screen: "dashboard", profile: "torque-16w", tab: "Usage", scenario: "permission-denied" },
}
