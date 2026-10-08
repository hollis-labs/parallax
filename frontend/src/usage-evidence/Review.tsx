import {
  Button,
  EmptyState,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@hollis-labs/design-components"
import {
  Artifact,
  ArtifactAction,
  ArtifactClose,
  ArtifactContent,
  Context,
  ContextCacheUsage,
  ContextContent,
  ContextContentHeader,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
  ContextTrigger,
} from "@hollis-labs/kit-chat"
import { useLayoutEffect, useRef, useState } from "react"
import {
  type AdminPresentationTicket,
  createAdminPresentationSession,
} from "../chimera/admin-session"
import type { OperationsModel } from "../operations/model"
import {
  type CapacityMode,
  capacityModes,
  capacitySample,
  finiteAmount,
  type UsageEvidenceModel,
  type UsageState,
  usageEvidence,
  usageEvidenceModel,
  usageStates,
} from "./model"
import "./review.css"
export function UsageEvidence({
  operations,
  initialState = "recorded",
  initialCapacity = "unknown",
  epoch = 0,
}: {
  operations: OperationsModel
  initialState?: UsageState
  initialCapacity?: CapacityMode
  epoch?: number
}) {
  const [state, setState] = useState(initialState),
    [copy, setCopy] = useState(0)
  const data = usageEvidenceModel(operations, state)
  return (
    <section aria-label="Usage Evidence review" className="usage-evidence">
      <p>
        Recorded receipt review · fixed UTC cutoff {data.cutoff}. Receipt totals are not model
        context-window occupancy. Local controls only inspect supplied evidence.
      </p>
      <div className="usage-controls">
        <Label>
          Usage evidence appearance
          <select
            aria-label="Usage evidence appearance"
            value={state}
            onChange={(e) => setState(e.target.value as UsageState)}
          >
            {usageStates.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Label>
        <Button onClick={() => setCopy((n) => n + 1)}>Reset usage review</Button>
      </div>
      <Instance
        key={`${data.source}/${copy}/${epoch}`}
        data={data}
        initialCapacity={initialCapacity}
      />
    </section>
  )
}
function Instance({
  data,
  initialCapacity,
}: {
  data: UsageEvidenceModel
  initialCapacity: CapacityMode
}) {
  const [selected, setSelected] = useState(data.runs[0]?.id ?? ""),
    [open, setOpen] = useState(false),
    [preview, setPreview] = useState(false),
    [capacity, setCapacity] = useState(initialCapacity),
    [specimenOpen, setSpecimenOpen] = useState(false),
    [result, setResult] = useState(""),
    [busy, setBusy] = useState(false),
    [queued, setQueued] = useState(0)
  const scope = useRef({ alive: false, lease: 0 })
  const session = useRef<ReturnType<typeof createAdminPresentationSession> | null>(null)
  const ticket = useRef<AdminPresentationTicket | null>(null)
  const releases = useRef<Array<() => void>>([])
  const artifactHost = useRef<HTMLDivElement>(null)
  const previewTrigger = useRef<HTMLButtonElement>(null)
  const receiptTrigger = useRef<HTMLButtonElement>(null),
    specimenTrigger = useRef<HTMLButtonElement>(null)
  const restore = useRef<{
    lease: number
    selected: string
    capacity: CapacityMode
    kind: "receipt" | "specimen"
    target: HTMLButtonElement | null
  } | null>(null)
  const detail = usageEvidence(data, selected),
    sample = capacitySample(capacity)
  const live = useRef({ data, selected, preview, capacity, open, specimenOpen })
  live.current = { data, selected, preview, capacity, open, specimenOpen }
  const [, refresh] = useState(0)
  useLayoutEffect(() => {
    const current = createAdminPresentationSession(data.source, data.source, ["inspect"])
    session.current = current
    scope.current.alive = true
    scope.current.lease++
    refresh((n) => n + 1)
    return () => {
      restore.current = null
      scope.current.alive = false
      scope.current.lease++
      ticket.current?.cancel()
      current.dispose()
      if (session.current === current) session.current = null
    }
  }, [data.source])
  useLayoutEffect(() => {
    const region = artifactHost.current?.querySelector<HTMLElement>('[role="region"]')
    if (preview && scope.current.alive && live.current.preview && region?.isConnected)
      region.focus()
  }, [preview])
  const lease = scope.current.lease
  const admitted = () => scope.current.alive && lease === scope.current.lease && data.available
  function retire() {
    restore.current = null
    ticket.current?.cancel()
    scope.current.lease++
    setResult("")
    setBusy(false)
  }
  function select(id: string | null) {
    if (!admitted() || !id || id === selected || !data.runs.some((r) => r.id === id)) return
    retire()
    setSelected(id)
    setOpen(false)
    setPreview(false)
    setSpecimenOpen(false)
  }
  function popup(next: boolean) {
    if (!admitted() || next === open) return
    retire()
    if (!next)
      restore.current = {
        lease: scope.current.lease,
        selected,
        capacity,
        kind: "receipt",
        target: receiptTrigger.current,
      }
    setOpen(next)
    setSpecimenOpen(false)
    setPreview(false)
  }
  function specimenPopup(next: boolean) {
    if (!admitted() || next === specimenOpen) return
    retire()
    if (!next)
      restore.current = {
        lease: scope.current.lease,
        selected,
        capacity,
        kind: "specimen",
        target: specimenTrigger.current,
      }
    setSpecimenOpen(next)
    setOpen(false)
    setPreview(false)
  }
  function finalFocus(kind: "receipt" | "specimen") {
    const token = restore.current,
      now = live.current
    if (
      !token ||
      token.kind !== kind ||
      !scope.current.alive ||
      token.lease !== scope.current.lease ||
      token.selected !== now.selected ||
      token.capacity !== now.capacity ||
      now.open ||
      now.specimenOpen ||
      now.preview ||
      !token.target?.isConnected
    )
      return false
    restore.current = null
    return token.target
  }
  function close() {
    if (!admitted() || !preview) return
    retire()
    setPreview(false)
    previewTrigger.current?.focus()
  }
  function inspect() {
    if (!admitted() || !preview || !detail?.receipt || busy || !session.current) return
    retire()
    const candidate = {
      kind: "local-receipt-inspection",
      source: data.source,
      cutoff: data.cutoff,
      runId: detail.run.id,
      receipt: detail.receipt,
      effects: "none",
    }
    const current = session.current.begin("inspect"),
      stamp = scope.current.lease
    ticket.current = current
    setBusy(true)
    setResult("Held local inspection; supplied receipt is unchanged.")
    releases.current.push(() => {
      if (!scope.current.alive || scope.current.lease !== stamp || current.signal.aborted) return
      const now = live.current,
        evidence = usageEvidence(now.data, now.selected)
      if (
        !now.preview ||
        !now.data.available ||
        now.data.source !== candidate.source ||
        now.data.cutoff !== candidate.cutoff ||
        evidence?.run.id !== candidate.runId ||
        evidence.receipt?.id !== candidate.receipt.id
      )
        return
      current.commit(() => {
        setBusy(false)
        setResult(`Inspected ${candidate.receipt.id}; no receipt or access record changed.`)
      })
    })
    setQueued(releases.current.length)
  }
  function release() {
    if (!admitted()) return
    const next = releases.current.shift()
    setQueued(releases.current.length)
    next?.()
  }
  if (!data.available)
    return (
      <EmptyState
        variant="empty"
        title="Usage evidence unavailable"
        description={
          !data.operations.accessible
            ? `Operations ${data.operations.resource} resource; receipt content withheld${data.operations.resource === "permission-denied" ? " by denied review policy" : ""}.`
            : data.state === "denied"
              ? "Denied by local review policy; receipt content withheld."
              : !data.compatible
                ? "Incompatible operations source profile; receipt joins withheld."
                : `${data.state} appearance; no supplied receipt shown.`
        }
      />
    )
  if (!data.runs.length)
    return (
      <EmptyState
        variant="empty"
        title="No admitted runs"
        description="Recorded count 0; no receipt has been invented."
      />
    )
  return (
    <>
      {data.state === "locked" && (
        <p role="status">
          Locked readonly evidence. Local selection, popup and inspection remain allowed; no
          mutation controls exist.
        </p>
      )}
      <Label>
        Recorded run
        <Select value={selected} onValueChange={select}>
          <SelectTrigger aria-label="Recorded run">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {data.runs.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.id} · {r.status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Label>
      <div className="usage-grid">
        <section aria-label="Recorded receipt usage">
          <h2>Recorded receipt</h2>
          <p>
            {detail?.run.id} · {detail?.task?.id ?? "Task not supplied"} ·{" "}
            {detail?.receipt
              ? `${detail.receipt.id} · recorded ${detail.receipt.time}`
              : "Receipt unavailable at this cutoff"}
          </p>
          <p>
            Exact recorded total: {finiteAmount(detail?.receipt?.tokens)} tokens · exact USD{" "}
            {finiteAmount(detail?.receipt?.cost)}. Capacity and per-part cost are not supplied.
          </p>
          <Context
            open={open}
            onOpenChange={popup}
            usage={
              detail?.receipt
                ? {
                    inputTokens: detail.receipt.inputTokens,
                    outputTokens: detail.receipt.outputTokens,
                  }
                : undefined
            }
            cost={detail?.receipt ? { totalUSD: detail.receipt.cost } : undefined}
          >
            <ContextTrigger ref={receiptTrigger} aria-label="Inspect recorded receipt usage" />
            <ContextContent
              align="start"
              finalFocus={() => finalFocus("receipt")}
              aria-label="Recorded usage popup"
              className="usage-popup"
            >
              <h3>Receipt breakdown · capacity unknown</h3>
              <ContextContentHeader />
              <ContextInputUsage />
              <ContextOutputUsage />
              <ContextReasoningUsage />
              <ContextCacheUsage />
              <p>
                Exact total USD: {finiteAmount(detail?.receipt?.cost)}. Missing cost portions,
                reasoning and cache remain Unknown.
              </p>
              <Button
                onClick={() => {
                  if (!admitted() || !open || !detail?.receipt) return
                  retire()
                  setOpen(false)
                  setPreview(true)
                  setSpecimenOpen(false)
                }}
                disabled={!detail?.receipt}
              >
                Open readonly receipt preview
              </Button>
            </ContextContent>
          </Context>
          <Button
            ref={previewTrigger}
            disabled={!detail?.receipt}
            onClick={() => {
              if (!admitted() || !detail?.receipt) return
              if (preview) return
              retire()
              setPreview(true)
              setOpen(false)
              setSpecimenOpen(false)
            }}
          >
            Preview raw receipt
          </Button>
        </section>
        <section aria-label="Authored capacity specimen">
          <h2>Authored capacity specimen</h2>
          <p>Separate rendering sample; not observed usage or provider capacity.</p>
          <Label>
            Capacity specimen
            <select
              aria-label="Capacity specimen"
              value={capacity}
              onChange={(e) => {
                if (!admitted() || e.target.value === capacity) return
                retire()
                setCapacity(e.target.value as CapacityMode)
                setSpecimenOpen(false)
                setOpen(false)
                setPreview(false)
              }}
            >
              {capacityModes.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Label>
          <p>
            Exact authored operands: used {String(sample.usedTokens ?? "Unknown")} / max{" "}
            {String(sample.maxTokens ?? "Unknown")} tokens. Visual ratio clamps at 100%; invalid
            inputs remain Unknown.
          </p>
          <Context
            {...sample}
            open={specimenOpen}
            onOpenChange={specimenPopup}
            usage={{ inputTokens: 0, outputTokens: 0 }}
            cost={{ totalUSD: 0.000001 }}
          >
            <ContextTrigger ref={specimenTrigger} aria-label="Inspect authored capacity sample" />
            <ContextContent
              align="start"
              finalFocus={() => finalFocus("specimen")}
              aria-label="Authored capacity popup"
              className="usage-popup"
            >
              <h3>Authored sample · exact USD 0.000001</h3>
              <ContextContentHeader />
              <ContextInputUsage />
              <ContextOutputUsage />
              <ContextReasoningUsage />
              <ContextCacheUsage />
              <p>
                These authored zero input/output counts do not describe a recorded receipt. Rounded
                total USD $0.00; exact positive USD 0.000001.
              </p>
            </ContextContent>
          </Context>
        </section>
      </div>
      {preview && detail?.receipt && (
        <div ref={artifactHost}>
          <Artifact aria-label={`Readonly ${detail.receipt.id} preview`}>
            <div className="usage-artifact-header">
              <h2>Readonly {detail.receipt.id}</h2>
              <p>
                {detail.run.id} · cutoff {data.cutoff}
              </p>
              <div>
                <ArtifactAction
                  label="Inspect current receipt"
                  size="sm"
                  variant="outline"
                  onClick={inspect}
                  disabled={busy}
                >
                  Inspect
                </ArtifactAction>
                <ArtifactClose label="Close receipt preview" onClick={close} />
              </div>
            </div>
            <ArtifactContent aria-label="Raw recorded receipt">
              <pre>{JSON.stringify(detail.receipt, null, 2)}</pre>
              {data.state === "long-content" && (
                <pre>
                  {Array.from(
                    { length: 60 },
                    (_, i) =>
                      `Authored display annotation ${i + 1}: this text does not extend the supplied receipt. <script>inert</script>`,
                  ).join("\n")}
                </pre>
              )}
            </ArtifactContent>
            <footer>
              <p role="status">
                {result ||
                  "Readonly supplied receipt; inspection never collects or changes evidence."}
              </p>
              <Button onClick={release} disabled={!queued}>
                Release oldest scripted inspection ({queued})
              </Button>
            </footer>
          </Artifact>
        </div>
      )}
    </>
  )
}
export default UsageEvidence
