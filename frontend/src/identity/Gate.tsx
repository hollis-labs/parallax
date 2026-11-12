import { Button } from "@hollis-labs/design-components"
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react"
import { ApiError, request, UNAUTHORIZED_EVENT } from "./api"
import { Entry } from "./Entry"
import "./identity.css"
import { type Session, SessionContext } from "./session"

interface SessionRow {
  current?: boolean
}

/**
 * Nothing under the gate calls `/api/` or `/plugins/` before a session exists. There is no
 * "who am I" route: `GET /api/setup` says whether setup is open, then the sessions list
 * (any signed-in caller) answers 200 or 401.
 */
export function Gate({ children }: { children: ReactNode }) {
  const [signedIn, setSignedIn] = useState(false)
  const [setup, setSetup] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const signedOut = useCallback(() => {
    setSignedIn(false)
    setSetup(false)
  }, [])
  useEffect(() => {
    async function load() {
      try {
        const state = await request<{ setup_required: boolean }>("setup")
        setSetup(state.setup_required)
        if (!state.setup_required) {
          try {
            await request<SessionRow[]>("identity/sessions")
            setSignedIn(true)
          } catch (e) {
            if (!(e instanceof ApiError && e.status === 401)) throw e
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not reach Parallax.")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, signedOut)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, signedOut)
  }, [signedOut])
  const session = useMemo<Session | null>(
    () => (signedIn ? { signedOut } : null),
    [signedIn, signedOut],
  )
  if (loading)
    return (
      <main className="identity-entry" role="status">
        Opening Parallax…
      </main>
    )
  if (error && !signedIn)
    return (
      <main className="identity-entry">
        <p className="identity-error" role="alert">
          {error}
        </p>
        <Button onClick={() => window.location.reload()}>Try again</Button>
      </main>
    )
  if (!session) return <Entry setup={setup} onReady={() => setSignedIn(true)} />
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
}
