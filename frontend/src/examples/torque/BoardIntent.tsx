import { Button, Dialog, DialogContent, DialogTitle } from "@hollis-labs/design-components"
import { useEffect, useRef, useState } from "react"

export type BoardIntentRequest = {
  id: string
  action: string
  outcome: "preview" | "error" | "refusal"
  returnTarget: HTMLElement | null
  identity: string
}

// Authored presentation only: no record mutation, persistence or execution adapter.
export function BoardIntent({
  request,
  onClose,
  resolveReturnTarget,
}: {
  request: BoardIntentRequest | null
  onClose: () => void
  resolveReturnTarget: (request: BoardIntentRequest | null) => HTMLElement | null
}) {
  const [phase, setPhase] = useState<"confirm" | "pending" | "result">("confirm")
  const title = useRef<HTMLHeadingElement>(null)
  const origin = useRef<BoardIntentRequest | null>(null)
  if (request) origin.current = request
  useEffect(() => {
    if (request) setPhase("confirm")
  }, [request])
  useEffect(() => {
    if (!request || phase !== "pending") return
    const timer = window.setTimeout(() => setPhase("result"), 600)
    return () => window.clearTimeout(timer)
  }, [request, phase])
  return (
    <Dialog
      open={!!request}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent
        className="torque-board-intent"
        initialFocus={title}
        finalFocus={() => resolveReturnTarget(origin.current)}
      >
        <DialogTitle ref={title} tabIndex={-1}>
          Local action preview
        </DialogTitle>
        <p>
          {request?.action} · {request?.id}
        </p>
        <p>No task will change. This is a transient, scripted demonstration.</p>
        <p role="status" aria-live="polite">
          {phase === "confirm"
            ? "Confirm to preview the authored outcome."
            : phase === "pending"
              ? "Simulated pending · no request is being sent."
              : request?.outcome === "error"
                ? "Simulated error: transition preview failed. The fixture is unchanged; retry the preview."
                : request?.outcome === "refusal"
                  ? "Simulated refusal: a terminal task cannot reopen without explicit authority. The fixture is unchanged."
                  : "Preview complete. The fixture is unchanged; nothing was saved or executed."}
        </p>
        <div>
          {phase !== "pending" && (
            <Button size="sm" onClick={() => setPhase("pending")}>
              {phase === "result" ? "Replay preview" : "Confirm preview"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClose}>
            {phase === "confirm" ? "Cancel preview" : "Close preview"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
