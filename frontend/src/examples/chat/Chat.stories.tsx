import { applyTheme } from "@hollis-labs/kit-dashboard"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useEffect, useState } from "react"
import { ChatExample, defaultChatState } from "./ChatExample"
import type { ChatExampleState } from "./routes"

function Portable({ state: initial = defaultChatState }: { state?: ChatExampleState }) {
  const [state, setState] = useState(initial)
  useEffect(() => {
    const root = document.documentElement,
      oldTheme = root.dataset.theme,
      oldMode = root.dataset.mode
    applyTheme(state.theme)
    root.dataset.mode = state.mode
    return () => {
      if (oldTheme) root.dataset.theme = oldTheme
      else delete root.dataset.theme
      if (oldMode) root.dataset.mode = oldMode
      else delete root.dataset.mode
    }
  }, [state.theme, state.mode])
  return <ChatExample state={state} onChange={setState} />
}
const meta = {
  title: "App examples/Chat",
  component: Portable,
  parameters: { layout: "fullscreen" },
  args: { state: defaultChatState },
} satisfies Meta<typeof Portable>
export default meta
export const Conversation: StoryObj<typeof meta> = {}
export const FailedTool: StoryObj<typeof meta> = {
  args: { state: { ...defaultChatState, session: "CHAT-003" } },
}
export const Empty: StoryObj<typeof meta> = {
  args: { state: { ...defaultChatState, appearance: "empty" } },
}
export const Loading: StoryObj<typeof meta> = {
  args: { state: { ...defaultChatState, appearance: "loading" } },
}
export const ResourceError: StoryObj<typeof meta> = {
  args: { state: { ...defaultChatState, appearance: "error" } },
}
export const Denied: StoryObj<typeof meta> = {
  args: { state: { ...defaultChatState, appearance: "denied" } },
}
export const Locked: StoryObj<typeof meta> = {
  args: { state: { ...defaultChatState, appearance: "locked" } },
}
export const Unknown: StoryObj<typeof meta> = {
  args: { state: { ...defaultChatState, appearance: "unknown" } },
}
export const LongHistory: StoryObj<typeof meta> = {
  args: { state: { ...defaultChatState, appearance: "long" } },
}
export const StalledPreview: StoryObj<typeof meta> = {
  args: { state: { ...defaultChatState, appearance: "stalled-preview" } },
}
export const PendingCard: StoryObj<typeof meta> = {
  args: { state: { ...defaultChatState, appearance: "pending-card" } },
}
export const UnknownCard: StoryObj<typeof meta> = {
  args: { state: { ...defaultChatState, appearance: "unknown-card" } },
}
