import { Activity, StrictMode, useState } from "react"
import { createRoot } from "react-dom/client"
import "../../index.css"
import { FluxCardsGallery } from "./Gallery"

function LifecycleProof() {
  const [visible, setVisible] = useState(true)
  return (
    <>
      <button type="button" onClick={() => setVisible((value) => !value)}>
        Toggle candidate activity
      </button>
      <button type="button" id="competing-focus">
        New foreground owner
      </button>
      <Activity mode={visible ? "visible" : "hidden"}>
        <FluxCardsGallery />
      </Activity>
    </>
  )
}
const root = document.getElementById("root")
if (!root) throw new Error("proof root missing")
createRoot(root).render(
  <StrictMode>
    <LifecycleProof />
  </StrictMode>,
)
