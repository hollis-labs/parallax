import type { Checkbox, ModeToggle, Switch, ThemePicker } from "@hollis-labs/design-components"
import type { ComponentProps } from "react"

const picker: ComponentProps<typeof ThemePicker> = {
  theme: "p4-white",
  themes: [],
  onThemeChange: () => {},
}
const mode: ComponentProps<typeof ModeToggle> = {
  mode: "system",
  resolvedMode: "light",
  onModeChange: () => {},
}
const checkbox: ComponentProps<typeof Checkbox> = { checked: true, onCheckedChange: () => {} }
const toggle: ComponentProps<typeof Switch> = {
  checked: false,
  size: "default",
  onCheckedChange: () => {},
}
// @ts-expect-error Picker has no disabled policy prop; unavailable host withholds it.
const invalid: ComponentProps<typeof ThemePicker> = { ...picker, disabled: true }
void [picker, mode, checkbox, toggle, invalid]
