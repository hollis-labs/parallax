import {
  Button,
  ConfirmDialog,
  InspectionDialog,
  isComposingEvent,
  useControlledRecordNavigation,
  useLayeredEscape,
  useShortcut,
} from "@hollis-labs/design-components"
import { useLayoutEffect, useRef, useState } from "react"
import { label, type NilRecord, sections } from "./model"
import { ownsPopup, popupOwner } from "./ownership"

export function NilEditor({
  open,
  record,
  ids,
  generation,
  admitted,
  origin,
  fallback,
  onSave,
  onClose,
  onRecord,
}: {
  open: boolean
  record: NilRecord
  ids: string[]
  generation: unknown
  admitted: () => boolean
  origin: HTMLElement | null
  fallback: () => HTMLElement | null
  onSave: (record: NilRecord) => void
  onClose: () => void
  onRecord: (id: string) => void
}) {
  const [draft, setDraft] = useState(record)
  const [prompt, setPrompt] = useState(false)
  const [next, setNext] = useState<string | null>(null)
  const root = useRef<HTMLDivElement>(null),
    initial = useRef<HTMLInputElement>(null)
  const composing = useRef(false)
  const dirty = JSON.stringify(draft) !== JSON.stringify(record)
  const frame = useShortcut({
    key: "",
    enabled: false,
    sourceGeneration: generation,
    onTrigger: () => {},
  })
  useLayoutEffect(() => {
    if (open) {
      setDraft(record)
      setPrompt(false)
      composing.current = false
    }
  }, [open, record])
  const ready = () => open && frame.isLive() && admitted() && Boolean(root.current?.isConnected)
  function closeOrNavigate(id: string | null) {
    if (!ready() || !layer.isTopmost() || !ownsPopup(root.current) || composing.current) return
    if (dirty) {
      setNext(id)
      setPrompt(true)
    } else if (id !== null) onRecord(id)
    else onClose()
  }
  const layer = useLayeredEscape({
    active: open,
    sourceGeneration: generation,
    rootElement: () => root.current,
    isLayerAdmitted: ready,
    onEscape: () => {
      if (composing.current) return false
      closeOrNavigate(null)
      return "closed"
    },
  })
  const nav = useControlledRecordNavigation({
    orderedIds: ids,
    selectedId: record.id,
    active: open && !prompt,
    sourceGeneration: generation,
    accessible: true,
    boundaryPolicy: "stop",
    onSelect: closeOrNavigate,
  })
  function finish(
    save: boolean,
    target: string | null = null,
    owner: "editor" | "prompt" = "editor",
  ) {
    if (!ready() || composing.current) return
    if (
      owner === "prompt"
        ? !prompt || !ownsPopup(popupOwner("dirty"), root.current ? [root.current] : [])
        : !layer.isTopmost() || !ownsPopup(root.current)
    )
      return
    if (save) onSave(draft)
    setPrompt(false)
    if (target !== null) onRecord(target)
    else onClose()
  }
  return (
    <InspectionDialog
      open={open}
      title={`Edit ${label(record)}`}
      ref={root}
      data-nil-owner="editor"
      initialFocus={initial}
      showFullscreenToggle
      titleProps={{ tabIndex: 0 }}
      meta="Local fixture draft · Cmd/Ctrl+Enter saves and closes"
      returnFocus={{ trigger: origin, isAdmitted: admitted, fallbackTarget: fallback }}
      onOpenChange={(open, details) => {
        if (!open) {
          details.cancel()
          if (details.reason === "escape-key") layer.handleEscape(details.event as KeyboardEvent)
          else closeOrNavigate(null)
        }
      }}
      {...nav.popupHandlers}
      onCompositionStartCapture={(event) => {
        nav.popupHandlers.onCompositionStartCapture?.(event)
        if (frame.isLive()) composing.current = true
      }}
      onCompositionEndCapture={(event) => {
        nav.popupHandlers.onCompositionEndCapture?.(event)
        if (frame.isLive()) composing.current = false
      }}
      onKeyDown={(event) => {
        nav.popupHandlers.onKeyDown?.(event)
        if (
          !ready() ||
          !layer.isTopmost() ||
          !ownsPopup(root.current) ||
          composing.current ||
          event.defaultPrevented ||
          isComposingEvent(event.nativeEvent)
        )
          return
        if (
          event.key === "Enter" &&
          (event.ctrlKey || event.metaKey) &&
          !event.shiftKey &&
          !event.altKey
        ) {
          event.preventDefault()
          event.stopPropagation()
          finish(true)
        }
      }}
      navigation={
        <>
          <Button disabled={!nav.availability.previous || prompt} onClick={() => nav.navigate(-1)}>
            Previous
          </Button>
          <span>
            {ids.indexOf(record.id) + 1} / {ids.length}
          </span>
          <Button disabled={!nav.availability.next || prompt} onClick={() => nav.navigate(1)}>
            Next
          </Button>
        </>
      }
      navigationLabel="Nil record navigation"
      footer={
        <>
          <span className="text-caption text-fg-muted">
            {dirty ? "Unsaved local changes" : "Local fixture"}
          </span>
          <Button
            onClick={() => {
              if (layer.isTopmost()) finish(true)
            }}
          >
            Save and close
          </Button>
        </>
      }
    >
      <form
        className="space-y-4 p-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (layer.isTopmost()) finish(true)
        }}
      >
        <label className="block text-sm">
          Title
          <input
            ref={initial}
            aria-label="Item title"
            className="mt-2 block w-full"
            value={draft.title}
            onChange={(e) => {
              if (ready() && layer.isTopmost() && ownsPopup(root.current))
                setDraft({ ...draft, title: e.target.value })
            }}
          />
        </label>
        <div className="flex flex-wrap gap-3">
          <label>
            Type
            <select
              aria-label="Item type"
              value={draft.kind}
              onChange={(e) => {
                if (ready() && layer.isTopmost() && ownsPopup(root.current))
                  setDraft({ ...draft, kind: e.target.value as NilRecord["kind"] })
              }}
            >
              {["todo", "note", "scratch"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
          <label>
            Section
            <select
              aria-label="Item section"
              value={draft.section}
              onChange={(e) => {
                if (ready() && layer.isTopmost() && ownsPopup(root.current))
                  setDraft({ ...draft, section: e.target.value as NilRecord["section"] })
              }}
            >
              {sections.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="block text-sm">
          Notes
          <textarea
            aria-label="Item notes"
            rows={24}
            className="mt-2 block w-full"
            value={draft.body}
            onChange={(e) => {
              if (ready() && layer.isTopmost() && ownsPopup(root.current))
                setDraft({ ...draft, body: e.target.value })
            }}
          />
        </label>
        <p className="text-caption text-fg-muted">
          {record.id} · {record.contexts.map((v) => `@${v}`).join(" ")}{" "}
          {record.projects.map((v) => `+${v}`).join(" ")}{" "}
          {record.tags.map((v) => `#${v}`).join(" ")}
        </p>
      </form>
      <ConfirmDialog
        open={prompt}
        data-nil-owner="dirty"
        onOpenChange={(value) => {
          if (
            ready() &&
            prompt &&
            ownsPopup(popupOwner("dirty"), root.current ? [root.current] : [])
          )
            setPrompt(value)
        }}
        title="Unsaved local changes"
        confirmLabel="Discard changes"
        cancelLabel="Keep editing"
        onConfirm={() => finish(false, next, "prompt")}
        showFullscreenToggle
        description={
          <>
            <span>Your draft stays local. Discard it or return to the editor.</span>
            <Button variant="outline" onClick={() => finish(true, next, "prompt")}>
              Save changes
            </Button>
          </>
        }
      />
    </InspectionDialog>
  )
}
