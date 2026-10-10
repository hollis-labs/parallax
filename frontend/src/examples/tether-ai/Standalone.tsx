import { applyTheme } from "@hollis-labs/kit-dashboard"
import { useCallback, useEffect, useState } from "react"
import { AIGatewayPage, type AITabKey } from "../../tether-sysop/AIGatewayPage"
import {
  defaultTetherAIState,
  normalizeTetherAIState,
  type TetherAIExampleState,
  tetherAIHref,
} from "./model"

export function StandaloneTetherAIExample() {
  const [state, setState] = useState<TetherAIExampleState>(() => {
    if (typeof location === "undefined") return defaultTetherAIState
    return normalizeTetherAIState(new URLSearchParams(location.search))
  })

  useEffect(() => {
    const restore = () => {
      setState(normalizeTetherAIState(new URLSearchParams(location.search)))
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

    const canonical = tetherAIHref(state)
    const current = `${location.pathname}${location.search}`
    if (current !== canonical) {
      window.history.replaceState(null, "", canonical)
    }
  }, [state])

  const change = useCallback((next: TetherAIExampleState) => {
    setState(next)
    window.history.pushState(null, "", tetherAIHref(next))
  }, [])

  return (
    <AIGatewayPage
      tab={state.tab}
      onTabChange={(tab: AITabKey) => change({ ...state, tab })}
      variant={state.variant}
      onVariantChange={(variant) => change({ ...state, variant })}
      forcedAppearance={state.appearance}
      showIdentityLinks={true}
      showVariantSelector={true}
    />
  )
}
