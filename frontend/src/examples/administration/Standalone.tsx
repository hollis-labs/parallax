import { applyTheme } from "@hollis-labs/kit-dashboard"
import { useEffect, useState } from "react"
import { AdministrationExample } from "./AdministrationExample"
import { type AdministrationState, administrationHref, normalizeAdministrationState } from "./model"
export function StandaloneAdministrationExample() {
  const [state, setState] = useState(() =>
    normalizeAdministrationState(new URLSearchParams(location.search)),
  )
  useEffect(() => {
    const restore = () =>
      setState(normalizeAdministrationState(new URLSearchParams(location.search)))
    addEventListener("popstate", restore)
    return () => removeEventListener("popstate", restore)
  }, [])
  useEffect(() => {
    applyTheme(state.theme)
    document.documentElement.dataset.mode = state.mode
    history.replaceState(null, "", administrationHref(state))
  }, [state])
  const change = (next: AdministrationState) => {
    const admitted = normalizeAdministrationState(new URLSearchParams(next))
    setState(admitted)
    history.pushState(null, "", administrationHref(admitted))
  }
  return <AdministrationExample state={state} onChange={change} />
}
