import { Button, cn } from "@hollis-labs/design-components"
import { Expand, FileText, Play } from "lucide-react"
import { useRef, useState } from "react"
import { ReaderCardVisual } from "../ReaderVisual"
import type { ReaderItem } from "../types"
import { ArticleRenderer } from "./ArticleRenderer"
import { MediaDialog } from "./MediaDialog"
import {
  availableVariantHref,
  imageVariants,
  mediaState,
  orderedMedia,
  transcriptResource,
} from "./media"
import { ResourceStatePanel } from "./ResourceStatePanel"

function posterHref(item: ReaderItem): string | undefined {
  const media = orderedMedia(item.media)
  for (const video of media.filter((entry) => entry.kind === "video")) {
    const variant = video.variants.find(
      (entry) =>
        ["poster", "preview", "thumbnail"].includes(entry.kind) &&
        availableVariantHref(entry) !== undefined,
    )
    const href = variant && availableVariantHref(variant)
    if (href) return href
  }
  for (const candidate of media.filter(
    (entry) => entry.kind === "image" && entry.attachment.role === "poster",
  )) {
    const poster = imageVariants(candidate).preview
    const href = poster && availableVariantHref(poster)
    if (href) return href
  }
  return undefined
}

function VideoMeta({ item }: { item: ReaderItem }) {
  const values = [
    item.display.byline?.value.trim(),
    item.display.published_at
      ? new Date(item.display.published_at).toLocaleDateString("en-US", {
          timeZone: "UTC",
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : undefined,
  ].filter((value): value is string => Boolean(value))
  const tags = item.tags?.combined ?? []
  if (values.length === 0 && tags.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs leading-5 text-text-subtle">
      {values.map((value) => (
        <span key={value}>{value}</span>
      ))}
      {tags.slice(0, 5).map((tag) => (
        <span
          key={tag}
          className="rounded-sm border border-border bg-panel-2 px-2 py-0.5 text-text-soft"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}

export function VideoRenderer({
  item,
  presentation,
  className,
}: {
  item: ReaderItem
  presentation: "card" | "detail"
  className?: string
}) {
  const poster = posterHref(item)
  const videoMedia = item.media.find((entry) => entry.kind === "video")
  const playbackState = videoMedia ? mediaState(videoMedia) : "unavailable"
  const transcript = transcriptResource(item.media)
  const [expanded, setExpanded] = useState(false)
  const expandRef = useRef<HTMLButtonElement>(null)
  const title = item.display.title.value || "Untitled video"

  if (presentation === "card") return <ReaderCardVisual item={item} className={className} />

  return (
    <div
      className={cn("min-w-0", className)}
      data-reader-renderer="video"
      data-reader-presentation={presentation}
    >
      <div className="overflow-hidden rounded-sm border border-border bg-panel-2">
        <div className="relative aspect-video w-full overflow-hidden bg-bg">
          {poster ? (
            <div className="relative h-full w-full">
              <img
                src={poster}
                alt={`${title} poster`}
                className="h-full w-full object-contain p-2"
                loading="lazy"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-panel-overlay-strong/80 p-4 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                  <Play className="h-6 w-6 ml-0.5" aria-hidden="true" />
                </div>
                <p className="max-w-md text-xs font-medium text-text">
                  Inert video preview · No network/third-party embeds in fixture mode
                </p>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
              <Play className="h-8 w-8 text-text-subtle" aria-hidden="true" />
              <p className="text-sm text-text-subtle">
                Inert video preview · No network/third-party embeds in fixture mode
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-border px-4 py-2.5">
          <Button
            ref={expandRef}
            type="button"
            variant="outline"
            size="sm"
            onClick={(event) => {
              event.stopPropagation()
              setExpanded(true)
            }}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <Expand className="h-3.5 w-3.5" aria-hidden="true" />
            Expand video
          </Button>
        </div>
      </div>

      {item.playback?.kind !== "provider_embed" && (
        <ResourceStatePanel
          className="mt-3"
          state={playbackState === "available" ? "unavailable" : playbackState}
          label="Trusted playback unavailable"
          description="Reader only plays a server-validated provider identity. Captured text and media state remain available below."
        />
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0">
          <VideoMeta item={item} />
          {item.display.description?.value && (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-text-muted">
              {item.display.description.value}
            </p>
          )}
        </div>
        <aside
          className="rounded-sm border border-border bg-panel-2/40 p-3.5"
          aria-label="Transcript status"
        >
          <div className="flex items-center gap-2 text-xs font-medium leading-5 text-text-soft">
            <FileText className="h-4 w-4" aria-hidden="true" />
            Transcript
          </div>
          <p
            className="mt-1 text-xs leading-5 text-text-subtle"
            data-transcript-state={transcript.state}
          >
            {transcript.label}
          </p>
          {transcript.href && (
            <a
              href={transcript.href}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center text-xs font-medium text-text underline decoration-border underline-offset-4 hover:decoration-text"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              Open transcript
            </a>
          )}
        </aside>
      </div>

      <div className="mt-5 border-t border-border pt-5">
        <h3 className="mb-3 text-sm font-semibold leading-6 text-text">Captured page</h3>
        <ArticleRenderer item={item} presentation="detail" />
      </div>

      <MediaDialog
        open={expanded}
        onOpenChange={setExpanded}
        returnFocusRef={expandRef}
        title={title}
        description="Inert video player preview"
      >
        <div className="flex aspect-video max-h-[calc(100dvh-8rem)] w-full flex-col items-center justify-center gap-3 bg-bg p-6 text-center">
          <Play className="h-12 w-12 text-primary" aria-hidden="true" />
          <p className="text-sm font-medium text-text">{title}</p>
          <p className="max-w-md text-xs text-text-subtle">
            Inert video player · External YouTube/provider network playback is disabled in fixture
            mode.
          </p>
        </div>
      </MediaDialog>
    </div>
  )
}
