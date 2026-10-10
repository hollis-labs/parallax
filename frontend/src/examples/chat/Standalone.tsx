import { applyTheme } from "@hollis-labs/kit-dashboard"
import { useEffect, useState } from "react"
import { StandaloneFluxNavigation } from "../flux-navigation/FluxNavigationExample"
import { ChatExample } from "./ChatExample"
import { type ChatExampleState, chatExampleHref, chatExampleState } from "./routes"
export function StandaloneChatExample() {
  const [state, setState] = useState(() => chatExampleState(new URLSearchParams(location.search)))
  useEffect(() => {
    const restore = () => setState(chatExampleState(new URLSearchParams(location.search)))
    addEventListener("popstate", restore)
    return () => removeEventListener("popstate", restore)
  }, [])
  useEffect(() => {
    if (new URLSearchParams(location.search).get("navigation") === "flux") return
    applyTheme(state.theme)
    document.documentElement.dataset.mode = state.mode
  }, [state.theme, state.mode])
  function change(next: ChatExampleState) {
    const admitted = chatExampleState(new URLSearchParams(next))
    setState(admitted)
    const href = chatExampleHref(admitted)
    history.pushState(
      null,
      "",
      new URLSearchParams(location.search).get("navigation") === "flux"
        ? `${href}&navigation=flux`
        : href,
    )
  }
  return new URLSearchParams(location.search).get("navigation") === "flux" ? (
    <StandaloneFluxNavigation state={state} onChange={change} />
  ) : (
    <ChatExample state={state} onChange={change} />
  )
}
