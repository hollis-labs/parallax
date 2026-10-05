import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { AccountLab } from "./Account"
import { AdminLab, type AdminState } from "./Admin"
import type { AccountState } from "./model"

function Review({
  kind,
  adminState,
  accountState,
}: {
  kind: "Admin" | "Account"
  adminState: AdminState
  accountState: AccountState
}) {
  const [intent, setIntent] = useState("")
  return (
    <div className="storybook-lab">
      <h1>{kind} controlled fixture review</h1>
      {kind === "Admin" ? (
        <AdminLab
          initialState={adminState}
          onIntent={(a, id) => setIntent(`${a}: ${id}`)}
          onReset={() => setIntent("")}
        />
      ) : (
        <AccountLab
          initialState={accountState}
          onIntent={(a, id) => setIntent(`${a}: ${id}`)}
          onReset={() => setIntent("")}
        />
      )}
      <p role="status">{intent}</p>
    </div>
  )
}
function Story(props: {
  kind: "Admin" | "Account"
  adminState: AdminState
  accountState: AccountState
}) {
  return <Review key={JSON.stringify(props)} {...props} />
}
const meta = {
  title: "Administration/Controlled review",
  component: Story,
  args: { kind: "Admin", adminState: "ready", accountState: "identified" },
} satisfies Meta<typeof Story>
export default meta
type S = StoryObj<typeof meta>
export const Admin: S = {}
export const ReadOnly: S = { args: { adminState: "read-only" } }
export const InitialFailure: S = { args: { adminState: "initial-error" } }
export const RefreshFailure: S = { args: { adminState: "refresh-error" } }
export const GroupFailure: S = { args: { adminState: "group-error" } }
export const Setup: S = { args: { adminState: "setup" } }
export const SetupFailure: S = { args: { adminState: "setup-error" } }
export const StaleObservations: S = { args: { adminState: "stale" } }
export const MissingObservations: S = { args: { adminState: "missing" } }
export const DeniedContext: S = { args: { adminState: "denied" } }
export const UnsupportedContract: S = { args: { adminState: "unsupported" } }
export const Account: S = { args: { kind: "Account" } }
export const UnknownIdentity: S = { args: { kind: "Account", accountState: "unknown" } }
export const DeniedAccount: S = { args: { kind: "Account", accountState: "denied" } }
export const LockedAccount: S = { args: { kind: "Account", accountState: "locked" } }
export const ProfileDraft: S = { args: { kind: "Account", accountState: "profile-draft" } }
export const IdentityError: S = { args: { kind: "Account", accountState: "error" } }
