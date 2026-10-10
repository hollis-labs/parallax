import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Skeleton,
} from "@hollis-labs/design-components"
import { PageHeader } from "@hollis-labs/kit-dashboard"
import { BookOpen, RefreshCw } from "lucide-react"
import { useRef, useState } from "react"
import {
  defaultReaderState,
  executeReaderCommand,
  isReaderScope,
  isReaderVisualRenderer,
  publishedLabel,
  READER_SCOPES,
  type ReaderExampleState,
  readerFixture,
  readerPlainTextExcerpt,
  readerScopeLabel,
  safeReaderSourceHref,
  sourceHost,
  sourceLabel,
} from "./model"
import { ReaderCard } from "./ReaderCard"
import { ReaderStateSummary } from "./ReaderStateSummary"
import { ReaderCardVisual } from "./ReaderVisual"
import type { ReaderCommand, ReaderItem, ReaderScope } from "./types"
import "./reader.css"

const SKELETON_IDS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"] as const

function ReaderListSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-[76rem] flex-col gap-3 px-4 py-5 sm:px-6"
      role="status"
      aria-label="Loading Reader"
    >
      {SKELETON_IDS.map((id) => (
        <Skeleton key={id} className="h-56 w-full rounded-sm" />
      ))}
    </div>
  )
}

function getInitialItemsForScope(
  scope: ReaderScope,
  appearance: ReaderExampleState["appearance"],
): { items: ReaderItem[]; nextCursor?: string } {
  if (appearance === "empty") {
    return { items: [], nextCursor: undefined }
  }
  if (scope === "inbox") {
    return { items: (readerFixture.inboxItems as ReaderItem[]).slice(), nextCursor: undefined }
  }
  // library or all
  const page1 = (readerFixture.pageOneItems as ReaderItem[]).slice()
  return { items: page1, nextCursor: "cursor-page-2" }
}

export function ReaderExample({
  state: provided = defaultReaderState,
  onChange,
}: {
  state?: ReaderExampleState
  onChange?: (state: ReaderExampleState) => void
}) {
  const [local, setLocal] = useState(provided)
  const state = onChange ? provided : local

  function updateState(patch: Partial<ReaderExampleState>) {
    const next = { ...state, ...patch }
    if (onChange) onChange(next)
    else setLocal(next)
  }

  const scope: ReaderScope = isReaderScope(state.scope) ? state.scope : "inbox"

  // Base items per scope
  const [localItemOverrides, setLocalItemOverrides] = useState<Record<string, ReaderItem>>({})
  const [pageLoaded, setPageLoaded] = useState(1)
  const [moreError, setMoreError] = useState<string | undefined>(
    state.appearance === "inline-error"
      ? "Failed to load additional fragments. Please try again."
      : undefined,
  )
  const [selectedFragmentId, setSelectedFragmentId] = useState<string | null>(null)
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map())

  // Compute items list
  const { items: baseItems, nextCursor: initialCursor } = getInitialItemsForScope(
    scope,
    state.appearance,
  )

  const combinedItems = baseItems.slice()
  if (scope !== "inbox" && pageLoaded >= 2 && state.appearance !== "empty") {
    const page2 = readerFixture.pageTwoItems as ReaderItem[]
    const seen = new Set(combinedItems.map((item) => item.fragment_id))
    for (const item of page2) {
      if (!seen.has(item.fragment_id)) {
        combinedItems.push(item)
        seen.add(item.fragment_id)
      }
    }
  }

  // Apply local edits
  const items = combinedItems.map((item) => localItemOverrides[item.fragment_id] ?? item)
  const nextCursor =
    scope === "inbox" || state.appearance === "empty" || pageLoaded >= 2 ? undefined : initialCursor

  function handleCommand(command: ReaderCommand) {
    const updatedList = executeReaderCommand(items, command)
    const updatedItem = updatedList.find((i) => i.fragment_id === command.fragment_id)
    if (updatedItem) {
      setLocalItemOverrides((current) => ({
        ...current,
        [command.fragment_id]: updatedItem,
      }))
    }
  }

  function handleScopeChange(nextScope: ReaderScope) {
    setPageLoaded(1)
    setMoreError(undefined)
    updateState({ scope: nextScope })
  }

  function handleRefresh() {
    setPageLoaded(1)
    setLocalItemOverrides({})
    setMoreError(undefined)
    if (state.appearance === "error") {
      updateState({ appearance: "recorded" })
    }
  }

  function loadMore() {
    if (!nextCursor) return
    const isRetryingInlineError = Boolean(moreError)

    if (state.appearance === "inline-error" && pageLoaded === 1 && !isRetryingInlineError) {
      setMoreError("Failed to load additional fragments. Please try again.")
      return
    }

    setMoreError(undefined)
    setPageLoaded(2)
  }

  const selectedItem = selectedFragmentId
    ? items.find((item) => item.fragment_id === selectedFragmentId)
    : null

  return (
    <div
      className={`reader-example min-h-screen bg-bg text-fg ${state.mode === "light" ? "light" : "dark"}`}
      data-theme={state.theme}
      data-mode={state.mode}
    >
      <header className="reader-page-header">
        <PageHeader title="Reader">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            aria-label="Refresh fragments"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Refresh
          </Button>
        </PageHeader>
      </header>

      {/* biome-ignore lint/a11y/noNoninteractiveElementToInteractiveRole: Scope nav acts as tablist */}
      <nav className="reader-scope-nav" role="tablist" aria-label="Reader scope">
        {READER_SCOPES.map((candidate) => {
          const active = candidate === scope
          return (
            <button
              key={candidate}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => handleScopeChange(candidate)}
              className={`inline-flex min-h-9 shrink-0 items-center rounded-sm px-3 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                active
                  ? "bg-panel-2 text-text font-semibold"
                  : "text-text-subtle hover:bg-panel-hover-soft hover:text-text"
              }`}
            >
              {readerScopeLabel(candidate)}
            </button>
          )
        })}
      </nav>

      <main className="flex-1">
        {state.appearance === "loading" ? (
          <ReaderListSkeleton />
        ) : state.appearance === "error" ? (
          <div className="mx-auto w-full max-w-3xl px-4 py-16">
            <EmptyState
              variant="error"
              title="Reader could not load"
              description="The Reader list could not be loaded."
              action={{ label: "Try again", onClick: handleRefresh }}
            />
          </div>
        ) : items.length === 0 ? (
          <div className="mx-auto w-full max-w-3xl px-4 py-16">
            <EmptyState
              variant="empty"
              title={`No fragments in ${scope}`}
              description="Captured fragments appear here as soon as their manifest is accepted, even while enrichment or media work continues."
            />
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-[76rem] flex-col gap-3 px-4 py-5 sm:px-6 sm:py-6">
            <div className="flex items-center gap-2 pb-1 text-xs text-text-subtle">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{items.length === 1 ? "1 fragment" : `${items.length} fragments`}</span>
            </div>

            {items.map((item) => (
              <ReaderCard
                key={item.fragment_id}
                item={item}
                cardRef={(element) => {
                  if (element) {
                    cardRefs.current.set(item.fragment_id, element)
                  } else {
                    cardRefs.current.delete(item.fragment_id)
                  }
                }}
                onOpen={(fragmentId) => setSelectedFragmentId(fragmentId)}
                onCommand={handleCommand}
              />
            ))}

            {moreError && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-divider py-4 text-control text-danger-muted">
                <span>{moreError}</span>
                <Button variant="outline" size="sm" onClick={loadMore}>
                  Try again
                </Button>
              </div>
            )}

            {nextCursor && !moreError && (
              <div className="flex justify-center border-t border-divider py-5">
                <Button variant="outline" onClick={loadMore}>
                  Load more
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="reader-footer">
        <div className="reader-container flex flex-wrap items-center justify-between gap-2">
          <span>
            Fixed UTC {readerFixture.referenceClock} · seed {readerFixture.seed} ·{" "}
            {readerFixture.version} · Local fictional fixture state
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLocalItemOverrides({})
              setPageLoaded(1)
              setMoreError(undefined)
            }}
          >
            Reset fixture state
          </Button>
        </div>
      </footer>

      {selectedItem && (
        <Dialog
          open={Boolean(selectedItem)}
          onOpenChange={(open) => {
            if (!open) setSelectedFragmentId(null)
          }}
        >
          <DialogContent
            className="max-w-3xl max-h-[85vh] overflow-y-auto border border-border bg-panel p-6 shadow-xl"
            finalFocus={() => {
              const target = cardRefs.current.get(selectedFragmentId ?? "")
              if (target && target.isConnected) return target
              const fallback = document.querySelector<HTMLElement>('[data-testid="reader-card"]')
              return fallback && fallback.isConnected ? fallback : null
            }}
            aria-label={`Fragment detail: ${selectedItem.display.title.value || "Untitled"}`}
          >
            <DialogHeader>
              <div className="flex flex-wrap items-center gap-x-2 text-xs text-text-subtle">
                <span className="font-medium text-text-soft">{sourceLabel(selectedItem)}</span>
                {sourceHost(selectedItem) && <span>{sourceHost(selectedItem)}</span>}
                {publishedLabel(selectedItem.display.published_at) && (
                  <span>{publishedLabel(selectedItem.display.published_at)}</span>
                )}
                <span>
                  {selectedItem.capture_count === 1
                    ? "Captured once"
                    : `Captured ${selectedItem.capture_count} times`}
                </span>
              </div>
              <DialogTitle className="mt-2 text-lg font-semibold text-text">
                {selectedItem.display.title.value || "Untitled fragment"}
              </DialogTitle>
              <DialogDescription className="text-xs text-text-subtle">
                Title from {selectedItem.display.title.source}; summary from{" "}
                {selectedItem.display.summary.source}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-4 space-y-4">
              <div className="rounded-sm border border-divider bg-bg p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
                  Summary
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-text">
                  {readerPlainTextExcerpt(selectedItem.display.summary.value) ||
                    "No summary available."}
                </p>
              </div>

              {selectedItem.article.preview_markdown && (
                <div className="rounded-sm border border-divider bg-bg p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
                    Captured Article Preview
                  </h3>
                  <div className="mt-1 text-sm leading-relaxed text-text whitespace-pre-wrap font-sans">
                    {selectedItem.article.preview_markdown}
                  </div>
                </div>
              )}

              {isReaderVisualRenderer(selectedItem.renderer) && (
                <div className="rounded-sm border border-divider bg-bg p-4">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-subtle">
                    Visual Media
                  </h3>
                  <ReaderCardVisual item={selectedItem} />
                </div>
              )}

              {selectedItem.curated_note?.body_markdown && (
                <div className="rounded-sm border border-divider bg-bg p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
                    Curated Working Note
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-text whitespace-pre-wrap">
                    {selectedItem.curated_note.body_markdown}
                  </p>
                </div>
              )}

              <div className="border-t border-divider pt-4">
                <ReaderStateSummary item={selectedItem} />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-divider pt-4">
              {safeReaderSourceHref(selectedItem) ? (
                <a
                  href={safeReaderSourceHref(selectedItem)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary underline-offset-4 hover:underline"
                >
                  Open external source ↗
                </a>
              ) : (
                <span />
              )}
              <Button variant="outline" size="sm" onClick={() => setSelectedFragmentId(null)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
