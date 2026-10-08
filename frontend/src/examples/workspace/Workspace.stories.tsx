import { applyTheme } from "@hollis-labs/kit-dashboard"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useEffect, useState } from "react"
import { defaultWorkspaceState, type WorkspaceState } from "./model"
import { WorkspaceExample } from "./WorkspaceExample"

function Portable({ state: initial = defaultWorkspaceState }: { state?: WorkspaceState }) {
  const [state, setState] = useState(initial)
  useEffect(() => {
    const root = document.documentElement,
      theme = root.dataset.theme,
      mode = root.dataset.mode
    applyTheme(state.theme)
    root.dataset.mode = state.mode
    return () => {
      if (theme) root.dataset.theme = theme
      else delete root.dataset.theme
      if (mode) root.dataset.mode = mode
      else delete root.dataset.mode
    }
  }, [state.theme, state.mode])
  return <WorkspaceExample state={state} onChange={setState} />
}
const meta = {
  title: "App Examples/Workspace",
  component: Portable,
  parameters: { layout: "fullscreen" },
  args: { state: defaultWorkspaceState },
} satisfies Meta<typeof Portable>
export default meta
export const Source: StoryObj<typeof meta> = {}
export const Diagnostics: StoryObj<typeof meta> = {
  args: { state: { ...defaultWorkspaceState, panel: "diagnostics" } },
}
export const ToolEvidence: StoryObj<typeof meta> = {
  args: { state: { ...defaultWorkspaceState, panel: "tool" } },
}
export const InspectionGraph: StoryObj<typeof meta> = {
  args: { state: { ...defaultWorkspaceState, panel: "graph" } },
}
export const Empty: StoryObj<typeof meta> = {
  args: { state: { ...defaultWorkspaceState, appearance: "empty" } },
}
export const Loading: StoryObj<typeof meta> = {
  args: { state: { ...defaultWorkspaceState, appearance: "loading" } },
}
export const ResourceError: StoryObj<typeof meta> = {
  args: { state: { ...defaultWorkspaceState, appearance: "error" } },
}
export const Denied: StoryObj<typeof meta> = {
  args: { state: { ...defaultWorkspaceState, appearance: "denied" } },
}
export const Unknown: StoryObj<typeof meta> = {
  args: { state: { ...defaultWorkspaceState, appearance: "unknown" } },
}
export const Locked: StoryObj<typeof meta> = {
  args: { state: { ...defaultWorkspaceState, appearance: "locked" } },
}
export const LongSource: StoryObj<typeof meta> = {
  args: { state: { ...defaultWorkspaceState, appearance: "long" } },
}
export const RetainedDegraded: StoryObj<typeof meta> = {
  args: { state: { ...defaultWorkspaceState, appearance: "degraded" } },
}
