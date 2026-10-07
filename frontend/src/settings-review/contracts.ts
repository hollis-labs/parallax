import type {
  SettingsDraft,
  SettingsGroupForm,
  SettingsProvenanceRenderer,
  SettingsRenderer,
  SettingsWizard,
} from "@hollis-labs/kit-settings"
import type { ComponentProps } from "react"

type IsAny<T> = 0 extends 1 & T ? true : false
type NotAny<T extends false> = T
export type GroupTyped = NotAny<IsAny<ComponentProps<typeof SettingsGroupForm>>>
export type RendererTyped = NotAny<IsAny<ComponentProps<typeof SettingsRenderer>>>
export type ProvenanceTyped = NotAny<IsAny<ComponentProps<typeof SettingsProvenanceRenderer>>>
export type WizardTyped = NotAny<IsAny<ComponentProps<typeof SettingsWizard>>>
// @ts-expect-error: controlled value edits accept scalar presentation values only.
export const unsupportedDraft: SettingsDraft = { row_limit: { kind: "value", value: { raw: 1 } } }
// @ts-expect-error: completion is a controlled typed plan, not a string request or endpoint.
export const unsupportedComplete: ComponentProps<typeof SettingsWizard>["onComplete"] = (
  plan: string,
) => plan
