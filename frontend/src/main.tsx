import React from "react"
import ReactDOM from "react-dom/client"
import { App } from "./App"
import { StandaloneAdminReview } from "./admin-review/Review"
import { StandaloneAdministrationExample } from "./examples/administration/Standalone"
import { StandaloneChatExample } from "./examples/chat/Standalone"
import { StandaloneMessagingExample } from "./examples/messaging/Standalone"
import { StandaloneReaderExample } from "./examples/reader/Standalone"
import { StandaloneTorqueExample } from "./examples/torque/Standalone"
import { StandaloneWorkspaceExample } from "./examples/workspace/Standalone"
import "./index.css"

const root = document.getElementById("root")
if (!root) throw new Error("root element missing")
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    {new URLSearchParams(location.search).get("example") === "reader" ? (
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
    ) : new URLSearchParams(location.search).get("adminShellReview") === "1" ? (
      <StandaloneAdminReview />
    ) : (
      <App />
    )}
  </React.StrictMode>,
)
