import {
  Button,
  DetailPageLayout,
  EDITABLE_TARGET_SELECTOR,
  EmptyState,
  Skeleton,
  useControlledRecordNavigation,
  useShortcut,
} from "@hollis-labs/design-components"
import { Copy, ExternalLink, RefreshCw } from "lucide-react"
import { type ReactNode, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { currentLayer, visible } from "../flux-chat/ownership"
import { readerPlainTextExcerpt, safeReaderSourceHref, sourceHost, sourceLabel } from "./model"
import { ReaderDetailHeader } from "./ReaderDetailHeader"
import { ReaderReadingControls } from "./ReaderInlineActions"
import { ReaderNotes } from "./ReaderNotes"
import { ReaderStateSummary } from "./ReaderStateSummary"
import { ReaderTags } from "./ReaderTags"
import { ReaderContentRenderer } from "./renderers"
import type { ReaderCommand, ReaderItem, ReaderScope } from "./types"

export interface ReaderRevisionPin {
  fragmentId: string
  fragmentRevisionId: string
}

export interface ReaderDetailPageProps {
  item?: ReaderItem
  scope?: ReaderScope
  admittedIds?: string[]
  onBack: () => void
  onNavigate: (fragmentId: string) => void
  onCommand: (command: ReaderCommand) => void
  onRefresh?: () => void
  loading?: boolean
  error?: string
  invalidRevision?: boolean
  theme?: string
  mode?: "light" | "dark"
  renderContent?: (item: ReaderItem, pin: ReaderRevisionPin) => ReactNode
  renderActions?: (item: ReaderItem, pin: ReaderRevisionPin) => ReactNode
  renderSidecar?: (pin: ReaderRevisionPin) => ReactNode
}

function shortRevision(value: string): string {
  return value.length > 16 ? `${value.slice(0, 12)}…` : value
}

function isReaderBodyBackedText(value: string, body: string): boolean {
  const normalizedValue = value.replace(/\s+/g, " ").trim()
  const normalizedBody = body.replace(/\s+/g, " ").trim()
  return normalizedValue !== "" && normalizedValue === normalizedBody
}

export function ReaderQuickActionSeam({ children }: { children?: ReactNode }) {
  return (
    <div data-reader-action-slot data-reader-nav-exclude>
      {children ?? (
        <Button
          variant="ghost"
          size="sm"
          className="min-h-11 sm:min-h-8"
          disabled
          aria-label="Actions are not available yet"
          title="Quick actions are not available yet"
        >
          Actions
        </Button>
      )}
    </div>
  )
}

declare global {
  interface Window {
    readerDetail?: {
      handleBack: () => boolean
      handleRefresh: () => boolean
      handlePrevious: () => boolean
      handleNext: () => boolean
      isAdmitted: (targetPopup?: HTMLElement | null) => boolean
      fresh: {
        Back: () => boolean
        Refresh: () => boolean
        Previous: () => boolean
        Next: () => boolean
      }
    }
    heldAction?: () => boolean
  }
}

let nextReaderActivationTicket = 0

export function ReaderDetailPage({
  item,
  scope = "inbox",
  admittedIds = [],
  onBack,
  onNavigate,
  onCommand: _onCommand,
  onRefresh,
  loading = false,
  error,
  invalidRevision = false,
  theme = "sysop-p4-white",
  mode = "light",
  renderContent,
  renderActions,
  renderSidecar,
}: ReaderDetailPageProps) {
  const [copyStatus, setCopyStatus] = useState<string>()
  const scrollRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const pin = useMemo<ReaderRevisionPin | undefined>(
    () =>
      item
        ? { fragmentId: item.fragment_id, fragmentRevisionId: item.fragment_revision_id }
        : undefined,
    [item],
  )
  const sidecar = pin ? renderSidecar?.(pin) : undefined
  const sourceHref = item ? safeReaderSourceHref(item) : undefined

  // Guarded record navigation (CW-20261010-0036 contract)
  const navigation = useControlledRecordNavigation({
    orderedIds: admittedIds,
    selectedId: item?.fragment_id ?? null,
    active: Boolean(item),
    accessible: true,
    sourceGeneration: `${scope}:${admittedIds.length}`,
    boundaryPolicy: "stop",
    onSelect: (nextId) => onNavigate(nextId),
  })

  const currentGeneration = `${scope}:${item?.fragment_id ?? ""}:${item?.fragment_revision_id ?? ""}`

  // Committed shortcut frame tracking exact source generation
  const shortcutFrame = useShortcut({
    key: "",
    enabled: false,
    sourceGeneration: currentGeneration,
    onTrigger: () => {},
  })

  // Monotonic ticket sequence for committed activation frames:
  const activeTicketRef = useRef<number>(-1)
  const isMountedRef = useRef(false)
  const renderTicketRef = useRef<number>(0)
  const currentGenRef = useRef(currentGeneration)

  if (currentGenRef.current !== currentGeneration || activeTicketRef.current === -1) {
    currentGenRef.current = currentGeneration
    renderTicketRef.current = ++nextReaderActivationTicket
  }

  const myTicket = renderTicketRef.current

  useLayoutEffect(() => {
    isMountedRef.current = true
    activeTicketRef.current = myTicket
    return () => {
      isMountedRef.current = false
      if (activeTicketRef.current === myTicket) {
        activeTicketRef.current = -1
      }
    }
  }, [currentGeneration, myTicket])

  function isAdmitted(targetPopup?: HTMLElement | null): boolean {
    if (!isMountedRef.current || activeTicketRef.current !== myTicket) return false
    if (!shortcutFrame.isLive()) return false
    if (!rootRef.current?.isConnected || !visible(rootRef.current)) return false
    if (targetPopup) {
      if (!currentLayer(targetPopup)) return false
    } else {
      if (!currentLayer(rootRef.current)) return false
    }
    return true
  }

  function handleBack() {
    if (!isAdmitted()) return false
    onBack()
    return true
  }

  function handleRefresh() {
    if (!isAdmitted() || !onRefresh) return false
    onRefresh()
    return true
  }

  function handlePrevious() {
    if (!isAdmitted() || !navigation.availability.previous) return false
    navigation.navigate(-1)
    return true
  }

  function handleNext() {
    if (!isAdmitted() || !navigation.availability.next) return false
    navigation.navigate(1)
    return true
  }

  useLayoutEffect(() => {
    if (typeof window === "undefined") return
    window.readerDetail = {
      handleBack,
      handleRefresh,
      handlePrevious,
      handleNext,
      isAdmitted: (targetPopup) => isAdmitted(targetPopup),
      fresh: {
        Back: handleBack,
        Refresh: handleRefresh,
        Previous: handlePrevious,
        Next: handleNext,
      },
    }
  })

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey
      ) {
        return
      }
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
      if (event.isComposing || event.keyCode === 229) return

      if (!isAdmitted()) return

      const target = event.target
      if (
        target instanceof Element &&
        (target.closest(EDITABLE_TARGET_SELECTOR) ||
          target.closest('[role="dialog"], [role="alertdialog"]') ||
          target.closest("video, audio, media-controller") ||
          target.closest("[data-reader-nav-exclude]"))
      ) {
        return
      }

      // Require owned root focus or body focus within container
      const active = document.activeElement
      if (!rootRef.current || !active) return
      if (active !== document.body && !rootRef.current.contains(active)) {
        return
      }

      const direction = event.key === "ArrowLeft" ? -1 : 1
      const available =
        direction === -1 ? navigation.availability.previous : navigation.availability.next
      if (!available) return
      event.preventDefault()
      if (direction === -1) {
        handlePrevious()
      } else {
        handleNext()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  })

  async function copyLink() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard is unavailable")
      await navigator.clipboard.writeText(window.location.href)
      setCopyStatus("Link copied")
    } catch {
      setCopyStatus("Could not copy link")
    }
  }

  const header = (
    <ReaderDetailHeader
      title={item?.display.title.value || (loading ? "Loading fragment" : "Reader item")}
      onBack={handleBack}
      onPrevious={navigation.availability.previous ? handlePrevious : undefined}
      onNext={navigation.availability.next ? handleNext : undefined}
      hasPrevious={navigation.availability.previous}
      hasNext={navigation.availability.next}
      readingState={item ? <ReaderReadingControls item={item} readOnly compact /> : undefined}
      actions={
        <>
          {item &&
            pin &&
            (renderActions ? (
              <ReaderQuickActionSeam>{renderActions(item, pin)}</ReaderQuickActionSeam>
            ) : null)}
          <Button
            variant="outline"
            size="sm"
            className="min-h-11 sm:min-h-8"
            onClick={() => void copyLink()}
            disabled={!item}
          >
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            Copy link
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="min-h-11 sm:min-h-8"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin motion-reduce:animate-none" : ""}`}
              aria-hidden="true"
            />
            Refresh
          </Button>
          {copyStatus && (
            <span className="text-xs text-text-subtle" role="status" aria-live="polite">
              {copyStatus}
            </span>
          )}
        </>
      }
    />
  )

  return (
    <div
      ref={rootRef}
      data-testid="reader-detail-page"
      className={`reader-example min-h-screen bg-bg text-fg ${mode === "light" ? "light" : "dark"}`}
      data-theme={theme}
      data-mode={mode}
    >
      <DetailPageLayout
        header={header}
        scrollRef={scrollRef}
        aside={
          sidecar && pin ? (
            <aside
              className="h-full border-l border-border bg-panel-2/20"
              data-reader-sidecar-pin
              data-fragment-id={pin.fragmentId}
              data-fragment-revision-id={pin.fragmentRevisionId}
            >
              {sidecar}
            </aside>
          ) : undefined
        }
        asideClassName="w-[22rem]"
      >
        {loading ? (
          <div
            className="mx-auto flex w-full max-w-[76rem] flex-col gap-4 px-4 py-6 sm:px-6"
            role="status"
            aria-label="Loading Reader item"
          >
            <Skeleton className="h-24 w-full rounded-sm" />
            <Skeleton className="h-48 w-full rounded-sm" />
            <Skeleton className="h-28 w-full rounded-sm" />
          </div>
        ) : error || invalidRevision || !item || !pin ? (
          <div className="mx-auto w-full max-w-3xl px-4 py-16">
            <EmptyState
              variant="error"
              title="Reader item unavailable"
              description={
                invalidRevision
                  ? "The revision link is invalid."
                  : (error ?? "The Reader item could not be loaded.")
              }
              action={{ label: "Back to Reader", onClick: onBack }}
            />
          </div>
        ) : (
          <ReaderDetailBody
            item={item}
            pin={pin}
            sourceHref={sourceHref}
            renderContent={renderContent}
          />
        )}
      </DetailPageLayout>
    </div>
  )
}

function ReaderDetailBody({
  item,
  pin,
  sourceHref,
  renderContent,
}: {
  item: ReaderItem
  pin: ReaderRevisionPin
  sourceHref?: string
  renderContent?: ReaderDetailPageProps["renderContent"]
}) {
  const body = item.article.preview_markdown
  const summaryIsBody = isReaderBodyBackedText(item.display.summary.value, body)
  const description = item.display.description?.value ?? ""
  const descriptionIsDuplicate =
    isReaderBodyBackedText(description, body) ||
    isReaderBodyBackedText(description, item.display.summary.value)
  const summary = summaryIsBody ? "" : readerPlainTextExcerpt(item.display.summary.value, 1200)
  const distinctDescription = descriptionIsDuplicate
    ? ""
    : readerPlainTextExcerpt(description, 1400)

  return (
    <div
      className="mx-auto flex w-full max-w-[76rem] flex-col gap-7 px-4 py-6 sm:px-6 sm:py-8"
      data-reader-revision-pin
      data-fragment-id={pin.fragmentId}
      data-fragment-revision-id={pin.fragmentRevisionId}
    >
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-subtle">
            <span className="font-medium text-text-soft">{sourceLabel(item)}</span>
            {sourceHost(item) && <span>{sourceHost(item)}</span>}
            <span>
              {item.capture_count === 1 ? "Captured once" : `Captured ${item.capture_count} times`}
            </span>
            <span title={`Revision ${item.fragment_revision_id}`}>
              Revision {shortRevision(item.fragment_revision_id)}
            </span>
          </div>
          {item.display.byline?.value && (
            <p className="mt-3 text-control text-text-muted">By {item.display.byline.value}</p>
          )}
          {summary && (
            <p className="mt-4 max-w-[70ch] text-base leading-[1.65] text-text-muted">{summary}</p>
          )}
          {distinctDescription && (
            <p className="mt-3 max-w-[70ch] text-sm leading-[1.6] text-text-soft">
              {distinctDescription}
            </p>
          )}
          <p className="mt-3 text-label text-text-subtle">
            Title from {item.display.title.source}; summary from {item.display.summary.source}
          </p>
          <div className="mt-4">
            <ReaderTags item={item} readOnly />
          </div>
        </div>

        {sourceHref && (
          <a
            href={sourceHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-border bg-panel-2/35 px-3 text-control font-medium text-text-muted outline-none hover:bg-panel-hover hover:text-text focus-visible:ring-2 focus-visible:ring-ring lg:justify-start"
          >
            View original source
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        )}
      </section>

      <div className="w-full" data-reader-reading-stage>
        {["image", "gallery", "video", "audio", "document"].includes(item.renderer) &&
          item.operations.acquisition.available === 0 && (
            <div className="mb-4 flex min-h-24 flex-wrap items-center justify-between gap-4 border-y border-border py-4">
              <div>
                <p className="text-control font-medium text-text">Captured media is not loaded</p>
                <p className="mt-1 text-xs text-text-subtle">
                  Load an available representation to preview it here.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="min-h-8 cursor-default text-text-subtle opacity-70"
                title="Asset acquisition requests are inert specimens"
              >
                Load media (Inert specimen)
              </Button>
            </div>
          )}
        {renderContent ? (
          renderContent(item, pin)
        ) : (
          <ReaderContentRenderer item={item} presentation="detail" />
        )}
      </div>

      <ReaderStateSummary item={item} />

      <section className="border-t border-border pt-6">
        <ReaderNotes item={item} readOnly />
      </section>
    </div>
  )
}

export default ReaderDetailPage
