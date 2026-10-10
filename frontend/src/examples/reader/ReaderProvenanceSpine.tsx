import {
  acquisitionPresentation,
  enrichmentPresentation,
  type ReaderAxisPresentation,
} from "./model"
import type { ReaderItem } from "./types"

interface ReaderProvenanceSpineProps {
  item: ReaderItem
}

const SEGMENT_TONES: Record<ReaderAxisPresentation["tone"], string> = {
  quiet: "bg-text-subtle/35",
  attention: "bg-status-inbox",
  active: "bg-status-routed",
  success: "bg-status-indexed",
  danger: "bg-danger-muted",
}

export function ReaderProvenanceSpine({ item }: ReaderProvenanceSpineProps) {
  const triageTone: ReaderAxisPresentation["tone"] =
    item.operations.triage.unresolved_count > 0 ? "attention" : "quiet"
  const enrichmentTone = enrichmentPresentation(item.operations.enrichment).tone
  const mediaTone = acquisitionPresentation(item.operations.acquisition).tone

  return (
    <div
      className="absolute inset-y-0 left-0 flex w-1 flex-col gap-px overflow-hidden rounded-l-sm"
      aria-hidden="true"
      data-testid="reader-provenance-spine"
    >
      <span className={`flex-1 ${SEGMENT_TONES[triageTone]}`} data-tone={triageTone} />
      <span className={`flex-1 ${SEGMENT_TONES[enrichmentTone]}`} data-tone={enrichmentTone} />
      <span className={`flex-1 ${SEGMENT_TONES[mediaTone]}`} data-tone={mediaTone} />
    </div>
  )
}
