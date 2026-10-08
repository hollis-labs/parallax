import { applyTheme } from "@hollis-labs/kit-dashboard"
import { useEffect, useState } from "react"
import { MessagingExample } from "./MessagingExample"
import { type MessagingState, messagingHref, normalizeMessagingState } from "./model"
export function StandaloneMessagingExample() {
  const [state, setState] = useState(() =>
    normalizeMessagingState(new URLSearchParams(location.search)),
  )
  useEffect(() => {
    const restore = () => setState(normalizeMessagingState(new URLSearchParams(location.search)))
    addEventListener("popstate", restore)
    return () => removeEventListener("popstate", restore)
  }, [])
  useEffect(() => {
    history.replaceState(null, "", messagingHref(state))
  }, [state])
  useEffect(() => {
    applyTheme(state.theme)
    document.documentElement.dataset.mode = state.mode
  }, [state.theme, state.mode])
  function change(next: MessagingState) {
    const admitted = normalizeMessagingState(new URLSearchParams(next))
    setState(admitted)
    history.pushState(null, "", messagingHref(admitted))
  }
  return <MessagingExample state={state} onChange={change} />
}
