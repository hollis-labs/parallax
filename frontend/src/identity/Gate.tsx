import { Button } from "@hollis-labs/design-components"
import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react"
import { ApiError, type Me, request, UNAUTHORIZED_EVENT } from "./api"
import { Entry } from "./Entry"
import "./identity.css"
import { type Session, SessionContext } from "./session"

/**
 * Nothing under the gate calls `/api/` or `/plugins/` before a session exists. `GET /api/setup`
 * says whether setup is open; `GET /api/identity/profile` is the who-am-I route (200 signed in,
 * 401 signed out).
 */
export function Gate({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<Me | null>(null)
  const [setup, setSetup] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const signedOut = useCallback(() => {
    setMe(null)
    setSetup(false)
  }, [])
  useEffect(() => {
    async function load() {
      try {
        const state = await request<{ setup_required: boolean }>("setup")
        setSetup(state.setup_required)
        if (!state.setup_required) {
          try {
            setMe(await request<Me>("identity/profile"))
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
    () => (me ? { username: me.username, displayName: me.display_name, signedOut } : null),
    [me, signedOut],
  )
  if (loading)
    return (
      <main className="identity-entry" role="status">
        Opening Parallax…
      </main>
    )
  if (error && !me)
    return (
      <main className="identity-entry">
        <p className="identity-error" role="alert">
          {error}
        </p>
        <Button onClick={() => window.location.reload()}>Try again</Button>
      </main>
    )
  if (!session) return <Entry setup={setup} onReady={setMe} />
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
}
