import { createContext, useContext } from "react"

export interface Session {
  username: string
  displayName: string
  /** Back to the sign-in screen. */
  signedOut: () => void
}

export const SessionContext = createContext<Session | null>(null)

export function useSession(): Session {
  const s = useContext(SessionContext)
  if (!s) throw new Error("Session context missing")
  return s
}
