import {
  type BindingRequest,
  constantTrust,
  defineBindingTable,
  resolve,
} from "@hollis-labs/design-bindings"
export const bindingRows: readonly BindingRequest[] = [
  {
    kind: "parallax.confirmation/v1",
    version: "1",
    rendererId: "fixture-confirmation",
    rendererClass: "react-component",
    entry: "@hollis-labs/kit-chat#ConfirmationCard",
    payload: { from: "data" },
    requestedTrust: "core-trusted",
    fallback: { kind: "none" },
  },
  {
    kind: "parallax.prompt/v1",
    version: "1",
    rendererId: "fixture-prompt",
    rendererClass: "react-component",
    entry: "@hollis-labs/kit-chat#PromptCard",
    payload: { from: "data" },
    requestedTrust: "core-trusted",
    fallback: { kind: "none" },
  },
]
// These rows name app-owned fixture kinds, not a claim of server envelope compatibility.
export const chatBindings = defineBindingTable({
  contractDigest: "parallax-fixture-bindings/v1",
  resolverConfig: { inlinePayloadLimitBytes: 16384 },
  trust: constantTrust("core-trusted"),
  rows: bindingRows,
})
export const classifyCard = (kind: string) => resolve(chatBindings, kind)
