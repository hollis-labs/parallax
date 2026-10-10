import type { Meta, StoryObj } from "@storybook/react-vite"
import { useLayoutEffect } from "react"
import { themes } from "./model"
import { OpsShellExample } from "./OpsShellExample"

function Portable(args: React.ComponentProps<typeof OpsShellExample>) {
  useLayoutEffect(() => {
    const root = document.documentElement,
      oldTheme = root.dataset.theme,
      oldMode = root.dataset.mode
    const params = new URLSearchParams(location.search)
    root.dataset.theme = themes.find((t) => t === params.get("theme")) ?? "nanite-default"
    root.dataset.mode = params.get("mode") === "light" ? "light" : "dark"
    return () => {
      if (oldTheme) root.dataset.theme = oldTheme
      else delete root.dataset.theme
      if (oldMode) root.dataset.mode = oldMode
      else delete root.dataset.mode
    }
  }, [])
  return <OpsShellExample {...args} portable />
}
const meta = {
  title: "Templates/Operations Shell",
  component: Portable,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Portable>
export default meta
type Story = StoryObj<typeof meta>
export const RunExplorerInline: Story = {}
export const RunExplorerModal: Story = { args: { initialMode: "modal" } }
export const EmptyAsideAdoption: Story = { args: { asideContent: "empty" } }
export const AsideAbsent: Story = { args: { asideContent: "absent" } }
export const MissingMetadata: Story = { args: { initialScenario: "missing-metadata" } }
export const Unavailable: Story = { args: { initialScenario: "unavailable" } }
export const EmptySuccess: Story = { args: { initialScenario: "empty" } }
export const LongLabels: Story = { args: { initialScenario: "long-labels" } }

export const DuplicateIdentifiers: Story = { args: { initialScenario: "duplicate-id" } }
