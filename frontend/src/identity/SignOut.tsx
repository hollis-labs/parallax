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
