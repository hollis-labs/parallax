import { cn, Input } from "@hollis-labs/design-components"
import { Check, Plus, X } from "lucide-react"
import { type FormEvent, useState } from "react"
import type { ReaderCommand, ReaderItem } from "./types"

interface ReaderTagsProps {
  item: ReaderItem
  onCommand: (command: ReaderCommand) => void
  compact?: boolean
}

export function ReaderTags({ item, onCommand, compact = false }: ReaderTagsProps) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState("")

  function handleAddTag(event: FormEvent) {
    event.preventDefault()
    const tag = draft.trim()
    if (!tag) return
    onCommand({
      fragment_id: item.fragment_id,
      command: "add_tag",
      tag,
    })
    setDraft("")
    setAdding(false)
  }

  function handleRemoveTag(tag: string) {
    onCommand({
      fragment_id: item.fragment_id,
      command: "remove_tag",
      tag,
    })
  }

  return (
    <div
      className="flex min-w-0 flex-wrap items-center gap-1.5"
      data-reader-tags
      data-reader-nav-exclude
    >
      <span className="sr-only">Tags</span>
      {item.tags.combined.map((tag) => (
        <span
          key={tag}
          className={cn(
            "group/tag inline-flex items-center rounded-full bg-panel-2 text-text-muted",
            compact ? "min-h-7 pl-2.5 text-label" : "min-h-8 pl-3 text-xs",
            "pr-1.5",
          )}
        >
          #{tag}
          <button
            type="button"
            className={cn(
              "ml-0.5 inline-flex items-center justify-center rounded-full text-text-subtle opacity-70 outline-none transition-opacity hover:bg-bg hover:text-text focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring group-hover/tag:opacity-100 motion-reduce:transition-none",
              compact ? "h-6 w-6" : "h-7 w-7",
            )}
            aria-label={`Remove tag ${tag}`}
            onClick={() => handleRemoveTag(tag)}
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </span>
      ))}

      {adding ? (
        <form className="flex items-center gap-1" onSubmit={handleAddTag}>
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation()
              if (e.key === "Escape") {
                setDraft("")
                setAdding(false)
              }
            }}
            maxLength={128}
            className={cn(
              "w-28 rounded-full px-3 text-xs",
              compact ? "h-7 min-h-7" : "h-8 min-h-8",
            )}
            placeholder="New tag"
            aria-label="New tag"
            autoFocus
          />
          <button
            type="submit"
            className={cn(
              "inline-flex items-center justify-center rounded-full bg-panel-2 text-text-muted outline-none hover:text-text focus-visible:ring-2 focus-visible:ring-ring",
              compact ? "h-7 w-7" : "h-8 w-8",
            )}
            aria-label="Save tag"
            disabled={!draft.trim()}
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </form>
      ) : (
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1 rounded-full bg-panel-2 px-2.5 text-text-subtle outline-none hover:text-text focus-visible:ring-2 focus-visible:ring-ring",
            compact ? "min-h-7 text-label" : "min-h-8 text-xs",
          )}
          aria-label="Add tag"
          onClick={() => setAdding(true)}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Tag
        </button>
      )}
    </div>
  )
}
