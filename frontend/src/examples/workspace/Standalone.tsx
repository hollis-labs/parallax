import { applyTheme } from "@hollis-labs/kit-dashboard"
import { useEffect, useState } from "react"
import { normalizeWorkspaceState, type WorkspaceState, workspaceHref } from "./model"
import { WorkspaceExample } from "./WorkspaceExample"
export function StandaloneWorkspaceExample() {
  const [state, setState] = useState(() =>
    normalizeWorkspaceState(new URLSearchParams(location.search)),
  )
  useEffect(() => {
    const restore = () => setState(normalizeWorkspaceState(new URLSearchParams(location.search)))
    addEventListener("popstate", restore)
    return () => removeEventListener("popstate", restore)
  }, [])
  useEffect(() => {
    applyTheme(state.theme)
    document.documentElement.dataset.mode = state.mode
    history.replaceState(null, "", workspaceHref(state))
  }, [state])
  const change = (next: WorkspaceState) => {
    const admitted = normalizeWorkspaceState(new URLSearchParams(next))
    setState(admitted)
    history.pushState(null, "", workspaceHref(admitted))
  }
  return <WorkspaceExample state={state} onChange={change} />
}
