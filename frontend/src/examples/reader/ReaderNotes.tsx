import { cn } from "@hollis-labs/design-components"
import { type FocusEvent, useEffect, useState } from "react"
import type { ReaderCommand, ReaderItem } from "./types"

export type ReaderNoteKind = "curated" | "capture"

interface ReaderNoteEditorProps {
  item: ReaderItem
  onCommand?: (command: ReaderCommand) => void
  kind: ReaderNoteKind
  compact?: boolean
  readOnly?: boolean
}

export function ReaderNoteEditor({
  item,
  onCommand,
  kind,
  compact = false,
  readOnly = false,
}: ReaderNoteEditorProps) {
  const serverCuratedNote = item.curated_note?.body_markdown ?? ""
  const [draft, setDraft] = useState(kind === "curated" ? serverCuratedNote : "")
  const [dirty, setDirty] = useState(false)
  const [status, setStatus] = useState("")

  useEffect(() => {
    if (kind === "curated") {
      setDraft(serverCuratedNote)
      setDirty(false)
    }
  }, [kind, serverCuratedNote])

  function saveCuratedNote() {
    if (readOnly || !dirty || draft === serverCuratedNote) return
    onCommand?.({
      fragment_id: item.fragment_id,
      command: "update_curated_note",
      body_markdown: draft,
    })
    setDirty(false)
    setStatus("Saved locally")
  }

  function saveCaptureNote() {
    const text = draft.trim()
    if (readOnly || kind !== "capture" || !text) return
    onCommand?.({
      fragment_id: item.fragment_id,
      command: "append_capture_note",
      annotation_id: `annotation-${item.fragment_id}-${item.annotations.length + 1}`,
      text,
    })
    setDraft("")
    setDirty(false)
    setStatus("Note added")
  }

  function handleBlur(event: FocusEvent<HTMLTextAreaElement>) {
    if (readOnly || event.currentTarget.contains(event.relatedTarget)) return
    if (kind === "capture") {
      saveCaptureNote()
    } else {
      saveCuratedNote()
    }
  }

  const captureNotes = item.annotations
    .filter((a) => a.kind === "capture_note")
    .slice()
    .sort((a, b) => b.captured_at.localeCompare(a.captured_at))

  return (
    <div className="min-w-0" data-reader-notes data-reader-nav-exclude>
      <textarea
        value={draft}
        readOnly={readOnly}
        onChange={(e) => {
          if (readOnly) return
          setDraft(e.target.value)
          setDirty(true)
        }}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          e.stopPropagation()
          if (!readOnly && (e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault()
            if (kind === "capture") saveCaptureNote()
            else saveCuratedNote()
          }
        }}
        maxLength={kind === "curated" ? 524288 : 65536}
        className={cn(
          "w-full resize-y rounded-sm border border-divider bg-transparent p-3 text-text placeholder:text-text-subtle focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          readOnly && "cursor-default opacity-85",
          compact ? "min-h-24 text-control leading-5" : "min-h-32 text-sm leading-6",
        )}
        placeholder={
          readOnly
            ? "Working note (read-only specimen)"
            : kind === "curated"
              ? "Keep the durable working note here (Ctrl/Cmd+Enter or blur to save)"
              : "Add context from this reading pass (Ctrl/Cmd+Enter to save)"
        }
        aria-label={
          readOnly
            ? `${kind === "curated" ? "Curated note" : "Capture note"} (read-only specimen)`
            : kind === "curated"
              ? "Curated note"
              : "Capture note"
        }
      />
      <div className="mt-1 flex min-h-5 items-center justify-between text-label text-text-subtle">
        <span>
          {readOnly
            ? "Read-only fictional specimen; mutations are inert and not saved."
            : status
              ? status
              : "Press Ctrl/Cmd+Enter or leave field to save"}
        </span>
      </div>

      {kind === "capture" && captureNotes.length > 0 && (
        <div className="mt-3 border-t border-divider pt-3">
          <p className="text-label font-medium text-text-subtle">Recent capture notes</p>
          <ul className="mt-2 grid gap-2">
            {captureNotes.slice(0, compact ? 2 : 4).map((note) => (
              <li
                key={note.annotation_id}
                className="rounded-sm bg-panel-2/40 p-2 text-xs leading-5 text-text-soft"
              >
                {note.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function ReaderNotes({
  item,
  onCommand,
  compact = false,
  readOnly = false,
}: Omit<ReaderNoteEditorProps, "kind">) {
  const [active, setActive] = useState<ReaderNoteKind>("curated")

  return (
    <section data-reader-notes-tabs data-reader-nav-exclude>
      <div className="mb-3 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-1" role="tablist" aria-label="Reader notes">
          {(["curated", "capture"] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              role="tab"
              aria-selected={active === kind}
              className={cn(
                "min-h-9 border-b-2 px-3 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active === kind
                  ? "border-primary text-text font-semibold"
                  : "border-transparent text-text-subtle hover:text-text",
              )}
              onClick={() => setActive(kind)}
            >
              {kind === "curated" ? "Curated note" : "Capture note"}
            </button>
          ))}
        </div>
        {readOnly && (
          <span className="rounded-sm bg-panel-2/60 px-1.5 py-0.5 text-micro font-medium uppercase tracking-wider text-text-subtle">
            Read-only specimen
          </span>
        )}
      </div>
      <ReaderNoteEditor
        key={`${active}-${active === "curated" ? (item.curated_note?.revision ?? 0) : "append"}`}
        item={item}
        onCommand={onCommand}
        kind={active}
        compact={compact}
        readOnly={readOnly}
      />
    </section>
  )
}
