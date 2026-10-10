import fixture from "../../fixtures/reader-example.json" with { type: "json" }
import type {
  ReaderCapabilityCoverage,
  ReaderCommand,
  ReaderItem,
  ReaderReadingPosition,
  ReaderScope,
} from "./types"

export const readerFixture = fixture
export type ReaderFixture = typeof fixture

export const READER_SCOPES: readonly ReaderScope[] = ["inbox", "library", "all"]

export function isReaderScope(value: string | null): value is ReaderScope {
  return value !== null && (READER_SCOPES as readonly string[]).includes(value)
}

export function readerScopeLabel(scope: ReaderScope): string {
  return scope === "inbox" ? "Inbox" : scope === "library" ? "Library" : "All"
}

export type ReaderExampleAppearance = "recorded" | "loading" | "error" | "empty" | "inline-error"

export type ReaderExampleState = {
  scope: ReaderScope
  appearance: ReaderExampleAppearance
  theme: "p4-white" | "p1-green-phosphor" | "p3-amber-phosphor" | "hi-contrast"
  mode: "light" | "dark"
}

export const defaultReaderState: ReaderExampleState = {
  scope: "inbox",
  appearance: "recorded",
  theme: "p4-white",
  mode: "light",
}

export function normalizeReaderState(params: URLSearchParams): ReaderExampleState {
  const scopes = params.getAll("scope")
  const rawScope = scopes.length === 1 ? scopes[0] : null
  const scope: ReaderScope = isReaderScope(rawScope) ? rawScope : "inbox"

  const rawAppearance = params.get("appearance")
  const appearance: ReaderExampleAppearance =
    rawAppearance === "loading" ||
    rawAppearance === "error" ||
    rawAppearance === "empty" ||
    rawAppearance === "inline-error"
      ? rawAppearance
      : "recorded"

  const rawTheme = params.get("theme")
  const theme =
    rawTheme === "p1-green-phosphor" ||
    rawTheme === "p3-amber-phosphor" ||
    rawTheme === "hi-contrast"
      ? rawTheme
      : "p4-white"

  const rawMode = params.get("mode")
  const mode = rawMode === "dark" ? "dark" : "light"

  return { scope, appearance, theme, mode }
}

export function readerHref(state: ReaderExampleState): string {
  const params = new URLSearchParams()
  params.set("example", "reader")
  params.set("scope", state.scope)
  if (state.appearance !== "recorded") params.set("appearance", state.appearance)
  if (state.theme !== "p4-white") params.set("theme", state.theme)
  if (state.mode !== "light") params.set("mode", state.mode)
  return `/?${params.toString()}`
}

export function sourceLabel(item: ReaderItem): string {
  const provider = item.source.provider.replaceAll("_", " ").trim()
  return provider ? provider[0].toUpperCase() + provider.slice(1) : "Local source"
}

export function safeReaderSourceHref(item: ReaderItem): string | undefined {
  for (const raw of [item.source.canonical_url, item.source.submitted_url]) {
    if (!raw) continue
    try {
      const parsed = new URL(raw)
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") continue
      if (parsed.username || parsed.password) continue
      return parsed.href
    } catch {}
  }
  return undefined
}

export function sourceHost(item: ReaderItem): string | undefined {
  const href = safeReaderSourceHref(item)
  if (!href) return undefined
  try {
    return new URL(href).hostname.replace(/^www\./, "")
  } catch {
    return undefined
  }
}

export function publishedLabel(value: string | undefined): string | undefined {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

export function boundedReaderText(value: string, limit = 360): string {
  const normalized = value.replace(/\s+/g, " ").trim()
  const runes = Array.from(normalized)
  if (runes.length <= limit) return normalized
  return `${runes
    .slice(0, Math.max(0, limit - 1))
    .join("")
    .trimEnd()}…`
}

export function readerPlainTextExcerpt(value: string, limit = 360): string {
  const plain = value
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/^\s*\[[^\]]+\]:\s*\S+.*$/gm, " ")
    .replace(/!\[[^\]]*\]\([^\n)]*\)/g, " ")
    .replace(/!\[[^\]]*\]\[[^\]]*\]/g, " ")
    .replace(/\[([^\]]+)\]\([^\n)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\[[^\]]*\]/g, "$1")
    .replace(/<https?:\/\/[^>]+>/gi, " ")
    .replace(/(?:https?:\/\/|www\.)[^\s<>"']+/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/^\s*(?:#{1,6}|>|[-+*])\s+/gm, "")
    .replace(/^\s*\d+[.)]\s+/gm, "")
    .replace(/[*_~`]+/g, "")
    .replaceAll("[", "")
    .replaceAll("]", "")
    .replace(/\(\s*\)/g, " ")

  return boundedReaderText(plain, limit)
}

export interface ReaderAxisPresentation {
  value: string
  tone: "quiet" | "attention" | "active" | "success" | "danger"
}

export function effectPresentation(state: string): ReaderAxisPresentation {
  switch (state) {
    case "pending":
      return { value: "Pending", tone: "active" }
    case "partial":
      return { value: "Partial", tone: "attention" }
    case "failed":
      return { value: "Failed", tone: "danger" }
    case "succeeded":
      return { value: "Complete", tone: "success" }
    default:
      return { value: "None", tone: "quiet" }
  }
}

export function enrichmentPresentation(
  coverage: ReaderCapabilityCoverage[],
): ReaderAxisPresentation {
  if (!coverage || coverage.length === 0) return { value: "Not requested", tone: "quiet" }

  const counts = new Map<string, number>()
  for (const item of coverage) counts.set(item.state, (counts.get(item.state) ?? 0) + 1)
  const pending = counts.get("pending") ?? 0
  const failed = counts.get("failed") ?? 0
  const incomplete = (counts.get("missing") ?? 0) + (counts.get("stale") ?? 0)
  const parts = [
    pending > 0 ? `${pending} pending` : "",
    failed > 0 ? `${failed} failed` : "",
    incomplete > 0 ? `${incomplete} incomplete` : "",
  ].filter(Boolean)

  if (parts.length > 1) return { value: parts.join(" · "), tone: "attention" }
  if (pending > 0) return { value: parts[0], tone: "active" }
  if (failed > 0) return { value: parts[0], tone: "danger" }
  if (incomplete > 0) return { value: parts[0], tone: "attention" }
  return { value: "Complete", tone: "success" }
}

export function acquisitionPresentation(
  acquisition: Record<string, number>,
): ReaderAxisPresentation {
  if (!acquisition) return { value: "No media", tone: "quiet" }
  const pending = acquisition.pending ?? 0
  const available = acquisition.available ?? 0
  const referenceOnly = acquisition.reference_only ?? 0
  const failed = acquisition.failed ?? 0
  const total = pending + available + referenceOnly + failed
  if (total === 0) return { value: "No media", tone: "quiet" }
  const parts = [
    failed > 0 ? `${failed} failed` : "",
    pending > 0 ? `${pending} pending` : "",
    available > 0 ? `${available} local` : "",
    referenceOnly > 0 ? `${referenceOnly} referenced` : "",
  ].filter(Boolean)
  if (failed > 0 && parts.length > 1) {
    return { value: parts.join(" · "), tone: "attention" }
  }
  if (failed > 0) return { value: `${failed} failed`, tone: "danger" }
  if (pending > 0 && parts.length > 1) {
    return { value: parts.join(" · "), tone: "attention" }
  }
  if (pending > 0) return { value: `${pending} pending`, tone: "active" }
  if (referenceOnly > 0 && available > 0) {
    return { value: `${available} local · ${referenceOnly} referenced`, tone: "success" }
  }
  if (referenceOnly > 0) return { value: `${referenceOnly} referenced`, tone: "quiet" }
  return { value: `${available} available`, tone: "success" }
}

export function readingStateLabel(state: ReaderItem["reading_state"]["state"]): string {
  switch (state) {
    case "in_progress":
      return "In progress"
    case "read":
      return "Read"
    default:
      return "Unread"
  }
}

export const READER_CARD_INTERACTIVE_SELECTOR = [
  "a",
  "button",
  "input",
  "select",
  "textarea",
  "summary",
  "audio",
  "video",
  "[controls]",
  '[contenteditable="true"]',
  '[role="button"]',
  '[role="checkbox"]',
  '[role="menuitem"]',
  '[role="tab"]',
  "[data-reader-nav-exclude]",
  "[data-reader-gallery-control]",
].join(",")

export function hasReaderCardInteraction(target: EventTarget | null, card: HTMLElement): boolean {
  return (
    target instanceof Element &&
    target !== card &&
    Boolean(target.closest(READER_CARD_INTERACTIVE_SELECTOR))
  )
}

export function hasReaderCardSelection(card: HTMLElement): boolean {
  const selection = window.getSelection?.()
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return false
  const range = selection.getRangeAt(0)
  return card.contains(range.commonAncestorContainer)
}

export function isReaderVisualRenderer(renderer: string): boolean {
  return renderer === "image" || renderer === "gallery" || renderer === "video"
}

// Local fictional fixture mutations
export function executeReaderCommand(items: ReaderItem[], command: ReaderCommand): ReaderItem[] {
  return items.map((item) => {
    if (item.fragment_id !== command.fragment_id) return item
    switch (command.command) {
      case "add_tag": {
        const tag = command.tag.trim()
        if (!tag || item.tags.combined.some((t) => t.toLowerCase() === tag.toLowerCase())) {
          return item
        }
        return {
          ...item,
          revision: item.revision + 1,
          tags: {
            combined: [...item.tags.combined, tag],
            attributed: [...item.tags.attributed, { value: tag, source: "user" }],
          },
        }
      }
      case "remove_tag": {
        const tag = command.tag.trim().toLowerCase()
        return {
          ...item,
          revision: item.revision + 1,
          tags: {
            ...item.tags,
            combined: item.tags.combined.filter((t) => t.toLowerCase() !== tag),
            attributed: item.tags.attributed.filter((t) => t.value.toLowerCase() !== tag),
          },
        }
      }
      case "mark_read": {
        return {
          ...item,
          reading_state: {
            ...item.reading_state,
            state: "read",
            completed_at: "2026-10-04T14:30:00Z",
            revision: item.reading_state.revision + 1,
          },
        }
      }
      case "mark_unread": {
        const rs = { ...item.reading_state }
        delete rs.completed_at
        return {
          ...item,
          reading_state: {
            ...rs,
            state: "unread",
            position: { kind: "none" },
            revision: item.reading_state.revision + 1,
          },
        }
      }
      case "set_reading_progress": {
        const rs = { ...item.reading_state }
        delete rs.completed_at
        return {
          ...item,
          reading_state: {
            ...rs,
            state: "in_progress",
            position: command.position,
            last_opened_at: "2026-10-04T14:30:00Z",
            revision: item.reading_state.revision + 1,
          },
        }
      }
      case "request_asset_acquisition": {
        const media = item.media.map((entry) => {
          if (entry.media_asset_id !== command.media_asset_id) return entry
          return {
            ...entry,
            variants: entry.variants.map((v) => {
              if (v.kind !== command.variant_kind || v.acquisition_state === "available") return v
              return {
                ...v,
                custody: command.requested_custody,
                acquisition_state: "pending" as const,
              }
            }),
          }
        })
        const pendingCount = media.reduce(
          (acc, m) => acc + m.variants.filter((v) => v.acquisition_state === "pending").length,
          0,
        )
        return {
          ...item,
          media,
          operations: {
            ...item.operations,
            acquisition: {
              ...item.operations.acquisition,
              pending: pendingCount,
            },
          },
        }
      }
      case "route": {
        return {
          ...item,
          operations: {
            ...item.operations,
            routing: {
              state: "pending",
              references: Array.from(
                new Set([...item.operations.routing.references, command.route_id]),
              ),
            },
          },
        }
      }
      case "materialize": {
        return {
          ...item,
          operations: {
            ...item.operations,
            materialization: {
              state: "pending",
              references: Array.from(
                new Set([...item.operations.materialization.references, command.destination_id]),
              ),
            },
          },
        }
      }
      case "update_curated_note": {
        return {
          ...item,
          revision: item.revision + 1,
          curated_note: {
            body_markdown: command.body_markdown,
            revision: (item.curated_note?.revision ?? 0) + 1,
            updated_at: "2026-10-04T14:30:00Z",
          },
        }
      }
      case "append_capture_note": {
        return {
          ...item,
          revision: item.revision + 1,
          annotations: [
            ...item.annotations,
            {
              annotation_id: command.annotation_id,
              capture_id: `cap-${item.annotations.length + 1}`,
              kind: "capture_note",
              text: command.text,
              captured_at: "2026-10-04T14:30:00Z",
            },
          ],
        }
      }
      default:
        return item
    }
  })
}

export function hasReaderCommand(item: ReaderItem, command: string): boolean {
  return item.actions.some((a) => a.command === command)
}

export interface ReaderProgressDraft {
  kind: "none" | "article" | "video" | "gallery" | "document" | "audio"
  progress: string
  elapsedSeconds: string
  durationSeconds: string
  attachmentId: string
  index: number
  page: string
}

export function progressDraftForItem(item: ReaderItem): ReaderProgressDraft {
  const pos = item.reading_state.position
  const draft: ReaderProgressDraft = {
    kind: pos.kind,
    progress: "0",
    elapsedSeconds: "0",
    durationSeconds: "0",
    attachmentId: "",
    index: 0,
    page: "1",
  }
  if (pos.kind === "article") {
    draft.progress = String(pos.progress ?? 0)
  } else if (pos.kind === "video" || pos.kind === "audio") {
    draft.elapsedSeconds = String(pos.elapsed_seconds ?? 0)
    draft.durationSeconds = String(pos.duration_seconds ?? 0)
  } else if (pos.kind === "gallery") {
    draft.attachmentId = pos.attachment_id ?? ""
    draft.index = pos.index ?? 0
  } else if (pos.kind === "document") {
    draft.page = String(pos.page ?? 1)
    draft.progress = String(pos.progress ?? 0)
  }
  return draft
}

export function parseReaderProgressDraft(
  draft: ReaderProgressDraft,
): { ok: true; position: ReaderReadingPosition } | { ok: false; error: string } {
  if (draft.kind === "none") {
    return { ok: true, position: { kind: "none" } }
  }
  if (draft.kind === "article") {
    const val = Number.parseFloat(draft.progress)
    const progress = Number.isNaN(val) ? 0 : Math.min(1, Math.max(0, val))
    return { ok: true, position: { kind: "article", progress } }
  }
  if (draft.kind === "video" || draft.kind === "audio") {
    const elapsed = Number.parseFloat(draft.elapsedSeconds)
    const duration = Number.parseFloat(draft.durationSeconds)
    return {
      ok: true,
      position: {
        kind: draft.kind,
        elapsed_seconds: Number.isNaN(elapsed) ? 0 : Math.max(0, elapsed),
        duration_seconds: Number.isNaN(duration) ? undefined : Math.max(0, duration),
      },
    }
  }
  if (draft.kind === "gallery") {
    return {
      ok: true,
      position: {
        kind: "gallery",
        attachment_id: draft.attachmentId,
        index: draft.index,
      },
    }
  }
  if (draft.kind === "document") {
    const pageNum = Number.parseInt(draft.page, 10)
    const progVal = Number.parseFloat(draft.progress)
    return {
      ok: true,
      position: {
        kind: "document",
        page: Number.isNaN(pageNum) ? 1 : Math.max(1, pageNum),
        progress: Number.isNaN(progVal) ? 0 : Math.min(1, Math.max(0, progVal)),
      },
    }
  }
  return { ok: false, error: "Unknown position kind" }
}
