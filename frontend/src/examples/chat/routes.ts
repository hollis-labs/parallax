import { type ChatPackState, chatPack, chatPackStates } from "./model"
export type ChatExampleState = {
  session: string
  query: string
  appearance: ChatPackState
  theme: "p4-white" | "p1-green-phosphor" | "p3-amber-phosphor" | "hi-contrast"
  mode: "light" | "dark"
}
export function chatExampleState(params: URLSearchParams): ChatExampleState {
  const id = params.get("session")
  const appearance = params.get("appearance")
  return {
    session:
      appearance === "empty"
        ? "CHAT-AUTHORED-EMPTY"
        : chatPack.sessions.some((s) => s.id === id)
          ? id!
          : "CHAT-001",
    query: params.get("query") ?? "",
    appearance: chatPackStates.includes(appearance as ChatPackState)
      ? (appearance as ChatPackState)
      : "recorded",
    theme: ["p4-white", "p1-green-phosphor", "p3-amber-phosphor", "hi-contrast"].includes(
      params.get("theme") ?? "",
    )
      ? (params.get("theme")! as ChatExampleState["theme"])
      : "p4-white",
    mode: params.get("mode") === "dark" ? "dark" : "light",
  }
}
export function chatExampleHref(state: ChatExampleState) {
  return `/?${new URLSearchParams({ example: "chat", ...state })}`
}
