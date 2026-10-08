import type {
  Artifact,
  ArtifactAction,
  ArtifactClose,
  ArtifactContent,
  Context,
  ContextCacheUsage,
  ContextContent,
  ContextContentHeader,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextTrigger,
} from "@hollis-labs/kit-chat"
import type { ComponentProps } from "react"

type NotAny<T> = 0 extends 1 & T ? false : true
type Assert<T extends true> = T
export type GenuineContext = Assert<NotAny<ComponentProps<typeof Context>>>
export type GenuineContextTrigger = Assert<NotAny<ComponentProps<typeof ContextTrigger>>>
export type GenuineContextContent = Assert<NotAny<ComponentProps<typeof ContextContent>>>
export type GenuineContextContentHeader = Assert<
  NotAny<ComponentProps<typeof ContextContentHeader>>
>
export type GenuineContextInputUsage = Assert<NotAny<ComponentProps<typeof ContextInputUsage>>>
export type GenuineContextOutputUsage = Assert<NotAny<ComponentProps<typeof ContextOutputUsage>>>
export type GenuineContextReasoningUsage = Assert<
  NotAny<ComponentProps<typeof ContextReasoningUsage>>
>
export type GenuineContextCacheUsage = Assert<NotAny<ComponentProps<typeof ContextCacheUsage>>>
export type GenuineArtifact = Assert<NotAny<ComponentProps<typeof Artifact>>>
export type GenuineArtifactContent = Assert<NotAny<ComponentProps<typeof ArtifactContent>>>
export type GenuineArtifactAction = Assert<NotAny<ComponentProps<typeof ArtifactAction>>>
export type GenuineArtifactClose = Assert<NotAny<ComponentProps<typeof ArtifactClose>>>
const invalid: ComponentProps<typeof Context> = {
  // @ts-expect-error receipt token amounts are numeric, not formatted strings
  usedTokens: "7791 tokens",
}
void invalid
