import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "../../index.css"
import { NilHarness } from "./Harness"

const root = document.getElementById("root")
if (!root) throw new Error("Nil proof root missing")
createRoot(root).render(
  <StrictMode>
    <NilHarness />
  </StrictMode>,
)
