import type { AccountProfileValue } from "@hollis-labs/kit-account"
import type { AdminContentProps } from "@hollis-labs/kit-admin"
import type { SettingsDraft } from "@hollis-labs/kit-settings"

// Compile-only negative assertions prevent unresolved published declarations
// silently turning these controlled host contracts into any.
function contracts(props: AdminContentProps, draft: SettingsDraft, profile: AccountProfileValue) {
  // @ts-expect-error canonical admin pages are a closed union
  props.selection.page = "arbitrary"
  // @ts-expect-error drafts cannot contain raw scalars
  const invalid: SettingsDraft = { density: "compact" }
  // @ts-expect-error account profile displayName remains a string
  const bad: AccountProfileValue = { displayName: 42, email: "" }
  return [draft, profile, invalid, bad]
}
void contracts
