import { applyTheme } from "@hollis-labs/kit-dashboard"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useEffect, useState } from "react"
import { MessagingExample } from "./MessagingExample"
import { defaultMessagingState, type MessagingState } from "./model"

function Portable({ state: initial = defaultMessagingState }: { state?: MessagingState }) {
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
  return <MessagingExample state={state} onChange={setState} />
}
const meta = {
  title: "App Examples/Messaging",
  component: Portable,
  parameters: { layout: "fullscreen" },
  args: { state: defaultMessagingState },
} satisfies Meta<typeof Portable>
export default meta
export const Inbox: StoryObj<typeof meta> = {}
export const Contacts: StoryObj<typeof meta> = {
  args: { state: { ...defaultMessagingState, screen: "contacts", contact: "CONTACT-001" } },
}
export const Email: StoryObj<typeof meta> = {
  args: { state: { ...defaultMessagingState, conversation: "CONVERSATION-001" } },
}
export const SMS: StoryObj<typeof meta> = {
  args: { state: { ...defaultMessagingState, conversation: "CONVERSATION-002" } },
}
export const Tether: StoryObj<typeof meta> = {
  args: { state: { ...defaultMessagingState, conversation: "CONVERSATION-003" } },
}
export const Empty: StoryObj<typeof meta> = {
  args: { state: { ...defaultMessagingState, appearance: "empty" } },
}
export const Loading: StoryObj<typeof meta> = {
  args: { state: { ...defaultMessagingState, appearance: "loading" } },
}
export const ResourceError: StoryObj<typeof meta> = {
  args: { state: { ...defaultMessagingState, appearance: "error" } },
}
export const Denied: StoryObj<typeof meta> = {
  args: { state: { ...defaultMessagingState, appearance: "denied" } },
}
export const Unknown: StoryObj<typeof meta> = {
  args: { state: { ...defaultMessagingState, appearance: "unknown" } },
}
export const Locked: StoryObj<typeof meta> = {
  args: {
    state: { ...defaultMessagingState, appearance: "locked", conversation: "CONVERSATION-001" },
  },
}
export const LongContent: StoryObj<typeof meta> = {
  args: {
    state: { ...defaultMessagingState, appearance: "long", conversation: "CONVERSATION-003" },
  },
}
export const FailedAppearance: StoryObj<typeof meta> = {
  args: {
    state: { ...defaultMessagingState, appearance: "failed", conversation: "CONVERSATION-003" },
  },
}
export const UnknownDelivery: StoryObj<typeof meta> = {
  args: {
    state: {
      ...defaultMessagingState,
      appearance: "unknown-delivery",
      conversation: "CONVERSATION-001",
    },
  },
}
export const RetainedDegraded: StoryObj<typeof meta> = {
  args: {
    state: { ...defaultMessagingState, appearance: "degraded", conversation: "CONVERSATION-001" },
  },
}
