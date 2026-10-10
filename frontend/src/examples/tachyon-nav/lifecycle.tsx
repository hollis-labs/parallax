import { Button } from "@hollis-labs/design-components"
import { Activity, StrictMode, useLayoutEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import "../../index.css"
import { diagnostics, TachyonNav } from "./TachyonNav"

function Lifecycle() {
  const [visible, setVisible] = useState(true),
    [mounted, setMounted] = useState(true)
  useLayoutEffect(() => {
    Object.assign(window, { tachyonNav: diagnostics })
    document.documentElement.dataset.theme = "nanite-default"
    document.documentElement.dataset.mode = "dark"
  }, [])
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setVisible(!visible)}>Toggle fixture Activity</Button>
        <Button onClick={() => setMounted(!mounted)}>Toggle fixture root</Button>
        <Button onClick={() => diagnostics.replace?.()}>Replace fixture source</Button>
        <Button onClick={() => diagnostics.access?.()}>Toggle fixture access</Button>
        <Button onClick={() => diagnostics.layer?.()}>Toggle fixture layer</Button>
        <input aria-label="New plain foreground owner" />
      </div>
      <Activity mode={visible ? "visible" : "hidden"}>{mounted && <TachyonNav />}</Activity>
    </>
  )
}
const root = document.getElementById("root")
if (!root) throw new Error("Fixture root missing")
createRoot(root).render(
  <StrictMode>
    <Lifecycle />
  </StrictMode>,
)
