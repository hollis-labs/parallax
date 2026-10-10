import { applyTheme } from "@hollis-labs/kit-dashboard"
import { useCallback, useEffect, useState } from "react"
import { OverviewPage } from "../../tether-sysop/OverviewPage"
import {
  defaultTetherState,
  normalizeTetherState,
  type TetherExampleState,
  tetherHref,
} from "./model"

export function StandaloneTetherExample() {
  const [state, setState] = useState<TetherExampleState>(() => {
    if (typeof location === "undefined") return defaultTetherState
    return normalizeTetherState(new URLSearchParams(location.search))
  })

  useEffect(() => {
    const restore = () => {
      setState(normalizeTetherState(new URLSearchParams(location.search)))
    }
    window.addEventListener("popstate", restore)
    return () => window.removeEventListener("popstate", restore)
  }, [])

  useEffect(() => {
    applyTheme(state.theme as Parameters<typeof applyTheme>[0])
    document.documentElement.dataset.mode = state.mode
    document.documentElement.classList.toggle("light", state.mode === "light")
    document.documentElement.classList.toggle("dark", state.mode === "dark")
    document.documentElement.style.colorScheme = state.mode

    const canonical = tetherHref(state)
    const current = `${location.pathname}${location.search}`
    if (current !== canonical) {
      window.history.replaceState(null, "", canonical)
    }
  }, [state])

  const change = useCallback((next: TetherExampleState) => {
    setState(next)
    window.history.pushState(null, "", tetherHref(next))
  }, [])

  return (
    <OverviewPage
      variant={state.variant}
      onVariantChange={(variant) => change({ ...state, variant })}
      forcedAppearance={state.appearance}
      showIdentityLinks={true}
      showVariantSelector={true}
    />
  )
}
