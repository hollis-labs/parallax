import type { Command, CommandInput, CommandItem } from "@hollis-labs/design-components"
import type { ComponentProps } from "react"

const root: ComponentProps<typeof Command> = { label: "Declared views", value: "Activity" }
const input: ComponentProps<typeof CommandInput> = { value: "query", onValueChange: () => {} }
const disabled: ComponentProps<typeof CommandItem> = { value: "withdrawn", disabled: true }
// @ts-expect-error Native item selection is a finite string value, not a business object.
const invalid: ComponentProps<typeof CommandItem> = { value: { execute: true } }
void [root, input, disabled, invalid]
