import type { ReaderAssetVariant, ReaderMediaItem, ReaderPlayback } from "../types"

export type ResourceState = "available" | "pending" | "reference_only" | "failed" | "unavailable"

export function isReaderVisualRenderer(renderer: string): boolean {
  return renderer === "image" || renderer === "gallery" || renderer === "video"
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
  order: readonly string[],
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

export function orderedMedia(media: ReaderMediaItem[]): ReaderMediaItem[] {
  return media
    .map((item, index) => ({ item, index }))
    .sort((left, right) =>
      left.item.attachment.position === right.item.attachment.position
        ? left.index - right.index
        : left.item.attachment.position - right.item.attachment.position,
    )
    .map(({ item }) => item)
}

export function mediaState(media: ReaderMediaItem): ResourceState {
  if (media.variants.some((variant) => availableVariantHref(variant) !== undefined)) {
    return "available"
  }
  if (media.variants.some((variant) => variant.acquisition_state === "pending")) return "pending"
  if (media.variants.some((variant) => variant.acquisition_state === "failed")) return "failed"
  if (media.variants.some((variant) => variant.acquisition_state === "reference_only")) {
    return "reference_only"
  }
  return "unavailable"
}

export function stateLabel(state: ResourceState): string {
  switch (state) {
    case "available":
      return "Available"
    case "pending":
      return "Preparing media"
    case "reference_only":
      return "Source reference only"
    case "failed":
      return "Media unavailable"
    default:
      return "No readable media"
  }
}

export function stateDescription(state: ResourceState): string {
  switch (state) {
    case "pending":
      return "This representation is still being acquired."
    case "reference_only":
      return "The source is recorded, but Reader has no authorized local representation."
    case "failed":
      return "This representation could not be acquired. Other item content is still available."
    case "available":
      return "An authorized local representation is ready."
    default:
      return "Reader does not have an authorized representation for this item."
  }
}

const YOUTUBE_ITEM_ID = /^[A-Za-z0-9_-]{11}$/

export function trustedYouTubeEmbedURL(spec: ReaderPlayback | undefined): string | undefined {
  if (
    spec?.kind !== "provider_embed" ||
    spec.provider !== "youtube" ||
    !spec.provider_item_id ||
    !YOUTUBE_ITEM_ID.test(spec.provider_item_id)
  ) {
    return undefined
  }

  const start = spec.start_seconds ?? 0
  if (!Number.isFinite(start) || start < 0) return undefined
  const wholeStart = Math.floor(start)
  if (!Number.isSafeInteger(wholeStart)) return undefined

  const params = new URLSearchParams({ rel: "0", playsinline: "1" })
  if (wholeStart > 0) params.set("start", String(wholeStart))
  return `https://www.youtube-nocookie.com/embed/${spec.provider_item_id}?${params.toString()}`
}

export interface TranscriptResource {
  state: ResourceState
  href?: string
  label: string
}

export function transcriptResource(media: ReaderMediaItem[]): TranscriptResource {
  const candidates = orderedMedia(media).flatMap((item) =>
    item.variants.filter(
      (variant) => variant.kind === "transcript" || variant.kind === "subtitles",
    ),
  )
  if (candidates.length === 0) {
    return { state: "unavailable", label: "No transcript was captured." }
  }

  for (const variant of candidates) {
    const href = availableVariantHref(variant)
    if (href) {
      return { state: "available", href, label: "Transcript available." }
    }
  }

  const state: ResourceState = candidates.some((variant) => variant.acquisition_state === "pending")
    ? "pending"
    : candidates.some((variant) => variant.acquisition_state === "failed")
      ? "failed"
      : candidates.some((variant) => variant.acquisition_state === "reference_only")
        ? "reference_only"
        : "unavailable"
  return { state, label: stateDescription(state) }
}
