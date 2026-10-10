import { useEffect, useState } from "react"
import { DrawersReview } from "./DrawersReview"

export function StandaloneDrawersReview() {
  const [params, setParams] = useState(() => new URLSearchParams(window.location.search))

  useEffect(() => {
    const handlePopState = () => {
      setParams(new URLSearchParams(window.location.search))
    }
    window.addEventListener("popstate", handlePopState)

    const rootEl = document.getElementById("root")
    document.documentElement.style.minHeight = "100%"
    document.documentElement.style.height = "auto"
    document.body.style.minHeight = "100%"
    document.body.style.height = "auto"
    document.body.style.overflow = "auto"
    if (rootEl) {
      rootEl.style.minHeight = "100%"
      rootEl.style.height = "auto"
      rootEl.style.overflow = "visible"
    }

    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [])

  const initialSessionId = params.get("session") || "CHAT-001"
  const initialTheme = params.get("theme") || "nanite-default"
  const initialMode = (params.get("mode") as "light" | "dark") || "dark"
  const developerModeDefault =
    params.get("developerMode") === "true" || params.get("developerMode") === "1"

  return (
    <DrawersReview
      key={`${initialSessionId}-${initialTheme}-${initialMode}`}
      initialSessionId={initialSessionId}
      initialTheme={initialTheme}
      initialMode={initialMode}
      developerModeDefault={developerModeDefault}
    />
  )
}
