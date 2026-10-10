import { useLayoutEffect } from "react"
import { type Scenario, scenarios } from "./model"
import { diagnostics, TachyonNav } from "./TachyonNav"
export function StandaloneTachyonNav() {
  const params = new URLSearchParams(location.search)
  const mode = params.get("mode") === "light" ? "light" : "dark"
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = "nanite-default"
    document.documentElement.dataset.mode = mode
    Object.assign(window, { tachyonNav: diagnostics })
  }, [mode])
  const scenario = params.get("scenario") as Scenario
  return (
    <TachyonNav
      initialScenario={scenarios.includes(scenario) ? scenario : "populated"}
      initialVariant={params.get("variant") === "left" ? "left" : "top"}
    />
  )
}
