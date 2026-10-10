import { applyTheme } from "@hollis-labs/kit-dashboard"
import { useEffect, useState } from "react"
import {
  defaultReaderState,
  normalizeReaderState,
  type ReaderExampleState,
  readerHref,
} from "./model"
import { ReaderExample } from "./ReaderExample"

export function StandaloneReaderExample() {
  const [state, setState] = useState<ReaderExampleState>(() => {
    if (typeof location === "undefined") return defaultReaderState
    return normalizeReaderState(new URLSearchParams(location.search))
  })

  useEffect(() => {
    const restore = () => {
      setState(normalizeReaderState(new URLSearchParams(location.search)))
    }
    window.addEventListener("popstate", restore)
    return () => window.removeEventListener("popstate", restore)
  }, [])

  useEffect(() => {
    applyTheme(state.theme as any)
    document.documentElement.dataset.mode = state.mode
    document.documentElement.classList.toggle("light", state.mode === "light")
    document.documentElement.classList.toggle("dark", state.mode === "dark")
    document.documentElement.style.colorScheme = state.mode
    const canonical = readerHref(state)
    const current = `${location.pathname}${location.search}`
    if (current !== canonical) {
      window.history.replaceState(null, "", canonical)
    }
  }, [state])

  function change(next: ReaderExampleState) {
    setState(next)
    window.history.pushState(null, "", readerHref(next))
  }

  return <ReaderExample state={state} onChange={change} />
}
