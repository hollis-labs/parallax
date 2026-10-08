import type { Meta, StoryObj } from "@storybook/react-vite"
import {
  type ConversationMode,
  type ConversationState,
  conversationModes,
  conversationStates,
  type PriorAppearance,
  priorAppearances,
} from "./model"
import { ConversationReview } from "./Review"

function Story({
  state = "recorded",
  mode = "transcript",
  prior = "none",
  card = "confirmation",
  context = "populated",
}: {
  state?: ConversationState
  mode?: ConversationMode
  prior?: PriorAppearance
  card?: "confirmation" | "prompt"
  context?: string
}) {
  return (
    <div className="review-surface">
      <ConversationReview
        key={`${state}/${mode}/${prior}/${card}/${context}`}
        context={context}
        initialState={state}
        initialMode={mode}
        initialPrior={prior}
        initialCard={card}
      />
    </div>
  )
}
const meta = {
  title: "Conversation/Controlled conversation review",
  component: Story,
  args: {
    state: "recorded",
    mode: "transcript",
    prior: "none",
    card: "confirmation",
    context: "populated",
  },
  argTypes: {
    state: { control: "select", options: conversationStates },
    mode: { control: "select", options: conversationModes },
    prior: { control: "select", options: priorAppearances },
    card: { control: "select", options: ["confirmation", "prompt"] },
    context: { control: "select", options: ["populated", "permission-denied"] },
  },
} satisfies Meta<typeof Story>
export default meta
type S = StoryObj<typeof meta>
export const Transcript: S = {}
export const Prompt: S = { args: { card: "prompt" } }
export const Partial: S = { args: { prior: "partial" } }
export const Handling: S = { args: { prior: "handling" } }
export const Submitted: S = { args: { prior: "submitted" } }
export const SubmittedPrompt: S = { args: { prior: "submitted", card: "prompt" } }
export const Canceled: S = { args: { prior: "canceled" } }
export const Cancelled: S = { args: { prior: "cancelled" } }
export const Failed: S = { args: { prior: "failed" } }
export const UnknownPrior: S = { args: { prior: "future-response" } }
export const LiteralOpen: S = { args: { prior: "open" } }
export const LiteralPending: S = { args: { prior: "pending" } }
export const Empty: S = { args: { state: "empty" } }
export const Loading: S = { args: { state: "loading" } }
export const Streaming: S = { args: { state: "streaming" } }
export const Stalled: S = { args: { state: "stalled" } }
export const StreamError: S = { args: { state: "error" } }
export const Denied: S = { args: { state: "denied" } }
export const Locked: S = { args: { state: "locked" } }
export const LongContent: S = { args: { state: "long" } }
export const HistoryError: S = { args: { state: "history-error" } }
export const HistoryLoading: S = { args: { state: "history-loading" } }
