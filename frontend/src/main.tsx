import React from "react"
import ReactDOM from "react-dom/client"
import { App } from "./App"
import { StandaloneAdminReview } from "./admin-review/Review"
import "./index.css"

const root = document.getElementById("root")
if (!root) throw new Error("root element missing")
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    {new URLSearchParams(location.search).get("adminShellReview") === "1" ? (
      <StandaloneAdminReview />
    ) : (
      <App />
    )}
  </React.StrictMode>,
)
