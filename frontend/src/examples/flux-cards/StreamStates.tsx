import { Button } from "@hollis-labs/design-components"
import {
  Envelope,
  EnvelopeBody,
  EnvelopeFooter,
  EnvelopeHeader,
  InfoCard,
} from "@hollis-labs/kit-chat"
import { AlertTriangle, Check, Loader2, Wrench, X } from "lucide-react"
import { useState } from "react"
import { type ToolMode, tools } from "./model"

export function ThinkingIndicator({
  state = "thinking",
}: {
  state?: "thinking" | "idle" | "interrupted"
}) {
  return (
    <div role="status" className="flux-thinking">
      <span aria-hidden="true">•••</span>
      {state === "thinking"
        ? "Thinking · static authored preview"
        : state === "interrupted"
          ? "Interrupted · no final reply supplied"
          : "Idle · no active thinking preview"}
    </div>
  )
}
export function ToolDisplay({ mode, empty = false }: { mode: ToolMode; empty?: boolean }) {
  const [expanded, setExpanded] = useState(false)
  if (empty) return <p>Known empty tools · 0 supplied calls.</p>
  return (
    <section aria-label={`Tool calls ${mode}`}>
      {mode === "indicator" && (
        <Button variant="ghost" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
          Using {tools.length} tools · running / done / error
        </Button>
      )}
      {(mode !== "indicator" || expanded) &&
        tools.map((tool, index) => {
          const Icon = tool.status === "running" ? Loader2 : tool.status === "done" ? Check : X
          return (
            <div key={tool.id} className={`flux-tool flux-tool-${mode}`}>
              {mode !== "full" && (
                <span aria-hidden="true">
                  {index === 0 ? "┌" : index === tools.length - 1 ? "└" : "├"}
                </span>
              )}
              <Icon
                aria-hidden="true"
                className={`size-3.5 ${tool.status === "error" ? "text-danger" : tool.status === "done" ? "text-success" : "text-primary"}`}
              />
              <Wrench aria-hidden="true" className="size-3 text-fg-muted" />
              <span>
                {tool.tool} · {tool.status}
              </span>
              {mode === "full" ? (
                <p>
                  {tool.summary} · {tool.detail}
                </p>
              ) : (
                <details>
                  <summary>Inspect {tool.status} summary</summary>
                  <pre>
                    {tool.summary}\n{tool.detail}
                  </pre>
                </details>
              )}
            </div>
          )
        })}
    </section>
  )
}
export function StreamBanner({
  kind,
  inspect,
  editable,
}: {
  kind: string
  inspect: (label: string, value: unknown) => void
  editable: boolean
}) {
  if (kind === "compaction")
    return (
      <div className="flux-compaction" role="note" aria-label="Earlier messages summarized">
        <span />
        Earlier messages summarized
        <span />
      </div>
    )
  if (kind === "text-only")
    return (
      <InfoCard
        title="Text-only mode"
        body="Envelope rendering is unavailable in this supplied mode. Text remains readable."
      />
    )
  if (kind === "tool-warning" || kind === "critical-warning")
    return (
      <Envelope accent={kind === "critical-warning" ? "danger" : "warning"}>
        <EnvelopeHeader
          label={kind === "critical-warning" ? "Tool failures" : "Tool warning"}
          icon={AlertTriangle}
          tone="warning"
          meta="fixture_read"
        />
        <EnvelopeBody
          title={
            kind === "critical-warning"
              ? "Multiple supplied tool calls failed; response may be incomplete."
              : "A supplied tool raised a warning."
          }
        >
          <pre>Fictional adapter unavailable. No tool was executed.</pre>
        </EnvelopeBody>
      </Envelope>
    )
  return (
    <Envelope accent="warning">
      <EnvelopeHeader label="Recovery armed" />
      <EnvelopeBody
        title="Your next message would resume prior context."
        description="Local recovery specimen · no scheduled retry or transport."
      />
      <EnvelopeFooter>
        <Button
          disabled={!editable}
          onClick={() => inspect("Cancel retry candidate", { cancel_token: "fixture-recovery-17" })}
        >
          Inspect cancel retry candidate
        </Button>
      </EnvelopeFooter>
    </Envelope>
  )
}
