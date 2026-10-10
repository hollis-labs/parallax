import { useEffect, useState } from "react"
import { DrawersReview } from "./DrawersReview"

export function StandaloneDrawersReview() {
  const [params, setParams] = useState(() => new URLSearchParams(window.location.search))

  useEffect(() => {
    const handlePopState = () => {
      setParams(new URLSearchParams(window.location.search))
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  const initialSessionId = params.get("session") || "CHAT-001"
  const initialTheme = params.get("theme") || "nanite-default"
  const initialMode = (params.get("mode") as "light" | "dark") || "dark"
  const developerModeDefault =
    params.get("developerMode") === "true" || params.get("developerMode") === "1"

  return (
    <div className="w-screen h-screen overflow-hidden bg-bg text-fg">
      <DrawersReview
        key={`${initialSessionId}-${initialTheme}-${initialMode}`}
        initialSessionId={initialSessionId}
        initialTheme={initialTheme}
        initialMode={initialMode}
        developerModeDefault={developerModeDefault}
      />
    </div>
  )
}
