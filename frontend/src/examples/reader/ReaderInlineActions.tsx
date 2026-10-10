import {
  Button,
  cn,
  Input,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@hollis-labs/design-components"
import { BookOpenCheck, Check, Circle, Database, MapPin, Route as RouteIcon } from "lucide-react"
import { type FormEvent, useMemo, useState } from "react"
import {
  hasReaderCommand,
  parseReaderProgressDraft,
  progressDraftForItem,
  type ReaderProgressDraft,
  readingStateLabel,
} from "./model"
import type { ReaderAssetVariant, ReaderCommand, ReaderItem } from "./types"

type EditorCommand = "set_reading_progress" | "request_asset_acquisition" | "route" | "materialize"

interface ReaderActionPillProps {
  item: ReaderItem
  onCommand: (command: ReaderCommand) => void
  command: EditorCommand
  compact?: boolean
}

interface AcquisitionChoice {
  key: string
  mediaAssetId: string
  variantKind: ReaderAssetVariant["kind"]
  label: string
}

const selectClass =
  "min-h-10 w-full rounded-sm border border-border bg-bg px-3 text-control text-text outline-none focus-visible:ring-2 focus-visible:ring-ring"
const fieldLabelClass = "text-xs font-medium text-text-soft"

const ACTION_META = {
  set_reading_progress: { label: "Position", title: "Reading position", icon: MapPin },
  request_asset_acquisition: { label: "Load media", title: "Load media", icon: Database },
  route: { label: "Route", title: "Route fragment", icon: RouteIcon },
  materialize: { label: "Materialize", title: "Materialize fragment", icon: Database },
} satisfies Record<EditorCommand, { label: string; title: string; icon: typeof MapPin }>

const FICTIONAL_ROUTES = [
  { id: "route-primary", name: "Primary Ingestion Route" },
  { id: "route-archive", name: "Long-term Archive" },
  { id: "route-review", name: "Editorial Review Pipeline" },
]

const FICTIONAL_DESTINATIONS = [
  { id: "dest-sqlite", name: "Local Fragment Store", kind: "sqlite" },
  { id: "dest-vector", name: "Semantic Embedding Index", kind: "vector" },
  { id: "dest-export", name: "Markdown Archive Vault", kind: "filesystem" },
]

export function ReaderActionPill({
  item,
  onCommand,
  command,
  compact = false,
}: ReaderActionPillProps) {
  const [open, setOpen] = useState(false)
  const [progressDraft, setProgressDraft] = useState<ReaderProgressDraft>(() =>
    progressDraftForItem(item),
  )
  const [acquisitionKey, setAcquisitionKey] = useState("")
  const [custody, setCustody] = useState<"cache" | "mirror" | "adopted">("cache")
  const [routeId, setRouteId] = useState(FICTIONAL_ROUTES[0].id)
  const [destinationId, setDestinationId] = useState(FICTIONAL_DESTINATIONS[0].id)
  const [error, setError] = useState<string>()

  const available = hasReaderCommand(item, command)
  const meta = ACTION_META[command]
  const Icon = meta.icon

  const acquisitionChoices = useMemo<AcquisitionChoice[]>(() => {
    const choices: AcquisitionChoice[] = []
    for (const media of item.media) {
      for (const variant of media.variants) {
        if (variant.acquisition_state === "available" || variant.acquisition_state === "pending")
          continue
        choices.push({
          key: variant.asset_variant_id,
          mediaAssetId: media.media_asset_id,
          variantKind: variant.kind,
          label: `${media.kind} · ${variant.kind} · ${variant.acquisition_state.replace("_", " ")}`,
        })
      }
    }
    return choices.slice(0, 50)
  }, [item.media])

  function changeOpen(nextOpen: boolean) {
    if (nextOpen) {
      if (command === "set_reading_progress") setProgressDraft(progressDraftForItem(item))
      if (command === "request_asset_acquisition") {
        setAcquisitionKey((value) => value || acquisitionChoices[0]?.key || "")
      }
    }
    setOpen(nextOpen)
    setError(undefined)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!available) return

    if (command === "set_reading_progress") {
      const result = parseReaderProgressDraft(progressDraft)
      if (result.ok) {
        onCommand({
          fragment_id: item.fragment_id,
          command: "set_reading_progress",
          position: result.position,
        })
        setOpen(false)
      } else {
        setError(result.error)
      }
    } else if (command === "request_asset_acquisition") {
      const choice = acquisitionChoices.find((candidate) => candidate.key === acquisitionKey)
      if (choice) {
        onCommand({
          fragment_id: item.fragment_id,
          command: "request_asset_acquisition",
          media_asset_id: choice.mediaAssetId,
          variant_kind: choice.variantKind,
          requested_custody: custody,
        })
        setOpen(false)
      }
    } else if (command === "route" && routeId) {
      onCommand({
        fragment_id: item.fragment_id,
        command: "route",
        route_id: routeId,
      })
      setOpen(false)
    } else if (command === "materialize" && destinationId) {
      onCommand({
        fragment_id: item.fragment_id,
        command: "materialize",
        destination_id: destinationId,
      })
      setOpen(false)
    }
  }

  if (!available || (command === "request_asset_acquisition" && acquisitionChoices.length === 0)) {
    return null
  }

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-transparent font-medium text-text-muted outline-none hover:bg-panel-hover hover:text-text focus-visible:ring-2 focus-visible:ring-ring",
              compact ? "min-h-8 px-2.5 text-label" : "min-h-9 px-3 text-xs",
            )}
            aria-label={meta.title}
            data-reader-nav-exclude
            onClick={(e) => e.stopPropagation()}
          />
        }
      >
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {meta.label}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(22rem,calc(100vw-1.5rem))] rounded-sm border border-border bg-panel p-0 shadow-lg motion-reduce:animate-none"
        data-reader-inline-action={command}
        data-reader-nav-exclude
        onClick={(e) => e.stopPropagation()}
      >
        <PopoverHeader className="border-b border-divider px-4 py-3">
          <PopoverTitle className="text-sm font-semibold text-text">{meta.title}</PopoverTitle>
          <PopoverDescription className="mt-0.5 text-xs leading-5 text-text-subtle">
            Changes save to local fixture state.
          </PopoverDescription>
        </PopoverHeader>
        <form className="p-4" onSubmit={submit}>
          {command === "set_reading_progress" && (
            <ProgressEditor draft={progressDraft} setDraft={setProgressDraft} item={item} />
          )}
          {command === "request_asset_acquisition" && (
            <div className="grid gap-3">
              <label className="grid gap-1.5">
                <span className={fieldLabelClass}>Captured representation</span>
                <select
                  className={selectClass}
                  value={acquisitionKey}
                  onChange={(event) => setAcquisitionKey(event.target.value)}
                >
                  {acquisitionChoices.length === 0 && <option value="">No unloaded media</option>}
                  {acquisitionChoices.map((choice) => (
                    <option key={choice.key} value={choice.key}>
                      {choice.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1.5">
                <span className={fieldLabelClass}>Keep as</span>
                <select
                  className={selectClass}
                  value={custody}
                  onChange={(event) => setCustody(event.target.value as typeof custody)}
                >
                  <option value="cache">Cache</option>
                  <option value="mirror">Mirror</option>
                  <option value="adopted">Adopted</option>
                </select>
              </label>
            </div>
          )}
          {command === "route" && (
            <label className="grid gap-1.5">
              <span className={fieldLabelClass}>Route</span>
              <select
                className={selectClass}
                value={routeId}
                onChange={(event) => setRouteId(event.target.value)}
              >
                {FICTIONAL_ROUTES.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {command === "materialize" && (
            <label className="grid gap-1.5">
              <span className={fieldLabelClass}>Destination</span>
              <select
                className={selectClass}
                value={destinationId}
                onChange={(event) => setDestinationId(event.target.value)}
              >
                {FICTIONAL_DESTINATIONS.map((destination) => (
                  <option key={destination.id} value={destination.id}>
                    {destination.name} · {destination.kind}
                  </option>
                ))}
              </select>
            </label>
          )}
          {error && <p className="mt-2 text-xs text-danger-muted">{error}</p>}
          <Button type="submit" size="sm" className="mt-3 min-h-10 w-full">
            <Check className="h-4 w-4" aria-hidden="true" />
            {meta.label}
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}

export function ReaderReadingControls({
  item,
  onCommand,
  compact = false,
}: {
  item: ReaderItem
  onCommand: (command: ReaderCommand) => void
  compact?: boolean
}) {
  const nextCommand = item.reading_state.state === "read" ? "mark_unread" : "mark_read"
  const canToggle = hasReaderCommand(item, nextCommand)

  function toggleRead(event: React.MouseEvent) {
    event.stopPropagation()
    if (!canToggle) return
    onCommand({
      fragment_id: item.fragment_id,
      command: nextCommand,
    })
  }

  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      data-reader-reading-controls
      data-reader-nav-exclude
    >
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-panel-2 px-2.5 font-medium text-text-muted outline-none hover:text-text focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default",
          compact ? "min-h-7 text-label" : "min-h-8 text-xs",
        )}
        onClick={toggleRead}
        disabled={!canToggle}
        aria-label={nextCommand === "mark_read" ? "Mark as read" : "Mark as unread"}
        aria-pressed={item.reading_state.state === "read"}
      >
        {item.reading_state.state === "read" ? (
          <BookOpenCheck className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <Circle className="h-3 w-3" aria-hidden="true" />
        )}
        {readingStateLabel(item.reading_state.state)}
      </button>
      <ReaderActionPill item={item} onCommand={onCommand} command="set_reading_progress" compact />
    </div>
  )
}

export function ReaderEffectActions({
  item,
  onCommand,
  includeMedia = false,
  compact = false,
}: {
  item: ReaderItem
  onCommand: (command: ReaderCommand) => void
  includeMedia?: boolean
  compact?: boolean
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      data-reader-effect-actions
      data-reader-nav-exclude
    >
      {includeMedia && (
        <ReaderActionPill
          item={item}
          onCommand={onCommand}
          command="request_asset_acquisition"
          compact={compact}
        />
      )}
      <ReaderActionPill item={item} onCommand={onCommand} command="route" compact={compact} />
      <ReaderActionPill item={item} onCommand={onCommand} command="materialize" compact={compact} />
    </div>
  )
}

function ProgressEditor({
  draft,
  setDraft,
  item,
}: {
  draft: ReaderProgressDraft
  setDraft: (value: ReaderProgressDraft) => void
  item: ReaderItem
}) {
  if (draft.kind === "none") {
    return <p className="text-xs text-text-subtle">No position is available for this item.</p>
  }
  if (draft.kind === "article") {
    const inputId = `reader-article-prog-${item.fragment_id}`
    return (
      <label htmlFor={inputId} className="grid gap-1.5">
        <span className={fieldLabelClass}>Article progress · 0 to 1</span>
        <Input
          id={inputId}
          type="number"
          min="0"
          max="1"
          step="0.01"
          value={draft.progress}
          onChange={(event) => setDraft({ ...draft, progress: event.target.value })}
          className="min-h-10"
        />
      </label>
    )
  }
  if (draft.kind === "video" || draft.kind === "audio") {
    const elapsedId = `reader-elapsed-${item.fragment_id}`
    const durationId = `reader-duration-${item.fragment_id}`
    return (
      <div className="grid grid-cols-2 gap-2">
        <label htmlFor={elapsedId} className="grid gap-1.5">
          <span className={fieldLabelClass}>Elapsed seconds</span>
          <Input
            id={elapsedId}
            type="number"
            min="0"
            step="0.1"
            value={draft.elapsedSeconds}
            onChange={(event) => setDraft({ ...draft, elapsedSeconds: event.target.value })}
            className="min-h-10"
          />
        </label>
        <label htmlFor={durationId} className="grid gap-1.5">
          <span className={fieldLabelClass}>Duration seconds</span>
          <Input
            id={durationId}
            type="number"
            min="0.1"
            step="0.1"
            value={draft.durationSeconds}
            onChange={(event) => setDraft({ ...draft, durationSeconds: event.target.value })}
            className="min-h-10"
          />
        </label>
      </div>
    )
  }
  if (draft.kind === "gallery") {
    const choices = item.media
      .filter((media) => media.kind === "image")
      .slice()
      .sort((a, b) => a.attachment.position - b.attachment.position)
    const galleryId = `reader-gallery-${item.fragment_id}`
    return (
      <label htmlFor={galleryId} className="grid gap-1.5">
        <span className={fieldLabelClass}>Gallery item</span>
        <select
          id={galleryId}
          className={selectClass}
          value={draft.attachmentId}
          onChange={(event) => {
            const selected = choices.find(
              (choice) => choice.attachment.attachment_id === event.target.value,
            )
            setDraft({
              ...draft,
              kind: "gallery",
              attachmentId: event.target.value,
              index: selected?.attachment.position ?? 0,
            })
          }}
        >
          {choices.map((choice) => (
            <option key={choice.attachment.attachment_id} value={choice.attachment.attachment_id}>
              {choice.attachment.caption || `Item ${choice.attachment.position + 1}`}
            </option>
          ))}
        </select>
      </label>
    )
  }
  const pageId = `reader-page-${item.fragment_id}`
  const pageProgId = `reader-page-prog-${item.fragment_id}`
  return (
    <div className="grid grid-cols-2 gap-2">
      <label htmlFor={pageId} className="grid gap-1.5">
        <span className={fieldLabelClass}>Page</span>
        <Input
          id={pageId}
          type="number"
          min="1"
          step="1"
          value={draft.page}
          onChange={(event) => setDraft({ ...draft, page: event.target.value })}
          className="min-h-10"
        />
      </label>
      <label htmlFor={pageProgId} className="grid gap-1.5">
        <span className={fieldLabelClass}>Page progress · 0 to 1</span>
        <Input
          id={pageProgId}
          type="number"
          min="0"
          max="1"
          step="0.01"
          value={draft.progress}
          onChange={(event) => setDraft({ ...draft, progress: event.target.value })}
          className="min-h-10"
        />
      </label>
    </div>
  )
}
