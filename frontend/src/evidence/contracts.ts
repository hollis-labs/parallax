import type {
  JsonModal,
  JsonViewer,
  MetaList,
  PayloadSummary,
  SearchInput,
} from "@hollis-labs/design-components"
import type { ComponentProps } from "react"

type IsAny<T> = 0 extends 1 & T ? true : false
type NotAny<T extends false> = T
export type ViewerPropsTyped = NotAny<IsAny<ComponentProps<typeof JsonViewer>>>
export type SummaryPropsTyped = NotAny<IsAny<ComponentProps<typeof PayloadSummary>>>
export type MetadataPropsTyped = NotAny<IsAny<ComponentProps<typeof MetaList>>>
export type SearchPropsTyped = NotAny<IsAny<ComponentProps<typeof SearchInput>>>
// @ts-expect-error: no action override exists; do not pretend JsonModal is copy-free.
export type UnsupportedCopyOverride = ComponentProps<typeof JsonModal>["hideCopy"]
// @ts-expect-error: metadata columns are the actual closed public contract.
export const unsupportedColumns: ComponentProps<typeof MetaList>["columns"] = 5
