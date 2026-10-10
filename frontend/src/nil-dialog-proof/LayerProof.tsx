import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  useLayeredEscape,
} from "@hollis-labs/design-components"
import { useRef, useState } from "react"

/** Exact lower registered menu vs newer portal sibling dialog ownership. */
export function LayerProof() {
  const [menu, setMenu] = useState(true),
    [dialog, setDialog] = useState(false),
    [admitted, setAdmitted] = useState(true)
  const menuRoot = useRef<HTMLDivElement>(null),
    dialogRoot = useRef<HTMLDivElement>(null)
  useLayeredEscape({
    active: menu,
    rootElement: () => menuRoot.current,
    isLayerAdmitted: () => admitted,
    onEscape: () => {
      setMenu(false)
      return "closed"
    },
  })
  const upper = useLayeredEscape({
    active: dialog,
    rootElement: () => dialogRoot.current,
    onEscape: () => {
      setDialog(false)
      return "closed"
    },
  })
  return (
    <main className="space-y-4 bg-bg p-4 text-fg">
      {menu && (
        <div
          ref={menuRoot}
          role="menu"
          aria-label="Registered lower menu"
          className="rounded-md border border-border bg-surface p-4"
        >
          <Button role="menuitem" onClick={() => setDialog(true)}>
            Open upper dialog
          </Button>
        </div>
      )}
      <Dialog
        open={dialog}
        onOpenChange={(next, details) => {
          if (details.reason === "escape-key") {
            details.cancel()
            upper.handleEscape(details.event as KeyboardEvent)
            return
          }
          setDialog(next)
        }}
      >
        <DialogContent ref={dialogRoot}>
          <DialogTitle>Registered upper dialog</DialogTitle>
          <Button onClick={() => setAdmitted(false)}>Retire lower registration</Button>
          <Button onClick={() => setAdmitted(true)}>Admit lower registration</Button>
        </DialogContent>
      </Dialog>
    </main>
  )
}
