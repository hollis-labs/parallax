import { useEffect, useState } from "react"
import { FluxChat } from "./FluxChat"
import { diagnostics, type FluxState, fluxHref, fluxState } from "./model"
export function StandaloneFluxChat() {
  const [state, setState] = useState(() => fluxState(new URLSearchParams(location.search)))
  useEffect(() => {
    const restore = () => setState(fluxState(new URLSearchParams(location.search)))
    addEventListener("popstate", restore)
    Object.assign(window, { fluxChat: diagnostics })
    return () => {
      removeEventListener("popstate", restore)
      delete (window as unknown as { fluxChat?: unknown }).fluxChat
    }
  }, [])
  function change(next: FluxState) {
    const href = fluxHref(next)
    const normalized = fluxState(new URLSearchParams(href.split("?")[1]))
    setState(normalized)
    history.pushState(null, "", href)
  }
  return <FluxChat state={state} onChange={change} />
}
