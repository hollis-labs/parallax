import type {
  CardOutcome,
  ChatInputProps,
  ChatStreamProps,
  ConfirmationCardProps,
  PromptCardProps,
} from "@hollis-labs/kit-chat"

type NotAny<T> = 0 extends 1 & T ? false : true
type Assert<T extends true> = T
export type ConversationTypes = [
  Assert<NotAny<ChatInputProps>>,
  Assert<NotAny<ChatStreamProps>>,
  Assert<NotAny<ConfirmationCardProps>>,
  Assert<NotAny<PromptCardProps>>,
]
// @ts-expect-error emitted response status is closed; partial is prior appearance only
const invalid: CardOutcome = { status: "partial" }
// @ts-expect-error streaming content belongs to streaming, not idle status
const invalidStatus: ChatStreamProps["status"] = { status: "idle", content: "wrong" }
void invalid
void invalidStatus
