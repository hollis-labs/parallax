import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@hollis-labs/design-components"
import { Activity, StrictMode, useLayoutEffect, useState } from "react"
import { createRoot } from "react-dom/client"
import "../../index.css"
import { FluxChat } from "./FluxChat"
import { diagnostics, fluxState } from "./model"

function Lifecycle() {
  const [visible, setVisible] = useState(true)
  const [mounted, setMounted] = useState(true)
  const [epoch, setEpoch] = useState(0)
  const [state, setState] = useState(fluxState)
  const [outside, setOutside] = useState(false)
  useLayoutEffect(() => {
    Object.assign(window, { fluxChat: diagnostics })
  }, [])
  return (
    <>
      <Button onClick={() => setVisible(!visible)}>Toggle composed Activity</Button>
      <Button onClick={() => setMounted(!mounted)}>Toggle composed root</Button>
      <Button onClick={() => setEpoch(epoch + 1)}>Replace composed source</Button>
      <Button
        onClick={() =>
          setState({
            ...state,
            chat: {
              ...state.chat,
              appearance: state.chat.appearance === "recorded" ? "denied" : "recorded",
            },
          })
        }
      >
        Toggle composed access
      </Button>
      <Button id="foreground-owner">New plain foreground owner</Button>
      <Button onClick={() => setOutside(true)}>Open newer foreground dialog</Button>
      <Dialog open={outside} onOpenChange={setOutside} modal={false}>
        <DialogContent aria-label="Newer foreground dialog">
          <DialogTitle>Newer foreground dialog</DialogTitle>
          <input aria-label="Newer foreground input" />
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger render={<Button />}>Newer foreground menu</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Newer menu item</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </DialogContent>
      </Dialog>
      <Activity mode={visible ? "visible" : "hidden"}>
        {mounted && <FluxChat key={epoch} state={state} onChange={setState} />}
      </Activity>
    </>
  )
}
const root = document.getElementById("root")
if (!root) throw new Error("Flux Chat lifecycle root missing")
createRoot(root).render(
  <StrictMode>
    <Lifecycle />
  </StrictMode>,
)
