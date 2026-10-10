import type { OverviewVariantKey } from "../../tether-sysop/model"

export const tetherScreens = ["overview"] as const
export type TetherScreen = (typeof tetherScreens)[number]

export const tetherVariants: readonly OverviewVariantKey[] = [
  "standard",
  "blocked-health",
  "degraded-reliability",
  "combined-adverse",
] as const

export interface TetherExampleState {
  example: "tether"
  screen: TetherScreen
  variant: OverviewVariantKey
  theme: string
  mode: "dark" | "light"
  appearance?: "ready" | "loading" | "error" | "empty"
}

export const defaultTetherState: TetherExampleState = {
  example: "tether",
  screen: "overview",
  variant: "standard",
  theme: "p4-white",
  mode: "dark",
  appearance: "ready",
}

export function normalizeTetherState(params: URLSearchParams): TetherExampleState {
  const rawScreen = params.get("screen")
  const screen: TetherScreen = rawScreen === "overview" ? "overview" : "overview"

  const rawVariant = params.get("variant") as OverviewVariantKey | null
  const variant: OverviewVariantKey =
    rawVariant && tetherVariants.includes(rawVariant) ? rawVariant : "standard"

  const rawTheme = params.get("theme")
  const theme =
    rawTheme &&
    ["p4-white", "p1-green-phosphor", "p3-amber-phosphor", "hi-contrast"].includes(rawTheme)
      ? rawTheme
      : "p4-white"

  const rawMode = params.get("mode")
  const mode = rawMode === "light" ? "light" : "dark"

  const rawAppearance = params.get("appearance")
  const appearance =
    rawAppearance && ["ready", "loading", "error", "empty"].includes(rawAppearance)
      ? (rawAppearance as TetherExampleState["appearance"])
      : "ready"

  return {
    example: "tether",
    screen,
    variant,
    theme,
    mode,
    appearance,
  }
}

export function tetherHref(state: TetherExampleState): string {
  const params = new URLSearchParams()
  params.set("example", "tether")
  if (state.screen) params.set("screen", state.screen)
  if (state.variant && state.variant !== "standard") params.set("variant", state.variant)
  if (state.theme && state.theme !== "p4-white") params.set("theme", state.theme)
  if (state.mode && state.mode !== "dark") params.set("mode", state.mode)
  if (state.appearance && state.appearance !== "ready") params.set("appearance", state.appearance)
  return `/?${params.toString()}`
}
