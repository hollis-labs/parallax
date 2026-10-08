import type {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@hollis-labs/kit-chat"
import type { ComponentProps } from "react"

type NotAny<T> = 0 extends 1 & T ? false : true
type Assert<T extends true> = T
export type GenuineTool = Assert<NotAny<ComponentProps<typeof Tool>>>
export type GenuineHeader = Assert<NotAny<ComponentProps<typeof ToolHeader>>>
export type GenuineContent = Assert<NotAny<ComponentProps<typeof ToolContent>>>
export type GenuineInput = Assert<NotAny<ComponentProps<typeof ToolInput>>>
export type GenuineOutput = Assert<NotAny<ComponentProps<typeof ToolOutput>>>
export type GenuineReasoning = Assert<NotAny<ComponentProps<typeof Reasoning>>>
export type GenuineReasoningTrigger = Assert<NotAny<ComponentProps<typeof ReasoningTrigger>>>
export type GenuineReasoningContent = Assert<NotAny<ComponentProps<typeof ReasoningContent>>>
export type GenuineSources = Assert<NotAny<ComponentProps<typeof Sources>>>
export type GenuineSourcesTrigger = Assert<NotAny<ComponentProps<typeof SourcesTrigger>>>
export type GenuineSourcesContent = Assert<NotAny<ComponentProps<typeof SourcesContent>>>
export type GenuineSource = Assert<NotAny<ComponentProps<typeof Source>>>
const bad: ComponentProps<typeof ToolHeader> = {
  toolName: "sample",
  // @ts-expect-error unknown raw wire status cannot masquerade as a supported ToolState
  state: "future-tool-resolution",
}
void bad
