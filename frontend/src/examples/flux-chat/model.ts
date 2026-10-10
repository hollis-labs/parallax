import { BUILTIN_THEMES } from "@hollis-labs/design-tokens"
import { type Scenario, scenarios } from "../../flux-rail/model"
import { type ChatExampleState, chatExampleState } from "../chat/routes"
import { type CardState, cardStates, type ToolMode, toolModes } from "../flux-cards/model"
import { type Preset, presets } from "../flux-navigation/model"
export const sourceIdentity = "flux-chat/v1:4421:2026-10-04T14:30:00Z"
export type FluxState = {
  chat: ChatExampleState
  layout: Preset
  card: CardState
  tools: ToolMode
  rail: Scenario
  welcome: boolean
  theme: string
  mode: "light" | "dark"
}
export function fluxState(params = new URLSearchParams()): FluxState {
  const chat = chatExampleState(params)
  // Preserve opaque unknown session IDs as unavailable, never substitute CHAT-001.
  chat.session = params.get("session") ?? chat.session
  return {
    chat,
    layout: Object.hasOwn(presets, params.get("layout") ?? "")
      ? (params.get("layout") as Preset)
      : "default",
    card: cardStates.find((value) => value === params.get("card")) ?? "complete",
    tools: toolModes.find((value) => value === params.get("tools")) ?? "compact",
    rail: scenarios.find((value) => value === params.get("rail")) ?? "populated",
    welcome: params.get("welcome") === "true",
    theme: BUILTIN_THEMES.find((value) => value.id === params.get("theme"))?.id ?? "nanite-default",
    mode: params.get("mode") === "light" ? "light" : "dark",
  }
}
export function fluxHref(state: FluxState) {
  return `/?${new URLSearchParams({
    ...state.chat,
    example: "flux-chat",
    layout: state.layout,
    card: state.card,
    tools: state.tools,
    rail: state.rail,
    welcome: String(state.welcome),
    theme: state.theme,
    mode: state.mode,
  })}`
}
export type ComposedHandle = {
  source: string
  run: (effect: () => void) => boolean
  focus: () => HTMLElement | false
  inspect: (label: string, value: unknown) => boolean
}
export const diagnostics: { frames: ComposedHandle[]; effects: string[] } = {
  frames: [],
  effects: [],
}
