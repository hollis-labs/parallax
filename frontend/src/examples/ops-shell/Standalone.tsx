import { useLayoutEffect } from "react"
import { themes } from "./model"
import { diagnostics, OpsShellExample } from "./OpsShellExample"
export function StandaloneOpsShellExample() {
  const params = new URLSearchParams(location.search)
  const theme = themes.find((t) => t === params.get("theme")) ?? "nanite-default"
  const mode = params.get("mode") === "light" ? "light" : "dark"
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.dataset.mode = mode
    Object.assign(window, { opsShell: diagnostics })
  }, [theme, mode])
  return (
    <OpsShellExample
      initialScenario={params.get("scenario") ?? "populated"}
      initialMode={params.get("inspector") === "modal" ? "modal" : "inline"}
      asideContent={
        params.get("aside") === "empty"
          ? "empty"
          : params.get("aside") === "absent"
            ? "absent"
            : "fixture-chat"
      }
    />
  )
}
