import { cn } from "@hollis-labs/design-components"
import { Expand } from "lucide-react"
import { useRef, useState } from "react"
import { ReaderCardVisual } from "../ReaderVisual"
import type { ReaderItem, ReaderMediaItem } from "../types"
import { MediaDialog } from "./MediaDialog"
import { availableVariantHref, imageVariants, mediaState } from "./media"
import { ResourceStatePanel } from "./ResourceStatePanel"

function imageAlt(media: ReaderMediaItem, title: string): string {
  return (
    media.alt_text?.trim() ||
    media.attachment.caption?.trim() ||
    (title.trim() ? `${title} image` : "Captured image")
  )
}

export function ImageRenderer({
  item,
  presentation,
  className,
}: {
  item: ReaderItem
  presentation: "card" | "detail"
  className?: string
}) {
  const media = item.media.find((candidate) => candidate.kind === "image")
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  if (presentation === "card") return <ReaderCardVisual item={item} className={className} />

  if (!media) {
    return (
      <ResourceStatePanel className={className} state="unavailable" label="No image was captured" />
    )
  }

  const state = mediaState(media)
  const variants = imageVariants(media)
  const previewHref = variants.preview && availableVariantHref(variants.preview)
  const largeHref = (variants.large && availableVariantHref(variants.large)) || previewHref
  const alt = imageAlt(media, item.display.title.value)
  const caption = media.attachment.caption?.trim()

  if (!previewHref) {
    return (
      <ResourceStatePanel
        className={className}
        state={state === "available" ? "unavailable" : state}
        label="Image is not available"
      />
    )
  }

  return (
    <div
      className={cn("min-w-0", className)}
      data-reader-renderer="image"
      data-reader-presentation={presentation}
    >
      <button
        ref={triggerRef}
        type="button"
        className="group relative block w-full overflow-hidden rounded-sm border border-border bg-panel-2 text-left outline-none hover:border-border focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        onClick={(event) => {
          event.stopPropagation()
          setOpen(true)
        }}
        onKeyDown={(event) => event.stopPropagation()}
        aria-label={`View larger image: ${alt}`}
      >
        <span className="flex max-h-[68vh] min-h-64 w-full items-center justify-center overflow-hidden p-2">
          <img
            src={previewHref}
            alt={alt}
            loading="lazy"
            className="h-full w-full object-contain max-h-[68vh] transition-opacity group-hover:opacity-90 motion-reduce:transition-none"
          />
        </span>
        <span className="absolute bottom-2 right-2 inline-flex min-h-9 items-center gap-1.5 rounded-sm border border-border bg-panel-overlay-strong/95 px-2.5 text-xs font-medium text-text">
          <Expand className="h-3.5 w-3.5" aria-hidden="true" />
          View larger
        </span>
      </button>
      {caption && <p className="mt-2 text-xs leading-5 text-text-subtle">{caption}</p>}

      <MediaDialog
        open={open}
        onOpenChange={setOpen}
        returnFocusRef={triggerRef}
        title={item.display.title.value || "Captured image"}
        description={caption || "Larger authorized image representation"}
      >
        <div className="flex max-h-[calc(100dvh-8rem)] min-h-0 items-center justify-center overflow-auto bg-bg p-4 sm:p-6">
          <img
            src={largeHref}
            alt={alt}
            className="max-h-[calc(100dvh-10rem)] max-w-full object-contain"
          />
        </div>
      </MediaDialog>
    </div>
  )
}
