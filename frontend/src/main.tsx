import React from "react"
import ReactDOM from "react-dom/client"
import { App } from "./App"
import { StandaloneAdminReview } from "./admin-review/Review"
import { StandaloneDrawersReview } from "./drawers/Standalone"
import { StandaloneAdministrationExample } from "./examples/administration/Standalone"
import { StandaloneChatExample } from "./examples/chat/Standalone"
import { FluxCardsGallery } from "./examples/flux-cards/Gallery"
import { StandaloneFluxChat } from "./examples/flux-chat/Standalone"
import { StandaloneFluxSettingsComposition } from "./examples/flux-settings/composition/Composition"
import { StandaloneMessagingExample } from "./examples/messaging/Standalone"
import { NilExample } from "./examples/nil/NilExample"
import { StandaloneOpsShellExample } from "./examples/ops-shell/Standalone"
import { StandaloneReaderExample } from "./examples/reader/Standalone"
import { StandaloneTetherExample } from "./examples/tether/Standalone"
import { StandaloneTorqueExample } from "./examples/torque/Standalone"
import { StandaloneWorkspaceExample } from "./examples/workspace/Standalone"
import { StandaloneFluxRailReview } from "./flux-rail/Review"
import "./index.css"

const root = document.getElementById("root")
if (!root) throw new Error("root element missing")
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    {new URLSearchParams(location.search).get("example") === "tether" ? (
      <StandaloneTetherExample />
    ) : new URLSearchParams(location.search).get("example") === "flux-settings" ? (
      <StandaloneFluxSettingsComposition />
    ) : new URLSearchParams(location.search).get("example") === "nil" ? (
      <NilExample />
    ) : new URLSearchParams(location.search).get("example") === "flux-chat" ? (
      <StandaloneFluxChat />
    ) : new URLSearchParams(location.search).get("example") === "flux-cards" ? (
      <FluxCardsGallery />
    ) : new URLSearchParams(location.search).get("example") === "flux-rail" ? (
      <StandaloneFluxRailReview />
    ) : new URLSearchParams(location.search).get("example") === "ops-shell" ? (
      <StandaloneOpsShellExample />
    ) : new URLSearchParams(location.search).get("example") === "reader" ? (
      <StandaloneReaderExample />
    ) : new URLSearchParams(location.search).get("example") === "workspace" ? (
      <StandaloneWorkspaceExample />
    ) : new URLSearchParams(location.search).get("example") === "administration" ? (
      <StandaloneAdministrationExample />
    ) : new URLSearchParams(location.search).get("example") === "messaging" ? (
      <StandaloneMessagingExample />
    ) : new URLSearchParams(location.search).get("example") === "chat" ? (
      <StandaloneChatExample />
    ) : new URLSearchParams(location.search).get("example") === "torque" ? (
      <StandaloneTorqueExample />
    ) : new URLSearchParams(location.search).get("example") === "drawers" ? (
      <StandaloneDrawersReview />
    ) : new URLSearchParams(location.search).get("adminShellReview") === "1" ? (
      <StandaloneAdminReview />
    ) : (
      <App />
    )}
  </React.StrictMode>,
)
