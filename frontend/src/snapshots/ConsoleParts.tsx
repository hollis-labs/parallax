import { Badge } from "@hollis-labs/design-components"
import type { ConsoleReceipt } from "./console-model"
export function CapturedChips({
  values,
  empty = "None reported",
}: {
  values: string[]
  empty?: string
}) {
  return values.length ? (
    <span className="flex flex-wrap gap-2">
      {values.map((v) => (
        <Badge key={v} variant="secondary">
          {v}
        </Badge>
      ))}
    </span>
  ) : (
    <span className="text-fg-faint">{empty}</span>
  )
}
export function CaptureReceipt({ receipt, label }: { receipt: ConsoleReceipt; label: string }) {
  return (
    <details className="dash-support text-fg-faint px-4 py-3">
      <summary>
        {label} · captured {receipt.capturedAt}
      </summary>
      <p className="break-words">
        Read through {receipt.origin}
        {receipt.path} · cache {receipt.cache ?? "not reported"}
        {receipt.sourceUpdatedAt ? ` · source updated ${receipt.sourceUpdatedAt}` : ""}. Capture
        time is the observation time, not a claim of live freshness.
      </p>
    </details>
  )
}
