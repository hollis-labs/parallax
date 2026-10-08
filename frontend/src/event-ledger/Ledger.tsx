import {
  Button,
  DetailDialog,
  ScrollArea,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@hollis-labs/design-components"
import { useLayoutEffect, useRef, useState } from "react"
import {
  type AdminPresentationTicket,
  createAdminPresentationSession,
} from "../chimera/admin-session"
import type { OperationsModel } from "../operations/model"
import { ledgerModel, type Specimen, specimens } from "./model"
import "./ledger.css"
export function EventLedger({
  operations,
  onInspectRun,
  initialSpecimen = "recorded",
  operationsQuery = "",
}: {
  operations: OperationsModel
  onInspectRun: (taskId: string) => void
  initialSpecimen?: Specimen
  operationsQuery?: string
}) {
  const data = ledgerModel(operations, initialSpecimen),
    outcomes = useRef<Array<() => void>>([])
  return (
    <Instance
      key={JSON.stringify([data.source, operationsQuery])}
      operations={operations}
      onInspectRun={onInspectRun}
      initialSpecimen={initialSpecimen}
      operationsQuery={operationsQuery}
      outcomes={outcomes.current}
    />
  )
}
function Instance({
  operations,
  onInspectRun,
  initialSpecimen,
  operationsQuery,
  outcomes,
}: {
  operations: OperationsModel
  onInspectRun: (taskId: string) => void
  initialSpecimen: Specimen
  operationsQuery: string
  outcomes: Array<() => void>
}) {
  const [query, setQuery] = useState(""),
    [sort, setSort] = useState("ascending"),
    [specimen, setSpecimen] = useState(initialSpecimen),
    [selected, setSelected] = useState<string | null>(null),
    [open, setOpen] = useState(false),
    [result, setResult] = useState(""),
    [busy, setBusy] = useState(false),
    [, refresh] = useState(0)
  const data = ledgerModel(operations, specimen),
    rows = data.rows
      .filter((r) =>
        `${r.id} ${r.origin} ${r.tag ?? ""} ${r.runId ?? ""} ${r.message ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      )
      .sort((a, b) => {
        const order =
          (a.time ?? "").localeCompare(b.time ?? "") ||
          `${a.origin}/${a.id}`.localeCompare(`${b.origin}/${b.id}`)
        return sort === "ascending" ? order : -order
      }),
    row = rows.find((r) => `${r.origin}/${r.id}` === selected)
  const life = useRef({
      alive: false,
      lease: 0,
      session: null as ReturnType<typeof createAdminPresentationSession> | null,
    }),
    queue = useRef(outcomes),
    pending = useRef<AdminPresentationTicket | null>(null),
    origin = useRef<HTMLElement | null>(null),
    currentRow = useRef(row)
  currentRow.current = row
  useLayoutEffect(() => {
    const session = createAdminPresentationSession(
      JSON.stringify([data.source, operationsQuery]),
      JSON.stringify([data.source, operationsQuery]),
      ["inspection"],
    )
    life.current = { alive: true, lease: life.current.lease + 1, session }
    refresh((n) => n + 1)
    return () => {
      life.current.alive = false
      life.current.lease++
      session.dispose()
    }
  }, [data.source, operationsQuery])
  const lease = life.current.lease,
    current = () => life.current.alive && life.current.lease === lease
  const retire = () => {
    life.current.lease++
    pending.current?.cancel()
    pending.current = null
    life.current.session?.reset(`${data.source}/${life.current.lease}`, data.source)
    setOpen(false)
    setSelected(null)
    setResult("")
    setBusy(false)
    refresh((n) => n + 1)
  }
  function choose(id: string, target: HTMLElement) {
    if (!current() || !rows.some((r) => `${r.origin}/${r.id}` === id)) return
    if (open && selected === id) return
    retire()
    origin.current = target
    setSelected(id)
    setOpen(true)
  }
  function close() {
    if (!current() || !open) return
    const target = origin.current
    retire()
    if (target?.isConnected) target.focus()
  }
  function request() {
    if (!current() || !open || !row || busy || !data.accessible) return
    const id = selected,
      ticket = life.current.session!.begin("inspection")
    pending.current = ticket
    setBusy(true)
    setResult("Held local metadata inspection; no records change.")
    queue.current.push(() => {
      if (
        !current() ||
        ticket.signal.aborted ||
        !currentRow.current ||
        `${currentRow.current.origin}/${currentRow.current.id}` !== id
      )
        return
      ticket.commit(() => {
        pending.current = null
        setBusy(false)
        setResult("Inspected supplied metadata locally. No record or outcome changed.")
      })
    })
    refresh((n) => n + 1)
  }
  function release() {
    if (!current()) return
    queue.current.shift()?.()
    refresh((n) => n + 1)
  }
  return (
    <section className="event-ledger" aria-label="Event Ledger review">
      <p>
        Recorded operations/v2 event and log evidence through fixed UTC {data.cutoff}. Raw event
        types and log levels are supplied labels, not inferred execution or health. Recorded rows
        come only from admitted matching runs; labelled authored specimens are separate.
      </p>
      <p>
        Inherited operations matching filter: {operationsQuery || "None"}. {operations.runs.length}{" "}
        admitted matching runs. Ledger query below only narrows their supplied rows.
      </p>
      <div className="ledger-controls">
        <label>
          Filter ledger
          <input
            aria-label="Filter ledger"
            value={query}
            onChange={(e) => {
              if (current()) {
                retire()
                setQuery(e.target.value)
              }
            }}
          />
        </label>
        <label>
          UTC order
          <select
            aria-label="UTC order"
            value={sort}
            onChange={(e) => {
              if (current() && ["ascending", "descending"].includes(e.target.value)) {
                retire()
                setSort(e.target.value)
              }
            }}
          >
            <option value="ascending">Ascending UTC</option>
            <option value="descending">Descending UTC</option>
          </select>
        </label>
        <label>
          Ledger specimen
          <select
            aria-label="Ledger specimen"
            value={specimen}
            onChange={(e) => {
              const v = e.target.value as Specimen
              if (current() && specimens.includes(v)) {
                retire()
                setSpecimen(v)
              }
            }}
          >
            {specimens.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <Button
          onClick={() => {
            if (current()) {
              retire()
              setQuery("")
              setSort("ascending")
              setSpecimen("recorded")
            }
          }}
        >
          Reset ledger review
        </Button>
      </div>
      <p role="status">
        {data.accessible
          ? specimen === "recorded"
            ? `${rows.length} matching / ${data.count} admitted recorded rows`
            : `${rows.length} matching composition rows / ${data.count} admitted recorded rows + ${data.authoredCount} authored specimen`
          : `Row counts Unknown · ${data.resource} evidence withheld`}
        . {specimen !== "recorded" && "Authored specimen is separate from recorded rows."}
      </p>
      <ScrollArea
        className="ledger-scroll"
        role="region"
        aria-label="Recorded ledger table"
        aria-describedby="ledger-scroll-help"
      >
        <Table className="ledger-table">
          <TableCaption>
            Event/log ledger · exact UTC timestamps · {data.cutoff}.{" "}
            {data.accessible
              ? `${rows.length} matching displayed rows; ${data.count} admitted recorded, ${data.authoredCount} authored.`
              : "Counts Unknown."}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead scope="col">UTC / record</TableHead>
              <TableHead scope="col">Kind / raw label</TableHead>
              <TableHead scope="col">Run / reference</TableHead>
              <TableHead scope="col">Supplied message</TableHead>
              <TableHead scope="col">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={`${r.origin}/${r.id}`} data-record-id={`${r.origin}/${r.id}`}>
                <TableCell>
                  <time dateTime={r.time ?? undefined}>
                    {r.time ? (
                      <>
                        {r.time.slice(0, 10)}
                        <br />
                        {r.time.slice(11)}
                      </>
                    ) : (
                      "Timestamp not supplied"
                    )}
                  </time>
                  <div>{r.id}</div>
                </TableCell>
                <TableCell>
                  {r.origin}
                  <div>{r.tag ?? "Label not supplied"}</div>
                </TableCell>
                <TableCell>
                  {r.runId ?? "Run reference absent"}
                  <div>{r.reference ?? "Related reference absent"}</div>
                </TableCell>
                <TableCell className="ledger-message">
                  <span className="ledger-message-full">{r.message ?? "Message not supplied"}</span>
                  <span className="ledger-message-excerpt">
                    {r.message
                      ? `${r.message.slice(0, 24)}${r.message.length > 24 ? "…" : ""}`
                      : "Not supplied"}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    className="ledger-inspect"
                    aria-label={`Inspect ${r.id}`}
                    onClick={(e) => choose(`${r.origin}/${r.id}`, e.currentTarget)}
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={5}>
                {data.accessible
                  ? specimen === "recorded"
                    ? `${rows.length} matching rows / ${data.count} supplied rows. No new events are inferred.`
                    : `${rows.length} matching composition rows / ${data.count} admitted recorded rows + ${data.authoredCount} authored specimen. No new events are inferred.`
                  : `${data.resource}: supplied rows withheld; count Unknown.`}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </ScrollArea>
      <p id="ledger-scroll-help">
        This labelled table has its own bounded vertical review scroll. Tab into its native
        viewport, then PageDown or Control+End. All narrow columns wrap within the table. Narrow
        message cells show a labelled short excerpt; View opens the complete supplied message in the
        raw payload.
      </p>
      {data.accessible && rows.length === 0 && (
        <p>No matching displayed ledger rows. This known match count is 0.</p>
      )}
      <Button disabled={!queue.current.length} onClick={release}>
        Release oldest ledger inspection ({queue.current.length})
      </Button>
      <DetailDialog
        open={open && !!row}
        onClose={close}
        title={`Ledger ${row?.id ?? "record"}`}
        widthClassName="ledger-dialog"
        meta={
          <span>
            {row?.origin} · {row?.time ?? "Timestamp absent"} · cutoff {data.cutoff}
          </span>
        }
        footer={
          <div className="ledger-footer">
            <Button onClick={close}>Close ledger inspection</Button>
          </div>
        }
      >
        {row && (
          <div className="ledger-dialog-body">
            <dl className="ledger-metadata">
              <dt>Source</dt>
              <dd>{data.source}</dd>
              <dt>Run</dt>
              <dd>{row.runId ?? "Absent reference"}</dd>
              <dt>Reference</dt>
              <dd>{row.reference ?? "Absent reference"}</dd>
              <dt>Raw label</dt>
              <dd>{row.tag ?? "Not supplied"}</dd>
            </dl>
            <h2>Exact supplied payload</h2>
            {row.id === "AUTHORED-MISSING" && (
              <p>
                Authored missing specimen: count is supplied 0; message is supplied null; annotation
                key is absent (not supplied). JSON does not encode undefined values.
              </p>
            )}
            <pre className="ledger-json">{JSON.stringify(row.raw, null, 2)}</pre>
            <p role="status">{result || "Read-only supplied record. No outcome requested."}</p>
            <div className="ledger-body-actions">
              <Button onClick={request} disabled={busy}>
                Inspect local metadata
              </Button>
              <Button onClick={release} disabled={!queue.current.length}>
                Release oldest ledger inspection ({queue.current.length})
              </Button>
            </div>
            {row.taskId &&
              operations.runs.some((r) => r.id === row.runId && r.taskId === row.taskId) && (
                <Button
                  onClick={() => {
                    if (current() && open && currentRow.current === row) {
                      const task = row.taskId!
                      retire()
                      onInspectRun(task)
                    }
                  }}
                >
                  Inspect related admitted run {row.runId}
                </Button>
              )}
          </div>
        )}
      </DetailDialog>
    </section>
  )
}
