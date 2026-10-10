import { createThemeStore } from "@hollis-labs/design-app-runtime"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { diagnostics, OperationsListProof } from "./Proof"
import "../index.css"

const params = new URLSearchParams(location.search)
const theme = createThemeStore({
  defaultTheme: "nanite-default",
  themes: [
    "nanite-default",
    "dir-a",
    "dir-b",
    "dir-d",
    "dir-e",
    "dir-f",
    "sysop-p4-white",
    "sysop-green-phosphor",
    "sysop-amber-phosphor",
    "sysop-hi-contrast",
  ],
  storageKey: "operations-list-proof.appearance",
})
theme.initialize()
theme.setTheme(params.get("theme") ?? "nanite-default")
theme.setMode(params.get("mode") === "light" ? "light" : "dark")
Object.assign(window, { operationsProof: diagnostics })
const root = document.getElementById("root")
if (!root) throw new Error("Missing operations list proof root")
createRoot(root).render(
  <StrictMode>
    <OperationsListProof
      consumer={params.get("consumer") === "runs" ? "runs" : "torque"}
      scenario={params.get("scenario") ?? "populated"}
    />
  </StrictMode>,
)
