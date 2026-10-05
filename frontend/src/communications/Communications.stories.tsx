import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { CommunicationLab } from "./CommunicationLab"
import type { ChatState } from "./model"

function StoryState({
  view,
  scenario,
  initialChatState,
  initialDelivery,
  initialChatId,
}: {
  view: string
  scenario: string
  initialChatState: ChatState
  initialDelivery: string
  initialChatId: string
}) {
  const [current, setCurrent] = useState(view),
    [intent, setIntent] = useState("")
  return (
    <div className="review-surface">
      <h1>{current} · local fixtures</h1>
      <CommunicationLab
        view={current}
        scenario={scenario}
        initialChatState={initialChatState}
        initialDelivery={initialDelivery}
        initialChatId={initialChatId}
        onViewChange={setCurrent}
        onIntent={(action, id) =>
          setIntent(`${action} → ${id}. Inspector only; records unchanged.`)
        }
        onReset={() => setIntent("")}
      />
      {intent && <p role="status">{intent}</p>}
    </div>
  )
}
function CommunicationsStory(props: {
  view: string
  scenario: string
  initialChatState: ChatState
  initialDelivery: string
  initialChatId: string
}) {
  return <StoryState key={JSON.stringify(props)} {...props} />
}
const meta = {
  title: "Communications/Controlled views",
  component: CommunicationsStory,
  args: {
    view: "Contacts",
    scenario: "populated",
    initialChatState: "normal",
    initialDelivery: "normal",
    initialChatId: "CHAT-001",
  },
  argTypes: {
    view: { control: "select", options: ["Contacts", "Messages", "Chat"] },
    scenario: {
      control: "select",
      options: [
        "populated",
        "empty",
        "loading",
        "error",
        "unavailable",
        "permission-denied",
        "missing-metadata",
        "long-labels",
      ],
    },
    initialChatState: {
      control: "select",
      options: [
        "normal",
        "streaming",
        "pending",
        "refused",
        "error",
        "unknown-wire",
        "unknown-response",
      ],
    },
    initialDelivery: { control: "select", options: ["normal", "failed", "denied"] },
    initialChatId: { control: "select", options: ["CHAT-001", "CHAT-002", "CHAT-003"] },
  },
} satisfies Meta<typeof CommunicationsStory>
export default meta
export const Contacts: StoryObj<typeof meta> = {}
export const Messages: StoryObj<typeof meta> = { args: { view: "Messages" } }
export const EmptyInbox: StoryObj<typeof meta> = { args: { view: "Messages", scenario: "empty" } }
export const DeliveryFailure: StoryObj<typeof meta> = {
  args: { view: "Messages", initialDelivery: "failed" },
}
export const DeniedSend: StoryObj<typeof meta> = {
  args: { view: "Messages", initialDelivery: "denied" },
}
export const MissingMetadata: StoryObj<typeof meta> = { args: { scenario: "missing-metadata" } }
export const LongMessages: StoryObj<typeof meta> = {
  args: { view: "Messages", scenario: "long-labels" },
}
export const Chat: StoryObj<typeof meta> = { args: { view: "Chat" } }
export const Streaming: StoryObj<typeof meta> = {
  args: { view: "Chat", initialChatState: "streaming" },
}
export const PendingCard: StoryObj<typeof meta> = {
  args: { view: "Chat", initialChatState: "pending" },
}
export const RefusedCard: StoryObj<typeof meta> = {
  args: { view: "Chat", initialChatState: "refused" },
}
export const ResponseError: StoryObj<typeof meta> = {
  args: { view: "Chat", initialChatState: "error" },
}
export const UnknownWire: StoryObj<typeof meta> = {
  args: { view: "Chat", initialChatState: "unknown-wire" },
}
export const UnknownResponse: StoryObj<typeof meta> = {
  args: { view: "Chat", initialChatState: "unknown-response" },
}
export const FailedTool: StoryObj<typeof meta> = {
  args: { view: "Chat", initialChatId: "CHAT-003" },
}
export const Unavailable: StoryObj<typeof meta> = {
  args: { view: "Chat", scenario: "unavailable" },
}
