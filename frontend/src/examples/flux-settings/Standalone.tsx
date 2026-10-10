import { useLayoutEffect } from "react"
import { FluxSettingsExample } from "./FluxSettingsExample"
import type { SettingsSectionId } from "./FluxSettingsShell"
import { BUILTIN_THEMES, type ThemeMode } from "./model"

export function StandaloneFluxSettingsExample() {
  const params = new URLSearchParams(typeof location !== "undefined" ? location.search : "")
  const themeParam = params.get("theme")
  const modeParam = (params.get("mode") as ThemeMode) || "dark"
  const sectionParam = params.get("section") as SettingsSectionId | null
  const scenarioParam =
    (params.get("scenario") as "populated" | "read-only" | "empty-search" | "malformed-fallback") ||
    "populated"

  const theme = BUILTIN_THEMES.find((t) => t.id === themeParam) ?? BUILTIN_THEMES[0]

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme.id
    document.documentElement.dataset.mode = modeParam
    // Apply styling background to body
    document.body.className = "bg-bg text-fg antialiased min-h-screen"
  }, [theme.id, modeParam])

  return (
    <FluxSettingsExample
      initialTheme={theme}
      initialMode={modeParam}
      initialSection={sectionParam ?? undefined}
      initialScenario={scenarioParam}
      portable={false}
    />
  )
}
