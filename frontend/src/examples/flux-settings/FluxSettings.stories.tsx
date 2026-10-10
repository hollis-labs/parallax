import type { Meta, StoryObj } from "@storybook/react-vite"
import { useLayoutEffect } from "react"
import { FluxSettingsExample } from "./FluxSettingsExample"
import type { FluxSettingsShellProps } from "./FluxSettingsShell"
import { BUILTIN_THEMES, type ThemeMode } from "./model"

function StoryWrapper(args: FluxSettingsShellProps) {
  useLayoutEffect(() => {
    const root = document.documentElement
    const oldTheme = root.dataset.theme
    const oldMode = root.dataset.mode

    const params = new URLSearchParams(typeof location !== "undefined" ? location.search : "")
    const themeId = params.get("theme") ?? args.initialTheme?.id ?? "nanite-default"
    const mode = (params.get("mode") as ThemeMode) ?? args.initialMode ?? "dark"

    root.dataset.theme = themeId
    root.dataset.mode = mode

    return () => {
      if (oldTheme) root.dataset.theme = oldTheme
      else delete root.dataset.theme
      if (oldMode) root.dataset.mode = oldMode
      else delete root.dataset.mode
    }
  }, [args.initialTheme?.id, args.initialMode])

  return <FluxSettingsExample {...args} portable />
}

const meta = {
  title: "Templates/Flux Settings",
  component: StoryWrapper,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof StoryWrapper>

export default meta
type Story = StoryObj<typeof meta>

export const AppearanceSectionDefault: Story = {
  args: {
    initialSection: "appearance",
    initialTheme: BUILTIN_THEMES[0],
    initialMode: "dark",
  },
}

export const LayoutPreferences: Story = {
  args: {
    initialSection: "layout",
    initialMode: "dark",
  },
}

export const ShortcutsKeyCapture: Story = {
  args: {
    initialSection: "shortcuts",
    initialMode: "dark",
  },
}

export const PermissionsToolGrants: Story = {
  args: {
    initialSection: "permissions",
    initialMode: "dark",
  },
}

export const ReadOnlyScenario: Story = {
  args: {
    initialSection: "appearance",
    initialScenario: "read-only",
  },
}

export const EmptyToolSearch: Story = {
  args: {
    initialSection: "permissions",
    initialScenario: "empty-search",
  },
}

export const LightColorMode: Story = {
  args: {
    initialSection: "appearance",
    initialMode: "light",
  },
}
