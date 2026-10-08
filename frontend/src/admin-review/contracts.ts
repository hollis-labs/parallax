import type { AdminContentProps, AdminDestination, AdminSelection } from "@hollis-labs/kit-admin"

type NotAny<T> = 0 extends 1 & T ? false : true
type Assert<T extends true> = T
export type GenuineAdminProps = Assert<NotAny<AdminContentProps>>
// @ts-expect-error target uses closed published page vocabulary
const unknownPage: AdminSelection = { page: "execute" }
// @ts-expect-error destinations cannot supply href and onSelect simultaneously
const mixedDestination: AdminDestination = { href: "/?view=Admin%20Review", onSelect: () => {} }
void unknownPage
void mixedDestination
