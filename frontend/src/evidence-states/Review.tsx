import {
  Separator,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@hollis-labs/design-components"
import { useId, useLayoutEffect, useRef, useState } from "react"
import type { OperationsModel } from "../operations/model"
import "./review.css"
export type Appearance = "recorded" | "long" | "unknown"
export function EvidenceStates({
  operations,
  operationsQuery = "",
  initialAppearance = "recorded",
}: {
  operations: OperationsModel
  operationsQuery?: string
  initialAppearance?: Appearance
}) {
  const source = JSON.stringify([
    operations.dataset.version,
    operations.dataset.profile,
    operations.dataset.clock,
    operations.scenario,
    operations.resource,
    operations.cutoff,
    operationsQuery,
  ])
  return (
    <Instance
      key={source}
      operationsQuery={operationsQuery}
      operations={operations}
      initialAppearance={initialAppearance}
    />
  )
}
function Instance({
  operations,
  initialAppearance,
  operationsQuery,
}: {
  operations: OperationsModel
  initialAppearance: Appearance
  operationsQuery: string
}) {
  const tooltipId = useId()
  const [appearance, setAppearance] = useState<Appearance>(initialAppearance),
    [open, setOpen] = useState(false),
    [, render] = useState(0)
  const life = useRef({ alive: false, lease: 0 }),
    token = life.current.lease,
    lifetime = life.current
  useLayoutEffect(() => {
    const current = { alive: true, lease: 0 }
    life.current = current
    render((x) => x + 1)
    return () => {
      current.alive = false
      current.lease++
    }
  }, [])
  const current = () => life.current === lifetime && lifetime.alive && lifetime.lease === token
  const available = operations.accessible && appearance !== "unknown"
  const count = available ? operations.runs.length : null
  const phase = appearance === "unknown" ? "authored unknown resource" : operations.resource
  const fact = `${operations.dataset.version} / ${operations.dataset.profile}. Fixed UTC ${operations.cutoff}. Resource ${phase}. Admitted matching runs ${count === null ? "Unknown" : count}.`
  const help =
    appearance === "long"
      ? fact +
        " Authored inert literal <script>alert('review')</script> https://example.invalid/no-retrieval. " +
        "Source metadata only; no collection. ".repeat(3)
      : fact +
        " This supplemental help repeats the visible companion; no new receipt or live collection."
  const change = (next: Appearance) => {
    if (!current() || next === appearance) return
    lifetime.lease++
    setOpen(false)
    setAppearance(next)
  }
  return (
    <section aria-label="Evidence States" className="evidence-states">
      <header>
        <h2>Evidence States</h2>
        <p>
          Review the current recorded prefix and resource appearance. Source help is supplemental;
          all essential facts remain visible.
        </p>
      </header>
      <label>
        Evidence appearance{" "}
        <select
          aria-label="Evidence appearance"
          value={appearance}
          onChange={(e) => {
            const next = e.target.value
            if (next === "recorded" || next === "long" || next === "unknown") change(next)
          }}
        >
          <option value="recorded">Recorded resource</option>
          <option value="long">Authored long source help</option>
          <option value="unknown">Authored unknown resource</option>
        </select>
      </label>
      <section aria-label="Current evidence companion" className="evidence-state-card">
        <h3>Current evidence companion</h3>
        <p>{fact}</p>
        <dl>
          <dt>Successful admitted run count</dt>
          <dd>{count === null ? "Unknown" : count}</dd>
          <dt>Inherited query</dt>
          <dd>{operationsQuery || "None"}</dd>
          <dt>Matching evidence</dt>
          <dd>
            {operations.tasks.length === 0 && available
              ? "Successful projection contains zero matching runs."
              : "Counts use current admitted matching runs only."}
          </dd>
          <dt>Evidence scope</dt>
          <dd>Recorded prefix, not a new successful observation receipt.</dd>
        </dl>
        <TooltipProvider delay={300}>
          <Tooltip
            key={appearance}
            open={open}
            onOpenChange={(next) => {
              if (current() && next !== open) {
                lifetime.lease++
                setOpen(next)
              }
            }}
          >
            <TooltipTrigger
              className="evidence-help"
              aria-describedby={open ? tooltipId : undefined}
            >
              Source help
            </TooltipTrigger>
            <TooltipContent
              id={tooltipId}
              role="tooltip"
              className="evidence-help-popup"
              side="bottom"
            >
              {help}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </section>
      <Separator className="evidence-state-separator" />
      {operations.resource === "loading" && appearance !== "unknown" ? (
        <section
          aria-label="Loading evidence appearance"
          aria-busy="true"
          className="evidence-state-card"
        >
          <p role="status">
            Loading appearance only. Successful evidence count Unknown; no measured progress.
          </p>
          <div aria-hidden="true" className="evidence-silhouettes">
            <Skeleton className="evidence-skeleton" />
            <Skeleton className="evidence-skeleton short" />
          </div>
        </section>
      ) : (
        <p role="status">
          {available
            ? `Recorded prefix available: ${count} matching admitted runs.`
            : `Evidence unavailable: ${phase}; count Unknown.`}
        </p>
      )}
    </section>
  )
}
