import React from "react"
import ReactDOM from "react-dom/client"
import { StandaloneFluxSettingsExample } from "./Standalone"
import "../../index.css"

const root = document.getElementById("root")
if (!root) throw new Error("root element missing")

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <StandaloneFluxSettingsExample />
  </React.StrictMode>,
)
