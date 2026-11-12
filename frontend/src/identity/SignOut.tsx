import { Button } from "@hollis-labs/design-components"
import { useState } from "react"
import { ApiError, request } from "./api"
import { useSession } from "./session"

/** The shell has no user-menu region, so signing out is a nav.footer page with one button. */
export function SignOutPage() {
  const { signedOut, displayName } = useSession()
  const [error, setError] = useState("")
  async function logout() {
    try {
      await request("logout", "POST", {})
      signedOut()
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) signedOut()
      else setError("Could not sign out. Please try again.")
    }
  }
  return (
    <div className="identity-signout">
      <h2>Sign out</h2>
      <p>Signed in as {displayName}. You will need your password to come back.</p>
      {error && (
        <p className="identity-error" role="alert">
          {error}
        </p>
      )}
      <Button onClick={() => void logout()}>Sign out</Button>
    </div>
  )
}

/**
 * The smallest sign-out control, for the lab header until the shell's nav.footer surface (SignOutPage)
 * replaces it. Shows who is signed in and ends the session.
 */
export function SignOutButton() {
  const { signedOut, displayName } = useSession()
  const [busy, setBusy] = useState(false)
  async function logout() {
    setBusy(true)
    try {
      await request("logout", "POST", {})
    } catch (e) {
      if (!(e instanceof ApiError && e.status === 401)) {
        setBusy(false)
        return
      }
    }
    signedOut()
  }
  return (
    <span className="identity-who">
      <span>{displayName}</span>
      <Button size="sm" variant="outline" disabled={busy} onClick={() => void logout()}>
        Sign out
      </Button>
    </span>
  )
}
