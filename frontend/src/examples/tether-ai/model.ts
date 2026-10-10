import type { AITabKey } from "../../tether-sysop/AIGatewayPage"
import type { OverviewVariantKey } from "../../tether-sysop/model"

export const tetherVariants: readonly OverviewVariantKey[] = [
  "standard",
  "blocked-health",
  "degraded-reliability",
  "combined-adverse",
] as const

export const tetherTabs: readonly AITabKey[] = [
  "config",
  "providers",
  "routes",
  "runtime",
  "usage",
  "audit",
  "budgets",
] as const

export interface TetherAIExampleState {
  example: "tether" | "tether-ai"
  screen: "ai"
  tab: AITabKey
  variant: OverviewVariantKey
  theme: string
  mode: "dark" | "light"
  appearance?: "ready" | "loading" | "error" | "empty"
}

export const defaultTetherAIState: TetherAIExampleState = {
  example: "tether",
  screen: "ai",
  tab: "config",
  variant: "standard",
  theme: "p4-white",
  mode: "dark",
  appearance: "ready",
}

export function normalizeTetherAIState(params: URLSearchParams): TetherAIExampleState {
  const rawTab = params.get("tab") as AITabKey | null
  const tab: AITabKey = rawTab && tetherTabs.includes(rawTab) ? rawTab : "config"

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
      ? (rawAppearance as TetherAIExampleState["appearance"])
      : "ready"

  return {
    example: "tether",
    screen: "ai",
    tab,
    variant,
    theme,
    mode,
    appearance,
  }
}

export function tetherAIHref(state: TetherAIExampleState): string {
  const params = new URLSearchParams()
  params.set("example", state.example || "tether")
  params.set("screen", "ai")
  if (state.tab && state.tab !== "config") params.set("tab", state.tab)
  if (state.variant && state.variant !== "standard") params.set("variant", state.variant)
  if (state.theme && state.theme !== "p4-white") params.set("theme", state.theme)
  if (state.mode && state.mode !== "dark") params.set("mode", state.mode)
  if (state.appearance && state.appearance !== "ready") params.set("appearance", state.appearance)
  return `/?${params.toString()}`
}
