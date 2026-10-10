import { Button, DetailDialog } from "@hollis-labs/design-components"
import { useRef, useState } from "react"

function CompetingPortal() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open competing portal</Button>
      <DetailDialog open={open} onClose={() => setOpen(false)} title="Competing foreground">
        <input aria-label="Competing editor" />
      </DetailDialog>
    </>
  )
}

/** Exact owned-popup and queued foreground review controls; all effects local. */
export function ForegroundProof() {
  const [open, setOpen] = useState(false)
  const [moveForeground, setMoveForeground] = useState(false)
  const origin = useRef<HTMLButtonElement>(null),
    foreground = useRef<HTMLButtonElement>(null)
  return (
    <main className="space-y-4 bg-bg p-4 text-fg">
      <p>Seed4421 · 2026-10-04T14:30Z · local focus admission probes</p>
      <label>
        <input
          type="checkbox"
          checked={moveForeground}
          onChange={(event) => setMoveForeground(event.target.checked)}
        />{" "}
        Claim foreground during return admission
      </label>
      <div className="flex flex-wrap gap-3">
        <Button ref={origin} onClick={() => setOpen(true)}>
          Open owned portal
        </Button>
        <Button ref={foreground}>Plain foreground owner</Button>
        <CompetingPortal />
      </div>
      <DetailDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Owned foreground"
        showFullscreenToggle
        returnFocus={{
          trigger: () => origin.current,
          isAdmitted: () => {
            // Deliberate probe seam: a host establishes a newer plain focus owner
            // during queued admission, after Base UI releases aria-hidden.
            if (moveForeground) foreground.current?.focus()
            return true
          },
        }}
      >
        <input aria-label="Owned editor" />
      </DetailDialog>
    </main>
  )
}
