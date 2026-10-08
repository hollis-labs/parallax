import type { Meta, StoryObj } from "@storybook/react-vite"
import { ChatPackReview } from "./PackReview"

const meta = {
  title: "Examples/Chat fixture pack",
  component: ChatPackReview,
  args: { initialState: "recorded", initialSession: "CHAT-001" },
} satisfies Meta<typeof ChatPackReview>
export default meta
export const Snapshot: StoryObj<typeof meta> = {}
export const SecondSession: StoryObj<typeof meta> = { args: { initialSession: "CHAT-002" } }
export const FailedTool: StoryObj<typeof meta> = { args: { initialSession: "CHAT-003" } }
export const Empty: StoryObj<typeof meta> = { args: { initialState: "empty" } }
export const Loading: StoryObj<typeof meta> = { args: { initialState: "loading" } }
export const ResourceError: StoryObj<typeof meta> = { args: { initialState: "error" } }
export const Denied: StoryObj<typeof meta> = { args: { initialState: "denied" } }
export const Unknown: StoryObj<typeof meta> = { args: { initialState: "unknown" } }
export const Locked: StoryObj<typeof meta> = { args: { initialState: "locked" } }
export const LongHistory: StoryObj<typeof meta> = { args: { initialState: "long" } }
export const PendingCard: StoryObj<typeof meta> = { args: { initialState: "pending-card" } }
export const UnknownCard: StoryObj<typeof meta> = { args: { initialState: "unknown-card" } }
export const StalledPreview: StoryObj<typeof meta> = { args: { initialState: "stalled-preview" } }
