import type {
  Combobox,
  ConfirmDialog,
  FormDialog,
  Pill,
  ProgressBar,
} from "@hollis-labs/design-components"
import type { ComponentProps } from "react"

type IsAny<T> = 0 extends 1 & T ? true : false
type NotAny<T extends false> = T
export type PublicFormPropsAreTyped = NotAny<IsAny<ComponentProps<typeof FormDialog>>>
export type PublicConfirmPropsAreTyped = NotAny<IsAny<ComponentProps<typeof ConfirmDialog>>>
export type PublicComboPropsAreTyped = NotAny<IsAny<ComponentProps<typeof Combobox>>>
export type PublicProgressPropsAreTyped = NotAny<IsAny<ComponentProps<typeof ProgressBar>>>
// Unknown domain statuses need a supported neutral tone, never an invalid cast.
// @ts-expect-error: the public tone contract is closed.
export const unsupportedTone: ComponentProps<typeof Pill>["tone"] = "future-review-phase"
// @ts-expect-error: no disabled prop exists; hosts must gate mounting/actions.
export type UnsupportedComboboxDisabled = ComponentProps<typeof Combobox>["disabled"]
