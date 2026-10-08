import type {
  AccountPreferencesProps,
  AccountProfileProps,
  ApiTokenManagerProps,
  ConnectedAccountsProps,
  WhoamiBadgeProps,
} from "@hollis-labs/kit-account"

type NotAny<T> = 0 extends 1 & T ? false : true
type Assert<T extends true> = T
export type AccountTypes = [
  Assert<NotAny<AccountProfileProps>>,
  Assert<NotAny<AccountPreferencesProps>>,
  Assert<NotAny<WhoamiBadgeProps>>,
  Assert<NotAny<ApiTokenManagerProps>>,
  Assert<NotAny<ConnectedAccountsProps>>,
]
// @ts-expect-error scopes contain string IDs, not credentials or objects
const invalidScope: ApiTokenManagerProps["draft"] = { name: "review", scopes: [{}] }
const invalidAssurance: WhoamiBadgeProps["identity"] = {
  state: "identified",
  displayName: "fixture",
  // @ts-expect-error identity assurance is a closed host assertion
  assurance: "draft",
}
void invalidScope
void invalidAssurance
