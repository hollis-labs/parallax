import { ModeToggle, ThemePicker } from "@hollis-labs/design-components"
import { type ReactNode, useLayoutEffect, useState } from "react"
import { themes } from "../examples/ops-shell/model"

/** Public palette/mode controls with local state only, no stored preferences. */
export function Appearance({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState("nanite-default")
  const [mode, setMode] = useState<"light" | "dark" | "system">("dark")
  const resolvedMode = mode === "system" ? "light" : mode
  useLayoutEffect(() => {
    const root = document.documentElement,
      previousTheme = root.dataset.theme,
      previousMode = root.dataset.mode
    root.dataset.theme = theme
    root.dataset.mode = resolvedMode
    return () => {
      if (previousTheme === undefined) delete root.dataset.theme
      else root.dataset.theme = previousTheme
      if (previousMode === undefined) delete root.dataset.mode
      else root.dataset.mode = previousMode
    }
  }, [theme, resolvedMode])
  return (
    <>
      <div className="flex flex-wrap gap-3 border-b border-border bg-bg-elevated p-3 text-fg">
        <ThemePicker
          theme={theme}
          themes={themes.map((id) => ({ id, name: id }))}
          onThemeChange={setTheme}
        />
        <ModeToggle mode={mode} resolvedMode={resolvedMode} onModeChange={setMode} />
      </div>
      {children}
    </>
  )
}
