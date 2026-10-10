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
import type { KeyboardEvent, ReactNode, RefObject } from "react"

export interface MediaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  returnFocusRef?: RefObject<HTMLElement | null>
  title: string
  description: string
  children: ReactNode
  onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void
  minimal?: boolean
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
}: MediaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-reader-dialog
        className="max-h-[calc(100dvh-1rem)] max-w-4xl overflow-hidden p-0 motion-reduce:animate-none border border-border bg-panel shadow-xl"
        finalFocus={() => returnFocusRef?.current ?? null}
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
