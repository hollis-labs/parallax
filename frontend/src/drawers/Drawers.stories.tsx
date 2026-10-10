import type { Meta, StoryObj } from "@storybook/react-vite"
import { DrawersReview } from "./DrawersReview"

const meta = {
  title: "Primitives/Resizable Tabbed Drawers",
  component: DrawersReview,
  parameters: { layout: "fullscreen" },
  args: {
    initialSessionId: "CHAT-001",
    initialTheme: "nanite-default",
    initialMode: "dark",
    developerModeDefault: false,
  },
} satisfies Meta<typeof DrawersReview>

export default meta

export const Default: StoryObj<typeof meta> = {}

export const PrimaryTopDrawer: StoryObj<typeof meta> = {
  args: {
    initialSessionId: "CHAT-001",
  },
}

export const WorkingBottomDrawer: StoryObj<typeof meta> = {
  args: {
    initialSessionId: "CHAT-002",
  },
}

export const DeveloperMode: StoryObj<typeof meta> = {
  args: {
    initialSessionId: "CHAT-001",
    developerModeDefault: true,
  },
}

export const SynthwaveTheme: StoryObj<typeof meta> = {
  args: {
    initialTheme: "dir-d",
    initialMode: "dark",
  },
}

export const TerminalHackerTheme: StoryObj<typeof meta> = {
  args: {
    initialTheme: "dir-e",
    initialMode: "dark",
  },
}

export const SysopGreenPhosphor: StoryObj<typeof meta> = {
  args: {
    initialTheme: "sysop-green-phosphor",
    initialMode: "dark",
  },
}

export const HighContrastLight: StoryObj<typeof meta> = {
  args: {
    initialTheme: "sysop-hi-contrast",
    initialMode: "light",
  },
}

export const ConcreteAndSignalLight: StoryObj<typeof meta> = {
  args: {
    initialTheme: "nanite-default",
    initialMode: "light",
  },
}
