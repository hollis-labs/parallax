import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { controls, NilRadialSpecimen } from "./Specimen"
import "../index.css"

Object.assign(window, { nilRadial: controls })
document.documentElement.dataset.theme = "nanite-default"
document.documentElement.dataset.mode = "dark"
const root = document.getElementById("root")
if (!root) throw new Error("Missing root")
createRoot(root).render(
  <StrictMode>
    <NilRadialSpecimen
      idiom={new URLSearchParams(location.search).get("idiom") === "message" ? "message" : "nil"}
    />
  </StrictMode>,
)
