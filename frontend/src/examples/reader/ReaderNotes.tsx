import { cn } from "@hollis-labs/design-components"
import { type FocusEvent, useEffect, useState } from "react"
import type { ReaderCommand, ReaderItem } from "./types"

export type ReaderNoteKind = "curated" | "capture"

interface ReaderNoteEditorProps {
  item: ReaderItem
  onCommand: (command: ReaderCommand) => void
  kind: ReaderNoteKind
  compact?: boolean
}

export function ReaderNoteEditor({
  item,
  onCommand,
  kind,
  compact = false,
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

  useEffect(() => {
    if (kind !== "curated" || !dirty || draft === serverCuratedNote) return
    const timer = setTimeout(() => {
      onCommand({
        fragment_id: item.fragment_id,
        command: "update_curated_note",
        body_markdown: draft,
      })
      setDirty(false)
      setStatus("Saved locally")
      const clear = setTimeout(() => setStatus(""), 2000)
      return () => clearTimeout(clear)
    }, 750)
    return () => clearTimeout(timer)
  }, [dirty, draft, item.fragment_id, kind, onCommand, serverCuratedNote])

  function saveCaptureNote() {
    const text = draft.trim()
    if (kind !== "capture" || !text) return
    onCommand({
      fragment_id: item.fragment_id,
      command: "append_capture_note",
      annotation_id: `annotation-${item.fragment_id}-${item.annotations.length + 1}`,
      text,
    })
    setDraft("")
    setDirty(false)
    setStatus("Note added")
    setTimeout(() => setStatus(""), 2000)
  }

  function handleBlur(event: FocusEvent<HTMLTextAreaElement>) {
    if (event.currentTarget.contains(event.relatedTarget)) return
    if (kind === "capture") {
      saveCaptureNote()
    } else if (dirty && draft !== serverCuratedNote) {
      onCommand({
        fragment_id: item.fragment_id,
        command: "update_curated_note",
        body_markdown: draft,
      })
      setDirty(false)
      setStatus("Saved locally")
      setTimeout(() => setStatus(""), 2000)
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
        onChange={(e) => {
          setDraft(e.target.value)
          setDirty(true)
        }}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          e.stopPropagation()
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault()
            if (kind === "capture") saveCaptureNote()
          }
        }}
        maxLength={kind === "curated" ? 524288 : 65536}
        className={cn(
          "w-full resize-y rounded-sm border border-divider bg-transparent p-3 text-text placeholder:text-text-subtle focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          compact ? "min-h-24 text-control leading-5" : "min-h-32 text-sm leading-6",
        )}
        placeholder={
          kind === "curated"
            ? "Keep the durable working note here"
            : "Add context from this reading pass (Ctrl/Cmd+Enter to save)"
        }
        aria-label={kind === "curated" ? "Curated note" : "Capture note"}
      />
      <div className="mt-1 flex min-h-5 items-center justify-between text-label text-text-subtle">
        <span>
          {status
            ? status
            : kind === "curated"
              ? "Saves automatically"
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
