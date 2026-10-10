import { ExternalLink } from "lucide-react"
import { type ReactNode, useState } from "react"
import {
  hasReaderCardInteraction,
  hasReaderCardSelection,
  isReaderVisualRenderer,
  publishedLabel,
  readerPlainTextExcerpt,
  safeReaderSourceHref,
  sourceHost,
  sourceLabel,
} from "./model"
import { ReaderEffectActions, ReaderReadingControls } from "./ReaderInlineActions"
import { ReaderNoteEditor, type ReaderNoteKind } from "./ReaderNotes"
import { ReaderProvenanceSpine } from "./ReaderProvenanceSpine"
import { ReaderStateSummary } from "./ReaderStateSummary"
import { ReaderTags } from "./ReaderTags"
import { ReaderCardVisual } from "./ReaderVisual"
import type { ReaderCommand, ReaderItem } from "./types"

export interface ReaderCardProps {
  item: ReaderItem
  onOpen: (fragmentId: string) => void
  onCommand: (command: ReaderCommand) => void
  mediaSlot?: ReactNode
  cardRef?: (node: HTMLElement | null) => void
}

type ReaderCardTab = "content" | ReaderNoteKind

export function ReaderCard({ item, onOpen, onCommand, mediaSlot, cardRef }: ReaderCardProps) {
  const [activeTab, setActiveTab] = useState<ReaderCardTab>("content")
  const source = sourceLabel(item)
  const host = sourceHost(item)
  const published = publishedLabel(item.display.published_at)
  const summary = readerPlainTextExcerpt(item.display.summary.value)
  const sourceHref = safeReaderSourceHref(item)

  function openFromPointer(event: React.MouseEvent<HTMLElement>) {
    if (event.defaultPrevented) return
    const target = event.target as HTMLElement | null
    if (target?.closest('[role="dialog"]')) return
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return
    if (hasReaderCardInteraction(event.target, event.currentTarget)) return
    if (hasReaderCardSelection(event.currentTarget)) return
    onOpen(item.fragment_id)
  }

  function openFromKeyboard(event: React.KeyboardEvent<HTMLElement>) {
    if (event.defaultPrevented) return
    if (event.target !== event.currentTarget) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    if (event.nativeEvent.isComposing || event.keyCode === 229) return
    if (event.key !== "Enter" && event.key !== " ") return
    if (hasReaderCardSelection(event.currentTarget)) return
    event.preventDefault()
    onOpen(item.fragment_id)
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: card contains interactive descendants
    <div
      ref={cardRef}
      className="group relative cursor-pointer rounded-sm border border-divider bg-bg py-5 pl-7 pr-5 outline-none hover:border-border hover:bg-panel-hover-soft focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none sm:py-6 sm:pl-8 sm:pr-6"
      role="button"
      aria-haspopup="dialog"
      tabIndex={0}
      aria-label={`Inspect fragment: ${item.display.title.value || "untitled fragment"}`}
      data-testid="reader-card"
      data-fragment-id={item.fragment_id}
      onClick={openFromPointer}
      onKeyDown={openFromKeyboard}
    >
      <ReaderProvenanceSpine item={item} />

      <div
        className="grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_14rem] md:items-start"
        data-testid="reader-card-heading"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-4 text-text-subtle">
            <span className="font-medium text-text-soft">{source}</span>
            {host && <span>{host}</span>}
            {published && <time dateTime={item.display.published_at}>{published}</time>}
            <span>
              {item.capture_count === 1 ? "Captured once" : `Captured ${item.capture_count} times`}
            </span>
          </div>

          <h2 className="mt-2 line-clamp-2 text-lg font-semibold leading-6 text-text sm:text-lg">
            {item.display.title.value || "Untitled fragment"}
          </h2>

          <div className="mt-2">
            <ReaderReadingControls item={item} onCommand={onCommand} compact />
          </div>
        </div>

        <div
          className="w-full min-w-0 overflow-hidden md:justify-self-end"
          data-reader-media-slot
          data-reader-nav-exclude
        >
          {mediaSlot ??
            (isReaderVisualRenderer(item.renderer) ? <ReaderCardVisual item={item} /> : null)}
        </div>
      </div>

      <div
        className="mt-4 flex items-center gap-1 border-b border-divider"
        role="tablist"
        aria-label={`Views for ${item.display.title.value || "untitled fragment"}`}
        data-reader-nav-exclude
      >
        {(["content", "curated", "capture"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={`min-h-9 border-b px-3 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              activeTab === tab
                ? "border-primary text-text font-semibold"
                : "border-transparent text-text-subtle hover:text-text"
            }`}
            onClick={(event) => {
              event.stopPropagation()
              setActiveTab(tab)
            }}
            onKeyDown={(event) => event.stopPropagation()}
          >
            {tab === "content" ? "Content" : tab === "curated" ? "Curated note" : "Capture note"}
          </button>
        ))}
      </div>

      {activeTab === "content" ? (
        <>
          <div className="mt-4 min-w-0">
            <p className="line-clamp-3 max-w-[78ch] text-sm leading-[1.6] text-text-soft">
              {summary || "No summary is available yet."}
            </p>

            <p className="mt-2 text-label leading-4 text-text-subtle">
              Title from {item.display.title.source}; summary from {item.display.summary.source}
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <ReaderTags item={item} onCommand={onCommand} compact />
              </div>
              <ReaderEffectActions item={item} onCommand={onCommand} includeMedia compact />
            </div>
          </div>

          <div className="mt-5 border-t border-divider pt-4">
            <ReaderStateSummary item={item} compact />
          </div>
        </>
      ) : (
        <div className="pt-4" data-reader-nav-exclude>
          <ReaderNoteEditor
            key={`${activeTab}-${
              activeTab === "curated" ? (item.curated_note?.revision ?? 0) : "append"
            }`}
            item={item}
            onCommand={onCommand}
            kind={activeTab}
            compact
          />
        </div>
      )}

      {sourceHref && (
        <a
          className="mt-4 inline-flex min-h-11 items-center gap-1.5 text-xs text-text-subtle underline-offset-4 hover:text-text hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-8"
          href={sourceHref}
          target="_blank"
          rel="noreferrer"
          data-reader-nav-exclude
          onClick={(e) => e.stopPropagation()}
        >
          View source
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
        </a>
      )}
    </div>
  )
}
