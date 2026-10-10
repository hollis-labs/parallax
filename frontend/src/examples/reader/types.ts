export type ISODateString = string

export type ReaderScope = "inbox" | "library" | "all"

export type ReaderRenderer =
  | "article"
  | "image"
  | "gallery"
  | "video"
  | "audio"
  | "document"
  | "text"
  | "unknown"

export interface ReaderResolvedText {
  value: string
  source: string
}

export interface ReaderSourceIdentity {
  provider: string
  canonical_url?: string
  submitted_url?: string
}

export interface ReaderAssetVariant {
  asset_variant_id: string
  kind: string
  custody: string
  acquisition_state: "available" | "pending" | "reference_only" | "failed"
  mime_type?: string
  content_href?: string
  source_url?: string
  duration_seconds?: number
}

export interface ReaderMediaAttachment {
  attachment_id: string
  fragment_revision_id: string
  media_asset_id: string
  role: string
  position: number
  caption?: string
}

export interface ReaderMediaItem {
  attachment: ReaderMediaAttachment
  media_asset_id: string
  provider_media_id?: string
  kind: string
  alt_text?: string
  variants: ReaderAssetVariant[]
}

export interface ReaderPlayback {
  kind: "provider_embed" | "blob_stream" | "external_stream"
  provider?: string
  provider_item_id?: string
  start_seconds?: number
  url?: string
}

export interface ReaderTagAttribution {
  value: string
  source: "user" | "provider" | "deterministic" | "model"
  observation_id?: string
}

export interface ReaderTags {
  combined: string[]
  attributed: ReaderTagAttribution[]
}

export interface ReaderAnnotation {
  annotation_id: string
  capture_id: string
  kind: "highlight" | "capture_note"
  text: string
  captured_at: ISODateString
}

export interface ReaderCuratedNote {
  body_markdown: string
  revision: number
  updated_at: ISODateString
}

export type ReaderReadingPosition =
  | { kind: "none" }
  | { kind: "article"; progress?: number; block_anchor?: string; local_offset?: number }
  | {
      kind: "video"
      elapsed_seconds: number
      duration_seconds?: number
      provider_media_id?: string
    }
  | { kind: "gallery"; attachment_id: string; index: number }
  | { kind: "document"; page: number; progress?: number }
  | { kind: "audio"; elapsed_seconds: number; duration_seconds?: number }

export interface ReaderReadingState {
  principal_id: string
  fragment_id: string
  state: "unread" | "in_progress" | "read"
  position: ReaderReadingPosition
  last_opened_at?: ISODateString
  completed_at?: ISODateString
  revision: number
}

export interface ReaderTriageSummary {
  case_ids: string[]
  unresolved_count: number
}

export interface ReaderEffectSummary {
  state: "none" | "pending" | "partial" | "succeeded" | "failed"
  references: string[]
}

export interface ReaderCapabilityCoverage {
  capability: string
  state: "provided" | "missing" | "pending" | "failed" | "stale" | "not_applicable"
  observation_id?: string
  detail?: string
}

export interface ReaderOperationalSummaries {
  triage: ReaderTriageSummary
  routing: ReaderEffectSummary
  materialization: ReaderEffectSummary
  enrichment: ReaderCapabilityCoverage[]
  acquisition: Record<string, number>
}

export interface ReaderCommandCapability {
  command: string
  input_schema: string
  expected_revision_required: boolean
}

export interface ReaderArticle {
  preview_markdown: string
  full_content_available: boolean
  full_content_href?: string
}

export interface ReaderDisplay {
  title: ReaderResolvedText
  description?: ReaderResolvedText
  byline?: ReaderResolvedText
  published_at?: ISODateString
  summary: ReaderResolvedText
}

export interface ReaderItem {
  schema_version: "fe.reader.item.v1"
  fragment_id: string
  fragment_revision_id: string
  revision: number
  source: ReaderSourceIdentity
  renderer: ReaderRenderer
  display: ReaderDisplay
  article: ReaderArticle
  media: ReaderMediaItem[]
  playback?: ReaderPlayback
  tags: ReaderTags
  annotations: ReaderAnnotation[]
  curated_note?: ReaderCuratedNote
  capture_count: number
  reading_state: ReaderReadingState
  operations: ReaderOperationalSummaries
  actions: ReaderCommandCapability[]
}

export type ReaderCommandName =
  | "add_tag"
  | "remove_tag"
  | "append_capture_note"
  | "update_curated_note"
  | "set_reading_progress"
  | "mark_read"
  | "mark_unread"
  | "request_asset_acquisition"
  | "route"
  | "materialize"

export type ReaderCommand =
  | { fragment_id: string; command: "add_tag"; tag: string }
  | { fragment_id: string; command: "remove_tag"; tag: string }
  | { fragment_id: string; command: "mark_read" }
  | { fragment_id: string; command: "mark_unread" }
  | { fragment_id: string; command: "set_reading_progress"; position: ReaderReadingPosition }
  | {
      fragment_id: string
      command: "request_asset_acquisition"
      media_asset_id: string
      variant_kind: string
      requested_custody: string
    }
  | { fragment_id: string; command: "route"; route_id: string }
  | { fragment_id: string; command: "materialize"; destination_id: string }
  | { fragment_id: string; command: "update_curated_note"; body_markdown: string }
  | { fragment_id: string; command: "append_capture_note"; annotation_id: string; text: string }
