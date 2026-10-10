import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@hollis-labs/design-components"
import { X } from "lucide-react"
import { type KeyboardEvent, type ReactNode, type RefObject, useEffect, useLayoutEffect, useRef } from "react"

import { competingLayer, visible } from "../../flux-chat/ownership"

export interface MediaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  returnFocusRef?: RefObject<HTMLElement | null>
  title: string
  description: string
  children: ReactNode
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void
  minimal?: boolean
  sourceGeneration?: unknown
}

declare global {
  interface Window {
    readerDialog?: {
      finalFocus: () => HTMLElement | false
      activeTicket: () => number | null
    }
    heldFinalFocus?: () => HTMLElement | false
  }
}

let nextDialogActivationTicket = 0

interface DialogActivation {
  ticket: number
  sourceGeneration: unknown
  root: HTMLElement | null
  target: HTMLElement | null
  alive: boolean
}

export function MediaDialog({
  open,
  onOpenChange,
  returnFocusRef,
  title,
  description,
  children,
  onKeyDown,
  minimal = false,
  sourceGeneration,
}: MediaDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const currentActivationRef = useRef<DialogActivation | null>(null)
  const currentResolverRef = useRef<(() => HTMLElement | false) | null>(null)

  const resolveFinalFocus = (boundActivation: DialogActivation | null): HTMLElement | false => {
    if (!boundActivation || !boundActivation.alive) {
      return false
    }
    // Fulfill and permanently retire ONLY this specific bound activation
    boundActivation.alive = false
    if (currentActivationRef.current === boundActivation) {
      currentActivationRef.current = null
      currentResolverRef.current = null
    }

    if (sourceGeneration !== undefined && boundActivation.sourceGeneration !== sourceGeneration) {
      return false
    }

    const target = boundActivation.target
    if (!target || !target.isConnected || !visible(target)) {
      return false
    }

    if (
      boundActivation.root &&
      (!boundActivation.root.isConnected ||
        !visible(boundActivation.root) ||
        !boundActivation.root.contains(target))
    ) {
      return false
    }

    // Exempt the exact closing popup itself, veto on any other competing layer
    if (competingLayer([dialogRef.current])) {
      return false
    }

    const foreground = document.activeElement
    if (
      foreground instanceof HTMLElement &&
      foreground !== document.body &&
      !dialogRef.current?.contains(foreground) &&
      visible(foreground)
    ) {
      return false
    }

    return target
  }

  useLayoutEffect(() => {
    if (open) {
      if (currentActivationRef.current) {
        currentActivationRef.current.alive = false
      }
      const target = returnFocusRef?.current ?? null
      const root = target?.closest<HTMLElement>('[data-testid="reader-detail-page"]') ?? null
      const activation: DialogActivation = {
        ticket: ++nextDialogActivationTicket,
        sourceGeneration,
        root,
        target,
        alive: true,
      }
      currentActivationRef.current = activation
      const openingResolver = () => resolveFinalFocus(activation)
      currentResolverRef.current = openingResolver

      if (typeof window !== "undefined") {
        window.readerDialog = {
          finalFocus: openingResolver,
          activeTicket: () => (activation.alive ? activation.ticket : null),
        }
      }
    }
  }, [open, sourceGeneration, returnFocusRef])

  useLayoutEffect(() => {
    return () => {
      // Capture the exact source token this layout effect owns
      const active = currentActivationRef.current
      if (active && active.sourceGeneration === sourceGeneration) {
        active.alive = false
        if (currentActivationRef.current === active) {
          currentActivationRef.current = null
          currentResolverRef.current = null
        }
        if (
          typeof window !== "undefined" &&
          window.readerDialog?.activeTicket() === active.ticket
        ) {
          window.readerDialog = undefined
        }
      }
    }
  }, [sourceGeneration])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={dialogRef}
        data-reader-dialog
        className="max-h-[calc(100dvh-1rem)] max-w-4xl overflow-hidden p-0 motion-reduce:animate-none border border-border bg-panel shadow-xl"
        finalFocus={() => (currentResolverRef.current ? currentResolverRef.current() : false)}
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <DialogHeader
          className={
            minimal ? "sr-only" : "flex items-start gap-4 border-b border-border px-5 py-4 pr-16"
          }
        >
          <div className="min-w-0">
            <DialogTitle className="truncate text-base font-semibold text-text">
              {title}
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-xs text-text-subtle">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className={minimal ? "absolute right-3 top-3 z-10" : ""}>
          <DialogClose
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={
                  minimal
                    ? "border border-border bg-panel-overlay-strong/95"
                    : "absolute right-3 top-3"
                }
                aria-label={`Close ${title}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenChange(false)
                }}
              />
            }
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </DialogClose>
        </div>
        {children}
      </DialogContent>
    </Dialog>
  )
}
