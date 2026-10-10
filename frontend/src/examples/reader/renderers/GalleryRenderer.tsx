import { Button, cn } from "@hollis-labs/design-components"
import { ChevronLeft, ChevronRight, Expand } from "lucide-react"
import { type KeyboardEvent, useRef, useState } from "react"
import { ReaderCardVisual } from "../ReaderVisual"
import type { ReaderItem, ReaderMediaItem } from "../types"
import { MediaDialog } from "./MediaDialog"
import {
  availableVariantHref,
  imageVariants,
  mediaState,
  orderedMedia,
  type ResourceState,
  stateLabel,
} from "./media"
import { ResourceStatePanel } from "./ResourceStatePanel"

interface GallerySlot {
  media: ReaderMediaItem
  previewHref?: string
  largeHref?: string
}

function slotKind(slot: GallerySlot): "Image" | "Video" {
  return slot.media.kind === "video" ? "Video" : "Image"
}

function slotState(slot: GallerySlot): ResourceState {
  if (slot.media.kind === "image") return mediaState(slot.media)

  const originals = slot.media.variants.filter((variant) => variant.kind === "original")
  if (originals.some((variant) => availableVariantHref(variant) !== undefined)) return "available"
  if (originals.some((variant) => variant.acquisition_state === "pending")) return "pending"
  if (originals.some((variant) => variant.acquisition_state === "failed")) return "failed"
  if (originals.some((variant) => variant.acquisition_state === "reference_only"))
    return "reference_only"
  return "unavailable"
}

function slotAlt(slot: GallerySlot, title: string, index: number): string {
  return (
    slot.media.alt_text?.trim() ||
    slot.media.attachment.caption?.trim() ||
    `${title.trim() || "Captured gallery"} ${slot.media.kind === "video" ? "video poster" : "image"} ${index + 1}`
  )
}

const GALLERY_ROLES = new Set(["primary", "gallery_item", "hero", "inline"])

function gallerySlots(media: ReaderMediaItem[]): GallerySlot[] {
  return orderedMedia(media)
    .filter(
      (item) =>
        (item.kind === "image" || item.kind === "video") && GALLERY_ROLES.has(item.attachment.role),
    )
    .map((item) => {
      const variants =
        item.kind === "image"
          ? imageVariants(item)
          : {
              preview: item.variants.find(
                (variant) =>
                  ["poster", "preview", "thumbnail"].includes(variant.kind) &&
                  availableVariantHref(variant) !== undefined,
              ),
              large: item.variants.find(
                (variant) =>
                  ["poster", "preview", "thumbnail"].includes(variant.kind) &&
                  availableVariantHref(variant) !== undefined,
              ),
            }
      return {
        media: item,
        previewHref: variants.preview && availableVariantHref(variants.preview),
        largeHref: variants.large && availableVariantHref(variants.large),
      }
    })
}

export function GalleryRenderer({
  item,
  presentation,
  className,
}: {
  item: ReaderItem
  presentation: "card" | "detail"
  className?: string
}) {
  const slots = gallerySlots(item.media)
  const [selected, setSelected] = useState(0)
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  if (presentation === "card") return <ReaderCardVisual item={item} className={className} />

  if (slots.length === 0) {
    return (
      <ResourceStatePanel
        className={className}
        state="unavailable"
        label="No gallery items were captured"
      />
    )
  }

  const boundedSelected = Math.max(0, Math.min(selected, slots.length - 1))
  const current = slots[boundedSelected]
  const currentState = slotState(current)
  const currentAlt = slotAlt(current, item.display.title.value, boundedSelected)
  const currentKind = slotKind(current)

  function moveTo(index: number): void {
    setSelected(Math.max(0, Math.min(index, slots.length - 1)))
  }

  function handleDialogKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      moveTo(boundedSelected - 1)
    } else if (event.key === "ArrowRight") {
      event.preventDefault()
      moveTo(boundedSelected + 1)
    } else if (event.key === "Home") {
      event.preventDefault()
      moveTo(0)
    } else if (event.key === "End") {
      event.preventDefault()
      moveTo(slots.length - 1)
    }
  }

  const stage = current.largeHref ?? current.previewHref

  return (
    <div
      className={cn("min-w-0", className)}
      data-reader-renderer="gallery"
      data-reader-presentation={presentation}
    >
      <div className="overflow-hidden rounded-sm border border-border bg-panel-2">
        {stage ? (
          <button
            ref={triggerRef}
            type="button"
            className="group relative flex min-h-72 max-h-[64vh] w-full items-center justify-center overflow-hidden text-left outline-none hover:border-border focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
            onClick={(event) => {
              event.stopPropagation()
              setOpen(true)
            }}
            onKeyDown={(event) => event.stopPropagation()}
            aria-label={`Open gallery at item ${boundedSelected + 1} of ${slots.length}`}
          >
            <img
              src={stage}
              alt={currentAlt}
              loading="lazy"
              className="h-full max-h-[64vh] w-full object-contain p-2 transition-opacity group-hover:opacity-90 motion-reduce:transition-none"
            />
            <span className="absolute bottom-2 right-2 inline-flex min-h-9 items-center gap-1.5 rounded-sm border border-border bg-panel-overlay-strong/95 px-2.5 text-xs font-medium text-text">
              <Expand className="h-3.5 w-3.5" aria-hidden="true" />
              View gallery
            </span>
            <span className="absolute left-2 top-2 rounded-sm bg-panel-overlay-strong/95 px-2 py-0.5 text-caption font-medium uppercase tracking-wide text-text">
              {currentKind}
            </span>
          </button>
        ) : (
          <ResourceStatePanel
            state={currentState === "available" ? "unavailable" : currentState}
            className="m-4 min-h-56"
            label={`${currentKind} ${boundedSelected + 1} is ${stateLabel(currentState).toLowerCase()}`}
          />
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="font-mono text-xs tabular-nums text-text-soft" aria-live="polite">
          {boundedSelected + 1} of {slots.length}
        </p>
        <p className="truncate text-xs text-text-subtle">
          {current.media.attachment.caption || `${currentKind} · ${stateLabel(currentState)}`}
        </p>
      </div>

      <ol
        className="mt-3 flex snap-x gap-2 overflow-x-auto pb-1"
        aria-label="Gallery items in source order"
      >
        {slots.map((slot, index) => {
          const selectedSlot = index === boundedSelected
          const state = slotState(slot)
          const kind = slotKind(slot)
          return (
            <li key={slot.media.attachment.attachment_id} className="shrink-0 snap-start">
              <button
                type="button"
                className={cn(
                  "relative h-16 w-20 overflow-hidden rounded-sm border bg-panel-2 text-left outline-none sm:h-20 sm:w-24 focus-visible:ring-2 focus-visible:ring-ring",
                  selectedSlot
                    ? "border-primary ring-1 ring-primary"
                    : "border-border hover:border-border",
                )}
                onClick={(event) => {
                  event.stopPropagation()
                  moveTo(index)
                }}
                onKeyDown={(event) => event.stopPropagation()}
                aria-label={`Select item ${index + 1} of ${slots.length}: ${kind}, ${stateLabel(state)}`}
                aria-current={selectedSlot ? "true" : undefined}
              >
                {slot.previewHref ? (
                  <img
                    src={slot.previewHref}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center px-1 text-center text-caption leading-4 text-text-subtle">
                    {stateLabel(state)}
                  </span>
                )}
                <span className="absolute left-1 top-1 rounded-sm bg-panel-overlay-strong/95 px-1.5 py-0.5 font-mono text-caption tabular-nums text-text">
                  {index + 1}
                </span>
                {slot.media.kind === "video" && (
                  <span className="absolute bottom-1 right-1 rounded-sm bg-panel-overlay-strong/95 px-1.5 py-0.5 text-micro font-medium uppercase tracking-wide text-text">
                    Video
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ol>

      <MediaDialog
        open={open}
        onOpenChange={setOpen}
        returnFocusRef={triggerRef}
        sourceGeneration={item.fragment_id}
        title={item.display.title.value || "Captured gallery"}
        description={`${currentKind} ${boundedSelected + 1} of ${slots.length}`}
        onKeyDown={handleDialogKeyDown}
      >
        <div className="grid min-h-0 grid-rows-[1fr_auto] bg-bg">
          <div className="flex min-h-0 items-center justify-center overflow-auto p-4 sm:p-6">
            {stage ? (
              <img
                src={stage}
                alt={currentAlt}
                className="max-h-[calc(100dvh-14rem)] max-w-full object-contain"
              />
            ) : (
              <ResourceStatePanel
                state={currentState === "available" ? "unavailable" : currentState}
                label={`${currentKind} ${boundedSelected + 1} is unavailable`}
              />
            )}
          </div>
          <div className="flex items-center justify-center gap-3 border-t border-border px-4 py-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => moveTo(boundedSelected - 1)}
              disabled={boundedSelected === 0}
              aria-label="Previous gallery item"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Previous
            </Button>
            <span
              className="min-w-16 text-center font-mono text-xs tabular-nums text-text-soft"
              aria-live="polite"
            >
              {boundedSelected + 1} of {slots.length}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => moveTo(boundedSelected + 1)}
              disabled={boundedSelected === slots.length - 1}
              aria-label="Next gallery item"
            >
              Next
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </MediaDialog>
    </div>
  )
}
