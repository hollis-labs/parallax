import { Activity, StrictMode, useState } from "react"
import { flushSync } from "react-dom"
import { createRoot } from "react-dom/client"
import { diagnostics, FluxRailReview } from "../../src/flux-rail/Review"

function currentFrame() {
  const frame = diagnostics.frames.at(-1)
  if (!frame) throw new Error("No committed rail frame")
  return frame
}
export async function exercise() {
  const element = document.createElement("div")
  document.body.append(element)
  const root = createRoot(element)
  let hide: (mode: "visible" | "hidden") => void = () => {}
  function Harness() {
    const [mode, setMode] = useState<"visible" | "hidden">("visible")
    hide = setMode
    return (
      <Activity mode={mode}>
        <FluxRailReview />
      </Activity>
    )
  }
  flushSync(() =>
    root.render(
      <StrictMode>
        <Harness />
      </StrictMode>,
    ),
  )
  const settle = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  await settle()
  const retained = currentFrame()
  const positive = retained.signal({ action: "open", panel_id: "widgets" })
  await settle()
  const beforeHide = currentFrame()
  flushSync(() => hide("hidden"))
  await settle()
  const hidden = beforeHide.signal({ action: "open", panel_id: "work" })
  flushSync(() => hide("visible"))
  await settle()
  const reactivated = beforeHide.signal({ action: "open", panel_id: "work" })
  const latest = currentFrame()
  const current = latest.signal({ action: "open", panel_id: "inbox" })
  await settle()
  const beforeUnmount = currentFrame()
  flushSync(() => root.unmount())
  element.remove()
  const unmounted = beforeUnmount.signal({ action: "open", panel_id: "work" })
  return { positive, hidden, reactivated, current, unmounted }
}
