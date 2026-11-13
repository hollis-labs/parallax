import { WhoamiBadge } from "@hollis-labs/kit-account"
import { IdentityGate, SignOutButton } from "@hollis-labs/kit-identity"
import { IdentityProvider, useIdentity } from "@hollis-labs/kit-identity/client"
import { type ReactNode, useEffect } from "react"
import { UNAUTHORIZED_EVENT } from "../http/request"

/**
 * The kit moves to its "session expired" sign-in when one of its own requests is answered 401. The app's own
 * requests report the same fact through UNAUTHORIZED_EVENT; this asks the kit a question only a live session
 * answers, so its 401 puts the gate on the sign-in screen (Loom's wiring).
 */
function SessionLossBridge() {
  const { client } = useIdentity()
  useEffect(() => {
    const onLoss = () => void client.listSessions().catch(() => {})
    window.addEventListener(UNAUTHORIZED_EVENT, onLoss)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onLoss)
  }, [client])
  return null
}

/**
 * kit-identity's gate renders boot, the no-owner screen (the owner is created on the host with
 * `parallax identity setup`) and sign-in outside the shell, and mounts the children only once a session exists.
 */
export function Signed({ children }: { children: ReactNode }) {
  return (
    <IdentityProvider>
      <IdentityGate appName="parallax">
        <SessionLossBridge />
        {children}
      </IdentityGate>
    </IdentityProvider>
  )
}

/** The lab header's identity control: who is signed in (kit-account's badge, fed by kit-identity) and Sign out. */
export function SignedInAs() {
  const { badge } = useIdentity()
  return (
    <span className="signed-in-as">
      <WhoamiBadge identity={badge} />
      <SignOutButton />
    </span>
  )
}
