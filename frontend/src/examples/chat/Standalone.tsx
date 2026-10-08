import { applyTheme } from "@hollis-labs/kit-dashboard"
import { useEffect, useState } from "react"
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
    applyTheme(state.theme)
    document.documentElement.dataset.mode = state.mode
  }, [state.theme, state.mode])
  function change(next: ChatExampleState) {
    const admitted = chatExampleState(new URLSearchParams(next))
    setState(admitted)
    history.pushState(null, "", chatExampleHref(admitted))
  }
  return <ChatExample state={state} onChange={change} />
}
