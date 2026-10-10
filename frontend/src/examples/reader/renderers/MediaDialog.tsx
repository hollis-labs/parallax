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
import { type KeyboardEvent, type ReactNode, type RefObject, useLayoutEffect, useRef } from "react"

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
  const openTicket = useRef(0)
  const openedTicket = useRef<number | null>(null)
  const openedGeneration = useRef<unknown>(null)
  const openedRoot = useRef<HTMLElement | null>(null)

  useLayoutEffect(() => {
    if (open) {
      openTicket.current++
      openedTicket.current = openTicket.current
      openedGeneration.current = sourceGeneration
      const target = returnFocusRef?.current
      openedRoot.current =
        target?.closest<HTMLElement>('[data-testid="reader-detail-page"]') ?? null
    }
  }, [open, sourceGeneration, returnFocusRef])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        ref={dialogRef}
        data-reader-dialog
        className="max-h-[calc(100dvh-1rem)] max-w-4xl overflow-hidden p-0 motion-reduce:animate-none border border-border bg-panel shadow-xl"
        finalFocus={() => {
          // 1. Must match captured open ticket and source generation
          if (openedTicket.current === null || openTicket.current !== openedTicket.current) {
            return false
          }
          if (sourceGeneration !== undefined && openedGeneration.current !== sourceGeneration) {
            return false
          }
          const target = returnFocusRef?.current
          // 2. Target must be connected and within captured root
          if (!target || !target.isConnected || !visible(target)) {
            return false
          }
          if (
            openedRoot.current &&
            (!openedRoot.current.isConnected || !openedRoot.current.contains(target))
          ) {
            return false
          }
          // 3. No competing dialogs/menus
          if (competingLayer([target])) {
            return false
          }
          // 4. Newer plain foreground owner check
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
        }}
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
