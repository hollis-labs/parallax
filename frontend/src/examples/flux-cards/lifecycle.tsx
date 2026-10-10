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
import { Activity, StrictMode, useState } from "react"
import { createRoot } from "react-dom/client"
import "../../index.css"
import { FluxCardsGallery } from "./Gallery"

function LifecycleProof() {
  const [visible, setVisible] = useState(true)
  const [outsideOpen, setOutsideOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setVisible((value) => !value)}>
        Toggle candidate activity
      </button>
      <button type="button" id="competing-focus">
        New foreground owner
      </button>
      <Button onClick={() => setOutsideOpen(true)}>Open outside native dialog</Button>
      <Dialog open={outsideOpen} onOpenChange={setOutsideOpen} modal={false}>
        <DialogContent aria-label="Outside native dialog">
          <DialogTitle>Outside native dialog</DialogTitle>
          <label>
            Outside foreground draft
            <input aria-label="Outside foreground draft" />
          </label>
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen} modal={false}>
            <DropdownMenuTrigger render={<Button />}>Open outside native menu</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Outside foreground menu item</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </DialogContent>
      </Dialog>

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
