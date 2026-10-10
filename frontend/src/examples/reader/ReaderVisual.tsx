import {
  Button,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@hollis-labs/design-components"
import { ImageIcon, Images, Play, Video } from "lucide-react"
import { useRef, useState } from "react"
import type { ReaderAssetVariant, ReaderItem, ReaderMediaItem } from "./types"

const GALLERY_ROLES = new Set(["primary", "gallery_item", "hero", "inline"])

export type ResourceState = "available" | "pending" | "reference_only" | "failed" | "unavailable"

interface CardVisual {
  href?: string
  largeHref?: string
  alt: string
  label: string
  state: ResourceState
}

export function availableVariantHref(variant: ReaderAssetVariant): string | undefined {
  if (variant.acquisition_state !== "available") return undefined
  const href = variant.content_href?.trim()
  if (!href) return undefined
  if (href.startsWith("data:image/") || href.startsWith("data:text/")) return href
  if (href.startsWith("/") && !href.startsWith("//")) return href
  return undefined
}

const SMALL_IMAGE_ORDER = ["preview", "thumbnail", "poster", "original"] as const
const LARGE_IMAGE_ORDER = ["original", "preview", "poster", "thumbnail"] as const

function chooseVariant(
  media: ReaderMediaItem,
  order: readonly ReaderAssetVariant["kind"][],
): ReaderAssetVariant | undefined {
  for (const kind of order) {
    const found = media.variants.find(
      (variant) => variant.kind === kind && availableVariantHref(variant) !== undefined,
    )
    if (found) return found
  }
  return undefined
}

export function imageVariants(media: ReaderMediaItem): {
  preview?: ReaderAssetVariant
  large?: ReaderAssetVariant
} {
  return {
    preview: chooseVariant(media, SMALL_IMAGE_ORDER),
    large: chooseVariant(media, LARGE_IMAGE_ORDER),
  }
}

function imageHref(media: ReaderMediaItem): string | undefined {
  const preview = imageVariants(media).preview
  return preview && availableVariantHref(preview)
}

function posterHref(media: ReaderMediaItem): string | undefined {
  for (const kind of ["poster", "preview", "thumbnail"] as const) {
    const variant = media.variants.find((candidate) => candidate.kind === kind)
    const href = variant && availableVariantHref(variant)
    if (href) return href
  }
  return undefined
}

function visualAlt(media: ReaderMediaItem, fallback: string): string {
  return media.alt_text?.trim() || media.attachment.caption?.trim() || fallback
}

export function mediaState(media: ReaderMediaItem): ResourceState {
  if (media.variants.some((variant) => availableVariantHref(variant) !== undefined)) {
    return "available"
  }
  if (media.variants.some((variant) => variant.acquisition_state === "pending")) return "pending"
  if (media.variants.some((variant) => variant.acquisition_state === "failed")) return "failed"
  if (media.variants.some((variant) => variant.acquisition_state === "reference_only"))
    return "reference_only"
  return "unavailable"
}

function unavailableState(media: ReaderMediaItem[]): ResourceState {
  const states = media.map(mediaState)
  if (states.includes("pending")) return "pending"
  if (states.includes("failed")) return "failed"
  if (states.includes("reference_only")) return "reference_only"
  return "unavailable"
}

export function selectCardVisual(item: ReaderItem): CardVisual | undefined {
  const media = item.media
  const title = item.display.title.value.trim() || "Captured item"

  if (item.renderer === "image") {
    const candidate = media.find((entry) => entry.kind === "image")
    if (!candidate) {
      return { alt: "", label: "Image", state: "unavailable" }
    }
    const variants = imageVariants(candidate)
    const href = variants.preview && availableVariantHref(variants.preview)
    const largeHref = variants.large && availableVariantHref(variants.large)
    return {
      href,
      largeHref,
      alt: visualAlt(candidate, `${title} image`),
      label: "Image",
      state: href ? "available" : unavailableState([candidate]),
    }
  }

  if (item.renderer === "gallery") {
    const candidates = media.filter(
      (entry) =>
        (entry.kind === "image" || entry.kind === "video") &&
        GALLERY_ROLES.has(entry.attachment.role),
    )
    const available = candidates
      .map((candidate) => ({
        media: candidate,
        href: candidate.kind === "image" ? imageHref(candidate) : posterHref(candidate),
        largeHref:
          candidate.kind === "image"
            ? (() => {
                const large = imageVariants(candidate).large
                return large && availableVariantHref(large)
              })()
            : posterHref(candidate),
      }))
      .find((candidate) => candidate.href)
    const selected = available?.media ?? candidates[0]
    const countLabel = candidates.length === 1 ? "1 item" : `${candidates.length} items`
    return {
      href: available?.href,
      largeHref: available?.largeHref,
      alt: selected ? visualAlt(selected, `${title} gallery preview`) : "",
      label: `Gallery · ${countLabel}`,
      state: available?.href ? "available" : unavailableState(candidates),
    }
  }

  if (item.renderer === "video") {
    const videos = media.filter((entry) => entry.kind === "video")
    const videoPoster = videos
      .map((candidate) => ({ media: candidate, href: posterHref(candidate) }))
      .find((candidate) => candidate.href)
    const posterImage = media
      .filter((entry) => entry.kind === "image" && entry.attachment.role === "poster")
      .map((candidate) => ({ media: candidate, href: imageHref(candidate) }))
      .find((candidate) => candidate.href)
    const selected = videoPoster ?? posterImage
    return {
      href: selected?.href,
      alt: selected ? visualAlt(selected.media, `${title} poster`) : "",
      label: "Video poster",
      state: selected?.href ? "available" : unavailableState(videos),
    }
  }

  return undefined
}

function VisualIcon({ renderer }: { renderer: string }) {
  const className = "h-3.5 w-3.5"
  if (renderer === "gallery") return <Images className={className} aria-hidden="true" />
  if (renderer === "video") return <Video className={className} aria-hidden="true" />
  return <ImageIcon className={className} aria-hidden="true" />
}

export function ReaderCardVisual({ item, className }: { item: ReaderItem; className?: string }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const visual = selectCardVisual(item)

  if (!visual) return null

  if (!visual.href) {
    const state = visual.state === "available" ? "unavailable" : visual.state
    const label =
      state === "reference_only"
        ? "No captured visual"
        : state === "failed"
          ? "Media acquisition failed"
          : state === "pending"
            ? "Media pending"
            : visual.label
    return (
      <div
        className={cn(
          "flex min-h-24 w-full items-center justify-center rounded-sm border border-dashed border-divider bg-panel-2 px-3 py-4 text-center text-xs text-text-subtle",
          className,
        )}
        data-reader-card-visual-empty
        data-reader-nav-exclude
      >
        <div className="flex flex-col items-center gap-1">
          <VisualIcon renderer={item.renderer} />
          <span>{label}</span>
        </div>
      </div>
    )
  }

  const dialogHref = visual.largeHref ?? visual.href
  const dialogTitle =
    item.display.title.value || (item.renderer === "video" ? "Captured video" : "Captured image")

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          "group relative block aspect-[16/10] max-h-40 w-full overflow-hidden rounded-sm border border-border bg-panel-2 text-left outline-none hover:border-border focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none md:max-h-36",
          className,
        )}
        data-reader-card-visual
        data-reader-nav-exclude
        aria-label={
          item.renderer === "video"
            ? `Play video: ${dialogTitle}`
            : `View larger image: ${dialogTitle}`
        }
        onClick={(event) => {
          event.stopPropagation()
          setOpen(true)
        }}
        onKeyDown={(event) => {
          event.stopPropagation()
        }}
      >
        <img
          src={visual.href}
          alt={visual.alt}
          loading="lazy"
          className="pointer-events-none h-full w-full object-cover transition-opacity group-hover:opacity-90 motion-reduce:transition-none"
        />
        <span className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-panel-overlay-strong/95 px-2.5 py-1.5 text-label font-medium text-text">
          {item.renderer === "video" ? (
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <VisualIcon renderer={item.renderer} />
          )}
          {item.renderer === "video" ? "Play video" : visual.label}
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-3xl border border-border bg-panel p-6 shadow-xl"
          finalFocus={() => triggerRef.current}
          aria-label={dialogTitle}
        >
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-text">{dialogTitle}</DialogTitle>
            <DialogDescription className="text-xs text-text-subtle">
              {item.renderer === "video" ? "Inert video preview" : "Inert image preview"}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex max-h-[calc(100dvh-12rem)] min-h-0 items-center justify-center overflow-auto rounded-sm border border-border bg-bg p-2">
            <img
              src={dialogHref}
              alt={visual.alt}
              className="max-h-[calc(100dvh-14rem)] max-w-full object-contain"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
