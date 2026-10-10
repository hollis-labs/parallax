import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react"

export function useCommittedFrame(): {
  isCommittedLive: () => boolean
  frameToken: object
  checkToken: (t: object) => boolean
} {
  const [store] = useState(() => {
    let currentToken: object | null = null
    return {
      snapshot: () => currentToken,
      subscribe: (notify: () => void) => {
        const token = {}
        currentToken = token
        notify()
        return () => {
          if (currentToken === token) currentToken = null
        }
      },
    }
  })
  const committedToken = useSyncExternalStore(store.subscribe, store.snapshot, () => null)
  const currentRenderToken = {}
  const layoutTokenRef = useRef<object | null>(null)
  useLayoutEffect(() => {
    layoutTokenRef.current = currentRenderToken
    return () => {
      layoutTokenRef.current = null
    }
  })
  return {
    isCommittedLive: () => committedToken !== null && store.snapshot() === committedToken,
    frameToken: currentRenderToken,
    checkToken: (t: object) =>
      committedToken !== null &&
      store.snapshot() === committedToken &&
      layoutTokenRef.current === t,
  }
}
